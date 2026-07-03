import type { EbayApiClient } from '@/api/client.js';
import { getIdentityBaseUrl } from '@/config/environment.js';
import { withApiError } from '@/api/shared/request.js';

/**
 * Identity API - User identity verification
 * Based on: docs/sell-apps/other-apis/commerce_identity_v1_oas3.json
 *
 * Note: Identity API uses apiz subdomain instead of api
 */
export class IdentityApi {
  private readonly basePath = '/commerce/identity/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get user information
   * Uses apiz.ebay.com instead of api.ebay.com
   */
  async getUser() {
    const config = this.client.getConfig();
    const identityBaseUrl = getIdentityBaseUrl(config.environment, config.apiBaseUrl);
    const fullUrl = `${identityBaseUrl}${this.basePath}/user`;

    return await withApiError('Failed to get user', () => this.client.getWithFullUrl(fullUrl));
  }
}
