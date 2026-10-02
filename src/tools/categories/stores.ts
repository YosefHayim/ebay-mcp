import {
  addStoreCategoryInputSchema,
  deleteStoreCategoryInputSchema,
  emptyStoreInputSchema,
  getStoreTaskInputSchema,
  moveStoreCategoryInputSchema,
  renameStoreCategoryInputSchema,
} from '@/schemas/inventory-management/stores.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

const STORE_NOTE = 'Requires an active eBay Store subscription (sell.stores scope).';
const CATEGORY_TASK_NOTE =
  'Asynchronous: eBay accepts the change and returns { taskId, location } from the Location header; poll ebay_get_store_task with taskId (or ebay_get_store_tasks) until the task is COMPLETED or FAILED. Only one store category change (add, rename, move, or delete) can be in flight at a time; eBay rejects a new change until the previous task finishes.';

/** Stores API tools for eBay Store details, store categories, and category tasks. */
export const storesEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_store',
    description: `Get the seller's eBay Store details (Stores API getStore): store name, URL, URL path, description, logo, and last opened time. ${STORE_NOTE}`,
    inputSchema: emptyStoreInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.stores.getStore(args)),
  }),
  defineTool({
    name: 'ebay_get_store_categories',
    description: `Get the eBay Store's custom category hierarchy (Stores API getStoreCategories): categoryId, categoryName, level, order, and childrenCategories for up to three levels. Use these store category IDs (not eBay marketplace category IDs) with the store category tools. ${STORE_NOTE}`,
    inputSchema: emptyStoreInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.stores.getStoreCategories(args)),
  }),
  defineTool({
    name: 'ebay_add_store_category',
    description: `Add one custom category to the eBay Store (Stores API addStoreCategory). Pass categoryName and optionally destinationParentCategoryId (omit or -999 for top level) and listingDestinationCategoryId. ${CATEGORY_TASK_NOTE} ${STORE_NOTE}`,
    inputSchema: addStoreCategoryInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.stores.addStoreCategory(args)),
  }),
  defineTool({
    name: 'ebay_rename_store_category',
    description: `Rename one custom eBay Store category (Stores API renameStoreCategory). Pass the store categoryId and the new categoryName. ${CATEGORY_TASK_NOTE} ${STORE_NOTE}`,
    inputSchema: renameStoreCategoryInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.stores.renameStoreCategory(args)),
  }),
  defineTool({
    name: 'ebay_move_store_category',
    description: `Move one custom eBay Store category under a new parent (Stores API moveStoreCategory). Pass categoryId, destinationParentCategoryId (-999 for top level), and listingDestinationCategoryId when a leaf category with listings stops being a leaf. ${CATEGORY_TASK_NOTE} ${STORE_NOTE}`,
    inputSchema: moveStoreCategoryInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.stores.moveStoreCategory(args)),
  }),
  defineTool({
    name: 'ebay_delete_store_category',
    description: `Delete one custom eBay Store category (Stores API deleteStoreCategory). Pass the store categoryId and optionally listingDestinationCategoryId; active listings in or under the category move there, or to the store's Other category (ID 1) when omitted. Irreversible. ${CATEGORY_TASK_NOTE} ${STORE_NOTE}`,
    inputSchema: deleteStoreCategoryInputSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.stores.deleteStoreCategory(args)),
  }),
  defineTool({
    name: 'ebay_get_store_task',
    description: `Get the status of one asynchronous eBay Store category task (Stores API getStoreTask) by the taskId returned from ebay_add_store_category, ebay_rename_store_category, ebay_move_store_category, or ebay_delete_store_category. Returns task id, type, status, and message. ${STORE_NOTE}`,
    inputSchema: getStoreTaskInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.stores.getStoreTask(args)),
  }),
  defineTool({
    name: 'ebay_get_store_tasks',
    description: `List the status of all asynchronous eBay Store tasks (Stores API getStoreTasks). Every task ends as COMPLETED or FAILED within 24 hours; use it to check whether a store category change is still in flight. ${STORE_NOTE}`,
    inputSchema: emptyStoreInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.stores.getStoreTasks(args)),
  }),
];
