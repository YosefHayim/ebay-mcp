import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import {
  createListingSchema,
  endListingSchema,
  getActiveListingsSchema,
  getListingSchema,
  relistItemSchema,
  reviseListingSchema,
} from '@/utils/trading/trading.js';
import { Effect } from 'effect';

const AUCTION_ITEM_RULES =
  'AUCTION items take StartPrice as the opening bid, a day-count ListingDuration (Days_1/3/5/7/10; never GTC), Quantity 1, optional ReservePrice and BuyItNowPrice above the opening bid, and no Best Offer. FIXED_PRICE items take StartPrice as the price and ListingDuration GTC, and cannot carry ReservePrice or BuyItNowPrice. Payloads that mix the two formats are rejected before any eBay request.';

/** Trading API tools for fixed-price and auction listing operations. */
export const tradingEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_active_listings',
    description:
      'Get all active listings (fixed-price and auction) with SKU, quantity, price, and watch count.\n\nUses the Trading API (GetMyeBaySelling). Returns listings created via any method (UI, Trading API, or REST API); ListingType is Chinese for auctions and FixedPriceItem for fixed price.\n\nRequired: User OAuth token.',
    inputSchema: getActiveListingsSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.trading.getActiveListings(args)),
  }),
  defineTool({
    name: 'ebay_get_listing',
    description:
      'Get full details for a single listing by item ID.\n\nUses the Trading API (GetItem). Returns all listing fields including description, specifics, shipping, images, and ListingType (Chinese = auction, FixedPriceItem = fixed price).\n\nRequired: User OAuth token.',
    inputSchema: getListingSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.trading.getListing(args)),
  }),
  defineTool({
    name: 'ebay_create_listing',
    description: `Create a new fixed-price listing or auction.\n\nUses the Trading API: AddFixedPriceItem for format FIXED_PRICE (default) and AddItem with ListingType Chinese for format AUCTION. Requires complete item details.\n\n${AUCTION_ITEM_RULES} Reserve prices carry an eBay fee.\n\nRequired: User OAuth token.`,
    inputSchema: createListingSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.trading.createListing(args)),
  }),
  defineTool({
    name: 'ebay_revise_listing',
    description: `Revise an existing listing. Update quantity, price, title, description, or any other field.\n\nUses the Trading API: ReviseFixedPriceItem for format FIXED_PRICE (default) and ReviseItem for format AUCTION (check ListingType with ebay_get_listing when unsure; eBay limits auction revisions once bids exist). Only send the fields you want to change.\n\nExamples:\n- Update quantity: { "Quantity": 10 }\n- Update price: { "StartPrice": 14.99 }\n- Update title: { "Title": "New Title" }\n- Raise an auction reserve: { "format": "AUCTION", "fields": { "ReservePrice": 30 } }\n\n${AUCTION_ITEM_RULES}\n\nRequired: User OAuth token.`,
    inputSchema: reviseListingSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.trading.reviseListing(args)),
  }),
  defineTool({
    name: 'ebay_end_listing',
    description:
      'End/remove an active listing.\n\nUses the Trading API: EndFixedPriceItem for format FIXED_PRICE (default) and EndItem for format AUCTION. SellToHighBidder is only valid for auctions with bids.\n\nRequired: User OAuth token.',
    inputSchema: endListingSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.trading.endListing(args)),
  }),
  defineTool({
    name: 'ebay_relist_item',
    description: `Relist an ended listing, optionally with modifications.\n\nUses the Trading API: RelistFixedPriceItem for format FIXED_PRICE (default) and RelistItem for format AUCTION.\n\n${AUCTION_ITEM_RULES}\n\nRequired: User OAuth token.`,
    inputSchema: relistItemSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.trading.relistItem(args)),
  }),
];
