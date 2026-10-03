import { z } from 'zod';
import {
  TimeDurationUnit,
  RegionType,
  ShippingCostType,
  ShippingOptionType,
  RefundMethod,
  ReturnMethod,
  ReturnShippingCostPayer,
  MarketplaceId,
} from '@/types/ebayEnums.js';

/**
 * Account Management API Schemas
 *
 * This file contains Zod schemas for all Account Management endpoints.
 * Schemas are organized by endpoint and include both input and output validation.
 */

// ============================================================================
// Common/Shared Response Schemas
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

const timeDurationSchema = z.object({
  unit: z.nativeEnum(TimeDurationUnit).optional(),
  value: z.number().optional(),
});

const amountSchema = z.object({
  currency: z.string().optional(),
  value: z.string().optional(),
});

const regionSchema = z.object({
  regionName: z.string().optional(),
  regionType: z.nativeEnum(RegionType).optional(),
});

const regionSetSchema = z.object({
  regionIncluded: z.array(regionSchema).optional(),
  regionExcluded: z.array(regionSchema).optional(),
});

// ============================================================================
// Custom Policy Schemas
// ============================================================================

// Input
/**
 * Validates the Account Management API get custom policies request payload.
 */
export const getCustomPoliciesInputSchema = z.object({
  policyTypes: z
    .string()
    .optional()
    .describe(
      'Comma-delimited list of policy types to retrieve (e.g., PRODUCT_COMPLIANCE, TAKE_BACK)',
    ),
});

// Output
/**
 * Validates the Account Management API custom policy model.
 */
export const customPolicySchema = z.object({
  customPolicyId: z.string().optional(),
  label: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  policyType: z.string().optional(),
});

/**
 * Validates the Account Management API custom policy response payload.
 */
export const customPolicyResponseSchema = z.object({
  customPolicies: z.array(customPolicySchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API create custom policy request payload.
 */
export const createCustomPolicyInputSchema = z.object({
  policy: z.object({
    name: z.string(),
    description: z.string().optional(),
    policyType: z.string(),
    label: z.string().optional(),
  }),
});

/** Validates the Account Management API get custom policy request payload. */
export const getCustomPolicyInputSchema = z.object({
  customPolicyId: z.string().describe('The custom policy ID'),
});

/** Validates the Account Management API update custom policy request payload. */
export const updateCustomPolicyInputSchema = z.object({
  customPolicyId: z.string().describe('The custom policy ID'),
  policy: customPolicySchema.describe('Updated custom policy details'),
});

/**
 * Validates the Account Management API create custom policy response payload.
 */
export const createCustomPolicyOutputSchema = customPolicySchema;

// ============================================================================
// Fulfillment Policy Schemas
// ============================================================================

const categoryTypeSchema = z.object({
  name: z.string().optional(),
  default: z.boolean().optional(),
});

const shippingServiceSchema = z.object({
  additionalShippingCost: amountSchema.optional(),
  buyerResponsibleForPickup: z.boolean().optional(),
  buyerResponsibleForShipping: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  shippingCarrierCode: z.string().optional(),
  shippingCost: amountSchema.optional(),
  shippingServiceCode: z.string().optional(),
  shipToLocations: regionSetSchema.optional(),
  sortOrder: z.number().optional(),
  surcharge: amountSchema.optional(), // DEPRECATED but still in API
});

const shippingOptionSchema = z.object({
  costType: z.nativeEnum(ShippingCostType).optional(),
  optionType: z.nativeEnum(ShippingOptionType).optional(),
  insuranceFee: amountSchema.optional(), // DEPRECATED but in API
  insuranceOffered: z.boolean().optional(), // DEPRECATED but in API
  packageHandlingCost: amountSchema.optional(),
  rateTableId: z.string().optional(),
  shippingDiscountProfileId: z.string().optional(),
  shippingPromotionOffered: z.boolean().optional(),
  shippingServices: z.array(shippingServiceSchema).optional(),
});

/**
 * Validates the Account Management API fulfillment policy model.
 */
export const fulfillmentPolicySchema = z.object({
  name: z.string(),
  marketplaceId: z.nativeEnum(MarketplaceId),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  freightShipping: z.boolean().optional(),
  globalShipping: z.boolean().optional(),
  handlingTime: timeDurationSchema.optional(),
  localPickup: z.boolean().optional(),
  pickupDropOff: z.boolean().optional(),
  shippingOptions: z.array(shippingOptionSchema).optional(),
  shipToLocations: regionSetSchema.optional(),
});

/**
 * Validates the Account Management API fulfillment policy response payload.
 */
export const fulfillmentPolicyResponseSchema = z.object({
  fulfillmentPolicyId: z.string().optional(),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  freightShipping: z.boolean().optional(),
  globalShipping: z.boolean().optional(),
  handlingTime: timeDurationSchema.optional(),
  localPickup: z.boolean().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  pickupDropOff: z.boolean().optional(),
  shippingOptions: z.array(shippingOptionSchema).optional(),
  shipToLocations: regionSetSchema.optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API get fulfillment policies request payload.
 */
export const getFulfillmentPoliciesInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID (e.g., EBAY_US)'),
});

/**
 * Validates the Account Management API get fulfillment policies response payload.
 */
export const getFulfillmentPoliciesOutputSchema = z.object({
  fulfillmentPolicies: z.array(fulfillmentPolicyResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API create fulfillment policy request payload.
 */
export const createFulfillmentPolicyInputSchema = z.object({
  policy: fulfillmentPolicySchema,
});

/** Validates the Account Management API get fulfillment policy request payload. */
export const getFulfillmentPolicyInputSchema = z.object({
  fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
});

/** Validates the Account Management API get fulfillment policy by name request payload. */
export const getFulfillmentPolicyByNameInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
  name: z.string().describe('Policy name'),
});

/** Validates the Account Management API update fulfillment policy request payload. */
export const updateFulfillmentPolicyInputSchema = z.object({
  fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
  policy: fulfillmentPolicySchema.describe('Updated fulfillment policy details'),
});

/** Validates the Account Management API delete fulfillment policy request payload. */
export const deleteFulfillmentPolicyInputSchema = z.object({
  fulfillmentPolicyId: z.string().describe('The fulfillment policy ID'),
});

/**
 * Validates the Account Management API create fulfillment policy response payload.
 */
export const createFulfillmentPolicyOutputSchema = z.object({
  fulfillmentPolicyId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Payment Policy Schemas
// ============================================================================

const paymentMethodSchema = z.object({
  paymentMethodType: z.string().optional(),
  brands: z.array(z.string()).optional(), // DEPRECATED
  recipientAccountReference: z
    .object({
      referenceId: z.string().optional(),
      referenceType: z.string().optional(),
    })
    .optional(), // DEPRECATED
});

const depositSchema = z.object({
  amount: amountSchema.optional(), // Fixed from depositAmount
  dueIn: timeDurationSchema.optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(), // DEPRECATED but in API
});

/**
 * Validates the Account Management API payment policy model.
 */
export const paymentPolicySchema = z.object({
  name: z.string(),
  marketplaceId: z.nativeEnum(MarketplaceId),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  deposit: depositSchema.optional(),
  fullPaymentDueIn: timeDurationSchema.optional(),
  immediatePay: z.boolean().optional(),
  paymentInstructions: z.string().optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});

/**
 * Validates the Account Management API payment policy response payload.
 */
export const paymentPolicyResponseSchema = z.object({
  paymentPolicyId: z.string().optional(),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  deposit: depositSchema.optional(),
  description: z.string().optional(),
  fullPaymentDueIn: timeDurationSchema.optional(),
  immediatePay: z.boolean().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  paymentInstructions: z.string().optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API get payment policies request payload.
 */
export const getPaymentPoliciesInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
});

/**
 * Validates the Account Management API get payment policies response payload.
 */
export const getPaymentPoliciesOutputSchema = z.object({
  paymentPolicies: z.array(paymentPolicyResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API create payment policy request payload.
 */
export const createPaymentPolicyInputSchema = z.object({
  policy: paymentPolicySchema,
});

/** Validates the Account Management API get payment policy request payload. */
export const getPaymentPolicyInputSchema = z.object({
  paymentPolicyId: z.string().describe('The payment policy ID'),
});

/** Validates the Account Management API get payment policy by name request payload. */
export const getPaymentPolicyByNameInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
  name: z.string().describe('Policy name'),
});

/** Validates the Account Management API update payment policy request payload. */
export const updatePaymentPolicyInputSchema = z.object({
  paymentPolicyId: z.string().describe('The payment policy ID'),
  policy: paymentPolicySchema.describe('Updated payment policy details'),
});

/** Validates the Account Management API delete payment policy request payload. */
export const deletePaymentPolicyInputSchema = z.object({
  paymentPolicyId: z.string().describe('The payment policy ID'),
});

/**
 * Validates the Account Management API create payment policy response payload.
 */
export const createPaymentPolicyOutputSchema = z.object({
  paymentPolicyId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Return Policy Schemas
// ============================================================================

/**
 * Validates the Account Management API return policy model.
 */
export const returnPolicySchema = z.object({
  name: z.string(),
  marketplaceId: z.nativeEnum(MarketplaceId),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  extendedHolidayReturnsOffered: z.boolean().optional(),
  refundMethod: z.nativeEnum(RefundMethod).optional(),
  restockingFeePercentage: z.string().optional(),
  returnInstructions: z.string().optional(),
  returnMethod: z.nativeEnum(ReturnMethod).optional(),
  returnPeriod: timeDurationSchema.optional(),
  returnsAccepted: z.boolean().optional(),
  returnShippingCostPayer: z.nativeEnum(ReturnShippingCostPayer).optional(),
});

/**
 * Validates the Account Management API return policy response payload.
 */
export const returnPolicyResponseSchema = z.object({
  returnPolicyId: z.string().optional(),
  categoryTypes: z.array(categoryTypeSchema).optional(),
  description: z.string().optional(),
  extendedHolidayReturnsOffered: z.boolean().optional(),
  internationalOverride: z
    .object({
      returnMethod: z.string().optional(),
      returnPeriod: timeDurationSchema.optional(),
      returnsAccepted: z.boolean().optional(),
      returnShippingCostPayer: z.string().optional(),
    })
    .optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  refundMethod: z.string().optional(),
  restockingFeePercentage: z.string().optional(), // DEPRECATED
  returnInstructions: z.string().optional(),
  returnMethod: z.string().optional(),
  returnPeriod: timeDurationSchema.optional(),
  returnsAccepted: z.boolean().optional(),
  returnShippingCostPayer: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API get return policies request payload.
 */
export const getReturnPoliciesInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
});

/**
 * Validates the Account Management API get return policies response payload.
 */
export const getReturnPoliciesOutputSchema = z.object({
  returnPolicies: z.array(returnPolicyResponseSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Account Management API create return policy request payload.
 */
export const createReturnPolicyInputSchema = z.object({
  policy: returnPolicySchema,
});

/** Validates the Account Management API get return policy request payload. */
export const getReturnPolicyInputSchema = z.object({
  returnPolicyId: z.string().describe('The return policy ID'),
});

/** Validates the Account Management API get return policy by name request payload. */
export const getReturnPolicyByNameInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('eBay marketplace ID'),
  name: z.string().describe('Policy name'),
});

/** Validates the Account Management API update return policy request payload. */
export const updateReturnPolicyInputSchema = z.object({
  returnPolicyId: z.string().describe('The return policy ID'),
  policy: returnPolicySchema.describe('Updated return policy details'),
});

/** Validates the Account Management API delete return policy request payload. */
export const deleteReturnPolicyInputSchema = z.object({
  returnPolicyId: z.string().describe('The return policy ID'),
});

/**
 * Validates the Account Management API create return policy response payload.
 */
export const createReturnPolicyOutputSchema = z.object({
  returnPolicyId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Sales Tax Schemas
// ============================================================================

/**
 * Validates the Account Management API sales tax base model.
 */
export const salesTaxBaseSchema = z.object({
  salesTaxPercentage: z.string(),
  shippingAndHandlingTaxed: z.boolean().optional(),
});

/**
 * Validates the Account Management API sales tax model.
 */
export const salesTaxSchema = z.object({
  countryCode: z.string().optional(),
  jurisdictionId: z.string().optional(),
  salesTaxPercentage: z.string().optional(),
  shippingAndHandlingTaxed: z.boolean().optional(),
});

/** Validates the Account Management API create or replace sales tax request payload. */
export const createOrReplaceSalesTaxInputSchema = z.object({
  countryCode: z.string().describe('Two-letter ISO 3166 country code'),
  jurisdictionId: z.string().describe('Tax jurisdiction ID'),
  salesTaxBase: salesTaxBaseSchema.describe('Sales tax details'),
});

/** Validates one sales tax row in a bulk create or replace request. */
export const bulkSalesTaxRequestEntrySchema = z.object({
  countryCode: z.string(),
  jurisdictionId: z.string(),
  salesTaxBase: salesTaxBaseSchema,
});

/** Validates the Account Management API bulk create or replace sales tax request payload. */
export const bulkCreateOrReplaceSalesTaxInputSchema = z.object({
  requests: z.array(bulkSalesTaxRequestEntrySchema).describe('Array of sales tax requests'),
});

/** Validates the Account Management API get sales tax request payload. */
export const getSalesTaxInputSchema = z.object({
  countryCode: z.string().describe('Two-letter ISO 3166 country code'),
  jurisdictionId: z.string().describe('Tax jurisdiction ID'),
});

/** Validates the Account Management API delete sales tax request payload. */
export const deleteSalesTaxInputSchema = getSalesTaxInputSchema;

/** Validates the Account Management API get sales taxes request payload. */
export const getSalesTaxesInputSchema = z.object({
  countryCode: z.string().describe('Required: Two-letter ISO 3166-1 country code'),
});

/**
 * Validates the Account Management API get sales taxes response payload.
 */
export const getSalesTaxesOutputSchema = z.object({
  salesTaxes: z.array(salesTaxSchema).optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Program Schemas
// ============================================================================

/**
 * Validates the Account Management API program request model.
 */
export const programRequestSchema = z.object({
  programType: z.string(),
});

/** Validates the Account Management API program opt-in request payload. */
export const optInToProgramInputSchema = z.object({
  request: programRequestSchema.describe('Program opt-in request'),
});

/** Validates the Account Management API program opt-out request payload. */
export const optOutOfProgramInputSchema = z.object({
  request: programRequestSchema.describe('Program opt-out request'),
});

/** Validates the Account Management API get opted-in programs request payload. */
export const getOptedInProgramsInputSchema = z.object({});

/**
 * Validates the Account Management API programs response payload.
 */
export const programsOutputSchema = z.object({
  programs: z
    .array(
      z.object({
        programType: z.string().optional(),
        programStatus: z.string().optional(),
      }),
    )
    .optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// KYC Schemas
// ============================================================================

/**
 * Validates the Account Management API KYC response payload.
 */
export const kycOutputSchema = z.object({
  kycCheck: z.string().optional(),
  detailedStatus: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

/** Validates the Account Management API get KYC request payload. */
export const getKycInputSchema = z.object({});

/** Validates the Account Management API payments program request payload. */
export const getPaymentsProgramInputSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('The eBay marketplace ID'),
  paymentsProgramType: z.string().describe('The type of payments program'),
});

/** Validates the Account Management API payments onboarding request payload. */
export const getPaymentsProgramOnboardingInputSchema = getPaymentsProgramInputSchema;

/** Validates the Account Management API subscription request payload. */
export const getSubscriptionInputSchema = z.object({
  limit: z.string().optional().describe('Optional subscription page size limit'),
  continuationToken: z.string().optional().describe('Optional continuation token'),
});

/** Validates the Account Management API get rate tables request payload. */
export const getRateTablesInputSchema = z.object({});

/** Validates the Account Management API advertising eligibility request payload. */
export const getAdvertisingEligibilityInputSchema = z.object({
  marketplaceId: z
    .nativeEnum(MarketplaceId)
    .describe('eBay marketplace ID to check eligibility for'),
  programTypes: z
    .string()
    .optional()
    .describe('Optional comma-separated list of program types to check eligibility for'),
});

// ============================================================================
// Privileges Schemas
// ============================================================================

/**
 * Validates the Account Management API privileges response payload.
 */
export const privilegesOutputSchema = z.object({
  sellingLimit: z
    .object({
      amount: amountSchema.optional(),
      quantity: z.number().optional(),
    })
    .optional(),
  qualifiesForSelling: z.boolean().optional(),
  sellerRegistrationCompleted: z.boolean().optional(),
  warnings: z.array(errorSchema).optional(),
});

/** Validates the Account Management API get privileges request payload. */
export const getPrivilegesInputSchema = z.object({});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
