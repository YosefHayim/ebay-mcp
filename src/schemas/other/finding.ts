import { z } from 'zod';

/**
 * Finding API Schemas
 *
 * Zod input schemas for sold/completed listing search tools.
 */

/**
 * Validates input for ebay_find_completed_items (Finding API findCompletedItems).
 */
export const findCompletedItemsInputSchema = z.object({
  keywords: z
    .string()
    .min(1)
    .describe('Search keywords for sold/completed listings (e.g. "iphone 14 pro 256")'),
  maxResults: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum sold items to return (1–100). Defaults to 20.'),
  daysBack: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Only include items that ended within this many days (1–90).'),
});
