import type { EbayApiClient } from '@/api/client.js';
import { MAX_INLINE_DOWNLOAD_BYTES } from '@/api/shared/download.js';
import { LogisticsApi } from '@/api/order-management/logistics.js';
import { MarketplaceId, WeightUnit } from '@/types/ebayEnums.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = '/sell/logistics/v1_beta';
const address = {
  addressLine1: '2145 Hamilton Ave',
  city: 'San Jose',
  stateOrProvince: 'CA',
  postalCode: '95125',
  countryCode: 'US',
};
const shippingQuoteRequest = {
  orders: [{ orderId: '12-34567-89012', channel: 'EBAY' }],
  packageSpecification: { weight: { value: '2.5', unit: WeightUnit.POUND } },
  shipFrom: { fullName: 'Seller', contactAddress: address },
  shipTo: { fullName: 'Buyer', contactAddress: address },
};
const shipmentRequest = { shippingQuoteId: 'QUOTE-1', rateId: 'RATE-1', labelSize: '4"x6"' };
const client = { get: vi.fn(), post: vi.fn(), getForResponse: vi.fn() };
// LogisticsApi only calls these mocked client methods.
const logistics = new LogisticsApi(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('LogisticsApi shipping quotes', () => {
  it('creates a quote with the body and the requested marketplace header', async () => {
    const quote = { shippingQuoteId: 'QUOTE-1', rates: [{ rateId: 'RATE-1' }] };
    client.post.mockResolvedValue(quote);

    const result = await Effect.runPromise(
      logistics.createShippingQuote({ shippingQuoteRequest, marketplaceId: MarketplaceId.EBAY_US }),
    );

    expect(result).toBe(quote);
    expect(client.post).toHaveBeenCalledWith(`${BASE}/shipping_quote`, shippingQuoteRequest, {
      headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
    });
  });

  it('leaves the configured marketplace header in place without an override', async () => {
    client.post.mockResolvedValue({});

    await Effect.runPromise(logistics.createShippingQuote({ shippingQuoteRequest }));

    expect(client.post).toHaveBeenCalledWith(`${BASE}/shipping_quote`, shippingQuoteRequest);
  });

  it('gets a quote by its URL-encoded ID', async () => {
    const quote = { shippingQuoteId: 'Q/1 %' };
    client.get.mockResolvedValue(quote);

    const result = await Effect.runPromise(
      logistics.getShippingQuote({ shippingQuoteId: 'Q/1 %' }),
    );

    expect(result).toBe(quote);
    expect(client.get).toHaveBeenCalledWith(`${BASE}/shipping_quote/Q%2F1%20%25`);
  });
});

describe('LogisticsApi shipments', () => {
  it('purchases a shipment from a quote rate with the marketplace header', async () => {
    const shipment = { shipmentId: 'SHIP-1', shipmentTrackingNumber: '9400' };
    client.post.mockResolvedValue(shipment);

    const result = await Effect.runPromise(
      logistics.createFromShippingQuote({ shipmentRequest, marketplaceId: MarketplaceId.EBAY_US }),
    );

    expect(result).toBe(shipment);
    expect(client.post).toHaveBeenCalledWith(
      `${BASE}/shipment/create_from_shipping_quote`,
      shipmentRequest,
      { headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } },
    );
  });

  it('gets a shipment by its URL-encoded ID', async () => {
    const shipment = { shipmentId: 'S/1' };
    client.get.mockResolvedValue(shipment);

    expect(await Effect.runPromise(logistics.getShipment({ shipmentId: 'S/1' }))).toBe(shipment);
    expect(client.get).toHaveBeenCalledWith(`${BASE}/shipment/S%2F1`);
  });

  it('cancels a shipment with a bodiless POST', async () => {
    const shipment = { shipmentId: 'S/1', cancellation: { cancellationStatus: 'CANCELED' } };
    client.post.mockResolvedValue(shipment);

    expect(await Effect.runPromise(logistics.cancelShipment({ shipmentId: 'S/1' }))).toBe(shipment);
    expect(client.post).toHaveBeenCalledWith(`${BASE}/shipment/S%2F1/cancel`);
  });

  it('downloads the label as PDF bytes with its content type and file name', async () => {
    const pdf = Buffer.from('%PDF-1.7\nlabel');
    client.getForResponse.mockResolvedValue({
      data: pdf,
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'inline; filename="label.pdf"',
      },
    });

    const file = await Effect.runPromise(logistics.downloadLabelFile({ shipmentId: 'S/1' }));

    expect(file).toEqual({ bytes: pdf, contentType: 'application/pdf', fileName: 'label.pdf' });
    expect(client.getForResponse).toHaveBeenCalledWith(
      `${BASE}/shipment/S%2F1/download_label_file`,
      undefined,
      { headers: { Accept: 'application/pdf' }, responseType: 'arraybuffer' },
    );
  });
});

describe('LogisticsApi failures', () => {
  it('rejects missing identifiers and bodies before any HTTP request', async () => {
    const programs: Effect.Effect<unknown, { readonly _tag: string }>[] = [
      logistics.getShippingQuote({ shippingQuoteId: '' }),
      logistics.getShipment({ shipmentId: '' }),
      logistics.cancelShipment({ shipmentId: '' }),
      logistics.downloadLabelFile({ shipmentId: '' }),
      logistics.createFromShippingQuote({ shipmentRequest: { ...shipmentRequest, rateId: '' } }),
      logistics.createFromShippingQuote({
        shipmentRequest: { ...shipmentRequest, shippingQuoteId: '' },
      }),
      logistics.createShippingQuote(invalidInput({})),
    ];

    const errors = await Effect.runPromise(
      Effect.all(programs.map((program) => Effect.flip(program))),
    );

    expect(errors.map((error) => error._tag)).toEqual(programs.map(() => 'EndpointInputError'));
    expect(client.get).not.toHaveBeenCalled();
    expect(client.post).not.toHaveBeenCalled();
    expect(client.getForResponse).not.toHaveBeenCalled();
  });

  it('surfaces eBay failures as EbayApiError with the request method and path', async () => {
    client.post.mockRejectedValue(new Error('eBay API Error: Payment could not be completed'));

    const error = await Effect.runPromise(
      Effect.flip(logistics.createFromShippingQuote({ shipmentRequest })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'POST',
      path: `${BASE}/shipment/create_from_shipping_quote`,
    });
  });

  it('refuses a label too large to return inline', async () => {
    client.getForResponse.mockResolvedValue({
      data: Buffer.alloc(MAX_INLINE_DOWNLOAD_BYTES + 1),
      status: 200,
      headers: { 'content-type': 'application/pdf' },
    });

    const error = await Effect.runPromise(
      Effect.flip(logistics.downloadLabelFile({ shipmentId: 'S-1' })),
    );

    expect(error._tag).toBe('DownloadTooLargeError');
  });
});
