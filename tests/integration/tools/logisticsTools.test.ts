import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/index.js';
import { createEbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
};

vi.mock('../../../src/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

const API_HOST = 'https://api.sandbox.ebay.com';
const BASE = '/sell/logistics/v1_beta';
const config: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
  redirectUri: 'https://localhost/callback',
  marketplaceId: 'EBAY_US',
};
const address = {
  addressLine1: '2145 Hamilton Ave',
  city: 'San Jose',
  stateOrProvince: 'CA',
  postalCode: '95125',
  countryCode: 'US',
};
const shippingQuoteRequest = {
  orders: [{ orderId: '12-34567-89012', channel: 'EBAY' }],
  packageSpecification: {
    weight: { value: '2.5', unit: 'POUND' },
    dimensions: { length: '10', width: '8', height: '4', unit: 'INCH' },
  },
  shipFrom: {
    fullName: 'Seller Name',
    contactAddress: address,
    primaryPhone: { phoneNumber: '4085551234' },
  },
  shipTo: { fullName: 'Buyer Name', contactAddress: { ...address, addressLine1: '1 Main St' } },
};
const quote = {
  shippingQuoteId: 'QUOTE-1',
  expirationDate: '2026-10-02T12:00:00.000Z',
  rates: [
    {
      rateId: 'RATE-1',
      shippingCarrierCode: 'USPS',
      shippingServiceCode: 'USPSPriority',
      baseShippingCost: { currency: 'USD', value: '8.25' },
    },
  ],
};
const shipmentRequest = {
  shippingQuoteId: 'QUOTE-1',
  rateId: 'RATE-1',
  additionalOptions: [
    { optionType: 'SIGNATURE', additionalCost: { currency: 'USD', value: '3.10' } },
  ],
  labelSize: '4"x6"',
};
const shipment = {
  shipmentId: 'SHIP-1',
  shipmentTrackingNumber: '9400111899223456789012',
  labelDownloadUrl: `${API_HOST}${BASE}/shipment/SHIP-1/download_label_file`,
  rate: { rateId: 'RATE-1', totalShippingCost: { currency: 'USD', value: '11.35' } },
};
const LOGISTICS_TOOLS = {
  ebay_create_shipping_quote: { required: ['shippingQuoteRequest'], readOnlyHint: false },
  ebay_get_shipping_quote: { required: ['shippingQuoteId'], readOnlyHint: true },
  ebay_create_shipment_from_shipping_quote: { required: ['shipmentRequest'], readOnlyHint: false },
  ebay_get_shipment: { required: ['shipmentId'], readOnlyHint: true },
  ebay_cancel_shipment: { required: ['shipmentId'], readOnlyHint: false },
  ebay_download_shipping_label_file: { required: ['shipmentId'], readOnlyHint: true },
};

let client: Client;
let runtime: ReturnType<typeof createEbayMcpRuntime>;

/** Calls a tool and parses the JSON document carried by its single text block. */
const callJsonTool = async (name: string, args: Record<string, unknown>) => {
  const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  const [block] = result.content;
  return {
    isError: result.isError === true,
    payload: block?.type === 'text' ? (JSON.parse(block.text) as unknown) : undefined,
  };
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'logistics');
  nock.cleanAll();
  nock.disableNetConnect();

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const api = new EbaySellerApi(config);
  await Effect.runPromise(api.initialize());
  runtime = createEbayMcpRuntime({
    api,
    serverConfig: { name: 'logistics-test', version: '0.0.0' },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'integration-client', version: '0.0.0' });
  await runtime.server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
  await runtime.server.close();
  nock.cleanAll();
  nock.enableNetConnect();
  vi.unstubAllEnvs();
});

describe('logistics tool registration', () => {
  it('advertises every Logistics tool with its required inputs, annotations, and scope note', async () => {
    const tools = new Map((await client.listTools()).tools.map((tool) => [tool.name, tool]));

    for (const [name, expected] of Object.entries(LOGISTICS_TOOLS)) {
      const tool = tools.get(name);
      expect(tool?.inputSchema.required).toEqual(expected.required);
      expect(tool?.annotations?.readOnlyHint).toBe(expected.readOnlyHint);
      expect(tool?.description).toContain('https://api.ebay.com/oauth/api_scope/sell.logistics');
      expect(tool?.description).toContain('EBAY_OAUTH_SCOPES');
      expect(tool?.description).toContain('limited release');
    }
    expect(tools.get('ebay_cancel_shipment')?.annotations?.destructiveHint).toBe(true);
    expect(tools.get('ebay_create_shipment_from_shipping_quote')?.description).toContain(
      'Purchase postage',
    );
  });
});

describe('shipping quote tools', () => {
  it('creates a quote with the request body and the requested marketplace header', async () => {
    const request = nock(API_HOST)
      .post(`${BASE}/shipping_quote`, shippingQuoteRequest)
      .matchHeader('x-ebay-c-marketplace-id', 'EBAY_MOTORS_US')
      .reply(201, quote);

    const result = await callJsonTool('ebay_create_shipping_quote', {
      shippingQuoteRequest,
      marketplaceId: 'EBAY_MOTORS_US',
    });

    expect(result).toEqual({ isError: false, payload: quote });
    expect(request.isDone()).toBe(true);
  });

  it('gets a quote by ID', async () => {
    const request = nock(API_HOST).get(`${BASE}/shipping_quote/QUOTE-1`).reply(200, quote);

    const result = await callJsonTool('ebay_get_shipping_quote', { shippingQuoteId: 'QUOTE-1' });

    expect(result).toEqual({ isError: false, payload: quote });
    expect(request.isDone()).toBe(true);
  });

  it('rejects an invalid quote request before calling eBay', async () => {
    const request = nock(API_HOST).post(`${BASE}/shipping_quote`).reply(201, quote);
    const orders = Array.from({ length: 11 }, (_, index) => ({ orderId: `ORDER-${index}` }));

    const result = CallToolResultSchema.parse(
      await client.callTool({
        name: 'ebay_create_shipping_quote',
        arguments: { shippingQuoteRequest: { ...shippingQuoteRequest, orders } },
      }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0]).toMatchObject({
      type: 'text',
      text: expect.stringContaining('Array must contain at most 10 element(s)'),
    });
    expect(request.isDone()).toBe(false);
  });
});

describe('shipment purchase tools', () => {
  it('purchases a shipment with the configured marketplace header', async () => {
    const request = nock(API_HOST)
      .post(`${BASE}/shipment/create_from_shipping_quote`, shipmentRequest)
      .matchHeader('x-ebay-c-marketplace-id', 'EBAY_US')
      .reply(201, shipment);

    const result = await callJsonTool('ebay_create_shipment_from_shipping_quote', {
      shipmentRequest,
    });

    expect(result).toEqual({ isError: false, payload: shipment });
    expect(request.isDone()).toBe(true);
  });

  it('gets a shipment by ID', async () => {
    const request = nock(API_HOST).get(`${BASE}/shipment/SHIP-1`).reply(200, shipment);

    const result = await callJsonTool('ebay_get_shipment', { shipmentId: 'SHIP-1' });

    expect(result).toEqual({ isError: false, payload: shipment });
    expect(request.isDone()).toBe(true);
  });

  it('surfaces a rejected purchase with the eBay error detail', async () => {
    const errors = [
      { errorId: 90_030, domain: 'API_LOGISTICS', message: 'Payment could not be completed.' },
    ];
    nock(API_HOST).post(`${BASE}/shipment/create_from_shipping_quote`).reply(400, { errors });

    const result = await callJsonTool('ebay_create_shipment_from_shipping_quote', {
      shipmentRequest,
    });

    expect(result.isError).toBe(true);
    expect(result.payload).toMatchObject({ status: 400, details: errors });
  });
});

describe('shipment cancel and label tools', () => {
  it('cancels a shipment without a request body', async () => {
    const canceled = {
      ...shipment,
      cancellation: { cancellationStatus: 'CANCELED_BY_SELLER' },
    };
    const request = nock(API_HOST)
      .post(`${BASE}/shipment/SHIP-1/cancel`, (body) => body === '')
      .reply(200, canceled);

    const result = await callJsonTool('ebay_cancel_shipment', { shipmentId: 'SHIP-1' });

    expect(result).toEqual({ isError: false, payload: canceled });
    expect(request.isDone()).toBe(true);
  });

  it('returns the shipping label as an embedded PDF resource', async () => {
    const pdf = Buffer.from('%PDF-1.7\nlabel\n%%EOF');
    const request = nock(API_HOST)
      .get(`${BASE}/shipment/SHIP-1/download_label_file`)
      .matchHeader('accept', 'application/pdf')
      .reply(200, pdf, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="SHIP-1.pdf"',
      });

    const result = CallToolResultSchema.parse(
      await client.callTool({
        name: 'ebay_download_shipping_label_file',
        arguments: { shipmentId: 'SHIP-1' },
      }),
    );

    expect(result.isError).not.toBe(true);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: `Shipping label for shipment SHIP-1 SHIP-1.pdf (application/pdf, ${pdf.length} bytes)`,
      },
      {
        type: 'resource',
        resource: {
          uri: 'ebay-logistics://shipment/SHIP-1/label',
          mimeType: 'application/pdf',
          blob: pdf.toString('base64'),
        },
      },
    ]);
    expect(request.isDone()).toBe(true);
  });
});
