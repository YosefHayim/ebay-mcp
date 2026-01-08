import { MarketplaceId } from '@/types/ebay-enums.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
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
import {
  getInventoryItemsOutputSchema,
  getInventoryItemOutputSchema,
  createInventoryItemOutputSchema,
  getOffersOutputSchema,
  createOfferOutputSchema,
  publishOfferOutputSchema,
  offerResponseSchema,
  getInventoryLocationsOutputSchema,
  createInventoryLocationOutputSchema,
  getProductCompatibilityOutputSchema,
  getInventoryItemGroupOutputSchema,
  bulkInventoryItemResponseSchema,
  bulkOfferResponseSchema,
  bulkPublishResponseSchema,
} from '@/schemas/inventory-management/inventory.js';
import { OutputArgs, ToolAnnotations } from '../tool-definitions.js';

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
    outputSchema: zodToJsonSchema(getInventoryItemsOutputSchema, {
      name: 'GetInventoryItemsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_get_inventory_item',
    description:
      'Get a specific inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
    outputSchema: zodToJsonSchema(getInventoryItemOutputSchema, {
      name: 'GetInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_create_inventory_item',
    description:
      'Create or replace an inventory item.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
      inventoryItem: inventoryItemSchema.describe('Inventory item details'),
    },
    outputSchema: zodToJsonSchema(createInventoryItemOutputSchema, {
      name: 'CreateInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_delete_inventory_item',
    description:
      'Delete an inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU to delete'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    } as OutputArgs,
  },
  {
    name: 'ebay_get_offers',
    description: 'Get all offers for the seller',
    inputSchema: {
      sku: z.string().optional().describe('Filter by SKU'),
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of offers to return'),
    },
    outputSchema: zodToJsonSchema(getOffersOutputSchema, {
      name: 'GetOffersResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_create_offer',
    description: 'Create a new offer for an inventory item',
    inputSchema: {
      offer: offerSchema.describe(
        'Offer details including SKU, marketplace, pricing, and policies'
      ),
    },
    outputSchema: zodToJsonSchema(createOfferOutputSchema, {
      name: 'CreateOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_publish_offer',
    description: 'Publish an offer to create a listing',
    inputSchema: {
      offerId: z.string().describe('The offer ID to publish'),
    },
    outputSchema: zodToJsonSchema(publishOfferOutputSchema, {
      name: 'PublishOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  // Bulk Operations
  {
    name: 'ebay_bulk_create_or_replace_inventory_item',
    description: 'Bulk create or replace multiple inventory items',
    inputSchema: {
      requests: bulkInventoryItemRequestSchema.describe('Bulk inventory item requests'),
    },
    outputSchema: zodToJsonSchema(bulkInventoryItemResponseSchema, {
      name: 'BulkInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
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
    outputSchema: zodToJsonSchema(bulkInventoryItemResponseSchema, {
      name: 'BulkGetInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_bulk_update_price_quantity',
    description: 'Bulk update price and quantity for multiple offers',
    inputSchema: {
      requests: bulkPriceQuantityRequestSchema.describe('Bulk price and quantity update requests'),
    },
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'BulkUpdatePriceQuantityResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  // Product Compatibility
  {
    name: 'ebay_get_product_compatibility',
    description: 'Get product compatibility information for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
    outputSchema: zodToJsonSchema(getProductCompatibilityOutputSchema, {
      name: 'GetProductCompatibilityResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_create_or_replace_product_compatibility',
    description: 'Create or replace product compatibility for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
      compatibility: productCompatibilitySchema.describe('Product compatibility details'),
    },
    outputSchema: zodToJsonSchema(createInventoryItemOutputSchema, {
      name: 'CreateProductCompatibilityResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_delete_product_compatibility',
    description: 'Delete product compatibility for an inventory item',
    inputSchema: {
      sku: z.string().describe('The seller-defined SKU'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    } as OutputArgs,
  },
  // Inventory Item Groups
  {
    name: 'ebay_get_inventory_item_group',
    description: 'Get an inventory item group (variation group)',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
    },
    outputSchema: zodToJsonSchema(getInventoryItemGroupOutputSchema, {
      name: 'GetInventoryItemGroupResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_create_or_replace_inventory_item_group',
    description: 'Create or replace an inventory item group',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
      inventoryItemGroup: inventoryItemGroupSchema.describe('Inventory item group details'),
    },
    outputSchema: zodToJsonSchema(createInventoryItemOutputSchema, {
      name: 'CreateInventoryItemGroupResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_delete_inventory_item_group',
    description: 'Delete an inventory item group',
    inputSchema: {
      inventoryItemGroupKey: z.string().describe('The inventory item group key'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    } as OutputArgs,
  },
  // Location Management
  {
    name: 'ebay_get_inventory_locations',
    description: 'Get all inventory locations',
    inputSchema: {
      limit: z.number().optional().describe('Number of locations to return'),
      offset: z.number().optional().describe('Number of locations to skip'),
    },
    outputSchema: zodToJsonSchema(getInventoryLocationsOutputSchema, {
      name: 'GetInventoryLocationsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_get_inventory_location',
    description: 'Get a specific inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
    outputSchema: zodToJsonSchema(createInventoryLocationOutputSchema, {
      name: 'GetInventoryLocationResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_create_or_replace_inventory_location',
    description: 'Create or replace an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
      location: locationSchema.describe('Location details'),
    },
    outputSchema: zodToJsonSchema(createInventoryLocationOutputSchema, {
      name: 'CreateInventoryLocationResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_delete_inventory_location',
    description: 'Delete an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    } as OutputArgs,
  },
  {
    name: 'ebay_disable_inventory_location',
    description: 'Disable an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful operation (HTTP 204)',
    } as OutputArgs,
  },
  {
    name: 'ebay_enable_inventory_location',
    description: 'Enable an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful operation (HTTP 204)',
    } as OutputArgs,
  },
  {
    name: 'ebay_update_location_details',
    description: 'Update location details for an inventory location',
    inputSchema: {
      merchantLocationKey: z.string().describe('The merchant location key'),
      locationDetails: locationSchema.describe('Location detail updates'),
    },
    outputSchema: zodToJsonSchema(createInventoryLocationOutputSchema, {
      name: 'UpdateLocationDetailsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  // Offer Management
  {
    name: 'ebay_get_offer',
    description: 'Get a specific offer by ID',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
    },
    outputSchema: zodToJsonSchema(offerResponseSchema, {
      name: 'GetOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_update_offer',
    description: 'Update an existing offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
      offer: offerSchema.describe('Updated offer details'),
    },
    outputSchema: zodToJsonSchema(offerResponseSchema, {
      name: 'UpdateOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_delete_offer',
    description: 'Delete an offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID to delete'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful deletion (HTTP 204)',
    } as OutputArgs,
  },
  {
    name: 'ebay_withdraw_offer',
    description: 'Withdraw a published offer',
    inputSchema: {
      offerId: z.string().describe('The offer ID to withdraw'),
    },
    outputSchema: zodToJsonSchema(publishOfferOutputSchema, {
      name: 'WithdrawOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_bulk_create_offer',
    description: 'Bulk create multiple offers',
    inputSchema: {
      requests: bulkOfferRequestSchema.describe('Bulk offer creation requests'),
    },
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'BulkCreateOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_bulk_publish_offer',
    description: 'Bulk publish multiple offers',
    inputSchema: {
      requests: bulkPublishRequestSchema.describe('Bulk offer publish requests'),
    },
    outputSchema: zodToJsonSchema(bulkPublishResponseSchema, {
      name: 'BulkPublishOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_get_listing_fees',
    description: 'Get listing fees for offers before publishing',
    inputSchema: {
      offers: listingFeesRequestSchema.describe('Offers to calculate listing fees for'),
    },
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'GetListingFeesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  // Listing Migration
  {
    name: 'ebay_bulk_migrate_listing',
    description: 'Bulk migrate listings to the inventory model',
    inputSchema: {
      requests: bulkMigrateRequestSchema.describe('Bulk listing migration requests'),
    },
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'BulkMigrateListingResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_get_listing_locations',
    description:
      'Get inventory locations for a specific listing (SKU location mapping).\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: {
      listingId: z.string().describe('The listing ID'),
      sku: z.string().describe('The seller-defined SKU'),
    },
    outputSchema: zodToJsonSchema(getInventoryLocationsOutputSchema, {
      name: 'GetListingLocationsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
  },
  {
    name: 'ebay_create_or_replace_sku_location_mapping',
    description:
      'Create or replace SKU location mapping for a listing. Maps a SKU to multiple fulfillment center locations.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      listingId: z.string().describe('The listing ID'),
      sku: z.string().describe('The seller-defined SKU'),
      locationMapping: z
        .object({
          locationDetails: z
            .array(
              z.object({
                merchantLocationKey: z.string().describe('The fulfillment center location key'),
                quantity: z.number().optional().describe('Available quantity at this location'),
              })
            )
            .describe('Array of location details with quantities'),
        })
        .passthrough()
        .describe('Location mapping configuration'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on success (HTTP 204)',
    } as OutputArgs,
  },
  {
    name: 'ebay_delete_sku_location_mapping',
    description:
      'Delete SKU location mapping for a listing. Removes all fulfillment center location mappings for a SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: {
      listingId: z.string().describe('The listing ID'),
      sku: z.string().describe('The seller-defined SKU'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on success (HTTP 204)',
    } as OutputArgs,
  },
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
    outputSchema: zodToJsonSchema(publishOfferOutputSchema, {
      name: 'PublishOfferByInventoryItemGroupResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
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
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Empty response on successful withdrawal (HTTP 204)',
    } as OutputArgs,
  },
];
