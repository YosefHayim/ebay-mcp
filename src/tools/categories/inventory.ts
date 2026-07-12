import { Effect } from 'effect';
import { z } from '@/utils/effectSchema.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { defineTool } from '@/tools/defineTool.js';
import type { OutputArgs } from '@/tools/types.js';
import type { ToolEntry } from '@/tools/registry.js';
import {
  mapInventoryItemsToTable,
  mapInventoryItemToCard,
  mapLocationsToTable,
  mapOffersToTable,
  mapOfferToCard,
} from '@/tools/ui/maps.js';
import { MarketplaceId } from '@/types/ebayEnums.js';
import type {
  BulkCreateOfferRequest,
  BulkCreateOrReplaceInventoryItemRequest,
  BulkGetInventoryItemRequest,
  BulkMigrateListingRequest,
  BulkPublishOfferRequest,
  BulkUpdatePriceQuantityRequest,
  CreateInventoryLocationRequest,
  CreateOfferRequest,
  GetListingFeesRequest,
  InventoryItem,
  InventoryItemGroup,
  LocationMapping,
  ProductCompatibility,
  PublishOfferByInventoryItemGroupRequest,
  UpdateInventoryLocationRequest,
  UpdateOfferRequest,
  WithdrawOfferByInventoryItemGroupRequest,
} from '@/api/listing-management/inventory.js';
import {
  bulkInventoryItemResponseSchema,
  bulkOfferResponseSchema,
  bulkPublishResponseSchema,
  createInventoryItemOutputSchema,
  createInventoryLocationOutputSchema,
  createOfferOutputSchema,
  getInventoryItemGroupOutputSchema,
  getInventoryItemOutputSchema,
  getInventoryItemsOutputSchema,
  getInventoryLocationsOutputSchema,
  getOffersOutputSchema,
  getProductCompatibilityOutputSchema,
  offerResponseSchema,
  publishOfferOutputSchema,
} from '@/schemas/inventory-management/inventory.js';

const emptyOutputSchema = {
  type: 'object',
  properties: {},
  description: 'No content returned on success',
} as OutputArgs;

// The MCP wire schema must advertise `type: object` so hosts send a real JSON
// object for the request body. The previous `z.custom` produced an opaque `{}`
// schema (no type), so hosts serialized the body to a JSON *string* that then
// failed the object-only refine — every call was rejected before reaching eBay.
// `z.record(z.unknown())` is the same object-schema idiom the working Trading
// `create_listing` tool already uses. The cast is a documented boundary: the
// runtime schema decodes/validates an object, while the handler keeps the precise
// generated `Body` type it passes to the eBay API method.
const generatedBodySchema = <Body>(description: string) =>
  z.record(z.unknown()).describe(description) as unknown as ReturnType<typeof z.custom<Body>>;

const skuInputSchema = z.object({
  sku: z.string().describe('The seller-defined SKU'),
});

const inventoryPaginationInputSchema = z.object({
  limit: z.number().optional().describe('Number of records to return'),
  offset: z.number().optional().describe('Number of records to skip'),
});

const createOrReplaceInventoryItemInputSchema = skuInputSchema.extend({
  body: generatedBodySchema<InventoryItem>('Generated InventoryItem request body'),
});

const bulkCreateOrReplaceInventoryItemInputSchema = z.object({
  body: generatedBodySchema<BulkCreateOrReplaceInventoryItemRequest>(
    'Generated BulkInventoryItem request body',
  ),
});

const bulkGetInventoryItemInputSchema = z.object({
  body: generatedBodySchema<BulkGetInventoryItemRequest>(
    'Generated BulkGetInventoryItem request body',
  ),
});

const bulkUpdatePriceQuantityInputSchema = z.object({
  body: generatedBodySchema<BulkUpdatePriceQuantityRequest>(
    'Generated BulkPriceQuantity request body',
  ),
});

const createOrReplaceProductCompatibilityInputSchema = skuInputSchema.extend({
  body: generatedBodySchema<ProductCompatibility>('Generated Compatibility request body'),
});

const inventoryItemGroupKeyInputSchema = z.object({
  inventoryItemGroupKey: z.string().describe('The inventory item group key'),
});

const createOrReplaceInventoryItemGroupInputSchema = inventoryItemGroupKeyInputSchema.extend({
  body: generatedBodySchema<InventoryItemGroup>('Generated InventoryItemGroup request body'),
});

const merchantLocationKeyInputSchema = z.object({
  merchantLocationKey: z.string().describe('The merchant location key'),
});

const createInventoryLocationInputSchema = merchantLocationKeyInputSchema.extend({
  body: generatedBodySchema<CreateInventoryLocationRequest>(
    'Generated InventoryLocationFull request body',
  ),
});

const updateInventoryLocationInputSchema = merchantLocationKeyInputSchema.extend({
  body: generatedBodySchema<UpdateInventoryLocationRequest>(
    'Generated InventoryLocation request body',
  ),
});

const getOffersInputSchema = z.object({
  format: z.string().optional().describe('Filter by listing format'),
  limit: z.number().optional().describe('Number of offers to return'),
  marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
  offset: z.number().optional().describe('Number of offers to skip'),
  sku: z.string().optional().describe('Filter by SKU'),
});

const offerIdInputSchema = z.object({
  offerId: z.string().describe('The offer ID'),
});

const createOfferInputSchema = z.object({
  body: generatedBodySchema<CreateOfferRequest>('Generated EbayOfferDetailsWithKeys request body'),
});

const updateOfferInputSchema = offerIdInputSchema.extend({
  body: generatedBodySchema<UpdateOfferRequest>('Generated EbayOfferDetailsWithId request body'),
});

const bulkCreateOfferInputSchema = z.object({
  body: generatedBodySchema<BulkCreateOfferRequest>(
    'Generated BulkEbayOfferDetailsWithKeys request body',
  ),
});

const bulkPublishOfferInputSchema = z.object({
  body: generatedBodySchema<BulkPublishOfferRequest>('Generated BulkOffer request body'),
});

const getListingFeesInputSchema = z.object({
  body: generatedBodySchema<GetListingFeesRequest>('Generated OfferKeysWithId request body'),
});

const bulkMigrateListingInputSchema = z.object({
  body: generatedBodySchema<BulkMigrateListingRequest>('Generated BulkMigrateListing request body'),
});

const skuLocationMappingInputSchema = z.object({
  listingId: z.string().describe('The listing ID'),
  sku: z.string().describe('The seller-defined SKU'),
});

const locationMappingSchema = z
  .object({
    locations: z
      .array(
        z
          .object({
            merchantLocationKey: z.string().describe('The fulfillment center location key'),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

const createOrReplaceSkuLocationMappingInputSchema = skuLocationMappingInputSchema.extend({
  body: generatedBodySchema<LocationMapping>('Generated LocationMapping request body'),
});

const publishOfferByInventoryItemGroupInputSchema = z.object({
  body: generatedBodySchema<PublishOfferByInventoryItemGroupRequest>(
    'Generated PublishByInventoryItemGroup body',
  ),
});

const withdrawOfferByInventoryItemGroupInputSchema = z.object({
  body: generatedBodySchema<WithdrawOfferByInventoryItemGroupRequest>(
    'Generated WithdrawByInventoryItemGroup body',
  ),
});

const locationMappingOutputSchema = locationMappingSchema.extend({
  warnings: z.array(z.object({}).passthrough()).optional(),
});

const listingFeesOutputSchema = z
  .object({
    feeSummaries: z.array(z.object({}).passthrough()).optional(),
    warnings: z.array(z.object({}).passthrough()).optional(),
  })
  .passthrough();

/** Inventory API tools for seller inventory items, offers, locations, and bulk operations. */
export const inventoryEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_inventory_items',
    description:
      'Retrieve all inventory items for the seller.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: inventoryPaginationInputSchema.shape,
    outputSchema: zodToJsonSchema(getInventoryItemsOutputSchema, {
      name: 'GetInventoryItemsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getInventoryItems(args)),
    ui: { archetype: 'table', map: mapInventoryItemsToTable },
  }),
  defineTool({
    name: 'ebay_get_inventory_item',
    description:
      'Get a specific inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: skuInputSchema.shape,
    outputSchema: zodToJsonSchema(getInventoryItemOutputSchema, {
      name: 'GetInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getInventoryItem(args)),
    ui: { archetype: 'card', map: mapInventoryItemToCard },
  }),
  defineTool({
    name: 'ebay_create_or_replace_inventory_item',
    description:
      'Create or replace an inventory item.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: createOrReplaceInventoryItemInputSchema.shape,
    outputSchema: zodToJsonSchema(createInventoryItemOutputSchema, {
      name: 'CreateOrReplaceInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.createOrReplaceInventoryItem(args)),
  }),
  defineTool({
    name: 'ebay_delete_inventory_item',
    description:
      'Delete an inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: skuInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.deleteInventoryItem(args)),
  }),
  defineTool({
    name: 'ebay_bulk_create_or_replace_inventory_item',
    description: 'Bulk create or replace multiple inventory items',
    inputSchema: bulkCreateOrReplaceInventoryItemInputSchema.shape,
    outputSchema: zodToJsonSchema(bulkInventoryItemResponseSchema, {
      name: 'BulkInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.bulkCreateOrReplaceInventoryItem(args)),
  }),
  defineTool({
    name: 'ebay_bulk_get_inventory_item',
    description: 'Bulk get multiple inventory items',
    inputSchema: bulkGetInventoryItemInputSchema.shape,
    outputSchema: zodToJsonSchema(bulkInventoryItemResponseSchema, {
      name: 'BulkGetInventoryItemResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.bulkGetInventoryItem(args)),
  }),
  defineTool({
    name: 'ebay_bulk_update_price_quantity',
    description: 'Bulk update price and quantity for multiple offers',
    inputSchema: bulkUpdatePriceQuantityInputSchema.shape,
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'BulkUpdatePriceQuantityResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.bulkUpdatePriceQuantity(args)),
  }),
  defineTool({
    name: 'ebay_get_product_compatibility',
    description: 'Get product compatibility information for an inventory item',
    inputSchema: skuInputSchema.shape,
    outputSchema: zodToJsonSchema(getProductCompatibilityOutputSchema, {
      name: 'GetProductCompatibilityResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getProductCompatibility(args)),
  }),
  defineTool({
    name: 'ebay_create_or_replace_product_compatibility',
    description: 'Create or replace product compatibility for an inventory item',
    inputSchema: createOrReplaceProductCompatibilityInputSchema.shape,
    outputSchema: zodToJsonSchema(createInventoryItemOutputSchema, {
      name: 'CreateProductCompatibilityResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) =>
      Effect.runPromise(api.inventory.createOrReplaceProductCompatibility(args)),
  }),
  defineTool({
    name: 'ebay_delete_product_compatibility',
    description: 'Delete product compatibility for an inventory item',
    inputSchema: skuInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.deleteProductCompatibility(args)),
  }),
  defineTool({
    name: 'ebay_get_inventory_item_group',
    description: 'Get an inventory item group (variation group)',
    inputSchema: inventoryItemGroupKeyInputSchema.shape,
    outputSchema: zodToJsonSchema(getInventoryItemGroupOutputSchema, {
      name: 'GetInventoryItemGroupResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getInventoryItemGroup(args)),
  }),
  defineTool({
    name: 'ebay_create_or_replace_inventory_item_group',
    description: 'Create or replace an inventory item group',
    inputSchema: createOrReplaceInventoryItemGroupInputSchema.shape,
    outputSchema: zodToJsonSchema(createInventoryItemOutputSchema, {
      name: 'CreateInventoryItemGroupResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) =>
      Effect.runPromise(api.inventory.createOrReplaceInventoryItemGroup(args)),
  }),
  defineTool({
    name: 'ebay_delete_inventory_item_group',
    description: 'Delete an inventory item group',
    inputSchema: inventoryItemGroupKeyInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.deleteInventoryItemGroup(args)),
  }),
  defineTool({
    name: 'ebay_get_inventory_locations',
    description: 'Get all inventory locations',
    inputSchema: inventoryPaginationInputSchema.shape,
    outputSchema: zodToJsonSchema(getInventoryLocationsOutputSchema, {
      name: 'GetInventoryLocationsResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getInventoryLocations(args)),
    ui: { archetype: 'table', map: mapLocationsToTable },
  }),
  defineTool({
    name: 'ebay_get_inventory_location',
    description: 'Get a specific inventory location',
    inputSchema: merchantLocationKeyInputSchema.shape,
    outputSchema: zodToJsonSchema(createInventoryLocationOutputSchema, {
      name: 'GetInventoryLocationResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getInventoryLocation(args)),
  }),
  defineTool({
    name: 'ebay_create_inventory_location',
    description: 'Create an inventory location',
    inputSchema: createInventoryLocationInputSchema.shape,
    outputSchema: zodToJsonSchema(createInventoryLocationOutputSchema, {
      name: 'CreateInventoryLocationResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.createInventoryLocation(args)),
  }),
  defineTool({
    name: 'ebay_delete_inventory_location',
    description: 'Delete an inventory location',
    inputSchema: merchantLocationKeyInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.deleteInventoryLocation(args)),
  }),
  defineTool({
    name: 'ebay_disable_inventory_location',
    description: 'Disable an inventory location',
    inputSchema: merchantLocationKeyInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.disableInventoryLocation(args)),
  }),
  defineTool({
    name: 'ebay_enable_inventory_location',
    description: 'Enable an inventory location',
    inputSchema: merchantLocationKeyInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.enableInventoryLocation(args)),
  }),
  defineTool({
    name: 'ebay_update_inventory_location',
    description: 'Update an inventory location',
    inputSchema: updateInventoryLocationInputSchema.shape,
    outputSchema: zodToJsonSchema(createInventoryLocationOutputSchema, {
      name: 'UpdateInventoryLocationResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.updateInventoryLocation(args)),
  }),
  defineTool({
    name: 'ebay_get_offers',
    description: 'Get all offers for the seller',
    inputSchema: getOffersInputSchema.shape,
    outputSchema: zodToJsonSchema(getOffersOutputSchema, {
      name: 'GetOffersResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getOffers(args)),
    ui: { archetype: 'table', map: mapOffersToTable },
  }),
  defineTool({
    name: 'ebay_get_offer',
    description: 'Get a specific offer by ID',
    inputSchema: offerIdInputSchema.shape,
    outputSchema: zodToJsonSchema(offerResponseSchema, {
      name: 'GetOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getOffer(args)),
    ui: { archetype: 'card', map: mapOfferToCard },
  }),
  defineTool({
    name: 'ebay_create_offer',
    description: 'Create a new offer for an inventory item',
    inputSchema: createOfferInputSchema.shape,
    outputSchema: zodToJsonSchema(createOfferOutputSchema, {
      name: 'CreateOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.createOffer(args)),
  }),
  defineTool({
    name: 'ebay_update_offer',
    description: 'Update an existing offer',
    inputSchema: updateOfferInputSchema.shape,
    outputSchema: zodToJsonSchema(offerResponseSchema, {
      name: 'UpdateOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.updateOffer(args)),
  }),
  defineTool({
    name: 'ebay_delete_offer',
    description: 'Delete an offer',
    inputSchema: offerIdInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.deleteOffer(args)),
  }),
  defineTool({
    name: 'ebay_publish_offer',
    description: 'Publish an offer to create a listing',
    inputSchema: offerIdInputSchema.shape,
    outputSchema: zodToJsonSchema(publishOfferOutputSchema, {
      name: 'PublishOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.publishOffer(args)),
  }),
  defineTool({
    name: 'ebay_withdraw_offer',
    description: 'Withdraw a published offer',
    inputSchema: offerIdInputSchema.shape,
    outputSchema: zodToJsonSchema(publishOfferOutputSchema, {
      name: 'WithdrawOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.withdrawOffer(args)),
  }),
  defineTool({
    name: 'ebay_bulk_create_offer',
    description: 'Bulk create multiple offers',
    inputSchema: bulkCreateOfferInputSchema.shape,
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'BulkCreateOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.bulkCreateOffer(args)),
  }),
  defineTool({
    name: 'ebay_bulk_publish_offer',
    description: 'Bulk publish multiple offers',
    inputSchema: bulkPublishOfferInputSchema.shape,
    outputSchema: zodToJsonSchema(bulkPublishResponseSchema, {
      name: 'BulkPublishOfferResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.bulkPublishOffer(args)),
  }),
  defineTool({
    name: 'ebay_get_listing_fees',
    description: 'Get listing fees for offers before publishing',
    inputSchema: getListingFeesInputSchema.shape,
    outputSchema: zodToJsonSchema(listingFeesOutputSchema, {
      name: 'GetListingFeesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getListingFees(args)),
  }),
  defineTool({
    name: 'ebay_bulk_migrate_listing',
    description: 'Bulk migrate listings to the inventory model',
    inputSchema: bulkMigrateListingInputSchema.shape,
    outputSchema: zodToJsonSchema(bulkOfferResponseSchema, {
      name: 'BulkMigrateListingResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.bulkMigrateListing(args)),
  }),
  defineTool({
    name: 'ebay_get_sku_location_mapping',
    description:
      'Get inventory locations for a specific listing and SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    inputSchema: skuLocationMappingInputSchema.shape,
    outputSchema: zodToJsonSchema(locationMappingOutputSchema, {
      name: 'GetSkuLocationMappingResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.getSkuLocationMapping(args)),
  }),
  defineTool({
    name: 'ebay_create_or_replace_sku_location_mapping',
    description:
      'Create or replace SKU location mapping for a listing. Maps a SKU to fulfillment center locations.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: createOrReplaceSkuLocationMappingInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) =>
      Effect.runPromise(api.inventory.createOrReplaceSkuLocationMapping(args)),
  }),
  defineTool({
    name: 'ebay_delete_sku_location_mapping',
    description:
      'Delete SKU location mapping for a listing. Removes fulfillment center location mappings for a SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: skuLocationMappingInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) => Effect.runPromise(api.inventory.deleteSkuLocationMapping(args)),
  }),
  defineTool({
    name: 'ebay_publish_offer_by_inventory_item_group',
    description:
      'Publish an offer for an inventory item group (variation listing).\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: publishOfferByInventoryItemGroupInputSchema.shape,
    outputSchema: zodToJsonSchema(publishOfferOutputSchema, {
      name: 'PublishOfferByInventoryItemGroupResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    handler: (api, args) => Effect.runPromise(api.inventory.publishOfferByInventoryItemGroup(args)),
  }),
  defineTool({
    name: 'ebay_withdraw_offer_by_inventory_item_group',
    description:
      'Withdraw an offer for an inventory item group (variation listing).\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory',
    inputSchema: withdrawOfferByInventoryItemGroupInputSchema.shape,
    outputSchema: emptyOutputSchema,
    handler: (api, args) =>
      Effect.runPromise(api.inventory.withdrawOfferByInventoryItemGroup(args)),
  }),
];
