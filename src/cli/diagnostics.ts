import process from "node:process";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
	displayScopeVerification,
	parseScopeString,
} from "@/cli/scopeHelper.js";
import {
	displaySecurityResults,
	runSecurityChecks,
} from "@/cli/securityChecker.js";
import { displayRecommendations, validateSetup } from "@/cli/setupValidator.js";
import { EbaySellerApi } from "@/ebay-apis/ebaySellerApi.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { isEntryModule } from "@/shared/entryModule.js";
import { parseEnvFile } from "@/shared/envParser.js";
import { getErrorMessage } from "@/shared/errors.js";
import { detectLLMClients } from "@/shared/llmClientDetector.js";
import { paint } from "@/shared/paint.js";
import { getVersion } from "@/shared/version.js";
import { readEnvironment } from "./setupShared.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../..");

interface DiagnosticReport {
	timestamp: string;
	environment: {
		nodeVersion: string;
		platform: string;
		arch: string;
	};
	security: unknown[];
	configuration: unknown;
	llmClients: unknown[];
	apiConnection: {
		canReachEbay: boolean;
		error?: string;
	};
	tokenInfo?: {
		hasUserToken: boolean;
		hasAppToken: boolean;
		scopes?: string[];
	};
}

async function checkApiConnectivity(): Promise<{
	canReachEbay: boolean;
	error?: string;
}> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		const healthResponse = await fetch("https://api.ebay.com/health", {
			signal: controller.signal,
		});

		return {
			canReachEbay: healthResponse.ok || healthResponse.status == 404,
		};
	} catch (error) {
		return {
			canReachEbay: false,
			error: getErrorMessage(error),
		};
	} finally {
		clearTimeout(timeout);
	}
}

async function testEbayAuthentication(
	config: EbayConfig,
): Promise<{ success: boolean; error?: string; userInfo?: unknown }> {
	try {
		const api = new EbaySellerApi(config);
		await api.initialize();
		const userInfo = await api.identity.getUser();

		return { success: true, userInfo };
	} catch (error) {
		return {
			success: false,
			error: getErrorMessage(error),
		};
	}
}

function displayHeader(): void {
	console.clear();
	console.log(
		paint.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              eBay MCP Server Diagnostics                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `),
	);
	console.log(paint.gray(`Run date: ${new Date().toISOString()}\n`));
}

function displaySystemInfo(): void {
	console.log(paint.bold.cyan("💻 System Information\n"));
	console.log(`  ${paint.gray("Node.js:")} ${process.version}`);
	console.log(`  ${paint.gray("Platform:")} ${process.platform}`);
	console.log(`  ${paint.gray("Architecture:")} ${process.arch}`);
	console.log(`  ${paint.gray("CWD:")} ${process.cwd()}`);
	console.log("");
}

function displayUpdateStatus(): void {
	console.log(paint.bold.cyan("🔄 Version\n"));
	console.log(`  ${paint.gray("Installed:")} ${getVersion()}`);
	console.log("");
}

function displayConfigurationStatus(envVars: Record<string, string>): void {
	console.log(paint.bold.cyan("⚙️  Configuration Status\n"));

	const checks = [
		{ key: "EBAY_CLIENT_ID", label: "Client ID", redact: true },
		{ key: "EBAY_CLIENT_SECRET", label: "Client Secret", redact: true },
		{ key: "EBAY_REDIRECT_URI", label: "Redirect URI", redact: false },
		{ key: "EBAY_ENVIRONMENT", label: "Environment", redact: false },
		{ key: "EBAY_MARKETPLACE_ID", label: "Marketplace ID", redact: false },
		{ key: "EBAY_CONTENT_LANGUAGE", label: "Content Language", redact: false },
		{
			key: "EBAY_USER_REFRESH_TOKEN",
			label: "User Refresh Token",
			redact: true,
		},
		{ key: "EBAY_USER_ACCESS_TOKEN", label: "User Access Token", redact: true },
		{ key: "EBAY_APP_ACCESS_TOKEN", label: "App Access Token", redact: true },
	];

	for (const check of checks) {
		const envValue = envVars[check.key];
		let status: string;
		let displayValue: string;

		if (envValue && envValue.trim() && !envValue.includes("_here")) {
			status = paint.green("✓ Set");
			displayValue = check.redact
				? `${envValue.substring(0, 10)}...`
				: envValue;
		} else {
			status = paint.red("✗ Not set");
			displayValue = paint.gray("(not configured)");
		}

		console.log(`  ${status} ${paint.bold(check.label)}: ${displayValue}`);
	}

	console.log("");
}

function displayLLMClientStatus(): void {
	console.log(paint.bold.cyan("🤖 LLM Client Detection\n"));

	const clients = detectLLMClients();

	for (const client of clients) {
		const detected = client.detected
			? paint.green("✓ Detected")
			: paint.gray("✗ Not found");
		const configured = client.configExists
			? paint.green("[Configured]")
			: paint.gray("[Not configured]");

		console.log(
			`  ${detected} ${paint.bold(client.displayName)} ${configured}`,
		);
		if (client.detected) {
			console.log(paint.gray(`    Config: ${client.configPath}`));
		}
	}

	console.log("");
}

async function displayAuthenticationTest(config: EbayConfig): Promise<void> {
	console.log(paint.bold.cyan("🔐 API Authentication Test\n"));

	const authCheck = await testEbayAuthentication(config);

	if (authCheck.success) {
		console.log(paint.green("  ✓ Successfully authenticated with eBay API\n"));

		if (authCheck.userInfo) {
			console.log(paint.bold.white("  User Information:"));
			console.log(paint.gray(JSON.stringify(authCheck.userInfo, null, 2)));
			console.log("");
		}
	} else {
		console.log(paint.red("  ✗ Authentication failed\n"));
		console.log(paint.yellow(`  Error: ${authCheck.error}\n`));
	}
}

async function generateDiagnosticReport(
	exportPath?: string,
): Promise<DiagnosticReport> {
	const envPath = join(PROJECT_ROOT, ".env");
	const envVars = parseEnvFile(envPath);

	// Run security checks
	const securityResults = await runSecurityChecks(PROJECT_ROOT);

	// Run configuration validation
	const validationSummary = await validateSetup(PROJECT_ROOT);

	// Detect LLM clients
	const llmClients = detectLLMClients();

	// Check API connectivity
	const apiConnection = await checkApiConnectivity();

	const report: DiagnosticReport = {
		timestamp: new Date().toISOString(),
		environment: {
			nodeVersion: process.version,
			platform: process.platform,
			arch: process.arch,
		},
		security: securityResults,
		configuration: validationSummary,
		llmClients,
		apiConnection,
	};

	// If we have credentials, test authentication
	if (envVars["EBAY_CLIENT_ID"] && envVars["EBAY_CLIENT_SECRET"]) {
		const config: EbayConfig = {
			clientId: envVars["EBAY_CLIENT_ID"],
			clientSecret: envVars["EBAY_CLIENT_SECRET"],
			redirectUri: envVars["EBAY_REDIRECT_URI"],
			environment: readEnvironment(envVars["EBAY_ENVIRONMENT"]),
		};

		const authResult = await testEbayAuthentication(config);

		report.tokenInfo = {
			hasUserToken: !!envVars["EBAY_USER_REFRESH_TOKEN"],
			hasAppToken: !!envVars["EBAY_APP_ACCESS_TOKEN"],
		};

		if (authResult.success) {
			report.tokenInfo.scopes = envVars["EBAY_USER_REFRESH_TOKEN"]
				? parseScopeString(envVars["EBAY_USER_REFRESH_TOKEN"])
				: [];
		}
	}

	// Export report if path provided
	if (exportPath) {
		writeFileSync(exportPath, JSON.stringify(report, null, 2), "utf-8");
		console.log(
			paint.green(`\n✓ Diagnostic report exported to: ${exportPath}\n`),
		);
	}

	return report;
}

export async function runDiagnostics(exportReport = false): Promise<void> {
	displayHeader();
	displaySystemInfo();
	displayUpdateStatus();

	// Security checks
	const securityResults = await runSecurityChecks(PROJECT_ROOT);
	displaySecurityResults(securityResults);

	// Configuration status
	const envPath = join(PROJECT_ROOT, ".env");
	const envVars = parseEnvFile(envPath);
	displayConfigurationStatus(envVars);

	// LLM client detection
	displayLLMClientStatus();

	// API connectivity
	console.log(paint.bold.cyan("🌐 API Connectivity\n"));
	const apiConnection = await checkApiConnectivity();

	if (apiConnection.canReachEbay) {
		console.log(paint.green("  ✓ Can reach eBay API servers\n"));
	} else {
		console.log(paint.red("  ✗ Cannot reach eBay API servers"));
		console.log(paint.yellow(`  Error: ${apiConnection.error}\n`));
	}

	// Configuration validation
	console.log(paint.bold.cyan("📋 Configuration Validation\n"));
	const validationSummary = await validateSetup(PROJECT_ROOT);
	displayRecommendations(validationSummary);

	// If we have credentials, test authentication
	if (envVars["EBAY_CLIENT_ID"] && envVars["EBAY_CLIENT_SECRET"]) {
		const config: EbayConfig = {
			clientId: envVars["EBAY_CLIENT_ID"],
			clientSecret: envVars["EBAY_CLIENT_SECRET"],
			redirectUri: envVars["EBAY_REDIRECT_URI"],
			environment: readEnvironment(envVars["EBAY_ENVIRONMENT"]),
		};

		await displayAuthenticationTest(config);

		// Scope verification if user has refresh token
		if (envVars["EBAY_USER_REFRESH_TOKEN"]) {
			try {
				const api = new EbaySellerApi(config);
				await api.initialize();
				const authClient = api.getAuthClient();
				const scopeInfo = authClient.getTokenInfo().scopeInfo;

				if (scopeInfo) {
					displayScopeVerification(scopeInfo.tokenScopes, config.environment);
				}
			} catch {
				console.log(paint.yellow("⚠️  Could not verify token scopes\n"));
			}
		}
	}

	// Export report if requested
	if (exportReport) {
		const reportPath = join(
			PROJECT_ROOT,
			`ebay-mcp-diagnostic-${Date.now()}.json`,
		);
		await generateDiagnosticReport(reportPath);
	}

	console.log(paint.bold.green("✅ Diagnostics complete!\n"));
	console.log(paint.gray("For more help, visit:"));
	console.log(
		paint.blue.underline(
			"  https://github.com/YosefHayim/ebay-mcp#troubleshooting\n",
		),
	);
}

// Direct script entry (`node build/cli/diagnostics.js` / `npm run diagnose`).
// Guarded so importing from the bin does not auto-run diagnostics.
if (isEntryModule(import.meta.url)) {
	const cliArgs = process.argv.slice(2);
	const exportReport = cliArgs.includes("--export") || cliArgs.includes("-e");

	try {
		await runDiagnostics(exportReport);
	} catch (error) {
		console.error(
			paint.red("\n❌ Diagnostics failed:"),
			getErrorMessage(error),
		);
		process.exitCode = 1;
	}
}
