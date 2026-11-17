/**
 * Marketing API schemas — campaigns slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { amountSchema, } from './marketing-common-schemas.js';

/**
 * Validates the Marketing API budget request model.
 */
const budgetRequestSchema = z.object({
  amount: z.string().optional(),
  currency: z.string().optional(),
});

/**
 * Validates the Marketing API campaign budget request model.
 */
const campaignBudgetRequestSchema = z.object({
  daily: budgetRequestSchema.optional(),
});

/**
 * Validates the Marketing API funding strategy model.
 */
const fundingStrategySchema = z.object({
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
const campaignCriterionSchema = z.object({
  autoSelectFutureInventory: z.boolean().optional(),
  criterionType: z.string().optional(),
  selectionRules: z.array(selectionRuleSchema).optional(),
});

/**
 * Validates the Marketing API create campaign request model.
 */
const createCampaignRequestSchema = z.object({
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
const cloneCampaignRequestSchema = z.object({
  campaignName: z.string(),
  endDate: z.string().optional(),
  fundingStrategy: fundingStrategySchema.optional(),
  startDate: z.string().optional(),
});

/**
 * Validates the Marketing API update campaign budget request model.
 */
const updateCampaignBudgetRequestSchema = z.object({
  budget: campaignBudgetRequestSchema.optional(),
});

/**
 * Validates the Marketing API update campaign identification request model.
 */
const updateCampaignIdentificationRequestSchema = z.object({
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
const updateBiddingStrategyRequestSchema = z.object({
  bidPercentage: z.string().optional(),
  biddingStrategy: z.string().optional(),
});

/**
 * Validates the Marketing API update adrate strategy request model.
 */
const updateAdrateStrategyRequestSchema = z.object({
  adRateStrategy: z.string().optional(),
});

/**
 * Validates the Marketing API suggest max CPC request model.
 */
const suggestMaxCpcRequestSchema = z.object({
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string().optional(),
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

/** Validates the Marketing API pauseCampaign endpoint input. */

export const pauseCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API resumeCampaign endpoint input. */

export const resumeCampaignInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
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
