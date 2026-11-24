import { z } from "zod";
import { updateBidPercentageRequestSchema } from "./campaignsSchemas.js";
import {
	alertSchema,
	amountSchema,
	errorSchema,
	marketingInventoryItemSchema,
} from "./marketingCommonSchemas.js";

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
	requests: z
		.array(
			z.object({
				negativeKeywordId: z.string(),
				negativeKeywordStatus: z.string().optional(),
			}),
		)
		.optional(),
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
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkCreateAdsByInventoryReferenceRequestSchema.describe(
		"Bulk create ads by inventory reference request body",
	),
});

export const bulkCreateAdsByListingIdInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkCreateAdRequestSchema.describe(
		"Bulk create ads by listing id request body",
	),
});

export const bulkDeleteAdsByInventoryReferenceInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkDeleteAdsByInventoryReferenceRequestSchema.describe(
		"Bulk delete ads by inventory reference request body",
	),
});

export const bulkDeleteAdsByListingIdInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkDeleteAdRequestSchema.describe(
		"Bulk delete ads by listing id request body",
	),
});

export const bulkUpdateAdsBidByInventoryReferenceInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkCreateAdsByInventoryReferenceRequestSchema.describe(
		"Bulk update ads bid by inventory reference request body",
	),
});

export const bulkUpdateAdsBidByListingIdInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkCreateAdRequestSchema.describe(
		"Bulk update ads bid by listing id request body",
	),
});

export const bulkUpdateAdsStatusInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkUpdateAdStatusRequestSchema.describe(
		"Bulk update ads status request body",
	),
});

export const bulkUpdateAdsStatusByListingIdInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkUpdateAdStatusByListingIdRequestSchema.describe(
		"Bulk update ads status by listing id request body",
	),
});

export const getAdsInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	adGroupIds: z
		.string()
		.describe("adGroupIds optional endpoint parameter")
		.optional(),
	adStatus: z
		.string()
		.describe("adStatus optional endpoint parameter")
		.optional(),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	listingIds: z
		.string()
		.describe("listingIds optional endpoint parameter")
		.optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
});

export const createAdByListingIdInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: createAdRequestSchema.describe(
		"Create ad by listing id request body",
	),
});

export const createAdsByInventoryReferenceInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: createAdsByInventoryReferenceRequestSchema.describe(
		"Create ads by inventory reference request body",
	),
});

export const getAdInputSchema = z.object({
	adId: z.string().describe("adId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const deleteAdInputSchema = z.object({
	adId: z.string().describe("adId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const deleteAdsByInventoryReferenceInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: deleteAdsByInventoryReferenceRequestSchema.describe(
		"Delete ads by inventory reference request body",
	),
});

export const getAdsByInventoryReferenceInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	inventoryReferenceId: z
		.string()
		.describe("inventoryReferenceId required endpoint parameter"),
	inventoryReferenceType: z
		.string()
		.describe("inventoryReferenceType required endpoint parameter"),
});

export const updateBidInputSchema = z.object({
	adId: z.string().describe("adId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: updateBidPercentageRequestSchema.describe("Update bid request body"),
});

export const getAdGroupsInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	adGroupStatus: z
		.string()
		.describe("adGroupStatus optional endpoint parameter")
		.optional(),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
});

export const createAdGroupInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: createAdGroupRequestSchema.describe("Create ad group request body"),
});

export const getAdGroupInputSchema = z.object({
	adGroupId: z.string().describe("adGroupId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
});

export const updateAdGroupInputSchema = z.object({
	adGroupId: z.string().describe("adGroupId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: updateAdGroupRequestSchema.describe("Update ad group request body"),
});

export const suggestBidsInputSchema = z.object({
	adGroupId: z.string().describe("adGroupId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: targetedBidRequestSchema.describe("Suggest bids request body"),
});

export const suggestKeywordsInputSchema = z.object({
	adGroupId: z.string().describe("adGroupId required endpoint parameter"),
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: targetedKeywordRequestSchema.describe(
		"Suggest keywords request body",
	),
});

export const bulkCreateKeywordInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkCreateKeywordRequestSchema.describe(
		"Bulk create keyword request body",
	),
});

export const bulkUpdateKeywordInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: bulkUpdateKeywordRequestSchema.describe(
		"Bulk update keyword request body",
	),
});

export const getKeywordsInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	adGroupIds: z
		.string()
		.describe("adGroupIds optional endpoint parameter")
		.optional(),
	keywordStatus: z
		.string()
		.describe("keywordStatus optional endpoint parameter")
		.optional(),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
});

export const createKeywordInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	request: createKeywordRequestSchema.describe("Create keyword request body"),
});

export const getKeywordInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	keywordId: z.string().describe("keywordId required endpoint parameter"),
});

export const updateKeywordInputSchema = z.object({
	campaignId: z.string().describe("campaignId required endpoint parameter"),
	keywordId: z.string().describe("keywordId required endpoint parameter"),
	request: updateKeywordRequestSchema.describe("Update keyword request body"),
});

export const bulkCreateNegativeKeywordInputSchema = z.object({
	request: bulkCreateNegativeKeywordRequestSchema.describe(
		"Bulk create negative keyword request body",
	),
});

export const bulkUpdateNegativeKeywordInputSchema = z.object({
	request: bulkUpdateNegativeKeywordRequestSchema.describe(
		"Bulk update negative keyword request body",
	),
});

export const getNegativeKeywordsInputSchema = z.object({
	adGroupIds: z
		.string()
		.describe("adGroupIds optional endpoint parameter")
		.optional(),
	campaignIds: z
		.string()
		.describe("campaignIds optional endpoint parameter")
		.optional(),
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	negativeKeywordStatus: z
		.string()
		.describe("negativeKeywordStatus optional endpoint parameter")
		.optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
});

export const createNegativeKeywordInputSchema = z.object({
	request: createNegativeKeywordRequestSchema.describe(
		"Create negative keyword request body",
	),
});

export const getNegativeKeywordInputSchema = z.object({
	negativeKeywordId: z
		.string()
		.describe("negativeKeywordId required endpoint parameter"),
});

export const updateNegativeKeywordInputSchema = z.object({
	negativeKeywordId: z
		.string()
		.describe("negativeKeywordId required endpoint parameter"),
	request: updateNegativeKeywordRequestSchema.describe(
		"Update negative keyword request body",
	),
});
