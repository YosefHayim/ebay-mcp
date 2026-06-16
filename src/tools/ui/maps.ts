/**
 * Tool-result → {@link ViewModel} projections for the interactive MCP Apps layer.
 *
 * Each exported `map*` function is referenced by exactly one tool's `ui.map` in
 * `src/tools/categories/*`. Keeping them here (rather than inline in the category
 * files) does two things: it keeps the tool definitions terse, and it lets the
 * unit tests import every projection directly. Drift protection still holds — the
 * `defineTool` call site type-checks each function against its handler's awaited
 * return type, so a renamed eBay field breaks compilation at the wiring point.
 *
 * Every input type is the exact generated OpenAPI schema the matching handler
 * returns; every output is the archetype view model the React app in `ui/`
 * renders. Formatting lives in `./map-helpers.js` so these stay declarative.
 */

import {
  formatAmount,
  humanizeStatus,
  statusTone,
  toLabel,
  toNumber,
  truncate,
} from '@/tools/ui/map-helpers.js';
import type {
  CardBadge,
  CardSection,
  CardViewModel,
  ChartSeries,
  ChartViewModel,
  TableViewModel,
} from '@/tools/ui/view-models.js';
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

/**
 * Builds a table's contextual footnote from how many rows are shown versus the
 * server's reported total, e.g. `"Showing 25 of 240"`. Returns `undefined` when
 * the response carries no total so the table renders without a footnote.
 */
function footnoteFor(shown: number, total: number | undefined): string | undefined {
  if (total == null) {
    return undefined;
  }
  return total > shown ? `Showing ${shown} of ${total}` : `${total} total`;
}

/** Projects a seller's orders into a table; rows drill into a single-order card. */
export function mapOrdersToTable(result: OrderSearchPagedCollection): TableViewModel {
  const orders = result.orders ?? [];
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
    footnote: footnoteFor(orders.length, result.total),
  };
}

/** Projects an order's shipping fulfillments (tracking/carrier) into a table. */
export function mapFulfillmentsToTable(result: ShippingFulfillmentPagedCollection): TableViewModel {
  const fulfillments = result.fulfillments ?? [];
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
    footnote: footnoteFor(fulfillments.length, result.total),
  };
}

/** Projects a seller's offers into a table; rows drill into a single-offer card. */
export function mapOffersToTable(result: Offers): TableViewModel {
  const offers = result.offers ?? [];
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
        price: formatAmount(offer.pricingSummary?.price),
        quantity: offer.availableQuantity ?? null,
        status: humanizeStatus(offer.status),
      },
      drill: offer.offerId
        ? { tool: 'ebay_get_offer', arguments: { offerId: offer.offerId }, label: 'View offer' }
        : undefined,
    })),
    footnote: footnoteFor(offers.length, result.total),
  };
}

/** Projects inventory items into a table; rows drill into a single-item card. */
export function mapInventoryItemsToTable(result: InventoryItems): TableViewModel {
  const items = result.inventoryItems ?? [];
  return {
    archetype: 'table',
    title: 'Inventory items',
    columns: [
      { key: 'sku', label: 'SKU' },
      { key: 'title', label: 'Title' },
      { key: 'condition', label: 'Condition' },
      { key: 'quantity', label: 'Qty', align: 'right' },
    ],
    rows: items.map((item, index) => ({
      id: item.sku ?? `item-${index}`,
      cells: {
        sku: item.sku ?? null,
        title: truncate(item.product?.title, 60) || null,
        condition: humanizeStatus(item.condition),
        quantity: item.availability?.shipToLocationAvailability?.quantity ?? null,
      },
      drill: item.sku
        ? { tool: 'ebay_get_inventory_item', arguments: { sku: item.sku }, label: 'View item' }
        : undefined,
    })),
    footnote: footnoteFor(items.length, result.total),
  };
}

/** Projects a seller's inventory locations into a table. */
export function mapLocationsToTable(result: LocationResponse): TableViewModel {
  const locations = result.locations ?? [];
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
    footnote: footnoteFor(locations.length, result.total),
  };
}

/** Projects payment-dispute summaries into a table; rows drill into a dispute card. */
export function mapDisputeSummariesToTable(result: DisputeSummaryResponse): TableViewModel {
  const disputes = result.paymentDisputeSummaries ?? [];
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
    footnote: footnoteFor(disputes.length, result.total),
  };
}

/** Projects a single order into a detail card with status badges and line items. */
export function mapOrderToCard(result: Order): CardViewModel {
  const lineItems = result.lineItems ?? [];
  return {
    archetype: 'card',
    title: result.orderId ? `Order ${result.orderId}` : 'Order',
    subtitle: result.buyer?.username ? `Buyer: ${result.buyer.username}` : undefined,
    badges: [
      {
        label: humanizeStatus(result.orderFulfillmentStatus),
        tone: statusTone(result.orderFulfillmentStatus),
      },
      {
        label: humanizeStatus(result.orderPaymentStatus),
        tone: statusTone(result.orderPaymentStatus),
      },
    ],
    sections: [
      {
        heading: 'Summary',
        fields: [
          { label: 'Created', value: result.creationDate ?? null },
          { label: 'Total', value: formatAmount(result.pricingSummary?.total) },
          { label: 'Line items', value: lineItems.length },
        ],
      },
      {
        heading: 'Items',
        fields: lineItems.map((lineItem) => ({
          label: truncate(lineItem.title, 60) || (lineItem.sku ?? 'Item'),
          value: lineItem.quantity != null ? `×${lineItem.quantity}` : null,
        })),
      },
    ],
  };
}

/** Projects a single offer into a detail card with pricing and listing sections. */
export function mapOfferToCard(result: EbayOfferDetailsWithAll): CardViewModel {
  const badges: CardBadge[] = [
    { label: humanizeStatus(result.status), tone: statusTone(result.status) },
  ];
  if (result.format) {
    badges.push({ label: humanizeStatus(result.format) });
  }
  return {
    archetype: 'card',
    title: result.offerId ? `Offer ${result.offerId}` : 'Offer',
    subtitle: result.sku ? `SKU: ${result.sku}` : undefined,
    badges,
    sections: [
      {
        heading: 'Pricing',
        fields: [
          { label: 'Price', value: formatAmount(result.pricingSummary?.price) },
          { label: 'Available quantity', value: result.availableQuantity ?? null },
          { label: 'Marketplace', value: result.marketplaceId ?? null },
        ],
      },
      {
        heading: 'Listing',
        fields: [
          { label: 'Listing ID', value: result.listing?.listingId ?? null },
          { label: 'Listing status', value: humanizeStatus(result.listing?.listingStatus) },
        ],
      },
    ],
  };
}

/** Projects a single inventory item into a detail card (product + availability). */
export function mapInventoryItemToCard(result: InventoryItemWithSkuLocaleGroupid): CardViewModel {
  const product = result.product;
  return {
    archetype: 'card',
    title: result.sku ? `SKU ${result.sku}` : 'Inventory item',
    subtitle: product?.title ? truncate(product.title, 80) : undefined,
    badges: [{ label: humanizeStatus(result.condition), tone: statusTone(result.condition) }],
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
            value: result.availability?.shipToLocationAvailability?.quantity ?? null,
          },
        ],
      },
    ],
  };
}

/** Projects a single payment dispute into a detail card, listing available actions. */
export function mapDisputeToCard(result: PaymentDispute): CardViewModel {
  const sections: CardSection[] = [
    {
      heading: 'Details',
      fields: [
        { label: 'Order', value: result.orderId ?? null },
        { label: 'Reason', value: humanizeStatus(result.reason) },
        { label: 'Amount', value: formatAmount(result.amount) },
        { label: 'Buyer', value: result.buyerUsername ?? null },
        { label: 'Opened', value: result.openDate ?? null },
        { label: 'Respond by', value: result.respondByDate ?? null },
      ],
    },
  ];
  if (result.availableChoices?.length) {
    sections.push({
      heading: 'Available actions',
      fields: result.availableChoices.map((choice) => ({
        label: humanizeStatus(choice),
        value: null,
      })),
    });
  }
  return {
    archetype: 'card',
    title: result.paymentDisputeId ? `Dispute ${result.paymentDisputeId}` : 'Payment dispute',
    subtitle: result.orderId ? `Order: ${result.orderId}` : undefined,
    badges: [
      {
        label: humanizeStatus(result.paymentDisputeStatus),
        tone: statusTone(result.paymentDisputeStatus),
      },
    ],
    sections,
  };
}

/** Projects a seller standards profile into a detail card (cycle + per-metric values). */
export function mapStandardsProfileToCard(result: StandardsProfile): CardViewModel {
  const metrics = result.metrics ?? [];
  const sections: CardSection[] = [
    {
      heading: 'Profile',
      fields: [
        { label: 'Cycle', value: humanizeStatus(result.cycle?.cycleType) },
        { label: 'Evaluation date', value: result.cycle?.evaluationDate ?? null },
        { label: 'Evaluation reason', value: humanizeStatus(result.evaluationReason) },
      ],
    },
  ];
  if (metrics.length) {
    sections.push({
      heading: 'Metrics',
      fields: metrics.map((metric) => ({
        label: humanizeStatus(metric.metricKey),
        value: metric.value ?? null,
      })),
    });
  }
  return {
    archetype: 'card',
    title: result.program ? humanizeStatus(result.program) : 'Seller standards',
    subtitle: result.cycle?.cycleType ? humanizeStatus(result.cycle.cycleType) : undefined,
    badges: [
      { label: humanizeStatus(result.standardsLevel), tone: statusTone(result.standardsLevel) },
    ],
    sections,
  };
}

/**
 * Projects a traffic report into a line chart: one series per metric column in
 * the report header, plotted across each record's first dimension value (day or
 * listing). Falls back to the first record's metric count when the header omits
 * metric definitions.
 */
export function mapTrafficReportToChart(result: Report): ChartViewModel {
  const records = result.records ?? [];
  const metricDefs = result.header?.metrics ?? [];
  const seriesCount = metricDefs.length || records[0]?.metricValues?.length || 0;
  const series: ChartSeries[] = Array.from({ length: seriesCount }, (_unused, metricIndex) => ({
    name: metricDefs[metricIndex]?.key ?? `Metric ${metricIndex + 1}`,
    points: records.map((record) => ({
      x: toLabel(record.dimensionValues?.[0]?.value),
      y: toNumber(record.metricValues?.[metricIndex]?.value),
    })),
  }));
  return {
    archetype: 'chart',
    title: 'Traffic report',
    kind: 'line',
    series,
  };
}

/**
 * Projects customer-service metrics into a bar chart: one series per metric key
 * (e.g. `RATE`, `COUNT`), with a bar per evaluated dimension. Grouping by metric
 * key keeps related bars in the same series regardless of dimension ordering.
 */
export function mapCustomerServiceMetricToChart(
  result: GetCustomerServiceMetricResponse
): ChartViewModel {
  const dimensionMetrics = result.dimensionMetrics ?? [];
  const pointsByMetric = new Map<string, ChartSeries['points']>();
  for (const dimensionMetric of dimensionMetrics) {
    const x = toLabel(dimensionMetric.dimension?.value ?? dimensionMetric.dimension?.name);
    for (const metric of dimensionMetric.metrics ?? []) {
      const key = metric.metricKey ?? 'Value';
      const points = pointsByMetric.get(key) ?? [];
      points.push({ x, y: toNumber(metric.value) });
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
}
