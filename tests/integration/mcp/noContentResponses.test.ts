import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { EbaySellerApi } from '@/api/ebaySellerApi.js';
import { createEbayMcpRuntime, type EbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { cleanupMocks, mockEbayApiEndpoint, mockEbayApiError } from '@tests/helpers/mockHttp.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOAuthClient = {
  getAccessToken: vi.fn(() => Effect.succeed('mock_access_token')),
  initialize: vi.fn(() => Effect.succeed(undefined)),
  isAuthenticated: vi.fn(() => true),
};

vi.mock('../../../src/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

const inventoryItem = {
  availability: { shipToLocationAvailability: { quantity: 1 } },
  condition: 'NEW',
  product: { title: 'MCP boundary test item' },
};

const parseTextPayload = (toolResult: Awaited<ReturnType<Client['callTool']>>): unknown => {
  const first = toolResult.content[0];
  if (!first || first.type !== 'text') {
    throw new Error('Expected one MCP text content block');
  }
  return JSON.parse(first.text);
};

describe('204 responses at the MCP protocol boundary', () => {
  let client: Client;
  let runtime: EbayMcpRuntime;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(async () => {
    originalEnv = process.env;
    process.env = { ...originalEnv, EBAY_MCP_TOOLS: 'inventory' };

    const config: EbayConfig = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };
    runtime = createEbayMcpRuntime({
      api: new EbaySellerApi(config),
      serverConfig: { name: 'test-ebay-mcp', version: '0.0.0' },
    });
    await runtime.initializeApi();

    client = new Client({ name: 'test-client', version: '0.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await runtime.server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  beforeEach(() => {
    cleanupMocks();
    nock.disableNetConnect();
  });

  afterEach(() => {
    cleanupMocks();
    nock.enableNetConnect();
  });

  afterAll(async () => {
    await client.close();
    await runtime.server.close();
    process.env = originalEnv;
  });

  it('returns an explicit schema-valid success document for an eBay 204', async () => {
    mockEbayApiEndpoint(
      '/sell/inventory/v1/inventory_item/MCP-204',
      'put',
      'sandbox',
      undefined,
      204,
    );

    const upsertResult = await client.callTool({
      name: 'ebay_create_or_replace_inventory_item',
      arguments: { sku: 'MCP-204', body: inventoryItem },
    });

    expect(upsertResult.isError).not.toBe(true);
    expect(parseTextPayload(upsertResult)).toEqual({ status: 'success' });
  });

  it('returns status and eBay details for a rejected write', async () => {
    mockEbayApiError(
      '/sell/inventory/v1/inventory_item/MCP-400',
      'put',
      'sandbox',
      'Missing required field: availability',
      400,
    );

    const rejectedWriteResult = await client.callTool({
      name: 'ebay_create_or_replace_inventory_item',
      arguments: { sku: 'MCP-400', body: inventoryItem },
    });

    expect(rejectedWriteResult.isError).toBe(true);
    expect(parseTextPayload(rejectedWriteResult)).toEqual({
      error: 'Detailed error: Missing required field: availability',
      status: 400,
      details: [
        {
          errorId: 1001,
          domain: 'API_INVENTORY',
          category: 'REQUEST',
          message: 'Missing required field: availability',
          longMessage: 'Detailed error: Missing required field: availability',
        },
      ],
    });
  });
});
