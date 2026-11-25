import type { EbayApiClient } from '@/ebay-client/ebayApiClient.js';
import { createMarketingAdsMethods } from './adsApi.js';
import { createMarketingCampaignsMethods } from './campaignsApi.js';
import { createMarketingPromotionsMethods } from './promotionsApi.js';
import { createMarketingReportsMethods } from './reportsApi.js';

type MarketingAdsMethods = ReturnType<typeof createMarketingAdsMethods>;
type MarketingCampaignsMethods = ReturnType<typeof createMarketingCampaignsMethods>;
type MarketingPromotionsMethods = ReturnType<typeof createMarketingPromotionsMethods>;
type MarketingReportsMethods = ReturnType<typeof createMarketingReportsMethods>;

export type {
  BulkCreateAdsByInventoryReferenceResponse,
  BulkCreateAdsByListingIdResponse,
  BulkDeleteAdsByInventoryReferenceResponse,
  BulkDeleteAdsByListingIdResponse,
  BulkUpdateAdsBidByInventoryReferenceResponse,
  BulkUpdateAdsBidByListingIdResponse,
  BulkUpdateAdsStatusResponse,
  BulkUpdateAdsStatusByListingIdResponse,
  GetAdsResponse,
  CreateAdByListingIdResponse,
  CreateAdsByInventoryReferenceResponse,
  GetAdResponse,
  DeleteAdResponse,
  DeleteAdsByInventoryReferenceResponse,
  GetAdsByInventoryReferenceResponse,
  UpdateBidResponse,
  GetAdGroupsResponse,
  CreateAdGroupResponse,
  GetAdGroupResponse,
  UpdateAdGroupResponse,
  SuggestBidsResponse,
  SuggestKeywordsResponse,
  BulkCreateKeywordResponse,
  BulkUpdateKeywordResponse,
  GetKeywordsResponse,
  CreateKeywordResponse,
  GetKeywordResponse,
  UpdateKeywordResponse,
  BulkCreateNegativeKeywordResponse,
  BulkUpdateNegativeKeywordResponse,
  GetNegativeKeywordsResponse,
  CreateNegativeKeywordResponse,
  GetNegativeKeywordResponse,
  UpdateNegativeKeywordResponse,
} from './adsApi.js';
export type {
  CloneCampaignResponse,
  GetCampaignsResponse,
  CreateCampaignResponse,
  GetCampaignResponse,
  DeleteCampaignResponse,
  EndCampaignResponse,
  FindCampaignByAdReferenceResponse,
  GetCampaignByNameResponse,
  PauseCampaignResponse,
  ResumeCampaignResponse,
  SuggestBudgetResponse,
  SuggestItemsResponse,
  SuggestMaxCpcResponse,
  UpdateAdRateStrategyResponse,
  UpdateBiddingStrategyResponse,
  UpdateCampaignBudgetResponse,
  UpdateCampaignIdentificationResponse,
} from './campaignsApi.js';
export type {
  GetReportResponse,
  GetReportMetadataResponse,
  GetReportMetadataForReportTypeResponse,
  GetReportTasksResponse,
  CreateReportTaskResponse,
  GetReportTaskResponse,
  DeleteReportTaskResponse,
} from './reportsApi.js';
export type {
  CreateItemPriceMarkdownPromotionResponse,
  GetItemPriceMarkdownPromotionResponse,
  UpdateItemPriceMarkdownPromotionResponse,
  DeleteItemPriceMarkdownPromotionResponse,
  CreateItemPromotionResponse,
  GetItemPromotionResponse,
  UpdateItemPromotionResponse,
  DeleteItemPromotionResponse,
  GetListingSetResponse,
  GetPromotionsResponse,
  PausePromotionResponse,
  ResumePromotionResponse,
  GetPromotionReportsResponse,
  GetPromotionSummaryReportResponse,
  GetEmailCampaignsResponse,
  CreateEmailCampaignResponse,
  GetEmailCampaignResponse,
  UpdateEmailCampaignResponse,
  DeleteEmailCampaignResponse,
  GetAudiencesResponse,
  GetEmailPreviewResponse,
  GetEmailReportResponse,
} from './promotionsApi.js';

/**
 * Marketing API surface: campaigns, ads, promotions, reports, and email campaigns.
 * Implementation is split by subdomain; `new MarketingApi(client)` keeps stable method names.
 */
export interface MarketingApi
  extends MarketingAdsMethods,
    MarketingCampaignsMethods,
    MarketingPromotionsMethods,
    MarketingReportsMethods {}

/**
 * Composes Marketing subdomain method maps onto one facade instance.
 */
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
