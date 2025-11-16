import type { EbayApiClient } from '@/api/client.js';
import type { components } from '@/types/sell-apps/markeitng-and-promotions/sellRecommendationV1Oas3.js';

type PagedListingRecommendationCollection =
  components['schemas']['PagedListingRecommendationCollection'];

/**
 * Recommendation API - Listing recommendations
 * Based on: docs/sell-apps/marketing-and-promotions/sell_recommendation_v1_oas3.json
 */
export class RecommendationApi {
  private readonly basePath = '/sell/recommendation/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Find listing recommendations
   * Endpoint: POST /find
   */
  async findListingRecommendations(
    requestBody?: { listingIds?: string[] },
    filter?: string,
    limit?: number,
    offset?: number,
    marketplaceId?: string
  ): Promise<PagedListingRecommendationCollection> {
    const params: Record<string, string | number> = {};
    if (filter) params.filter = filter;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const headers: Record<string, string> = {};
    if (marketplaceId) {
      headers['X-EBAY-C-MARKETPLACE-ID'] = marketplaceId;
    }

    return await this.client.post<PagedListingRecommendationCollection>(
      `${this.basePath}/find`,
      requestBody || {},
      {
        params,
        headers,
      }
    );
  }
}
