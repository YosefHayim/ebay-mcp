import type { EbayApiClient, EbayResponse } from '@/api/client/ebayApiClient.js';
import { locatedResourceId } from '@/api/shared/location.js';
import {
  EbayApiError,
  type EndpointInputError,
  optionalStringEffect,
  requestGetEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  addStoreCategoryInputSchema,
  deleteStoreCategoryInputSchema,
  emptyStoreInputSchema,
  getStoreTaskInputSchema,
  moveStoreCategoryInputSchema,
  renameStoreCategoryInputSchema,
} from '@/schemas/inventory-management/stores.js';
import type { components } from '@/types/sell-apps/listing-management/sellStoresV1Oas3.js';
import type { z } from 'zod';
import { Effect } from 'effect';

const STORE_PATH = '/sell/stores/v1/store';
const TASKS_PATH = `${STORE_PATH}/tasks`;

type AddStoreCategoryRequest = components['schemas']['AddStoreCategoryRequestType'];
type DeleteStoreCategoryRequest = components['schemas']['DeleteStoreCategoryRequestType'];
type RenameStoreCategoryRequest = components['schemas']['RenameStoreCategoryRequestType'];
type MoveStoreCategoryRequest = components['schemas']['MoveStoreCategoryRequestType'];
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
 * @returns An Effect with the store task ID and Location, or a typed EbayApiError.
 */
const startCategoryTask = (
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  send: () => Promise<EbayResponse<unknown>>,
): Effect.Effect<StoreCategoryTask, EbayApiError> =>
  Effect.tryPromise({
    try: send,
    catch: (cause) => new EbayApiError({ method, path, cause }),
  }).pipe(
    Effect.flatMap((response) =>
      locatedResourceId(response.headers.location, TASKS_PATH).pipe(
        Effect.mapError((error) => new EbayApiError({ method, path, cause: error.cause })),
      ),
    ),
    Effect.map((task) => ({ taskId: task.id, location: task.location })),
  );

/**
 * Response returned by getStore.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStore
 */
export type GetStoreResponse = components['schemas']['GetStoreResponseType'];

/**
 * Response returned by getStoreCategories.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreCategories
 */
export type GetStoreCategoriesResponse = components['schemas']['GetStoreCategoriesResponseType'];

/**
 * Response returned by getStoreTask.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTask
 */
export type GetStoreTaskResponse = components['schemas']['GetStoreTaskResponseType'];

/**
 * Response returned by getStoreTasks.
 *
 * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTasks
 */
export type GetStoreTasksResponse = components['schemas']['GetStoreTasksResponseType'];

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
   * @returns An Effect that succeeds with eBay's GetStoreResponseType.
   *
   * @example
   * ```ts
   * const store = await Effect.runPromise(storesApi.getStore({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStore
   */
  public getStore = (_input: EmptyStoreInput = {}): Effect.Effect<GetStoreResponse, EbayApiError> =>
    requestGetEffect<GetStoreResponse>(this.client, STORE_PATH);

  /**
   * Retrieves the store's custom category hierarchy (up to three levels).
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's GetStoreCategoriesResponseType.
   *
   * @example
   * ```ts
   * const { storeCategories } = await Effect.runPromise(storesApi.getStoreCategories({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreCategories
   */
  public getStoreCategories = (
    _input: EmptyStoreInput = {},
  ): Effect.Effect<GetStoreCategoriesResponse, EbayApiError> =>
    requestGetEffect<GetStoreCategoriesResponse>(this.client, `${STORE_PATH}/categories`);

  /**
   * Retrieves the status of one asynchronous store category task.
   *
   * @param input - Store task ID returned by a category change.
   * @returns An Effect that succeeds with eBay's GetStoreTaskResponseType.
   *
   * @example
   * ```ts
   * const { task } = await Effect.runPromise(storesApi.getStoreTask({ taskId: 'TASK-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTask
   */
  public getStoreTask = (
    input: GetStoreTaskInput,
  ): Effect.Effect<GetStoreTaskResponse, EbayApiError | EndpointInputError> => {
    const { client } = this;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<GetStoreTaskInput>(input, 'input');
      const taskId = yield* requireStringEffect(endpointInput.taskId, 'taskId');

      return yield* requestGetEffect<GetStoreTaskResponse>(
        client,
        `${TASKS_PATH}/${encodeURIComponent(taskId)}`,
      );
    });
  };

  /**
   * Retrieves the status of all asynchronous store tasks; each finishes as FAILED or COMPLETED
   * within 24 hours.
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's GetStoreTasksResponseType.
   *
   * @example
   * ```ts
   * const { task } = await Effect.runPromise(storesApi.getStoreTasks({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/getStoreTasks
   */
  public getStoreTasks = (
    _input: EmptyStoreInput = {},
  ): Effect.Effect<GetStoreTasksResponse, EbayApiError> =>
    requestGetEffect<GetStoreTasksResponse>(this.client, TASKS_PATH);

  /**
   * Starts adding one custom store category. eBay answers 202 with the store task URI in
   * `Location`; only one category change can be in flight at a time.
   *
   * @param input - Category name plus optional parent and listing-destination store category IDs.
   * @returns An Effect that succeeds with the store task ID and Location to poll.
   *
   * @example
   * ```ts
   * const { taskId } = await Effect.runPromise(
   *   storesApi.addStoreCategory({ categoryName: 'Vintage Cameras' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/addStoreCategory
   */
  public addStoreCategory = (
    input: AddStoreCategoryInput,
  ): Effect.Effect<StoreCategoryTask, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${STORE_PATH}/categories`;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<AddStoreCategoryInput>(input, 'input');
      const body: AddStoreCategoryRequest = {
        categoryName: yield* requireStringEffect(endpointInput.categoryName, 'categoryName'),
        destinationParentCategoryId: yield* optionalStringEffect(
          endpointInput.destinationParentCategoryId,
          'destinationParentCategoryId',
        ),
        listingDestinationCategoryId: yield* optionalStringEffect(
          endpointInput.listingDestinationCategoryId,
          'listingDestinationCategoryId',
        ),
      };

      return yield* startCategoryTask('POST', path, () => client.postForResponse(path, body));
    });
  };

  /**
   * Starts renaming one custom store category. eBay answers with the store task URI in
   * `Location`; only one category change can be in flight at a time.
   *
   * @param input - Store category ID (path) and its new name.
   * @returns An Effect that succeeds with the store task ID and Location to poll.
   *
   * @example
   * ```ts
   * const { taskId } = await Effect.runPromise(
   *   storesApi.renameStoreCategory({ categoryId: '1234', categoryName: 'Film Cameras' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/renameStoreCategory
   */
  public renameStoreCategory = (
    input: RenameStoreCategoryInput,
  ): Effect.Effect<StoreCategoryTask, EbayApiError | EndpointInputError> => {
    const { client } = this;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<RenameStoreCategoryInput>(input, 'input');
      const categoryId = yield* requireStringEffect(endpointInput.categoryId, 'categoryId');
      const body: RenameStoreCategoryRequest = {
        categoryName: yield* requireStringEffect(endpointInput.categoryName, 'categoryName'),
      };
      const path = `${STORE_PATH}/categories/${encodeURIComponent(categoryId)}`;

      return yield* startCategoryTask('PUT', path, () => client.putForResponse(path, body));
    });
  };

  /**
   * Starts deleting one custom store category. eBay answers 202 with the store task URI in
   * `Location`; only one category change can be in flight at a time. The body is sent only
   * with a listing destination; without one eBay applies its default (the Other category, ID 1).
   *
   * @param input - Store category ID to delete and an optional listing-destination store category.
   * @returns An Effect that succeeds with the store task ID and Location to poll.
   *
   * @example
   * ```ts
   * const { taskId } = await Effect.runPromise(
   *   storesApi.deleteStoreCategory({ categoryId: '1234' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/deleteStoreCategory
   */
  public deleteStoreCategory = (
    input: DeleteStoreCategoryInput,
  ): Effect.Effect<StoreCategoryTask, EbayApiError | EndpointInputError> => {
    const { client } = this;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<DeleteStoreCategoryInput>(input, 'input');
      const categoryId = yield* requireStringEffect(endpointInput.categoryId, 'categoryId');
      const listingDestinationCategoryId = yield* optionalStringEffect(
        endpointInput.listingDestinationCategoryId,
        'listingDestinationCategoryId',
      );
      const body: DeleteStoreCategoryRequest | undefined =
        listingDestinationCategoryId === undefined ? undefined : { listingDestinationCategoryId };
      const path = `${STORE_PATH}/categories/${encodeURIComponent(categoryId)}`;

      return yield* startCategoryTask('DELETE', path, () =>
        client.deleteForResponse(path, undefined, body),
      );
    });
  };

  /**
   * Starts moving one custom store category under a new parent. eBay answers 202 with the
   * store task URI in `Location`; only one category change can be in flight at a time.
   *
   * @param input - Store category to move, its new parent, and an optional listing destination.
   * @returns An Effect that succeeds with the store task ID and Location to poll.
   *
   * @example
   * ```ts
   * const { taskId } = await Effect.runPromise(
   *   storesApi.moveStoreCategory({ categoryId: '1234', destinationParentCategoryId: '-999' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/stores/resources/store/methods/moveStoreCategory
   */
  public moveStoreCategory = (
    input: MoveStoreCategoryInput,
  ): Effect.Effect<StoreCategoryTask, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${STORE_PATH}/categories/move_category`;

    return Effect.gen(function* () {
      const endpointInput = yield* requireObjectEffect<MoveStoreCategoryInput>(input, 'input');
      const body: MoveStoreCategoryRequest = {
        categoryId: yield* requireStringEffect(endpointInput.categoryId, 'categoryId'),
        destinationParentCategoryId: yield* requireStringEffect(
          endpointInput.destinationParentCategoryId,
          'destinationParentCategoryId',
        ),
        listingDestinationCategoryId: yield* optionalStringEffect(
          endpointInput.listingDestinationCategoryId,
          'listingDestinationCategoryId',
        ),
      };

      return yield* startCategoryTask('POST', path, () => client.postForResponse(path, body));
    });
  };
}
