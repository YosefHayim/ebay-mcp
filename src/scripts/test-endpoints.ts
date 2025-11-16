import { config } from 'dotenv';
import { EbaySellerApi } from '@/api/index.js';
import type { EbayConfig } from '@/types/ebay.js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

interface EndpointFailure {
  category: string;
  endpoint: string;
  method: string;
  error: string;
  duration: number;
  params?: unknown;
  statusCode?: number;
  errorDetails?: unknown;
  status: 'error' | 'skipped';
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: string;
  failures: EndpointFailure[];
}

interface CollectedIds {
  // Account Management
  fulfillmentPolicyId?: string;
  paymentPolicyId?: string;
  returnPolicyId?: string;
  customPolicyId?: string;

  // Inventory
  inventoryItemSku?: string;
  inventoryLocationKey?: string;
  offerId?: string;

  // Fulfillment
  orderId?: string;
  paymentDisputeId?: string;

  // Marketing
  campaignId?: string;
  adGroupId?: string;
  promotionId?: string;

  // Other
  negotiationOfferId?: string;
}

/**
 * Test runner for eBay API endpoints
 * Phase 1: Collect real IDs from list endpoints
 * Phase 2: Use real IDs to test specific get endpoints
 * Uses failure-focused logging - only outputs errors and skipped tests
 */
class EndpointTester {
  private api!: EbaySellerApi;
  private failures: EndpointFailure[] = [];
  private passCount = 0;
  private logsDir: string;
  private runId: string;
  private collectedIds: CollectedIds = {};

  constructor() {
    this.runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.logsDir = path.join(process.cwd(), 'test-logs', this.runId);

    // Create logs directory
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing eBay API client...');

    const config: EbayConfig = {
      clientId: process.env.EBAY_CLIENT_ID!,
      clientSecret: process.env.EBAY_CLIENT_SECRET!,
      environment: (process.env.EBAY_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
      redirectUri: process.env.EBAY_REDIRECT_URI,
    };

    // Validate config
    if (!config.clientId || !config.clientSecret) {
      throw new Error(
        'Missing eBay credentials. Please set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in .env'
      );
    }

    this.api = new EbaySellerApi(config);

    // Initialize and verify authentication
    await this.api.initialize();

    console.log(`✅ Client initialized (${config.environment} mode)`);
    console.log(
      this.api.hasUserTokens()
        ? '✅ Using user tokens (high rate limits)'
        : '⚠️  Using app tokens (1k req/day limit)'
    );
  }

  /**
   * Test a single endpoint with error handling
   * Shows a dot (.) for pass, captures errors for failure report
   */
  private async testEndpoint(
    category: string,
    endpoint: string,
    method: string,
    testFn: () => Promise<unknown>,
    params?: unknown
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await testFn();
      this.passCount++;
      process.stdout.write('.');
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };

      // Determine if this is a skip (404/no data) or actual error
      const isNoData =
        err.message?.includes('404') ||
        err.message?.includes('not found') ||
        err.message?.toLowerCase().includes('no data');

      const failure: EndpointFailure = {
        category,
        endpoint,
        method,
        error: err.message || 'Unknown error',
        duration,
        params,
        statusCode: err.response?.status,
        errorDetails: err.response?.data,
        status: isNoData ? 'skipped' : 'error',
      };

      this.failures.push(failure);
      process.stdout.write(isNoData ? '⏭' : '❌');
    }
  }

  /**
   * Phase 1: Collect real IDs from list endpoints
   */
  async collectRealIds(): Promise<void> {
    console.log('\n🔍 Phase 1: Collecting real IDs from list endpoints...\n');

    // Collect Account Management IDs
    try {
      const fulfillmentPolicies = await this.api.account.getFulfillmentPolicies('EBAY_US');
      if (
        fulfillmentPolicies.fulfillmentPolicies &&
        fulfillmentPolicies.fulfillmentPolicies.length > 0
      ) {
        this.collectedIds.fulfillmentPolicyId =
          fulfillmentPolicies.fulfillmentPolicies[0].fulfillmentPolicyId;
        console.log(`✓ Fulfillment Policy ID: ${this.collectedIds.fulfillmentPolicyId}`);
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const paymentPolicies = await this.api.account.getPaymentPolicies('EBAY_US');
      if (paymentPolicies.paymentPolicies && paymentPolicies.paymentPolicies.length > 0) {
        this.collectedIds.paymentPolicyId = paymentPolicies.paymentPolicies[0].paymentPolicyId;
        console.log(`✓ Payment Policy ID: ${this.collectedIds.paymentPolicyId}`);
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const returnPolicies = await this.api.account.getReturnPolicies('EBAY_US');
      if (returnPolicies.returnPolicies && returnPolicies.returnPolicies.length > 0) {
        this.collectedIds.returnPolicyId = returnPolicies.returnPolicies[0].returnPolicyId;
        console.log(`✓ Return Policy ID: ${this.collectedIds.returnPolicyId}`);
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const customPolicies = await this.api.account.getCustomPolicies();
      if (customPolicies.customPolicies && customPolicies.customPolicies.length > 0) {
        this.collectedIds.customPolicyId = customPolicies.customPolicies[0].customPolicyId;
        console.log(`✓ Custom Policy ID: ${this.collectedIds.customPolicyId}`);
      }
    } catch {
      /* Skip if no data */
    }

    // Collect Inventory IDs
    try {
      const inventoryItems = await this.api.inventory.getInventoryItems(1, 0);
      if (inventoryItems.inventoryItems && inventoryItems.inventoryItems.length > 0) {
        this.collectedIds.inventoryItemSku = inventoryItems.inventoryItems[0].sku;
        console.log(`✓ Inventory Item SKU: ${this.collectedIds.inventoryItemSku}`);
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const locations = await this.api.inventory.getInventoryLocations(1, 0);
      if (locations.locations && locations.locations.length > 0) {
        this.collectedIds.inventoryLocationKey = locations.locations[0].merchantLocationKey;
        console.log(`✓ Inventory Location Key: ${this.collectedIds.inventoryLocationKey}`);
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const offers = await this.api.inventory.getOffers(undefined, 'EBAY_US', 1);
      if (offers.offers && offers.offers.length > 0) {
        this.collectedIds.offerId = offers.offers[0].offerId;
        console.log(`✓ Offer ID: ${this.collectedIds.offerId}`);
      }
    } catch {
      /* Skip if no data */
    }

    // Collect Fulfillment IDs
    try {
      const orders = await this.api.fulfillment.getOrders({ limit: 1 });
      if (orders.orders && orders.orders.length > 0) {
        this.collectedIds.orderId = orders.orders[0].orderId;
        console.log(`✓ Order ID: ${this.collectedIds.orderId}`);
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const disputes = await this.api.fulfillment.getPaymentDisputeSummaries({ limit: 1 });
      if (disputes.paymentDisputeSummaries && disputes.paymentDisputeSummaries.length > 0) {
        this.collectedIds.paymentDisputeId = disputes.paymentDisputeSummaries[0].paymentDisputeId;
        console.log(`✓ Payment Dispute ID: ${this.collectedIds.paymentDisputeId}`);
      }
    } catch {
      /* Skip if no data */
    }

    // Collect Marketing IDs
    try {
      const campaigns = await this.api.marketing.getCampaigns({ limit: 1 });
      if (campaigns.campaigns && campaigns.campaigns.length > 0) {
        this.collectedIds.campaignId = campaigns.campaigns[0].campaignId;
        console.log(`✓ Campaign ID: ${this.collectedIds.campaignId}`);

        // If we have a campaign, try to get an ad group
        try {
          const adGroups = await this.api.marketing.getAdGroups(this.collectedIds.campaignId!, {
            limit: 1,
          });
          if (adGroups.adGroups && adGroups.adGroups.length > 0) {
            this.collectedIds.adGroupId = adGroups.adGroups[0].adGroupId;
            console.log(`✓ Ad Group ID: ${this.collectedIds.adGroupId}`);
          }
        } catch {
          /* Skip if no data */
        }
      }
    } catch {
      /* Skip if no data */
    }

    try {
      const promotions = await this.api.marketing.getPromotions('EBAY_US', 1);
      if (promotions.promotions && promotions.promotions.length > 0) {
        this.collectedIds.promotionId = promotions.promotions[0].promotionId;
        console.log(`✓ Promotion ID: ${this.collectedIds.promotionId}`);
      }
    } catch {
      /* Skip if no data */
    }

    // Collect Other IDs
    try {
      const offers = await this.api.negotiation.getOffersForListing();
      if (offers.offers && offers.offers.length > 0) {
        this.collectedIds.negotiationOfferId = offers.offers[0].offerId;
        console.log(`✓ Negotiation Offer ID: ${this.collectedIds.negotiationOfferId}`);
      }
    } catch {
      /* Skip if no data */
    }

    console.log('\n✅ Phase 1 complete - IDs collected\n');
  }

  async testAccountManagementApis(): Promise<void> {
    console.log('\n💼 Account Management APIs (40 endpoints)');

    // Custom Policies (5 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getCustomPolicies',
      'GET /sell/account/v1/custom_policy',
      () => this.api.account.getCustomPolicies(),
      { policy_types: undefined }
    );

    // Test specific custom policy if we have an ID
    if (this.collectedIds.customPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getCustomPolicy',
        'GET /sell/account/v1/custom_policy/{custom_policy_id}',
        () => this.api.account.getCustomPolicy(this.collectedIds.customPolicyId!),
        { custom_policy_id: this.collectedIds.customPolicyId }
      );
    }

    // Fulfillment Policies (6 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getFulfillmentPolicies',
      'GET /sell/account/v1/fulfillment_policy',
      () => this.api.account.getFulfillmentPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    // Test specific fulfillment policy if we have an ID
    if (this.collectedIds.fulfillmentPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getFulfillmentPolicy',
        'GET /sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}',
        () => this.api.account.getFulfillmentPolicy(this.collectedIds.fulfillmentPolicyId!),
        { fulfillmentPolicyId: this.collectedIds.fulfillmentPolicyId }
      );
    }

    // Payment Policies (6 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getPaymentPolicies',
      'GET /sell/account/v1/payment_policy',
      () => this.api.account.getPaymentPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    // Test specific payment policy if we have an ID
    if (this.collectedIds.paymentPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getPaymentPolicy',
        'GET /sell/account/v1/payment_policy/{payment_policy_id}',
        () => this.api.account.getPaymentPolicy(this.collectedIds.paymentPolicyId!),
        { payment_policy_id: this.collectedIds.paymentPolicyId }
      );
    }

    // Return Policies (6 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getReturnPolicies',
      'GET /sell/account/v1/return_policy',
      () => this.api.account.getReturnPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    // Test specific return policy if we have an ID
    if (this.collectedIds.returnPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getReturnPolicy',
        'GET /sell/account/v1/return_policy/{return_policy_id}',
        () => this.api.account.getReturnPolicy(this.collectedIds.returnPolicyId!),
        { return_policy_id: this.collectedIds.returnPolicyId }
      );
    }

    // Privileges (1 endpoint)
    await this.testEndpoint(
      'Account Management',
      'getPrivileges',
      'GET /sell/account/v1/privilege',
      () => this.api.account.getPrivileges()
    );

    // Programs (3 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getOptedInPrograms',
      'GET /sell/account/v1/program/get_opted_in_programs',
      () => this.api.account.getOptedInPrograms()
    );

    // Rate Tables (1 endpoint)
    await this.testEndpoint(
      'Account Management',
      'getRateTables',
      'GET /sell/account/v1/rate_table',
      () => this.api.account.getRateTables()
    );

    // Sales Tax (5 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getSalesTaxes',
      'GET /sell/account/v1/sales_tax',
      () => this.api.account.getSalesTaxes('US'),
      { country_code: 'US' }
    );
    await this.testEndpoint(
      'Account Management',
      'getSalesTax',
      'GET /sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}',
      () => this.api.account.getSalesTax('US', 'CA'),
      { country_code: 'US', jurisdiction_id: 'CA' }
    );

    // Subscription (1 endpoint)
    await this.testEndpoint(
      'Account Management',
      'getSubscription',
      'GET /sell/account/v1/subscription',
      () => this.api.account.getSubscription()
    );

    // KYC (1 endpoint - deprecated)
    await this.testEndpoint(
      'Account Management',
      'getKYC',
      'GET /sell/account/v1/kyc [DEPRECATED]',
      () => this.api.account.getKyc()
    );

    // Advertising Eligibility (1 endpoint)
    await this.testEndpoint(
      'Account Management',
      'getAdvertisingEligibility',
      'GET /sell/account/v1/advertising_eligibility',
      () => this.api.account.getAdvertisingEligibility('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    // Payments Program (2 endpoints - deprecated)
    await this.testEndpoint(
      'Account Management',
      'getPaymentsProgram',
      'GET /sell/account/v1/payments_program/{marketplace_id}/{payments_program_type} [DEPRECATED]',
      () => this.api.account.getPaymentsProgram('EBAY_US', 'EBAY_PAYMENTS'),
      { marketplace_id: 'EBAY_US', payments_program_type: 'EBAY_PAYMENTS' }
    );
    await this.testEndpoint(
      'Account Management',
      'getPaymentsProgramOnboarding',
      'GET /sell/account/v1/payments_program/{marketplace_id}/{payments_program_type}/onboarding [DEPRECATED]',
      () => this.api.account.getPaymentsProgramOnboarding('EBAY_US', 'EBAY_PAYMENTS'),
      { marketplace_id: 'EBAY_US', payments_program_type: 'EBAY_PAYMENTS' }
    );

    console.log('');
  }

  async testInventoryApis(): Promise<void> {
    console.log('\n📦 Inventory APIs (20 endpoints)');

    // Inventory Items (6 endpoints)
    await this.testEndpoint(
      'Inventory',
      'getInventoryItems',
      'GET /sell/inventory/v1/inventory_item',
      () => this.api.inventory.getInventoryItems(5, 0),
      { limit: 5, offset: 0 }
    );

    // Test specific inventory item if we have a SKU
    if (this.collectedIds.inventoryItemSku) {
      await this.testEndpoint(
        'Inventory',
        'getInventoryItem',
        'GET /sell/inventory/v1/inventory_item/{sku}',
        () => this.api.inventory.getInventoryItem(this.collectedIds.inventoryItemSku!),
        { sku: this.collectedIds.inventoryItemSku }
      );

      await this.testEndpoint(
        'Inventory',
        'getProductCompatibility',
        'GET /sell/inventory/v1/inventory_item/{sku}/product_compatibility',
        () => this.api.inventory.getProductCompatibility(this.collectedIds.inventoryItemSku!),
        { sku: this.collectedIds.inventoryItemSku }
      );
    }

    // Inventory Locations (4 endpoints)
    await this.testEndpoint(
      'Inventory',
      'getInventoryLocations',
      'GET /sell/inventory/v1/location',
      () => this.api.inventory.getInventoryLocations(5, 0),
      { limit: 5, offset: 0 }
    );

    // Test specific inventory location if we have a key
    if (this.collectedIds.inventoryLocationKey) {
      await this.testEndpoint(
        'Inventory',
        'getInventoryLocation',
        'GET /sell/inventory/v1/location/{merchantLocationKey}',
        () => this.api.inventory.getInventoryLocation(this.collectedIds.inventoryLocationKey!),
        { merchantLocationKey: this.collectedIds.inventoryLocationKey }
      );
    }

    // Offers (7 endpoints)
    await this.testEndpoint(
      'Inventory',
      'getOffers',
      'GET /sell/inventory/v1/offer',
      () => this.api.inventory.getOffers(undefined, 'EBAY_US', 5),
      { marketplaceId: 'EBAY_US', limit: 5 }
    );

    // Test specific offer if we have an ID
    if (this.collectedIds.offerId) {
      await this.testEndpoint(
        'Inventory',
        'getOffer',
        'GET /sell/inventory/v1/offer/{offerId}',
        () => this.api.inventory.getOffer(this.collectedIds.offerId!),
        { offerId: this.collectedIds.offerId }
      );

      await this.testEndpoint(
        'Inventory',
        'getListingFees',
        'POST /sell/inventory/v1/offer/get_listing_fees',
        () => this.api.inventory.getListingFees([this.collectedIds.offerId!]),
        { offerIds: [this.collectedIds.offerId] }
      );
    }

    // Listing (1 endpoint)
    await this.testEndpoint(
      'Inventory',
      'getListings',
      'GET /sell/inventory/v1/listing',
      () => this.api.inventory.getListings(5, 0),
      { limit: 5, offset: 0 }
    );

    console.log('');
  }

  async testFulfillmentApis(): Promise<void> {
    console.log('\n📮 Fulfillment APIs (15 endpoints)');

    // Orders (2 endpoints)
    await this.testEndpoint(
      'Fulfillment',
      'getOrders',
      'GET /sell/fulfillment/v1/order',
      () => this.api.fulfillment.getOrders({ limit: 5 }),
      { limit: 5 }
    );

    // Test specific order if we have an ID
    if (this.collectedIds.orderId) {
      await this.testEndpoint(
        'Fulfillment',
        'getOrder',
        'GET /sell/fulfillment/v1/order/{orderId}',
        () => this.api.fulfillment.getOrder(this.collectedIds.orderId!),
        { orderId: this.collectedIds.orderId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'getShippingFulfillments',
        'GET /sell/fulfillment/v1/order/{orderId}/shipping_fulfillment',
        () => this.api.fulfillment.getShippingFulfillments(this.collectedIds.orderId!),
        { orderId: this.collectedIds.orderId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'getCancellation',
        'GET /sell/fulfillment/v1/order/{orderId}/cancellation',
        () =>
          this.api.fulfillment.getCancellation(this.collectedIds.orderId!, 'test-cancellation-id'),
        { orderId: this.collectedIds.orderId, cancellation_id: 'test-cancellation-id' }
      );
    }

    // Payment Disputes (6 endpoints)
    await this.testEndpoint(
      'Fulfillment',
      'getPaymentDisputeSummaries',
      'GET /sell/fulfillment/v1/payment_dispute_summary',
      () => this.api.fulfillment.getPaymentDisputeSummaries({ limit: 5 }),
      { limit: 5 }
    );

    // Test specific dispute if we have an ID
    if (this.collectedIds.paymentDisputeId) {
      await this.testEndpoint(
        'Fulfillment',
        'getPaymentDispute',
        'GET /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}',
        () => this.api.fulfillment.getPaymentDispute(this.collectedIds.paymentDisputeId!),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'getActivities',
        'GET /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/activity',
        () => this.api.fulfillment.getActivities(this.collectedIds.paymentDisputeId!),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );
    }

    // Shipping Quote (1 endpoint)
    await this.testEndpoint(
      'Fulfillment',
      'getShippingQuote',
      'POST /sell/fulfillment/v1/shipping_quote',
      () => this.api.fulfillment.getShippingQuote({ rateTableId: 'test' } as any),
      { rateTableId: 'test' }
    );

    console.log('');
  }

  async testMarketingApis(): Promise<void> {
    console.log('\n📢 Marketing APIs (30+ endpoints)');

    // Ad Campaigns (6 endpoints)
    await this.testEndpoint(
      'Marketing',
      'getCampaigns',
      'GET /sell/marketing/v1/ad_campaign',
      () => this.api.marketing.getCampaigns({ limit: 5 }),
      { limit: 5 }
    );

    // Test specific campaign if we have an ID
    if (this.collectedIds.campaignId) {
      await this.testEndpoint(
        'Marketing',
        'getCampaign',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}',
        () => this.api.marketing.getCampaign(this.collectedIds.campaignId!),
        { campaign_id: this.collectedIds.campaignId }
      );

      // Ad Groups (5 endpoints)
      await this.testEndpoint(
        'Marketing',
        'getAdGroups',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group',
        () => this.api.marketing.getAdGroups(this.collectedIds.campaignId!, { limit: 5 }),
        { campaign_id: this.collectedIds.campaignId, limit: 5 }
      );

      // Ads (3 endpoints)
      await this.testEndpoint(
        'Marketing',
        'getAds',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/ad',
        () => this.api.marketing.getAds(this.collectedIds.campaignId!, { limit: 5 }),
        { campaign_id: this.collectedIds.campaignId, limit: 5 }
      );

      // Keywords (5 endpoints)
      await this.testEndpoint(
        'Marketing',
        'getKeywords',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/keyword',
        () => this.api.marketing.getKeywords(this.collectedIds.campaignId!, { limit: 5 }),
        { campaign_id: this.collectedIds.campaignId, limit: 5 }
      );

      // Negative Keywords (3 endpoints)
      await this.testEndpoint(
        'Marketing',
        'getNegativeKeywords',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/negative_keyword',
        () => this.api.marketing.getNegativeKeywords(this.collectedIds.campaignId!, { limit: 5 }),
        { campaign_id: this.collectedIds.campaignId, limit: 5 }
      );
    }

    // Promotions (9 endpoints)
    await this.testEndpoint(
      'Marketing',
      'getPromotions',
      'GET /sell/marketing/v1/promotion',
      () => this.api.marketing.getPromotions('EBAY_US', 5),
      { marketplace_id: 'EBAY_US', limit: 5 }
    );

    await this.testEndpoint(
      'Marketing',
      'getPromotionSummary',
      'GET /sell/marketing/v1/promotion_summary',
      () => this.api.marketing.getPromotionSummary('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    await this.testEndpoint(
      'Marketing',
      'getPromotionReports',
      'GET /sell/marketing/v1/promotion_report',
      () => this.api.marketing.getPromotionReports('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    // Test specific promotion if we have an ID
    if (this.collectedIds.promotionId) {
      await this.testEndpoint(
        'Marketing',
        'getPromotion',
        'GET /sell/marketing/v1/promotion/{promotion_id}',
        () => this.api.marketing.getPromotion(this.collectedIds.promotionId!),
        { promotion_id: this.collectedIds.promotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'getItemPriceMarkdownPromotion',
        'GET /sell/marketing/v1/item_price_markdown/{promotion_id}',
        () => this.api.marketing.getItemPriceMarkdownPromotion(this.collectedIds.promotionId!),
        { promotion_id: this.collectedIds.promotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'getItemPromotion',
        'GET /sell/marketing/v1/item_promotion/{promotion_id}',
        () => this.api.marketing.getItemPromotion(this.collectedIds.promotionId!),
        { promotion_id: this.collectedIds.promotionId }
      );
    }

    console.log('');
  }

  async testAnalyticsApis(): Promise<void> {
    console.log('\n📊 Analytics APIs (4 endpoints)');

    await this.testEndpoint(
      'Analytics',
      'getTrafficReport',
      'GET /sell/analytics/v1/traffic_report',
      () => this.api.analytics.getTrafficReport('LISTING_ID', 'filter', 'CLICK_THROUGH_RATE'),
      { dimension: 'LISTING_ID', filter: 'filter', metric: 'CLICK_THROUGH_RATE' }
    );
    await this.testEndpoint(
      'Analytics',
      'getSellerStandardsProfile',
      'GET /sell/analytics/v1/seller_standards_profile',
      () => this.api.analytics.getSellerStandardsProfile('LATE_SHIPMENT_RATE', 'CURRENT')
    );
    await this.testEndpoint(
      'Analytics',
      'getCustomerServiceMetric',
      'GET /sell/analytics/v1/customer_service_metric',
      () =>
        this.api.analytics.getCustomerServiceMetric('ITEM_NOT_AS_DESCRIBED', 'CURRENT', 'EBAY_US'),
      {
        customerServiceMetricType: 'ITEM_NOT_AS_DESCRIBED',
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: 'EBAY_US',
      }
    );
    await this.testEndpoint(
      'Analytics',
      'findSellerStandardsProfiles',
      'GET /sell/analytics/v1/seller_standards_profile/find',
      () => this.api.analytics.findSellerStandardsProfiles()
    );

    console.log('');
  }

  async testMetadataApis(): Promise<void> {
    console.log('\n🔍 Metadata APIs (5 endpoints)');

    await this.testEndpoint(
      'Metadata',
      'getAutomotivePartsCompatibilityPolicies',
      'GET /sell/metadata/v1/automotive_parts_compatibility_policy',
      () => this.api.metadata.getAutomotivePartsCompatibilityPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );
    await this.testEndpoint(
      'Metadata',
      'getListingStructurePolicies',
      'GET /sell/metadata/v1/marketplace/{marketplace_id}/listing_structure_policy',
      () => this.api.metadata.getListingStructurePolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );
    await this.testEndpoint(
      'Metadata',
      'getReturnPolicies',
      'GET /sell/metadata/v1/marketplace/{marketplace_id}/return_policy',
      () => this.api.metadata.getReturnPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );
    await this.testEndpoint(
      'Metadata',
      'getProductCompliancePolicies',
      'GET /sell/metadata/v1/marketplace/{marketplace_id}/product_compliance_policy',
      () => this.api.metadata.getProductCompliancePolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );
    await this.testEndpoint(
      'Metadata',
      'getExtendedProducerResponsibilityPolicies',
      'GET /sell/metadata/v1/marketplace/{marketplace_id}/extended_producer_responsibility_policy',
      () => this.api.metadata.getExtendedProducerResponsibilityPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    console.log('');
  }

  async testTaxonomyApis(): Promise<void> {
    console.log('\n🏷️  Taxonomy APIs (5 endpoints)');

    await this.testEndpoint(
      'Taxonomy',
      'getCategoryTree',
      'GET /commerce/taxonomy/v1/category_tree/{category_tree_id}',
      () => this.api.taxonomy.getCategoryTree('0'),
      { category_tree_id: '0' }
    );
    await this.testEndpoint(
      'Taxonomy',
      'getCategorySubtree',
      'GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_subtree',
      () => this.api.taxonomy.getCategorySubtree('0', '1'),
      { category_tree_id: '0', category_id: '1' }
    );
    await this.testEndpoint(
      'Taxonomy',
      'getCategorySuggestions',
      'GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_suggestions',
      () => this.api.taxonomy.getCategorySuggestions('0', 'laptop'),
      { category_tree_id: '0', q: 'laptop' }
    );
    await this.testEndpoint(
      'Taxonomy',
      'getItemAspectsForCategory',
      'GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_item_aspects_for_category',
      () => this.api.taxonomy.getItemAspectsForCategory('0', '1'),
      { category_tree_id: '0', category_id: '1' }
    );
    await this.testEndpoint(
      'Taxonomy',
      'getDefaultCategoryTreeId',
      'GET /commerce/taxonomy/v1/get_default_category_tree_id',
      () => this.api.taxonomy.getDefaultCategoryTreeId('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    console.log('');
  }

  async testOtherApis(): Promise<void> {
    console.log('\n🔧 Other APIs (Identity, Negotiation, Compliance, Translation)');

    // Identity API (1 endpoint)
    await this.testEndpoint('Other', 'getUser', 'GET /commerce/identity/v1/user', () =>
      this.api.identity.getUser()
    );

    // Negotiation API (2 endpoints)
    await this.testEndpoint(
      'Other',
      'getOffersForListing',
      'GET /sell/negotiation/v1/offer',
      () => this.api.negotiation.getOffersForListing(),
      { limit: 5 }
    );

    // Test specific negotiation offer if we have an ID
    if (this.collectedIds.negotiationOfferId) {
      await this.testEndpoint(
        'Other',
        'getOffer',
        'GET /sell/negotiation/v1/offer/{offerId}',
        () => this.api.negotiation.getOffer(this.collectedIds.negotiationOfferId!),
        { offerId: this.collectedIds.negotiationOfferId }
      );
    }

    // Compliance API (1 endpoint)
    await this.testEndpoint(
      'Other',
      'getComplianceSnapshot',
      'GET /sell/compliance/v1/listing_violations',
      () => this.api.compliance.getComplianceSnapshot(),
      { limit: 5 }
    );

    console.log('');
  }

  private writeFailuresLog(): void {
    if (this.failures.length === 0) {
      return;
    }

    const failuresFile = path.join(this.logsDir, 'FAILURES.log');
    const lines: string[] = [
      `╔${'═'.repeat(78)}╗`,
      `║ ENDPOINT TEST FAILURES${' '.repeat(54)}║`,
      `║ Run ID: ${this.runId}${' '.repeat(78 - this.runId.length - 10)}║`,
      `╚${'═'.repeat(78)}╝`,
      '',
    ];

    // Group failures by category
    const byCategory = new Map<string, EndpointFailure[]>();
    for (const failure of this.failures) {
      if (!byCategory.has(failure.category)) {
        byCategory.set(failure.category, []);
      }
      byCategory.get(failure.category)!.push(failure);
    }

    for (const [category, failures] of byCategory) {
      lines.push(`▶ ${category.toUpperCase()}`);
      lines.push('─'.repeat(80));
      lines.push('');

      for (const failure of failures) {
        const icon = failure.status === 'error' ? '❌' : '⏭️';
        lines.push(`${icon} ${failure.endpoint}`);
        lines.push(`   HTTP Method: ${failure.method}`);
        lines.push(`   Status: ${failure.status.toUpperCase()}`);
        lines.push(`   Duration: ${failure.duration}ms`);

        if (failure.statusCode) {
          lines.push(`   HTTP Code: ${failure.statusCode}`);
        }

        if (failure.params) {
          lines.push(`   Parameters:`);
          lines.push(`   ${JSON.stringify(failure.params, null, 2).split('\n').join('\n   ')}`);
        }

        lines.push(`   Error: ${failure.error}`);

        if (failure.errorDetails) {
          lines.push(`   Details:`);
          const detailsStr = JSON.stringify(failure.errorDetails, null, 2);
          lines.push(`   ${detailsStr.split('\n').join('\n   ')}`);
        }

        lines.push('');
        lines.push('─'.repeat(80));
        lines.push('');
      }
    }

    fs.writeFileSync(failuresFile, lines.join('\n'));
    console.log(`\n📝 Failures logged to: ${failuresFile}\n`);
  }

  private writeSummaryLog(summary: TestSummary): void {
    const summaryFile = path.join(this.logsDir, 'SUMMARY.log');
    const jsonFile = path.join(this.logsDir, 'summary.json');

    const lines: string[] = [
      `╔${'═'.repeat(78)}╗`,
      `║ ENDPOINT TEST SUMMARY${' '.repeat(56)}║`,
      `║ Run ID: ${this.runId}${' '.repeat(78 - this.runId.length - 10)}║`,
      `╚${'═'.repeat(78)}╝`,
      '',
      `Total Tests:     ${summary.totalTests}`,
      `✅ Passed:       ${summary.passed} (${((summary.passed / summary.totalTests) * 100).toFixed(1)}%)`,
      `❌ Failed:       ${summary.failed}`,
      `⏭️  Skipped:      ${summary.skipped}`,
      `⏱️  Duration:     ${(summary.duration / 1000).toFixed(2)}s`,
      '',
    ];

    if (summary.failed > 0) {
      lines.push('═'.repeat(80));
      lines.push('⚠️  FAILURES REQUIRE ATTENTION');
      lines.push('═'.repeat(80));
      lines.push('');
      lines.push('See FAILURES.log for detailed error information');
      lines.push('');

      // Quick list of failed endpoints
      const errors = this.failures.filter((f) => f.status === 'error');
      if (errors.length > 0) {
        lines.push('Failed Endpoints:');
        for (const failure of errors) {
          lines.push(`  • ${failure.endpoint} (${failure.category})`);
        }
        lines.push('');
      }
    }

    if (summary.skipped > 0) {
      lines.push('Skipped Endpoints (No Data):');
      const skipped = this.failures.filter((f) => f.status === 'skipped');
      for (const failure of skipped) {
        lines.push(`  • ${failure.endpoint}`);
      }
      lines.push('');
    }

    fs.writeFileSync(summaryFile, lines.join('\n'));
    fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2));

    console.log(`📊 Summary: ${summaryFile}`);
    console.log(`📊 JSON: ${jsonFile}`);
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive endpoint tests with 2-phase approach...\n');
    console.log('  Phase 1: Collect real IDs from GET list operations');
    console.log('  Phase 2: Test specific GET operations with real IDs\n');
    const startTime = Date.now();

    // Phase 1: Collect real IDs
    await this.collectRealIds();

    // Phase 2: Run all tests with collected IDs
    console.log('🔬 Phase 2: Running endpoint tests...\n');
    await this.testAccountManagementApis();
    await this.testInventoryApis();
    await this.testFulfillmentApis();
    await this.testMarketingApis();
    await this.testAnalyticsApis();
    await this.testMetadataApis();
    await this.testTaxonomyApis();
    await this.testOtherApis();

    const totalDuration = Date.now() - startTime;
    const totalTests = this.passCount + this.failures.length;
    const failed = this.failures.filter((f) => f.status === 'error').length;
    const skipped = this.failures.filter((f) => f.status === 'skipped').length;

    // Generate summary
    const summary: TestSummary = {
      totalTests,
      passed: this.passCount,
      failed,
      skipped,
      duration: totalDuration,
      timestamp: new Date().toISOString(),
      failures: this.failures,
    };

    console.log('\n' + '═'.repeat(80));
    console.log('📝 Writing logs...');
    console.log('═'.repeat(80));

    this.writeFailuresLog();
    this.writeSummaryLog(summary);

    console.log('\n' + '═'.repeat(80));
    console.log('✅ TESTING COMPLETE');
    console.log('═'.repeat(80));
    console.log(`\n📊 Results:`);
    console.log(`  Total:   ${summary.totalTests}`);
    console.log(
      `  ✅ Pass:  ${summary.passed} (${((summary.passed / totalTests) * 100).toFixed(1)}%)`
    );
    console.log(`  ❌ Fail:  ${summary.failed}`);
    console.log(`  ⏭️  Skip:  ${summary.skipped}`);
    console.log(`  ⏱️  Time:  ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`\n📁 Logs: ${this.logsDir}`);

    if (failed > 0) {
      console.log(`\n⚠️  ${failed} endpoint(s) failed - check FAILURES.log for details`);
    } else {
      console.log('\n🎉 All tests passed!');
    }
    console.log('');
  }
}

// Main execution
async function main() {
  try {
    const tester = new EndpointTester();
    await tester.initialize();
    await tester.runAllTests();
    process.exit(0);
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

void main();
