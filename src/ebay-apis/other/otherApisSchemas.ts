import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

const errorParameterSchema = z.object({
	name: z.string().optional(),
	value: z.string().optional(),
});

export const errorSchema = z.object({
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

export const getUserConsentResponseSchema = z.object({
	consents: z.array(userConsentSchema).optional(),
});

// ============================================================================
// Commerce Translation API Schemas
// ============================================================================

const translationSchema = z.object({
	from: z.string().optional(),
	to: z.string().optional(),
	translatedText: z.string().optional(),
});

export const translateInputSchema = z.object({
	from: z.string().optional(),
	to: z.string(),
	text: z.array(z.string()),
	translationContext: z.string().optional(),
});

export const translateResponseSchema = z.object({
	translations: z.array(translationSchema).optional(),
});

// ============================================================================
// Commerce VERO API Schemas
// ============================================================================

export const amountSchema = z.object({
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

export const veroReportItemsRequestSchema = z.object({
	reportItems: z.array(reportItemDetailsSchema).optional(),
});

export const veroReportItemsResponseSchema = z.object({
	veroReportId: z.string().optional(),
	veroReportStatus: z.string().optional(),
});

const reportedItemSchema = z.object({
	itemId: z.string().optional(),
	reasonForFailure: z.string().optional(),
	status: z.string().optional(),
});

export const veroReportStatusResponseSchema = z.object({
	reportedItemDetails: z.array(reportedItemSchema).optional(),
	veroReportId: z.string().optional(),
	veroReportStatus: z.string().optional(),
});

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

export const veroReasonCodeResponseSchema = z.object({
	marketplaceId: z.string().optional(),
	reasonCodeDetails: reasonCodeDetailTypeSchema.optional(),
});

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

export const contactSchema = z.object({
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

export const dimensionsSchema = z.object({
	height: z.number().optional(),
	length: z.number().optional(),
	width: z.number().optional(),
	unit: z.string().optional(),
});

export const weightSchema = z.object({
	value: z.number().optional(),
	unit: z.string().optional(),
});

const generatedEDeliveryBodySchema = z.object({}).passthrough();

export const generatedEDeliveryResponseSchema = z.object({}).passthrough();

export const emptyResponseSchema = z.object({});

export const edeliveryBodyInputSchema = z.object({
	body: generatedEDeliveryBodySchema,
});

export const edeliveryPaginationInputSchema = z.object({
	limit: z.number().int().optional(),
	offset: z.number().int().optional(),
});

export const getActualCostsInputSchema = z.object({
	trackingNumbers: z.string().optional(),
	transactionBeginTime: z.string().optional(),
	transactionEndTime: z.string().optional(),
});

export const bundleIdInputSchema = z.object({
	bundleId: z.string(),
});

export const packageIdInputSchema = z.object({
	packageId: z.string(),
});

export const getPackagesByLineItemIDInputSchema = z.object({
	orderLineItemId: z.string(),
});

export const getLabelsInputSchema = z.object({
	pageSize: z.string().optional(),
	printPreference: z.string().optional(),
	trackingNumbers: z.string(),
});

export const getHandoverSheetInputSchema = z.object({
	trackingNumbers: z.string(),
});

export const getTrackingInputSchema = z.object({
	trackingNumber: z.string(),
});

// ============================================================================
// Input Schemas for Operations
// ============================================================================

export const getUserInputSchema = z.object({});

export const getAddressPreferencesInputSchema = z.object({});

export const getConsignPreferencesInputSchema = z.object({});

export const createVeroReportInputSchema = z.object({
	reportData: veroReportItemsRequestSchema.describe(
		"Generated VeroReportItemsRequest body",
	),
});

export const getVeroReportInputSchema = z.object({
	veroReportId: z
		.string()
		.min(1)
		.describe("VeRO report identifier returned by createVeroReport"),
});

export const getVeroReportItemsInputSchema = z.object({
	filter: z.string().optional(),
	limit: z.number().int().optional(),
	offset: z.number().int().optional(),
});

export const getVeroReasonCodeInputSchema = z.object({
	veroReasonCodeId: z.string().min(1).describe("VeRO reason-code identifier"),
});

export const getVeroReasonCodesInputSchema = z.object({});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
