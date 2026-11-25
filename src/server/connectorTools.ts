import { z } from "zod";
import { defineTool } from "@/tool-registry/defineTool.js";
import type { ToolEntry } from "@/tool-registry/registry.js";

const connectorSearchInputSchema = z.object({
	query: z.string().describe("Search query"),
	limit: z.number().optional().describe("Maximum number of results"),
});

const connectorFetchInputSchema = z.object({
	id: z.string().describe("Item SKU"),
});

function readSearchLimit(requestedLimit: unknown): number {
	const isNotNumber = typeof requestedLimit != "number";

	if (isNotNumber) return 10;

	const isNotFinite = Number.isFinite(requestedLimit) == false;

	if (isNotFinite) return 10;

	return Math.max(Math.floor(requestedLimit), 1);
}

function isPastListedTotal(total: unknown, nextOffset: number): boolean {
	const isNotNumber = typeof total != "number";

	if (isNotNumber) return false;

	const isPastEnd = nextOffset >= total;

	if (isPastEnd) return true;

	return false;
}

export const connectorEntries: ToolEntry[] = [
	defineTool({
		name: "search",
		description: "Search for eBay inventory items",
		inputSchema: connectorSearchInputSchema.shape,
		title: "Search",
		outputSchema: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				data: { type: "object" },
			},
		},
		annotations: {
			title: "Search",
			readOnlyHint: true,
		},
		_meta: {
			category: "chat",
			version: "1.0.0",
		},
		handler: async (api, args) => {
			const limit = readSearchLimit(args.limit);
			const query = args.query.toLowerCase().trim();
			const pageSize = query ? Math.min(Math.max(limit, 50), 200) : limit;
			const matches: {
				product?: { title?: string };
				sku: string;
			}[] = [];
			let offset = 0;

			while (matches.length < limit) {
				const inventoryPage = await api.inventory.getInventoryItems({
					limit: pageSize,
					offset,
				});
				const pageItems = inventoryPage.inventoryItems ?? [];
				if (pageItems.length == 0) {
					break;
				}

				// Only items with valid SKUs can be passed to getInventoryItem later.
				function hasSku(
					inventoryItem: (typeof pageItems)[number],
				): inventoryItem is (typeof pageItems)[number] & { sku: string } {
					const sku = inventoryItem.sku;
					const isNotSkuText = typeof sku != "string";

					if (isNotSkuText) return false;

					const isBlankSku = sku.trim() == "";

					if (isBlankSku) return false;

					return true;
				}

				const itemsWithSku = pageItems.filter(hasSku);

				const filtered = query
					? itemsWithSku.filter((inventoryItem) =>
							(inventoryItem.product?.title ?? "")
								.toLowerCase()
								.includes(query),
						)
					: itemsWithSku;

				matches.push(...filtered);
				offset += pageSize;

				const total = (inventoryPage as { total?: number }).total;
				const isPastEnd = isPastListedTotal(total, offset);

				if (isPastEnd) break;

				const hasNoQuery = query == "";

				if (hasNoQuery) break;

				const isShortPage = pageItems.length < pageSize;

				if (isShortPage) break;
			}

			const results = matches.slice(0, limit).map((match) => ({
				id: match.sku,
				title: match.product?.title ?? "",
				url: "https://www.ebay.com/", // Placeholder: eBay does not expose a canonical item URL here.
			}));

			// The ChatGPT connector spec requires a single text content block.
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ results }),
					},
				],
			};
		},
	}),
	defineTool({
		name: "fetch",
		description: "Fetch a specific eBay inventory item by SKU",
		inputSchema: connectorFetchInputSchema.shape,
		title: "Fetch",
		outputSchema: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				data: { type: "object" },
			},
		},
		annotations: {
			title: "Fetch",
			readOnlyHint: true,
		},
		_meta: {
			category: "chat",
			version: "1.0.0",
		},
		handler: async (api, args) => {
			const sku = args.id;
			const inventoryItem = await api.inventory.getInventoryItem({ sku });

			const connectorDocument = {
				id: sku,
				title: inventoryItem.product?.title ?? "",
				text: inventoryItem.product?.description ?? "",
				url: "https://www.ebay.com/", // Placeholder: eBay does not expose a canonical item URL here.
				metadata: {
					source: "ebay_inventory",
					aspects: inventoryItem.product?.aspects,
					condition: inventoryItem.condition,
				},
			};

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(connectorDocument),
					},
				],
			};
		},
	}),
];
