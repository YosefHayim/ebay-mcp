import type { McpServer } from '@modelcontextprotocol/server';
import { number, object, string } from 'zod';
import type { EbayClient } from './ebay-client.js';
import type {
  InventoryItems,
  InventoryItemWithSkuLocaleGroupid,
} from './ebay-openapi-types/sell-inventory.js';
import { jsonText } from './tool-text.js';

export class Inventory {
  private readonly client: EbayClient;

  constructor(client: EbayClient) {
    this.client = client;
  }

  readonly listItems = async (
    limit: number | null,
    offset: number | null,
  ): Promise<InventoryItems> => {
    const defaultPageLimit = 25;
    const defaultPageOffset = 0;
    const pageLimit = limit ?? defaultPageLimit;
    const pageOffset = offset ?? defaultPageOffset;
    const search = new URLSearchParams();
    const limitText = String(pageLimit);
    const offsetText = String(pageOffset);
    search.set('limit', limitText);
    search.set('offset', offsetText);
    const query = search.toString();
    const path = `/sell/inventory/v1/inventory_item?${query}`;
    const page = await this.client.getJson<InventoryItems>(path, 'user');
    return page;
  };

  readonly getItem = async (sku: string): Promise<InventoryItemWithSkuLocaleGroupid> => {
    const isMissing = sku == '';

    if (isMissing) {
      throw new Error('sku is missing');
    }

    const encodedSku = encodeURIComponent(sku);
    const path = `/sell/inventory/v1/inventory_item/${encodedSku}`;
    const inventoryDocument = await this.client.getJson<InventoryItemWithSkuLocaleGroupid>(
      path,
      'user',
    );
    return inventoryDocument;
  };
}

export function registerInventory(server: McpServer, client: EbayClient): void {
  const inventory = new Inventory(client);
  const maxPageLimit = 200;
  const limitField = number().int().min(1).max(maxPageLimit).optional();
  const offsetField = number().int().min(0).optional();
  const skuField = string().min(1);

  async function listInventoryItems(fields: { limit?: number; offset?: number }) {
    const limit = fields.limit ?? null;
    const offset = fields.offset ?? null;
    const page = await inventory.listItems(limit, offset);
    return jsonText(page);
  }

  async function getInventoryItem(fields: { sku: string }) {
    const { sku } = fields;
    const inventoryDocument = await inventory.getItem(sku);
    return jsonText(inventoryDocument);
  }

  server.registerTool(
    'ebay_list_inventory_items',
    {
      description: 'List inventory items for the signed-in user.',
      inputSchema: object({
        limit: limitField,
        offset: offsetField,
      }),
    },
    listInventoryItems,
  );

  server.registerTool(
    'ebay_get_inventory_item',
    {
      description: 'Get one inventory item by SKU.',
      inputSchema: object({
        sku: skuField,
      }),
    },
    getInventoryItem,
  );
}
