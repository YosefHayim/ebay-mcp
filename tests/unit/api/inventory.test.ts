import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryApi } from '../../../src/api/listing-management/inventory.js';
import type { EbayApiClient } from '../../../src/api/client.js';

describe('InventoryApi', () => {
  let client: EbayApiClient;
  let api: InventoryApi;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;
    api = new InventoryApi(client);
  });

  describe('getInventoryItems', () => {
    it('should get all inventory items without parameters', async () => {
      const mockResponse = { inventoryItems: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getInventoryItems();

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/inventory_item', {});
    });

    it('should get inventory items with limit and offset', async () => {
      const mockResponse = { inventoryItems: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getInventoryItems(10, 5);

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/inventory_item', {
        limit: 10,
        offset: 5,
      });
    });

    it('should throw error for invalid limit', async () => {
      await expect(api.getInventoryItems(0)).rejects.toThrow('limit must be a positive number');
    });

    it('should throw error for negative offset', async () => {
      await expect(api.getInventoryItems(10, -1)).rejects.toThrow(
        'offset must be a non-negative number'
      );
    });
  });

  describe('getInventoryItem', () => {
    it('should get inventory item by SKU', async () => {
      const mockResponse = { sku: 'TEST-SKU' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getInventoryItem('TEST-SKU');

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/inventory_item/TEST-SKU');
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.getInventoryItem('')).rejects.toThrow('sku is required');
    });

    it('should handle errors when getting item', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Not Found'));

      await expect(api.getInventoryItem('TEST-SKU')).rejects.toThrow(
        'Failed to get inventory item: Not Found'
      );
    });
  });

  describe('createOrReplaceInventoryItem', () => {
    it('should create or replace inventory item', async () => {
      const inventoryItem = {
        product: { title: 'Test Product' },
        condition: 'NEW' as const,
      };
      vi.mocked(client.put).mockResolvedValue(undefined);

      await api.createOrReplaceInventoryItem('TEST-SKU', inventoryItem);

      expect(client.put).toHaveBeenCalledWith(
        '/sell/inventory/v1/inventory_item/TEST-SKU',
        inventoryItem,
        {
          headers: {
            'Content-Language': 'en_US',
          },
        }
      );
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.createOrReplaceInventoryItem('', {} as any)).rejects.toThrow(
        'sku is required'
      );
    });

    it('should throw error when inventory item is missing', async () => {
      await expect(api.createOrReplaceInventoryItem('TEST-SKU', undefined as any)).rejects.toThrow(
        'inventoryItem is required'
      );
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete inventory item', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await api.deleteInventoryItem('TEST-SKU');

      expect(client.delete).toHaveBeenCalledWith('/sell/inventory/v1/inventory_item/TEST-SKU');
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.deleteInventoryItem('')).rejects.toThrow('sku is required');
    });
  });

  describe('getOffers', () => {
    it('should get all offers without parameters', async () => {
      const mockResponse = { offers: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getOffers();

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/offer', {});
    });

    it('should get offers with parameters', async () => {
      const mockResponse = { offers: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getOffers('TEST-SKU', 'EBAY_US', 10);

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/offer', {
        sku: 'TEST-SKU',
        marketplace_id: 'EBAY_US',
        limit: 10,
      });
    });
  });

  describe('createOffer', () => {
    it('should create offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const offer = {
        sku: 'TEST-SKU',
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE' as const,
        categoryId: '123',
        listingPolicies: {
          fulfillmentPolicyId: 'FP123',
          paymentPolicyId: 'PP123',
          returnPolicyId: 'RP123',
        },
        pricingSummary: {
          price: { value: '10.00', currency: 'USD' },
        },
      };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.createOffer(offer);

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/offer', offer, {
        headers: {
          'Content-Language': 'en_US',
        },
      });
    });

    it('should throw error when offer data is missing', async () => {
      await expect(api.createOffer(undefined as any)).rejects.toThrow('offer is required');
    });
  });

  describe('publishOffer', () => {
    it('should publish offer', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.publishOffer('OFFER123');

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/offer/OFFER123/publish');
    });

    it('should throw error when offerId is missing', async () => {
      await expect(api.publishOffer('')).rejects.toThrow('offerId is required');
    });
  });

  describe('withdrawOffer', () => {
    it('should withdraw offer', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.withdrawOffer('OFFER123');

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/offer/OFFER123/withdraw', {});
    });

    it('should throw error when offerId is missing', async () => {
      await expect(api.withdrawOffer('')).rejects.toThrow('offerId is required');
    });
  });

  describe('deleteOffer', () => {
    it('should delete offer', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await api.deleteOffer('OFFER123');

      expect(client.delete).toHaveBeenCalledWith('/sell/inventory/v1/offer/OFFER123');
    });

    it('should throw error when offerId is missing', async () => {
      await expect(api.deleteOffer('')).rejects.toThrow('offerId is required');
    });
  });

  describe('getInventoryLocations', () => {
    it('should get all inventory locations', async () => {
      const mockResponse = { locations: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getInventoryLocations();

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/location', {});
    });

    it('should get inventory locations with limit and offset', async () => {
      const mockResponse = { locations: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getInventoryLocations(10, 5);

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/location', {
        limit: 10,
        offset: 5,
      });
    });
  });

  describe('createOrReplaceInventoryLocation', () => {
    it('should create or replace inventory location', async () => {
      const location = {
        locationTypes: ['WAREHOUSE'],
        name: 'Main Warehouse',
        location: {
          address: {
            addressLine1: '123 Main St',
            city: 'San Jose',
            stateOrProvince: 'CA',
            postalCode: '95113',
            country: 'US',
          },
        },
      };
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.createOrReplaceInventoryLocation('WAREHOUSE_1', location);

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/location/WAREHOUSE_1', location);
    });

    it('should throw error when location key is missing', async () => {
      await expect(api.createOrReplaceInventoryLocation('', {} as any)).rejects.toThrow(
        'merchantLocationKey is required'
      );
    });

    it('should throw error when location data is missing', async () => {
      await expect(
        api.createOrReplaceInventoryLocation('WAREHOUSE_1', undefined as any)
      ).rejects.toThrow('location is required');
    });
  });

  describe('deleteInventoryLocation', () => {
    it('should delete inventory location', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await api.deleteInventoryLocation('WAREHOUSE_1');

      expect(client.delete).toHaveBeenCalledWith('/sell/inventory/v1/location/WAREHOUSE_1');
    });

    it('should throw error when location key is missing', async () => {
      await expect(api.deleteInventoryLocation('')).rejects.toThrow(
        'merchantLocationKey is required'
      );
    });
  });

  describe('bulkCreateOrReplaceInventoryItem', () => {
    it('should bulk create or replace inventory items', async () => {
      const mockResponse = { responses: [] };
      const requests = {
        requests: [
          {
            sku: 'SKU1',
            product: { title: 'Product 1' },
            condition: 'NEW' as const,
          },
          {
            sku: 'SKU2',
            product: { title: 'Product 2' },
            condition: 'NEW' as const,
          },
        ],
      };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.bulkCreateOrReplaceInventoryItem(requests);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/bulk_create_or_replace_inventory_item',
        requests,
        {
          headers: {
            'Content-Language': 'en_US',
          },
        }
      );
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkCreateOrReplaceInventoryItem(undefined as any)).rejects.toThrow(
        'requests is required and must be an object'
      );
    });
  });

  describe('bulkUpdatePriceQuantity', () => {
    it('should bulk update price and quantity', async () => {
      const mockResponse = { responses: [] };
      const requests = {
        requests: [
          {
            offerId: 'OFFER1',
            availableQuantity: 10,
            pricingSummary: {
              price: { value: '15.00', currency: 'USD' },
            },
          },
        ],
      };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.bulkUpdatePriceQuantity(requests);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/bulk_update_price_quantity',
        requests
      );
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkUpdatePriceQuantity(undefined as any)).rejects.toThrow(
        'requests is required and must be an object'
      );
    });
  });

  describe('getOffer', () => {
    it('should get offer by ID', async () => {
      const mockOffer = { offerId: 'OFFER-123' };
      vi.mocked(client.get).mockResolvedValue(mockOffer);

      const result = await api.getOffer('OFFER-123');

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/offer/OFFER-123');
      expect(result).toEqual(mockOffer);
    });

    it('should throw error when offerId is missing', async () => {
      await expect(api.getOffer('')).rejects.toThrow('offerId is required');
    });
  });

  describe('updateOffer', () => {
    it('should update offer', async () => {
      const mockOffer = { availableQuantity: 10 };
      vi.mocked(client.put).mockResolvedValue(undefined);

      await api.updateOffer('OFFER-123', mockOffer);

      expect(client.put).toHaveBeenCalledWith('/sell/inventory/v1/offer/OFFER-123', mockOffer, {
        headers: {
          'Content-Language': 'en_US',
        },
      });
    });

    it('should throw error when offerId is missing', async () => {
      await expect(api.updateOffer('', {})).rejects.toThrow('offerId is required');
    });

    it('should throw error when offer data is missing', async () => {
      await expect(api.updateOffer('OFFER-123', undefined as any)).rejects.toThrow(
        'offer is required'
      );
    });
  });

  describe('bulkCreateOffer', () => {
    it('should bulk create offers', async () => {
      const requests = { requests: [{ sku: 'TEST-SKU' }] };
      vi.mocked(client.post).mockResolvedValue({ responses: [] });

      await api.bulkCreateOffer(requests);

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/bulk_create_offer', requests, {
        headers: {
          'Content-Language': 'en_US',
        },
      });
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkCreateOffer(undefined as any)).rejects.toThrow('requests is required');
    });
  });

  describe('bulkPublishOffer', () => {
    it('should bulk publish offers', async () => {
      const requests = { requests: [{ offerId: 'OFFER-123' }] };
      vi.mocked(client.post).mockResolvedValue({ responses: [] });

      await api.bulkPublishOffer(requests);

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/bulk_publish_offer', requests);
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkPublishOffer(undefined as any)).rejects.toThrow('requests is required');
    });
  });

  describe('getListingFees', () => {
    it('should get listing fees', async () => {
      const offers = { offers: [{ offerId: 'OFFER-123' }] };
      vi.mocked(client.post).mockResolvedValue({ feeSummaries: [] });

      await api.getListingFees(offers);

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/offer/get_listing_fees', offers);
    });

    it('should throw error when offers are missing', async () => {
      await expect(api.getListingFees(undefined as any)).rejects.toThrow('offers is required');
    });
  });

  describe('bulkMigrateListing', () => {
    it('should bulk migrate listings', async () => {
      const requests = { requests: [{ listingId: 'LISTING-123' }] };
      vi.mocked(client.post).mockResolvedValue({ responses: [] });

      await api.bulkMigrateListing(requests);

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/bulk_migrate_listing', requests);
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkMigrateListing(undefined as any)).rejects.toThrow(
        'requests is required'
      );
    });
  });

  describe('getProductCompatibility', () => {
    it('should get product compatibility', async () => {
      const mockCompatibility = { compatibleProducts: [] };
      vi.mocked(client.get).mockResolvedValue(mockCompatibility);

      const result = await api.getProductCompatibility('TEST-SKU');

      expect(client.get).toHaveBeenCalledWith(
        '/sell/inventory/v1/inventory_item/TEST-SKU/product_compatibility'
      );
      expect(result).toEqual(mockCompatibility);
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.getProductCompatibility('')).rejects.toThrow('sku is required');
    });
  });

  describe('createOrReplaceProductCompatibility', () => {
    it('should create or replace product compatibility', async () => {
      const compatibility = { compatibleProducts: [] };
      vi.mocked(client.put).mockResolvedValue(undefined);

      await api.createOrReplaceProductCompatibility('TEST-SKU', compatibility);

      expect(client.put).toHaveBeenCalledWith(
        '/sell/inventory/v1/inventory_item/TEST-SKU/product_compatibility',
        compatibility,
        {
          headers: {
            'Content-Language': 'en_US',
          },
        }
      );
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.createOrReplaceProductCompatibility('', {})).rejects.toThrow(
        'sku is required'
      );
    });

    it('should throw error when compatibility is missing', async () => {
      await expect(
        api.createOrReplaceProductCompatibility('TEST-SKU', undefined as any)
      ).rejects.toThrow('compatibility is required');
    });
  });

  describe('deleteProductCompatibility', () => {
    it('should delete product compatibility', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await api.deleteProductCompatibility('TEST-SKU');

      expect(client.delete).toHaveBeenCalledWith(
        '/sell/inventory/v1/inventory_item/TEST-SKU/product_compatibility'
      );
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.deleteProductCompatibility('')).rejects.toThrow('sku is required');
    });
  });

  describe('getInventoryItemGroup', () => {
    it('should get inventory item group', async () => {
      const mockGroup = { inventoryItemGroupKey: 'GROUP-123' };
      vi.mocked(client.get).mockResolvedValue(mockGroup);

      const result = await api.getInventoryItemGroup('GROUP-123');

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/inventory_item_group/GROUP-123');
      expect(result).toEqual(mockGroup);
    });

    it('should throw error when group key is missing', async () => {
      await expect(api.getInventoryItemGroup('')).rejects.toThrow(
        'inventoryItemGroupKey is required'
      );
    });
  });

  describe('createOrReplaceInventoryItemGroup', () => {
    it('should create or replace inventory item group', async () => {
      const group = { title: 'Test Group', variantSKUs: ['SKU1', 'SKU2'] };
      vi.mocked(client.put).mockResolvedValue(undefined);

      await api.createOrReplaceInventoryItemGroup('GROUP-123', group);

      expect(client.put).toHaveBeenCalledWith(
        '/sell/inventory/v1/inventory_item_group/GROUP-123',
        group,
        {
          headers: {
            'Content-Language': 'en_US',
          },
        }
      );
    });

    it('should throw error when group key is missing', async () => {
      await expect(api.createOrReplaceInventoryItemGroup('', {})).rejects.toThrow(
        'inventoryItemGroupKey is required'
      );
    });

    it('should throw error when group data is missing', async () => {
      await expect(
        api.createOrReplaceInventoryItemGroup('GROUP-123', undefined as any)
      ).rejects.toThrow('inventoryItemGroup is required');
    });
  });

  describe('deleteInventoryItemGroup', () => {
    it('should delete inventory item group', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await api.deleteInventoryItemGroup('GROUP-123');

      expect(client.delete).toHaveBeenCalledWith(
        '/sell/inventory/v1/inventory_item_group/GROUP-123'
      );
    });

    it('should throw error when group key is missing', async () => {
      await expect(api.deleteInventoryItemGroup('')).rejects.toThrow(
        'inventoryItemGroupKey is required'
      );
    });
  });

  describe('getInventoryLocation', () => {
    it('should get inventory location', async () => {
      const mockLocation = { merchantLocationKey: 'LOC-123' };
      vi.mocked(client.get).mockResolvedValue(mockLocation);

      const result = await api.getInventoryLocation('LOC-123');

      expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/location/LOC-123');
      expect(result).toEqual(mockLocation);
    });

    it('should throw error when location key is missing', async () => {
      await expect(api.getInventoryLocation('')).rejects.toThrow('merchantLocationKey is required');
    });
  });

  describe('disableInventoryLocation', () => {
    it('should disable inventory location', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.disableInventoryLocation('LOC-123');

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/location/LOC-123/disable', {});
    });

    it('should throw error when location key is missing', async () => {
      await expect(api.disableInventoryLocation('')).rejects.toThrow(
        'merchantLocationKey is required'
      );
    });
  });

  describe('enableInventoryLocation', () => {
    it('should enable inventory location', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.enableInventoryLocation('LOC-123');

      expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/location/LOC-123/enable', {});
    });

    it('should throw error when location key is missing', async () => {
      await expect(api.enableInventoryLocation('')).rejects.toThrow(
        'merchantLocationKey is required'
      );
    });
  });

  describe('updateLocationDetails', () => {
    it('should update location details', async () => {
      const details = { name: 'Updated Warehouse' };
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.updateLocationDetails('LOC-123', details);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/location/LOC-123/update_location_details',
        details
      );
    });

    it('should throw error when location key is missing', async () => {
      await expect(api.updateLocationDetails('', {})).rejects.toThrow(
        'merchantLocationKey is required'
      );
    });

    it('should throw error when location details are missing', async () => {
      await expect(api.updateLocationDetails('LOC-123', undefined as any)).rejects.toThrow(
        'locationDetails is required'
      );
    });
  });

  describe('bulkCreateOrReplaceInventoryItem', () => {
    it('should bulk create or replace inventory items', async () => {
      const requests = { requests: [{ sku: 'TEST-SKU' }] };
      vi.mocked(client.post).mockResolvedValue({ responses: [] });

      await api.bulkCreateOrReplaceInventoryItem(requests);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/bulk_create_or_replace_inventory_item',
        requests,
        {
          headers: {
            'Content-Language': 'en_US',
          },
        }
      );
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkCreateOrReplaceInventoryItem(undefined as any)).rejects.toThrow(
        'requests is required'
      );
    });
  });

  describe('bulkGetInventoryItem', () => {
    it('should bulk get inventory items', async () => {
      const requests = { requests: [{ sku: 'TEST-SKU' }] };
      vi.mocked(client.post).mockResolvedValue({ responses: [] });

      await api.bulkGetInventoryItem(requests);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/bulk_get_inventory_item',
        requests
      );
    });

    it('should throw error when requests are missing', async () => {
      await expect(api.bulkGetInventoryItem(undefined as any)).rejects.toThrow(
        'requests is required'
      );
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete inventory item by SKU', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await api.deleteInventoryItem('TEST-SKU');

      expect(client.delete).toHaveBeenCalledWith('/sell/inventory/v1/inventory_item/TEST-SKU');
    });

    it('should throw error when SKU is missing', async () => {
      await expect(api.deleteInventoryItem('')).rejects.toThrow('sku is required');
    });

    it('should handle errors when deleting item', async () => {
      vi.mocked(client.delete).mockRejectedValue(new Error('Delete failed'));

      await expect(api.deleteInventoryItem('TEST-SKU')).rejects.toThrow(
        'Failed to delete inventory item: Delete failed'
      );
    });
  });

  describe('getListingLocations', () => {
    it('should get listing locations', async () => {
      const mockResponse = { locations: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getListingLocations('LISTING-123', 'TEST-SKU');

      expect(client.get).toHaveBeenCalledWith(
        '/sell/inventory/v1/listing/LISTING-123/sku/TEST-SKU/locations'
      );
    });

    it('should throw error when listingId is missing', async () => {
      await expect(api.getListingLocations('', 'TEST-SKU')).rejects.toThrow(
        'listingId is required'
      );
    });

    it('should throw error when sku is missing', async () => {
      await expect(api.getListingLocations('LISTING-123', '')).rejects.toThrow('sku is required');
    });

    it('should handle errors when getting listing locations', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Not Found'));

      await expect(api.getListingLocations('LISTING-123', 'TEST-SKU')).rejects.toThrow(
        'Failed to get listing locations: Not Found'
      );
    });
  });

  describe('publishOfferByInventoryItemGroup', () => {
    it('should publish offer by inventory item group', async () => {
      const request = {
        inventoryItemGroupKey: 'GROUP-123',
        marketplaceId: 'EBAY_US',
      };
      const mockResponse = { listingId: 'LISTING-123' };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.publishOfferByInventoryItemGroup(request);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/offer/publish_by_inventory_item_group',
        request
      );
    });

    it('should throw error when request is missing', async () => {
      await expect(api.publishOfferByInventoryItemGroup(undefined as any)).rejects.toThrow(
        'request is required'
      );
    });

    it('should handle errors when publishing offer by group', async () => {
      vi.mocked(client.post).mockRejectedValue(new Error('Publish failed'));

      await expect(
        api.publishOfferByInventoryItemGroup({ inventoryItemGroupKey: 'GROUP-123' })
      ).rejects.toThrow('Failed to publish offer by inventory item group: Publish failed');
    });
  });

  describe('withdrawOfferByInventoryItemGroup', () => {
    it('should withdraw offer by inventory item group', async () => {
      const request = {
        inventoryItemGroupKey: 'GROUP-123',
        marketplaceId: 'EBAY_US',
      };
      const mockResponse = { success: true };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.withdrawOfferByInventoryItemGroup(request);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/inventory/v1/offer/withdraw_by_inventory_item_group',
        request
      );
    });

    it('should throw error when request is missing', async () => {
      await expect(api.withdrawOfferByInventoryItemGroup(undefined as any)).rejects.toThrow(
        'request is required'
      );
    });

    it('should handle errors when withdrawing offer by group', async () => {
      vi.mocked(client.post).mockRejectedValue(new Error('Withdraw failed'));

      await expect(
        api.withdrawOfferByInventoryItemGroup({ inventoryItemGroupKey: 'GROUP-123' })
      ).rejects.toThrow('Failed to withdraw offer by inventory item group: Withdraw failed');
    });
  });
});
