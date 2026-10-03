import { z } from 'zod';
import type { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TOOL_FAMILY_KEYS } from '@/config/toolFamilies.js';
import { toolCategories } from '@/tools/categories/index.js';

/**
 * Tool gating: the runtime half of the `EBAY_MCP_TOOLS=dynamic` feature.
 *
 * In dynamic mode the server registers every eBay tool but boots with them
 * disabled, advertising only the three discovery meta-tools defined here. The
 * agent browses the catalogue and enables just the tools it needs; the MCP SDK
 * emits `tools/listChanged` automatically when a tool's `enabled` flag flips, so
 * the host re-fetches and the freshly enabled tools appear natively, with their
 * real input schemas and validation. This keeps advertised context proportional
 * to what the agent actually uses instead of the full ~187-tool catalogue.
 *
 * The pure env parsing/validation lives in `@/config/toolFamilies.ts`; this
 * module owns everything that needs the live tool registry.
 */

/** Default page size for {@link ToolGatingController.list} when `limit` is omitted. */
const DEFAULT_LIST_LIMIT = 25;

/** Upper bound on a single discovery page, mirrored by the `list_ebay_tools` schema. */
const MAX_LIST_LIMIT = 100;

/**
 * Initialize-time guidance shown to the agent in dynamic mode so it knows the
 * catalogue is hidden behind the discovery tools. Set only when dynamic mode is
 * active; the default and static modes leave the handshake untouched.
 */
export const DYNAMIC_MODE_INSTRUCTIONS =
  'This eBay server keeps its full tool catalogue hidden to save context. Only the discovery tools are visible right now. ' +
  'Call `list_ebay_tools` (no arguments) to see the tool families, then `list_ebay_tools` with a `family` or `query` to find specific tools, ' +
  'then `enable_ebay_tools` with the tool names you need — they will appear as normal tools you can call. ' +
  'Call `disable_ebay_tools` to remove tools you no longer need and reclaim context.';

/** One discoverable eBay tool — lightweight by design; the full input schema arrives only on enable. */
interface ToolCatalogRow {
  name: string;
  family: string;
  summary: string;
}

/** A tool family as shown in the discovery overview. */
interface FamilyOverviewRow {
  key: string;
  title: string;
  count: number;
}

/** Precomputed catalogue derived once from {@link toolCategories}. */
interface ToolCatalog {
  rows: ToolCatalogRow[];
  families: FamilyOverviewRow[];
  familyByToolName: Map<string, string>;
}

/** Condenses a tool description to a single sentence for the discovery listing. */
const toSummary = (description: string): string => {
  const firstLine = description.split('\n', 1)[0].trim();
  const sentenceEnd = firstLine.indexOf('. ');
  const sentence = sentenceEnd === -1 ? firstLine : firstLine.slice(0, sentenceEnd + 1);
  return sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence;
};

/** Builds the discovery catalogue (tool rows, family overview, name→family index). */
const buildCatalog = (): ToolCatalog => {
  const rows: ToolCatalogRow[] = [];
  const families: FamilyOverviewRow[] = [];
  const familyByToolName = new Map<string, string>();

  for (const category of toolCategories) {
    families.push({ key: category.key, title: category.title, count: category.entries.length });
    for (const entry of category.entries) {
      const { name, description } = entry.definition;
      rows.push({ name, family: category.key, summary: toSummary(description) });
      familyByToolName.set(name, category.key);
    }
  }

  return { rows, families, familyByToolName };
};

const CATALOG = buildCatalog();

/** Input accepted by the lightweight dynamic-mode tool catalogue. */
const listEbayToolsInputSchema = z.object({
  family: z.string().optional().describe('Restrict results to one family key (e.g. "inventory").'),
  query: z
    .string()
    .optional()
    .describe('Case-insensitive keyword matched against tool name, summary, and family.'),
  cursor: z.string().optional().describe('Pagination cursor from a prior call.'),
  limit: z
    .number()
    .int()
    .positive()
    .max(MAX_LIST_LIMIT)
    .optional()
    .describe(`Max rows per page (default ${DEFAULT_LIST_LIMIT}, max ${MAX_LIST_LIMIT}).`),
});

/** Input accepted by the dynamic-mode enable/disable meta-tools. */
const dynamicToolNamesInputSchema = z.object({
  names: z
    .array(z.string())
    .min(1)
    .describe('Exact tool names to enable or disable, as returned by list_ebay_tools.'),
});

/**
 * Resolves the tool names belonging to the given families, preserving the caller's
 * ability to filter registry entries for static mode. Unknown family keys
 * contribute nothing (they are rejected earlier by env validation).
 *
 * @param families - Tool family keys requested by static tool gating mode.
 * @returns Tool names that belong to the requested families.
 *
 * @example
 * ```ts
 * const names = toolNamesInFamilies(['inventory', 'account']);
 * ```
 */
export const toolNamesInFamilies = (families: Iterable<string>): Set<string> => {
  const wanted = new Set(families);
  const names = new Set<string>();
  for (const [name, family] of CATALOG.familyByToolName) {
    if (wanted.has(family)) {
      names.add(name);
    }
  }
  return names;
};

/** Result of {@link ToolGatingController.enable} / {@link ToolGatingController.disable}. */
interface MutationResult {
  enabled?: string[];
  disabled?: string[];
  unknown: string[];
  activeCount: number;
}

/**
 * Drives the discovery meta-tools against the live set of registered tool handles.
 * Backed by the per-connection `RegisteredTool` map, so enabling/disabling is
 * naturally isolated to one client session.
 */
export interface ToolGatingController {
  /** Lists families or lightweight tool rows matching the provided filters. */
  list(args: { family?: string; query?: string; cursor?: string; limit?: number }): unknown;
  /** Enables registered eBay tools by exact tool name. */
  enable(names: string[]): MutationResult;
  /** Disables registered eBay tools by exact tool name. */
  disable(names: string[]): MutationResult;
}

/** Parses an opaque list cursor (a stringified offset) back into a non-negative offset. */
const parseCursor = (cursor: string | undefined): number => {
  if (!cursor) {
    return 0;
  }
  const offset = Number.parseInt(cursor, 10);
  return Number.isInteger(offset) && offset > 0 ? offset : 0;
};

/**
 * Creates the controller backing the discovery meta-tools.
 *
 * @param handles - Map of eBay tool name → its registered handle. Only these tools
 *   are gateable; the meta-tools themselves are intentionally absent so they can
 *   never be disabled and are excluded from `activeCount`.
 * @returns Controller used by the discovery meta-tools.
 *
 * @example
 * ```ts
 * const controller = createToolGatingController(handles);
 * ```
 */
export const createToolGatingController = (
  handles: Map<string, RegisteredTool>,
): ToolGatingController => {
  const activeCount = (): number => [...handles.values()].filter((handle) => handle.enabled).length;

  const mutate = (names: string[], enable: boolean): MutationResult => {
    const changed: string[] = [];
    const unknown: string[] = [];

    for (const name of names) {
      const handle = handles.get(name);
      if (!handle) {
        unknown.push(name);
        continue;
      }
      if (handle.enabled !== enable) {
        if (enable) {
          handle.enable();
        } else {
          handle.disable();
        }
      }
      changed.push(name);
    }

    return enable
      ? { enabled: changed, unknown, activeCount: activeCount() }
      : { disabled: changed, unknown, activeCount: activeCount() };
  };

  return {
    list({ family, query, cursor, limit }) {
      if (!(family || query)) {
        return {
          families: CATALOG.families.map((row) => ({
            ...row,
            enabledCount: [...handles.entries()].filter(
              ([name, handle]) => CATALOG.familyByToolName.get(name) === row.key && handle.enabled,
            ).length,
          })),
          hint: 'Call list_ebay_tools with { family } or { query } to list tools, then enable_ebay_tools.',
        };
      }

      if (family && !CATALOG.families.some((row) => row.key === family)) {
        return {
          error: `Unknown tool family "${family}".`,
          validFamilies: TOOL_FAMILY_KEYS,
        };
      }

      const needle = query?.toLowerCase();
      const matches = CATALOG.rows.filter((row) => {
        if (family && row.family !== family) {
          return false;
        }
        if (needle) {
          return (
            row.name.toLowerCase().includes(needle) ||
            row.summary.toLowerCase().includes(needle) ||
            row.family.includes(needle)
          );
        }
        return true;
      });

      const offset = parseCursor(cursor);
      const size = Math.min(limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
      const page = matches.slice(offset, offset + size);
      const nextOffset = offset + size;

      return {
        tools: page.map((row) => ({ ...row, enabled: handles.get(row.name)?.enabled ?? false })),
        total: matches.length,
        nextCursor: nextOffset < matches.length ? String(nextOffset) : undefined,
      };
    },

    enable: (names) => mutate(names, true),
    disable: (names) => mutate(names, false),
  };
};

/** Wraps controller output as a standard text tool result. */
const toToolResult = (data: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

/**
 * Registers the three discovery meta-tools on the server. Called only in dynamic
 * mode, after the eBay tools are registered and disabled, so the controller sees
 * every gateable handle.
 *
 * @param server - MCP server receiving the discovery meta-tools.
 * @param controller - Dynamic tool gating controller backing the meta-tools.
 * @returns Nothing; the server is mutated through MCP SDK registration calls.
 *
 * @example
 * ```ts
 * registerMetaTools(server, createToolGatingController(handles));
 * ```
 */
export const registerMetaTools = (server: McpServer, controller: ToolGatingController): void => {
  server.registerTool(
    'list_ebay_tools',
    {
      description:
        "Discover eBay tools without loading them into context. Call with no arguments to list the tool families; pass `family` to list a family's tools, or `query` to keyword-search across all tools. Returns lightweight rows (name, family, summary) — enable a tool with enable_ebay_tools to get its full schema and call it.",
      inputSchema: listEbayToolsInputSchema.shape,
    },
    (args) => toToolResult(controller.list(args)),
  );

  server.registerTool(
    'enable_ebay_tools',
    {
      description:
        'Load specific eBay tools into context so they can be called. Pass the exact tool names from list_ebay_tools. Returns the names enabled, any unknown names, and the active tool count.',
      inputSchema: dynamicToolNamesInputSchema.shape,
    },
    ({ names }) => toToolResult(controller.enable(names)),
  );

  server.registerTool(
    'disable_ebay_tools',
    {
      description:
        'Unload eBay tools previously enabled, reclaiming their context. Pass the exact tool names. Returns the names disabled, any unknown names, and the active tool count.',
      inputSchema: dynamicToolNamesInputSchema.shape,
    },
    ({ names }) => toToolResult(controller.disable(names)),
  );
};
