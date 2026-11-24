/**
 * Interactive Setup for eBay API MCP Server - Complete Optimized Version
 *
 * Features:
 * - Pre-flight security checks
 * - First-time developer guidance
 * - Interactive OAuth flow with local callback server
 * - Scope selection and verification
 * - Auto-generate access tokens
 * - Multi-environment support
 * - Enhanced LLM client detection and configuration
 * - Docker setup option
 * - Post-setup quick start guide
 *
 * Usage:
 *   npx ebay-mcp                         Interactive setup wizard
 *   npx ebay-mcp --help                  Show help
 *   npx ebay-mcp --diagnose              Run diagnostics
 *   npx ebay-mcp --first-time            First-time developer guide
 */

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable n/no-process-exit */

import process from "node:process";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { EbayOAuthClient } from "@/auth/oauth.js";
import {
	displayFirstTimeDeveloperGuide,
	displayManualOAuthInstructions,
	getRuNameHelp,
	interactiveOAuthFlow,
} from "@/auth/oauthHelper.js";
import {
	displayScopeCategories,
	displayScopeVerification,
	getRecommendedScopes,
} from "@/cli/scopeHelper.js";
import {
	displaySecurityResults,
	hasCriticalFailures,
	runSecurityChecks,
} from "@/cli/securityChecker.js";
import { displayRecommendations, validateSetup } from "@/cli/setupValidator.js";
import {
	type AskChoice,
	askConfirm,
	askMultiselect,
	askSelect,
	askText,
} from "@/cli/setupWizard.js";
import { EbaySellerApi } from "@/ebay-apis/ebaySellerApi.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { getErrorMessage } from "@/shared/errors.js";
import {
	configureLLMClient,
	detectLLMClients,
	type LLMClient,
} from "@/shared/llmClientDetector.js";
import { paint } from "@/shared/paint.js";
import { loadExistingConfig, readEnvironment } from "./setupShared.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../..");

// ═══════════════════════════════════════════════════════════════════════════
// eBay Brand Colors
// ═══════════════════════════════════════════════════════════════════════════

const ebayColors = {
	red: paint.hex("#E53238"),
	blue: paint.hex("#0064D2"),
	yellow: paint.hex("#F5AF02"),
	green: paint.hex("#85B716"),
};

// ═══════════════════════════════════════════════════════════════════════════
// CLI Arguments
// ═══════════════════════════════════════════════════════════════════════════

interface CLIArgs {
	help: boolean;
	diagnose: boolean;
	firstTime: boolean;
	skipChecks: boolean;
	environment?: "sandbox" | "production" | undefined;
}

function readOptionalEnvironment(
	rawEnvironment?: string,
): "sandbox" | "production" | undefined {
	if (!rawEnvironment) {
		return;
	}
	return readEnvironment(rawEnvironment);
}

function parseInteractiveArgs(): CLIArgs {
	const args = process.argv.slice(2);
	const envArg = args.find((arg) => arg.startsWith("--env="));

	return {
		help: args.includes("--help") || args.includes("-h"),
		diagnose: args.includes("--diagnose") || args.includes("-d"),
		firstTime: args.includes("--first-time") || args.includes("-f"),
		skipChecks: args.includes("--skip-checks"),
		environment: readOptionalEnvironment(envArg?.split("=")[1]),
	};
}

function showInteractiveHelp() {
	console.log(paint.bold.cyan("\n📖 eBay API MCP Server Setup Help\n"));
	console.log(paint.white("Usage:"));
	console.log(paint.gray("  npx ebay-mcp [options]\n"));
	console.log(paint.white("Options:"));
	console.log(
		paint.yellow("  --help, -h           ") +
			paint.gray("Show this help message"),
	);
	console.log(
		paint.yellow("  --diagnose, -d       ") +
			paint.gray("Run system diagnostics"),
	);
	console.log(
		paint.yellow("  --first-time, -f     ") +
			paint.gray("Show first-time developer guide"),
	);
	console.log(
		paint.yellow("  --skip-checks        ") +
			paint.gray("Skip pre-flight security checks"),
	);
	console.log(
		paint.yellow("  --env=ENV            ") +
			paint.gray("Set environment (sandbox|production)"),
	);
	console.log(
		paint.yellow("  (no options)         ") +
			paint.gray("Run interactive setup wizard\n"),
	);
	console.log(paint.white("Examples:"));
	console.log(
		paint.gray("  npx ebay-mcp                     # Interactive wizard"),
	);
	console.log(
		paint.gray("  npx ebay-mcp --first-time        # First-time guide"),
	);
	console.log(
		paint.gray("  npx ebay-mcp --diagnose          # Run diagnostics"),
	);
	console.log(
		paint.gray("  npx ebay-mcp --env=production    # Setup for production\n"),
	);
	console.log(paint.white("Learn more:"));
	console.log(paint.blue("  https://github.com/YosefHayim/ebay-mcp#readme\n"));
}

// ═══════════════════════════════════════════════════════════════════════════
// eBay Logo and Branding
// ═══════════════════════════════════════════════════════════════════════════

function createClickableLink(text: string, url: string): string {
	return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
}

const EBAY_LOGO = `
   ${ebayColors.red("███████╗")}${ebayColors.blue("██████╗ ")} ${ebayColors.yellow("█████╗ ")}${ebayColors.green("██╗   ██╗")}
   ${ebayColors.red("██╔════╝")}${ebayColors.blue("██╔══██╗")}${ebayColors.yellow("██╔══██╗")}${ebayColors.green("╚██╗ ██╔╝")}
   ${ebayColors.red("█████╗  ")}${ebayColors.blue("██████╔╝")}${ebayColors.yellow("███████║")}${ebayColors.green(" ╚████╔╝ ")}
   ${ebayColors.red("██╔══╝  ")}${ebayColors.blue("██╔══██╗")}${ebayColors.yellow("██╔══██║")}${ebayColors.green("  ╚██╔╝  ")}
   ${ebayColors.red("███████╗")}${ebayColors.blue("██████╔╝")}${ebayColors.yellow("██║  ██║")}${ebayColors.green("   ██║   ")}
   ${ebayColors.red("╚══════╝")}${ebayColors.blue("╚═════╝ ")}${ebayColors.yellow("╚═╝  ╚═╝")}${ebayColors.green("   ╚═╝   ")}

            ${paint.bold.white("API MCP Server Setup")}
`;

const CREATOR_CREDIT = `
   Creator: ${paint.bold("YosefHayim")}
   ${createClickableLink(paint.underline("linkedin.com/in/yosef-hayim-sabag"), "https://www.linkedin.com/in/yosef-hayim-sabag/")}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

function displayLogo() {
	console.clear();
	console.log(EBAY_LOGO);
	console.log(CREATOR_CREDIT);
}

function validateRequired(input: string): boolean | string {
	return input.trim().length > 0 || "This field is required";
}

// Drops one pair of wrapping quotes around a pasted token.
function stripWrappedQuotes(token: string): string {
	return token.trim().replace(/^["']|["']$/g, "");
}

function validateRefreshToken(token: string): true | string {
	const isBlank = token.trim() === "";

	if (isBlank) {
		return "Refresh token is required";
	}

	const cleanToken = stripWrappedQuotes(token);
	const hasTokenPrefix = cleanToken.startsWith("v^1.1#");

	if (!hasTokenPrefix) {
		return 'Token should start with "v^1.1#"';
	}

	return true;
}

function describeDetectedClient(client: LLMClient): AskChoice {
	const isAlreadyConfigured = client.configExists === true;
	const labelSuffix = isAlreadyConfigured
		? paint.yellow(" [Already configured]")
		: paint.green(" [Recommended]");

	return {
		label: client.displayName + labelSuffix,
		value: client.name,
		selected: isAlreadyConfigured === false,
	};
}

interface EbayCredentialAnswers {
	clientId: string | undefined;
	clientSecret: string | undefined;
	redirectUri: string | undefined;
}

async function askEbayCredentials(
	existingConfig: Record<string, string>,
): Promise<EbayCredentialAnswers> {
	const clientIdAnswer = await askText({
		message: "eBay Client ID (App ID):",
		initial: existingConfig["EBAY_CLIENT_ID"] ?? "",
		validate: validateRequired,
	});
	const clientId = clientIdAnswer.value;
	const isClientIdMissing = clientId === undefined;

	if (isClientIdMissing) {
		return {
			clientId: undefined,
			clientSecret: undefined,
			redirectUri: undefined,
		};
	}

	const clientSecretAnswer = await askText({
		message: "eBay Client Secret (Cert ID):",
		initial: existingConfig["EBAY_CLIENT_SECRET"] ?? "",
		validate: validateRequired,
	});
	const clientSecret = clientSecretAnswer.value;
	const isClientSecretMissing = clientSecret === undefined;

	if (isClientSecretMissing) {
		return {
			clientId,
			clientSecret: undefined,
			redirectUri: undefined,
		};
	}

	const redirectAnswer = await askText({
		message: "eBay Redirect URI (RuName):",
		initial:
			existingConfig["EBAY_REDIRECT_URI"] ??
			"http://localhost:3000/oauth/callback",
		validate: validateRequired,
	});

	return {
		clientId,
		clientSecret,
		redirectUri: redirectAnswer.value,
	};
}

function generateEnvFile(
	config: Record<string, string>,
	environment: string,
): void {
	const envPath = join(
		PROJECT_ROOT,
		`.env${environment === "sandbox" ? "" : `.${environment}`}`,
	);

	const content = `# eBay API MCP Server Configuration
# Generated on ${new Date().toISOString()}
# Environment: ${environment}

# ═══════════════════════════════════════════════════════════════════
# eBay App Credentials (Required)
# ═══════════════════════════════════════════════════════════════════

EBAY_CLIENT_ID=${config["EBAY_CLIENT_ID"] || "your_client_id_here"}
EBAY_CLIENT_SECRET=${config["EBAY_CLIENT_SECRET"] || "your_client_secret_here"}
EBAY_REDIRECT_URI=${config["EBAY_REDIRECT_URI"] || "http://localhost:3000/oauth/callback"}

# ═══════════════════════════════════════════════════════════════════
# Environment (sandbox or production)
# ═══════════════════════════════════════════════════════════════════

EBAY_ENVIRONMENT=${config["EBAY_ENVIRONMENT"] || "sandbox"}
# Optional: e.g. EBAY_US, EBAY_DE, EBAY_FR
EBAY_MARKETPLACE_ID=${config["EBAY_MARKETPLACE_ID"] || ""}
# Optional: e.g. en-US, de-DE, fr-FR
EBAY_CONTENT_LANGUAGE=${config["EBAY_CONTENT_LANGUAGE"] || ""}

# ═══════════════════════════════════════════════════════════════════
# User Tokens (Auto-generated from refresh token)
# ═══════════════════════════════════════════════════════════════════
# The refresh token is the only token you need to provide manually.
# Access tokens are automatically generated and refreshed.

EBAY_USER_REFRESH_TOKEN=${config["EBAY_USER_REFRESH_TOKEN"] || ""}
EBAY_USER_ACCESS_TOKEN=${config["EBAY_USER_ACCESS_TOKEN"] || ""}
EBAY_APP_ACCESS_TOKEN=${config["EBAY_APP_ACCESS_TOKEN"] || ""}

# ═══════════════════════════════════════════════════════════════════
# Logging (Optional)
# ═══════════════════════════════════════════════════════════════════
LOG_LEVEL=${config["LOG_LEVEL"] || "info"}
`;

	writeFileSync(envPath, content, "utf-8");
	console.log(paint.green(`✓ Configuration saved to ${envPath}`));
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Acquisition & Validation
// ═══════════════════════════════════════════════════════════════════════════

async function acquireRefreshToken(
	config: EbayConfig,
	useInteractiveFlow: boolean,
): Promise<string | null> {
	if (useInteractiveFlow) {
		console.log(paint.bold.cyan("\n🔐 Starting Interactive OAuth Flow\n"));

		const scopes = getRecommendedScopes(config.environment);
		const authCode = await interactiveOAuthFlow(config, scopes);

		if (!authCode) {
			return null;
		}

		// Exchange code for tokens
		console.log(
			paint.cyan("\n🔄 Exchanging authorization code for tokens...\n"),
		);

		try {
			const oauthClient = new EbayOAuthClient(config);
			const tokenData = await oauthClient.exchangeCodeForToken(authCode);
			console.log(paint.green("✓ Successfully obtained tokens!\n"));
			return tokenData.refresh_token;
		} catch (error) {
			console.log(
				paint.red(
					`✗ Failed to exchange code: ${getErrorMessage(error, String(error))}\n`,
				),
			);
			return null;
		}
	}
	// Manual flow
	displayManualOAuthInstructions(
		config.clientId,
		config.redirectUri || "http://localhost:3000/oauth/callback",
		config.environment,
		getRecommendedScopes(config.environment),
	);

	const pastedToken = await askText({
		message: "Paste your refresh token here:",
		validate: validateRefreshToken,
	});
	const refreshToken = pastedToken.value;
	const isTokenMissing = refreshToken === undefined;

	if (isTokenMissing) {
		return null;
	}

	return stripWrappedQuotes(refreshToken);
}

async function validateAndGenerateTokens(
	config: Record<string, string>,
): Promise<boolean> {
	console.log(
		paint.bold.cyan("\n🔄 Validating Credentials & Generating Tokens...\n"),
	);

	try {
		const clientId = config["EBAY_CLIENT_ID"];
		const clientSecret = config["EBAY_CLIENT_SECRET"];
		const isClientIdMissing = clientId == null;

		if (isClientIdMissing) {
			return false;
		}

		const isClientSecretMissing = clientSecret == null;

		if (isClientSecretMissing) {
			return false;
		}

		const ebayConfig: EbayConfig = {
			clientId,
			clientSecret,
			redirectUri: config["EBAY_REDIRECT_URI"],
			environment: readEnvironment(config["EBAY_ENVIRONMENT"]),
			accessToken: config["EBAY_USER_ACCESS_TOKEN"],
			refreshToken: config["EBAY_USER_REFRESH_TOKEN"],
		};

		const oauthClient = new EbayOAuthClient(ebayConfig);

		if (config["EBAY_USER_REFRESH_TOKEN"]) {
			console.log(paint.cyan("  → Initializing OAuth client..."));
			await oauthClient.initialize();

			console.log(
				paint.cyan("  → Refreshing access token from refresh token..."),
			);
			const accessToken = await oauthClient.getAccessToken();

			config["EBAY_USER_ACCESS_TOKEN"] = accessToken;
			console.log(paint.green("  ✓ Access token generated successfully"));

			console.log(paint.cyan("  → Generating app access token..."));
			const appToken = await oauthClient.getOrRefreshAppAccessToken();
			config["EBAY_APP_ACCESS_TOKEN"] = appToken;
			console.log(paint.green("  ✓ App access token generated successfully"));

			console.log(
				paint.cyan("  → Verifying credentials with eBay Identity API..."),
			);
			const api = new EbaySellerApi({
				...ebayConfig,
				accessToken,
				appAccessToken: appToken,
			});
			await api.initialize();

			const userInfo = await api.identity.getUser();
			if (userInfo) {
				console.log(paint.green("\n✓ Successfully validated credentials!\n"));
				console.log(paint.bold.white("📋 Your eBay Account Information:\n"));
				console.log(userInfo);
				console.log("");
			}

			const authClient = api.getAuthClient();
			const tokenInfo = authClient.getTokenInfo();
			if (tokenInfo.scopeInfo) {
				displayScopeVerification(
					tokenInfo.scopeInfo.tokenScopes,
					ebayConfig.environment,
				);
			}

			return true;
		}

		console.log(
			paint.yellow("⚠️  No refresh token provided, skipping validation\n"),
		);
		return false;
	} catch (error) {
		const message = getErrorMessage(error, String(error));

		console.log(paint.red("\n✗ Validation failed\n"));
		console.log(paint.yellow(`  Error: ${message}\n`));

		if (message.includes("401") || message.includes("Unauthorized")) {
			console.log(paint.gray("  Possible causes:"));
			console.log(paint.gray("    • Invalid or expired refresh token"));
			console.log(
				paint.gray(
					"    • Token from different environment (sandbox vs production)",
				),
			);
			console.log(paint.gray("    • Incorrect client credentials\n"));
		}

		const retry = await askConfirm({
			message: "Would you like to retry with different credentials?",
			initial: true,
		});

		return retry.value === true;
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM Client Detection and Configuration
// ═══════════════════════════════════════════════════════════════════════════

async function detectAndConfigureLLMClients(): Promise<void> {
	console.log(
		paint.bold.cyan(
			"\n┌─────────────────────────────────────────────────────────────┐",
		),
	);
	console.log(
		paint.bold.cyan(
			"│  🤖 LLM Client Detection & Configuration                   │",
		),
	);
	console.log(
		paint.bold.cyan(
			"└─────────────────────────────────────────────────────────────┘\n",
		),
	);

	const clients = detectLLMClients();
	const detectedClients = clients.filter((client) => client.detected);

	if (detectedClients.length === 0) {
		console.log(
			paint.yellow("⚠️  No compatible LLM clients detected on your system.\n"),
		);
		console.log(paint.white("Supported clients:"));
		console.log(paint.gray("  • Claude Desktop    (Anthropic's desktop app)"));
		console.log(paint.gray("  • Cline             (VSCode extension)"));
		console.log(
			paint.gray("  • Continue.dev      (VSCode/JetBrains extension)\n"),
		);
		console.log(
			paint.cyan("💡 You can manually configure your MCP client later."),
		);
		console.log(
			paint.gray("   See: https://github.com/YosefHayim/ebay-mcp#setup\n"),
		);
		return;
	}

	const clientCount = detectedClients.length;
	const plural = clientCount === 1 ? "client" : "clients";
	console.log(
		paint.green.bold(
			`✓ Found ${clientCount} compatible ${plural} on your system:\n`,
		),
	);

	// Display each client in a nice box
	for (const client of detectedClients) {
		const boxWidth = 61;
		const topBorder =
			paint.gray("┌─") +
			paint.white(client.displayName) +
			paint.gray("─".repeat(boxWidth - client.displayName.length - 3) + "┐");

		console.log(topBorder);

		// Status line
		const statusIcon = paint.green("✓");
		const statusText = "Installed";
		console.log(
			paint.gray("│ ") +
				paint.gray("Status:    ") +
				statusIcon +
				" " +
				paint.white(statusText) +
				" ".repeat(boxWidth - 23) +
				paint.gray("│"),
		);

		// Config status line
		const configIcon = client.configExists
			? paint.yellow("⚠")
			: paint.gray("○");
		const configText = client.configExists
			? paint.yellow("Already configured")
			: paint.gray("Not configured");
		const configPadding = client.configExists ? 39 : 43;
		console.log(
			paint.gray("│ ") +
				paint.gray("Config:    ") +
				configIcon +
				" " +
				configText +
				" ".repeat(boxWidth - configPadding) +
				paint.gray("│"),
		);

		// Path line (truncated if too long)
		const maxPathLength = boxWidth - 14;
		let displayPath = client.configPath;
		if (displayPath.length > maxPathLength) {
			displayPath =
				"..." + displayPath.substring(displayPath.length - maxPathLength + 3);
		}
		console.log(
			paint.gray("│ ") +
				paint.gray("Path:      ") +
				paint.dim(displayPath) +
				" ".repeat(boxWidth - displayPath.length - 13) +
				paint.gray("│"),
		);

		console.log(paint.gray("└" + "─".repeat(boxWidth - 1) + "┘\n"));
	}

	// Ask user which clients to configure
	console.log(paint.white.bold("Configure eBay MCP for these clients?\n"));
	console.log(
		paint.gray("  💡 Recommended: Select clients that are ") +
			paint.yellow("not configured") +
			paint.gray(" yet"),
	);
	console.log(
		paint.gray("  📝 Enter numbers separated by commas, or press ") +
			paint.cyan("Enter") +
			paint.gray(" to keep the recommended ones\n"),
	);

	const clientSelection = await askMultiselect({
		message: "Select clients to configure:",
		choices: detectedClients.map(describeDetectedClient),
	});
	const selectedClients = clientSelection.value ?? [];
	const isNoneSelected = selectedClients.length === 0;

	if (isNoneSelected) {
		console.log(paint.gray("\n⏭️  Skipping LLM client configuration.\n"));
		return;
	}

	// Configure selected clients
	console.log(
		paint.bold.cyan(
			"\n┌─────────────────────────────────────────────────────────────┐",
		),
	);
	console.log(
		paint.bold.cyan(
			"│  ⚙️  Configuring Selected Clients                           │",
		),
	);
	console.log(
		paint.bold.cyan(
			"└─────────────────────────────────────────────────────────────┘\n",
		),
	);

	for (const clientName of selectedClients) {
		const client = detectedClients.find(
			(detected) => detected.name === clientName,
		);
		if (!client) continue;

		console.log(paint.cyan(`Configuring ${client.displayName}...`));

		const success = configureLLMClient(clientName, PROJECT_ROOT);

		if (success) {
			console.log(
				paint.green(`  ✓ Successfully configured ${client.displayName}`),
			);
			console.log(paint.gray(`  📁 Config file: ${client.configPath}`));
			console.log(paint.dim("  🔗 MCP server added to configuration\n"));
		} else {
			console.log(paint.red(`  ✗ Failed to configure ${client.displayName}`));
			console.log(paint.yellow("  ⚠️  Manual setup required"));
			console.log(paint.gray(`  📄 Config path: ${client.configPath}\n`));
		}
	}

	// Success message
	console.log(paint.bold.green("✨ LLM client configuration complete!\n"));
	console.log(paint.white.bold("📌 Next Steps:\n"));
	console.log(
		paint.gray("  1. ") +
			paint.white("Restart") +
			paint.gray(" your LLM client(s) to load the new configuration"),
	);
	console.log(
		paint.gray("  2. The ") +
			paint.cyan("eBay MCP server") +
			paint.gray(" should appear in the MCP tools list"),
	);
	console.log(
		paint.gray("  3. Try asking: ") +
			paint.cyan('"Show me my eBay user information"') +
			paint.gray("\n"),
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// Docker Setup
// ═══════════════════════════════════════════════════════════════════════════

async function setupDocker(): Promise<void> {
	const wantDocker = await askConfirm({
		message: "Would you like to generate Docker configuration?",
		initial: false,
	});
	const skipsDocker = wantDocker.value !== true;

	if (skipsDocker) {
		return;
	}

	console.log(paint.bold.cyan("\n🐳 Generating Docker Configuration...\n"));

	const dockerComposePath = join(PROJECT_ROOT, "docker-compose.yml");
	const dockerComposeContent = `version: '3.8'

services:
  ebay-mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ebay-mcp-server
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs
    networks:
      - ebay-mcp-network

networks:
  ebay-mcp-network:
    driver: bridge
`;

	writeFileSync(dockerComposePath, dockerComposeContent, "utf-8");
	console.log(paint.green("  ✓ Generated docker-compose.yml"));

	console.log(paint.bold.white("\n📖 Docker Usage:\n"));
	console.log(
		paint.gray("  Build and start:   ") + paint.cyan("docker-compose up -d"),
	);
	console.log(
		paint.gray("  View logs:         ") + paint.cyan("docker-compose logs -f"),
	);
	console.log(
		paint.gray("  Stop:              ") + paint.cyan("docker-compose down"),
	);
	console.log(
		paint.gray("  Rebuild:           ") +
			paint.cyan("docker-compose up -d --build\n"),
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// Post-Setup Quick Start
// ═══════════════════════════════════════════════════════════════════════════

function displayQuickStart(): void {
	console.log(paint.bold.cyan("\n🚀 Quick Start Guide\n"));

	console.log(paint.bold.white("Try these commands in your LLM client:\n"));
	console.log(paint.cyan('  💬 "Get my eBay user info"'));
	console.log(paint.cyan('  📦 "Show my active inventory listings"'));
	console.log(paint.cyan('  📊 "Get my sales analytics for this month"'));
	console.log(paint.cyan('  🎯 "Help me create a new listing"\n'));

	console.log(paint.bold.white("Available Tools:\n"));
	console.log(paint.gray("  • 230+ eBay API tools across 8 categories"));
	console.log(paint.gray("  • Inventory Management"));
	console.log(paint.gray("  • Order Fulfillment"));
	console.log(paint.gray("  • Marketing & Promotions"));
	console.log(paint.gray("  • Analytics & Reports"));
	console.log(paint.gray("  • And more...\n"));

	console.log(paint.bold.white("Resources:\n"));
	console.log(
		paint.gray("  📖 Documentation: ") +
			paint.blue.underline("https://github.com/YosefHayim/ebay-mcp#readme"),
	);
	console.log(
		paint.gray("  🐛 Report Issues:  ") +
			paint.blue.underline("https://github.com/YosefHayim/ebay-mcp/issues"),
	);
	console.log(
		paint.gray("  💬 Get Support:    ") +
			paint.blue.underline(
				"https://github.com/YosefHayim/ebay-mcp/discussions\n",
			),
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Setup Flow
// ═══════════════════════════════════════════════════════════════════════════

async function runInteractiveSetup(args: CLIArgs) {
	displayLogo();

	// Pre-flight security checks
	if (!args.skipChecks) {
		console.log(
			paint.bold.cyan("\n🔒 Running Pre-Flight Security Checks...\n"),
		);
		const securityResults = await runSecurityChecks(PROJECT_ROOT);
		displaySecurityResults(securityResults);

		if (hasCriticalFailures(securityResults)) {
			const continueAnyway = await askConfirm({
				message: "Critical issues found. Continue anyway?",
				initial: false,
			});
			const stopsSetup = continueAnyway.value !== true;

			if (stopsSetup) {
				console.log(
					paint.yellow(
						"\n⚠️  Setup cancelled. Please fix critical issues first.\n",
					),
				);
				process.exit(1);
			}
		}
	}

	// Check if user needs first-time guide
	const existingConfig = loadExistingConfig(PROJECT_ROOT);
	const hasExisting = Object.keys(existingConfig).length > 0;

	if (hasExisting) {
		console.log(paint.cyan("\n📋 Found existing configuration.\n"));
	} else {
		const needsGuide = await askConfirm({
			message: "Is this your first time setting up eBay Developer credentials?",
			initial: false,
		});
		const wantsGuide = needsGuide.value === true;

		if (wantsGuide) {
			displayFirstTimeDeveloperGuide();
			await askText({
				message: "Press Enter when ready to continue...",
			});
			console.clear();
			displayLogo();
		}
	}

	// Environment selection
	let environment =
		args.environment || existingConfig["EBAY_ENVIRONMENT"] || "sandbox";

	if (!args.environment) {
		const environmentInitial = environment === "production" ? 1 : 0;
		const envResponse = await askSelect({
			message: "Select eBay environment:",
			choices: [
				{ label: "🧪 Sandbox (Development & Testing)", value: "sandbox" },
				{ label: "🚀 Production (Live Trading)", value: "production" },
			],
			initial: environmentInitial,
		});
		const pickedEnvironment = envResponse.value;
		const isEnvironmentMissing = pickedEnvironment === undefined;

		if (isEnvironmentMissing) {
			console.log(paint.yellow("\n⚠️  Setup cancelled.\n"));
			process.exit(0);
		}

		environment = pickedEnvironment;
	}

	console.log(
		paint.bold.cyan(`\n⚙️  Setting up for: ${environment.toUpperCase()}\n`),
	);

	// Collect credentials
	const credentialAnswers = await askEbayCredentials(existingConfig);
	const clientId = credentialAnswers.clientId;
	const isClientIdMissing = clientId === undefined;

	if (isClientIdMissing) {
		console.log(paint.yellow("\n⚠️  Setup cancelled.\n"));
		process.exit(0);
	}

	const credentials = {
		EBAY_CLIENT_ID: clientId,
		EBAY_CLIENT_SECRET: credentialAnswers.clientSecret ?? "",
		EBAY_REDIRECT_URI: credentialAnswers.redirectUri ?? "",
	};

	// Need help with RuName?
	const needsRuNameHelp = await askConfirm({
		message: "Need help understanding RuName (Redirect URI)?",
		initial: false,
	});
	const wantsRuNameHelp = needsRuNameHelp.value === true;

	if (wantsRuNameHelp) {
		console.log(getRuNameHelp());
		await askText({
			message: "Press Enter to continue...",
		});
	}

	// Token acquisition
	console.log(paint.bold.cyan("\n🔑 User Token Setup\n"));
	console.log(
		paint.white("You need a refresh token to access user-specific APIs.\n"),
	);

	// Show scope information
	const viewScopes = await askConfirm({
		message: "Would you like to see available OAuth scopes?",
		initial: false,
	});
	const wantsScopes = viewScopes.value === true;

	if (wantsScopes) {
		displayScopeCategories();
	}

	const tokenMethod = await askSelect({
		message: "How would you like to obtain your refresh token?",
		choices: [
			{
				label: "🔄 Interactive OAuth Flow (Recommended)",
				value: "interactive",
			},
			{ label: "📝 Manual OAuth Flow (I'll get it myself)", value: "manual" },
			{ label: "✏️  I already have a refresh token", value: "existing" },
			{ label: "⏭️  Skip (configure later)", value: "skip" },
		],
		initial: 0,
	});

	let refreshToken = existingConfig["EBAY_USER_REFRESH_TOKEN"] || "";

	const ebayConfig: EbayConfig = {
		clientId: credentials.EBAY_CLIENT_ID,
		clientSecret: credentials.EBAY_CLIENT_SECRET,
		redirectUri: credentials.EBAY_REDIRECT_URI,
		environment: readEnvironment(environment),
	};

	const method = tokenMethod.value;
	const usesInteractiveFlow = method === "interactive";
	const usesManualFlow = method === "manual";
	const usesExistingToken = method === "existing";

	async function storeAcquiredToken(
		useInteractiveFlow: boolean,
	): Promise<void> {
		const token = await acquireRefreshToken(ebayConfig, useInteractiveFlow);
		const isTokenMissing = token === null;

		if (isTokenMissing) {
			console.log(paint.yellow("\n⚠️  Could not acquire refresh token.\n"));
			return;
		}

		refreshToken = token;
	}

	if (usesInteractiveFlow) {
		await storeAcquiredToken(true);
	}

	if (usesManualFlow) {
		await storeAcquiredToken(false);
	}

	if (usesExistingToken) {
		const existingToken = await askText({
			message: "Paste your refresh token:",
			initial: refreshToken,
			validate: validateRefreshToken,
		});
		const pasted = existingToken.value;
		const hasPasted = pasted !== undefined;

		if (hasPasted) {
			refreshToken = stripWrappedQuotes(pasted);
		}
	}

	// Build configuration object
	const config: Record<string, string> = {
		EBAY_CLIENT_ID: credentials.EBAY_CLIENT_ID,
		EBAY_CLIENT_SECRET: credentials.EBAY_CLIENT_SECRET,
		EBAY_REDIRECT_URI: credentials.EBAY_REDIRECT_URI,
		EBAY_ENVIRONMENT: environment,
		EBAY_MARKETPLACE_ID: existingConfig["EBAY_MARKETPLACE_ID"] || "",
		EBAY_CONTENT_LANGUAGE: existingConfig["EBAY_CONTENT_LANGUAGE"] || "",
		EBAY_USER_REFRESH_TOKEN: refreshToken,
		EBAY_USER_ACCESS_TOKEN: "",
		EBAY_APP_ACCESS_TOKEN: "",
		LOG_LEVEL: existingConfig["LOG_LEVEL"] || "info",
	};

	// Validate and generate tokens
	if (refreshToken) {
		const validated = await validateAndGenerateTokens(config);

		if (!validated) {
			console.log(
				paint.yellow("\n⚠️  Setup will continue but tokens may not be valid.\n"),
			);
		}
	} else {
		console.log(
			paint.yellow(
				"\n⚠️  No refresh token configured. Some APIs will not be available.\n",
			),
		);
	}

	// Review configuration
	console.log(paint.bold.cyan("\n📋 Configuration Review:\n"));
	console.log(`  ${paint.gray("Client ID:")} ${config["EBAY_CLIENT_ID"]}`);
	const clientSecret = config["EBAY_CLIENT_SECRET"];
	const isClientSecretMissing = clientSecret == null;
	const maskedSecret = isClientSecretMissing
		? ""
		: "*".repeat(Math.min(clientSecret.length, 20));
	console.log(`  ${paint.gray("Client Secret:")} ${maskedSecret}`);
	console.log(
		`  ${paint.gray("Redirect URI:")} ${config["EBAY_REDIRECT_URI"]}`,
	);
	const environmentName = config["EBAY_ENVIRONMENT"] ?? "";
	console.log(`  ${paint.gray("Environment:")} ${paint.bold(environmentName)}`);
	console.log(
		`  ${paint.gray("User Refresh Token:")} ${config["EBAY_USER_REFRESH_TOKEN"] ? paint.green("✓ Configured") : paint.yellow("✗ Not set")}`,
	);
	console.log(
		`  ${paint.gray("User Access Token:")} ${config["EBAY_USER_ACCESS_TOKEN"] ? paint.green("✓ Generated") : paint.yellow("✗ Not generated")}`,
	);
	console.log(
		`  ${paint.gray("App Access Token:")} ${config["EBAY_APP_ACCESS_TOKEN"] ? paint.green("✓ Generated") : paint.yellow("✗ Not generated")}\n`,
	);

	const confirmation = await askConfirm({
		message: "Save this configuration?",
		initial: true,
	});
	const skipsSave = confirmation.value !== true;

	if (skipsSave) {
		console.log(paint.yellow("\n⚠️  Configuration not saved.\n"));
		process.exit(0);
	}

	// Save .env file
	generateEnvFile(config, environment);

	// Configure LLM clients
	await detectAndConfigureLLMClients();

	// Docker setup
	await setupDocker();

	// Run final validation
	console.log(paint.bold.cyan("\n🧪 Running Final Validation...\n"));
	const summary = await validateSetup(PROJECT_ROOT);
	displayRecommendations(summary);

	// Display quick start guide
	displayQuickStart();

	console.log(paint.bold.green("✅ Setup complete!\n"));
	console.log(paint.gray("Next steps:"));
	console.log(
		paint.gray("  1. Restart your LLM client (Claude Desktop, Cline, etc.)"),
	);
	console.log(paint.gray("  2. The eBay MCP server should now be available"));
	console.log(
		paint.gray("  3. Try the commands in the Quick Start guide above\n"),
	);
	console.log(paint.bold.white("🎉 Happy selling on eBay!\n"));
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
	const args = parseInteractiveArgs();

	if (args.help) {
		showInteractiveHelp();
		process.exit(0);
	}

	if (args.firstTime) {
		displayFirstTimeDeveloperGuide();
		process.exit(0);
	}

	if (args.diagnose) {
		// Diagnostics is handled by a separate script
		console.log(paint.cyan("Run diagnostics with: npm run diagnose\n"));
		process.exit(0);
	}

	await runInteractiveSetup(args);
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
	console.log(paint.yellow("\n\n⚠️  Setup interrupted by user.\n"));
	process.exit(0);
});

// Run main
try {
	await main();
} catch (error) {
	console.error(paint.red("\n❌ Setup failed:"), getErrorMessage(error));
	process.exitCode = 1;
}
