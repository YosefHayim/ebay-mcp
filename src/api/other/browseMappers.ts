/**
 * Mappers turning raw Buy Browse payloads into the cleaned shapes the tools
 * return. Pure functions, no I/O, so they can be tested against fixtures
 * shaped like eBay's documented responses.
 */

import { defined } from '@/utils/objects.js';
import { isRecord } from '@/utils/typeGuards.js';
import type {
  ActiveItemSummary,
  BrowseMoney,
  ItemDetails,
  SearchActiveItemsResult,
} from '@/api/other/browseTypes.js';

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
/**
 * Pick the availability container out of a Browse item payload.
 *
 * eBay returns `estimatedAvailabilities` as either a bare object or a
 * single-element array, depending on the listing.
 */
const pickAvailabilityContainer = (value: unknown): Record<string, unknown> | undefined => {
  if (isRecord(value)) {
    return value;
  }

  if (Array.isArray(value) && isRecord(value[0])) {
    return value[0];
  }
};

const optionalStringArray = (value: unknown): readonly string[] | undefined =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string') && value.length > 0
    ? value
    : undefined;

/** Seller username and feedback score, both optional on a Browse payload. */
const pickSeller = (
  raw: Record<string, unknown>,
): { username?: string; feedbackPercentage?: string } => {
  const seller = isRecord(raw.seller) ? raw.seller : undefined;
  return defined({
    username: optionalString(seller?.username),
    feedbackPercentage: optionalString(seller?.feedbackPercentage),
  });
};

/** Primary image URL, when the payload carries one. */
const pickImageUrl = (raw: Record<string, unknown>): string | undefined =>
  isRecord(raw.image) ? optionalString(raw.image.imageUrl) : undefined;

/** Shipping cost from the first advertised shipping option, when present. */
const pickShippingCost = (raw: Record<string, unknown>): BrowseMoney | undefined => {
  const options = Array.isArray(raw.shippingOptions) ? raw.shippingOptions : [];
  const first = isRecord(options[0]) ? options[0] : undefined;
  return parseBrowseMoney(first?.shippingCost);
};

/** Estimated available quantity, which eBay nests under estimatedAvailabilities. */
const pickAvailableQuantity = (raw: Record<string, unknown>): number | undefined => {
  const availability = pickAvailabilityContainer(raw.estimatedAvailabilities);
  return typeof availability?.estimatedAvailableQuantity === 'number'
    ? availability.estimatedAvailableQuantity
    : undefined;
};

/** City, state and country joined into one human-readable location. */
const pickItemLocation = (raw: Record<string, unknown>): string | undefined => {
  const location = isRecord(raw.itemLocation) ? raw.itemLocation : undefined;
  const parts = [
    optionalString(location?.city),
    optionalString(location?.stateOrProvince),
    optionalString(location?.country),
  ].filter((part): part is string => part !== undefined);
  return parts.length > 0 ? parts.join(', ') : undefined;
};

/** Whether the seller accepts returns, when stated. */
const pickReturnsAccepted = (raw: Record<string, unknown>): boolean | undefined => {
  const terms = isRecord(raw.returnTerms) ? raw.returnTerms : undefined;
  return typeof terms?.returnsAccepted === 'boolean' ? terms.returnsAccepted : undefined;
};

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

  const seller = pickSeller(raw);

  return {
    itemId,
    title,
    ...defined({
      // Auction-only listings carry no `price`; their live figure is
      // currentBidPrice. buyingOptions still discloses which one this is.
      price: parseBrowseMoney(raw.price) ?? parseBrowseMoney(raw.currentBidPrice),
      bidCount: typeof raw.bidCount === 'number' ? raw.bidCount : undefined,
      condition: optionalString(raw.condition),
      buyingOptions: optionalStringArray(raw.buyingOptions),
      itemWebUrl: optionalString(raw.itemWebUrl),
      imageUrl: pickImageUrl(raw),
      seller: seller.username,
      sellerFeedbackPercentage: seller.feedbackPercentage,
      shippingCost: pickShippingCost(raw),
      itemEndDate: optionalString(raw.itemEndDate),
      itemLocationCountry: optionalString(
        isRecord(raw.itemLocation) ? raw.itemLocation.country : undefined,
      ),
    }),
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

  // eBay may clamp the requested window (e.g. an offset past the result set),
  // so the response values win when present; the request values are only a
  // fallback for payloads that omit them.
  const offset = typeof raw.offset === 'number' ? raw.offset : context.offset;
  const limit = typeof raw.limit === 'number' ? raw.limit : context.limit;

  return {
    ...base,
    items,
    offset,
    limit,
    ...(total === undefined ? {} : { total }),
  };
};

/**
 * Map a raw Browse item resource into cleaned {@link ItemDetails}.
 *
 * The full HTML `description` is intentionally dropped because it is large and
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

  const seller = pickSeller(raw);

  return {
    itemId,
    title,
    ...defined({
      price: parseBrowseMoney(raw.price) ?? parseBrowseMoney(raw.currentBidPrice),
      bidCount: typeof raw.bidCount === 'number' ? raw.bidCount : undefined,
      condition: optionalString(raw.condition),
      conditionDescription: optionalString(raw.conditionDescription),
      shortDescription: optionalString(raw.shortDescription),
      categoryPath: optionalString(raw.categoryPath),
      buyingOptions: optionalStringArray(raw.buyingOptions),
      itemWebUrl: optionalString(raw.itemWebUrl),
      imageUrl: pickImageUrl(raw),
      additionalImageCount: Array.isArray(raw.additionalImages)
        ? raw.additionalImages.length
        : undefined,
      seller: seller.username,
      sellerFeedbackPercentage: seller.feedbackPercentage,
      estimatedAvailableQuantity: pickAvailableQuantity(raw),
      itemEndDate: optionalString(raw.itemEndDate),
      itemLocation: pickItemLocation(raw),
      returnsAccepted: pickReturnsAccepted(raw),
    }),
  };
};
