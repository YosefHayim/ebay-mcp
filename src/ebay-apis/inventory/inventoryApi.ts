import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { createInventoryItemsMethods } from "./itemsApi.js";
import { createInventoryLocationsMethods } from "./locationsApi.js";
import { createInventoryOffersMethods } from "./offersApi.js";

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;
type InventoryOffersMethods = ReturnType<typeof createInventoryOffersMethods>;
type InventoryLocationsMethods = ReturnType<
	typeof createInventoryLocationsMethods
>;

export type { InventoryPaginationInput } from "./inventorySharedApi.js";
export type {
	BaseResponse,
	BulkCreateOrReplaceInventoryItemRequest,
	BulkCreateOrReplaceInventoryItemResponse,
	BulkGetInventoryItemInput,
	BulkGetInventoryItemRequest,
	BulkGetInventoryItemResponse,
	BulkInventoryItemInput,
	BulkMigrateListingInput,
	BulkMigrateListingRequest,
	BulkMigrateListingResponse,
	BulkUpdatePriceQuantityInput,
	BulkUpdatePriceQuantityRequest,
	BulkUpdatePriceQuantityResponse,
	CreateOrReplaceInventoryItemGroupInput,
	CreateOrReplaceInventoryItemInput,
	CreateOrReplaceProductCompatibilityInput,
	CreateOrReplaceSkuLocationMappingInput,
	CreateOrReplaceSkuLocationMappingResponse,
	DeleteInventoryItemGroupResponse,
	DeleteInventoryItemResponse,
	DeleteProductCompatibilityResponse,
	DeleteSkuLocationMappingResponse,
	GetInventoryItemResponse,
	GetInventoryItemsResponse,
	InventoryItem,
	InventoryItemGroup,
	InventoryItemGroupKeyInput,
	LocationMapping,
	ProductCompatibility,
	SkuInput,
	SkuLocationMappingInput,
} from "./itemsApi.js";
export type {
	CreateInventoryLocationInput,
	CreateInventoryLocationRequest,
	CreateInventoryLocationResponse,
	DeleteInventoryLocationResponse,
	DisableInventoryLocationResponse,
	EnableInventoryLocationResponse,
	GetInventoryLocationResponse,
	GetInventoryLocationsResponse,
	MerchantLocationKeyInput,
	UpdateInventoryLocationInput,
	UpdateInventoryLocationRequest,
	UpdateInventoryLocationResponse,
} from "./locationsApi.js";
export type {
	BulkCreateOfferInput,
	BulkCreateOfferRequest,
	BulkCreateOfferResponse,
	BulkPublishOfferInput,
	BulkPublishOfferRequest,
	BulkPublishOfferResponse,
	CreateOfferInput,
	CreateOfferRequest,
	CreateOfferResponse,
	DeleteOfferResponse,
	GetListingFeesInput,
	GetListingFeesRequest,
	GetListingFeesResponse,
	GetOfferResponse,
	GetOffersInput,
	GetOffersResponse,
	OfferIdInput,
	PublishOfferByInventoryItemGroupInput,
	PublishOfferByInventoryItemGroupRequest,
	PublishOfferResponse,
	UpdateOfferInput,
	UpdateOfferRequest,
	WithdrawOfferByInventoryItemGroupInput,
	WithdrawOfferByInventoryItemGroupRequest,
	WithdrawOfferByInventoryItemGroupResponse,
	WithdrawOfferResponse,
} from "./offersApi.js";

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
