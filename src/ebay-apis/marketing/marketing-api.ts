import type { EbayApiClient } from '@/ebay-client/ebay-api-client.js';
import { createMarketingAdsMethods } from './ads-api.js';
import { createMarketingCampaignsMethods } from './campaigns-api.js';
import { createMarketingPromotionsMethods } from './promotions-api.js';
import { createMarketingReportsMethods } from './reports-api.js';

type MarketingAdsMethods = ReturnType<typeof createMarketingAdsMethods>;
type MarketingCampaignsMethods = ReturnType<typeof createMarketingCampaignsMethods>;
type MarketingPromotionsMethods = ReturnType<typeof createMarketingPromotionsMethods>;
type MarketingReportsMethods = ReturnType<typeof createMarketingReportsMethods>;

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
