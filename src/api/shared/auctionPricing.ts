/**
 * Auction pricing rules shared by the Inventory (REST) and Trading (XML) preflights.
 *
 * eBay requires a Buy It Now price to sit at least 30% above the opening bid for
 * most categories, so both listing paths reject smaller margins before any request.
 *
 * @see https://developer.ebay.com/api-docs/user-guides/static/trading-user-guide/buy-it-now.html
 */

/** Smallest Buy It Now price as a multiple of the opening bid (eBay: at least 30% higher). */
export const BUY_IT_NOW_MIN_RATIO = 1.3;

/** Human-readable form of {@link BUY_IT_NOW_MIN_RATIO} for error messages. */
export const BUY_IT_NOW_MARGIN_LABEL = '30%';

const toCents = (amount: number): number => Math.round(amount * 100);

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
  toCents(buyItNowPrice) >= toCents(startPrice * BUY_IT_NOW_MIN_RATIO);
