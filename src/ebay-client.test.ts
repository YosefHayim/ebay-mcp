import { Buffer } from 'node:buffer';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { EbayClient } from './ebay-client.js';
import type { EbayCredentials } from './environment.js';

const credentials: EbayCredentials = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  site: 'sandbox',
  marketplaceId: 'EBAY_US',
  contentLanguage: 'en-US',
};

const rateLimitPath = '/developer/analytics/v1_beta/rate_limit/';

function tokenReply(accessToken = 'app-token', expiresIn = 7200): Response {
  const document = { access_token: accessToken, expires_in: expiresIn };
  const replyText = JSON.stringify(document);
  return new Response(replyText, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function jsonReply(document: unknown, status = 200): Response {
  const replyText = JSON.stringify(document);
  return new Response(replyText, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function installFetch(replies: Array<Response | Error>): Request[] {
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

    const isFailure = nextReply instanceof Error;
    if (isFailure) {
      return Promise.reject(nextReply);
    }

    return Promise.resolve(nextReply);
  }

  vi.stubGlobal('fetch', fakeFetch);
  return calls;
}

function encodedBasic(): string {
  const pair = 'client-id:client-secret';
  const pairBytes = Buffer.from(pair, 'utf8');
  return pairBytes.toString('base64');
}

function countTokenCalls(calls: Request[]): number {
  function isTokenCall(request: Request): boolean {
    return request.url.endsWith('/identity/v1/oauth2/token');
  }

  const tokenCalls = calls.filter(isTokenCall);
  return tokenCalls.length;
}

describe('isSandbox', () => {
  test('returns true on the sandbox site', () => {
    const client = new EbayClient(credentials);

    const isSandboxSite = client.isSandbox();

    expect(isSandboxSite).toBe(true);
  });

  test('returns false on the production site', () => {
    const production: EbayCredentials = {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      site: 'production',
      marketplaceId: credentials.marketplaceId,
      contentLanguage: credentials.contentLanguage,
    };
    const client = new EbayClient(production);

    const isSandboxSite = client.isSandbox();

    expect(isSandboxSite).toBe(false);
  });
});

describe('getJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('sends a basic token request and a bearer call on the sandbox host', async () => {
    const calls = installFetch([tokenReply(), jsonReply({ rateLimits: [] })]);
    const client = new EbayClient(credentials);

    const limits = await client.getJson(rateLimitPath);

    expect(limits).toEqual({ rateLimits: [] });
    const [tokenCall, rateCall] = calls;
    expect(tokenCall?.url).toBe('https://api.sandbox.ebay.com/identity/v1/oauth2/token');
    expect(tokenCall?.method).toBe('POST');
    const tokenAuthorization = tokenCall?.headers.get('Authorization');
    const basic = encodedBasic();
    expect(tokenAuthorization).toBe(`Basic ${basic}`);
    const tokenForm = await tokenCall?.text();
    const scope = encodeURIComponent('https://api.ebay.com/oauth/api_scope');
    expect(tokenForm).toBe(`grant_type=client_credentials&scope=${scope}`);
    expect(tokenCall?.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(rateCall?.url).toBe(`https://api.sandbox.ebay.com${rateLimitPath}`);
    expect(rateCall?.method).toBe('GET');
    expect(rateCall?.headers.get('Authorization')).toBe('Bearer app-token');
    expect(rateCall?.headers.get('Accept')).toBe('application/json');
    expect(rateCall?.headers.get('Content-Language')).toBe('en-US');
    expect(rateCall?.headers.get('X-EBAY-C-MARKETPLACE-ID')).toBe('EBAY_US');
    expect(rateCall?.headers.get('Content-Type')).toBeNull();
  });

  test('calls the production host when the site is production', async () => {
    const calls = installFetch([tokenReply(), jsonReply({ rateLimits: [] })]);
    const production: EbayCredentials = {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      site: 'production',
      marketplaceId: 'EBAY_GB',
      contentLanguage: 'en-GB',
    };
    const client = new EbayClient(production);

    await client.getJson(rateLimitPath);

    const [tokenCall, rateCall] = calls;
    expect(tokenCall?.url).toBe('https://api.ebay.com/identity/v1/oauth2/token');
    expect(rateCall?.url).toBe(`https://api.ebay.com${rateLimitPath}`);
    expect(rateCall?.headers.get('X-EBAY-C-MARKETPLACE-ID')).toBe('EBAY_GB');
    expect(rateCall?.headers.get('Content-Language')).toBe('en-GB');
  });

  test('reuses the application token until it expires', async () => {
    let clock = 1_000_000;

    function currentTimeMilliseconds(): number {
      return clock;
    }

    const calls = installFetch([
      tokenReply('app-token', 120),
      jsonReply({ rateLimits: ['first'] }),
      jsonReply({ rateLimits: ['second'] }),
      tokenReply('next-token', 120),
      jsonReply({ rateLimits: ['third'] }),
    ]);
    const client = new EbayClient(credentials, currentTimeMilliseconds);

    const first = await client.getJson(rateLimitPath);
    const second = await client.getJson(rateLimitPath);
    const threeHoursMilliseconds = 3 * 60 * 60 * 1000;
    clock += threeHoursMilliseconds;
    const third = await client.getJson(rateLimitPath);

    expect(first).toEqual({ rateLimits: ['first'] });
    expect(second).toEqual({ rateLimits: ['second'] });
    expect(third).toEqual({ rateLimits: ['third'] });
    const [, , , , refreshedRateCall] = calls;
    expect(countTokenCalls(calls)).toBe(2);
    expect(refreshedRateCall?.headers.get('Authorization')).toBe('Bearer next-token');
  });

  test('throws when the token request cannot connect', async () => {
    installFetch([new Error('offline')]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow('eBay token request failed');
  });

  test('throws when the token request is rejected', async () => {
    installFetch([jsonReply({ error: 'invalid_client' }, 401)]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow('eBay returned 401 for the token request');
  });

  test('throws when the access token is missing', async () => {
    installFetch([jsonReply({ expires_in: 7200 })]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow('eBay did not return an access token');
  });

  test('throws when expires_in is missing', async () => {
    installFetch([jsonReply({ access_token: 'app-token' })]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow('eBay did not return expires_in');
  });

  test('throws when the call is rejected', async () => {
    installFetch([tokenReply(), jsonReply({ message: 'slow down' }, 429)]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow(
      `eBay returned 429 for ${rateLimitPath}: {"message":"slow down"}`,
    );
  });

  test('throws when the call cannot connect', async () => {
    installFetch([tokenReply(), new Error('offline')]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow(`eBay request failed for ${rateLimitPath}`);
  });

  test('throws when the call is not JSON', async () => {
    const html = new Response('<html></html>', { status: 200 });
    installFetch([tokenReply(), html]);
    const client = new EbayClient(credentials);

    async function readLimits(): Promise<unknown> {
      const limits = await client.getJson(rateLimitPath);
      return limits;
    }

    await expect(readLimits()).rejects.toThrow(
      `eBay returned unreadable JSON for ${rateLimitPath}`,
    );
  });
});
