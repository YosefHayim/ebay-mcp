import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { EbayConfig } from '@/types/ebay.js';
import type { Implementation } from '@modelcontextprotocol/sdk/types.js';
import { LocaleEnum } from '@/types/ebay-enums.js';
import { getToolGatingConfigError } from '@/config/tool-families.js';
import { getVersion } from '@/utils/version.js';
import { getErrorMessage } from '@/utils/errors.js';

// Get the current directory for loading scope files and .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the package root (two levels up from src/config/), not process.cwd().
// MCP servers inherit cwd from the host (e.g. Claude Code's project dir), so
// process.cwd() may point to an unrelated project with a different .env.
config({ path: join(__dirname, '../../.env'), quiet: true });

// Type for scope JSON structure
interface ScopeDefinition {
  Scope: string;
  Description: string;
}

/**
 * Load and parse production scopes from JSON file
 */
function getProductionScopes(): string[] {
  try {
    const scopesPath = join(__dirname, '../../docs/auth/production_scopes.json');
    const scopesData = readFileSync(scopesPath, 'utf-8');
    const scopes: ScopeDefinition[] = JSON.parse(scopesData);

    // Filter out empty objects and extract unique scope strings
    const uniqueScopes = new Set<string>();
    scopes.forEach((item) => {
      if (item.Scope) {
        uniqueScopes.add(item.Scope);
      }
    });
    return Array.from(uniqueScopes);
  } catch (error) {
    console.error('Failed to load production scopes:', error);
    // Return a minimal set of core scopes as fallback
    return ['https://api.ebay.com/oauth/api_scope'];
  }
}

/**
 * Load and parse sandbox scopes from JSON file
 */
function getSandboxScopes(): string[] {
  try {
    const scopesPath = join(__dirname, '../../docs/auth/sandbox_scopes.json');
    const scopesData = readFileSync(scopesPath, 'utf-8');
    const scopes: ScopeDefinition[] = JSON.parse(scopesData);

    // Filter out empty objects and extract unique scope strings
    const uniqueScopes = new Set<string>();
    scopes.forEach((item) => {
      if (item.Scope) {
        uniqueScopes.add(item.Scope);
      }
    });

    return Array.from(uniqueScopes);
  } catch (error) {
    console.error('Failed to load sandbox scopes:', error);
    // Return a minimal set of core scopes as fallback
    return ['https://api.ebay.com/oauth/api_scope'];
  }
}

/**
 * Get default scopes for the specified environment
 */
export function getDefaultScopes(environment: 'production' | 'sandbox'): string[] {
  if (environment === 'production') {
    return getProductionScopes();
  }

  return getSandboxScopes();
}

/**
 * Validate scopes against environment and return warnings for invalid scopes
 */
export function validateScopes(
  scopes: string[],
  environment: 'production' | 'sandbox'
): { warnings: string[]; validScopes: string[] } {
  const validScopes = getDefaultScopes(environment);
  const validScopeSet = new Set(validScopes);
  const warnings: string[] = [];
  const requestedValidScopes: string[] = [];

  scopes.forEach((scope) => {
    if (validScopeSet.has(scope)) {
      requestedValidScopes.push(scope);
    } else {
      // Check if this is a scope for the other environment
      const otherEnvironment = environment === 'production' ? 'sandbox' : 'production';
      const otherScopes = getDefaultScopes(otherEnvironment);

      if (otherScopes.includes(scope)) {
        warnings.push(
          `Scope "${scope}" is only available in ${otherEnvironment} environment, not in ${environment}. This scope will be requested but may be rejected by eBay.`
        );
      } else {
        warnings.push(
          `Scope "${scope}" is not recognized for ${environment} environment. This scope will be requested but may be rejected by eBay.`
        );
      }
      // Still include it in case it's a new scope not in our JSON files
      requestedValidScopes.push(scope);
    }
  });

  return { warnings, validScopes: requestedValidScopes };
}

/**
 * Validate environment configuration on startup
 */
export function validateEnvironmentConfig(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  infos: string[];
} {
  const proxyAuth = getProxyAuthConfig();
  const warnings: string[] = [...proxyAuth.warnings];
  const errors: string[] = [...proxyAuth.errors];

  // Client credentials are required only when this server authenticates to eBay
  // itself. In proxy auth mode (EBAY_MCP_DISABLE_AUTH_HEADER=true) the upstream
  // proxy supplies authentication, so missing credentials are expected, not errors.
  if (!proxyAuth.disableAuthHeader) {
    if (!process.env.EBAY_CLIENT_ID) {
      errors.push('EBAY_CLIENT_ID is not set. OAuth will not work.');
    }

    if (!process.env.EBAY_CLIENT_SECRET) {
      errors.push('EBAY_CLIENT_SECRET is not set. OAuth will not work.');
    }
  }

  // Validate EBAY_ENVIRONMENT
  const environment = process.env.EBAY_ENVIRONMENT;
  if (environment && environment !== 'production' && environment !== 'sandbox') {
    errors.push(`EBAY_ENVIRONMENT must be either "production" or "sandbox", got: "${environment}"`);
  }

  // Check if environment is set
  if (!environment) {
    warnings.push(
      'EBAY_ENVIRONMENT not set. Defaulting to "sandbox". Set EBAY_ENVIRONMENT=production for production use.'
    );
  }

  // Check if redirect URI is set (needed for OAuth user flow)
  if (!process.env.EBAY_REDIRECT_URI) {
    warnings.push(
      'EBAY_REDIRECT_URI is not set. User OAuth flow will not work. Set this to enable user token generation.'
    );
  }

  // Validate EBAY_MCP_TOOLS (all | dynamic | comma-separated family list)
  const toolGatingError = getToolGatingConfigError();
  if (toolGatingError) {
    errors.push(toolGatingError);
  }

  // Validate that scope files exist
  try {
    getProductionScopes();
  } catch (error) {
    errors.push(`Failed to load production scopes: ${getErrorMessage(error)}`);
  }

  try {
    getSandboxScopes();
  } catch (error) {
    errors.push(`Failed to load sandbox scopes: ${getErrorMessage(error)}`);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    warnings,
    errors,
    infos: proxyAuth.infos,
  };
}

/**
 * Build EbayConfig from environment variables with safe defaults.
 */
export function getEbayConfig(): EbayConfig {
  const clientId = process.env.EBAY_CLIENT_ID ?? '';
  const clientSecret = process.env.EBAY_CLIENT_SECRET ?? '';
  const environment = process.env.EBAY_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  const accessToken = process.env.EBAY_USER_ACCESS_TOKEN ?? '';
  const refreshToken = process.env.EBAY_USER_REFRESH_TOKEN ?? '';
  const appAccessToken = process.env.EBAY_APP_ACCESS_TOKEN ?? '';
  const marketplaceId = (process.env.EBAY_MARKETPLACE_ID ?? '').trim() || 'EBAY_US';
  const contentLanguage = (process.env.EBAY_CONTENT_LANGUAGE ?? '').trim() || 'en-US';
  const { apiBaseUrl, disableAuthHeader } = getProxyAuthConfig();

  // Only require client credentials when this server authenticates to eBay itself.
  // In proxy auth mode the upstream proxy supplies auth, so absent credentials are
  // expected and must not nag (tokens can otherwise be generated from a refresh token).
  if (!disableAuthHeader && (clientId === '' || clientSecret === '')) {
    console.error(
      'Missing required eBay credentials. Please set:\n1) EBAY_CLIENT_ID\n2) EBAY_CLIENT_SECRET\nin your .env file at project root'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri: process.env.EBAY_REDIRECT_URI,
    marketplaceId,
    contentLanguage,
    environment,
    accessToken,
    refreshToken,
    appAccessToken,
    apiBaseUrl,
    disableAuthHeader,
  };
}

/**
 * Get the eBay REST API base URL for the configured environment.
 *
 * @param overrideBaseUrl - When set (from `EBAY_MCP_API_BASE_URL`), wins over the
 *   environment default so all traffic is routed through an authenticating proxy.
 */
export function getBaseUrl(
  environment: 'production' | 'sandbox',
  overrideBaseUrl?: string
): string {
  if (overrideBaseUrl) {
    return overrideBaseUrl;
  }
  return environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
}

/**
 * Get base URL for Identity API (uses apiz subdomain).
 *
 * @param overrideBaseUrl - When set (from `EBAY_MCP_API_BASE_URL`), wins over the
 *   `apiz` default; the proxy is then responsible for routing `apiz`-vs-`api` paths.
 */
export function getIdentityBaseUrl(
  environment: 'production' | 'sandbox',
  overrideBaseUrl?: string
): string {
  if (overrideBaseUrl) {
    return overrideBaseUrl;
  }
  return environment === 'production' ? 'https://apiz.ebay.com' : 'https://apiz.sandbox.ebay.com';
}

/** Hosts treated as loopback when deciding whether a cleartext base URL is safe. */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0']);

/**
 * Parsed and validated proxy/runtime auth overrides sourced from the `EBAY_MCP_*`
 * environment variables. Lets the server run behind an authenticating reverse
 * proxy: when {@link disableAuthHeader} is set the server attaches no eBay auth and
 * skips token acquisition, and {@link apiBaseUrl} redirects all outbound eBay
 * traffic to the proxy origin. `warnings`/`errors`/`infos` are surfaced through
 * {@link validateEnvironmentConfig} so startup and `npm run diagnose` report
 * misconfigurations consistently.
 *
 * @see https://github.com/YosefHayim/ebay-mcp/issues/122
 */
export interface ProxyAuthConfig {
  /** Normalized base-URL override (trailing slash stripped), or undefined when unset. */
  apiBaseUrl?: string;
  /** Whether all eBay auth headers and token acquisition should be skipped. */
  disableAuthHeader: boolean;
  /** Non-fatal configuration notices (e.g. cleartext credentials, no-op flag). */
  warnings: string[];
  /** Fatal configuration problems (e.g. an unparseable base URL). */
  errors: string[];
  /** Informational startup notices (e.g. proxy auth mode active). */
  infos: string[];
}

/**
 * Parse, normalize, and validate the proxy auth overrides from the environment.
 *
 * Normalization strips a trailing slash from the base URL so path concatenation
 * (`${base}${'/sell/...'}`) never yields a double slash. An unparseable URL is a
 * fatal error (fail loud at the boundary) rather than a silent fallback to
 * `api.ebay.com`. Two non-fatal warnings guard the footguns: disabling auth without
 * a base URL (requests would hit real eBay unauthenticated), and pointing the base
 * URL at a plaintext `http://` non-loopback host while auth is still on (real eBay
 * tokens would traverse the wire in cleartext).
 */
export function getProxyAuthConfig(): ProxyAuthConfig {
  const disableAuthHeader = process.env.EBAY_MCP_DISABLE_AUTH_HEADER === 'true';
  const rawBaseUrl = (process.env.EBAY_MCP_API_BASE_URL ?? '').trim();
  const warnings: string[] = [];
  const errors: string[] = [];
  const infos: string[] = [];

  let apiBaseUrl: string | undefined;
  let parsedBaseUrl: URL | undefined;
  if (rawBaseUrl) {
    try {
      parsedBaseUrl = new URL(rawBaseUrl);
      apiBaseUrl = rawBaseUrl.replace(/\/+$/, '');
    } catch {
      errors.push(
        `EBAY_MCP_API_BASE_URL is not a valid URL: "${rawBaseUrl}". ` +
          'Provide an absolute URL such as "http://localhost:8080".'
      );
    }
  }

  if (disableAuthHeader) {
    infos.push(
      'Proxy auth mode enabled (EBAY_MCP_DISABLE_AUTH_HEADER=true): eBay credentials are not required; ' +
        'authentication is delegated to the upstream proxy.'
    );
    if (!apiBaseUrl) {
      warnings.push(
        'EBAY_MCP_DISABLE_AUTH_HEADER=true but EBAY_MCP_API_BASE_URL is not set. Requests will be sent ' +
          'to eBay directly without authentication and will fail. Set EBAY_MCP_API_BASE_URL to your proxy.'
      );
    }
  }

  if (
    parsedBaseUrl &&
    !disableAuthHeader &&
    parsedBaseUrl.protocol === 'http:' &&
    !LOOPBACK_HOSTS.has(parsedBaseUrl.hostname)
  ) {
    warnings.push(
      `EBAY_MCP_API_BASE_URL points at a plaintext http:// host (${parsedBaseUrl.host}) while authentication ` +
        'is enabled. eBay access tokens will be transmitted unencrypted. Use https://, a loopback address, ' +
        'or set EBAY_MCP_DISABLE_AUTH_HEADER=true.'
    );
  }

  return { apiBaseUrl, disableAuthHeader, warnings, errors, infos };
}

/**
 * Get the OAuth token endpoint URL
 * @param environment The eBay environment ('production' or 'sandbox')
 * @returns The token endpoint URL
 */
export function getAuthUrl(environment: 'production' | 'sandbox'): string;
/**
 * Generate the OAuth authorization URL for user consent
 * @param clientId The client ID of your eBay application.
 * @param redirectUri The redirect URI configured for your eBay application.
 * @param environment The eBay environment ('production' or 'sandbox').
 * @param locale The locale for the authorization page (defaults to en_US).
 * @param prompt Whether to prompt the user for login or consent (defaults to 'login').
 * @param responseType The response type for the OAuth flow (defaults to 'code').
 * @param state An opaque value used to maintain state between the request and callback.
 *              It is also used to prevent cross-site request forgery.
 * @param scopes An array of OAuth scopes to request. If not provided, default scopes for the environment will be used.
 *
 * @return The generated OAuth authorization URL.
 *
 * This URL should be opened in a browser for the user to grant permissions
 */
export function getAuthUrl(
  clientId: string,
  redirectUri: string | undefined,
  environment: 'production' | 'sandbox',
  locale?: LocaleEnum,
  prompt?: 'login' | 'consent',
  responseType?: 'code',
  state?: string,
  scopes?: string[]
): string;
/**
 * Resolve either the OAuth token endpoint or a full user-consent authorization URL.
 */
export function getAuthUrl(
  clientIdOrEnvironment: string,
  redirectUri?: string,
  environment?: 'production' | 'sandbox',
  locale: LocaleEnum = LocaleEnum.en_US,
  prompt: 'login' | 'consent' = 'login',
  responseType: 'code' = 'code',
  state?: string,
  scopes?: string[]
): string {
  // If only one argument and it's an environment, return the token endpoint
  if (
    arguments.length === 1 &&
    (clientIdOrEnvironment === 'production' || clientIdOrEnvironment === 'sandbox')
  ) {
    return `${getBaseUrl(clientIdOrEnvironment)}/identity/v1/oauth2/token`;
  }

  // Otherwise, generate the full OAuth authorization URL
  const clientId = clientIdOrEnvironment;
  const env = environment ?? 'sandbox';
  const scope = getDefaultScopes(env);

  if (!(clientId && redirectUri)) {
    console.error(
      'clientId, redirectUri (RuName), and scope are required,please initialize the class properly.'
    );
    return '';
  }

  const authBase = env === 'production' ? 'https://auth.ebay.com' : 'https://auth.sandbox.ebay.com';

  const scopeList = scopes?.join('%20') || scope.join('%20');

  const authorizeParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    prompt,
    locale,
    ...(state ? { state } : {}),
  });

  return `${authBase}/oauth2/authorize?${authorizeParams.toString()}&scope=${scopeList}`;
}

/**
 * Generate the OAuth authorization URL for user consent
 * This URL should be opened in a browser for the user to grant permissions
 *
 * Note: Scopes are optional - eBay will automatically grant the appropriate scopes
 * based on your application's keyset configuration if scopes are not specified.
 */
export function getOAuthAuthorizationUrl(
  clientId: string,
  redirectUri: string, // MUST be eBay RuName, NOT a URL
  environment: 'production' | 'sandbox',
  scopes?: string[],
  locale?: string,
  state?: string
): string {
  const authBase =
    environment === 'production' ? 'https://auth.ebay.com' : 'https://auth.sandbox.ebay.com';

  let scopeList: string;
  if (scopes && scopes.length > 0) {
    scopeList = scopes.join('%20');
  } else {
    const defaultScopes = getDefaultScopes(environment);
    scopeList = defaultScopes.join('%20');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    ...(state ? { state } : {}),
  });

  return `${authBase}/oauth2/authorize?${params.toString()}&scope=${scopeList}`;
}

const iconUrl = (size: string): string => {
  const url = new URL(`../../public/icons/${size}.png`, import.meta.url);
  const path = fileURLToPath(url);
  if (!existsSync(path)) {
    console.warn(
      `[eBay MCP] Icon not found at ${path}. Ensure public/icons is included in the package.`
    );
  }
  return url.toString();
};

/**
 * MCP server implementation metadata advertised to clients.
 */
export const mcpConfig: Implementation = {
  name: 'eBay API Model Context Protocol Server',
  version: getVersion(),
  title: 'eBay API Model Context Protocol Server',
  websiteUrl: 'https://github.com/YosefHayim/ebay-mcp',
  icons: [
    {
      src: iconUrl('16x16'),
      mimeType: 'image/png',
      sizes: ['16x16'],
    },
    {
      src: iconUrl('32x32'),
      mimeType: 'image/png',
      sizes: ['32x32'],
    },
    {
      src: iconUrl('48x48'),
      mimeType: 'image/png',
      sizes: ['48x48'],
    },
    {
      src: iconUrl('128x128'),
      mimeType: 'image/png',
      sizes: ['128x128'],
    },
    {
      src: iconUrl('256x256'),
      mimeType: 'image/png',
      sizes: ['256x256'],
    },
    {
      src: iconUrl('512x512'),
      mimeType: 'image/png',
      sizes: ['512x512'],
    },
    {
      src: iconUrl('1024x1024'),
      mimeType: 'image/png',
      sizes: ['1024x1024'],
    },
  ],
};
