import { afterEach, describe, expect, test, vi } from 'vitest';
import { readCredentials } from './environment.js';

function stubKeys(): void {
  vi.stubEnv('EBAY_CLIENT_ID', 'client-id');
  vi.stubEnv('EBAY_CLIENT_SECRET', 'client-secret');
  vi.stubEnv('EBAY_ENVIRONMENT', 'sandbox');
  vi.stubEnv('EBAY_USER_REFRESH_TOKEN', 'refresh-token');
  vi.stubEnv('EBAY_MARKETPLACE_ID', 'EBAY_US');
  vi.stubEnv('EBAY_CONTENT_LANGUAGE', 'en-US');
}

describe('readCredentials', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('reads the keys and the sandbox site', () => {
    stubKeys();

    const credentials = readCredentials();

    expect(credentials).toEqual({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      site: 'sandbox',
      refreshToken: 'refresh-token',
      marketplaceId: 'EBAY_US',
      contentLanguage: 'en-US',
    });
  });

  test('defaults a missing site, marketplace, and language', () => {
    vi.stubEnv('EBAY_CLIENT_ID', 'client-id');
    vi.stubEnv('EBAY_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('EBAY_ENVIRONMENT', undefined);
    vi.stubEnv('EBAY_USER_REFRESH_TOKEN', undefined);
    vi.stubEnv('EBAY_MARKETPLACE_ID', undefined);
    vi.stubEnv('EBAY_CONTENT_LANGUAGE', undefined);

    const credentials = readCredentials();

    expect(credentials.site).toBe('sandbox');
    expect(credentials.refreshToken).toBeNull();
    expect(credentials.marketplaceId).toBe('EBAY_US');
    expect(credentials.contentLanguage).toBe('en-US');
  });

  test('treats a blank refresh token as missing', () => {
    stubKeys();
    vi.stubEnv('EBAY_USER_REFRESH_TOKEN', '');

    const credentials = readCredentials();

    expect(credentials.refreshToken).toBeNull();
  });

  test('reads the production site', () => {
    stubKeys();
    vi.stubEnv('EBAY_ENVIRONMENT', 'production');

    const credentials = readCredentials();

    expect(credentials.site).toBe('production');
  });

  test('rejects a missing client id', () => {
    stubKeys();
    vi.stubEnv('EBAY_CLIENT_ID', '');

    function read(): void {
      readCredentials();
    }

    expect(read).toThrow('EBAY_CLIENT_ID is missing');
  });

  test('rejects a missing client secret', () => {
    stubKeys();
    vi.stubEnv('EBAY_CLIENT_SECRET', '');

    function read(): void {
      readCredentials();
    }

    expect(read).toThrow('EBAY_CLIENT_SECRET is missing');
  });

  test('rejects an unknown site', () => {
    stubKeys();
    vi.stubEnv('EBAY_ENVIRONMENT', 'staging');

    function read(): void {
      readCredentials();
    }

    expect(read).toThrow('EBAY_ENVIRONMENT must be sandbox or production');
  });
});
