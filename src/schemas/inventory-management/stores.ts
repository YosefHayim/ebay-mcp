import { z } from '@/utils/effectSchema.js';

const nonempty = z.string().min(1).regex(/\S/, 'Must contain a non-whitespace character');
const storeCategoryId = nonempty.describe(
  'eBay Store custom category ID from ebay_get_store_categories (not an eBay marketplace category ID)',
);
const categoryName = nonempty.describe(
  "Seller-specified store category name (max 35 characters); cannot be empty or 'Other'",
);

/** Empty input for Stores API reads that take no parameters (getStore, getStoreCategories, getStoreTasks). */
export const emptyStoreInputSchema = z.object({});

/** Input for Stores API getStoreTask. */
export const getStoreTaskInputSchema = z.object({
  taskId: nonempty.describe(
    'Store task ID returned as taskId by the add, rename, move, or delete store category tools',
  ),
});

/** Input for Stores API addStoreCategory; fields map 1:1 to AddStoreCategoryRequestType. */
export const addStoreCategoryInputSchema = z.object({
  categoryName,
  destinationParentCategoryId: nonempty
    .optional()
    .describe('Parent store category ID; omit or pass -999 to add a top-level category'),
  listingDestinationCategoryId: nonempty
    .optional()
    .describe(
      'When the parent is a leaf category with active listings, moves them to this store category; omitted, the new category inherits them',
    ),
});

/** Input for Stores API renameStoreCategory: path ID plus RenameStoreCategoryRequestType. */
export const renameStoreCategoryInputSchema = z.object({
  categoryId: storeCategoryId,
  categoryName,
});

/** Input for Stores API deleteStoreCategory: path ID plus DeleteStoreCategoryRequestType. */
export const deleteStoreCategoryInputSchema = z.object({
  categoryId: storeCategoryId,
  listingDestinationCategoryId: nonempty
    .optional()
    .describe(
      'Store category that receives active listings in or under the deleted category; omitted, eBay uses the Other category (ID 1)',
    ),
});

/** Input for Stores API moveStoreCategory; fields map 1:1 to MoveStoreCategoryRequestType. */
export const moveStoreCategoryInputSchema = z.object({
  categoryId: storeCategoryId,
  destinationParentCategoryId: nonempty.describe(
    'New parent store category ID; pass -999 to move the category to the top level',
  ),
  listingDestinationCategoryId: nonempty
    .optional()
    .describe(
      'Needed only when the moved leaf category has listings and stops being a leaf; its listings move to this store category',
    ),
});
