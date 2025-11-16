import type { EbayApiClient } from '../client.js';

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
   * @throws Error if the request fails
   */
  async findEligibleItems(filter?: string, limit?: number, offset?: number) {
    const params: Record<string, string | number> = {};

    if (filter !== undefined) {
      if (typeof filter !== 'string') {
        throw new Error('filter must be a string when provided');
      }
      params.filter = filter;
    }
    if (limit !== undefined) {
      if (typeof limit !== 'number' || limit < 1) {
        throw new Error('limit must be a positive number when provided');
      }
      params.limit = limit;
    }
    if (offset !== undefined) {
      if (typeof offset !== 'number' || offset < 0) {
        throw new Error('offset must be a non-negative number when provided');
      }
      params.offset = offset;
    }

    try {
      return await this.client.get(`${this.basePath}/find_eligible_items`, params);
    } catch (error) {
      throw new Error(
        `Failed to find eligible items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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

    try {
      return await this.client.post(`${this.basePath}/send_offer_to_interested_buyers`, offerData);
    } catch (error) {
      throw new Error(
        `Failed to send offer to interested buyers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get offers to buyers (Best Offers)
   * @deprecated This method does not match any endpoint in the OpenAPI spec
   */
  async getOffersToBuyers(filter?: string, limit?: number, offset?: number) {
    const params: Record<string, string | number> = {};
    if (filter) params.filter = filter;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return await this.client.get(`${this.basePath}/offer`, params);
  }

  /**
   * Get offers for listing (alias for getOffersToBuyers)
   * Endpoint: GET /offer
   * @throws Error if the request fails
   */
  async getOffersForListing(filter?: string, limit?: number, offset?: number) {
    return this.getOffersToBuyers(filter, limit, offset);
  }

  /**
   * Get a specific offer
   * Endpoint: GET /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async getOffer(offerId: string) {
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('offerId is required and must be a string');
    }

    try {
      return await this.client.get(`${this.basePath}/offer/${offerId}`);
    } catch (error) {
      throw new Error(
        `Failed to get offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
