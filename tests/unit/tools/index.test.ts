import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeTool, getToolDefinitions } from '../../../src/tools/index.js';
import type { EbaySellerApi } from '../../../src/api/index.js';

describe('Tools Layer', () => {
  let mockApi: EbaySellerApi;

  beforeEach(() => {
    // Create comprehensive mock API
    mockApi = {
      // Account API
      account: {
        getCustomPolicies: vi.fn(),
        getFulfillmentPolicies: vi.fn(),
        getPaymentPolicies: vi.fn(),
        getReturnPolicies: vi.fn(),
        createFulfillmentPolicy: vi.fn(),
        getFulfillmentPolicy: vi.fn(),
        getFulfillmentPolicyByName: vi.fn(),
        updateFulfillmentPolicy: vi.fn(),
        deleteFulfillmentPolicy: vi.fn(),
        createPaymentPolicy: vi.fn(),
        getPaymentPolicy: vi.fn(),
        getPaymentPolicyByName: vi.fn(),
        updatePaymentPolicy: vi.fn(),
        deletePaymentPolicy: vi.fn(),
        createReturnPolicy: vi.fn(),
        getReturnPolicy: vi.fn(),
        getReturnPolicyByName: vi.fn(),
        updateReturnPolicy: vi.fn(),
        deleteReturnPolicy: vi.fn(),
        createCustomPolicy: vi.fn(),
        getCustomPolicy: vi.fn(),
        updateCustomPolicy: vi.fn(),
        deleteCustomPolicy: vi.fn(),
        getKyc: vi.fn(),
        optInToPaymentsProgram: vi.fn(),
        getPaymentsProgramStatus: vi.fn(),
        getRateTables: vi.fn(),
        createOrReplaceSalesTax: vi.fn(),
        bulkCreateOrReplaceSalesTax: vi.fn(),
        deleteSalesTax: vi.fn(),
        getSalesTax: vi.fn(),
        getSalesTaxes: vi.fn(),
        getSubscription: vi.fn(),
        optInToProgram: vi.fn(),
        optOutOfProgram: vi.fn(),
        getOptedInPrograms: vi.fn(),
      },
      // Inventory API
      inventory: {
        getInventoryItems: vi.fn(),
        getInventoryItem: vi.fn(),
        createOrReplaceInventoryItem: vi.fn(),
        bulkCreateOrReplaceInventoryItem: vi.fn(),
        bulkGetInventoryItem: vi.fn(),
        bulkUpdatePriceQuantity: vi.fn(),
        getProductCompatibility: vi.fn(),
        createOrReplaceProductCompatibility: vi.fn(),
        deleteProductCompatibility: vi.fn(),
        getInventoryItemGroup: vi.fn(),
        createOrReplaceInventoryItemGroup: vi.fn(),
        deleteInventoryItemGroup: vi.fn(),
        getInventoryLocations: vi.fn(),
        getInventoryLocation: vi.fn(),
        createOrReplaceInventoryLocation: vi.fn(),
        deleteInventoryLocation: vi.fn(),
        disableInventoryLocation: vi.fn(),
        enableInventoryLocation: vi.fn(),
        updateLocationDetails: vi.fn(),
        getOffers: vi.fn(),
        getOffer: vi.fn(),
        createOffer: vi.fn(),
        updateOffer: vi.fn(),
        deleteOffer: vi.fn(),
        publishOffer: vi.fn(),
        withdrawOffer: vi.fn(),
        bulkCreateOffer: vi.fn(),
        bulkPublishOffer: vi.fn(),
        getListingFees: vi.fn(),
        bulkMigrateListing: vi.fn(),
      },
      // Fulfillment API
      fulfillment: {
        getOrders: vi.fn(),
        getOrder: vi.fn(),
        createShippingFulfillment: vi.fn(),
        issueRefund: vi.fn(),
      },
      // Marketing API
      marketing: {
        getCampaigns: vi.fn(),
        getCampaign: vi.fn(),
        pauseCampaign: vi.fn(),
        resumeCampaign: vi.fn(),
        endCampaign: vi.fn(),
        updateCampaignIdentification: vi.fn(),
        cloneCampaign: vi.fn(),
        getPromotions: vi.fn(),
      },
      // Recommendation API
      recommendation: {
        findListingRecommendations: vi.fn(),
      },
      // Analytics API
      analytics: {
        getTrafficReport: vi.fn(),
        findSellerStandardsProfiles: vi.fn(),
        getSellerStandardsProfile: vi.fn(),
        getCustomerServiceMetric: vi.fn(),
      },
      // Metadata API
      metadata: {
        getAutomotivePartsCompatibilityPolicies: vi.fn(),
        getCategoryPolicies: vi.fn(),
        getExtendedProducerResponsibilityPolicies: vi.fn(),
        getHazardousMaterialsLabels: vi.fn(),
        getItemConditionPolicies: vi.fn(),
        getListingStructurePolicies: vi.fn(),
        getNegotiatedPricePolicies: vi.fn(),
        getProductSafetyLabels: vi.fn(),
        getRegulatoryPolicies: vi.fn(),
        getShippingCostTypePolicies: vi.fn(),
        getClassifiedAdPolicies: vi.fn(),
        getCurrencies: vi.fn(),
        getListingTypePolicies: vi.fn(),
        getMotorsListingPolicies: vi.fn(),
        getShippingPolicies: vi.fn(),
        getSiteVisibilityPolicies: vi.fn(),
        getCompatibilitiesBySpecification: vi.fn(),
        getCompatibilityPropertyNames: vi.fn(),
        getCompatibilityPropertyValues: vi.fn(),
        getMultiCompatibilityPropertyValues: vi.fn(),
        getProductCompatibilities: vi.fn(),
        getSalesTaxJurisdictions: vi.fn(),
      },
      // Taxonomy API
      taxonomy: {
        getDefaultCategoryTreeId: vi.fn(),
        getCategoryTree: vi.fn(),
        getCategorySuggestions: vi.fn(),
        getItemAspectsForCategory: vi.fn(),
      },
      // Communication APIs
      negotiation: {
        getOffersToBuyers: vi.fn(),
        sendOfferToInterestedBuyers: vi.fn(),
        findEligibleItems: vi.fn(),
      },
      message: {
        searchMessages: vi.fn(),
        getMessage: vi.fn(),
        sendMessage: vi.fn(),
        replyToMessage: vi.fn(),
        getConversations: vi.fn(),
        getConversation: vi.fn(),
        bulkUpdateConversation: vi.fn(),
        updateConversation: vi.fn(),
      },
      notification: {
        getConfig: vi.fn(),
        updateConfig: vi.fn(),
        createDestination: vi.fn(),
        getDestination: vi.fn(),
        updateDestination: vi.fn(),
        deleteDestination: vi.fn(),
        getSubscriptions: vi.fn(),
        createSubscription: vi.fn(),
        getSubscription: vi.fn(),
        updateSubscription: vi.fn(),
        deleteSubscription: vi.fn(),
        disableSubscription: vi.fn(),
        enableSubscription: vi.fn(),
        testSubscription: vi.fn(),
        getTopic: vi.fn(),
        getTopics: vi.fn(),
        createSubscriptionFilter: vi.fn(),
        getSubscriptionFilter: vi.fn(),
        deleteSubscriptionFilter: vi.fn(),
        getPublicKey: vi.fn(),
      },
      feedback: {
        getFeedback: vi.fn(),
        leaveFeedbackForBuyer: vi.fn(),
        getFeedbackSummary: vi.fn(),
        getAwaitingFeedback: vi.fn(),
        respondToFeedback: vi.fn(),
      },
      // Other APIs
      identity: {
        getUser: vi.fn(),
      },
      compliance: {
        getListingViolations: vi.fn(),
        getListingViolationsSummary: vi.fn(),
        suppressViolation: vi.fn(),
      },
      vero: {
        reportInfringement: vi.fn(),
        getReportedItems: vi.fn(),
      },
      translation: {
        translate: vi.fn(),
      },
      edelivery: {
        createShippingQuote: vi.fn(),
        getShippingQuote: vi.fn(),
      },
      // Token management methods
      setUserTokens: vi.fn(),
      getTokenInfo: vi.fn().mockReturnValue({
        hasUserToken: false,
        hasAppAccessToken: true,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      }),
      hasUserTokens: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(true),
      getAuthClient: vi.fn().mockReturnValue({
        getOAuthClient: vi.fn().mockReturnValue({
          clearAllTokens: vi.fn(),
          getAccessToken: vi.fn(),
        }),
      }),
    } as unknown as EbaySellerApi;
  });

  describe('getToolDefinitions', () => {
    it('should return all tool definitions', () => {
      const tools = getToolDefinitions();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      // Check that tools have required properties
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
      });
    });

    it('should include all tool categories', () => {
      const tools = getToolDefinitions();
      const toolNames = tools.map((t) => t.name);

      // Check for tools from each category
      expect(toolNames).toContain('ebay_get_oauth_url'); // tokenManagementTools
      expect(toolNames).toContain('ebay_get_custom_policies'); // accountTools
      expect(toolNames).toContain('ebay_get_inventory_items'); // inventoryTools
      expect(toolNames).toContain('ebay_get_orders'); // fulfillmentTools
      expect(toolNames).toContain('ebay_get_campaigns'); // marketingTools
      expect(toolNames).toContain('ebay_get_traffic_report'); // analyticsTools
      expect(toolNames).toContain('ebay_get_currencies'); // metadataTools
      expect(toolNames).toContain('ebay_get_category_tree'); // taxonomyTools
      expect(toolNames).toContain('ebay_send_message'); // communicationTools
      expect(toolNames).toContain('ebay_get_user'); // otherApiTools
    });
  });

  describe('executeTool - ChatGPT Connector Tools', () => {
    it('should execute search tool', async () => {
      const mockResponse = {
        inventoryItems: [
          { product: { title: 'Test Product' } },
          { product: { title: 'Another Product' } },
        ],
      };
      vi.mocked(mockApi.inventory.getInventoryItems()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'search', { limit: 10 });

      expect(mockApi.inventory.getInventoryItems()).toHaveBeenCalledWith(10);
      expect(result).toHaveProperty('content');
      expect(Array.isArray((result as any).content)).toBe(true);
    });

    it('should execute fetch tool', async () => {
      const mockItem = {
        product: {
          title: 'Test Product',
          description: 'Test Description',
          aspects: { Brand: ['TestBrand'] },
        },
        condition: 'NEW',
      };
      vi.mocked(mockApi.inventory.getInventoryItem()).mockResolvedValue(mockItem);

      const result = await executeTool(mockApi, 'fetch', { id: 'TEST-SKU' });

      expect(mockApi.inventory.getInventoryItem()).toHaveBeenCalledWith('TEST-SKU');
      expect(result).toHaveProperty('content');
    });
  });

  describe('executeTool - OAuth Tools', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        EBAY_CLIENT_ID: 'test-client-id',
        EBAY_ENVIRONMENT: 'sandbox',
        EBAY_REDIRECT_URI: 'https://test.com/callback',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should generate OAuth URL', async () => {
      const result = await executeTool(mockApi, 'ebay_get_oauth_url', {
        redirectUri: 'https://test.com/callback',
      });

      expect(result).toHaveProperty('authorizationUrl');
      expect(result).toHaveProperty('redirectUri');
      expect(result).toHaveProperty('instructions');
      expect((result as any).redirectUri).toBe('https://test.com/callback');
    });

    it('should throw error when client ID missing', async () => {
      delete process.env.EBAY_CLIENT_ID;

      await expect(executeTool(mockApi, 'ebay_get_oauth_url', {})).rejects.toThrow(
        'EBAY_CLIENT_ID environment variable is required'
      );
    });

    it('should throw error when redirect URI missing', async () => {
      delete process.env.EBAY_REDIRECT_URI;

      await expect(executeTool(mockApi, 'ebay_get_oauth_url', {})).rejects.toThrow(
        'Redirect URI is required'
      );
    });

    it('should set user tokens', async () => {
      vi.mocked(mockApi.setUserTokens('test-access-token', 'test-refresh-token'))
      vi.mocked(mockApi.getTokenInfo()).mockReturnValue({
        hasUserToken: true,
        hasAppAccessToken: false,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      });

      const result = await executeTool(mockApi, 'ebay_set_user_tokens', {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      expect(mockApi.setUserTokens('test-access-token', 'test-refresh-token')).toHaveBeenCalledWith('test-access-token', 'test-refresh-token');
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });

    it('should throw error when tokens missing', async () => {
      await expect(executeTool(mockApi, 'ebay_set_user_tokens', {})).rejects.toThrow(
        'Both accessToken and refreshToken are required'
      );
    });

    it('should get token status', async () => {
      const result = await executeTool(mockApi, 'ebay_get_token_status', {});

      expect(result).toHaveProperty('hasUserToken');
      expect(result).toHaveProperty('hasAppAccessToken');
      expect(result).toHaveProperty('authenticated');
      expect(result).toHaveProperty('currentTokenType');
    });

    it('should clear tokens', async () => {
      const mockClearTokens = vi.fn();
      vi.mocked(mockApi.getAuthClient().getOAuthClient().clearAllTokens).mockImplementation(
        mockClearTokens
      );

      const result = await executeTool(mockApi, 'ebay_clear_tokens', {});

      expect(mockClearTokens).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });

    it('should display credentials and token information', async () => {
      // Set up environment
      process.env.EBAY_CLIENT_ID = 'test-client-id-123';
      process.env.EBAY_CLIENT_SECRET = 'test-secret-456';
      process.env.EBAY_ENVIRONMENT = 'sandbox';
      process.env.EBAY_REDIRECT_URI = 'https://test.com/callback';
      process.env.EBAY_USER_REFRESH_TOKEN = 'test-refresh-token-789';

      // Mock the OAuth client with internal tokens
      const mockAuthClient = mockApi.getAuthClient();
      vi.mocked(mockAuthClient.getUserTokens).mockReturnValue({
        userAccessToken: 'test-access-token-abc123',
        refreshToken: 'test-refresh-token-def456',
        userAccessTokenExpiry: Date.now() + 3600000, // 1 hour from now
        userRefreshTokenExpiry: Date.now() + 18 * 30 * 24 * 60 * 60 * 1000, // 18 months
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      });
      mockAuthClient.appAccessToken = 'test-app-token-xyz';
      mockAuthClient.appAccessTokenExpiry = Date.now() + 7200000; // 2 hours

      vi.mocked(mockApi.getTokenInfo()).mockReturnValue({
        hasUserToken: true,
        hasAppAccessToken: true,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      });

      const result = await executeTool(mockApi, 'ebay_display_credentials', {});

      // Verify result structure
      expect(result).toHaveProperty('credentials');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('scopes');

      const resultObj = result as any;

      // Check credentials are masked
      expect(resultObj.credentials.clientId).toContain('...');
      expect(resultObj.credentials.clientSecret).toBe('****** (set)');
      expect(resultObj.credentials.environment).toBe('sandbox');
      expect(resultObj.credentials.redirectUri).toBe('https://test.com/callback');

      // Check tokens are masked
      expect(resultObj.tokens.refreshToken).toContain('...');
      expect(resultObj.tokens.accessToken).toContain('...');
      expect(resultObj.tokens.appToken).toContain('...');

      // Check expiry information exists
      expect(resultObj.tokens.accessTokenExpiry).toHaveProperty('timestamp');
      expect(resultObj.tokens.accessTokenExpiry).toHaveProperty('date');
      expect(resultObj.tokens.accessTokenExpiry).toHaveProperty('expired');

      // Check status
      expect(resultObj.status.hasUserToken).toBe(true);
      expect(resultObj.status.hasAppAccessToken).toBe(true);

      // Check scopes
      expect(resultObj.scopes).toEqual(['https://api.ebay.com/oauth/api_scope/sell.inventory']);
    });

    it('should display credentials when tokens are not set', async () => {
      // Clear environment
      delete process.env.EBAY_USER_REFRESH_TOKEN;

      // Mock the OAuth client with no tokens
      const mockAuthClient = mockApi.getAuthClient();
      vi.mocked(mockAuthClient.getUserTokens).mockReturnValue(null);
      vi.mocked(mockAuthClient.getCachedAppAccessToken).mockReturnValue(null);

      vi.mocked(mockApi.getTokenInfo()).mockReturnValue({
        hasUserToken: false,
        hasAppAccessToken: false,
        accessTokenExpired: true,
        refreshTokenExpired: true,
      });

      const result = await executeTool(mockApi, 'ebay_display_credentials', {});

      const resultObj = result as any;

      // Check that missing tokens are indicated
      expect(resultObj.tokens.refreshToken).toBe('Not set (in .env)');
      expect(resultObj.tokens.accessToken).toBe('Not available');
      expect(resultObj.tokens.appToken).toBe('Not cached');
      expect(resultObj.status.currentTokenType).toBe('none');
    });

    it('should refresh access token successfully', async () => {
      // Mock that user tokens exist
      vi.mocked(mockApi.hasUserTokens()).mockReturnValue(true);

      const mockAuthClient = mockApi.getAuthClient();
      const mockRefreshToken = vi.fn().mockResolvedValue(undefined);
      vi.mocked(mockAuthClient.getOAuthClient().refreshUserToken).mockImplementation(mockRefreshToken);

      // Set up post-refresh token state
      vi.mocked(mockAuthClient.getUserTokens).mockReturnValue({
        userAccessToken: 'new-access-token-123456',
        refreshToken: 'test-refresh-token-def456',
        userAccessTokenExpiry: Date.now() + 7200000, // 2 hours
        userRefreshTokenExpiry: Date.now() + 18 * 30 * 24 * 60 * 60 * 1000,
      })

      vi.mocked(mockApi.getTokenInfo()).mockReturnValue({
        hasUserToken: true,
        hasAppAccessToken: false,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      });

      const result = await executeTool(mockApi, 'ebay_refresh_access_token', {});

      // Verify refresh was called
      expect(mockRefreshToken).toHaveBeenCalled();

      // Verify result structure
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Access token refreshed successfully');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('accessTokenExpiry');
      expect(result).toHaveProperty('tokenInfo');

      const resultObj = result as any;

      // Check token is masked
      expect(resultObj.accessToken).toContain('...');

      // Check expiry info
      expect(resultObj.accessTokenExpiry).toHaveProperty('timestamp');
      expect(resultObj.accessTokenExpiry).toHaveProperty('date');
      expect(resultObj.accessTokenExpiry).toHaveProperty('expiresInSeconds');
    });

    it('should throw error when refreshing without user tokens', async () => {
      vi.mocked(mockApi.hasUserTokens()).mockReturnValue(false);

      await expect(executeTool(mockApi, 'ebay_refresh_access_token', {})).rejects.toThrow(
        'No user tokens available'
      );
    });

    it('should handle refresh token errors', async () => {
      vi.mocked(mockApi.hasUserTokens()).mockReturnValue(true);

      const mockAuthClient = mockApi.getAuthClient();
      const mockRefreshToken = vi
        .fn()
        .mockRejectedValue(new Error('Refresh token expired or invalid'));
      vi.mocked(mockAuthClient.getOAuthClient().refreshUserToken).mockImplementation(mockRefreshToken);

      await expect(executeTool(mockApi, 'ebay_refresh_access_token', {})).rejects.toThrow(
        'Failed to refresh access token: Refresh token expired or invalid'
      );
    });
  });

  describe('executeTool - Account Management', () => {
    it('should get custom policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.account.getCustomPolicies()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_custom_policies', {
        policyTypes: 'RETURN_POLICY',
      });

      expect(mockApi.account.getCustomPolicies()).toHaveBeenCalledWith('RETURN_POLICY');
      expect(result).toBe(mockResponse);
    });

    it('should get fulfillment policies', async () => {
      const mockResponse = { fulfillmentPolicies: [] };
      vi.mocked(mockApi.account.getFulfillmentPolicies()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_fulfillment_policies', {
        marketplaceId: 'EBAY_US',
      });

      expect(mockApi.account.getFulfillmentPolicies()).toHaveBeenCalledWith('EBAY_US');
      expect(result).toBe(mockResponse);
    });

    it('should create fulfillment policy', async () => {
      const mockPolicy = { name: 'Test Policy' };
      const mockResponse = { policyId: 'POL123' };
      vi.mocked(mockApi.account.createFulfillmentPolicy()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_create_fulfillment_policy', {
        policy: mockPolicy,
      });

      expect(mockApi.account.createFulfillmentPolicy()).toHaveBeenCalledWith(mockPolicy);
      expect(result).toBe(mockResponse);
    });

    it('should delete fulfillment policy', async () => {
      vi.mocked(mockApi.account.deleteFulfillmentPolicy()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_delete_fulfillment_policy', {
        fulfillmentPolicyId: 'POL123',
      });

      expect(mockApi.account.deleteFulfillmentPolicy()).toHaveBeenCalledWith('POL123');
    });
  });

  describe('executeTool - Inventory Management', () => {
    it('should get inventory items', async () => {
      const mockResponse = { inventoryItems: [] };
      vi.mocked(mockApi.inventory.getInventoryItems()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_inventory_items', {
        limit: 10,
        offset: 5,
      });

      expect(mockApi.inventory.getInventoryItems()).toHaveBeenCalledWith(10, 5);
      expect(result).toBe(mockResponse);
    });

    it('should get inventory item', async () => {
      const mockItem = { sku: 'TEST-SKU' };
      vi.mocked(mockApi.inventory.getInventoryItem()).mockResolvedValue(mockItem);

      const result = await executeTool(mockApi, 'ebay_get_inventory_item', {
        sku: 'TEST-SKU',
      });

      expect(mockApi.inventory.getInventoryItem()).toHaveBeenCalledWith('TEST-SKU');
      expect(result).toBe(mockItem);
    });

    it('should create inventory item', async () => {
      const mockInventoryItem = { product: { title: 'Test' } };
      vi.mocked(mockApi.inventory.createOrReplaceInventoryItem()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_create_inventory_item', {
        sku: 'TEST-SKU',
        inventoryItem: mockInventoryItem,
      });

      expect(mockApi.inventory.createOrReplaceInventoryItem()).toHaveBeenCalledWith(
        'TEST-SKU',
        mockInventoryItem
      );
    });

    it('should publish offer', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      vi.mocked(mockApi.inventory.publishOffer()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_publish_offer', {
        offerId: 'OFFER123',
      });

      expect(mockApi.inventory.publishOffer()).toHaveBeenCalledWith('OFFER123');
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Order Management', () => {
    it('should get orders', async () => {
      const mockResponse = { orders: [] };
      vi.mocked(mockApi.fulfillment.getOrders()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_orders', {
        filter: 'orderfulfillmentstatus:{NOT_STARTED}',
        limit: 10,
        offset: 0,
      });

      expect(mockApi.fulfillment.getOrders()).toHaveBeenCalledWith(
        'orderfulfillmentstatus:{NOT_STARTED}',
        10,
        0
      );
      expect(result).toBe(mockResponse);
    });

    it('should get order', async () => {
      const mockOrder = { orderId: 'ORDER123' };
      vi.mocked(mockApi.fulfillment.getOrder()).mockResolvedValue(mockOrder);

      const result = await executeTool(mockApi, 'ebay_get_order', {
        orderId: 'ORDER123',
      });

      expect(mockApi.fulfillment.getOrder()).toHaveBeenCalledWith('ORDER123');
      expect(result).toBe(mockOrder);
    });

    it('should create shipping fulfillment', async () => {
      const mockFulfillment = { lineItems: [] };
      vi.mocked(mockApi.fulfillment.createShippingFulfillment()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_create_shipping_fulfillment', {
        orderId: 'ORDER123',
        fulfillment: mockFulfillment,
      });

      expect(mockApi.fulfillment.createShippingFulfillment()).toHaveBeenCalledWith(
        'ORDER123',
        mockFulfillment
      );
    });

    it('should issue refund', async () => {
      const mockRefundData = { reasonForRefund: 'BUYER_CANCEL' };
      vi.mocked(mockApi.fulfillment.issueRefund()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_issue_refund', {
        orderId: 'ORDER123',
        refundData: mockRefundData,
      });

      expect(mockApi.fulfillment.issueRefund()).toHaveBeenCalledWith('ORDER123', mockRefundData);
    });
  });

  describe('executeTool - Marketing', () => {
    it('should get campaigns', async () => {
      const mockResponse = { campaigns: [] };
      vi.mocked(mockApi.marketing.getCampaigns()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_campaigns', {
        campaignStatus: 'RUNNING',
        marketplaceId: 'EBAY_US',
        limit: 10,
      });

      expect(mockApi.marketing.getCampaigns()).toHaveBeenCalledWith('RUNNING', 'EBAY_US', 10);
      expect(result).toBe(mockResponse);
    });

    it('should pause campaign', async () => {
      vi.mocked(mockApi.marketing.pauseCampaign()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_pause_campaign', {
        campaignId: 'CAMP123',
      });

      expect(mockApi.marketing.pauseCampaign()).toHaveBeenCalledWith('CAMP123');
    });

    it('should clone campaign', async () => {
      const mockCloneData = { campaignName: 'Cloned Campaign' };
      vi.mocked(mockApi.marketing.cloneCampaign()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_clone_campaign', {
        campaignId: 'CAMP123',
        cloneData: mockCloneData,
      });

      expect(mockApi.marketing.cloneCampaign()).toHaveBeenCalledWith('CAMP123', mockCloneData);
    });
  });

  describe('executeTool - Analytics', () => {
    it('should get traffic report', async () => {
      const mockResponse = { reports: [] };
      vi.mocked(mockApi.analytics.getTrafficReport()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_traffic_report', {
        dimension: 'LISTING',
        filter: 'listingIds:{123}',
        metric: 'CLICK_THROUGH_RATE',
        sort: '-date',
      });

      expect(mockApi.analytics.getTrafficReport()).toHaveBeenCalledWith(
        'LISTING',
        'listingIds:{123}',
        'CLICK_THROUGH_RATE',
        '-date'
      );
      expect(result).toBe(mockResponse);
    });

    it('should get seller standards profile', async () => {
      const mockResponse = { profile: {} };
      vi.mocked(mockApi.analytics.getSellerStandardsProfile()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_seller_standards_profile', {
        program: 'CUSTOMER_SERVICE',
        cycle: 'CURRENT',
      });

      expect(mockApi.analytics.getSellerStandardsProfile()).toHaveBeenCalledWith(
        'CUSTOMER_SERVICE',
        'CURRENT'
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Taxonomy', () => {
    it('should get default category tree ID', async () => {
      const mockResponse = { categoryTreeId: '0' };
      vi.mocked(mockApi.taxonomy.getDefaultCategoryTreeId()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_default_category_tree_id', {
        marketplaceId: 'EBAY_US',
      });

      expect(mockApi.taxonomy.getDefaultCategoryTreeId()).toHaveBeenCalledWith('EBAY_US');
      expect(result).toBe(mockResponse);
    });

    it('should get category suggestions', async () => {
      const mockResponse = { categorySuggestions: [] };
      vi.mocked(mockApi.taxonomy.getCategorySuggestions()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_category_suggestions', {
        categoryTreeId: '0',
        query: 'iPhone',
      });

      expect(mockApi.taxonomy.getCategorySuggestions()).toHaveBeenCalledWith('0', 'iPhone');
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Other APIs', () => {
    it('should get user', async () => {
      const mockResponse = { userId: 'USER123' };
      vi.mocked(mockApi.identity.getUser()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_get_user', {});

      expect(mockApi.identity.getUser()).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it('should translate text', async () => {
      const mockResponse = { translations: [] };
      vi.mocked(mockApi.translation.translate()).mockResolvedValue(mockResponse);

      const result = await executeTool(mockApi, 'ebay_translate', {
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });

      expect(mockApi.translation.translate()).toHaveBeenCalledWith('en', 'es', 'ITEM_TITLE', [
        'Hello',
      ]);
      expect(result).toBe(mockResponse);
    });

    it('should suppress violation', async () => {
      vi.mocked(mockApi.compliance.suppressViolation()).mockResolvedValue(undefined);

      await executeTool(mockApi, 'ebay_suppress_violation', {
        listingViolationId: 'VIO123',
      });

      expect(mockApi.compliance.suppressViolation()).toHaveBeenCalledWith('VIO123');
    });
  });

  describe('executeTool - Error Handling', () => {
    it('should throw error for unknown tool', async () => {
      await expect(executeTool(mockApi, 'unknown_tool', {})).rejects.toThrow(
        'Unknown tool: unknown_tool'
      );
    });
  });

  describe('executeTool - SearchClaudeCodeDocs', () => {
    it('should return placeholder response', async () => {
      const result = await executeTool(mockApi, 'SearchClaudeCodeDocs', {
        query: 'test query',
      });

      expect(result).toHaveProperty('content');
      expect((result as any).content[0].text).toContain('SearchClaudeCodeDocs');
      expect((result as any).content[0].text).toContain('test query');
    });
  });
});
