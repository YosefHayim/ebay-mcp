#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { validateEnvironmentConfig } from '@/config/environment.js';
import { createEbayMcpRuntime, type EbayMcpRuntime } from '@/mcp/runtime.js';
import { runSetup } from '@/scripts/setup.js';
import { runSkillsWizard } from '@/scripts/skills.js';
import { getErrorMessage } from '@/utils/errors.js';
import { serverLogger, getLogPaths } from '@/utils/logger.js';
import { getCachedUpdateNotice } from '@/utils/version.js';

const args = process.argv.slice(2);
if (args.includes('setup')) {
  try {
    await runSetup();
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (args.includes('skills')) {
  try {
    await runSkillsWizard();
    process.exit(0);
  } catch (error) {
    console.error('Skills install failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * eBay API MCP Server
 * Provides access to eBay APIs through Model Context Protocol
 */
class EbayMcpServer {
  private runtime: EbayMcpRuntime;

  constructor() {
    this.runtime = createEbayMcpRuntime({ logToolExecution: true });
    this.setupErrorHandling();
  }

  /**
   * Initialize the API (load tokens from storage)
   */
  private async initialize(): Promise<void> {
    await this.runtime.initializeApi();
  }

  private setupErrorHandling(): void {
    process.on('SIGINT', async () => {
      serverLogger.info('Received SIGINT, shutting down...');
      await this.runtime.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    serverLogger.info('Starting eBay API MCP Server');

    // stdout is reserved for the MCP protocol, so a TTY update box (used by the
    // CLIs) can't run here — surface any newer version as a stderr log line.
    const updateNotice = getCachedUpdateNotice();
    if (updateNotice) {
      serverLogger.info(updateNotice);
    }

    // Validate environment configuration
    const validation = validateEnvironmentConfig();

    // Log informational notices (e.g. proxy auth mode)
    validation.infos.forEach((info) => {
      serverLogger.info(info);
    });

    // Log warnings
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => {
        serverLogger.warn(warning);
      });
    }

    // Log errors and exit if configuration is invalid
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        serverLogger.error(error);
      });
      serverLogger.error('Please fix the configuration errors and restart the server.');
      process.exit(1);
    }

    // Initialize API (load tokens from storage)
    serverLogger.info('Initializing API client');
    await this.initialize();

    // Log log file locations if file logging is enabled
    if (process.env.EBAY_ENABLE_FILE_LOGGING === 'true') {
      const paths = getLogPaths();
      serverLogger.info('File logging enabled', {
        logDir: paths.logDir,
        errorLog: paths.errorLog,
        combinedLog: paths.combinedLog,
      });
    }

    const transport = new StdioServerTransport();
    await this.runtime.server.connect(transport);
    serverLogger.info('eBay API MCP Server running on stdio');
  }
}

// Start the server
const server = new EbayMcpServer();
server.run().catch((error) => {
  serverLogger.error('Fatal error running server', {
    error: getErrorMessage(error, String(error)),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
