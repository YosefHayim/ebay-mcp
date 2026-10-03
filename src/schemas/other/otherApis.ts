import { z } from 'zod';

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
  productRecommendation: z
    .object({
      epid: z.string().optional(),
    })
    .optional(),
});

const variationDetailsSchema = z.object({
  sku: z.string().optional(),
  variationAspects: z.array(nameValueListSchema).optional(),
});

const complianceDetailSchema = z.object({
  complianceState: z.string().optional(),
  complianceType: z.string().optional(),
  message: z.string().optional(),
  reasons: z
    .array(
      z.object({
        complianceDetailType: z.string().optional(),
        message: z.string().optional(),
        variation: variationDetailsSchema.optional(),
        violationData: z.array(nameValueListSchema).optional(),
      }),
    )
    .optional(),
  correctiveRecommendations: correctiveRecommendationsSchema.optional(),
});

const complianceSummaryInfoSchema = z.object({
  complianceSummary: z
    .object({
      violationSummaries: z
        .array(
          z.object({
            complianceType: z.string().optional(),
            listingCount: z.number().int().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
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

// ============================================================================
// Commerce Translation API Schemas
// ============================================================================

const translationSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  translatedText: z.string().optional(),
});

/** Input schema for Commerce Translation API translate. */
export const translateInputSchema = z.object({
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

const amountSchema = z.object({
  currency: z.string().optional(),
  value: z.string().optional(),
});

const reportItemDetailsSchema = z.object({
  brand: z.string().optional(),
  copyEmailToRightsOwner: z.boolean().optional(),
  countries: z.array(z.string()).optional(),
  detailedMessage: z.string().optional(),
  itemId: z.string().optional(),
  messageToSeller: z.string().optional(),
  patent: z.string().optional(),
  regions: z.array(z.string()).optional(),
  veroReasonCodeId: z.string().optional(),
});

/** Request schema for Commerce VeRO API createVeroReport report items. */
export const veroReportItemsRequestSchema = z.object({
  reportItems: z.array(reportItemDetailsSchema).optional(),
});

/** Response schema for Commerce VeRO API createVeroReport. */
export const veroReportItemsResponseSchema = z.object({
  veroReportId: z.string().optional(),
  veroReportStatus: z.string().optional(),
});

const reportedItemSchema = z.object({
  itemId: z.string().optional(),
  reasonForFailure: z.string().optional(),
  status: z.string().optional(),
});

const veroReportStatusResponseSchema = z.object({
  reportedItemDetails: z.array(reportedItemSchema).optional(),
  veroReportId: z.string().optional(),
  veroReportStatus: z.string().optional(),
});

/** Paginated response schema for Commerce VeRO API getVeroReportItems. */
export const veroReportItemsStatusResponseSchema = z.object({
  href: z.string().optional(),
  limit: z.number().int().optional(),
  next: z.string().optional(),
  offset: z.number().int().optional(),
  prev: z.string().optional(),
  reportedItemDetails: z.array(reportedItemSchema).optional(),
  total: z.number().int().optional(),
});

const reasonCodeDetailTypeSchema = z.object({
  description: z.string().optional(),
  detailedDescription: z.string().optional(),
  veroReasonCodeId: z.string().optional(),
});

const veroReasonCodeSchema = z.object({
  marketplaceId: z.string().optional(),
  reasonCodeDetails: z.array(reasonCodeDetailTypeSchema).optional(),
});

/** Response schema for Commerce VeRO API getVeroReasonCode. */
export const veroReasonCodeResponseSchema = z.object({
  marketplaceId: z.string().optional(),
  reasonCodeDetails: reasonCodeDetailTypeSchema.optional(),
});

/** Response schema for Commerce VeRO API getVeroReasonCodes. */
export const veroReasonCodesResponseSchema = z.object({
  veroReasonCodes: z.array(veroReasonCodeSchema).optional(),
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
  primaryPhone: z
    .object({
      phoneNumber: z.string().optional(),
    })
    .optional(),
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

const generatedEDeliveryBodySchema = z.object({}).passthrough();

const generatedEDeliveryResponseSchema = z.object({}).passthrough();

const emptyResponseSchema = z.object({});

/** Input schema for eDelivery endpoints that accept a generated request body. */
export const edeliveryBodyInputSchema = z.object({
  body: generatedEDeliveryBodySchema,
});

/** Shared pagination input schema for eDelivery list endpoints. */
export const edeliveryPaginationInputSchema = z.object({
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

/** Input schema for eDelivery getActualCosts. */
export const getActualCostsInputSchema = z.object({
  trackingNumbers: z.string().optional(),
  transactionBeginTime: z.string().optional(),
  transactionEndTime: z.string().optional(),
});

/** Input schema for eDelivery endpoints addressed by bundle ID. */
export const bundleIdInputSchema = z.object({
  bundleId: z.string(),
});

/** Input schema for eDelivery endpoints addressed by package ID. */
export const packageIdInputSchema = z.object({
  packageId: z.string(),
});

/** Input schema for eDelivery getPackagesByLineItemId. */
export const getPackagesByLineItemIdInputSchema = z.object({
  orderLineItemId: z.string(),
});

/** Input schema for eDelivery getLabels. */
export const getLabelsInputSchema = z.object({
  pageSize: z.string().optional(),
  printPreference: z.string().optional(),
  trackingNumbers: z.string(),
});

/** Input schema for eDelivery getHandoverSheet. */
export const getHandoverSheetInputSchema = z.object({
  trackingNumbers: z.string(),
});

/** Input schema for eDelivery getTracking. */
export const getTrackingInputSchema = z.object({
  trackingNumber: z.string(),
});

// ============================================================================
// Input Schemas for Operations
// ============================================================================

/** Empty input schema for Commerce Identity API getUser. */
export const getUserInputSchema = z.object({});

/** Input schema for Sell Compliance API getListingViolations. */
export const getListingViolationsInputSchema = z.object({
  complianceType: z.string().optional(),
  offset: z.number().int().optional(),
  limit: z.number().int().optional(),
  filter: z.string().optional(),
});

/** Input schema for Sell Compliance API getListingViolationsSummary. */
export const getListingViolationsSummaryInputSchema = z.object({
  complianceType: z.string().optional(),
});

/** Empty input schema for eDelivery getAddressPreferences. */
export const getAddressPreferencesInputSchema = z.object({});

/** Empty input schema for eDelivery getConsignPreferences. */
export const getConsignPreferencesInputSchema = z.object({});

/** Input schema for Commerce VeRO API createVeroReport. */
export const createVeroReportInputSchema = z.object({
  reportData: veroReportItemsRequestSchema.describe('Generated VeroReportItemsRequest body'),
});

/** Input schema for Commerce VeRO API getVeroReport. */
export const getVeroReportInputSchema = z.object({
  veroReportId: z.string().min(1).describe('VeRO report identifier returned by createVeroReport'),
});

/** Input schema for Commerce VeRO API getVeroReportItems. */
export const getVeroReportItemsInputSchema = z.object({
  filter: z.string().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

/** Input schema for Commerce VeRO API getVeroReasonCode. */
export const getVeroReasonCodeInputSchema = z.object({
  veroReasonCodeId: z.string().min(1).describe('VeRO reason-code identifier'),
});

/** Empty input schema for Commerce VeRO API getVeroReasonCodes. */
export const getVeroReasonCodesInputSchema = z.object({});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
