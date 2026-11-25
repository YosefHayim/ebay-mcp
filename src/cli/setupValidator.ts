import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { EbayOAuthClient } from "@/auth/oauth.js";
import { writeCliLine } from "@/shared/cliOutput.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { getOAuthAuthorizationUrl } from "@/shared/environment.js";
import { parseEnvFile } from "@/shared/envParser.js";
import { getErrorMessage } from "@/shared/errors.js";
import { paint } from "@/shared/paint.js";

export interface ValidationResult {
	test: string;
	passed: boolean;
	message: string;
	error?: string;
}

export interface ValidationSummary {
	totalTests: number;
	passed: number;
	failed: number;
	results: ValidationResult[];
}

function isCredentialMissing(
	envVars: Record<string, string>,
	key: string,
): boolean {
	const credential = envVars[key];
	const isMissing = !credential;

	if (isMissing) return true;

	const isBlank = credential.trim() == "";

	if (isBlank) return true;

	return false;
}

function isSandboxOrProduction(environmentName: string): boolean {
	const isSandbox = environmentName == "sandbox";

	if (isSandbox) return true;

	const isProduction = environmentName == "production";

	if (isProduction) return true;

	return false;
}

function hasConfiguredRefreshToken(envVars: Record<string, string>): boolean {
	const refreshToken = envVars["EBAY_USER_REFRESH_TOKEN"];
	const isMissing = !refreshToken;

	if (isMissing) return false;

	const isBlank = refreshToken.trim() == "";

	if (isBlank) return false;

	return true;
}

function isConfiguredUserToken(validation: ValidationResult): boolean {
	const isOtherTest = validation.test != "User Tokens";

	if (isOtherTest) return false;

	const isFailed = validation.passed == false;

	if (isFailed) return false;

	const hasErrorNote = Boolean(validation.error);

	if (hasErrorNote) return false;

	return true;
}

function validateEnvFile(projectRoot: string): ValidationResult {
	const envPath = join(projectRoot, ".env");

	if (!existsSync(envPath)) {
		return {
			test: ".env File Existence",
			passed: false,
			message: "Configuration file not found",
			error: `.env file does not exist at ${envPath}`,
		};
	}

	try {
		readFileSync(envPath, "utf-8");
	} catch (error) {
		return {
			test: ".env File Existence",
			passed: false,
			message: "Configuration file cannot be read",
			error: getErrorMessage(error),
		};
	}

	return {
		test: ".env File Existence",
		passed: true,
		message: "Configuration file exists and is readable",
	};
}

function validateAppCredentials(
	envVars: Record<string, string>,
): ValidationResult {
	const required = [
		"EBAY_CLIENT_ID",
		"EBAY_CLIENT_SECRET",
		"EBAY_REDIRECT_URI",
	];
	const missing: string[] = [];

	for (const key of required) {
		const credentialIsMissing = isCredentialMissing(envVars, key);

		if (credentialIsMissing) {
			missing.push(key);
		}
	}

	if (missing.length > 0) {
		return {
			test: "App Credentials",
			passed: false,
			message: "Missing required app credentials",
			error: `Missing: ${missing.join(", ")}`,
		};
	}

	return {
		test: "App Credentials",
		passed: true,
		message: "All required app credentials are present",
	};
}

function validateEnvironment(
	envVars: Record<string, string>,
): ValidationResult {
	const env = envVars["EBAY_ENVIRONMENT"] || "sandbox";

	const isKnownEnvironment = isSandboxOrProduction(env);
	const isUnknownEnvironment = isKnownEnvironment == false;

	if (isUnknownEnvironment) {
		return {
			test: "Environment Setting",
			passed: false,
			message: "Invalid environment value",
			error: `EBAY_ENVIRONMENT must be "sandbox" or "production", got "${env}"`,
		};
	}

	return {
		test: "Environment Setting",
		passed: true,
		message: `Environment set to "${env}"`,
	};
}

function validateUserTokens(envVars: Record<string, string>): ValidationResult {
	const hasRefreshToken = hasConfiguredRefreshToken(envVars);
	const isRefreshTokenMissing = hasRefreshToken == false;

	if (isRefreshTokenMissing) {
		return {
			test: "User Tokens (Optional)",
			passed: true,
			message: "No user tokens configured (app token only mode)",
			error: "To enable user-specific API calls, set EBAY_USER_REFRESH_TOKEN",
		};
	}

	return {
		test: "User Tokens",
		passed: true,
		message: "User refresh token is configured",
	};
}

async function validateOAuthInitialization(
	config: EbayConfig,
): Promise<ValidationResult> {
	try {
		const oauthClient = new EbayOAuthClient(config);
		await oauthClient.initialize();
	} catch (error) {
		return {
			test: "OAuth Client Initialization",
			passed: false,
			message: "Failed to initialize OAuth client",
			error: getErrorMessage(error),
		};
	}

	return {
		test: "OAuth Client Initialization",
		passed: true,
		message: "OAuth client initialized successfully",
	};
}

function validateOAuthURL(config: EbayConfig): ValidationResult {
	const redirectUri = config.redirectUri;
	if (!redirectUri) {
		return {
			test: "OAuth URL Generation",
			passed: false,
			message: "Redirect URI is required for OAuth URL generation",
			error: "EBAY_REDIRECT_URI is not configured",
		};
	}

	let authorizationUrl: string;

	try {
		authorizationUrl = getOAuthAuthorizationUrl(
			config.clientId,
			redirectUri,
			config.environment,
		);
	} catch (error) {
		return {
			test: "OAuth URL Generation",
			passed: false,
			message: "Failed to generate OAuth URL",
			error: getErrorMessage(error),
		};
	}

	if (!authorizationUrl.startsWith("http")) {
		return {
			test: "OAuth URL Generation",
			passed: false,
			message: "Invalid OAuth URL generated",
			error: "Generated URL is not valid",
		};
	}

	return {
		test: "OAuth URL Generation",
		passed: true,
		message: "OAuth URL can be generated",
	};
}

export async function validateSetup(
	projectRoot: string,
): Promise<ValidationSummary> {
	const results: ValidationResult[] = [];

	writeCliLine(paint.bold.cyan("\n🧪 Running Configuration Tests...\n"));

	// Test 1: .env file exists
	const envFileResult = validateEnvFile(projectRoot);
	results.push(envFileResult);
	printResult(envFileResult);

	if (!envFileResult.passed) {
		return {
			totalTests: 1,
			passed: 0,
			failed: 1,
			results,
		};
	}

	// Parse .env file
	const envPath = join(projectRoot, ".env");
	const envVars = parseEnvFile(envPath);

	// Test 2: App credentials
	const appCredsResult = validateAppCredentials(envVars);
	results.push(appCredsResult);
	printResult(appCredsResult);

	// Test 3: Environment setting
	const envResult = validateEnvironment(envVars);
	results.push(envResult);
	printResult(envResult);

	// Test 4: User tokens (optional)
	const userTokensResult = validateUserTokens(envVars);
	results.push(userTokensResult);
	printResult(userTokensResult);

	// If app credentials are valid, test OAuth functionality
	const clientId = envVars["EBAY_CLIENT_ID"];
	const clientSecret = envVars["EBAY_CLIENT_SECRET"];
	const isClientIdMissing = clientId == null;
	const isClientSecretMissing = clientSecret == null;
	const hasAppCredentials = appCredsResult.passed;

	async function testStoredOAuth(): Promise<void> {
		const skippedOAuth = hasAppCredentials == false;

		if (skippedOAuth) {
			return;
		}

		if (isClientIdMissing) {
			return;
		}

		if (isClientSecretMissing) {
			return;
		}

		const config: EbayConfig = {
			clientId,
			clientSecret,
			redirectUri: envVars["EBAY_REDIRECT_URI"],
			environment: (envVars["EBAY_ENVIRONMENT"] || "sandbox") as
				| "sandbox"
				| "production",
		};

		// Test 5: OAuth initialization
		const oauthInitResult = await validateOAuthInitialization(config);
		results.push(oauthInitResult);
		printResult(oauthInitResult);

		const didOAuthFail = oauthInitResult.passed == false;

		if (didOAuthFail) {
			return;
		}

		// Test 6: OAuth URL generation
		const oauthURLResult = validateOAuthURL(config);
		results.push(oauthURLResult);
		printResult(oauthURLResult);
	}

	await testStoredOAuth();

	// Calculate summary
	const passed = results.filter((check) => check.passed).length;
	const failed = results.length - passed;

	// Print summary
	writeCliLine(paint.gray("\n" + "─".repeat(60)));
	writeCliLine(paint.bold.white("\n📊 Validation Summary\n"));
	writeCliLine(`  Total Tests: ${results.length}`);
	writeCliLine(`  ${paint.green("✓ Passed:")} ${passed}`);
	writeCliLine(`  ${paint.red("✗ Failed:")} ${failed}`);

	if (failed == 0) {
		writeCliLine(
			paint.green.bold("\n✨ All tests passed! Configuration is valid.\n"),
		);
	} else {
		writeCliLine(
			paint.yellow.bold(
				"\n⚠️  Some tests failed. Please review the errors above.\n",
			),
		);
	}

	return {
		totalTests: results.length,
		passed,
		failed,
		results,
	};
}

function printResult(validation: ValidationResult): void {
	const icon = validation.passed ? paint.green("✓") : paint.red("✗");
	const status = validation.passed ? paint.green("PASS") : paint.red("FAIL");

	writeCliLine(`${icon} ${paint.bold(validation.test)}: ${status}`);
	writeCliLine(`  ${paint.gray(validation.message)}`);

	if (validation.error) {
		writeCliLine(`  ${paint.yellow("→")} ${paint.yellow(validation.error)}`);
	}

	writeCliLine("");
}

export function displayRecommendations(summary: ValidationSummary): void {
	const hasUserTokens = summary.results.some(isConfiguredUserToken);

	writeCliLine(paint.bold.cyan("💡 Recommendations:\n"));

	if (!hasUserTokens) {
		writeCliLine(paint.yellow("  ⚠️  User tokens not configured"));
		writeCliLine(
			paint.gray("     • You can only use app token for limited API access"),
		);
		writeCliLine(
			paint.gray(
				"     • To enable full API access, use the ebay_get_oauth_url tool",
			),
		);
		writeCliLine(
			paint.gray(
				"     • Then save your refresh token to EBAY_USER_REFRESH_TOKEN in .env\n",
			),
		);
	}

	if (summary.failed > 0) {
		writeCliLine(paint.red("  ❌ Configuration has errors"));
		writeCliLine(paint.gray("     • Review the failed tests above"));
		writeCliLine(
			paint.gray("     • Update your .env file with correct values"),
		);
		writeCliLine(
			paint.gray("     • Run the setup wizard again: npm run setup\n"),
		);
	} else {
		writeCliLine(paint.green("  ✅ Configuration is complete and valid"));
		writeCliLine(
			paint.gray(
				"     • Restart your MCP client (Claude Desktop, Cline, etc.)",
			),
		);
		writeCliLine(
			paint.gray("     • The eBay MCP server should now be available"),
		);
		writeCliLine(
			paint.gray(
				"     • Try using tools like: ebay_get_user, ebay_get_oauth_url\n",
			),
		);
	}
}
