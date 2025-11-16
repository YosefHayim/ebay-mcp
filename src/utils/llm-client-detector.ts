/**
 * LLM Client Detection and Auto-Configuration
 *
 * Detects installed LLM clients and provides utilities to auto-configure them
 * with the eBay MCP server settings.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';

export interface LLMClient {
  name: string;
  displayName: string;
  configPath: string;
  detected: boolean;
  configExists: boolean;
}

export interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * Get the config file path for Claude Desktop based on OS
 */
function getClaudeConfigPath(): string {
  const os = platform();
  const home = homedir();

  switch (os) {
    case 'darwin': // macOS
      return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    case 'win32': // Windows
      return join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    case 'linux':
      return join(home, '.config', 'Claude', 'claude_desktop_config.json');
    default:
      return join(home, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

/**
 * Get the config file path for Cline (VSCode extension)
 */
function getClineConfigPath(): string {
  const home = homedir();
  const os = platform();

  switch (os) {
    case 'darwin':
      return join(
        home,
        'Library',
        'Application Support',
        'Code',
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev',
        'settings',
        'cline_mcp_settings.json'
      );
    case 'win32':
      return join(
        home,
        'AppData',
        'Roaming',
        'Code',
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev',
        'settings',
        'cline_mcp_settings.json'
      );
    default:
      return join(
        home,
        '.config',
        'Code',
        'User',
        'globalStorage',
        'saoudrizwan.claude-dev',
        'settings',
        'cline_mcp_settings.json'
      );
  }
}

/**
 * Get config path for Continue.dev
 */
function getContinueConfigPath(): string {
  const home = homedir();
  return join(home, '.continue', 'config.json');
}

/**
 * Detect all available LLM clients
 */
export function detectLLMClients(): LLMClient[] {
  const clients: LLMClient[] = [
    {
      name: 'claude',
      displayName: 'Claude Desktop',
      configPath: getClaudeConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'cline',
      displayName: 'Cline (VSCode Extension)',
      configPath: getClineConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'continue',
      displayName: 'Continue.dev',
      configPath: getContinueConfigPath(),
      detected: false,
      configExists: false,
    },
  ];

  // Check which clients exist
  for (const client of clients) {
    client.configExists = existsSync(client.configPath);
    // Check if parent directory exists (indicates app is installed)
    const parentDir = dirname(client.configPath);
    client.detected = existsSync(parentDir);
  }

  return clients;
}

/**
 * Read and parse JSON config file safely
 */
function readJSONConfig(path: string): Record<string, unknown> {
  try {
    if (!existsSync(path)) {
      return {};
    }
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Write JSON config file safely
 */
function writeJSONConfig(path: string, config: Record<string, unknown>): void {
  // Ensure directory exists
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Configure Claude Desktop with eBay MCP server
 */
export function configureClaudeDesktop(projectRoot: string): boolean {
  try {
    const configPath = getClaudeConfigPath();
    const config = readJSONConfig(configPath);

    // Initialize mcpServers if it doesn't exist
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      config.mcpServers = {};
    }

    const mcpServers = config.mcpServers as Record<string, MCPServerConfig>;

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);

    return true;
  } catch (error) {
    console.error('Failed to configure Claude Desktop:', error);
    return false;
  }
}

/**
 * Configure Cline (VSCode extension) with eBay MCP server
 */
export function configureCline(projectRoot: string): boolean {
  try {
    const configPath = getClineConfigPath();
    const config = readJSONConfig(configPath);

    // Initialize mcpServers if it doesn't exist
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      config.mcpServers = {};
    }

    const mcpServers = config.mcpServers as Record<string, MCPServerConfig>;

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);

    return true;
  } catch (error) {
    console.error('Failed to configure Cline:', error);
    return false;
  }
}

/**
 * Configure Continue.dev with eBay MCP server
 */
export function configureContinue(projectRoot: string): boolean {
  try {
    const configPath = getContinueConfigPath();
    const config = readJSONConfig(configPath);

    // Initialize experimental.modelContextProtocolServers if it doesn't exist
    if (!config.experimental || typeof config.experimental !== 'object') {
      config.experimental = {};
    }

    const experimental = config.experimental as Record<string, unknown>;

    if (
      !experimental.modelContextProtocolServers ||
      !Array.isArray(experimental.modelContextProtocolServers)
    ) {
      experimental.modelContextProtocolServers = [];
    }

    const mcpServers = experimental.modelContextProtocolServers as MCPServerConfig[];

    // Check if eBay server already exists
    const existingIndex = mcpServers.findIndex(
      (server) => server.command === 'node' && server.args?.[0]?.includes('ebay-api-mcp-server')
    );

    const serverConfig: MCPServerConfig = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    if (existingIndex >= 0) {
      mcpServers[existingIndex] = serverConfig;
    } else {
      mcpServers.push(serverConfig);
    }

    experimental.modelContextProtocolServers = mcpServers;
    config.experimental = experimental;
    writeJSONConfig(configPath, config);

    return true;
  } catch (error) {
    console.error('Failed to configure Continue.dev:', error);
    return false;
  }
}

/**
 * Configure specified LLM client
 */
export function configureLLMClient(clientName: string, projectRoot: string): boolean {
  switch (clientName) {
    case 'claude':
      return configureClaudeDesktop(projectRoot);
    case 'cline':
      return configureCline(projectRoot);
    case 'continue':
      return configureContinue(projectRoot);
    default:
      return false;
  }
}

/**
 * Get human-readable instructions for manual configuration
 */
export function getManualConfigInstructions(clientName: string, projectRoot: string): string {
  const buildPath = join(projectRoot, 'build', 'index.js');

  switch (clientName) {
    case 'claude':
      return `
Add this to ${getClaudeConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    case 'cline':
      return `
Add this to ${getClineConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    case 'continue':
      return `
Add this to ${getContinueConfigPath()}:

{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "command": "node",
        "args": ["${buildPath}"]
      }
    ]
  }
}`;

    default:
      return 'Manual configuration instructions not available for this client.';
  }
}
