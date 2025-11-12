import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MarketingApi } from "../../../src/api/marketing-and-promotions/marketing.js";
import type { EbayApiClient } from "../../../src/api/client.js";
import type { components } from "../../../src/types/sell_marketing_v1_oas3.js";

type CampaignPagedCollectionResponse =
  components["schemas"]["CampaignPagedCollectionResponse"];
type Campaign = components["schemas"]["Campaign"];
type BaseResponse = components["schemas"]["BaseResponse"];
type CreateCampaignRequest = components["schemas"]["CreateCampaignRequest"];
type AdPagedCollectionResponse =
  components["schemas"]["AdPagedCollectionResponse"];
type Ad = components["schemas"]["Ad"];
type CreateAdRequest = components["schemas"]["CreateAdRequest"];
type AdReferences = components["schemas"]["AdReferences"];
type CloneCampaignRequest = components["schemas"]["CloneCampaignRequest"];
type UpdateCampaignIdentificationRequest =
  components["schemas"]["UpdateCampaignIdentificationRequest"];
type AdGroupPagedCollection =
  components["schemas"]["AdGroupPagedCollectionResponse"];
type AdGroup = components["schemas"]["AdGroup"];
type AdGroupRequest = components["schemas"]["CreateAdGroupRequest"];
type SuggestedBids = components["schemas"]["SuggestedBids"];
type SuggestedKeywords = components["schemas"]["SuggestedKeywords"];
type KeywordPagedCollection =
  components["schemas"]["KeywordPagedCollectionResponse"];
type Keyword = components["schemas"]["Keyword"];
type CreateKeywordRequest = components["schemas"]["CreateKeywordRequest"];
type NegativeKeywordPagedCollection =
  components["schemas"]["NegativeKeywordPagedCollectionResponse"];
type NegativeKeyword = components["schemas"]["NegativeKeyword"];
type CreateNegativeKeywordRequest =
  components["schemas"]["CreateNegativeKeywordRequest"];
type ReportMetadatas = components["schemas"]["ReportMetadatas"];
type ReportMetadata = components["schemas"]["ReportMetadata"];
type ReportTaskPagedCollection =
  components["schemas"]["ReportTaskPagedCollection"];
type ReportTask = components["schemas"]["ReportTask"];
type CreateReportTask = components["schemas"]["CreateReportTask"];
type PromotionsReportPagedCollection =
  components["schemas"]["PromotionsReportPagedCollection"];
type SummaryReportResponse = components["schemas"]["SummaryReportResponse"];
type ItemPromotion = components["schemas"]["ItemPromotion"];

describe("MarketingApi", () => {
  let marketingApi: MarketingApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;

    marketingApi = new MarketingApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Campaign Management", () => {
    it("should get all campaigns without filters", async () => {
      const mockResponse: CampaignPagedCollectionResponse = {
        total: 5,
        campaigns: [
          {
            campaignId: "campaign-001",
            campaignName: "Test Campaign",
            campaignStatus: "RUNNING",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getCampaigns();

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get campaigns with filters", async () => {
      const mockResponse: CampaignPagedCollectionResponse = {
        total: 2,
        campaigns: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await marketingApi.getCampaigns("RUNNING", "EBAY_US", 10);

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign",
        {
          campaign_status: "RUNNING",
          marketplace_id: "EBAY_US",
          limit: 10,
        }
      );
    });

    it("should get a specific campaign", async () => {
      const mockCampaign: Campaign = {
        campaignId: "campaign-001",
        campaignName: "Test Campaign",
        campaignStatus: "RUNNING",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockCampaign);

      const result = await marketingApi.getCampaign("campaign-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001"
      );
      expect(result.campaignId).toBe("campaign-001");
    });

    it("should create a campaign", async () => {
      const campaignRequest: CreateCampaignRequest = {
        campaignName: "New Campaign",
        startDate: "2025-01-15T00:00:00Z",
        endDate: "2025-12-31T23:59:59Z",
        fundingStrategy: {
          fundingModel: "COST_PER_SALE",
          bidPercentage: "10.0",
        },
        marketplaceId: "EBAY_US",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-002",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createCampaign(campaignRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign",
        campaignRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should clone a campaign", async () => {
      const cloneRequest: CloneCampaignRequest = {
        campaignName: "Cloned Campaign",
        startDate: "2025-02-01T00:00:00Z",
        endDate: "2025-12-31T23:59:59Z",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-003",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.cloneCampaign(
        "campaign-001",
        cloneRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/clone",
        cloneRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should pause a campaign", async () => {
      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.pauseCampaign("campaign-001");

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/pause",
        {}
      );
    });

    it("should resume a campaign", async () => {
      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.resumeCampaign("campaign-001");

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/resume",
        {}
      );
    });

    it("should end a campaign", async () => {
      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.endCampaign("campaign-001");

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/end",
        {}
      );
    });

    it("should get campaign by name", async () => {
      const mockCampaign: Campaign = {
        campaignId: "campaign-001",
        campaignName: "Test Campaign",
        campaignStatus: "RUNNING",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockCampaign);

      const result = await marketingApi.getCampaignByName("Test Campaign");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/get_campaign_by_name",
        { campaign_name: "Test Campaign" }
      );
      expect(result.campaignName).toBe("Test Campaign");
    });

    it("should update campaign identification", async () => {
      const updateRequest: UpdateCampaignIdentificationRequest = {
        campaignName: "Updated Campaign Name",
      };

      vi.spyOn(mockClient, "put").mockResolvedValue(undefined);

      await marketingApi.updateCampaignIdentification(
        "campaign-001",
        updateRequest
      );

      expect(mockClient.put).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/update_campaign_identification",
        updateRequest
      );
    });
  });

  describe("Ad Management", () => {
    it("should get ads for a campaign", async () => {
      const mockResponse: AdPagedCollectionResponse = {
        total: 3,
        ads: [
          {
            adId: "ad-001",
            listingId: "listing-001",
            adStatus: "ACTIVE",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getAds("campaign-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get ads with filters", async () => {
      const mockResponse: AdPagedCollectionResponse = {
        total: 1,
        ads: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await marketingApi.getAds(
        "campaign-001",
        "adgroup-001",
        "ACTIVE",
        10,
        "listing-001",
        0
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad",
        {
          ad_group_ids: "adgroup-001",
          ad_status: "ACTIVE",
          limit: 10,
          listing_ids: "listing-001",
        }
      );
    });

    it("should get a specific ad", async () => {
      const mockAd: Ad = {
        adId: "ad-001",
        listingId: "listing-001",
        adStatus: "ACTIVE",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockAd);

      const result = await marketingApi.getAd("campaign-001", "ad-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad/ad-001"
      );
      expect(result.adId).toBe("ad-001");
    });

    it("should create an ad", async () => {
      const adRequest: CreateAdRequest = {
        listingId: "listing-001",
        bidPercentage: "5.0",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-001/ad/ad-002",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createAd("campaign-001", adRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad",
        adRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should delete an ad", async () => {
      vi.spyOn(mockClient, "delete").mockResolvedValue(undefined);

      await marketingApi.deleteAd("campaign-001", "ad-001");

      expect(mockClient.delete).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad/ad-001"
      );
    });

    it("should clone an ad", async () => {
      const adRequest: CreateAdRequest = {
        listingId: "listing-002",
        bidPercentage: "5.0",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-001/ad/ad-003",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.cloneAd(
        "campaign-001",
        "ad-001",
        adRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad/ad-001/clone",
        adRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get ads by listing ID", async () => {
      const mockAds = {
        ads: [{ adId: "ad-001", listingId: "listing-001" }],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockAds);

      const result = await marketingApi.getAdsByListingId(
        "campaign-001",
        "listing-001"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/get_ads_by_listing_id",
        { listing_id: "listing-001" }
      );
      expect(result).toEqual(mockAds);
    });

    it("should update bid for an ad", async () => {
      const bidUpdate = { bidPercentage: "7.5" };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.updateBid("campaign-001", "ad-001", bidUpdate);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad/ad-001/update_bid",
        bidUpdate
      );
    });

    it("should create ads by inventory reference", async () => {
      const mockResponse = { ads: [{ adId: "ad-001" }] };
      const request = {
        inventoryReferenceId: "ref-001",
        inventoryReferenceType: "INVENTORY_ITEM",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createAdsByInventoryReference(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/create_ads_by_inventory_reference",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get ads by inventory reference", async () => {
      const mockResponse = { ads: [{ adId: "ad-001" }] };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getAdsByInventoryReference(
        "campaign-001",
        "ref-001",
        "INVENTORY_ITEM"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/get_ads_by_inventory_reference",
        {
          inventory_reference_id: "ref-001",
          inventory_reference_type: "INVENTORY_ITEM",
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk create ads by inventory reference", async () => {
      const mockResponse = {
        responses: [{ statusCode: 201, adId: "ad-001" }],
      };
      const request = {
        requests: [
          {
            inventoryReferenceId: "ref-001",
            inventoryReferenceType: "INVENTORY_ITEM",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkCreateAdsByInventoryReference(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_create_ads_by_inventory_reference",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk create ads by listing ID", async () => {
      const mockResponse = {
        responses: [{ statusCode: 201, adId: "ad-001" }],
      };
      const request = {
        requests: [{ listingId: "listing-001" }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkCreateAdsByListingId(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_create_ads_by_listing_id",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk delete ads by inventory reference", async () => {
      const mockResponse = {
        responses: [{ statusCode: 204 }],
      };
      const request = {
        requests: [
          {
            inventoryReferenceId: "ref-001",
            inventoryReferenceType: "INVENTORY_ITEM",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkDeleteAdsByInventoryReference(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_delete_ads_by_inventory_reference",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk delete ads by listing ID", async () => {
      const mockResponse = {
        responses: [{ statusCode: 204 }],
      };
      const request = {
        requests: [{ listingId: "listing-001" }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkDeleteAdsByListingId(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_delete_ads_by_listing_id",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update ads bid by inventory reference", async () => {
      const mockResponse = {
        responses: [{ statusCode: 200 }],
      };
      const request = {
        requests: [
          {
            inventoryReferenceId: "ref-001",
            inventoryReferenceType: "INVENTORY_ITEM",
            bidPercentage: "10.5",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateAdsBidByInventoryReference(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_update_ads_bid_by_inventory_reference",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update ads bid by listing ID", async () => {
      const mockResponse = {
        responses: [{ statusCode: 200 }],
      };
      const request = {
        requests: [
          {
            listingId: "listing-001",
            bidPercentage: "10.5",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateAdsBidByListingId(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_update_ads_bid_by_listing_id",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update ads status", async () => {
      const mockResponse = {
        responses: [{ statusCode: 200 }],
      };
      const request = {
        requests: [
          {
            adId: "ad-001",
            adStatus: "ACTIVE",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateAdsStatus(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_update_ads_status",
        request
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update ads status by listing ID", async () => {
      const mockResponse = {
        responses: [{ statusCode: 200 }],
      };
      const request = {
        requests: [
          {
            listingId: "listing-001",
            adStatus: "ACTIVE",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateAdsStatusByListingId(
        "campaign-001",
        request
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_update_ads_status_by_listing_id",
        request
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Ad Group Management", () => {
    it("should create an ad group", async () => {
      const adGroupRequest: AdGroupRequest = {
        name: "Test Ad Group",
        defaultBid: { value: "1.00", currency: "USD" },
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createAdGroup(
        "campaign-001",
        adGroupRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group",
        adGroupRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get ad groups", async () => {
      const mockResponse: AdGroupPagedCollection = {
        total: 2,
        adGroups: [
          {
            adGroupId: "adgroup-001",
            name: "Test Ad Group",
            adGroupStatus: "ACTIVE",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getAdGroups("campaign-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get ad groups with filters", async () => {
      const mockResponse: AdGroupPagedCollection = {
        total: 1,
        adGroups: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await marketingApi.getAdGroups("campaign-001", "ACTIVE", 10, 0);

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group",
        {
          ad_group_status: "ACTIVE",
          limit: 10,
        }
      );
    });

    it("should get a specific ad group", async () => {
      const mockAdGroup: AdGroup = {
        adGroupId: "adgroup-001",
        name: "Test Ad Group",
        adGroupStatus: "ACTIVE",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockAdGroup);

      const result = await marketingApi.getAdGroup("campaign-001", "adgroup-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001"
      );
      expect(result.adGroupId).toBe("adgroup-001");
    });

    it("should clone an ad group", async () => {
      const cloneRequest: AdGroupRequest = {
        name: "Cloned Ad Group",
        defaultBid: { value: "1.00", currency: "USD" },
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-002",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.cloneAdGroup(
        "campaign-001",
        "adgroup-001",
        cloneRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/clone",
        cloneRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should suggest bids for an ad group", async () => {
      const mockBids: SuggestedBids = {
        suggestedBids: [
          {
            suggestedBidAmount: { value: "1.50", currency: "USD" },
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockBids);

      const result = await marketingApi.suggestBids(
        "campaign-001",
        "adgroup-001"
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/suggest_bids",
        {}
      );
      expect(result).toEqual(mockBids);
    });

    it("should update ad group bids", async () => {
      const updateBidsRequest: UpdateAdGroupBidsRequest = {
        requests: [
          {
            adGroupId: "adgroup-001",
            bidPercentage: "12.5",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.updateAdGroupBids(
        "campaign-001",
        "adgroup-001",
        updateBidsRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/update_ad_group_bids",
        updateBidsRequest
      );
    });

    it("should update ad group keywords", async () => {
      const updateKeywordsRequest: UpdateAdGroupKeywordsRequest = {
        requests: [
          {
            adGroupId: "adgroup-001",
            keywordText: "updated keyword",
            matchType: "PHRASE",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.updateAdGroupKeywords(
        "campaign-001",
        "adgroup-001",
        updateKeywordsRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/update_ad_group_keywords",
        updateKeywordsRequest
      );
    });
  });

  describe("Keyword Management", () => {
    it("should get keywords for an ad group", async () => {
      const mockResponse: KeywordPagedCollection = {
        total: 5,
        keywords: [
          {
            keywordId: "keyword-001",
            keywordText: "test keyword",
            keywordStatus: "ACTIVE",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getKeywords("campaign-001", "adgroup-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/keyword",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get keywords with filters", async () => {
      const mockResponse: KeywordPagedCollection = {
        total: 2,
        keywords: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await marketingApi.getKeywords(
        "campaign-001",
        "adgroup-001",
        "ACTIVE",
        10,
        0
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/keyword",
        {
          keyword_status: "ACTIVE",
          limit: 10,
        }
      );
    });

    it("should create a keyword", async () => {
      const keywordRequest: CreateKeywordRequest = {
        keywordText: "new keyword",
        matchType: "EXACT",
      };

      const mockResponse = {
        keywordId: "keyword-002",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createKeyword(
        "campaign-001",
        "adgroup-001",
        keywordRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/create_keyword",
        keywordRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get a specific keyword", async () => {
      const mockKeyword: Keyword = {
        keywordId: "keyword-001",
        keywordText: "test keyword",
        keywordStatus: "ACTIVE",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockKeyword);

      const result = await marketingApi.getKeyword(
        "campaign-001",
        "adgroup-001",
        "keyword-001"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/keyword/keyword-001"
      );
      expect(result.keywordId).toBe("keyword-001");
    });

    it("should delete a keyword", async () => {
      vi.spyOn(mockClient, "delete").mockResolvedValue(undefined);

      await marketingApi.deleteKeyword(
        "campaign-001",
        "adgroup-001",
        "keyword-001"
      );

      expect(mockClient.delete).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/keyword/keyword-001"
      );
    });

    it("should update keyword bid", async () => {
      const bidUpdate = { bidAmount: { value: "2.00", currency: "USD" } };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.updateKeywordBid(
        "campaign-001",
        "adgroup-001",
        "keyword-001",
        bidUpdate
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/keyword/keyword-001/update_bid",
        bidUpdate
      );
    });

    it("should suggest keywords for an ad group", async () => {
      const suggestRequest = { adIds: ["ad-001", "ad-002"] };
      const mockKeywords: SuggestedKeywords = {
        suggestedKeywords: [
          {
            keywordText: "suggested keyword",
          },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockKeywords);

      const result = await marketingApi.suggestKeywords(
        "campaign-001",
        "adgroup-001",
        suggestRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/suggest_keywords",
        suggestRequest
      );
      expect(result).toEqual(mockKeywords);
    });

    it("should bulk create keywords", async () => {
      const bulkRequest: BulkCreateKeywordRequest = {
        requests: [
          {
            keywordText: "bulk keyword 1",
            matchType: "EXACT",
          },
          {
            keywordText: "bulk keyword 2",
            matchType: "PHRASE",
          },
        ],
      };

      const mockResponse: BulkCreateKeywordResponse = {
        responses: [
          { statusCode: 201, keywordId: "keyword-100" },
          { statusCode: 201, keywordId: "keyword-101" },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkCreateKeywords(
        "campaign-001",
        "adgroup-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/bulk_create_keywords",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk delete keywords", async () => {
      const bulkRequest: BulkDeleteKeywordRequest = {
        requests: [{ keywordId: "keyword-001" }, { keywordId: "keyword-002" }],
      };

      const mockResponse: BulkDeleteKeywordResponse = {
        responses: [{ statusCode: 204 }, { statusCode: 204 }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkDeleteKeywords(
        "campaign-001",
        "adgroup-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/bulk_delete_keywords",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update keyword bids", async () => {
      const bulkRequest: BulkUpdateKeywordBidRequest = {
        requests: [
          {
            keywordId: "keyword-001",
            bidAmount: { value: "2.50", currency: "USD" },
          },
          {
            keywordId: "keyword-002",
            bidAmount: { value: "3.00", currency: "USD" },
          },
        ],
      };

      const mockResponse: BulkUpdateKeywordBidResponse = {
        responses: [{ statusCode: 200 }, { statusCode: 200 }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateKeywordBids(
        "campaign-001",
        "adgroup-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/ad_group/adgroup-001/bulk_update_keyword_bids",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Negative Keyword Management", () => {
    it("should get negative keywords for a campaign", async () => {
      const mockResponse: NegativeKeywordPagedCollection = {
        total: 3,
        negativeKeywords: [
          {
            negativeKeywordId: "neg-001",
            negativeKeywordText: "excluded keyword",
            negativeKeywordStatus: "ACTIVE",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getNegativeKeywords("campaign-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/negative_keyword",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should create a negative keyword for a campaign", async () => {
      const negKeywordRequest: CreateNegativeKeywordRequest = {
        negativeKeywordText: "excluded word",
        negativeKeywordMatchType: "EXACT",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_campaign/campaign-001/negative_keyword/neg-002",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createNegativeKeyword(
        "campaign-001",
        negKeywordRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/negative_keyword",
        negKeywordRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get a specific negative keyword", async () => {
      const mockNegKeyword: NegativeKeyword = {
        negativeKeywordId: "neg-001",
        negativeKeywordText: "excluded keyword",
        negativeKeywordStatus: "ACTIVE",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockNegKeyword);

      const result = await marketingApi.getNegativeKeyword(
        "campaign-001",
        "neg-001"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/negative_keyword/neg-001"
      );
      expect(result.negativeKeywordId).toBe("neg-001");
    });

    it("should delete a negative keyword", async () => {
      vi.spyOn(mockClient, "delete").mockResolvedValue(undefined);

      await marketingApi.deleteNegativeKeyword("campaign-001", "neg-001");

      expect(mockClient.delete).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/negative_keyword/neg-001"
      );
    });

    it("should get negative keywords for an ad group", async () => {
      const mockResponse: NegativeKeywordPagedCollection = {
        total: 2,
        negativeKeywords: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getNegativeKeywordsForAdGroup(
        "adgroup-001",
        10,
        0
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/negative_keyword",
        { limit: 10 }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should create a negative keyword for an ad group", async () => {
      const negKeywordRequest: CreateNegativeKeywordRequest = {
        negativeKeywordText: "excluded word",
        negativeKeywordMatchType: "PHRASE",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/ad_group/adgroup-001/negative_keyword/neg-003",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createNegativeKeywordForAdGroup(
        "adgroup-001",
        negKeywordRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/negative_keyword",
        negKeywordRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk create negative keywords for a campaign", async () => {
      const bulkRequest: BulkCreateNegativeKeywordRequest = {
        requests: [
          {
            negativeKeywordText: "excluded 1",
            negativeKeywordMatchType: "EXACT",
          },
          {
            negativeKeywordText: "excluded 2",
            negativeKeywordMatchType: "PHRASE",
          },
        ],
      };

      const mockResponse: BulkCreateNegativeKeywordResponse = {
        responses: [
          { statusCode: 201, negativeKeywordId: "neg-100" },
          { statusCode: 201, negativeKeywordId: "neg-101" },
        ],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkCreateNegativeKeywords(
        "campaign-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_create_negative_keywords",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk delete negative keywords for a campaign", async () => {
      const bulkRequest: BulkDeleteNegativeKeywordRequest = {
        requests: [
          { negativeKeywordId: "neg-001" },
          { negativeKeywordId: "neg-002" },
        ],
      };

      const mockResponse: BulkDeleteNegativeKeywordResponse = {
        responses: [{ statusCode: 204 }, { statusCode: 204 }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkDeleteNegativeKeywords(
        "campaign-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_delete_negative_keywords",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update negative keywords for a campaign", async () => {
      const bulkRequest: BulkUpdateNegativeKeywordRequest = {
        requests: [
          {
            negativeKeywordId: "neg-001",
            negativeKeywordStatus: "ACTIVE",
          },
          {
            negativeKeywordId: "neg-002",
            negativeKeywordStatus: "PAUSED",
          },
        ],
      };

      const mockResponse: BulkUpdateNegativeKeywordResponse = {
        responses: [{ statusCode: 200 }, { statusCode: 200 }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateNegativeKeywords(
        "campaign-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/bulk_update_negative_keyword",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should update a negative keyword for a campaign", async () => {
      const updateRequest = {
        negativeKeywordStatus: "PAUSED",
      };

      vi.spyOn(mockClient, "put").mockResolvedValue(undefined);

      await marketingApi.updateNegativeKeyword(
        "campaign-001",
        "neg-001",
        updateRequest
      );

      expect(mockClient.put).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/negative_keyword/neg-001",
        updateRequest
      );
    });

    it("should bulk create negative keywords for an ad group", async () => {
      const bulkRequest: BulkCreateNegativeKeywordRequest = {
        requests: [
          {
            negativeKeywordText: "excluded 1",
            negativeKeywordMatchType: "EXACT",
          },
        ],
      };

      const mockResponse: BulkCreateNegativeKeywordResponse = {
        responses: [{ statusCode: 201, negativeKeywordId: "neg-200" }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkCreateNegativeKeywordsForAdGroup(
        "adgroup-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/bulk_create_negative_keyword",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk delete negative keywords for an ad group", async () => {
      const bulkRequest: BulkDeleteNegativeKeywordRequest = {
        requests: [{ negativeKeywordId: "neg-001" }],
      };

      const mockResponse: BulkDeleteNegativeKeywordResponse = {
        responses: [{ statusCode: 204 }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkDeleteNegativeKeywordsForAdGroup(
        "adgroup-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/bulk_delete_negative_keyword",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should bulk update negative keywords for an ad group", async () => {
      const bulkRequest: BulkUpdateNegativeKeywordRequest = {
        requests: [
          {
            negativeKeywordId: "neg-001",
            negativeKeywordStatus: "ACTIVE",
          },
        ],
      };

      const mockResponse: BulkUpdateNegativeKeywordResponse = {
        responses: [{ statusCode: 200 }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.bulkUpdateNegativeKeywordsForAdGroup(
        "adgroup-001",
        bulkRequest
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/bulk_update_negative_keyword",
        bulkRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get a specific negative keyword for an ad group", async () => {
      const mockNegKeyword: NegativeKeyword = {
        negativeKeywordId: "neg-001",
        negativeKeywordText: "excluded keyword",
        negativeKeywordStatus: "ACTIVE",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockNegKeyword);

      const result = await marketingApi.getNegativeKeywordForAdGroup(
        "adgroup-001",
        "neg-001"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/negative_keyword/neg-001"
      );
      expect(result.negativeKeywordId).toBe("neg-001");
    });

    it("should delete a negative keyword for an ad group", async () => {
      vi.spyOn(mockClient, "delete").mockResolvedValue(undefined);

      await marketingApi.deleteNegativeKeywordForAdGroup(
        "adgroup-001",
        "neg-001"
      );

      expect(mockClient.delete).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/negative_keyword/neg-001"
      );
    });

    it("should update a negative keyword for an ad group", async () => {
      const updateRequest = {
        negativeKeywordStatus: "PAUSED",
      };

      vi.spyOn(mockClient, "put").mockResolvedValue(undefined);

      await marketingApi.updateNegativeKeywordForAdGroup(
        "adgroup-001",
        "neg-001",
        updateRequest
      );

      expect(mockClient.put).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_group/adgroup-001/negative_keyword/neg-001",
        updateRequest
      );
    });
  });

  describe("Promotion Management", () => {
    it("should get promotions", async () => {
      const mockResponse = {
        total: 4,
        promotions: [
          {
            promotionId: "promo-001",
            promotionType: "VOLUME_DISCOUNT",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getPromotions();

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/promotion",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get promotions with filters", async () => {
      const mockResponse = {
        total: 1,
        promotions: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await marketingApi.getPromotions("EBAY_US", 10);

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/promotion",
        {
          marketplace_id: "EBAY_US",
          limit: 10,
        }
      );
    });

    it("should create a promotion", async () => {
      const promotionRequest: ItemPromotion = {
        name: "Test Promotion",
        promotionType: "VOLUME_DISCOUNT",
        marketplaceId: "EBAY_US",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/item_promotion/promo-002",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(mockResponse);

      const result = await marketingApi.createPromotion(promotionRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/item_promotion",
        promotionRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get an item promotion", async () => {
      const mockPromotion = {
        promotionId: "promo-001",
        promotionType: "VOLUME_DISCOUNT",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockPromotion);

      const result = await marketingApi.getItemPromotion("promo-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/item_promotion/promo-001"
      );
      expect(result).toEqual(mockPromotion);
    });

    it("should delete an item promotion", async () => {
      vi.spyOn(mockClient, "delete").mockResolvedValue(undefined);

      await marketingApi.deleteItemPromotion("promo-001");

      expect(mockClient.delete).toHaveBeenCalledWith(
        "/sell/marketing/v1/item_promotion/promo-001"
      );
    });

    it("should pause an item promotion", async () => {
      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.pauseItemPromotion("promo-001");

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/item_promotion/promo-001/pause",
        {}
      );
    });

    it("should resume an item promotion", async () => {
      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.resumeItemPromotion("promo-001");

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/item_promotion/promo-001/resume",
        {}
      );
    });

    it("should update an item promotion", async () => {
      const updateRequest = {
        name: "Updated Promotion",
      };

      const mockResponse: BaseResponse = {
        href: "/sell/marketing/v1/item_promotion/promo-001",
      };

      vi.spyOn(mockClient, "put").mockResolvedValue(mockResponse);

      const result = await marketingApi.updateItemPromotion(
        "promo-001",
        updateRequest
      );

      expect(mockClient.put).toHaveBeenCalledWith(
        "/sell/marketing/v1/item_promotion/promo-001",
        updateRequest
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Reporting", () => {
    it("should get ad report", async () => {
      const mockReport = {
        dimensions: ["LISTING_ID"],
        metrics: ["CLICK"],
        records: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockReport);

      const result = await marketingApi.getAdReport(
        "LISTING_ID",
        "CLICK",
        "2025-01-01",
        "2025-01-31"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report",
        {
          dimension: "LISTING_ID",
          metric: "CLICK",
          start_date: "2025-01-01",
          end_date: "2025-01-31",
        }
      );
      expect(result).toEqual(mockReport);
    });

    it("should get ad report with optional parameters", async () => {
      const mockReport = {
        dimensions: ["LISTING_ID"],
        metrics: ["CLICK"],
        records: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockReport);

      await marketingApi.getAdReport(
        "LISTING_ID",
        "CLICK",
        "2025-01-01",
        "2025-01-31",
        "CLICK",
        "listing-001,listing-002",
        "EBAY_US"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report",
        {
          dimension: "LISTING_ID",
          metric: "CLICK",
          start_date: "2025-01-01",
          end_date: "2025-01-31",
          sort: "CLICK",
          listing_ids: "listing-001,listing-002",
          marketplace_id: "EBAY_US",
        }
      );
    });

    it("should get ad report metadata", async () => {
      const mockMetadata: ReportMetadatas = {
        reportMetadatas: [
          {
            reportType: "CAMPAIGN_PERFORMANCE",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockMetadata);

      const result = await marketingApi.getAdReportMetadata();

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report_metadata"
      );
      expect(result).toEqual(mockMetadata);
    });

    it("should get ad report metadata for report type", async () => {
      const mockMetadata: ReportMetadata = {
        reportType: "CAMPAIGN_PERFORMANCE",
        dimensions: ["CAMPAIGN_ID"],
        metrics: ["IMPRESSIONS"],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockMetadata);

      const result = await marketingApi.getAdReportMetadataForReportType(
        "CAMPAIGN_PERFORMANCE"
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report_metadata/CAMPAIGN_PERFORMANCE"
      );
      expect(result).toEqual(mockMetadata);
    });

    it("should create a report task", async () => {
      const reportTaskRequest: CreateReportTask = {
        reportType: "CAMPAIGN_PERFORMANCE_REPORT",
        dateFrom: "2025-01-01",
        dateTo: "2025-01-31",
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.createReportTask(reportTaskRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report_task",
        reportTaskRequest
      );
    });

    it("should get report tasks", async () => {
      const mockResponse: ReportTaskPagedCollection = {
        total: 5,
        reportTasks: [
          {
            reportTaskId: "task-001",
            reportTaskStatus: "SUCCESS",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getReportTasks();

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report_task",
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get report tasks with filters", async () => {
      const mockResponse: ReportTaskPagedCollection = {
        total: 2,
        reportTasks: [],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      await marketingApi.getReportTasks("SUCCESS", 10, 0);

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report_task",
        {
          report_task_statuses: "SUCCESS",
          limit: 10,
        }
      );
    });

    it("should get a specific report task", async () => {
      const mockTask: ReportTask = {
        reportTaskId: "task-001",
        reportTaskStatus: "SUCCESS",
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockTask);

      const result = await marketingApi.getReportTask("task-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_report_task/task-001"
      );
      expect(result.reportTaskId).toBe("task-001");
    });

    it("should get promotion report", async () => {
      const mockResponse: PromotionsReportPagedCollection = {
        total: 3,
        promotionReports: [
          {
            promotionId: "promo-001",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getPromotionReport("EBAY_US");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/promotion_report",
        { marketplace_id: "EBAY_US" }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should get promotion summary report", async () => {
      const mockResponse: SummaryReportResponse = {
        totalSales: { value: "1000.00", currency: "USD" },
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockResponse);

      const result = await marketingApi.getPromotionSummaryReport("EBAY_US");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/promotion_summary_report",
        { marketplace_id: "EBAY_US" }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Targeting", () => {
    it("should get targeting for a campaign", async () => {
      const mockTargeting = {
        targetingCriteria: [
          {
            criteriaType: "KEYWORD",
          },
        ],
      };

      vi.spyOn(mockClient, "get").mockResolvedValue(mockTargeting);

      const result = await marketingApi.getTargeting("campaign-001");

      expect(mockClient.get).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/targeting"
      );
      expect(result).toEqual(mockTargeting);
    });

    it("should create targeting for a campaign", async () => {
      const targetingRequest = {
        targetingCriteria: [{ criteriaType: "KEYWORD" }],
      };

      vi.spyOn(mockClient, "post").mockResolvedValue(undefined);

      await marketingApi.createTargeting("campaign-001", targetingRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/targeting",
        targetingRequest
      );
    });

    it("should update targeting for a campaign", async () => {
      const targetingRequest = {
        targetingCriteria: [{ criteriaType: "CATEGORY" }],
      };

      vi.spyOn(mockClient, "put").mockResolvedValue(undefined);

      await marketingApi.updateTargeting("campaign-001", targetingRequest);

      expect(mockClient.put).toHaveBeenCalledWith(
        "/sell/marketing/v1/ad_campaign/campaign-001/targeting",
        targetingRequest
      );
    });
  });
});
