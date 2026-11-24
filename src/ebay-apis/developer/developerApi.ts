import type { z } from "zod";
import type {
	createSigningKeyInputSchema,
	getRateLimitsInputSchema,
	getSigningKeyInputSchema,
	getSigningKeysInputSchema,
	getUserRateLimitsInputSchema,
	registerClientInputSchema,
} from "@/ebay-apis/developer/developerSchemas.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	EbayApiError,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { DeveloperAnalyticsComponents as AnalyticsComponents } from "@/ebay-openapi-types/developerAnalyticsV1BetaOas3.js";
import type { DeveloperClientRegistrationComponents as ClientComponents } from "@/ebay-openapi-types/developerClientRegistrationV1Oas3.js";
import type { DeveloperKeyManagementComponents as KeyComponents } from "@/ebay-openapi-types/developerKeyManagementV1Oas3.js";
import {
	getClientRegistrationBaseUrl,
	getIdentityBaseUrl,
} from "@/shared/environment.js";

/** Response returned by Developer Analytics rate-limit endpoints. */
type RateLimitsResponse = AnalyticsComponents["schemas"]["RateLimitsResponse"];
/** Request body for registering a developer client. */
type ClientSettings = ClientComponents["schemas"]["ClientSettings"];
/** Response returned after registering a developer client. */
type ClientDetails = ClientComponents["schemas"]["ClientDetails"];
/** Signing key response returned by Developer Key Management endpoints. */
type SigningKey = KeyComponents["schemas"]["SigningKey"];
/** Response returned by the list signing keys endpoint. */
type QuerySigningKeysResponse =
	KeyComponents["schemas"]["QuerySigningKeysResponse"];
/** Request body for creating a signing key. */
type CreateSigningKeyRequest =
	KeyComponents["schemas"]["CreateSigningKeyRequest"];
type GetRateLimitsInput = z.infer<typeof getRateLimitsInputSchema>;
type GetUserRateLimitsInput = z.infer<typeof getUserRateLimitsInputSchema>;
type RegisterClientInput = z.infer<typeof registerClientInputSchema>;
type GetSigningKeysInput = z.infer<typeof getSigningKeysInputSchema>;
type CreateSigningKeyInput = z.infer<typeof createSigningKeyInputSchema>;
type GetSigningKeyInput = z.infer<typeof getSigningKeyInputSchema>;

/**
 * Developer API - Rate limits, client registration, and signing keys
 * Based on:
 * - developer_analytics_v1_beta_oas3.json
 * - developer_client_registration_v1_oas3.json
 * - developer_key_management_v1_oas3.json
 */
export class DeveloperApi {
	private readonly analyticsBasePath = "/developer/analytics/v1_beta";
	private readonly clientBasePath = "/developer/registration/v1";
	private readonly keyBasePath = "/developer/key_management/v1";

	/**
	 * Key Management is served from the apiz host (api.ebay.com answers 404) and
	 * authenticates with a client-credentials application token.
	 */
	private readonly keyRequestConfig: EbayRequestConfig = {
		absolute: true,
		tokenType: "application",
	};

	/** Full apiz URL for a Key Management path, honouring EBAY_MCP_API_BASE_URL. */
	private readonly keyUrl = (path: string): string => {
		const { environment, apiBaseUrl } = this.client.getConfig();
		const identityBaseUrl = getIdentityBaseUrl(environment, apiBaseUrl);
		return `${identityBaseUrl}${path}`;
	};

	private readonly getFromKeyManagement = async <T>(
		path: string,
	): Promise<T> => {
		const url = this.keyUrl(path);

		try {
			return await this.client.get<T>(url, undefined, this.keyRequestConfig);
		} catch (cause) {
			throw new EbayApiError({ method: "GET", path, cause });
		}
	};

	public constructor(private readonly client: EbayApiClient) {}

	// ========================================
	// RATE LIMITS (Analytics API)
	// ========================================

	/**
	 * Retrieves application rate-limit usage across eBay APIs.
	 *
	 * @param input - Optional API context and API name filters.
	 * @returns eBay's generated RateLimitsResponse.
	 *
	 * @example
	 * ```ts
	 * const limits = await developerApi.getRateLimits({ apiContext: 'sell', apiName: 'inventory' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/developer/analytics/resources/rate_limit/methods/getRateLimits
	 */
	public getRateLimits = (
		input: GetRateLimitsInput = {},
	): Promise<RateLimitsResponse> => {
		const params = buildEndpointParams({
			apiContext: { wireName: "api_context", value: input.apiContext },
			apiName: { wireName: "api_name", value: input.apiName },
		});

		return requestGetEffect<RateLimitsResponse>(
			this.client,
			`${this.analyticsBasePath}/rate_limit/`,
			params,
		);
	};

	/**
	 * Retrieves user-specific rate-limit usage across eBay APIs.
	 *
	 * @param input - Optional API context and API name filters.
	 * @returns eBay's generated RateLimitsResponse.
	 *
	 * @example
	 * ```ts
	 * const limits = await developerApi.getUserRateLimits({ apiContext: 'sell' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/developer/analytics/resources/user_rate_limit/methods/getUserRateLimits
	 */
	public getUserRateLimits = (
		input: GetUserRateLimitsInput = {},
	): Promise<RateLimitsResponse> => {
		const params = buildEndpointParams({
			apiContext: { wireName: "api_context", value: input.apiContext },
			apiName: { wireName: "api_name", value: input.apiName },
		});

		return requestGetEffect<RateLimitsResponse>(
			this.client,
			`${this.analyticsBasePath}/user_rate_limit/`,
			params,
		);
	};

	// ========================================
	// CLIENT REGISTRATION
	// ========================================

	/**
	 * Registers a third-party financial application with eBay through the tppz host.
	 *
	 * @param input - Generated ClientSettings request body.
	 * @returns eBay's generated ClientDetails response.
	 *
	 * @example
	 * ```ts
	 * const client = await developerApi.registerClient({ clientSettings });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/developer/client_registration/resources/client/methods/registerClient
	 */
	public registerClient = (
		input: RegisterClientInput,
	): Promise<ClientDetails> => {
		const { environment, apiBaseUrl } = this.client.getConfig();
		const registrationBaseUrl = getClientRegistrationBaseUrl(
			environment,
			apiBaseUrl,
		);
		return requestPostEffect<ClientDetails>(
			this.client,
			`${registrationBaseUrl}${this.clientBasePath}/client/register`,
			input.clientSettings as ClientSettings,
			{ absolute: true },
		);
	};

	// ========================================
	// SIGNING KEY MANAGEMENT
	// ========================================

	/**
	 * Retrieves all signing keys for the application.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns eBay's QuerySigningKeysResponse.
	 *
	 * @example
	 * ```ts
	 * const keys = await developerApi.getSigningKeys({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/developer/key_management/resources/signing_key/methods/getSigningKeys
	 */
	public getSigningKeys = (
		input: GetSigningKeysInput = {},
	): Promise<QuerySigningKeysResponse> => {
		void input;
		return this.getFromKeyManagement<QuerySigningKeysResponse>(
			`${this.keyBasePath}/signing_key`,
		);
	};

	/**
	 * Creates a signing keypair for API digital signatures.
	 *
	 * @param input - Optional signing-key cipher request body.
	 * @returns eBay's SigningKey response.
	 *
	 * @example
	 * ```ts
	 * const key = await developerApi.createSigningKey({
	 *   request: { signingKeyCipher: "RSA" },
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/developer/key_management/resources/signing_key/methods/createSigningKey
	 */
	public createSigningKey = async (
		input: CreateSigningKeyInput = {},
	): Promise<SigningKey> => {
		const path = `${this.keyBasePath}/signing_key`;
		const signingKeyRequest =
			(input.request as CreateSigningKeyRequest | undefined) || {};
		const url = this.keyUrl(path);

		try {
			return await this.client.post<SigningKey>(
				url,
				signingKeyRequest,
				this.keyRequestConfig,
			);
		} catch (cause) {
			throw new EbayApiError({ method: "POST", path, cause });
		}
	};

	/**
	 * Retrieves a specific signing key by eBay signing key ID.
	 *
	 * @param input - eBay-generated signing key identifier.
	 * @returns eBay's SigningKey response.
	 *
	 * @example
	 * ```ts
	 * const key = await developerApi.getSigningKey({ signingKeyId: "key_001" });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/developer/key_management/resources/signing_key/methods/getSigningKey
	 */
	public getSigningKey = async (
		input: GetSigningKeyInput,
	): Promise<SigningKey> => {
		const endpointInput = requireObjectEffect<GetSigningKeyInput>(
			input,
			"input",
		);
		const signingKeyId = requireStringEffect(
			endpointInput.signingKeyId,
			"signingKeyId",
		);

		return await this.getFromKeyManagement<SigningKey>(
			`${this.keyBasePath}/signing_key/${encodeURIComponent(signingKeyId)}`,
		);
	};
}
