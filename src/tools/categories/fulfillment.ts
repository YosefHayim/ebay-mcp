import { zodToJsonSchema } from 'zod-to-json-schema';
import { defineTool } from '@/tools/defineTool.js';
import type { OutputArgs } from '@/tools/types.js';
import type { ToolEntry } from '@/tools/registry.js';
import {
  mapDisputeSummariesToTable,
  mapDisputeToCard,
  mapFulfillmentsToTable,
  mapOrdersToTable,
  mapOrderToCard,
} from '@/tools/ui/maps.js';
import {
  filterOrdersWithCancellationRequests,
  filterRefundedOrders,
} from '@/api/order-management/orderIssueHelpers.js';
import {
  acceptPaymentDisputeInputSchema,
  addEvidenceInputSchema,
  contestPaymentDisputeInputSchema,
  createShippingFulfillmentInputSchema,
  getCancellationRequestsInputSchema,
  getOrdersOutputSchema,
  getOrdersInputSchema,
  getOrderOutputSchema,
  getOrderInputSchema,
  createShippingFulfillmentOutputSchema,
  fetchEvidenceContentInputSchema,
  getActivitiesInputSchema,
  getRefundedOrdersInputSchema,
  getShippingFulfillmentsOutputSchema,
  getShippingFulfillmentsInputSchema,
  getShippingFulfillmentOutputSchema,
  getShippingFulfillmentInputSchema,
  getPaymentDisputeInputSchema,
  issueRefundOutputSchema,
  issueRefundInputSchema,
  getPaymentDisputeSummariesOutputSchema,
  getPaymentDisputeSummariesInputSchema,
  uploadEvidenceFileInputSchema,
  updateEvidenceInputSchema,
} from '@/schemas/fulfillment/orders.js';
import { Effect } from 'effect';

/** Default number of recent orders scanned by cancellation/refund helpers. */
const DEFAULT_ORDER_SCAN_LIMIT = 50;

/** Fulfillment API tools for orders, shipping fulfillments, refunds, and payment disputes. */
export const fulfillmentEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_orders',
    description:
      'Retrieve orders for the seller.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: getOrdersInputSchema.shape,
    outputSchema: zodToJsonSchema(getOrdersOutputSchema, {
      name: 'GetOrdersResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.fulfillment.getOrders(args)),
    ui: { archetype: 'table', map: mapOrdersToTable },
  }),
  defineTool({
    name: 'ebay_get_order',
    description:
      'Get details of a specific order.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: getOrderInputSchema.shape,
    outputSchema: zodToJsonSchema(getOrderOutputSchema, {
      name: 'GetOrderResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.fulfillment.getOrder(args)),
    ui: { archetype: 'card', map: mapOrderToCard },
  }),
  defineTool({
    name: 'ebay_create_shipping_fulfillment',
    description:
      'Create a shipping fulfillment for an order.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: createShippingFulfillmentInputSchema.shape,
    outputSchema: zodToJsonSchema(createShippingFulfillmentOutputSchema, {
      name: 'CreateShippingFulfillmentResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.fulfillment.createShippingFulfillment(args)),
  }),
  defineTool({
    name: 'ebay_get_shipping_fulfillments',
    description:
      'Get all shipping fulfillments for an order.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: getShippingFulfillmentsInputSchema.shape,
    outputSchema: zodToJsonSchema(getShippingFulfillmentsOutputSchema, {
      name: 'GetShippingFulfillmentsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.fulfillment.getShippingFulfillments(args)),
    ui: { archetype: 'table', map: mapFulfillmentsToTable },
  }),
  defineTool({
    name: 'ebay_get_shipping_fulfillment',
    description:
      'Get a specific shipping fulfillment by ID.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: getShippingFulfillmentInputSchema.shape,
    outputSchema: zodToJsonSchema(getShippingFulfillmentOutputSchema, {
      name: 'GetShippingFulfillmentResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.fulfillment.getShippingFulfillment(args)),
  }),
  defineTool({
    name: 'ebay_issue_refund',
    description:
      'Issue a full or partial refund for an eBay order. Use this to refund buyers for orders, including specifying the refund amount and reason.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: issueRefundInputSchema.shape,
    outputSchema: zodToJsonSchema(issueRefundOutputSchema, {
      name: 'IssueRefundResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.fulfillment.issueRefund(args)),
  }),
  defineTool({
    name: 'ebay_get_cancellation_requests',
    description:
      'Scan recent seller orders for cancellation requests. Calls Fulfillment API getOrders and returns orders whose cancelState is not NONE_REQUESTED (or that list cancel requests). Read-only helper — does not use the deprecated Post-Order API.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: getCancellationRequestsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) =>
      Effect.runPromise(
        api.fulfillment
          .getOrders({
            filter: args.filter,
            limit: args.maxResults ?? DEFAULT_ORDER_SCAN_LIMIT,
          })
          .pipe(
            Effect.map((orderPage) => {
              const orders = orderPage.orders ?? [];
              const matches = filterOrdersWithCancellationRequests(orders);
              return {
                totalScanned: orders.length,
                totalMatched: matches.length,
                orders: matches,
              };
            }),
          ),
      ),
  }),
  defineTool({
    name: 'ebay_get_refunded_orders',
    description:
      'Scan recent seller orders for refunds. Calls Fulfillment API getOrders and returns orders with a non-empty paymentSummary.refunds array. Read-only helper — does not issue refunds or call the Post-Order API.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: getRefundedOrdersInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) =>
      Effect.runPromise(
        api.fulfillment
          .getOrders({
            filter: args.filter,
            limit: args.maxResults ?? DEFAULT_ORDER_SCAN_LIMIT,
          })
          .pipe(
            Effect.map((orderPage) => {
              const orders = orderPage.orders ?? [];
              const matches = filterRefundedOrders(orders);
              return {
                totalScanned: orders.length,
                totalMatched: matches.length,
                orders: matches,
              };
            }),
          ),
      ),
  }),
  // Payment Dispute Tools
  defineTool({
    name: 'ebay_get_payment_dispute_summaries',
    description:
      'Get summaries of all payment disputes. Use filters to narrow results by dispute status, buyer username, or order ID.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: getPaymentDisputeSummariesInputSchema.shape,
    outputSchema: zodToJsonSchema(getPaymentDisputeSummariesOutputSchema, {
      name: 'GetPaymentDisputeSummariesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.dispute.getPaymentDisputeSummaries(args)),
    ui: { archetype: 'table', map: mapDisputeSummariesToTable },
  }),
  defineTool({
    name: 'ebay_get_payment_dispute',
    description:
      'Get detailed information about a specific payment dispute.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: getPaymentDisputeInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        paymentDisputeId: { type: 'string' },
        orderId: { type: 'string' },
        paymentDisputeStatus: { type: 'string' },
        reason: { type: 'string' },
        amount: { type: 'object' },
      },
      description: 'Payment dispute details',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.getPaymentDispute(args)),
    ui: { archetype: 'card', map: mapDisputeToCard },
  }),
  defineTool({
    name: 'ebay_get_payment_dispute_activities',
    description:
      'Get activity history for a payment dispute, including all actions taken by buyer, seller, and eBay.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: getActivitiesInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        activity: { type: 'array' },
      },
      description: 'Payment dispute activity history',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.getActivities(args)),
  }),
  defineTool({
    name: 'ebay_accept_payment_dispute',
    description:
      'Accept a payment dispute and allow eBay to refund the buyer. Use this when you agree with the buyer claim.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: acceptPaymentDisputeInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful acceptance (HTTP 204)',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.acceptPaymentDispute(args)),
  }),
  defineTool({
    name: 'ebay_contest_payment_dispute',
    description:
      'Contest a payment dispute by providing evidence. Use this when you disagree with the buyer claim and want to provide proof.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: contestPaymentDisputeInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful contest (HTTP 204)',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.contestPaymentDispute(args)),
  }),
  defineTool({
    name: 'ebay_add_payment_dispute_evidence',
    description:
      'Add evidence to support your case in a payment dispute. Provide evidence files and supporting information.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: addEvidenceInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        evidenceId: { type: 'string' },
      },
      description: 'Evidence set response returned after adding payment dispute evidence',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.addEvidence(args)),
  }),
  defineTool({
    name: 'ebay_update_payment_dispute_evidence',
    description:
      'Update existing evidence in a payment dispute.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: updateEvidenceInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful evidence update (HTTP 204)',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.updateEvidence(args)),
  }),
  defineTool({
    name: 'ebay_upload_payment_dispute_evidence_file',
    description:
      'Upload a file as evidence for a payment dispute (e.g., shipping receipt, photos). Returns a file ID to use with add_evidence.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: uploadEvidenceFileInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
      },
      description: 'File upload response with file ID',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.uploadEvidenceFile(args)),
  }),
  defineTool({
    name: 'ebay_fetch_payment_dispute_evidence_content',
    description:
      'Download evidence file content from a payment dispute.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: fetchEvidenceContentInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        contentType: { type: 'string' },
      },
      description: 'File content and content type',
    },
    handler: (api, args) => Effect.runPromise(api.dispute.fetchEvidenceContent(args)),
  }),
];
