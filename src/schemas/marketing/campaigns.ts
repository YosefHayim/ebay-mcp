/**
 * Marketing API schemas — campaigns slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { amountSchema, alertSchema } from './common.js';

// ============================================================================
// Campaign Management Schemas
// ============================================================================

/**
 * Validates the Marketing API budget model.
 */
export const budgetSchema = z.object({
  amount: z.string().optional(),
  currency: z.string().optional(),
});

/**
 * Validates the Marketing API budget request model.
 */
export const budgetRequestSchema = z.object({
  amount: z.string().optional(),
  currency: z.string().optional(),
});

/**
 * Validates the Marketing API campaign budget model.
 */
export const campaignBudgetSchema = z.object({
  daily: budgetSchema.optional(),
});

/**
 * Validates the Marketing API campaign budget request model.
 */
export const campaignBudgetRequestSchema = z.object({
  daily: budgetRequestSchema.optional(),
});

/**
 * Validates the Marketing API funding strategy model.
 */
export const fundingStrategySchema = z.object({
  bidPercentage: z.string().optional(),
  fundingModel: z.string().optional(),
});

/**
 * Validates the Marketing API selection rule model.
 */
export const selectionRuleSchema = z.object({
  brands: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  categoryScope: z.string().optional(),
  listingConditionIds: z.array(z.string()).optional(),
  maxPrice: amountSchema.optional(),
  minPrice: amountSchema.optional(),
});

/**
 * Validates the Marketing API campaign criterion model.
 */
export const campaignCriterionSchema = z.object({
  autoSelectFutureInventory: z.boolean().optional(),
  criterionType: z.string().optional(),
  selectionRules: z.array(selectionRuleSchema).optional(),
});

/**
 * Validates the Marketing API campaign model.
 */
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

/**
 * Validates the Marketing API create campaign request model.
 */
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

/**
 * Validates the Marketing API clone campaign request model.
 */
export const cloneCampaignRequestSchema = z.object({
  campaignName: z.string(),
  endDate: z.string().optional(),
  fundingStrategy: fundingStrategySchema.optional(),
  startDate: z.string().optional(),
});

/**
 * Validates the Marketing API update campaign request model.
 */
export const updateCampaignRequestSchema = z.object({
  campaignName: z.string().optional(),
  endDate: z.string().optional(),
  fundingStrategy: fundingStrategySchema.optional(),
  startDate: z.string().optional(),
});

/**
 * Validates the Marketing API update campaign budget request model.
 */
export const updateCampaignBudgetRequestSchema = z.object({
  budget: campaignBudgetRequestSchema.optional(),
});

/**
 * Validates the Marketing API update campaign identification request model.
 */
export const updateCampaignIdentificationRequestSchema = z.object({
  campaignName: z.string().optional(),
});

/**
 * Validates the Marketing API update bid percentage request model.
 */
export const updateBidPercentageRequestSchema = z.object({
  bidPercentage: z.string(),
});

/**
 * Validates the Marketing API update bidding strategy request model.
 */
export const updateBiddingStrategyRequestSchema = z.object({
  bidPercentage: z.string().optional(),
  biddingStrategy: z.string().optional(),
});

/**
 * Validates the Marketing API update adrate strategy request model.
 */
export const updateAdrateStrategyRequestSchema = z.object({
  adRateStrategy: z.string().optional(),
});

/**
 * Validates the Marketing API campaign paged collection response payload.
 */
export const campaignPagedCollectionResponseSchema = z.object({
  campaigns: z.array(campaignSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API campaigns model.
 */
export const campaignsSchema = z.object({
  campaigns: z.array(campaignSchema).optional(),
});

// ============================================================================
// Suggestion Schemas (Bids, Keywords, Budget)
// ============================================================================

/**
 * Validates the Marketing API proposed bid model.
 */
export const proposedBidSchema = z.object({
  amount: amountSchema.optional(),
  basis: z.string().optional(),
});

/**
 * Validates the Marketing API suggested bids model.
 */
export const suggestedBidsSchema = z.object({
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
  proposedBid: proposedBidSchema.optional(),
});

/**
 * Validates the Marketing API additional info data model.
 */
export const additionalInfoDataSchema = z.object({
  key: z.string().optional(),
  value: z.string().optional(),
});

/**
 * Validates the Marketing API additional info model.
 */
export const additionalInfoSchema = z.object({
  data: z.array(additionalInfoDataSchema).optional(),
  type: z.string().optional(),
});

/**
 * Validates the Marketing API suggested keywords model.
 */
export const suggestedKeywordsSchema = z.object({
  additionalInfo: z.array(additionalInfoSchema).optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

/**
 * Validates the Marketing API budget recommendation response payload.
 */
export const budgetRecommendationResponseSchema = z.object({
  amount: amountSchema.optional(),
  type: z.string().optional(),
});

/**
 * Validates the Marketing API suggest budget response payload.
 */
export const suggestBudgetResponseSchema = z.object({
  suggestedBudget: z.array(budgetRecommendationResponseSchema).optional(),
});

/**
 * Validates the Marketing API max CPC model.
 */
export const maxCpcSchema = z.object({
  amount: amountSchema.optional(),
});

/**
 * Validates the Marketing API suggest max CPC request model.
 */
export const suggestMaxCpcRequestSchema = z.object({
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string().optional(),
});

/**
 * Validates the Marketing API suggest max CPC response payload.
 */
export const suggestMaxCpcResponseSchema = z.object({
  amount: amountSchema.optional(),
  marketplaceId: z.string().optional(),
});

/**
 * Validates the Marketing API bid preference model.
 */
export const bidPreferenceSchema = z.object({
  bidPercentage: z.string().optional(),
});

/**
 * Validates the Marketing API dynamic ad rate preference model.
 */
export const dynamicAdRatePreferenceSchema = z.object({
  maxAdRate: z.string().optional(),
  minAdRate: z.string().optional(),
});

// Quick Setup Schema
/**
 * Validates the Marketing API quick setup request model.
 */
export const quickSetupRequestSchema = z.object({
  campaignName: z.string(),
  dailyBudget: amountSchema.optional(),
  endDate: z.string().optional(),
  fundingStrategy: fundingStrategySchema.optional(),
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  startDate: z.string().optional(),
});

export const cloneCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: cloneCampaignRequestSchema.describe('Clone campaign request body'),
});

/** Validates the Marketing API getCampaigns endpoint input. */

export const getCampaignsInputSchema = z.object({
  campaignName: z.string().describe('campaignName optional endpoint parameter').optional(),
  campaignStatus: z.string().describe('campaignStatus optional endpoint parameter').optional(),
  campaignTargetingTypes: z
    .string()
    .describe('campaignTargetingTypes optional endpoint parameter')
    .optional(),
  channels: z.string().describe('channels optional endpoint parameter').optional(),
  endDateRange: z.string().describe('endDateRange optional endpoint parameter').optional(),
  fundingStrategy: z.string().describe('fundingStrategy optional endpoint parameter').optional(),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
  startDateRange: z.string().describe('startDateRange optional endpoint parameter').optional(),
});

/** Validates the Marketing API createCampaign endpoint input. */

export const createCampaignInputSchema = z.object({
  request: createCampaignRequestSchema.describe('Create campaign request body'),
});

/** Validates the Marketing API getCampaign endpoint input. */

export const getCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API deleteCampaign endpoint input. */

export const deleteCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API endCampaign endpoint input. */

export const endCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API findCampaignByAdReference endpoint input. */

export const findCampaignByAdReferenceInputSchema = z.object({
  inventoryReferenceId: z
    .string()
    .describe('inventoryReferenceId optional endpoint parameter')
    .optional(),
  inventoryReferenceType: z
    .string()
    .describe('inventoryReferenceType optional endpoint parameter')
    .optional(),
  listingId: z.string().describe('listingId optional endpoint parameter').optional(),
});

/** Validates the Marketing API getCampaignByName endpoint input. */

export const getCampaignByNameInputSchema = z.object({
  campaignName: z.string().describe('campaignName required endpoint parameter'),
});

/** Validates the Marketing API launchCampaign endpoint input. */

export const launchCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API pauseCampaign endpoint input. */

export const pauseCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API resumeCampaign endpoint input. */

export const resumeCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API setupQuickCampaign endpoint input. */

export const setupQuickCampaignInputSchema = z.object({
  request: quickSetupRequestSchema.describe('Setup quick campaign request body'),
});

/** Validates the Marketing API suggestBudget endpoint input. */

export const suggestBudgetInputSchema = z.object({
  marketplaceId: z.string().describe('Marketplace ID sent as X-EBAY-C-MARKETPLACE-ID'),
});

/** Validates the Marketing API suggestItems endpoint input. */

export const suggestItemsInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  categoryIds: z.string().describe('categoryIds optional endpoint parameter').optional(),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
});

/** Validates the Marketing API suggestMaxCpc endpoint input. */

export const suggestMaxCpcInputSchema = z.object({
  request: suggestMaxCpcRequestSchema.describe('Suggest max cpc request body'),
});

/** Validates the Marketing API updateAdRateStrategy endpoint input. */

export const updateAdRateStrategyInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: updateAdrateStrategyRequestSchema.describe('Update ad rate strategy request body'),
});

/** Validates the Marketing API updateBiddingStrategy endpoint input. */

export const updateBiddingStrategyInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: updateBiddingStrategyRequestSchema.describe('Update bidding strategy request body'),
});

/** Validates the Marketing API updateCampaignBudget endpoint input. */

export const updateCampaignBudgetInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: updateCampaignBudgetRequestSchema.describe('Update campaign budget request body'),
});

/** Validates the Marketing API updateCampaignIdentification endpoint input. */

export const updateCampaignIdentificationInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: updateCampaignIdentificationRequestSchema.describe(
    'Update campaign identification request body',
  ),
});

/** Validates the Marketing API bulkCreateKeyword endpoint input. */
