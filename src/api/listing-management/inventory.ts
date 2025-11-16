import type { components } from '../../types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import type { EbayApiClient } from '../client.js';

type EbayOfferDetailsWithKeys = components['schemas']['EbayOfferDetailsWithKeys'];
type InventoryItem = components['schemas']['InventoryItem'];
type GetInventoryItemResponse = components['schemas']['InventoryItemWithSkuLocaleGroupid'];
type GetInventoryItemsResponse = components['schemas']['InventoryItems'];
type CreateOfferResponse = components['schemas']['OfferResponse'];
type GetOffersResponse = components['schemas']['Offers'];
type PublishResponse = components['schemas']['PublishResponse'];

/**
 * Inventory API - Manage listings and inventory
 * Based on: docs/sell-apps/listing-management/sell_inventory_v1_oas3.json
 */
export class InventoryApi {
  private readonly basePath = '/sell/inventory/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get all inventory items
   * @throws Error if parameters are invalid
   */
  async getInventoryItems(limit?: number, offset?: number): Promise<GetInventoryItemsResponse> {
    const params: Record<string, number> = {};

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
      return await this.client.get<GetInventoryItemsResponse>(
        `${this.basePath}/inventory_item`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get inventory items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a specific inventory item
   * @throws Error if required parameters are missing or invalid
   */
  async getInventoryItem(sku: string): Promise<GetInventoryItemResponse> {
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }

    try {
      return await this.client.get<GetInventoryItemResponse>(
        `${this.basePath}/inventory_item/${sku}`
      );
    } catch (error) {
      throw new Error(
        `Failed to get inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create or replace an inventory item
   * @throws Error if required parameters are missing or invalid
   */
  async createOrReplaceInventoryItem(sku: string, inventoryItem: InventoryItem): Promise<void> {
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }
    if (!inventoryItem || typeof inventoryItem !== 'object') {
      throw new Error('inventoryItem is required and must be an object');
    }

    try {
      return await this.client.put<void>(`${this.basePath}/inventory_item/${sku}`, inventoryItem, {
        headers: {
          'Content-Language': 'en-US',
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to create or replace inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an inventory item
   * @throws Error if required parameters are missing or invalid
   */
  async deleteInventoryItem(sku: string): Promise<void> {
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }

    try {
      return await this.client.delete<void>(`${this.basePath}/inventory_item/${sku}`);
    } catch (error) {
      throw new Error(
        `Failed to delete inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk create or replace inventory items
   * Endpoint: POST /bulk_create_or_replace_inventory_item
   * @throws Error if required parameters are missing or invalid
   */
  async bulkCreateOrReplaceInventoryItem(requests: Record<string, unknown>): Promise<unknown> {
    if (!requests || typeof requests !== 'object') {
      throw new Error('requests is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/bulk_create_or_replace_inventory_item`,
        requests,
        {
          headers: {
            'Content-Language': 'en-US',
          },
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to bulk create or replace inventory items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk get inventory items
   * Endpoint: POST /bulk_get_inventory_item
   * @throws Error if required parameters are missing or invalid
   */
  async bulkGetInventoryItem(requests: Record<string, unknown>): Promise<unknown> {
    if (!requests || typeof requests !== 'object') {
      throw new Error('requests is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/bulk_get_inventory_item`, requests);
    } catch (error) {
      throw new Error(
        `Failed to bulk get inventory items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk update price and quantity
   * Endpoint: POST /bulk_update_price_quantity
   * @throws Error if required parameters are missing or invalid
   */
  async bulkUpdatePriceQuantity(requests: Record<string, unknown>): Promise<unknown> {
    if (!requests || typeof requests !== 'object') {
      throw new Error('requests is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/bulk_update_price_quantity`, requests);
    } catch (error) {
      throw new Error(
        `Failed to bulk update price and quantity: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product compatibility for an inventory item
   * Endpoint: GET /inventory_item/{sku}/product_compatibility
   * @throws Error if required parameters are missing or invalid
   */
  async getProductCompatibility(sku: string): Promise<unknown> {
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }

    try {
      return await this.client.get(`${this.basePath}/inventory_item/${sku}/product_compatibility`);
    } catch (error) {
      throw new Error(
        `Failed to get product compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create or replace product compatibility for an inventory item
   * Endpoint: PUT /inventory_item/{sku}/product_compatibility
   * @throws Error if required parameters are missing or invalid
   */
  async createOrReplaceProductCompatibility(
    sku: string,
    compatibility: Record<string, unknown>
  ): Promise<unknown> {
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }
    if (!compatibility || typeof compatibility !== 'object') {
      throw new Error('compatibility is required and must be an object');
    }

    try {
      return await this.client.put(
        `${this.basePath}/inventory_item/${sku}/product_compatibility`,
        compatibility,
        {
          headers: {
            'Content-Language': 'en-US',
          },
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to create or replace product compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete product compatibility for an inventory item
   * Endpoint: DELETE /inventory_item/{sku}/product_compatibility
   * @throws Error if required parameters are missing or invalid
   */
  async deleteProductCompatibility(sku: string): Promise<void> {
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }

    try {
      return await this.client.delete(
        `${this.basePath}/inventory_item/${sku}/product_compatibility`
      );
    } catch (error) {
      throw new Error(
        `Failed to delete product compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get an inventory item group
   * Endpoint: GET /inventory_item_group/{inventoryItemGroupKey}
   * @throws Error if required parameters are missing or invalid
   */
  async getInventoryItemGroup(inventoryItemGroupKey: string): Promise<unknown> {
    if (!inventoryItemGroupKey || typeof inventoryItemGroupKey !== 'string') {
      throw new Error('inventoryItemGroupKey is required and must be a string');
    }

    try {
      return await this.client.get(
        `${this.basePath}/inventory_item_group/${inventoryItemGroupKey}`
      );
    } catch (error) {
      throw new Error(
        `Failed to get inventory item group: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create or replace an inventory item group
   * Endpoint: PUT /inventory_item_group/{inventoryItemGroupKey}
   * @throws Error if required parameters are missing or invalid
   */
  async createOrReplaceInventoryItemGroup(
    inventoryItemGroupKey: string,
    inventoryItemGroup: Record<string, unknown>
  ): Promise<unknown> {
    if (!inventoryItemGroupKey || typeof inventoryItemGroupKey !== 'string') {
      throw new Error('inventoryItemGroupKey is required and must be a string');
    }
    if (!inventoryItemGroup || typeof inventoryItemGroup !== 'object') {
      throw new Error('inventoryItemGroup is required and must be an object');
    }

    try {
      return await this.client.put(
        `${this.basePath}/inventory_item_group/${inventoryItemGroupKey}`,
        inventoryItemGroup,
        {
          headers: {
            'Content-Language': 'en-US',
          },
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to create or replace inventory item group: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an inventory item group
   * Endpoint: DELETE /inventory_item_group/{inventoryItemGroupKey}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteInventoryItemGroup(inventoryItemGroupKey: string): Promise<void> {
    if (!inventoryItemGroupKey || typeof inventoryItemGroupKey !== 'string') {
      throw new Error('inventoryItemGroupKey is required and must be a string');
    }

    try {
      return await this.client.delete(
        `${this.basePath}/inventory_item_group/${inventoryItemGroupKey}`
      );
    } catch (error) {
      throw new Error(
        `Failed to delete inventory item group: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all inventory locations
   * Endpoint: GET /location
   * @throws Error if parameters are invalid
   */
  async getInventoryLocations(limit?: number, offset?: number): Promise<unknown> {
    const params: Record<string, number> = {};

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
      return await this.client.get(`${this.basePath}/location`, params);
    } catch (error) {
      throw new Error(
        `Failed to get inventory locations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a specific inventory location
   * Endpoint: GET /location/{merchantLocationKey}
   * @throws Error if required parameters are missing or invalid
   */
  async getInventoryLocation(merchantLocationKey: string): Promise<unknown> {
    if (!merchantLocationKey || typeof merchantLocationKey !== 'string') {
      throw new Error('merchantLocationKey is required and must be a string');
    }

    try {
      return await this.client.get(`${this.basePath}/location/${merchantLocationKey}`);
    } catch (error) {
      throw new Error(
        `Failed to get inventory location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create or replace an inventory location
   * Endpoint: POST /location/{merchantLocationKey}
   * @throws Error if required parameters are missing or invalid
   */
  async createOrReplaceInventoryLocation(
    merchantLocationKey: string,
    location: Record<string, unknown>
  ): Promise<void> {
    if (!merchantLocationKey || typeof merchantLocationKey !== 'string') {
      throw new Error('merchantLocationKey is required and must be a string');
    }
    if (!location || typeof location !== 'object') {
      throw new Error('location is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/location/${merchantLocationKey}`, location);
    } catch (error) {
      throw new Error(
        `Failed to create or replace inventory location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an inventory location
   * Endpoint: DELETE /location/{merchantLocationKey}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteInventoryLocation(merchantLocationKey: string): Promise<void> {
    if (!merchantLocationKey || typeof merchantLocationKey !== 'string') {
      throw new Error('merchantLocationKey is required and must be a string');
    }

    try {
      return await this.client.delete(`${this.basePath}/location/${merchantLocationKey}`);
    } catch (error) {
      throw new Error(
        `Failed to delete inventory location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disable an inventory location
   * Endpoint: POST /location/{merchantLocationKey}/disable
   * @throws Error if required parameters are missing or invalid
   */
  async disableInventoryLocation(merchantLocationKey: string): Promise<unknown> {
    if (!merchantLocationKey || typeof merchantLocationKey !== 'string') {
      throw new Error('merchantLocationKey is required and must be a string');
    }

    try {
      return await this.client.post(`${this.basePath}/location/${merchantLocationKey}/disable`, {});
    } catch (error) {
      throw new Error(
        `Failed to disable inventory location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Enable an inventory location
   * Endpoint: POST /location/{merchantLocationKey}/enable
   * @throws Error if required parameters are missing or invalid
   */
  async enableInventoryLocation(merchantLocationKey: string): Promise<unknown> {
    if (!merchantLocationKey || typeof merchantLocationKey !== 'string') {
      throw new Error('merchantLocationKey is required and must be a string');
    }

    try {
      return await this.client.post(`${this.basePath}/location/${merchantLocationKey}/enable`, {});
    } catch (error) {
      throw new Error(
        `Failed to enable inventory location: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update location details
   * Endpoint: POST /location/{merchantLocationKey}/update_location_details
   * @throws Error if required parameters are missing or invalid
   */
  async updateLocationDetails(
    merchantLocationKey: string,
    locationDetails: Record<string, unknown>
  ): Promise<void> {
    if (!merchantLocationKey || typeof merchantLocationKey !== 'string') {
      throw new Error('merchantLocationKey is required and must be a string');
    }
    if (!locationDetails || typeof locationDetails !== 'object') {
      throw new Error('locationDetails is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/location/${merchantLocationKey}/update_location_details`,
        locationDetails
      );
    } catch (error) {
      throw new Error(
        `Failed to update location details: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all offers
   * @throws Error if parameters are invalid
   */
  async getOffers(
    sku?: string,
    marketplaceId?: string,
    limit?: number
  ): Promise<GetOffersResponse> {
    const params: Record<string, string | number> = {};

    if (sku !== undefined) {
      if (typeof sku !== 'string') {
        throw new Error('sku must be a string when provided');
      }
      params.sku = sku;
    }
    if (marketplaceId !== undefined) {
      if (typeof marketplaceId !== 'string') {
        throw new Error('marketplaceId must be a string when provided');
      }
      params.marketplace_id = marketplaceId;
    }
    if (limit !== undefined) {
      if (typeof limit !== 'number' || limit < 1) {
        throw new Error('limit must be a positive number when provided');
      }
      params.limit = limit;
    }

    try {
      return await this.client.get<GetOffersResponse>(`${this.basePath}/offer`, params);
    } catch (error) {
      throw new Error(
        `Failed to get offers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a specific offer
   * Endpoint: GET /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async getOffer(offerId: string): Promise<unknown> {
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

  /**
   * Create an offer
   * @throws Error if required parameters are missing or invalid
   */
  async createOffer(offer: EbayOfferDetailsWithKeys): Promise<CreateOfferResponse> {
    if (!offer || typeof offer !== 'object') {
      throw new Error('offer is required and must be an object');
    }

    try {
      return await this.client.post<CreateOfferResponse>(`${this.basePath}/offer`, offer, {
        headers: {
          'Content-Language': 'en-US',
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to create offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an offer
   * Endpoint: PUT /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async updateOffer(offerId: string, offer: Record<string, unknown>): Promise<unknown> {
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('offerId is required and must be a string');
    }
    if (!offer || typeof offer !== 'object') {
      throw new Error('offer is required and must be an object');
    }

    try {
      return await this.client.put(`${this.basePath}/offer/${offerId}`, offer, {
        headers: {
          'Content-Language': 'en-US',
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to update offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete an offer
   * Endpoint: DELETE /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteOffer(offerId: string): Promise<void> {
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('offerId is required and must be a string');
    }

    try {
      return await this.client.delete(`${this.basePath}/offer/${offerId}`);
    } catch (error) {
      throw new Error(
        `Failed to delete offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Publish an offer
   * @throws Error if required parameters are missing or invalid
   */
  async publishOffer(offerId: string): Promise<PublishResponse> {
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('offerId is required and must be a string');
    }

    try {
      return await this.client.post<PublishResponse>(`${this.basePath}/offer/${offerId}/publish`);
    } catch (error) {
      throw new Error(
        `Failed to publish offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Withdraw an offer
   * Endpoint: POST /offer/{offerId}/withdraw
   * @throws Error if required parameters are missing or invalid
   */
  async withdrawOffer(offerId: string): Promise<unknown> {
    if (!offerId || typeof offerId !== 'string') {
      throw new Error('offerId is required and must be a string');
    }

    try {
      return await this.client.post(`${this.basePath}/offer/${offerId}/withdraw`, {});
    } catch (error) {
      throw new Error(
        `Failed to withdraw offer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk create offers
   * Endpoint: POST /bulk_create_offer
   * @throws Error if required parameters are missing or invalid
   */
  async bulkCreateOffer(requests: Record<string, unknown>): Promise<unknown> {
    if (!requests || typeof requests !== 'object') {
      throw new Error('requests is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/bulk_create_offer`, requests, {
        headers: {
          'Content-Language': 'en-US',
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to bulk create offers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk publish offers
   * Endpoint: POST /bulk_publish_offer
   * @throws Error if required parameters are missing or invalid
   */
  async bulkPublishOffer(requests: Record<string, unknown>): Promise<unknown> {
    if (!requests || typeof requests !== 'object') {
      throw new Error('requests is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/bulk_publish_offer`, requests);
    } catch (error) {
      throw new Error(
        `Failed to bulk publish offers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get listing fees for offers
   * Endpoint: POST /offer/get_listing_fees
   * @throws Error if required parameters are missing or invalid
   */
  async getListingFees(offers: Record<string, unknown>): Promise<unknown> {
    if (!offers || typeof offers !== 'object') {
      throw new Error('offers is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/offer/get_listing_fees`, offers);
    } catch (error) {
      throw new Error(
        `Failed to get listing fees: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bulk migrate listings
   * Endpoint: POST /bulk_migrate_listing
   * @throws Error if required parameters are missing or invalid
   */
  async bulkMigrateListing(requests: Record<string, unknown>): Promise<unknown> {
    if (!requests || typeof requests !== 'object') {
      throw new Error('requests is required and must be an object');
    }

    try {
      return await this.client.post(`${this.basePath}/bulk_migrate_listing`, requests);
    } catch (error) {
      throw new Error(
        `Failed to bulk migrate listings: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get listing's inventory locations
   * Endpoint: GET /listing/{listingId}/sku/{sku}/locations
   * @throws Error if required parameters are missing or invalid
   */
  async getListingLocations(listingId: string, sku: string): Promise<unknown> {
    if (!listingId || typeof listingId !== 'string') {
      throw new Error('listingId is required and must be a string');
    }
    if (!sku || typeof sku !== 'string') {
      throw new Error('sku is required and must be a string');
    }

    try {
      return await this.client.get(`${this.basePath}/listing/${listingId}/sku/${sku}/locations`);
    } catch (error) {
      throw new Error(
        `Failed to get listing locations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Publish offer by inventory item group
   * Endpoint: POST /offer/publish_by_inventory_item_group
   * @throws Error if required parameters are missing or invalid
   */
  async publishOfferByInventoryItemGroup(request: Record<string, unknown>): Promise<unknown> {
    if (!request || typeof request !== 'object') {
      throw new Error('request is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/offer/publish_by_inventory_item_group`,
        request
      );
    } catch (error) {
      throw new Error(
        `Failed to publish offer by inventory item group: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Withdraw offer by inventory item group
   * Endpoint: POST /offer/withdraw_by_inventory_item_group
   * @throws Error if required parameters are missing or invalid
   */
  async withdrawOfferByInventoryItemGroup(request: Record<string, unknown>): Promise<unknown> {
    if (!request || typeof request !== 'object') {
      throw new Error('request is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/offer/withdraw_by_inventory_item_group`,
        request
      );
    } catch (error) {
      throw new Error(
        `Failed to withdraw offer by inventory item group: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
