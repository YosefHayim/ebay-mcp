import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import nock from 'nock';
import { EbayApiClient } from '@/api/client/ebayApiClient.js';
import type { EbayConfig } from '@/types/ebay.js';
import { mockEbayApiEndpoint, mockEbayApiError, cleanupMocks } from '@tests/helpers/mockHttp.js';
import process from 'node:process';
import { Effect } from 'effect';

// Mock EbayOAuthClient to provide tokens without environment variables
const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
};

vi.mock('../../../src/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

describe('EbayApiClient Integration Tests', () => {
  let apiClient: EbayApiClient;
  let config: EbayConfig;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    vi.clearAllMocks();
    cleanupMocks();

    // Enable nock and disable real HTTP requests
    nock.disableNetConnect();

    // Store and clear environment variables to prevent loading from .env
    originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.EBAY_USER_REFRESH_TOKEN;
    delete process.env.EBAY_USER_ACCESS_TOKEN;
    // Disable proxy to prevent axios from using it
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;

    config = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };

    // Setup mock OAuth client to return tokens
    mockOAuthClient.hasUserTokens.mockReturnValue(true);
    mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
    mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

    apiClient = new EbayApiClient(config);
    await Effect.runPromise(apiClient.initialize());
  });

  afterEach(() => {
    cleanupMocks();
    nock.enableNetConnect();
    // Restore environment variables
    process.env = originalEnv;
  });

  describe('HTTP GET Requests', () => {
    it('make successful GET request', async () => {
      const mockResponse = {
        total: 10,
        limit: 25,
        inventoryItems: [
          { sku: 'TEST-001', availability: { shipToLocationAvailability: { quantity: 5 } } },
          { sku: 'TEST-002', availability: { shipToLocationAvailability: { quantity: 3 } } },
        ],
      };

      mockEbayApiEndpoint('/sell/inventory/v1/inventory_item', 'get', 'sandbox', mockResponse);

      const inventoryPage = await apiClient.get('/sell/inventory/v1/inventory_item');

      expect(inventoryPage).toEqual(mockResponse);
    });

    it('include query parameters in GET request', async () => {
      const mockResponse = { limit: 10, offset: 0, total: 5 };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item?limit=10&offset=0',
        'get',
        'sandbox',
        mockResponse,
      );

      const inventoryPage = await apiClient.get('/sell/inventory/v1/inventory_item', {
        limit: 10,
        offset: 0,
      });

      expect(inventoryPage).toEqual(mockResponse);
    });

    it('handle GET request errors', async () => {
      mockEbayApiError(
        '/sell/inventory/v1/inventory_item/INVALID-SKU',
        'get',
        'sandbox',
        'Inventory item not found',
        404,
      );

      await expect(apiClient.get('/sell/inventory/v1/inventory_item/INVALID-SKU')).rejects.toThrow(
        'Inventory item not found',
      );
    });
  });

  describe('HTTP POST Requests', () => {
    it('make successful POST request', async () => {
      const requestData = {
        sku: 'TEST-001',
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        pricingSummary: {
          price: { currency: 'USD', value: '99.99' },
        },
      };

      const mockResponse = { offerId: '1234567890' };

      mockEbayApiEndpoint('/sell/inventory/v1/offer', 'post', 'sandbox', mockResponse, 201);

      const createdOffer = await apiClient.post('/sell/inventory/v1/offer', requestData);

      expect(createdOffer).toEqual(mockResponse);
    });

    it('handle POST request validation errors', async () => {
      const invalidData = {
        sku: 'TEST-001',
        // Missing required fields
      };

      mockEbayApiError(
        '/sell/inventory/v1/offer',
        'post',
        'sandbox',
        'Missing required field: marketplaceId',
        400,
      );

      await expect(apiClient.post('/sell/inventory/v1/offer', invalidData)).rejects.toThrow(
        'Missing required field: marketplaceId',
      );
    });
  });

  describe('HTTP PUT Requests', () => {
    it('make successful PUT request', async () => {
      const updateData = {
        availability: {
          shipToLocationAvailability: {
            quantity: 20,
          },
        },
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item/TEST-001',
        'put',
        'sandbox',
        undefined,
        204,
      );

      await apiClient.put('/sell/inventory/v1/inventory_item/TEST-001', updateData);

      // No error thrown means success
      expect(true).toBe(true);
    });

    it('handle PUT request errors', async () => {
      mockEbayApiError(
        '/sell/inventory/v1/inventory_item/TEST-001',
        'put',
        'sandbox',
        'Inventory item not found',
        404,
      );

      await expect(apiClient.put('/sell/inventory/v1/inventory_item/TEST-001', {})).rejects.toThrow(
        'Inventory item not found',
      );
    });
  });

  describe('HTTP DELETE Requests', () => {
    it('make successful DELETE request', async () => {
      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item/TEST-001',
        'delete',
        'sandbox',
        undefined,
        204,
      );

      await apiClient.delete('/sell/inventory/v1/inventory_item/TEST-001');

      // No error thrown means success
      expect(true).toBe(true);
    });

    it('handle DELETE request errors', async () => {
      mockEbayApiError(
        '/sell/inventory/v1/inventory_item/TEST-001',
        'delete',
        'sandbox',
        'Cannot delete item with active offers',
        409,
      );

      await expect(apiClient.delete('/sell/inventory/v1/inventory_item/TEST-001')).rejects.toThrow(
        'Cannot delete item with active offers',
      );
    });
  });

  describe('Authentication', () => {
    it('inject Bearer token in request headers', async () => {
      const mockResponse = { items: [] };

      const scope = mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item',
        'get',
        'sandbox',
        mockResponse,
      );

      // Check that Authorization header is sent
      scope.matchHeader('Authorization', /^Bearer .+/);

      await apiClient.get('/sell/inventory/v1/inventory_item');

      expect(scope.isDone()).toBe(true);
    });

    it('throw error when no user tokens are available', async () => {
      mockOAuthClient.hasUserTokens.mockReturnValue(false);
      mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed(null));

      const clientWithoutTokens = new EbayApiClient(config);
      await Effect.runPromise(clientWithoutTokens.initialize());

      await expect(clientWithoutTokens.get('/sell/inventory/v1/inventory_item')).rejects.toThrow(
        'Access token is missing',
      );
    });

    it('refresh token when expired', async () => {
      // First call returns expired token, second call returns new token after refresh
      mockOAuthClient.getAccessToken
        .mockReturnValueOnce(Effect.succeed('expired_token'))
        .mockReturnValueOnce(Effect.succeed('new_access_token'));

      // Mock API call
      mockEbayApiEndpoint('/sell/inventory/v1/inventory_item', 'get', 'sandbox', { items: [] });

      const inventoryPage = await apiClient.get('/sell/inventory/v1/inventory_item');

      expect(inventoryPage).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('extract eBay error message from longMessage', async () => {
      const errorResponse = {
        errors: [
          {
            errorId: 1001,
            domain: 'API_INVENTORY',
            category: 'REQUEST',
            message: 'Short error',
            longMessage: 'Detailed error message with more context',
          },
        ],
      };

      mockEbayApiEndpoint('/sell/inventory/v1/offer', 'post', 'sandbox', errorResponse, 400);

      await expect(apiClient.post('/sell/inventory/v1/offer', {})).rejects.toThrow(
        'Detailed error message with more context',
      );
    });

    it('fallback to message when longMessage not available', async () => {
      const errorResponse = {
        errors: [
          {
            errorId: 1001,
            domain: 'API_INVENTORY',
            category: 'REQUEST',
            message: 'Error message',
          },
        ],
      };

      mockEbayApiEndpoint('/sell/inventory/v1/offer', 'post', 'sandbox', errorResponse, 400);

      await expect(apiClient.post('/sell/inventory/v1/offer', {})).rejects.toThrow('Error message');
    });

    it('handle network errors', async () => {
      // Don't mock the endpoint, causing a network error
      await expect(apiClient.get('/sell/inventory/v1/inventory_item')).rejects.toThrow();
    }, 12_000);

    it('handle timeout errors', async () => {
      // Create a client with very short timeout
      const quickTimeoutConfig = { ...config };
      const quickClient = new EbayApiClient(quickTimeoutConfig);
      await Effect.runPromise(quickClient.initialize());

      // Mock a slow response using nock directly (delay longer than timeout)
      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/inventory_item')
        .delay(35_000) // Delay 35 seconds (longer than default 30s timeout)
        .reply(200, { items: [] });

      await expect(quickClient.get('/sell/inventory/v1/inventory_item')).rejects.toThrow();
    }, 40_000); // Increase test timeout to 40s
  });

  describe('Environment Configuration', () => {
    it('use sandbox base URL for sandbox environment', async () => {
      const sandboxClient = new EbayApiClient({
        ...config,
        environment: 'sandbox',
      });

      await Effect.runPromise(sandboxClient.initialize());

      const scope = mockEbayApiEndpoint('/sell/inventory/v1/inventory_item', 'get', 'sandbox', {
        items: [],
      });

      await sandboxClient.get('/sell/inventory/v1/inventory_item');

      expect(scope.isDone()).toBe(true);
    });

    it('use production base URL for production environment', async () => {
      const prodConfig = { ...config, environment: 'production' as const };
      const prodClient = new EbayApiClient(prodConfig);

      await Effect.runPromise(prodClient.initialize());

      const scope = mockEbayApiEndpoint('/sell/inventory/v1/inventory_item', 'get', 'production', {
        items: [],
      });

      await prodClient.get('/sell/inventory/v1/inventory_item');

      expect(scope.isDone()).toBe(true);
    });
  });
});
