export const INVENTORY_BASE_PATH = "/sell/inventory/v1";

export interface InventoryPaginationInput {
	readonly limit?: number | undefined;
	readonly offset?: number | undefined;
}
