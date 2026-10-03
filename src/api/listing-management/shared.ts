import type { EbayApiClient } from '@/api/client/ebayApiClient.js';

export const INVENTORY_BASE_PATH = '/sell/inventory/v1';

/** Input accepted by getInventoryItems and getInventoryLocations. */
export interface InventoryPaginationInput {
  /** Number of records to return. */
  readonly limit?: number;
  /** Number of records or pages to skip, depending on the endpoint. */
  readonly offset?: number;
}
