import { EndpointInputError } from '@/api/shared/request.js';
import { FormatType } from '@/types/ebayEnums.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';

/** Trading API `ListingType` token for auctions. */
export const TRADING_AUCTION_LISTING_TYPE = 'Chinese';
/** Trading API `ListingDuration` token reserved for fixed-price listings. */
const TRADING_GTC_DURATION = 'GTC';
/** Trading API `EndingReason` that only applies to auctions with bids. */
const SELL_TO_HIGH_BIDDER_REASON = 'SellToHighBidder';

/** Trading listing operations whose XML call name depends on the listing format. */
export type TradingListingOperation = 'create' | 'revise' | 'end' | 'relist';

/** Trading API call names per listing operation and format. */
const TRADING_CALL_NAMES: Record<TradingListingOperation, Record<FormatType, string>> = {
  create: { AUCTION: 'AddItem', FIXED_PRICE: 'AddFixedPriceItem' },
  revise: { AUCTION: 'ReviseItem', FIXED_PRICE: 'ReviseFixedPriceItem' },
  end: { AUCTION: 'EndItem', FIXED_PRICE: 'EndFixedPriceItem' },
  relist: { AUCTION: 'RelistItem', FIXED_PRICE: 'RelistFixedPriceItem' },
};

/** Trading `Item` payload as supplied by callers: raw XML field names, unknown values. */
export type TradingItemFields = Record<string, unknown>;

const inputError = (parameter: string, message: string): EndpointInputError =>
  new EndpointInputError({ parameter, message: `${parameter}: ${message}` });

/**
 * Reads a Trading amount, which callers may pass as a bare number, a numeric
 * string, or an attributed XML node such as `{ '#text': 9.99, '@_currencyID': 'USD' }`.
 */
const parseTradingAmount = (value: unknown): number | undefined => {
  const raw = isRecord(value) ? value['#text'] : value;
  if (raw === undefined || raw === null || raw === '') {
    return;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isBestOfferEnabled = (item: TradingItemFields): boolean => {
  const details = item.BestOfferDetails;
  if (!isRecord(details)) {
    return false;
  }
  return details.BestOfferEnabled === true || details.BestOfferEnabled === 'true';
};

const auctionViolation = (
  item: TradingItemFields,
  parameter: string,
): EndpointInputError | undefined => {
  if (item.ListingType !== undefined && item.ListingType !== TRADING_AUCTION_LISTING_TYPE) {
    return inputError(
      `${parameter}.ListingType`,
      `AUCTION listings use ListingType ${TRADING_AUCTION_LISTING_TYPE}; omit it or pass format FIXED_PRICE for ${String(item.ListingType)}`,
    );
  }
  if (item.ListingDuration === TRADING_GTC_DURATION) {
    return inputError(
      `${parameter}.ListingDuration`,
      'AUCTION listings need a day-count ListingDuration such as Days_7; GTC is only valid for FIXED_PRICE listings',
    );
  }
  if (item.Quantity !== undefined && Number(item.Quantity) !== 1) {
    return inputError(
      `${parameter}.Quantity`,
      'AUCTION listings sell a single unit; omit Quantity or set it to 1',
    );
  }
  if (isBestOfferEnabled(item)) {
    return inputError(
      `${parameter}.BestOfferDetails.BestOfferEnabled`,
      'Best Offer cannot be enabled on AUCTION listings',
    );
  }
};

/** Fields eBay requires when an auction is created with AddItem. */
const auctionCreateViolation = (
  item: TradingItemFields,
  parameter: string,
): EndpointInputError | undefined => {
  if (item.ListingDuration === undefined) {
    return inputError(
      `${parameter}.ListingDuration`,
      'ListingDuration is required for AUCTION listings (a day count such as Days_7)',
    );
  }
  if (parseTradingAmount(item.StartPrice) === undefined) {
    return inputError(
      `${parameter}.StartPrice`,
      'StartPrice (the opening bid) is required for AUCTION listings',
    );
  }
};

const fixedPriceViolation = (
  item: TradingItemFields,
  parameter: string,
): EndpointInputError | undefined => {
  if (item.ListingType === TRADING_AUCTION_LISTING_TYPE) {
    return inputError(
      `${parameter}.ListingType`,
      `ListingType ${TRADING_AUCTION_LISTING_TYPE} is an auction; pass format AUCTION instead`,
    );
  }
  if (item.ReservePrice !== undefined) {
    return inputError(`${parameter}.ReservePrice`, 'ReservePrice only applies to AUCTION listings');
  }
  if (item.BuyItNowPrice !== undefined) {
    return inputError(
      `${parameter}.BuyItNowPrice`,
      'BuyItNowPrice only applies to AUCTION listings; FIXED_PRICE listings use StartPrice',
    );
  }
};

const auctionPriceViolation = (
  item: TradingItemFields,
  parameter: string,
): EndpointInputError | undefined => {
  const start = parseTradingAmount(item.StartPrice);
  if (start === undefined) {
    return;
  }
  const reserve = parseTradingAmount(item.ReservePrice);
  if (reserve !== undefined && reserve <= start) {
    return inputError(
      `${parameter}.ReservePrice`,
      'ReservePrice must be higher than StartPrice (the opening bid)',
    );
  }
  const buyItNow = parseTradingAmount(item.BuyItNowPrice);
  if (buyItNow !== undefined && buyItNow <= start) {
    return inputError(
      `${parameter}.BuyItNowPrice`,
      'BuyItNowPrice must be higher than StartPrice (eBay requires a margin above the opening bid)',
    );
  }
};

/** Inputs to the Trading listing-format rules. */
export interface TradingListingFormatCheck {
  /** Raw Trading `Item` fields supplied by the caller. */
  readonly item: TradingItemFields;
  /** Listing format the caller selected. */
  readonly format: FormatType;
  /** Parameter path used to label the failing field (for example `item`). */
  readonly parameter: string;
  /** Whether the payload creates a listing, which makes the auction essentials mandatory. */
  readonly isCreate: boolean;
}

/**
 * Finds the first Trading listing-format rule an `Item` payload breaks, if any.
 *
 * AUCTION payloads cannot carry a non-auction `ListingType`, `GTC`, a quantity other
 * than 1, or Best Offer, and on create need a `ListingDuration` and `StartPrice`.
 * FIXED_PRICE payloads cannot carry `ListingType` Chinese, `ReservePrice`, or
 * `BuyItNowPrice`. A reserve or Buy It Now price must always exceed the opening bid.
 *
 * @param check - Item payload, selected format, parameter label, and create flag.
 * @returns The tagged input error describing the violation, or undefined when the payload is consistent.
 *
 * @example
 * ```ts
 * const violation = findTradingListingFormatViolation({
 *   item: { ListingDuration: 'GTC' },
 *   format: FormatType.AUCTION,
 *   parameter: 'item',
 *   isCreate: true,
 * });
 * ```
 */
export const findTradingListingFormatViolation = ({
  item,
  format,
  parameter,
  isCreate,
}: TradingListingFormatCheck): EndpointInputError | undefined => {
  if (format === FormatType.FIXED_PRICE) {
    return fixedPriceViolation(item, parameter);
  }
  return (
    auctionViolation(item, parameter) ??
    (isCreate ? auctionCreateViolation(item, parameter) : undefined) ??
    auctionPriceViolation(item, parameter)
  );
};

/**
 * Rejects a Trading `Item` payload that mixes AUCTION and FIXED_PRICE fields before it reaches eBay.
 *
 * @param check - Item payload, selected format, parameter label, and create flag.
 * @returns An Effect that succeeds when the payload is consistent and fails with `EndpointInputError` otherwise.
 *
 * @example
 * ```ts
 * yield* validateTradingListingFormatEffect({ item, format, parameter: 'item', isCreate: true });
 * ```
 */
export const validateTradingListingFormatEffect = (
  check: TradingListingFormatCheck,
): Effect.Effect<void, EndpointInputError> => {
  const violation = findTradingListingFormatViolation(check);
  return violation ? Effect.fail(violation) : Effect.void;
};

/**
 * Rejects an ending reason that eBay only accepts for the other listing format.
 *
 * @param reason - Trading `EndingReason` selected by the caller, if any.
 * @param format - Listing format the caller selected.
 * @param parameter - Parameter path used to label the failing field (for example `reason`).
 * @returns An Effect that succeeds when the reason fits the format and fails with `EndpointInputError` otherwise.
 *
 * @example
 * ```ts
 * yield* validateTradingEndingReasonEffect('SellToHighBidder', FormatType.AUCTION, 'reason');
 * ```
 */
export const validateTradingEndingReasonEffect = (
  reason: string | undefined,
  format: FormatType,
  parameter: string,
): Effect.Effect<void, EndpointInputError> => {
  if (reason === SELL_TO_HIGH_BIDDER_REASON && format === FormatType.FIXED_PRICE) {
    return Effect.fail(
      inputError(
        parameter,
        `${SELL_TO_HIGH_BIDDER_REASON} only ends AUCTION listings; pass format AUCTION or another reason`,
      ),
    );
  }
  return Effect.void;
};

/**
 * Resolves the Trading API call name for a listing operation in the selected format.
 *
 * @param operation - Listing operation being performed.
 * @param format - Listing format the caller selected.
 * @returns The Trading API call name, such as `AddItem` for an auction create.
 *
 * @example
 * ```ts
 * const callName = tradingCallName('create', FormatType.AUCTION); // 'AddItem'
 * ```
 */
export const tradingCallName = (operation: TradingListingOperation, format: FormatType): string =>
  TRADING_CALL_NAMES[operation][format];

/**
 * Resolves the listing format selected for a Trading call, defaulting to fixed price.
 *
 * @param format - Optional format supplied by the caller.
 * @returns The selected format, or FIXED_PRICE when none was supplied.
 *
 * @example
 * ```ts
 * const format = resolveTradingFormat(undefined); // FormatType.FIXED_PRICE
 * ```
 */
export const resolveTradingFormat = (format: FormatType | undefined): FormatType =>
  format ?? FormatType.FIXED_PRICE;
