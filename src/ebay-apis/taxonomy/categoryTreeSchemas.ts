import { z } from 'zod';

/** Input for Taxonomy API methods addressed only by category tree (fetchItemAspects, getExpiredCategories). */
export const categoryTreeIdInputSchema = z.object({
  categoryTreeId: z
    .string()
    .min(1)
    .describe('Category tree ID from ebay_get_default_category_tree_id, e.g. 0 for EBAY_US'),
});
