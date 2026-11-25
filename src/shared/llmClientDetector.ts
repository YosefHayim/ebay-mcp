import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir, platform } from "os";
import { dirname, join } from "path";
import { getErrorMessage } from "./errors.js";
import { setupLogger } from "./logger.js";

export interface DetectedMCPClient {
	name: string;
	configPath: string;
	detected: boolean;
}

export interface LLMClient extends DetectedMCPClient {
	displayName: string;
	configExists: boolean;
}

export interface MCPServerConfig {
	command: string;
	args?: string[];
	env?: Record<string, string>;
}

function getClaudeConfigPath(): string {
	const os = platform();
	const home = homedir();

	switch (os) {
		case "darwin": // macOS
			return join(
				home,
				"Library",
				"Application Support",
				"Claude",
				"claude_desktop_config.json",
			);
		case "win32": // Windows
			return join(
				home,
				"AppData",
				"Roaming",
				"Claude",
				"claude_desktop_config.json",
			);
		case "linux":
			return join(home, ".config", "Claude", "claude_desktop_config.json");
		default:
			return join(home, ".config", "Claude", "claude_desktop_config.json");
	}
}

function getClineConfigPath(): string {
	const home = homedir();
	const os = platform();

	switch (os) {
		case "darwin":
			return join(
				home,
				"Library",
				"Application Support",
				"Code",
				"User",
				"globalStorage",
				"saoudrizwan.claude-dev",
				"settings",
				"cline_mcp_settings.json",
			);
		case "win32":
			return join(
				home,
				"AppData",
				"Roaming",
				"Code",
				"User",
				"globalStorage",
				"saoudrizwan.claude-dev",
				"settings",
				"cline_mcp_settings.json",
			);
		default:
			return join(
				home,
				".config",
				"Code",
				"User",
				"globalStorage",
				"saoudrizwan.claude-dev",
				"settings",
				"cline_mcp_settings.json",
			);
	}
}

function getContinueConfigPath(): string {
	const home = homedir();
	return join(home, ".continue", "config.json");
}

function getZedConfigPath(): string {
	const home = homedir();
	const os = platform();

	switch (os) {
		case "darwin":
			return join(home, ".config", "zed", "settings.json");
		case "win32":
			return join(home, "AppData", "Roaming", "Zed", "settings.json");
		default:
			return join(home, ".config", "zed", "settings.json");
	}
}

function getCursorConfigPath(): string {
	const home = homedir();
	const os = platform();

	switch (os) {
		case "darwin":
			return join(home, ".cursor", "mcp.json");
		case "win32":
			return join(home, ".cursor", "mcp.json");
		default:
			return join(home, ".cursor", "mcp.json");
	}
}

function getWindsurfConfigPath(): string {
	const home = homedir();
	const os = platform();

	switch (os) {
		case "darwin":
			return join(home, ".codeium", "windsurf", "mcp_config.json");
		case "win32":
			return join(home, ".codeium", "windsurf", "mcp_config.json");
		default:
			return join(home, ".codeium", "windsurf", "mcp_config.json");
	}
}

function getRooCodeConfigPath(): string {
	const home = homedir();
	const os = platform();

	switch (os) {
		case "darwin":
			return join(
				home,
				"Library",
				"Application Support",
				"Code",
				"User",
				"globalStorage",
				"rooveterinaryinc.roo-cline",
				"settings",
				"mcp_settings.json",
			);
		case "win32":
			return join(
				home,
				"AppData",
				"Roaming",
				"Code",
				"User",
				"globalStorage",
				"rooveterinaryinc.roo-cline",
				"settings",
				"mcp_settings.json",
			);
		default:
			return join(
				home,
				".config",
				"Code",
				"User",
				"globalStorage",
				"rooveterinaryinc.roo-cline",
				"settings",
				"mcp_settings.json",
			);
	}
}

function getClaudeCodeConfigPath(): string {
	const home = homedir();
	return join(home, ".claude.json");
}

function getAmazonQConfigPath(): string {
	const home = homedir();
	const os = platform();

	switch (os) {
		case "darwin":
			return join(home, ".aws", "amazonq", "mcp.json");
		case "win32":
			return join(home, ".aws", "amazonq", "mcp.json");
		default:
			return join(home, ".aws", "amazonq", "mcp.json");
	}
}

export function detectLLMClients(): LLMClient[] {
	const clients: LLMClient[] = [
		{
			name: "claude",
			displayName: "Claude Desktop",
			configPath: getClaudeConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "cline",
			displayName: "Cline (VSCode Extension)",
			configPath: getClineConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "continue",
			displayName: "Continue.dev",
			configPath: getContinueConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "zed",
			displayName: "Zed Editor",
			configPath: getZedConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "cursor",
			displayName: "Cursor IDE",
			configPath: getCursorConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "windsurf",
			displayName: "Windsurf (Codeium)",
			configPath: getWindsurfConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "roocode",
			displayName: "Roo Code (VSCode Extension)",
			configPath: getRooCodeConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "claudecode",
			displayName: "Claude Code CLI",
			configPath: getClaudeCodeConfigPath(),
			detected: false,
			configExists: false,
		},
		{
			name: "amazonq",
			displayName: "Amazon Q Developer",
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
}

function readJSONConfig(path: string): Record<string, unknown> {
	try {
		if (!existsSync(path)) {
			return {};
		}

		const content = readFileSync(path, "utf-8");
		return JSON.parse(content) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function writeJSONConfig(path: string, config: Record<string, unknown>): void {
	// Ensure directory exists
	const dir = dirname(path);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	writeFileSync(path, JSON.stringify(config, null, 2), "utf-8");
}

function runClientConfigurator(
	clientLabel: string,
	configure: () => void,
): boolean {
	try {
		configure();
		return true;
	} catch (error) {
		setupLogger.error(`Failed to configure ${clientLabel}`, {
			error: getErrorMessage(error),
		});
		return false;
	}
}

function ensureMcpServersConfig(
	config: Record<string, unknown>,
): Record<string, MCPServerConfig> {
	const storedMcpServers = config["mcpServers"];

	const isMissingMcpServers = !storedMcpServers;

	if (isMissingMcpServers) {
		const emptyServers: Record<string, MCPServerConfig> = {};
		config["mcpServers"] = emptyServers;
		return emptyServers;
	}

	const isMcpServersNotObject = typeof storedMcpServers != "object";

	if (isMcpServersNotObject) {
		const emptyServers: Record<string, MCPServerConfig> = {};
		config["mcpServers"] = emptyServers;
		return emptyServers;
	}

	return storedMcpServers as Record<string, MCPServerConfig>;
}

function hasMcpServerConfig(configPath: string): boolean {
	if (!existsSync(configPath)) {
		return false;
	}

	const config = readJSONConfig(configPath);
	const mcpServers = config["mcpServers"] as
		| Record<string, MCPServerConfig>
		| undefined;

	return !!mcpServers?.["ebay-mcp-server"];
}

export function configureClaudeDesktop(projectRoot: string): boolean {
	return runClientConfigurator("Claude Desktop", () => {
		const configPath = getClaudeConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureCline(projectRoot: string): boolean {
	return runClientConfigurator("Cline", () => {
		const configPath = getClineConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureContinue(projectRoot: string): boolean {
	return runClientConfigurator("Continue.dev", () => {
		const configPath = getContinueConfigPath();
		const config = readJSONConfig(configPath);

		function ensureExperimentalSettings(): Record<string, unknown> {
			const storedExperimental = config["experimental"];

			const isMissingExperimental = !storedExperimental;

			if (isMissingExperimental) {
				const emptySettings: Record<string, unknown> = {};
				config["experimental"] = emptySettings;
				return emptySettings;
			}

			const isExperimentalNotObject = typeof storedExperimental != "object";

			if (isExperimentalNotObject) {
				const emptySettings: Record<string, unknown> = {};
				config["experimental"] = emptySettings;
				return emptySettings;
			}

			return storedExperimental as Record<string, unknown>;
		}

		function ensureProtocolServers(
			experimentalSettings: Record<string, unknown>,
		): MCPServerConfig[] {
			const storedProtocolServers =
				experimentalSettings["modelContextProtocolServers"];

			const isMissingProtocolServers = !storedProtocolServers;

			if (isMissingProtocolServers) {
				const emptyServers: MCPServerConfig[] = [];
				experimentalSettings["modelContextProtocolServers"] = emptyServers;
				return emptyServers;
			}

			const isProtocolServerList = Array.isArray(storedProtocolServers);

			if (isProtocolServerList) {
				return storedProtocolServers as MCPServerConfig[];
			}

			const emptyServers: MCPServerConfig[] = [];
			experimentalSettings["modelContextProtocolServers"] = emptyServers;
			return emptyServers;
		}

		function isConfiguredEbayServer(server: MCPServerConfig): boolean {
			const isNotNodeCommand = server.command != "node";

			if (isNotNodeCommand) {
				return false;
			}

			const isNotEbayMcpArgument = !server.args?.[0]?.includes("ebay-mcp");

			if (isNotEbayMcpArgument) {
				return false;
			}

			return true;
		}

		// Initialize experimental.modelContextProtocolServers if it doesn't exist
		const experimental = ensureExperimentalSettings();
		const mcpServers = ensureProtocolServers(experimental);

		// Check if eBay server already exists
		const existingIndex = mcpServers.findIndex(isConfiguredEbayServer);

		const serverConfig: MCPServerConfig = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		if (existingIndex >= 0) {
			mcpServers[existingIndex] = serverConfig;
		} else {
			mcpServers.push(serverConfig);
		}

		experimental["modelContextProtocolServers"] = mcpServers;
		config["experimental"] = experimental;
		writeJSONConfig(configPath, config);
	});
}

export function configureZed(projectRoot: string): boolean {
	return runClientConfigurator("Zed", () => {
		const configPath = getZedConfigPath();
		const config = readJSONConfig(configPath);

		function ensureZedServerMap(): Record<string, unknown> {
			const storedServerMap = config["context_servers"];

			const isMissingServerMap = !storedServerMap;

			if (isMissingServerMap) {
				const emptyServerMap: Record<string, unknown> = {};
				config["context_servers"] = emptyServerMap;
				return emptyServerMap;
			}

			const isServerMapNotObject = typeof storedServerMap != "object";

			if (isServerMapNotObject) {
				const emptyServerMap: Record<string, unknown> = {};
				config["context_servers"] = emptyServerMap;
				return emptyServerMap;
			}

			return storedServerMap as Record<string, unknown>;
		}

		// Initialize context_servers if it doesn't exist
		const contextServers = ensureZedServerMap();

		// Add or update eBay MCP server configuration
		contextServers["ebay-mcp-server"] = {
			command: {
				path: "node",
				args: [join(projectRoot, "build", "index.js")],
			},
			settings: {},
		};

		config["context_servers"] = contextServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureCursor(projectRoot: string): boolean {
	return runClientConfigurator("Cursor", () => {
		const configPath = getCursorConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureWindsurf(projectRoot: string): boolean {
	return runClientConfigurator("Windsurf", () => {
		const configPath = getWindsurfConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureRooCode(projectRoot: string): boolean {
	return runClientConfigurator("Roo Code", () => {
		const configPath = getRooCodeConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureClaudeCode(projectRoot: string): boolean {
	return runClientConfigurator("Claude Code CLI", () => {
		const configPath = getClaudeCodeConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureAmazonQ(projectRoot: string): boolean {
	return runClientConfigurator("Amazon Q", () => {
		const configPath = getAmazonQConfigPath();
		const config = readJSONConfig(configPath);
		const mcpServers = ensureMcpServersConfig(config);

		// Add or update eBay MCP server configuration
		mcpServers["ebay-mcp-server"] = {
			command: "node",
			args: [join(projectRoot, "build", "index.js")],
		};

		config["mcpServers"] = mcpServers;
		writeJSONConfig(configPath, config);
	});
}

export function configureLLMClient(
	clientName: string,
	projectRoot: string,
): boolean {
	switch (clientName) {
		case "claude":
			return configureClaudeDesktop(projectRoot);
		case "cline":
			return configureCline(projectRoot);
		case "continue":
			return configureContinue(projectRoot);
		case "zed":
			return configureZed(projectRoot);
		case "cursor":
			return configureCursor(projectRoot);
		case "windsurf":
			return configureWindsurf(projectRoot);
		case "roocode":
			return configureRooCode(projectRoot);
		case "claudecode":
			return configureClaudeCode(projectRoot);
		case "amazonq":
			return configureAmazonQ(projectRoot);
		default:
			return false;
	}
}

export function getManualConfigInstructions(
	clientName: string,
	projectRoot: string,
): string {
	const buildPath = join(projectRoot, "build", "index.js");

	switch (clientName) {
		case "claude":
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

		case "cline":
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

		case "continue":
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

		case "zed":
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

		case "cursor":
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

		case "windsurf":
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

		case "roocode":
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

		case "claudecode":
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

		case "amazonq":
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
			return "Manual configuration instructions not available for this client.";
	}
}

export function verifyClientConfiguration(
	clientName: string,
	_projectRoot: string,
): boolean {
	try {
		switch (clientName) {
			case "claude":
				return hasMcpServerConfig(getClaudeConfigPath());

			case "cline":
				return hasMcpServerConfig(getClineConfigPath());

			case "continue": {
				const configPath = getContinueConfigPath();
				if (!existsSync(configPath)) return false;

				const config = readJSONConfig(configPath);
				const experimental = config["experimental"] as
					| Record<string, unknown>
					| undefined;
				const mcpServers = experimental?.["modelContextProtocolServers"] as
					| MCPServerConfig[]
					| undefined;

				return !!mcpServers?.some((server) =>
					server.args?.[0]?.includes("ebay-mcp-server"),
				);
			}

			case "zed": {
				const configPath = getZedConfigPath();
				if (!existsSync(configPath)) return false;

				const config = readJSONConfig(configPath);
				const contextServers = config["context_servers"] as
					| Record<string, unknown>
					| undefined;

				return !!contextServers?.["ebay-mcp-server"];
			}

			case "cursor":
				return hasMcpServerConfig(getCursorConfigPath());

			case "windsurf":
				return hasMcpServerConfig(getWindsurfConfigPath());

			case "roocode":
				return hasMcpServerConfig(getRooCodeConfigPath());

			case "claudecode":
				return hasMcpServerConfig(getClaudeCodeConfigPath());

			case "amazonq":
				return hasMcpServerConfig(getAmazonQConfigPath());

			default:
				return false;
		}
	} catch {
		return false;
	}
}

export function getAllSupportedClients(): string[] {
	return [
		"claude",
		"cline",
		"continue",
		"zed",
		"cursor",
		"windsurf",
		"roocode",
		"claudecode",
		"amazonq",
	];
}

export function supportsNativeMCP(clientName: string): boolean {
	// All these clients support MCP (Model Context Protocol)
	const supportedClients = [
		"claude",
		"cline",
		"continue",
		"zed",
		"cursor",
		"windsurf",
		"roocode",
		"claudecode",
		"amazonq",
	];
	return supportedClients.includes(clientName.toLowerCase());
}
