/**
 * LLM Client Detection and Auto-Configuration
 *
 * Detects installed LLM clients and provides utilities to auto-configure them
 * with the eBay MCP server settings.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';
import { Effect, Either } from 'effect';
import { getErrorMessage } from './errors.js';
import { setupLogger } from './logger.js';

/**
 * Detection result for an MCP-capable client configuration location.
 */
export interface DetectedMCPClient {
  /** Stable client key used by setup flags and configuration routing. */
  name: string;
  /** Absolute path to the client configuration file. */
  configPath: string;
  /** Whether the client configuration directory exists. */
  detected: boolean;
}

/**
 * LLM client metadata shown during setup and auto-configuration.
 */
export interface LLMClient extends DetectedMCPClient {
  /** Human-readable client name shown in setup prompts. */
  displayName: string;
  /** Whether the expected configuration file exists. */
  configExists: boolean;
}

/**
 * MCP server command block written into client configuration files.
 */
export interface MCPServerConfig {
  /** Executable command used by the client to start the MCP server. */
  command: string;
  /** Arguments passed to the MCP server command. */
  args?: string[];
  /** Optional environment variables injected by the client. */
  env?: Record<string, string>;
}

/**
 * Gets the config file path for Claude Desktop based on OS.
 */
const getClaudeConfigPath = (): string => {
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
};

/**
 * Gets the config file path for Cline (VSCode extension).
 */
const getClineConfigPath = (): string => {
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
        'cline_mcp_settings.json',
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
        'cline_mcp_settings.json',
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
        'cline_mcp_settings.json',
      );
  }
};

/**
 * Gets the config path for Continue.dev.
 */
const getContinueConfigPath = (): string => {
  const home = homedir();
  return join(home, '.continue', 'config.json');
};

/**
 * Gets the config path for Zed editor.
 */
const getZedConfigPath = (): string => {
  const home = homedir();
  const os = platform();

  switch (os) {
    case 'darwin':
      return join(home, '.config', 'zed', 'settings.json');
    case 'win32':
      return join(home, 'AppData', 'Roaming', 'Zed', 'settings.json');
    default:
      return join(home, '.config', 'zed', 'settings.json');
  }
};

/**
 * Gets the config path for Cursor IDE.
 */
const getCursorConfigPath = (): string => {
  const home = homedir();
  const os = platform();

  switch (os) {
    case 'darwin':
      return join(home, '.cursor', 'mcp.json');
    case 'win32':
      return join(home, '.cursor', 'mcp.json');
    default:
      return join(home, '.cursor', 'mcp.json');
  }
};

/**
 * Gets the config path for Windsurf (Codeium).
 */
const getWindsurfConfigPath = (): string => {
  const home = homedir();
  const os = platform();

  switch (os) {
    case 'darwin':
      return join(home, '.codeium', 'windsurf', 'mcp_config.json');
    case 'win32':
      return join(home, '.codeium', 'windsurf', 'mcp_config.json');
    default:
      return join(home, '.codeium', 'windsurf', 'mcp_config.json');
  }
};

/**
 * Gets the config path for Roo Code (VSCode extension).
 */
const getRooCodeConfigPath = (): string => {
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
        'rooveterinaryinc.roo-cline',
        'settings',
        'mcp_settings.json',
      );
    case 'win32':
      return join(
        home,
        'AppData',
        'Roaming',
        'Code',
        'User',
        'globalStorage',
        'rooveterinaryinc.roo-cline',
        'settings',
        'mcp_settings.json',
      );
    default:
      return join(
        home,
        '.config',
        'Code',
        'User',
        'globalStorage',
        'rooveterinaryinc.roo-cline',
        'settings',
        'mcp_settings.json',
      );
  }
};

/**
 * Gets the config path for Claude Code CLI.
 */
const getClaudeCodeConfigPath = (): string => {
  const home = homedir();
  return join(home, '.claude.json');
};

/**
 * Gets the config path for Amazon Q Developer.
 */
const getAmazonQConfigPath = (): string => {
  const home = homedir();
  const os = platform();

  switch (os) {
    case 'darwin':
      return join(home, '.aws', 'amazonq', 'mcp.json');
    case 'win32':
      return join(home, '.aws', 'amazonq', 'mcp.json');
    default:
      return join(home, '.aws', 'amazonq', 'mcp.json');
  }
};

/**
 * Detects all supported LLM clients and their configuration file locations.
 *
 * @returns LLM clients annotated with config file and installation-directory presence.
 * @example
 * ```ts
 * const clients = detectLLMClients();
 * ```
 */
export const detectLLMClients = (): LLMClient[] => {
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
    {
      name: 'zed',
      displayName: 'Zed Editor',
      configPath: getZedConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'cursor',
      displayName: 'Cursor IDE',
      configPath: getCursorConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'windsurf',
      displayName: 'Windsurf (Codeium)',
      configPath: getWindsurfConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'roocode',
      displayName: 'Roo Code (VSCode Extension)',
      configPath: getRooCodeConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'claudecode',
      displayName: 'Claude Code CLI',
      configPath: getClaudeCodeConfigPath(),
      detected: false,
      configExists: false,
    },
    {
      name: 'amazonq',
      displayName: 'Amazon Q Developer',
      configPath: getAmazonQConfigPath(),
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
};

/**
 * Reads and parses a JSON config file safely.
 */
const readJSONConfig = (path: string): Record<string, unknown> =>
  Effect.runSync(
    Effect.try({
      try: () => {
        if (!existsSync(path)) {
          return {};
        }

        const content = readFileSync(path, 'utf-8');
        return JSON.parse(content) as Record<string, unknown>;
      },
      catch: () => ({}),
    }).pipe(Effect.catchAll((fallbackConfig) => Effect.succeed(fallbackConfig))),
  );

/**
 * Writes a JSON config file safely.
 */
const writeJSONConfig = (path: string, config: Record<string, unknown>): void => {
  // Ensure directory exists
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, JSON.stringify(config, null, 2), 'utf-8');
};

const runClientConfigurator = (clientLabel: string, configure: () => void): boolean => {
  const configured = Effect.runSync(
    Effect.either(
      Effect.try({
        try: configure,
        catch: (error) => error,
      }),
    ),
  );

  if (Either.isRight(configured)) {
    return true;
  }

  setupLogger.error(`Failed to configure ${clientLabel}`, {
    error: getErrorMessage(configured.left),
  });
  return false;
};

const ensureMcpServersConfig = (
  config: Record<string, unknown>,
): Record<string, MCPServerConfig> => {
  if (!config.mcpServers || typeof config.mcpServers !== 'object') {
    config.mcpServers = {};
  }

  return config.mcpServers as Record<string, MCPServerConfig>;
};

const hasMcpServerConfig = (configPath: string): boolean => {
  if (!existsSync(configPath)) {
    return false;
  }

  const config = readJSONConfig(configPath);
  const mcpServers = config.mcpServers as Record<string, MCPServerConfig> | undefined;

  return !!mcpServers?.['ebay-mcp-server'];
};

/**
 * Configures Claude Desktop with the eBay MCP server command.
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureClaudeDesktop(process.cwd());
 * ```
 */
export const configureClaudeDesktop = (projectRoot: string): boolean => {
  return runClientConfigurator('Claude Desktop', () => {
    const configPath = getClaudeConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Cline (VSCode extension) with the eBay MCP server command.
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureCline(process.cwd());
 * ```
 */
export const configureCline = (projectRoot: string): boolean => {
  return runClientConfigurator('Cline', () => {
    const configPath = getClineConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Continue.dev with the eBay MCP server command.
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureContinue(process.cwd());
 * ```
 */
export const configureContinue = (projectRoot: string): boolean => {
  return runClientConfigurator('Continue.dev', () => {
    const configPath = getContinueConfigPath();
    const config = readJSONConfig(configPath);

    // Initialize experimental.modelContextProtocolServers if it doesn't exist
    if (!config.experimental || typeof config.experimental !== 'object') {
      config.experimental = {};
    }

    const experimental = config.experimental as Record<string, unknown>;

    if (
      !(
        experimental.modelContextProtocolServers &&
        Array.isArray(experimental.modelContextProtocolServers)
      )
    ) {
      experimental.modelContextProtocolServers = [];
    }

    const mcpServers = experimental.modelContextProtocolServers as MCPServerConfig[];

    // Check if eBay server already exists
    const existingIndex = mcpServers.findIndex(
      (server) => server.command === 'node' && server.args?.[0]?.includes('ebay-mcp'),
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
  });
};

/**
 * Configures Zed editor with the eBay MCP server command.
 *
 * Zed uses context_servers in settings.json
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureZed(process.cwd());
 * ```
 */
export const configureZed = (projectRoot: string): boolean => {
  return runClientConfigurator('Zed', () => {
    const configPath = getZedConfigPath();
    const config = readJSONConfig(configPath);

    // Initialize context_servers if it doesn't exist
    if (!config.context_servers || typeof config.context_servers !== 'object') {
      config.context_servers = {};
    }

    const contextServers = config.context_servers as Record<string, unknown>;

    // Add or update eBay MCP server configuration
    contextServers['ebay-mcp-server'] = {
      command: {
        path: 'node',
        args: [join(projectRoot, 'build', 'index.js')],
      },
      settings: {},
    };

    config.context_servers = contextServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Cursor IDE with the eBay MCP server command.
 *
 * Cursor uses mcpServers in mcp.json
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureCursor(process.cwd());
 * ```
 */
export const configureCursor = (projectRoot: string): boolean => {
  return runClientConfigurator('Cursor', () => {
    const configPath = getCursorConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Windsurf (Codeium) with the eBay MCP server command.
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureWindsurf(process.cwd());
 * ```
 */
export const configureWindsurf = (projectRoot: string): boolean => {
  return runClientConfigurator('Windsurf', () => {
    const configPath = getWindsurfConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Roo Code (VSCode extension) with the eBay MCP server command.
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureRooCode(process.cwd());
 * ```
 */
export const configureRooCode = (projectRoot: string): boolean => {
  return runClientConfigurator('Roo Code', () => {
    const configPath = getRooCodeConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Claude Code CLI with the eBay MCP server command.
 *
 * Claude Code CLI uses mcpServers in ~/.claude.json
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureClaudeCode(process.cwd());
 * ```
 */
export const configureClaudeCode = (projectRoot: string): boolean => {
  return runClientConfigurator('Claude Code CLI', () => {
    const configPath = getClaudeCodeConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures Amazon Q Developer with the eBay MCP server command.
 *
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the client config file was updated.
 * @example
 * ```ts
 * const configured = configureAmazonQ(process.cwd());
 * ```
 */
export const configureAmazonQ = (projectRoot: string): boolean => {
  return runClientConfigurator('Amazon Q', () => {
    const configPath = getAmazonQConfigPath();
    const config = readJSONConfig(configPath);
    const mcpServers = ensureMcpServersConfig(config);

    // Add or update eBay MCP server configuration
    mcpServers['ebay-mcp-server'] = {
      command: 'node',
      args: [join(projectRoot, 'build', 'index.js')],
    };

    config.mcpServers = mcpServers;
    writeJSONConfig(configPath, config);
  });
};

/**
 * Configures a supported LLM client with the eBay MCP server command.
 *
 * @param clientName Stable client key such as `claude`, `cursor`, or `amazonq`.
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns `true` when the named client configuration was updated.
 * @example
 * ```ts
 * const configured = configureLLMClient('cursor', process.cwd());
 * ```
 */
export const configureLLMClient = (clientName: string, projectRoot: string): boolean => {
  switch (clientName) {
    case 'claude':
      return configureClaudeDesktop(projectRoot);
    case 'cline':
      return configureCline(projectRoot);
    case 'continue':
      return configureContinue(projectRoot);
    case 'zed':
      return configureZed(projectRoot);
    case 'cursor':
      return configureCursor(projectRoot);
    case 'windsurf':
      return configureWindsurf(projectRoot);
    case 'roocode':
      return configureRooCode(projectRoot);
    case 'claudecode':
      return configureClaudeCode(projectRoot);
    case 'amazonq':
      return configureAmazonQ(projectRoot);
    default:
      return false;
  }
};

/**
 * Gets human-readable instructions for manual client configuration.
 *
 * @param clientName Stable client key such as `claude`, `cursor`, or `amazonq`.
 * @param projectRoot Absolute project root containing `build/index.js`.
 * @returns A formatted setup snippet for the requested client.
 * @example
 * ```ts
 * const instructions = getManualConfigInstructions('claude', process.cwd());
 * ```
 */
export const getManualConfigInstructions = (clientName: string, projectRoot: string): string => {
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

    case 'zed':
      return `
Add this to ${getZedConfigPath()}:

{
  "context_servers": {
    "ebay-mcp-server": {
      "command": {
        "path": "node",
        "args": ["${buildPath}"]
      },
      "settings": {}
    }
  }
}`;

    case 'cursor':
      return `
Add this to ${getCursorConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    case 'windsurf':
      return `
Add this to ${getWindsurfConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    case 'roocode':
      return `
Add this to ${getRooCodeConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    case 'claudecode':
      return `
Add this to ${getClaudeCodeConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    case 'amazonq':
      return `
Add this to ${getAmazonQConfigPath()}:

{
  "mcpServers": {
    "ebay-mcp-server": {
      "command": "node",
      "args": ["${buildPath}"]
    }
  }
}`;

    default:
      return 'Manual configuration instructions not available for this client.';
  }
};

/**
 * Verifies that a client has an eBay MCP server entry.
 *
 * @param clientName Stable client key such as `claude`, `cursor`, or `amazonq`.
 * @param _projectRoot Reserved project root parameter kept for signature parity with configuration helpers.
 * @returns `true` when the expected eBay MCP server entry is present.
 * @example
 * ```ts
 * const ready = verifyClientConfiguration('cursor', process.cwd());
 * ```
 */
export const verifyClientConfiguration = (clientName: string, _projectRoot: string): boolean => {
  const verified = Effect.runSync(
    Effect.either(
      Effect.try({
        try: () => {
          switch (clientName) {
            case 'claude':
              return hasMcpServerConfig(getClaudeConfigPath());

            case 'cline':
              return hasMcpServerConfig(getClineConfigPath());

            case 'continue': {
              const configPath = getContinueConfigPath();
              if (!existsSync(configPath)) return false;

              const config = readJSONConfig(configPath);
              const experimental = config.experimental as Record<string, unknown> | undefined;
              const mcpServers = experimental?.modelContextProtocolServers as
                | MCPServerConfig[]
                | undefined;

              return !!mcpServers?.some((server) => server.args?.[0]?.includes('ebay-mcp-server'));
            }

            case 'zed': {
              const configPath = getZedConfigPath();
              if (!existsSync(configPath)) return false;

              const config = readJSONConfig(configPath);
              const contextServers = config.context_servers as Record<string, unknown> | undefined;

              return !!contextServers?.['ebay-mcp-server'];
            }

            case 'cursor':
              return hasMcpServerConfig(getCursorConfigPath());

            case 'windsurf':
              return hasMcpServerConfig(getWindsurfConfigPath());

            case 'roocode':
              return hasMcpServerConfig(getRooCodeConfigPath());

            case 'claudecode':
              return hasMcpServerConfig(getClaudeCodeConfigPath());

            case 'amazonq':
              return hasMcpServerConfig(getAmazonQConfigPath());

            default:
              return false;
          }
        },
        catch: () => false,
      }),
    ),
  );

  return Either.isRight(verified) ? verified.right : false;
};

/**
 * Gets all supported LLM client keys.
 *
 * @returns Stable client keys accepted by setup and configuration helpers.
 * @example
 * ```ts
 * const clientNames = getAllSupportedClients();
 * ```
 */
export const getAllSupportedClients = (): string[] => [
  'claude',
  'cline',
  'continue',
  'zed',
  'cursor',
  'windsurf',
  'roocode',
  'claudecode',
  'amazonq',
];

/**
 * Checks if a client key supports native MCP configuration.
 *
 * @param clientName Stable client key to test.
 * @returns `true` when this setup utility can configure the named client.
 * @example
 * ```ts
 * const supported = supportsNativeMCP('claude');
 * ```
 */
export const supportsNativeMCP = (clientName: string): boolean => {
  // All these clients support MCP (Model Context Protocol)
  const supportedClients = [
    'claude',
    'cline',
    'continue',
    'zed',
    'cursor',
    'windsurf',
    'roocode',
    'claudecode',
    'amazonq',
  ];
  return supportedClients.includes(clientName.toLowerCase());
};
