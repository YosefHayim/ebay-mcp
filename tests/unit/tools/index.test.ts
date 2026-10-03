import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Effect } from 'effect';
import { executeTool, getToolDefinitions } from '@/tools/index.js';

import type { EbaySellerApi } from '@/api/ebaySellerApi.js';
import type { EbayConfig } from '@/types/ebay.js';

type TextContentToolResult = {
  content: Array<{ text: string }>;
};

type OAuthUrlToolResult = {
  redirectUri: string;
};

type CredentialDisplayResult = {
  credentials: {
    clientId: string;
    clientSecret: string;
    environment: string;
    redirectUri: string;
  };
  tokens: {
    refreshToken: string;
    accessToken: string;
    appToken: string;
    accessTokenExpiry?: Record<string, unknown>;
  };
  status: {
    hasUserToken?: boolean;
    hasAppAccessToken?: boolean;
    currentTokenType?: string;
  };
  scopes?: string[];
};

type RefreshAccessTokenResult = {
  accessToken: string;
  accessTokenExpiry: Record<string, unknown>;
};

describe('Tools Layer', () => {
  let mockApi: EbaySellerApi;
  let mockConfig: EbayConfig;

  beforeEach(() => {
    mockConfig = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      environment: 'sandbox',
      redirectUri: 'https://test.com/callback',
      refreshToken: 'test-refresh-token',
    };

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
        getKyc: vi.fn(),
        getPaymentsProgram: vi.fn(),
        getPaymentsProgramOnboarding: vi.fn(),
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
        getPrivileges: vi.fn(),
        getAdvertisingEligibility: vi.fn(),
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
        createInventoryLocation: vi.fn(),
        deleteInventoryLocation: vi.fn(),
        disableInventoryLocation: vi.fn(),
        enableInventoryLocation: vi.fn(),
        updateInventoryLocation: vi.fn(),
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
        getSkuLocationMapping: vi.fn(),
        createOrReplaceSkuLocationMapping: vi.fn(),
        deleteSkuLocationMapping: vi.fn(),
        publishOfferByInventoryItemGroup: vi.fn(),
        withdrawOfferByInventoryItemGroup: vi.fn(),
      },
      // Fulfillment API
      fulfillment: {
        getOrders: vi.fn(),
        getOrder: vi.fn(),
        createShippingFulfillment: vi.fn(),
        issueRefund: vi.fn(),
      },
      dispute: {
        getPaymentDisputeSummaries: vi.fn(),
        getPaymentDispute: vi.fn(),
        getActivities: vi.fn(),
        fetchEvidenceContent: vi.fn(),
        contestPaymentDispute: vi.fn(),
        acceptPaymentDispute: vi.fn(),
        uploadEvidenceFile: vi.fn(),
        addEvidence: vi.fn(),
        updateEvidence: vi.fn(),
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
        sendOfferToInterestedBuyers: vi.fn(),
        findEligibleItems: vi.fn(),
      },
      message: {
        sendMessage: vi.fn(),
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
        getFeedbackRatingSummary: vi.fn(),
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
      },
      vero: {
        reportInfringement: vi.fn(),
        getReportedItems: vi.fn(),
      },
      translation: {
        translate: vi.fn(),
      },
      edelivery: {
        getActualCosts: vi.fn(),
        getAddressPreferences: vi.fn(),
        createAddressPreference: vi.fn(),
        getConsignPreferences: vi.fn(),
        createConsignPreference: vi.fn(),
        getAgents: vi.fn(),
        getBatteryQualifications: vi.fn(),
        getDropoffSites: vi.fn(),
        getServices: vi.fn(),
        createBundle: vi.fn(),
        getBundle: vi.fn(),
        cancelBundle: vi.fn(),
        getBundleLabel: vi.fn(),
        createPackage: vi.fn(),
        getPackage: vi.fn(),
        deletePackage: vi.fn(),
        getPackagesByLineItemId: vi.fn(),
        cancelPackage: vi.fn(),
        clonePackage: vi.fn(),
        confirmPackage: vi.fn(),
        bulkCancelPackages: vi.fn(),
        bulkConfirmPackages: vi.fn(),
        bulkDeletePackages: vi.fn(),
        getLabels: vi.fn(),
        getHandoverSheet: vi.fn(),
        getTracking: vi.fn(),
        createComplaint: vi.fn(),
      },
      // Token management methods
      setUserTokens: vi.fn().mockReturnValue(Effect.succeed(undefined)),
      getTokenInfo: vi.fn().mockReturnValue({
        hasUserToken: false,
        hasAppAccessToken: true,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      }),
      hasUserTokens: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(true),
      getConfig: vi.fn(() => mockConfig),
      getAuthClient: vi.fn().mockReturnValue({
        getOAuthClient: vi.fn().mockReturnValue({
          getUserTokens: vi.fn().mockReturnValue(null),
          getCachedAppAccessToken: vi.fn().mockReturnValue(null),
          getCachedAppAccessTokenExpiry: vi.fn().mockReturnValue(null),
          clearAllTokens: vi.fn(),
          getAccessToken: vi.fn().mockReturnValue(Effect.succeed('mock-access-token')),
          refreshUserToken: vi.fn().mockReturnValue(Effect.succeed(undefined)),
        }),
      }),
    } as unknown as EbaySellerApi;
  });

  describe('getToolDefinitions', () => {
    it('return all tool definitions', () => {
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

    it('include all tool categories', () => {
      const tools = getToolDefinitions();
      const toolNames = tools.map((t) => t.name);

      // Check for tools from each category
      expect(toolNames).toContain('ebay_get_oauth_url'); // tokenManagementTools
      expect(toolNames).toContain('ebay_get_custom_policies'); // accountTools
      expect(toolNames).toContain('ebay_get_inventory_items'); // inventoryTools
      expect(toolNames).toContain('ebay_get_orders'); // fulfillmentTools
      expect(toolNames).toContain('ebay_get_campaigns');
      expect(toolNames).toContain('ebay_get_traffic_report'); // analyticsTools
      expect(toolNames).toContain('ebay_get_currencies'); // metadataTools
      expect(toolNames).toContain('ebay_get_category_tree'); // taxonomyTools
      expect(toolNames).toContain('ebay_send_message'); // communicationTools
      expect(toolNames).toContain('ebay_get_user'); // otherApiTools
    });

    it('advertises required and recommended item specifics in the taxonomy tool', () => {
      const tool = getToolDefinitions().find(
        (definition) => definition.name === 'ebay_get_item_aspects_for_category',
      );

      expect(tool?.description).toContain('required and recommended item specifics');
      expect(tool?.description).toContain(
        'before creating an inventory item or checking listing fees',
      );
    });
  });

  describe('executeTool - ChatGPT Connector Tools', () => {
    it('execute search tool', async () => {
      const mockResponse = {
        inventoryItems: [
          { product: { title: 'Test Product' } },
          { product: { title: 'Another Product' } },
        ],
      };
      vi.mocked(mockApi.inventory.getInventoryItems).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'search', { query: '', limit: 10 });

      expect(mockApi.inventory.getInventoryItems).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toHaveProperty('content');
      expect(Array.isArray((result as TextContentToolResult).content)).toBe(true);
    });

    it('execute fetch tool', async () => {
      const mockItem = {
        product: {
          title: 'Test Product',
          description: 'Test Description',
          aspects: { Brand: ['TestBrand'] },
        },
        condition: 'NEW',
      };
      vi.mocked(mockApi.inventory.getInventoryItem).mockReturnValue(Effect.succeed(mockItem));

      const result = await executeTool(mockApi, 'fetch', { id: 'TEST-SKU' });

      expect(mockApi.inventory.getInventoryItem).toHaveBeenCalledWith({ sku: 'TEST-SKU' });
      expect(result).toHaveProperty('content');
    });
  });

  describe('executeTool - OAuth Tools', () => {
    it('generate OAuth URL', async () => {
      const result = await executeTool(mockApi, 'ebay_get_oauth_url', {
        redirectUri: 'https://test.com/callback',
      });

      expect(result).toHaveProperty('authorizationUrl');
      expect(result).toHaveProperty('redirectUri');
      expect(result).toHaveProperty('instructions');
      expect((result as OAuthUrlToolResult).redirectUri).toBe('https://test.com/callback');
    });

    it('throw error when client ID missing', async () => {
      mockConfig = { ...mockConfig, clientId: '' };

      await expect(executeTool(mockApi, 'ebay_get_oauth_url', {})).rejects.toThrow(
        'EBAY_CLIENT_ID environment variable is required',
      );
    });

    it('throw error when redirect URI missing', async () => {
      mockConfig = { ...mockConfig, redirectUri: undefined };

      await expect(executeTool(mockApi, 'ebay_get_oauth_url', {})).rejects.toThrow(
        'Redirect URI is required',
      );
    });

    it('set user tokens', async () => {
      vi.mocked(mockApi.setUserTokens).mockReturnValue(Effect.succeed(undefined));
      vi.mocked(mockApi.getTokenInfo).mockReturnValue({
        hasUserToken: true,
        hasAppAccessToken: false,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      });

      const result = await executeTool(mockApi, 'ebay_set_user_tokens', {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      expect(mockApi.setUserTokens).toHaveBeenCalledWith('test-access-token', 'test-refresh-token');
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });

    it('throw error when tokens missing', async () => {
      // Missing required fields are now rejected by input-schema validation.
      await expect(executeTool(mockApi, 'ebay_set_user_tokens', {})).rejects.toThrow();
    });

    it('get token status', async () => {
      const result = await executeTool(mockApi, 'ebay_get_token_status', {});

      expect(result).toHaveProperty('hasUserToken');
      expect(result).toHaveProperty('hasAppAccessToken');
      expect(result).toHaveProperty('authenticated');
      expect(result).toHaveProperty('currentTokenType');
    });

    it('clear tokens', async () => {
      const mockClearTokens = vi.fn();
      vi.mocked(mockApi.getAuthClient().getOAuthClient().clearAllTokens).mockImplementation(
        mockClearTokens,
      );

      const result = await executeTool(mockApi, 'ebay_clear_tokens', {});

      expect(mockClearTokens).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });

    it('display credentials and token information', async () => {
      mockConfig = {
        ...mockConfig,
        clientId: 'test-client-id-123',
        clientSecret: 'test-secret-456',
        redirectUri: 'https://test.com/callback',
        refreshToken: 'test-refresh-token-789',
      };

      // Mock the OAuth client with internal tokens
      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      vi.mocked(mockAuthClient.getUserTokens).mockReturnValue({
        userAccessToken: 'test-access-token-abc123',
        refreshToken: 'test-refresh-token-def456',
        userAccessTokenExpiry: Date.now() + 3_600_000, // 1 hour from now
        userRefreshTokenExpiry: Date.now() + 18 * 30 * 24 * 60 * 60 * 1000, // 18 months
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      });
      vi.mocked(mockAuthClient.getCachedAppAccessToken).mockReturnValue('test-app-token-xyz');
      vi.mocked(mockAuthClient.getCachedAppAccessTokenExpiry).mockReturnValue(
        Date.now() + 7_200_000,
      ); // 2 hours

      vi.mocked(mockApi.getTokenInfo).mockReturnValue({
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

      const resultObj = result as CredentialDisplayResult;

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

    it('display credentials when tokens are not set', async () => {
      mockConfig = { ...mockConfig, refreshToken: undefined };

      // Mock the OAuth client with no tokens
      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      vi.mocked(mockAuthClient.getUserTokens).mockReturnValue(null);
      vi.mocked(mockAuthClient.getCachedAppAccessToken).mockReturnValue(null);

      vi.mocked(mockApi.getTokenInfo).mockReturnValue({
        hasUserToken: false,
        hasAppAccessToken: false,
        accessTokenExpired: true,
        refreshTokenExpired: true,
      });

      const result = await executeTool(mockApi, 'ebay_display_credentials', {});

      const resultObj = result as CredentialDisplayResult;

      // Check that missing tokens are indicated
      expect(resultObj.tokens.refreshToken).toBe('Not set (in .env)');
      expect(resultObj.tokens.accessToken).toBe('Not available');
      expect(resultObj.tokens.appToken).toBe('Not cached');
      expect(resultObj.status.currentTokenType).toBe('none');
    });

    it('refresh access token successfully', async () => {
      // Mock that user tokens exist
      vi.mocked(mockApi.hasUserTokens).mockReturnValue(true);

      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      const mockRefreshToken = vi.fn().mockReturnValue(Effect.succeed(undefined));
      vi.mocked(mockAuthClient.refreshUserToken).mockImplementation(mockRefreshToken);

      // Set up post-refresh token state
      vi.mocked(mockAuthClient.getUserTokens).mockReturnValue({
        userAccessToken: 'new-access-token-123456',
        refreshToken: 'test-refresh-token-def456',
        userAccessTokenExpiry: Date.now() + 7_200_000, // 2 hours
        userRefreshTokenExpiry: Date.now() + 18 * 30 * 24 * 60 * 60 * 1000,
      });

      vi.mocked(mockApi.getTokenInfo).mockReturnValue({
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

      const resultObj = result as RefreshAccessTokenResult;

      // Check token is masked
      expect(resultObj.accessToken).toContain('...');

      // Check expiry info
      expect(resultObj.accessTokenExpiry).toHaveProperty('timestamp');
      expect(resultObj.accessTokenExpiry).toHaveProperty('date');
      expect(resultObj.accessTokenExpiry).toHaveProperty('expiresInSeconds');
    });

    it('throw error when refreshing without user tokens', async () => {
      vi.mocked(mockApi.hasUserTokens).mockReturnValue(false);

      await expect(executeTool(mockApi, 'ebay_refresh_access_token', {})).rejects.toThrow(
        'No user tokens available',
      );
    });

    it('handle refresh token errors', async () => {
      vi.mocked(mockApi.hasUserTokens).mockReturnValue(true);

      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      const mockRefreshToken = vi
        .fn()
        .mockReturnValue(Effect.fail(new Error('Refresh token expired or invalid')));
      vi.mocked(mockAuthClient.refreshUserToken).mockImplementation(mockRefreshToken);

      await expect(executeTool(mockApi, 'ebay_refresh_access_token', {})).rejects.toThrow(
        'Failed to refresh access token: Refresh token expired or invalid',
      );
    });

    it('exchange authorization code for tokens successfully', async () => {
      const mockTokenData = {
        access_token: 'v^1.1#i^1#p^3#r^1#I^3#f^0#t^Ul4xMF8xOkFBQUFBQUFBQUFBPT0',
        refresh_token: 'v^1.1#i^1#p^3#r^1#I^3#f^0#t^Ul4xMF8xOkFBQUFBQUFBQUFBPT0=REFRESH',
        expires_in: 7200,
        refresh_token_expires_in: 47_304_000,
        token_type: 'User Access Token',
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      };

      const mockExchangeCode = vi.fn().mockReturnValue(Effect.succeed(mockTokenData));
      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      vi.mocked(mockAuthClient).exchangeCodeForToken = mockExchangeCode;

      const result = await executeTool(mockApi, 'ebay_exchange_authorization_code', {
        code: 'v^1.1#i^1#p^3#r^1#f^0#I^3#t^H4sIAAAAAA',
      });

      expect(mockExchangeCode).toHaveBeenCalledWith('v^1.1#i^1#p^3#r^1#f^0#I^3#t^H4sIAAAAAA');
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('tokenData');
      expect(result).toHaveProperty('note');

      const resultObj = result as Record<string, unknown>;
      const tokenData = resultObj.tokenData as Record<string, unknown>;
      expect(tokenData.accessToken).toContain('...');
      expect(tokenData.refreshToken).toContain('...');
      expect(tokenData.expiresIn).toBe(7200);
      expect(tokenData.refreshTokenExpiresIn).toBe(47_304_000);
      expect(tokenData.tokenType).toBe('User Access Token');
    });

    it('throw error when authorization code is missing', async () => {
      // A missing or empty code is now rejected by input-schema validation.
      await expect(executeTool(mockApi, 'ebay_exchange_authorization_code', {})).rejects.toThrow();

      await expect(
        executeTool(mockApi, 'ebay_exchange_authorization_code', { code: '' }),
      ).rejects.toThrow();
    });

    it('URL-decode authorization code when it contains encoded characters', async () => {
      const mockTokenData = {
        access_token: 'v^1.1#i^1#p^3#r^1#I^3#f^0#t^Ul4xMF8xOkFBQUFBQUFBQUFBPT0',
        refresh_token: 'v^1.1#i^1#p^3#r^1#I^3#f^0#t^Ul4xMF8xOkFBQUFBQUFBQUFBPT0=REFRESH',
        expires_in: 7200,
        refresh_token_expires_in: 47_304_000,
        token_type: 'User Access Token',
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      };

      const mockExchangeCode = vi.fn().mockReturnValue(Effect.succeed(mockTokenData));
      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      vi.mocked(mockAuthClient).exchangeCodeForToken = mockExchangeCode;

      // URL-encoded code (contains %5E for ^)
      const urlEncodedCode = 'v%5E1.1%23i%5E1%23p%5E3%23r%5E1';
      const decodedCode = 'v^1.1#i^1#p^3#r^1';

      await executeTool(mockApi, 'ebay_exchange_authorization_code', {
        code: urlEncodedCode,
      });

      // Should be called with decoded code
      expect(mockExchangeCode).toHaveBeenCalledWith(decodedCode);
    });

    it('handle exchange code errors', async () => {
      const mockExchangeCode = vi
        .fn()
        .mockReturnValue(Effect.fail(new Error('Invalid authorization code')));
      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      vi.mocked(mockAuthClient).exchangeCodeForToken = mockExchangeCode;

      await expect(
        executeTool(mockApi, 'ebay_exchange_authorization_code', {
          code: 'invalid-code',
        }),
      ).rejects.toThrow('Failed to exchange authorization code: Invalid authorization code');
    });

    it('handle non-Error objects in exchange code errors', async () => {
      const mockExchangeCode = vi.fn().mockReturnValue(Effect.fail('String error message'));
      const mockAuthClient = mockApi.getAuthClient().getOAuthClient();
      vi.mocked(mockAuthClient).exchangeCodeForToken = mockExchangeCode;

      await expect(
        executeTool(mockApi, 'ebay_exchange_authorization_code', {
          code: 'some-code',
        }),
      ).rejects.toThrow('Failed to exchange authorization code: String error message');
    });
  });

  describe('executeTool - Account Management', () => {
    it('get custom policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.account.getCustomPolicies).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'ebay_get_custom_policies', {
        policyTypes: 'RETURN_POLICY',
      });

      expect(mockApi.account.getCustomPolicies).toHaveBeenCalledWith({
        policyTypes: 'RETURN_POLICY',
      });
      expect(result).toBe(mockResponse);
    });

    it('get fulfillment policies', async () => {
      const mockResponse = { fulfillmentPolicies: [] };
      const input = {
        marketplaceId: 'EBAY_US',
      };
      vi.mocked(mockApi.account.getFulfillmentPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      const result = await executeTool(mockApi, 'ebay_get_fulfillment_policies', input);

      expect(mockApi.account.getFulfillmentPolicies).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });

    it('create fulfillment policy', async () => {
      const mockPolicy = { name: 'Test Policy', marketplaceId: 'EBAY_US' };
      const mockResponse = { policyId: 'POL123' };
      const input = {
        policy: mockPolicy,
      };
      vi.mocked(mockApi.account.createFulfillmentPolicy).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      const result = await executeTool(mockApi, 'ebay_create_fulfillment_policy', input);

      expect(mockApi.account.createFulfillmentPolicy).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });

    it('delete fulfillment policy', async () => {
      const input = {
        fulfillmentPolicyId: 'POL123',
      };
      vi.mocked(mockApi.account.deleteFulfillmentPolicy).mockReturnValue(Effect.succeed(undefined));

      await executeTool(mockApi, 'ebay_delete_fulfillment_policy', input);

      expect(mockApi.account.deleteFulfillmentPolicy).toHaveBeenCalledWith(input);
    });
  });

  describe('executeTool - Inventory Management', () => {
    it('get inventory items', async () => {
      const mockResponse = { inventoryItems: [] };
      const input = {
        limit: 10,
        offset: 5,
      };
      vi.mocked(mockApi.inventory.getInventoryItems).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'ebay_get_inventory_items', input);

      expect(mockApi.inventory.getInventoryItems).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });

    it('get inventory item', async () => {
      const mockItem = { sku: 'TEST-SKU' };
      const input = {
        sku: 'TEST-SKU',
      };
      vi.mocked(mockApi.inventory.getInventoryItem).mockReturnValue(Effect.succeed(mockItem));

      const result = await executeTool(mockApi, 'ebay_get_inventory_item', input);

      expect(mockApi.inventory.getInventoryItem).toHaveBeenCalledWith(input);
      expect(result).toBe(mockItem);
    });

    it('create inventory item', async () => {
      const input = {
        sku: 'TEST-SKU',
        body: { product: { title: 'Test' } },
      };
      vi.mocked(mockApi.inventory.createOrReplaceInventoryItem).mockReturnValue(
        Effect.succeed(undefined),
      );

      await executeTool(mockApi, 'ebay_create_or_replace_inventory_item', input);

      expect(mockApi.inventory.createOrReplaceInventoryItem).toHaveBeenCalledWith(input);
    });

    it('publish offer', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      const input = {
        offerId: 'OFFER123',
      };
      vi.mocked(mockApi.inventory.publishOffer).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'ebay_publish_offer', input);

      expect(mockApi.inventory.publishOffer).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Order Management', () => {
    it('get orders', async () => {
      const mockResponse = { orders: [] };
      vi.mocked(mockApi.fulfillment.getOrders).mockReturnValue(Effect.succeed(mockResponse));

      const input = {
        filter: 'orderfulfillmentstatus:{NOT_STARTED}',
        limit: 10,
        offset: 0,
      };
      const result = await executeTool(mockApi, 'ebay_get_orders', input);

      expect(mockApi.fulfillment.getOrders).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });

    it('get order', async () => {
      const mockOrder = { orderId: 'ORDER123' };
      vi.mocked(mockApi.fulfillment.getOrder).mockReturnValue(Effect.succeed(mockOrder));

      const input = {
        orderId: 'ORDER123',
      };
      const result = await executeTool(mockApi, 'ebay_get_order', input);

      expect(mockApi.fulfillment.getOrder).toHaveBeenCalledWith(input);
      expect(result).toBe(mockOrder);
    });

    it('create shipping fulfillment', async () => {
      const body = { lineItems: [] };
      vi.mocked(mockApi.fulfillment.createShippingFulfillment).mockReturnValue(Effect.succeed({}));

      const input = {
        orderId: 'ORDER123',
        body,
      };
      await executeTool(mockApi, 'ebay_create_shipping_fulfillment', input);

      expect(mockApi.fulfillment.createShippingFulfillment).toHaveBeenCalledWith(input);
    });

    it('issue refund', async () => {
      const body = { reasonForRefund: 'BUYER_CANCEL' };
      vi.mocked(mockApi.fulfillment.issueRefund).mockReturnValue(Effect.succeed({}));

      const input = {
        orderId: 'ORDER123',
        body,
      };
      await executeTool(mockApi, 'ebay_issue_refund', input);

      expect(mockApi.fulfillment.issueRefund).toHaveBeenCalledWith(input);
    });

    it('get payment dispute summaries', async () => {
      const mockResponse = { paymentDisputeSummaries: [] };
      const input = { orderId: 'ORDER123', limit: 10 };
      vi.mocked(mockApi.dispute.getPaymentDisputeSummaries).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      const result = await executeTool(mockApi, 'ebay_get_payment_dispute_summaries', input);

      expect(mockApi.dispute.getPaymentDisputeSummaries).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Marketing', () => {
    it('get campaigns', async () => {
      const mockResponse = { campaigns: [] };
      vi.mocked(mockApi.marketing.getCampaigns).mockReturnValue(Effect.succeed(mockResponse));
      const input = {
        campaignStatus: 'RUNNING',
        limit: 10,
      };

      const result = await executeTool(mockApi, 'ebay_get_campaigns', input);

      expect(mockApi.marketing.getCampaigns).toHaveBeenCalledWith(input);
      expect(result).toBe(mockResponse);
    });

    it('pause campaign', async () => {
      vi.mocked(mockApi.marketing.pauseCampaign).mockReturnValue(Effect.succeed(undefined));

      const input = {
        campaignId: 'CAMP123',
      };
      await executeTool(mockApi, 'ebay_pause_campaign', input);

      expect(mockApi.marketing.pauseCampaign).toHaveBeenCalledWith(input);
    });

    it('clone campaign', async () => {
      const request = { campaignName: 'Cloned Campaign' };
      vi.mocked(mockApi.marketing.cloneCampaign).mockReturnValue(Effect.succeed({}));

      const input = {
        campaignId: 'CAMP123',
        request,
      };
      await executeTool(mockApi, 'ebay_clone_campaign', input);

      expect(mockApi.marketing.cloneCampaign).toHaveBeenCalledWith(input);
    });
  });

  describe('executeTool - Analytics', () => {
    it('get traffic report', async () => {
      const mockResponse = { reports: [] };
      vi.mocked(mockApi.analytics.getTrafficReport).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'ebay_get_traffic_report', {
        dimension: 'LISTING',
        filter: 'listingIds:{123}',
        metric: 'CLICK_THROUGH_RATE',
        sort: '-date',
      });

      expect(mockApi.analytics.getTrafficReport).toHaveBeenCalledWith({
        dimension: 'LISTING',
        filter: 'listingIds:{123}',
        metric: 'CLICK_THROUGH_RATE',
        sort: '-date',
      });
      expect(result).toBe(mockResponse);
    });

    it('get seller standards profile', async () => {
      const mockResponse = { profile: {} };
      vi.mocked(mockApi.analytics.getSellerStandardsProfile).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      const result = await executeTool(mockApi, 'ebay_get_seller_standards_profile', {
        program: 'CUSTOMER_SERVICE',
        cycle: 'CURRENT',
      });

      expect(mockApi.analytics.getSellerStandardsProfile).toHaveBeenCalledWith({
        program: 'CUSTOMER_SERVICE',
        cycle: 'CURRENT',
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Taxonomy', () => {
    it('get default category tree ID', async () => {
      const mockResponse = { categoryTreeId: '0' };
      vi.mocked(mockApi.taxonomy.getDefaultCategoryTreeId).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      const result = await executeTool(mockApi, 'ebay_get_default_category_tree_id', {
        marketplaceId: 'EBAY_US',
      });

      expect(mockApi.taxonomy.getDefaultCategoryTreeId).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
      expect(result).toBe(mockResponse);
    });

    it('get category suggestions', async () => {
      const mockResponse = { categorySuggestions: [] };
      vi.mocked(mockApi.taxonomy.getCategorySuggestions).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      const result = await executeTool(mockApi, 'ebay_get_category_suggestions', {
        categoryTreeId: '0',
        query: 'iPhone',
      });

      expect(mockApi.taxonomy.getCategorySuggestions).toHaveBeenCalledWith({
        categoryTreeId: '0',
        query: 'iPhone',
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Other APIs', () => {
    it('get user', async () => {
      const mockResponse = { userId: 'USER123' };
      vi.mocked(mockApi.identity.getUser).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'ebay_get_user', {});

      expect(mockApi.identity.getUser).toHaveBeenCalledWith({});
      expect(result).toBe(mockResponse);
    });

    it('translate text', async () => {
      const mockResponse = { translations: [] };
      vi.mocked(mockApi.translation.translate).mockReturnValue(Effect.succeed(mockResponse));

      const result = await executeTool(mockApi, 'ebay_translate', {
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });

      expect(mockApi.translation.translate).toHaveBeenCalledWith({
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeTool - Error Handling', () => {
    it('throw error for unknown tool', async () => {
      await expect(executeTool(mockApi, 'unknown_tool', {})).rejects.toThrow(
        'Unknown tool: unknown_tool',
      );
    });
  });
});
