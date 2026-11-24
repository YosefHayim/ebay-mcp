import type { DeveloperAnalyticsComponents } from "@/ebay-openapi-types/developerAnalyticsV1BetaOas3.js";
import type { components as AnalyticsSchemas } from "@/ebay-openapi-types/sellAnalyticsV1Oas3.js";
import type { components as FulfillmentSchemas } from "@/ebay-openapi-types/sellFulfillmentV1Oas3.js";
import type { components as InventorySchemas } from "@/ebay-openapi-types/sellInventoryV1Oas3.js";
import {
	formatAmount,
	humanizeStatus,
	statusTone,
	toLabel,
	toNumber,
	truncate,
} from "@/tool-registry/ui/mapHelpers.js";
import type {
	CardBadge,
	CardSection,
	CardViewModel,
	ChartSeries,
	ChartViewModel,
	StatTile,
	StatViewModel,
	TableRow,
	TableViewModel,
	Tone,
} from "@/tool-registry/ui/viewModels.js";

type Order = FulfillmentSchemas["schemas"]["Order"];
type OrderSearchPagedCollection =
	FulfillmentSchemas["schemas"]["OrderSearchPagedCollection"];
type ShippingFulfillmentPagedCollection =
	FulfillmentSchemas["schemas"]["ShippingFulfillmentPagedCollection"];
type DisputeSummaryResponse =
	FulfillmentSchemas["schemas"]["DisputeSummaryResponse"];
type PaymentDispute = FulfillmentSchemas["schemas"]["PaymentDispute"];

type Offers = InventorySchemas["schemas"]["Offers"];
type EbayOfferDetailsWithAll =
	InventorySchemas["schemas"]["EbayOfferDetailsWithAll"];
type InventoryItems = InventorySchemas["schemas"]["InventoryItems"];
type InventoryItemWithSkuLocaleGroupid =
	InventorySchemas["schemas"]["InventoryItemWithSkuLocaleGroupid"];
type LocationResponse = InventorySchemas["schemas"]["LocationResponse"];

type Report = AnalyticsSchemas["schemas"]["Report"];
type StandardsProfile = AnalyticsSchemas["schemas"]["StandardsProfile"];
type GetCustomerServiceMetricResponse =
	AnalyticsSchemas["schemas"]["GetCustomerServiceMetricResponse"];

type RateLimitsResponse =
	DeveloperAnalyticsComponents["schemas"]["RateLimitsResponse"];

function footnoteFor(
	shown: number,
	total: number | undefined,
): string | undefined {
	if (total == null) {
		return;
	}
	return total > shown ? `Showing ${shown} of ${total}` : `${total} total`;
}

function createTableRow(row: {
	id: string;
	cells: TableRow["cells"];
	drill: TableRow["drill"];
}): TableRow {
	const view: TableRow = { id: row.id, cells: row.cells };
	const drill = row.drill;

	if (drill != null) {
		view.drill = drill;
	}

	return view;
}

function createTableView(table: {
	title: string;
	columns: TableViewModel["columns"];
	rows: TableViewModel["rows"];
	footnote: string | undefined;
}): TableViewModel {
	const view: TableViewModel = {
		archetype: "table",
		title: table.title,
		columns: table.columns,
		rows: table.rows,
	};
	const footnote = table.footnote;

	if (footnote != null) {
		view.footnote = footnote;
	}

	return view;
}

function createCardView(card: {
	title: string;
	subtitle: string | null | undefined;
	badges: CardBadge[] | undefined;
	sections: CardSection[];
}): CardViewModel {
	const view: CardViewModel = {
		archetype: "card",
		title: card.title,
		sections: card.sections,
	};
	const subtitle = card.subtitle;

	if (subtitle != null) {
		view.subtitle = subtitle;
	}

	const badges = card.badges;

	if (badges != null) {
		view.badges = badges;
	}

	return view;
}

type OfferPricing = Pick<
	EbayOfferDetailsWithAll,
	"format" | "listingDuration" | "pricingSummary"
>;

function offerListPrice(offer: OfferPricing) {
	return offer.format == "AUCTION"
		? offer.pricingSummary?.auctionStartPrice
		: offer.pricingSummary?.price;
}

function offerPriceFields(offer: OfferPricing): CardSection["fields"] {
	if (offer.format != "AUCTION") {
		return [
			{ label: "Price", value: formatAmount(offer.pricingSummary?.price) },
		];
	}
	return [
		{
			label: "Starting bid",
			value: formatAmount(offer.pricingSummary?.auctionStartPrice),
		},
		{
			label: "Reserve price",
			value: formatAmount(offer.pricingSummary?.auctionReservePrice),
		},
		{
			label: "Buy It Now price",
			value: formatAmount(offer.pricingSummary?.price),
		},
		{ label: "Duration", value: humanizeStatus(offer.listingDuration) },
	];
}

function statusBadge(status: string | undefined): CardBadge | undefined {
	const label = humanizeStatus(status);
	const isLabelMissing = label == null;

	if (isLabelMissing) {
		return undefined;
	}

	const badge: CardBadge = { label };
	const tone = statusTone(status);

	if (tone != null) {
		badge.tone = tone;
	}

	return badge;
}

export function mapOrdersToTable(
	orderPage: OrderSearchPagedCollection,
): TableViewModel {
	const orders = orderPage.orders ?? [];
	return createTableView({
		title: "Orders",
		columns: [
			{ key: "orderId", label: "Order" },
			{ key: "creationDate", label: "Created" },
			{ key: "fulfillment", label: "Fulfillment" },
			{ key: "payment", label: "Payment" },
			{ key: "buyer", label: "Buyer" },
			{ key: "total", label: "Total", align: "right" },
		],
		rows: orders.map(function toOrderRow(order, index) {
			const orderId = order.orderId;
			const drill =
				orderId == null
					? undefined
					: {
							tool: "ebay_get_order",
							arguments: { orderId },
							label: "View order",
						};
			return createTableRow({
				id: orderId ?? `order-${index}`,
				cells: {
					orderId: orderId ?? null,
					creationDate: order.creationDate ?? null,
					fulfillment: humanizeStatus(order.orderFulfillmentStatus),
					payment: humanizeStatus(order.orderPaymentStatus),
					buyer: order.buyer?.username ?? null,
					total: formatAmount(order.pricingSummary?.total),
				},
				drill,
			});
		}),
		footnote: footnoteFor(orders.length, orderPage.total),
	});
}

export function mapFulfillmentsToTable(
	fulfillmentPage: ShippingFulfillmentPagedCollection,
): TableViewModel {
	const fulfillments = fulfillmentPage.fulfillments ?? [];
	return createTableView({
		title: "Shipping fulfillments",
		columns: [
			{ key: "fulfillmentId", label: "Fulfillment" },
			{ key: "carrier", label: "Carrier" },
			{ key: "tracking", label: "Tracking #" },
			{ key: "shippedDate", label: "Shipped" },
		],
		rows: fulfillments.map((fulfillment, index) => ({
			id: fulfillment.fulfillmentId ?? `fulfillment-${index}`,
			cells: {
				fulfillmentId: fulfillment.fulfillmentId ?? null,
				carrier: fulfillment.shippingCarrierCode ?? null,
				tracking: fulfillment.shipmentTrackingNumber ?? null,
				shippedDate: fulfillment.shippedDate ?? null,
			},
		})),
		footnote: footnoteFor(fulfillments.length, fulfillmentPage.total),
	});
}

export function mapOffersToTable(offerPage: Offers): TableViewModel {
	const offers = offerPage.offers ?? [];
	return createTableView({
		title: "Offers",
		columns: [
			{ key: "offerId", label: "Offer" },
			{ key: "sku", label: "SKU" },
			{ key: "marketplace", label: "Marketplace" },
			{ key: "format", label: "Format" },
			{ key: "price", label: "Price", align: "right" },
			{ key: "quantity", label: "Qty", align: "right" },
			{ key: "status", label: "Status" },
		],
		rows: offers.map(function toOfferRow(offer, index) {
			const offerId = offer.offerId;
			const drill =
				offerId == null
					? undefined
					: {
							tool: "ebay_get_offer",
							arguments: { offerId },
							label: "View offer",
						};
			return createTableRow({
				id: offerId ?? offer.sku ?? `offer-${index}`,
				cells: {
					offerId: offerId ?? null,
					sku: offer.sku ?? null,
					marketplace: offer.marketplaceId ?? null,
					format: humanizeStatus(offer.format),
					price: formatAmount(offerListPrice(offer)),
					quantity: offer.availableQuantity ?? null,
					status: humanizeStatus(offer.status),
				},
				drill,
			});
		}),
		footnote: footnoteFor(offers.length, offerPage.total),
	});
}

export function mapInventoryItemsToTable(
	inventoryPage: InventoryItems,
): TableViewModel {
	const inventoryItems = inventoryPage.inventoryItems ?? [];
	return createTableView({
		title: "Inventory items",
		columns: [
			{ key: "sku", label: "SKU" },
			{ key: "title", label: "Title" },
			{ key: "condition", label: "Condition" },
			{ key: "quantity", label: "Qty", align: "right" },
		],
		rows: inventoryItems.map(function toInventoryRow(inventoryItem, index) {
			const sku = inventoryItem.sku;
			const drill =
				sku == null
					? undefined
					: {
							tool: "ebay_get_inventory_item",
							arguments: { sku },
							label: "View item",
						};
			return createTableRow({
				id: sku ?? `item-${index}`,
				cells: {
					sku: sku ?? null,
					title: truncate(inventoryItem.product?.title, 60) || null,
					condition: humanizeStatus(inventoryItem.condition),
					quantity:
						inventoryItem.availability?.shipToLocationAvailability?.quantity ??
						null,
				},
				drill,
			});
		}),
		footnote: footnoteFor(inventoryItems.length, inventoryPage.total),
	});
}

export function mapLocationsToTable(
	locationPage: LocationResponse,
): TableViewModel {
	const locations = locationPage.locations ?? [];
	return createTableView({
		title: "Inventory locations",
		columns: [
			{ key: "key", label: "Location key" },
			{ key: "name", label: "Name" },
			{ key: "status", label: "Status" },
			{ key: "types", label: "Types" },
			{ key: "phone", label: "Phone" },
		],
		rows: locations.map((location, index) => ({
			id: location.merchantLocationKey ?? `location-${index}`,
			cells: {
				key: location.merchantLocationKey ?? null,
				name: location.name ?? null,
				status: humanizeStatus(location.merchantLocationStatus),
				types: location.locationTypes?.join(", ") ?? null,
				phone: location.phone ?? null,
			},
		})),
		footnote: footnoteFor(locations.length, locationPage.total),
	});
}

export function mapDisputeSummariesToTable(
	disputeSummaryPage: DisputeSummaryResponse,
): TableViewModel {
	const disputes = disputeSummaryPage.paymentDisputeSummaries ?? [];
	return createTableView({
		title: "Payment disputes",
		columns: [
			{ key: "disputeId", label: "Dispute" },
			{ key: "orderId", label: "Order" },
			{ key: "status", label: "Status" },
			{ key: "reason", label: "Reason" },
			{ key: "amount", label: "Amount", align: "right" },
			{ key: "buyer", label: "Buyer" },
			{ key: "openDate", label: "Opened" },
		],
		rows: disputes.map(function toDisputeRow(dispute, index) {
			const paymentDisputeId = dispute.paymentDisputeId;
			const drill =
				paymentDisputeId == null
					? undefined
					: {
							tool: "ebay_get_payment_dispute",
							arguments: { paymentDisputeId },
							label: "View dispute",
						};
			return createTableRow({
				id: paymentDisputeId ?? `dispute-${index}`,
				cells: {
					disputeId: paymentDisputeId ?? null,
					orderId: dispute.orderId ?? null,
					status: humanizeStatus(dispute.paymentDisputeStatus),
					reason: humanizeStatus(dispute.reason),
					amount: formatAmount(dispute.amount),
					buyer: dispute.buyerUsername ?? null,
					openDate: dispute.openDate ?? null,
				},
				drill,
			});
		}),
		footnote: footnoteFor(disputes.length, disputeSummaryPage.total),
	});
}

export function mapOrderToCard(order: Order): CardViewModel {
	const lineItems = order.lineItems ?? [];
	const badges: CardBadge[] = [];
	const fulfillmentBadge = statusBadge(order.orderFulfillmentStatus);
	if (fulfillmentBadge) {
		badges.push(fulfillmentBadge);
	}
	const paymentBadge = statusBadge(order.orderPaymentStatus);
	if (paymentBadge) {
		badges.push(paymentBadge);
	}
	const buyerName = order.buyer?.username;
	const subtitle = buyerName == null ? undefined : `Buyer: ${buyerName}`;
	return createCardView({
		title: order.orderId ? `Order ${order.orderId}` : "Order",
		subtitle,
		badges,
		sections: [
			{
				heading: "Summary",
				fields: [
					{ label: "Created", value: order.creationDate ?? null },
					{ label: "Total", value: formatAmount(order.pricingSummary?.total) },
					{ label: "Line items", value: lineItems.length },
				],
			},
			{
				heading: "Items",
				fields: lineItems.map((lineItem) => ({
					label: truncate(lineItem.title, 60) || lineItem.sku || "",
					value: lineItem.quantity == null ? null : `×${lineItem.quantity}`,
				})),
			},
		],
	});
}

export function mapOfferToCard(offer: EbayOfferDetailsWithAll): CardViewModel {
	const badges: CardBadge[] = [];
	const offerStatusBadge = statusBadge(offer.status);
	if (offerStatusBadge) {
		badges.push(offerStatusBadge);
	}
	if (offer.format) {
		const formatLabel = humanizeStatus(offer.format);
		if (formatLabel) {
			badges.push({ label: formatLabel });
		}
	}
	const sku = offer.sku;
	const subtitle = sku == null ? undefined : `SKU: ${sku}`;
	return createCardView({
		title: offer.offerId ? `Offer ${offer.offerId}` : "Offer",
		subtitle,
		badges,
		sections: [
			{
				heading: "Pricing",
				fields: [
					...offerPriceFields(offer),
					{
						label: "Available quantity",
						value: offer.availableQuantity ?? null,
					},
					{ label: "Marketplace", value: offer.marketplaceId ?? null },
				],
			},
			{
				heading: "Listing",
				fields: [
					{ label: "Listing ID", value: offer.listing?.listingId ?? null },
					{
						label: "Listing status",
						value: humanizeStatus(offer.listing?.listingStatus),
					},
				],
			},
		],
	});
}

export function mapInventoryItemToCard(
	inventoryItem: InventoryItemWithSkuLocaleGroupid,
): CardViewModel {
	const product = inventoryItem.product;
	const conditionBadge = statusBadge(inventoryItem.condition);
	const productTitle = product?.title;
	const subtitle =
		productTitle == null ? undefined : truncate(productTitle, 80);
	const badges = conditionBadge == null ? undefined : [conditionBadge];
	return createCardView({
		title: inventoryItem.sku ? `SKU ${inventoryItem.sku}` : "Inventory item",
		subtitle,
		badges,
		sections: [
			{
				heading: "Product",
				fields: [
					{ label: "Brand", value: product?.brand ?? null },
					{ label: "MPN", value: product?.mpn ?? null },
					{
						label: "Description",
						value: truncate(product?.description, 120) || null,
					},
				],
			},
			{
				heading: "Availability",
				fields: [
					{
						label: "Quantity",
						value:
							inventoryItem.availability?.shipToLocationAvailability
								?.quantity ?? null,
					},
				],
			},
		],
	});
}

export function mapDisputeToCard(dispute: PaymentDispute): CardViewModel {
	const sections: CardSection[] = [
		{
			heading: "Details",
			fields: [
				{ label: "Order", value: dispute.orderId ?? null },
				{ label: "Reason", value: humanizeStatus(dispute.reason) },
				{ label: "Amount", value: formatAmount(dispute.amount) },
				{ label: "Buyer", value: dispute.buyerUsername ?? null },
				{ label: "Opened", value: dispute.openDate ?? null },
				{ label: "Respond by", value: dispute.respondByDate ?? null },
			],
		},
	];
	if (dispute.availableChoices?.length) {
		sections.push({
			heading: "Available actions",
			fields: dispute.availableChoices.map((choice) => ({
				label: humanizeStatus(choice) ?? "",
				value: null,
			})),
		});
	}
	const disputeBadge = statusBadge(dispute.paymentDisputeStatus);
	const orderId = dispute.orderId;
	const subtitle = orderId == null ? undefined : `Order: ${orderId}`;
	const badges = disputeBadge == null ? undefined : [disputeBadge];
	return createCardView({
		title: dispute.paymentDisputeId
			? `Dispute ${dispute.paymentDisputeId}`
			: "Payment dispute",
		subtitle,
		badges,
		sections,
	});
}

export function mapStandardsProfileToCard(
	standardsProfile: StandardsProfile,
): CardViewModel {
	const metrics = standardsProfile.metrics ?? [];
	const sections: CardSection[] = [
		{
			heading: "Profile",
			fields: [
				{
					label: "Cycle",
					value: humanizeStatus(standardsProfile.cycle?.cycleType),
				},
				{
					label: "Evaluation date",
					value: standardsProfile.cycle?.evaluationDate ?? null,
				},
				{
					label: "Evaluation reason",
					value: humanizeStatus(standardsProfile.evaluationReason),
				},
			],
		},
	];
	if (metrics.length) {
		sections.push({
			heading: "Metrics",
			fields: metrics.map((metric) => ({
				label: humanizeStatus(metric.metricKey) ?? "",
				value: metric.value ?? null,
			})),
		});
	}
	const standardsBadge = statusBadge(standardsProfile.standardsLevel);
	const badges = standardsBadge == null ? undefined : [standardsBadge];
	return createCardView({
		title: humanizeStatus(standardsProfile.program) ?? "Seller standards",
		subtitle: humanizeStatus(standardsProfile.cycle?.cycleType),
		badges,
		sections,
	});
}

export function mapTrafficReportToChart(report: Report): ChartViewModel {
	const records = report.records ?? [];
	const metricDefs = report.header?.metrics ?? [];
	const seriesCount =
		metricDefs.length || records[0]?.metricValues?.length || 0;
	const series: ChartSeries[] = Array.from(
		{ length: seriesCount },
		(_unused, metricIndex) => ({
			name: metricDefs[metricIndex]?.key ?? "",
			points: records.flatMap((record) => {
				const y = toNumber(record.metricValues?.[metricIndex]?.value);
				return y === null
					? []
					: [{ x: toLabel(record.dimensionValues?.[0]?.value), y }];
			}),
		}),
	);
	return {
		archetype: "chart",
		title: "Traffic report",
		kind: "line",
		series,
	};
}

export function mapCustomerServiceMetricToChart(
	serviceMetrics: GetCustomerServiceMetricResponse,
): ChartViewModel {
	const dimensionMetrics = serviceMetrics.dimensionMetrics ?? [];
	const pointsByMetric = new Map<string, ChartSeries["points"]>();
	for (const dimensionMetric of dimensionMetrics) {
		const x = toLabel(
			dimensionMetric.dimension?.value ?? dimensionMetric.dimension?.name,
		);
		for (const metric of dimensionMetric.metrics ?? []) {
			const key = metric.metricKey ?? "";
			const y = toNumber(metric.value);
			if (y === null) {
				continue;
			}
			const points = pointsByMetric.get(key) ?? [];
			points.push({ x, y });
			pointsByMetric.set(key, points);
		}
	}
	const series: ChartSeries[] = Array.from(
		pointsByMetric,
		([name, points]) => ({ name, points }),
	);
	return {
		archetype: "chart",
		title: "Customer service metrics",
		kind: "bar",
		series,
	};
}

function headroomTone(remaining: number, limit: number): Tone {
	if (limit <= 0) {
		return "neutral";
	}
	const ratio = remaining / limit;
	if (ratio <= 0.1) {
		return "danger";
	}
	if (ratio <= 0.25) {
		return "warning";
	}
	return "success";
}

function rateLimitTiles(rateLimitReport: RateLimitsResponse): StatTile[] {
	const tiles: StatTile[] = [];
	for (const rateLimit of rateLimitReport.rateLimits ?? []) {
		for (const resource of rateLimit.resources ?? []) {
			const rate = resource.rates?.[0];
			if (!rate) {
				continue;
			}
			const remaining = rate.remaining ?? 0;
			const limit = rate.limit ?? 0;
			const parts = [
				rateLimit.apiContext,
				rateLimit.apiName,
				resource.name,
			].filter(Boolean);
			tiles.push({
				label: parts.length > 0 ? parts.join(" · ") : "",
				value: remaining.toLocaleString("en-US"),
				sub: `of ${limit.toLocaleString("en-US")}`,
				tone: headroomTone(remaining, limit),
			});
		}
	}
	return tiles;
}

export function mapRateLimitsToStat(
	rateLimitReport: RateLimitsResponse,
): StatViewModel {
	return {
		archetype: "stat",
		title: "Application rate limits",
		tiles: rateLimitTiles(rateLimitReport),
	};
}

export function mapUserRateLimitsToStat(
	rateLimitReport: RateLimitsResponse,
): StatViewModel {
	return {
		archetype: "stat",
		title: "User rate limits",
		tiles: rateLimitTiles(rateLimitReport),
	};
}
