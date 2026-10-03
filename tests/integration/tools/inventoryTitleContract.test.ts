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
  client = new Client({ name: 'inventory-title-contract-test', version: '1.0.0' });
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

describe('inventory title advertised MCP schema', () => {
  it('advertises the title maximum on the registered MCP schema', async () => {
    const definition = (await client.listTools()).tools.find(
      (tool) => tool.name === 'ebay_create_or_replace_inventory_item',
    );

    expect(definition?.inputSchema).toMatchObject({
      properties: {
        body: {
          properties: {
            product: { properties: { title: { maxLength: 80 } } },
          },
        },
      },
    });
  });
});

describe('inventory title registered MCP validation', () => {
  it('accepts an 80-character title and sends the request to eBay', async () => {
    const title = 'x'.repeat(80);
    const endpoint = nock('https://api.sandbox.ebay.com')
      .put('/sell/inventory/v1/inventory_item/TITLE-80', { product: { title } })
      .reply(204);

    const maxTitleWrite = await client.callTool({
      name: 'ebay_create_or_replace_inventory_item',
      arguments: { sku: 'TITLE-80', body: { product: { title } } },
    });

    expect(maxTitleWrite.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });

  it('rejects an 81-character title before an eBay request', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .put('/sell/inventory/v1/inventory_item/TITLE-81')
      .reply(204);

    const overlongTitleWrite = await client.callTool({
      name: 'ebay_create_or_replace_inventory_item',
      arguments: { sku: 'TITLE-81', body: { product: { title: 'x'.repeat(81) } } },
    });

    expect(overlongTitleWrite.isError).toBe(true);
    expect(endpoint.isDone()).toBe(false);
  });

  it('keeps a missing draft title valid and sends the request to eBay', async () => {
    const endpoint = nock('https://api.sandbox.ebay.com')
      .put('/sell/inventory/v1/inventory_item/NO-TITLE', { condition: 'NEW' })
      .reply(204);

    const untitledDraftWrite = await client.callTool({
      name: 'ebay_create_or_replace_inventory_item',
      arguments: { sku: 'NO-TITLE', body: { condition: 'NEW' } },
    });

    expect(untitledDraftWrite.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });
});
