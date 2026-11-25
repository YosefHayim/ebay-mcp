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
	createEbayRequestFailure,
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

type RateLimitsResponse = AnalyticsComponents["schemas"]["RateLimitsResponse"];
type ClientSettings = ClientComponents["schemas"]["ClientSettings"];
type ClientDetails = ClientComponents["schemas"]["ClientDetails"];
type SigningKey = KeyComponents["schemas"]["SigningKey"];
type QuerySigningKeysResponse =
	KeyComponents["schemas"]["QuerySigningKeysResponse"];
type CreateSigningKeyRequest =
	KeyComponents["schemas"]["CreateSigningKeyRequest"];
type GetRateLimitsInput = z.infer<typeof getRateLimitsInputSchema>;
type GetUserRateLimitsInput = z.infer<typeof getUserRateLimitsInputSchema>;
type RegisterClientInput = z.infer<typeof registerClientInputSchema>;
type GetSigningKeysInput = z.infer<typeof getSigningKeysInputSchema>;
type CreateSigningKeyInput = z.infer<typeof createSigningKeyInputSchema>;
type GetSigningKeyInput = z.infer<typeof getSigningKeyInputSchema>;

function readSigningKeyBody(
	request: CreateSigningKeyRequest | undefined,
): CreateSigningKeyRequest {
	const isRequestMissing = !request;

	if (isRequestMissing) {
		return {};
	}

	return request;
}

export class DeveloperApi {
	private readonly analyticsBasePath = "/developer/analytics/v1_beta";
	private readonly clientBasePath = "/developer/registration/v1";
	private readonly keyBasePath = "/developer/key_management/v1";

	private readonly keyRequestConfig: EbayRequestConfig = {
		absolute: true,
		tokenType: "application",
	};

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
			throw createEbayRequestFailure("GET", path, cause);
		}
	};

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	// ========================================
	// RATE LIMITS (Analytics API)
	// ========================================

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

	public getSigningKeys = (
		input: GetSigningKeysInput = {},
	): Promise<QuerySigningKeysResponse> => {
		void input;
		return this.getFromKeyManagement<QuerySigningKeysResponse>(
			`${this.keyBasePath}/signing_key`,
		);
	};

	public createSigningKey = async (
		input: CreateSigningKeyInput = {},
	): Promise<SigningKey> => {
		const path = `${this.keyBasePath}/signing_key`;
		const request = input.request as CreateSigningKeyRequest | undefined;
		const signingKeyRequest = readSigningKeyBody(request);
		const url = this.keyUrl(path);

		try {
			return await this.client.post<SigningKey>(
				url,
				signingKeyRequest,
				this.keyRequestConfig,
			);
		} catch (cause) {
			throw createEbayRequestFailure("POST", path, cause);
		}
	};

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
