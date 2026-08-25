import { findActiveItemsInputSchema, getItemDetailsInputSchema } from '@/schemas/other/browse.js';
import { findCompletedItemsInputSchema } from '@/schemas/other/finding.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

/**
 * Browse / Finding tools for public marketplace search data.
 *
 * Gated as family `browse` via `EBAY_MCP_TOOLS=browse`.
 */
export const browseEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_find_active_items',
    description:
      "Search active eBay listings marketplace-wide (not the seller's own inventory). Uses the Buy Browse API item_summary/search with the app or user access token under the basic api_scope. Supports pagination (limit/offset), sort (price, -price, newlyListed, endingSoonest), category restriction, and condition/buying-option/price filters plus a raw Browse filter passthrough. Returns cleaned summaries: itemId (feed into ebay_get_item_details), title, price (an auction's current bid when there is no fixed price, with bidCount), condition, buyingOptions, seller and feedback, first advertised shipping cost, auction end date, and listing URL. `total` is eBay's match count for the query; it comes back as 0 once `offset` runs past the available result window, so a zero total at a high offset means the end of the results rather than an empty search. The active-listing counterpart of ebay_find_completed_items.",
    inputSchema: findActiveItemsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.browse.searchActiveItems(args)),
  }),
  defineTool({
    name: 'ebay_get_item_details',
    description:
      'Get full detail for one active eBay listing by its Browse RESTful item id (from ebay_find_active_items, e.g. "v1|110587051479|0"). Uses the Buy Browse API item resource. Returns cleaned details: title, price, condition and condition description, short description, category path, buying options, seller and feedback, estimated available quantity, returns-accepted flag, item location, auction end date, images, and listing URL. For the seller\'s own listings use ebay_get_listing (Trading) instead.',
    inputSchema: getItemDetailsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.browse.getItemDetails(args)),
  }),
  defineTool({
    name: 'ebay_find_completed_items',
    description:
      'Search eBay sold/completed listings for pricing research (sold comps). Uses the Finding API findCompletedItems operation with app credentials (SECURITY-APPNAME / EBAY_CLIENT_ID). Returns cleaned sold items: itemId, title, price, shippingCost, soldDate, condition, and listingUrl. Useful for market price research before listing or repricing. App credentials are sufficient for this public search data when OAuth is available.',
    inputSchema: findCompletedItemsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.finding.findCompletedItems(args)),
  }),
];
