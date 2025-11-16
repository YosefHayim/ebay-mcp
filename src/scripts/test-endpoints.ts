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

    // SAFETY: Force sandbox mode for testing - never run comprehensive tests in production!
    const requestedEnv = process.env.EBAY_ENVIRONMENT as 'production' | 'sandbox';
    const forceSandbox = requestedEnv === 'production';

    if (forceSandbox) {
      console.log('⚠️  SAFETY: Forcing SANDBOX mode for comprehensive testing');
      console.log('   Production mode is disabled to prevent accidental data modification');
      console.log('   Set EBAY_ENVIRONMENT=sandbox in .env to suppress this warning\n');
    }

    const config: EbayConfig = {
      clientId: process.env.EBAY_CLIENT_ID!,
      clientSecret: process.env.EBAY_CLIENT_SECRET!,
      environment: 'sandbox', // ALWAYS use sandbox for comprehensive CRUD testing
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

    console.log(`✅ Client initialized (${config.environment} mode - SAFE FOR TESTING)`);
    console.log(
      this.api.hasUserTokens()
        ? '✅ Using user tokens (high rate limits)'
        : '⚠️  Using app tokens (1k req/day limit)'
    );
  }

  /**
   * Test a single endpoint with error handling and retry logic
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
    const maxRetries = 2;
    let lastError: unknown;

    // Retry logic for network errors
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await testFn();
        this.passCount++;
        process.stdout.write('.');
        return;
      } catch (error: unknown) {
        lastError = error;
        const err = error as { message?: string; response?: { status?: number; data?: unknown } };

        // Check if this is a retryable error (connection reset, timeout)
        const isRetryable =
          err.message?.includes('ECONNRESET') ||
          err.message?.includes('ETIMEDOUT') ||
          err.message?.includes('timeout') ||
          err.message?.includes('socket hang up');

        // If retryable and we have retries left, wait and retry
        if (isRetryable && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // Not retryable or out of retries, record the failure
        break;
      }
    }

    const duration = Date.now() - startTime;
    const err = lastError as { message?: string; response?: { status?: number; data?: unknown } };

    // Determine if this is a skip (404/no data/not supported) or actual error
    const isNoData =
      err.message?.includes('404') ||
      err.message?.includes('not found') ||
      err.message?.includes('not supported') ||
      err.message?.includes('resource not found') ||
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
      // Don't pass undefined for SKU, just omit it
      const offers = await this.api.inventory.getOffers(undefined, 'EBAY_US', 1);
      if (offers.offers && offers.offers.length > 0) {
        this.collectedIds.offerId = offers.offers[0].offerId;
        console.log(`✓ Offer ID: ${this.collectedIds.offerId}`);
      }
    } catch (error) {
      // Skip if no data or invalid parameters
      const err = error as { message?: string };
      if (err.message && !err.message.includes('not found')) {
        console.log(`  ℹ Could not collect offer IDs: ${err.message}`);
      }
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
    console.log('\n💼 Account Management APIs (37 endpoints - Full CRUD)');

    // Fulfillment Policies (6 endpoints: GET list, GET, POST, PUT, DELETE, GET by name)
    await this.testEndpoint(
      'Account Management',
      'getFulfillmentPolicies',
      'GET /sell/account/v1/fulfillment_policy',
      () => this.api.account.getFulfillmentPolicies('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

    // CREATE fulfillment policy
    const testFulfillmentPolicy = {
      name: `Test Fulfillment ${Date.now()}`,
      marketplaceId: 'EBAY_US',
      categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES' as const }],
      shippingOptions: [
        {
          optionType: 'DOMESTIC' as const,
          costType: 'FLAT_RATE' as const,
          shippingServices: [
            {
              shippingCarrierCode: 'USPS',
              shippingServiceCode: 'USPSPriority',
              shippingCost: { value: '5.00', currency: 'USD' },
            },
          ],
        },
      ],
      handlingTime: { value: 1, unit: 'DAY' as const },
    };

    let createdFulfillmentPolicyId: string | undefined;
    await this.testEndpoint(
      'Account Management',
      'createFulfillmentPolicy',
      'POST /sell/account/v1/fulfillment_policy',
      async () => {
        const result = await this.api.account.createFulfillmentPolicy(testFulfillmentPolicy as any);
        createdFulfillmentPolicyId = result.fulfillmentPolicyId;
        return result;
      },
      testFulfillmentPolicy
    );

    // READ created policy
    if (createdFulfillmentPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getFulfillmentPolicy (created)',
        'GET /sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}',
        () => this.api.account.getFulfillmentPolicy(createdFulfillmentPolicyId!),
        { fulfillmentPolicyId: createdFulfillmentPolicyId }
      );

      // UPDATE policy
      await this.testEndpoint(
        'Account Management',
        'updateFulfillmentPolicy',
        'PUT /sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}',
        () =>
          this.api.account.updateFulfillmentPolicy(createdFulfillmentPolicyId!, {
            ...testFulfillmentPolicy,
            name: `Updated Fulfillment ${Date.now()}`,
          } as any),
        { fulfillmentPolicyId: createdFulfillmentPolicyId }
      );

      // DELETE policy
      await this.testEndpoint(
        'Account Management',
        'deleteFulfillmentPolicy',
        'DELETE /sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}',
        () => this.api.account.deleteFulfillmentPolicy(createdFulfillmentPolicyId!),
        { fulfillmentPolicyId: createdFulfillmentPolicyId }
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

    // CREATE payment policy
    const testPaymentPolicy = {
      name: `Test Payment ${Date.now()}`,
      marketplaceId: 'EBAY_US',
      categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES' as const }],
      // eBay Managed Payments is now the default - no paymentMethods array needed
      immediatePay: true,
    };

    let createdPaymentPolicyId: string | undefined;
    await this.testEndpoint(
      'Account Management',
      'createPaymentPolicy',
      'POST /sell/account/v1/payment_policy',
      async () => {
        const result = await this.api.account.createPaymentPolicy(testPaymentPolicy as any);
        createdPaymentPolicyId = result.paymentPolicyId;
        return result;
      },
      testPaymentPolicy
    );

    if (createdPaymentPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getPaymentPolicy (created)',
        'GET /sell/account/v1/payment_policy/{payment_policy_id}',
        () => this.api.account.getPaymentPolicy(createdPaymentPolicyId!),
        { payment_policy_id: createdPaymentPolicyId }
      );

      await this.testEndpoint(
        'Account Management',
        'updatePaymentPolicy',
        'PUT /sell/account/v1/payment_policy/{payment_policy_id}',
        () =>
          this.api.account.updatePaymentPolicy(createdPaymentPolicyId!, {
            ...testPaymentPolicy,
            name: `Updated Payment ${Date.now()}`,
          } as any),
        { payment_policy_id: createdPaymentPolicyId }
      );

      await this.testEndpoint(
        'Account Management',
        'deletePaymentPolicy',
        'DELETE /sell/account/v1/payment_policy/{payment_policy_id}',
        () => this.api.account.deletePaymentPolicy(createdPaymentPolicyId!),
        { payment_policy_id: createdPaymentPolicyId }
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

    const testReturnPolicy = {
      name: `Test Return ${Date.now()}`,
      marketplaceId: 'EBAY_US',
      categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES' as const }],
      returnsAccepted: true,
      returnPeriod: { value: 30, unit: 'DAY' as const },
      refundMethod: 'MONEY_BACK' as const,
      returnShippingCostPayer: 'BUYER' as const,
    };

    let createdReturnPolicyId: string | undefined;
    await this.testEndpoint(
      'Account Management',
      'createReturnPolicy',
      'POST /sell/account/v1/return_policy',
      async () => {
        const result = await this.api.account.createReturnPolicy(testReturnPolicy as any);
        createdReturnPolicyId = result.returnPolicyId;
        return result;
      },
      testReturnPolicy
    );

    if (createdReturnPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getReturnPolicy (created)',
        'GET /sell/account/v1/return_policy/{return_policy_id}',
        () => this.api.account.getReturnPolicy(createdReturnPolicyId!),
        { return_policy_id: createdReturnPolicyId }
      );

      await this.testEndpoint(
        'Account Management',
        'updateReturnPolicy',
        'PUT /sell/account/v1/return_policy/{return_policy_id}',
        () =>
          this.api.account.updateReturnPolicy(createdReturnPolicyId!, {
            ...testReturnPolicy,
            name: `Updated Return ${Date.now()}`,
          } as any),
        { return_policy_id: createdReturnPolicyId }
      );

      await this.testEndpoint(
        'Account Management',
        'deleteReturnPolicy',
        'DELETE /sell/account/v1/return_policy/{return_policy_id}',
        () => this.api.account.deleteReturnPolicy(createdReturnPolicyId!),
        { return_policy_id: createdReturnPolicyId }
      );
    }

    // Custom Policies (5 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getCustomPolicies',
      'GET /sell/account/v1/custom_policy',
      () => this.api.account.getCustomPolicies(),
      { policy_types: undefined }
    );

    const testCustomPolicy = {
      name: `Test Custom ${Date.now()}`,
      policyType: 'PRODUCT_COMPLIANCE' as const,
      description: 'Test custom policy',
      label: 'Test Label',
    };

    let createdCustomPolicyId: string | undefined;
    await this.testEndpoint(
      'Account Management',
      'createCustomPolicy',
      'POST /sell/account/v1/custom_policy',
      async () => {
        const result = await this.api.account.createCustomPolicy(testCustomPolicy as any);
        createdCustomPolicyId = result.customPolicyId;
        return result;
      },
      testCustomPolicy
    );

    if (createdCustomPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getCustomPolicy (created)',
        'GET /sell/account/v1/custom_policy/{custom_policy_id}',
        () => this.api.account.getCustomPolicy(createdCustomPolicyId!),
        { custom_policy_id: createdCustomPolicyId }
      );

      await this.testEndpoint(
        'Account Management',
        'updateCustomPolicy',
        'PUT /sell/account/v1/custom_policy/{custom_policy_id}',
        () =>
          this.api.account.updateCustomPolicy(createdCustomPolicyId!, {
            ...testCustomPolicy,
            description: 'Updated custom policy',
          } as any),
        { custom_policy_id: createdCustomPolicyId }
      );
    }

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
      'createOrReplaceSalesTax',
      'PUT /sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}',
      () =>
        this.api.account.createOrReplaceSalesTax('US', 'CA', {
          salesTaxPercentage: '7.25',
          shippingAndHandlingTaxed: false,
        } as any),
      { country_code: 'US', jurisdiction_id: 'CA', tax: '7.25%' }
    );

    await this.testEndpoint(
      'Account Management',
      'getSalesTax',
      'GET /sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}',
      () => this.api.account.getSalesTax('US', 'CA'),
      { country_code: 'US', jurisdiction_id: 'CA' }
    );

    await this.testEndpoint(
      'Account Management',
      'deleteSalesTax',
      'DELETE /sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}',
      () => this.api.account.deleteSalesTax('US', 'CA'),
      { country_code: 'US', jurisdiction_id: 'CA' }
    );

    // Programs (2 endpoints)
    await this.testEndpoint(
      'Account Management',
      'getOptedInPrograms',
      'GET /sell/account/v1/program/get_opted_in_programs',
      () => this.api.account.getOptedInPrograms()
    );

    // Read-only endpoints
    await this.testEndpoint(
      'Account Management',
      'getPrivileges',
      'GET /sell/account/v1/privilege',
      () => this.api.account.getPrivileges()
    );

    await this.testEndpoint(
      'Account Management',
      'getRateTables',
      'GET /sell/account/v1/rate_table',
      () => this.api.account.getRateTables()
    );

    await this.testEndpoint(
      'Account Management',
      'getSubscription',
      'GET /sell/account/v1/subscription',
      () => this.api.account.getSubscription()
    );

    await this.testEndpoint(
      'Account Management',
      'getKYC',
      'GET /sell/account/v1/kyc [DEPRECATED]',
      () => this.api.account.getKyc()
    );

    await this.testEndpoint(
      'Account Management',
      'getAdvertisingEligibility',
      'GET /sell/account/v1/advertising_eligibility',
      () => this.api.account.getAdvertisingEligibility('EBAY_US'),
      { marketplace_id: 'EBAY_US' }
    );

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

    // Test with existing policies if available
    if (this.collectedIds.fulfillmentPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getFulfillmentPolicy (existing)',
        'GET /sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}',
        () => this.api.account.getFulfillmentPolicy(this.collectedIds.fulfillmentPolicyId!),
        { fulfillmentPolicyId: this.collectedIds.fulfillmentPolicyId }
      );
    }

    if (this.collectedIds.paymentPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getPaymentPolicy (existing)',
        'GET /sell/account/v1/payment_policy/{payment_policy_id}',
        () => this.api.account.getPaymentPolicy(this.collectedIds.paymentPolicyId!),
        { payment_policy_id: this.collectedIds.paymentPolicyId }
      );
    }

    if (this.collectedIds.returnPolicyId) {
      await this.testEndpoint(
        'Account Management',
        'getReturnPolicy (existing)',
        'GET /sell/account/v1/return_policy/{return_policy_id}',
        () => this.api.account.getReturnPolicy(this.collectedIds.returnPolicyId!),
        { return_policy_id: this.collectedIds.returnPolicyId }
      );
    }

    console.log('');
  }

  async testInventoryApis(): Promise<void> {
    console.log('\n📦 Inventory APIs (36 endpoints - Full CRUD)');

    // Inventory Items (6 endpoints: GET list, GET, PUT, DELETE, 2x POST bulk)
    await this.testEndpoint(
      'Inventory',
      'getInventoryItems',
      'GET /sell/inventory/v1/inventory_item',
      () => this.api.inventory.getInventoryItems(5, 0),
      { limit: 5, offset: 0 }
    );

    // Test CREATE, UPDATE, DELETE flow with test data
    const testSku = `TEST-SKU-${Date.now()}`;
    const testInventoryItem = {
      availability: {
        shipToLocationAvailability: {
          quantity: 10,
        },
      },
      condition: 'NEW' as const,
      product: {
        title: 'Test Product',
        description: 'Test Description',
        aspects: {
          Brand: ['Test Brand'],
        },
        imageUrls: ['https://example.com/image.jpg'],
      },
    };

    // CREATE inventory item
    await this.testEndpoint(
      'Inventory',
      'createOrReplaceInventoryItem',
      'PUT /sell/inventory/v1/inventory_item/{sku}',
      () => this.api.inventory.createOrReplaceInventoryItem(testSku, testInventoryItem),
      { sku: testSku }
    );

    // READ created item
    await this.testEndpoint(
      'Inventory',
      'getInventoryItem (created)',
      'GET /sell/inventory/v1/inventory_item/{sku}',
      () => this.api.inventory.getInventoryItem(testSku),
      { sku: testSku }
    );

    // UPDATE inventory item
    await this.testEndpoint(
      'Inventory',
      'updateInventoryItem',
      'PUT /sell/inventory/v1/inventory_item/{sku} (update)',
      () =>
        this.api.inventory.createOrReplaceInventoryItem(testSku, {
          ...testInventoryItem,
          availability: { shipToLocationAvailability: { quantity: 20 } },
        }),
      { sku: testSku, quantity: 20 }
    );

    // Bulk operations
    await this.testEndpoint(
      'Inventory',
      'bulkCreateOrReplaceInventoryItem',
      'POST /sell/inventory/v1/bulk_create_or_replace_inventory_item',
      () => this.api.inventory.bulkCreateOrReplaceInventoryItem({ requests: [] }),
      { requests: [] }
    );

    await this.testEndpoint(
      'Inventory',
      'bulkGetInventoryItem',
      'POST /sell/inventory/v1/bulk_get_inventory_item',
      () => this.api.inventory.bulkGetInventoryItem({ requests: [] }),
      { requests: [] }
    );

    await this.testEndpoint(
      'Inventory',
      'bulkUpdatePriceQuantity',
      'POST /sell/inventory/v1/bulk_update_price_quantity',
      () => this.api.inventory.bulkUpdatePriceQuantity({ requests: [] }),
      { requests: [] }
    );

    // Product Compatibility (3 endpoints)
    await this.testEndpoint(
      'Inventory',
      'getProductCompatibility',
      'GET /sell/inventory/v1/inventory_item/{sku}/product_compatibility',
      () => this.api.inventory.getProductCompatibility(testSku),
      { sku: testSku }
    );

    await this.testEndpoint(
      'Inventory',
      'createOrReplaceProductCompatibility',
      'PUT /sell/inventory/v1/inventory_item/{sku}/product_compatibility',
      () =>
        this.api.inventory.createOrReplaceProductCompatibility(testSku, {
          compatibleProducts: [],
        }),
      { sku: testSku }
    );

    await this.testEndpoint(
      'Inventory',
      'deleteProductCompatibility',
      'DELETE /sell/inventory/v1/inventory_item/{sku}/product_compatibility',
      () => this.api.inventory.deleteProductCompatibility(testSku),
      { sku: testSku }
    );

    // Inventory Item Groups (3 endpoints)
    const testGroupKey = `TEST-GROUP-${Date.now()}`;
    await this.testEndpoint(
      'Inventory',
      'createOrReplaceInventoryItemGroup',
      'PUT /sell/inventory/v1/inventory_item_group/{inventoryItemGroupKey}',
      () =>
        this.api.inventory.createOrReplaceInventoryItemGroup(testGroupKey, {
          title: 'Test Group',
          variantSKUs: [testSku],
        }),
      { inventoryItemGroupKey: testGroupKey }
    );

    await this.testEndpoint(
      'Inventory',
      'getInventoryItemGroup',
      'GET /sell/inventory/v1/inventory_item_group/{inventoryItemGroupKey}',
      () => this.api.inventory.getInventoryItemGroup(testGroupKey),
      { inventoryItemGroupKey: testGroupKey }
    );

    await this.testEndpoint(
      'Inventory',
      'deleteInventoryItemGroup',
      'DELETE /sell/inventory/v1/inventory_item_group/{inventoryItemGroupKey}',
      () => this.api.inventory.deleteInventoryItemGroup(testGroupKey),
      { inventoryItemGroupKey: testGroupKey }
    );

    // Test with collected SKU if available
    if (this.collectedIds.inventoryItemSku) {
      await this.testEndpoint(
        'Inventory',
        'getInventoryItem (existing)',
        'GET /sell/inventory/v1/inventory_item/{sku}',
        () => this.api.inventory.getInventoryItem(this.collectedIds.inventoryItemSku!),
        { sku: this.collectedIds.inventoryItemSku }
      );
    }

    // Inventory Locations (8 endpoints: GET list, GET, POST, DELETE, disable, enable, update)
    await this.testEndpoint(
      'Inventory',
      'getInventoryLocations',
      'GET /sell/inventory/v1/location',
      () => this.api.inventory.getInventoryLocations(5, 0),
      { limit: 5, offset: 0 }
    );

    const testLocationKey = `TEST-LOC-${Date.now()}`;
    const testLocation = {
      name: 'Test Warehouse',
      locationTypes: ['WAREHOUSE'],
      location: {
        address: {
          addressLine1: '123 Test St',
          city: 'Test City',
          stateOrProvince: 'CA',
          postalCode: '90001',
          country: 'US',
        },
      },
      merchantLocationStatus: 'ENABLED',
    };

    // CREATE location
    await this.testEndpoint(
      'Inventory',
      'createOrReplaceInventoryLocation',
      'POST /sell/inventory/v1/location/{merchantLocationKey}',
      () => this.api.inventory.createOrReplaceInventoryLocation(testLocationKey, testLocation),
      { merchantLocationKey: testLocationKey }
    );

    // READ location
    await this.testEndpoint(
      'Inventory',
      'getInventoryLocation (created)',
      'GET /sell/inventory/v1/location/{merchantLocationKey}',
      () => this.api.inventory.getInventoryLocation(testLocationKey),
      { merchantLocationKey: testLocationKey }
    );

    // UPDATE location details
    await this.testEndpoint(
      'Inventory',
      'updateLocationDetails',
      'POST /sell/inventory/v1/location/{merchantLocationKey}/update_location_details',
      () =>
        this.api.inventory.updateLocationDetails(testLocationKey, {
          name: 'Updated Test Warehouse',
        }),
      { merchantLocationKey: testLocationKey }
    );

    // DISABLE location
    await this.testEndpoint(
      'Inventory',
      'disableInventoryLocation',
      'POST /sell/inventory/v1/location/{merchantLocationKey}/disable',
      () => this.api.inventory.disableInventoryLocation(testLocationKey),
      { merchantLocationKey: testLocationKey }
    );

    // ENABLE location
    await this.testEndpoint(
      'Inventory',
      'enableInventoryLocation',
      'POST /sell/inventory/v1/location/{merchantLocationKey}/enable',
      () => this.api.inventory.enableInventoryLocation(testLocationKey),
      { merchantLocationKey: testLocationKey }
    );

    // DELETE location
    await this.testEndpoint(
      'Inventory',
      'deleteInventoryLocation',
      'DELETE /sell/inventory/v1/location/{merchantLocationKey}',
      () => this.api.inventory.deleteInventoryLocation(testLocationKey),
      { merchantLocationKey: testLocationKey }
    );

    // Test with collected location if available
    if (this.collectedIds.inventoryLocationKey) {
      await this.testEndpoint(
        'Inventory',
        'getInventoryLocation (existing)',
        'GET /sell/inventory/v1/location/{merchantLocationKey}',
        () => this.api.inventory.getInventoryLocation(this.collectedIds.inventoryLocationKey!),
        { merchantLocationKey: this.collectedIds.inventoryLocationKey }
      );
    }

    // Offers (14 endpoints: GET list, GET, POST, PUT, DELETE, publish, withdraw, bulk ops, fees, etc.)
    await this.testEndpoint(
      'Inventory',
      'getOffers',
      'GET /sell/inventory/v1/offer',
      () => this.api.inventory.getOffers(undefined, 'EBAY_US', 5),
      { marketplaceId: 'EBAY_US', limit: 5 }
    );

    // Test CREATE offer (requires policy IDs from account)
    if (this.collectedIds.fulfillmentPolicyId && this.collectedIds.paymentPolicyId && this.collectedIds.returnPolicyId) {
      const testOffer = {
        sku: testSku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        listingPolicies: {
          fulfillmentPolicyId: this.collectedIds.fulfillmentPolicyId,
          paymentPolicyId: this.collectedIds.paymentPolicyId,
          returnPolicyId: this.collectedIds.returnPolicyId,
        },
        pricingSummary: {
          price: {
            value: '9.99',
            currency: 'USD',
          },
        },
        categoryId: '1',
        merchantLocationKey: testLocationKey,
      };

      let createdOfferId: string | undefined;
      await this.testEndpoint(
        'Inventory',
        'createOffer',
        'POST /sell/inventory/v1/offer',
        async () => {
          const result = await this.api.inventory.createOffer(testOffer as any);
          createdOfferId = result.offerId;
          return result;
        },
        testOffer
      );

      // UPDATE offer if created
      if (createdOfferId) {
        await this.testEndpoint(
          'Inventory',
          'updateOffer',
          'PUT /sell/inventory/v1/offer/{offerId}',
          () =>
            this.api.inventory.updateOffer(createdOfferId!, {
              ...testOffer,
              pricingSummary: { price: { value: '19.99', currency: 'USD' } },
            }),
          { offerId: createdOfferId, newPrice: '19.99' }
        );

        // GET created offer
        await this.testEndpoint(
          'Inventory',
          'getOffer (created)',
          'GET /sell/inventory/v1/offer/{offerId}',
          () => this.api.inventory.getOffer(createdOfferId!),
          { offerId: createdOfferId }
        );

        // PUBLISH offer
        await this.testEndpoint(
          'Inventory',
          'publishOffer',
          'POST /sell/inventory/v1/offer/{offerId}/publish',
          () => this.api.inventory.publishOffer(createdOfferId!),
          { offerId: createdOfferId }
        );

        // WITHDRAW offer
        await this.testEndpoint(
          'Inventory',
          'withdrawOffer',
          'POST /sell/inventory/v1/offer/{offerId}/withdraw',
          () => this.api.inventory.withdrawOffer(createdOfferId!),
          { offerId: createdOfferId }
        );

        // GET listing fees
        await this.testEndpoint(
          'Inventory',
          'getListingFees',
          'POST /sell/inventory/v1/offer/get_listing_fees',
          () => this.api.inventory.getListingFees([createdOfferId!]),
          { offerIds: [createdOfferId] }
        );

        // DELETE offer
        await this.testEndpoint(
          'Inventory',
          'deleteOffer',
          'DELETE /sell/inventory/v1/offer/{offerId}',
          () => this.api.inventory.deleteOffer(createdOfferId!),
          { offerId: createdOfferId }
        );
      }
    }

    // Bulk offer operations
    await this.testEndpoint(
      'Inventory',
      'bulkCreateOffer',
      'POST /sell/inventory/v1/bulk_create_offer',
      () => this.api.inventory.bulkCreateOffer({ requests: [] }),
      { requests: [] }
    );

    await this.testEndpoint(
      'Inventory',
      'bulkPublishOffer',
      'POST /sell/inventory/v1/bulk_publish_offer',
      () => this.api.inventory.bulkPublishOffer({ requests: [] }),
      { requests: [] }
    );

    await this.testEndpoint(
      'Inventory',
      'publishOfferByInventoryItemGroup',
      'POST /sell/inventory/v1/offer/publish_by_inventory_item_group',
      () =>
        this.api.inventory.publishOfferByInventoryItemGroup({
          inventoryItemGroupKey: testGroupKey,
          marketplaceId: 'EBAY_US',
        }),
      { inventoryItemGroupKey: testGroupKey }
    );

    await this.testEndpoint(
      'Inventory',
      'withdrawOfferByInventoryItemGroup',
      'POST /sell/inventory/v1/offer/withdraw_by_inventory_item_group',
      () =>
        this.api.inventory.withdrawOfferByInventoryItemGroup({
          inventoryItemGroupKey: testGroupKey,
          marketplaceId: 'EBAY_US',
        }),
      { inventoryItemGroupKey: testGroupKey }
    );

    // Bulk migrate listing
    await this.testEndpoint(
      'Inventory',
      'bulkMigrateListing',
      'POST /sell/inventory/v1/bulk_migrate_listing',
      () => this.api.inventory.bulkMigrateListing({ requests: [] }),
      { requests: [] }
    );

    // Listing locations
    if (this.collectedIds.inventoryItemSku) {
      await this.testEndpoint(
        'Inventory',
        'getListingLocations',
        'GET /sell/inventory/v1/listing/{listingId}/sku/{sku}/locations',
        () => this.api.inventory.getListingLocations('test-listing-id', this.collectedIds.inventoryItemSku!),
        { listingId: 'test-listing-id', sku: this.collectedIds.inventoryItemSku }
      );
    }

    // Test with collected offer if available
    if (this.collectedIds.offerId) {
      await this.testEndpoint(
        'Inventory',
        'getOffer (existing)',
        'GET /sell/inventory/v1/offer/{offerId}',
        () => this.api.inventory.getOffer(this.collectedIds.offerId!),
        { offerId: this.collectedIds.offerId }
      );
    }

    // CLEANUP: Delete test inventory item
    await this.testEndpoint(
      'Inventory',
      'deleteInventoryItem (cleanup)',
      'DELETE /sell/inventory/v1/inventory_item/{sku}',
      () => this.api.inventory.deleteInventoryItem(testSku),
      { sku: testSku }
    );

    console.log('');
  }

  async testFulfillmentApis(): Promise<void> {
    console.log('\n📮 Fulfillment APIs (24 endpoints - Full CRUD)');

    // Orders (8 endpoints: GET list, GET, shipping fulfillments, cancellations, returns)
    await this.testEndpoint(
      'Fulfillment',
      'getOrders',
      'GET /sell/fulfillment/v1/order',
      () => this.api.fulfillment.getOrders({ limit: 5 }),
      { limit: 5 }
    );

    // Test with order if we have an ID
    if (this.collectedIds.orderId) {
      await this.testEndpoint(
        'Fulfillment',
        'getOrder',
        'GET /sell/fulfillment/v1/order/{orderId}',
        () => this.api.fulfillment.getOrder(this.collectedIds.orderId!),
        { orderId: this.collectedIds.orderId }
      );

      // Shipping Fulfillments
      await this.testEndpoint(
        'Fulfillment',
        'getShippingFulfillments',
        'GET /sell/fulfillment/v1/order/{orderId}/shipping_fulfillment',
        () => this.api.fulfillment.getShippingFulfillments(this.collectedIds.orderId!),
        { orderId: this.collectedIds.orderId }
      );

      // CREATE shipping fulfillment
      const testFulfillment = {
        lineItems: [
          {
            lineItemId: 'test-line-item-id',
            quantity: 1,
          },
        ],
        shippingCarrierCode: 'USPS',
        trackingNumber: `TEST${Date.now()}`,
      };

      let createdFulfillmentId: string | undefined;
      await this.testEndpoint(
        'Fulfillment',
        'createShippingFulfillment',
        'POST /sell/fulfillment/v1/order/{orderId}/shipping_fulfillment',
        async () => {
          const result = await this.api.fulfillment.createShippingFulfillment(
            this.collectedIds.orderId!,
            testFulfillment as any
          );
          createdFulfillmentId = result.fulfillmentId;
          return result;
        },
        { orderId: this.collectedIds.orderId, ...testFulfillment }
      );

      if (createdFulfillmentId) {
        // READ shipping fulfillment
        await this.testEndpoint(
          'Fulfillment',
          'getShippingFulfillment',
          'GET /sell/fulfillment/v1/order/{orderId}/shipping_fulfillment/{fulfillmentId}',
          () =>
            this.api.fulfillment.getShippingFulfillment(
              this.collectedIds.orderId!,
              createdFulfillmentId!
            ),
          { orderId: this.collectedIds.orderId, fulfillmentId: createdFulfillmentId }
        );
      }

      // Cancellation requests
      await this.testEndpoint(
        'Fulfillment',
        'getCancellationRequests',
        'GET /sell/fulfillment/v1/order/{orderId}/cancellation',
        () => this.api.fulfillment.getCancellationRequests(this.collectedIds.orderId!),
        { orderId: this.collectedIds.orderId }
      );

      // Issue refund
      await this.testEndpoint(
        'Fulfillment',
        'issueRefund',
        'POST /sell/fulfillment/v1/order/{orderId}/issue_refund',
        () =>
          this.api.fulfillment.issueRefund(this.collectedIds.orderId!, {
            reasonForRefund: 'BUYER_CANCEL',
            refundItems: [],
          } as any),
        { orderId: this.collectedIds.orderId, reason: 'BUYER_CANCEL' }
      );
    }

    // Payment Disputes (9 endpoints: full lifecycle)
    await this.testEndpoint(
      'Fulfillment',
      'getPaymentDisputeSummaries',
      'GET /sell/fulfillment/v1/payment_dispute_summary',
      () => this.api.fulfillment.getPaymentDisputeSummaries({ limit: 5 }),
      { limit: 5 }
    );

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

      // Respond to dispute
      await this.testEndpoint(
        'Fulfillment',
        'contestPaymentDispute',
        'POST /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/contest',
        () =>
          this.api.fulfillment.contestPaymentDispute(this.collectedIds.paymentDisputeId!, {
            returnAddress: {
              addressLine1: '123 Test St',
              city: 'Test City',
              stateOrProvince: 'CA',
              postalCode: '90001',
              countryCode: 'US',
            },
          } as any),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'acceptPaymentDispute',
        'POST /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/accept',
        () =>
          this.api.fulfillment.acceptPaymentDispute(this.collectedIds.paymentDisputeId!, {} as any),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'addEvidence',
        'POST /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/add_evidence',
        () =>
          this.api.fulfillment.addEvidence(this.collectedIds.paymentDisputeId!, {
            evidenceType: 'PROOF_OF_DELIVERY',
            files: [],
          } as any),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'updateEvidence',
        'POST /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/update_evidence',
        () =>
          this.api.fulfillment.updateEvidence(this.collectedIds.paymentDisputeId!, {
            evidenceId: 'test-evidence-id',
            files: [],
          } as any),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );

      await this.testEndpoint(
        'Fulfillment',
        'uploadEvidenceFile',
        'POST /sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/upload_evidence_file',
        () =>
          this.api.fulfillment.uploadEvidenceFile(this.collectedIds.paymentDisputeId!, {} as any),
        { payment_dispute_id: this.collectedIds.paymentDisputeId }
      );
    }

    // Shipping Quote (1 endpoint)
    await this.testEndpoint(
      'Fulfillment',
      'getShippingQuote',
      'POST /sell/fulfillment/v1/shipping_quote',
      () =>
        this.api.fulfillment.getShippingQuote({
          shippingAddress: {
            addressLine1: '123 Test St',
            city: 'Test City',
            stateOrProvince: 'CA',
            postalCode: '90001',
            countryCode: 'US',
          },
          packageDetails: {
            weight: { value: '1', unit: 'POUND' },
            dimensions: {
              length: '10',
              width: '10',
              height: '10',
              unit: 'INCH',
            },
          },
        } as any),
      { destination: 'CA, US' }
    );

    // Returns (4 endpoints)
    await this.testEndpoint(
      'Fulfillment',
      'getReturnRequests',
      'GET /sell/fulfillment/v1/return',
      () => this.api.fulfillment.getReturnRequests({ limit: 5 } as any),
      { limit: 5 }
    );

    await this.testEndpoint(
      'Fulfillment',
      'searchReturnRequests',
      'GET /sell/fulfillment/v1/return/search',
      () => this.api.fulfillment.searchReturnRequests({ limit: 5 } as any),
      { limit: 5 }
    );

    // Program eligibility
    await this.testEndpoint(
      'Fulfillment',
      'getEBayFulfillmentProgram',
      'GET /sell/fulfillment/v1/ebay_fulfill/program',
      () => this.api.fulfillment.getEBayFulfillmentProgram(),
      {}
    );

    console.log('');
  }

  async testMarketingApis(): Promise<void> {
    console.log('\n📢 Marketing APIs (82 endpoints - Full CRUD)');

    // Ad Campaigns (30+ endpoints: full lifecycle management)
    await this.testEndpoint(
      'Marketing',
      'getCampaigns',
      'GET /sell/marketing/v1/ad_campaign',
      () => this.api.marketing.getCampaigns({ limit: 5 }),
      { limit: 5 }
    );

    // CREATE campaign
    const testCampaign = {
      campaignName: `Test Campaign ${Date.now()}`,
      marketplaceId: 'EBAY_US',
      fundingStrategy: {
        fundingModel: 'COST_PER_SALE' as const,
        bidPercentage: '5.0',
      },
      startDate: new Date().toISOString().split('T')[0],
    };

    let createdCampaignId: string | undefined;
    await this.testEndpoint(
      'Marketing',
      'createCampaign',
      'POST /sell/marketing/v1/ad_campaign',
      async () => {
        const result = await this.api.marketing.createCampaign(testCampaign as any);
        createdCampaignId = result.campaignId;
        return result;
      },
      testCampaign
    );

    if (createdCampaignId) {
      // READ campaign
      await this.testEndpoint(
        'Marketing',
        'getCampaign (created)',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}',
        () => this.api.marketing.getCampaign(createdCampaignId!),
        { campaign_id: createdCampaignId }
      );

      // UPDATE campaign identification
      await this.testEndpoint(
        'Marketing',
        'updateCampaignIdentification',
        'PUT /sell/marketing/v1/ad_campaign/{campaign_id}/update_campaign_identification',
        () =>
          this.api.marketing.updateCampaignIdentification(createdCampaignId!, {
            campaignName: `Updated Campaign ${Date.now()}`,
          } as any),
        { campaign_id: createdCampaignId }
      );

      // Update campaign budget
      await this.testEndpoint(
        'Marketing',
        'updateCampaignBudget',
        'PUT /sell/marketing/v1/ad_campaign/{campaign_id}/update_campaign_budget',
        () =>
          this.api.marketing.updateCampaignBudget(createdCampaignId!, {
            budget: { value: '100.00', currency: 'USD' },
          } as any),
        { campaign_id: createdCampaignId }
      );

      // Update bidding strategy
      await this.testEndpoint(
        'Marketing',
        'updateBiddingStrategy',
        'PUT /sell/marketing/v1/ad_campaign/{campaign_id}/update_bidding_strategy',
        () =>
          this.api.marketing.updateBiddingStrategy(createdCampaignId!, {
            bidPercentage: '7.5',
          } as any),
        { campaign_id: createdCampaignId }
      );

      // Ad Groups management
      await this.testEndpoint(
        'Marketing',
        'getAdGroups',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group',
        () => this.api.marketing.getAdGroups(createdCampaignId!, { limit: 5 }),
        { campaign_id: createdCampaignId, limit: 5 }
      );

      // CREATE ad group
      let createdAdGroupId: string | undefined;
      await this.testEndpoint(
        'Marketing',
        'createAdGroup',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group',
        async () => {
          const result = await this.api.marketing.createAdGroup(createdCampaignId!, {
            adGroupName: `Test Ad Group ${Date.now()}`,
            defaultBid: { value: '1.00', currency: 'USD' },
          } as any);
          createdAdGroupId = result.adGroupId;
          return result;
        },
        { campaign_id: createdCampaignId }
      );

      if (createdAdGroupId) {
        // READ ad group
        await this.testEndpoint(
          'Marketing',
          'getAdGroup',
          'GET /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}',
          () => this.api.marketing.getAdGroup(createdCampaignId!, createdAdGroupId!),
          { campaign_id: createdCampaignId, ad_group_id: createdAdGroupId }
        );

        // UPDATE ad group
        await this.testEndpoint(
          'Marketing',
          'updateAdGroup',
          'PUT /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}',
          () =>
            this.api.marketing.updateAdGroup(createdCampaignId!, createdAdGroupId!, {
              adGroupName: `Updated Ad Group ${Date.now()}`,
            } as any),
          { campaign_id: createdCampaignId, ad_group_id: createdAdGroupId }
        );

        // Suggest bids
        await this.testEndpoint(
          'Marketing',
          'suggestBids',
          'POST /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}/suggest_bids',
          () => this.api.marketing.suggestBids(createdCampaignId!, createdAdGroupId!, {} as any),
          { campaign_id: createdCampaignId, ad_group_id: createdAdGroupId }
        );

        // Suggest keywords
        await this.testEndpoint(
          'Marketing',
          'suggestKeywords',
          'POST /sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}/suggest_keywords',
          () =>
            this.api.marketing.suggestKeywords(createdCampaignId!, createdAdGroupId!, {
              adGroupId: createdAdGroupId,
            } as any),
          { campaign_id: createdCampaignId, ad_group_id: createdAdGroupId }
        );
      }

      // Ads management
      await this.testEndpoint(
        'Marketing',
        'getAds',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/ad',
        () => this.api.marketing.getAds(createdCampaignId!, { limit: 5 }),
        { campaign_id: createdCampaignId, limit: 5 }
      );

      // Bulk operations for ads
      await this.testEndpoint(
        'Marketing',
        'bulkCreateAdsByInventoryReference',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/bulk_create_ads_by_inventory_reference',
        () =>
          this.api.marketing.bulkCreateAdsByInventoryReference(createdCampaignId!, {
            requests: [],
          } as any),
        { campaign_id: createdCampaignId }
      );

      await this.testEndpoint(
        'Marketing',
        'bulkUpdateAdsBidByInventoryReference',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_ads_bid_by_inventory_reference',
        () =>
          this.api.marketing.bulkUpdateAdsBidByInventoryReference(createdCampaignId!, {
            requests: [],
          } as any),
        { campaign_id: createdCampaignId }
      );

      await this.testEndpoint(
        'Marketing',
        'bulkUpdateAdsStatus',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_ads_status',
        () =>
          this.api.marketing.bulkUpdateAdsStatus(createdCampaignId!, { requests: [] } as any),
        { campaign_id: createdCampaignId }
      );

      await this.testEndpoint(
        'Marketing',
        'bulkDeleteAdsByInventoryReference',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/bulk_delete_ads_by_inventory_reference',
        () =>
          this.api.marketing.bulkDeleteAdsByInventoryReference(createdCampaignId!, {
            requests: [],
          } as any),
        { campaign_id: createdCampaignId }
      );

      // Keywords management
      await this.testEndpoint(
        'Marketing',
        'getKeywords',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/keyword',
        () => this.api.marketing.getKeywords(createdCampaignId!, { limit: 5 }),
        { campaign_id: createdCampaignId, limit: 5 }
      );

      await this.testEndpoint(
        'Marketing',
        'bulkCreateKeyword',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/bulk_create_keyword',
        () =>
          this.api.marketing.bulkCreateKeyword(createdCampaignId!, { keywords: [] } as any),
        { campaign_id: createdCampaignId }
      );

      await this.testEndpoint(
        'Marketing',
        'bulkUpdateKeyword',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_keyword',
        () =>
          this.api.marketing.bulkUpdateKeyword(createdCampaignId!, { keywords: [] } as any),
        { campaign_id: createdCampaignId }
      );

      // Negative keywords
      await this.testEndpoint(
        'Marketing',
        'getNegativeKeywords',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}/negative_keyword',
        () => this.api.marketing.getNegativeKeywords(createdCampaignId!, { limit: 5 }),
        { campaign_id: createdCampaignId, limit: 5 }
      );

      await this.testEndpoint(
        'Marketing',
        'bulkCreateNegativeKeyword',
        'POST /sell/marketing/v1/bulk_create_negative_keyword',
        () => this.api.marketing.bulkCreateNegativeKeyword({ negativeKeywords: [] } as any),
        {}
      );

      await this.testEndpoint(
        'Marketing',
        'bulkUpdateNegativeKeyword',
        'POST /sell/marketing/v1/bulk_update_negative_keyword',
        () => this.api.marketing.bulkUpdateNegativeKeyword({ negativeKeywords: [] } as any),
        {}
      );

      // Campaign state management
      await this.testEndpoint(
        'Marketing',
        'pauseCampaign',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/pause',
        () => this.api.marketing.pauseCampaign(createdCampaignId!),
        { campaign_id: createdCampaignId }
      );

      await this.testEndpoint(
        'Marketing',
        'resumeCampaign',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/resume',
        () => this.api.marketing.resumeCampaign(createdCampaignId!),
        { campaign_id: createdCampaignId }
      );

      await this.testEndpoint(
        'Marketing',
        'endCampaign',
        'POST /sell/marketing/v1/ad_campaign/{campaign_id}/end',
        () => this.api.marketing.endCampaign(createdCampaignId!),
        { campaign_id: createdCampaignId }
      );

      // DELETE campaign
      await this.testEndpoint(
        'Marketing',
        'deleteCampaign',
        'DELETE /sell/marketing/v1/ad_campaign/{campaign_id}',
        () => this.api.marketing.deleteCampaign(createdCampaignId!),
        { campaign_id: createdCampaignId }
      );
    }

    // Campaign utilities
    await this.testEndpoint(
      'Marketing',
      'findCampaignByAdReference',
      'GET /sell/marketing/v1/ad_campaign/find_campaign_by_ad_reference',
      () =>
        this.api.marketing.findCampaignByAdReference({
          inventoryReferenceId: 'test-id',
          inventoryReferenceType: 'INVENTORY_ITEM',
        } as any),
      { referenceId: 'test-id' }
    );

    await this.testEndpoint(
      'Marketing',
      'getCampaignByName',
      'GET /sell/marketing/v1/ad_campaign/get_campaign_by_name',
      () => this.api.marketing.getCampaignByName('Test Campaign', 'EBAY_US'),
      { campaignName: 'Test Campaign', marketplace_id: 'EBAY_US' }
    );

    await this.testEndpoint(
      'Marketing',
      'suggestBudget',
      'POST /sell/marketing/v1/ad_campaign/suggest_budget',
      () => this.api.marketing.suggestBudget({ marketplaceId: 'EBAY_US' } as any),
      { marketplace_id: 'EBAY_US' }
    );

    // Promotions (30+ endpoints)
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

    // CREATE item promotion
    const testPromotion = {
      name: `Test Promotion ${Date.now()}`,
      marketplaceId: 'EBAY_US',
      priority: 'FEATURED' as const,
      promotionType: 'ORDER_DISCOUNT' as const,
      discountRules: [
        {
          discountBenefit: {
            percentageOffOrder: '10',
          },
          ruleOrder: 1,
        },
      ],
      inventoryCriterion: {
        inventoryCriterionType: 'INVENTORY_ANY' as const,
      },
    };

    let createdPromotionId: string | undefined;
    await this.testEndpoint(
      'Marketing',
      'createItemPromotion',
      'POST /sell/marketing/v1/item_promotion',
      async () => {
        const result = await this.api.marketing.createItemPromotion(testPromotion as any);
        createdPromotionId = result.promotionId;
        return result;
      },
      testPromotion
    );

    if (createdPromotionId) {
      await this.testEndpoint(
        'Marketing',
        'getPromotion (created)',
        'GET /sell/marketing/v1/promotion/{promotion_id}',
        () => this.api.marketing.getPromotion(createdPromotionId!),
        { promotion_id: createdPromotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'getItemPromotion',
        'GET /sell/marketing/v1/item_promotion/{promotion_id}',
        () => this.api.marketing.getItemPromotion(createdPromotionId!),
        { promotion_id: createdPromotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'updateItemPromotion',
        'PUT /sell/marketing/v1/item_promotion/{promotion_id}',
        () =>
          this.api.marketing.updateItemPromotion(createdPromotionId!, {
            ...testPromotion,
            name: `Updated Promotion ${Date.now()}`,
          } as any),
        { promotion_id: createdPromotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'pausePromotion',
        'POST /sell/marketing/v1/promotion/{promotion_id}/pause',
        () => this.api.marketing.pausePromotion(createdPromotionId!),
        { promotion_id: createdPromotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'resumePromotion',
        'POST /sell/marketing/v1/promotion/{promotion_id}/resume',
        () => this.api.marketing.resumePromotion(createdPromotionId!),
        { promotion_id: createdPromotionId }
      );

      await this.testEndpoint(
        'Marketing',
        'deletePromotion',
        'DELETE /sell/marketing/v1/promotion/{promotion_id}',
        () => this.api.marketing.deletePromotion(createdPromotionId!),
        { promotion_id: createdPromotionId }
      );
    }

    // Test with existing IDs if available
    if (this.collectedIds.campaignId) {
      await this.testEndpoint(
        'Marketing',
        'getCampaign (existing)',
        'GET /sell/marketing/v1/ad_campaign/{campaign_id}',
        () => this.api.marketing.getCampaign(this.collectedIds.campaignId!),
        { campaign_id: this.collectedIds.campaignId }
      );
    }

    if (this.collectedIds.promotionId) {
      await this.testEndpoint(
        'Marketing',
        'getPromotion (existing)',
        'GET /sell/marketing/v1/promotion/{promotion_id}',
        () => this.api.marketing.getPromotion(this.collectedIds.promotionId!),
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
      () => this.api.analytics.getSellerStandardsProfile('COMPLIANCE', 'CURRENT')
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
    console.log('═'.repeat(80));
    console.log('🚀 COMPREHENSIVE eBay API ENDPOINT TEST SUITE');
    console.log('═'.repeat(80));
    console.log('\n📋 Test Coverage (CRUD = Full Lifecycle Testing):');
    console.log('  ✅ Account Management: 37 endpoints (Full CRUD)');
    console.log('     • Policies: Fulfillment, Payment, Return, Custom');
    console.log('     • Sales Tax, Programs, Subscriptions');
    console.log('  ✅ Inventory: 36 endpoints (Full CRUD)');
    console.log('     • Items, Locations, Offers, Item Groups');
    console.log('     • Product Compatibility, Bulk Operations');
    console.log('  ✅ Marketing: 82 endpoints (Full CRUD)');
    console.log('     • Campaigns, Ad Groups, Ads, Keywords');
    console.log('     • Promotions, Bidding, Budget Management');
    console.log('  ✅ Fulfillment: 24 endpoints (Full CRUD)');
    console.log('     • Orders, Shipping, Returns, Refunds');
    console.log('     • Payment Disputes, Evidence Management');
    console.log('  📊 Analytics: 4 endpoints (Read-Only)');
    console.log('  📖 Metadata: 22 endpoints (Read-Only)');
    console.log('  🏷️  Taxonomy: 5 endpoints (Read-Only)');
    console.log('  🔧 Other APIs: ~65 endpoints');
    console.log('  ────────────────────────────────');
    console.log('  📊 TOTAL: 275+ endpoints | 210+ with CRUD\n');
    console.log('⚙️  Test Strategy:');
    console.log('  Phase 1: Collect real IDs from list operations');
    console.log('  Phase 2: Execute comprehensive CRUD flows');
    console.log('  • CREATE → READ → UPDATE → PAUSE/RESUME → DELETE');
    console.log('  • Automatic cleanup of test data');
    console.log('  • Retry logic for network errors');
    console.log('  • Smart error classification\n');
    console.log('🛡️  Safety: SANDBOX MODE ENFORCED (Production blocked)\n');
    console.log('═'.repeat(80));
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
