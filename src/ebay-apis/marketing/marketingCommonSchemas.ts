import { z } from "zod";
// ============================================================================
// Common/Shared Response Schemas
// ============================================================================

export const errorSchema = z.object({
	errorId: z.number().optional(),
	domain: z.string().optional(),
	category: z.string().optional(),
	message: z.string().optional(),
	longMessage: z.string().optional(),
	subdomain: z.string().optional(),
	inputRefIds: z.array(z.string()).optional(),
	outputRefIds: z.array(z.string()).optional(),
	parameters: z
		.array(
			z.object({
				name: z.string().optional(),
				value: z.string().optional(),
			}),
		)
		.optional(),
});

export const errorParameterSchema = z.object({
	name: z.string().optional(),
	value: z.string().optional(),
});

export const amountSchema = z.object({
	currency: z.string().optional(),
	value: z.string().optional(),
});

export const alertSchema = z.object({
	alertId: z.string().optional(),
	message: z.string().optional(),
});

export const alertDetailsSchema = z.object({
	alertId: z.string().optional(),
	details: z.string().optional(),
});

export const alertDimensionSchema = z.object({
	dimensionKey: z.string().optional(),
	value: z.string().optional(),
});

export const baseResponseSchema = z.object({
	warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Inventory Reference Schemas
// ============================================================================

export const marketingInventoryItemSchema = z.object({
	inventoryReferenceId: z.string().optional(),
	inventoryReferenceType: z.string().optional(),
});

export const inventoryReferenceSchema = z.object({
	inventoryReferenceId: z.string().optional(),
	inventoryReferenceType: z.string().optional(),
});

// ============================================================================
// Recommendation Schemas (from sellRecommendationV1Oas3.ts)
// ============================================================================

export const bidPercentagesSchema = z.object({
	basis: z.string().optional(),
	value: z.string().optional(),
});

export const adRecommendationSchema = z.object({
	bidPercentages: z.array(bidPercentagesSchema).optional(),
	promoteWithAd: z.string().optional(),
});

export const marketingRecommendationSchema = z.object({
	ad: adRecommendationSchema.optional(),
	message: z.string().optional(),
});

export const listingRecommendationSchema = z.object({
	listingId: z.string().optional(),
	marketing: marketingRecommendationSchema.optional(),
});

export const pagedListingRecommendationCollectionSchema = z.object({
	href: z.string().optional(),
	limit: z.number().optional(),
	listingRecommendations: z.array(listingRecommendationSchema).optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	total: z.number().optional(),
});

export const findListingRecommendationRequestSchema = z.object({
	listingIds: z.array(z.string()).optional(),
});

// ============================================================================
// Aspect Schema
// ============================================================================

export const aspectSchema = z.object({
	aspectValues: z.array(z.string()).optional(),
	localizedAspectName: z.string().optional(),
});

export const findListingRecommendationsInputSchema = z.object({
	requestBody: findListingRecommendationRequestSchema.optional(),
	filter: z.string().optional().describe("Recommendation filter expression"),
	limit: z.number().optional().describe("Maximum recommendations to return"),
	offset: z
		.number()
		.optional()
		.describe("Recommendations to skip before returning results"),
	marketplaceId: z
		.string()
		.describe("Marketplace ID sent as X-EBAY-C-MARKETPLACE-ID"),
});
