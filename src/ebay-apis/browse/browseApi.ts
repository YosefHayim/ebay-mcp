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
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	requestGetEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import { defined } from "@/shared/objects.js";

const SEARCH_PATH = "/buy/browse/v1/item_summary/search";

const ITEM_PATH = "/buy/browse/v1/item";

const BROWSE_REQUEST_CONFIG: EbayRequestConfig = { tokenType: "application" };

function hasEitherPriceBound(
	priceMin: number | undefined,
	priceMax: number | undefined,
): boolean {
	const hasMin = priceMin !== undefined;

	if (hasMin) {
		return true;
	}

	const hasMax = priceMax !== undefined;

	return hasMax;
}

export class BrowseApi {
	readonly #client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.#client = client;
	}

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
		const hasPriceBounds = hasEitherPriceBound(priceMin, priceMax);
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
			throw new Error(`No item found for itemId "${itemId}"`);
		}

		return details;
	};
}
