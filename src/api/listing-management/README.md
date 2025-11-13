# Listing Management API (Inventory)

This directory contains the implementation of eBay's Sell Inventory API v1, which manages inventory items, offers, product compatibility, and inventory locations for multi-channel sellers.

## Implementation Status

✅ **COMPLETE** - All 23 OpenAPI endpoints implemented with 34 methods

## Files

- **`inventory.ts`** - Main InventoryApi class with all inventory management methods

## API Coverage

### Inventory Items
- ✅ `createOrReplaceInventoryItem(sku, item)` - Create or update inventory item
- ✅ `getInventoryItem(sku)` - Get specific inventory item by SKU
- ✅ `getInventoryItems(params)` - Get all inventory items with filters
- ✅ `deleteInventoryItem(sku)` - Delete inventory item
- ✅ `bulkCreateOrReplaceInventoryItem(items)` - Bulk create/update up to 25 items
- ✅ `bulkGetInventoryItem(skus)` - Bulk get inventory items by SKU
- ✅ `bulkUpdatePriceAndQuantity(updates)` - Bulk update price/quantity for multiple SKUs

### Inventory Item Groups (Variations)
- ✅ `createOrReplaceInventoryItemGroup(key, group)` - Create/update item group (variations)
- ✅ `getInventoryItemGroup(key)` - Get inventory item group
- ✅ `deleteInventoryItemGroup(key)` - Delete inventory item group

### Offers
- ✅ `createOffer(offer)` - Create a new offer
- ✅ `getOffer(offerId)` - Get specific offer
- ✅ `getOffers(params)` - Get all offers with filters
- ✅ `updateOffer(offerId, offer)` - Update offer
- ✅ `deleteOffer(offerId)` - Delete offer (unpublish)
- ✅ `publishOffer(offerId)` - Publish offer to eBay
- ✅ `publishOfferByInventoryItemGroup(groupKey)` - Publish variation offers
- ✅ `withdrawOffer(offerId)` - Withdraw (end) published offer
- ✅ `withdrawOfferByInventoryItemGroup(groupKey)` - Withdraw variation offers
- ✅ `getListingFees(offers)` - Get listing fees for offers

### Product Compatibility
- ✅ `createOrReplaceProductCompatibility(sku, compatibility)` - Set product compatibility
- ✅ `getProductCompatibility(sku)` - Get product compatibility
- ✅ `deleteProductCompatibility(sku)` - Delete product compatibility

### Inventory Locations
- ✅ `createInventoryLocation(locationKey, location)` - Create inventory location
- ✅ `getInventoryLocation(locationKey)` - Get specific location
- ✅ `getInventoryLocations(params)` - Get all inventory locations
- ✅ `updateInventoryLocation(locationKey, location)` - Update location
- ✅ `deleteInventoryLocation(locationKey)` - Delete location
- ✅ `disableInventoryLocation(locationKey)` - Disable location
- ✅ `enableInventoryLocation(locationKey)` - Enable location

### Bulk Migration (Legacy to Inventory)
- ✅ `bulkMigrateListings(listings)` - Migrate legacy listings to inventory model

## OpenAPI Specification

Source: `docs/sell-apps/listing-management/sell_inventory_v1_oas3.json`

## OAuth Scopes Required

- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Read/write access to inventory
- `https://api.ebay.com/oauth/api_scope/sell.inventory.readonly` - Read-only access to inventory

## Key Concepts

### Inventory Model
The Inventory API uses a two-step process:
1. **Create Inventory Item** - Define product details (SKU, condition, availability)
2. **Create Offer** - Set pricing, marketplace, listing format for the inventory item

### SKU (Stock Keeping Unit)
Unique identifier for each inventory item. Must be unique within your account.

### Inventory Locations
Physical locations where inventory is stored (warehouse, store, etc.). Required for multi-location inventory.

### Item Groups (Variations)
Used for products with variations (size, color, etc.). All variations share the same parent product.

## Usage Example

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Create inventory item
await api.inventory.createOrReplaceInventoryItem('MY-SKU-001', {
  availability: {
    shipToLocationAvailability: {
      quantity: 10
    }
  },
  condition: 'NEW',
  product: {
    title: 'Vintage Camera Lens',
    aspects: {
      Brand: ['Canon'],
      'Compatible Brand': ['Canon']
    },
    description: 'Excellent condition vintage lens',
    imageUrls: ['https://example.com/image.jpg']
  }
});

// Create offer for the inventory item
const offer = await api.inventory.createOffer({
  sku: 'MY-SKU-001',
  marketplaceId: 'EBAY_US',
  format: 'FIXED_PRICE',
  listingPolicies: {
    fulfillmentPolicyId: 'policy-id',
    paymentPolicyId: 'payment-id',
    returnPolicyId: 'return-id'
  },
  pricingSummary: {
    price: {
      value: '199.99',
      currency: 'USD'
    }
  }
});

// Publish the offer
await api.inventory.publishOffer(offer.offerId);
```

## Bulk Operations

The API supports efficient bulk operations:
- **Bulk Create/Update**: Up to 25 inventory items per request
- **Bulk Price/Quantity Update**: Up to 25 SKUs per request
- **Bulk Get**: Retrieve multiple items by SKU list

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:
- `ebay_create_or_replace_inventory_item`
- `ebay_get_inventory_items`
- `ebay_create_offer`
- `ebay_publish_offer`
- `ebay_create_inventory_location`
- And 29+ more inventory management tools...

See `src/tools/definitions/inventory.ts` for complete tool definitions.
