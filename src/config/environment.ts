import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { EbayConfig } from '@/types/ebay.js';
import { version } from 'os';
import { title } from 'process';
import type { Implementation } from '@modelcontextprotocol/sdk/types.js';

config();

// Get the current directory for loading scope files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  return environment === 'production' ? getProductionScopes() : getSandboxScopes();
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
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check required environment variables
  if (!process.env.EBAY_CLIENT_ID) {
    errors.push('EBAY_CLIENT_ID is not set. OAuth will not work.');
  }

  if (!process.env.EBAY_CLIENT_SECRET) {
    errors.push('EBAY_CLIENT_SECRET is not set. OAuth will not work.');
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

  // Validate that scope files exist
  try {
    getProductionScopes();
  } catch (error) {
    errors.push(
      `Failed to load production scopes: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  try {
    getSandboxScopes();
  } catch (error) {
    errors.push(
      `Failed to load sandbox scopes: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    warnings,
    errors,
  };
}

export function getEbayConfig(): EbayConfig {
  const clientId = process.env.EBAY_CLIENT_ID ?? '';
  const clientSecret = process.env.EBAY_CLIENT_SECRET ?? '';
  const environment = (process.env.EBAY_ENVIRONMENT ?? 'sandbox') as 'production' | 'sandbox';
  const accessToken = process.env.EBAY_USER_ACCESS_TOKEN ?? '';
  const refreshToken = process.env.EBAY_USER_REFRESH_TOKEN ?? '';
  const appAccessToken = process.env.EBAY_APP_ACCESS_TOKEN ?? '';

  if (
    clientId === '' ||
    clientSecret === '' ||
    accessToken === '' ||
    refreshToken === '' ||
    appAccessToken === ''
  ) {
    console.error(
      'Missing required eBay credentials. Please set the follow:\n1) EBAY_CLIENT_ID\n2) EBAY_CLIENT_SECRET\n3) EBAY_USER_ACCESS_TOKEN\n4) EBAY_USER_REFRESH_TOKEN\n5) EBAY_APP_ACCESS_TOKEN in your .env file at project root'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri: process.env.EBAY_REDIRECT_URI,
    environment,
    accessToken,
    refreshToken,
    appAccessToken,
  };
}

export function getBaseUrl(environment: 'production' | 'sandbox'): string {
  return environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
}

/**
 * Get base URL for Identity API (uses apiz subdomain)
 */
export function getIdentityBaseUrl(environment: 'production' | 'sandbox'): string {
  return environment === 'production' ? 'https://apiz.ebay.com' : 'https://apiz.sandbox.ebay.com';
}

export function getAuthUrl(environment: 'production' | 'sandbox'): string {
  return environment === 'production'
    ? 'https://api.ebay.com/identity/v1/oauth2/token'
    : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
}

// fix the fn below i am attaching example from other project that is working properly with the genreate oauth
/**
 * Generate the OAuth authorization URL for user consent
 * This URL should be opened in a browser for the user to grant permissions
 */
export function getOAuthAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  environment: 'production' | 'sandbox',
  scopes?: string[],
  locale?: string,
  state?: string
): string {
  // Use environment-specific scopes if no custom scopes provided
  const defaultScopes = getDefaultScopes(environment);
  const scopesList = scopes && scopes.length > 0 ? scopes : defaultScopes;
  const scopeParam = scopesList.join(' ');

  // Build the authorize URL
  const authDomain =
    environment === 'production' ? 'https://auth.ebay.com' : 'https://auth.sandbox.ebay.com';

  const authorizeEndpoint = `${authDomain}/oauth2/authorize`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopeParam,
  });

  if (state) {
    params.append('state', state);
  }

  // Build the signin URL that redirects to authorize
  const signinDomain =
    environment === 'production' ? 'https://signin.ebay.com' : 'https://signin.sandbox.ebay.com';

  const ruParam = encodeURIComponent(`${authorizeEndpoint}?${params.toString()}`);

  return `${signinDomain}/signin?ru=${ruParam}&sgfl=oauth2_login&AppName=${clientId}`;
}

export const mcpConfig: Implementation = {
  name: 'eBay API Model Context Protocol Server',
  version: '1.4.0',
  title: 'eBay API Model Context Protocol Server',
  description: 'Access eBay APIs to manage listings, orders, and inventory.',
  websiteUrl: 'https://github.com/ebay/ebay-mcp-server',
  icons: [
    {
      src: './48x48.png',
      mimeType: 'image/png',
      sizes: ['48x48'],
    },
    {
      src: './128x128.png',
      mimeType: 'image/png',
      sizes: ['128x128'],
    },
    {
      src: './256x256.png',
      mimeType: 'image/png',
      sizes: ['256x256'],
    },
    {
      src: './512x512.png',
      mimeType: 'image/png',
      sizes: ['512x512'],
    },
    {
      src: './1024x1024.png',
      mimeType: 'image/png',
      sizes: ['1024x1024'],
    },
  ],
};
