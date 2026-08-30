import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import nock from 'nock';
import dotenv from 'dotenv';
import * as fs from 'fs';
import type * as FsModule from 'fs';
import { mkdtempSync, promises as fsPromises, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { EbayOAuthClient, type EbayOAuthError } from '@/auth/oauth.js';
import {
  CredentialStoreError,
  DotEnvCredentialStore,
  type CredentialStore,
} from '@/auth/credentialSession.js';
import type { EbayConfig } from '@/types/ebay.js';
import { mockOAuthTokenEndpoint, cleanupMocks } from '@tests/helpers/mockHttp.js';
import process from 'node:process';
import { Effect } from 'effect';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof FsModule>('fs');

  return {
    ...actual,
    writeFileSync: vi.fn(),
  };
});

const initializeOAuthClient = (client: EbayOAuthClient): Promise<void> =>
  Effect.runPromise(client.initialize());

const setUserTokens = (
  client: EbayOAuthClient,
  accessToken: string,
  refreshToken: string,
  accessTokenExpiry?: number,
  refreshTokenExpiry?: number,
): Promise<void> =>
  Effect.runPromise(
    client.setUserTokens(accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry),
  );

const getAccessToken = (client: EbayOAuthClient): Promise<string> =>
  Effect.runPromise(client.getAccessToken());

const getOrRefreshAppAccessToken = (client: EbayOAuthClient): Promise<string> =>
  Effect.runPromise(client.getOrRefreshAppAccessToken());

const exchangeCodeForToken = (client: EbayOAuthClient, code: string) =>
  Effect.runPromise(client.exchangeCodeForToken(code));

const refreshUserToken = (client: EbayOAuthClient): Promise<void> =>
  Effect.runPromise(client.refreshUserToken());

const expectOAuthFailure = async (
  effect: Effect.Effect<unknown, EbayOAuthError>,
  expected: {
    readonly operation: EbayOAuthError['operation'];
    readonly message: string | RegExp;
  },
): Promise<void> => {
  const error = await Effect.runPromise(Effect.flip(effect));

  expect(error._tag).toBe('EbayOAuthError');
  expect(error.operation).toBe(expected.operation);
  if (expected.message instanceof RegExp) {
    expect(error.message).toMatch(expected.message);
  } else {
    expect(error.message).toContain(expected.message);
  }
};

describe('EbayOAuthClient', () => {
  let oauthClient: EbayOAuthClient;
  let config: EbayConfig;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    cleanupMocks();

    // Disable proxy to prevent the HTTP adapter from using it.
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;

    // Enable nock to intercept HTTP requests
    nock.disableNetConnect();

    // Default config
    config = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };

    oauthClient = new EbayOAuthClient(config);
  });

  afterEach(() => {
    cleanupMocks();
    nock.enableNetConnect();
  });

  describe('initialize', () => {
    it('loads user tokens from config when refreshToken is set', async () => {
      config = { ...config, refreshToken: 'test_refresh_token' };
      oauthClient = new EbayOAuthClient(config);

      // Mock the refresh token endpoint
      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'refreshed_access_token',
        token_type: 'Bearer',
        expires_in: 7200,
        refresh_token: 'test_refresh_token',
        refresh_token_expires_in: 47_304_000,
      });

      // Mock the app access token endpoint (called after user token refresh)
      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'app_access_token',
        token_type: 'Bearer',
        expires_in: 7200,
      });

      await initializeOAuthClient(oauthClient);

      expect(oauthClient.hasUserTokens()).toBe(true);
    });

    it('does not load tokens if config refreshToken is not set', async () => {
      await initializeOAuthClient(oauthClient);

      expect(oauthClient.hasUserTokens()).toBe(false);
    });

    it('handles invalid config refreshToken', async () => {
      config = { ...config, refreshToken: 'invalid_refresh_token' };
      oauthClient = new EbayOAuthClient(config);

      // Mock failed refresh
      nock('https://api.sandbox.ebay.com')
        .post('/identity/v1/oauth2/token')
        .reply(400, { error: 'invalid_grant' });

      await initializeOAuthClient(oauthClient);

      expect(oauthClient.hasUserTokens()).toBe(false);
    });

    it('keeps a successfully refreshed user token when persistence fails (issue #157)', async () => {
      const credentialStore: CredentialStore = {
        write: () =>
          Effect.fail(
            new CredentialStoreError({
              envPath: '/read-only/.env',
              message: 'Failed to write credential updates to /read-only/.env',
              cause: new Error('EACCES'),
            }),
          ),
      };
      config = { ...config, refreshToken: 'valid_refresh_token' };
      oauthClient = new EbayOAuthClient(config, credentialStore);

      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'refreshed_access_token',
        token_type: 'Bearer',
        expires_in: 7200,
        refresh_token: 'valid_refresh_token',
        refresh_token_expires_in: 47_304_000,
      });

      await initializeOAuthClient(oauthClient);

      expect(oauthClient.hasUserTokens()).toBe(true);
      await expect(Effect.runPromise(oauthClient.getAccessToken())).resolves.toBe(
        'refreshed_access_token',
      );
    });
  });

  describe('hasUserTokens', () => {
    it('return true when user tokens are set via setUserTokens', async () => {
      await setUserTokens(oauthClient, 'access_token', 'refresh_token');

      expect(oauthClient.hasUserTokens()).toBe(true);
    });

    it('return false when no user tokens are set', () => {
      expect(oauthClient.hasUserTokens()).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('return valid user access token', async () => {
      const accessToken = 'user_access_token';
      const refreshToken = 'user_refresh_token';

      // Set tokens with future expiry
      const futureExpiry = Date.now() + 7200 * 1000;
      await setUserTokens(oauthClient, accessToken, refreshToken, futureExpiry);

      const token = await getAccessToken(oauthClient);

      expect(token).toBe(accessToken);
    });

    it('refresh expired access token using valid refresh token', async () => {
      const newAccessToken = 'new_access_token';
      const refreshToken = 'user_refresh_token';

      // Set tokens with expired access token but valid refresh token
      const pastExpiry = Date.now() - 1000;
      const futureRefreshExpiry = Date.now() + 18 * 30 * 24 * 60 * 60 * 1000;
      await setUserTokens(
        oauthClient,
        'expired_token',
        refreshToken,
        pastExpiry,
        futureRefreshExpiry,
      );

      // Mock refresh token API call
      mockOAuthTokenEndpoint('sandbox', {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 7200,
        refresh_token: refreshToken,
        refresh_token_expires_in: 47_304_000,
      });

      const token = await getAccessToken(oauthClient);

      expect(token).toBe(newAccessToken);
    });

    it('uses a refreshed access token when only its persistence fails (issue #157)', async () => {
      const credentialStore: CredentialStore = {
        write: () =>
          Effect.fail(
            new CredentialStoreError({
              envPath: '/read-only/.env',
              message: 'Failed to write credential updates to /read-only/.env',
              cause: new Error('EACCES'),
            }),
          ),
      };
      oauthClient = new EbayOAuthClient(config, credentialStore);
      const expiredAccessToken = Date.now() - 1;
      const validRefreshToken = Date.now() + 60_000;
      await Effect.runPromise(
        Effect.either(
          oauthClient.setUserTokens(
            'expired_access_token',
            'valid_refresh_token',
            expiredAccessToken,
            validRefreshToken,
          ),
        ),
      );
      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'refreshed_access_token',
        token_type: 'Bearer',
        expires_in: 7200,
      });

      await expect(Effect.runPromise(oauthClient.getAccessToken())).resolves.toBe(
        'refreshed_access_token',
      );
      expect(oauthClient.hasUserTokens()).toBe(true);
    });

    it('returns tagged error when both access and refresh tokens are expired', async () => {
      // Set tokens with both expired
      const pastExpiry = Date.now() - 1000;
      await setUserTokens(oauthClient, 'expired_access', 'expired_refresh', pastExpiry, pastExpiry);

      await expectOAuthFailure(oauthClient.getAccessToken(), {
        operation: 'getAccessToken',
        message: 'User authorization expired',
      });
    });

    it('fallback to client credentials when no user tokens', async () => {
      const clientToken = 'client_credentials_token';
      mockOAuthTokenEndpoint('sandbox', {
        access_token: clientToken,
        token_type: 'Bearer',
        expires_in: 7200,
      });

      const token = await getAccessToken(oauthClient);

      expect(token).toBe(clientToken);
    });

    // The Buy APIs need the application token specifically, so the two
    // acquisition methods have to diverge when both token kinds are available.
    it('returns the application token even when a user token is configured', async () => {
      const appToken = 'client_credentials_token';
      mockOAuthTokenEndpoint('sandbox', {
        access_token: appToken,
        token_type: 'Bearer',
        expires_in: 7200,
      });
      const future = Date.now() + 3_600_000;
      await setUserTokens(oauthClient, 'user_access', 'user_refresh', future, future);

      // The default path still prefers the user token for every other endpoint.
      expect(await getAccessToken(oauthClient)).toBe('user_access');
      expect(await getOrRefreshAppAccessToken(oauthClient)).toBe(appToken);
    });

    it('reuse cached client credentials token if still valid', async () => {
      const clientToken = 'client_credentials_token';
      mockOAuthTokenEndpoint('sandbox', {
        access_token: clientToken,
        token_type: 'Bearer',
        expires_in: 7200,
      });

      // First call fetches the token.
      const token1 = await getAccessToken(oauthClient);
      expect(token1).toBe(clientToken);

      // Second call uses the cached token (no new HTTP call).
      const token2 = await getAccessToken(oauthClient);
      expect(token2).toBe(clientToken);

      // Verify only one HTTP call was made
      expect(nock.pendingMocks().length).toBe(0);
    });
  });

  describe('setUserTokens', () => {
    it('store user tokens in memory', async () => {
      const accessToken = 'user_access_token';
      const refreshToken = 'user_refresh_token';

      await setUserTokens(oauthClient, accessToken, refreshToken);

      expect(oauthClient.hasUserTokens()).toBe(true);

      // Verify tokens work by getting access token
      const token = await getAccessToken(oauthClient);
      expect(token).toBe(accessToken);
    });

    it('set default expiry times when not provided', async () => {
      const accessToken = 'user_access_token';
      const refreshToken = 'user_refresh_token';

      await setUserTokens(oauthClient, accessToken, refreshToken);

      // Verify token is available (not expired)
      const token = await getAccessToken(oauthClient);
      expect(token).toBe(accessToken);
    });
  });

  describe('exchangeCodeForToken', () => {
    it('exchange authorization code for user tokens', async () => {
      const code = 'authorization_code_12345';
      const accessToken = 'exchanged_access_token';
      const refreshToken = 'exchanged_refresh_token';

      mockOAuthTokenEndpoint('sandbox', {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 7200,
        refresh_token: refreshToken,
        refresh_token_expires_in: 47_304_000,
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      });

      const result = await exchangeCodeForToken(oauthClient, code);

      expect(result.access_token).toBe(accessToken);
      expect(result.refresh_token).toBe(refreshToken);
      expect(oauthClient.hasUserTokens()).toBe(true);
    });

    it('returns tagged error if redirect URI is not configured', async () => {
      const configWithoutRedirect = { ...config, redirectUri: undefined };
      const clientWithoutRedirect = new EbayOAuthClient(configWithoutRedirect);

      await expectOAuthFailure(clientWithoutRedirect.exchangeCodeForToken('code_12345'), {
        operation: 'exchangeCodeForToken',
        message: 'Redirect URI is required',
      });
    });

    it('handle OAuth exchange errors', async () => {
      const code = 'invalid_code';

      nock('https://api.sandbox.ebay.com').post('/identity/v1/oauth2/token').reply(400, {
        error: 'invalid_grant',
        error_description: 'Invalid authorization code',
      });

      await expectOAuthFailure(oauthClient.exchangeCodeForToken(code), {
        operation: 'exchangeCodeForToken',
        message: 'Invalid authorization code',
      });
    });
  });

  describe('clearAllTokens', () => {
    it('clear all tokens from memory', async () => {
      // Set tokens first
      await setUserTokens(oauthClient, 'access_token', 'refresh_token');
      expect(oauthClient.hasUserTokens()).toBe(true);

      await oauthClient.clearAllTokens();

      expect(oauthClient.hasUserTokens()).toBe(false);
    });
  });

  describe('getTokenInfo', () => {
    it('return token status information when tokens are set', async () => {
      await setUserTokens(oauthClient, 'access_token', 'refresh_token');
      const info = oauthClient.getTokenInfo();

      expect(info.hasUserToken).toBe(true);
    });

    it('return info when no tokens are available', () => {
      const info = oauthClient.getTokenInfo();

      expect(info.hasUserToken).toBe(false);
      expect(info.hasAppAccessToken).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('return true when valid user tokens exist', async () => {
      const futureExpiry = Date.now() + 7200 * 1000;
      await setUserTokens(oauthClient, 'access_token', 'refresh_token', futureExpiry);

      expect(oauthClient.isAuthenticated()).toBe(true);
    });

    it('return false when tokens are expired', async () => {
      const pastExpiry = Date.now() - 1000;
      await setUserTokens(oauthClient, 'expired_access', 'expired_refresh', pastExpiry, pastExpiry);

      expect(oauthClient.isAuthenticated()).toBe(false);
    });

    it('return false when no tokens are available', () => {
      expect(oauthClient.isAuthenticated()).toBe(false);
    });
  });

  describe('OAuth token persistence (issues #113, #114)', () => {
    let originalCwd: string;
    let tempDir: string;

    const writeFileSyncMock = vi.mocked(fs.writeFileSync);

    /**
     * Locate the most recent fs.writeFileSync call targeting `.env`
     * and return its parsed content. Used to verify token persistence.
     */
    const getLastEnvWrite = (): {
      filePath: string;
      content: string;
      parsed: Record<string, string>;
    } => {
      const envWrite = [...writeFileSyncMock.mock.calls]
        .reverse()
        .find(([filePath]) => String(filePath).endsWith(`${path.sep}.env`));

      expect(envWrite).toBeDefined();

      const [filePath, content] = envWrite!;
      expect(String(filePath)).toMatch(/[\\/]\.env$/);
      expect(typeof content).toBe('string');

      const envContent = content as string;
      return {
        filePath: String(filePath),
        content: envContent,
        parsed: dotenv.parse(envContent),
      };
    };

    beforeEach(() => {
      originalCwd = process.cwd();
      tempDir = mkdtempSync(path.join(tmpdir(), 'ebay-oauth-persistence-'));
      process.chdir(tempDir);
      oauthClient = new EbayOAuthClient(
        config,
        new DotEnvCredentialStore(() => path.join(tempDir, '.env')),
      );
      writeFileSyncMock.mockClear();
    });

    afterEach(() => {
      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
      writeFileSyncMock.mockClear();
    });

    it('exchangeCodeForToken persists both access and refresh tokens to .env (issue #113)', async () => {
      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'AT1',
        token_type: 'Bearer',
        expires_in: 7200,
        refresh_token: 'RT1',
        refresh_token_expires_in: 47_304_000,
      });

      await exchangeCodeForToken(oauthClient, 'auth_code');

      const envWrite = getLastEnvWrite();
      expect(envWrite.content).toContain('EBAY_USER_ACCESS_TOKEN=AT1');
      expect(envWrite.content).toContain('EBAY_USER_REFRESH_TOKEN=RT1');
    });

    it('exchangeCodeForToken does not persist when refresh_token is missing (issue #154)', async () => {
      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'AT_only',
        token_type: 'Bearer',
        expires_in: 7200,
      });

      await expectOAuthFailure(oauthClient.exchangeCodeForToken('auth_code'), {
        operation: 'exchangeCodeForToken',
        message: 'did not include a non-empty refresh_token',
      });

      const envWrite = [...writeFileSyncMock.mock.calls].find(([filePath]) =>
        String(filePath).endsWith(`${path.sep}.env`),
      );
      expect(envWrite).toBeUndefined();
    });

    it('refreshUserToken persists in-memory refresh token to .env even when eBay omits refresh_token (issue #114)', async () => {
      oauthClient = new EbayOAuthClient(
        { ...config, refreshToken: 'stale_env_refresh' },
        new DotEnvCredentialStore(() => path.join(tempDir, '.env')),
      );
      await setUserTokens(oauthClient, 'old_access_token', 'in_memory_refresh');
      writeFileSyncMock.mockClear();

      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'new_access_token',
        expires_in: 7200,
      });

      await refreshUserToken(oauthClient);

      const envWrite = getLastEnvWrite();
      expect(envWrite.parsed.EBAY_USER_ACCESS_TOKEN).toBe('new_access_token');
      expect(envWrite.parsed.EBAY_USER_REFRESH_TOKEN).toBe('in_memory_refresh');
      expect(envWrite.parsed.EBAY_USER_REFRESH_TOKEN).not.toBe('stale_env_refresh');
    });

    it('refreshUserToken persists same refresh token when in-memory differs from env (issue #114, no rotation case)', async () => {
      oauthClient = new EbayOAuthClient(
        { ...config, refreshToken: 'old_env_refresh' },
        new DotEnvCredentialStore(() => path.join(tempDir, '.env')),
      );
      await setUserTokens(oauthClient, 'old_access_token', 'fresh_oauth_refresh');
      writeFileSyncMock.mockClear();

      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'new_access_token',
        expires_in: 7200,
        refresh_token: 'fresh_oauth_refresh',
      });

      await refreshUserToken(oauthClient);

      const envWrite = getLastEnvWrite();
      expect(envWrite.parsed.EBAY_USER_ACCESS_TOKEN).toBe('new_access_token');
      expect(envWrite.parsed.EBAY_USER_REFRESH_TOKEN).toBe('fresh_oauth_refresh');
    });

    it('refreshUserToken does NOT rewrite refresh token when in-memory matches env', async () => {
      oauthClient = new EbayOAuthClient(
        { ...config, refreshToken: 'same_refresh' },
        new DotEnvCredentialStore(() => path.join(tempDir, '.env')),
      );
      await fsPromises.writeFile(
        path.join(tempDir, '.env'),
        'EBAY_USER_REFRESH_TOKEN=same_refresh\nEBAY_USER_ACCESS_TOKEN=old_access\n',
      );
      await setUserTokens(oauthClient, 'old_access_token', 'same_refresh');
      writeFileSyncMock.mockClear();

      mockOAuthTokenEndpoint('sandbox', {
        access_token: 'new_access_token',
        expires_in: 7200,
      });

      await refreshUserToken(oauthClient);

      const envWrite = getLastEnvWrite();
      expect(envWrite.parsed.EBAY_USER_ACCESS_TOKEN).toBe('new_access_token');
      expect(envWrite.parsed.EBAY_USER_REFRESH_TOKEN).toBe('same_refresh');
    });
  });
});
