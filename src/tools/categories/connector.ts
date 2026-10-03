import { z } from 'zod';
import { Effect } from 'effect';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';

const connectorSearchInputSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().optional().describe('Maximum number of results'),
});

const connectorFetchInputSchema = z.object({
  id: z.string().describe('Item SKU'),
});

/**
 * OpenAI ChatGPT connector tools.
 *
 * The ChatGPT connector protocol requires exactly two tools named `search` and
 * `fetch`. The registry prepends them ahead of the eBay API tools, and their
 * names are fixed by the connector spec rather than by an eBay API domain.
 */
export const connectorEntries: ToolEntry[] = [
  defineTool({
    name: 'search',
    description: 'Search for eBay inventory items',
    inputSchema: connectorSearchInputSchema.shape,
    title: 'Search',
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    annotations: {
      title: 'Search',
      readOnlyHint: true,
    },
    _meta: {
      category: 'chat',
      version: '1.0.0',
    },
    handler: (api, args) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const requestedLimit = args.limit;
          const limit =
            typeof requestedLimit === 'number' && Number.isFinite(requestedLimit)
              ? Math.max(Math.floor(requestedLimit), 1)
              : 10;
          const query = args.query.toLowerCase().trim();
          const pageSize = query ? Math.min(Math.max(limit, 50), 200) : limit;
          const matches: {
            product?: { title?: string };
            sku: string;
          }[] = [];
          let offset = 0;

          while (matches.length < limit) {
            const inventoryPage = yield* api.inventory.getInventoryItems({
              limit: pageSize,
              offset,
            });
            const pageItems = inventoryPage.inventoryItems ?? [];
            if (pageItems.length === 0) {
              break;
            }

            // Only items with valid SKUs can be passed to getInventoryItem later.
            const itemsWithSku = pageItems.filter(
              (inventoryItem): inventoryItem is typeof inventoryItem & { sku: string } =>
                typeof inventoryItem.sku === 'string' && inventoryItem.sku.trim() !== '',
            );

            const filtered = query
              ? itemsWithSku.filter((inventoryItem) =>
                  (inventoryItem.product?.title ?? '').toLowerCase().includes(query),
                )
              : itemsWithSku;

            matches.push(...filtered);
            offset += pageSize;

            const total = (inventoryPage as { total?: number }).total;
            if (typeof total === 'number' && offset >= total) {
              break;
            }

            if (!query || pageItems.length < pageSize) {
              break;
            }
          }

          const results = matches.slice(0, limit).map((match) => ({
            id: match.sku,
            title: match.product?.title ?? '',
            url: 'https://www.ebay.com/', // Placeholder: eBay does not expose a canonical item URL here.
          }));

          // The ChatGPT connector spec requires a single text content block.
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ results }),
              },
            ],
          };
        }),
      ),
  }),
  defineTool({
    name: 'fetch',
    description: 'Fetch a specific eBay inventory item by SKU',
    inputSchema: connectorFetchInputSchema.shape,
    title: 'Fetch',
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
    annotations: {
      title: 'Fetch',
      readOnlyHint: true,
    },
    _meta: {
      category: 'chat',
      version: '1.0.0',
    },
    handler: (api, args) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const sku = args.id;
          const inventoryItem = yield* api.inventory.getInventoryItem({ sku });

          const connectorDocument = {
            id: sku,
            title: inventoryItem.product?.title ?? '',
            text: inventoryItem.product?.description ?? '',
            url: 'https://www.ebay.com/', // Placeholder: eBay does not expose a canonical item URL here.
            metadata: {
              source: 'ebay_inventory',
              aspects: inventoryItem.product?.aspects,
              condition: inventoryItem.condition,
            },
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(connectorDocument),
              },
            ],
          };
        }),
      ),
  }),
];
