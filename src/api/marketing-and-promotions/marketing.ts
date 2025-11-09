import type {
  CreateCampaignRequest,
  ItemPromotion,
  CreateAdRequest,
  CreateAdsByInventoryReferenceRequest,
  CloneAdRequest,
  UpdateBidPercentageRequest,
  CloneCampaignRequest
} from '../../types/ebay/sell/marketing-and-promotions/marketing-api-types.js';
import type {
  AdPagedCollectionResponse,
  BaseResponse,
  Campaign,
  CampaignPagedCollectionResponse,
  ItemPromotionsPagedCollection,
  AdReferences,
  Ad,
  Ads
} from '../../types/ebay/sell/marketing-and-promotions/marketing-response-types.js';
import { EbayApiClient } from '../client.js';

/**
 * Marketing API - Marketing campaigns and promotions
 * Based on: docs/sell-apps/marketing-and-promotions/sell_marketing_v1_oas3.json
 */
export class MarketingApi {
  private readonly basePath = '/sell/marketing/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get campaigns
   */
  async getCampaigns(
    campaignStatus?: string,
    marketplaceId?: string,
    limit?: number
  ): Promise<CampaignPagedCollectionResponse> {
    const params: Record<string, string | number> = {};
    if (campaignStatus) params.campaign_status = campaignStatus;
    if (marketplaceId) params.marketplace_id = marketplaceId;
    if (limit) params.limit = limit;
    return this.client.get<CampaignPagedCollectionResponse>(`${this.basePath}/ad_campaign`, params);
  }

  /**
   * Get a specific campaign
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.client.get<Campaign>(`${this.basePath}/ad_campaign/${campaignId}`);
  }

  /**
   * Create a campaign
   */
  async createCampaign(campaign: CreateCampaignRequest): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(`${this.basePath}/ad_campaign`, campaign);
  }

  /**
   * Get promotions
   */
  async getPromotions(marketplaceId?: string, limit?: number): Promise<ItemPromotionsPagedCollection> {
    const params: Record<string, string | number> = {};
    if (marketplaceId) params.marketplace_id = marketplaceId;
    if (limit) params.limit = limit;
    return this.client.get<ItemPromotionsPagedCollection>(`${this.basePath}/promotion`, params);
  }

  /**
   * Create a promotion (item promotion)
   */
  async createPromotion(promotion: ItemPromotion): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(`${this.basePath}/item_promotion`, promotion);
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
    offset?: number
  ): Promise<AdPagedCollectionResponse> {
    const params: Record<string, string | number> = {};
    if (adGroupIds) params.ad_group_ids = adGroupIds;
    if (adStatus) params.ad_status = adStatus;
    if (limit) params.limit = limit;
    if (listingIds) params.listing_ids = listingIds;
    if (offset) params.offset = offset;
    return this.client.get<AdPagedCollectionResponse>(`${this.basePath}/ad_campaign/${campaignId}/ad`, params);
  }

  /**
   * Create an ad for a campaign
   */
  async createAd(campaignId: string, ad: CreateAdRequest): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(`${this.basePath}/ad_campaign/${campaignId}/ad`, ad);
  }

  /**
   * Create ads by inventory reference for a campaign
   */
  async createAdsByInventoryReference(
    campaignId: string,
    ads: CreateAdsByInventoryReferenceRequest
  ): Promise<AdReferences> {
    return this.client.post<AdReferences>(`${this.basePath}/ad_campaign/${campaignId}/create_ads_by_inventory_reference`, ads);
  }

  /**
   * Get a specific ad for a campaign
   */
  async getAd(campaignId: string, adId: string): Promise<Ad> {
    return this.client.get<Ad>(`${this.basePath}/ad_campaign/${campaignId}/ad/${adId}`);
  }

  /**
   * Delete a specific ad from a campaign
   */
  async deleteAd(campaignId: string, adId: string): Promise<void> {
    return this.client.delete<void>(`${this.basePath}/ad_campaign/${campaignId}/ad/${adId}`);
  }

  /**
   * Clone an ad for a campaign
   */
  async cloneAd(campaignId: string, adId: string, ad: CloneAdRequest): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(`${this.basePath}/ad_campaign/${campaignId}/ad/${adId}/clone`, ad);
  }

  /**
   * Get ads by inventory reference for a campaign
   */
  async getAdsByInventoryReference(
    campaignId: string,
    inventoryReferenceId: string,
    inventoryReferenceType: string
  ): Promise<Ads> {
    const params: Record<string, string> = {
      inventory_reference_id: inventoryReferenceId,
      inventory_reference_type: inventoryReferenceType
    };
    return this.client.get<Ads>(`${this.basePath}/ad_campaign/${campaignId}/get_ads_by_inventory_reference`, params);
  }

  /**
   * Get ads by listing ID for a campaign
   */
  async getAdsByListingId(campaignId: string, listingId: string): Promise<Ads> {
    const params: Record<string, string> = {
      listing_id: listingId
    };
    return this.client.get<Ads>(`${this.basePath}/ad_campaign/${campaignId}/get_ads_by_listing_id`, params);
  }

  /**
   * Update the bid for an ad in a campaign
   */
  async updateBid(campaignId: string, adId: string, bid: UpdateBidPercentageRequest): Promise<void> {
    return this.client.post<void>(`${this.basePath}/ad_campaign/${campaignId}/ad/${adId}/update_bid`, bid);
  }

  /**
   * Clone a campaign
   */
  async cloneCampaign(campaignId: string, campaign: CloneCampaignRequest): Promise<BaseResponse> {
    return this.client.post<BaseResponse>(`${this.basePath}/ad_campaign/${campaignId}/clone`, campaign);
  }

  /**
   * End a campaign
   */
  async endCampaign(campaignId: string): Promise<void> {
    return this.client.post<void>(`${this.basePath}/ad_campaign/${campaignId}/end`, {});
  }

  /**
   * Get campaign by name
   */
  async getCampaignByName(campaignName: string): Promise<Campaign> {
    const params: Record<string, string> = {
      campaign_name: campaignName
    };
    return this.client.get<Campaign>(`${this.basePath}/ad_campaign/get_campaign_by_name`, params);
  }
}
