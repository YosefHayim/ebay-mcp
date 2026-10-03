import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  getUiCapability,
  registerAppResource,
  RESOURCE_MIME_TYPE,
  RESOURCE_URI_META_KEY,
} from '@modelcontextprotocol/ext-apps/server';
import { getUiRuntimeConfig } from '@/config/environment.js';
import type { ResolvedToolUi, ToolEntry } from '@/tools/registry.js';
import { uiArchetypes } from '@/tools/ui/archetypes.js';
import type { ViewArchetype, ViewModel } from '@/tools/ui/viewModels.js';
import { serverLogger } from '@/utils/logger.js';

/**
 * The seam between the eBay tool registry and the MCP Apps extension.
 *
 * MCP Apps deliver interactive UI **out of band**: the host fetches each view's
 * HTML once via `resources/read` (never into model context), and a tool that opts
 * in advertises which view to render via `_meta.ui.resourceUri` and ships the data
 * to render as `structuredContent`. This module owns that wiring so `runtime.ts`
 * stays a thin registration loop:
 *
 *  - it registers the archetype HTML files as `ui://` resources (skipping any that
 *    are not built, so a dev run without `build:mcp-apps` degrades to text, not a crash);
 *  - it gates UI strictly: views are only advertised to clients that announce the
 *    MCP Apps capability, and never when `EBAY_MCP_UI=off`; and
 *  - it projects a UI-eligible tool's result into its view model for emission.
 *
 * Hosts without the capability (e.g. Cursor) and the kill-switch both fall back to
 * the server's plain JSON tool result with zero behavioural change.
 */

/** Capabilities shape accepted by ext-apps' {@link getUiCapability}. */
type ClientUiCapabilities = Parameters<typeof getUiCapability>[0];

/**
 * Decides whether interactive views should be advertised to the connected client.
 *
 * Pure and injectable (capabilities + UI flag) so the gate is unit-testable without a
 * live transport. Two independent conditions must both hold: the operator has not
 * disabled UI via `EBAY_MCP_UI=off`, and the client advertised support for the MCP
 * Apps HTML profile.
 *
 * @param capabilities - Client capabilities received during MCP initialization.
 * @param uiEnabledByConfig - UI kill-switch value from runtime config.
 * @returns True when interactive UI resources should be advertised for this client.
 *
 * @example
 * ```ts
 * const enabled = resolveUiEnabled(server.server.getClientCapabilities());
 * ```
 */
export const resolveUiEnabled = (
  capabilities: ClientUiCapabilities,
  uiEnabledByConfig = getUiRuntimeConfig().enabled,
): boolean => {
  if (!uiEnabledByConfig) {
    return false;
  }

  const capability = getUiCapability(capabilities);
  return Boolean(capability?.mimeTypes?.includes(RESOURCE_MIME_TYPE));
};

/**
 * Builds the one-line text fallback that accompanies a rendered view.
 *
 * Hosts that render the app show this line in the transcript; the model reads it
 * plus the structured `structuredContent`. Keeping it a short summary (rather than
 * re-dumping the full JSON the view already carries) is what keeps the UI path
 * from costing more tokens than the plain path.
 *
 * @param view - View model produced by a tool UI mapper.
 * @returns One-line text summary to include beside structured content.
 *
 * @example
 * ```ts
 * const text = summarizeView({ archetype: 'table', title: 'Orders', columns: [], rows: [] });
 * ```
 */
export const summarizeView = (view: ViewModel): string => {
  switch (view.archetype) {
    case 'table': {
      const count = view.rows.length;
      const tail = view.footnote ? ` — ${view.footnote}` : '';
      const prefix = view.title ? `${view.title}: ` : '';
      return `${prefix}${count} ${count === 1 ? 'row' : 'rows'}${tail}. Rendered as an interactive table.`;
    }
    case 'card': {
      const heading = [view.title, view.subtitle].filter(Boolean).join(' — ');
      const prefix = heading ? `${heading}: ` : '';
      const fieldCount = view.sections.reduce((total, section) => total + section.fields.length, 0);
      return `${prefix}${fieldCount} ${fieldCount === 1 ? 'field' : 'fields'}. Rendered as an interactive detail card.`;
    }
    case 'chart': {
      const pointCount = view.series.reduce((total, series) => total + series.points.length, 0);
      const prefix = view.title ? `${view.title} (${view.kind}): ` : '';
      return `${prefix}${view.series.length} series, ${pointCount} ${pointCount === 1 ? 'point' : 'points'}. Rendered as an interactive chart.`;
    }
    case 'stat': {
      const count = view.tiles.length;
      const prefix = view.title ? `${view.title}: ` : '';
      return `${prefix}${count} ${count === 1 ? 'metric' : 'metrics'}. Rendered as an interactive stat grid.`;
    }
  }
};

/**
 * Adapts a {@link ViewModel} to the SDK's open-record `structuredContent` type.
 *
 * A view model is a string-keyed JSON object by construction, but TypeScript does
 * not give `interface` types an implicit string index signature, so it refuses the
 * direct cast. The `unknown` hop is the standard, safe bridge across that gap —
 * preferable to polluting every view-model interface with `[key: string]: unknown`,
 * which would silently disable excess-property checks in the tool mappers.
 */
const asStructuredContent = (view: ViewModel): Record<string, unknown> =>
  view as unknown as Record<string, unknown>;

/**
 * Projects a tool result into its view and packages it as a UI tool result: a
 * compact summary line, the view model as `structuredContent`, and the
 * `_meta.ui.resourceUri` that tells the host which app to render.
 *
 * @param ui - Resolved UI binding attached to the executed tool entry.
 * @param result - Raw tool handler result to project into a view model.
 * @returns SDK call result carrying text, structured content, and UI metadata.
 *
 * @example
 * ```ts
 * const toolResult = buildUiToolResult(entry.ui, handlerResult);
 * ```
 */
export const buildUiToolResult = (ui: ResolvedToolUi, result: unknown): CallToolResult => {
  const view = ui.map(result);
  return {
    content: [{ type: 'text', text: summarizeView(view) }],
    structuredContent: asStructuredContent(view),
    _meta: { ui: { resourceUri: ui.resourceUri } },
  };
};

/**
 * Walks up from `startDir` to the nearest directory containing a `package.json`.
 * Used to locate the repo root so built views resolve identically whether the
 * server runs from `build/` (prod) or `src/` via tsx (dev).
 *
 * @param startDir - Directory to begin walking upward from.
 * @returns Repo root path, or undefined when no package.json is found.
 *
 * @example
 * ```ts
 * const root = findRepoRoot(process.cwd());
 * ```
 */
export const findRepoRoot = (startDir: string): string | undefined => {
  let current = startDir;
  for (;;) {
    if (existsSync(join(current, 'package.json'))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return;
    }
    current = parent;
  }
};

/**
 * Resolves the directory that holds the built archetype HTML files (`build/ui/`).
 *
 * @param moduleUrl - Module URL used to anchor the repo-root search.
 * @returns Absolute directory path for built UI assets.
 *
 * @example
 * ```ts
 * const builtUiDir = resolveBuiltUiDir(import.meta.url);
 * ```
 */
export const resolveBuiltUiDir = (moduleUrl: string): string => {
  const fromDir = dirname(fileURLToPath(moduleUrl));
  const root = findRepoRoot(fromDir);
  return root ? join(root, 'build', 'ui') : join(fromDir, '..', 'ui');
};

/**
 * Runtime-facing facade over the MCP Apps seam, returned by {@link createUiBridge}.
 * `runtime.ts` registers tools as usual and calls into this to capture UI-eligible
 * tools, decide per-call whether to render, and install the capability gate.
 */
export interface UiBridge {
  /** Records a freshly registered tool so the gate can flip its `_meta` on connect. */
  register(entry: ToolEntry, registered: RegisteredTool): void;
  /** Narrows to a UI-eligible entry whose view should be emitted for this client. */
  shouldRender(entry: ToolEntry): entry is ToolEntry & { ui: ResolvedToolUi };
  /** Wires `oninitialized` to enable UI and advertise resource URIs when supported. */
  installCapabilityGate(): void;
}

/**
 * Constructs the {@link UiBridge}: reads the built archetype HTML, registers each
 * found view as a `ui://` resource, and returns the runtime-facing facade.
 *
 * @param server - The MCP server the resources and gate attach to.
 * @param moduleUrl - `import.meta.url` of the caller, used to locate `build/ui/`.
 * @returns UI bridge facade consumed by the MCP runtime.
 *
 * @example
 * ```ts
 * const ui = createUiBridge(server, import.meta.url);
 * ```
 */
export const createUiBridge = (server: McpServer, moduleUrl: string): UiBridge => {
  const builtUiDir = resolveBuiltUiDir(moduleUrl);
  const available = new Set<ViewArchetype>();

  // `Object.keys` widens to `string[]`; the cast restores the manifest's key type.
  for (const archetype of Object.keys(uiArchetypes) as ViewArchetype[]) {
    const { uri, name, htmlFile } = uiArchetypes[archetype];
    const htmlPath = join(builtUiDir, htmlFile);

    if (!existsSync(htmlPath)) {
      serverLogger.warn(`UI view not built; "${uri}" disabled (expected ${htmlPath})`);
      continue;
    }

    const html = readFileSync(htmlPath, 'utf-8');
    registerAppResource(server, name, uri, {}, () => ({
      contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
    }));
    available.add(archetype);
  }

  let uiEnabled = false;
  const uiTools: { registered: RegisteredTool; resourceUri: string }[] = [];

  return {
    register(entry, registered) {
      if (entry.ui && available.has(entry.ui.archetype)) {
        uiTools.push({ registered, resourceUri: entry.ui.resourceUri });
      }
    },

    shouldRender(entry): entry is ToolEntry & { ui: ResolvedToolUi } {
      return uiEnabled && entry.ui != null && available.has(entry.ui.archetype);
    },

    installCapabilityGate() {
      const priorOnInitialized = server.server.oninitialized;
      server.server.oninitialized = () => {
        priorOnInitialized?.();
        uiEnabled = resolveUiEnabled(server.server.getClientCapabilities());
        if (!uiEnabled) {
          return;
        }
        for (const { registered, resourceUri } of uiTools) {
          registered.update({
            _meta: {
              ui: { resourceUri },
              [RESOURCE_URI_META_KEY]: resourceUri,
            },
          });
        }
      };
    },
  };
};
