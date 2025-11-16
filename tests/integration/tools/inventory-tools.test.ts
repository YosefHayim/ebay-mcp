import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { executeTool } from '../../../src/tools/index.js';
import { EbaySellerApi } from '../../../src/api/index.js';
import type { EbayConfig } from '../../../src/types/ebay.js';
import { mockEbayApiEndpoint, mockEbayApiError, cleanupMocks } from '../../helpers/mock-http.js';

// Mock EbayOAuthClient
const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
};

vi.mock('../../../src/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: any) {
    return mockOAuthClient;
  }),
}));

describe('Inventory Tools Integration Tests', () => {
  let api: EbaySellerApi;
  let config: EbayConfig;

  beforeEach(async () => {
    vi.clearAllMocks();
    cleanupMocks();

    config = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };

    // Setup mock OAuth client
    mockOAuthClient.hasUserTokens.mockReturnValue(true);
    mockOAuthClient.getAccessToken.mockResolvedValue('mock_access_token');
    mockOAuthClient.initialize.mockResolvedValue(undefined);

    api = new EbaySellerApi(config);
    await api.initialize();
  });

  afterEach(() => {
    cleanupMocks();
  });

  describe('ebay_get_inventory_items', () => {
    it('should retrieve inventory items successfully', async () => {
      const mockResponse = {
        total: 2,
        limit: 25,
        inventoryItems: [
          {
            sku: 'TEST-001',
            availability: { shipToLocationAvailability: { quantity: 5 } },
            product: { title: 'Test Product 1' },
          },
          {
            sku: 'TEST-002',
            availability: { shipToLocationAvailability: { quantity: 3 } },
            product: { title: 'Test Product 2' },
          },
        ],
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item?limit=25&offset=0',
        'get',
        'sandbox',
        mockResponse
      );

      const result = await executeTool(api, 'ebay_get_inventory_items', {
        limit: 25,
        offset: 0,
      });

      expect(result).toEqual(mockResponse);
      expect(result.inventoryItems).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      const mockResponse = {
        total: 100,
        limit: 10,
        offset: 20,
        inventoryItems: [],
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item?limit=10&offset=20',
        'get',
        'sandbox',
        mockResponse
      );

      const result = await executeTool(api, 'ebay_get_inventory_items', {
        limit: 10,
        offset: 20,
      });

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
    });
  });

  describe('ebay_get_inventory_item', () => {
    it('should retrieve specific inventory item by SKU', async () => {
      const mockItem = {
        sku: 'TEST-SKU-001',
        availability: {
          shipToLocationAvailability: {
            quantity: 10,
          },
        },
        condition: 'NEW',
        product: {
          title: 'Test Product',
          description: 'A test product',
          aspects: {
            Brand: ['Test Brand'],
            Color: ['Blue'],
          },
          imageUrls: ['https://example.com/image.jpg'],
        },
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item/TEST-SKU-001',
        'get',
        'sandbox',
        mockItem
      );

      const result = await executeTool(api, 'ebay_get_inventory_item', {
        sku: 'TEST-SKU-001',
      });

      expect(result.sku).toBe('TEST-SKU-001');
      expect(result.product.title).toBe('Test Product');
    });

    it('should throw error for non-existent SKU', async () => {
      mockEbayApiError(
        '/sell/inventory/v1/inventory_item/INVALID-SKU',
        'get',
        'sandbox',
        'Inventory item not found',
        404
      );

      await expect(
        executeTool(api, 'ebay_get_inventory_item', { sku: 'INVALID-SKU' })
      ).rejects.toThrow();
    });
  });

  describe('ebay_create_inventory_item', () => {
    it('should create new inventory item successfully', async () => {
      const inventoryItem = {
        availability: {
          shipToLocationAvailability: {
            quantity: 50,
          },
        },
        condition: 'NEW',
        product: {
          title: 'New Test Product',
          description: 'A brand new test product',
          aspects: {
            Brand: ['Test Brand'],
          },
          imageUrls: ['https://example.com/image.jpg'],
        },
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/inventory_item/NEW-SKU-001',
        'put',
        'sandbox',
        undefined,
        204
      );

      await executeTool(api, 'ebay_create_inventory_item', {
        sku: 'NEW-SKU-001',
        inventoryItem,
      });

      // No error thrown means success
      expect(true).toBe(true);
    });

    it('should handle validation errors', async () => {
      const invalidItem = {
        // Missing required fields
        condition: 'NEW',
      };

      mockEbayApiError(
        '/sell/inventory/v1/inventory_item/NEW-SKU-001',
        'put',
        'sandbox',
        'Missing required field: availability',
        400
      );

      await expect(
        executeTool(api, 'ebay_create_inventory_item', {
          sku: 'NEW-SKU-001',
          inventoryItem: invalidItem,
        })
      ).rejects.toThrow();
    });
  });

  describe('ebay_get_offers', () => {
    it('should retrieve offers successfully', async () => {
      const mockResponse = {
        total: 1,
        limit: 25,
        offers: [
          {
            offerId: '1234567890',
            sku: 'TEST-001',
            marketplaceId: 'EBAY_US',
            format: 'FIXED_PRICE',
            pricingSummary: {
              price: { currency: 'USD', value: '99.99' },
            },
            status: 'PUBLISHED',
          },
        ],
      };

      mockEbayApiEndpoint('/sell/inventory/v1/offer?sku=TEST-001', 'get', 'sandbox', mockResponse);

      const result = await executeTool(api, 'ebay_get_offers', {
        sku: 'TEST-001',
      });

      expect(result.offers).toHaveLength(1);
      expect(result.offers[0].sku).toBe('TEST-001');
    });

    it('should filter by marketplace', async () => {
      const mockResponse = {
        total: 1,
        offers: [{ offerId: '123', marketplaceId: 'EBAY_US' }],
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/offer?marketplace_id=EBAY_US',
        'get',
        'sandbox',
        mockResponse
      );

      const result = await executeTool(api, 'ebay_get_offers', {
        marketplaceId: 'EBAY_US',
      });

      expect(result.offers[0].marketplaceId).toBe('EBAY_US');
    });
  });

  describe('ebay_create_offer', () => {
    it('should create offer successfully', async () => {
      const offerData = {
        sku: 'TEST-001',
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        listingPolicies: {
          fulfillmentPolicyId: '12345',
          paymentPolicyId: '67890',
          returnPolicyId: '11111',
        },
        pricingSummary: {
          price: { currency: 'USD', value: '99.99' },
        },
        categoryId: '1234',
      };

      const mockResponse = { offerId: '9876543210' };

      mockEbayApiEndpoint('/sell/inventory/v1/offer', 'post', 'sandbox', mockResponse, 201);

      const result = await executeTool(api, 'ebay_create_offer', {
        offer: offerData,
      });

      expect(result.offerId).toBe('9876543210');
    });
  });

  describe('ebay_publish_offer', () => {
    it('should publish offer successfully', async () => {
      const mockResponse = {
        listingId: '110123456789',
        offerId: '1234567890',
        statusCode: 200,
        warnings: [],
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/offer/1234567890/publish',
        'post',
        'sandbox',
        mockResponse
      );

      const result = await executeTool(api, 'ebay_publish_offer', {
        offerId: '1234567890',
      });

      expect(result.listingId).toBe('110123456789');
      expect(result.statusCode).toBe(200);
    });

    it('should handle publish errors', async () => {
      mockEbayApiError(
        '/sell/inventory/v1/offer/INVALID-OFFER/publish',
        'post',
        'sandbox',
        'Offer not found',
        404
      );

      await expect(
        executeTool(api, 'ebay_publish_offer', { offerId: 'INVALID-OFFER' })
      ).rejects.toThrow();
    });
  });

  describe('ebay_get_inventory_locations', () => {
    it('should retrieve inventory locations', async () => {
      const mockResponse = {
        total: 1,
        locations: [
          {
            merchantLocationKey: 'warehouse-1',
            name: 'Main Warehouse',
            location: {
              address: {
                addressLine1: '123 Main St',
                city: 'San Jose',
                stateOrProvince: 'CA',
                postalCode: '95110',
                country: 'US',
              },
            },
            merchantLocationStatus: 'ENABLED',
          },
        ],
      };

      mockEbayApiEndpoint('/sell/inventory/v1/location', 'get', 'sandbox', mockResponse);

      const result = await executeTool(api, 'ebay_get_inventory_locations', {});

      expect(result.locations).toHaveLength(1);
      expect(result.locations[0].name).toBe('Main Warehouse');
    });
  });

  describe('ebay_create_or_replace_inventory_location', () => {
    it('should create inventory location successfully', async () => {
      const locationData = {
        location: {
          address: {
            addressLine1: '123 Main St',
            city: 'San Jose',
            stateOrProvince: 'CA',
            postalCode: '95110',
            country: 'US',
          },
        },
        name: 'New Warehouse',
        merchantLocationStatus: 'ENABLED',
        locationTypes: ['WAREHOUSE'],
      };

      mockEbayApiEndpoint(
        '/sell/inventory/v1/location/new-warehouse',
        'post',
        'sandbox',
        undefined,
        204
      );

      await executeTool(api, 'ebay_create_or_replace_inventory_location', {
        merchantLocationKey: 'new-warehouse',
        location: locationData,
      });

      // No error means success
      expect(true).toBe(true);
    });
  });

  describe('Tool Parameter Validation', () => {
    it('should throw error when SKU is missing for ebay_get_inventory_item', async () => {
      await expect(executeTool(api, 'ebay_get_inventory_item', {})).rejects.toThrow();
    });

    it('should throw error when required fields are missing for ebay_create_offer', async () => {
      await expect(executeTool(api, 'ebay_create_offer', { offer: {} })).rejects.toThrow();
    });
  });
});
