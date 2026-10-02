import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { EbaySellerApi } from '@/api/index.js';
import { createEbayMcpRuntime, type EbayMcpRuntime } from '@/mcp/runtime.js';
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

const APIZ_HOST = 'https://apiz.sandbox.ebay.com';
const API_HOST = 'https://api.sandbox.ebay.com';
const BASE = '/sell/finances/v1';
const MARKETPLACE_HEADER = 'X-EBAY-C-MARKETPLACE-ID';

const config: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
  redirectUri: 'https://localhost/callback',
  marketplaceId: 'EBAY_US',
};

let client: Client;
let runtime: EbayMcpRuntime;

const callTool = async (name: string, args: Record<string, unknown>) => {
  const result = await client.callTool({ name, arguments: args });
  const text = Array.isArray(result.content)
    ? result.content.map((block) => (block.type === 'text' ? block.text : '')).join('')
    : '';
  return { isError: result.isError === true, payload: JSON.parse(text) as unknown };
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'finances');
  nock.cleanAll();
  nock.disableNetConnect();

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const api = new EbaySellerApi(config);
  await Effect.runPromise(api.initialize());
  runtime = createEbayMcpRuntime({
    api,
    serverConfig: { name: 'finances-tools-test', version: '0.0.0' },
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

describe('Finances tool advertisement', () => {
  const expectedRequired: Record<string, string[] | undefined> = {
    ebay_get_order_earnings: undefined,
    ebay_get_order_earnings_by_id: ['orderId'],
    ebay_get_order_earnings_summary: undefined,
    ebay_get_payout: ['payoutId'],
    ebay_get_payouts: undefined,
    ebay_get_payout_summary: undefined,
    ebay_get_seller_funds_summary: undefined,
    ebay_get_transactions: undefined,
    ebay_get_transaction_summary: ['filter'],
    ebay_get_transfer: ['transferId'],
    ebay_get_billing_activities: ['filter'],
  };

  it('advertises every Finances tool as read-only with its required inputs', async () => {
    const tools = new Map((await client.listTools()).tools.map((tool) => [tool.name, tool]));

    for (const [name, required] of Object.entries(expectedRequired)) {
      const tool = tools.get(name);
      expect(tool, name).toBeDefined();
      expect(tool?.annotations?.readOnlyHint, name).toBe(true);
      expect(tool?.inputSchema.required, name).toEqual(required);
    }
  });

  it('tells callers the order earnings tools need the optional earnings scope', async () => {
    const tools = (await client.listTools()).tools;

    for (const name of [
      'ebay_get_order_earnings',
      'ebay_get_order_earnings_by_id',
      'ebay_get_order_earnings_summary',
    ]) {
      const description = tools.find((tool) => tool.name === name)?.description;
      expect(description).toContain('sell.finances.earnings.read');
      expect(description).toContain('EBAY_OAUTH_SCOPES');
    }
  });
});

describe('Finances collection and summary tool calls', () => {
  it.each([
    ['ebay_get_order_earnings', '/order_earnings', { orderEarnings: [{ orderId: '12-1' }] }],
    ['ebay_get_payouts', '/payout', { payouts: [{ payoutId: 'P1' }], total: 1 }],
    ['ebay_get_transactions', '/transaction', { transactions: [{ transactionId: 'T1' }] }],
  ])('%s pages a collection on the apiz host', async (name, path, response) => {
    const request = nock(APIZ_HOST)
      .get(`${BASE}${path}`)
      .query({ filter: 'transactionDate:[2024-10-23T00:00:01.000Z..]', limit: '25', offset: '50' })
      .matchHeader(MARKETPLACE_HEADER, 'EBAY_US')
      .reply(200, response);

    const result = await callTool(name, {
      filter: 'transactionDate:[2024-10-23T00:00:01.000Z..]',
      limit: 25,
      offset: 50,
    });

    expect(request.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: response });
  });

  it.each([
    ['ebay_get_order_earnings_summary', '/order_earnings_summary', { totalOrders: 3 }],
    ['ebay_get_payout_summary', '/payout_summary', { payoutCount: 2 }],
    ['ebay_get_transaction_summary', '/transaction_summary', { creditCount: 4 }],
  ])('%s sends the filter to the apiz summary endpoint', async (name, path, response) => {
    const request = nock(APIZ_HOST)
      .get(`${BASE}${path}`)
      .query({ filter: 'transactionStatus:{PAYOUT}' })
      .reply(200, response);

    const result = await callTool(name, { filter: 'transactionStatus:{PAYOUT}' });

    expect(request.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: response });
  });
});

describe('Finances resource, header and empty-body tool calls', () => {
  it.each([
    ['ebay_get_order_earnings_by_id', { orderId: '12-34/5' }, '/order_earnings/12-34%2F5'],
    ['ebay_get_payout', { payoutId: 'P 1' }, '/payout/P%201'],
    ['ebay_get_transfer', { transferId: 'TR-1' }, '/transfer/TR-1'],
  ])('%s fetches one resource by its encoded ID', async (name, args, path) => {
    const response = { id: path };
    const request = nock(APIZ_HOST).get(`${BASE}${path}`).reply(200, response);

    const result = await callTool(name, args);

    expect(request.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: response });
  });

  it('overrides the configured marketplace header per call', async () => {
    const funds = { availableFunds: { value: '10.00', currency: 'EUR' } };
    const request = nock(APIZ_HOST)
      .get(`${BASE}/seller_funds_summary`)
      .matchHeader(MARKETPLACE_HEADER, 'EBAY_DE')
      .reply(200, funds);

    const result = await callTool('ebay_get_seller_funds_summary', { marketplaceId: 'EBAY_DE' });

    expect(request.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: funds });
  });

  it('reports success without data when eBay answers 204 No Content', async () => {
    const request = nock(APIZ_HOST).get(`${BASE}/seller_funds_summary`).reply(204);

    const result = await callTool('ebay_get_seller_funds_summary', {});

    expect(request.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: { status: 'success' } });
  });

  it('calls billing activity on the api host with its query and Accept-Language', async () => {
    const response = { billingActivities: [{ billingTransactionId: 'B1' }], total: 1 };
    const request = nock(API_HOST)
      .get(`${BASE}/billing_activity`)
      .query({ filter: 'orderId:{12-34}', limit: '10', sort: 'transactionDate' })
      .matchHeader('Accept-Language', 'de-DE')
      .reply(200, response);

    const result = await callTool('ebay_get_billing_activities', {
      filter: 'orderId:{12-34}',
      limit: 10,
      sort: 'transactionDate',
      acceptLanguage: 'de-DE',
    });

    expect(request.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: response });
  });
});

describe('Finances tool failures', () => {
  it('surfaces an eBay error response as a tool error with the eBay detail', async () => {
    nock(APIZ_HOST)
      .get(`${BASE}/payout/MISSING`)
      .reply(404, {
        errors: [{ errorId: 135_002, message: 'The payout ID was not found.' }],
      });

    const result = await callTool('ebay_get_payout', { payoutId: 'MISSING' });

    expect(result.isError).toBe(true);
    expect(result.payload).toMatchObject({ status: 404 });
    expect(JSON.stringify(result.payload)).toContain('The payout ID was not found.');
  });

  it('rejects invalid input without calling eBay', async () => {
    const request = nock(APIZ_HOST).get(`${BASE}/transaction`).query(true).reply(200, {});

    const result = await client.callTool({
      name: 'ebay_get_transactions',
      arguments: { limit: 0 },
    });

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain('limit');
    expect(request.isDone()).toBe(false);
  });
});
