import type { components } from '../../types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import type { EbayApiClient } from '../client.js';
import {
  buildOptionalStringParams,
  buildValidatedPaginatedParams,
  optionalStringParam,
  requireObject,
  requireString,
  withApiError,
} from '../shared/request.js';

type EbayOfferDetailsWithKeys = components['schemas']['EbayOfferDetailsWithKeys'];
type EbayOfferDetailsWithAll = components['schemas']['EbayOfferDetailsWithAll'];
type GetInventoryItemResponse = components['schemas']['InventoryItemWithSkuLocaleGroupid'];
type GetInventoryItemsResponse = components['schemas']['InventoryItems'];
type GetInventoryLocationsResponse = components['schemas']['LocationResponse'];
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

  private async request<T>(failureMessage: string, operation: () => Promise<T>): Promise<T> {
    return await withApiError(failureMessage, operation);
  }

  /**
   * Get all inventory items
   * @throws Error if parameters are invalid
   */
  async getInventoryItems(limit?: number, offset?: number): Promise<GetInventoryItemsResponse> {
    const params = buildValidatedPaginatedParams(undefined, limit, offset);

    return await this.request('Failed to get inventory items', () =>
      this.client.get<GetInventoryItemsResponse>(`${this.basePath}/inventory_item`, params)
    );
  }

  /**
   * Get a specific inventory item
   * @throws Error if required parameters are missing or invalid
   */
  async getInventoryItem(sku: string): Promise<GetInventoryItemResponse> {
    requireString(sku, 'sku');

    return await this.request('Failed to get inventory item', () =>
      this.client.get<GetInventoryItemResponse>(`${this.basePath}/inventory_item/${sku}`)
    );
  }

  /**
   * Create or replace an inventory item
   * @throws Error if required parameters are missing or invalid
   */
  async createOrReplaceInventoryItem(
    sku: string,
    inventoryItem: Record<string, unknown>
  ): Promise<void> {
    requireString(sku, 'sku');
    requireObject(inventoryItem, 'inventoryItem');

    return await this.request('Failed to create or replace inventory item', () =>
      this.client.put<void>(`${this.basePath}/inventory_item/${sku}`, inventoryItem)
    );
  }

  /**
   * Delete an inventory item
   * @throws Error if required parameters are missing or invalid
   */
  async deleteInventoryItem(sku: string): Promise<void> {
    requireString(sku, 'sku');

    return await this.request('Failed to delete inventory item', () =>
      this.client.delete<void>(`${this.basePath}/inventory_item/${sku}`)
    );
  }

  /**
   * Bulk create or replace inventory items
   * Endpoint: POST /bulk_create_or_replace_inventory_item
   * @throws Error if required parameters are missing or invalid
   */
  async bulkCreateOrReplaceInventoryItem(requests: Record<string, unknown>): Promise<unknown> {
    requireObject(requests, 'requests');

    return await this.request('Failed to bulk create or replace inventory items', () =>
      this.client.post(`${this.basePath}/bulk_create_or_replace_inventory_item`, requests)
    );
  }

  /**
   * Bulk get inventory items
   * Endpoint: POST /bulk_get_inventory_item
   * @throws Error if required parameters are missing or invalid
   */
  async bulkGetInventoryItem(requests: Record<string, unknown>): Promise<unknown> {
    requireObject(requests, 'requests');

    return await this.request('Failed to bulk get inventory items', () =>
      this.client.post(`${this.basePath}/bulk_get_inventory_item`, requests)
    );
  }

  /**
   * Bulk update price and quantity
   * Endpoint: POST /bulk_update_price_quantity
   * @throws Error if required parameters are missing or invalid
   */
  async bulkUpdatePriceQuantity(requests: Record<string, unknown>): Promise<unknown> {
    requireObject(requests, 'requests');

    return await this.request('Failed to bulk update price and quantity', () =>
      this.client.post(`${this.basePath}/bulk_update_price_quantity`, requests)
    );
  }

  /**
   * Get product compatibility for an inventory item
   * Endpoint: GET /inventory_item/{sku}/product_compatibility
   * @throws Error if required parameters are missing or invalid
   */
  async getProductCompatibility(sku: string): Promise<unknown> {
    requireString(sku, 'sku');

    return await this.request('Failed to get product compatibility', () =>
      this.client.get(`${this.basePath}/inventory_item/${sku}/product_compatibility`)
    );
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
    requireString(sku, 'sku');
    requireObject(compatibility, 'compatibility');

    return await this.request('Failed to create or replace product compatibility', () =>
      this.client.put(`${this.basePath}/inventory_item/${sku}/product_compatibility`, compatibility)
    );
  }

  /**
   * Delete product compatibility for an inventory item
   * Endpoint: DELETE /inventory_item/{sku}/product_compatibility
   * @throws Error if required parameters are missing or invalid
   */
  async deleteProductCompatibility(sku: string): Promise<void> {
    requireString(sku, 'sku');

    return await this.request('Failed to delete product compatibility', () =>
      this.client.delete(`${this.basePath}/inventory_item/${sku}/product_compatibility`)
    );
  }

  /**
   * Get an inventory item group
   * Endpoint: GET /inventory_item_group/{inventoryItemGroupKey}
   * @throws Error if required parameters are missing or invalid
   */
  async getInventoryItemGroup(inventoryItemGroupKey: string): Promise<unknown> {
    requireString(inventoryItemGroupKey, 'inventoryItemGroupKey');

    return await this.request('Failed to get inventory item group', () =>
      this.client.get(`${this.basePath}/inventory_item_group/${inventoryItemGroupKey}`)
    );
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
    requireString(inventoryItemGroupKey, 'inventoryItemGroupKey');
    requireObject(inventoryItemGroup, 'inventoryItemGroup');

    return await this.request('Failed to create or replace inventory item group', () =>
      this.client.put(
        `${this.basePath}/inventory_item_group/${inventoryItemGroupKey}`,
        inventoryItemGroup
      )
    );
  }

  /**
   * Delete an inventory item group
   * Endpoint: DELETE /inventory_item_group/{inventoryItemGroupKey}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteInventoryItemGroup(inventoryItemGroupKey: string): Promise<void> {
    requireString(inventoryItemGroupKey, 'inventoryItemGroupKey');

    return await this.request('Failed to delete inventory item group', () =>
      this.client.delete(`${this.basePath}/inventory_item_group/${inventoryItemGroupKey}`)
    );
  }

  /**
   * Get all inventory locations
   * Endpoint: GET /location
   * @throws Error if parameters are invalid
   */
  async getInventoryLocations(
    limit?: number,
    offset?: number
  ): Promise<GetInventoryLocationsResponse> {
    const params = buildValidatedPaginatedParams(undefined, limit, offset);

    return await this.request('Failed to get inventory locations', () =>
      this.client.get<GetInventoryLocationsResponse>(`${this.basePath}/location`, params)
    );
  }

  /**
   * Get a specific inventory location
   * Endpoint: GET /location/{merchantLocationKey}
   * @throws Error if required parameters are missing or invalid
   */
  async getInventoryLocation(merchantLocationKey: string): Promise<unknown> {
    requireString(merchantLocationKey, 'merchantLocationKey');

    return await this.request('Failed to get inventory location', () =>
      this.client.get(`${this.basePath}/location/${merchantLocationKey}`)
    );
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
    requireString(merchantLocationKey, 'merchantLocationKey');
    requireObject(location, 'location');

    return await this.request('Failed to create or replace inventory location', () =>
      this.client.post(`${this.basePath}/location/${merchantLocationKey}`, location)
    );
  }

  /**
   * Delete an inventory location
   * Endpoint: DELETE /location/{merchantLocationKey}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteInventoryLocation(merchantLocationKey: string): Promise<void> {
    requireString(merchantLocationKey, 'merchantLocationKey');

    return await this.request('Failed to delete inventory location', () =>
      this.client.delete(`${this.basePath}/location/${merchantLocationKey}`)
    );
  }

  /**
   * Disable an inventory location
   * Endpoint: POST /location/{merchantLocationKey}/disable
   * @throws Error if required parameters are missing or invalid
   */
  async disableInventoryLocation(merchantLocationKey: string): Promise<unknown> {
    requireString(merchantLocationKey, 'merchantLocationKey');

    return await this.request('Failed to disable inventory location', () =>
      this.client.post(`${this.basePath}/location/${merchantLocationKey}/disable`, {})
    );
  }

  /**
   * Enable an inventory location
   * Endpoint: POST /location/{merchantLocationKey}/enable
   * @throws Error if required parameters are missing or invalid
   */
  async enableInventoryLocation(merchantLocationKey: string): Promise<unknown> {
    requireString(merchantLocationKey, 'merchantLocationKey');

    return await this.request('Failed to enable inventory location', () =>
      this.client.post(`${this.basePath}/location/${merchantLocationKey}/enable`, {})
    );
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
    requireString(merchantLocationKey, 'merchantLocationKey');
    requireObject(locationDetails, 'locationDetails');

    return await this.request('Failed to update location details', () =>
      this.client.post(
        `${this.basePath}/location/${merchantLocationKey}/update_location_details`,
        locationDetails
      )
    );
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
    const params = buildOptionalStringParams({ sku });
    const marketplaceIdParam = optionalStringParam(marketplaceId, 'marketplaceId');
    if (marketplaceIdParam) {
      params.marketplace_id = marketplaceIdParam;
    }

    if (limit !== undefined) {
      if (typeof limit !== 'number' || limit < 1) {
        throw new Error('limit must be a positive number when provided');
      }
      params.limit = limit;
    }

    return await this.request('Failed to get offers', () =>
      this.client.get<GetOffersResponse>(`${this.basePath}/offer`, params)
    );
  }

  /**
   * Get a specific offer
   * Endpoint: GET /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async getOffer(offerId: string): Promise<EbayOfferDetailsWithAll> {
    requireString(offerId, 'offerId');

    return await this.request('Failed to get offer', () =>
      this.client.get<EbayOfferDetailsWithAll>(`${this.basePath}/offer/${offerId}`)
    );
  }

  /**
   * Create an offer
   * @throws Error if required parameters are missing or invalid
   */
  async createOffer(offer: EbayOfferDetailsWithKeys): Promise<CreateOfferResponse> {
    requireObject(offer, 'offer');

    return await this.request('Failed to create offer', () =>
      this.client.post<CreateOfferResponse>(`${this.basePath}/offer`, offer)
    );
  }

  /**
   * Update an offer
   * Endpoint: PUT /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async updateOffer(offerId: string, offer: Record<string, unknown>): Promise<unknown> {
    requireString(offerId, 'offerId');
    requireObject(offer, 'offer');

    return await this.request('Failed to update offer', () =>
      this.client.put(`${this.basePath}/offer/${offerId}`, offer)
    );
  }

  /**
   * Delete an offer
   * Endpoint: DELETE /offer/{offerId}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteOffer(offerId: string): Promise<void> {
    requireString(offerId, 'offerId');

    return await this.request('Failed to delete offer', () =>
      this.client.delete(`${this.basePath}/offer/${offerId}`)
    );
  }

  /**
   * Publish an offer
   * @throws Error if required parameters are missing or invalid
   */
  async publishOffer(offerId: string): Promise<PublishResponse> {
    requireString(offerId, 'offerId');

    return await this.request('Failed to publish offer', () =>
      this.client.post<PublishResponse>(`${this.basePath}/offer/${offerId}/publish`)
    );
  }

  /**
   * Withdraw an offer
   * Endpoint: POST /offer/{offerId}/withdraw
   * @throws Error if required parameters are missing or invalid
   */
  async withdrawOffer(offerId: string): Promise<unknown> {
    requireString(offerId, 'offerId');

    return await this.request('Failed to withdraw offer', () =>
      this.client.post(`${this.basePath}/offer/${offerId}/withdraw`, {})
    );
  }

  /**
   * Bulk create offers
   * Endpoint: POST /bulk_create_offer
   * @throws Error if required parameters are missing or invalid
   */
  async bulkCreateOffer(requests: Record<string, unknown>): Promise<unknown> {
    requireObject(requests, 'requests');

    return await this.request('Failed to bulk create offers', () =>
      this.client.post(`${this.basePath}/bulk_create_offer`, requests)
    );
  }

  /**
   * Bulk publish offers
   * Endpoint: POST /bulk_publish_offer
   * @throws Error if required parameters are missing or invalid
   */
  async bulkPublishOffer(requests: Record<string, unknown>): Promise<unknown> {
    requireObject(requests, 'requests');

    return await this.request('Failed to bulk publish offers', () =>
      this.client.post(`${this.basePath}/bulk_publish_offer`, requests)
    );
  }

  /**
   * Get listing fees for offers
   * Endpoint: POST /offer/get_listing_fees
   * @throws Error if required parameters are missing or invalid
   */
  async getListingFees(offers: Record<string, unknown>): Promise<unknown> {
    requireObject(offers, 'offers');

    return await this.request('Failed to get listing fees', () =>
      this.client.post(`${this.basePath}/offer/get_listing_fees`, offers)
    );
  }

  /**
   * Bulk migrate listings
   * Endpoint: POST /bulk_migrate_listing
   * @throws Error if required parameters are missing or invalid
   */
  async bulkMigrateListing(requests: Record<string, unknown>): Promise<unknown> {
    requireObject(requests, 'requests');

    return await this.request('Failed to bulk migrate listings', () =>
      this.client.post(`${this.basePath}/bulk_migrate_listing`, requests)
    );
  }

  /**
   * Get listing's inventory locations (SKU location mapping)
   * Endpoint: GET /listing/{listingId}/sku/{sku}/locations
   * @throws Error if required parameters are missing or invalid
   */
  async getListingLocations(listingId: string, sku: string): Promise<unknown> {
    requireString(listingId, 'listingId');
    requireString(sku, 'sku');

    return await this.request('Failed to get listing locations', () =>
      this.client.get(`${this.basePath}/listing/${listingId}/sku/${sku}/locations`)
    );
  }

  async createOrReplaceSkuLocationMapping(
    listingId: string,
    sku: string,
    locationMapping: Record<string, unknown>
  ): Promise<void> {
    requireString(listingId, 'listingId');
    requireString(sku, 'sku');
    requireObject(locationMapping, 'locationMapping');

    return await this.request('Failed to create or replace SKU location mapping', () =>
      this.client.put(
        `${this.basePath}/listing/${listingId}/sku/${sku}/locations`,
        locationMapping,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
  }

  async deleteSkuLocationMapping(listingId: string, sku: string): Promise<void> {
    requireString(listingId, 'listingId');
    requireString(sku, 'sku');

    return await this.request('Failed to delete SKU location mapping', () =>
      this.client.delete(`${this.basePath}/listing/${listingId}/sku/${sku}/locations`)
    );
  }

  /**
   * Publish offer by inventory item group
   * Endpoint: POST /offer/publish_by_inventory_item_group
   * @throws Error if required parameters are missing or invalid
   */
  async publishOfferByInventoryItemGroup(request: Record<string, unknown>): Promise<unknown> {
    requireObject(request, 'request');

    return await this.request('Failed to publish offer by inventory item group', () =>
      this.client.post(`${this.basePath}/offer/publish_by_inventory_item_group`, request)
    );
  }

  /**
   * Withdraw offer by inventory item group
   * Endpoint: POST /offer/withdraw_by_inventory_item_group
   * @throws Error if required parameters are missing or invalid
   */
  async withdrawOfferByInventoryItemGroup(request: Record<string, unknown>): Promise<unknown> {
    requireObject(request, 'request');

    return await this.request('Failed to withdraw offer by inventory item group', () =>
      this.client.post(`${this.basePath}/offer/withdraw_by_inventory_item_group`, request)
    );
  }
}
