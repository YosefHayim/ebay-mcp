import { MarketplaceId } from '@/types/ebay-enums.js';
import { z } from 'zod';
import {
  bulkInventoryItemRequestSchema,
  bulkMigrateRequestSchema,
  bulkOfferRequestSchema,
  bulkPriceQuantityRequestSchema,
  bulkPublishRequestSchema,
  inventoryItemGroupSchema,
  inventoryItemSchema,
  listingFeesRequestSchema,
  locationSchema,
  offerSchema,
  productCompatibilitySchema,
} from '../schemas.js';

export interface OutputArgs {
  [x: string]: unknown;
  type: 'object';
  properties?: Record<string, object>;
  required?: string[];
}

export interface ToolAnnotations {
  [x: string]: unknown;
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  title?: string;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
}
export const inventoryTools: ToolDefinition[] = [
  {
    name: 'ebay_get_inventory_items',
    description:
      'Retrieve all inventory items for the seller.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      limit: z.number().optional().describe('Number of items to return (max 100)'),
      offset: z.number().optional().describe('Number of items to skip'),
    },
  },
  {
    name: 'ebay_get_inventory_item',
    description:
      'Get a specific inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  {
    name: 'ebay_create_inventory_item',
    description:
      'Create or replace an inventory item.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
      inventoryItem: inventoryItemSchema.describe('Inventory item details'),
    },
  },
  {
    name: 'ebay_delete_inventory_item',
    description:
      'Delete an inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU to delete'),
    },
  },
  {
    name: 'ebay_get_offers',
    description: 'Get all offers for the seller',
    inputSchema: {
      sku: z.string().optional().describe('Filter by SKU'),
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of offers to return'),
    },
  },
  {
    name: 'ebay_create_offer',
    description: 'Create a new offer for an inventory item',
    inputSchema: {
      offer: offerSchema.describe(
        'Offer details including SKU, marketplace, pricing, and policies'
      ),
    },
  },
  {
    name: 'ebay_publish_offer',
    description: 'Publish an offer to create a listing',
    inputSchema: {
      offerId: z.string().describe('The offer ID to publish'),
    },
  },
  // Bulk Operations
  {
    name: 'ebay_bulk_create_or_replace_inventory_item',
    description: 'Bulk create or replace multiple inventory items',
    inputSchema: {
      requests: bulkInventoryItemRequestSchema.describe('Bulk inventory item requests'),
    },
  },
  {
    name: 'ebay_bulk_get_inventory_item',
    description: 'Bulk get multiple inventory items',
    inputSchema: {
      requests: z
        .object({
          requests: z.array(
            z
              .object({
                sku: z.string(),
              })
              .passthrough()
          ),
        })
        .passthrough()
        .describe('Bulk inventory item get requests with SKU list'),
    },
  },
  {
    name: 'ebay_bulk_update_price_quantity',
    description: 'Bulk update price and quantity for multiple offers',
    inputSchema: {
      requests: bulkPriceQuantityRequestSchema.describe('Bulk price and quantity update requests'),
    },
  },
  // Product Compatibility
  {
    name: 'ebay_get_product_compatibility',
    description: 'Get product compatibility information for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  {
    name: 'ebay_create_or_replace_product_compatibility',
    description: 'Create or replace product compatibility for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
      compatibility: productCompatibilitySchema.describe('Product compatibility details'),
    },
  },
  {
    name: 'ebay_delete_product_compatibility',
    description: 'Delete product compatibility for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  // Inventory Item Groups
  {
    name: 'ebay_get_inventory_item_group',
    description: 'Get an inventory item group (variation group)',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
    },
  },
  {
    name: 'ebay_create_or_replace_inventory_item_group',
    description: 'Create or replace an inventory item group',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
      inventoryItemGroup: inventoryItemGroupSchema.describe('Inventory item group details'),
    },
  },
  {
    name: 'ebay_delete_inventory_item_group',
    description: 'Delete an inventory item group',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
    },
  },
  // Location Management
  {
    name: 'ebay_get_inventory_locations',
    description: 'Get all inventory locations',
    inputSchema: {
      limit: z.number().optional().describe('Number of locations to return'),
      offset: z.number().optional().describe('Number of locations to skip'),
    },
  },
  {
    name: 'ebay_get_inventory_location',
    description: 'Get a specific inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_create_or_replace_inventory_location',
    description: 'Create or replace an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
      location: locationSchema.describe('Location details'),
    },
  },
  {
    name: 'ebay_delete_inventory_location',
    description: 'Delete an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_disable_inventory_location',
    description: 'Disable an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_enable_inventory_location',
    description: 'Enable an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
  },
  {
    name: 'ebay_update_location_details',
    description: 'Update location details for an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
      locationDetails: locationSchema.describe('Location detail updates'),
    },
  },
  // Offer Management
  {
    name: 'ebay_get_offer',
    description: 'Get a specific offer by ID',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
    },
  },
  {
    name: 'ebay_update_offer',
    description: 'Update an existing offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
      offer: offerSchema.describe('Updated offer details'),
    },
  },
  {
    name: 'ebay_delete_offer',
    description: 'Delete an offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID to delete'),
    },
  },
  {
    name: 'ebay_withdraw_offer',
    description: 'Withdraw a published offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID to withdraw'),
    },
  },
  {
    name: 'ebay_bulk_create_offer',
    description: 'Bulk create multiple offers',
    inputSchema: {
      requests: bulkOfferRequestSchema.describe('Bulk offer creation requests'),
    },
  },
  {
    name: 'ebay_bulk_publish_offer',
    description: 'Bulk publish multiple offers',
    inputSchema: {
      requests: bulkPublishRequestSchema.describe('Bulk offer publish requests'),
    },
  },
  {
    name: 'ebay_get_listing_fees',
    description: 'Get listing fees for offers before publishing',
    inputSchema: {
      offers: listingFeesRequestSchema.describe('Offers to calculate listing fees for'),
    },
  },
  // Listing Migration
  {
    name: 'ebay_bulk_migrate_listing',
    description: 'Bulk migrate listings to the inventory model',
    inputSchema: {
      requests: bulkMigrateRequestSchema.describe('Bulk listing migration requests'),
    },
  },
  // Listing Locations
  {
    name: 'ebay_get_listing_locations',
    description:
      'Get inventory locations for a specific listing.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      listingId: z.string().describe('The listing ID'),
      sku: z.string().describe('The seller-defined SKU'),
    },
  },
  // Inventory Item Group Publishing
  {
    name: 'ebay_publish_offer_by_inventory_item_group',
    description:
      'Publish an offer for an inventory item group (variation listing).\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      request: z
        .object({
          inventoryItemGroupKey: z.string(),
          marketplaceId: z.nativeEnum(MarketplaceId),
        })
        .passthrough()
        .describe('Publish request with inventory item group key and marketplace ID'),
    },
  },
  {
    name: 'ebay_withdraw_offer_by_inventory_item_group',
    description:
      'Withdraw an offer for an inventory item group (variation listing).\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      request: z
        .object({
          inventoryItemGroupKey: z.string(),
          marketplaceId: z.nativeEnum(MarketplaceId),
        })
        .passthrough()
        .describe('Withdraw request with inventory item group key and marketplace ID'),
    },
  },
];
