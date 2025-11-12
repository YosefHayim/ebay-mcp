import { z } from 'zod';
import type { operations, components } from '@/types/sell_fulfillment_v1_oas3.js';

/**
 * Zod schemas for Fulfillment API input validation
 * Based on: src/api/order-management/fulfillment.ts
 * OpenAPI spec: docs/sell-apps/order-management/sell_fulfillment_v1_oas3.json
 * Types from: src/types/sell_fulfillment_v1_oas3.ts
 */

// Extract operation parameter types for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetOrdersParams = operations['getOrders']['parameters']['query'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetOrderParams = operations['getOrder']['parameters']['path'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CreateShippingFulfillmentRequest = components['schemas']['ShippingFulfillmentDetails'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetShippingFulfillmentParams = operations['getShippingFulfillment']['parameters']['path'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _IssueRefundRequest = components['schemas']['IssueRefundRequest'];

// Reusable schema for order ID
const orderIdSchema = z.string({
  message: 'Order ID is required',
  required_error: 'order_id is required',
  invalid_type_error: 'order_id must be a string',
  description: 'The unique identifier of the order',
});

// Reusable schema for fulfillment ID
const fulfillmentIdSchema = z.string({
  message: 'Fulfillment ID is required',
  required_error: 'fulfillment_id is required',
  invalid_type_error: 'fulfillment_id must be a string',
  description: 'The unique identifier of the shipping fulfillment',
});

// Reusable schema for filter parameter
const filterSchema = z
  .string({
    invalid_type_error: 'filter must be a string',
    description:
      'Filter criteria for orders (e.g., orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}, creationdate:[2020-01-01T00:00:00.000Z..2020-12-31T23:59:59.999Z])',
  })
  .optional();

// Reusable schema for limit parameter (number in API)
const limitSchema = z
  .number({
    invalid_type_error: 'limit must be a number',
    description: 'Maximum number of orders to return (default: 50)',
  })
  .optional();

// Reusable schema for offset parameter (number in API)
const offsetSchema = z
  .number({
    invalid_type_error: 'offset must be a number',
    description: 'Number of orders to skip (zero-based index)',
  })
  .optional();

/**
 * Schema for getOrders method
 * Endpoint: GET /order
 * Query: filter, limit, offset
 */
export const getOrdersSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
});

/**
 * Schema for getOrder method
 * Endpoint: GET /order/{orderId}
 * Path: orderId (required)
 */
export const getOrderSchema = z.object({
  order_id: orderIdSchema,
});

/**
 * Schema for createShippingFulfillment method
 * Endpoint: POST /order/{orderId}/shipping_fulfillment
 * Path: orderId (required)
 * Body: ShippingFulfillmentDetails - lineItems, shippedDate, shippingCarrierCode, trackingNumber
 */
export const createShippingFulfillmentSchema = z.object({
  order_id: orderIdSchema,
  line_items: z
    .array(
      z.object({
        line_item_id: z
          .string({
            invalid_type_error: 'line_item_id must be a string',
            description: 'Unique identifier of the line item',
          })
          .optional(),
        quantity: z
          .number({
            invalid_type_error: 'quantity must be a number',
            description: 'Number of units being fulfilled',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'line_items must be an array',
        description: 'Array of line items to fulfill (required)',
      }
    )
    .optional(),
  shipped_date: z
    .string({
      invalid_type_error: 'shipped_date must be a string',
      description: 'Date/time the order was shipped (ISO 8601 format, defaults to current time)',
    })
    .optional(),
  shipping_carrier_code: z
    .string({
      invalid_type_error: 'shipping_carrier_code must be a string',
      description: 'Shipping carrier code (e.g., USPS, UPS, FEDEX)',
    })
    .optional(),
  tracking_number: z
    .string({
      invalid_type_error: 'tracking_number must be a string',
      description: 'Shipment tracking number',
    })
    .optional(),
});

/**
 * Schema for getShippingFulfillments method
 * Endpoint: GET /order/{orderId}/shipping_fulfillment
 * Path: orderId (required)
 */
export const getShippingFulfillmentsSchema = z.object({
  order_id: orderIdSchema,
});

/**
 * Schema for getShippingFulfillment method
 * Endpoint: GET /order/{orderId}/shipping_fulfillment/{fulfillmentId}
 * Path: orderId (required), fulfillmentId (required)
 */
export const getShippingFulfillmentSchema = z.object({
  order_id: orderIdSchema,
  fulfillment_id: fulfillmentIdSchema,
});

/**
 * Schema for issueRefund method
 * Endpoint: POST /order/{orderId}/issue_refund
 * Path: orderId (required)
 * Body: IssueRefundRequest - reasonForRefund, comment, refundItems, orderLevelRefundAmount
 */
export const issueRefundSchema = z.object({
  order_id: orderIdSchema,
  reason_for_refund: z
    .string({
      invalid_type_error: 'reason_for_refund must be a string',
      description: 'Reason for issuing the refund (e.g., BUYER_CANCEL, OUT_OF_STOCK)',
    })
    .optional(),
  comment: z
    .string({
      invalid_type_error: 'comment must be a string',
      description: 'Optional comment about the refund',
    })
    .optional(),
  refund_items: z
    .array(
      z.object({
        line_item_id: z
          .string({
            invalid_type_error: 'line_item_id must be a string',
            description: 'Unique identifier of the line item to refund',
          })
          .optional(),
        refund_amount: z
          .object({
            value: z
              .string({
                invalid_type_error: 'value must be a string',
                description: 'Monetary amount',
              })
              .optional(),
            currency: z
              .string({
                invalid_type_error: 'currency must be a string',
                description: 'Three-letter ISO 4217 currency code',
              })
              .optional(),
          })
          .optional(),
        legacy_reference: z
          .object({
            legacy_item_id: z
              .string({
                invalid_type_error: 'legacy_item_id must be a string',
                description: 'Legacy eBay item ID',
              })
              .optional(),
            legacy_transaction_id: z
              .string({
                invalid_type_error: 'legacy_transaction_id must be a string',
                description: 'Legacy transaction ID',
              })
              .optional(),
          })
          .optional(),
      }),
      {
        invalid_type_error: 'refund_items must be an array',
        description: 'Array of line items to refund',
      }
    )
    .optional(),
  order_level_refund_amount: z
    .object({
      value: z
        .string({
          invalid_type_error: 'value must be a string',
          description: 'Monetary amount',
        })
        .optional(),
      currency: z
        .string({
          invalid_type_error: 'currency must be a string',
          description: 'Three-letter ISO 4217 currency code',
        })
        .optional(),
    })
    .optional(),
});
