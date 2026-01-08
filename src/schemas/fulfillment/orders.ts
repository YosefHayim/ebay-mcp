import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ReasonForRefund } from '@/types/ebay-enums.js';

/**
 * Fulfillment/Order Management API Schemas
 *
 * This file contains Zod schemas for all Order Management and Fulfillment endpoints.
 */

// ============================================================================
// Common Schemas
// ============================================================================

const errorSchema = z.object({
  errorId: z.number().optional(),
  domain: z.string().optional(),
  category: z.string().optional(),
  message: z.string().optional(),
  longMessage: z.string().optional(),
  parameters: z
    .array(
      z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),
});

const amountSchema = z.object({
  currency: z.string(),
  value: z.string(),
  convertedFromCurrency: z.string().optional(),
  convertedFromValue: z.string().optional(),
  exchangeRate: z.string().optional(),
});

const addressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateOrProvince: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
});

// ============================================================================
// Order Schemas
// ============================================================================

const buyerSchema = z.object({
  username: z.string().optional(),
  taxAddress: addressSchema.optional(),
  taxIdentifier: z
    .object({
      taxpayerId: z.string().optional(),
      taxIdentifierType: z.string().optional(),
      issuingCountry: z.string().optional(),
    })
    .optional(),
});

const lineItemSchema = z.object({
  lineItemId: z.string().optional(),
  legacyItemId: z.string().optional(),
  legacyVariationId: z.string().optional(),
  sku: z.string().optional(),
  title: z.string().optional(),
  quantity: z.number().optional(),
  lineItemCost: amountSchema.optional(),
  lineItemFulfillmentStatus: z.string().optional(),
  lineItemFulfillmentInstructions: z
    .object({
      guaranteedDelivery: z.boolean().optional(),
      minEstimatedDeliveryDate: z.string().optional(),
      maxEstimatedDeliveryDate: z.string().optional(),
      shipByDate: z.string().optional(),
    })
    .optional(),
  total: amountSchema.optional(),
  deliveryCost: amountSchema.optional(),
  taxes: z
    .array(
      z.object({
        taxType: z.string().optional(),
        amount: amountSchema.optional(),
      })
    )
    .optional(),
  itemLocation: addressSchema.optional(),
  properties: z
    .object({
      soldViaAdCampaign: z.boolean().optional(),
      buyerProtection: z.boolean().optional(),
    })
    .optional(),
  purchaseMarketplaceId: z.string().optional(),
});

const shippingFulfillmentSchema = z.object({
  fulfillmentId: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        lineItemId: z.string().optional(),
        quantity: z.number().optional(),
      })
    )
    .optional(),
  shippedDate: z.string().optional(),
  shippingCarrierCode: z.string().optional(),
  trackingNumber: z.string().optional(),
});

const orderSchema = z.object({
  orderId: z.string().optional(),
  legacyOrderId: z.string().optional(),
  creationDate: z.string().optional(),
  lastModifiedDate: z.string().optional(),
  orderFulfillmentStatus: z.string().optional(),
  orderPaymentStatus: z.string().optional(),
  sellerId: z.string().optional(),
  buyer: buyerSchema.optional(),
  pricingSummary: z
    .object({
      priceSubtotal: amountSchema.optional(),
      deliveryCost: amountSchema.optional(),
      deliveryDiscount: amountSchema.optional(),
      tax: amountSchema.optional(),
      total: amountSchema.optional(),
    })
    .optional(),
  cancelStatus: z
    .object({
      cancelState: z.string().optional(),
      cancelRequests: z
        .array(
          z.object({
            cancelCompletedDate: z.string().optional(),
            cancelInitiator: z.string().optional(),
            cancelReason: z.string().optional(),
            cancelRequestedDate: z.string().optional(),
            cancelRequestId: z.string().optional(),
            cancelRequestState: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
  lineItems: z.array(lineItemSchema).optional(),
  fulfillmentStartInstructions: z
    .array(
      z.object({
        fulfillmentInstructionsType: z.string().optional(),
        minEstimatedDeliveryDate: z.string().optional(),
        maxEstimatedDeliveryDate: z.string().optional(),
        shipByDate: z.string().optional(),
        shippingStep: z
          .object({
            shipTo: addressSchema.optional(),
            shipToReferenceId: z.string().optional(),
            shippingCarrierCode: z.string().optional(),
            shippingServiceCode: z.string().optional(),
          })
          .optional(),
      })
    )
    .optional(),
  fulfillmentHrefs: z.array(z.string()).optional(),
  paymentSummary: z
    .object({
      payments: z
        .array(
          z.object({
            paymentDate: z.string().optional(),
            paymentMethod: z.string().optional(),
            paymentReferenceId: z.string().optional(),
            paymentStatus: z.string().optional(),
            amount: amountSchema.optional(),
          })
        )
        .optional(),
      refunds: z
        .array(
          z.object({
            refundDate: z.string().optional(),
            refundId: z.string().optional(),
            refundReferenceId: z.string().optional(),
            refundStatus: z.string().optional(),
            amount: amountSchema.optional(),
          })
        )
        .optional(),
      totalDueSeller: amountSchema.optional(),
    })
    .optional(),
  salesRecordReference: z.string().optional(),
  totalFeeBasisAmount: amountSchema.optional(),
  totalMarketplaceFee: amountSchema.optional(),
});

export const getOrdersInputSchema = z.object({
  filter: z
    .string()
    .optional()
    .describe('Filter criteria for orders (e.g., creationdate:[2024-01-01..2024-12-31])'),
  limit: z.number().optional().describe('Number of orders to return per page'),
  offset: z.number().optional().describe('Number of orders to skip for pagination'),
  orderIds: z.string().optional().describe('Comma-separated list of order IDs'),
});

export const getOrdersOutputSchema = z.object({
  orders: z.array(orderSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getOrderInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
});

export const getOrderOutputSchema = orderSchema.extend({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Shipping Fulfillment Schemas
// ============================================================================

export const createShippingFulfillmentInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  fulfillment: z.object({
    lineItems: z
      .array(
        z.object({
          lineItemId: z.string(),
          quantity: z.number().optional(),
        })
      )
      .describe('Line items to fulfill'),
    shippedDate: z.string().optional().describe('Date the items were shipped (ISO 8601 format)'),
    shippingCarrierCode: z.string().optional().describe('Shipping carrier code'),
    trackingNumber: z.string().optional().describe('Tracking number for the shipment'),
  }),
});

export const createShippingFulfillmentOutputSchema = z.object({
  fulfillmentId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getShippingFulfillmentsInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
});

export const getShippingFulfillmentsOutputSchema = z.object({
  fulfillments: z.array(shippingFulfillmentSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Refund Schemas
// ============================================================================

const lineItemRefundSchema = z.object({
  lineItemId: z.string(),
  refundAmount: amountSchema.optional(),
  legacyReference: z
    .object({
      legacyItemId: z.string().optional(),
      legacyTransactionId: z.string().optional(),
    })
    .optional(),
});

export const issueRefundInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  refundData: z.object({
    reasonForRefund: z.nativeEnum(ReasonForRefund).describe('Reason for issuing the refund'),
    comment: z.string().optional().describe('Optional comment about the refund'),
    refundItems: z.array(lineItemRefundSchema).optional().describe('Line items to refund'),
    orderLevelRefundAmount: amountSchema
      .optional()
      .describe('Order-level refund amount (for partial refunds)'),
  }),
});

export const issueRefundOutputSchema = z.object({
  refundId: z.string().optional(),
  refundStatus: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Payment Dispute Schemas
// ============================================================================

const paymentDisputeSchema = z.object({
  paymentDisputeId: z.string().optional(),
  orderId: z.string().optional(),
  openDate: z.string().optional(),
  respondByDate: z.string().optional(),
  status: z.string().optional(),
  reason: z.string().optional(),
  amount: amountSchema.optional(),
  buyer: buyerSchema.optional(),
  lineItems: z.array(lineItemSchema).optional(),
  evidence: z
    .array(
      z.object({
        evidenceId: z.string().optional(),
        evidenceType: z.string().optional(),
        files: z
          .array(
            z.object({
              fileId: z.string().optional(),
              name: z.string().optional(),
              uploadedDate: z.string().optional(),
            })
          )
          .optional(),
        lineItems: z
          .array(
            z.object({
              lineItemId: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export const getPaymentDisputesInputSchema = z.object({
  orderIds: z.string().optional().describe('Comma-separated list of order IDs'),
  buyerUsername: z.string().optional().describe('Filter by buyer username'),
  openDateFrom: z.string().optional().describe('Start date for dispute open date filter'),
  openDateTo: z.string().optional().describe('End date for dispute open date filter'),
  limit: z.number().optional().describe('Number of disputes to return'),
  offset: z.number().optional().describe('Number of disputes to skip'),
});

export const getPaymentDisputesOutputSchema = z.object({
  paymentDisputes: z.array(paymentDisputeSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getFulfillmentJsonSchemas() {
  return {
    // Orders
    getOrdersInput: zodToJsonSchema(getOrdersInputSchema, 'getOrdersInput'),
    getOrdersOutput: zodToJsonSchema(getOrdersOutputSchema, 'getOrdersOutput'),
    getOrderInput: zodToJsonSchema(getOrderInputSchema, 'getOrderInput'),
    getOrderOutput: zodToJsonSchema(getOrderOutputSchema, 'getOrderOutput'),
    orderDetails: zodToJsonSchema(orderSchema, 'orderDetails'),

    // Shipping Fulfillment
    createShippingFulfillmentInput: zodToJsonSchema(
      createShippingFulfillmentInputSchema,
      'createShippingFulfillmentInput'
    ),
    createShippingFulfillmentOutput: zodToJsonSchema(
      createShippingFulfillmentOutputSchema,
      'createShippingFulfillmentOutput'
    ),
    getShippingFulfillmentsInput: zodToJsonSchema(
      getShippingFulfillmentsInputSchema,
      'getShippingFulfillmentsInput'
    ),
    getShippingFulfillmentsOutput: zodToJsonSchema(
      getShippingFulfillmentsOutputSchema,
      'getShippingFulfillmentsOutput'
    ),
    shippingFulfillmentDetails: zodToJsonSchema(
      shippingFulfillmentSchema,
      'shippingFulfillmentDetails'
    ),

    // Refunds
    issueRefundInput: zodToJsonSchema(issueRefundInputSchema, 'issueRefundInput'),
    issueRefundOutput: zodToJsonSchema(issueRefundOutputSchema, 'issueRefundOutput'),

    // Payment Disputes
    getPaymentDisputesInput: zodToJsonSchema(
      getPaymentDisputesInputSchema,
      'getPaymentDisputesInput'
    ),
    getPaymentDisputesOutput: zodToJsonSchema(
      getPaymentDisputesOutputSchema,
      'getPaymentDisputesOutput'
    ),
    paymentDisputeDetails: zodToJsonSchema(paymentDisputeSchema, 'paymentDisputeDetails'),
  };
}
