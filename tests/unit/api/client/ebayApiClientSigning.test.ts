import process from 'node:process';
import { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { computeContentDigest } from '@/api/client/signEbayRequest.js';
import type { EbayConfig } from '@/types/ebay.js';
import { getEbayErrorDetails } from '@/utils/errors.js';
import { verifyEbaySignature } from '@tests/helpers/verifyEbaySignature.js';
import { generateKeyPairSync } from 'node:crypto';
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

vi.mock('@/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

const APIZ = 'https://apiz.sandbox.ebay.com';
const API = 'https://api.sandbox.ebay.com';
const PROXY_HOST = 'https://proxy.example.com';
const PROXY_BASE_URL = `${PROXY_HOST}/ebay`;
const JWE = 'test.jwe.value';
const PRIVATE_KEY_PARSE_ERROR_PATTERN = /EBAY_SIGNING_PRIVATE_KEY could not be parsed/;
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const PRIVATE_KEY_B64 = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');

const baseConfig: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
};

const signingConfig: EbayConfig = {
  ...baseConfig,
  signing: { keyJwe: JWE, privateKey: PRIVATE_KEY_B64 },
};

/** Capture the headers and body of the next request nock intercepts. */
const captureRequest = () => {
  const captured: { headers: Record<string, string>; requestBody: string } = {
    headers: {},
    requestBody: '',
  };
  const record = function (this: nock.ReplyFnContext, _uri: string, requestBody: unknown) {
    for (const [name, value] of Object.entries(this.req.headers)) {
      captured.headers[name] = String(value);
    }
    captured.requestBody =
      typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    return [200, { ok: true }] as nock.ReplyFnResult;
  };
  return { captured, record };
};

beforeEach(() => {
  vi.clearAllMocks();
  nock.cleanAll();
  nock.disableNetConnect();
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
  delete process.env.http_proxy;
  delete process.env.https_proxy;
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('EbayApiClient signing with credentials', () => {
  it('signs a request marked signed', async () => {
    const client = new EbayApiClient(signingConfig);
    const { captured, record } = captureRequest();
    const transactionUrl = `${APIZ}/sell/finances/v1/transaction`;
    nock(APIZ).get('/sell/finances/v1/transaction').query({ limit: '5' }).reply(record);

    await client.get(transactionUrl, { limit: 5 }, { absolute: true, signed: true });

    expect(captured.headers['x-ebay-signature-key']).toBe(JWE);
    expect(captured.headers['content-digest']).toBeUndefined();
    expect(captured.headers.authorization).toBe('Bearer mock_access_token');
    expect(
      verifyEbaySignature(captured.headers, { method: 'GET', url: transactionUrl }, publicKey),
    ).toBe(true);
  });

  it('digests the exact JSON body sent for a signed POST', async () => {
    const client = new EbayApiClient(signingConfig);
    const { captured, record } = captureRequest();
    const refundPath = '/sell/fulfillment/v1/order/1-2/issue_refund';
    nock(API).post(refundPath).reply(record);

    await client.post(refundPath, { reasonForRefund: 'BUYER_CANCEL' }, { signed: true });

    expect(captured.requestBody).toBe('{"reasonForRefund":"BUYER_CANCEL"}');
    expect(captured.headers['content-type']).toBe('application/json');
    expect(captured.headers['content-digest']).toBe(computeContentDigest(captured.requestBody));
    expect(
      verifyEbaySignature(
        captured.headers,
        { method: 'POST', url: `${API}${refundPath}` },
        publicKey,
      ),
    ).toBe(true);
  });

  it('leaves unsigned requests untouched', async () => {
    const client = new EbayApiClient(signingConfig);
    const { captured, record } = captureRequest();
    nock(API).get('/sell/inventory/v1/inventory_item').reply(record);

    await client.get('/sell/inventory/v1/inventory_item');

    expect(captured.headers['x-ebay-signature-key']).toBeUndefined();
    expect(captured.headers.signature).toBeUndefined();
  });

  it('fails clearly when the configured private key is invalid', async () => {
    const client = new EbayApiClient({
      ...baseConfig,
      signing: { keyJwe: JWE, privateKey: 'not-a-key' },
    });

    await expect(
      client.get('/sell/finances/v1/billing_activity', undefined, { signed: true }),
    ).rejects.toThrow(PRIVATE_KEY_PARSE_ERROR_PATTERN);
  });
});

describe('EbayApiClient signing without credentials', () => {
  it('sends signed calls unsigned', async () => {
    const client = new EbayApiClient(baseConfig);
    const { captured, record } = captureRequest();
    nock(API).get('/sell/finances/v1/billing_activity').reply(record);

    await client.get('/sell/finances/v1/billing_activity', undefined, { signed: true });

    expect(captured.headers['x-ebay-signature-key']).toBeUndefined();
    expect(captured.headers['signature-input']).toBeUndefined();
  });

  it('turns eBay signature rejections into setup guidance', async () => {
    const client = new EbayApiClient(baseConfig);
    nock(API)
      .get('/sell/finances/v1/billing_activity')
      .reply(403, {
        errors: [
          {
            errorId: 215_001,
            domain: 'ACCESS',
            message: 'Missing x-ebay-signature-key header',
            longMessage: 'Missing x-ebay-signature-key header to fulfill the request.',
          },
        ],
      });

    const error = await client
      .get('/sell/finances/v1/billing_activity', undefined, { signed: true })
      .catch((cause: unknown) => cause);
    const details = getEbayErrorDetails(error);

    expect(details.status).toBe(403);
    expect(details.message).toContain('Missing x-ebay-signature-key header');
    expect(details.message).toContain('EBAY_SIGNING_KEY_JWE');
    expect(details.message).toContain('ebay_create_signing_key');
  });

  it('keeps eBay error text for unsigned calls that mention a signature', async () => {
    const client = new EbayApiClient(baseConfig);
    nock(API)
      .post('/sell/inventory/v1/bulk_create_or_replace_inventory_item')
      .reply(400, {
        errors: [{ errorId: 25_002, message: 'Invalid image signature' }],
      });

    const error = await client
      .post('/sell/inventory/v1/bulk_create_or_replace_inventory_item', {})
      .catch((cause: unknown) => cause);
    const details = getEbayErrorDetails(error);

    expect(details.status).toBe(400);
    expect(details.message).toBe('Invalid image signature');
  });
});

describe('EbayApiClient signing behind EBAY_MCP_API_BASE_URL', () => {
  const proxyConfig: EbayConfig = { ...signingConfig, apiBaseUrl: PROXY_BASE_URL };

  it('signs an apiz call for the eBay host and path', async () => {
    const client = new EbayApiClient(proxyConfig);
    const { captured, record } = captureRequest();
    nock(PROXY_HOST).get('/ebay/sell/finances/v1/transaction').reply(record);

    await client.get(`${PROXY_BASE_URL}/sell/finances/v1/transaction`, undefined, {
      absolute: true,
      signed: true,
    });

    const ebayUrl = `${APIZ}/sell/finances/v1/transaction`;
    expect(verifyEbaySignature(captured.headers, { method: 'GET', url: ebayUrl }, publicKey)).toBe(
      true,
    );
  });

  it('signs a relative call for the eBay host and path', async () => {
    const client = new EbayApiClient(proxyConfig);
    const { captured, record } = captureRequest();
    const refundPath = '/sell/fulfillment/v1/order/1-2/issue_refund';
    nock(PROXY_HOST).post(`/ebay${refundPath}`).reply(record);

    await client.post(refundPath, { reasonForRefund: 'BUYER_CANCEL' }, { signed: true });

    const ebayUrl = `${API}${refundPath}`;
    expect(verifyEbaySignature(captured.headers, { method: 'POST', url: ebayUrl }, publicKey)).toBe(
      true,
    );
  });
});
