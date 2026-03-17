import { z } from 'zod';

/**
 * Zod schemas for Fulfillment API input validation
 * Based on: src/api/order-management/fulfillment.ts
 * OpenAPI spec: docs/sell-apps/order-management/sell_fulfillment_v1_oas3.json
 */

// Reusable schema for order ID
const orderIdSchema = z.string({
  error: 'order_id is required and must be a string',
});

// Reusable schema for fulfillment ID
const fulfillmentIdSchema = z.string({
  error: 'fulfillment_id is required and must be a string',
});

// Reusable schema for filter parameter
const filterSchema = z
  .string({ error: 'filter must be a string' })
  .optional();

// Reusable schema for limit parameter (number in API)
const limitSchema = z
  .number({ error: 'limit must be a number' })
  .optional();

// Reusable schema for offset parameter (number in API)
const offsetSchema = z
  .number({ error: 'offset must be a number' })
  .optional();

/**
 * Schema for getOrders method
 * Endpoint: GET /order
 */
export const getOrdersSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
});

/**
 * Schema for getOrder method
 * Endpoint: GET /order/{orderId}
 */
export const getOrderSchema = z.object({
  order_id: orderIdSchema,
});

/**
 * Schema for createShippingFulfillment method
 * Endpoint: POST /order/{orderId}/shipping_fulfillment
 */
export const createShippingFulfillmentSchema = z.object({
  order_id: orderIdSchema,
  line_items: z
    .array(
      z.object({
        line_item_id: z.string({ error: 'line_item_id must be a string' }).optional(),
        quantity: z.number({ error: 'quantity must be a number' }).optional(),
      }),
      { error: 'line_items must be an array' }
    )
    .optional(),
  shipped_date: z.string({ error: 'shipped_date must be a string' }).optional(),
  shipping_carrier_code: z.string({ error: 'shipping_carrier_code must be a string' }).optional(),
  tracking_number: z.string({ error: 'tracking_number must be a string' }).optional(),
});

/**
 * Schema for getShippingFulfillments method
 * Endpoint: GET /order/{orderId}/shipping_fulfillment
 */
export const getShippingFulfillmentsSchema = z.object({
  order_id: orderIdSchema,
});

/**
 * Schema for getShippingFulfillment method
 * Endpoint: GET /order/{orderId}/shipping_fulfillment/{fulfillmentId}
 */
export const getShippingFulfillmentSchema = z.object({
  order_id: orderIdSchema,
  fulfillment_id: fulfillmentIdSchema,
});

/**
 * Schema for issueRefund method
 * Endpoint: POST /order/{orderId}/issue_refund
 */
export const issueRefundSchema = z.object({
  order_id: orderIdSchema,
  reason_for_refund: z.string({ error: 'reason_for_refund must be a string' }).optional(),
  comment: z.string({ error: 'comment must be a string' }).optional(),
  refund_items: z
    .array(
      z.object({
        line_item_id: z.string({ error: 'line_item_id must be a string' }).optional(),
        refund_amount: z
          .object({
            value: z.string({ error: 'value must be a string' }).optional(),
            currency: z.string({ error: 'currency must be a string' }).optional(),
          })
          .optional(),
        legacy_reference: z
          .object({
            legacy_item_id: z.string({ error: 'legacy_item_id must be a string' }).optional(),
            legacy_transaction_id: z
              .string({ error: 'legacy_transaction_id must be a string' })
              .optional(),
          })
          .optional(),
      }),
      { error: 'refund_items must be an array' }
    )
    .optional(),
  order_level_refund_amount: z
    .object({
      value: z.string({ error: 'value must be a string' }).optional(),
      currency: z.string({ error: 'currency must be a string' }).optional(),
    })
    .optional(),
});
