export type FeaturedFieldValues = Record<string, string>;

export interface FeaturedField {
	name: string;
	type: string;
	defaultValue: string;
}

export interface FeaturedTool {
	toolName: string;
	familyKey: string;
	summary: string;
	description: string;
	method: "GET" | "POST";
	path: string;
	fields: FeaturedField[];
	createArguments: (
		fieldValues: FeaturedFieldValues,
	) => Record<string, unknown>;
	createQueryString: (fieldValues: FeaturedFieldValues) => string;
	exampleResponse: unknown;
}

export const FEATURED_TOOLS: FeaturedTool[] = [
	{
		toolName: "ebay_bulk_update_price_quantity",
		familyKey: "inventory",
		summary: "change prices",
		description: "Bulk update price and quantity for multiple offers.",
		method: "POST",
		path: "/sell/inventory/v1/bulk_update_price_quantity",
		fields: [
			{ name: "sku", type: "string", defaultValue: "JKT-WOOL-M" },
			{ name: "offerId", type: "string", defaultValue: "9876543010" },
			{ name: "price", type: "string", defaultValue: "75.60" },
		],
		createArguments: (fieldValues) => ({
			body: {
				requests: [
					{
						sku: fieldValues.sku,
						offers: [
							{
								offerId: fieldValues.offerId,
								price: { value: fieldValues.price, currency: "USD" },
							},
						],
					},
				],
			},
		}),
		createQueryString: () => "",
		exampleResponse: {
			responses: [
				{ statusCode: 200, sku: "JKT-WOOL-M", offerId: "9876543010" },
			],
		},
	},
	{
		toolName: "ebay_get_inventory_items",
		familyKey: "inventory",
		summary: "list items",
		description: "List inventory items in your store, one page at a time.",
		method: "GET",
		path: "/sell/inventory/v1/inventory_item",
		fields: [
			{ name: "limit", type: "number", defaultValue: "25" },
			{ name: "offset", type: "number", defaultValue: "0" },
		],
		createArguments: (fieldValues) => ({
			limit: Number(fieldValues.limit),
			offset: Number(fieldValues.offset),
		}),
		createQueryString: (fieldValues) =>
			`?limit=${fieldValues.limit}&offset=${fieldValues.offset}`,
		exampleResponse: {
			total: 142,
			size: 25,
			inventoryItems: [
				{
					sku: "JKT-WOOL-M",
					condition: "NEW",
					availability: { shipToLocationAvailability: { quantity: 3 } },
				},
			],
		},
	},
	{
		toolName: "ebay_get_offers",
		familyKey: "inventory",
		summary: "offers for a SKU",
		description: "Get the offers (price, status, marketplace) for one SKU.",
		method: "GET",
		path: "/sell/inventory/v1/offer",
		fields: [{ name: "sku", type: "string", defaultValue: "JKT-WOOL-M" }],
		createArguments: (fieldValues) => ({ sku: fieldValues.sku }),
		createQueryString: (fieldValues) => `?sku=${fieldValues.sku}`,
		exampleResponse: {
			total: 1,
			offers: [
				{
					offerId: "9876543010",
					sku: "JKT-WOOL-M",
					status: "PUBLISHED",
					pricingSummary: { price: { value: "84.00", currency: "USD" } },
				},
			],
		},
	},
	{
		toolName: "ebay_get_orders",
		familyKey: "fulfillment",
		summary: "orders to ship",
		description: "Search your orders by status, date or buyer.",
		method: "GET",
		path: "/sell/fulfillment/v1/order",
		fields: [
			{
				name: "filter",
				type: "string",
				defaultValue: "orderfulfillmentstatus:{NOT_STARTED}",
			},
			{ name: "limit", type: "number", defaultValue: "10" },
		],
		createArguments: (fieldValues) => ({
			filter: fieldValues.filter,
			limit: Number(fieldValues.limit),
		}),
		createQueryString: (fieldValues) =>
			`?filter=${fieldValues.filter}&limit=${fieldValues.limit}`,
		exampleResponse: {
			total: 4,
			orders: [
				{
					orderId: "24-11522-80312",
					orderFulfillmentStatus: "NOT_STARTED",
					pricingSummary: { total: { value: "42.00", currency: "USD" } },
				},
			],
		},
	},
	{
		toolName: "ebay_get_traffic_report",
		familyKey: "analytics",
		summary: "views and sales",
		description:
			"Get traffic report for listings: impressions, views and transactions.",
		method: "GET",
		path: "/sell/analytics/v1/traffic_report",
		fields: [
			{ name: "dimension", type: "string", defaultValue: "LISTING" },
			{
				name: "metric",
				type: "string",
				defaultValue: "LISTING_VIEWS_TOTAL,TRANSACTION",
			},
			{
				name: "filter",
				type: "string",
				defaultValue: "marketplace_ids:{EBAY_US}",
			},
		],
		createArguments: (fieldValues) => ({
			dimension: fieldValues.dimension,
			metric: fieldValues.metric,
			filter: fieldValues.filter,
		}),
		createQueryString: (fieldValues) =>
			`?dimension=${fieldValues.dimension}&metric=${fieldValues.metric}`,
		exampleResponse: {
			header: { dimensionKeys: [{ key: "LISTING_ID" }] },
			records: [
				{
					dimensionValues: [{ value: "1100223344" }],
					metricValues: [{ value: 212 }, { value: 0 }],
				},
			],
		},
	},
];
