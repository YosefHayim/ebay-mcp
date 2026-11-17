import { z } from 'zod';

/** Input schema for Commerce Translation API translate. */
export const translateInputSchema = z.object({
  from: z.string().optional(),
  to: z.string(),
  text: z.array(z.string()),
  translationContext: z.string().optional(),
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
const veroReportItemsRequestSchema = z.object({
  reportItems: z.array(reportItemDetailsSchema).optional(),
});

const generatedEDeliveryBodySchema = z.object({}).passthrough();

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

/** Input schema for eDelivery getPackagesByLineItemID. */
export const getPackagesByLineItemIDInputSchema = z.object({
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
