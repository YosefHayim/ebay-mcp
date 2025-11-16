import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EbaySellerApi } from '@/api/index.js';
import { getEbayConfig, mcpConfig, validateEnvironmentConfig } from '@/config/environment.js';
import { getToolDefinitions, executeTool } from '@/tools/index.js';

/**
 * eBay API MCP Server
 * Provides access to eBay APIs through Model Context Protocol
 */
class EbayMcpServer {
  private server: McpServer;
  private api: EbaySellerApi;

  constructor() {
    this.server = new McpServer(mcpConfig);

    // Initialize eBay API client
    this.api = new EbaySellerApi(getEbayConfig());
    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Initialize the API (load tokens from storage)
   */
  private async initialize(): Promise<void> {
    await this.api.initialize();
  }

  private setupHandlers(): void {
    const tools = getToolDefinitions();

    // Register each tool with the MCP server
    for (const toolDef of tools) {
      this.server.registerTool(
        toolDef.name,
        {
          description: toolDef.description,
          inputSchema: toolDef.inputSchema,
        },
        async (args: Record<string, unknown>) => {
          try {
            const result = await executeTool(this.api, toolDef.name, args);
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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
        }
      );
    }
  }

  private setupErrorHandling(): void {
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    // Validate environment configuration
    const validation = validateEnvironmentConfig();

    // Display warnings
    if (validation.warnings.length > 0) {
      console.error('\n⚠️  Environment Configuration Warnings:');
      validation.warnings.forEach((warning) => {
        console.error(`  • ${warning}`);
      });
      console.error('');
    }

    // Display errors and exit if configuration is invalid
    if (!validation.isValid) {
      console.error('\n❌ Environment Configuration Errors:');
      validation.errors.forEach((error) => {
        console.error(`  • ${error}`);
      });
      console.error('\nPlease fix the configuration errors and restart the server.\n');
      process.exit(1);
    }

    // Initialize API (load tokens from storage)
    await this.initialize();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('eBay API MCP Server running on stdio');
  }
}

// Start the server
const server = new EbayMcpServer();
server.run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
