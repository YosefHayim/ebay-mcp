import { z } from '@/utils/effectSchema.js';

/**
 * Browse API Schemas
 *
 * Effect-backed input schemas for active-listing marketplace search tools.
 */

/**
 * Validates input for ebay_find_active_items (Browse item_summary/search).
 */
export const findActiveItemsInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe('Search keywords for active listings (e.g. "iphone 14 pro 256")'),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum items to return (1–200). Defaults to 20.'),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Zero-based result offset for pagination. Must be zero or a multiple of limit (eBay pages in whole limit-sized steps). Defaults to 0.',
    ),
  sort: z
    .enum(['price', '-price', 'newlyListed', 'endingSoonest'])
    .optional()
    .describe(
      'Sort order: "price" (asc, price+shipping), "-price" (desc), "newlyListed", or "endingSoonest". Omit for best-match relevance.',
    ),
  categoryIds: z
    .string()
    .min(1)
    .optional()
    .describe('Comma-separated eBay category ids to restrict the search (e.g. "9355").'),
  conditions: z
    .array(z.string())
    .optional()
    .describe('Condition filters, e.g. ["NEW"], ["USED"], ["CERTIFIED_REFURBISHED"].'),
  buyingOptions: z
    .array(z.string())
    .optional()
    .describe(
      'Buying option filters, e.g. ["FIXED_PRICE"], ["AUCTION"], ["BEST_OFFER"]. eBay documents that a search without this filter returns only listings that still offer FIXED_PRICE, and an auction loses that option once it takes a qualifying bid, so pass ["AUCTION"] (or ["AUCTION", "FIXED_PRICE"] for both) to be sure of reaching auctions.',
    ),
  priceMin: z.number().min(0).optional().describe('Minimum price (inclusive).'),
  priceMax: z.number().min(0).optional().describe('Maximum price (inclusive).'),
  priceCurrency: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Currency for priceMin/priceMax as a 3-letter code (e.g. "USD", "EUR"). Defaults to USD when a bound is set. eBay converts across currencies, but silently drops the entire price filter when the code is not one it recognises: an unsupported code returns unfiltered results rather than an error.',
    ),
  filter: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Raw Browse filter expression appended to the generated filters for advanced cases (e.g. "sellers:{user1|user2}").',
    ),
});

/**
 * Validates input for ebay_get_item_details (Browse getItem).
 */
export const getItemDetailsInputSchema = z.object({
  itemId: z
    .string()
    .min(1)
    .describe('Browse RESTful item id from ebay_find_active_items (e.g. "v1|110587051479|0").'),
});
