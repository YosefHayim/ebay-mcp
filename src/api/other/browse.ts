import type { EbayApiClient } from '@/api/client.js';
import {
  type EbayApiError,
  EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  requestGetEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { defined } from '@/utils/objects.js';
import { Effect } from 'effect';
import { buildBrowseFilter, requireNoPriceFilterConflict } from '@/api/other/browseFilter.js';
import { mapItemDetailsResponse, mapSearchActiveItemsResponse } from '@/api/other/browseMappers.js';
import {
  DEFAULT_LIMIT,
  optionalNonBlankStringEffect,
  optionalStringArrayEffect,
  requireCoherentPriceRange,
  requireLimitInRange,
  requireOffsetInRange,
  requireSupportedSort,
} from '@/api/other/browseValidators.js';
import type {
  GetItemDetailsInput,
  ItemDetails,
  SearchActiveItemsInput,
  SearchActiveItemsResult,
} from '@/api/other/browseTypes.js';

/** Browse API item_summary/search endpoint path. */
const SEARCH_PATH = '/buy/browse/v1/item_summary/search';

/** Browse API item resource path prefix (item id is appended URL-encoded). */
const ITEM_PATH = '/buy/browse/v1/item';

/** Browse API - active-listing marketplace search and item detail. */
export class BrowseApi {
  readonly #client: EbayApiClient;

  constructor(client: EbayApiClient) {
    this.#client = client;
  }

  /**
   * Search active eBay listings (marketplace-wide, not the seller's own).
   *
   * Uses the Buy Browse API (`item_summary/search`). Works with an
   * application access token under the basic `api_scope`; a user token also
   * works. The counterpart of `findCompletedItems` for live listings.
   *
   * @param input - Query plus optional pagination, sort, and filters.
   * @returns An Effect that succeeds with cleaned active-listing summaries.
   *
   * @example
   * ```ts
   * const results = await Effect.runPromise(
   *   browseApi.searchActiveItems({ query: 'nike dunk low', conditions: ['NEW'], limit: 25 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
   */
  searchActiveItems = (
    input: SearchActiveItemsInput,
  ): Effect.Effect<SearchActiveItemsResult, EbayApiError | EndpointInputError> => {
    const client = this.#client;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SearchActiveItemsInput>(input, 'input');
      const query = yield* requireStringEffect(validatedInput.query, 'query');
      const limitRaw = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offsetRaw = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const sort = yield* requireSupportedSort(validatedInput.sort);
      const categoryIds = yield* optionalNonBlankStringEffect(
        validatedInput.categoryIds,
        'categoryIds',
      );
      const conditions = yield* optionalStringArrayEffect(validatedInput.conditions, 'conditions');
      const buyingOptions = yield* optionalStringArrayEffect(
        validatedInput.buyingOptions,
        'buyingOptions',
      );
      const priceMin = yield* optionalNonNegativeNumberEffect(validatedInput.priceMin, 'priceMin');
      const priceMax = yield* optionalNonNegativeNumberEffect(validatedInput.priceMax, 'priceMax');
      const priceCurrency = yield* optionalNonBlankStringEffect(
        validatedInput.priceCurrency,
        'priceCurrency',
      );
      const rawFilter = yield* optionalNonBlankStringEffect(validatedInput.filter, 'filter');
      const limit = yield* requireLimitInRange(limitRaw ?? DEFAULT_LIMIT);
      const offset = yield* requireOffsetInRange(offsetRaw ?? 0, limit);
      yield* requireCoherentPriceRange(priceMin, priceMax);
      yield* requireNoPriceFilterConflict(
        rawFilter,
        priceMin !== undefined || priceMax !== undefined,
      );

      // Built from the validated values, never the raw input, so the public
      // API surface enforces the same contract the MCP schema advertises.
      const filter = buildBrowseFilter(
        defined({
          conditions,
          buyingOptions,
          priceMin,
          priceMax,
          priceCurrency,
          filter: rawFilter,
        }),
      );

      const params: Record<string, string | number> = {
        q: query,
        limit,
        offset,
        ...defined({ sort, category_ids: categoryIds, filter }),
      };

      const raw = yield* requestGetEffect<unknown>(client, SEARCH_PATH, params);

      return mapSearchActiveItemsResponse(raw, { query, offset, limit });
    });
  };

  /**
   * Get full detail for one active listing by its Browse RESTful item id.
   *
   * Uses the Buy Browse API item resource. The id comes from
   * `searchActiveItems` results (e.g. "v1|110587051479|0").
   *
   * @param input - Browse RESTful item id.
   * @returns An Effect that succeeds with cleaned item details.
   *
   * @example
   * ```ts
   * const details = await Effect.runPromise(
   *   browseApi.getItemDetails({ itemId: 'v1|110587051479|0' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/buy/browse/resources/item/methods/getItem
   */
  getItemDetails = (
    input: GetItemDetailsInput,
  ): Effect.Effect<ItemDetails, EbayApiError | EndpointInputError> => {
    const client = this.#client;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetItemDetailsInput>(input, 'input');
      const itemId = yield* requireStringEffect(validatedInput.itemId, 'itemId');

      const path = `${ITEM_PATH}/${encodeURIComponent(itemId)}`;
      const raw = yield* requestGetEffect<unknown>(client, path);

      const details = mapItemDetailsResponse(raw);
      if (!details) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'itemId',
            message: `No item found for itemId "${itemId}"`,
          }),
        );
      }

      return details;
    });
  };
}
