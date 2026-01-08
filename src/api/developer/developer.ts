import type { EbayApiClient } from '@/api/client.js';
import type { components as AnalyticsComponents } from '@/types/application-settings/developerAnalyticsV1BetaOas3.js';
import type { components as ClientComponents } from '@/types/application-settings/developerClientRegistrationV1Oas3.js';
import type { components as KeyComponents } from '@/types/application-settings/developerKeyManagementV1Oas3.js';

type RateLimitsResponse = AnalyticsComponents['schemas']['RateLimitsResponse'];
type ClientSettings = ClientComponents['schemas']['ClientSettings'];
type ClientDetails = ClientComponents['schemas']['ClientDetails'];
type SigningKey = KeyComponents['schemas']['SigningKey'];
type QuerySigningKeysResponse = KeyComponents['schemas']['QuerySigningKeysResponse'];
type CreateSigningKeyRequest = KeyComponents['schemas']['CreateSigningKeyRequest'];

/**
 * Developer API - Rate limits, client registration, and signing keys
 * Based on:
 * - docs/sell-apps/application-settings/developer_analytics_v1_beta_oas3.json
 * - docs/sell-apps/application-settings/developer_client_registration_v1_oas3.json
 * - docs/sell-apps/application-settings/developer_key_management_v1_oas3.json
 */
export class DeveloperApi {
  private readonly analyticsBasePath = '/developer/analytics/v1_beta';
  private readonly clientBasePath = '/developer/client_registration/v1';
  private readonly keyBasePath = '/developer/key_management/v1';

  constructor(private client: EbayApiClient) {}

  // ========================================
  // RATE LIMITS (Analytics API)
  // ========================================

  /**
   * Get application rate limits
   * Endpoint: GET /rate_limit/
   */
  async getRateLimits(apiContext?: string, apiName?: string): Promise<RateLimitsResponse> {
    const params: Record<string, string> = {};
    if (apiContext) params.api_context = apiContext;
    if (apiName) params.api_name = apiName;

    return await this.client.get<RateLimitsResponse>(
      `${this.analyticsBasePath}/rate_limit/`,
      Object.keys(params).length > 0 ? params : undefined
    );
  }

  /**
   * Get user rate limits
   * Endpoint: GET /user_rate_limit/
   */
  async getUserRateLimits(apiContext?: string, apiName?: string): Promise<RateLimitsResponse> {
    const params: Record<string, string> = {};
    if (apiContext) params.api_context = apiContext;
    if (apiName) params.api_name = apiName;

    return await this.client.get<RateLimitsResponse>(
      `${this.analyticsBasePath}/user_rate_limit/`,
      Object.keys(params).length > 0 ? params : undefined
    );
  }

  // ========================================
  // CLIENT REGISTRATION
  // ========================================

  /**
   * Register a new third party financial application with eBay
   * Endpoint: POST /client/register
   * Note: This is primarily for Open Banking / PSD2 compliance
   */
  async registerClient(clientSettings: ClientSettings): Promise<ClientDetails> {
    return await this.client.post<ClientDetails>(
      `${this.clientBasePath}/client/register`,
      clientSettings
    );
  }

  // ========================================
  // SIGNING KEY MANAGEMENT
  // ========================================

  /**
   * Get all signing keys for the application
   * Endpoint: GET /signing_key
   */
  async getSigningKeys(): Promise<QuerySigningKeysResponse> {
    return await this.client.get<QuerySigningKeysResponse>(`${this.keyBasePath}/signing_key`);
  }

  /**
   * Create a new signing key
   * Endpoint: POST /signing_key
   */
  async createSigningKey(request?: CreateSigningKeyRequest): Promise<SigningKey> {
    return await this.client.post<SigningKey>(`${this.keyBasePath}/signing_key`, request || {});
  }

  /**
   * Get a specific signing key by ID
   * Endpoint: GET /signing_key/{signing_key_id}
   */
  async getSigningKey(signingKeyId: string): Promise<SigningKey> {
    if (!signingKeyId || typeof signingKeyId !== 'string') {
      throw new Error('signingKeyId is required and must be a string');
    }

    return await this.client.get<SigningKey>(`${this.keyBasePath}/signing_key/${signingKeyId}`);
  }
}
