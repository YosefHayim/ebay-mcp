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

export type GetStoreResponse = components["schemas"]["GetStoreResponseType"];

export type GetStoreCategoriesResponse =
	components["schemas"]["GetStoreCategoriesResponseType"];

export type GetStoreTaskResponse =
	components["schemas"]["GetStoreTaskResponseType"];

export type GetStoreTasksResponse =
	components["schemas"]["GetStoreTasksResponseType"];

export interface StoreCategoryTask {
	readonly taskId: string;
	readonly location: string;
}

export class StoresApi {
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public getStore = (_input: EmptyStoreInput = {}): Promise<GetStoreResponse> =>
		requestGetEffect<GetStoreResponse>(this.client, STORE_PATH);

	public getStoreCategories = (
		_input: EmptyStoreInput = {},
	): Promise<GetStoreCategoriesResponse> =>
		requestGetEffect<GetStoreCategoriesResponse>(
			this.client,
			`${STORE_PATH}/categories`,
		);

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

	public getStoreTasks = (
		_input: EmptyStoreInput = {},
	): Promise<GetStoreTasksResponse> =>
		requestGetEffect<GetStoreTasksResponse>(this.client, TASKS_PATH);

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
