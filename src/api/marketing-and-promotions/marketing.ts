
import type { components } from "../../types/sell_marketing_v1_oas3.js";
import type { EbayApiClient } from "../client.js";

type AdGroupRequest = components["schemas"]["CreateAdGroupRequest"];
type BulkCreateAdRequest = components["schemas"]["BulkCreateAdRequest"];
type BulkCreateAdsByInventoryReferenceRequest =
  components["schemas"]["BulkCreateAdsByInventoryReferenceRequest"];
type BulkCreateKeywordsRequest =
  components["schemas"]["BulkCreateKeywordRequest"];
type BulkDeleteAdRequest = components["schemas"]["BulkDeleteAdRequest"];
type BulkDeleteKeywordsRequest = components["schemas"]["BulkDeleteKeywordRequest"];
type BulkUpdateAdStatusByListingIdRequest =
  components["schemas"]["BulkUpdateAdStatusByListingIdRequest"];
type BulkUpdateAdStatusRequest =
  components["schemas"]["BulkUpdateAdStatusRequest"];
type BulkUpdateKeywordBidsRequest =
  components["schemas"]["BulkUpdateKeywordRequest"];
type CloneAdGroupRequest = components["schemas"]["CloneAdGroupRequest"];
type CloneAdRequest = components["schemas"]["CloneAdRequest"];
type CloneCampaignRequest = components["schemas"]["CloneCampaignRequest"];
type CreateAdRequest = components["schemas"]["CreateAdRequest"];
type CreateAdsByInventoryReferenceRequest =
  components["schemas"]["CreateAdsByInventoryReferenceRequest"];
type CreateCampaignRequest = components["schemas"]["CreateCampaignRequest"];
type CreateKeywordRequest = components["schemas"]["CreateKeywordRequest"];
type CreateNegativeKeywordRequest =
  components["schemas"]["CreateNegativeKeywordRequest"];
type CreateReportTask = components["schemas"]["CreateReportTask"];
type ItemPromotion = components["schemas"]["ItemPromotion"];
type ItemPromotionRequest = components["schemas"]["ItemPromotionRequest"];
type SuggestKeywordsRequest = components["schemas"]["SuggestKeywordsRequest"];
type TargetingRequest = components["schemas"]["TargetingRequest"];
type UpdateAdGroupBidsRequest = components["schemas"]["UpdateAdGroupBidsRequest"];
type UpdateAdGroupKeywordsRequest = components["schemas"]["UpdateAdGroupKeywordsRequest"];
type UpdateBidPercentageRequest =
  components["schemas"]["UpdateBidPercentageRequest"];
type UpdateBidRequest = components["schemas"]["UpdateBidRequest"];
type UpdateCampaignIdentificationRequest =
  components["schemas"]["UpdateCampaignIdentificationRequest"];
type Ad = components["schemas"]["Ad"];
type AdGroup = components["schemas"]["AdGroup"];
type AdGroupPagedCollection =
  components["schemas"]["AdGroupPagedCollectionResponse"];
type AdPagedCollectionResponse =
  components["schemas"]["AdPagedCollectionResponse"];
type AdReferences = components["schemas"]["AdReferences"];
type Ads = components["schemas"]["Ads"];
type BaseResponse = components["schemas"]["BaseResponse"];
type BulkAdResponse = components["schemas"]["BulkAdResponse"];
type BulkAdUpdateResponse = components["schemas"]["BulkAdUpdateResponse"];
type BulkAdUpdateStatusByListingIdResponse =
  components["schemas"]["BulkAdUpdateStatusByListingIdResponse"];
type BulkAdUpdateStatusResponse =
  components["schemas"]["BulkAdUpdateStatusResponse"];
type BulkCreateAdsByInventoryReferenceResponse =
  components["schemas"]["BulkCreateAdsByInventoryReferenceResponse"];
type BulkCreateKeywordsResponse =
  components["schemas"]["BulkCreateKeywordResponse"];
type BulkDeleteAdResponse = components["schemas"]["BulkDeleteAdResponse"];
type BulkDeleteAdsByInventoryReferenceResponse =
  components["schemas"]["BulkDeleteAdsByInventoryReferenceResponse"];
type BulkDeleteKeywordsResponse = components["schemas"]["BulkDeleteKeywordResponse"];
type BulkUpdateAdsByInventoryReferenceResponse =
  components["schemas"]["BulkUpdateAdsByInventoryReferenceResponse"];
type BulkUpdateKeywordBidsResponse =
  components["schemas"]["BulkUpdateKeywordResponse"];
type Campaign = components["schemas"]["Campaign"];
type CampaignPagedCollectionResponse =
  components["schemas"]["CampaignPagedCollectionResponse"];
type CreateKeywordResponse = components["schemas"]["CreateKeywordResponse"];
type ItemPromotionResponse = components["schemas"]["ItemPromotionResponse"];
type ItemPromotionsPagedCollection =
  components["schemas"]["ItemPromotionPagedCollection"];
type Keyword = components["schemas"]["Keyword"];
type KeywordPagedCollection =
  components["schemas"]["KeywordPagedCollectionResponse"];
type NegativeKeyword = components["schemas"]["NegativeKeyword"];
type NegativeKeywordPagedCollection =
  components["schemas"]["NegativeKeywordPagedCollectionResponse"];
type PromotionsReportPagedCollection =
  components["schemas"]["PromotionsReportPagedCollection"];
type Report = components["schemas"]["Report"];
type ReportMetadata = components["schemas"]["ReportMetadata"];
type ReportMetadatas = components["schemas"]["ReportMetadatas"];
type ReportTask = components["schemas"]["ReportTask"];
type ReportTaskPagedCollection =
  components["schemas"]["ReportTaskPagedCollection"];
type SuggestedBids = components["schemas"]["SuggestedBids"];
type SuggestedKeywords = components["schemas"]["SuggestedKeywords"];
type SummaryReportResponse = components["schemas"]["SummaryReportResponse"];
type TargetingResponse = components["schemas"]["TargetingResponse"];
type BulkCreateNegativeKeywordRequest =
  components["schemas"]["BulkCreateNegativeKeywordRequest"];
type BulkCreateNegativeKeywordResponse =
  components["schemas"]["BulkCreateNegativeKeywordResponse"];
type BulkDeleteNegativeKeywordRequest = components["schemas"]["BulkDeleteNegativeKeywordRequest"];
type BulkDeleteNegativeKeywordResponse = components["schemas"]["BulkDeleteNegativeKeywordResponse"];
type BulkUpdateNegativeKeywordRequest =
  components["schemas"]["BulkUpdateNegativeKeywordRequest"];
type BulkUpdateNegativeKeywordResponse =
  components["schemas"]["BulkUpdateNegativeKeywordResponse"];
type NegativeKeywordRequest =
  components["schemas"]["UpdateNegativeKeywordRequest"];

/**
 * Marketing API - Marketing campaigns and promotions
 * Based on: docs/sell-apps/marketing-and-promotions/sell_marketing_v1_oas3.json
 */
export class MarketingApi {
  private readonly basePath = "/sell/marketing/v1";

  constructor(private client: EbayApiClient) { }

  /**
   * Get campaigns
   */
  async getCampaigns(
    campaignStatus?: string,
    marketplaceId?: string,
    limit?: number,
  ): Promise<CampaignPagedCollectionResponse> {
    const params: Record<string, string | number> = {};
    if (campaignStatus) params.campaign_status = campaignStatus;
    if (marketplaceId) params.marketplace_id = marketplaceId;
    if (limit) params.limit = limit;
    return this.client.get<CampaignPagedCollectionResponse>(
      `${this.basePath}/ad_campaign`,
      params,
    );
  }

  /**
   * Get a specific campaign
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.client.get<Campaign>(
      `${this.basePath}/ad_campaign/${campaignId}`,
    );
  }

  /**
   * Create a campaign
   */
  async createCampaign(campaign: CreateCampaignRequest): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign`,
      campaign,
    );
  }

  /**
   * Get promotions
   */
  async getPromotions(
    marketplaceId?: string,
    limit?: number,
  ): Promise<ItemPromotionsPagedCollection> {
    const params: Record<string, string | number> = {};
    if (marketplaceId) params.marketplace_id = marketplaceId;
    if (limit) params.limit = limit;
    return this.client.get<ItemPromotionsPagedCollection>(
      `${this.basePath}/promotion`,
      params,
    );
  }

  /**
   * Create a promotion (item promotion)
   */
  async createPromotion(promotion: ItemPromotion): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/item_promotion`,
      promotion,
    );
  }

  /**
   * Get ads for a campaign
   */
  async getAds(
    campaignId: string,
    adGroupIds?: string,
    adStatus?: string,
    limit?: number,
    listingIds?: string,
    offset?: number,
  ): Promise<AdPagedCollectionResponse> {
    const params: Record<string, string | number> = {};
    if (adGroupIds) params.ad_group_ids = adGroupIds;
    if (adStatus) params.ad_status = adStatus;
    if (limit) params.limit = limit;
    if (listingIds) params.listing_ids = listingIds;
    if (offset) params.offset = offset;
    return this.client.get<AdPagedCollectionResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad`,
      params,
    );
  }

  /**
   * Create an ad for a campaign
   */
  async createAd(
    campaignId: string,
    ad: CreateAdRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad`,
      ad,
    );
  }

  /**
   * Create ads by inventory reference for a campaign
   */
  async createAdsByInventoryReference(
    campaignId: string,
    ads: CreateAdsByInventoryReferenceRequest,
  ): Promise<AdReferences> {
    return this.client.post<AdReferences>(
      `${this.basePath}/ad_campaign/${campaignId}/create_ads_by_inventory_reference`,
      ads,
    );
  }

  /**
   * Get a specific ad for a campaign
   */
  async getAd(campaignId: string, adId: string): Promise<Ad> {
    return this.client.get<Ad>(
      `${this.basePath}/ad_campaign/${campaignId}/ad/${adId}`,
    );
  }

  /**
   * Delete a specific ad from a campaign
   */
  async deleteAd(campaignId: string, adId: string): Promise<void> {
    return this.client.delete<void>(
      `${this.basePath}/ad_campaign/${campaignId}/ad/${adId}`,
    );
  }

  /**
   * Clone an ad for a campaign
   */
  async cloneAd(
    campaignId: string,
    adId: string,
    ad: CreateAdRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad/${adId}/clone`,
      ad,
    );
  }

  /**
   * Get ads by inventory reference for a campaign
   */
  async getAdsByInventoryReference(
    campaignId: string,
    inventoryReferenceId: string,
    inventoryReferenceType: string,
  ): Promise<Ads> {
    const params: Record<string, string> = {
      inventory_reference_id: inventoryReferenceId,
      inventory_reference_type: inventoryReferenceType,
    };
    return this.client.get<Ads>(
      `${this.basePath}/ad_campaign/${campaignId}/get_ads_by_inventory_reference`,
      params,
    );
  }

  /**
   * Get ads by listing ID for a campaign
   */
  async getAdsByListingId(campaignId: string, listingId: string): Promise<Ads> {
    const params: Record<string, string> = {
      listing_id: listingId,
    };
    return this.client.get<Ads>(
      `${this.basePath}/ad_campaign/${campaignId}/get_ads_by_listing_id`,
      params,
    );
  }

  /**
   * Update the bid for an ad in a campaign
   */
  async updateBid(
    campaignId: string,
    adId: string,
    bid: UpdateBidPercentageRequest,
  ): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/ad/${adId}/update_bid`,
      bid,
    );
  }

  /**
   * Clone a campaign
   */
  async cloneCampaign(
    campaignId: string,
    campaign: CloneCampaignRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/clone`,
      campaign,
    );
  }

  /**
   * End a campaign
   */
  async endCampaign(campaignId: string): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/end`,
      {},
    );
  }

  /**
   * Get campaign by name
   */
  async getCampaignByName(campaignName: string): Promise<Campaign> {
    const params: Record<string, string> = {
      campaign_name: campaignName,
    };
    return this.client.get<Campaign>(
      `${this.basePath}/ad_campaign/get_campaign_by_name`,
      params,
    );
  }

  /**
   * Bulk create ads by inventory reference
   */
  async bulkCreateAdsByInventoryReference(
    campaignId: string,
    body: BulkCreateAdsByInventoryReferenceRequest,
  ): Promise<BulkCreateAdsByInventoryReferenceResponse> {
    return this.client.post<BulkCreateAdsByInventoryReferenceResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_create_ads_by_inventory_reference`,
      body,
    );
  }

  /**
   * Bulk create ads by listing id
   */
  async bulkCreateAdsByListingId(
    campaignId: string,
    body: BulkCreateAdRequest,
  ): Promise<BulkAdResponse> {
    return this.client.post<BulkAdResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_create_ads_by_listing_id`,
      body,
    );
  }

  /**
   * Bulk delete ads by inventory reference
   */
  async bulkDeleteAdsByInventoryReference(
    campaignId: string,
    body: BulkDeleteAdsByInventoryReferenceRequest,
  ): Promise<BulkDeleteAdsByInventoryReferenceResponse> {
    return this.client.post<BulkDeleteAdsByInventoryReferenceResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_delete_ads_by_inventory_reference`,
      body,
    );
  }

  /**
   * Bulk delete ads by listing id
   */
  async bulkDeleteAdsByListingId(
    campaignId: string,
    body: BulkDeleteAdRequest,
  ): Promise<BulkDeleteAdResponse> {
    return this.client.post<BulkDeleteAdResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_delete_ads_by_listing_id`,
      body,
    );
  }

  /**
   * Bulk update ads bid by inventory reference
   */
  async bulkUpdateAdsBidByInventoryReference(
    campaignId: string,
    body: BulkCreateAdsByInventoryReferenceRequest,
  ): Promise<BulkUpdateAdsByInventoryReferenceResponse> {
    return this.client.post<BulkUpdateAdsByInventoryReferenceResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_update_ads_bid_by_inventory_reference`,
      body,
    );
  }

  /**
   * Bulk update ads bid by listing id
   */
  async bulkUpdateAdsBidByListingId(
    campaignId: string,
    body: BulkCreateAdRequest,
  ): Promise<BulkAdUpdateResponse> {
    return this.client.post<BulkAdUpdateResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_update_ads_bid_by_listing_id`,
      body,
    );
  }

  /**
   * Bulk update ads status
   */
  async bulkUpdateAdsStatus(
    campaignId: string,
    body: BulkUpdateAdStatusRequest,
  ): Promise<BulkAdUpdateStatusResponse> {
    return this.client.post<BulkAdUpdateStatusResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_update_ads_status`,
      body,
    );
  }

  /**
   * Bulk update ads status by listing id
   */
  async bulkUpdateAdsStatusByListingId(
    campaignId: string,
    body: BulkUpdateAdStatusByListingIdRequest,
  ): Promise<BulkAdUpdateStatusByListingIdResponse> {
    return this.client.post<BulkAdUpdateStatusByListingIdResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_update_ads_status_by_listing_id`,
      body,
    );
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId: string): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/pause`,
      {},
    );
  }

  /**
   * Resume a campaign
   */
  async resumeCampaign(campaignId: string): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/resume`,
      {},
    );
  }

  /**
   * Update campaign identification
   */
  async updateCampaignIdentification(
    campaignId: string,
    body: UpdateCampaignIdentificationRequest,
  ): Promise<void> {
    return this.client.put<void>(
      `${this.basePath}/ad_campaign/${campaignId}/update_campaign_identification`,
      body,
    );
  }

  /**
   * Create an ad group
   */
  async createAdGroup(
    campaignId: string,
    body: AdGroupRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group`,
      body,
    );
  }

  /**
   * Clone an ad group
   */
  async cloneAdGroup(
    campaignId: string,
    adGroupId: string,
    body: CreateAdGroupRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/clone`,
      body,
    );
  }

  /**
   * Get ad groups
   */
  async getAdGroups(
    campaignId: string,
    adGroupStatus?: string,
    limit?: number,
    offset?: number,
  ): Promise<AdGroupPagedCollection> {
    const params: Record<string, string | number> = {};
    if (adGroupStatus) params.ad_group_status = adGroupStatus;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.client.get<AdGroupPagedCollection>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group`,
      params,
    );
  }

  /**
   * Get an ad group
   */
  async getAdGroup(campaignId: string, adGroupId: string): Promise<AdGroup> {
    return this.client.get<AdGroup>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}`,
    );
  }

  /**
   * Suggest bids for an ad group
   */
  async suggestBids(
    campaignId: string,
    adGroupId: string,
  ): Promise<SuggestedBids> {
    return this.client.post<SuggestedBids>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/suggest_bids`,
      {},
    );
  }

  /**
   * Update ad group bids
   */
  async updateAdGroupBids(
    campaignId: string,
    adGroupId: string,
    body: UpdateKeywordByKeywordIdRequest,
  ): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/update_ad_group_bids`,
      body,
    );
  }

  /**
   * Update ad group keywords
   */
  async updateAdGroupKeywords(
    campaignId: string,
    adGroupId: string,
    body: BulkUpdateKeywordRequest,
  ): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/update_ad_group_keywords`,
      body,
    );
  }

  /**
   * Suggest keywords
   */
  async suggestKeywords(
    campaignId: string,
    adGroupId: string,
    body: SuggestKeywordsRequest,
  ): Promise<SuggestedKeywords> {
    return this.client.post<SuggestedKeywords>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/suggest_keywords`,
      body,
    );
  }

  /**
   * Get keywords
   */
  async getKeywords(
    campaignId: string,
    adGroupId: string,
    keywordStatus?: string,
    limit?: number,
    offset?: number,
  ): Promise<KeywordPagedCollection> {
    const params: Record<string, string | number> = {};
    if (keywordStatus) params.keyword_status = keywordStatus;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.client.get<KeywordPagedCollection>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/keyword`,
      params,
    );
  }

  /**
   * Bulk create keywords
   */
  async bulkCreateKeywords(
    campaignId: string,
    adGroupId: string,
    body: BulkCreateKeywordsRequest,
  ): Promise<BulkCreateKeywordsResponse> {
    return this.client.post<BulkCreateKeywordsResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/bulk_create_keywords`,
      body,
    );
  }

  /**
   * Bulk delete keywords
   */
  async bulkDeleteKeywords(
    campaignId: string,
    adGroupId: string,
    body: BulkDeleteKeywordsRequest,
  ): Promise<BulkDeleteKeywordsResponse> {
    return this.client.post<BulkDeleteKeywordsResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/bulk_delete_keywords`,
      body,
    );
  }

  /**
   * Bulk update keyword bids
   */
  async bulkUpdateKeywordBids(
    campaignId: string,
    adGroupId: string,
    body: BulkUpdateKeywordBidsRequest,
  ): Promise<BulkUpdateKeywordBidsResponse> {
    return this.client.post<BulkUpdateKeywordBidsResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/bulk_update_keyword_bids`,
      body,
    );
  }

  /**
   * Create a keyword
   */
  async createKeyword(
    campaignId: string,
    adGroupId: string,
    body: CreateKeywordRequest,
  ): Promise<CreateKeywordResponse> {
    return this.client.post<CreateKeywordResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/create_keyword`,
      body,
    );
  }

  /**
   * Get a keyword
   */
  async getKeyword(
    campaignId: string,
    adGroupId: string,
    keywordId: string,
  ): Promise<Keyword> {
    return this.client.get<Keyword>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/keyword/${keywordId}`,
    );
  }

  /**
   * Delete a keyword
   */
  async deleteKeyword(
    campaignId: string,
    adGroupId: string,
    keywordId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/keyword/${keywordId}`,
    );
  }

  /**
   * Update a keyword's bid
   */
  async updateKeywordBid(
    campaignId: string,
    adGroupId: string,
    keywordId: string,
    body: UpdateBidRequest,
  ): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/ad_group/${adGroupId}/keyword/${keywordId}/update_bid`,
      body,
    );
  }

  /**
   * Get ad report
   */
  async getAdReport(
    dimension: string,
    metric: string,
    startDate: string,
    endDate: string,
    sort?: string,
    listingIds?: string,
    marketplaceId?: string,
  ): Promise<Report> {
    const params: Record<string, string> = {
      dimension,
      metric,
      start_date: startDate,
      end_date: endDate,
    };
    if (sort) params.sort = sort;
    if (listingIds) params.listing_ids = listingIds;
    if (marketplaceId) params.marketplace_id = marketplaceId;
    return this.client.get<Report>(`${this.basePath}/ad_report`, params);
  }

  /**
   * Get ad report metadata
   */
  async getAdReportMetadata(): Promise<ReportMetadatas> {
    return this.client.get<ReportMetadatas>(
      `${this.basePath}/ad_report_metadata`,
    );
  }

  /**
   * Get ad report metadata for a report type
   */
  async getAdReportMetadataForReportType(
    reportType: string,
  ): Promise<ReportMetadata> {
    return this.client.get<ReportMetadata>(
      `${this.basePath}/ad_report_metadata/${reportType}`,
    );
  }

  /**
   * Create a report task
   */
  async createReportTask(body: CreateReportTask): Promise<void> {
    return this.client.post<void>(`${this.basePath}/ad_report_task`, body);
  }

  /**
   * Get report tasks
   */
  async getReportTasks(
    reportTaskStatuses?: string,
    limit?: number,
    offset?: number,
  ): Promise<ReportTaskPagedCollection> {
    const params: Record<string, string | number> = {};
    if (reportTaskStatuses) params.report_task_statuses = reportTaskStatuses;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.client.get<ReportTaskPagedCollection>(
      `${this.basePath}/ad_report_task`,
      params,
    );
  }

  /**
   * Get a report task
   */
  async getReportTask(reportTaskId: string): Promise<ReportTask> {
    return this.client.get<ReportTask>(
      `${this.basePath}/ad_report_task/${reportTaskId}`,
    );
  }

  /**
   * Get an item promotion
   */
  async getItemPromotion(promotionId: string): Promise<ItemPromotionResponse> {
    return this.client.get<ItemPromotionResponse>(
      `${this.basePath}/item_promotion/${promotionId}`,
    );
  }

  /**
   * Delete an item promotion
   */
  async deleteItemPromotion(promotionId: string): Promise<void> {
    return this.client.delete<void>(
      `${this.basePath}/item_promotion/${promotionId}`,
    );
  }

  /**
   * Pause an item promotion
   */
  async pauseItemPromotion(promotionId: string): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/item_promotion/${promotionId}/pause`,
      {},
    );
  }

  /**
   * Resume an item promotion
   */
  async resumeItemPromotion(promotionId: string): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/item_promotion/${promotionId}/resume`,
      {},
    );
  }

  /**
   * Update an item promotion
   */
  async updateItemPromotion(
    promotionId: string,
    body: ItemPromotionRequest,
  ): Promise<BaseResponse> {
    return this.client.put<BaseResponse>(
      `${this.basePath}/item_promotion/${promotionId}`,
      body,
    );
  }

  /**
   * Get a promotion report
   */
  async getPromotionReport(
    marketplaceId: string,
    promotionStatus?: string,
    limit?: number,
    offset?: number,
  ): Promise<PromotionsReportPagedCollection> {
    const params: Record<string, string | number> = {
      marketplace_id: marketplaceId,
    };
    if (promotionStatus) params.promotion_status = promotionStatus;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.client.get<PromotionsReportPagedCollection>(
      `${this.basePath}/promotion_report`,
      params,
    );
  }

  /**
   * Get a promotion summary report
   */
  async getPromotionSummaryReport(
    marketplaceId: string,
  ): Promise<SummaryReportResponse> {
    const params = { marketplace_id: marketplaceId };
    return this.client.get<SummaryReportResponse>(
      `${this.basePath}/promotion_summary_report`,
      params,
    );
  }

  /**
   * Get targeting for a campaign
   */
  async getTargeting(campaignId: string): Promise<TargetingResponse> {
    return this.client.get<TargetingResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/targeting`,
    );
  }

  /**
   * Create targeting for a campaign
   */
  async createTargeting(
    campaignId: string,
    body: TargetingRequest,
  ): Promise<void> {
    return this.client.post<void>(
      `${this.basePath}/ad_campaign/${campaignId}/targeting`,
      body,
    );
  }

  /**
   * Update targeting for a campaign
   */
  async updateTargeting(
    campaignId: string,
    body: TargetingRequest,
  ): Promise<void> {
    return this.client.put<void>(
      `${this.basePath}/ad_campaign/${campaignId}/targeting`,
      body,
    );
  }

  /**
   * Get negative keywords for a campaign
   */
  async getNegativeKeywords(
    campaignId: string,
    limit?: number,
    offset?: number,
  ): Promise<NegativeKeywordPagedCollection> {
    const params: Record<string, string | number> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.client.get<NegativeKeywordPagedCollection>(
      `${this.basePath}/ad_campaign/${campaignId}/negative_keyword`,
      params,
    );
  }

  /**
   * Create a negative keyword for a campaign
   */
  async createNegativeKeyword(
    campaignId: string,
    body: CreateNegativeKeywordRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/negative_keyword`,
      body,
    );
  }

  /**
   * Bulk create negative keywords for a campaign
   */
  async bulkCreateNegativeKeywords(
    campaignId: string,
    body: BulkCreateNegativeKeywordRequest,
  ): Promise<BulkCreateNegativeKeywordResponse> {
    return this.client.post<BulkCreateNegativeKeywordResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_create_negative_keywords`,
      body,
    );
  }

  /**
   * Bulk delete negative keywords for a campaign
   */
  async bulkDeleteNegativeKeywords(
    campaignId: string,
    body: BulkDeleteNegativeKeywordRequest,
  ): Promise<BulkDeleteNegativeKeywordResponse> {
    return this.client.post<BulkDeleteNegativeKeywordResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_delete_negative_keywords`,
      body,
    );
  }

  /**
   * Bulk update negative keywords for a campaign
   */
  async bulkUpdateNegativeKeywords(
    campaignId: string,
    body: BulkUpdateNegativeKeywordRequest,
  ): Promise<BulkUpdateNegativeKeywordResponse> {
    return this.client.post<BulkUpdateNegativeKeywordResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/bulk_update_negative_keywords`,
      body,
    );
  }

  /**
   * Get a negative keyword for a campaign
   */
  async getNegativeKeyword(
    campaignId: string,
    negativeKeywordId: string,
  ): Promise<NegativeKeyword> {
    return this.client.get<NegativeKeyword>(
      `${this.basePath}/ad_campaign/${campaignId}/negative_keyword/${negativeKeywordId}`,
    );
  }

  /**
   * Delete a negative keyword for a campaign
   */
  async deleteNegativeKeyword(
    campaignId: string,
    negativeKeywordId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `${this.basePath}/ad_campaign/${campaignId}/negative_keyword/${negativeKeywordId}`,
    );
  }

  /**
   * Update a negative keyword for a campaign
   */
  async updateNegativeKeyword(
    campaignId: string,
    negativeKeywordId: string,
    body: NegativeKeywordRequest,
  ): Promise<BaseResponse> {
    return this.client.put<BaseResponse>(
      `${this.basePath}/ad_campaign/${campaignId}/negative_keyword/${negativeKeywordId}`,
      body,
    );
  }

  /**
   * Get negative keywords for an ad group
   */
  async getNegativeKeywordsForAdGroup(
    adGroupId: string,
    limit?: number,
    offset?: number,
  ): Promise<NegativeKeywordPagedCollection> {
    const params: Record<string, string | number> = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return this.client.get<NegativeKeywordPagedCollection>(
      `${this.basePath}/ad_group/${adGroupId}/negative_keyword`,
      params,
    );
  }

  /**
   * Create a negative keyword for an ad group
   */
  async createNegativeKeywordForAdGroup(
    adGroupId: string,
    body: CreateNegativeKeywordRequest,
  ): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(
      `${this.basePath}/ad_group/${adGroupId}/negative_keyword`,
      body,
    );
  }

  /**
   * Bulk create negative keywords for an ad group
   */
  async bulkCreateNegativeKeywordsForAdGroup(
    adGroupId: string,
    body: BulkCreateNegativeKeywordRequest,
  ): Promise<BulkCreateNegativeKeywordResponse> {
    return this.client.post<BulkCreateNegativeKeywordResponse>(
      `${this.basePath}/ad_group/${adGroupId}/bulk_create_negative_keywords`,
      body,
    );
  }

  /**
   * Bulk delete negative keywords for an ad group
   */
  async bulkDeleteNegativeKeywordsForAdGroup(
    adGroupId: string,
    body: BulkDeleteNegativeKeywordRequest,
  ): Promise<BulkDeleteNegativeKeywordResponse> {
    return this.client.post<BulkDeleteNegativeKeywordResponse>(
      `${this.basePath}/ad_group/${adGroupId}/bulk_delete_negative_keywords`,
      body,
    );
  }

  /**
   * Bulk update negative keywords for an ad group
   */
  async bulkUpdateNegativeKeywordsForAdGroup(
    adGroupId: string,
    body: BulkUpdateNegativeKeywordRequest,
  ): Promise<BulkUpdateNegativeKeywordResponse> {
    return this.client.post<BulkUpdateNegativeKeywordResponse>(
      `${this.basePath}/ad_group/${adGroupId}/bulk_update_negative_keywords`,
      body,
    );
  }

  /**
   * Get a negative keyword for an ad group
   */
  async getNegativeKeywordForAdGroup(
    adGroupId: string,
    negativeKeywordId: string,
  ): Promise<NegativeKeyword> {
    return this.client.get<NegativeKeyword>(
      `${this.basePath}/ad_group/${adGroupId}/negative_keyword/${negativeKeywordId}`,
    );
  }

  /**
   * Delete a negative keyword for an ad group
   */
  async deleteNegativeKeywordForAdGroup(
    adGroupId: string,
    negativeKeywordId: string,
  ): Promise<void> {
    return this.client.delete<void>(
      `${this.basePath}/ad_group/${adGroupId}/negative_keyword/${negativeKeywordId}`,
    );
  }

  /**
   * Update a negative keyword for an ad group
   */
  async updateNegativeKeywordForAdGroup(
    adGroupId: string,
    negativeKeywordId: string,
    body: NegativeKeywordRequest,
  ): Promise<BaseResponse> {
    return this.client.put<BaseResponse>(
      `${this.basePath}/ad_group/${adGroupId}/negative_keyword/${negativeKeywordId}`,
      body,
    );
  }
}
