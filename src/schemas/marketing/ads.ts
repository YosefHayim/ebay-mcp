/**
 * Marketing API schemas — ads slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { errorSchema, amountSchema, alertSchema, marketingInventoryItemSchema } from './common.js';

import { updateBidPercentageRequestSchema } from './campaigns.js';

// ============================================================================
// Ad Group Management Schemas
// ============================================================================

/**
 * Validates the Marketing API ad group model.
 */
export const adGroupSchema = z.object({
  adGroupId: z.string().optional(),
  adGroupStatus: z.string().optional(),
  defaultBid: amountSchema.optional(),
  name: z.string().optional(),
});

/**
 * Validates the Marketing API create ad group request model.
 */
export const createAdGroupRequestSchema = z.object({
  defaultBid: amountSchema.optional(),
  name: z.string(),
});

/**
 * Validates the Marketing API update ad group request model.
 */
export const updateAdGroupRequestSchema = z.object({
  adGroupStatus: z.string().optional(),
  defaultBid: amountSchema.optional(),
  name: z.string().optional(),
});

/**
 * Validates the Marketing API ad group paged collection response payload.
 */
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

/**
 * Validates the Marketing API ad model.
 */
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

/**
 * Validates the Marketing API create ad request model.
 */
export const createAdRequestSchema = z.object({
  adGroupId: z.string().optional(),
  bidPercentage: z.string().optional(),
  listingId: z.string().optional(),
});

/**
 * Validates the Marketing API ads model.
 */
export const adsSchema = z.object({
  ads: z.array(createAdRequestSchema).optional(),
});

/**
 * Validates the Marketing API create ads by inventory reference request model.
 */
export const createAdsByInventoryReferenceRequestSchema = z.object({
  bidPercentage: z.string().optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

/**
 * Validates the Marketing API ad reference model.
 */
export const adReferenceSchema = z.object({
  adId: z.string().optional(),
  href: z.string().optional(),
});

/**
 * Validates the Marketing API ad references model.
 */
export const adReferencesSchema = z.object({
  ads: z.array(adReferenceSchema).optional(),
});

/**
 * Validates the Marketing API ad response payload.
 */
export const adResponseSchema = z.object({
  adGroupId: z.string().optional(),
  adId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  listingId: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Marketing API create ads by inventory reference response payload.
 */
export const createAdsByInventoryReferenceResponseSchema = z.object({
  ads: z.array(adResponseSchema).optional(),
  errors: z.array(errorSchema).optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Marketing API ad paged collection response payload.
 */
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
/**
 * Validates the Marketing API update ad status request model.
 */
export const updateAdStatusRequestSchema = z.object({
  adStatus: z.string(),
});

/**
 * Validates the Marketing API update ad status by listing ID request model.
 */
export const updateAdStatusByListingIdRequestSchema = z.object({
  adStatus: z.string(),
  listingId: z.string(),
});

/**
 * Validates the Marketing API ad update status response payload.
 */
export const adUpdateStatusResponseSchema = z.object({
  adId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Validates the Marketing API ad update status by listing ID response payload.
 */
export const adUpdateStatusByListingIdResponseSchema = z.object({
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  listingId: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Validates the Marketing API ad update response payload.
 */
export const adUpdateResponseSchema = z.object({
  ads: z.array(adUpdateStatusResponseSchema).optional(),
});

// Bulk Ad Operations
/**
 * Validates the Marketing API bulk create ad request model.
 */
export const bulkCreateAdRequestSchema = z.object({
  requests: z.array(createAdRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk ad response payload.
 */
export const bulkAdResponseSchema = z.object({
  responses: z.array(adResponseSchema).optional(),
});

/**
 * Validates the Marketing API bulk create ads by inventory reference request model.
 */
export const bulkCreateAdsByInventoryReferenceRequestSchema = z.object({
  requests: z.array(createAdsByInventoryReferenceRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk create ads by inventory reference response payload.
 */
export const bulkCreateAdsByInventoryReferenceResponseSchema = z.object({
  responses: z.array(createAdsByInventoryReferenceResponseSchema).optional(),
});

/**
 * Validates the Marketing API bulk update ad status request model.
 */
export const bulkUpdateAdStatusRequestSchema = z.object({
  requests: z.array(updateAdStatusRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk update ad status by listing ID request model.
 */
export const bulkUpdateAdStatusByListingIdRequestSchema = z.object({
  requests: z.array(updateAdStatusByListingIdRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk ad update status response payload.
 */
export const bulkAdUpdateStatusResponseSchema = z.object({
  responses: z.array(adUpdateStatusResponseSchema).optional(),
});

/**
 * Validates the Marketing API bulk ad update status by listing ID response payload.
 */
export const bulkAdUpdateStatusByListingIdResponseSchema = z.object({
  responses: z.array(adUpdateStatusByListingIdResponseSchema).optional(),
});

/**
 * Validates the Marketing API bulk ad update response payload.
 */
export const bulkAdUpdateResponseSchema = z.object({
  responses: z.array(adUpdateResponseSchema).optional(),
});

// Delete Ad Schemas
/**
 * Validates the Marketing API ad IDs model.
 */
export const adIdsSchema = z.object({
  adIds: z.array(z.string()).optional(),
});

/**
 * Validates the Marketing API delete ad request model.
 */
export const deleteAdRequestSchema = z.object({
  adId: z.string().optional(),
});

/**
 * Validates the Marketing API delete ad response payload.
 */
export const deleteAdResponseSchema = z.object({
  adId: z.string().optional(),
  errors: z.array(errorSchema).optional(),
  listingId: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Validates the Marketing API bulk delete ad request model.
 */
export const bulkDeleteAdRequestSchema = z.object({
  requests: z.array(deleteAdRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk delete ad response payload.
 */
export const bulkDeleteAdResponseSchema = z.object({
  responses: z.array(deleteAdResponseSchema).optional(),
});

/**
 * Validates the Marketing API delete ads by inventory reference request model.
 */
export const deleteAdsByInventoryReferenceRequestSchema = z.object({
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

/**
 * Validates the Marketing API delete ads by inventory reference response payload.
 */
export const deleteAdsByInventoryReferenceResponseSchema = z.object({
  ads: z.array(deleteAdResponseSchema).optional(),
  errors: z.array(errorSchema).optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Validates the Marketing API bulk delete ads by inventory reference request model.
 */
export const bulkDeleteAdsByInventoryReferenceRequestSchema = z.object({
  requests: z.array(deleteAdsByInventoryReferenceRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk delete ads by inventory reference response payload.
 */
export const bulkDeleteAdsByInventoryReferenceResponseSchema = z.object({
  responses: z.array(deleteAdsByInventoryReferenceResponseSchema).optional(),
});

/**
 * Validates the Marketing API update ads by inventory reference response payload.
 */
export const updateAdsByInventoryReferenceResponseSchema = z.object({
  ads: z.array(adUpdateStatusResponseSchema).optional(),
  errors: z.array(errorSchema).optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Validates the Marketing API bulk update ads by inventory reference response payload.
 */
export const bulkUpdateAdsByInventoryReferenceResponseSchema = z.object({
  responses: z.array(updateAdsByInventoryReferenceResponseSchema).optional(),
});

// ============================================================================
// Keyword Management Schemas
// ============================================================================

/**
 * Validates the Marketing API keyword model.
 */
export const keywordSchema = z.object({
  adGroupId: z.string().optional(),
  bid: amountSchema.optional(),
  keywordId: z.string().optional(),
  keywordStatus: z.string().optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

/**
 * Validates the Marketing API keyword request model.
 */
export const keywordRequestSchema = z.object({
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

/**
 * Validates the Marketing API create keyword request model.
 */
export const createKeywordRequestSchema = z.object({
  adGroupId: z.string(),
  bid: amountSchema.optional(),
  keywordText: z.string(),
  matchType: z.string(),
});

/**
 * Validates the Marketing API keyword response payload.
 */
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

/**
 * Validates the Marketing API update keyword request model.
 */
export const updateKeywordRequestSchema = z.object({
  bid: amountSchema.optional(),
  keywordStatus: z.string().optional(),
});

/**
 * Validates the Marketing API update keyword by keyword ID request model.
 */
export const updateKeywordByKeywordIdRequestSchema = z.object({
  bid: amountSchema.optional(),
  keywordStatus: z.string().optional(),
});

/**
 * Validates the Marketing API update keyword response payload.
 */
export const updateKeywordResponseSchema = z.object({
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  keywordId: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Marketing API keyword paged collection response payload.
 */
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
/**
 * Validates the Marketing API bulk create keyword request model.
 */
export const bulkCreateKeywordRequestSchema = z.object({
  requests: z.array(createKeywordRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk create keyword response payload.
 */
export const bulkCreateKeywordResponseSchema = z.object({
  responses: z.array(keywordResponseSchema).optional(),
});

/**
 * Validates the Marketing API bulk update keyword request model.
 */
export const bulkUpdateKeywordRequestSchema = z.object({
  requests: z
    .array(
      z.object({
        keywordId: z.string(),
        bid: amountSchema.optional(),
        keywordStatus: z.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Validates the Marketing API bulk update keyword response payload.
 */
export const bulkUpdateKeywordResponseSchema = z.object({
  responses: z.array(updateKeywordResponseSchema).optional(),
});

// ============================================================================
// Negative Keyword Management Schemas
// ============================================================================

/**
 * Validates the Marketing API negative keyword model.
 */
export const negativeKeywordSchema = z.object({
  adGroupId: z.string().optional(),
  campaignId: z.string().optional(),
  negativeKeywordId: z.string().optional(),
  negativeKeywordMatchType: z.string().optional(),
  negativeKeywordStatus: z.string().optional(),
  negativeKeywordText: z.string().optional(),
});

/**
 * Validates the Marketing API create negative keyword request model.
 */
export const createNegativeKeywordRequestSchema = z.object({
  adGroupId: z.string().optional(),
  campaignId: z.string().optional(),
  negativeKeywordMatchType: z.string(),
  negativeKeywordText: z.string(),
});

/**
 * Validates the Marketing API negative keyword response payload.
 */
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

/**
 * Validates the Marketing API update negative keyword request model.
 */
export const updateNegativeKeywordRequestSchema = z.object({
  negativeKeywordStatus: z.string().optional(),
});

/**
 * Validates the Marketing API update negative keyword ID request model.
 */
export const updateNegativeKeywordIdRequestSchema = z.object({
  negativeKeywordStatus: z.string().optional(),
});

/**
 * Validates the Marketing API update negative keyword response payload.
 */
export const updateNegativeKeywordResponseSchema = z.object({
  errors: z.array(errorSchema).optional(),
  href: z.string().optional(),
  negativeKeywordId: z.string().optional(),
  statusCode: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

/**
 * Validates the Marketing API negative keyword paged collection response payload.
 */
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
/**
 * Validates the Marketing API bulk create negative keyword request model.
 */
export const bulkCreateNegativeKeywordRequestSchema = z.object({
  requests: z.array(createNegativeKeywordRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk create negative keyword response payload.
 */
export const bulkCreateNegativeKeywordResponseSchema = z.object({
  responses: z.array(negativeKeywordResponseSchema).optional(),
});

/**
 * Validates the Marketing API bulk update negative keyword request model.
 */
export const bulkUpdateNegativeKeywordRequestSchema = z.object({
  requests: z
    .array(
      z.object({
        negativeKeywordId: z.string(),
        negativeKeywordStatus: z.string().optional(),
      }),
    )
    .optional(),
});

/**
 * Validates the Marketing API bulk update negative keyword response payload.
 */
export const bulkUpdateNegativeKeywordResponseSchema = z.object({
  responses: z.array(updateNegativeKeywordResponseSchema).optional(),
});

// ============================================================================
// Targeting and Bid Schemas
// ============================================================================

/**
 * Validates the Marketing API targeted bid request model.
 */
export const targetedBidRequestSchema = z.object({
  bid: amountSchema.optional(),
  listingId: z.string().optional(),
});

/**
 * Validates the Marketing API targeted keyword request model.
 */
export const targetedKeywordRequestSchema = z.object({
  adGroupId: z.string().optional(),
  bid: amountSchema.optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
});

/**
 * Validates the Marketing API targeted ads paged collection model.
 */
export const targetedAdsPagedCollectionSchema = z.object({
  ads: z.array(adSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API targeted bids paged collection model.
 */
export const targetedBidsPagedCollectionSchema = z.object({
  bids: z.array(targetedBidRequestSchema).optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API targeted keywords paged collection model.
 */
export const targetedKeywordsPagedCollectionSchema = z.object({
  href: z.string().optional(),
  keywords: z.array(targetedKeywordRequestSchema).optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
});

/**
 * Validates the Marketing API targeting items model.
 */
export const targetingItemsSchema = z.object({
  inventoryCriterion: z
    .array(
      z.object({
        inventoryItems: z.array(marketingInventoryItemSchema).optional(),
        listingIds: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export const bulkCreateAdsByInventoryReferenceInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkCreateAdsByInventoryReferenceRequestSchema.describe(
    'Bulk create ads by inventory reference request body',
  ),
});

/** Validates the Marketing API bulkCreateAdsByListingId endpoint input. */

export const bulkCreateAdsByListingIdInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkCreateAdRequestSchema.describe('Bulk create ads by listing id request body'),
});

/** Validates the Marketing API bulkDeleteAdsByInventoryReference endpoint input. */

export const bulkDeleteAdsByInventoryReferenceInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkDeleteAdsByInventoryReferenceRequestSchema.describe(
    'Bulk delete ads by inventory reference request body',
  ),
});

/** Validates the Marketing API bulkDeleteAdsByListingId endpoint input. */

export const bulkDeleteAdsByListingIdInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkDeleteAdRequestSchema.describe('Bulk delete ads by listing id request body'),
});

/** Validates the Marketing API bulkUpdateAdsBidByInventoryReference endpoint input. */

export const bulkUpdateAdsBidByInventoryReferenceInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkCreateAdsByInventoryReferenceRequestSchema.describe(
    'Bulk update ads bid by inventory reference request body',
  ),
});

/** Validates the Marketing API bulkUpdateAdsBidByListingId endpoint input. */

export const bulkUpdateAdsBidByListingIdInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkCreateAdRequestSchema.describe('Bulk update ads bid by listing id request body'),
});

/** Validates the Marketing API bulkUpdateAdsStatus endpoint input. */

export const bulkUpdateAdsStatusInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkUpdateAdStatusRequestSchema.describe('Bulk update ads status request body'),
});

/** Validates the Marketing API bulkUpdateAdsStatusByListingId endpoint input. */

export const bulkUpdateAdsStatusByListingIdInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkUpdateAdStatusByListingIdRequestSchema.describe(
    'Bulk update ads status by listing id request body',
  ),
});

/** Validates the Marketing API getAds endpoint input. */

export const getAdsInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  adGroupIds: z.string().describe('adGroupIds optional endpoint parameter').optional(),
  adStatus: z.string().describe('adStatus optional endpoint parameter').optional(),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  listingIds: z.string().describe('listingIds optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
});

/** Validates the Marketing API createAdByListingId endpoint input. */

export const createAdByListingIdInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: createAdRequestSchema.describe('Create ad by listing id request body'),
});

/** Validates the Marketing API createAdsByInventoryReference endpoint input. */

export const createAdsByInventoryReferenceInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: createAdsByInventoryReferenceRequestSchema.describe(
    'Create ads by inventory reference request body',
  ),
});

/** Validates the Marketing API getAd endpoint input. */

export const getAdInputSchema = z.object({
  adId: z.string().describe('adId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API deleteAd endpoint input. */

export const deleteAdInputSchema = z.object({
  adId: z.string().describe('adId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API deleteAdsByInventoryReference endpoint input. */

export const deleteAdsByInventoryReferenceInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: deleteAdsByInventoryReferenceRequestSchema.describe(
    'Delete ads by inventory reference request body',
  ),
});

/** Validates the Marketing API getAdsByInventoryReference endpoint input. */

export const getAdsByInventoryReferenceInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  inventoryReferenceId: z.string().describe('inventoryReferenceId required endpoint parameter'),
  inventoryReferenceType: z.string().describe('inventoryReferenceType required endpoint parameter'),
});

/** Validates the Marketing API updateBid endpoint input. */

export const updateBidInputSchema = z.object({
  adId: z.string().describe('adId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: updateBidPercentageRequestSchema.describe('Update bid request body'),
});

/** Validates the Marketing API getAdGroups endpoint input. */

export const getAdGroupsInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  adGroupStatus: z.string().describe('adGroupStatus optional endpoint parameter').optional(),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
});

/** Validates the Marketing API createAdGroup endpoint input. */

export const createAdGroupInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: createAdGroupRequestSchema.describe('Create ad group request body'),
});

/** Validates the Marketing API getAdGroup endpoint input. */

export const getAdGroupInputSchema = z.object({
  adGroupId: z.string().describe('adGroupId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
});

/** Validates the Marketing API updateAdGroup endpoint input. */

export const updateAdGroupInputSchema = z.object({
  adGroupId: z.string().describe('adGroupId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: updateAdGroupRequestSchema.describe('Update ad group request body'),
});

/** Validates the Marketing API suggestBids endpoint input. */

export const suggestBidsInputSchema = z.object({
  adGroupId: z.string().describe('adGroupId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: targetedBidRequestSchema.describe('Suggest bids request body'),
});

/** Validates the Marketing API suggestKeywords endpoint input. */

export const suggestKeywordsInputSchema = z.object({
  adGroupId: z.string().describe('adGroupId required endpoint parameter'),
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: targetedKeywordRequestSchema.describe('Suggest keywords request body'),
});

/** Validates the Marketing API cloneCampaign endpoint input. */

export const bulkCreateKeywordInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkCreateKeywordRequestSchema.describe('Bulk create keyword request body'),
});

/** Validates the Marketing API bulkUpdateKeyword endpoint input. */

export const bulkUpdateKeywordInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: bulkUpdateKeywordRequestSchema.describe('Bulk update keyword request body'),
});

/** Validates the Marketing API getKeywords endpoint input. */

export const getKeywordsInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  adGroupIds: z.string().describe('adGroupIds optional endpoint parameter').optional(),
  keywordStatus: z.string().describe('keywordStatus optional endpoint parameter').optional(),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
});

/** Validates the Marketing API createKeyword endpoint input. */

export const createKeywordInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  request: createKeywordRequestSchema.describe('Create keyword request body'),
});

/** Validates the Marketing API getKeyword endpoint input. */

export const getKeywordInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  keywordId: z.string().describe('keywordId required endpoint parameter'),
});

/** Validates the Marketing API updateKeyword endpoint input. */

export const updateKeywordInputSchema = z.object({
  campaignId: z.string().describe('campaignId required endpoint parameter'),
  keywordId: z.string().describe('keywordId required endpoint parameter'),
  request: updateKeywordRequestSchema.describe('Update keyword request body'),
});

/** Validates the Marketing API bulkCreateNegativeKeyword endpoint input. */

export const bulkCreateNegativeKeywordInputSchema = z.object({
  request: bulkCreateNegativeKeywordRequestSchema.describe(
    'Bulk create negative keyword request body',
  ),
});

/** Validates the Marketing API bulkUpdateNegativeKeyword endpoint input. */

export const bulkUpdateNegativeKeywordInputSchema = z.object({
  request: bulkUpdateNegativeKeywordRequestSchema.describe(
    'Bulk update negative keyword request body',
  ),
});

/** Validates the Marketing API getNegativeKeywords endpoint input. */

export const getNegativeKeywordsInputSchema = z.object({
  adGroupIds: z.string().describe('adGroupIds optional endpoint parameter').optional(),
  campaignIds: z.string().describe('campaignIds optional endpoint parameter').optional(),
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  negativeKeywordStatus: z
    .string()
    .describe('negativeKeywordStatus optional endpoint parameter')
    .optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
});

/** Validates the Marketing API createNegativeKeyword endpoint input. */

export const createNegativeKeywordInputSchema = z.object({
  request: createNegativeKeywordRequestSchema.describe('Create negative keyword request body'),
});

/** Validates the Marketing API getNegativeKeyword endpoint input. */

export const getNegativeKeywordInputSchema = z.object({
  negativeKeywordId: z.string().describe('negativeKeywordId required endpoint parameter'),
});

/** Validates the Marketing API updateNegativeKeyword endpoint input. */

export const updateNegativeKeywordInputSchema = z.object({
  negativeKeywordId: z.string().describe('negativeKeywordId required endpoint parameter'),
  request: updateNegativeKeywordRequestSchema.describe('Update negative keyword request body'),
});

/** Validates the Marketing API getReport endpoint input. */
