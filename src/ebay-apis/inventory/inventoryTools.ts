import { z } from "zod";
import type {
	BulkCreateOrReplaceInventoryItemRequest,
	BulkGetInventoryItemRequest,
	BulkMigrateListingRequest,
	BulkPublishOfferRequest,
	BulkUpdatePriceQuantityRequest,
	CreateInventoryLocationRequest,
	GetListingFeesRequest,
	InventoryItemGroup,
	LocationMapping,
	ProductCompatibility,
	PublishOfferByInventoryItemGroupRequest,
	UpdateInventoryLocationRequest,
	WithdrawOfferByInventoryItemGroupRequest,
} from "@/ebay-apis/inventory/inventoryApi.js";
import {
	bulkInventoryItemResponseSchema,
	bulkOfferRequestSchema,
	bulkOfferResponseSchema,
	bulkPublishResponseSchema,
	createInventoryItemOutputSchema,
	createInventoryLocationOutputSchema,
	createOfferOutputSchema,
	getInventoryItemGroupOutputSchema,
	getInventoryItemOutputSchema,
	getInventoryItemsOutputSchema,
	getInventoryLocationsOutputSchema,
	getOffersBySkusOutputSchema,
	getOffersInputSchema,
	getOffersOutputSchema,
	getProductCompatibilityOutputSchema,
	inventoryItemSchema,
	offerResponseSchema,
	offerSchema,
	publishOfferOutputSchema,
	updateOfferBodySchema,
} from "@/ebay-apis/inventory/inventorySchemas.js";
import { MarketplaceId } from "@/shared/ebayEnums.js";
import { defineTool } from "@/tool-registry/defineTool.js";
import type { ToolEntry } from "@/tool-registry/registry.js";
import type { OutputArgs } from "@/tool-registry/types.js";
import {
	mapInventoryItemsToTable,
	mapInventoryItemToCard,
	mapLocationsToTable,
	mapOffersToTable,
	mapOfferToCard,
} from "@/tool-registry/ui/maps.js";

const emptyOutputSchema = {
	type: "object",
	properties: {},
	description: "No content returned on success",
} as OutputArgs;

const generatedBodySchema = <Body>(description: string) =>
	z
		.custom<Body>(
			(value) =>
				value !== null && typeof value === "object" && !Array.isArray(value),
			{
				message: description,
			},
		)
		.describe(description);

const skuInputSchema = z.object({
	sku: z.string().describe("The seller-defined SKU"),
});

const inventoryPaginationInputSchema = z.object({
	limit: z.number().optional().describe("Number of records to return"),
	offset: z.number().optional().describe("Number of records to skip"),
});

const createOrReplaceInventoryItemInputSchema = skuInputSchema.extend({
	body: inventoryItemSchema,
});

const bulkCreateOrReplaceInventoryItemInputSchema = z.object({
	body: generatedBodySchema<BulkCreateOrReplaceInventoryItemRequest>(
		"Generated BulkInventoryItem request body",
	),
});

const bulkGetInventoryItemInputSchema = z.object({
	body: generatedBodySchema<BulkGetInventoryItemRequest>(
		"Generated BulkGetInventoryItem request body",
	),
});

const bulkUpdatePriceQuantityInputSchema = z.object({
	body: generatedBodySchema<BulkUpdatePriceQuantityRequest>(
		"Generated BulkPriceQuantity request body",
	),
});

const createOrReplaceProductCompatibilityInputSchema = skuInputSchema.extend({
	body: generatedBodySchema<ProductCompatibility>(
		"Generated Compatibility request body",
	),
});

const inventoryItemGroupKeyInputSchema = z.object({
	inventoryItemGroupKey: z.string().describe("The inventory item group key"),
});

const createOrReplaceInventoryItemGroupInputSchema =
	inventoryItemGroupKeyInputSchema.extend({
		body: generatedBodySchema<InventoryItemGroup>(
			"Generated InventoryItemGroup request body",
		),
	});

const merchantLocationKeyInputSchema = z.object({
	merchantLocationKey: z.string().describe("The merchant location key"),
});

const createInventoryLocationInputSchema =
	merchantLocationKeyInputSchema.extend({
		body: generatedBodySchema<CreateInventoryLocationRequest>(
			"Generated InventoryLocationFull request body",
		),
	});

const updateInventoryLocationInputSchema =
	merchantLocationKeyInputSchema.extend({
		body: generatedBodySchema<UpdateInventoryLocationRequest>(
			"Generated InventoryLocation request body",
		),
	});

const getOffersBySkusInputSchema = z.object({
	skus: z
		.array(z.string().min(1).max(50))
		.min(1)
		.max(25)
		.describe(
			"1-25 seller SKUs; exact duplicates are queried once in first-occurrence order",
		),
	format: z.string().optional().describe("Filter by listing format"),
	marketplaceId: z
		.nativeEnum(MarketplaceId)
		.optional()
		.describe("Filter by marketplace ID"),
});
const offerIdInputSchema = z.object({
	offerId: z.string().describe("The offer ID"),
});

const createOfferInputSchema = z.object({
	body: offerSchema,
});

const updateOfferInputSchema = offerIdInputSchema.extend({
	body: updateOfferBodySchema,
});

const bulkCreateOfferInputSchema = z.object({
	body: bulkOfferRequestSchema,
});

const bulkPublishOfferInputSchema = z.object({
	body: generatedBodySchema<BulkPublishOfferRequest>(
		"Generated BulkOffer request body",
	),
});

const getListingFeesInputSchema = z.object({
	body: generatedBodySchema<GetListingFeesRequest>(
		"Generated OfferKeysWithId request body",
	),
});

const bulkMigrateListingInputSchema = z.object({
	body: generatedBodySchema<BulkMigrateListingRequest>(
		"Generated BulkMigrateListing request body",
	),
});

const skuLocationMappingInputSchema = z.object({
	listingId: z.string().describe("The listing ID"),
	sku: z.string().describe("The seller-defined SKU"),
});

const locationMappingSchema = z
	.object({
		locations: z
			.array(
				z
					.object({
						merchantLocationKey: z
							.string()
							.describe("The fulfillment center location key"),
					})
					.passthrough(),
			)
			.optional(),
	})
	.passthrough();

const createOrReplaceSkuLocationMappingInputSchema =
	skuLocationMappingInputSchema.extend({
		body: generatedBodySchema<LocationMapping>(
			"Generated LocationMapping request body",
		),
	});

const publishOfferByInventoryItemGroupInputSchema = z.object({
	body: generatedBodySchema<PublishOfferByInventoryItemGroupRequest>(
		"Generated PublishByInventoryItemGroup body",
	),
});

const withdrawOfferByInventoryItemGroupInputSchema = z.object({
	body: generatedBodySchema<WithdrawOfferByInventoryItemGroupRequest>(
		"Generated WithdrawByInventoryItemGroup body",
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
		name: "ebay_get_inventory_items",
		description:
			"Retrieve all inventory items for the seller.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
		inputSchema: inventoryPaginationInputSchema.shape,
		outputSchema: getInventoryItemsOutputSchema,
		handler: (api, args) => api.inventory.getInventoryItems(args),
		ui: { archetype: "table", map: mapInventoryItemsToTable },
	}),
	defineTool({
		name: "ebay_get_inventory_item",
		description:
			"Get a specific inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
		inputSchema: skuInputSchema.shape,
		outputSchema: getInventoryItemOutputSchema,
		handler: (api, args) => api.inventory.getInventoryItem(args),
		ui: { archetype: "card", map: mapInventoryItemToCard },
	}),
	defineTool({
		name: "ebay_create_or_replace_inventory_item",
		description:
			"Create or replace an inventory item.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory",
		inputSchema: createOrReplaceInventoryItemInputSchema.shape,
		outputSchema: createInventoryItemOutputSchema,
		handler: (api, args) => api.inventory.createOrReplaceInventoryItem(args),
	}),
	defineTool({
		name: "ebay_delete_inventory_item",
		description:
			"Delete an inventory item by SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory",
		inputSchema: skuInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.deleteInventoryItem(args),
	}),
	defineTool({
		name: "ebay_bulk_create_or_replace_inventory_item",
		description: "Bulk create or replace multiple inventory items",
		inputSchema: bulkCreateOrReplaceInventoryItemInputSchema.shape,
		outputSchema: bulkInventoryItemResponseSchema,
		handler: (api, args) =>
			api.inventory.bulkCreateOrReplaceInventoryItem(args),
	}),
	defineTool({
		name: "ebay_bulk_get_inventory_item",
		description: "Bulk get multiple inventory items",
		inputSchema: bulkGetInventoryItemInputSchema.shape,
		outputSchema: bulkInventoryItemResponseSchema,
		handler: (api, args) => api.inventory.bulkGetInventoryItem(args),
	}),
	defineTool({
		name: "ebay_bulk_update_price_quantity",
		description: "Bulk update price and quantity for multiple offers",
		inputSchema: bulkUpdatePriceQuantityInputSchema.shape,
		outputSchema: bulkOfferResponseSchema,
		handler: (api, args) => api.inventory.bulkUpdatePriceQuantity(args),
	}),
	defineTool({
		name: "ebay_get_product_compatibility",
		description: "Get product compatibility information for an inventory item",
		inputSchema: skuInputSchema.shape,
		outputSchema: getProductCompatibilityOutputSchema,
		handler: (api, args) => api.inventory.getProductCompatibility(args),
	}),
	defineTool({
		name: "ebay_create_or_replace_product_compatibility",
		description:
			"Create or replace product compatibility for an inventory item",
		inputSchema: createOrReplaceProductCompatibilityInputSchema.shape,
		outputSchema: createInventoryItemOutputSchema,
		handler: (api, args) =>
			api.inventory.createOrReplaceProductCompatibility(args),
	}),
	defineTool({
		name: "ebay_delete_product_compatibility",
		description: "Delete product compatibility for an inventory item",
		inputSchema: skuInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.deleteProductCompatibility(args),
	}),
	defineTool({
		name: "ebay_get_inventory_item_group",
		description: "Get an inventory item group (variation group)",
		inputSchema: inventoryItemGroupKeyInputSchema.shape,
		outputSchema: getInventoryItemGroupOutputSchema,
		handler: (api, args) => api.inventory.getInventoryItemGroup(args),
	}),
	defineTool({
		name: "ebay_create_or_replace_inventory_item_group",
		description: "Create or replace an inventory item group",
		inputSchema: createOrReplaceInventoryItemGroupInputSchema.shape,
		outputSchema: createInventoryItemOutputSchema,
		handler: (api, args) =>
			api.inventory.createOrReplaceInventoryItemGroup(args),
	}),
	defineTool({
		name: "ebay_delete_inventory_item_group",
		description: "Delete an inventory item group",
		inputSchema: inventoryItemGroupKeyInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.deleteInventoryItemGroup(args),
	}),
	defineTool({
		name: "ebay_get_inventory_locations",
		description: "Get all inventory locations",
		inputSchema: inventoryPaginationInputSchema.shape,
		outputSchema: getInventoryLocationsOutputSchema,
		handler: (api, args) => api.inventory.getInventoryLocations(args),
		ui: { archetype: "table", map: mapLocationsToTable },
	}),
	defineTool({
		name: "ebay_get_inventory_location",
		description: "Get a specific inventory location",
		inputSchema: merchantLocationKeyInputSchema.shape,
		outputSchema: createInventoryLocationOutputSchema,
		handler: (api, args) => api.inventory.getInventoryLocation(args),
	}),
	defineTool({
		name: "ebay_create_inventory_location",
		description: "Create an inventory location",
		inputSchema: createInventoryLocationInputSchema.shape,
		outputSchema: createInventoryLocationOutputSchema,
		handler: (api, args) => api.inventory.createInventoryLocation(args),
	}),
	defineTool({
		name: "ebay_delete_inventory_location",
		description: "Delete an inventory location",
		inputSchema: merchantLocationKeyInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.deleteInventoryLocation(args),
	}),
	defineTool({
		name: "ebay_disable_inventory_location",
		description: "Disable an inventory location",
		inputSchema: merchantLocationKeyInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.disableInventoryLocation(args),
	}),
	defineTool({
		name: "ebay_enable_inventory_location",
		description: "Enable an inventory location",
		inputSchema: merchantLocationKeyInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.enableInventoryLocation(args),
	}),
	defineTool({
		name: "ebay_update_inventory_location",
		description: "Update an inventory location",
		inputSchema: updateInventoryLocationInputSchema.shape,
		outputSchema: createInventoryLocationOutputSchema,
		handler: (api, args) => api.inventory.updateInventoryLocation(args),
	}),
	defineTool({
		name: "ebay_get_offers",
		description:
			"Get offers for one seller-defined SKU. To enumerate offers across SKUs, call ebay_get_inventory_items first, then call this tool once per SKU.",
		inputSchema: getOffersInputSchema.shape,
		outputSchema: getOffersOutputSchema,
		handler: (api, args) => api.inventory.getOffers(args),
		ui: { archetype: "table", map: mapOffersToTable },
	}),
	defineTool({
		name: "ebay_get_offers_by_skus",
		description:
			"Get offers for 1-25 SKUs. Exact duplicates are queried once, at most 3 eBay requests run concurrently, and every SKU has its own success or failure result.",
		inputSchema: getOffersBySkusInputSchema.shape,
		outputSchema: getOffersBySkusOutputSchema,
		handler: (api, args) => api.inventory.getOffersBySkus(args),
	}),
	defineTool({
		name: "ebay_get_offer",
		description: "Get a specific offer by ID",
		inputSchema: offerIdInputSchema.shape,
		outputSchema: offerResponseSchema,
		handler: (api, args) => api.inventory.getOffer(args),
		ui: { archetype: "card", map: mapOfferToCard },
	}),
	defineTool({
		name: "ebay_create_offer",
		description:
			"Create a new offer (unpublished listing draft) for an inventory item SKU.\n\nFIXED_PRICE offers take pricingSummary.price and listingDuration GTC. AUCTION offers take pricingSummary.auctionStartPrice (opening bid), an optional auctionReservePrice above it, an optional pricingSummary.price as Buy It Now (at least 30% above the opening bid, and not together with Best Offer), a day-count listingDuration (DAYS_1/3/5/7/10, or DAYS_14/21/30 where the category allows; never GTC), availableQuantity omitted or 1, and no per-buyer limit or eBay Plus. Do not add listingStartDate unless the user asked for a scheduled start (it can incur a fee). Bodies that mix the two formats are rejected before any eBay request.\n\nCheck ebay_get_listing_type_policies for the formats and durations the category allows, then ebay_get_listing_fees (reserve prices carry a fee) before ebay_publish_offer.",
		inputSchema: createOfferInputSchema.shape,
		outputSchema: createOfferOutputSchema,
		handler: (api, args) => api.inventory.createOffer(args),
	}),
	defineTool({
		name: "ebay_update_offer",
		description:
			"Update an existing offer. Send the full offer details; the format itself cannot change. Auction fields (auctionStartPrice, auctionReservePrice, day-count listingDuration) follow the same rules as ebay_create_offer, and a reserve price must stay above the starting bid.",
		inputSchema: updateOfferInputSchema.shape,
		outputSchema: offerResponseSchema,
		handler: (api, args) => api.inventory.updateOffer(args),
	}),
	defineTool({
		name: "ebay_delete_offer",
		description: "Delete an offer",
		inputSchema: offerIdInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.deleteOffer(args),
	}),
	defineTool({
		name: "ebay_publish_offer",
		description: "Publish an offer to create a listing",
		inputSchema: offerIdInputSchema.shape,
		outputSchema: publishOfferOutputSchema,
		handler: (api, args) => api.inventory.publishOffer(args),
	}),
	defineTool({
		name: "ebay_withdraw_offer",
		description: "Withdraw a published offer",
		inputSchema: offerIdInputSchema.shape,
		outputSchema: publishOfferOutputSchema,
		handler: (api, args) => api.inventory.withdrawOffer(args),
	}),
	defineTool({
		name: "ebay_bulk_create_offer",
		description:
			"Bulk create up to 25 offers in one request. Each request follows the ebay_create_offer rules: FIXED_PRICE offers take pricingSummary.price and listingDuration GTC. AUCTION offers take pricingSummary.auctionStartPrice (opening bid), an optional auctionReservePrice above it, an optional pricingSummary.price as Buy It Now (at least 30% above the opening bid, and not together with Best Offer), a day-count listingDuration (DAYS_1/3/5/7/10, or DAYS_14/21/30 where the category allows; never GTC), availableQuantity omitted or 1, and no per-buyer limit or eBay Plus. Do not add listingStartDate unless the user asked for a scheduled start (it can incur a fee). Bodies that mix the two formats are rejected before any eBay request.",
		inputSchema: bulkCreateOfferInputSchema.shape,
		outputSchema: bulkOfferResponseSchema,
		handler: (api, args) => api.inventory.bulkCreateOffer(args),
	}),
	defineTool({
		name: "ebay_bulk_publish_offer",
		description: "Bulk publish multiple offers",
		inputSchema: bulkPublishOfferInputSchema.shape,
		outputSchema: bulkPublishResponseSchema,
		handler: (api, args) => api.inventory.bulkPublishOffer(args),
	}),
	defineTool({
		name: "ebay_get_listing_fees",
		description: "Get listing fees for offers before publishing",
		inputSchema: getListingFeesInputSchema.shape,
		outputSchema: listingFeesOutputSchema,
		handler: (api, args) => api.inventory.getListingFees(args),
	}),
	defineTool({
		name: "ebay_bulk_migrate_listing",
		description: "Bulk migrate listings to the inventory model",
		inputSchema: bulkMigrateListingInputSchema.shape,
		outputSchema: bulkOfferResponseSchema,
		handler: (api, args) => api.inventory.bulkMigrateListing(args),
	}),
	defineTool({
		name: "ebay_get_sku_location_mapping",
		description:
			"Get inventory locations for a specific listing and SKU.\n\nRequired OAuth Scope: sell.inventory.readonly or sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
		inputSchema: skuLocationMappingInputSchema.shape,
		outputSchema: locationMappingOutputSchema,
		handler: (api, args) => api.inventory.getSkuLocationMapping(args),
	}),
	defineTool({
		name: "ebay_create_or_replace_sku_location_mapping",
		description:
			"Create or replace SKU location mapping for a listing. Maps a SKU to fulfillment center locations.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory",
		inputSchema: createOrReplaceSkuLocationMappingInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) =>
			api.inventory.createOrReplaceSkuLocationMapping(args),
	}),
	defineTool({
		name: "ebay_delete_sku_location_mapping",
		description:
			"Delete SKU location mapping for a listing. Removes fulfillment center location mappings for a SKU.\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory",
		inputSchema: skuLocationMappingInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) => api.inventory.deleteSkuLocationMapping(args),
	}),
	defineTool({
		name: "ebay_publish_offer_by_inventory_item_group",
		description:
			"Publish an offer for an inventory item group (variation listing).\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory",
		inputSchema: publishOfferByInventoryItemGroupInputSchema.shape,
		outputSchema: publishOfferOutputSchema,
		handler: (api, args) =>
			api.inventory.publishOfferByInventoryItemGroup(args),
	}),
	defineTool({
		name: "ebay_withdraw_offer_by_inventory_item_group",
		description:
			"Withdraw an offer for an inventory item group (variation listing).\n\nRequired OAuth Scope: sell.inventory\nMinimum Scope: https://api.ebay.com/oauth/api_scope/sell.inventory",
		inputSchema: withdrawOfferByInventoryItemGroupInputSchema.shape,
		outputSchema: emptyOutputSchema,
		handler: (api, args) =>
			api.inventory.withdrawOfferByInventoryItemGroup(args),
	}),
];
