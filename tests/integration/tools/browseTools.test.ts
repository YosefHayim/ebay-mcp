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

const HOST = 'https://api.sandbox.ebay.com';
const SEARCH = '/buy/browse/v1/item_summary/search';

/** Capture the query eBay would have received for a single search call. */
const captureSearchQuery = (): { current: Record<string, string> } => {
  const captured: { current: Record<string, string> } = { current: {} };
  nock(HOST)
    .get(SEARCH)
    .query((actual) => {
      captured.current = actual as Record<string, string>;
      return true;
    })
    .reply(200, { total: 0, itemSummaries: [] });
  return captured;
};

// The shared transport lifecycle keeps these end-to-end assertions in one contract suite.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: registered MCP contract setup is intentionally colocated
describe('browse tools registered MCP contract', () => {
  let client: Client;
  let runtime: EbayMcpRuntime;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    vi.clearAllMocks();
    nock.cleanAll();
    nock.disableNetConnect();
    originalEnv = process.env;
    process.env = { ...originalEnv, EBAY_MCP_TOOLS: 'browse' };
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
    runtime = createEbayMcpRuntime({ api: new EbaySellerApi(config) });
    await runtime.initializeApi();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'browse-tools-test', version: '1.0.0' });
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

  it('advertises the search contract and its pagination rule', async () => {
    const definition = (await client.listTools()).tools.find(
      (tool) => tool.name === 'ebay_find_active_items',
    );

    expect(definition?.inputSchema.required).toContain('query');
    expect(definition?.inputSchema.properties?.sort).toMatchObject({
      enum: ['price', '-price', 'newlyListed', 'endingSoonest'],
    });
    expect(
      (definition?.inputSchema.properties?.offset as { description?: string })?.description,
    ).toContain('multiple of limit');
  });

  // The price grammar is the contract eBay actually reads: an open-ended lower
  // bound is `[min..]`, and a bare `[min]` silently means "exactly min".
  it.each([
    { args: { priceMin: 150 }, expected: 'price:[150..],priceCurrency:USD' },
    { args: { priceMax: 50 }, expected: 'price:[..50],priceCurrency:USD' },
    { args: { priceMin: 10, priceMax: 50 }, expected: 'price:[10..50],priceCurrency:USD' },
    {
      args: { priceMin: 10, priceCurrency: 'EUR' },
      expected: 'price:[10..],priceCurrency:EUR',
    },
    {
      args: { conditions: ['NEW', 'USED'], buyingOptions: ['AUCTION'] },
      expected: 'conditions:{NEW|USED},buyingOptions:{AUCTION}',
    },
  ])('sends the eBay filter grammar for %j', async ({ args, expected }) => {
    const captured = captureSearchQuery();

    const result = await client.callTool({
      name: 'ebay_find_active_items',
      arguments: { query: 'camera', ...args },
    });

    expect(result.isError).not.toBe(true);
    expect(captured.current.filter).toBe(expected);
    expect(nock.isDone()).toBe(true);
  });

  it('sends query, pagination, sort, and category on the wire', async () => {
    const captured = captureSearchQuery();

    await client.callTool({
      name: 'ebay_find_active_items',
      arguments: { query: 'camera', limit: 5, offset: 10, sort: 'price', categoryIds: '625' },
    });

    expect(captured.current).toMatchObject({
      q: 'camera',
      limit: '5',
      offset: '10',
      sort: 'price',
      category_ids: '625',
    });
  });

  it.each([
    { label: 'inverted price window', args: { priceMin: 50, priceMax: 10 } },
    { label: 'offset that is not a whole page', args: { limit: 3, offset: 20 } },
    { label: 'offset past the Browse cap', args: { limit: 1, offset: 10_001 } },
    { label: 'limit above the Browse cap', args: { limit: 201 } },
    {
      label: 'raw filter colliding with price bounds',
      args: { priceMax: 100, filter: 'price:[5..10]' },
    },
    { label: 'non-string condition entries', args: { conditions: [1 as unknown as string] } },
  ])('rejects a $label before any eBay request', async ({ args }) => {
    const endpoint = nock(HOST).get(SEARCH).query(true).reply(200, { itemSummaries: [] });

    const result = await client.callTool({
      name: 'ebay_find_active_items',
      arguments: { query: 'camera', ...args },
    });

    expect(result.isError).toBe(true);
    expect(endpoint.isDone()).toBe(false);
  });

  it('prices an auction from currentBidPrice and echoes eBay pagination', async () => {
    nock(HOST)
      .get(SEARCH)
      .query(true)
      .reply(200, {
        total: 12,
        offset: 40,
        limit: 10,
        itemSummaries: [
          {
            itemId: 'v1|555|0',
            title: 'No-reserve auction',
            currentBidPrice: { value: '42.50', currency: 'USD' },
            bidCount: 7,
            buyingOptions: ['AUCTION'],
          },
        ],
      });

    const result = await client.callTool({
      name: 'ebay_find_active_items',
      arguments: { query: 'camera', limit: 200, offset: 0 },
    });
    const text = result.content.find((item) => item.type === 'text');
    const payload = JSON.parse(text?.type === 'text' ? text.text : '{}') as Record<string, unknown>;

    expect(payload).toMatchObject({ total: 12, offset: 40, limit: 10 });
    expect((payload.items as Record<string, unknown>[])[0]).toMatchObject({
      price: { currency: 'USD', value: '42.50' },
      bidCount: 7,
    });
  });

  it('url-encodes the pipe-delimited item id on the detail path', async () => {
    const endpoint = nock(HOST)
      .get('/buy/browse/v1/item/v1%7C110587051479%7C0')
      .reply(200, { itemId: 'v1|110587051479|0', title: 'Camera' });

    const result = await client.callTool({
      name: 'ebay_get_item_details',
      arguments: { itemId: 'v1|110587051479|0' },
    });

    expect(result.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });
});
