import process from "node:process";
import type { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { CREDENTIAL_ENV_PATH } from "@/shared/credentialFile.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { loadEnvFileIfPresent } from "@/shared/load-env-file.js";
import { getMediaAccessConfig } from "@/shared/mediaAccess.js";
import { productionScopes, sandboxScopes } from "@/shared/oauthScopes.js";
import { getToolGatingConfigError } from "@/shared/toolFamilies.js";
import { getVersion } from "@/shared/version.js";

// Load .env from the package root (two levels up from src/shared/), not process.cwd().
// MCP servers inherit cwd from the host (e.g. Claude Code's project dir), so
// process.cwd() may point to an unrelated project with a different .env.
loadEnvFileIfPresent(CREDENTIAL_ENV_PATH);

function writeConfigDiagnostic(message: string): void {
	process.stderr.write(`[eBay MCP] ${message}\n`);
}

export type EbayEnvironment = "production" | "sandbox";

export interface ScopeValidationResult {
	warnings: string[];
	validScopes: string[];
}

export interface EnvironmentValidationResult {
	isValid: boolean;
	warnings: string[];
	errors: string[];
	infos: string[];
}

export interface LoggingConfig {
	logLevel: string;
	enableFileLogging: boolean;
}

export interface UiRuntimeConfig {
	enabled: boolean;
}

export function getLoggingConfig(): LoggingConfig {
	return {
		logLevel: process.env["EBAY_LOG_LEVEL"] || "info",
		enableFileLogging: process.env["EBAY_ENABLE_FILE_LOGGING"] == "true",
	};
}

export function getUiRuntimeConfig(): UiRuntimeConfig {
	return {
		enabled: process.env["EBAY_MCP_UI"] != "off",
	};
}

export function getDefaultScopes(environment: EbayEnvironment): string[] {
	return [...(environment == "production" ? productionScopes : sandboxScopes)];
}

export const POST_ORDER_DOCUMENT_SCOPE =
	"https://api.ebay.com/oauth/api_scope/commerce.post_order.document";

export const FINANCES_EARNINGS_SCOPE =
	"https://api.ebay.com/oauth/api_scope/sell.finances.earnings.read";

export const LOGISTICS_SCOPE =
	"https://api.ebay.com/oauth/api_scope/sell.logistics";

export function getKnownScopes(environment: EbayEnvironment): string[] {
	return [
		...getDefaultScopes(environment),
		POST_ORDER_DOCUMENT_SCOPE,
		FINANCES_EARNINGS_SCOPE,
		LOGISTICS_SCOPE,
	];
}

export const OAUTH_SCOPES_ENV = "EBAY_OAUTH_SCOPES";

const SCOPE_PATTERN = /^https:\/\/api\.ebay\.com\/oauth\/[\w./-]+$/;

export function getRequestedScopes(
	environment: EbayEnvironment,
	env: NodeJS.ProcessEnv = process.env,
): string[] {
	const configured = (env[OAUTH_SCOPES_ENV] ?? "")
		.split(/[\s,]+/)
		.map((scope) => scope.trim())
		.filter((scope) => scope.length > 0);

	if (configured.length == 0) {
		return getDefaultScopes(environment);
	}

	// A scope carrying `&` or `?` would smuggle extra parameters into the
	// authorization URL, so anything unrecognizable is dropped rather than sent.
	const wellFormed = configured.filter((scope) => SCOPE_PATTERN.test(scope));
	const rejected = configured.filter((scope) => !SCOPE_PATTERN.test(scope));
	if (rejected.length > 0) {
		writeConfigDiagnostic(
			`${OAUTH_SCOPES_ENV} ignored ${rejected.length == 1 ? "an entry that is" : `${rejected.length} entries that are`} not an eBay OAuth scope URI: ${rejected.join(", ")}`,
		);
	}

	return wellFormed.length > 0 ? wellFormed : getDefaultScopes(environment);
}

export function validateScopes(
	scopes: string[],
	environment: EbayEnvironment,
): ScopeValidationResult {
	const validScopes = getKnownScopes(environment);
	const validScopeSet = new Set(validScopes);
	const warnings: string[] = [];
	const requestedValidScopes: string[] = [];

	scopes.forEach((scope) => {
		if (validScopeSet.has(scope)) {
			requestedValidScopes.push(scope);
		} else {
			// Check if this is a scope for the other environment
			const otherEnvironment =
				environment == "production" ? "sandbox" : "production";
			const otherScopes = getDefaultScopes(otherEnvironment);

			if (otherScopes.includes(scope)) {
				warnings.push(
					`Scope "${scope}" is only available in ${otherEnvironment} environment, not in ${environment}. This scope will be requested but may be rejected by eBay.`,
				);
			} else {
				warnings.push(
					`Scope "${scope}" is not recognized for ${environment} environment. This scope will be requested but may be rejected by eBay.`,
				);
			}
			// Still include it in case it's a new scope not in our JSON files
			requestedValidScopes.push(scope);
		}
	});

	return { warnings, validScopes: requestedValidScopes };
}

function isUnrecognizedEnvironment(environment: string | undefined): boolean {
	const isMissing = environment == null;

	if (isMissing) {
		return false;
	}

	const isEmpty = environment == "";

	if (isEmpty) {
		return false;
	}

	const isProduction = environment == "production";

	if (isProduction) {
		return false;
	}

	const isSandbox = environment == "sandbox";

	if (isSandbox) {
		return false;
	}

	return true;
}

export function validateEnvironmentConfig(): EnvironmentValidationResult {
	const proxyAuth = getProxyAuthConfig();
	const warnings: string[] = [...proxyAuth.warnings];
	const errors: string[] = [...proxyAuth.errors];

	// Client credentials are required only when this server authenticates to eBay
	// itself. In proxy auth mode (EBAY_MCP_DISABLE_AUTH_HEADER=true) the upstream
	// proxy supplies authentication, so missing credentials are expected, not errors.
	if (!proxyAuth.disableAuthHeader) {
		if (!process.env["EBAY_CLIENT_ID"]) {
			errors.push("EBAY_CLIENT_ID is not set. OAuth will not work.");
		}

		if (!process.env["EBAY_CLIENT_SECRET"]) {
			errors.push("EBAY_CLIENT_SECRET is not set. OAuth will not work.");
		}
	}

	// Validate EBAY_ENVIRONMENT
	const environment = process.env["EBAY_ENVIRONMENT"];
	const isUnrecognized = isUnrecognizedEnvironment(environment);

	if (isUnrecognized) {
		errors.push(
			`EBAY_ENVIRONMENT must be either "production" or "sandbox", got: "${environment}"`,
		);
	}

	// Check if environment is set
	if (!environment) {
		warnings.push(
			'EBAY_ENVIRONMENT not set. Defaulting to "sandbox". Set EBAY_ENVIRONMENT=production for production use.',
		);
	}

	// Check if redirect URI is set (needed for OAuth user flow)
	const redirectUri = process.env["EBAY_REDIRECT_URI"];
	if (redirectUri) {
		// eBay's authorization endpoint answers a URL redirect_uri with an opaque
		// "temporarily_unavailable" 500, so name the real problem here instead.
		if (redirectUri.includes("://")) {
			warnings.push(
				`EBAY_REDIRECT_URI must be your eBay RuName, not a URL; got "${redirectUri}". eBay answers the ` +
					'authorization request with "temporarily_unavailable" when redirect_uri is a URL. Copy the RuName ' +
					'(it looks like "YourApp-YourApp-abc-def-ghi") from https://developer.ebay.com/my/auth.',
			);
		}
	} else {
		warnings.push(
			"EBAY_REDIRECT_URI is not set. User OAuth flow will not work. Set this to enable user token generation.",
		);
	}

	// Validate EBAY_MCP_TOOLS (all | dynamic | comma-separated family list)
	const toolGatingError = getToolGatingConfigError();
	if (toolGatingError) {
		errors.push(toolGatingError);
	}

	// Validate EBAY_MCP_MEDIA_DIRS / EBAY_MCP_MEDIA_ROOT (local media upload allowlist)
	errors.push(...getMediaAccessConfig().errors);

	const isValid = errors.length == 0;

	return {
		isValid,
		warnings,
		errors,
		infos: proxyAuth.infos,
	};
}

function isMissingEbayCredential(
	disableAuthHeader: boolean,
	clientId: string,
	clientSecret: string,
): boolean {
	const isAuthHeaderDisabled = disableAuthHeader;

	if (isAuthHeaderDisabled) {
		return false;
	}

	const isClientIdMissing = clientId == "";

	if (isClientIdMissing) {
		return true;
	}

	const isClientSecretMissing = clientSecret == "";

	if (isClientSecretMissing) {
		return true;
	}

	return false;
}

export function getEbayConfig(): EbayConfig {
	const clientId = process.env["EBAY_CLIENT_ID"] ?? "";
	const clientSecret = process.env["EBAY_CLIENT_SECRET"] ?? "";
	const environment =
		process.env["EBAY_ENVIRONMENT"] == "production" ? "production" : "sandbox";
	const accessToken = process.env["EBAY_USER_ACCESS_TOKEN"] ?? "";
	const refreshToken = process.env["EBAY_USER_REFRESH_TOKEN"] ?? "";
	const appAccessToken = process.env["EBAY_APP_ACCESS_TOKEN"] ?? "";
	const marketplaceId =
		(process.env["EBAY_MARKETPLACE_ID"] ?? "").trim() || "EBAY_US";
	const contentLanguage =
		(process.env["EBAY_CONTENT_LANGUAGE"] ?? "").trim() || "en-US";
	const { apiBaseUrl, disableAuthHeader } = getProxyAuthConfig();

	// Only require client credentials when this server authenticates to eBay itself.
	// In proxy auth mode the upstream proxy supplies auth, so absent credentials are
	// expected and must not nag (tokens can otherwise be generated from a refresh token).
	const isCredentialMissing = isMissingEbayCredential(
		disableAuthHeader,
		clientId,
		clientSecret,
	);

	if (isCredentialMissing) {
		writeConfigDiagnostic(
			"Missing required eBay credentials. Please set:\n1) EBAY_CLIENT_ID\n2) EBAY_CLIENT_SECRET\nin your .env file at project root",
		);
	}

	const redirectUri = process.env["EBAY_REDIRECT_URI"];
	const signing = getSigningConfig();
	const ebayConfig: EbayConfig = {
		clientId,
		clientSecret,
		marketplaceId,
		contentLanguage,
		environment,
		accessToken,
		refreshToken,
		appAccessToken,
		disableAuthHeader,
	};

	if (redirectUri != null) {
		ebayConfig.redirectUri = redirectUri;
	}

	if (apiBaseUrl != null) {
		ebayConfig.apiBaseUrl = apiBaseUrl;
	}

	if (signing != null) {
		ebayConfig.signing = signing;
	}

	return ebayConfig;
}

const TRADING_SITE_IDS: Readonly<Record<string, string>> = {
	EBAY_AT: "16",
	EBAY_AU: "15",
	EBAY_BE: "23",
	EBAY_CA: "2",
	EBAY_CH: "193",
	EBAY_DE: "77",
	EBAY_ES: "186",
	EBAY_FR: "71",
	EBAY_GB: "3",
	EBAY_HK: "201",
	EBAY_IE: "205",
	EBAY_IN: "203",
	EBAY_IT: "101",
	EBAY_MY: "207",
	EBAY_NL: "146",
	EBAY_PH: "211",
	EBAY_PL: "212",
	EBAY_SG: "216",
	EBAY_US: "0",
};

const DEFAULT_TRADING_SITE_ID = "0";

export function getTradingSiteId(): string {
	const override = (process.env["EBAY_SITE_ID"] ?? "").trim();
	if (override != "") {
		return override;
	}
	const marketplaceId =
		(process.env["EBAY_MARKETPLACE_ID"] ?? "").trim() || "EBAY_US";
	return TRADING_SITE_IDS[marketplaceId] ?? DEFAULT_TRADING_SITE_ID;
}

export function getBaseUrl(
	environment: EbayEnvironment,
	overrideBaseUrl?: string,
): string {
	if (overrideBaseUrl) {
		return overrideBaseUrl;
	}
	return environment == "production"
		? "https://api.ebay.com"
		: "https://api.sandbox.ebay.com";
}

export function getIdentityBaseUrl(
	environment: EbayEnvironment,
	overrideBaseUrl?: string,
): string {
	if (overrideBaseUrl) {
		return overrideBaseUrl;
	}
	return environment == "production"
		? "https://apiz.ebay.com"
		: "https://apiz.sandbox.ebay.com";
}

export function getMediaBaseUrl(
	environment: EbayEnvironment,
	overrideBaseUrl?: string,
): string {
	if (overrideBaseUrl) {
		return overrideBaseUrl;
	}
	return environment == "production"
		? "https://apim.ebay.com"
		: "https://apim.sandbox.ebay.com";
}

export function getClientRegistrationBaseUrl(
	environment: EbayEnvironment,
	overrideBaseUrl?: string,
): string {
	if (overrideBaseUrl) {
		return overrideBaseUrl;
	}
	return environment == "production"
		? "https://tppz.ebay.com"
		: "https://tppz.sandbox.ebay.com";
}

const LOOPBACK_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"::1",
	"[::1]",
	"0.0.0.0",
]);

export interface ProxyAuthConfig {
	apiBaseUrl?: string | undefined;
	disableAuthHeader: boolean;
	warnings: string[];
	errors: string[];
	infos: string[];
}

function readUnsafePlainHttpHost(
	parsedBaseUrl: URL | undefined,
	disableAuthHeader: boolean,
): string | undefined {
	const isMissingUrl = parsedBaseUrl == null;

	if (isMissingUrl) {
		return undefined;
	}

	const isAuthHeaderDisabled = disableAuthHeader;

	if (isAuthHeaderDisabled) {
		return undefined;
	}

	const isNotPlainHttp = parsedBaseUrl.protocol != "http:";

	if (isNotPlainHttp) {
		return undefined;
	}

	const isLoopback = LOOPBACK_HOSTS.has(parsedBaseUrl.hostname);

	if (isLoopback) {
		return undefined;
	}

	return parsedBaseUrl.host;
}

export function getProxyAuthConfig(): ProxyAuthConfig {
	const disableAuthHeader =
		process.env["EBAY_MCP_DISABLE_AUTH_HEADER"] == "true";
	const rawBaseUrl = (process.env["EBAY_MCP_API_BASE_URL"] ?? "").trim();
	const warnings: string[] = [];
	const errors: string[] = [];
	const infos: string[] = [];

	let apiBaseUrl: string | undefined;
	let parsedBaseUrl: URL | undefined;
	if (rawBaseUrl) {
		try {
			parsedBaseUrl = new URL(rawBaseUrl);
			apiBaseUrl = rawBaseUrl.replace(/\/+$/, "");
		} catch {
			errors.push(
				`EBAY_MCP_API_BASE_URL is not a valid URL: "${rawBaseUrl}". ` +
					'Provide an absolute URL such as "http://localhost:8080".',
			);
		}
	}

	if (disableAuthHeader) {
		infos.push(
			"Proxy auth mode enabled (EBAY_MCP_DISABLE_AUTH_HEADER=true): eBay credentials are not required; " +
				"authentication is delegated to the upstream proxy.",
		);
		if (!apiBaseUrl) {
			warnings.push(
				"EBAY_MCP_DISABLE_AUTH_HEADER=true but EBAY_MCP_API_BASE_URL is not set. Requests will be sent " +
					"to eBay directly without authentication and will fail. Set EBAY_MCP_API_BASE_URL to your proxy.",
			);
		}
	}

	const plaintextHost = readUnsafePlainHttpHost(
		parsedBaseUrl,
		disableAuthHeader,
	);
	const warnAboutPlaintext = plaintextHost != null;

	if (warnAboutPlaintext) {
		warnings.push(
			`EBAY_MCP_API_BASE_URL points at a plaintext http:// host (${plaintextHost}) while authentication ` +
				"is enabled. eBay access tokens will be transmitted unencrypted. Use https://, a loopback address, " +
				"or set EBAY_MCP_DISABLE_AUTH_HEADER=true.",
		);
	}

	return { apiBaseUrl, disableAuthHeader, warnings, errors, infos };
}

function readNonEmptySigningText(
	signingText: string | undefined,
): string | undefined {
	const isMissing = signingText == null;

	if (isMissing) {
		return undefined;
	}

	const isEmpty = signingText == "";

	if (isEmpty) {
		return undefined;
	}

	return signingText;
}

function readCompleteSigningPair(
	keyJwe: string | undefined,
	privateKey: string | undefined,
): { readonly keyJwe: string; readonly privateKey: string } | undefined {
	const isKeyMissing = keyJwe == null;

	if (isKeyMissing) {
		return undefined;
	}

	const isPrivateKeyMissing = privateKey == null;

	if (isPrivateKeyMissing) {
		return undefined;
	}

	return { keyJwe, privateKey };
}

function hasOneSigningText(
	keyJwe: string | undefined,
	privateKey: string | undefined,
): boolean {
	const hasKeyJwe = keyJwe != null;

	if (hasKeyJwe) {
		return true;
	}

	const hasPrivateKey = privateKey != null;

	if (hasPrivateKey) {
		return true;
	}

	return false;
}

function getSigningConfig(): EbayConfig["signing"] {
	const trimmedKeyJwe = process.env["EBAY_SIGNING_KEY_JWE"]?.trim();
	const keyJwe = readNonEmptySigningText(trimmedKeyJwe);
	const trimmedPrivateKey = process.env["EBAY_SIGNING_PRIVATE_KEY"]?.trim();
	const privateKey = readNonEmptySigningText(trimmedPrivateKey);
	const pair = readCompleteSigningPair(keyJwe, privateKey);
	const hasPair = pair != null;

	if (hasPair) {
		return pair;
	}

	const hasPartialPair = hasOneSigningText(keyJwe, privateKey);

	if (hasPartialPair) {
		writeConfigDiagnostic(
			"Digital signatures need both EBAY_SIGNING_KEY_JWE and EBAY_SIGNING_PRIVATE_KEY; only one is set, so requests will not be signed.",
		);
	}

	return undefined;
}

function readProvidedScopes(
	scopes: string[] | undefined,
): string[] | undefined {
	const isMissing = scopes == null;

	if (isMissing) {
		return undefined;
	}

	const isEmpty = scopes.length == 0;

	if (isEmpty) {
		return undefined;
	}

	return scopes;
}

function joinAuthorizationScopes(
	environment: EbayEnvironment,
	scopes: string[] | undefined,
): string {
	const provided = readProvidedScopes(scopes);
	const hasProvidedScopes = provided != null;

	if (hasProvidedScopes) {
		return provided.join("%20");
	}

	const defaults = getRequestedScopes(environment);
	return defaults.join("%20");
}

export function getOAuthAuthorizationUrl(
	clientId: string,
	redirectUri: string, // MUST be eBay RuName, NOT a URL
	environment: EbayEnvironment,
	scopes?: string[],
	state?: string,
): string {
	const authBase =
		environment == "production"
			? "https://auth.ebay.com"
			: "https://auth.sandbox.ebay.com";

	const scopeList = joinAuthorizationScopes(environment, scopes);

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		...(state ? { state } : {}),
	});

	return `${authBase}/oauth2/authorize?${params.toString()}&scope=${scopeList}`;
}

export const mcpConfig: Implementation = {
	name: "eBay API Model Context Protocol Server",
	version: getVersion(),
	title: "eBay API Model Context Protocol Server",
	websiteUrl: "https://github.com/YosefHayim/ebay-mcp",
};
