/**
 * Marketing API schemas — ads slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { amountSchema } from './marketing-common-schemas.js';

import { updateBidPercentageRequestSchema } from './campaigns-schemas.js';

/**
 * Validates the Marketing API create ad group request model.
 */
const createAdGroupRequestSchema = z.object({
  defaultBid: amountSchema.optional(),
  name: z.string(),
});

/**
 * Validates the Marketing API update ad group request model.
 */
const updateAdGroupRequestSchema = z.object({
  adGroupStatus: z.string().optional(),
  defaultBid: amountSchema.optional(),
  name: z.string().optional(),
});

/**
 * Validates the Marketing API create ad request model.
 */
const createAdRequestSchema = z.object({
  adGroupId: z.string().optional(),
  bidPercentage: z.string().optional(),
  listingId: z.string().optional(),
});

/**
 * Validates the Marketing API create ads by inventory reference request model.
 */
const createAdsByInventoryReferenceRequestSchema = z.object({
  bidPercentage: z.string().optional(),
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

// Ad Update Schemas
/**
 * Validates the Marketing API update ad status request model.
 */
const updateAdStatusRequestSchema = z.object({
  adStatus: z.string(),
});

/**
 * Validates the Marketing API update ad status by listing ID request model.
 */
const updateAdStatusByListingIdRequestSchema = z.object({
  adStatus: z.string(),
  listingId: z.string(),
});

// Bulk Ad Operations
/**
 * Validates the Marketing API bulk create ad request model.
 */
const bulkCreateAdRequestSchema = z.object({
  requests: z.array(createAdRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk create ads by inventory reference request model.
 */
const bulkCreateAdsByInventoryReferenceRequestSchema = z.object({
  requests: z.array(createAdsByInventoryReferenceRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk update ad status request model.
 */
const bulkUpdateAdStatusRequestSchema = z.object({
  requests: z.array(updateAdStatusRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk update ad status by listing ID request model.
 */
const bulkUpdateAdStatusByListingIdRequestSchema = z.object({
  requests: z.array(updateAdStatusByListingIdRequestSchema).optional(),
});

/**
 * Validates the Marketing API delete ad request model.
 */
const deleteAdRequestSchema = z.object({
  adId: z.string().optional(),
});

/**
 * Validates the Marketing API bulk delete ad request model.
 */
const bulkDeleteAdRequestSchema = z.object({
  requests: z.array(deleteAdRequestSchema).optional(),
});

/**
 * Validates the Marketing API delete ads by inventory reference request model.
 */
const deleteAdsByInventoryReferenceRequestSchema = z.object({
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

/**
 * Validates the Marketing API bulk delete ads by inventory reference request model.
 */
const bulkDeleteAdsByInventoryReferenceRequestSchema = z.object({
  requests: z.array(deleteAdsByInventoryReferenceRequestSchema).optional(),
});

/**
 * Validates the Marketing API create keyword request model.
 */
const createKeywordRequestSchema = z.object({
  adGroupId: z.string(),
  bid: amountSchema.optional(),
  keywordText: z.string(),
  matchType: z.string(),
});

/**
 * Validates the Marketing API update keyword request model.
 */
const updateKeywordRequestSchema = z.object({
  bid: amountSchema.optional(),
  keywordStatus: z.string().optional(),
});

// Bulk Keyword Operations
/**
 * Validates the Marketing API bulk create keyword request model.
 */
const bulkCreateKeywordRequestSchema = z.object({
  requests: z.array(createKeywordRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk update keyword request model.
 */
const bulkUpdateKeywordRequestSchema = z.object({
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
 * Validates the Marketing API create negative keyword request model.
 */
const createNegativeKeywordRequestSchema = z.object({
  adGroupId: z.string().optional(),
  campaignId: z.string().optional(),
  negativeKeywordMatchType: z.string(),
  negativeKeywordText: z.string(),
});

/**
 * Validates the Marketing API update negative keyword request model.
 */
const updateNegativeKeywordRequestSchema = z.object({
  negativeKeywordStatus: z.string().optional(),
});

// Bulk Negative Keyword Operations
/**
 * Validates the Marketing API bulk create negative keyword request model.
 */
const bulkCreateNegativeKeywordRequestSchema = z.object({
  requests: z.array(createNegativeKeywordRequestSchema).optional(),
});

/**
 * Validates the Marketing API bulk update negative keyword request model.
 */
const bulkUpdateNegativeKeywordRequestSchema = z.object({
  requests: z
    .array(
      z.object({
        negativeKeywordId: z.string(),
        negativeKeywordStatus: z.string().optional(),
      }),
    )
    .optional(),
});

// ============================================================================
// Targeting and Bid Schemas
// ============================================================================

/**
 * Validates the Marketing API targeted bid request model.
 */
const targetedBidRequestSchema = z.object({
  bid: amountSchema.optional(),
  listingId: z.string().optional(),
});

/**
 * Validates the Marketing API targeted keyword request model.
 */
const targetedKeywordRequestSchema = z.object({
  adGroupId: z.string().optional(),
  bid: amountSchema.optional(),
  keywordText: z.string().optional(),
  matchType: z.string().optional(),
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
