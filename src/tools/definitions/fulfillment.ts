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
];
