import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Other eBay APIs Schemas
 *
 * This file contains Zod schemas for various eBay APIs including:
 * - Commerce Identity API
 * - Sell Compliance API
 * - Commerce Translation API
 * - Commerce VERO API
 * - Sell eDelivery International Shipping API
 */

// ============================================================================
// Common Schemas
// ============================================================================

const errorParameterSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const errorSchema = z.object({
  category: z.string().optional(),
  domain: z.string().optional(),
  errorId: z.number().int().optional(),
  inputRefIds: z.array(z.string()).optional(),
  longMessage: z.string().optional(),
  message: z.string().optional(),
  outputRefIds: z.array(z.string()).optional(),
  parameters: z.array(errorParameterSchema).optional(),
  subdomain: z.string().optional(),
});

// ============================================================================
// Commerce Identity API Schemas
// ============================================================================

const userConsentSchema = z.object({
  consentState: z.string().optional(),
  consentType: z.string().optional(),
});

const getUserConsentResponseSchema = z.object({
  consents: z.array(userConsentSchema).optional(),
});

// ============================================================================
// Sell Compliance API Schemas
// ============================================================================

const nameValueListSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const correctiveRecommendationsSchema = z.object({
  complianceDetail: z.string().optional(),
  complianceDetailDescription: z.string().optional(),
  correctiveActionDetails: z.string().optional(),
  productRecommendation: z.object({
    epid: z.string().optional(),
  }).optional(),
});

const variationDetailsSchema = z.object({
  sku: z.string().optional(),
  variationAspects: z.array(nameValueListSchema).optional(),
});

const complianceDetailSchema = z.object({
  complianceState: z.string().optional(),
  complianceType: z.string().optional(),
  message: z.string().optional(),
  reasons: z.array(z.object({
    complianceDetailType: z.string().optional(),
    message: z.string().optional(),
    variation: variationDetailsSchema.optional(),
    violationData: z.array(nameValueListSchema).optional(),
  })).optional(),
  correctiveRecommendations: correctiveRecommendationsSchema.optional(),
});

const complianceSummaryInfoSchema = z.object({
  complianceSummary: z.object({
    violationSummaries: z.array(z.object({
      complianceType: z.string().optional(),
      listingCount: z.number().int().optional(),
    })).optional(),
  }).optional(),
});

const complianceViolationSchema = z.object({
  listingId: z.string().optional(),
  offerId: z.string().optional(),
  sku: z.string().optional(),
  complianceType: z.string().optional(),
  complianceDetails: z.array(complianceDetailSchema).optional(),
});

const pageMetadataSchema = z.object({
  href: z.string().optional(),
  limit: z.number().int().optional(),
  next: z.string().optional(),
  offset: z.number().int().optional(),
  prev: z.string().optional(),
  total: z.number().int().optional(),
});

const listingViolationSummaryResponseSchema = z.object({
  href: z.string().optional(),
  limit: z.number().int().optional(),
  listingViolations: z.array(complianceViolationSchema).optional(),
  next: z.string().optional(),
  offset: z.number().int().optional(),
  prev: z.string().optional(),
  total: z.number().int().optional(),
});

const suppressViolationRequestSchema = z.object({
  complianceType: z.string().optional(),
  listingId: z.string().optional(),
});

// ============================================================================
// Commerce Translation API Schemas
// ============================================================================

const translationSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  translatedText: z.string().optional(),
});

const translateRequestSchema = z.object({
  from: z.string().optional(),
  to: z.string(),
  text: z.array(z.string()),
  translationContext: z.string().optional(),
});

const translateResponseSchema = z.object({
  translations: z.array(translationSchema).optional(),
});

// ============================================================================
// Commerce VERO API Schemas
// ============================================================================

const itemLocationSchema = z.object({
  countryCode: z.string().optional(),
  location: z.string().optional(),
  postalCode: z.string().optional(),
});

const amountSchema = z.object({
  currency: z.string().optional(),
  value: z.string().optional(),
});

const reportedListingDetailsSchema = z.object({
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
  itemId: z.string().optional(),
  itemLocation: itemLocationSchema.optional(),
  price: amountSchema.optional(),
  quantity: z.number().int().optional(),
  sellerId: z.string().optional(),
  title: z.string().optional(),
});

const veroReportItemsRequestSchema = z.object({
  reportingReason: z.string().optional(),
  reportedListingIds: z.array(z.string()).optional(),
});

const veroReportItemsResponseSchema = z.object({
  reportedListings: z.array(z.object({
    itemId: z.string().optional(),
    statusCode: z.number().int().optional(),
    statusMessage: z.string().optional(),
  })).optional(),
});

const veroReportedListingSchema = z.object({
  itemId: z.string().optional(),
  reasonForReport: z.string().optional(),
  reportedDate: z.string().optional(),
  reportedListingDetails: reportedListingDetailsSchema.optional(),
});

const veroReportedListingsResponseSchema = z.object({
  href: z.string().optional(),
  limit: z.number().int().optional(),
  next: z.string().optional(),
  offset: z.number().int().optional(),
  prev: z.string().optional(),
  reportedListings: z.array(veroReportedListingSchema).optional(),
  total: z.number().int().optional(),
});

// ============================================================================
// Sell eDelivery International Shipping API Schemas
// ============================================================================

const addressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateOrProvince: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
});

const contactSchema = z.object({
  companyName: z.string().optional(),
  contactAddress: addressSchema.optional(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  primaryPhone: z.object({
    phoneNumber: z.string().optional(),
  }).optional(),
});

const dimensionsSchema = z.object({
  height: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  unit: z.string().optional(),
});

const weightSchema = z.object({
  value: z.number().optional(),
  unit: z.string().optional(),
});

const packageDetailsSchema = z.object({
  dimensions: dimensionsSchema.optional(),
  weight: weightSchema.optional(),
});

const lineItemInputSchema = z.object({
  lineItemId: z.string().optional(),
  quantity: z.number().int().optional(),
});

const createShippingQuoteRequestSchema = z.object({
  orders: z.array(z.object({
    lineItems: z.array(lineItemInputSchema).optional(),
    orderId: z.string().optional(),
  })).optional(),
  shippingDestination: contactSchema.optional(),
});

const rateSchema = z.object({
  maxEstimatedDeliveryDate: z.string().optional(),
  minEstimatedDeliveryDate: z.string().optional(),
  rateId: z.string().optional(),
  shippingCost: amountSchema.optional(),
  shippingServiceCode: z.string().optional(),
  shippingServiceName: z.string().optional(),
});

const packageSchema = z.object({
  lineItems: z.array(z.object({
    itemId: z.string().optional(),
    lineItemId: z.string().optional(),
    orderId: z.string().optional(),
    quantity: z.number().int().optional(),
  })).optional(),
  packageDetails: packageDetailsSchema.optional(),
  packageId: z.string().optional(),
  rates: z.array(rateSchema).optional(),
});

const shippingQuoteSchema = z.object({
  creationDate: z.string().optional(),
  expirationDate: z.string().optional(),
  packages: z.array(packageSchema).optional(),
  quoteId: z.string().optional(),
  shippingDestination: contactSchema.optional(),
  warnings: z.array(errorSchema).optional(),
});

const createShippingQuoteResponseSchema = z.object({
  shippingQuote: shippingQuoteSchema.optional(),
});

const purchaseLabelRequestSchema = z.object({
  labelFormat: z.string().optional(),
  rateId: z.string(),
  shipFromAddress: contactSchema.optional(),
});

const labelSchema = z.object({
  labelData: z.string().optional(),
  labelFormat: z.string().optional(),
  labelId: z.string().optional(),
});

const purchasedRateSchema = z.object({
  baseShippingCost: amountSchema.optional(),
  destinationTimeZone: z.string().optional(),
  maxEstimatedDeliveryDate: z.string().optional(),
  minEstimatedDeliveryDate: z.string().optional(),
  rateId: z.string().optional(),
  shippingCost: amountSchema.optional(),
  shippingServiceCode: z.string().optional(),
  shippingServiceName: z.string().optional(),
});

const shipmentSchema = z.object({
  creationDate: z.string().optional(),
  labels: z.array(labelSchema).optional(),
  packages: z.array(z.object({
    packageId: z.string().optional(),
    trackingNumber: z.string().optional(),
  })).optional(),
  rate: purchasedRateSchema.optional(),
  shipFromAddress: contactSchema.optional(),
  shipmentId: z.string().optional(),
  shipmentTrackingNumber: z.string().optional(),
  shippingDestination: contactSchema.optional(),
});

const purchaseLabelResponseSchema = z.object({
  shipment: shipmentSchema.optional(),
  warnings: z.array(errorSchema).optional(),
});

const getShipmentResponseSchema = z.object({
  shipment: shipmentSchema.optional(),
});

const cancelShipmentResponseSchema = z.object({
  shipment: shipmentSchema.optional(),
  warnings: z.array(errorSchema).optional(),
});

const downloadLabelResponseSchema = z.object({
  labelData: z.string().optional(),
  labelFormat: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Input Schemas for Operations
// ============================================================================

const getListingViolationsInputSchema = z.object({
  compliance_type: z.string().optional(),
  offset: z.number().int().optional(),
  listing_id: z.string().optional(),
  limit: z.number().int().optional(),
  filter: z.string().optional(),
});

const getVeroReportedListingsInputSchema = z.object({
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getOtherApisJsonSchemas() {
  return {
    // Commerce Identity API
    getUserConsentOutput: zodToJsonSchema(getUserConsentResponseSchema, 'getUserConsentOutput'),

    // Sell Compliance API
    getComplianceSummaryOutput: zodToJsonSchema(complianceSummaryInfoSchema, 'getComplianceSummaryOutput'),
    getListingViolationsInput: zodToJsonSchema(getListingViolationsInputSchema, 'getListingViolationsInput'),
    getListingViolationsOutput: zodToJsonSchema(listingViolationSummaryResponseSchema, 'getListingViolationsOutput'),
    suppressViolationInput: zodToJsonSchema(suppressViolationRequestSchema, 'suppressViolationInput'),

    // Commerce Translation API
    translateInput: zodToJsonSchema(translateRequestSchema, 'translateInput'),
    translateOutput: zodToJsonSchema(translateResponseSchema, 'translateOutput'),

    // Commerce VERO API
    reportItemsInput: zodToJsonSchema(veroReportItemsRequestSchema, 'reportItemsInput'),
    reportItemsOutput: zodToJsonSchema(veroReportItemsResponseSchema, 'reportItemsOutput'),
    getVeroReportedListingsInput: zodToJsonSchema(getVeroReportedListingsInputSchema, 'getVeroReportedListingsInput'),
    getVeroReportedListingsOutput: zodToJsonSchema(veroReportedListingsResponseSchema, 'getVeroReportedListingsOutput'),

    // Sell eDelivery International Shipping API
    createShippingQuoteInput: zodToJsonSchema(createShippingQuoteRequestSchema, 'createShippingQuoteInput'),
    createShippingQuoteOutput: zodToJsonSchema(createShippingQuoteResponseSchema, 'createShippingQuoteOutput'),
    purchaseLabelInput: zodToJsonSchema(purchaseLabelRequestSchema, 'purchaseLabelInput'),
    purchaseLabelOutput: zodToJsonSchema(purchaseLabelResponseSchema, 'purchaseLabelOutput'),
    getShipmentOutput: zodToJsonSchema(getShipmentResponseSchema, 'getShipmentOutput'),
    cancelShipmentOutput: zodToJsonSchema(cancelShipmentResponseSchema, 'cancelShipmentOutput'),
    downloadLabelOutput: zodToJsonSchema(downloadLabelResponseSchema, 'downloadLabelOutput'),

    // Common Types
    error: zodToJsonSchema(errorSchema, 'error'),
    errorParameter: zodToJsonSchema(errorParameterSchema, 'errorParameter'),
    amount: zodToJsonSchema(amountSchema, 'amount'),
    address: zodToJsonSchema(addressSchema, 'address'),
    contact: zodToJsonSchema(contactSchema, 'contact'),
    dimensions: zodToJsonSchema(dimensionsSchema, 'dimensions'),
    weight: zodToJsonSchema(weightSchema, 'weight'),
    pageMetadata: zodToJsonSchema(pageMetadataSchema, 'pageMetadata'),

    // Compliance Types
    complianceViolation: zodToJsonSchema(complianceViolationSchema, 'complianceViolation'),
    complianceDetail: zodToJsonSchema(complianceDetailSchema, 'complianceDetail'),
    correctiveRecommendations: zodToJsonSchema(correctiveRecommendationsSchema, 'correctiveRecommendations'),
    variationDetails: zodToJsonSchema(variationDetailsSchema, 'variationDetails'),
    nameValueList: zodToJsonSchema(nameValueListSchema, 'nameValueList'),

    // Translation Types
    translation: zodToJsonSchema(translationSchema, 'translation'),

    // VERO Types
    veroReportedListing: zodToJsonSchema(veroReportedListingSchema, 'veroReportedListing'),
    reportedListingDetails: zodToJsonSchema(reportedListingDetailsSchema, 'reportedListingDetails'),
    itemLocation: zodToJsonSchema(itemLocationSchema, 'itemLocation'),

    // eDelivery International Shipping Types
    shippingQuote: zodToJsonSchema(shippingQuoteSchema, 'shippingQuote'),
    shipment: zodToJsonSchema(shipmentSchema, 'shipment'),
    package: zodToJsonSchema(packageSchema, 'package'),
    rate: zodToJsonSchema(rateSchema, 'rate'),
    label: zodToJsonSchema(labelSchema, 'label'),
    packageDetails: zodToJsonSchema(packageDetailsSchema, 'packageDetails'),
    userConsent: zodToJsonSchema(userConsentSchema, 'userConsent'),
  };
}
