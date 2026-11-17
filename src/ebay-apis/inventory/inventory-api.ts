import type { EbayApiClient } from '@/ebay-client/ebay-api-client.js';
import { createInventoryItemsMethods } from './items-api.js';
import { createInventoryLocationsMethods } from './locations-api.js';
import { createInventoryOffersMethods } from './offers-api.js';

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;
type InventoryOffersMethods = ReturnType<typeof createInventoryOffersMethods>;
type InventoryLocationsMethods = ReturnType<typeof createInventoryLocationsMethods>;
export type { BulkCreateOrReplaceInventoryItemRequest, BulkGetInventoryItemRequest, BulkUpdatePriceQuantityRequest, InventoryItem, ProductCompatibility, InventoryItemGroup, BulkMigrateListingRequest, LocationMapping } from './items-api.js';
export type { BulkPublishOfferRequest, GetListingFeesRequest, PublishOfferByInventoryItemGroupRequest, WithdrawOfferByInventoryItemGroupRequest } from './offers-api.js';
export type { CreateInventoryLocationRequest, UpdateInventoryLocationRequest } from './locations-api.js';

/**
 * Inventory API surface: items, offers, and locations.
 * Implementation is split by subdomain; `new InventoryApi(client)` keeps stable method names.
 */
export interface InventoryApi
  extends InventoryItemsMethods,
    InventoryOffersMethods,
    InventoryLocationsMethods {}

/**
 * Composes Inventory subdomain method maps onto one facade instance.
 */
export class InventoryApi {
  public constructor(client: EbayApiClient) {
    Object.assign(
      this,
      createInventoryItemsMethods(client),
      createInventoryOffersMethods(client),
      createInventoryLocationsMethods(client),
    );
  }
}
