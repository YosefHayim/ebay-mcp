import type { EbayApiClient } from '@/api/client.js';
import {
  type EbayApiError,
  type EndpointInputError,
  buildEndpointParams,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
  requestPutEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  components,
  operations,
} from '@/types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import { Effect } from 'effect';
import { INVENTORY_BASE_PATH, type InventoryPaginationInput } from './shared.js';

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
  readonly contentLanguage?: string;
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
export interface CreateOrReplaceSkuLocationMappingInput extends SkuLocationMappingInput {
  /** Generated LocationMapping body. */
  readonly body: LocationMapping;
}

/**
 * Request body accepted by bulkCreateOrReplaceInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem
 */
export type BulkCreateOrReplaceInventoryItemRequest = components['schemas']['BulkInventoryItem'];

/**
 * Response returned by bulkCreateOrReplaceInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem
 */
export type BulkCreateOrReplaceInventoryItemResponse =
  components['schemas']['BulkInventoryItemResponse'];

/**
 * Request body accepted by bulkGetInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem
 */
export type BulkGetInventoryItemRequest = components['schemas']['BulkGetInventoryItem'];

/**
 * Response returned by bulkGetInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem
 */
export type BulkGetInventoryItemResponse = components['schemas']['BulkGetInventoryItemResponse'];

/**
 * Request body accepted by bulkUpdatePriceQuantity.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity
 */
export type BulkUpdatePriceQuantityRequest = components['schemas']['BulkPriceQuantity'];

/**
 * Response returned by bulkUpdatePriceQuantity.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity
 */
export type BulkUpdatePriceQuantityResponse = components['schemas']['BulkPriceQuantityResponse'];

/**
 * Response returned by getInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItem
 */
export type GetInventoryItemResponse = components['schemas']['InventoryItemWithSkuLocaleGroupid'];

/**
 * Request body accepted by createOrReplaceInventoryItem.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
 */
export type InventoryItem = components['schemas']['InventoryItem'];

/**
 * Response returned by write endpoints that use BaseResponse.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
 */
export type BaseResponse = components['schemas']['BaseResponse'];

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
export type GetInventoryItemsResponse = components['schemas']['InventoryItems'];

/**
 * Generated compatibility body and response used by product compatibility endpoints.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/product_compatibility/methods/getProductCompatibility
 */
export type ProductCompatibility = components['schemas']['Compatibility'];

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
export type InventoryItemGroup = components['schemas']['InventoryItemGroup'];

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
export type BulkMigrateListingRequest = components['schemas']['BulkMigrateListing'];

/**
 * Response returned by bulkMigrateListing.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkMigrateListing
 */
export type BulkMigrateListingResponse = components['schemas']['BulkMigrateListingResponse'];

/**
 * Generated location mapping body and response.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/listing/methods/getSkuLocationMapping
 */
export type LocationMapping = components['schemas']['LocationMapping'];

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
   * const items = await Effect.runPromise(inventoryApi.getInventoryItems({ limit: 25 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
   */
  getInventoryItems: (
    input: InventoryPaginationInput = {},
  ): Effect.Effect<GetInventoryItemsResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/inventory_item`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<InventoryPaginationInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });

      return yield* requestGetEffect<GetInventoryItemsResponse>(client, path, params);
    });
  },

  /**
   * Retrieves one inventory item by SKU.
   *
   * @param input - Seller-defined SKU value.
   * @returns An Effect that succeeds with eBay's InventoryItemWithSkuLocaleGroupid response.
   *
   * @example
   * ```ts
   * const item = await Effect.runPromise(inventoryApi.getInventoryItem({ sku: 'SKU-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItem
   */
  getInventoryItem: (
    input: SkuInput,
  ): Effect.Effect<GetInventoryItemResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SkuInput>(input, 'input');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');

      return yield* requestGetEffect<GetInventoryItemResponse>(
        client,
        `${basePath}/inventory_item/${sku}`,
      );
    });
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
  createOrReplaceInventoryItem: (
    input: CreateOrReplaceInventoryItemInput,
  ): Effect.Effect<BaseResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateOrReplaceInventoryItemInput>(
        input,
        'input',
      );
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');
      const body = yield* requireObjectEffect<InventoryItem>(validatedInput.body, 'body');
      const config =
        validatedInput.contentLanguage === undefined
          ? undefined
          : { headers: { 'Content-Language': validatedInput.contentLanguage } };

      return yield* requestPutEffect<BaseResponse>(
        client,
        `${basePath}/inventory_item/${sku}`,
        body,
        config,
      );
    });
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
  deleteInventoryItem: (
    input: SkuInput,
  ): Effect.Effect<DeleteInventoryItemResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SkuInput>(input, 'input');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');

      return yield* requestDeleteEffect<DeleteInventoryItemResponse>(
        client,
        `${basePath}/inventory_item/${sku}`,
      );
    });
  },

  /**
   * Creates or replaces up to 25 inventory items.
   *
   * @param input - Generated BulkInventoryItem body.
   * @returns An Effect that succeeds with eBay's BulkInventoryItemResponse.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   inventoryApi.bulkCreateOrReplaceInventoryItem({ body: { requests: [] } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkCreateOrReplaceInventoryItem
   */
  bulkCreateOrReplaceInventoryItem: (
    input: BulkInventoryItemInput,
  ): Effect.Effect<BulkCreateOrReplaceInventoryItemResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/bulk_create_or_replace_inventory_item`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkInventoryItemInput>(input, 'input');
      const body = yield* requireObjectEffect<BulkCreateOrReplaceInventoryItemRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkCreateOrReplaceInventoryItemResponse>(client, path, body);
    });
  },

  /**
   * Retrieves up to 25 inventory items by SKU.
   *
   * @param input - Generated BulkGetInventoryItem body.
   * @returns An Effect that succeeds with eBay's BulkGetInventoryItemResponse.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   inventoryApi.bulkGetInventoryItem({ body: { requests: [{ sku: 'SKU-1' }] } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkGetInventoryItem
   */
  bulkGetInventoryItem: (
    input: BulkGetInventoryItemInput,
  ): Effect.Effect<BulkGetInventoryItemResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/bulk_get_inventory_item`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkGetInventoryItemInput>(input, 'input');
      const body = yield* requireObjectEffect<BulkGetInventoryItemRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkGetInventoryItemResponse>(client, path, body);
    });
  },

  /**
   * Updates price and quantity for inventory items and offers.
   *
   * @param input - Generated BulkPriceQuantity body.
   * @returns An Effect that succeeds with eBay's BulkPriceQuantityResponse.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   inventoryApi.bulkUpdatePriceQuantity({ body: { requests: [] } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkUpdatePriceQuantity
   */
  bulkUpdatePriceQuantity: (
    input: BulkUpdatePriceQuantityInput,
  ): Effect.Effect<BulkUpdatePriceQuantityResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/bulk_update_price_quantity`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkUpdatePriceQuantityInput>(
        input,
        'input',
      );
      const body = yield* requireObjectEffect<BulkUpdatePriceQuantityRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkUpdatePriceQuantityResponse>(client, path, body);
    });
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
  getProductCompatibility: (
    input: SkuInput,
  ): Effect.Effect<ProductCompatibility, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SkuInput>(input, 'input');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');

      return yield* requestGetEffect<ProductCompatibility>(
        client,
        `${basePath}/inventory_item/${sku}/product_compatibility`,
      );
    });
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
  createOrReplaceProductCompatibility: (
    input: CreateOrReplaceProductCompatibilityInput,
  ): Effect.Effect<BaseResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateOrReplaceProductCompatibilityInput>(
        input,
        'input',
      );
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');
      const body = yield* requireObjectEffect<ProductCompatibility>(validatedInput.body, 'body');

      return yield* requestPutEffect<BaseResponse>(
        client,
        `${basePath}/inventory_item/${sku}/product_compatibility`,
        body,
      );
    });
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
  deleteProductCompatibility: (
    input: SkuInput,
  ): Effect.Effect<DeleteProductCompatibilityResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SkuInput>(input, 'input');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');

      return yield* requestDeleteEffect<DeleteProductCompatibilityResponse>(
        client,
        `${basePath}/inventory_item/${sku}/product_compatibility`,
      );
    });
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
  getInventoryItemGroup: (
    input: InventoryItemGroupKeyInput,
  ): Effect.Effect<InventoryItemGroup, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<InventoryItemGroupKeyInput>(input, 'input');
      const inventoryItemGroupKey = yield* requireStringEffect(
        validatedInput.inventoryItemGroupKey,
        'inventoryItemGroupKey',
      );

      return yield* requestGetEffect<InventoryItemGroup>(
        client,
        `${basePath}/inventory_item_group/${inventoryItemGroupKey}`,
      );
    });
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
  createOrReplaceInventoryItemGroup: (
    input: CreateOrReplaceInventoryItemGroupInput,
  ): Effect.Effect<BaseResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateOrReplaceInventoryItemGroupInput>(
        input,
        'input',
      );
      const inventoryItemGroupKey = yield* requireStringEffect(
        validatedInput.inventoryItemGroupKey,
        'inventoryItemGroupKey',
      );
      const body = yield* requireObjectEffect<InventoryItemGroup>(validatedInput.body, 'body');

      return yield* requestPutEffect<BaseResponse>(
        client,
        `${basePath}/inventory_item_group/${inventoryItemGroupKey}`,
        body,
      );
    });
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
  deleteInventoryItemGroup: (
    input: InventoryItemGroupKeyInput,
  ): Effect.Effect<DeleteInventoryItemGroupResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<InventoryItemGroupKeyInput>(input, 'input');
      const inventoryItemGroupKey = yield* requireStringEffect(
        validatedInput.inventoryItemGroupKey,
        'inventoryItemGroupKey',
      );

      return yield* requestDeleteEffect<DeleteInventoryItemGroupResponse>(
        client,
        `${basePath}/inventory_item_group/${inventoryItemGroupKey}`,
      );
    });
  },

  /**
   * Bulk migrates listings into the Inventory API model.
   *
   * @param input - Generated BulkMigrateListing body.
   * @returns An Effect that succeeds with eBay's BulkMigrateListingResponse.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   inventoryApi.bulkMigrateListing({ body: { requests: [] } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/bulkMigrateListing
   */
  bulkMigrateListing: (
    input: BulkMigrateListingInput,
  ): Effect.Effect<BulkMigrateListingResponse, EbayApiError | EndpointInputError> => {
    const path = `${INVENTORY_BASE_PATH}/bulk_migrate_listing`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkMigrateListingInput>(input, 'input');
      const body = yield* requireObjectEffect<BulkMigrateListingRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkMigrateListingResponse>(client, path, body);
    });
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
  getSkuLocationMapping: (
    input: SkuLocationMappingInput,
  ): Effect.Effect<LocationMapping, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SkuLocationMappingInput>(input, 'input');
      const listingId = yield* requireStringEffect(validatedInput.listingId, 'listingId');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');

      return yield* requestGetEffect<LocationMapping>(
        client,
        `${basePath}/listing/${listingId}/sku/${sku}/locations`,
      );
    });
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
  createOrReplaceSkuLocationMapping: (
    input: CreateOrReplaceSkuLocationMappingInput,
  ): Effect.Effect<
    CreateOrReplaceSkuLocationMappingResponse,
    EbayApiError | EndpointInputError
  > => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateOrReplaceSkuLocationMappingInput>(
        input,
        'input',
      );
      const listingId = yield* requireStringEffect(validatedInput.listingId, 'listingId');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');
      const body = yield* requireObjectEffect<LocationMapping>(validatedInput.body, 'body');

      return yield* requestPutEffect<CreateOrReplaceSkuLocationMappingResponse>(
        client,
        `${basePath}/listing/${listingId}/sku/${sku}/locations`,
        body,
      );
    });
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
  deleteSkuLocationMapping: (
    input: SkuLocationMappingInput,
  ): Effect.Effect<DeleteSkuLocationMappingResponse, EbayApiError | EndpointInputError> => {
    const basePath = INVENTORY_BASE_PATH;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SkuLocationMappingInput>(input, 'input');
      const listingId = yield* requireStringEffect(validatedInput.listingId, 'listingId');
      const sku = yield* requireStringEffect(validatedInput.sku, 'sku');

      return yield* requestDeleteEffect<DeleteSkuLocationMappingResponse>(
        client,
        `${basePath}/listing/${listingId}/sku/${sku}/locations`,
      );
    });
  },
});
