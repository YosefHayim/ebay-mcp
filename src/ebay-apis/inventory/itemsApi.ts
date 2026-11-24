import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requestPutEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import {
	INVENTORY_BASE_PATH,
	type InventoryPaginationInput,
} from "./inventorySharedApi.js";

export interface SkuInput {
	readonly sku: string;
}

export interface CreateOrReplaceInventoryItemInput {
	readonly sku: string;
	readonly body: InventoryItem;
	readonly contentLanguage?: string | undefined;
}

export interface CreateOrReplaceProductCompatibilityInput {
	readonly sku: string;
	readonly body: ProductCompatibility;
}

export interface InventoryItemGroupKeyInput {
	readonly inventoryItemGroupKey: string;
}

export interface CreateOrReplaceInventoryItemGroupInput {
	readonly inventoryItemGroupKey: string;
	readonly body: InventoryItemGroup;
}

export interface BulkInventoryItemInput {
	readonly body: BulkCreateOrReplaceInventoryItemRequest;
}

export interface BulkGetInventoryItemInput {
	readonly body: BulkGetInventoryItemRequest;
}

export interface BulkUpdatePriceQuantityInput {
	readonly body: BulkUpdatePriceQuantityRequest;
}

export interface BulkMigrateListingInput {
	readonly body: BulkMigrateListingRequest;
}

export interface SkuLocationMappingInput {
	readonly listingId: string;
	readonly sku: string;
}

export interface CreateOrReplaceSkuLocationMappingInput
	extends SkuLocationMappingInput {
	readonly body: LocationMapping;
}

export type BulkCreateOrReplaceInventoryItemRequest =
	components["schemas"]["BulkInventoryItem"];

export type BulkCreateOrReplaceInventoryItemResponse =
	components["schemas"]["BulkInventoryItemResponse"];

export type BulkGetInventoryItemRequest =
	components["schemas"]["BulkGetInventoryItem"];

export type BulkGetInventoryItemResponse =
	components["schemas"]["BulkGetInventoryItemResponse"];

export type BulkUpdatePriceQuantityRequest =
	components["schemas"]["BulkPriceQuantity"];

export type BulkUpdatePriceQuantityResponse =
	components["schemas"]["BulkPriceQuantityResponse"];

export type GetInventoryItemResponse =
	components["schemas"]["InventoryItemWithSkuLocaleGroupid"];

interface InventoryFulfillmentTime {
	readonly unit?: string | undefined;
	readonly value?: number | undefined;
}

interface InventoryAvailabilityDistribution {
	readonly fulfillmentTime?: InventoryFulfillmentTime | undefined;
	readonly merchantLocationKey?: string | undefined;
	readonly quantity?: number | undefined;
}

interface InventoryShipToAvailability {
	readonly availabilityDistributions?:
		| readonly InventoryAvailabilityDistribution[]
		| undefined;
	readonly quantity?: number | undefined;
}

interface InventoryAvailability {
	readonly shipToLocationAvailability?: InventoryShipToAvailability | undefined;
}

interface InventoryConditionDescriptor {
	readonly name?: string | undefined;
	readonly values?: readonly string[] | undefined;
}

interface InventoryPackageDimensions {
	readonly height?: number | undefined;
	readonly length?: number | undefined;
	readonly unit?: string | undefined;
	readonly width?: number | undefined;
}

interface InventoryPackageWeight {
	readonly unit?: string | undefined;
	readonly value?: number | undefined;
}

interface InventoryPackageWeightAndSize {
	readonly dimensions?: InventoryPackageDimensions | undefined;
	readonly packageType?: string | undefined;
	readonly weight?: InventoryPackageWeight | undefined;
}

interface InventoryProduct {
	readonly aspects?: string | Record<string, readonly string[]> | undefined;
	readonly brand?: string | undefined;
	readonly description?: string | undefined;
	readonly ean?: readonly string[] | undefined;
	readonly epid?: string | undefined;
	readonly imageUrls?: readonly string[] | undefined;
	readonly isbn?: readonly string[] | undefined;
	readonly mpn?: string | undefined;
	readonly subtitle?: string | undefined;
	readonly title?: string | undefined;
	readonly upc?: readonly string[] | undefined;
	readonly videoIds?: readonly string[] | undefined;
}

export interface InventoryItem {
	readonly availability?: InventoryAvailability | undefined;
	readonly condition?: string | undefined;
	readonly conditionDescription?: string | undefined;
	readonly conditionDescriptors?:
		| readonly InventoryConditionDescriptor[]
		| undefined;
	readonly locale?: string | undefined;
	readonly packageWeightAndSize?: InventoryPackageWeightAndSize | undefined;
	readonly product?: InventoryProduct | undefined;
}

export type BaseResponse = components["schemas"]["BaseResponse"];

export type DeleteInventoryItemResponse = void;

export type GetInventoryItemsResponse = components["schemas"]["InventoryItems"];

export type ProductCompatibility = components["schemas"]["Compatibility"];

export type DeleteProductCompatibilityResponse = void;

export type InventoryItemGroup = components["schemas"]["InventoryItemGroup"];

export type DeleteInventoryItemGroupResponse = void;

export type BulkMigrateListingRequest =
	components["schemas"]["BulkMigrateListing"];

export type BulkMigrateListingResponse =
	components["schemas"]["BulkMigrateListingResponse"];

export type LocationMapping = components["schemas"]["LocationMapping"];

export type CreateOrReplaceSkuLocationMappingResponse = void;

export type DeleteSkuLocationMappingResponse = void;

export function createInventoryItemsMethods(client: EbayApiClient) {
	return {
		getInventoryItems: async (
			input: InventoryPaginationInput = {},
		): Promise<GetInventoryItemsResponse> => {
			const path = `${INVENTORY_BASE_PATH}/inventory_item`;

			const validatedInput = requireObjectEffect<InventoryPaginationInput>(
				input,
				"input",
			);
			const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
			const offset = optionalNonNegativeNumberEffect(
				validatedInput.offset,
				"offset",
			);
			const params = buildEndpointParams({
				limit: {
					wireName: "limit",
					value: limit === undefined ? undefined : String(limit),
				},
				offset: {
					wireName: "offset",
					value: offset === undefined ? undefined : String(offset),
				},
			});

			return requestGetEffect<GetInventoryItemsResponse>(client, path, params);
		},

		getInventoryItem: async (
			input: SkuInput,
		): Promise<GetInventoryItemResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<SkuInput>(input, "input");
			const sku = requireStringEffect(validatedInput.sku, "sku");

			return requestGetEffect<GetInventoryItemResponse>(
				client,
				`${basePath}/inventory_item/${sku}`,
			);
		},

		createOrReplaceInventoryItem: async (
			input: CreateOrReplaceInventoryItemInput,
		): Promise<BaseResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput =
				requireObjectEffect<CreateOrReplaceInventoryItemInput>(input, "input");
			const sku = requireStringEffect(validatedInput.sku, "sku");
			const inventoryItem = requireObjectEffect<InventoryItem>(
				validatedInput.body,
				"body",
			);
			const config =
				validatedInput.contentLanguage === undefined
					? undefined
					: { headers: { "Content-Language": validatedInput.contentLanguage } };

			return requestPutEffect<BaseResponse>(
				client,
				`${basePath}/inventory_item/${sku}`,
				inventoryItem,
				config,
			);
		},

		deleteInventoryItem: async (
			input: SkuInput,
		): Promise<DeleteInventoryItemResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<SkuInput>(input, "input");
			const sku = requireStringEffect(validatedInput.sku, "sku");

			return requestDeleteEffect<DeleteInventoryItemResponse>(
				client,
				`${basePath}/inventory_item/${sku}`,
			);
		},

		bulkCreateOrReplaceInventoryItem: async (
			input: BulkInventoryItemInput,
		): Promise<BulkCreateOrReplaceInventoryItemResponse> => {
			const path = `${INVENTORY_BASE_PATH}/bulk_create_or_replace_inventory_item`;

			const validatedInput = requireObjectEffect<BulkInventoryItemInput>(
				input,
				"input",
			);
			const bulkInventoryItemRequest =
				requireObjectEffect<BulkCreateOrReplaceInventoryItemRequest>(
					validatedInput.body,
					"body",
				);

			return requestPostEffect<BulkCreateOrReplaceInventoryItemResponse>(
				client,
				path,
				bulkInventoryItemRequest,
			);
		},

		bulkGetInventoryItem: async (
			input: BulkGetInventoryItemInput,
		): Promise<BulkGetInventoryItemResponse> => {
			const path = `${INVENTORY_BASE_PATH}/bulk_get_inventory_item`;

			const validatedInput = requireObjectEffect<BulkGetInventoryItemInput>(
				input,
				"input",
			);
			const bulkGetInventoryItemRequest =
				requireObjectEffect<BulkGetInventoryItemRequest>(
					validatedInput.body,
					"body",
				);

			return requestPostEffect<BulkGetInventoryItemResponse>(
				client,
				path,
				bulkGetInventoryItemRequest,
			);
		},

		bulkUpdatePriceQuantity: async (
			input: BulkUpdatePriceQuantityInput,
		): Promise<BulkUpdatePriceQuantityResponse> => {
			const path = `${INVENTORY_BASE_PATH}/bulk_update_price_quantity`;

			const validatedInput = requireObjectEffect<BulkUpdatePriceQuantityInput>(
				input,
				"input",
			);
			const bulkPriceQuantityRequest =
				requireObjectEffect<BulkUpdatePriceQuantityRequest>(
					validatedInput.body,
					"body",
				);

			return requestPostEffect<BulkUpdatePriceQuantityResponse>(
				client,
				path,
				bulkPriceQuantityRequest,
			);
		},

		getProductCompatibility: async (
			input: SkuInput,
		): Promise<ProductCompatibility> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<SkuInput>(input, "input");
			const sku = requireStringEffect(validatedInput.sku, "sku");

			return requestGetEffect<ProductCompatibility>(
				client,
				`${basePath}/inventory_item/${sku}/product_compatibility`,
			);
		},

		createOrReplaceProductCompatibility: async (
			input: CreateOrReplaceProductCompatibilityInput,
		): Promise<BaseResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput =
				requireObjectEffect<CreateOrReplaceProductCompatibilityInput>(
					input,
					"input",
				);
			const sku = requireStringEffect(validatedInput.sku, "sku");
			const productCompatibility = requireObjectEffect<ProductCompatibility>(
				validatedInput.body,
				"body",
			);

			return requestPutEffect<BaseResponse>(
				client,
				`${basePath}/inventory_item/${sku}/product_compatibility`,
				productCompatibility,
			);
		},

		deleteProductCompatibility: async (
			input: SkuInput,
		): Promise<DeleteProductCompatibilityResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<SkuInput>(input, "input");
			const sku = requireStringEffect(validatedInput.sku, "sku");

			return requestDeleteEffect<DeleteProductCompatibilityResponse>(
				client,
				`${basePath}/inventory_item/${sku}/product_compatibility`,
			);
		},

		getInventoryItemGroup: async (
			input: InventoryItemGroupKeyInput,
		): Promise<InventoryItemGroup> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<InventoryItemGroupKeyInput>(
				input,
				"input",
			);
			const inventoryItemGroupKey = requireStringEffect(
				validatedInput.inventoryItemGroupKey,
				"inventoryItemGroupKey",
			);

			return requestGetEffect<InventoryItemGroup>(
				client,
				`${basePath}/inventory_item_group/${inventoryItemGroupKey}`,
			);
		},

		createOrReplaceInventoryItemGroup: async (
			input: CreateOrReplaceInventoryItemGroupInput,
		): Promise<BaseResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput =
				requireObjectEffect<CreateOrReplaceInventoryItemGroupInput>(
					input,
					"input",
				);
			const inventoryItemGroupKey = requireStringEffect(
				validatedInput.inventoryItemGroupKey,
				"inventoryItemGroupKey",
			);
			const inventoryItemGroup = requireObjectEffect<InventoryItemGroup>(
				validatedInput.body,
				"body",
			);

			return requestPutEffect<BaseResponse>(
				client,
				`${basePath}/inventory_item_group/${inventoryItemGroupKey}`,
				inventoryItemGroup,
			);
		},

		deleteInventoryItemGroup: async (
			input: InventoryItemGroupKeyInput,
		): Promise<DeleteInventoryItemGroupResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<InventoryItemGroupKeyInput>(
				input,
				"input",
			);
			const inventoryItemGroupKey = requireStringEffect(
				validatedInput.inventoryItemGroupKey,
				"inventoryItemGroupKey",
			);

			return requestDeleteEffect<DeleteInventoryItemGroupResponse>(
				client,
				`${basePath}/inventory_item_group/${inventoryItemGroupKey}`,
			);
		},

		bulkMigrateListing: async (
			input: BulkMigrateListingInput,
		): Promise<BulkMigrateListingResponse> => {
			const path = `${INVENTORY_BASE_PATH}/bulk_migrate_listing`;

			const validatedInput = requireObjectEffect<BulkMigrateListingInput>(
				input,
				"input",
			);
			const bulkMigrateListingRequest =
				requireObjectEffect<BulkMigrateListingRequest>(
					validatedInput.body,
					"body",
				);

			return requestPostEffect<BulkMigrateListingResponse>(
				client,
				path,
				bulkMigrateListingRequest,
			);
		},

		getSkuLocationMapping: async (
			input: SkuLocationMappingInput,
		): Promise<LocationMapping> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<SkuLocationMappingInput>(
				input,
				"input",
			);
			const listingId = requireStringEffect(
				validatedInput.listingId,
				"listingId",
			);
			const sku = requireStringEffect(validatedInput.sku, "sku");

			return requestGetEffect<LocationMapping>(
				client,
				`${basePath}/listing/${listingId}/sku/${sku}/locations`,
			);
		},

		createOrReplaceSkuLocationMapping: async (
			input: CreateOrReplaceSkuLocationMappingInput,
		): Promise<CreateOrReplaceSkuLocationMappingResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput =
				requireObjectEffect<CreateOrReplaceSkuLocationMappingInput>(
					input,
					"input",
				);
			const listingId = requireStringEffect(
				validatedInput.listingId,
				"listingId",
			);
			const sku = requireStringEffect(validatedInput.sku, "sku");
			const locationMapping = requireObjectEffect<LocationMapping>(
				validatedInput.body,
				"body",
			);

			return requestPutEffect<CreateOrReplaceSkuLocationMappingResponse>(
				client,
				`${basePath}/listing/${listingId}/sku/${sku}/locations`,
				locationMapping,
			);
		},

		deleteSkuLocationMapping: async (
			input: SkuLocationMappingInput,
		): Promise<DeleteSkuLocationMappingResponse> => {
			const basePath = INVENTORY_BASE_PATH;

			const validatedInput = requireObjectEffect<SkuLocationMappingInput>(
				input,
				"input",
			);
			const listingId = requireStringEffect(
				validatedInput.listingId,
				"listingId",
			);
			const sku = requireStringEffect(validatedInput.sku, "sku");

			return requestDeleteEffect<DeleteSkuLocationMappingResponse>(
				client,
				`${basePath}/listing/${listingId}/sku/${sku}/locations`,
			);
		},
	};
}
