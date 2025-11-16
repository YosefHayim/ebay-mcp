import { z } from 'zod';
import { shippingFulfillmentSchema } from '../schemas.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}
export const fulfillmentTools: ToolDefinition[] = [
  {
    name: 'ebay_get_orders',
    description:
      'Retrieve orders for the seller.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: {
      filter: z
        .string()
        .optional()
        .describe('Filter criteria (e.g., orderfulfillmentstatus:{NOT_STARTED})'),
      limit: z.number().optional().describe('Number of orders to return'),
      offset: z.number().optional().describe('Number of orders to skip'),
    },
  },
  {
    name: 'ebay_get_order',
    description:
      'Get details of a specific order.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: {
      orderId: z.string().describe('The unique order ID'),
    },
  },
  {
    name: 'ebay_create_shipping_fulfillment',
    description:
      'Create a shipping fulfillment for an order.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      orderId: z.string().describe('The order ID'),
      fulfillment: shippingFulfillmentSchema.describe(
        'Shipping fulfillment details including tracking number'
      ),
    },
  },
  {
    name: 'ebay_get_shipping_fulfillments',
    description:
      'Get all shipping fulfillments for an order.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: {
      orderId: z.string().describe('The order ID to get fulfillments for'),
    },
  },
  {
    name: 'ebay_get_shipping_fulfillment',
    description:
      'Get a specific shipping fulfillment by ID.\n\nRequired OAuth Scope: sell.fulfillment.readonly or sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    inputSchema: {
      orderId: z.string().describe('The order ID'),
      fulfillmentId: z.string().describe('The fulfillment ID'),
    },
  },
  {
    name: 'ebay_issue_refund',
    description:
      'Issue a full or partial refund for an eBay order. Use this to refund buyers for orders, including specifying the refund amount and reason.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      orderId: z.string().describe('The unique eBay order ID to refund'),
      refundData: z
        .object({
          reasonForRefund: z
            .string()
            .describe(
              'REQUIRED. Reason code: BUYER_CANCEL, OUT_OF_STOCK, FOUND_CHEAPER_PRICE, INCORRECT_PRICE, ITEM_DAMAGED, ITEM_DEFECTIVE, LOST_IN_TRANSIT, MUTUALLY_AGREED, SELLER_CANCEL'
            ),
          comment: z
            .string()
            .optional()
            .describe('Optional comment to buyer about the refund (max 100 characters)'),
          refundItems: z
            .array(
              z.object({
                lineItemId: z
                  .string()
                  .describe('The unique identifier of the order line item to refund'),
                refundAmount: z
                  .object({
                    value: z.string().describe('The monetary amount (e.g., "25.99")'),
                    currency: z
                      .string()
                      .describe('Three-letter ISO 4217 currency code (e.g., "USD")'),
                  })
                  .optional()
                  .describe('The amount to refund for this line item'),
                legacyReference: z
                  .object({
                    legacyItemId: z.string().optional(),
                    legacyTransactionId: z.string().optional(),
                  })
                  .optional()
                  .describe(
                    'Optional legacy item ID/transaction ID pair for identifying the line item'
                  ),
              })
            )
            .optional()
            .describe(
              'Array of individual line items to refund. Use this for partial refunds of specific items. Each item requires lineItemId and refundAmount.'
            ),
          orderLevelRefundAmount: z
            .object({
              value: z.string().describe('The monetary amount (e.g., "99.99")'),
              currency: z.string().describe('Three-letter ISO 4217 currency code (e.g., "USD")'),
            })
            .optional()
            .describe(
              'Use this to refund the entire order amount. Alternative to refundItems. Include value and currency.'
            ),
        })
        .describe(
          'Refund details including amount, reason, and optional comment. Must include reasonForRefund (required), and either refundItems (for line item refunds) OR orderLevelRefundAmount (for full order refunds).'
        ),
    },
  },
  // Payment Dispute Tools
  {
    name: 'ebay_get_payment_dispute_summaries',
    description:
      'Get summaries of all payment disputes. Use filters to narrow results by dispute status, buyer username, or order ID.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      orderFilter: z
        .string()
        .optional()
        .describe('Filter by order ID (e.g., orderid:170123456789)'),
      buyerFilter: z
        .string()
        .optional()
        .describe('Filter by buyer username (e.g., buyer_username:testbuyer)'),
      openFilter: z
        .boolean()
        .optional()
        .describe('If true, only return open disputes. If false, only return closed disputes'),
      limit: z.number().optional().describe('Maximum number of disputes to return (default: 200)'),
      offset: z.number().optional().describe('Number of disputes to skip for pagination'),
    },
  },
  {
    name: 'ebay_get_payment_dispute',
    description:
      'Get detailed information about a specific payment dispute.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The unique payment dispute ID'),
    },
  },
  {
    name: 'ebay_get_payment_dispute_activities',
    description:
      'Get activity history for a payment dispute, including all actions taken by buyer, seller, and eBay.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID'),
    },
  },
  {
    name: 'ebay_accept_payment_dispute',
    description:
      'Accept a payment dispute and allow eBay to refund the buyer. Use this when you agree with the buyer claim.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID to accept'),
      returnAddress: z
        .object({
          addressLine1: z.string().optional().describe('Street address line 1'),
          addressLine2: z.string().optional().describe('Street address line 2'),
          city: z.string().optional().describe('City name'),
          stateOrProvince: z.string().optional().describe('State or province'),
          postalCode: z.string().optional().describe('Postal/ZIP code'),
          countryCode: z.string().describe('Two-letter ISO 3166-1 country code (e.g., "US")'),
        })
        .optional()
        .describe(
          'Return address for buyer to send item back (required for ITEM_NOT_RECEIVED disputes)'
        ),
      revisionNumber: z
        .number()
        .optional()
        .describe('Dispute revision number for optimistic locking'),
    },
  },
  {
    name: 'ebay_contest_payment_dispute',
    description:
      'Contest a payment dispute by providing evidence. Use this when you disagree with the buyer claim and want to provide proof.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID to contest'),
      returnAddress: z
        .object({
          addressLine1: z.string().optional(),
          addressLine2: z.string().optional(),
          city: z.string().optional(),
          stateOrProvince: z.string().optional(),
          postalCode: z.string().optional(),
          countryCode: z.string().describe('Two-letter ISO 3166-1 country code'),
        })
        .optional()
        .describe('Return address for item returns (if applicable)'),
      revisionNumber: z.number().optional().describe('Dispute revision number'),
    },
  },
  {
    name: 'ebay_add_payment_dispute_evidence',
    description:
      'Add evidence to support your case in a payment dispute. Provide evidence files and supporting information.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID'),
      evidenceId: z
        .string()
        .optional()
        .describe('Optional evidence ID to update existing evidence'),
      evidenceType: z
        .string()
        .optional()
        .describe('Type of evidence (e.g., PROOF_OF_DELIVERY, PROOF_OF_AUTHENTICITY)'),
      files: z
        .array(
          z.object({
            fileId: z.string().describe('File ID from uploadEvidenceFile'),
          })
        )
        .optional()
        .describe('Array of file IDs to attach as evidence'),
      lineItems: z
        .array(
          z.object({
            itemId: z.string().optional().describe('eBay item ID'),
            lineItemId: z.string().optional().describe('Order line item ID'),
          })
        )
        .optional()
        .describe('Line items this evidence applies to'),
    },
  },
  {
    name: 'ebay_update_payment_dispute_evidence',
    description:
      'Update existing evidence in a payment dispute.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID'),
      evidenceId: z.string().describe('The evidence ID to update'),
      evidenceType: z.string().optional().describe('Updated evidence type'),
      files: z
        .array(
          z.object({
            fileId: z.string(),
          })
        )
        .optional()
        .describe('Updated file IDs'),
      lineItems: z
        .array(
          z.object({
            itemId: z.string().optional(),
            lineItemId: z.string().optional(),
          })
        )
        .optional()
        .describe('Updated line items'),
    },
  },
  {
    name: 'ebay_upload_payment_dispute_evidence_file',
    description:
      'Upload a file as evidence for a payment dispute (e.g., shipping receipt, photos). Returns a file ID to use with add_evidence.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID'),
      file: z
        .object({
          data: z.string().describe('Base64-encoded file data'),
          filename: z.string().describe('File name with extension'),
        })
        .describe('File to upload'),
    },
  },
  {
    name: 'ebay_fetch_payment_dispute_evidence_content',
    description:
      'Download evidence file content from a payment dispute.\n\nRequired OAuth Scope: sell.fulfillment\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    inputSchema: {
      paymentDisputeId: z.string().describe('The payment dispute ID'),
      evidenceId: z.string().describe('The evidence ID'),
      fileId: z.string().describe('The file ID to download'),
    },
  },
];
