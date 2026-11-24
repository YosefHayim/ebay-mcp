import * as marketingSchemas from "@/ebay-apis/marketing/marketingSchemas.js";
import { defined } from "@/shared/objects.js";
import { defineTool } from "@/tool-registry/defineTool.js";
import type { ToolEntry } from "@/tool-registry/registry.js";
import type { OutputArgs } from "@/tool-registry/types.js";

const emptyResponseSchema: OutputArgs = {
	type: "object",
	properties: {},
	description: "Empty response on successful operation",
};

function isMissing<Field>(
	field: Field | null | undefined,
): field is null | undefined {
	return field == null;
}

function omitUndefinedListingIds(
	requestBody:
		| {
				readonly listingIds?: string[] | undefined;
		  }
		| undefined,
) {
	if (isMissing(requestBody)) {
		return undefined;
	}

	if (isMissing(requestBody.listingIds)) {
		return undefined;
	}

	return defined({ listingIds: requestBody.listingIds });
}

/** Marketing API tools for campaigns, ads, promotions, reports, and email campaigns. */
export const marketingEntries: ToolEntry[] = [
	defineTool({
		name: "ebay_bulk_create_ads_by_inventory_reference",
		description:
			"Bulk create ads by inventory reference through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.bulkCreateAdsByInventoryReferenceInputSchema.shape,
		outputSchema:
			marketingSchemas.bulkCreateAdsByInventoryReferenceResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) =>
			api.marketing.bulkCreateAdsByInventoryReference(args),
	}),
	defineTool({
		name: "ebay_bulk_create_ads_by_listing_id",
		description:
			"Bulk create ads by listing id through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkCreateAdsByListingIdInputSchema.shape,
		outputSchema: marketingSchemas.bulkAdResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkCreateAdsByListingId(args),
	}),
	defineTool({
		name: "ebay_bulk_delete_ads_by_inventory_reference",
		description:
			"Bulk delete ads by inventory reference through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.bulkDeleteAdsByInventoryReferenceInputSchema.shape,
		outputSchema:
			marketingSchemas.bulkDeleteAdsByInventoryReferenceResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) =>
			api.marketing.bulkDeleteAdsByInventoryReference(args),
	}),
	defineTool({
		name: "ebay_bulk_delete_ads_by_listing_id",
		description:
			"Bulk delete ads by listing id through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkDeleteAdsByListingIdInputSchema.shape,
		outputSchema: marketingSchemas.bulkDeleteAdResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkDeleteAdsByListingId(args),
	}),
	defineTool({
		name: "ebay_bulk_update_ads_bid_by_inventory_reference",
		description:
			"Bulk update ads bid by inventory reference through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.bulkUpdateAdsBidByInventoryReferenceInputSchema.shape,
		outputSchema:
			marketingSchemas.bulkUpdateAdsByInventoryReferenceResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) =>
			api.marketing.bulkUpdateAdsBidByInventoryReference(args),
	}),
	defineTool({
		name: "ebay_bulk_update_ads_bid_by_listing_id",
		description:
			"Bulk update ads bid by listing id through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkUpdateAdsBidByListingIdInputSchema.shape,
		outputSchema: marketingSchemas.bulkAdUpdateResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkUpdateAdsBidByListingId(args),
	}),
	defineTool({
		name: "ebay_bulk_update_ads_status",
		description: "Bulk update ads status through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkUpdateAdsStatusInputSchema.shape,
		outputSchema: marketingSchemas.bulkAdUpdateStatusResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkUpdateAdsStatus(args),
	}),
	defineTool({
		name: "ebay_bulk_update_ads_status_by_listing_id",
		description:
			"Bulk update ads status by listing id through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.bulkUpdateAdsStatusByListingIdInputSchema.shape,
		outputSchema: marketingSchemas.bulkAdUpdateStatusByListingIdResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkUpdateAdsStatusByListingId(args),
	}),
	defineTool({
		name: "ebay_get_ads",
		description: "Get ads through the eBay Marketing API.",
		inputSchema: marketingSchemas.getAdsInputSchema.shape,
		outputSchema: marketingSchemas.adPagedCollectionResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getAds(args),
	}),
	defineTool({
		name: "ebay_create_ad_by_listing_id",
		description: "Create ad by listing id through the eBay Marketing API.",
		inputSchema: marketingSchemas.createAdByListingIdInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createAdByListingId(args),
	}),
	defineTool({
		name: "ebay_create_ads_by_inventory_reference",
		description:
			"Create ads by inventory reference through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.createAdsByInventoryReferenceInputSchema.shape,
		outputSchema: marketingSchemas.adReferencesSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createAdsByInventoryReference(args),
	}),
	defineTool({
		name: "ebay_get_ad",
		description: "Get ad through the eBay Marketing API.",
		inputSchema: marketingSchemas.getAdInputSchema.shape,
		outputSchema: marketingSchemas.adSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getAd(args),
	}),
	defineTool({
		name: "ebay_delete_ad",
		description: "Delete ad through the eBay Marketing API.",
		inputSchema: marketingSchemas.deleteAdInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, destructiveHint: true },
		handler: (api, args) => api.marketing.deleteAd(args),
	}),
	defineTool({
		name: "ebay_delete_ads_by_inventory_reference",
		description:
			"Delete ads by inventory reference through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.deleteAdsByInventoryReferenceInputSchema.shape,
		outputSchema: marketingSchemas.adIdsSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.deleteAdsByInventoryReference(args),
	}),
	defineTool({
		name: "ebay_get_ads_by_inventory_reference",
		description:
			"Get ads by inventory reference through the eBay Marketing API.",
		inputSchema: marketingSchemas.getAdsByInventoryReferenceInputSchema.shape,
		outputSchema: marketingSchemas.adsSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getAdsByInventoryReference(args),
	}),
	defineTool({
		name: "ebay_update_bid",
		description: "Update bid through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateBidInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.updateBid(args),
	}),
	defineTool({
		name: "ebay_get_ad_groups",
		description: "Get ad groups through the eBay Marketing API.",
		inputSchema: marketingSchemas.getAdGroupsInputSchema.shape,
		outputSchema: marketingSchemas.adGroupPagedCollectionResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getAdGroups(args),
	}),
	defineTool({
		name: "ebay_create_ad_group",
		description: "Create ad group through the eBay Marketing API.",
		inputSchema: marketingSchemas.createAdGroupInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createAdGroup(args),
	}),
	defineTool({
		name: "ebay_get_ad_group",
		description: "Get ad group through the eBay Marketing API.",
		inputSchema: marketingSchemas.getAdGroupInputSchema.shape,
		outputSchema: marketingSchemas.adGroupSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getAdGroup(args),
	}),
	defineTool({
		name: "ebay_update_ad_group",
		description: "Update ad group through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateAdGroupInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, idempotentHint: true },
		handler: (api, args) => api.marketing.updateAdGroup(args),
	}),
	defineTool({
		name: "ebay_suggest_bids",
		description: "Suggest bids through the eBay Marketing API.",
		inputSchema: marketingSchemas.suggestBidsInputSchema.shape,
		outputSchema: marketingSchemas.targetedBidsPagedCollectionSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.suggestBids(args),
	}),
	defineTool({
		name: "ebay_suggest_keywords",
		description: "Suggest keywords through the eBay Marketing API.",
		inputSchema: marketingSchemas.suggestKeywordsInputSchema.shape,
		outputSchema: marketingSchemas.targetedKeywordsPagedCollectionSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.suggestKeywords(args),
	}),
	defineTool({
		name: "ebay_clone_campaign",
		description: "Clone campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.cloneCampaignInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.cloneCampaign(args),
	}),
	defineTool({
		name: "ebay_get_campaigns",
		description: "Get campaigns through the eBay Marketing API.",
		inputSchema: marketingSchemas.getCampaignsInputSchema.shape,
		outputSchema: marketingSchemas.campaignPagedCollectionResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getCampaigns(args),
	}),
	defineTool({
		name: "ebay_create_campaign",
		description: "Create campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.createCampaignInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createCampaign(args),
	}),
	defineTool({
		name: "ebay_get_campaign",
		description: "Get campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.getCampaignInputSchema.shape,
		outputSchema: marketingSchemas.campaignSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getCampaign(args),
	}),
	defineTool({
		name: "ebay_delete_campaign",
		description: "Delete campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.deleteCampaignInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, destructiveHint: true },
		handler: (api, args) => api.marketing.deleteCampaign(args),
	}),
	defineTool({
		name: "ebay_end_campaign",
		description: "End campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.endCampaignInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.endCampaign(args),
	}),
	defineTool({
		name: "ebay_find_campaign_by_ad_reference",
		description:
			"Find campaign by ad reference through the eBay Marketing API.",
		inputSchema: marketingSchemas.findCampaignByAdReferenceInputSchema.shape,
		outputSchema: marketingSchemas.campaignsSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.findCampaignByAdReference(args),
	}),
	defineTool({
		name: "ebay_get_campaign_by_name",
		description: "Get campaign by name through the eBay Marketing API.",
		inputSchema: marketingSchemas.getCampaignByNameInputSchema.shape,
		outputSchema: marketingSchemas.campaignSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getCampaignByName(args),
	}),
	defineTool({
		name: "ebay_pause_campaign",
		description: "Pause campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.pauseCampaignInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.pauseCampaign(args),
	}),
	defineTool({
		name: "ebay_resume_campaign",
		description: "Resume campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.resumeCampaignInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.resumeCampaign(args),
	}),
	defineTool({
		name: "ebay_suggest_budget",
		description: "Suggest budget through the eBay Marketing API.",
		inputSchema: marketingSchemas.suggestBudgetInputSchema.shape,
		outputSchema: marketingSchemas.suggestBudgetResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.suggestBudget(args),
	}),
	defineTool({
		name: "ebay_suggest_items",
		description: "Suggest items through the eBay Marketing API.",
		inputSchema: marketingSchemas.suggestItemsInputSchema.shape,
		outputSchema: marketingSchemas.targetedAdsPagedCollectionSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.suggestItems(args),
	}),
	defineTool({
		name: "ebay_suggest_max_cpc",
		description: "Suggest max cpc through the eBay Marketing API.",
		inputSchema: marketingSchemas.suggestMaxCpcInputSchema.shape,
		outputSchema: marketingSchemas.suggestMaxCpcResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.suggestMaxCpc(args),
	}),
	defineTool({
		name: "ebay_update_ad_rate_strategy",
		description: "Update ad rate strategy through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateAdRateStrategyInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.updateAdRateStrategy(args),
	}),
	defineTool({
		name: "ebay_update_bidding_strategy",
		description: "Update bidding strategy through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateBiddingStrategyInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.updateBiddingStrategy(args),
	}),
	defineTool({
		name: "ebay_update_campaign_budget",
		description: "Update campaign budget through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateCampaignBudgetInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.updateCampaignBudget(args),
	}),
	defineTool({
		name: "ebay_update_campaign_identification",
		description:
			"Update campaign identification through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateCampaignIdentificationInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.updateCampaignIdentification(args),
	}),
	defineTool({
		name: "ebay_bulk_create_keyword",
		description: "Bulk create keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkCreateKeywordInputSchema.shape,
		outputSchema: marketingSchemas.bulkCreateKeywordResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkCreateKeyword(args),
	}),
	defineTool({
		name: "ebay_bulk_update_keyword",
		description: "Bulk update keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkUpdateKeywordInputSchema.shape,
		outputSchema: marketingSchemas.bulkUpdateKeywordResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkUpdateKeyword(args),
	}),
	defineTool({
		name: "ebay_get_keywords",
		description: "Get keywords through the eBay Marketing API.",
		inputSchema: marketingSchemas.getKeywordsInputSchema.shape,
		outputSchema: marketingSchemas.keywordPagedCollectionResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getKeywords(args),
	}),
	defineTool({
		name: "ebay_create_keyword",
		description: "Create keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.createKeywordInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createKeyword(args),
	}),
	defineTool({
		name: "ebay_get_keyword",
		description: "Get keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.getKeywordInputSchema.shape,
		outputSchema: marketingSchemas.keywordSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getKeyword(args),
	}),
	defineTool({
		name: "ebay_update_keyword",
		description: "Update keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateKeywordInputSchema.shape,
		outputSchema: marketingSchemas.updateKeywordResponseSchema,
		annotations: { readOnlyHint: false, idempotentHint: true },
		handler: (api, args) => api.marketing.updateKeyword(args),
	}),
	defineTool({
		name: "ebay_bulk_create_negative_keyword",
		description: "Bulk create negative keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkCreateNegativeKeywordInputSchema.shape,
		outputSchema: marketingSchemas.bulkCreateNegativeKeywordResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkCreateNegativeKeyword(args),
	}),
	defineTool({
		name: "ebay_bulk_update_negative_keyword",
		description: "Bulk update negative keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.bulkUpdateNegativeKeywordInputSchema.shape,
		outputSchema: marketingSchemas.bulkUpdateNegativeKeywordResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.bulkUpdateNegativeKeyword(args),
	}),
	defineTool({
		name: "ebay_get_negative_keywords",
		description: "Get negative keywords through the eBay Marketing API.",
		inputSchema: marketingSchemas.getNegativeKeywordsInputSchema.shape,
		outputSchema: marketingSchemas.negativeKeywordPagedCollectionResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getNegativeKeywords(args),
	}),
	defineTool({
		name: "ebay_create_negative_keyword",
		description: "Create negative keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.createNegativeKeywordInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createNegativeKeyword(args),
	}),
	defineTool({
		name: "ebay_get_negative_keyword",
		description: "Get negative keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.getNegativeKeywordInputSchema.shape,
		outputSchema: marketingSchemas.negativeKeywordSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getNegativeKeyword(args),
	}),
	defineTool({
		name: "ebay_update_negative_keyword",
		description: "Update negative keyword through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateNegativeKeywordInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, idempotentHint: true },
		handler: (api, args) => api.marketing.updateNegativeKeyword(args),
	}),
	defineTool({
		name: "ebay_get_report",
		description: "Get report through the eBay Marketing API.",
		inputSchema: marketingSchemas.getReportInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getReport(args),
	}),
	defineTool({
		name: "ebay_get_report_metadata",
		description: "Get report metadata through the eBay Marketing API.",
		inputSchema: marketingSchemas.getReportMetadataInputSchema.shape,
		outputSchema: marketingSchemas.reportMetadatasSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getReportMetadata(args),
	}),
	defineTool({
		name: "ebay_get_report_metadata_for_report_type",
		description:
			"Get report metadata for report type through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.getReportMetadataForReportTypeInputSchema.shape,
		outputSchema: marketingSchemas.reportMetadataSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getReportMetadataForReportType(args),
	}),
	defineTool({
		name: "ebay_get_report_tasks",
		description: "Get report tasks through the eBay Marketing API.",
		inputSchema: marketingSchemas.getReportTasksInputSchema.shape,
		outputSchema: marketingSchemas.reportTaskPagedCollectionSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getReportTasks(args),
	}),
	defineTool({
		name: "ebay_create_report_task",
		description: "Create report task through the eBay Marketing API.",
		inputSchema: marketingSchemas.createReportTaskInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createReportTask(args),
	}),
	defineTool({
		name: "ebay_get_report_task",
		description: "Get report task through the eBay Marketing API.",
		inputSchema: marketingSchemas.getReportTaskInputSchema.shape,
		outputSchema: marketingSchemas.reportTaskSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getReportTask(args),
	}),
	defineTool({
		name: "ebay_delete_report_task",
		description: "Delete report task through the eBay Marketing API.",
		inputSchema: marketingSchemas.deleteReportTaskInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, destructiveHint: true },
		handler: (api, args) => api.marketing.deleteReportTask(args),
	}),
	defineTool({
		name: "ebay_create_item_price_markdown_promotion",
		description:
			"Create item price markdown promotion through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.createItemPriceMarkdownPromotionInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) =>
			api.marketing.createItemPriceMarkdownPromotion(args),
	}),
	defineTool({
		name: "ebay_get_item_price_markdown_promotion",
		description:
			"Get item price markdown promotion through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.getItemPriceMarkdownPromotionInputSchema.shape,
		outputSchema: marketingSchemas.itemPriceMarkdownSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getItemPriceMarkdownPromotion(args),
	}),
	defineTool({
		name: "ebay_update_item_price_markdown_promotion",
		description:
			"Update item price markdown promotion through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.updateItemPriceMarkdownPromotionInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, idempotentHint: true },
		handler: (api, args) =>
			api.marketing.updateItemPriceMarkdownPromotion(args),
	}),
	defineTool({
		name: "ebay_delete_item_price_markdown_promotion",
		description:
			"Delete item price markdown promotion through the eBay Marketing API.",
		inputSchema:
			marketingSchemas.deleteItemPriceMarkdownPromotionInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, destructiveHint: true },
		handler: (api, args) =>
			api.marketing.deleteItemPriceMarkdownPromotion(args),
	}),
	defineTool({
		name: "ebay_create_item_promotion",
		description: "Create item promotion through the eBay Marketing API.",
		inputSchema: marketingSchemas.createItemPromotionInputSchema.shape,
		outputSchema: marketingSchemas.baseResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createItemPromotion(args),
	}),
	defineTool({
		name: "ebay_get_item_promotion",
		description: "Get item promotion through the eBay Marketing API.",
		inputSchema: marketingSchemas.getItemPromotionInputSchema.shape,
		outputSchema: marketingSchemas.itemPromotionResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getItemPromotion(args),
	}),
	defineTool({
		name: "ebay_update_item_promotion",
		description: "Update item promotion through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateItemPromotionInputSchema.shape,
		outputSchema: marketingSchemas.baseResponseSchema,
		annotations: { readOnlyHint: false, idempotentHint: true },
		handler: (api, args) => api.marketing.updateItemPromotion(args),
	}),
	defineTool({
		name: "ebay_delete_item_promotion",
		description: "Delete item promotion through the eBay Marketing API.",
		inputSchema: marketingSchemas.deleteItemPromotionInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false, destructiveHint: true },
		handler: (api, args) => api.marketing.deleteItemPromotion(args),
	}),
	defineTool({
		name: "ebay_get_listing_set",
		description: "Get listing set through the eBay Marketing API.",
		inputSchema: marketingSchemas.getListingSetInputSchema.shape,
		outputSchema: marketingSchemas.itemsPagedCollectionSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getListingSet(args),
	}),
	defineTool({
		name: "ebay_get_promotions",
		description: "Get promotions through the eBay Marketing API.",
		inputSchema: marketingSchemas.getPromotionsInputSchema.shape,
		outputSchema: marketingSchemas.promotionsPagedCollectionSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getPromotions(args),
	}),
	defineTool({
		name: "ebay_pause_promotion",
		description: "Pause promotion through the eBay Marketing API.",
		inputSchema: marketingSchemas.pausePromotionInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.pausePromotion(args),
	}),
	defineTool({
		name: "ebay_resume_promotion",
		description: "Resume promotion through the eBay Marketing API.",
		inputSchema: marketingSchemas.resumePromotionInputSchema.shape,
		outputSchema: emptyResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.resumePromotion(args),
	}),
	defineTool({
		name: "ebay_get_promotion_reports",
		description: "Get promotion reports through the eBay Marketing API.",
		inputSchema: marketingSchemas.getPromotionReportsInputSchema.shape,
		outputSchema: marketingSchemas.promotionsReportPagedCollectionSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getPromotionReports(args),
	}),
	defineTool({
		name: "ebay_get_promotion_summary_report",
		description: "Get promotion summary report through the eBay Marketing API.",
		inputSchema: marketingSchemas.getPromotionSummaryReportInputSchema.shape,
		outputSchema: marketingSchemas.summaryReportResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getPromotionSummaryReport(args),
	}),
	defineTool({
		name: "ebay_get_email_campaigns",
		description: "Get email campaigns through the eBay Marketing API.",
		inputSchema: marketingSchemas.getEmailCampaignsInputSchema.shape,
		outputSchema: marketingSchemas.getEmailCampaignsResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getEmailCampaigns(args),
	}),
	defineTool({
		name: "ebay_create_email_campaign",
		description: "Create email campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.createEmailCampaignInputSchema.shape,
		outputSchema: marketingSchemas.createEmailCampaignResponseSchema,
		annotations: { readOnlyHint: false },
		handler: (api, args) => api.marketing.createEmailCampaign(args),
	}),
	defineTool({
		name: "ebay_get_email_campaign",
		description: "Get email campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.getEmailCampaignInputSchema.shape,
		outputSchema: marketingSchemas.getEmailCampaignResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getEmailCampaign(args),
	}),
	defineTool({
		name: "ebay_update_email_campaign",
		description: "Update email campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.updateEmailCampaignInputSchema.shape,
		outputSchema: marketingSchemas.updateEmailCampaignResponseSchema,
		annotations: { readOnlyHint: false, idempotentHint: true },
		handler: (api, args) => api.marketing.updateEmailCampaign(args),
	}),
	defineTool({
		name: "ebay_delete_email_campaign",
		description: "Delete email campaign through the eBay Marketing API.",
		inputSchema: marketingSchemas.deleteEmailCampaignInputSchema.shape,
		outputSchema: marketingSchemas.deleteEmailCampaignResponseSchema,
		annotations: { readOnlyHint: false, destructiveHint: true },
		handler: (api, args) => api.marketing.deleteEmailCampaign(args),
	}),
	defineTool({
		name: "ebay_get_audiences",
		description: "Get audiences through the eBay Marketing API.",
		inputSchema: marketingSchemas.getAudiencesInputSchema.shape,
		outputSchema: marketingSchemas.getEmailCampaignAudiencesResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getAudiences(args),
	}),
	defineTool({
		name: "ebay_get_email_preview",
		description: "Get email preview through the eBay Marketing API.",
		inputSchema: marketingSchemas.getEmailPreviewInputSchema.shape,
		outputSchema: marketingSchemas.getEmailPreviewResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getEmailPreview(args),
	}),
	defineTool({
		name: "ebay_get_email_report",
		description: "Get email report through the eBay Marketing API.",
		inputSchema: marketingSchemas.getEmailReportInputSchema.shape,
		outputSchema: marketingSchemas.getEmailReportResponseSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) => api.marketing.getEmailReport(args),
	}),
	defineTool({
		name: "ebay_find_listing_recommendations",
		description:
			"Find listing recommendations through the eBay Recommendation API.",
		inputSchema: marketingSchemas.findListingRecommendationsInputSchema.shape,
		outputSchema: marketingSchemas.pagedListingRecommendationCollectionSchema,
		annotations: { readOnlyHint: true },
		handler: (api, args) =>
			api.recommendation.findListingRecommendations({
				marketplaceId: args.marketplaceId,
				...defined({
					filter: args.filter,
					limit: args.limit,
					offset: args.offset,
					requestBody: omitUndefinedListingIds(args.requestBody),
				}),
			}),
	}),
];
