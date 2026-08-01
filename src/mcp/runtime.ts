import { McpServer, type RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/index.js';
import { getEbayConfig, mcpConfig } from '@/config/environment.js';
import { resolveToolGatingMode } from '@/config/toolFamilies.js';
import { isReadOnlyModeEnabled, isReadOnlyTool } from '@/mcp/readOnlyFilter.js';
import {
  createToolGatingController,
  DYNAMIC_MODE_INSTRUCTIONS,
  registerMetaTools,
  toolNamesInFamilies,
} from '@/mcp/toolGating.js';
import { buildUiToolResult, createUiBridge, type UiBridge } from '@/mcp/uiBridge.js';
import { getToolEntries, type ToolEntry } from '@/tools/registry.js';
import { getEbayErrorDetails } from '@/utils/errors.js';
import { serverLogger, toolLogger } from '@/utils/logger.js';
import { Effect } from 'effect';

type ToolArgs = Record<string, unknown>;

/**
 * Optional dependencies and metadata for constructing the eBay MCP runtime.
 */
export interface EbayMcpRuntimeOptions {
  /** Optional prebuilt API facade, mainly for tests. */
  api?: EbaySellerApi;
  /** Optional MCP implementation metadata advertised during initialize. */
  serverConfig?: Implementation;
  /** Enables debug/error logs for each tool call when true. */
  logToolExecution?: boolean;
}

/**
 * Initialized MCP server runtime and eBay API facade.
 */
export interface EbayMcpRuntime {
  /** eBay API facade shared by every registered tool handler. */
  api: EbaySellerApi;
  /** MCP server instance with eBay tools registered. */
  server: McpServer;
  /** Initializes credentials/token state before the server accepts real calls. */
  initializeApi(): Promise<void>;
}

/**
 * Shape a successful tool result into an MCP text content block. Exported for
 * unit testing the 204/`undefined` fallback below.
 */
export function formatToolSuccess(result: unknown) {
  // eBay returns 204 No Content for several writes (opt-in, create location),
  // which decodes to `undefined`. `JSON.stringify(undefined)` is `undefined`
  // (not a string), and the MCP result schema requires `text` to be a string —
  // sending it raw throws "expected string, received undefined". Represent an
  // empty success body as an explicit success marker instead.
  const serialized = JSON.stringify(result, null, 2);
  return {
    content: [
      {
        type: 'text' as const,
        text: serialized ?? JSON.stringify({ success: true }, null, 2),
      },
    ],
  };
}

/**
 * Shape a tool failure into an MCP error content block, surfacing eBay's real
 * error detail. Exported for unit testing the error-payload projection.
 */
export function formatToolFailure(error: unknown) {
  // Surface eBay's real error payload (errorId, message, longMessage, parameters)
  // instead of masking every failure as a single opaque message.
  const { message, status, errors } = getEbayErrorDetails(error);
  const payload: Record<string, unknown> = { error: message };
  if (status !== undefined) {
    payload.status = status;
  }
  if (errors !== undefined) {
    payload.details = errors;
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
    isError: true,
  };
}

function registerTool(
  server: McpServer,
  api: EbaySellerApi,
  entry: ToolEntry,
  logToolExecution: boolean,
  ui: UiBridge,
): RegisteredTool {
  const { definition, handler } = entry;

  // Registered plainly (no UI `_meta`) so every host gets a working text tool by
  // default; the capability gate later flips `_meta.ui` on for UI-capable clients.
  const registered = server.registerTool(
    definition.name,
    {
      description: definition.description,
      inputSchema: definition.inputSchema,
    },
    async (args: ToolArgs) => {
      if (logToolExecution) {
        toolLogger.debug(`Executing tool: ${definition.name}`, { args });
      }

      return await Effect.runPromise(
        Effect.tryPromise({
          try: () => Promise.resolve(handler(api, args)),
          catch: (error) => error,
        }).pipe(
          Effect.map((result) => {
            if (logToolExecution) {
              toolLogger.debug(`Tool ${definition.name} completed successfully`);
            }

            return ui.shouldRender(entry)
              ? buildUiToolResult(entry.ui, result)
              : formatToolSuccess(result);
          }),
          Effect.catchAll((error) => {
            if (logToolExecution) {
              toolLogger.error(`Tool ${definition.name} failed`, {
                error: getEbayErrorDetails(error).message,
              });
            }

            return Effect.succeed(formatToolFailure(error));
          }),
        ),
      );
    },
  );

  ui.register(entry, registered);
  return registered;
}

/**
 * Create an MCP server runtime and register all eBay tool handlers.
 *
 * @param options - Optional runtime dependencies and metadata overrides.
 * @returns Initialized runtime wrapper containing the MCP server and API facade.
 *
 * @example
 * ```ts
 * const runtime = createEbayMcpRuntime({ logToolExecution: true });
 * await runtime.initializeApi();
 * ```
 */
export const createEbayMcpRuntime = (options: EbayMcpRuntimeOptions = {}): EbayMcpRuntime => {
  const api = options.api ?? new EbaySellerApi(getEbayConfig());
  const serverInfo = options.serverConfig ?? mcpConfig;
  const mode = resolveToolGatingMode();

  // Instructions are set only in dynamic mode so the agent knows the catalogue is
  // hidden behind the discovery tools; default/static modes keep the handshake
  // byte-for-byte unchanged (a bare single-arg construction).
  const server =
    mode.kind === 'dynamic'
      ? new McpServer(serverInfo, { instructions: DYNAMIC_MODE_INSTRUCTIONS })
      : new McpServer(serverInfo);

  const ui = createUiBridge(server, import.meta.url);

  // Static mode registers only the named families; all and dynamic register the
  // full catalogue (dynamic then disables it below, before the transport connects).
  const allEntries = getToolEntries();
  let entries =
    mode.kind === 'static'
      ? (() => {
          const names = toolNamesInFamilies(mode.families);
          return allEntries.filter((entry) => names.has(entry.definition.name));
        })()
      : allEntries;

  // Optional second gate: drop any non-read-only tools after family selection so
  // EBAY_READ_ONLY composes with all / static / dynamic modes.
  if (isReadOnlyModeEnabled()) {
    entries = entries.filter((entry) => isReadOnlyTool(entry.definition));
    serverLogger.info(`EBAY_READ_ONLY: filtered to ${entries.length} read-only tools`);
  }

  const handles = new Map<string, RegisteredTool>();
  for (const entry of entries) {
    handles.set(
      entry.definition.name,
      registerTool(server, api, entry, options.logToolExecution ?? false, ui),
    );
  }

  if (mode.kind === 'dynamic') {
    // Disable before `connect`: the SDK only emits `tools/listChanged` once the
    // transport is connected, so these flips are silent. The agent re-enables the
    // tools it needs via the meta-tools, which fire `listChanged` post-connect.
    for (const handle of handles.values()) {
      handle.disable();
    }
    registerMetaTools(server, createToolGatingController(handles));
    serverLogger.info(
      `Dynamic tool mode: ${handles.size} eBay tools hidden behind 3 discovery tools`,
    );
  } else if (mode.kind === 'static') {
    serverLogger.info(
      `Static tool mode: registered ${handles.size} tools from families: ${mode.families.join(', ')}`,
    );
  } else {
    serverLogger.info(`Registering ${handles.size} tools`);
  }

  // Install after registration so every UI-eligible tool is captured before the
  // gate can flip their metadata on a UI-capable client's `initialize`.
  ui.installCapabilityGate();

  return {
    api,
    server,
    async initializeApi() {
      await Effect.runPromise(api.initialize());
    },
  };
};
