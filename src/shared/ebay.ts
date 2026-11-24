import type { LocaleEnum } from "./ebayEnums.js";

export interface EbayConfig {
	clientId: string;
	clientSecret: string;
	redirectUri?: string | undefined;
	locale?: LocaleEnum;
	marketplaceId?: string;
	contentLanguage?: string;
	environment: "production" | "sandbox";
	accessToken?: string | undefined;
	refreshToken?: string | undefined;
	appAccessToken?: string;
	apiBaseUrl?: string;
	disableAuthHeader?: boolean;
	signing?: {
		readonly keyJwe: string;
		readonly privateKey: string;
	};
}

export interface EbayTokenCore {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	refreshTokenExpiresIn?: number;
}

export interface EbayAuthToken extends EbayTokenCore {
	tokenType: string;
}

export interface EbayAppAccessTokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
}

export interface EbayUserToken {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	refresh_token_expires_in: number;
	scope?: string;
}

export interface StoredTokenData {
	userAccessToken: string;
	userRefreshToken: string;
	tokenType: string;
	clientId: string;
	clientSecret: string;
	redirectUri?: string | undefined;
	locale?: LocaleEnum | undefined;
	marketplaceId?: string | undefined;
	contentLanguage?: string | undefined;
	envAppToken?: string | undefined;
	userAccessTokenExpiry?: number; // Unix timestamp in milliseconds
	userRefreshTokenExpiry?: number; // Unix timestamp in milliseconds
	scope?: string | undefined; // Optional scope string
}

export interface EbayApiResponse<T = unknown> {
	data: T;
	warnings?: {
		category: string;
		domain: string;
		errorId: number;
		message: string;
	}[];
}

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

export const EbayApiCategory = {
	ACCOUNT_MANAGEMENT: "account-management",
	ANALYTICS_AND_REPORT: "analytics-and-report",
	COMMUNICATION: "communication",
	LISTING_MANAGEMENT: "listing-management",
	LISTING_METADATA: "listing-metadata",
	MARKETING_AND_PROMOTIONS: "marketing-and-promotions",
	ORDER_MANAGEMENT: "order-management",
	OTHER: "other",
} as const;

export type EbayApiCategory =
	(typeof EbayApiCategory)[keyof typeof EbayApiCategory];

export const EbayApi = {
	// Account Management
	ACCOUNT: "sell/account/v1",

	// Analytics and Report
	ANALYTICS: "sell/analytics/v1",

	// Communication
	NEGOTIATION: "sell/negotiation/v1",
	MESSAGE: "commerce/message/v1",
	NOTIFICATION: "commerce/notification/v1",
	FEEDBACK: "commerce/feedback/v1",

	// Listing Management
	INVENTORY: "sell/inventory/v1",

	// Listing Metadata
	METADATA: "sell/metadata/v1",

	// Marketing and Promotions
	MARKETING: "sell/marketing/v1",
	RECOMMENDATION: "sell/recommendation/v1",

	// Order Management
	FULFILLMENT: "sell/fulfillment/v1",

	// Other APIs
	IDENTITY: "commerce/identity/v1",
	VERO: "commerce/vero/v1",
	TRANSLATION: "commerce/translation/v1",
	EDELIVERY: "sell/logistics/v1",
} as const;

export type EbayApi = (typeof EbayApi)[keyof typeof EbayApi];

export const productionScopes = [
	"https://api.ebay.com/oauth/api_scope",
	"https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.inventory",
	"https://api.ebay.com/oauth/api_scope/sell.account",
	"https://api.ebay.com/oauth/api_scope/sell.fulfillment",
	"https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.marketing",
	"https://api.ebay.com/oauth/api_scope/sell.account.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.finances",
	"https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.reputation",
	"https://api.ebay.com/oauth/api_scope/sell.reputation.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
	"https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.stores",
	"https://api.ebay.com/oauth/api_scope/sell.stores.readonly",
	"https://api.ebay.com/oauth/scope/sell.edelivery",
	"https://api.ebay.com/oauth/api_scope/commerce.vero",
	"https://api.ebay.com/oauth/api_scope/sell.inventory.mapping",
	"https://api.ebay.com/oauth/api_scope/commerce.message",
	"https://api.ebay.com/oauth/api_scope/commerce.feedback",
	"https://api.ebay.com/oauth/api_scope/commerce.shipping",
	"https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly",
];

export const sandboxScopes = [
	"https://api.ebay.com/oauth/api_scope",
	"https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.marketing",
	"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.inventory",
	"https://api.ebay.com/oauth/api_scope/sell.account.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.account",
	"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.fulfillment",
	"https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.finances",
	"https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.reputation",
	"https://api.ebay.com/oauth/api_scope/sell.reputation.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
	"https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.stores",
	"https://api.ebay.com/oauth/api_scope/sell.stores.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.edelivery",
	"https://api.ebay.com/oauth/api_scope/commerce.vero",
	"https://api.ebay.com/oauth/api_scope/sell.inventory.mapping",
	"https://api.ebay.com/oauth/api_scope/commerce.message",
	"https://api.ebay.com/oauth/api_scope/commerce.feedback",
	"https://api.ebay.com/oauth/api_scope/commerce.shipping",
	"https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly",
	"https://api.ebay.com/oauth/api_scope/sell.item.draft",
	"https://api.ebay.com/oauth/api_scope/sell.item",
	"https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.email.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.phone.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.address.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.name.readonly",
	"https://api.ebay.com/oauth/api_scope/commerce.identity.status.readonly",
];

export const EbayOAuthApi = {
	TOKEN: "/identity/v1/oauth2/token",
	AUTHORIZE_SANDBOX: "https://auth.sandbox.ebay.com/oauth2/authorize",
	AUTHORIZE_PRODUCTION: "https://auth.ebay.com/oauth2/authorize",
	SIGNIN_SANDBOX: "https://signin.sandbox.ebay.com/signin",
	SIGNIN_PRODUCTION: "https://signin.ebay.com/signin",
} as const;

export type EbayOAuthApi = (typeof EbayOAuthApi)[keyof typeof EbayOAuthApi];

export interface EbayOAuthParams {
	client_id: string;
	redirect_uri: string;
	response_type: "code";
	scope: string;
	state?: string;
	locale?: string;
	prompt?: "login";
}
