import {
	buildBrowseFilter,
	requireNoPriceFilterConflict,
} from "@/ebay-apis/browse/browseFilter.js";
import {
	mapItemDetailsResponse,
	mapSearchActiveItemsResponse,
} from "@/ebay-apis/browse/browseMappers.js";
import type {
	GetItemDetailsInput,
	ItemDetails,
	SearchActiveItemsInput,
	SearchActiveItemsResult,
} from "@/ebay-apis/browse/browseTypes.js";
import {
	DEFAULT_LIMIT,
	optionalNonBlankStringEffect,
	optionalStringArrayEffect,
	requireCoherentPriceRange,
	requireLimitInRange,
	requireOffsetInRange,
	requireSupportedSort,
} from "@/ebay-apis/browse/browseValidators.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	EndpointInputError,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	requestGetEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import { defined } from "@/shared/objects.js";

/** Browse API item_summary/search endpoint path. */
const SEARCH_PATH = "/buy/browse/v1/item_summary/search";

/** Browse API item resource path prefix (item id is appended URL-encoded). */
const ITEM_PATH = "/buy/browse/v1/item";

/**
 * eBay documents every Browse method as requiring an application access token
 * from the client-credentials flow, so Browse opts out of the client's default
 * user-first token path.
 *
 * @see https://developer.ebay.com/develop/api/buy/browse_api
 */
const BROWSE_REQUEST_CONFIG: EbayRequestConfig = { tokenType: "application" };

/** Browse API - active-listing marketplace search and item detail. */
export class BrowseApi {
	readonly #client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.#client = client;
	}

	/**
	 * Search active eBay listings (marketplace-wide, not the seller's own).
	 *
	 * Uses the Buy Browse API (`item_summary/search`) with the application
	 * access token eBay requires for Browse, minted from client credentials
	 * under the basic `api_scope`. Returns live listings only.
	 *
	 * @param input - Query plus optional pagination, sort, and filters.
	 * @returns cleaned active-listing summaries.
	 *
	 * @example
	 * ```ts
	 * const results = await browseApi.searchActiveItems({ query: 'nike dunk low', conditions: ['NEW'], limit: 25 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
	 */
	searchActiveItems = async (
		input: SearchActiveItemsInput,
	): Promise<SearchActiveItemsResult> => {
		const validatedInput = requireObjectEffect<SearchActiveItemsInput>(
			input,
			"input",
		);
		const query = requireStringEffect(validatedInput.query, "query");
		const limitRaw = optionalPositiveNumberEffect(
			validatedInput.limit,
			"limit",
		);
		const offsetRaw = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const sort = requireSupportedSort(validatedInput.sort);
		const categoryIds = optionalNonBlankStringEffect(
			validatedInput.categoryIds,
			"categoryIds",
		);
		const conditions = optionalStringArrayEffect(
			validatedInput.conditions,
			"conditions",
		);
		const buyingOptions = optionalStringArrayEffect(
			validatedInput.buyingOptions,
			"buyingOptions",
		);
		const priceMin = optionalNonNegativeNumberEffect(
			validatedInput.priceMin,
			"priceMin",
		);
		const priceMax = optionalNonNegativeNumberEffect(
			validatedInput.priceMax,
			"priceMax",
		);
		const priceCurrency = optionalNonBlankStringEffect(
			validatedInput.priceCurrency,
			"priceCurrency",
		);
		const rawFilter = optionalNonBlankStringEffect(
			validatedInput.filter,
			"filter",
		);
		const limit = requireLimitInRange(limitRaw ?? DEFAULT_LIMIT);
		const offset = requireOffsetInRange(offsetRaw ?? 0, limit);
		requireCoherentPriceRange(priceMin, priceMax);
		const hasPriceBounds = priceMin !== undefined || priceMax !== undefined;
		requireNoPriceFilterConflict(rawFilter, hasPriceBounds);

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

		const raw = await requestGetEffect<unknown>(
			this.#client,
			SEARCH_PATH,
			params,
			BROWSE_REQUEST_CONFIG,
		);

		return mapSearchActiveItemsResponse(raw, { query, offset, limit });
	};

	/**
	 * Get full detail for one active listing by its Browse RESTful item id.
	 *
	 * Uses the Buy Browse API item resource with the application access token
	 * eBay requires for Browse. The id comes from `searchActiveItems` results
	 * (e.g. "v1|110587051479|0").
	 *
	 * @param input - Browse RESTful item id.
	 * @returns cleaned item details.
	 *
	 * @example
	 * ```ts
	 * const details = await browseApi.getItemDetails({ itemId: 'v1|110587051479|0' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/buy/browse/resources/item/methods/getItem
	 */
	getItemDetails = async (input: GetItemDetailsInput): Promise<ItemDetails> => {
		const validatedInput = requireObjectEffect<GetItemDetailsInput>(
			input,
			"input",
		);
		const itemId = requireStringEffect(validatedInput.itemId, "itemId");
		const path = `${ITEM_PATH}/${encodeURIComponent(itemId)}`;
		const raw = await requestGetEffect<unknown>(
			this.#client,
			path,
			undefined,
			BROWSE_REQUEST_CONFIG,
		);
		const details = mapItemDetailsResponse(raw);
		const isItemMissing = details === undefined;

		if (isItemMissing) {
			throw new EndpointInputError({
				parameter: "itemId",
				message: `No item found for itemId "${itemId}"`,
			});
		}

		return details;
	};
}
