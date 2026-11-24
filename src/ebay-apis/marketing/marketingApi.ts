import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { createMarketingAdsMethods } from "./adsApi.js";
import { createMarketingCampaignsMethods } from "./campaignsApi.js";
import { createMarketingPromotionsMethods } from "./promotionsApi.js";
import { createMarketingReportsMethods } from "./reportsApi.js";

type MarketingAdsMethods = ReturnType<typeof createMarketingAdsMethods>;
type MarketingCampaignsMethods = ReturnType<
	typeof createMarketingCampaignsMethods
>;
type MarketingPromotionsMethods = ReturnType<
	typeof createMarketingPromotionsMethods
>;
type MarketingReportsMethods = ReturnType<typeof createMarketingReportsMethods>;

export type {
	BulkCreateAdsByInventoryReferenceResponse,
	BulkCreateAdsByListingIdResponse,
	BulkCreateKeywordResponse,
	BulkCreateNegativeKeywordResponse,
	BulkDeleteAdsByInventoryReferenceResponse,
	BulkDeleteAdsByListingIdResponse,
	BulkUpdateAdsBidByInventoryReferenceResponse,
	BulkUpdateAdsBidByListingIdResponse,
	BulkUpdateAdsStatusByListingIdResponse,
	BulkUpdateAdsStatusResponse,
	BulkUpdateKeywordResponse,
	BulkUpdateNegativeKeywordResponse,
	CreateAdByListingIdResponse,
	CreateAdGroupResponse,
	CreateAdsByInventoryReferenceResponse,
	CreateKeywordResponse,
	CreateNegativeKeywordResponse,
	DeleteAdResponse,
	DeleteAdsByInventoryReferenceResponse,
	GetAdGroupResponse,
	GetAdGroupsResponse,
	GetAdResponse,
	GetAdsByInventoryReferenceResponse,
	GetAdsResponse,
	GetKeywordResponse,
	GetKeywordsResponse,
	GetNegativeKeywordResponse,
	GetNegativeKeywordsResponse,
	SuggestBidsResponse,
	SuggestKeywordsResponse,
	UpdateAdGroupResponse,
	UpdateBidResponse,
	UpdateKeywordResponse,
	UpdateNegativeKeywordResponse,
} from "./adsApi.js";
export type {
	CloneCampaignResponse,
	CreateCampaignResponse,
	DeleteCampaignResponse,
	EndCampaignResponse,
	FindCampaignByAdReferenceResponse,
	GetCampaignByNameResponse,
	GetCampaignResponse,
	GetCampaignsResponse,
	PauseCampaignResponse,
	ResumeCampaignResponse,
	SuggestBudgetResponse,
	SuggestItemsResponse,
	SuggestMaxCpcResponse,
	UpdateAdRateStrategyResponse,
	UpdateBiddingStrategyResponse,
	UpdateCampaignBudgetResponse,
	UpdateCampaignIdentificationResponse,
} from "./campaignsApi.js";
export type {
	CreateEmailCampaignResponse,
	CreateItemPriceMarkdownPromotionResponse,
	CreateItemPromotionResponse,
	DeleteEmailCampaignResponse,
	DeleteItemPriceMarkdownPromotionResponse,
	DeleteItemPromotionResponse,
	GetAudiencesResponse,
	GetEmailCampaignResponse,
	GetEmailCampaignsResponse,
	GetEmailPreviewResponse,
	GetEmailReportResponse,
	GetItemPriceMarkdownPromotionResponse,
	GetItemPromotionResponse,
	GetListingSetResponse,
	GetPromotionReportsResponse,
	GetPromotionSummaryReportResponse,
	GetPromotionsResponse,
	PausePromotionResponse,
	ResumePromotionResponse,
	UpdateEmailCampaignResponse,
	UpdateItemPriceMarkdownPromotionResponse,
	UpdateItemPromotionResponse,
} from "./promotionsApi.js";
export type {
	CreateReportTaskResponse,
	DeleteReportTaskResponse,
	GetReportMetadataForReportTypeResponse,
	GetReportMetadataResponse,
	GetReportResponse,
	GetReportTaskResponse,
	GetReportTasksResponse,
} from "./reportsApi.js";

export interface MarketingApi
	extends MarketingAdsMethods,
		MarketingCampaignsMethods,
		MarketingPromotionsMethods,
		MarketingReportsMethods {}

export class MarketingApi {
	public constructor(client: EbayApiClient) {
		Object.assign(
			this,
			createMarketingAdsMethods(client),
			createMarketingCampaignsMethods(client),
			createMarketingPromotionsMethods(client),
			createMarketingReportsMethods(client),
		);
	}
}
