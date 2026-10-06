/**
 * Core eBay API types
 */

import type { LocaleEnum } from './ebayEnums.js';

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
   * JWE from the Key Management API `createSigningKey` response, sent in the
   * `x-ebay-signature-key` header of digitally signed requests. Sourced from
   * `EBAY_SIGNING_KEY_JWE`; signing is enabled only when this and
   * {@link signingPrivateKey} are both set.
   * @see https://developer.ebay.com/develop/guides/digital-signatures-for-apis
   */
  signingKeyJwe?: string;
  /**
   * Private key from the same `createSigningKey` response (base64 PKCS#8 DER or
   * PEM; Ed25519 or RSA) used to sign requests eBay requires signatures on for
   * EU/UK sellers. Sourced from `EBAY_SIGNING_PRIVATE_KEY`.
   */
  signingPrivateKey?: string;
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
 * OAuth token response from eBay
 * Supports both client credentials and authorization code grants
 */
export interface EbayAuthToken extends EbayTokenCore {
  tokenType: string;
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

/**
 * Standard wrapper for successful eBay API responses and optional warnings.
 */
export interface EbayApiResponse<T = unknown> {
  data: T;
  warnings?: {
    category: string;
    domain: string;
    errorId: number;
    message: string;
  }[];
}

/**
 * Standard error payload returned by eBay APIs.
 */
export interface EbayApiError {
  errors: {
    errorId: number;
    domain: string;
    category: string;
    message: string;
    longMessage?: string;
    parameters?: {
      name: string;
      value: string;
    }[];
  }[];
}

/**
 * API category identifiers matching docs structure
 */
export enum EbayApiCategory {
  ACCOUNT_MANAGEMENT = 'account-management',
  ANALYTICS_AND_REPORT = 'analytics-and-report',
  COMMUNICATION = 'communication',
  LISTING_MANAGEMENT = 'listing-management',
  LISTING_METADATA = 'listing-metadata',
  MARKETING_AND_PROMOTIONS = 'marketing-and-promotions',
  ORDER_MANAGEMENT = 'order-management',
  OTHER = 'other',
}

/**
 * Specific API identifiers
 */
export enum EbayApi {
  // Account Management
  ACCOUNT = 'sell/account/v1',

  // Analytics and Report
  ANALYTICS = 'sell/analytics/v1',

  // Communication
  NEGOTIATION = 'sell/negotiation/v1',
  MESSAGE = 'commerce/message/v1',
  NOTIFICATION = 'commerce/notification/v1',
  FEEDBACK = 'commerce/feedback/v1',

  // Listing Management
  INVENTORY = 'sell/inventory/v1',

  // Listing Metadata
  METADATA = 'sell/metadata/v1',

  // Marketing and Promotions
  MARKETING = 'sell/marketing/v1',
  RECOMMENDATION = 'sell/recommendation/v1',

  // Order Management
  FULFILLMENT = 'sell/fulfillment/v1',

  // Other APIs
  IDENTITY = 'commerce/identity/v1',
  VERO = 'commerce/vero/v1',
  COMPLIANCE = 'sell/compliance/v1',
  TRANSLATION = 'commerce/translation/v1',
  EDELIVERY = 'sell/logistics/v1',
}

/**
 * OAuth scopes requested for production eBay authorization flows.
 */
export const productionScopes = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.marketing',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.finances',
  'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.reputation',
  'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.stores',
  'https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
  'https://api.ebay.com/oauth/scope/sell.edelivery',
  'https://api.ebay.com/oauth/api_scope/commerce.vero',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.mapping',
  'https://api.ebay.com/oauth/api_scope/commerce.message',
  'https://api.ebay.com/oauth/api_scope/commerce.feedback',
  'https://api.ebay.com/oauth/api_scope/commerce.shipping',
  'https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly',
];

/**
 * OAuth scopes requested for sandbox eBay authorization flows.
 */
export const sandboxScopes = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.marketing',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.finances',
  'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.reputation',
  'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.stores',
  'https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.edelivery',
  'https://api.ebay.com/oauth/api_scope/commerce.vero',
  'https://api.ebay.com/oauth/api_scope/sell.inventory.mapping',
  'https://api.ebay.com/oauth/api_scope/commerce.message',
  'https://api.ebay.com/oauth/api_scope/commerce.feedback',
  'https://api.ebay.com/oauth/api_scope/commerce.shipping',
  'https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.item.draft',
  'https://api.ebay.com/oauth/api_scope/sell.item',
  'https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.email.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.phone.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.address.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.name.readonly',
  'https://api.ebay.com/oauth/api_scope/commerce.identity.status.readonly',
];

/**
 * OAuth API endpoints
 */
export enum EbayOAuthApi {
  TOKEN = '/identity/v1/oauth2/token',
  AUTHORIZE_SANDBOX = 'https://auth.sandbox.ebay.com/oauth2/authorize',
  AUTHORIZE_PRODUCTION = 'https://auth.ebay.com/oauth2/authorize',
  SIGNIN_SANDBOX = 'https://signin.sandbox.ebay.com/signin',
  SIGNIN_PRODUCTION = 'https://signin.ebay.com/signin',
}

/**
 * OAuth parameter descriptions
 */
export interface EbayOAuthParams {
  client_id: string;
  redirect_uri: string;
  response_type: 'code';
  scope: string;
  state?: string;
  locale?: string;
  prompt?: 'login';
}
