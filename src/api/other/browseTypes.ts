/**
 * Shared types for the Buy Browse API surface.
 *
 * Split out of `browse.ts` so the client, the mappers and the filter builder
 * can all reference them without importing each other.
 */

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
  /** Current price when present: the fixed price, or an auction's current bid. */
  readonly price?: BrowseMoney;
  /** Number of bids placed, for auction listings. */
  readonly bidCount?: number;
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
  /** First listed shipping cost when present (0.00 means free shipping). */
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
  /** Current price when present: the fixed price, or an auction's current bid. */
  readonly price?: BrowseMoney;
  /** Number of bids placed, for auction listings. */
  readonly bidCount?: number;
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
