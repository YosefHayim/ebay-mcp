import { FINANCES_EARNINGS_SCOPE } from '@/config/environment.js';
import {
  getBillingActivitiesInputSchema,
  getOrderEarningsByIdInputSchema,
  getOrderEarningsInputSchema,
  getOrderEarningsSummaryInputSchema,
  getPayoutInputSchema,
  getPayoutSummaryInputSchema,
  getPayoutsInputSchema,
  getSellerFundsSummaryInputSchema,
  getTransactionSummaryInputSchema,
  getTransactionsInputSchema,
  getTransferInputSchema,
} from '@/schemas/account-management/finances.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

const FINANCES_SCOPE_NOTE =
  'Requires the sell.finances scope. eBay requires Digital Signatures on Finances API calls for EU/UK sellers, which this server does not add.';

const EARNINGS_SCOPE_NOTE = `Requires the optional ${FINANCES_EARNINGS_SCOPE} scope, which is not requested by default: add it to EBAY_OAUTH_SCOPES and re-run OAuth consent. eBay grants it only to approved US, CN, or HK sellers with USD payouts. eBay requires Digital Signatures on Finances API calls for EU/UK sellers, which this server does not add.`;

/** Finances API tools for payouts, transactions, transfers, seller funds, billing activity, and order earnings. */
export const financesEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_order_earnings',
    description: `Get order-level earnings from the eBay Finances API: gross amount, expenses (fees, shipping labels, donations), refunds, and net earnings per order. Filter by orderCreationDate range (defaults to the past year), page with limit/offset, sort by orderCreationDate. ${EARNINGS_SCOPE_NOTE}`,
    inputSchema: getOrderEarningsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getOrderEarnings(args)),
  }),
  defineTool({
    name: 'ebay_get_order_earnings_by_id',
    description: `Get earnings for one order from the eBay Finances API: gross amount, expenses, refunds, and net earnings for the orderId. ${EARNINGS_SCOPE_NOTE}`,
    inputSchema: getOrderEarningsByIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getOrderEarningsById(args)),
  }),
  defineTool({
    name: 'ebay_get_order_earnings_summary',
    description: `Get aggregated order earnings from the eBay Finances API for orders created in an orderCreationDate range (defaults to the past year). ${EARNINGS_SCOPE_NOTE}`,
    inputSchema: getOrderEarningsSummaryInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getOrderEarningsSummary(args)),
  }),
  defineTool({
    name: 'ebay_get_payout',
    description: `Get one seller payout by payoutId from the eBay Finances API, including amount, status, payout instrument, and transaction count. Find IDs with ebay_get_payouts. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getPayoutInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getPayout(args)),
  }),
  defineTool({
    name: 'ebay_get_payouts',
    description: `List seller payouts from the eBay Finances API (last five years). Filter by payoutDate range and/or payoutStatus, page with limit/offset, sort by payoutDate. Returns a success status with no data when nothing matches. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getPayoutsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getPayouts(args)),
  }),
  defineTool({
    name: 'ebay_get_payout_summary',
    description: `Get cumulative payout totals from the eBay Finances API: payout count, related transaction count, and total amount, optionally filtered by payoutDate range and one payoutStatus. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getPayoutSummaryInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getPayoutSummary(args)),
  }),
  defineTool({
    name: 'ebay_get_seller_funds_summary',
    description: `Get the seller's funds not yet paid out from the eBay Finances API: available, processing, on-hold, and total amounts. Returns a success status with no data when no funds are pending. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getSellerFundsSummaryInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getSellerFundsSummary(args)),
  }),
  defineTool({
    name: 'ebay_get_transactions',
    description: `List monetary transactions (sales, refunds, credits, fees, transfers, and more) from the eBay Finances API, last five years. Filter by transactionDate, transactionType, transactionStatus, buyerUsername, payoutId, orderId, or transactionId; page with limit/offset; sort by transactionDate. Returns a success status with no data when nothing matches. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getTransactionsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getTransactions(args)),
  }),
  defineTool({
    name: 'ebay_get_transaction_summary',
    description: `Get cumulative transaction counts and amounts from the eBay Finances API, including on-hold payments. eBay requires a transactionStatus criterion in filter, e.g. transactionStatus:{PAYOUT}. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getTransactionSummaryInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getTransactionSummary(args)),
  }),
  defineTool({
    name: 'ebay_get_transfer',
    description: `Get one TRANSFER transaction (the seller reimbursing eBay, e.g. for a buyer refund) from the eBay Finances API. Find IDs with ebay_get_transactions and filter transactionType:{TRANSFER}. Read-only; does not move money. ${FINANCES_SCOPE_NOTE}`,
    inputSchema: getTransferInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getTransfer(args)),
  }),
  defineTool({
    name: 'ebay_get_billing_activities',
    description:
      'Get seller billing activities (fees and credits) from the eBay Finances API. eBay requires exactly one filter criterion: activityId, listingId, orderId, or a transactionDate range starting within the last 120 days. Page with limit/offset, sort by transactionDate. Requires the sell.finances scope.',
    inputSchema: getBillingActivitiesInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finances.getBillingActivities(args)),
  }),
];
