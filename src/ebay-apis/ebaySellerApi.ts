import type { Effect } from "effect";
import type { EbayOAuthError } from "@/auth/oauth.js";
import { AccountApi } from "@/ebay-apis/account/accountApi.js";
import { AccountV2Api } from "@/ebay-apis/account/accountV2Api.js";
import { AnalyticsApi } from "@/ebay-apis/analytics/analyticsApi.js";
import { BrowseApi } from "@/ebay-apis/browse/browseApi.js";
import { FeedbackApi } from "@/ebay-apis/communication/feedbackApi.js";
import { MessageApi } from "@/ebay-apis/communication/messageApi.js";
import { NegotiationApi } from "@/ebay-apis/communication/negotiationApi.js";
import { NotificationApi } from "@/ebay-apis/communication/notificationApi.js";
import { DeveloperApi } from "@/ebay-apis/developer/developerApi.js";
import { FeedApi } from "@/ebay-apis/feed/feedApi.js";
import { FinancesApi } from "@/ebay-apis/finances/financesApi.js";
import { DisputeApi } from "@/ebay-apis/fulfillment/disputeApi.js";
import { FulfillmentApi } from "@/ebay-apis/fulfillment/fulfillmentApi.js";
import { InventoryApi } from "@/ebay-apis/inventory/inventoryApi.js";
import { MediaApi } from "@/ebay-apis/inventory/mediaApi.js";
import { LogisticsApi } from "@/ebay-apis/logistics/logisticsApi.js";
import { MarketingApi } from "@/ebay-apis/marketing/marketingApi.js";
import { RecommendationApi } from "@/ebay-apis/marketing/recommendationApi.js";
import { MetadataApi } from "@/ebay-apis/metadata/metadataApi.js";
import { EDeliveryApi } from "@/ebay-apis/other/edelivery/edeliveryApi.js";
import { IdentityApi } from "@/ebay-apis/other/identity/identityApi.js";
import { TranslationApi } from "@/ebay-apis/other/translation/translationApi.js";
import { VeroApi } from "@/ebay-apis/other/vero/veroApi.js";
import { StoresApi } from "@/ebay-apis/stores/storesApi.js";
import { CharityApi } from "@/ebay-apis/taxonomy/charityApi.js";
import { TaxonomyApi } from "@/ebay-apis/taxonomy/taxonomyApi.js";
import { TradingApi } from "@/ebay-apis/trading/tradingApi.js";
import { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { TradingApiClient } from "@/ebay-client/tradingApiClient.js";
import type { EbayConfig } from "@/shared/ebay.js";

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
	initialize = (): Effect.Effect<void, EbayOAuthError> =>
		this.client.initialize();

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
		this.client.setUserTokens(
			accessToken,
			refreshToken,
			accessTokenExpiry,
			refreshTokenExpiry,
		);

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

export * from "@/ebay-apis/account/accountApi.js";
export * from "@/ebay-apis/account/accountV2Api.js";
export * from "@/ebay-apis/analytics/analyticsApi.js";
export { BrowseApi } from "@/ebay-apis/browse/browseApi.js";
export {
	buildBrowseFilter,
	requireNoPriceFilterConflict,
} from "@/ebay-apis/browse/browseFilter.js";
export {
	mapItemDetailsResponse,
	mapItemSummary,
	mapSearchActiveItemsResponse,
} from "@/ebay-apis/browse/browseMappers.js";
export {
	type ActiveItemSummary,
	BROWSE_SORT_VALUES,
	type BrowseMoney,
	type BrowseSortValue,
	type GetItemDetailsInput,
	type ItemDetails,
	type SearchActiveItemsInput,
	type SearchActiveItemsResult,
} from "@/ebay-apis/browse/browseTypes.js";
export * from "@/ebay-apis/communication/feedbackApi.js";
export * from "@/ebay-apis/communication/messageApi.js";
export * from "@/ebay-apis/communication/negotiationApi.js";
export * from "@/ebay-apis/communication/notificationApi.js";
export * from "@/ebay-apis/developer/developerApi.js";
export * from "@/ebay-apis/feed/feedApi.js";
export * from "@/ebay-apis/finances/financesApi.js";
export * from "@/ebay-apis/fulfillment/disputeApi.js";
export * from "@/ebay-apis/fulfillment/fulfillmentApi.js";
export * from "@/ebay-apis/inventory/inventoryApi.js";
export * from "@/ebay-apis/inventory/mediaApi.js";
export * from "@/ebay-apis/inventory/mediaAttachApi.js";
export * from "@/ebay-apis/logistics/logisticsApi.js";
export * from "@/ebay-apis/marketing/marketingApi.js";
export * from "@/ebay-apis/marketing/recommendationApi.js";
export * from "@/ebay-apis/metadata/metadataApi.js";
export * from "@/ebay-apis/other/edelivery/edeliveryApi.js";
export * from "@/ebay-apis/other/identity/identityApi.js";
export * from "@/ebay-apis/other/translation/translationApi.js";
export * from "@/ebay-apis/other/vero/veroApi.js";
export * from "@/ebay-apis/stores/storesApi.js";
export * from "@/ebay-apis/taxonomy/charityApi.js";
export * from "@/ebay-apis/taxonomy/taxonomyApi.js";
export * from "@/ebay-apis/trading/tradingApi.js";
export * from "@/ebay-client/ebayApiClient.js";
export * from "@/ebay-client/tradingApiClient.js";
