/**
 * Auction pricing rules shared by the Inventory (REST) and Trading (XML) preflights.
 *
 * eBay requires a Buy It Now price to sit at least 30% above the opening bid for
 * most categories, so both listing paths reject smaller margins before any request.
 *
 * @see https://developer.ebay.com/api-docs/user-guides/static/trading-user-guide/buy-it-now.html
 */

/** eBay's 30% margin as an exact fraction, so cent arithmetic stays integer-only. */
const MARGIN_NUMERATOR = 13;

/** Denominator of {@link MARGIN_NUMERATOR}. */
const MARGIN_DENOMINATOR = 10;

/** Smallest Buy It Now price as a multiple of the opening bid (eBay: at least 30% higher). */
export const BUY_IT_NOW_MIN_RATIO = MARGIN_NUMERATOR / MARGIN_DENOMINATOR;

/** Human-readable form of {@link BUY_IT_NOW_MIN_RATIO} for error messages. */
export const BUY_IT_NOW_MARGIN_LABEL = '30%';

const toCents = (amount: number): number => Math.round(amount * 100);

/**
 * Smallest Buy It Now amount, in whole cents, that clears the margin for an opening bid.
 *
 * The threshold rounds *up* to the next representable cent: an opening bid of
 * $0.01 needs $0.02, because $0.013 cannot be listed. Multiplying before
 * dividing keeps the arithmetic on integers, so an exact multiple such as
 * $10.00 → $13.00 is not pushed to the next cent by binary rounding.
 *
 * @param startPrice - Opening bid.
 * @returns Required Buy It Now price in whole cents.
 */
const requiredBuyItNowCents = (startPrice: number): number =>
  Math.ceil((toCents(startPrice) * MARGIN_NUMERATOR) / MARGIN_DENOMINATOR);

/**
 * Checks eBay's Buy It Now margin: the price must be at least 30% above the opening bid.
 * Amounts are compared in whole cents so `13` passes against an opening bid of `10`.
 *
 * @param startPrice - Opening bid.
 * @param buyItNowPrice - Buy It Now price.
 * @returns Whether the Buy It Now price meets the margin.
 *
 * @example
 * ```ts
 * meetsBuyItNowMargin(10, 13); // true
 * meetsBuyItNowMargin(10, 12.99); // false
 * ```
 */
export const meetsBuyItNowMargin = (startPrice: number, buyItNowPrice: number): boolean =>
  toCents(buyItNowPrice) >= requiredBuyItNowCents(startPrice);
