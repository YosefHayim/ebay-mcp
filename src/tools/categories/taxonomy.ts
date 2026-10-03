import { z } from 'zod';
import { categoryTreeIdInputSchema } from '@/schemas/taxonomy/categoryTree.js';
import { defineTool } from '@/tools/defineTool.js';
import { formatFileResult } from '@/tools/fileResult.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

/** Tool input for Taxonomy API getDefaultCategoryTreeId. */
const getDefaultCategoryTreeIdSchema = z.object({
  marketplaceId: z.string().describe('Marketplace ID (e.g., EBAY_US)'),
});

/** Tool input for Taxonomy API getCategoryTree. */
const getCategoryTreeSchema = z.object({
  categoryTreeId: z.string().describe('Category tree ID'),
});

/** Tool input for Taxonomy API getCategorySuggestions. */
const getCategorySuggestionsSchema = z.object({
  categoryTreeId: z.string().describe('Category tree ID'),
  query: z.string().describe('Search query for category suggestions'),
});

/** Tool input for Taxonomy API getItemAspectsForCategory. */
const getItemAspectsForCategorySchema = z.object({
  categoryTreeId: z.string().describe('Category tree ID'),
  categoryId: z.string().describe('Category ID'),
});

/** Taxonomy API tools for category trees, category suggestions, and compatibility metadata. */
export const taxonomyEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_default_category_tree_id',
    description: 'Get the default category tree ID for a marketplace',
    inputSchema: getDefaultCategoryTreeIdSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        categoryTreeId: { type: 'string' },
        categoryTreeVersion: { type: 'string' },
      },
      description: 'Default category tree ID response',
    },
    handler: (api, args) => Effect.runPromise(api.taxonomy.getDefaultCategoryTreeId(args)),
  }),
  defineTool({
    name: 'ebay_get_category_tree',
    description: 'Get category tree by ID',
    inputSchema: getCategoryTreeSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        categoryTreeId: { type: 'string' },
        categoryTreeVersion: { type: 'string' },
        rootCategoryNode: { type: 'object' },
      },
      description: 'Category tree details',
    },
    handler: (api, args) => Effect.runPromise(api.taxonomy.getCategoryTree(args)),
  }),
  defineTool({
    name: 'ebay_get_category_suggestions',
    description: 'Get category suggestions based on query',
    inputSchema: getCategorySuggestionsSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        categorySuggestions: { type: 'array' },
      },
      description: 'Category suggestions response',
    },
    handler: (api, args) => Effect.runPromise(api.taxonomy.getCategorySuggestions(args)),
  }),
  defineTool({
    name: 'ebay_get_item_aspects_for_category',
    description:
      'Identify required and recommended item specifics for a category before creating an inventory item or checking listing fees',
    inputSchema: getItemAspectsForCategorySchema.shape,
    outputSchema: {
      type: 'object',
      properties: {
        aspects: { type: 'array' },
      },
      description: 'Required and recommended item specifics for the category',
    },
    handler: (api, args) => Effect.runPromise(api.taxonomy.getItemAspectsForCategory(args)),
  }),
  defineTool({
    name: 'ebay_fetch_item_aspects',
    description:
      "Taxonomy API: download the aspects (item specifics) of every leaf category in a category tree as eBay's gzipped JSON file, returned as an embedded resource with eBay's content type (application/octet-stream); gunzip it to read the JSON. eBay notes the file can exceed 100 MB compressed: anything above 25 MiB fails with DownloadTooLargeError instead of being returned, so use ebay_get_item_aspects_for_category for per-category lookups, especially on large trees such as EBAY_US (0).",
    inputSchema: categoryTreeIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.taxonomy.fetchItemAspects(args)),
    formatResult: (file, args) =>
      formatFileResult(
        file,
        `ebay-taxonomy://category_tree/${encodeURIComponent(args.categoryTreeId)}/item_aspects`,
        `Taxonomy item aspects for category tree ${args.categoryTreeId}`,
      ),
  }),
  defineTool({
    name: 'ebay_get_expired_categories',
    description:
      'Taxonomy API: list expired leaf categories in a category tree with the active categories that replaced them (fromCategoryId to toCategoryId; several may merge into one). Only mapped (merged or split) categories are returned; an empty success (HTTP 204) means the tree has none.',
    inputSchema: categoryTreeIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.taxonomy.getExpiredCategories(args)),
  }),
];
