import { afterEach, describe, expect, test, vi } from 'vitest';
import { EbayClient } from './ebay-client.js';
import type { EbayCredentials } from './environment.js';
import { Inventory } from './inventory.js';

const credentials: EbayCredentials = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  site: 'sandbox',
  refreshToken: 'refresh-token',
  marketplaceId: 'EBAY_US',
  contentLanguage: 'en-US',
};

function tokenReply(): Response {
  const document = { access_token: 'user-token', expires_in: 7200 };
  const replyText = JSON.stringify(document);
  return new Response(replyText, { status: 200 });
}

function jsonReply(document: unknown): Response {
  const replyText = JSON.stringify(document);
  return new Response(replyText, { status: 200 });
}

function installFetch(replies: Response[]): Request[] {
  const calls: Request[] = [];
  let replyIndex = 0;

  function fakeFetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const request = new Request(url, init);
    calls.push(request);
    const nextReply = replies[replyIndex];
    replyIndex += 1;

    const isMissing = nextReply == null;
    if (isMissing) {
      return Promise.reject(new Error('unexpected eBay call'));
    }

    return Promise.resolve(nextReply);
  }

  vi.stubGlobal('fetch', fakeFetch);
  return calls;
}

describe('listItems', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('asks for a page with the user token', async () => {
    const calls = installFetch([tokenReply(), jsonReply({ total: 0, inventoryItems: [] })]);
    const client = new EbayClient(credentials);
    const inventory = new Inventory(client);

    const page = await inventory.listItems(50, 100);

    expect(page).toEqual({ total: 0, inventoryItems: [] });
    const [tokenCall, listCall] = calls;
    const tokenForm = await tokenCall?.text();
    expect(tokenForm?.startsWith('grant_type=refresh_token')).toBe(true);
    expect(listCall?.url).toBe(
      'https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item?limit=50&offset=100',
    );
    expect(listCall?.headers.get('Authorization')).toBe('Bearer user-token');
  });

  test('uses the default page when limit and offset are missing', async () => {
    const calls = installFetch([tokenReply(), jsonReply({ total: 0 })]);
    const client = new EbayClient(credentials);
    const inventory = new Inventory(client);

    await inventory.listItems(null, null);

    const [, listCall] = calls;
    expect(listCall?.url).toBe(
      'https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item?limit=25&offset=0',
    );
  });
});

describe('getItem', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('encodes the SKU and uses the user token', async () => {
    const calls = installFetch([tokenReply(), jsonReply({ sku: 'ABC 123/4' })]);
    const client = new EbayClient(credentials);
    const inventory = new Inventory(client);
    const sku = 'ABC 123/4';

    const inventoryDocument = await inventory.getItem(sku);

    expect(inventoryDocument).toEqual({ sku: 'ABC 123/4' });
    const encodedSku = encodeURIComponent(sku);
    const [, skuCall] = calls;
    expect(skuCall?.url).toBe(
      `https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item/${encodedSku}`,
    );
    expect(skuCall?.headers.get('Authorization')).toBe('Bearer user-token');
  });

  test('rejects a missing SKU', async () => {
    const client = new EbayClient(credentials);
    const inventory = new Inventory(client);

    async function readSku(): Promise<unknown> {
      const inventoryDocument = await inventory.getItem('');
      return inventoryDocument;
    }

    await expect(readSku()).rejects.toThrow('sku is missing');
  });
});
