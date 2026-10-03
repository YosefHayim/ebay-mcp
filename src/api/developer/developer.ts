import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  createSigningKeyInputSchema,
  getRateLimitsInputSchema,
  getSigningKeyInputSchema,
  getSigningKeysInputSchema,
  getUserRateLimitsInputSchema,
  registerClientInputSchema,
} from '@/schemas/developer/developer.js';
import type { DeveloperAnalyticsComponents as AnalyticsComponents } from '@/types/application-settings/developerAnalyticsV1BetaOas3.js';
import type { DeveloperClientRegistrationComponents as ClientComponents } from '@/types/application-settings/developerClientRegistrationV1Oas3.js';
import type { DeveloperKeyManagementComponents as KeyComponents } from '@/types/application-settings/developerKeyManagementV1Oas3.js';
import { Effect } from 'effect';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';

/** Response returned by Developer Analytics rate-limit endpoints. */
type RateLimitsResponse = AnalyticsComponents['schemas']['RateLimitsResponse'];
/** Request body for registering a developer client. */
type ClientSettings = ClientComponents['schemas']['ClientSettings'];
/** Response returned after registering a developer client. */
type ClientDetails = ClientComponents['schemas']['ClientDetails'];
/** Signing key response returned by Developer Key Management endpoints. */
type SigningKey = KeyComponents['schemas']['SigningKey'];
/** Response returned by the list signing keys endpoint. */
type QuerySigningKeysResponse = KeyComponents['schemas']['QuerySigningKeysResponse'];
/** Request body for creating a signing key. */
type CreateSigningKeyRequest = KeyComponents['schemas']['CreateSigningKeyRequest'];
type GetRateLimitsInput = InferEffectSchema<typeof getRateLimitsInputSchema>;
type GetUserRateLimitsInput = InferEffectSchema<typeof getUserRateLimitsInputSchema>;
type RegisterClientInput = InferEffectSchema<typeof registerClientInputSchema>;
type GetSigningKeysInput = InferEffectSchema<typeof getSigningKeysInputSchema>;
type CreateSigningKeyInput = InferEffectSchema<typeof createSigningKeyInputSchema>;
type GetSigningKeyInput = InferEffectSchema<typeof getSigningKeyInputSchema>;

/**
 * Developer API - Rate limits, client registration, and signing keys
 * Based on:
 * - developer_analytics_v1_beta_oas3.json
 * - developer_client_registration_v1_oas3.json
 * - developer_key_management_v1_oas3.json
 */
export class DeveloperApi {
  private readonly analyticsBasePath = '/developer/analytics/v1_beta';
  private readonly clientBasePath = '/developer/client_registration/v1';
  private readonly keyBasePath = '/developer/key_management/v1';

  public constructor(private readonly client: EbayApiClient) {}

  // ========================================
  // RATE LIMITS (Analytics API)
  // ========================================

  /**
   * Retrieves application rate-limit usage across eBay APIs.
   *
   * @param input - Optional API context and API name filters.
   * @returns An Effect that succeeds with eBay's generated RateLimitsResponse.
   *
   * @example
   * ```ts
   * const limits = await Effect.runPromise(
   *   developerApi.getRateLimits({ apiContext: 'sell', apiName: 'inventory' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/developer/analytics/resources/rate_limit/methods/getRateLimits
   */
  public getRateLimits = (
    input: GetRateLimitsInput = {},
  ): Effect.Effect<RateLimitsResponse, EbayApiError> => {
    const params = buildEndpointParams({
      apiContext: { wireName: 'api_context', value: input.apiContext },
      apiName: { wireName: 'api_name', value: input.apiName },
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
   * @returns An Effect that succeeds with eBay's generated RateLimitsResponse.
   *
   * @example
   * ```ts
   * const limits = await Effect.runPromise(developerApi.getUserRateLimits({ apiContext: 'sell' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/developer/analytics/resources/user_rate_limit/methods/getUserRateLimits
   */
  public getUserRateLimits = (
    input: GetUserRateLimitsInput = {},
  ): Effect.Effect<RateLimitsResponse, EbayApiError> => {
    const params = buildEndpointParams({
      apiContext: { wireName: 'api_context', value: input.apiContext },
      apiName: { wireName: 'api_name', value: input.apiName },
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
   * Registers a third-party financial application with eBay.
   *
   * @param input - Generated ClientSettings request body.
   * @returns An Effect that succeeds with eBay's generated ClientDetails response.
   *
   * @example
   * ```ts
   * const client = await Effect.runPromise(
   *   developerApi.registerClient({ clientSettings }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/developer/client_registration/resources/client/methods/registerClient
   */
  public registerClient = (
    input: RegisterClientInput,
  ): Effect.Effect<ClientDetails, EbayApiError> =>
    requestPostEffect<ClientDetails>(
      this.client,
      `${this.clientBasePath}/client/register`,
      input.clientSettings as ClientSettings,
    );

  // ========================================
  // SIGNING KEY MANAGEMENT
  // ========================================

  /**
   * Retrieves all signing keys for the application.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's generated QuerySigningKeysResponse.
   *
   * @example
   * ```ts
   * const keys = await Effect.runPromise(developerApi.getSigningKeys({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/developer/key_management/resources/signing_key/methods/getSigningKeys
   */
  public getSigningKeys = (
    input: GetSigningKeysInput = {},
  ): Effect.Effect<QuerySigningKeysResponse, EbayApiError> => {
    void input;
    return requestGetEffect<QuerySigningKeysResponse>(
      this.client,
      `${this.keyBasePath}/signing_key`,
    );
  };

  /**
   * Creates a signing keypair for API digital signatures.
   *
   * @param input - Optional signing-key cipher request body.
   * @returns An Effect that succeeds with eBay's generated SigningKey response.
   *
   * @example
   * ```ts
   * const key = await Effect.runPromise(
   *   developerApi.createSigningKey({ request: { signingKeyCipher: 'RSA' } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/developer/key_management/resources/signing_key/methods/createSigningKey
   */
  public createSigningKey = (
    input: CreateSigningKeyInput = {},
  ): Effect.Effect<SigningKey, EbayApiError> =>
    requestPostEffect<SigningKey>(
      this.client,
      `${this.keyBasePath}/signing_key`,
      (input.request as CreateSigningKeyRequest | undefined) ?? {},
    );

  /**
   * Retrieves a specific signing key by eBay signing key ID.
   *
   * @param input - eBay-generated signing key identifier.
   * @returns An Effect that succeeds with eBay's generated SigningKey response.
   *
   * @example
   * ```ts
   * const key = await Effect.runPromise(developerApi.getSigningKey({ signingKeyId: 'key_001' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/developer/key_management/resources/signing_key/methods/getSigningKey
   */
  public getSigningKey = (
    input: GetSigningKeyInput,
  ): Effect.Effect<SigningKey, EbayApiError | EndpointInputError> =>
    Effect.gen(this, function* () {
      const endpointInput = yield* requireObjectEffect<GetSigningKeyInput>(input, 'input');
      const signingKeyId = yield* requireStringEffect(endpointInput.signingKeyId, 'signingKeyId');

      return yield* requestGetEffect<SigningKey>(
        this.client,
        `${this.keyBasePath}/signing_key/${signingKeyId}`,
      );
    });
}
