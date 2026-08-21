import type { EbayApiClient } from '@/api/client.js';
import {
  type EbayApiError,
  EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';

/** Browse API item_summary/search endpoint path. */
const SEARCH_PATH = '/buy/browse/v1/item_summary/search';

/** Browse API item resource path prefix (item id is appended URL-encoded). */
const ITEM_PATH = '/buy/browse/v1/item';

/** Default page size when limit is omitted. */
const DEFAULT_LIMIT = 20;

/** Hard upper bound for the Browse search `limit` parameter. */
const MAX_LIMIT = 200;

/** Sort orders accepted by Browse item_summary/search (default is best match). */
export const BROWSE_SORT_VALUES = ['price', '-price', 'newlyListed', 'endingSoonest'] as const;

/** Sort order union for {@link SearchActiveItemsInput.sort}. */
export type BrowseSortValue = (typeof BROWSE_SORT_VALUES)[number];

/** Input accepted by searchActiveItems. */
export interface SearchActiveItemsInput {
  /** Free-text query matched against active listings. */
  readonly query: string;
  /** Maximum number of items to return (1–200). Defaults to 20. */
  readonly limit?: number;
  /** Zero-based result offset for pagination. */
  readonly offset?: number;
  /** Sort order; omit for best-match relevance. */
  readonly sort?: BrowseSortValue;
  /** Comma-separated eBay category ids to restrict the search. */
  readonly categoryIds?: string;
  /** Condition filter values, e.g. ["NEW", "USED"]. */
  readonly conditions?: readonly string[];
  /** Buying option filter values, e.g. ["FIXED_PRICE", "AUCTION"]. */
  readonly buyingOptions?: readonly string[];
  /** Minimum price (inclusive) in priceCurrency units. */
  readonly priceMin?: number;
  /** Maximum price (inclusive) in priceCurrency units. */
  readonly priceMax?: number;
  /** Currency for priceMin/priceMax. Defaults to USD when a bound is set. */
  readonly priceCurrency?: string;
  /** Raw Browse filter expression appended verbatim for advanced filters. */
  readonly filter?: string;
}

/** Input accepted by getItemDetails. */
export interface GetItemDetailsInput {
  /** Browse RESTful item id, e.g. "v1|110587051479|0". */
  readonly itemId: string;
}

/** Monetary amount from a Browse money field. */
export interface BrowseMoney {
  /** Currency code such as USD. */
  readonly currency: string;
  /** Amount as a decimal string. */
  readonly value: string;
}

/** One active listing cleaned for marketplace search results. */
export interface ActiveItemSummary {
  /** Browse RESTful item id (input to getItemDetails). */
  readonly itemId: string;
  /** Listing title. */
  readonly title: string;
  /** Current price (fixed price or current bid) when present. */
  readonly price?: BrowseMoney;
  /** Condition display name when present. */
  readonly condition?: string;
  /** Buying options offered by the listing (FIXED_PRICE, AUCTION, BEST_OFFER). */
  readonly buyingOptions?: readonly string[];
  /** Public view-item URL when present. */
  readonly itemWebUrl?: string;
  /** Primary image URL when present. */
  readonly imageUrl?: string;
  /** Seller username when present. */
  readonly seller?: string;
  /** Seller positive-feedback percentage when present. */
  readonly sellerFeedbackPercentage?: string;
  /** Cheapest listed shipping cost when present (0.00 means free shipping). */
  readonly shippingCost?: BrowseMoney;
  /** Auction end date (ISO 8601) when present. */
  readonly itemEndDate?: string;
  /** Item country code when present. */
  readonly itemLocationCountry?: string;
}

/** Cleaned item_summary/search result returned to tool callers. */
export interface SearchActiveItemsResult {
  /** Active listings matched by the query. */
  readonly items: ActiveItemSummary[];
  /** Total matching listings reported by Browse, when available. */
  readonly total?: number;
  /** Offset echoed for pagination. */
  readonly offset: number;
  /** Limit echoed for pagination. */
  readonly limit: number;
  /** Query used for the search. */
  readonly query: string;
}

/** Cleaned Browse item detail returned to tool callers. */
export interface ItemDetails {
  /** Browse RESTful item id. */
  readonly itemId: string;
  /** Listing title. */
  readonly title: string;
  /** Current price when present. */
  readonly price?: BrowseMoney;
  /** Condition display name when present. */
  readonly condition?: string;
  /** Seller-entered condition description when present. */
  readonly conditionDescription?: string;
  /** Short description when present (full description is HTML and omitted). */
  readonly shortDescription?: string;
  /** Category path when present. */
  readonly categoryPath?: string;
  /** Buying options offered by the listing. */
  readonly buyingOptions?: readonly string[];
  /** Public view-item URL when present. */
  readonly itemWebUrl?: string;
  /** Primary image URL when present. */
  readonly imageUrl?: string;
  /** Count of additional images when present. */
  readonly additionalImageCount?: number;
  /** Seller username when present. */
  readonly seller?: string;
  /** Seller positive-feedback percentage when present. */
  readonly sellerFeedbackPercentage?: string;
  /** Estimated purchasable quantity when present. */
  readonly estimatedAvailableQuantity?: number;
  /** Auction end date (ISO 8601) when present. */
  readonly itemEndDate?: string;
  /** Item location (city/state/country) when present. */
  readonly itemLocation?: string;
  /** Whether the seller accepts returns, when stated. */
  readonly returnsAccepted?: boolean;
}

/**
 * Build the Browse `filter` expression from convenience inputs.
 *
 * Clauses are joined with commas per the Browse filter grammar. A raw
 * `filter` passthrough is appended last so advanced expressions compose with
 * the convenience parameters instead of replacing them.
 *
 * @param input - Validated convenience filter values plus optional raw filter.
 * @returns Combined filter expression, or undefined when no clause applies.
 *
 * @example
 * ```ts
 * buildBrowseFilter({ conditions: ['NEW'], priceMax: 50, priceCurrency: 'USD' });
 * // 'conditions:{NEW},price:[..50],priceCurrency:USD'
 * ```
 */
export const buildBrowseFilter = (input: {
  readonly conditions?: readonly string[];
  readonly buyingOptions?: readonly string[];
  readonly priceMin?: number;
  readonly priceMax?: number;
  readonly priceCurrency?: string;
  readonly filter?: string;
}): string | undefined => {
  const clauses: string[] = [];

  if (input.conditions && input.conditions.length > 0) {
    clauses.push(`conditions:{${input.conditions.join('|')}}`);
  }

  if (input.buyingOptions && input.buyingOptions.length > 0) {
    clauses.push(`buyingOptions:{${input.buyingOptions.join('|')}}`);
  }

  const hasMin = input.priceMin !== undefined;
  const hasMax = input.priceMax !== undefined;
  if (hasMin || hasMax) {
    const range =
      hasMin && hasMax
        ? `[${input.priceMin}..${input.priceMax}]`
        : hasMin
          ? `[${input.priceMin}]`
          : `[..${input.priceMax}]`;
    clauses.push(`price:${range}`);
    clauses.push(`priceCurrency:${input.priceCurrency ?? 'USD'}`);
  }

  if (input.filter) {
    clauses.push(input.filter);
  }

  return clauses.length > 0 ? clauses.join(',') : undefined;
};

/** Read a Browse money field ({ value, currency }). */
const parseBrowseMoney = (value: unknown): BrowseMoney | undefined => {
  if (!isRecord(value)) {
    return;
  }

  if (typeof value.value === 'string' && typeof value.currency === 'string') {
    return { currency: value.currency, value: value.value };
  }
};

/** Read a string property when present and non-empty. */
const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

/** Read a string array property when present. */
const optionalStringArray = (value: unknown): readonly string[] | undefined =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string') && value.length > 0
    ? value
    : undefined;

/**
 * Map one raw Browse item summary into a cleaned {@link ActiveItemSummary}.
 *
 * @param raw - One entry from `itemSummaries`.
 * @returns Cleaned summary, or undefined when itemId/title are missing.
 */
export const mapItemSummary = (raw: unknown): ActiveItemSummary | undefined => {
  if (!isRecord(raw)) {
    return;
  }

  const itemId = optionalString(raw.itemId);
  const title = optionalString(raw.title);
  if (!(itemId && title)) {
    return;
  }

  const price = parseBrowseMoney(raw.price);
  const condition = optionalString(raw.condition);
  const buyingOptions = optionalStringArray(raw.buyingOptions);
  const itemWebUrl = optionalString(raw.itemWebUrl);
  const image = isRecord(raw.image) ? optionalString(raw.image.imageUrl) : undefined;

  const seller = isRecord(raw.seller) ? raw.seller : undefined;
  const sellerUsername = optionalString(seller?.username);
  const sellerFeedbackPercentage = optionalString(seller?.feedbackPercentage);

  const shippingOptions = Array.isArray(raw.shippingOptions) ? raw.shippingOptions : [];
  const firstShipping = isRecord(shippingOptions[0]) ? shippingOptions[0] : undefined;
  const shippingCost = parseBrowseMoney(firstShipping?.shippingCost);

  const itemEndDate = optionalString(raw.itemEndDate);
  const itemLocation = isRecord(raw.itemLocation) ? raw.itemLocation : undefined;
  const itemLocationCountry = optionalString(itemLocation?.country);

  return {
    itemId,
    title,
    ...(price === undefined ? {} : { price }),
    ...(condition === undefined ? {} : { condition }),
    ...(buyingOptions === undefined ? {} : { buyingOptions }),
    ...(itemWebUrl === undefined ? {} : { itemWebUrl }),
    ...(image === undefined ? {} : { imageUrl: image }),
    ...(sellerUsername === undefined ? {} : { seller: sellerUsername }),
    ...(sellerFeedbackPercentage === undefined ? {} : { sellerFeedbackPercentage }),
    ...(shippingCost === undefined ? {} : { shippingCost }),
    ...(itemEndDate === undefined ? {} : { itemEndDate }),
    ...(itemLocationCountry === undefined ? {} : { itemLocationCountry }),
  };
};

/**
 * Map a raw item_summary/search response into a cleaned result.
 *
 * @param raw - Full JSON body returned by Browse search.
 * @param context - Echoed query and pagination values.
 * @returns Cleaned items plus the total match count when available.
 *
 * @example
 * ```ts
 * const result = mapSearchActiveItemsResponse(rawJson, { query: 'gpu', offset: 0, limit: 20 });
 * ```
 */
export const mapSearchActiveItemsResponse = (
  raw: unknown,
  context: { readonly query: string; readonly offset: number; readonly limit: number },
): SearchActiveItemsResult => {
  const base: SearchActiveItemsResult = { items: [], ...context };
  if (!isRecord(raw)) {
    return base;
  }

  const rawItems = Array.isArray(raw.itemSummaries) ? raw.itemSummaries : [];
  const items: ActiveItemSummary[] = [];
  for (const entry of rawItems) {
    const mapped = mapItemSummary(entry);
    if (mapped) {
      items.push(mapped);
    }
  }

  const total = typeof raw.total === 'number' ? raw.total : undefined;

  return {
    ...base,
    items,
    ...(total === undefined ? {} : { total }),
  };
};

/**
 * Map a raw Browse item resource into cleaned {@link ItemDetails}.
 *
 * The full HTML `description` is intentionally dropped — it is large and
 * unbounded; `shortDescription` is surfaced instead.
 *
 * @param raw - Full JSON body returned by the Browse item resource.
 * @returns Cleaned details, or undefined when itemId/title are missing.
 *
 * @example
 * ```ts
 * const details = mapItemDetailsResponse(rawJson);
 * ```
 */
export const mapItemDetailsResponse = (raw: unknown): ItemDetails | undefined => {
  if (!isRecord(raw)) {
    return;
  }

  const itemId = optionalString(raw.itemId);
  const title = optionalString(raw.title);
  if (!(itemId && title)) {
    return;
  }

  const price = parseBrowseMoney(raw.price);
  const condition = optionalString(raw.condition);
  const conditionDescription = optionalString(raw.conditionDescription);
  const shortDescription = optionalString(raw.shortDescription);
  const categoryPath = optionalString(raw.categoryPath);
  const buyingOptions = optionalStringArray(raw.buyingOptions);
  const itemWebUrl = optionalString(raw.itemWebUrl);
  const image = isRecord(raw.image) ? optionalString(raw.image.imageUrl) : undefined;
  const additionalImages = Array.isArray(raw.additionalImages)
    ? raw.additionalImages.length
    : undefined;

  const seller = isRecord(raw.seller) ? raw.seller : undefined;
  const sellerUsername = optionalString(seller?.username);
  const sellerFeedbackPercentage = optionalString(seller?.feedbackPercentage);

  const availability = isRecord(raw.estimatedAvailabilities)
    ? raw.estimatedAvailabilities
    : Array.isArray(raw.estimatedAvailabilities) && isRecord(raw.estimatedAvailabilities[0])
      ? raw.estimatedAvailabilities[0]
      : undefined;
  const estimatedAvailableQuantity =
    availability && typeof availability.estimatedAvailableQuantity === 'number'
      ? availability.estimatedAvailableQuantity
      : undefined;

  const itemEndDate = optionalString(raw.itemEndDate);

  const location = isRecord(raw.itemLocation) ? raw.itemLocation : undefined;
  const locationParts = [
    optionalString(location?.city),
    optionalString(location?.stateOrProvince),
    optionalString(location?.country),
  ].filter((part): part is string => part !== undefined);
  const itemLocation = locationParts.length > 0 ? locationParts.join(', ') : undefined;

  const returnTerms = isRecord(raw.returnTerms) ? raw.returnTerms : undefined;
  const returnsAccepted =
    returnTerms && typeof returnTerms.returnsAccepted === 'boolean'
      ? returnTerms.returnsAccepted
      : undefined;

  return {
    itemId,
    title,
    ...(price === undefined ? {} : { price }),
    ...(condition === undefined ? {} : { condition }),
    ...(conditionDescription === undefined ? {} : { conditionDescription }),
    ...(shortDescription === undefined ? {} : { shortDescription }),
    ...(categoryPath === undefined ? {} : { categoryPath }),
    ...(buyingOptions === undefined ? {} : { buyingOptions }),
    ...(itemWebUrl === undefined ? {} : { itemWebUrl }),
    ...(image === undefined ? {} : { imageUrl: image }),
    ...(additionalImages === undefined ? {} : { additionalImageCount: additionalImages }),
    ...(sellerUsername === undefined ? {} : { seller: sellerUsername }),
    ...(sellerFeedbackPercentage === undefined ? {} : { sellerFeedbackPercentage }),
    ...(estimatedAvailableQuantity === undefined ? {} : { estimatedAvailableQuantity }),
    ...(itemEndDate === undefined ? {} : { itemEndDate }),
    ...(itemLocation === undefined ? {} : { itemLocation }),
    ...(returnsAccepted === undefined ? {} : { returnsAccepted }),
  };
};

/**
 * Validate limit falls within Browse's supported range.
 *
 * @param limit - Positive page size already validated as > 0.
 * @returns The same value when in range, or a tagged input error.
 */
const requireLimitInRange = (limit: number): Effect.Effect<number, EndpointInputError> => {
  if (limit > MAX_LIMIT) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'limit',
        message: `limit must be between 1 and ${MAX_LIMIT}`,
      }),
    );
  }

  return Effect.succeed(limit);
};

/**
 * Validate sort is one of the supported Browse sort orders when provided.
 *
 * @param sort - Optional sort string.
 * @returns The validated sort value (or undefined), or a tagged input error.
 */
const requireSupportedSort = (
  sort: string | undefined,
): Effect.Effect<BrowseSortValue | undefined, EndpointInputError> => {
  if (sort === undefined) {
    return Effect.succeed(undefined);
  }

  if (!(BROWSE_SORT_VALUES as readonly string[]).includes(sort)) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'sort',
        message: `sort must be one of: ${BROWSE_SORT_VALUES.join(', ')}`,
      }),
    );
  }

  return Effect.succeed(sort as BrowseSortValue);
};

/** Browse API - active-listing marketplace search and item detail. */
export class BrowseApi {
  public constructor(private readonly client: EbayApiClient) {}

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
  public searchActiveItems = (
    input: SearchActiveItemsInput,
  ): Effect.Effect<SearchActiveItemsResult, EbayApiError | EndpointInputError> => {
    const client = this.client;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SearchActiveItemsInput>(input, 'input');
      const query = yield* requireStringEffect(validatedInput.query, 'query');
      const limitRaw = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offsetRaw = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const sort = yield* requireSupportedSort(validatedInput.sort);
      const categoryIds = yield* optionalStringEffect(validatedInput.categoryIds, 'categoryIds');
      const limit = yield* requireLimitInRange(limitRaw ?? DEFAULT_LIMIT);
      const offset = offsetRaw ?? 0;

      const filter = buildBrowseFilter(validatedInput);

      const params: Record<string, string | number> = {
        q: query,
        limit,
        offset,
        ...(sort === undefined ? {} : { sort }),
        ...(categoryIds === undefined ? {} : { category_ids: categoryIds }),
        ...(filter === undefined ? {} : { filter }),
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
  public getItemDetails = (
    input: GetItemDetailsInput,
  ): Effect.Effect<ItemDetails, EbayApiError | EndpointInputError> => {
    const client = this.client;

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
