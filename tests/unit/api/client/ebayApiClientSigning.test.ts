import process from 'node:process';
import { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { buildSignatureBase, computeContentDigest } from '@/api/client/requestSigner.js';
import type { EbayConfig } from '@/types/ebay.js';
import { getEbayErrorDetails } from '@/utils/errors.js';
import { generateKeyPairSync, verify } from 'node:crypto';
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
const JWE = 'test.jwe.value';
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const PRIVATE_KEY_B64 = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');

const baseConfig: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
};

/** Capture the headers and body of the next request nock intercepts. */
const captureRequest = () => {
  const captured: { headers: Record<string, string>; body?: string } = { headers: {} };
  const record = function (this: nock.ReplyFnContext, _uri: string, body: unknown) {
    for (const [name, value] of Object.entries(this.req.headers)) {
      captured.headers[name] = String(value);
    }
    captured.body = typeof body === 'string' ? body : JSON.stringify(body);
    return [200, { ok: true }] as nock.ReplyFnResult;
  };
  return { captured, record };
};

/** Verify the captured signature over the eBay-covered components. */
const signatureVerifies = (
  headers: Record<string, string>,
  method: string,
  url: string,
): boolean => {
  const target = new URL(url);
  const signatureParams = headers['signature-input'].replace(/^sig1=/, '');
  const values: Record<string, string> = {
    'content-digest': headers['content-digest'] ?? '',
    'x-ebay-signature-key': headers['x-ebay-signature-key'],
    '@method': method,
    '@path': target.pathname,
    '@authority': target.host,
  };
  const names = [...signatureParams.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const base = buildSignatureBase(
    names.map((name) => [name, values[name]] as const),
    signatureParams,
  );
  const signature = Buffer.from(headers.signature.replace(/^sig1=:|:$/g, ''), 'base64');
  return verify(null, Buffer.from(base), publicKey, signature);
};

describe('EbayApiClient digital signatures', () => {
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

  it('signs a request marked signed when credentials are configured', async () => {
    const client = new EbayApiClient({
      ...baseConfig,
      signingKeyJwe: JWE,
      signingPrivateKey: PRIVATE_KEY_B64,
    });
    const { captured, record } = captureRequest();
    nock(APIZ).get('/sell/finances/v1/transaction').query({ limit: '5' }).reply(record);

    await client.get(
      `${APIZ}/sell/finances/v1/transaction`,
      { limit: 5 },
      { absolute: true, signed: true },
    );

    expect(captured.headers['x-ebay-signature-key']).toBe(JWE);
    expect(captured.headers['content-digest']).toBeUndefined();
    expect(captured.headers.authorization).toBe('Bearer mock_access_token');
    expect(signatureVerifies(captured.headers, 'GET', `${APIZ}/sell/finances/v1/transaction`)).toBe(
      true,
    );
  });

  it('digests the exact JSON body sent for a signed POST', async () => {
    const client = new EbayApiClient({
      ...baseConfig,
      signingKeyJwe: JWE,
      signingPrivateKey: PRIVATE_KEY_B64,
    });
    const { captured, record } = captureRequest();
    const path = '/sell/fulfillment/v1/order/1-2/issue_refund';
    nock(API).post(path).reply(record);

    await client.post(path, { reasonForRefund: 'BUYER_CANCEL' }, { signed: true });

    expect(captured.body).toBe('{"reasonForRefund":"BUYER_CANCEL"}');
    expect(captured.headers['content-type']).toBe('application/json');
    expect(captured.headers['content-digest']).toBe(computeContentDigest(captured.body ?? ''));
    expect(signatureVerifies(captured.headers, 'POST', `${API}${path}`)).toBe(true);
  });

  it('leaves unsigned requests untouched', async () => {
    const client = new EbayApiClient({
      ...baseConfig,
      signingKeyJwe: JWE,
      signingPrivateKey: PRIVATE_KEY_B64,
    });
    const { captured, record } = captureRequest();
    nock(API).get('/sell/inventory/v1/inventory_item').reply(record);

    await client.get('/sell/inventory/v1/inventory_item');

    expect(captured.headers['x-ebay-signature-key']).toBeUndefined();
    expect(captured.headers.signature).toBeUndefined();
  });

  it('sends signed calls unsigned when no credentials are configured', async () => {
    const client = new EbayApiClient(baseConfig);
    const { captured, record } = captureRequest();
    nock(API).get('/sell/finances/v1/billing_activity').reply(record);

    await client.get('/sell/finances/v1/billing_activity', undefined, { signed: true });

    expect(captured.headers['x-ebay-signature-key']).toBeUndefined();
    expect(captured.headers['signature-input']).toBeUndefined();
  });

  it('turns eBay signature rejections into setup guidance without credentials', async () => {
    const client = new EbayApiClient(baseConfig);
    nock(API)
      .get('/sell/finances/v1/billing_activity')
      .reply(403, {
        errors: [
          {
            errorId: 215001,
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

  it('fails clearly when the configured private key is invalid', async () => {
    const client = new EbayApiClient({
      ...baseConfig,
      signingKeyJwe: JWE,
      signingPrivateKey: 'not-a-key',
    });

    await expect(
      client.get('/sell/finances/v1/billing_activity', undefined, { signed: true }),
    ).rejects.toThrow(/EBAY_SIGNING_PRIVATE_KEY could not be parsed/);
  });
});
