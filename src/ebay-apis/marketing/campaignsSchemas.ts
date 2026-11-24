import { z } from "zod";
import { alertSchema, amountSchema } from "./marketingCommonSchemas.js";

// ============================================================================
// Campaign Management Schemas
// ============================================================================

export const budgetSchema = z.object({
	amount: z.string().optional(),
	currency: z.string().optional(),
});

export const budgetRequestSchema = z.object({
	amount: z.string().optional(),
	currency: z.string().optional(),
});

export const campaignBudgetSchema = z.object({
	daily: budgetSchema.optional(),
});

export const campaignBudgetRequestSchema = z.object({
	daily: budgetRequestSchema.optional(),
});

export const fundingStrategySchema = z.object({
	bidPercentage: z.string().optional(),
	fundingModel: z.string().optional(),
});

export const selectionRuleSchema = z.object({
	brands: z.array(z.string()).optional(),
	categoryIds: z.array(z.string()).optional(),
	categoryScope: z.string().optional(),
	listingConditionIds: z.array(z.string()).optional(),
	maxPrice: amountSchema.optional(),
	minPrice: amountSchema.optional(),
});

export const campaignCriterionSchema = z.object({
	autoSelectFutureInventory: z.boolean().optional(),
	criterionType: z.string().optional(),
	selectionRules: z.array(selectionRuleSchema).optional(),
});

export const campaignSchema = z.object({
	alerts: z.array(alertSchema).optional(),
	budget: campaignBudgetSchema.optional(),
	campaignCriterion: campaignCriterionSchema.optional(),
	campaignId: z.string().optional(),
	campaignName: z.string().optional(),
	campaignStatus: z.string().optional(),
	campaignTargetingType: z.string().optional(),
	channels: z.array(z.string()).optional(),
	endDate: z.string().optional(),
	fundingStrategy: fundingStrategySchema.optional(),
	marketplaceId: z.string().optional(),
	startDate: z.string().optional(),
});

export const createCampaignRequestSchema = z.object({
	campaignCriterion: campaignCriterionSchema.optional(),
	campaignName: z.string(),
	budget: campaignBudgetRequestSchema.optional(),
	channels: z.array(z.string()).optional(),
	endDate: z.string().optional(),
	fundingStrategy: fundingStrategySchema.optional(),
	marketplaceId: z.string(),
	startDate: z.string(),
});

export const cloneCampaignRequestSchema = z.object({
	campaignName: z.string(),
	endDate: z.string().optional(),
	fundingStrategy: fundingStrategySchema.optional(),
	startDate: z.string().optional(),
});

export const updateCampaignRequestSchema = z.object({
	campaignName: z.string().optional(),
	endDate: z.string().optional(),
	fundingStrategy: fundingStrategySchema.optional(),
	startDate: z.string().optional(),
});

export const updateCampaignBudgetRequestSchema = z.object({
	budget: campaignBudgetRequestSchema.optional(),
});

export const updateCampaignIdentificationRequestSchema = z.object({
	campaignName: z.string().optional(),
});

export const updateBidPercentageRequestSchema = z.object({
	bidPercentage: z.string(),
});

export const updateBiddingStrategyRequestSchema = z.object({
	bidPercentage: z.string().optional(),
	biddingStrategy: z.string().optional(),
});

export const updateAdrateStrategyRequestSchema = z.object({
	adRateStrategy: z.string().optional(),
});

export const campaignPagedCollectionResponseSchema = z.object({
	campaigns: z.array(campaignSchema).optional(),
	href: z.string().optional(),
	limit: z.number().optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	total: z.number().optional(),
});

export const campaignsSchema = z.object({
	campaigns: z.array(campaignSchema).optional(),
});

// ============================================================================
// Suggestion Schemas (Bids, Keywords, Budget)
// ============================================================================

export const proposedBidSchema = z.object({
	amount: amountSchema.optional(),
	basis: z.string().optional(),
});

export const suggestedBidsSchema = z.object({
	keywordText: z.string().optional(),
	matchType: z.string().optional(),
	proposedBid: proposedBidSchema.optional(),
});

export const additionalInfoDataSchema = z.object({
	key: z.string().optional(),
	value: z.string().optional(),
});

export const additionalInfoSchema = z.object({
	data: z.array(additionalInfoDataSchema).optional(),
	type: z.string().optional(),
});

export const suggestedKeywordsSchema = z.object({
	additionalInfo: z.array(additionalInfoSchema).optional(),
	keywordText: z.string().optional(),
	matchType: z.string().optional(),
});

export const budgetRecommendationResponseSchema = z.object({
	amount: amountSchema.optional(),
	type: z.string().optional(),
});

export const suggestBudgetResponseSchema = z.object({
	suggestedBudget: z.array(budgetRecommendationResponseSchema).optional(),
});

export const maxCpcSchema = z.object({
	amount: amountSchema.optional(),
});

export const suggestMaxCpcRequestSchema = z.object({
	listingIds: z.array(z.string()).optional(),
	marketplaceId: z.string().optional(),
});

export const suggestMaxCpcResponseSchema = z.object({
	amount: amountSchema.optional(),
	marketplaceId: z.string().optional(),
});

export const bidPreferenceSchema = z.object({
	bidPercentage: z.string().optional(),
});

export const dynamicAdRatePreferenceSchema = z.object({
	maxAdRate: z.string().optional(),
	minAdRate: z.string().optional(),
});

export const cloneCampaignInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: cloneCampaignRequestSchema.describe("Clone campaign request body"),
});

export const getCampaignsInputSchema = z.object({
	campaignName: z
		.string()
		.describe("campaignName optional endpoint parameter")
		.optional(),
	campaignStatus: z
		.string()
		.describe("campaignStatus optional endpoint parameter")
		.optional(),
	campaignTargetingTypes: z
		.string()
		.describe("campaignTargetingTypes optional endpoint parameter")
		.optional(),
	channels: z
		.string()
		.describe("channels optional endpoint parameter")
		.optional(),
	endDateRange: z
		.string()
		.describe("endDateRange optional endpoint parameter")
		.optional(),
	fundingStrategy: z
		.string()
		.describe("fundingStrategy optional endpoint parameter")
		.optional(),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
	startDateRange: z
		.string()
		.describe("startDateRange optional endpoint parameter")
		.optional(),
});

export const createCampaignInputSchema = z.object({
	request: createCampaignRequestSchema.describe("Create campaign request body"),
});

export const getCampaignInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const deleteCampaignInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const endCampaignInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const findCampaignByAdReferenceInputSchema = z.object({
	inventoryReferenceId: z
		.string()
		.describe("inventoryReferenceId optional endpoint parameter")
		.optional(),
	inventoryReferenceType: z
		.string()
		.describe("inventoryReferenceType optional endpoint parameter")
		.optional(),
	listingId: z
		.string()
		.describe("listingId optional endpoint parameter")
		.optional(),
});

export const getCampaignByNameInputSchema = z.object({
	campaignName: z.string().describe("campaignName required endpoint parameter"),
});

export const pauseCampaignInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const resumeCampaignInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const suggestBudgetInputSchema = z.object({
	marketplaceId: z
		.string()
		.describe("Marketplace ID sent as X-EBAY-C-MARKETPLACE-ID"),
});

export const suggestItemsInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	categoryIds: z
		.string()
		.describe("categoryIds optional endpoint parameter")
		.optional(),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
});

export const suggestMaxCpcInputSchema = z.object({
	request: suggestMaxCpcRequestSchema.describe("Suggest max cpc request body"),
});

export const updateAdRateStrategyInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: updateAdrateStrategyRequestSchema.describe(
		"Update ad rate strategy request body",
	),
});

export const updateBiddingStrategyInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: updateBiddingStrategyRequestSchema.describe(
		"Update bidding strategy request body",
	),
});

export const updateCampaignBudgetInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: updateCampaignBudgetRequestSchema.describe(
		"Update campaign budget request body",
	),
});

export const updateCampaignIdentificationInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: updateCampaignIdentificationRequestSchema.describe(
		"Update campaign identification request body",
	),
});
