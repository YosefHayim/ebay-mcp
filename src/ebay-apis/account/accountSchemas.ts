import { z } from "zod";
import {
	MarketplaceId,
	RefundMethod,
	RegionType,
	ReturnMethod,
	ReturnShippingCostPayer,
	ShippingCostType,
	ShippingOptionType,
	TimeDurationUnit,
} from "@/shared/ebayEnums.js";

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
export const getCustomPoliciesInputSchema = z.object({
	policyTypes: z
		.string()
		.optional()
		.describe(
			"Comma-delimited list of policy types to retrieve (e.g., PRODUCT_COMPLIANCE, TAKE_BACK)",
		),
});

// Output
export const customPolicySchema = z.object({
	customPolicyId: z.string().optional(),
	label: z.string().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	policyType: z.string().optional(),
});

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

export const createCustomPolicyInputSchema = z.object({
	policy: z.object({
		name: z.string(),
		description: z.string().optional(),
		policyType: z.string(),
		label: z.string().optional(),
	}),
});

export const getCustomPolicyInputSchema = z.object({
	customPolicyId: z.string().describe("The custom policy ID"),
});

export const updateCustomPolicyInputSchema = z.object({
	customPolicyId: z.string().describe("The custom policy ID"),
	policy: customPolicySchema.describe("Updated custom policy details"),
});

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

export const getFulfillmentPoliciesInputSchema = z.object({
	marketplaceId: z
		.nativeEnum(MarketplaceId)
		.describe("eBay marketplace ID (e.g., EBAY_US)"),
});

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

export const createFulfillmentPolicyInputSchema = z.object({
	policy: fulfillmentPolicySchema,
});

export const getFulfillmentPolicyInputSchema = z.object({
	fulfillmentPolicyId: z.string().describe("The fulfillment policy ID"),
});

export const getFulfillmentPolicyByNameInputSchema = z.object({
	marketplaceId: z.nativeEnum(MarketplaceId).describe("eBay marketplace ID"),
	name: z.string().describe("Policy name"),
});

export const updateFulfillmentPolicyInputSchema = z.object({
	fulfillmentPolicyId: z.string().describe("The fulfillment policy ID"),
	policy: fulfillmentPolicySchema.describe(
		"Updated fulfillment policy details",
	),
});

export const deleteFulfillmentPolicyInputSchema = z.object({
	fulfillmentPolicyId: z.string().describe("The fulfillment policy ID"),
});

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

export const getPaymentPoliciesInputSchema = z.object({
	marketplaceId: z.nativeEnum(MarketplaceId).describe("eBay marketplace ID"),
});

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

export const createPaymentPolicyInputSchema = z.object({
	policy: paymentPolicySchema,
});

export const getPaymentPolicyInputSchema = z.object({
	paymentPolicyId: z.string().describe("The payment policy ID"),
});

export const getPaymentPolicyByNameInputSchema = z.object({
	marketplaceId: z.nativeEnum(MarketplaceId).describe("eBay marketplace ID"),
	name: z.string().describe("Policy name"),
});

export const updatePaymentPolicyInputSchema = z.object({
	paymentPolicyId: z.string().describe("The payment policy ID"),
	policy: paymentPolicySchema.describe("Updated payment policy details"),
});

export const deletePaymentPolicyInputSchema = z.object({
	paymentPolicyId: z.string().describe("The payment policy ID"),
});

export const createPaymentPolicyOutputSchema = z.object({
	paymentPolicyId: z.string().optional(),
	warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Return Policy Schemas
// ============================================================================

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

export const getReturnPoliciesInputSchema = z.object({
	marketplaceId: z.nativeEnum(MarketplaceId).describe("eBay marketplace ID"),
});

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

export const createReturnPolicyInputSchema = z.object({
	policy: returnPolicySchema,
});

export const getReturnPolicyInputSchema = z.object({
	returnPolicyId: z.string().describe("The return policy ID"),
});

export const getReturnPolicyByNameInputSchema = z.object({
	marketplaceId: z.nativeEnum(MarketplaceId).describe("eBay marketplace ID"),
	name: z.string().describe("Policy name"),
});

export const updateReturnPolicyInputSchema = z.object({
	returnPolicyId: z.string().describe("The return policy ID"),
	policy: returnPolicySchema.describe("Updated return policy details"),
});

export const deleteReturnPolicyInputSchema = z.object({
	returnPolicyId: z.string().describe("The return policy ID"),
});

export const createReturnPolicyOutputSchema = z.object({
	returnPolicyId: z.string().optional(),
	warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Sales Tax Schemas
// ============================================================================

export const salesTaxBaseSchema = z.object({
	salesTaxPercentage: z.string(),
	shippingAndHandlingTaxed: z.boolean().optional(),
});

export const salesTaxSchema = z.object({
	countryCode: z.string().optional(),
	jurisdictionId: z.string().optional(),
	salesTaxPercentage: z.string().optional(),
	shippingAndHandlingTaxed: z.boolean().optional(),
});

export const createOrReplaceSalesTaxInputSchema = z.object({
	countryCode: z.string().describe("Two-letter ISO 3166 country code"),
	jurisdictionId: z.string().describe("Tax jurisdiction ID"),
	salesTaxBase: salesTaxBaseSchema.describe("Sales tax details"),
});

export const bulkSalesTaxRequestEntrySchema = z.object({
	countryCode: z.string(),
	jurisdictionId: z.string(),
	salesTaxBase: salesTaxBaseSchema,
});

export const bulkCreateOrReplaceSalesTaxInputSchema = z.object({
	requests: z
		.array(bulkSalesTaxRequestEntrySchema)
		.describe("Array of sales tax requests"),
});

export const getSalesTaxInputSchema = z.object({
	countryCode: z.string().describe("Two-letter ISO 3166 country code"),
	jurisdictionId: z.string().describe("Tax jurisdiction ID"),
});

export const deleteSalesTaxInputSchema = getSalesTaxInputSchema;

export const getSalesTaxesInputSchema = z.object({
	countryCode: z
		.string()
		.describe("Required: Two-letter ISO 3166-1 country code"),
});

export const getSalesTaxesOutputSchema = z.object({
	salesTaxes: z.array(salesTaxSchema).optional(),
	warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Program Schemas
// ============================================================================

export const programRequestSchema = z.object({
	programType: z.string(),
});

export const optInToProgramInputSchema = z.object({
	request: programRequestSchema.describe("Program opt-in request"),
});

export const optOutOfProgramInputSchema = z.object({
	request: programRequestSchema.describe("Program opt-out request"),
});

export const getOptedInProgramsInputSchema = z.object({});

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

export const kycOutputSchema = z.object({
	kycCheck: z.string().optional(),
	detailedStatus: z.string().optional(),
	warnings: z.array(errorSchema).optional(),
});

export const getKYCInputSchema = z.object({});

export const getPaymentsProgramInputSchema = z.object({
	marketplaceId: z
		.nativeEnum(MarketplaceId)
		.describe("The eBay marketplace ID"),
	paymentsProgramType: z.string().describe("The type of payments program"),
});

export const getPaymentsProgramOnboardingInputSchema =
	getPaymentsProgramInputSchema;

export const getSubscriptionInputSchema = z.object({
	limit: z
		.string()
		.optional()
		.describe("Optional subscription page size limit"),
	continuationToken: z
		.string()
		.optional()
		.describe("Optional continuation token"),
});

export const getRateTablesInputSchema = z.object({});

export const getAdvertisingEligibilityInputSchema = z.object({
	marketplaceId: z
		.nativeEnum(MarketplaceId)
		.describe("eBay marketplace ID to check eligibility for"),
	programTypes: z
		.string()
		.optional()
		.describe(
			"Optional comma-separated list of program types to check eligibility for",
		),
});

// ============================================================================
// Privileges Schemas
// ============================================================================

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

export const getPrivilegesInputSchema = z.object({});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
