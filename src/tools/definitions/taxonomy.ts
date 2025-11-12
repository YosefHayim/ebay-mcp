import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}
export const taxonomyTools: ToolDefinition[] = [
  {
    name: 'ebay_get_default_category_tree_id',
    description: 'Get the default category tree ID for a marketplace',
    inputSchema: {
      marketplaceId: z.string().describe('Marketplace ID (e.g., EBAY_US)'),
    },
  },
  {
    name: 'ebay_get_category_tree',
    description: 'Get category tree by ID',
    inputSchema: {
      categoryTreeId: z.string().describe('Category tree ID'),
    },
  },
  {
    name: 'ebay_get_category_suggestions',
    description: 'Get category suggestions based on query',
    inputSchema: {
      categoryTreeId: z.string().describe('Category tree ID'),
      query: z.string().describe('Search query for category suggestions'),
    },
  },
  {
    name: 'ebay_get_item_aspects_for_category',
    description: 'Get item aspects for a specific category',
    inputSchema: {
      categoryTreeId: z.string().describe('Category tree ID'),
      categoryId: z.string().describe('Category ID'),
    },
  },
];
