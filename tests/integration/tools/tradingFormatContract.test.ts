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

const TRADING_HOST = 'https://api.sandbox.ebay.com';
const TRADING_PATH = '/ws/api.dll';

const auctionItem = {
  Title: 'Rare coin',
  Description: 'Uncirculated',
  PrimaryCategory: { CategoryID: '11116' },
  StartPrice: 9.99,
  ReservePrice: 25,
  BuyItNowPrice: 49.99,
  ListingDuration: 'Days_7',
  Currency: 'USD',
  Country: 'US',
};

const tradingResponse = (callName: string, responseFields: string): string =>
  `<?xml version="1.0" encoding="utf-8"?>
  <${callName}Response xmlns="urn:ebay:apis:eBLBaseComponents">
    <Ack>Success</Ack>
    ${responseFields}
  </${callName}Response>`;

const textContent = (toolResult: Awaited<ReturnType<Client['callTool']>>): string =>
  (toolResult.content as { type: string; text?: string }[])
    .map((block) => block.text ?? '')
    .join('\n');

let client: Client;
let runtime: EbayMcpRuntime;
let originalEnv: NodeJS.ProcessEnv;

beforeEach(async () => {
  vi.clearAllMocks();
  nock.cleanAll();
  nock.disableNetConnect();
  originalEnv = process.env;
  process.env = { ...originalEnv, EBAY_MCP_TOOLS: 'trading' };

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
  client = new Client({ name: 'trading-format-contract-test', version: '1.0.0' });
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

describe('trading format advertised MCP schema', () => {
  it('advertises the format switch on every mutating listing tool', async () => {
    const tools = (await client.listTools()).tools;

    for (const name of [
      'ebay_create_listing',
      'ebay_revise_listing',
      'ebay_end_listing',
      'ebay_relist_item',
    ]) {
      const definition = tools.find((tool) => tool.name === name);

      expect(definition?.description).toContain('AUCTION');
      expect(definition?.inputSchema).toMatchObject({
        properties: { format: { enum: ['AUCTION', 'FIXED_PRICE'] } },
      });
    }
  });
});

describe('trading format registered MCP validation', () => {
  it('sends an auction through AddItem with the Chinese listing type', async () => {
    const endpoint = nock(TRADING_HOST)
      .post(
        TRADING_PATH,
        (requestXml: string) =>
          requestXml.includes('<AddItemRequest') &&
          requestXml.includes('<ListingType>Chinese</ListingType>') &&
          requestXml.includes('<ListingDuration>Days_7</ListingDuration>') &&
          requestXml.includes('<ReservePrice>25</ReservePrice>'),
      )
      .matchHeader('X-EBAY-API-CALL-NAME', 'AddItem')
      .reply(200, tradingResponse('AddItem', '<ItemID>110001</ItemID>'));

    const auctionCreate = await client.callTool({
      name: 'ebay_create_listing',
      arguments: { format: 'AUCTION', item: auctionItem },
    });

    expect(auctionCreate.isError).not.toBe(true);
    expect(textContent(auctionCreate)).toContain('110001');
    expect(endpoint.isDone()).toBe(true);
  });

  it('keeps fixed-price creates on AddFixedPriceItem by default', async () => {
    const endpoint = nock(TRADING_HOST)
      .post(
        TRADING_PATH,
        (requestXml: string) =>
          requestXml.includes('<AddFixedPriceItemRequest') && !requestXml.includes('<ListingType>'),
      )
      .matchHeader('X-EBAY-API-CALL-NAME', 'AddFixedPriceItem')
      .reply(200, tradingResponse('AddFixedPriceItem', '<ItemID>110002</ItemID>'));

    const fixedPriceCreate = await client.callTool({
      name: 'ebay_create_listing',
      arguments: { item: { Title: 'Widget', StartPrice: 14.99, ListingDuration: 'GTC' } },
    });

    expect(fixedPriceCreate.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });

  it('rejects a mixed-format auction locally without calling eBay', async () => {
    const endpoint = nock(TRADING_HOST)
      .post(TRADING_PATH)
      .reply(200, tradingResponse('AddItem', '<ItemID>110003</ItemID>'));

    const mixedFormatCreate = await client.callTool({
      name: 'ebay_create_listing',
      arguments: { format: 'AUCTION', item: { ...auctionItem, ListingDuration: 'GTC' } },
    });

    expect(mixedFormatCreate.isError).toBe(true);
    expect(textContent(mixedFormatCreate)).toContain('item.ListingDuration');
    expect(endpoint.isDone()).toBe(false);
  });

  it('ends an auction through EndItem with SellToHighBidder', async () => {
    const endpoint = nock(TRADING_HOST)
      .post(
        TRADING_PATH,
        (requestXml: string) =>
          requestXml.includes('<EndItemRequest') &&
          requestXml.includes('<EndingReason>SellToHighBidder</EndingReason>'),
      )
      .matchHeader('X-EBAY-API-CALL-NAME', 'EndItem')
      .reply(200, tradingResponse('EndItem', '<EndTime>2026-08-25T12:00:00.000Z</EndTime>'));

    const auctionEnd = await client.callTool({
      name: 'ebay_end_listing',
      arguments: { format: 'AUCTION', itemId: '110001', reason: 'SellToHighBidder' },
    });

    expect(auctionEnd.isError).not.toBe(true);
    expect(endpoint.isDone()).toBe(true);
  });
});
