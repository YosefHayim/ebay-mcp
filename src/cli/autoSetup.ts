import process from "node:process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir, platform } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getErrorMessage } from "@/shared/errors.js";
import type {
	DetectedMCPClient,
	MCPServerConfig,
} from "@/shared/llmClientDetector.js";
import { loadEnvFileIfPresent } from "@/shared/load-env-file.js";
import { isRecord } from "@/shared/typeGuards.js";

loadEnvFileIfPresent();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../..");

// ═══════════════════════════════════════════════════════════════════════════
// Color Utilities
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function print(message: string, color?: keyof typeof colors): void {
	const colorCode = color ? colors[color] : "";
	console.log(`${colorCode}${message}${colors.reset}`);
}

function printSuccess(message: string): void {
	print(`✅ ${message}`, "green");
}

function printWarning(message: string): void {
	print(`⚠️  ${message}`, "yellow");
}

function printError(message: string): void {
	print(`❌ ${message}`, "red");
}

function printInfo(message: string): void {
	print(`ℹ️  ${message}`, "cyan");
}

function printHeader(message: string): void {
	print(
		"\n═══════════════════════════════════════════════════════════════════════════",
		"blue",
	);
	print(`  ${message}`, "cyan");
	print(
		"═══════════════════════════════════════════════════════════════════════════\n",
		"blue",
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP Client Detection
// ═══════════════════════════════════════════════════════════════════════════

interface MCPClient extends DetectedMCPClient {
	configGenerated?: boolean;
}

function readRecord(value: unknown): Record<string, unknown> {
	if (isRecord(value)) {
		return value;
	}
	return {};
}

function isMCPServerConfig(value: unknown): value is MCPServerConfig {
	const isNotObject = typeof value != "object";

	if (isNotObject) return false;

	const isNull = value == null;

	if (isNull) return false;

	const isArray = Array.isArray(value);

	if (isArray) return false;

	const command = Reflect.get(value, "command");
	const commandIsMissing = typeof command != "string";

	if (commandIsMissing) return false;

	return true;
}

function isClientInstalled(configPath: string): boolean {
	const hasConfigFile = existsSync(configPath);

	if (hasConfigFile) return true;

	const hasConfigDirectory = existsSync(dirname(configPath));

	if (hasConfigDirectory) return true;

	return false;
}

function needsFreshObject(field: unknown): boolean {
	const isMissing = !field;

	if (isMissing) return true;

	const isObject = typeof field == "object";

	if (isObject) return false;

	return true;
}

function isServerList(field: unknown): boolean {
	const isMissing = !field;

	if (isMissing) return false;

	const isList = Array.isArray(field);

	if (isList) return true;

	return false;
}

function isEbayNodeServer(server: MCPServerConfig): boolean {
	const isOtherCommand = server.command != "node";

	if (isOtherCommand) return false;

	const firstArgument = server.args?.[0];
	const mentionsEbayMcp = firstArgument?.includes("ebay-mcp") == true;

	if (mentionsEbayMcp) return true;

	return false;
}

function isRejectedEnvironment(environmentName: string | undefined): boolean {
	const isUnset = !environmentName;

	if (isUnset) return false;

	const isProduction = environmentName == "production";

	if (isProduction) return false;

	const isSandbox = environmentName == "sandbox";

	if (isSandbox) return false;

	return true;
}

function readMcpServerConfigArray(value: unknown): MCPServerConfig[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isMCPServerConfig);
}

function readExistingClientConfig(client: MCPClient): Record<string, unknown> {
	if (!existsSync(client.configPath)) {
		return {};
	}

	try {
		return readRecord(JSON.parse(readFileSync(client.configPath, "utf-8")));
	} catch {
		printWarning(
			`Invalid JSON in ${client.configPath}, creating backup and new config`,
		);
		const backup = `${client.configPath}.backup.${Date.now()}`;
		writeFileSync(backup, readFileSync(client.configPath));
		printInfo(`Backup saved to: ${backup}`);
		return {};
	}
}

function getAutoSetupConfigPaths(): Record<string, string> {
	const home = homedir();
	const os = platform();

	const paths: Record<string, string> = {};

	// Claude Desktop config paths
	if (os == "darwin") {
		paths["claude"] = join(
			home,
			"Library/Application Support/Claude/claude_desktop_config.json",
		);
	} else if (os == "win32") {
		paths["claude"] = join(
			home,
			"AppData/Roaming/Claude/claude_desktop_config.json",
		);
	} else {
		paths["claude"] = join(home, ".config/Claude/claude_desktop_config.json");
	}

	// Cline (VSCode Extension) config paths
	if (os == "darwin") {
		paths["cline"] = join(
			home,
			"Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
		);
	} else if (os == "win32") {
		paths["cline"] = join(
			home,
			"AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
		);
	} else {
		paths["cline"] = join(
			home,
			".config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
		);
	}

	// Continue.dev config path
	paths["continue"] = join(home, ".continue/config.json");

	// Zed editor config paths
	if (os == "darwin") {
		paths["zed"] = join(home, ".config/zed/settings.json");
	} else if (os == "win32") {
		paths["zed"] = join(home, "AppData/Roaming/Zed/settings.json");
	} else {
		paths["zed"] = join(home, ".config/zed/settings.json");
	}

	// Cursor IDE config path
	paths["cursor"] = join(home, ".cursor/mcp.json");

	// Windsurf (Codeium) config path
	paths["windsurf"] = join(home, ".codeium/windsurf/mcp_config.json");

	// Roo Code (VSCode Extension) config paths
	if (os == "darwin") {
		paths["roocode"] = join(
			home,
			"Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json",
		);
	} else if (os == "win32") {
		paths["roocode"] = join(
			home,
			"AppData/Roaming/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json",
		);
	} else {
		paths["roocode"] = join(
			home,
			".config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json",
		);
	}

	// Claude Code CLI config path
	paths["claudecode"] = join(home, ".claude.json");

	// Amazon Q Developer config path
	paths["amazonq"] = join(home, ".aws/amazonq/mcp.json");

	return paths;
}

function detectMCPClients(): MCPClient[] {
	const configPaths = getAutoSetupConfigPaths();
	const clients: MCPClient[] = [];

	for (const [name, configPath] of Object.entries(configPaths)) {
		const detected = isClientInstalled(configPath);
		clients.push({
			name,
			configPath,
			detected,
		});
	}

	return clients;
}

// ═══════════════════════════════════════════════════════════════════════════
// Configuration Generation
// ═══════════════════════════════════════════════════════════════════════════

function generateMCPServerConfig(): MCPServerConfig {
	const buildPath = join(PROJECT_ROOT, "build/index.js");

	const envConfig: Record<string, string> = {
		EBAY_CLIENT_ID: process.env["EBAY_CLIENT_ID"] || "",
		EBAY_CLIENT_SECRET: process.env["EBAY_CLIENT_SECRET"] || "",
		EBAY_ENVIRONMENT: process.env["EBAY_ENVIRONMENT"] || "sandbox",
	};
	const config: MCPServerConfig = {
		command: "node",
		args: [buildPath],
		env: envConfig,
	};

	// Add optional environment variables if they exist
	if (process.env["EBAY_REDIRECT_URI"]) {
		envConfig["EBAY_REDIRECT_URI"] = process.env["EBAY_REDIRECT_URI"];
	}
	if (process.env["EBAY_MARKETPLACE_ID"]) {
		envConfig["EBAY_MARKETPLACE_ID"] = process.env["EBAY_MARKETPLACE_ID"];
	}
	if (process.env["EBAY_CONTENT_LANGUAGE"]) {
		envConfig["EBAY_CONTENT_LANGUAGE"] = process.env["EBAY_CONTENT_LANGUAGE"];
	}

	if (process.env["EBAY_USER_ACCESS_TOKEN"]) {
		envConfig["EBAY_USER_ACCESS_TOKEN"] = process.env["EBAY_USER_ACCESS_TOKEN"];
	}

	if (process.env["EBAY_USER_REFRESH_TOKEN"]) {
		envConfig["EBAY_USER_REFRESH_TOKEN"] =
			process.env["EBAY_USER_REFRESH_TOKEN"];
	}

	if (process.env["EBAY_APP_ACCESS_TOKEN"]) {
		envConfig["EBAY_APP_ACCESS_TOKEN"] = process.env["EBAY_APP_ACCESS_TOKEN"];
	}

	return config;
}

function updateClientConfig(
	client: MCPClient,
	serverConfig: MCPServerConfig,
): boolean {
	try {
		// Ensure directory exists
		const configDir = dirname(client.configPath);
		if (!existsSync(configDir)) {
			mkdirSync(configDir, { recursive: true });
		}

		const config = readExistingClientConfig(client);

		// Handle different config formats for different clients
		switch (client.name) {
			case "zed": {
				// Zed uses context_servers with a different structure
				const contextServersField = config["context_servers"];
				const needsContextServers = needsFreshObject(contextServersField);

				if (needsContextServers) {
					config["context_servers"] = {};
				}
				const contextServers = readRecord(config["context_servers"]);
				contextServers["ebay-mcp-server"] = {
					command: {
						path: serverConfig.command,
						args: serverConfig.args,
						env: serverConfig.env,
					},
					settings: {},
				};
				config["context_servers"] = contextServers;
				break;
			}

			case "continue": {
				// Continue.dev uses experimental.modelContextProtocolServers as an array
				const experimentalField = config["experimental"];
				const needsExperimental = needsFreshObject(experimentalField);

				if (needsExperimental) {
					config["experimental"] = {};
				}
				const experimental = readRecord(config["experimental"]);
				const serversField = experimental["modelContextProtocolServers"];
				const hasServerList = isServerList(serversField);
				const needsServerList = hasServerList == false;

				if (needsServerList) {
					experimental["modelContextProtocolServers"] = [];
				}
				const mcpServers = readMcpServerConfigArray(
					experimental["modelContextProtocolServers"],
				);

				// Check if eBay server already exists and update/add
				const existingIndex = mcpServers.findIndex(isEbayNodeServer);
				if (existingIndex >= 0) {
					mcpServers[existingIndex] = serverConfig;
				} else {
					mcpServers.push(serverConfig);
				}
				experimental["modelContextProtocolServers"] = mcpServers;
				config["experimental"] = experimental;
				break;
			}

			default: {
				// Standard mcpServers format for Claude Desktop, Cline, Cursor, Windsurf, Roo Code, Claude Code CLI, Amazon Q
				const mcpServersField = config["mcpServers"];
				const needsMcpServers = needsFreshObject(mcpServersField);

				if (needsMcpServers) {
					config["mcpServers"] = {};
				}
				const mcpServers = readRecord(config["mcpServers"]);
				mcpServers["ebay-mcp-server"] = serverConfig;
				config["mcpServers"] = mcpServers;
				break;
			}
		}

		// Write config
		writeFileSync(client.configPath, JSON.stringify(config, null, 2));
	} catch (error) {
		printError(
			`Failed to update ${client.name} config: ${getErrorMessage(error)}`,
		);
		return false;
	}

	return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Validation (Environment-based only)
// ═══════════════════════════════════════════════════════════════════════════

function validateTokens(): boolean {
	// Check if user refresh token is provided in .env
	const hasUserRefreshToken = process.env["EBAY_USER_REFRESH_TOKEN"];

	if (!hasUserRefreshToken) {
		printInfo(
			"No EBAY_USER_REFRESH_TOKEN in .env - will use app tokens (1k req/day)",
		);
		printInfo(
			"For higher rate limits (10k-50k req/day), add EBAY_USER_REFRESH_TOKEN to .env",
		);
		return true; // Not an error, just informational
	}

	printSuccess("User refresh token found in .env - high rate limits enabled");
	return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════════════════════

function validateAutoSetupEnvironment(): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check .env file exists
	const envPath = join(PROJECT_ROOT, ".env");
	if (!existsSync(envPath)) {
		errors.push(
			".env file not found. Copy .env.example to .env and fill in your credentials.",
		);
		return { valid: false, errors, warnings };
	}

	// Check required variables
	if (!process.env["EBAY_CLIENT_ID"]) {
		errors.push("EBAY_CLIENT_ID is not set in .env");
	}

	if (!process.env["EBAY_CLIENT_SECRET"]) {
		errors.push("EBAY_CLIENT_SECRET is not set in .env");
	}

	const environment = process.env["EBAY_ENVIRONMENT"];
	const environmentIsInvalid = isRejectedEnvironment(environment);

	if (environmentIsInvalid) {
		errors.push(
			`EBAY_ENVIRONMENT must be "production" or "sandbox", got: "${environment}"`,
		);
	}

	if (!process.env["EBAY_REDIRECT_URI"]) {
		warnings.push(
			"EBAY_REDIRECT_URI is not set - user OAuth flow will not work. This is required for 10k-50k req/day rate limits.",
		);
	}

	// Check build directory exists
	const buildPath = join(PROJECT_ROOT, "build/index.js");
	if (!existsSync(buildPath)) {
		warnings.push('Build directory not found. Run "npm run build" first.');
	}

	return {
		valid: errors.length == 0,
		errors,
		warnings,
	};
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

function main(): void {
	printHeader("eBay API MCP Server - Auto Setup");

	// Step 1: Validate environment
	printInfo("Step 1/4: Validating environment configuration...");
	const validation = validateAutoSetupEnvironment();

	if (validation.errors.length > 0) {
		printError("Environment validation failed:");
		for (const error of validation.errors) {
			print(`  • ${error}`, "red");
		}
		print("\nPlease fix these errors and run again.", "yellow");
		process.exit(1);
	}

	if (validation.warnings.length > 0) {
		for (const warning of validation.warnings) {
			printWarning(warning);
		}
	}

	printSuccess("Environment validation passed");

	// Step 2: Detect MCP clients
	print("\nStep 2/4: Detecting installed MCP clients...");
	const clients = detectMCPClients();
	const detectedClients = clients.filter((client) => client.detected);

	if (detectedClients.length == 0) {
		printWarning("No MCP clients detected on this system");
		printInfo(
			"Supported clients: Claude Desktop, Cline, Continue.dev, Zed, Cursor, Windsurf, Roo Code, Claude Code CLI, Amazon Q",
		);
		printInfo("Install a client and run this script again");
	} else {
		printSuccess(`Detected ${detectedClients.length} MCP client(s):`);
		detectedClients.forEach((client) => {
			print(
				`  • ${client.name.charAt(0).toUpperCase() + client.name.slice(1)}`,
				"green",
			);
		});
	}

	// Step 3: Generate configurations
	if (detectedClients.length > 0) {
		print("\nStep 3/4: Generating MCP client configurations...");
		const serverConfig = generateMCPServerConfig();

		for (const client of detectedClients) {
			const success = updateClientConfig(client, serverConfig);
			if (success) {
				printSuccess(
					`Generated config for ${client.name} at: ${client.configPath}`,
				);
				client.configGenerated = true;
			}
		}
	} else {
		print("\nStep 3/4: Skipping config generation (no clients detected)");
	}

	// Step 4: Validate tokens
	print("\nStep 4/4: Validating token configuration...");
	validateTokens();

	// Final summary
	printHeader("Setup Complete! 🎉");

	const generatedCount = detectedClients.filter(
		(client) => client.configGenerated,
	).length;

	if (generatedCount > 0) {
		printSuccess(`Successfully configured ${generatedCount} MCP client(s)`);
		print("\n📝 Next Steps:", "cyan");
		print("  1. Restart your MCP clients (Claude Desktop, Cursor, Zed, etc.)");
		print("  2. Verify connection in MCP client settings/logs");
		print('  3. Test with: "List my eBay inventory items"');

		if (
			validation.warnings.some((warning) =>
				warning.includes("EBAY_REDIRECT_URI"),
			)
		) {
			print("\n💡 Pro Tip:", "yellow");
			print(
				"  Add EBAY_REDIRECT_URI to .env for user OAuth (10k-50k req/day rate limits)",
			);
		}
	} else {
		printInfo("No configurations generated (no MCP clients detected)");
		print("\n📝 To complete setup:", "cyan");
		print(
			"  1. Install an MCP client (Claude Desktop, Cline, Cursor, Zed, Windsurf, Continue.dev, Roo Code, Claude Code CLI, or Amazon Q)",
		);
		print("  2. Run: npm run autoSetup");
	}

	print("\n📚 Documentation: https://github.com/YosefHayim/ebay-mcp#readme\n");
}

// Run the script
main();
