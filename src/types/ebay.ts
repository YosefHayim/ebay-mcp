/**
 * Core eBay API types
 */

export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  environment: 'production' | 'sandbox';
}

/**
 * OAuth token response from eBay
 * Supports both client credentials and authorization code grants
 */
export interface EbayAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
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
 * Stored token data with expiry timestamps
 */
export interface StoredTokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiry: number; // Unix timestamp in milliseconds
  refreshTokenExpiry: number; // Unix timestamp in milliseconds
  scope?: string;
}

export interface EbayApiResponse<T = any> {
  data: T;
  warnings?: Array<{
    category: string;
    domain: string;
    errorId: number;
    message: string;
  }>;
}

export interface EbayApiError {
  errors: Array<{
    errorId: number;
    domain: string;
    category: string;
    message: string;
    longMessage?: string;
    parameters?: Array<{
      name: string;
      value: string;
    }>;
  }>;
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
  OTHER = 'other'
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
  EDELIVERY = 'sell/logistics/v1'
}
