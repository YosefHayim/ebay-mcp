import { z } from 'zod';
import { ReasonForRefund } from '@/types/ebayEnums.js';

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
      }),
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
      }),
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
      }),
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
          }),
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
      }),
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
          }),
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
          }),
        )
        .optional(),
      totalDueSeller: amountSchema.optional(),
    })
    .optional(),
  salesRecordReference: z.string().optional(),
  totalFeeBasisAmount: amountSchema.optional(),
  totalMarketplaceFee: amountSchema.optional(),
});

/**
 * Validates the Fulfillment API get orders request payload.
 */
export const getOrdersInputSchema = z.object({
  fieldGroups: z.string().optional().describe('Response field group, e.g. TAX_BREAKDOWN'),
  filter: z
    .string()
    .optional()
    .describe('Filter criteria for orders (e.g., creationdate:[2024-01-01..2024-12-31])'),
  limit: z.number().optional().describe('Number of orders to return per page'),
  offset: z.number().optional().describe('Number of orders to skip for pagination'),
  orderIds: z.string().optional().describe('Comma-separated list of order IDs'),
});

/**
 * Shared input for read-only order issue scanners (cancellation / refund helpers).
 * Calls getOrders then filters client-side — no Post-Order API.
 */
export const scanOrderIssuesInputSchema = z.object({
  filter: z
    .string()
    .optional()
    .describe(
      'Optional Fulfillment getOrders filter expression (e.g. creationdate:[2024-01-01T00:00:00.000Z..2024-12-31T23:59:59.999Z])',
    ),
  maxResults: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum orders to scan via getOrders (default 50)'),
});

/** Input for ebay_get_cancellation_requests. */
export const getCancellationRequestsInputSchema = scanOrderIssuesInputSchema;

/** Input for ebay_get_refunded_orders. */
export const getRefundedOrdersInputSchema = scanOrderIssuesInputSchema;

/**
 * Validates the Fulfillment API get orders response payload.
 */
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

/**
 * Validates the Fulfillment API get order request payload.
 */
export const getOrderInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  fieldGroups: z.string().optional().describe('Response field group, e.g. TAX_BREAKDOWN'),
});

/**
 * Validates the Fulfillment API get order response payload.
 */
export const getOrderOutputSchema = orderSchema.extend({
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Shipping Fulfillment Schemas
// ============================================================================

/**
 * Validates the Fulfillment API create shipping fulfillment request payload.
 */
export const createShippingFulfillmentInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  body: z.object({
    lineItems: z
      .array(
        z.object({
          lineItemId: z.string(),
          quantity: z.number().optional(),
        }),
      )
      .describe('Line items to fulfill'),
    shippedDate: z.string().optional().describe('Date the items were shipped (ISO 8601 format)'),
    shippingCarrierCode: z.string().optional().describe('Shipping carrier code'),
    trackingNumber: z.string().optional().describe('Tracking number for the shipment'),
  }),
});

/**
 * Validates the Fulfillment API create shipping fulfillment response payload.
 */
export const createShippingFulfillmentOutputSchema = z.object({});

/**
 * Validates the Fulfillment API get shipping fulfillments request payload.
 */
export const getShippingFulfillmentsInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
});

/**
 * Validates the Fulfillment API get shipping fulfillments response payload.
 */
export const getShippingFulfillmentsOutputSchema = z.object({
  fulfillments: z.array(shippingFulfillmentSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Fulfillment API get one shipping fulfillment request payload.
 */
export const getShippingFulfillmentInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  fulfillmentId: z.string().describe('The unique identifier of the shipping fulfillment'),
});

/**
 * Validates the Fulfillment API get one shipping fulfillment response payload.
 */
export const getShippingFulfillmentOutputSchema = shippingFulfillmentSchema;

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

/**
 * Validates the Fulfillment API issue refund request payload.
 */
export const issueRefundInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  body: z.object({
    reasonForRefund: z.nativeEnum(ReasonForRefund).describe('Reason for issuing the refund'),
    comment: z.string().optional().describe('Optional comment about the refund'),
    refundItems: z.array(lineItemRefundSchema).optional().describe('Line items to refund'),
    orderLevelRefundAmount: amountSchema
      .optional()
      .describe('Order-level refund amount (for partial refunds)'),
  }),
});

/**
 * Validates the Fulfillment API issue refund response payload.
 */
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
  paymentDisputeStatus: z.string().optional(),
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
            }),
          )
          .optional(),
        lineItems: z
          .array(
            z.object({
              lineItemId: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

const paymentDisputeSummarySchema = z.object({
  paymentDisputeId: z.string().optional(),
  orderId: z.string().optional(),
  openDate: z.string().optional(),
  respondByDate: z.string().optional(),
  paymentDisputeStatus: z.string().optional(),
  reason: z.string().optional(),
  amount: amountSchema.optional(),
});

const paymentDisputeIdSchema = z.string().describe('The unique payment dispute ID');

const disputeReturnAddressSchema = z.object({
  addressLine1: z.string().optional().describe('Street address line 1'),
  addressLine2: z.string().optional().describe('Street address line 2'),
  city: z.string().optional().describe('City name'),
  country: z.string().optional().describe('Two-letter ISO 3166-1 country code'),
  county: z.string().optional().describe('County name'),
  fullName: z.string().optional().describe('Full name of the return address owner'),
  postalCode: z.string().optional().describe('Postal or ZIP code'),
  primaryPhone: z
    .object({
      countryCode: z.string().optional().describe('Two-letter ISO 3166-1 country code'),
      number: z.string().optional().describe('Primary phone number'),
    })
    .optional()
    .describe('Primary phone number for the return address'),
  stateOrProvince: z.string().optional().describe('State or province'),
});

const acceptPaymentDisputeBodySchema = z.object({
  returnAddress: disputeReturnAddressSchema.optional().describe('Return address for the buyer'),
  revision: z.number().optional().describe('Payment dispute revision number'),
});

const contestPaymentDisputeBodySchema = acceptPaymentDisputeBodySchema.extend({
  note: z.string().max(1000).optional().describe('Seller note for contesting the dispute'),
});

const disputeFileEvidenceSchema = z.object({
  fileId: z.string().optional().describe('File ID from uploadEvidenceFile'),
});

const disputeLineItemSchema = z.object({
  itemId: z.string().optional().describe('eBay item ID'),
  lineItemId: z.string().optional().describe('Order line item ID'),
});

const addDisputeEvidenceBodySchema = z.object({
  evidenceType: z.string().optional().describe('Evidence type, e.g. PROOF_OF_DELIVERY'),
  files: z.array(disputeFileEvidenceSchema).optional().describe('Evidence files to attach'),
  lineItems: z.array(disputeLineItemSchema).optional().describe('Line items this evidence covers'),
});

const updateDisputeEvidenceBodySchema = addDisputeEvidenceBodySchema.extend({
  evidenceId: z.string().optional().describe('Evidence set ID to update'),
});

/**
 * Validates the Fulfillment API getPaymentDispute request payload.
 */
export const getPaymentDisputeInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
});

/**
 * Validates the Fulfillment API getActivities request payload.
 */
export const getActivitiesInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
});

/**
 * Validates the Fulfillment API getPaymentDisputeSummaries request payload.
 */
export const getPaymentDisputeSummariesInputSchema = z.object({
  orderId: z.string().optional().describe('Filter by one order ID'),
  buyerUsername: z.string().optional().describe('Filter by buyer username'),
  openDateFrom: z.string().optional().describe('Start date for dispute open date filter'),
  openDateTo: z.string().optional().describe('End date for dispute open date filter'),
  paymentDisputeStatus: z.string().optional().describe('Filter by payment dispute status'),
  limit: z.number().optional().describe('Number of disputes to return'),
  offset: z.number().optional().describe('Number of disputes to skip'),
});

/**
 * Validates the Fulfillment API getPaymentDisputeSummaries response payload.
 */
export const getPaymentDisputeSummariesOutputSchema = z.object({
  paymentDisputeSummaries: z.array(paymentDisputeSummarySchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Fulfillment API acceptPaymentDispute request payload.
 */
export const acceptPaymentDisputeInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
  body: acceptPaymentDisputeBodySchema
    .optional()
    .describe('Generated acceptPaymentDispute request body'),
});

/**
 * Validates the Fulfillment API contestPaymentDispute request payload.
 */
export const contestPaymentDisputeInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
  body: contestPaymentDisputeBodySchema
    .optional()
    .describe('Generated contestPaymentDispute request body'),
});

/**
 * Validates the Fulfillment API addEvidence request payload.
 */
export const addEvidenceInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
  body: addDisputeEvidenceBodySchema.describe('Generated addEvidence request body'),
});

/**
 * Validates the Fulfillment API updateEvidence request payload.
 */
export const updateEvidenceInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
  body: updateDisputeEvidenceBodySchema.describe('Generated updateEvidence request body'),
});

/**
 * Validates the Fulfillment API uploadEvidenceFile request payload.
 */
export const uploadEvidenceFileInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
  body: z
    .object({
      data: z.string().describe('Base64-encoded file data'),
      filename: z.string().describe('File name with extension'),
    })
    .describe('Multipart-compatible file body to upload'),
});

/**
 * Validates the Fulfillment API fetchEvidenceContent request payload.
 */
export const fetchEvidenceContentInputSchema = z.object({
  paymentDisputeId: paymentDisputeIdSchema,
  evidenceId: z.string().describe('The evidence ID'),
  fileId: z.string().describe('The file ID to download'),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
