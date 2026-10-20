import { findActiveItemsInputSchema, getItemDetailsInputSchema } from '@/schemas/other/browse.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

/**
 * Browse tools for public marketplace search data.
 *
 * Gated as family `browse` via `EBAY_MCP_TOOLS=browse`.
 */
export const browseEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_find_active_items',
    description:
      'Search active eBay listings marketplace-wide (not the seller\'s own inventory). Uses the Buy Browse API item_summary/search with the application access token eBay requires for Browse, minted from client credentials under the basic api_scope. Supports pagination (limit/offset), sort (price, -price, newlyListed, endingSoonest), category restriction, and condition/buying-option/price filters plus a raw Browse filter passthrough. eBay documents that a search without a buying-option filter returns only listings that still offer FIXED_PRICE, so pass buyingOptions: ["AUCTION"] (or ["AUCTION", "FIXED_PRICE"] for both) to be sure of reaching auctions that have taken a bid. Returns cleaned summaries: itemId (feed into ebay_get_item_details), title, price (an auction\'s current bid when there is no fixed price, with bidCount), condition, buyingOptions, seller and feedback, first advertised shipping cost, auction end date, and listing URL. `hasNext` is the authoritative pagination signal, derived from the `next` link in eBay\'s paged-collection response: page forward by advancing `offset` in whole `limit`-sized steps while `hasNext` is true, and stop as soon as it is false. Neither `total` nor a short page is a pagination signal — `total` is eBay\'s match count for the query and in live testing came back as 0 once `offset` ran past the available result window, and a page can hold fewer items than `limit` without being the last one.',
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
];
