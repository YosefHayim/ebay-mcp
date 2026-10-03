/**
 * Tool-result → {@link ViewModel} projections for the interactive MCP Apps layer.
 *
 * Each exported `map*` const is referenced by exactly one tool's `ui.map` in
 * `src/tools/categories/*`. Keeping them here (rather than inline in the category
 * files) does two things: it keeps the tool definitions terse, and it lets the
 * unit tests import every projection directly. Drift protection still holds — the
 * `defineTool` call site type-checks each function against its handler's awaited
 * return type, so a renamed eBay field breaks compilation at the wiring point.
 *
 * Every input type is the exact generated OpenAPI schema the matching handler
 * returns; every output is the archetype view model the React app in `mcp-apps/`
 * renders. Formatting lives in `./mapHelpers.js` so these stay declarative.
 */

import {
  formatAmount,
  humanizeStatus,
  statusTone,
  toLabel,
  toNumber,
  truncate,
} from '@/tools/ui/mapHelpers.js';
import type {
  CardBadge,
  CardSection,
  CardViewModel,
  ChartSeries,
  ChartViewModel,
  StatTile,
  StatViewModel,
  TableViewModel,
  Tone,
} from '@/tools/ui/viewModels.js';
import type { DeveloperAnalyticsComponents } from '@/types/application-settings/developerAnalyticsV1BetaOas3.js';
import type { components as AnalyticsSchemas } from '@/types/sell-apps/analytics-and-report/sellAnalyticsV1Oas3.js';
import type { components as InventorySchemas } from '@/types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import type { components as FulfillmentSchemas } from '@/types/sell-apps/order-management/sellFulfillmentV1Oas3.js';

type Order = FulfillmentSchemas['schemas']['Order'];
type OrderSearchPagedCollection = FulfillmentSchemas['schemas']['OrderSearchPagedCollection'];
type ShippingFulfillmentPagedCollection =
  FulfillmentSchemas['schemas']['ShippingFulfillmentPagedCollection'];
type DisputeSummaryResponse = FulfillmentSchemas['schemas']['DisputeSummaryResponse'];
type PaymentDispute = FulfillmentSchemas['schemas']['PaymentDispute'];

type Offers = InventorySchemas['schemas']['Offers'];
type EbayOfferDetailsWithAll = InventorySchemas['schemas']['EbayOfferDetailsWithAll'];
type InventoryItems = InventorySchemas['schemas']['InventoryItems'];
type InventoryItemWithSkuLocaleGroupid =
  InventorySchemas['schemas']['InventoryItemWithSkuLocaleGroupid'];
type LocationResponse = InventorySchemas['schemas']['LocationResponse'];

type Report = AnalyticsSchemas['schemas']['Report'];
type StandardsProfile = AnalyticsSchemas['schemas']['StandardsProfile'];
type GetCustomerServiceMetricResponse =
  AnalyticsSchemas['schemas']['GetCustomerServiceMetricResponse'];

type RateLimitsResponse = DeveloperAnalyticsComponents['schemas']['RateLimitsResponse'];

/**
 * Builds a table's contextual footnote from how many rows are shown versus the
 * server's reported total, e.g. `"Showing 25 of 240"`. Returns `undefined` when
 * the response carries no total so the table renders without a footnote.
 */
const footnoteFor = (shown: number, total: number | undefined): string | undefined => {
  if (total == null) {
    return;
  }
  return total > shown ? `Showing ${shown} of ${total}` : `${total} total`;
};

type OfferPricing = Pick<EbayOfferDetailsWithAll, 'format' | 'listingDuration' | 'pricingSummary'>;

/**
 * Picks the amount a listing is offered at: the fixed price, or the opening bid
 * for an auction (its `price`, when present, is only the Buy It Now option).
 */
const offerListPrice = (offer: OfferPricing) =>
  offer.format === 'AUCTION'
    ? offer.pricingSummary?.auctionStartPrice
    : offer.pricingSummary?.price;

/** Pricing rows for an offer card, labelled by listing format. */
const offerPriceFields = (offer: OfferPricing): CardSection['fields'] => {
  if (offer.format !== 'AUCTION') {
    return [{ label: 'Price', value: formatAmount(offer.pricingSummary?.price) }];
  }
  return [
    { label: 'Starting bid', value: formatAmount(offer.pricingSummary?.auctionStartPrice) },
    { label: 'Reserve price', value: formatAmount(offer.pricingSummary?.auctionReservePrice) },
    { label: 'Buy It Now price', value: formatAmount(offer.pricingSummary?.price) },
    { label: 'Duration', value: humanizeStatus(offer.listingDuration) },
  ];
};

/** Builds a status badge only when eBay returned a status value to display. */
const statusBadge = (status: string | undefined): CardBadge | undefined => {
  const label = humanizeStatus(status);
  return label ? { label, tone: statusTone(status) } : undefined;
};

/**
 * Projects a seller's orders into a table; rows drill into a single-order card.
 *
 * @param orderPage - Generated fulfillment order search response from eBay.
 * @returns A table view model whose rows preserve order fields at the projection layer.
 *
 * @example
 * ```ts
 * const view = mapOrdersToTable({ orders: [{ orderId: '12-3456' }], total: 1 });
 * ```
 */
export const mapOrdersToTable = (orderPage: OrderSearchPagedCollection): TableViewModel => {
  const orders = orderPage.orders ?? [];
  return {
    archetype: 'table',
    title: 'Orders',
    columns: [
      { key: 'orderId', label: 'Order' },
      { key: 'creationDate', label: 'Created' },
      { key: 'fulfillment', label: 'Fulfillment' },
      { key: 'payment', label: 'Payment' },
      { key: 'buyer', label: 'Buyer' },
      { key: 'total', label: 'Total', align: 'right' },
    ],
    rows: orders.map((order, index) => ({
      id: order.orderId ?? `order-${index}`,
      cells: {
        orderId: order.orderId ?? null,
        creationDate: order.creationDate ?? null,
        fulfillment: humanizeStatus(order.orderFulfillmentStatus),
        payment: humanizeStatus(order.orderPaymentStatus),
        buyer: order.buyer?.username ?? null,
        total: formatAmount(order.pricingSummary?.total),
      },
      drill: order.orderId
        ? { tool: 'ebay_get_order', arguments: { orderId: order.orderId }, label: 'View order' }
        : undefined,
    })),
    footnote: footnoteFor(orders.length, orderPage.total),
  };
};

/**
 * Projects an order's shipping fulfillments (tracking/carrier) into a table.
 *
 * @param fulfillmentPage - Generated fulfillment page from eBay.
 * @returns A table view model with one row per fulfillment.
 *
 * @example
 * ```ts
 * const view = mapFulfillmentsToTable({ fulfillments: [{ fulfillmentId: 'f1' }] });
 * ```
 */
export const mapFulfillmentsToTable = (
  fulfillmentPage: ShippingFulfillmentPagedCollection,
): TableViewModel => {
  const fulfillments = fulfillmentPage.fulfillments ?? [];
  return {
    archetype: 'table',
    title: 'Shipping fulfillments',
    columns: [
      { key: 'fulfillmentId', label: 'Fulfillment' },
      { key: 'carrier', label: 'Carrier' },
      { key: 'tracking', label: 'Tracking #' },
      { key: 'shippedDate', label: 'Shipped' },
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
  };
};

/**
 * Projects a seller's offers into a table; rows drill into a single-offer card.
 *
 * @param offerPage - Generated inventory offers response from eBay.
 * @returns A table view model with offer rows and optional drill refs.
 *
 * @example
 * ```ts
 * const view = mapOffersToTable({ offers: [{ offerId: 'o1', sku: 'SKU-1' }] });
 * ```
 */
export const mapOffersToTable = (offerPage: Offers): TableViewModel => {
  const offers = offerPage.offers ?? [];
  return {
    archetype: 'table',
    title: 'Offers',
    columns: [
      { key: 'offerId', label: 'Offer' },
      { key: 'sku', label: 'SKU' },
      { key: 'marketplace', label: 'Marketplace' },
      { key: 'format', label: 'Format' },
      { key: 'price', label: 'Price', align: 'right' },
      { key: 'quantity', label: 'Qty', align: 'right' },
      { key: 'status', label: 'Status' },
    ],
    rows: offers.map((offer, index) => ({
      id: offer.offerId ?? offer.sku ?? `offer-${index}`,
      cells: {
        offerId: offer.offerId ?? null,
        sku: offer.sku ?? null,
        marketplace: offer.marketplaceId ?? null,
        format: humanizeStatus(offer.format),
        price: formatAmount(offerListPrice(offer)),
        quantity: offer.availableQuantity ?? null,
        status: humanizeStatus(offer.status),
      },
      drill: offer.offerId
        ? { tool: 'ebay_get_offer', arguments: { offerId: offer.offerId }, label: 'View offer' }
        : undefined,
    })),
    footnote: footnoteFor(offers.length, offerPage.total),
  };
};

/**
 * Projects inventory items into a table; rows drill into a single-item card.
 *
 * @param inventoryPage - Generated inventory item collection from eBay.
 * @returns A table view model with one row per inventory item.
 *
 * @example
 * ```ts
 * const view = mapInventoryItemsToTable({ inventoryItems: [{ sku: 'SKU-1' }] });
 * ```
 */
export const mapInventoryItemsToTable = (inventoryPage: InventoryItems): TableViewModel => {
  const inventoryItems = inventoryPage.inventoryItems ?? [];
  return {
    archetype: 'table',
    title: 'Inventory items',
    columns: [
      { key: 'sku', label: 'SKU' },
      { key: 'title', label: 'Title' },
      { key: 'condition', label: 'Condition' },
      { key: 'quantity', label: 'Qty', align: 'right' },
    ],
    rows: inventoryItems.map((inventoryItem, index) => ({
      id: inventoryItem.sku ?? `item-${index}`,
      cells: {
        sku: inventoryItem.sku ?? null,
        title: truncate(inventoryItem.product?.title, 60) || null,
        condition: humanizeStatus(inventoryItem.condition),
        quantity: inventoryItem.availability?.shipToLocationAvailability?.quantity ?? null,
      },
      drill: inventoryItem.sku
        ? {
            tool: 'ebay_get_inventory_item',
            arguments: { sku: inventoryItem.sku },
            label: 'View item',
          }
        : undefined,
    })),
    footnote: footnoteFor(inventoryItems.length, inventoryPage.total),
  };
};

/**
 * Projects a seller's inventory locations into a table.
 *
 * @param locationPage - Generated inventory location response from eBay.
 * @returns A table view model with location rows.
 *
 * @example
 * ```ts
 * const view = mapLocationsToTable({ locations: [{ merchantLocationKey: 'WAREHOUSE-1' }] });
 * ```
 */
export const mapLocationsToTable = (locationPage: LocationResponse): TableViewModel => {
  const locations = locationPage.locations ?? [];
  return {
    archetype: 'table',
    title: 'Inventory locations',
    columns: [
      { key: 'key', label: 'Location key' },
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
      { key: 'types', label: 'Types' },
      { key: 'phone', label: 'Phone' },
    ],
    rows: locations.map((location, index) => ({
      id: location.merchantLocationKey ?? `location-${index}`,
      cells: {
        key: location.merchantLocationKey ?? null,
        name: location.name ?? null,
        status: humanizeStatus(location.merchantLocationStatus),
        types: location.locationTypes?.join(', ') ?? null,
        phone: location.phone ?? null,
      },
    })),
    footnote: footnoteFor(locations.length, locationPage.total),
  };
};

/**
 * Projects payment-dispute summaries into a table; rows drill into a dispute card.
 *
 * @param disputeSummaryPage - Generated payment dispute summary response from eBay.
 * @returns A table view model with dispute rows and optional drill refs.
 *
 * @example
 * ```ts
 * const view = mapDisputeSummariesToTable({
 *   paymentDisputeSummaries: [{ paymentDisputeId: 'd1' }],
 * });
 * ```
 */
export const mapDisputeSummariesToTable = (
  disputeSummaryPage: DisputeSummaryResponse,
): TableViewModel => {
  const disputes = disputeSummaryPage.paymentDisputeSummaries ?? [];
  return {
    archetype: 'table',
    title: 'Payment disputes',
    columns: [
      { key: 'disputeId', label: 'Dispute' },
      { key: 'orderId', label: 'Order' },
      { key: 'status', label: 'Status' },
      { key: 'reason', label: 'Reason' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'buyer', label: 'Buyer' },
      { key: 'openDate', label: 'Opened' },
    ],
    rows: disputes.map((dispute, index) => ({
      id: dispute.paymentDisputeId ?? `dispute-${index}`,
      cells: {
        disputeId: dispute.paymentDisputeId ?? null,
        orderId: dispute.orderId ?? null,
        status: humanizeStatus(dispute.paymentDisputeStatus),
        reason: humanizeStatus(dispute.reason),
        amount: formatAmount(dispute.amount),
        buyer: dispute.buyerUsername ?? null,
        openDate: dispute.openDate ?? null,
      },
      drill: dispute.paymentDisputeId
        ? {
            tool: 'ebay_get_payment_dispute',
            arguments: { paymentDisputeId: dispute.paymentDisputeId },
            label: 'View dispute',
          }
        : undefined,
    })),
    footnote: footnoteFor(disputes.length, disputeSummaryPage.total),
  };
};

/**
 * Projects a single order into a detail card with status badges and line items.
 *
 * @param order - Generated fulfillment order response from eBay.
 * @returns A card view model with summary and line-item sections.
 *
 * @example
 * ```ts
 * const view = mapOrderToCard({ orderId: '12-3456' });
 * ```
 */
export const mapOrderToCard = (order: Order): CardViewModel => {
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
  return {
    archetype: 'card',
    title: order.orderId ? `Order ${order.orderId}` : 'Order',
    subtitle: order.buyer?.username ? `Buyer: ${order.buyer.username}` : undefined,
    badges,
    sections: [
      {
        heading: 'Summary',
        fields: [
          { label: 'Created', value: order.creationDate ?? null },
          { label: 'Total', value: formatAmount(order.pricingSummary?.total) },
          { label: 'Line items', value: lineItems.length },
        ],
      },
      {
        heading: 'Items',
        fields: lineItems.map((lineItem) => ({
          label: truncate(lineItem.title, 60) || lineItem.sku || '',
          value: lineItem.quantity == null ? null : `×${lineItem.quantity}`,
        })),
      },
    ],
  };
};

/**
 * Projects a single offer into a detail card with pricing and listing sections.
 *
 * @param offer - Generated inventory offer detail response from eBay.
 * @returns A card view model with pricing and listing sections.
 *
 * @example
 * ```ts
 * const view = mapOfferToCard({ offerId: 'o1', sku: 'SKU-1' });
 * ```
 */
export const mapOfferToCard = (offer: EbayOfferDetailsWithAll): CardViewModel => {
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
  return {
    archetype: 'card',
    title: offer.offerId ? `Offer ${offer.offerId}` : 'Offer',
    subtitle: offer.sku ? `SKU: ${offer.sku}` : undefined,
    badges,
    sections: [
      {
        heading: 'Pricing',
        fields: [
          ...offerPriceFields(offer),
          { label: 'Available quantity', value: offer.availableQuantity ?? null },
          { label: 'Marketplace', value: offer.marketplaceId ?? null },
        ],
      },
      {
        heading: 'Listing',
        fields: [
          { label: 'Listing ID', value: offer.listing?.listingId ?? null },
          { label: 'Listing status', value: humanizeStatus(offer.listing?.listingStatus) },
        ],
      },
    ],
  };
};

/**
 * Projects a single inventory item into a detail card (product + availability).
 *
 * @param inventoryItem - Generated inventory item detail response from eBay.
 * @returns A card view model with product and availability sections.
 *
 * @example
 * ```ts
 * const view = mapInventoryItemToCard({ sku: 'SKU-1' });
 * ```
 */
export const mapInventoryItemToCard = (
  inventoryItem: InventoryItemWithSkuLocaleGroupid,
): CardViewModel => {
  const product = inventoryItem.product;
  const conditionBadge = statusBadge(inventoryItem.condition);
  return {
    archetype: 'card',
    title: inventoryItem.sku ? `SKU ${inventoryItem.sku}` : 'Inventory item',
    subtitle: product?.title ? truncate(product.title, 80) : undefined,
    badges: conditionBadge ? [conditionBadge] : undefined,
    sections: [
      {
        heading: 'Product',
        fields: [
          { label: 'Brand', value: product?.brand ?? null },
          { label: 'MPN', value: product?.mpn ?? null },
          { label: 'Description', value: truncate(product?.description, 120) || null },
        ],
      },
      {
        heading: 'Availability',
        fields: [
          {
            label: 'Quantity',
            value: inventoryItem.availability?.shipToLocationAvailability?.quantity ?? null,
          },
        ],
      },
    ],
  };
};

/**
 * Projects a single payment dispute into a detail card, listing available actions.
 *
 * @param dispute - Generated payment dispute response from eBay.
 * @returns A card view model with detail and available-action sections.
 *
 * @example
 * ```ts
 * const view = mapDisputeToCard({ paymentDisputeId: 'd1' });
 * ```
 */
export const mapDisputeToCard = (dispute: PaymentDispute): CardViewModel => {
  const sections: CardSection[] = [
    {
      heading: 'Details',
      fields: [
        { label: 'Order', value: dispute.orderId ?? null },
        { label: 'Reason', value: humanizeStatus(dispute.reason) },
        { label: 'Amount', value: formatAmount(dispute.amount) },
        { label: 'Buyer', value: dispute.buyerUsername ?? null },
        { label: 'Opened', value: dispute.openDate ?? null },
        { label: 'Respond by', value: dispute.respondByDate ?? null },
      ],
    },
  ];
  if (dispute.availableChoices?.length) {
    sections.push({
      heading: 'Available actions',
      fields: dispute.availableChoices.map((choice) => ({
        label: humanizeStatus(choice) ?? '',
        value: null,
      })),
    });
  }
  const disputeBadge = statusBadge(dispute.paymentDisputeStatus);
  return {
    archetype: 'card',
    title: dispute.paymentDisputeId ? `Dispute ${dispute.paymentDisputeId}` : 'Payment dispute',
    subtitle: dispute.orderId ? `Order: ${dispute.orderId}` : undefined,
    badges: disputeBadge ? [disputeBadge] : undefined,
    sections,
  };
};

/**
 * Projects a seller standards profile into a detail card (cycle + per-metric values).
 *
 * @param standardsProfile - Generated seller standards profile response from eBay.
 * @returns A card view model with profile and metric sections.
 *
 * @example
 * ```ts
 * const view = mapStandardsProfileToCard({ program: 'PROGRAM_US' });
 * ```
 */
export const mapStandardsProfileToCard = (standardsProfile: StandardsProfile): CardViewModel => {
  const metrics = standardsProfile.metrics ?? [];
  const sections: CardSection[] = [
    {
      heading: 'Profile',
      fields: [
        { label: 'Cycle', value: humanizeStatus(standardsProfile.cycle?.cycleType) },
        { label: 'Evaluation date', value: standardsProfile.cycle?.evaluationDate ?? null },
        { label: 'Evaluation reason', value: humanizeStatus(standardsProfile.evaluationReason) },
      ],
    },
  ];
  if (metrics.length) {
    sections.push({
      heading: 'Metrics',
      fields: metrics.map((metric) => ({
        label: humanizeStatus(metric.metricKey) ?? '',
        value: metric.value ?? null,
      })),
    });
  }
  const standardsBadge = statusBadge(standardsProfile.standardsLevel);
  return {
    archetype: 'card',
    title: humanizeStatus(standardsProfile.program) ?? 'Seller standards',
    subtitle: humanizeStatus(standardsProfile.cycle?.cycleType) ?? undefined,
    badges: standardsBadge ? [standardsBadge] : undefined,
    sections,
  };
};

/**
 * Projects a traffic report into a line chart: one series per metric column in
 * the report header, plotted across each record's first dimension value (day or
 * listing). Falls back to the first record's metric count when the header omits
 * metric definitions.
 *
 * @param report - Generated analytics report response from eBay.
 * @returns A line chart view model with one series per metric.
 *
 * @example
 * ```ts
 * const view = mapTrafficReportToChart({ records: [] });
 * ```
 */
export const mapTrafficReportToChart = (report: Report): ChartViewModel => {
  const records = report.records ?? [];
  const metricDefs = report.header?.metrics ?? [];
  const seriesCount = metricDefs.length || records[0]?.metricValues?.length || 0;
  const series: ChartSeries[] = Array.from({ length: seriesCount }, (_unused, metricIndex) => ({
    name: metricDefs[metricIndex]?.key ?? '',
    points: records.flatMap((record) => {
      const y = toNumber(record.metricValues?.[metricIndex]?.value);
      return y === null ? [] : [{ x: toLabel(record.dimensionValues?.[0]?.value), y }];
    }),
  }));
  return {
    archetype: 'chart',
    title: 'Traffic report',
    kind: 'line',
    series,
  };
};

/**
 * Projects customer-service metrics into a bar chart: one series per metric key
 * (e.g. `RATE`, `COUNT`), with a bar per evaluated dimension. Grouping by metric
 * key keeps related bars in the same series regardless of dimension ordering.
 *
 * @param serviceMetrics - Generated customer-service metric response from eBay.
 * @returns A bar chart view model grouped by metric key.
 *
 * @example
 * ```ts
 * const view = mapCustomerServiceMetricToChart({ dimensionMetrics: [] });
 * ```
 */
export const mapCustomerServiceMetricToChart = (
  serviceMetrics: GetCustomerServiceMetricResponse,
): ChartViewModel => {
  const dimensionMetrics = serviceMetrics.dimensionMetrics ?? [];
  const pointsByMetric = new Map<string, ChartSeries['points']>();
  for (const dimensionMetric of dimensionMetrics) {
    const x = toLabel(dimensionMetric.dimension?.value ?? dimensionMetric.dimension?.name);
    for (const metric of dimensionMetric.metrics ?? []) {
      const key = metric.metricKey ?? '';
      const y = toNumber(metric.value);
      if (y === null) {
        continue;
      }
      const points = pointsByMetric.get(key) ?? [];
      points.push({ x, y });
      pointsByMetric.set(key, points);
    }
  }
  const series: ChartSeries[] = Array.from(pointsByMetric, ([name, points]) => ({ name, points }));
  return {
    archetype: 'chart',
    title: 'Customer service metrics',
    kind: 'bar',
    series,
  };
};

/**
 * Buckets remaining API headroom into a tile tone: healthy above a quarter of
 * the quota, warning as it drains, danger near exhaustion. A missing or zero
 * limit is neutral — there is no meaningful ratio to colour.
 */
const headroomTone = (remaining: number, limit: number): Tone => {
  if (limit <= 0) {
    return 'neutral';
  }
  const ratio = remaining / limit;
  if (ratio <= 0.1) {
    return 'danger';
  }
  if (ratio <= 0.25) {
    return 'warning';
  }
  return 'success';
};

/**
 * Flattens a rate-limit response into one tile per API resource, showing calls
 * remaining against the quota with a tone that reflects headroom. Shared by the
 * application- and user-scoped rate-limit tools, which return the same shape.
 */
const rateLimitTiles = (rateLimitReport: RateLimitsResponse): StatTile[] => {
  const tiles: StatTile[] = [];
  for (const rateLimit of rateLimitReport.rateLimits ?? []) {
    for (const resource of rateLimit.resources ?? []) {
      const rate = resource.rates?.[0];
      if (!rate) {
        continue;
      }
      const remaining = rate.remaining ?? 0;
      const limit = rate.limit ?? 0;
      const parts = [rateLimit.apiContext, rateLimit.apiName, resource.name].filter(Boolean);
      tiles.push({
        label: parts.length > 0 ? parts.join(' · ') : '',
        value: remaining.toLocaleString('en-US'),
        sub: `of ${limit.toLocaleString('en-US')}`,
        tone: headroomTone(remaining, limit),
      });
    }
  }
  return tiles;
};

/**
 * Projects application rate limits into a stat grid (calls remaining per resource).
 *
 * @param rateLimitReport - Generated application rate-limit response from eBay.
 * @returns A stat view model with one tile per rated resource.
 *
 * @example
 * ```ts
 * const view = mapRateLimitsToStat({ rateLimits: [] });
 * ```
 */
export const mapRateLimitsToStat = (rateLimitReport: RateLimitsResponse): StatViewModel => ({
  archetype: 'stat',
  title: 'Application rate limits',
  tiles: rateLimitTiles(rateLimitReport),
});

/**
 * Projects user rate limits into a stat grid (per-user calls remaining per resource).
 *
 * @param rateLimitReport - Generated user rate-limit response from eBay.
 * @returns A stat view model with one tile per rated resource.
 *
 * @example
 * ```ts
 * const view = mapUserRateLimitsToStat({ rateLimits: [] });
 * ```
 */
export const mapUserRateLimitsToStat = (rateLimitReport: RateLimitsResponse): StatViewModel => ({
  archetype: 'stat',
  title: 'User rate limits',
  tiles: rateLimitTiles(rateLimitReport),
});
