import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  humanizeStatus,
  statusTone,
  toLabel,
  toNumber,
  truncate,
} from '@/tools/ui/map-helpers.js';
import {
  mapCustomerServiceMetricToChart,
  mapDisputeSummariesToTable,
  mapDisputeToCard,
  mapFulfillmentsToTable,
  mapInventoryItemsToTable,
  mapInventoryItemToCard,
  mapLocationsToTable,
  mapOffersToTable,
  mapOfferToCard,
  mapOrdersToTable,
  mapOrderToCard,
  mapStandardsProfileToCard,
  mapTrafficReportToChart,
} from '@/tools/ui/maps.js';

/**
 * Builds a traffic-report `Value` leaf. The OpenAPI generator types the leaf as
 * `Record<string, never>`, but at runtime eBay returns a number or numeric
 * string — the gotcha `toNumber`/`toLabel` exist to absorb. The documented
 * `unknown` hop keeps the fixture honest about the real wire shape.
 */
function reportValue(value: string | number): { value: Record<string, never>; applicable: boolean } {
  return { value: value as unknown as Record<string, never>, applicable: true };
}

describe('map-helpers', () => {
  describe('formatAmount', () => {
    it('renders value and currency', () => {
      expect(formatAmount({ value: '25.99', currency: 'USD' })).toBe('25.99 USD');
    });

    it('falls back to bare value without currency', () => {
      expect(formatAmount({ value: '25.99' })).toBe('25.99');
    });

    it('returns null for a missing amount', () => {
      expect(formatAmount(undefined)).toBeNull();
      expect(formatAmount({ currency: 'USD' })).toBeNull();
    });
  });

  describe('humanizeStatus', () => {
    it('title-cases SCREAMING_SNAKE_CASE', () => {
      expect(humanizeStatus('NOT_STARTED')).toBe('Not started');
      expect(humanizeStatus('FULFILLED')).toBe('Fulfilled');
    });

    it('returns an em dash for a missing status', () => {
      expect(humanizeStatus(undefined)).toBe('—');
    });
  });

  describe('statusTone', () => {
    it('buckets statuses by keyword', () => {
      expect(statusTone('PAYMENT_FAILED')).toBe('danger');
      expect(statusTone('IN_PROGRESS')).toBe('warning');
      expect(statusTone('FULFILLED')).toBe('success');
    });

    it('defaults unknown and missing statuses to neutral', () => {
      expect(statusTone('SOMETHING_NEW')).toBe('neutral');
      expect(statusTone(undefined)).toBe('neutral');
    });
  });

  describe('toNumber / toLabel', () => {
    it('coerces numeric strings and numbers', () => {
      expect(toNumber('42')).toBe(42);
      expect(toNumber(42)).toBe(42);
    });

    it('defaults non-numeric input to 0', () => {
      expect(toNumber('abc')).toBe(0);
      expect(toNumber({})).toBe(0);
      expect(toNumber(undefined)).toBe(0);
    });

    it('labels primitives and blanks out objects', () => {
      expect(toLabel('DAY')).toBe('DAY');
      expect(toLabel(7)).toBe('7');
      expect(toLabel({})).toBe('');
    });
  });

  describe('truncate', () => {
    it('shortens text past the limit with an ellipsis', () => {
      expect(truncate('abcdef', 4)).toBe('abc…');
    });

    it('leaves short text untouched and blanks missing text', () => {
      expect(truncate('abc', 4)).toBe('abc');
      expect(truncate(undefined)).toBe('');
    });
  });
});

describe('table mappers', () => {
  it('maps orders with formatted cells, a drill ref, and a footnote', () => {
    const view = mapOrdersToTable({
      orders: [
        {
          orderId: '12-3456',
          creationDate: '2026-06-01T00:00:00.000Z',
          orderFulfillmentStatus: 'FULFILLED',
          orderPaymentStatus: 'PAID',
          buyer: { username: 'buyer1' },
          pricingSummary: { total: { value: '25.99', currency: 'USD' } },
        },
      ],
      total: 240,
    });

    expect(view.archetype).toBe('table');
    expect(view.columns.map((column) => column.key)).toEqual([
      'orderId',
      'creationDate',
      'fulfillment',
      'payment',
      'buyer',
      'total',
    ]);
    expect(view.rows).toHaveLength(1);
    const [row] = view.rows;
    expect(row.id).toBe('12-3456');
    expect(row.cells.fulfillment).toBe('Fulfilled');
    expect(row.cells.total).toBe('25.99 USD');
    expect(row.drill).toEqual({
      tool: 'ebay_get_order',
      arguments: { orderId: '12-3456' },
      label: 'View order',
    });
    expect(view.footnote).toBe('Showing 1 of 240');
  });

  it('returns an empty table with no footnote for an empty order page', () => {
    const view = mapOrdersToTable({});
    expect(view.rows).toEqual([]);
    expect(view.footnote).toBeUndefined();
  });

  it('maps shipping fulfillments', () => {
    const view = mapFulfillmentsToTable({
      fulfillments: [
        {
          fulfillmentId: 'f1',
          shippingCarrierCode: 'USPS',
          shipmentTrackingNumber: '9400100',
          shippedDate: '2026-06-02T00:00:00.000Z',
        },
      ],
    });
    expect(view.archetype).toBe('table');
    expect(view.rows[0].cells.carrier).toBe('USPS');
    expect(view.rows[0].cells.tracking).toBe('9400100');
  });

  it('maps offers with a drill ref', () => {
    const view = mapOffersToTable({
      offers: [
        {
          offerId: 'o1',
          sku: 'SKU-1',
          marketplaceId: 'EBAY_US',
          format: 'FIXED_PRICE',
          pricingSummary: { price: { value: '9.99', currency: 'USD' } },
          availableQuantity: 5,
          status: 'PUBLISHED',
        },
      ],
      total: 1,
    });
    expect(view.rows[0].cells.format).toBe('Fixed price');
    expect(view.rows[0].cells.price).toBe('9.99 USD');
    expect(view.rows[0].drill?.tool).toBe('ebay_get_offer');
    expect(view.footnote).toBe('1 total');
  });

  it('maps inventory items, truncating long titles', () => {
    const longTitle = 'x'.repeat(80);
    const view = mapInventoryItemsToTable({
      inventoryItems: [
        {
          sku: 'SKU-1',
          product: { title: longTitle },
          condition: 'NEW',
          availability: { shipToLocationAvailability: { quantity: 3 } },
        },
      ],
    });
    expect(view.rows[0].cells.condition).toBe('New');
    expect(view.rows[0].cells.quantity).toBe(3);
    expect(String(view.rows[0].cells.title)).toHaveLength(60);
    expect(view.rows[0].drill?.arguments).toEqual({ sku: 'SKU-1' });
  });

  it('maps inventory locations, joining location types', () => {
    const view = mapLocationsToTable({
      locations: [
        {
          merchantLocationKey: 'WAREHOUSE-1',
          name: 'Main warehouse',
          merchantLocationStatus: 'ENABLED',
          locationTypes: ['WAREHOUSE', 'STORE'],
          phone: '555-0100',
        },
      ],
    });
    expect(view.rows[0].cells.status).toBe('Enabled');
    expect(view.rows[0].cells.types).toBe('WAREHOUSE, STORE');
  });

  it('maps dispute summaries with a drill ref', () => {
    const view = mapDisputeSummariesToTable({
      paymentDisputeSummaries: [
        {
          paymentDisputeId: 'd1',
          orderId: 'ord1',
          paymentDisputeStatus: 'ACTION_NEEDED',
          reason: 'ITEM_NOT_RECEIVED',
          amount: { value: '12.00', currency: 'USD' },
          buyerUsername: 'buyer1',
          openDate: '2026-06-03T00:00:00.000Z',
        },
      ],
    });
    expect(view.rows[0].cells.status).toBe('Action needed');
    expect(view.rows[0].cells.amount).toBe('12.00 USD');
    expect(view.rows[0].drill?.tool).toBe('ebay_get_payment_dispute');
  });
});

describe('card mappers', () => {
  it('maps an order to a detail card with badges and line items', () => {
    const view = mapOrderToCard({
      orderId: '12-3456',
      orderFulfillmentStatus: 'FULFILLED',
      orderPaymentStatus: 'PAID',
      buyer: { username: 'buyer1' },
      creationDate: '2026-06-01T00:00:00.000Z',
      pricingSummary: { total: { value: '25.99', currency: 'USD' } },
      lineItems: [{ title: 'Widget', sku: 'SKU-1', quantity: 2 }],
    });
    expect(view.archetype).toBe('card');
    expect(view.title).toBe('Order 12-3456');
    expect(view.badges).toEqual([
      { label: 'Fulfilled', tone: 'success' },
      { label: 'Paid', tone: 'success' },
    ]);
    const summary = view.sections.find((section) => section.heading === 'Summary');
    expect(summary?.fields).toContainEqual({ label: 'Total', value: '25.99 USD' });
    const items = view.sections.find((section) => section.heading === 'Items');
    expect(items?.fields[0]).toEqual({ label: 'Widget', value: '×2' });
  });

  it('maps an offer to a detail card', () => {
    const view = mapOfferToCard({
      offerId: 'o1',
      sku: 'SKU-1',
      status: 'PUBLISHED',
      format: 'FIXED_PRICE',
      marketplaceId: 'EBAY_US',
      availableQuantity: 5,
      pricingSummary: { price: { value: '9.99', currency: 'USD' } },
      listing: { listingId: 'L1', listingStatus: 'ACTIVE' },
    });
    expect(view.title).toBe('Offer o1');
    expect(view.badges?.[0]).toEqual({ label: 'Published', tone: 'success' });
    expect(view.badges?.[1]).toEqual({ label: 'Fixed price' });
  });

  it('maps an inventory item to a detail card', () => {
    const view = mapInventoryItemToCard({
      sku: 'SKU-1',
      condition: 'NEW',
      product: { title: 'Widget', brand: 'Acme', mpn: 'MPN-1', description: 'A widget' },
      availability: { shipToLocationAvailability: { quantity: 3 } },
    });
    expect(view.title).toBe('SKU SKU-1');
    const product = view.sections.find((section) => section.heading === 'Product');
    expect(product?.fields).toContainEqual({ label: 'Brand', value: 'Acme' });
  });

  it('maps a payment dispute to a card, listing available actions', () => {
    const view = mapDisputeToCard({
      paymentDisputeId: 'd1',
      orderId: 'ord1',
      paymentDisputeStatus: 'ACTION_NEEDED',
      reason: 'ITEM_NOT_RECEIVED',
      amount: { value: '12.00', currency: 'USD' },
      buyerUsername: 'buyer1',
      openDate: '2026-06-03T00:00:00.000Z',
      availableChoices: ['ACCEPT', 'CONTEST'],
    });
    expect(view.title).toBe('Dispute d1');
    const actions = view.sections.find((section) => section.heading === 'Available actions');
    expect(actions?.fields.map((field) => field.label)).toEqual(['Accept', 'Contest']);
  });

  it('maps a seller standards profile to a card with per-metric fields', () => {
    const view = mapStandardsProfileToCard({
      program: 'PROGRAM_US',
      standardsLevel: 'TOP_RATED',
      cycle: { cycleType: 'CURRENT', evaluationDate: '2026-06-01T00:00:00.000Z' },
      metrics: [{ metricKey: 'TRANSACTION_COUNT', value: '120' }],
    });
    expect(view.badges?.[0]).toEqual({ label: 'Top rated', tone: 'success' });
    const metrics = view.sections.find((section) => section.heading === 'Metrics');
    expect(metrics?.fields[0]).toEqual({ label: 'Transaction count', value: '120' });
  });
});

describe('chart mappers', () => {
  it('maps a traffic report to a line series per header metric', () => {
    const view = mapTrafficReportToChart({
      header: { metrics: [{ key: 'LISTING_VIEWS' }, { key: 'SALES' }] },
      records: [
        {
          dimensionValues: [reportValue('2026-06-01')],
          metricValues: [reportValue(100), reportValue('5')],
        },
        {
          dimensionValues: [reportValue('2026-06-02')],
          metricValues: [reportValue(150), reportValue('8')],
        },
      ],
    });
    expect(view.archetype).toBe('chart');
    expect(view.kind).toBe('line');
    expect(view.series.map((series) => series.name)).toEqual(['LISTING_VIEWS', 'SALES']);
    expect(view.series[0].points).toEqual([
      { x: '2026-06-01', y: 100 },
      { x: '2026-06-02', y: 150 },
    ]);
    expect(view.series[1].points[1]).toEqual({ x: '2026-06-02', y: 8 });
  });

  it('groups customer-service metrics into a bar series per metric key', () => {
    const view = mapCustomerServiceMetricToChart({
      dimensionMetrics: [
        {
          dimension: { name: 'Domestic', value: 'DOMESTIC' },
          metrics: [
            { metricKey: 'COUNT', value: '10' },
            { metricKey: 'RATE', value: '0.5' },
          ],
        },
        {
          dimension: { name: 'International', value: 'INTERNATIONAL_MATURED_REGION' },
          metrics: [
            { metricKey: 'COUNT', value: '4' },
            { metricKey: 'RATE', value: '0.25' },
          ],
        },
      ],
    });
    expect(view.kind).toBe('bar');
    expect(view.series.map((series) => series.name)).toEqual(['COUNT', 'RATE']);
    expect(view.series[0].points).toEqual([
      { x: 'DOMESTIC', y: 10 },
      { x: 'INTERNATIONAL_MATURED_REGION', y: 4 },
    ]);
  });
});
