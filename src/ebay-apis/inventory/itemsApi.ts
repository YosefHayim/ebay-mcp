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

/** Input accepted by inventory item SKU endpoints. */
export interface SkuInput {
	/** Seller-defined SKU value. */
	readonly sku: string;
}

/** Input accepted by createOrReplaceInventoryItem. */
export interface CreateOrReplaceInventoryItemInput {
	/** Seller-defined SKU value. */
	readonly sku: string;
	/** Generated InventoryItem body. */
	readonly body: InventoryItem;
	/**
	 * `Content-Language` for this write, for example `en-US`. Defaults to the
	 * client's configured language; pass the item's own locale when rewriting an
	 * existing item so its localized fields stay attached to the right language.
	 */
	readonly contentLanguage?: string | undefined;
}

/** Input accepted by product compatibility write endpoints. */
export interface CreateOrReplaceProductCompatibilityInput {
	/** Seller-defined SKU value. */
	readonly sku: string;
	/** Generated Compatibility body. */
	readonly body: ProductCompatibility;
}

/** Input accepted by inventory item group ID endpoints. */
export interface InventoryItemGroupKeyInput {
	/** Seller-defined inventory item group key. */
	readonly inventoryItemGroupKey: string;
}

/** Input accepted by createOrReplaceInventoryItemGroup. */
export interface CreateOrReplaceInventoryItemGroupInput {
	/** Seller-defined inventory item group key. */
	readonly inventoryItemGroupKey: string;
	/** Generated InventoryItemGroup body. */
	readonly body: InventoryItemGroup;
}

/** Input accepted by bulk inventory item endpoints. */
export interface BulkInventoryItemInput {
	/** Generated bulk inventory item body. */
	readonly body: BulkCreateOrReplaceInventoryItemRequest;
}

/** Input accepted by bulk get inventory item. */
export interface BulkGetInventoryItemInput {
	/** Generated bulk get inventory item body. */
	readonly body: BulkGetInventoryItemRequest;
}

/** Input accepted by bulk price and quantity updates. */
export interface BulkUpdatePriceQuantityInput {
	/** Generated bulk price and quantity body. */
	readonly body: BulkUpdatePriceQuantityRequest;
}

/** Input accepted by bulk listing migration. */
export interface BulkMigrateListingInput {
	/** Generated bulk migrate listing body. */
	readonly body: BulkMigrateListingRequest;
}

/** Input accepted by listing SKU location mapping ID endpoints. */
export interface SkuLocationMappingInput {
	/** eBay listing ID that owns the SKU. */
	readonly listingId: string;
	/** Seller-defined SKU value inside the listing. */
	readonly sku: string;
}

/** Input accepted by createOrReplaceSkuLocationMapping. */
export interface CreateOrReplaceSkuLocationMappingInput
	extends SkuLocationMappingInput {
	/** Generated LocationMapping body. */
	readonly body: LocationMapping;
}

/**
 * Request body accepted by bulkCreateOrReplaceInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem
 */
export type BulkCreateOrReplaceInventoryItemRequest =
	components["schemas"]["BulkInventoryItem"];

/**
 * Response returned by bulkCreateOrReplaceInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem
 */
export type BulkCreateOrReplaceInventoryItemResponse =
	components["schemas"]["BulkInventoryItemResponse"];

/**
 * Request body accepted by bulkGetInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem
 */
export type BulkGetInventoryItemRequest =
	components["schemas"]["BulkGetInventoryItem"];

/**
 * Response returned by bulkGetInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem
 */
export type BulkGetInventoryItemResponse =
	components["schemas"]["BulkGetInventoryItemResponse"];

/**
 * Request body accepted by bulkUpdatePriceQuantity.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity
 */
export type BulkUpdatePriceQuantityRequest =
	components["schemas"]["BulkPriceQuantity"];

/**
 * Response returned by bulkUpdatePriceQuantity.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity
 */
export type BulkUpdatePriceQuantityResponse =
	components["schemas"]["BulkPriceQuantityResponse"];

/**
 * Response returned by getInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItem
 */
export type GetInventoryItemResponse =
	components["schemas"]["InventoryItemWithSkuLocaleGroupid"];

/** How soon a warehouse can ship one inventory item. */
interface InventoryFulfillmentTime {
	readonly unit?: string | undefined;
	readonly value?: number | undefined;
}

/** Quantity of one inventory item at one warehouse. */
interface InventoryAvailabilityDistribution {
	readonly fulfillmentTime?: InventoryFulfillmentTime | undefined;
	readonly merchantLocationKey?: string | undefined;
	readonly quantity?: number | undefined;
}

/** Ship-to-home quantity for one inventory item. */
interface InventoryShipToAvailability {
	readonly availabilityDistributions?:
		| readonly InventoryAvailabilityDistribution[]
		| undefined;
	readonly quantity?: number | undefined;
}

/** Quantity available to ship or pick up. */
interface InventoryAvailability {
	readonly shipToLocationAvailability?: InventoryShipToAvailability | undefined;
}

/** Structured condition detail on an inventory item. */
interface InventoryConditionDescriptor {
	readonly name?: string | undefined;
	readonly values?: readonly string[] | undefined;
}

/** Package length, width, and height. */
interface InventoryPackageDimensions {
	readonly height?: number | undefined;
	readonly length?: number | undefined;
	readonly unit?: string | undefined;
	readonly width?: number | undefined;
}

/** Package weight. */
interface InventoryPackageWeight {
	readonly unit?: string | undefined;
	readonly value?: number | undefined;
}

/** Shipping package size and weight. */
interface InventoryPackageWeightAndSize {
	readonly dimensions?: InventoryPackageDimensions | undefined;
	readonly packageType?: string | undefined;
	readonly weight?: InventoryPackageWeight | undefined;
}

/**
 * Product fields on an inventory item.
 * The generated OpenAPI type models `aspects` as a string; the wire value is a
 * map of aspect name to values, which is what create and replace send.
 */
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

/**
 * Request body accepted by createOrReplaceInventoryItem.
 * Optional members may be undefined because callers pass parsed input through.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
 */
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

/**
 * Response returned by write endpoints that use BaseResponse.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
 */
export type BaseResponse = components["schemas"]["BaseResponse"];

/**
 * No-content response returned by deleteInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/deleteInventoryItem
 */
export type DeleteInventoryItemResponse = void;

/**
 * Response returned by getInventoryItems.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
 */
export type GetInventoryItemsResponse = components["schemas"]["InventoryItems"];

/**
 * Generated compatibility body and response used by product compatibility endpoints.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/getProductCompatibility
 */
export type ProductCompatibility = components["schemas"]["Compatibility"];

/**
 * No-content response returned by deleteProductCompatibility.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/deleteProductCompatibility
 */
export type DeleteProductCompatibilityResponse = void;

/**
 * Generated inventory item group body and response.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item_group/methods/getInventoryItemGroup
 */
export type InventoryItemGroup = components["schemas"]["InventoryItemGroup"];

/**
 * No-content response returned by deleteInventoryItemGroup.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item_group/methods/deleteInventoryItemGroup
 */
export type DeleteInventoryItemGroupResponse = void;

/**
 * Request body accepted by bulkMigrateListing.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkMigrateListing
 */
export type BulkMigrateListingRequest =
	components["schemas"]["BulkMigrateListing"];

/**
 * Response returned by bulkMigrateListing.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkMigrateListing
 */
export type BulkMigrateListingResponse =
	components["schemas"]["BulkMigrateListingResponse"];

/**
 * Generated location mapping body and response.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/getSkuLocationMapping
 */
export type LocationMapping = components["schemas"]["LocationMapping"];

/**
 * No-content response returned by createOrReplaceSkuLocationMapping.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/createOrReplaceSkuLocationMapping
 */
export type CreateOrReplaceSkuLocationMappingResponse = void;

/**
 * No-content response returned by deleteSkuLocationMapping.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/deleteSkuLocationMapping
 */
export type DeleteSkuLocationMappingResponse = void;

/** Inventory API — items methods closed over a shared client. */
export const createInventoryItemsMethods = (client: EbayApiClient) => ({
	/**
	 * Retrieves paginated inventory items.
	 *
	 * @param input - Optional pagination controls.
	 * @returns An Effect that succeeds with eBay's InventoryItems response.
	 *
	 * @example
	 * ```ts
	 * const inventoryPage = await Effect.runPromise(inventoryApi.getInventoryItems({ limit: 25 }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
	 */
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

	/**
	 * Retrieves one inventory item by SKU.
	 *
	 * @param input - Seller-defined SKU value.
	 * @returns An Effect that succeeds with eBay's InventoryItemWithSkuLocaleGroupid response.
	 *
	 * @example
	 * ```ts
	 * const inventoryItem = await Effect.runPromise(inventoryApi.getInventoryItem({ sku: 'SKU-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItem
	 */
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

	/**
	 * Creates or replaces one inventory item by SKU.
	 *
	 * @param input - Seller-defined SKU and generated InventoryItem body.
	 * @returns An Effect that succeeds with eBay's BaseResponse.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.createOrReplaceInventoryItem({ sku: 'SKU-1', body: { product: {} } }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
	 */
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

	/**
	 * Deletes one inventory item by SKU.
	 *
	 * @param input - Seller-defined SKU value.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(inventoryApi.deleteInventoryItem({ sku: 'SKU-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/deleteInventoryItem
	 */
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

	/**
	 * Creates or replaces up to 25 inventory items.
	 *
	 * @param input - Generated BulkInventoryItem body.
	 * @returns An Effect that succeeds with eBay's BulkInventoryItemResponse.
	 *
	 * @example
	 * ```ts
	 * const inventoryItemResults = await Effect.runPromise(
	 *   inventoryApi.bulkCreateOrReplaceInventoryItem({ body: { requests: [] } }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem
	 */
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

	/**
	 * Retrieves up to 25 inventory items by SKU.
	 *
	 * @param input - Generated BulkGetInventoryItem body.
	 * @returns An Effect that succeeds with eBay's BulkGetInventoryItemResponse.
	 *
	 * @example
	 * ```ts
	 * const inventoryItems = await Effect.runPromise(
	 *   inventoryApi.bulkGetInventoryItem({ body: { requests: [{ sku: 'SKU-1' }] } }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem
	 */
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

	/**
	 * Updates price and quantity for inventory items and offers.
	 *
	 * @param input - Generated BulkPriceQuantity body.
	 * @returns An Effect that succeeds with eBay's BulkPriceQuantityResponse.
	 *
	 * @example
	 * ```ts
	 * const priceQuantityResults = await Effect.runPromise(
	 *   inventoryApi.bulkUpdatePriceQuantity({ body: { requests: [] } }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity
	 */
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

	/**
	 * Retrieves product compatibility for one SKU.
	 *
	 * @param input - Seller-defined SKU value.
	 * @returns An Effect that succeeds with eBay's Compatibility response.
	 *
	 * @example
	 * ```ts
	 * const compatibility = await Effect.runPromise(
	 *   inventoryApi.getProductCompatibility({ sku: 'SKU-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/getProductCompatibility
	 */
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

	/**
	 * Creates or replaces product compatibility for one SKU.
	 *
	 * @param input - Seller-defined SKU and generated Compatibility body.
	 * @returns An Effect that succeeds with eBay's BaseResponse.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.createOrReplaceProductCompatibility({ sku: 'SKU-1', body: {} }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/createOrReplaceProductCompatibility
	 */
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

	/**
	 * Deletes product compatibility for one SKU.
	 *
	 * @param input - Seller-defined SKU value.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(inventoryApi.deleteProductCompatibility({ sku: 'SKU-1' }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/deleteProductCompatibility
	 */
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

	/**
	 * Retrieves one inventory item group.
	 *
	 * @param input - Seller-defined inventory item group key.
	 * @returns An Effect that succeeds with eBay's InventoryItemGroup response.
	 *
	 * @example
	 * ```ts
	 * const group = await Effect.runPromise(
	 *   inventoryApi.getInventoryItemGroup({ inventoryItemGroupKey: 'GROUP-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item_group/methods/getInventoryItemGroup
	 */
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

	/**
	 * Creates or replaces one inventory item group.
	 *
	 * @param input - Seller-defined inventory item group key and generated InventoryItemGroup body.
	 * @returns An Effect that succeeds with eBay's BaseResponse.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.createOrReplaceInventoryItemGroup({
	 *     inventoryItemGroupKey: 'GROUP-1',
	 *     body: { variantSKUs: ['SKU-1'] },
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item_group/methods/createOrReplaceInventoryItemGroup
	 */
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

	/**
	 * Deletes one inventory item group.
	 *
	 * @param input - Seller-defined inventory item group key.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.deleteInventoryItemGroup({ inventoryItemGroupKey: 'GROUP-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item_group/methods/deleteInventoryItemGroup
	 */
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

	/**
	 * Bulk migrates listings into the Inventory API model.
	 *
	 * @param input - Generated BulkMigrateListing body.
	 * @returns An Effect that succeeds with eBay's BulkMigrateListingResponse.
	 *
	 * @example
	 * ```ts
	 * const migratedListings = await Effect.runPromise(
	 *   inventoryApi.bulkMigrateListing({ body: { requests: [] } }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkMigrateListing
	 */
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

	/**
	 * Retrieves SKU location mappings for one listing/SKU pair.
	 *
	 * @param input - Listing ID and seller-defined SKU value.
	 * @returns An Effect that succeeds with eBay's LocationMapping response.
	 *
	 * @example
	 * ```ts
	 * const mapping = await Effect.runPromise(
	 *   inventoryApi.getSkuLocationMapping({ listingId: '123', sku: 'SKU-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/getSkuLocationMapping
	 */
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

	/**
	 * Creates or replaces SKU location mappings for one listing/SKU pair.
	 *
	 * @param input - Listing ID, SKU, and generated LocationMapping body.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.createOrReplaceSkuLocationMapping({
	 *     listingId: '123',
	 *     sku: 'SKU-1',
	 *     body: { locations: [] },
	 *   }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/createOrReplaceSkuLocationMapping
	 */
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

	/**
	 * Deletes SKU location mappings for one listing/SKU pair.
	 *
	 * @param input - Listing ID and seller-defined SKU value.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.deleteSkuLocationMapping({ listingId: '123', sku: 'SKU-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/deleteSkuLocationMapping
	 */
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
});
