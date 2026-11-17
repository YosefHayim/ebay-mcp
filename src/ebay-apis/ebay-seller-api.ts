import { AccountApi } from '@/ebay-apis/account/account-api.js';
import { AccountV2Api } from '@/ebay-apis/account/account-v2-api.js';
import { FinancesApi } from '@/ebay-apis/finances/finances-api.js';
import { AnalyticsApi } from '@/ebay-apis/analytics/analytics-api.js';
import { EbayApiClient } from '@/ebay-client/ebay-api-client.js';
import { FeedbackApi } from '@/ebay-apis/communication/feedback-api.js';
import { MessageApi } from '@/ebay-apis/communication/message-api.js';
import { NegotiationApi } from '@/ebay-apis/communication/negotiation-api.js';
import { NotificationApi } from '@/ebay-apis/communication/notification-api.js';
import { DeveloperApi } from '@/ebay-apis/developer/developer-api.js';
import { FeedApi } from '@/ebay-apis/feed/feed-api.js';
import { InventoryApi } from '@/ebay-apis/inventory/inventory-api.js';
import { MediaApi } from '@/ebay-apis/inventory/media-api.js';
import { StoresApi } from '@/ebay-apis/stores/stores-api.js';
import { CharityApi } from '@/ebay-apis/taxonomy/charity-api.js';
import { MetadataApi } from '@/ebay-apis/metadata/metadata-api.js';
import { TaxonomyApi } from '@/ebay-apis/taxonomy/taxonomy-api.js';
import { MarketingApi } from '@/ebay-apis/marketing/marketing-api.js';
import { RecommendationApi } from '@/ebay-apis/marketing/recommendation-api.js';
import { DisputeApi } from '@/ebay-apis/fulfillment/dispute-api.js';
import { FulfillmentApi } from '@/ebay-apis/fulfillment/fulfillment-api.js';
import { LogisticsApi } from '@/ebay-apis/logistics/logistics-api.js';
import { EDeliveryApi } from '@/ebay-apis/other/edelivery/edelivery-api.js';
import { BrowseApi } from '@/ebay-apis/browse/browse-api.js';
import { IdentityApi } from '@/ebay-apis/other/identity/identity-api.js';
import { TranslationApi } from '@/ebay-apis/other/translation/translation-api.js';
import { VeroApi } from '@/ebay-apis/other/vero/vero-api.js';
import { TradingApiClient } from '@/ebay-client/trading-api-client.js';
import { TradingApi } from '@/ebay-apis/trading/trading-api.js';
import type { EbayOAuthError } from '@/auth/oauth.js';
import type { EbayConfig } from '@/shared/ebay.js';
import type { Effect } from 'effect';

/**
 * Main API facade providing access to all eBay APIs
 */
export class EbaySellerApi {
  private client: EbayApiClient;
  private readonly config: EbayConfig;

  // API categories
  public account: AccountApi;
  public accountV2: AccountV2Api;
  public finances: FinancesApi;
  public inventory: InventoryApi;
  public media: MediaApi;
  public feed: FeedApi;
  public stores: StoresApi;
  public fulfillment: FulfillmentApi;
  public logistics: LogisticsApi;
  public dispute: DisputeApi;
  public marketing: MarketingApi;
  public recommendation: RecommendationApi;
  public analytics: AnalyticsApi;
  public metadata: MetadataApi;
  public taxonomy: TaxonomyApi;
  public charity: CharityApi;
  public negotiation: NegotiationApi;
  public message: MessageApi;
  public notification: NotificationApi;
  public feedback: FeedbackApi;
  public identity: IdentityApi;
  public vero: VeroApi;
  public translation: TranslationApi;
  public edelivery: EDeliveryApi;
  public browse: BrowseApi;
  public developer: DeveloperApi;
  public trading: TradingApi;

  constructor(config: EbayConfig) {
    this.config = config;
    this.client = new EbayApiClient(config);

    // Initialize API category handlers
    this.account = new AccountApi(this.client);
    this.accountV2 = new AccountV2Api(this.client);
    this.finances = new FinancesApi(this.client);
    this.inventory = new InventoryApi(this.client);
    this.media = new MediaApi(this.client, this.inventory);
    this.feed = new FeedApi(this.client);
    this.stores = new StoresApi(this.client);
    this.fulfillment = new FulfillmentApi(this.client);
    this.logistics = new LogisticsApi(this.client);
    this.dispute = new DisputeApi(this.client);
    this.marketing = new MarketingApi(this.client);
    this.recommendation = new RecommendationApi(this.client);
    this.analytics = new AnalyticsApi(this.client);
    this.metadata = new MetadataApi(this.client);
    this.taxonomy = new TaxonomyApi(this.client);
    this.charity = new CharityApi(this.client);
    this.negotiation = new NegotiationApi(this.client);
    this.message = new MessageApi(this.client);
    this.notification = new NotificationApi(this.client);
    this.feedback = new FeedbackApi(this.client);
    this.identity = new IdentityApi(this.client);
    this.vero = new VeroApi(this.client);
    this.translation = new TranslationApi(this.client);
    this.edelivery = new EDeliveryApi(this.client);
    this.browse = new BrowseApi(this.client);
    this.developer = new DeveloperApi(this.client);
    const tradingClient = new TradingApiClient(this.client);
    this.trading = new TradingApi(tradingClient);
  }

  /**
   * Initialize the API (load tokens from storage)
   */
  initialize = (): Effect.Effect<void, EbayOAuthError> => this.client.initialize();

  /**
   * Check if the API client is authenticated
   */
  isAuthenticated(): boolean {
    return this.client.isAuthenticated();
  }

  /**
   * Check if user tokens are available
   */
  hasUserTokens(): boolean {
    return this.client.hasUserTokens();
  }

  /**
   * Set user access and refresh tokens
   */
  setUserTokens = (
    accessToken: string,
    refreshToken: string,
    accessTokenExpiry?: number,
    refreshTokenExpiry?: number,
  ): Effect.Effect<void, EbayOAuthError> =>
    this.client.setUserTokens(accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry);

  /**
   * Get OAuth client for advanced operations
   */
  getAuthClient(): EbayApiClient {
    return this.client;
  }

  /**
   * Returns the validated runtime configuration used to construct this API facade.
   *
   * @returns eBay API runtime configuration with credentials, environment, and proxy flags.
   *
   * @example
   * ```ts
   * const environment = api.getConfig().environment;
   * ```
   */
  getConfig(): EbayConfig {
    return this.config;
  }

  /**
   * Get token information for debugging
   */
  getTokenInfo() {
    return this.client.getTokenInfo();
  }
}

export * from '@/ebay-apis/account/account-api.js';
export * from '@/ebay-apis/account/account-v2-api.js';
export * from '@/ebay-apis/finances/finances-api.js';
export * from '@/ebay-apis/analytics/analytics-api.js';
export * from '@/ebay-client/ebay-api-client.js';
export * from '@/ebay-apis/communication/feedback-api.js';
export * from '@/ebay-apis/communication/message-api.js';
export * from '@/ebay-apis/communication/negotiation-api.js';
export * from '@/ebay-apis/communication/notification-api.js';
export * from '@/ebay-apis/feed/feed-api.js';
export * from '@/ebay-apis/inventory/inventory-api.js';
export * from '@/ebay-apis/inventory/media-api.js';
export * from '@/ebay-apis/inventory/media-attach-api.js';
export * from '@/ebay-apis/stores/stores-api.js';
export * from '@/ebay-apis/taxonomy/charity-api.js';
export * from '@/ebay-apis/metadata/metadata-api.js';
export * from '@/ebay-apis/taxonomy/taxonomy-api.js';
export * from '@/ebay-apis/marketing/marketing-api.js';
export * from '@/ebay-apis/marketing/recommendation-api.js';
export * from '@/ebay-apis/fulfillment/dispute-api.js';
export * from '@/ebay-apis/fulfillment/fulfillment-api.js';
export * from '@/ebay-apis/logistics/logistics-api.js';
export * from '@/ebay-apis/other/edelivery/edelivery-api.js';
export * from '@/ebay-apis/other/identity/identity-api.js';
export * from '@/ebay-apis/other/translation/translation-api.js';
export * from '@/ebay-apis/other/vero/vero-api.js';
export * from '@/ebay-apis/developer/developer-api.js';
export * from '@/ebay-apis/trading/trading-api.js';
export * from '@/ebay-client/trading-api-client.js';
