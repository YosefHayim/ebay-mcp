import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { EbaySellerApi } from '@/api/ebaySellerApi.js';
import { createEbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

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

const config: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
  redirectUri: 'https://localhost/callback',
};

const policy = {
  name: 'Standard Shipping',
  marketplaceId: 'EBAY_US',
  handlingTime: { unit: 'DAY', value: 1 },
};

let client: Client;
let runtime: ReturnType<typeof createEbayMcpRuntime>;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'account');
  nock.cleanAll();
  nock.disableNetConnect();

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const api = new EbaySellerApi(config);
  await Effect.runPromise(api.initialize());
  runtime = createEbayMcpRuntime({
    api,
    serverConfig: { name: 'fulfillment-policy-test', version: '0.0.0' },
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

it('advertises fulfillment policy create and update through connected MCP', async () => {
  const result = await client.listTools();
  const tools = new Map(result.tools.map((tool) => [tool.name, tool]));

  expect(tools.get('ebay_create_fulfillment_policy')?.inputSchema.required).toEqual(['policy']);
  expect(tools.get('ebay_update_fulfillment_policy')?.inputSchema.required).toEqual([
    'fulfillmentPolicyId',
    'policy',
  ]);
});

it('calls the create endpoint with the validated policy body', async () => {
  const endpoint = nock('https://api.sandbox.ebay.com')
    .post('/sell/account/v1/fulfillment_policy/', policy)
    .reply(201, { fulfillmentPolicyId: 'FP123' });

  const result = await client.callTool({
    name: 'ebay_create_fulfillment_policy',
    arguments: { policy },
  });

  expect(endpoint.isDone()).toBe(true);
  expect(result.content).toEqual([
    {
      type: 'text',
      text: JSON.stringify({ fulfillmentPolicyId: 'FP123' }, null, 2),
    },
  ]);
});

it('calls the update endpoint with the ID in the path and policy in the body', async () => {
  const endpoint = nock('https://api.sandbox.ebay.com')
    .put('/sell/account/v1/fulfillment_policy/FP123', policy)
    .reply(200, { fulfillmentPolicyId: 'FP123' });

  const result = await client.callTool({
    name: 'ebay_update_fulfillment_policy',
    arguments: { fulfillmentPolicyId: 'FP123', policy },
  });

  expect(endpoint.isDone()).toBe(true);
  expect(result.content).toEqual([
    {
      type: 'text',
      text: JSON.stringify({ fulfillmentPolicyId: 'FP123' }, null, 2),
    },
  ]);
});
