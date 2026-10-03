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

// The shared transport lifecycle keeps these end-to-end assertions in one contract suite.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: registered MCP contract setup is intentionally colocated
describe('ebay_get_offers_by_skus registered MCP contract', () => {
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
    runtime = createEbayMcpRuntime({ api: new EbaySellerApi(config) });
    await runtime.initializeApi();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'batch-get-offers-test', version: '1.0.0' });
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

  it('advertises bounded SKU input and explicit execution semantics', async () => {
    const definition = (await client.listTools()).tools.find(
      (tool) => tool.name === 'ebay_get_offers_by_skus',
    );

    expect(definition?.inputSchema.required).toContain('skus');
    expect(definition?.inputSchema.properties?.skus).toMatchObject({
      type: 'array',
      minItems: 1,
      maxItems: 25,
      items: { type: 'string', minLength: 1, maxLength: 50 },
    });
    expect(definition?.description).toContain('queried once');
    expect(definition?.description).toContain('at most 3');
  });

  it.each([
    { skus: [] },
    { skus: Array.from({ length: 26 }, (_, i) => `SKU-${i}`) },
  ])('rejects invalid lists before an eBay request: %j', async (args) => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .get('/sell/inventory/v1/offer')
      .query(true)
      .reply(200, { offers: [] });

    const rejectedBatch = await client.callTool({
      name: 'ebay_get_offers_by_skus',
      arguments: args,
    });

    expect(rejectedBatch.isError).toBe(true);
    expect(endpoint.isDone()).toBe(false);
  });

  it('executes multiple successful SKU requests through the registered MCP surface', async () => {
    for (const sku of ['SKU-1', 'SKU-2']) {
      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/offer')
        .query({ sku })
        .reply(200, { total: 1, offers: [{ offerId: `offer-${sku}`, sku }] });
    }

    const batchResult = await client.callTool({
      name: 'ebay_get_offers_by_skus',
      arguments: { skus: ['SKU-1', 'SKU-2'] },
    });
    const text = batchResult.content.find((block) => block.type === 'text');
    const batchReport = JSON.parse(text?.type === 'text' ? text.text : '{}') as Record<
      string,
      unknown
    >;

    expect(batchResult.isError).not.toBe(true);
    expect(batchReport).toMatchObject({ successCount: 2, failureCount: 0 });
    expect(nock.isDone()).toBe(true);
  });

  it('returns ordered successes and failures while deduplicating requests', async () => {
    const first = nock('https://api.sandbox.ebay.com')
      .get('/sell/inventory/v1/offer')
      .query({ sku: 'SKU-1' })
      .once()
      .reply(200, { total: 1, offers: [{ offerId: 'offer-1', sku: 'SKU-1' }] });
    const second = nock('https://api.sandbox.ebay.com')
      .get('/sell/inventory/v1/offer')
      .query({ sku: 'SKU-2' })
      .once()
      .reply(404, { errors: [{ message: 'offer not found' }] });

    const batchResult = await client.callTool({
      name: 'ebay_get_offers_by_skus',
      arguments: { skus: ['SKU-1', 'SKU-2', 'SKU-1'] },
    });
    const text = batchResult.content.find((block) => block.type === 'text');
    const batchReport = JSON.parse(text?.type === 'text' ? text.text : '{}') as Record<
      string,
      unknown
    >;

    expect(batchResult.isError).not.toBe(true);
    expect(first.isDone()).toBe(true);
    expect(second.isDone()).toBe(true);
    expect(batchReport).toMatchObject({
      requestedSkuCount: 3,
      uniqueSkuCount: 2,
      successCount: 1,
      failureCount: 1,
      results: [
        { sku: 'SKU-1', status: 'success' },
        { sku: 'SKU-2', status: 'failure', error: { type: 'EbayApiError' } },
      ],
    });
  });
});
