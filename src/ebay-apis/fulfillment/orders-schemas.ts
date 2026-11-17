import { z } from 'zod';
import { ReasonForRefund } from '@/shared/ebay-enums.js';

const amountSchema = z.object({
  currency: z.string(),
  value: z.string(),
  convertedFromCurrency: z.string().optional(),
  convertedFromValue: z.string().optional(),
  exchangeRate: z.string().optional(),
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
const scanOrderIssuesInputSchema = z.object({
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
 * Validates the Fulfillment API get order request payload.
 */
export const getOrderInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  fieldGroups: z.string().optional().describe('Response field group, e.g. TAX_BREAKDOWN'),
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
 * Validates the Fulfillment API get shipping fulfillments request payload.
 */
export const getShippingFulfillmentsInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
});

/**
 * Validates the Fulfillment API get one shipping fulfillment request payload.
 */
export const getShippingFulfillmentInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order'),
  fulfillmentId: z.string().describe('The unique identifier of the shipping fulfillment'),
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
