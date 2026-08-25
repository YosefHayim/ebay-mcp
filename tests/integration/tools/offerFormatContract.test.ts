import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Effect } from 'effect';
import nock from 'nock';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EbaySellerApi } from '@/api/index.js';
import { createEbayMcpRuntime, type EbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';

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

const usd = (value: string) => ({ currency: 'USD', value });

const auctionOffer = {
  sku: 'AUCTION-1',
  marketplaceId: 'EBAY_US',
  format: 'AUCTION',
  listingDuration: 'DAYS_7',
  categoryId: '1234',
  merchantLocationKey: 'WAREHOUSE-1',
  listingPolicies: {
    fulfillmentPolicyId: '12345',
    paymentPolicyId: '67890',
    returnPolicyId: '11111',
    shippingCostOverrides: [{ priority: 1, shippingCost: usd('0.00') }],
  },
  pricingSummary: {
    auctionStartPrice: usd('9.99'),
    auctionReservePrice: usd('25.00'),
    price: usd('49.99'),
  },
};

let client: Client;
let runtime: EbayMcpRuntime;
let originalEnv: NodeJS.ProcessEnv;

beforeEach(async () => {
  vi.clearAllMocks();
  nock.cleanAll();
  nock.disableNetConnect();
  originalEnv = process.env;
  process.env = { ...originalEnv, EBAY_MCP_TOOLS: 'inventory' };

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const config: EbayConfig = {
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    environment: 'sandbox',
    redirectUri: 'https://localhost/callback',
  };
  runtime = createEbayMcpRuntime({ api: new EbaySellerApi(config) });
  await runtime.initializeApi();

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'offer-format-contract-test', version: '1.0.0' });
  await runtime.server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
  await runtime.server.close();
  nock.cleanAll();
  nock.enableNetConnect();
  process.env = originalEnv;
});

describe('offer format advertised MCP schema', () => {
  it('advertises both formats, the auction prices, and the listing durations', async () => {
    const definition = (await client.listTools()).tools.find(
      (tool) => tool.name === 'ebay_create_offer',
    );

    expect(definition?.description).toContain('AUCTION');
    expect(definition?.inputSchema).toMatchObject({
      properties: {
        body: {
          properties: {
            format: { enum: ['AUCTION', 'FIXED_PRICE'] },
            listingDuration: { enum: expect.arrayContaining(['DAYS_7', 'GTC']) },
            pricingSummary: {
              properties: {
                auctionStartPrice: expect.any(Object),
                auctionReservePrice: expect.any(Object),
              },
            },
          },
        },
      },
    });
  });

  it('advertises auction fields on update without the offer keys', async () => {
    const definition = (await client.listTools()).tools.find(
      (tool) => tool.name === 'ebay_update_offer',
    );
    const body = definition?.inputSchema.properties?.body as {
      properties?: Record<string, unknown>;
    };

    expect(body.properties).toHaveProperty('listingDuration');
    expect(body.properties).toHaveProperty('pricingSummary');
    expect(body.properties).not.toHaveProperty('sku');
    expect(body.properties).not.toHaveProperty('format');
  });
});

describe('offer format registered MCP validation', () => {
  it('sends a consistent auction offer to eBay with unmodelled fields intact', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/offer', auctionOffer)
      .reply(201, { offerId: 'OFFER-AUCTION' });

    const result = await client.callTool({
      name: 'ebay_create_offer',
      arguments: { body: auctionOffer },
    });

    expect(result.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });

  it('rejects a GTC auction before an eBay request', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/offer')
      .reply(201, { offerId: 'OFFER-AUCTION' });

    const result = await client.callTool({
      name: 'ebay_create_offer',
      arguments: { body: { ...auctionOffer, listingDuration: 'GTC' } },
    });

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('listingDuration');
    expect(endpoint.isDone()).toBe(false);
  });

  it('rejects availableQuantity on an auction before an eBay request', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/offer')
      .reply(201, { offerId: 'OFFER-AUCTION' });

    const result = await client.callTool({
      name: 'ebay_create_offer',
      arguments: { body: { ...auctionOffer, availableQuantity: 1 } },
    });

    expect(result.isError).toBe(true);
    expect(endpoint.isDone()).toBe(false);
  });

  it('rejects an unknown listing duration before an eBay request', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/offer')
      .reply(201, { offerId: 'OFFER-AUCTION' });

    const result = await client.callTool({
      name: 'ebay_create_offer',
      arguments: { body: { ...auctionOffer, listingDuration: 'DAYS_2' } },
    });

    expect(result.isError).toBe(true);
    expect(endpoint.isDone()).toBe(false);
  });

  it('keeps fixed-price offers working unchanged', async () => {
    const fixedPriceOffer = {
      sku: 'FIXED-1',
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      pricingSummary: { price: usd('19.99') },
    };
    const endpoint = nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/offer', fixedPriceOffer)
      .reply(201, { offerId: 'OFFER-FIXED' });

    const result = await client.callTool({
      name: 'ebay_create_offer',
      arguments: { body: fixedPriceOffer },
    });

    expect(result.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });

  it('rejects a bulk request whose auction reserve sits below its starting bid', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/bulk_create_offer')
      .reply(200, { responses: [] });

    const result = await client.callTool({
      name: 'ebay_bulk_create_offer',
      arguments: {
        body: {
          requests: [
            {
              ...auctionOffer,
              pricingSummary: { auctionStartPrice: usd('20.00'), auctionReservePrice: usd('5.00') },
            },
          ],
        },
      },
    });

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('body.requests[0]');
    expect(endpoint.isDone()).toBe(false);
  });
});
