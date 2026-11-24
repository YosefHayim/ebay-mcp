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

export interface MerchantLocationKeyInput {
	readonly merchantLocationKey: string;
}

export interface CreateInventoryLocationInput {
	readonly merchantLocationKey: string;
	readonly body: CreateInventoryLocationRequest;
}

export interface UpdateInventoryLocationInput {
	readonly merchantLocationKey: string;
	readonly body: UpdateInventoryLocationRequest;
}

export type GetInventoryLocationResponse =
	components["schemas"]["InventoryLocationResponse"];

export type CreateInventoryLocationRequest =
	components["schemas"]["InventoryLocationFull"];

export type CreateInventoryLocationResponse = void;

export type DeleteInventoryLocationResponse = void;

export type DisableInventoryLocationResponse =
	operations["disableInventoryLocation"]["responses"][200]["content"]["application/json"];

export type EnableInventoryLocationResponse =
	operations["enableInventoryLocation"]["responses"][200]["content"]["application/json"];

export type GetInventoryLocationsResponse =
	components["schemas"]["LocationResponse"];

export type UpdateInventoryLocationRequest =
	components["schemas"]["InventoryLocation"];

export type UpdateInventoryLocationResponse = void;

export function createInventoryLocationsMethods(client: EbayApiClient) {
	return {
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
	};
}
