import type { EbayApiClient } from '@/ebay-client/ebay-api-client.js';
import { createInventoryItemsMethods } from './items-api.js';
import { createInventoryLocationsMethods } from './locations-api.js';
import { createInventoryOffersMethods } from './offers-api.js';

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;
type InventoryOffersMethods = ReturnType<typeof createInventoryOffersMethods>;
type InventoryLocationsMethods = ReturnType<typeof createInventoryLocationsMethods>;

export type { InventoryPaginationInput } from './inventory-shared-api.js';
export type {
  SkuInput,
  CreateOrReplaceInventoryItemInput,
  CreateOrReplaceProductCompatibilityInput,
  InventoryItemGroupKeyInput,
  CreateOrReplaceInventoryItemGroupInput,
  BulkInventoryItemInput,
  BulkGetInventoryItemInput,
  BulkUpdatePriceQuantityInput,
  BulkMigrateListingInput,
  SkuLocationMappingInput,
  CreateOrReplaceSkuLocationMappingInput,
  BulkCreateOrReplaceInventoryItemRequest,
  BulkCreateOrReplaceInventoryItemResponse,
  BulkGetInventoryItemRequest,
  BulkGetInventoryItemResponse,
  BulkUpdatePriceQuantityRequest,
  BulkUpdatePriceQuantityResponse,
  GetInventoryItemResponse,
  InventoryItem,
  BaseResponse,
  DeleteInventoryItemResponse,
  GetInventoryItemsResponse,
  ProductCompatibility,
  DeleteProductCompatibilityResponse,
  InventoryItemGroup,
  DeleteInventoryItemGroupResponse,
  BulkMigrateListingRequest,
  BulkMigrateListingResponse,
  LocationMapping,
  CreateOrReplaceSkuLocationMappingResponse,
  DeleteSkuLocationMappingResponse,
} from './items-api.js';
export type {
  GetOffersInput,
  OfferIdInput,
  CreateOfferInput,
  UpdateOfferInput,
  BulkCreateOfferInput,
  BulkPublishOfferInput,
  GetListingFeesInput,
  PublishOfferByInventoryItemGroupInput,
  WithdrawOfferByInventoryItemGroupInput,
  BulkCreateOfferRequest,
  BulkCreateOfferResponse,
  BulkPublishOfferRequest,
  BulkPublishOfferResponse,
  GetOffersResponse,
  CreateOfferRequest,
  CreateOfferResponse,
  GetOfferResponse,
  UpdateOfferRequest,
  DeleteOfferResponse,
  GetListingFeesRequest,
  GetListingFeesResponse,
  PublishOfferResponse,
  PublishOfferByInventoryItemGroupRequest,
  WithdrawOfferResponse,
  WithdrawOfferByInventoryItemGroupRequest,
  WithdrawOfferByInventoryItemGroupResponse,
} from './offers-api.js';
export type {
  MerchantLocationKeyInput,
  CreateInventoryLocationInput,
  UpdateInventoryLocationInput,
  GetInventoryLocationResponse,
  CreateInventoryLocationRequest,
  CreateInventoryLocationResponse,
  DeleteInventoryLocationResponse,
  DisableInventoryLocationResponse,
  EnableInventoryLocationResponse,
  GetInventoryLocationsResponse,
  UpdateInventoryLocationRequest,
  UpdateInventoryLocationResponse,
} from './locations-api.js';

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
