/**
 * Core eBay API types
 */

import type { LocaleEnum } from './ebay-enums.js';

/**
 * Runtime configuration required to authenticate eBay API clients.
 */
export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  locale?: LocaleEnum;
  marketplaceId?: string;
  contentLanguage?: string;
  environment: 'production' | 'sandbox';
  accessToken?: string;
  refreshToken?: string;
  appAccessToken?: string;
  /**
   * Overrides eBay's base host for ALL live API traffic — REST, Identity, Trading,
   * and the OAuth token endpoint. When set, every outbound eBay request targets this
   * origin instead of `api.ebay.com` / `apiz.ebay.com`, and the operator's reverse
   * proxy is responsible for routing the `apiz`-vs-`api` split internally. Sourced
   * from `EBAY_MCP_API_BASE_URL`; used to front all eBay calls through a proxy.
   * @see https://github.com/YosefHayim/ebay-mcp/issues/122
   */
  apiBaseUrl?: string;
  /**
   * When `true`, the client attaches NO eBay authentication of any kind — neither
   * `Authorization: Bearer` (REST) nor `X-EBAY-API-IAF-TOKEN` (Trading) — and skips
   * all token acquisition (no app-token mint, no refresh, no 401-retry). Client
   * credentials become optional; authentication is delegated to an upstream proxy.
   * Sourced from `EBAY_MCP_DISABLE_AUTH_HEADER`.
   * @see https://github.com/YosefHayim/ebay-mcp/issues/122
   */
  disableAuthHeader?: boolean;
  /**
   * Digital-signature credentials from the Key Management API `createSigningKey`
   * response, used to sign the calls eBay requires signatures on for EU/UK
   * sellers. Present only when `EBAY_SIGNING_KEY_JWE` and
   * `EBAY_SIGNING_PRIVATE_KEY` are both set.
   * @see https://developer.ebay.com/develop/guides/digital-signatures-for-apis
   */
  signing?: {
    /** The `jwe` value, sent in the `x-ebay-signature-key` header. */
    readonly keyJwe: string;
    /** The `privateKey` value: base64 PKCS#8 DER or PEM, Ed25519 or RSA. */
    readonly privateKey: string;
  };
}

/**
 * OAuth token response from eBay
 * Supports both client credentials and authorization code grants
 */
export interface EbayTokenCore {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresIn?: number;
}

/**
 * App access token response from client credentials flow
 * Used for application-level operations (1,000 requests/day)
 * No refresh token - app tokens are short-lived and re-generated
 */
export interface EbayAppAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * User access token with refresh token
 * Used for user-specific operations (10,000-50,000 requests/day)
 */
export interface EbayUserToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_token_expires_in: number;
  scope?: string;
}

/**
 * Stored user token data with expiry timestamps
 */
export interface StoredTokenData {
  userAccessToken: string;
  userRefreshToken: string;
  tokenType: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  locale?: LocaleEnum;
  marketplaceId?: string;
  contentLanguage?: string;
  envAppToken?: string;
  userAccessTokenExpiry?: number; // Unix timestamp in milliseconds
  userRefreshTokenExpiry?: number; // Unix timestamp in milliseconds
  scope?: string; // Optional scope string
}
