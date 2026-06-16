import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/index.js';
import { getEbayConfig, mcpConfig } from '@/config/environment.js';
import { buildUiToolResult, createUiBridge, type UiBridge } from '@/mcp/ui-bridge.js';
import { getToolEntries, type ToolEntry } from '@/tools/registry.js';
import { getErrorMessage } from '@/utils/errors.js';
import { serverLogger, toolLogger } from '@/utils/logger.js';

type ToolArgs = Record<string, unknown>;

/**
 * Optional dependencies and metadata for constructing the eBay MCP runtime.
 */
export interface EbayMcpRuntimeOptions {
  api?: EbaySellerApi;
  serverConfig?: Implementation;
  logToolExecution?: boolean;
}

/**
 * Initialized MCP server runtime and eBay API facade.
 */
export interface EbayMcpRuntime {
  api: EbaySellerApi;
  server: McpServer;
  initializeApi(): Promise<void>;
}

function formatToolSuccess(result: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

function formatToolFailure(error: unknown) {
  const errorMessage = getErrorMessage(error);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ error: errorMessage }, null, 2),
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
  ui: UiBridge
): void {
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

      try {
        const result = await handler(api, args);

        if (logToolExecution) {
          toolLogger.debug(`Tool ${definition.name} completed successfully`);
        }

        return ui.shouldRender(entry)
          ? buildUiToolResult(entry.ui, result)
          : formatToolSuccess(result);
      } catch (error) {
        const errorMessage = getErrorMessage(error);

        if (logToolExecution) {
          toolLogger.error(`Tool ${definition.name} failed`, { error: errorMessage });
        }

        return formatToolFailure(error);
      }
    }
  );

  ui.register(entry, registered);
}

/**
 * Create an MCP server runtime and register all eBay tool handlers.
 */
export function createEbayMcpRuntime(options: EbayMcpRuntimeOptions = {}): EbayMcpRuntime {
  const api = options.api ?? new EbaySellerApi(getEbayConfig());
  const server = new McpServer(options.serverConfig ?? mcpConfig);
  const entries = getToolEntries();
  const ui = createUiBridge(server, import.meta.url);

  serverLogger.info(`Registering ${entries.length} tools`);

  for (const entry of entries) {
    registerTool(server, api, entry, options.logToolExecution ?? false, ui);
  }

  // Install after registration so every UI-eligible tool is captured before the
  // gate can flip their metadata on a UI-capable client's `initialize`.
  ui.installCapabilityGate();

  return {
    api,
    server,
    async initializeApi() {
      await api.initialize();
    },
  };
}
