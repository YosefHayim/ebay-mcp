import { AccountApi } from '@/api/account-management/account.js';
import { AnalyticsApi } from '@/api/analytics-and-report/analytics.js';
import { EbayApiClient } from '@/api/client.js';
import { FeedbackApi } from '@/api/communication/feedback.js';
import { MessageApi } from '@/api/communication/message.js';
import { NegotiationApi } from '@/api/communication/negotiation.js';
import { NotificationApi } from '@/api/communication/notification.js';
import { DeveloperApi } from '@/api/developer/developer.js';
import { InventoryApi } from '@/api/listing-management/inventory.js';
import { MediaApi } from '@/api/listing-management/media.js';
import { MetadataApi } from '@/api/listing-metadata/metadata.js';
import { TaxonomyApi } from '@/api/listing-metadata/taxonomy.js';
import { MarketingApi } from '@/api/marketing-and-promotions/marketing.js';
import { RecommendationApi } from '@/api/marketing-and-promotions/recommendation.js';
import { DisputeApi } from '@/api/order-management/dispute.js';
import { FulfillmentApi } from '@/api/order-management/fulfillment.js';
import { ComplianceApi } from '@/api/other/compliance.js';
import { EDeliveryApi } from '@/api/other/edelivery.js';
import { FindingApi } from '@/api/other/finding.js';
import { IdentityApi } from '@/api/other/identity.js';
import { TranslationApi } from '@/api/other/translation.js';
import { VeroApi } from '@/api/other/vero.js';
import { TradingApiClient } from '@/api/clientTrading.js';
import { TradingApi } from '@/api/trading/trading.js';
import type { EbayOAuthError } from '@/auth/oauth.js';
import type { EbayConfig } from '@/types/ebay.js';
import type { Effect } from 'effect';

/**
 * Main API facade providing access to all eBay APIs
 */
export class EbaySellerApi {
  private client: EbayApiClient;
  private readonly config: EbayConfig;

  // API categories
  public account: AccountApi;
  public inventory: InventoryApi;
  public media: MediaApi;
  public fulfillment: FulfillmentApi;
  public dispute: DisputeApi;
  public marketing: MarketingApi;
  public recommendation: RecommendationApi;
  public analytics: AnalyticsApi;
  public metadata: MetadataApi;
  public taxonomy: TaxonomyApi;
  public negotiation: NegotiationApi;
  public message: MessageApi;
  public notification: NotificationApi;
  public feedback: FeedbackApi;
  public identity: IdentityApi;
  public compliance: ComplianceApi;
  public vero: VeroApi;
  public translation: TranslationApi;
  public edelivery: EDeliveryApi;
  public finding: FindingApi;
  public developer: DeveloperApi;
  public trading: TradingApi;

  constructor(config: EbayConfig) {
    this.config = config;
    this.client = new EbayApiClient(config);

    // Initialize API category handlers
    this.account = new AccountApi(this.client);
    this.inventory = new InventoryApi(this.client);
    this.media = new MediaApi(this.client, this.inventory);
    this.fulfillment = new FulfillmentApi(this.client);
    this.dispute = new DisputeApi(this.client);
    this.marketing = new MarketingApi(this.client);
    this.recommendation = new RecommendationApi(this.client);
    this.analytics = new AnalyticsApi(this.client);
    this.metadata = new MetadataApi(this.client);
    this.taxonomy = new TaxonomyApi(this.client);
    this.negotiation = new NegotiationApi(this.client);
    this.message = new MessageApi(this.client);
    this.notification = new NotificationApi(this.client);
    this.feedback = new FeedbackApi(this.client);
    this.identity = new IdentityApi(this.client);
    this.compliance = new ComplianceApi(this.client);
    this.vero = new VeroApi(this.client);
    this.translation = new TranslationApi(this.client);
    this.edelivery = new EDeliveryApi(this.client);
    this.finding = new FindingApi(this.client);
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

export * from '@/api/account-management/account.js';
export * from '@/api/analytics-and-report/analytics.js';
export * from '@/api/client.js';
export * from '@/api/communication/feedback.js';
export * from '@/api/communication/message.js';
export * from '@/api/communication/negotiation.js';
export * from '@/api/communication/notification.js';
export * from '@/api/listing-management/inventory.js';
export * from '@/api/listing-management/media.js';
export * from '@/api/listing-management/mediaAttach.js';
export * from '@/api/listing-metadata/metadata.js';
export * from '@/api/listing-metadata/taxonomy.js';
export * from '@/api/marketing-and-promotions/marketing.js';
export * from '@/api/marketing-and-promotions/recommendation.js';
export * from '@/api/order-management/dispute.js';
export * from '@/api/order-management/fulfillment.js';
export * from '@/api/other/compliance.js';
export * from '@/api/other/edelivery.js';
export * from '@/api/other/finding.js';
export * from '@/api/other/identity.js';
export * from '@/api/other/translation.js';
export * from '@/api/other/vero.js';
export * from '@/api/developer/developer.js';
export * from '@/api/trading/trading.js';
export * from '@/api/clientTrading.js';
