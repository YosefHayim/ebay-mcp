/**
 * Marketing API schemas — promotions slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { errorSchema, amountSchema, marketingInventoryItemSchema } from './common.js';

import { selectionRuleSchema } from './campaigns.js';

// ============================================================================
// Item Promotion (Discounts) Schemas
// ============================================================================

/**
 * Validates the Marketing API discount benefit model.
 */
export const discountBenefitSchema = z.object({
  amountOffItem: amountSchema.optional(),
  amountOffOrder: amountSchema.optional(),
  percentageOffItem: z.string().optional(),
  percentageOffOrder: z.string().optional(),
});

/**
 * Validates the Marketing API price range model.
 */
export const priceRangeSchema = z.object({
  maxPrice: amountSchema.optional(),
  minPrice: amountSchema.optional(),
});

/**
 * Validates the Marketing API discount specification model.
 */
export const discountSpecificationSchema = z.object({
  forEachAmount: amountSchema.optional(),
  forEachQuantity: z.number().optional(),
  minAmount: amountSchema.optional(),
  minQuantity: z.number().optional(),
  numberOfDiscountedItems: z.number().optional(),
});

/**
 * Validates the Marketing API discount rule model.
 */
export const discountRuleSchema = z.object({
  discountBenefit: discountBenefitSchema.optional(),
  discountSpecification: discountSpecificationSchema.optional(),
  ruleOrder: z.number().optional(),
});

/**
 * Validates the Marketing API inventory criterion model.
 */
export const inventoryCriterionSchema = z.object({
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
export const couponConfigurationSchema = z.object({
  couponCode: z.string().optional(),
  couponType: z.string().optional(),
  maxCouponRedemptionPerUser: z.number().optional(),
});

/**
 * Validates the Marketing API item promotion model.
 */
export const itemPromotionSchema = z.object({
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
 * Validates the Marketing API item promotion response payload.
 */
export const itemPromotionResponseSchema = z.object({
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
  promotionId: z.string().optional(),
  promotionImageUrl: z.string().optional(),
  promotionStatus: z.string().optional(),
  promotionType: z.string().optional(),
  startDate: z.string().optional(),
});

/**
 * Validates the Marketing API selected inventory discount model.
 */
export const selectedInventoryDiscountSchema = z.object({
  discountBenefit: discountBenefitSchema.optional(),
  discountId: z.string().optional(),
  inventoryCriterion: inventoryCriterionSchema.optional(),
  ruleOrder: z.number().optional(),
});

/**
 * Validates the Marketing API item markdown status model.
 */
export const itemMarkdownStatusSchema = z.object({
  listingPromotionStatus: z.string().optional(),
  timestamp: z.string().optional(),
});

/**
 * Validates the Marketing API listing detail model.
 */
export const listingDetailSchema = z.object({
  currentPrice: amountSchema.optional(),
  freeShipping: z.boolean().optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  listingCategoryId: z.string().optional(),
  listingCondition: z.string().optional(),
  listingConditionId: z.string().optional(),
  listingId: z.string().optional(),
  listingPromotionStatuses: z.array(itemMarkdownStatusSchema).optional(),
  quantity: z.number().optional(),
  storeCategoryId: z.string().optional(),
  title: z.string().optional(),
});

/**
 * Validates the Marketing API items paged collection model.
 */
export const itemsPagedCollectionSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  listings: z.array(listingDetailSchema).optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Marketing API promotions paged collection model.
 */
export const promotionsPagedCollectionSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  promotions: z.array(itemPromotionResponseSchema).optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API promotion detail model.
 */
export const promotionDetailSchema = z.object({
  description: z.string().optional(),
  endDate: z.string().optional(),
  marketplaceId: z.string().optional(),
  name: z.string().optional(),
  priority: z.string().optional(),
  promotionId: z.string().optional(),
  promotionImageUrl: z.string().optional(),
  promotionStatus: z.string().optional(),
  promotionType: z.string().optional(),
  startDate: z.string().optional(),
});

/**
 * Validates the Marketing API promotion report detail model.
 */
export const promotionReportDetailSchema = z.object({
  averageItemDiscount: amountSchema.optional(),
  averageItemRevenue: amountSchema.optional(),
  averageOrderDiscount: amountSchema.optional(),
  averageOrderRevenue: amountSchema.optional(),
  averageOrderSize: z.string().optional(),
  baseSale: amountSchema.optional(),
  clicksToPromotion: z.number().optional(),
  impressionsToPromotion: z.number().optional(),
  numberOfItemsSoldInPromotion: z.number().optional(),
  numberOfOrdersWithPromotion: z.number().optional(),
  percentageSalesLift: z.string().optional(),
  promotionHref: z.string().optional(),
  promotionId: z.string().optional(),
  promotionReportId: z.string().optional(),
  promotionSale: amountSchema.optional(),
  totalDiscount: amountSchema.optional(),
  totalSale: amountSchema.optional(),
});

/**
 * Validates the Marketing API promotions report paged collection model.
 */
export const promotionsReportPagedCollectionSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  promotionReports: z.array(promotionReportDetailSchema).optional(),
  total: z.number().optional(),
});

// Item Price Markdown Schemas
/**
 * Validates the Marketing API item basis model.
 */
export const itemBasisSchema = z.object({
  itemIds: z.array(z.string()).optional(),
  priceRange: priceRangeSchema.optional(),
});

/**
 * Validates the Marketing API item price markdown model.
 */
export const itemPriceMarkdownSchema = z.object({
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
export const campaignAudienceSchema = z.object({
  audienceType: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
});

/**
 * Validates the Marketing API campaign DTO model.
 */
export const campaignDTOSchema = z.object({
  audiences: z.array(campaignAudienceSchema).optional(),
  creationDate: z.string().optional(),
  emailCampaignId: z.string().optional(),
  emailCampaignStatus: z.string().optional(),
  emailCampaignType: z.string().optional(),
  marketplaceId: z.string().optional(),
  modificationDate: z.string().optional(),
  scheduleDate: z.string().optional(),
  scheduleDateType: z.string().optional(),
  sentDate: z.string().optional(),
  subject: z.string().optional(),
});

/**
 * Validates the Marketing API create email campaign request model.
 */
export const createEmailCampaignRequestSchema = z.object({
  audiences: z.array(campaignAudienceSchema).optional(),
  emailCampaignType: z.string(),
  itemIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  scheduleDate: z.string().optional(),
  scheduleDateType: z.string().optional(),
  subject: z.string().optional(),
});

/**
 * Validates the Marketing API create email campaign response payload.
 */
export const createEmailCampaignResponseSchema = z.object({
  emailCampaignId: z.string().optional(),
  href: z.string().optional(),
});

/**
 * Validates the Marketing API update email campaign response payload.
 */
export const updateEmailCampaignResponseSchema = z.object({
  emailCampaignId: z.string().optional(),
  href: z.string().optional(),
});

/**
 * Validates the Marketing API delete email campaign response payload.
 */
export const deleteEmailCampaignResponseSchema = z.object({
  emailCampaignId: z.string().optional(),
});

/**
 * Validates the Marketing API get email campaign response payload.
 */
export const getEmailCampaignResponseSchema = z.object({
  emailCampaign: campaignDTOSchema.optional(),
});

/**
 * Validates the Marketing API get email campaigns response payload.
 */
export const getEmailCampaignsResponseSchema = z.object({
  emailCampaigns: z.array(campaignDTOSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API get email campaign audiences response payload.
 */
export const getEmailCampaignAudiencesResponseSchema = z.object({
  audiences: z.array(campaignAudienceSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API get email preview response payload.
 */
export const getEmailPreviewResponseSchema = z.object({
  emailPreviewHtml: z.string().optional(),
});

/**
 * Validates the Marketing API get email report response payload.
 */
export const getEmailReportResponseSchema = z.object({
  clickRate: z.string().optional(),
  numberOfClicks: z.number().optional(),
  numberOfOpens: z.number().optional(),
  numberOfRecipients: z.number().optional(),
  numberOfUnsubscribes: z.number().optional(),
  openRate: z.string().optional(),
  unsubscribeRate: z.string().optional(),
});

// ============================================================================
// Email Campaign Request Schemas
// ============================================================================

/** Validates the Marketing API update email campaign request model. */
export const updateEmailCampaignRequestSchema = z.object({
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
