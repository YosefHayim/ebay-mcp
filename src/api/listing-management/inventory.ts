import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { createInventoryItemsMethods } from './items.js';
import { createInventoryLocationsMethods } from './locations.js';
import { createInventoryOffersMethods } from './offers.js';

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;
type InventoryOffersMethods = ReturnType<typeof createInventoryOffersMethods>;
type InventoryLocationsMethods = ReturnType<typeof createInventoryLocationsMethods>;

export type { InventoryPaginationInput } from './shared.js';
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
} from './items.js';
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
} from './offers.js';
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
} from './locations.js';

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
