import type { z } from "zod";
import type {
	addStoreCategoryInputSchema,
	deleteStoreCategoryInputSchema,
	emptyStoreInputSchema,
	getStoreTaskInputSchema,
	moveStoreCategoryInputSchema,
	renameStoreCategoryInputSchema,
} from "@/ebay-apis/stores/storesSchemas.js";
import type {
	EbayApiClient,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
import { locatedResourceId } from "@/ebay-client/location.js";
import {
	createEbayRequestFailure,
	optionalStringEffect,
	requestGetEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellStoresV1Oas3.js";
import { defined } from "@/shared/objects.js";

const STORE_PATH = "/sell/stores/v1/store";
const TASKS_PATH = `${STORE_PATH}/tasks`;

type AddStoreCategoryRequest =
	components["schemas"]["AddStoreCategoryRequestType"];
type DeleteStoreCategoryRequest =
	components["schemas"]["DeleteStoreCategoryRequestType"];
type RenameStoreCategoryRequest =
	components["schemas"]["RenameStoreCategoryRequestType"];
type MoveStoreCategoryRequest =
	components["schemas"]["MoveStoreCategoryRequestType"];
type EmptyStoreInput = z.infer<typeof emptyStoreInputSchema>;
type GetStoreTaskInput = z.infer<typeof getStoreTaskInputSchema>;
type AddStoreCategoryInput = z.infer<typeof addStoreCategoryInputSchema>;
type RenameStoreCategoryInput = z.infer<typeof renameStoreCategoryInputSchema>;
type DeleteStoreCategoryInput = z.infer<typeof deleteStoreCategoryInputSchema>;
type MoveStoreCategoryInput = z.infer<typeof moveStoreCategoryInputSchema>;

/**
 * Sends one asynchronous category change and reads its store task from `Location`.
 * A missing or foreign header fails with an EbayApiError naming this request.
 *
 * @param method - HTTP method of the category change.
 * @param path - eBay REST path of the category change, used in failures.
 * @param send - Client call that keeps the response headers.
 * @returns The store task ID and Location. Throws EbayApiError when the request
 * fails or Location is missing or foreign.
 */
async function startCategoryTask(
	method: "POST" | "PUT" | "DELETE",
	path: string,
	send: () => Promise<EbayResponse<unknown>>,
): Promise<StoreCategoryTask> {
	var taskResponse: EbayResponse<unknown>;

	try {
		taskResponse = await send();
	} catch (cause) {
		throw createEbayRequestFailure(method, path, cause);
	}

	try {
		const task = locatedResourceId(
			taskResponse.headers["location"],
			TASKS_PATH,
		);

		return { taskId: task.id, location: task.location };
	} catch (error) {
		const locationCause =
			error instanceof Error ? (error.cause ?? error) : error;

		throw createEbayRequestFailure(method, path, locationCause);
	}
}

/**
 * Response returned by getStore.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStore
 */
export type GetStoreResponse = components["schemas"]["GetStoreResponseType"];

/**
 * Response returned by getStoreCategories.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreCategories
 */
export type GetStoreCategoriesResponse =
	components["schemas"]["GetStoreCategoriesResponseType"];

/**
 * Response returned by getStoreTask.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTask
 */
export type GetStoreTaskResponse =
	components["schemas"]["GetStoreTaskResponseType"];

/**
 * Response returned by getStoreTasks.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTasks
 */
export type GetStoreTasksResponse =
	components["schemas"]["GetStoreTasksResponseType"];

/** Store task started by an asynchronous category change; poll it with getStoreTask. */
export interface StoreCategoryTask {
	/** Store task ID decoded from the `Location` header, accepted by getStoreTask. */
	readonly taskId: string;
	/** getStoreTask URI exactly as eBay returned it in the `Location` header. */
	readonly location: string;
}

/** Stores API - eBay Store details and store category management. */
export class StoresApi {
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Retrieves the seller's eBay Store details: name, URL, description, and logo.
	 *
	 * @param _input - Empty object accepted for tool/API shape consistency.
	 * @returns eBay's GetStoreResponseType.
	 *
	 * @example
	 * ```ts
	 * const store = await storesApi.getStore({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStore
	 */
	public getStore = (_input: EmptyStoreInput = {}): Promise<GetStoreResponse> =>
		requestGetEffect<GetStoreResponse>(this.client, STORE_PATH);

	/**
	 * Retrieves the store's custom category hierarchy (up to three levels).
	 *
	 * @param _input - Empty object accepted for tool/API shape consistency.
	 * @returns eBay's GetStoreCategoriesResponseType.
	 *
	 * @example
	 * ```ts
	 * const { storeCategories } = await storesApi.getStoreCategories({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreCategories
	 */
	public getStoreCategories = (
		_input: EmptyStoreInput = {},
	): Promise<GetStoreCategoriesResponse> =>
		requestGetEffect<GetStoreCategoriesResponse>(
			this.client,
			`${STORE_PATH}/categories`,
		);

	/**
	 * Retrieves the status of one asynchronous store category task.
	 *
	 * @param input - Store task ID returned by a category change.
	 * @returns eBay's GetStoreTaskResponseType.
	 *
	 * @example
	 * ```ts
	 * const { task } = await storesApi.getStoreTask({ taskId: 'TASK-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTask
	 */
	public getStoreTask = async (
		input: GetStoreTaskInput,
	): Promise<GetStoreTaskResponse> => {
		const { client } = this;

		const endpointInput = requireObjectEffect<GetStoreTaskInput>(
			input,
			"input",
		);
		const taskId = requireStringEffect(endpointInput.taskId, "taskId");

		return await requestGetEffect<GetStoreTaskResponse>(
			client,
			`${TASKS_PATH}/${encodeURIComponent(taskId)}`,
		);
	};

	/**
	 * Retrieves the status of all asynchronous store tasks; each finishes as FAILED or COMPLETED
	 * within 24 hours.
	 *
	 * @param _input - Empty object accepted for tool/API shape consistency.
	 * @returns eBay's GetStoreTasksResponseType.
	 *
	 * @example
	 * ```ts
	 * const { task } = await storesApi.getStoreTasks({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTasks
	 */
	public getStoreTasks = (
		_input: EmptyStoreInput = {},
	): Promise<GetStoreTasksResponse> =>
		requestGetEffect<GetStoreTasksResponse>(this.client, TASKS_PATH);

	/**
	 * Starts adding one custom store category. eBay answers 202 with the store task URI in
	 * `Location`; only one category change can be in flight at a time.
	 *
	 * @param input - Category name plus optional parent and listing-destination store category IDs.
	 * @returns The store task ID and Location to poll.
	 *
	 * @example
	 * ```ts
	 * const { taskId } = await storesApi.addStoreCategory({ categoryName: 'Vintage Cameras' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/addStoreCategory
	 */
	public addStoreCategory = async (
		input: AddStoreCategoryInput,
	): Promise<StoreCategoryTask> => {
		const { client } = this;
		const path = `${STORE_PATH}/categories`;
		const endpointInput = requireObjectEffect<AddStoreCategoryInput>(
			input,
			"input",
		);
		const categoryName = requireStringEffect(
			endpointInput.categoryName,
			"categoryName",
		);
		const destinationParentCategoryId = optionalStringEffect(
			endpointInput.destinationParentCategoryId,
			"destinationParentCategoryId",
		);
		const listingDestinationCategoryId = optionalStringEffect(
			endpointInput.listingDestinationCategoryId,
			"listingDestinationCategoryId",
		);
		const addCategoryRequest: AddStoreCategoryRequest = defined({
			categoryName,
			destinationParentCategoryId,
			listingDestinationCategoryId,
		});

		return startCategoryTask("POST", path, () =>
			client.postForResponse(path, addCategoryRequest),
		);
	};

	/**
	 * Starts renaming one custom store category. eBay answers with the store task URI in
	 * `Location`; only one category change can be in flight at a time.
	 *
	 * @param input - Store category ID (path) and its new name.
	 * @returns The store task ID and Location to poll.
	 *
	 * @example
	 * ```ts
	 * const { taskId } = await storesApi.renameStoreCategory({ categoryId: '1234', categoryName: 'Film Cameras' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/renameStoreCategory
	 */
	public renameStoreCategory = async (
		input: RenameStoreCategoryInput,
	): Promise<StoreCategoryTask> => {
		const { client } = this;
		const endpointInput = requireObjectEffect<RenameStoreCategoryInput>(
			input,
			"input",
		);
		const categoryId = requireStringEffect(
			endpointInput.categoryId,
			"categoryId",
		);
		const renameCategoryRequest: RenameStoreCategoryRequest = {
			categoryName: requireStringEffect(
				endpointInput.categoryName,
				"categoryName",
			),
		};
		const path = `${STORE_PATH}/categories/${encodeURIComponent(categoryId)}`;

		return startCategoryTask("PUT", path, () =>
			client.putForResponse(path, renameCategoryRequest),
		);
	};

	/**
	 * Starts deleting one custom store category. eBay answers 202 with the store task URI in
	 * `Location`; only one category change can be in flight at a time. The body is sent only
	 * with a listing destination; without one eBay applies its default (the Other category, ID 1).
	 *
	 * @param input - Store category ID to delete and an optional listing-destination store category.
	 * @returns The store task ID and Location to poll.
	 *
	 * @example
	 * ```ts
	 * const { taskId } = await storesApi.deleteStoreCategory({ categoryId: '1234' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/deleteStoreCategory
	 */
	public deleteStoreCategory = async (
		input: DeleteStoreCategoryInput,
	): Promise<StoreCategoryTask> => {
		const { client } = this;
		const endpointInput = requireObjectEffect<DeleteStoreCategoryInput>(
			input,
			"input",
		);
		const categoryId = requireStringEffect(
			endpointInput.categoryId,
			"categoryId",
		);
		const listingDestinationCategoryId = optionalStringEffect(
			endpointInput.listingDestinationCategoryId,
			"listingDestinationCategoryId",
		);
		const deleteCategoryRequest: DeleteStoreCategoryRequest | undefined =
			listingDestinationCategoryId === undefined
				? undefined
				: { listingDestinationCategoryId };
		const path = `${STORE_PATH}/categories/${encodeURIComponent(categoryId)}`;

		return startCategoryTask("DELETE", path, () =>
			client.deleteForResponse(path, undefined, deleteCategoryRequest),
		);
	};

	/**
	 * Starts moving one custom store category under a new parent. eBay answers 202 with the
	 * store task URI in `Location`; only one category change can be in flight at a time.
	 *
	 * @param input - Store category to move, its new parent, and an optional listing destination.
	 * @returns The store task ID and Location to poll.
	 *
	 * @example
	 * ```ts
	 * const { taskId } = await storesApi.moveStoreCategory({ categoryId: '1234', destinationParentCategoryId: '-999' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/moveStoreCategory
	 */
	public moveStoreCategory = async (
		input: MoveStoreCategoryInput,
	): Promise<StoreCategoryTask> => {
		const { client } = this;
		const path = `${STORE_PATH}/categories/move_category`;
		const endpointInput = requireObjectEffect<MoveStoreCategoryInput>(
			input,
			"input",
		);
		const categoryId = requireStringEffect(
			endpointInput.categoryId,
			"categoryId",
		);
		const destinationParentCategoryId = requireStringEffect(
			endpointInput.destinationParentCategoryId,
			"destinationParentCategoryId",
		);
		const listingDestinationCategoryId = optionalStringEffect(
			endpointInput.listingDestinationCategoryId,
			"listingDestinationCategoryId",
		);
		const moveCategoryRequest: MoveStoreCategoryRequest = defined({
			categoryId,
			destinationParentCategoryId,
			listingDestinationCategoryId,
		});

		return startCategoryTask("POST", path, () =>
			client.postForResponse(path, moveCategoryRequest),
		);
	};
}
