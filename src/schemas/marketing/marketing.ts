import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Marketing API Schemas
 *
 * This file contains Zod schemas for all Marketing API endpoints including:
 * - Campaign Management (create, get, update, pause, resume, end campaigns)
 * - Ad Operations (bulk and single ad operations)
 * - Ad Group Management
 * - Keyword Management
 * - Negative Keyword Management (campaign and ad group level)
 * - Targeting schemas
 * - Suggestion schemas (bids, keywords, budget)
 * - Reporting schemas
 * - Item Promotion schemas
 * - Recommendation schemas
 */

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
  parameters: z.array(z.object({
    name: z.string().optional(),
    value: z.string().optional(),
  })).optional(),
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
// Ad Group Management Schemas
// ============================================================================

export const adGroupSchema = z.object({
  adGroupId: z.string().optional(),
  adGroupStatus: z.string().optional(),
  defaultBid: amountSchema.optional(),
  name: z.string().optional(),
});

export const createAdGroupRequestSchema = z.object({
  defaultBid: amountSchema.optional(),
  name: z.string(),
});

export const updateAdGroupRequestSchema = z.object({
  adGroupStatus: z.string().optional(),
  defaultBid: amountSchema.optional(),
  name: z.string().optional(),
});

export const adGroupPagedCollectionResponseSchema = z.object({
  adGroups: z.array(adGroupSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

// ============================================================================
// Ad Operations Schemas
// ============================================================================

export const adSchema = z.object({
  adGroupId: z.string().optional(),
  adId: z.string().optional(),
  adStatus: z.string().optional(),
  alerts: z.array(alertSchema).optional(),
  bidPercentage: z.string().optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  listingId: z.string().optional(),
});

export const createAdRequestSchema = z.object({
  adGroupId: z.string().optional(),
  bidPercentage: z.string().optional(),
  listingId: z.string().optional(),
});

export const adsSchema = z.object({
  ads: z.array(createAdRequestSchema).optional(),
});

export const createAdsByInventoryReferenceRequestSchema = z.object({
  bidPercentage: z.string().optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

export const adReferenceSchema = z.object({
  adId: z.string().optional(),
  href: z.string().optional(),
});

export const adReferencesSchema = z.object({
  ads: z.array(adReferenceSchema).optional(),
});

export const adResponseSchema = z.object({
  adGroupId: z.string().optional(),
  adId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  listingId: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const createAdsByInventoryReferenceResponseSchema = z.object({
  ads: z.array(adResponseSchema).optional(),
  errors: z.array(errorSchema).optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const adPagedCollectionResponseSchema = z.object({
  ads: z.array(adSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

// Ad Update Schemas
export const updateAdStatusRequestSchema = z.object({
  adStatus: z.string(),
});

export const updateAdStatusByListingIdRequestSchema = z.object({
  adStatus: z.string(),
  listingId: z.string(),
});

export const adUpdateStatusResponseSchema = z.object({
  adId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  statusCode: z.number().optional(),
});

export const adUpdateStatusByListingIdResponseSchema = z.object({
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  listingId: z.string().optional(),
  statusCode: z.number().optional(),
});

export const adUpdateResponseSchema = z.object({
  ads: z.array(adUpdateStatusResponseSchema).optional(),
});

// Bulk Ad Operations
export const bulkCreateAdRequestSchema = z.object({
  requests: z.array(createAdRequestSchema).optional(),
});

export const bulkAdResponseSchema = z.object({
  responses: z.array(adResponseSchema).optional(),
});

export const bulkCreateAdsByInventoryReferenceRequestSchema = z.object({
  requests: z.array(createAdsByInventoryReferenceRequestSchema).optional(),
});

export const bulkCreateAdsByInventoryReferenceResponseSchema = z.object({
  responses: z.array(createAdsByInventoryReferenceResponseSchema).optional(),
});

export const bulkUpdateAdStatusRequestSchema = z.object({
  requests: z.array(updateAdStatusRequestSchema).optional(),
});

export const bulkUpdateAdStatusByListingIdRequestSchema = z.object({
  requests: z.array(updateAdStatusByListingIdRequestSchema).optional(),
});

export const bulkAdUpdateStatusResponseSchema = z.object({
  responses: z.array(adUpdateStatusResponseSchema).optional(),
});

export const bulkAdUpdateStatusByListingIdResponseSchema = z.object({
  responses: z.array(adUpdateStatusByListingIdResponseSchema).optional(),
});

export const bulkAdUpdateResponseSchema = z.object({
  responses: z.array(adUpdateResponseSchema).optional(),
});

// Delete Ad Schemas
export const adIdsSchema = z.object({
  adIds: z.array(z.string()).optional(),
});

export const deleteAdRequestSchema = z.object({
  adId: z.string().optional(),
});

export const deleteAdResponseSchema = z.object({
  adId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  listingId: z.string().optional(),
  statusCode: z.number().optional(),
});

export const bulkDeleteAdRequestSchema = z.object({
  requests: z.array(deleteAdRequestSchema).optional(),
});

export const bulkDeleteAdResponseSchema = z.object({
  responses: z.array(deleteAdResponseSchema).optional(),
});

export const deleteAdsByInventoryReferenceRequestSchema = z.object({
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

export const deleteAdsByInventoryReferenceResponseSchema = z.object({
  ads: z.array(deleteAdResponseSchema).optional(),
  errors: z.array(errorSchema).optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  statusCode: z.number().optional(),
});

export const bulkDeleteAdsByInventoryReferenceRequestSchema = z.object({
  requests: z.array(deleteAdsByInventoryReferenceRequestSchema).optional(),
});

export const bulkDeleteAdsByInventoryReferenceResponseSchema = z.object({
  responses: z.array(deleteAdsByInventoryReferenceResponseSchema).optional(),
});

export const updateAdsByInventoryReferenceResponseSchema = z.object({
  ads: z.array(adUpdateStatusResponseSchema).optional(),
  errors: z.array(errorSchema).optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  statusCode: z.number().optional(),
});

export const bulkUpdateAdsByInventoryReferenceResponseSchema = z.object({
  responses: z.array(updateAdsByInventoryReferenceResponseSchema).optional(),
});

// ============================================================================
// Keyword Management Schemas
// ============================================================================

export const keywordSchema = z.object({
  adGroupId: z.string().optional(),
  bid: amountSchema.optional(),
  keywordId: z.string().optional(),
  keywordStatus: z.string().optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

export const keywordRequestSchema = z.object({
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

export const createKeywordRequestSchema = z.object({
  adGroupId: z.string(),
  bid: amountSchema.optional(),
  keywordText: z.string(),
  matchType: z.string(),
});

export const keywordResponseSchema = z.object({
  adGroupId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  keywordId: z.string().optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const updateKeywordRequestSchema = z.object({
  bid: amountSchema.optional(),
  keywordStatus: z.string().optional(),
});

export const updateKeywordByKeywordIdRequestSchema = z.object({
  bid: amountSchema.optional(),
  keywordStatus: z.string().optional(),
});

export const updateKeywordResponseSchema = z.object({
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  keywordId: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const keywordPagedCollectionResponseSchema = z.object({
  href: z.string().optional(),
  keywords: z.array(keywordSchema).optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

// Bulk Keyword Operations
export const bulkCreateKeywordRequestSchema = z.object({
  requests: z.array(createKeywordRequestSchema).optional(),
});

export const bulkCreateKeywordResponseSchema = z.object({
  responses: z.array(keywordResponseSchema).optional(),
});

export const bulkUpdateKeywordRequestSchema = z.object({
  requests: z.array(z.object({
    keywordId: z.string(),
    bid: amountSchema.optional(),
    keywordStatus: z.string().optional(),
  })).optional(),
});

export const bulkUpdateKeywordResponseSchema = z.object({
  responses: z.array(updateKeywordResponseSchema).optional(),
});

// ============================================================================
// Negative Keyword Management Schemas
// ============================================================================

export const negativeKeywordSchema = z.object({
  adGroupId: z.string().optional(),
  campaignId: z.string().optional(),
  negativeKeywordId: z.string().optional(),
  negativeKeywordMatchType: z.string().optional(),
  negativeKeywordStatus: z.string().optional(),
  negativeKeywordText: z.string().optional(),
});

export const createNegativeKeywordRequestSchema = z.object({
  adGroupId: z.string().optional(),
  campaignId: z.string().optional(),
  negativeKeywordMatchType: z.string(),
  negativeKeywordText: z.string(),
});

export const negativeKeywordResponseSchema = z.object({
  adGroupId: z.string().optional(),
  campaignId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  negativeKeywordId: z.string().optional(),
  negativeKeywordMatchType: z.string().optional(),
  negativeKeywordText: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const updateNegativeKeywordRequestSchema = z.object({
  negativeKeywordStatus: z.string().optional(),
});

export const updateNegativeKeywordIdRequestSchema = z.object({
  negativeKeywordStatus: z.string().optional(),
});

export const updateNegativeKeywordResponseSchema = z.object({
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  negativeKeywordId: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const negativeKeywordPagedCollectionResponseSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  negativeKeywords: z.array(negativeKeywordSchema).optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

// Bulk Negative Keyword Operations
export const bulkCreateNegativeKeywordRequestSchema = z.object({
  requests: z.array(createNegativeKeywordRequestSchema).optional(),
});

export const bulkCreateNegativeKeywordResponseSchema = z.object({
  responses: z.array(negativeKeywordResponseSchema).optional(),
});

export const bulkUpdateNegativeKeywordRequestSchema = z.object({
  requests: z.array(z.object({
    negativeKeywordId: z.string(),
    negativeKeywordStatus: z.string().optional(),
  })).optional(),
});

export const bulkUpdateNegativeKeywordResponseSchema = z.object({
  responses: z.array(updateNegativeKeywordResponseSchema).optional(),
});

// ============================================================================
// Targeting and Bid Schemas
// ============================================================================

export const targetedBidRequestSchema = z.object({
  bid: amountSchema.optional(),
  listingId: z.string().optional(),
});

export const targetedKeywordRequestSchema = z.object({
  adGroupId: z.string().optional(),
  bid: amountSchema.optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

export const targetedAdsPagedCollectionSchema = z.object({
  ads: z.array(adSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

export const targetedBidsPagedCollectionSchema = z.object({
  bids: z.array(targetedBidRequestSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

export const targetedKeywordsPagedCollectionSchema = z.object({
  href: z.string().optional(),
  keywords: z.array(targetedKeywordRequestSchema).optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

export const targetingItemsSchema = z.object({
  inventoryCriterion: z.array(z.object({
    inventoryItems: z.array(marketingInventoryItemSchema).optional(),
    listingIds: z.array(z.string()).optional(),
  })).optional(),
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

// Quick Setup Schema
export const quickSetupRequestSchema = z.object({
  campaignName: z.string(),
  dailyBudget: amountSchema.optional(),
  endDate: z.string().optional(),
  fundingStrategy: fundingStrategySchema.optional(),
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  startDate: z.string().optional(),
});

// ============================================================================
// Reporting Schemas
// ============================================================================

export const dimensionSchema = z.object({
  dimensionKey: z.string().optional(),
  dimensionValues: z.array(z.string()).optional(),
});

export const dimensionKeyAnnotationSchema = z.object({
  annotationKey: z.string().optional(),
  value: z.string().optional(),
});

export const dimensionMetadataSchema = z.object({
  annotations: z.array(dimensionKeyAnnotationSchema).optional(),
  dataType: z.string().optional(),
  dimensionKey: z.string().optional(),
});

export const metricMetadataSchema = z.object({
  dataType: z.string().optional(),
  metricKey: z.string().optional(),
});

export const reportMetadataSchema = z.object({
  dimensionMetadata: z.array(dimensionMetadataSchema).optional(),
  maxNumberOfDimensionsToRequest: z.number().optional(),
  maxNumberOfMetricsToRequest: z.number().optional(),
  channel: z.string().optional(),
  metricMetadata: z.array(metricMetadataSchema).optional(),
  reportType: z.string().optional(),
});

export const reportMetadatasSchema = z.object({
  reportMetadata: z.array(reportMetadataSchema).optional(),
});

export const createReportTaskSchema = z.object({
  campaignIds: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  dateFrom: z.string(),
  dateTo: z.string(),
  dimensions: z.array(dimensionSchema).optional(),
  fundingModels: z.array(z.string()).optional(),
  inventoryReferences: z.array(inventoryReferenceSchema).optional(),
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  metricKeys: z.array(z.string()).optional(),
  reportFormat: z.string().optional(),
  reportType: z.string(),
});

export const reportTaskSchema = z.object({
  campaignIds: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  dimensions: z.array(dimensionSchema).optional(),
  fundingModels: z.array(z.string()).optional(),
  inventoryReferences: z.array(inventoryReferenceSchema).optional(),
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string().optional(),
  metricKeys: z.array(z.string()).optional(),
  reportExpirationDate: z.string().optional(),
  reportFormat: z.string().optional(),
  reportHref: z.string().optional(),
  reportId: z.string().optional(),
  reportName: z.string().optional(),
  reportTaskCompletionDate: z.string().optional(),
  reportTaskCreationDate: z.string().optional(),
  reportTaskExpectedCompletionDate: z.string().optional(),
  reportTaskId: z.string().optional(),
  reportTaskStatus: z.string().optional(),
  reportTaskStatusMessage: z.string().optional(),
  reportType: z.string().optional(),
});

export const reportTaskPagedCollectionSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  reportTasks: z.array(reportTaskSchema).optional(),
});

export const summaryReportResponseSchema = z.object({
  baseSale: amountSchema.optional(),
  lastUpdated: z.string().optional(),
  percentageSalesLift: z.string().optional(),
  promotionHref: z.string().optional(),
  promotionId: z.string().optional(),
  promotionReportId: z.string().optional(),
  promotionSale: amountSchema.optional(),
  totalDiscount: amountSchema.optional(),
  totalSale: amountSchema.optional(),
});

// ============================================================================
// Item Promotion (Discounts) Schemas
// ============================================================================

export const discountBenefitSchema = z.object({
  amountOffItem: amountSchema.optional(),
  amountOffOrder: amountSchema.optional(),
  percentageOffItem: z.string().optional(),
  percentageOffOrder: z.string().optional(),
});

export const priceRangeSchema = z.object({
  maxPrice: amountSchema.optional(),
  minPrice: amountSchema.optional(),
});

export const discountSpecificationSchema = z.object({
  forEachAmount: amountSchema.optional(),
  forEachQuantity: z.number().optional(),
  minAmount: amountSchema.optional(),
  minQuantity: z.number().optional(),
  numberOfDiscountedItems: z.number().optional(),
});

export const discountRuleSchema = z.object({
  discountBenefit: discountBenefitSchema.optional(),
  discountSpecification: discountSpecificationSchema.optional(),
  ruleOrder: z.number().optional(),
});

export const inventoryCriterionSchema = z.object({
  inventoryCriterionType: z.string().optional(),
  inventoryItems: z.array(marketingInventoryItemSchema).optional(),
  listingIds: z.array(z.string()).optional(),
  ruleCriteria: z.object({
    excludeInventoryItems: z.array(marketingInventoryItemSchema).optional(),
    excludeListingIds: z.array(z.string()).optional(),
    markupInventoryItems: z.array(marketingInventoryItemSchema).optional(),
    markupListingIds: z.array(z.string()).optional(),
    selectionRules: z.array(selectionRuleSchema).optional(),
  }).optional(),
});

export const couponConfigurationSchema = z.object({
  couponCode: z.string().optional(),
  couponType: z.string().optional(),
  maxCouponRedemptionPerUser: z.number().optional(),
});

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

export const selectedInventoryDiscountSchema = z.object({
  discountBenefit: discountBenefitSchema.optional(),
  discountId: z.string().optional(),
  inventoryCriterion: inventoryCriterionSchema.optional(),
  ruleOrder: z.number().optional(),
});

export const itemMarkdownStatusSchema = z.object({
  listingPromotionStatus: z.string().optional(),
  timestamp: z.string().optional(),
});

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

export const promotionsPagedCollectionSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  promotions: z.array(itemPromotionResponseSchema).optional(),
  total: z.number().optional(),
});

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
export const itemBasisSchema = z.object({
  itemIds: z.array(z.string()).optional(),
  priceRange: priceRangeSchema.optional(),
});

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

export const campaignAudienceSchema = z.object({
  audienceType: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
});

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

export const createEmailCampaignRequestSchema = z.object({
  audiences: z.array(campaignAudienceSchema).optional(),
  emailCampaignType: z.string(),
  itemIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  scheduleDate: z.string().optional(),
  scheduleDateType: z.string().optional(),
  subject: z.string().optional(),
});

export const createEmailCampaignResponseSchema = z.object({
  emailCampaignId: z.string().optional(),
  href: z.string().optional(),
});

export const updateEmailCampaignResponseSchema = z.object({
  emailCampaignId: z.string().optional(),
  href: z.string().optional(),
});

export const deleteEmailCampaignResponseSchema = z.object({
  emailCampaignId: z.string().optional(),
});

export const getEmailCampaignResponseSchema = z.object({
  emailCampaign: campaignDTOSchema.optional(),
});

export const getEmailCampaignsResponseSchema = z.object({
  emailCampaigns: z.array(campaignDTOSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

export const getEmailCampaignAudiencesResponseSchema = z.object({
  audiences: z.array(campaignAudienceSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

export const getEmailPreviewResponseSchema = z.object({
  emailPreviewHtml: z.string().optional(),
});

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

// Input Schemas for Find Listing Recommendations
export const findListingRecommendationsInputSchema = z.object({
  filter: z.string().optional()
    .describe('Filter by recommendation types (e.g., recommendationTypes:{AD})'),
  limit: z.string().optional()
    .describe('Maximum number of ads to return per page (default: 10, max: 500)'),
  offset: z.string().optional()
    .describe('Number of ads to skip before returning results (default: 0)'),
  'X-EBAY-C-MARKETPLACE-ID': z.string()
    .describe('eBay marketplace ID where items are listed'),
  body: findListingRecommendationRequestSchema.optional(),
});

// ============================================================================
// Aspect Schema
// ============================================================================

export const aspectSchema = z.object({
  aspectValues: z.array(z.string()).optional(),
  localizedAspectName: z.string().optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getMarketingJsonSchemas() {
  return {
    // Campaign Management
    getCampaignsOutput: zodToJsonSchema(campaignPagedCollectionResponseSchema, 'getCampaignsOutput'),
    getCampaignDetails: zodToJsonSchema(campaignSchema, 'getCampaignDetails'),
    createCampaignInput: zodToJsonSchema(createCampaignRequestSchema, 'createCampaignInput'),
    createCampaignOutput: zodToJsonSchema(z.object({
      campaignId: z.string().optional(),
      warnings: z.array(errorSchema).optional()
    }), 'createCampaignOutput'),
    cloneCampaignInput: zodToJsonSchema(cloneCampaignRequestSchema, 'cloneCampaignInput'),
    updateCampaignInput: zodToJsonSchema(updateCampaignRequestSchema, 'updateCampaignInput'),
    updateCampaignBudgetInput: zodToJsonSchema(updateCampaignBudgetRequestSchema, 'updateCampaignBudgetInput'),
    updateBidPercentageInput: zodToJsonSchema(updateBidPercentageRequestSchema, 'updateBidPercentageInput'),

    // Ad Group Management
    getAdGroupsOutput: zodToJsonSchema(adGroupPagedCollectionResponseSchema, 'getAdGroupsOutput'),
    getAdGroupDetails: zodToJsonSchema(adGroupSchema, 'getAdGroupDetails'),
    createAdGroupInput: zodToJsonSchema(createAdGroupRequestSchema, 'createAdGroupInput'),
    updateAdGroupInput: zodToJsonSchema(updateAdGroupRequestSchema, 'updateAdGroupInput'),

    // Ad Operations
    getAdsOutput: zodToJsonSchema(adPagedCollectionResponseSchema, 'getAdsOutput'),
    getAdDetails: zodToJsonSchema(adSchema, 'getAdDetails'),
    createAdInput: zodToJsonSchema(createAdRequestSchema, 'createAdInput'),
    createAdOutput: zodToJsonSchema(adResponseSchema, 'createAdOutput'),
    createAdsByInventoryReferenceInput: zodToJsonSchema(createAdsByInventoryReferenceRequestSchema, 'createAdsByInventoryReferenceInput'),
    createAdsByInventoryReferenceOutput: zodToJsonSchema(createAdsByInventoryReferenceResponseSchema, 'createAdsByInventoryReferenceOutput'),
    updateAdStatusInput: zodToJsonSchema(updateAdStatusRequestSchema, 'updateAdStatusInput'),
    bulkCreateAdsInput: zodToJsonSchema(bulkCreateAdRequestSchema, 'bulkCreateAdsInput'),
    bulkCreateAdsOutput: zodToJsonSchema(bulkAdResponseSchema, 'bulkCreateAdsOutput'),
    bulkUpdateAdStatusInput: zodToJsonSchema(bulkUpdateAdStatusRequestSchema, 'bulkUpdateAdStatusInput'),
    bulkDeleteAdsInput: zodToJsonSchema(bulkDeleteAdRequestSchema, 'bulkDeleteAdsInput'),

    // Keyword Management
    getKeywordsOutput: zodToJsonSchema(keywordPagedCollectionResponseSchema, 'getKeywordsOutput'),
    getKeywordDetails: zodToJsonSchema(keywordSchema, 'getKeywordDetails'),
    createKeywordInput: zodToJsonSchema(createKeywordRequestSchema, 'createKeywordInput'),
    createKeywordOutput: zodToJsonSchema(keywordResponseSchema, 'createKeywordOutput'),
    updateKeywordInput: zodToJsonSchema(updateKeywordRequestSchema, 'updateKeywordInput'),
    bulkCreateKeywordsInput: zodToJsonSchema(bulkCreateKeywordRequestSchema, 'bulkCreateKeywordsInput'),
    bulkCreateKeywordsOutput: zodToJsonSchema(bulkCreateKeywordResponseSchema, 'bulkCreateKeywordsOutput'),
    bulkUpdateKeywordsInput: zodToJsonSchema(bulkUpdateKeywordRequestSchema, 'bulkUpdateKeywordsInput'),

    // Negative Keyword Management
    getNegativeKeywordsOutput: zodToJsonSchema(negativeKeywordPagedCollectionResponseSchema, 'getNegativeKeywordsOutput'),
    getNegativeKeywordDetails: zodToJsonSchema(negativeKeywordSchema, 'getNegativeKeywordDetails'),
    createNegativeKeywordInput: zodToJsonSchema(createNegativeKeywordRequestSchema, 'createNegativeKeywordInput'),
    createNegativeKeywordOutput: zodToJsonSchema(negativeKeywordResponseSchema, 'createNegativeKeywordOutput'),
    updateNegativeKeywordInput: zodToJsonSchema(updateNegativeKeywordRequestSchema, 'updateNegativeKeywordInput'),
    bulkCreateNegativeKeywordsInput: zodToJsonSchema(bulkCreateNegativeKeywordRequestSchema, 'bulkCreateNegativeKeywordsInput'),
    bulkCreateNegativeKeywordsOutput: zodToJsonSchema(bulkCreateNegativeKeywordResponseSchema, 'bulkCreateNegativeKeywordsOutput'),

    // Suggestions
    suggestBidsOutput: zodToJsonSchema(z.object({
      suggestedBids: z.array(suggestedBidsSchema).optional()
    }), 'suggestBidsOutput'),
    suggestKeywordsOutput: zodToJsonSchema(z.object({
      suggestedKeywords: z.array(suggestedKeywordsSchema).optional()
    }), 'suggestKeywordsOutput'),
    suggestBudgetOutput: zodToJsonSchema(suggestBudgetResponseSchema, 'suggestBudgetOutput'),
    suggestMaxCpcInput: zodToJsonSchema(suggestMaxCpcRequestSchema, 'suggestMaxCpcInput'),
    suggestMaxCpcOutput: zodToJsonSchema(suggestMaxCpcResponseSchema, 'suggestMaxCpcOutput'),

    // Reporting
    getReportMetadataOutput: zodToJsonSchema(reportMetadatasSchema, 'getReportMetadataOutput'),
    createReportTaskInput: zodToJsonSchema(createReportTaskSchema, 'createReportTaskInput'),
    createReportTaskOutput: zodToJsonSchema(z.object({
      reportTaskId: z.string().optional(),
      href: z.string().optional()
    }), 'createReportTaskOutput'),
    getReportTasksOutput: zodToJsonSchema(reportTaskPagedCollectionSchema, 'getReportTasksOutput'),
    getReportTaskDetails: zodToJsonSchema(reportTaskSchema, 'getReportTaskDetails'),
    getSummaryReportOutput: zodToJsonSchema(summaryReportResponseSchema, 'getSummaryReportOutput'),

    // Item Promotions (Discounts)
    getPromotionsOutput: zodToJsonSchema(promotionsPagedCollectionSchema, 'getPromotionsOutput'),
    getPromotionDetails: zodToJsonSchema(itemPromotionResponseSchema, 'getPromotionDetails'),
    createItemPromotionInput: zodToJsonSchema(itemPromotionSchema, 'createItemPromotionInput'),
    createItemPromotionOutput: zodToJsonSchema(z.object({
      promotionId: z.string().optional(),
      href: z.string().optional()
    }), 'createItemPromotionOutput'),
    updateItemPromotionInput: zodToJsonSchema(itemPromotionSchema, 'updateItemPromotionInput'),
    getPromotionListingsOutput: zodToJsonSchema(itemsPagedCollectionSchema, 'getPromotionListingsOutput'),
    getPromotionReportsOutput: zodToJsonSchema(promotionsReportPagedCollectionSchema, 'getPromotionReportsOutput'),
    createItemPriceMarkdownInput: zodToJsonSchema(itemPriceMarkdownSchema, 'createItemPriceMarkdownInput'),

    // Email Campaigns
    createEmailCampaignInput: zodToJsonSchema(createEmailCampaignRequestSchema, 'createEmailCampaignInput'),
    createEmailCampaignOutput: zodToJsonSchema(createEmailCampaignResponseSchema, 'createEmailCampaignOutput'),
    getEmailCampaignsOutput: zodToJsonSchema(getEmailCampaignsResponseSchema, 'getEmailCampaignsOutput'),
    getEmailCampaignDetails: zodToJsonSchema(getEmailCampaignResponseSchema, 'getEmailCampaignDetails'),
    getEmailCampaignAudiencesOutput: zodToJsonSchema(getEmailCampaignAudiencesResponseSchema, 'getEmailCampaignAudiencesOutput'),
    getEmailPreviewOutput: zodToJsonSchema(getEmailPreviewResponseSchema, 'getEmailPreviewOutput'),
    getEmailReportOutput: zodToJsonSchema(getEmailReportResponseSchema, 'getEmailReportOutput'),

    // Recommendations
    findListingRecommendationsInput: zodToJsonSchema(findListingRecommendationsInputSchema, 'findListingRecommendationsInput'),
    findListingRecommendationsOutput: zodToJsonSchema(pagedListingRecommendationCollectionSchema, 'findListingRecommendationsOutput'),
    listingRecommendationDetails: zodToJsonSchema(listingRecommendationSchema, 'listingRecommendationDetails'),

    // Quick Setup
    quickSetupInput: zodToJsonSchema(quickSetupRequestSchema, 'quickSetupInput'),

    // Common schemas
    error: zodToJsonSchema(errorSchema, 'error'),
    amount: zodToJsonSchema(amountSchema, 'amount'),
  };
}
