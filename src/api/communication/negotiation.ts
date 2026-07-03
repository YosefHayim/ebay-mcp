import type { EbayApiClient } from '@/api/client.js';
import {
  assertRequiredString,
  buildPaginatedQueryParams,
  getPathWithContextError,
  getWithContextError,
} from './shared.js';
import { buildTruthyPaginatedParams } from '@/api/shared/query-params.js';
import { withApiError } from '@/api/shared/request.js';

/**
 * Negotiation API - Buyer-seller negotiations and offers
 * Based on: docs/sell-apps/communication/sell_negotiation_v1_oas3.json
 */
export class NegotiationApi {
  private readonly basePath = '/sell/negotiation/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Find eligible items for a seller-initiated offer
   * Endpoint: GET /find_eligible_items
   * @param filter API filter expression.
   * @param limit Maximum number of records to return.
   * @param offset Zero-based pagination offset.
   * @throws Error if the request fails
   */
  async findEligibleItems(filter?: string, limit?: number, offset?: number) {
    const eligibleItemsPath = `${this.basePath}/find_eligible_items`;
    const queryParams = buildPaginatedQueryParams(filter, limit, offset);

    return await withApiError('Failed to find eligible items', () =>
      this.client.get(eligibleItemsPath, queryParams),
    );
  }

  /**
   * Send offer to interested buyers
   * Endpoint: POST /send_offer_to_interested_buyers
   * @throws Error if required parameters are missing or invalid
   */
  async sendOfferToInterestedBuyers(offerData: Record<string, unknown>) {
    if (!offerData || typeof offerData !== 'object') {
      throw new Error('offerData is required and must be an object');
    }

    return await withApiError('Failed to send offer to interested buyers', () =>
      this.client.post(`${this.basePath}/send_offer_to_interested_buyers`, offerData),
    );
  }

  /**
   * Get offers to buyers (Best Offers)
   * @param filter API filter expression.
   * @param limit Maximum number of records to return.
   * @param offset Zero-based pagination offset.
   * @deprecated This method does not match any endpoint in the OpenAPI spec
   */
  async getOffersToBuyers(filter?: string, limit?: number, offset?: number) {
    const params = buildTruthyPaginatedParams(filter, limit, offset);
    return await getWithContextError(
      this.client,
      `${this.basePath}/offer`,
      params,
      'Failed to get offers to buyers',
    );
  }

  /**
   * Get offers for listing (alias for getOffersToBuyers)
   * Endpoint: GET /offer
   * @throws Error if the request fails
   */
  async getOffersForListing(filter?: string, limit?: number, offset?: number) {
    return await this.getOffersToBuyers(filter, limit, offset);
  }

  /**
   * Get a specific offer
   * Endpoint: GET /offer/{offerId}
   * @param offerId Offer identifier.
   * @throws Error if required parameters are missing or invalid
   */
  async getOffer(offerId: string) {
    assertRequiredString(offerId, 'offerId');
    return await getPathWithContextError(
      this.client,
      `${this.basePath}/offer/${offerId}`,
      'Failed to get offer',
    );
  }
}
