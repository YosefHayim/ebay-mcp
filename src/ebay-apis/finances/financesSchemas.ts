import { z } from 'zod';

/**
 * Finances API input schemas.
 *
 * Each schema is the single source of truth for one Finances API operation: the
 * MCP tool advertises its `.shape`, and the endpoint method decodes its input with it.
 * Filter and sort values keep eBay's own expression syntax as plain strings.
 */

const marketplaceId = z
  .string()
  .min(1)
  .optional()
  .describe(
    'Overrides the X-EBAY-C-MARKETPLACE-ID header, e.g. EBAY_US, EBAY_GB or EBAY_DE. Defaults to EBAY_MARKETPLACE_ID; eBay assumes EBAY_US when the header is absent.',
  );

const offset = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Zero-based number of records to skip before the page starts (eBay default 0)');

/**
 * Builds the page-size field for an operation's documented maximum and default.
 *
 * @param maximum - Largest page size eBay documents for the operation.
 * @param fallback - Page size eBay applies when the field is omitted.
 * @returns Optional positive-integer schema describing the operation's paging limits.
 */
const limit = (maximum: number, fallback: number) =>
  z
    .number()
    .int()
    .min(1)
    .max(maximum)
    .optional()
    .describe(`Records per page, up to ${maximum} (eBay default ${fallback})`);

const NON_BLANK = /\S/;

/** Builds a required, non-blank path identifier with its caller-facing description. */
const identifier = (description: string) =>
  z
    .string()
    .min(1)
    .regex(NON_BLANK, 'Must contain a non-whitespace character')
    .describe(description);

const COMBINE_NOTE = 'Separate multiple criteria with commas.';

const orderEarningsFilter = z
  .string()
  .optional()
  .describe(
    'Order creation date range in UTC; orderCreationDate is the only supported filter, e.g. orderCreationDate:[2024-10-23T00:00:01.000Z..2024-11-09T00:00:01.000Z]. eBay returns the past year when omitted.',
  );

const payoutStatusFilter =
  'payoutStatus:{SUCCEEDED} (one PayoutStatusEnum value, e.g. INITIATED, SUCCEEDED, RETRYABLE_FAILED, TERMINAL_FAILED, REVERSED)';
const payoutDateFilter =
  'payoutDate:[2024-12-17T00:00:01.000Z..2024-12-24T00:00:01.000Z] (within the last five years, range up to 36 months)';
const transactionCriteria =
  'transactionDate:[2024-10-23T00:00:01.000Z..2024-11-09T00:00:01.000Z] (last five years, range up to 36 months); transactionType:{SALE} (TransactionTypeEnum); transactionStatus:{PAYOUT} (TransactionStatusEnum, sales only); buyerUsername:{buyer1234}; payoutId:{5********8}; orderId:{0*-0***0-3***3}; transactionId:{0*-0***0-3***3}, which must be combined with transactionType';

/** Input for Finances API getOrderEarnings. */
export const getOrderEarningsInputSchema = z.object({
  marketplaceId,
  filter: orderEarningsFilter,
  limit: limit(200, 20),
  offset: offset.describe('Zero-based number of orders to skip, up to 10,000 (eBay default 0)'),
  sort: z
    .string()
    .optional()
    .describe(
      'Sort field; only orderCreationDate is supported. eBay sorts ascending by orderCreationDate by default.',
    ),
});

/** Input for Finances API getOrderEarningsById. */
export const getOrderEarningsByIdInputSchema = z.object({
  orderId: identifier('eBay order ID whose earnings are requested, e.g. 12-12345-12345'),
  marketplaceId,
});

/** Input for Finances API getOrderEarningsSummary. */
export const getOrderEarningsSummaryInputSchema = z.object({
  marketplaceId,
  filter: orderEarningsFilter,
});

/** Input for Finances API getPayout. */
export const getPayoutInputSchema = z.object({
  payoutId: identifier(
    'Payout ID from ebay_get_payouts or Seller Hub. A split-payout payoutReference returns 404.',
  ),
  marketplaceId,
});

/** Input for Finances API getPayouts. */
export const getPayoutsInputSchema = z.object({
  marketplaceId,
  filter: z
    .string()
    .optional()
    .describe(
      `Payout filter. Criteria: ${payoutDateFilter}; ${payoutStatusFilter}; lastAttemptedPayoutDate:[start..end] (requires payoutStatus:{RETRYABLE_FAILED}); payoutReference:{5********3} (mainland China sellers only). ${COMBINE_NOTE} eBay returns payouts in all states from the last five years when omitted.`,
    ),
  limit: limit(200, 20),
  offset: offset.describe(
    'Zero-based number of payouts to skip; keep below 5000 for response time (eBay default 0)',
  ),
  sort: z
    .string()
    .optional()
    .describe(
      'Set to payoutDate (or lastAttemptedPayoutDate for retryable failures) for oldest first. eBay sorts newest first by default.',
    ),
});

/** Input for Finances API getPayoutSummary. */
export const getPayoutSummaryInputSchema = z.object({
  marketplaceId,
  filter: z
    .string()
    .optional()
    .describe(
      `Payout summary filter. Criteria: ${payoutDateFilter}; ${payoutStatusFilter}. ${COMBINE_NOTE} eBay summarizes payouts in all states from the last five years when omitted.`,
    ),
});

/** Input for Finances API getSellerFundsSummary. */
export const getSellerFundsSummaryInputSchema = z.object({ marketplaceId });

/** Input for Finances API getTransactions. */
export const getTransactionsInputSchema = z.object({
  marketplaceId,
  filter: z
    .string()
    .optional()
    .describe(
      `Monetary transaction filter. Criteria: ${transactionCriteria}; payoutReference:{5*******3} (mainland China sellers only). ${COMBINE_NOTE} eBay returns all transactions from the last five years when omitted.`,
    ),
  limit: limit(1000, 20),
  offset: offset.describe(
    'Zero-based number of transactions to skip; keep below 5000 for response time (eBay default 0)',
  ),
  sort: z
    .string()
    .optional()
    .describe(
      'Set to transactionDate for oldest first; transactions sort only by date. eBay sorts newest first by default.',
    ),
});

/** Input for Finances API getTransactionSummary. */
export const getTransactionSummaryInputSchema = z.object({
  marketplaceId,
  filter: z
    .string()
    .regex(/transactionStatus:/, 'Must include a transactionStatus criterion')
    .describe(
      `Transaction summary filter. eBay requires a transactionStatus criterion, e.g. transactionStatus:{PAYOUT}; other criteria are optional: ${transactionCriteria}. ${COMBINE_NOTE}`,
    ),
});

/** Input for Finances API getTransfer. */
export const getTransferInputSchema = z.object({
  transferId: identifier(
    'TRANSFER transaction ID: the transactionId returned by ebay_get_transactions with filter transactionType:{TRANSFER}. Other transaction types return 404.',
  ),
  marketplaceId,
});

/** Input for Finances API getBillingActivities. */
export const getBillingActivitiesInputSchema = z.object({
  acceptLanguage: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Overrides the Accept-Language header for the response locale, e.g. en-US or de-DE. Defaults to EBAY_CONTENT_LANGUAGE; eBay assumes en-US when the header is absent.',
    ),
  filter: z
    .string()
    .regex(NON_BLANK, 'Must contain a non-whitespace character')
    .describe(
      'eBay requires exactly one criterion: activityId:{12**56} (a billingTransactionId), listingId:{...}, orderId:{...}, or transactionDate:[2025-10-01T00:00:00Z..2025-10-31T23:59:59Z] in UTC with a start no more than 120 days ago.',
    ),
  limit: limit(200, 100),
  offset,
  sort: z
    .string()
    .optional()
    .describe(
      'Set to transactionDate for oldest first; activities sort only by date. eBay sorts newest first by default.',
    ),
});
