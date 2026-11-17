/**
 * Marketing API schemas — promotions slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import {
  amountSchema,
  marketingInventoryItemSchema,
} from './marketing-common-schemas.js';

import { selectionRuleSchema } from './campaigns-schemas.js';

// ============================================================================
// Item Promotion (Discounts) Schemas
// ============================================================================

/**
 * Validates the Marketing API discount benefit model.
 */
const discountBenefitSchema = z.object({
  amountOffItem: amountSchema.optional(),
  amountOffOrder: amountSchema.optional(),
  percentageOffItem: z.string().optional(),
  percentageOffOrder: z.string().optional(),
});

/**
 * Validates the Marketing API price range model.
 */
const priceRangeSchema = z.object({
  maxPrice: amountSchema.optional(),
  minPrice: amountSchema.optional(),
});

/**
 * Validates the Marketing API discount specification model.
 */
const discountSpecificationSchema = z.object({
  forEachAmount: amountSchema.optional(),
  forEachQuantity: z.number().optional(),
  minAmount: amountSchema.optional(),
  minQuantity: z.number().optional(),
  numberOfDiscountedItems: z.number().optional(),
});

/**
 * Validates the Marketing API discount rule model.
 */
const discountRuleSchema = z.object({
  discountBenefit: discountBenefitSchema.optional(),
  discountSpecification: discountSpecificationSchema.optional(),
  ruleOrder: z.number().optional(),
});

/**
 * Validates the Marketing API inventory criterion model.
 */
const inventoryCriterionSchema = z.object({
  inventoryCriterionType: z.string().optional(),
  inventoryItems: z.array(marketingInventoryItemSchema).optional(),
  listingIds: z.array(z.string()).optional(),
  ruleCriteria: z
    .object({
      excludeInventoryItems: z.array(marketingInventoryItemSchema).optional(),
      excludeListingIds: z.array(z.string()).optional(),
      markupInventoryItems: z.array(marketingInventoryItemSchema).optional(),
      markupListingIds: z.array(z.string()).optional(),
      selectionRules: z.array(selectionRuleSchema).optional(),
    })
    .optional(),
});

/**
 * Validates the Marketing API coupon configuration model.
 */
const couponConfigurationSchema = z.object({
  couponCode: z.string().optional(),
  couponType: z.string().optional(),
  maxCouponRedemptionPerUser: z.number().optional(),
});

/**
 * Validates the Marketing API item promotion model.
 */
const itemPromotionSchema = z.object({
  applyDiscountToSingleItemOnly: z.boolean().optional(),
  budget: amountSchema.optional(),
  couponConfiguration: couponConfigurationSchema.optional(),
  description: z.string().optional(),
  discountRules: z.array(discountRuleSchema).optional(),
  endDate: z.string().optional(),
  inventoryCriterion: inventoryCriterionSchema.optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  priority: z.string().optional(),
  promotionImageUrl: z.string().optional(),
  promotionStatus: z.string().optional(),
  promotionType: z.string().optional(),
  startDate: z.string().optional(),
});

/**
 * Validates the Marketing API selected inventory discount model.
 */
const selectedInventoryDiscountSchema = z.object({
  discountBenefit: discountBenefitSchema.optional(),
  discountId: z.string().optional(),
  inventoryCriterion: inventoryCriterionSchema.optional(),
  ruleOrder: z.number().optional(),
});

/**
 * Validates the Marketing API item price markdown model.
 */
const itemPriceMarkdownSchema = z.object({
  applyFreeShipping: z.boolean().optional(),
  autoSelectFutureInventory: z.boolean().optional(),
  blockPriceIncreaseInItemRevision: z.boolean().optional(),
  description: z.string().optional(),
  endDate: z.string().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  priority: z.string().optional(),
  promotionImageUrl: z.string().optional(),
  promotionStatus: z.string().optional(),
  selectedInventoryDiscounts: z.array(selectedInventoryDiscountSchema).optional(),
  startDate: z.string().optional(),
});

// ============================================================================
// Email Campaign Schemas
// ============================================================================

/**
 * Validates the Marketing API campaign audience model.
 */
const campaignAudienceSchema = z.object({
  audienceType: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
});

/**
 * Validates the Marketing API create email campaign request model.
 */
const createEmailCampaignRequestSchema = z.object({
  audiences: z.array(campaignAudienceSchema).optional(),
  emailCampaignType: z.string(),
  itemIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  scheduleDate: z.string().optional(),
  scheduleDateType: z.string().optional(),
  subject: z.string().optional(),
});

// ============================================================================
// Email Campaign Request Schemas
// ============================================================================

/** Validates the Marketing API update email campaign request model. */
const updateEmailCampaignRequestSchema = z.object({
  audienceCodes: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  categoryType: z.string().optional(),
  itemIds: z.array(z.string()).optional(),
  itemSelectMode: z.string().optional(),
  personalizedMessage: z.string().optional(),
  priceRange: priceRangeSchema.optional(),
  promotionId: z.string().optional(),
  promotionSelectModeEnum: z.string().optional(),
  scheduleDate: z.string().optional(),
  sort: z.string().optional(),
  subject: z.string().optional(),
});

export const createItemPriceMarkdownPromotionInputSchema = z.object({
  request: itemPriceMarkdownSchema.describe('Create item price markdown promotion request body'),
});

/** Validates the Marketing API getItemPriceMarkdownPromotion endpoint input. */

export const getItemPriceMarkdownPromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
});

/** Validates the Marketing API updateItemPriceMarkdownPromotion endpoint input. */

export const updateItemPriceMarkdownPromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
  request: itemPriceMarkdownSchema.describe('Update item price markdown promotion request body'),
});

/** Validates the Marketing API deleteItemPriceMarkdownPromotion endpoint input. */

export const deleteItemPriceMarkdownPromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
});

/** Validates the Marketing API createItemPromotion endpoint input. */

export const createItemPromotionInputSchema = z.object({
  request: itemPromotionSchema.describe('Create item promotion request body'),
});

/** Validates the Marketing API getItemPromotion endpoint input. */

export const getItemPromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
});

/** Validates the Marketing API updateItemPromotion endpoint input. */

export const updateItemPromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
  request: itemPromotionSchema.describe('Update item promotion request body'),
});

/** Validates the Marketing API deleteItemPromotion endpoint input. */

export const deleteItemPromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
});

/** Validates the Marketing API getListingSet endpoint input. */

export const getListingSetInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
  q: z.string().describe('q optional endpoint parameter').optional(),
  sort: z.string().describe('sort optional endpoint parameter').optional(),
  status: z.string().describe('status optional endpoint parameter').optional(),
});

/** Validates the Marketing API getPromotions endpoint input. */

export const getPromotionsInputSchema = z.object({
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  marketplaceId: z.string().describe('marketplaceId required endpoint parameter'),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
  promotionStatus: z.string().describe('promotionStatus optional endpoint parameter').optional(),
  promotionType: z.string().describe('promotionType optional endpoint parameter').optional(),
  q: z.string().describe('q optional endpoint parameter').optional(),
  sort: z.string().describe('sort optional endpoint parameter').optional(),
});

/** Validates the Marketing API pausePromotion endpoint input. */

export const pausePromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
});

/** Validates the Marketing API resumePromotion endpoint input. */

export const resumePromotionInputSchema = z.object({
  promotionId: z.string().describe('promotionId required endpoint parameter'),
});

/** Validates the Marketing API getPromotionReports endpoint input. */

export const getPromotionReportsInputSchema = z.object({
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  marketplaceId: z.string().describe('marketplaceId required endpoint parameter'),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
  promotionStatus: z.string().describe('promotionStatus optional endpoint parameter').optional(),
  promotionType: z.string().describe('promotionType optional endpoint parameter').optional(),
  q: z.string().describe('q optional endpoint parameter').optional(),
});

/** Validates the Marketing API getPromotionSummaryReport endpoint input. */

export const getPromotionSummaryReportInputSchema = z.object({
  marketplaceId: z.string().describe('marketplaceId required endpoint parameter'),
});

/** Validates the Marketing API getEmailCampaigns endpoint input. */

export const getEmailCampaignsInputSchema = z.object({
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
  q: z.string().describe('q optional endpoint parameter').optional(),
  sort: z.string().describe('sort optional endpoint parameter').optional(),
});

/** Validates the Marketing API createEmailCampaign endpoint input. */

export const createEmailCampaignInputSchema = z.object({
  marketplaceId: z.string().describe('Marketplace ID sent as X-EBAY-C-MARKETPLACE-ID'),
  request: createEmailCampaignRequestSchema.describe('Create email campaign request body'),
});

/** Validates the Marketing API getEmailCampaign endpoint input. */

export const getEmailCampaignInputSchema = z.object({
  emailCampaignId: z.string().describe('emailCampaignId required endpoint parameter'),
});

/** Validates the Marketing API updateEmailCampaign endpoint input. */

export const updateEmailCampaignInputSchema = z.object({
  emailCampaignId: z.string().describe('emailCampaignId required endpoint parameter'),
  request: updateEmailCampaignRequestSchema.describe('Update email campaign request body'),
});

/** Validates the Marketing API deleteEmailCampaign endpoint input. */

export const deleteEmailCampaignInputSchema = z.object({
  emailCampaignId: z.string().describe('emailCampaignId required endpoint parameter'),
});

/** Validates the Marketing API getAudiences endpoint input. */

export const getAudiencesInputSchema = z.object({
  emailCampaignType: z.string().describe('emailCampaignType required endpoint parameter'),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
});

/** Validates the Marketing API getEmailPreview endpoint input. */

export const getEmailPreviewInputSchema = z.object({
  emailCampaignId: z.string().describe('emailCampaignId required endpoint parameter'),
});

/** Validates the Marketing API getEmailReport endpoint input. */

export const getEmailReportInputSchema = z.object({
  endDate: z.string().describe('endDate required endpoint parameter'),
  startDate: z.string().describe('startDate required endpoint parameter'),
});

/** Validates the Recommendation API findListingRecommendations endpoint input. */
