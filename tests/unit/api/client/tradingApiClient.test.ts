import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { TradingApiClient } from '@/api/client/tradingApiClient.js';
import { Effect } from 'effect';
import nock from 'nock';

function createMockRestClient(environment = 'production') {
  const mockOAuthClient = {
    getAccessToken: vi.fn().mockReturnValue(Effect.succeed('mock_token')),
  };
  return {
    getConfig: vi.fn().mockReturnValue({ environment }),
    getOAuthClient: vi.fn().mockReturnValue(mockOAuthClient),
    _mockOAuthClient: mockOAuthClient,
  } as unknown as EbayApiClient & {
    _mockOAuthClient: { getAccessToken: ReturnType<typeof vi.fn> };
  };
}

let client: TradingApiClient;
let mockRestClient: ReturnType<typeof createMockRestClient>;

beforeEach(() => {
  vi.clearAllMocks();
  nock.cleanAll();
  nock.disableNetConnect();
  mockRestClient = createMockRestClient('production');
  client = new TradingApiClient(mockRestClient);
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

it('sends XML request headers required by Trading API', async () => {
  const scope = nock('https://api.ebay.com')
    .post('/ws/api.dll')
    .matchHeader('X-EBAY-API-CALL-NAME', 'GetMyeBaySelling')
    .matchHeader('X-EBAY-API-SITEID', '0')
    .matchHeader('X-EBAY-API-COMPATIBILITY-LEVEL', '1451')
    .matchHeader('X-EBAY-API-IAF-TOKEN', 'mock_token')
    .matchHeader('Content-Type', 'text/xml')
    .reply(
      200,
      `<?xml version="1.0" encoding="utf-8"?>
      <GetMyeBaySellingResponse xmlns="urn:ebay:apis:eBLBaseComponents">
        <Ack>Success</Ack>
      </GetMyeBaySellingResponse>`,
    );

  const result = await Effect.runPromise(client.execute('GetMyeBaySelling', {}));
  expect(result.Ack).toBe('Success');
  scope.done();
});

it('builds XML request body from params', async () => {
  const scope = nock('https://api.ebay.com')
    .post('/ws/api.dll', (body: string) => body.includes('<ItemID>12345</ItemID>'))
    .reply(
      200,
      `<?xml version="1.0" encoding="utf-8"?>
      <GetItemResponse xmlns="urn:ebay:apis:eBLBaseComponents">
        <Ack>Success</Ack>
        <Item><ItemID>12345</ItemID></Item>
      </GetItemResponse>`,
    );

  const result = await Effect.runPromise(client.execute('GetItem', { ItemID: '12345' }));
  expect(result.Ack).toBe('Success');
  scope.done();
});

it('fails with EbayApiError on eBay error response', async () => {
  nock('https://api.ebay.com')
    .post('/ws/api.dll')
    .reply(
      200,
      `<?xml version="1.0" encoding="utf-8"?>
      <GetItemResponse xmlns="urn:ebay:apis:eBLBaseComponents">
        <Ack>Failure</Ack>
        <Errors>
          <ShortMessage>Invalid item ID</ShortMessage>
          <LongMessage>The item ID 99999 is invalid.</LongMessage>
          <SeverityCode>Error</SeverityCode>
        </Errors>
      </GetItemResponse>`,
    );

  const error = await Effect.runPromise(
    Effect.flip(client.execute('GetItem', { ItemID: '99999' })),
  );

  expect(error._tag).toBe('EbayApiError');
  expect(error.cause).toBeInstanceOf(Error);
  if (error.cause instanceof Error) {
    expect(error.cause.message).toContain('Invalid item ID');
  }
});

it('uses the sandbox URL for sandbox environment', () => {
  const sandboxClient = new TradingApiClient(createMockRestClient('sandbox'));
  expect(sandboxClient.getTradingBaseUrl()).toBe('https://api.sandbox.ebay.com');
});

it('uses the production URL for production environment', () => {
  expect(client.getTradingBaseUrl()).toBe('https://api.ebay.com');
});

describe('proxy auth mode', () => {
  function createProxyRestClient() {
    return {
      getConfig: vi.fn().mockReturnValue({
        environment: 'production',
        apiBaseUrl: 'http://localhost:8099',
        disableAuthHeader: true,
      }),
      getOAuthClient: vi.fn(),
    } as unknown as EbayApiClient & { getOAuthClient: ReturnType<typeof vi.fn> };
  }

  it('targets the overridden base URL', () => {
    const proxyClient = new TradingApiClient(createProxyRestClient());
    expect(proxyClient.getTradingBaseUrl()).toBe('http://localhost:8099');
  });

  it('omits the IAF token and never acquires a token', async () => {
    const proxyRest = createProxyRestClient();
    const proxyClient = new TradingApiClient(proxyRest);

    const scope = nock('http://localhost:8099', { badheaders: ['x-ebay-api-iaf-token'] })
      .post('/ws/api.dll')
      .reply(
        200,
        `<?xml version="1.0" encoding="utf-8"?>
        <GetItemResponse xmlns="urn:ebay:apis:eBLBaseComponents"><Ack>Success</Ack></GetItemResponse>`,
      );

    const result = await Effect.runPromise(proxyClient.execute('GetItem', { ItemID: '1' }));

    expect(result.Ack).toBe('Success');
    expect(proxyRest.getOAuthClient).not.toHaveBeenCalled();
    scope.done();
  });
});
