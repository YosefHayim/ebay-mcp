import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Effect } from 'effect';
import nock from 'nock';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EbaySellerApi } from '@/api/ebaySellerApi.js';
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

describe('ebay_get_offers registered MCP contract', () => {
  let client: Client;
  let runtime: EbayMcpRuntime;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    vi.clearAllMocks();
    nock.cleanAll();
    nock.disableNetConnect();
    originalEnv = process.env;
    process.env = { ...originalEnv, EBAY_MCP_TOOLS: 'inventory' };
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;

    mockOAuthClient.hasUserTokens.mockReturnValue(true);
    mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
    mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

    const config: EbayConfig = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };
    const api = new EbaySellerApi(config);
    runtime = createEbayMcpRuntime({ api });
    await runtime.initializeApi();

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'get-offers-contract-test', version: '1.0.0' });
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

  it('advertises a required SKU and the inventory-enumeration workflow', async () => {
    const definition = (await client.listTools()).tools.find(
      (tool) => tool.name === 'ebay_get_offers',
    );

    expect(definition?.inputSchema.required).toContain('sku');
    expect(definition?.description).toContain('one seller-defined SKU');
    expect(definition?.description).toContain('ebay_get_inventory_items');
  });

  it.each([
    {},
    { sku: '' },
  ])('rejects invalid arguments before an eBay request: %j', async (args) => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .get('/sell/inventory/v1/offer')
      .query(true)
      .reply(200, { offers: [] });

    const rejectedLookup = await client.callTool({ name: 'ebay_get_offers', arguments: args });

    expect(rejectedLookup.isError).toBe(true);
    expect(rejectedLookup.content).toEqual([
      expect.objectContaining({
        type: 'text',
        text: expect.stringContaining('Input validation error'),
      }),
    ]);
    expect(endpoint.isDone()).toBe(false);
  });

  it('executes a valid one-SKU request through the registered MCP surface', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .get('/sell/inventory/v1/offer')
      .query({
        format: 'FIXED_PRICE',
        limit: '10',
        marketplace_id: 'EBAY_US',
        offset: '5',
        sku: 'SKU-1',
      })
      .reply(200, { total: 1, offers: [{ offerId: 'offer-1', sku: 'SKU-1' }] });

    const offersResult = await client.callTool({
      name: 'ebay_get_offers',
      arguments: {
        sku: 'SKU-1',
        format: 'FIXED_PRICE',
        marketplaceId: 'EBAY_US',
        limit: 10,
        offset: 5,
      },
    });

    expect(offersResult.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
    expect(offersResult.content).toEqual([
      {
        type: 'text',
        text: JSON.stringify({ total: 1, offers: [{ offerId: 'offer-1', sku: 'SKU-1' }] }, null, 2),
      },
    ]);
  });
});
