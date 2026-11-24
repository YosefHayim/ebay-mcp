import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type {
	components,
	operations,
} from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import {
	INVENTORY_BASE_PATH,
	type InventoryPaginationInput,
} from "./inventorySharedApi.js";

/** Input accepted by inventory location ID endpoints. */
export interface MerchantLocationKeyInput {
	/** Seller-defined merchant location key. */
	readonly merchantLocationKey: string;
}

/** Input accepted by createInventoryLocation. */
export interface CreateInventoryLocationInput {
	/** Seller-defined merchant location key. */
	readonly merchantLocationKey: string;
	/** Generated InventoryLocationFull body. */
	readonly body: CreateInventoryLocationRequest;
}

/** Input accepted by updateInventoryLocation. */
export interface UpdateInventoryLocationInput {
	/** Seller-defined merchant location key. */
	readonly merchantLocationKey: string;
	/** Generated InventoryLocation body. */
	readonly body: UpdateInventoryLocationRequest;
}

/**
 * Response returned by getInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/getInventoryLocation
 */
export type GetInventoryLocationResponse =
	components["schemas"]["InventoryLocationResponse"];

/**
 * Request body accepted by createInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/createInventoryLocation
 */
export type CreateInventoryLocationRequest =
	components["schemas"]["InventoryLocationFull"];

/**
 * No-content response returned by createInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/createInventoryLocation
 */
export type CreateInventoryLocationResponse = void;

/**
 * No-content response returned by deleteInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/deleteInventoryLocation
 */
export type DeleteInventoryLocationResponse = void;

/**
 * Response returned by disableInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/disableInventoryLocation
 */
export type DisableInventoryLocationResponse =
	operations["disableInventoryLocation"]["responses"][200]["content"]["application/json"];

/**
 * Response returned by enableInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/enableInventoryLocation
 */
export type EnableInventoryLocationResponse =
	operations["enableInventoryLocation"]["responses"][200]["content"]["application/json"];

/**
 * Response returned by getInventoryLocations.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/getInventoryLocations
 */
export type GetInventoryLocationsResponse =
	components["schemas"]["LocationResponse"];

/**
 * Request body accepted by updateInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/updateInventoryLocation
 */
export type UpdateInventoryLocationRequest =
	components["schemas"]["InventoryLocation"];

/**
 * No-content response returned by updateInventoryLocation.
 *
 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/updateInventoryLocation
 */
export type UpdateInventoryLocationResponse = void;

/** Inventory API — locations methods closed over a shared client. */
export const createInventoryLocationsMethods = (client: EbayApiClient) => ({
	/**
	 * Retrieves one inventory location by merchant location key.
	 *
	 * @param input - Seller-defined merchant location key.
	 * @returns An Effect that succeeds with eBay's InventoryLocationResponse.
	 *
	 * @example
	 * ```ts
	 * const location = await Effect.runPromise(
	 *   inventoryApi.getInventoryLocation({ merchantLocationKey: 'LOC-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/getInventoryLocation
	 */
	getInventoryLocation: async (
		input: MerchantLocationKeyInput,
	): Promise<GetInventoryLocationResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<MerchantLocationKeyInput>(
			input,
			"input",
		);
		const merchantLocationKey = requireStringEffect(
			validatedInput.merchantLocationKey,
			"merchantLocationKey",
		);

		return requestGetEffect<GetInventoryLocationResponse>(
			client,
			`${basePath}/location/${merchantLocationKey}`,
		);
	},

	/**
	 * Creates one inventory location by merchant location key.
	 *
	 * @param input - Seller-defined merchant location key and generated InventoryLocationFull body.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.createInventoryLocation({ merchantLocationKey: 'LOC-1', body: {} }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/createInventoryLocation
	 */
	createInventoryLocation: async (
		input: CreateInventoryLocationInput,
	): Promise<CreateInventoryLocationResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<CreateInventoryLocationInput>(
			input,
			"input",
		);
		const merchantLocationKey = requireStringEffect(
			validatedInput.merchantLocationKey,
			"merchantLocationKey",
		);
		const inventoryLocation =
			requireObjectEffect<CreateInventoryLocationRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<CreateInventoryLocationResponse>(
			client,
			`${basePath}/location/${merchantLocationKey}`,
			inventoryLocation,
		);
	},

	/**
	 * Deletes one inventory location by merchant location key.
	 *
	 * @param input - Seller-defined merchant location key.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.deleteInventoryLocation({ merchantLocationKey: 'LOC-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/deleteInventoryLocation
	 */
	deleteInventoryLocation: async (
		input: MerchantLocationKeyInput,
	): Promise<DeleteInventoryLocationResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<MerchantLocationKeyInput>(
			input,
			"input",
		);
		const merchantLocationKey = requireStringEffect(
			validatedInput.merchantLocationKey,
			"merchantLocationKey",
		);

		return requestDeleteEffect<DeleteInventoryLocationResponse>(
			client,
			`${basePath}/location/${merchantLocationKey}`,
		);
	},

	/**
	 * Disables one inventory location.
	 *
	 * @param input - Seller-defined merchant location key.
	 * @returns An Effect that succeeds with eBay's empty disable response.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.disableInventoryLocation({ merchantLocationKey: 'LOC-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/disableInventoryLocation
	 */
	disableInventoryLocation: async (
		input: MerchantLocationKeyInput,
	): Promise<DisableInventoryLocationResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<MerchantLocationKeyInput>(
			input,
			"input",
		);
		const merchantLocationKey = requireStringEffect(
			validatedInput.merchantLocationKey,
			"merchantLocationKey",
		);

		return requestPostEffect<DisableInventoryLocationResponse>(
			client,
			`${basePath}/location/${merchantLocationKey}/disable`,
		);
	},

	/**
	 * Enables one inventory location.
	 *
	 * @param input - Seller-defined merchant location key.
	 * @returns An Effect that succeeds with eBay's empty enable response.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.enableInventoryLocation({ merchantLocationKey: 'LOC-1' }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/enableInventoryLocation
	 */
	enableInventoryLocation: async (
		input: MerchantLocationKeyInput,
	): Promise<EnableInventoryLocationResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<MerchantLocationKeyInput>(
			input,
			"input",
		);
		const merchantLocationKey = requireStringEffect(
			validatedInput.merchantLocationKey,
			"merchantLocationKey",
		);

		return requestPostEffect<EnableInventoryLocationResponse>(
			client,
			`${basePath}/location/${merchantLocationKey}/enable`,
		);
	},

	/**
	 * Retrieves paginated inventory locations.
	 *
	 * @param input - Optional pagination controls.
	 * @returns An Effect that succeeds with eBay's LocationResponse.
	 *
	 * @example
	 * ```ts
	 * const locations = await Effect.runPromise(inventoryApi.getInventoryLocations({ limit: 50 }));
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/getInventoryLocations
	 */
	getInventoryLocations: async (
		input: InventoryPaginationInput = {},
	): Promise<GetInventoryLocationsResponse> => {
		const path = `${INVENTORY_BASE_PATH}/location`;

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

		return requestGetEffect<GetInventoryLocationsResponse>(
			client,
			path,
			params,
		);
	},

	/**
	 * Updates details for one inventory location.
	 *
	 * @param input - Seller-defined merchant location key and generated InventoryLocation body.
	 * @returns An Effect that succeeds when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await Effect.runPromise(
	 *   inventoryApi.updateInventoryLocation({ merchantLocationKey: 'LOC-1', body: {} }),
	 * );
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/inventory/resources/location/methods/updateInventoryLocation
	 */
	updateInventoryLocation: async (
		input: UpdateInventoryLocationInput,
	): Promise<UpdateInventoryLocationResponse> => {
		const basePath = INVENTORY_BASE_PATH;

		const validatedInput = requireObjectEffect<UpdateInventoryLocationInput>(
			input,
			"input",
		);
		const merchantLocationKey = requireStringEffect(
			validatedInput.merchantLocationKey,
			"merchantLocationKey",
		);
		const inventoryLocationUpdate =
			requireObjectEffect<UpdateInventoryLocationRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<UpdateInventoryLocationResponse>(
			client,
			`${basePath}/location/${merchantLocationKey}/update_location_details`,
			inventoryLocationUpdate,
		);
	},
});
