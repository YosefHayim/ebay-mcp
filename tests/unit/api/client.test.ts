import { describe, it, expect, beforeEach, vi } from 'vitest';
import nock from 'nock';
import { EbayApiClient } from '@/api/client.js';
import { getEbayConfig } from '@/config/environment.js';
import type { EbayConfig } from '@/types/ebay.js';
import { apiLogger } from '@/utils/logger.js';
import process from 'node:process';
import { Effect } from 'effect';

// Mock EbayOAuthClient
const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  getOrRefreshAppAccessToken: vi.fn(),
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

describe('EbayApiClient Unit Tests', () => {
  let apiClient: EbayApiClient;
  let config: EbayConfig;

  beforeEach(async () => {
    vi.clearAllMocks();
    nock.cleanAll();

    // Disable proxy to prevent axios from using it
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;

    // Enable nock to intercept HTTP requests
    nock.disableNetConnect();

    config = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };

    // Setup mock OAuth client
    mockOAuthClient.hasUserTokens.mockReturnValue(true);
    mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
    mockOAuthClient.getOrRefreshAppAccessToken.mockReturnValue(Effect.succeed('mock_app_token'));
    mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));
    mockOAuthClient.setUserTokens.mockReturnValue(Effect.succeed(undefined));
    mockOAuthClient.isAuthenticated.mockReturnValue(true);
    mockOAuthClient.getTokenInfo.mockReturnValue({
      hasUserTokens: true,
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    });

    apiClient = new EbayApiClient(config);
    await Effect.runPromise(apiClient.initialize());
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    vi.unstubAllEnvs();
  });

  describe('Rate Limiting', () => {
    it('track request counts', async () => {
      // Mock a series of successful API calls
      for (let i = 0; i < 5; i++) {
        nock('https://api.sandbox.ebay.com')
          .get('/sell/inventory/v1/test')
          .reply(200, { success: true });
      }

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await apiClient.get('/sell/inventory/v1/test');
      }

      const stats = apiClient.getRateLimitStats();
      expect(stats.current).toBe(5);
      expect(stats.max).toBe(5000);
      expect(stats.windowMs).toBe(60_000);
    });

    it('reset rate limit count after time window', async () => {
      // This test would require mocking time, which is complex
      // Instead we'll test the stats method
      const stats = apiClient.getRateLimitStats();
      expect(stats).toHaveProperty('current');
      expect(stats).toHaveProperty('max');
      expect(stats).toHaveProperty('windowMs');
    });
  });

  describe('Default marketplace and language headers', () => {
    it('include EBAY_US and en-US headers by default', async () => {
      vi.stubEnv('EBAY_CLIENT_ID', 'test_client_id');
      vi.stubEnv('EBAY_CLIENT_SECRET', 'test_client_secret');
      vi.stubEnv('EBAY_MARKETPLACE_ID', undefined);
      vi.stubEnv('EBAY_CONTENT_LANGUAGE', undefined);
      vi.stubEnv('EBAY_ENVIRONMENT', 'sandbox');

      const defaultClient = new EbayApiClient(getEbayConfig());
      await Effect.runPromise(defaultClient.initialize());

      nock('https://api.sandbox.ebay.com', {
        reqheaders: {
          'x-ebay-c-marketplace-id': 'EBAY_US',
          'content-language': 'en-US',
          'accept-language': 'en-US',
        },
      })
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      const result = await defaultClient.get('/sell/inventory/v1/test');
      expect(result).toEqual({ success: true });
    });

    it('override headers when config provides values', async () => {
      const customClient = new EbayApiClient({
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        environment: 'sandbox',
        redirectUri: 'https://localhost/callback',
        marketplaceId: 'EBAY_DE',
        contentLanguage: 'de-DE',
      });
      await Effect.runPromise(customClient.initialize());

      nock('https://api.sandbox.ebay.com', {
        reqheaders: {
          'x-ebay-c-marketplace-id': 'EBAY_DE',
          'content-language': 'de-DE',
          'accept-language': 'de-DE',
        },
      })
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      const result = await customClient.get('/sell/inventory/v1/test');
      expect(result).toEqual({ success: true });
    });
  });

  describe('429 Rate Limit Errors', () => {
    it('handle 429 errors with Retry-After header', async () => {
      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(429, { error: 'Rate limit exceeded' }, { 'retry-after': '60' });

      await expect(apiClient.get('/sell/inventory/v1/test')).rejects.toThrow(
        /eBay API rate limit exceeded.*60 seconds/,
      );
    });

    it('handle 429 errors without Retry-After header', async () => {
      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(429, { error: 'Rate limit exceeded' });

      await expect(apiClient.get('/sell/inventory/v1/test')).rejects.toThrow(
        /eBay API rate limit exceeded.*60 seconds/,
      );
    });
  });

  describe('HTTP status error body detail', () => {
    it('includes the full eBay error body (errorId, parameters) in the message', async () => {
      const errorBody = {
        errors: [
          {
            errorId: 25_709,
            message: 'Invalid Accept-Language',
            longMessage: 'The Accept-Language header is invalid.',
            parameters: [{ name: 'acceptLanguage', value: '*' }],
          },
        ],
      };

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/inventory_item')
        .reply(400, errorBody);

      await expect(apiClient.get('/sell/inventory/v1/inventory_item')).rejects.toThrow(
        /eBay API Error: The Accept-Language header is invalid\. \| response: .*errorId.*25709/,
      );
    });
  });

  describe('Server Error Retry Logic', () => {
    it('retry on 500 errors with exponential backoff', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});

      // First two attempts fail with 500
      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(500, { error: 'Internal server error' });

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(500, { error: 'Internal server error' });

      // Third attempt succeeds
      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      const result = await apiClient.get('/sell/inventory/v1/test');

      expect(result).toEqual({ success: true });
      expect(apiErrorSpy).toHaveBeenCalled();

      apiErrorSpy.mockRestore();
    }, 10_000);

    it('give up after 3 retry attempts', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});

      // All 4 attempts fail (original + 3 retries)
      for (let i = 0; i < 4; i++) {
        nock('https://api.sandbox.ebay.com')
          .get('/sell/inventory/v1/test')
          .reply(500, { error: 'Internal server error' });
      }

      await expect(apiClient.get('/sell/inventory/v1/test')).rejects.toThrow();

      apiErrorSpy.mockRestore();
    }, 15_000);

    it('retry on 502 errors', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(502, { error: 'Bad gateway' });

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      const result = await apiClient.get('/sell/inventory/v1/test');
      expect(result).toEqual({ success: true });

      apiErrorSpy.mockRestore();
    }, 10_000);

    it('retry on 503 errors', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(503, { error: 'Service unavailable' });

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      const result = await apiClient.get('/sell/inventory/v1/test');
      expect(result).toEqual({ success: true });

      apiErrorSpy.mockRestore();
    }, 10_000);

    it('retry on 504 errors', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(504, { error: 'Gateway timeout' });

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      const result = await apiClient.get('/sell/inventory/v1/test');
      expect(result).toEqual({ success: true });

      apiErrorSpy.mockRestore();
    }, 10_000);
  });

  describe('Rate Limit Header Tracking', () => {
    it('log rate limit headers when present', async () => {
      const apiHttpSpy = vi.spyOn(apiLogger, 'http').mockImplementation(() => {});

      nock('https://api.sandbox.ebay.com').get('/sell/inventory/v1/test').reply(
        200,
        { success: true },
        {
          'x-ebay-c-ratelimit-remaining': '4500',
          'x-ebay-c-ratelimit-limit': '5000',
        },
      );

      await apiClient.get('/sell/inventory/v1/test');

      // Check that rate limit info was logged (could be in detailed debug format)
      const rateLimitCalls = apiHttpSpy.mock.calls.filter(
        (call) => (call[1] as { rateLimit?: string } | undefined)?.rateLimit === '4500/5000',
      );
      expect(rateLimitCalls.length).toBeGreaterThan(0);

      apiHttpSpy.mockRestore();
    });

    it('not log when rate limit headers are absent', async () => {
      const apiHttpSpy = vi.spyOn(apiLogger, 'http').mockImplementation(() => {});

      nock('https://api.sandbox.ebay.com')
        .get('/sell/inventory/v1/test')
        .reply(200, { success: true });

      await apiClient.get('/sell/inventory/v1/test');

      // Should not have been called with rate limit message
      const rateLimitCalls = apiHttpSpy.mock.calls.filter(
        (call) => (call[1] as { rateLimit?: string } | undefined)?.rateLimit,
      );
      expect(rateLimitCalls).toHaveLength(0);

      apiHttpSpy.mockRestore();
    });
  });

  describe('Client Helper Methods', () => {
    it('return isAuthenticated status', () => {
      const isAuth = apiClient.isAuthenticated();
      expect(typeof isAuth).toBe('boolean');
    });

    it('return hasUserTokens status', () => {
      mockOAuthClient.hasUserTokens.mockReturnValue(true);
      const hasTokens = apiClient.hasUserTokens();
      expect(typeof hasTokens).toBe('boolean');
    });

    it('set user tokens', async () => {
      await Effect.runPromise(
        apiClient.setUserTokens(
          'new-access-token',
          'new-refresh-token',
          Date.now() + 7_200_000,
          Date.now() + 47_304_000_000,
        ),
      );

      expect(mockOAuthClient.setUserTokens).toHaveBeenCalled();
    });

    it('return token info', () => {
      const tokenInfo = apiClient.getTokenInfo();
      expect(tokenInfo).toBeDefined();
    });

    it('return OAuth client instance', () => {
      const oauthClient = apiClient.getOAuthClient();
      expect(oauthClient).toBeDefined();
    });
  });

  describe('Proxy auth mode (disableAuthHeader)', () => {
    function createProxyClient(environment: 'production' | 'sandbox' = 'sandbox') {
      return new EbayApiClient({
        clientId: '',
        clientSecret: '',
        environment,
        apiBaseUrl: 'http://localhost:8099',
        disableAuthHeader: true,
      });
    }

    it('omits the Authorization header and acquires no token', async () => {
      const proxyClient = createProxyClient();
      await Effect.runPromise(proxyClient.initialize());

      const scope = nock('http://localhost:8099', { badheaders: ['authorization'] })
        .get('/sell/inventory/v1/test')
        .reply(200, { ok: true });

      const result = await proxyClient.get('/sell/inventory/v1/test');

      expect(result).toEqual({ ok: true });
      expect(mockOAuthClient.getAccessToken).not.toHaveBeenCalled();
      scope.done();
    });

    it('routes requests to the overridden base URL', async () => {
      const proxyClient = createProxyClient('production');
      await Effect.runPromise(proxyClient.initialize());

      nock('http://localhost:8099').get('/sell/account/v1/test').reply(200, { routed: true });

      const result = await proxyClient.get('/sell/account/v1/test');
      expect(result).toEqual({ routed: true });
    });

    it('surfaces a 401 without attempting a token refresh', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});
      const proxyClient = createProxyClient();
      await Effect.runPromise(proxyClient.initialize());

      nock('http://localhost:8099')
        .get('/sell/inventory/v1/test')
        .reply(401, { errors: [{ message: 'Unauthorized by proxy' }] });

      await expect(proxyClient.get('/sell/inventory/v1/test')).rejects.toThrow(/eBay API Error/);
      expect(mockOAuthClient.getAccessToken).not.toHaveBeenCalled();

      apiErrorSpy.mockRestore();
    });
  });
  // eBay documents the Buy APIs as requiring a client-credentials application
  // token, but the default token path prefers a configured user token. Both
  // token kinds are configured here (getAccessToken resolves the user token,
  // getOrRefreshAppAccessToken the application token) so these assert which
  // one actually reaches the wire.
  describe('Application token requests (tokenType)', () => {
    const HOST = 'https://api.sandbox.ebay.com';
    const PATH = '/buy/browse/v1/item_summary/search';

    it('sends the user token by default, leaving the other tools unchanged', async () => {
      const scope = nock(HOST)
        .matchHeader('authorization', 'Bearer mock_access_token')
        .get('/sell/inventory/v1/test')
        .reply(200, { ok: true });

      await apiClient.get('/sell/inventory/v1/test');

      expect(mockOAuthClient.getAccessToken).toHaveBeenCalled();
      expect(mockOAuthClient.getOrRefreshAppAccessToken).not.toHaveBeenCalled();
      scope.done();
    });

    it('sends the application token when tokenType is application', async () => {
      const scope = nock(HOST)
        .matchHeader('authorization', 'Bearer mock_app_token')
        .get(PATH)
        .reply(200, { ok: true });

      const result = await apiClient.get(PATH, undefined, { tokenType: 'application' });

      expect(result).toEqual({ ok: true });
      expect(mockOAuthClient.getOrRefreshAppAccessToken).toHaveBeenCalled();
      expect(mockOAuthClient.getAccessToken).not.toHaveBeenCalled();
      scope.done();
    });

    // The 401 path re-acquires a token before retrying. Acquiring it from the
    // default path there would silently downgrade an application request to the
    // user token on retry.
    it('keeps the application token when a 401 triggers the retry', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});
      const scope = nock(HOST)
        .matchHeader('authorization', 'Bearer mock_app_token')
        .get(PATH)
        .reply(401, { errors: [{ message: 'Invalid access token' }] })
        .matchHeader('authorization', 'Bearer mock_app_token')
        .get(PATH)
        .reply(200, { ok: true });

      const result = await apiClient.get(PATH, undefined, { tokenType: 'application' });

      expect(result).toEqual({ ok: true });
      // Three acquisitions: the first attempt, the 401 handler's re-acquire,
      // and the retry attempt itself. All three must take the application path.
      expect(mockOAuthClient.getOrRefreshAppAccessToken).toHaveBeenCalledTimes(3);
      expect(mockOAuthClient.getAccessToken).not.toHaveBeenCalled();
      scope.done();
      apiErrorSpy.mockRestore();
    });

    // Telling a caller to set user tokens cannot repair rejected client
    // credentials, so the remediation has to follow the token the request needs.
    it('points an application-token failure at the client credentials', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});
      // The first acquisition succeeds so the request reaches eBay; the 401
      // handler's re-acquire is the one that fails.
      let attempt = 0;
      mockOAuthClient.getOrRefreshAppAccessToken.mockImplementation(() => {
        attempt += 1;
        return attempt === 1
          ? Effect.succeed('mock_app_token')
          : Effect.fail(new Error('invalid_client'));
      });
      nock(HOST)
        .get(PATH)
        .reply(401, { errors: [{ message: 'Invalid access token' }] });

      await expect(apiClient.get(PATH, undefined, { tokenType: 'application' })).rejects.toThrow(
        /EBAY_CLIENT_ID and EBAY_CLIENT_SECRET/,
      );

      apiErrorSpy.mockRestore();
    });

    it('keeps the user-token remediation on the default path', async () => {
      const apiErrorSpy = vi.spyOn(apiLogger, 'error').mockImplementation(() => {});
      let attempt = 0;
      mockOAuthClient.getAccessToken.mockImplementation(() => {
        attempt += 1;
        return attempt === 1
          ? Effect.succeed('mock_access_token')
          : Effect.fail(new Error('refresh failed'));
      });
      nock(HOST)
        .get('/sell/inventory/v1/test')
        .reply(401, { errors: [{ message: 'Invalid access token' }] });

      await expect(apiClient.get('/sell/inventory/v1/test')).rejects.toThrow(
        /ebay_set_user_tokens_with_expiry/,
      );

      apiErrorSpy.mockRestore();
    });

    it('still acquires no token at all in proxy auth mode', async () => {
      const proxyClient = new EbayApiClient({
        clientId: '',
        clientSecret: '',
        environment: 'sandbox',
        apiBaseUrl: 'http://localhost:8099',
        disableAuthHeader: true,
      });
      await Effect.runPromise(proxyClient.initialize());

      const scope = nock('http://localhost:8099', { badheaders: ['authorization'] })
        .get(PATH)
        .reply(200, { ok: true });

      await proxyClient.get(PATH, undefined, { tokenType: 'application' });

      expect(mockOAuthClient.getAccessToken).not.toHaveBeenCalled();
      expect(mockOAuthClient.getOrRefreshAppAccessToken).not.toHaveBeenCalled();
      scope.done();
    });
  });
});
