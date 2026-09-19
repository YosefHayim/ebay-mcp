import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getEbayConfig,
  getBaseUrl,
  getIdentityBaseUrl,
  getProxyAuthConfig,
  getTradingSiteId,
  validateEnvironmentConfig,
} from '@/config/environment.js';
import process from 'node:process';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of process.env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getEbayConfig', () => {
    it('return config with valid credentials', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      process.env.EBAY_REDIRECT_URI = 'https://example.com/callback';
      process.env.EBAY_ENVIRONMENT = 'production';

      const config = getEbayConfig();

      expect(config).toMatchObject({
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        redirectUri: 'https://example.com/callback',
        environment: 'production',
      });
    });

    it('default to sandbox environment', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      delete process.env.EBAY_ENVIRONMENT;

      const config = getEbayConfig();

      expect(config.environment).toBe('sandbox');
    });

    it('handle missing credentials gracefully', () => {
      const stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

      delete process.env.EBAY_CLIENT_ID;
      delete process.env.EBAY_CLIENT_SECRET;

      const config = getEbayConfig();

      expect(config.clientId).toBe('');
      expect(config.clientSecret).toBe('');
      expect(config.environment).toBe('sandbox');
      expect(stderrWriteSpy).toHaveBeenCalled();

      stderrWriteSpy.mockRestore();
    });

    it('handle missing client ID only', () => {
      const stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

      delete process.env.EBAY_CLIENT_ID;
      process.env.EBAY_CLIENT_SECRET = 'test_secret';

      const config = getEbayConfig();

      expect(config.clientId).toBe('');
      expect(stderrWriteSpy).toHaveBeenCalled();

      stderrWriteSpy.mockRestore();
    });

    it('handle missing client secret only', () => {
      const stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

      process.env.EBAY_CLIENT_ID = 'test_id';
      delete process.env.EBAY_CLIENT_SECRET;

      const config = getEbayConfig();

      expect(config.clientSecret).toBe('');
      expect(stderrWriteSpy).toHaveBeenCalled();

      stderrWriteSpy.mockRestore();
    });

    it('handle undefined redirect URI', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      delete process.env.EBAY_REDIRECT_URI;

      const config = getEbayConfig();

      expect(config.redirectUri).toBeUndefined();
    });

    it('default marketplace and content language to US', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      delete process.env.EBAY_MARKETPLACE_ID;
      delete process.env.EBAY_CONTENT_LANGUAGE;

      const config = getEbayConfig();

      expect(config.marketplaceId).toBe('EBAY_US');
      expect(config.contentLanguage).toBe('en-US');
    });

    it('use marketplace and content language from env when set', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      process.env.EBAY_MARKETPLACE_ID = 'EBAY_DE';
      process.env.EBAY_CONTENT_LANGUAGE = 'de-DE';

      const config = getEbayConfig();

      expect(config.marketplaceId).toBe('EBAY_DE');
      expect(config.contentLanguage).toBe('de-DE');
    });

    it('populate proxy fields and not nag about missing credentials in proxy auth mode', () => {
      const stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
      delete process.env.EBAY_CLIENT_ID;
      delete process.env.EBAY_CLIENT_SECRET;
      process.env.EBAY_MCP_DISABLE_AUTH_HEADER = 'true';
      process.env.EBAY_MCP_API_BASE_URL = 'http://localhost:8080';

      const config = getEbayConfig();

      expect(config.disableAuthHeader).toBe(true);
      expect(config.apiBaseUrl).toBe('http://localhost:8080');
      expect(stderrWriteSpy).not.toHaveBeenCalled();

      stderrWriteSpy.mockRestore();
    });
  });

  describe('getBaseUrl', () => {
    it('return production URL for production environment', () => {
      const url = getBaseUrl('production');
      expect(url).toBe('https://api.ebay.com');
    });

    it('return sandbox URL for sandbox environment', () => {
      const url = getBaseUrl('sandbox');
      expect(url).toBe('https://api.sandbox.ebay.com');
    });
  });

  describe('validateEnvironmentConfig', () => {
    it('pass validation with valid config', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      process.env.EBAY_ENVIRONMENT = 'production';
      process.env.EBAY_REDIRECT_URI = 'https://example.com/callback';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fail validation when CLIENT_ID is missing', () => {
      delete process.env.EBAY_CLIENT_ID;
      process.env.EBAY_CLIENT_SECRET = 'test_secret';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EBAY_CLIENT_ID is not set. OAuth will not work.');
    });

    it('fail validation when CLIENT_SECRET is missing', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      delete process.env.EBAY_CLIENT_SECRET;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EBAY_CLIENT_SECRET is not set. OAuth will not work.');
    });

    it('fail validation for invalid environment value', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      process.env.EBAY_ENVIRONMENT = 'invalid';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('EBAY_ENVIRONMENT'))).toBe(true);
    });

    it('warn when ENVIRONMENT is not set', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      delete process.env.EBAY_ENVIRONMENT;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('EBAY_ENVIRONMENT not set'))).toBe(true);
    });

    it('warn when REDIRECT_URI is not set', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      delete process.env.EBAY_REDIRECT_URI;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('EBAY_REDIRECT_URI'))).toBe(true);
    });

    it('warn when REDIRECT_URI is a URL instead of a RuName', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      process.env.EBAY_REDIRECT_URI = 'http://localhost:3000/oauth/callback';

      const result = validateEnvironmentConfig();

      // eBay answers a URL redirect_uri with an opaque "temporarily_unavailable",
      // so the misconfiguration has to be named here to be diagnosable.
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('must be your eBay RuName'))).toBe(true);
    });

    it('accept a RuName redirect URI without warning', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      process.env.EBAY_REDIRECT_URI = 'Your-App-Your-App-abcdef-ghij';

      const result = validateEnvironmentConfig();

      expect(result.warnings.some((w) => w.includes('EBAY_REDIRECT_URI'))).toBe(false);
    });

    it('not require client credentials in proxy auth mode', () => {
      delete process.env.EBAY_CLIENT_ID;
      delete process.env.EBAY_CLIENT_SECRET;
      process.env.EBAY_ENVIRONMENT = 'production';
      process.env.EBAY_MCP_DISABLE_AUTH_HEADER = 'true';
      process.env.EBAY_MCP_API_BASE_URL = 'http://localhost:8080';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.infos.some((i) => i.includes('Proxy auth mode'))).toBe(true);
    });

    it('report an unparseable base URL as a fatal error', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      process.env.EBAY_MCP_API_BASE_URL = 'not a url';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('EBAY_MCP_API_BASE_URL'))).toBe(true);
    });
  });

  describe('getBaseUrl / getIdentityBaseUrl with override', () => {
    it('returns the override when provided, for either environment', () => {
      expect(getBaseUrl('production', 'http://localhost:8080')).toBe('http://localhost:8080');
      expect(getBaseUrl('sandbox', 'https://proxy.internal')).toBe('https://proxy.internal');
      expect(getIdentityBaseUrl('production', 'http://localhost:8080')).toBe(
        'http://localhost:8080',
      );
    });

    it('falls back to the environment default when the override is absent', () => {
      expect(getBaseUrl('production')).toBe('https://api.ebay.com');
      expect(getBaseUrl('sandbox', undefined)).toBe('https://api.sandbox.ebay.com');
      expect(getIdentityBaseUrl('production')).toBe('https://apiz.ebay.com');
    });
  });

  describe('getProxyAuthConfig', () => {
    beforeEach(() => {
      delete process.env.EBAY_MCP_DISABLE_AUTH_HEADER;
      delete process.env.EBAY_MCP_API_BASE_URL;
    });

    it('defaults to auth enabled, no base URL, and no diagnostics', () => {
      const proxy = getProxyAuthConfig();
      expect(proxy.disableAuthHeader).toBe(false);
      expect(proxy.apiBaseUrl).toBeUndefined();
      expect(proxy.warnings).toHaveLength(0);
      expect(proxy.errors).toHaveLength(0);
      expect(proxy.infos).toHaveLength(0);
    });

    it('parses the flag and strips a trailing slash from the base URL', () => {
      process.env.EBAY_MCP_DISABLE_AUTH_HEADER = 'true';
      process.env.EBAY_MCP_API_BASE_URL = 'http://localhost:8080/';

      const proxy = getProxyAuthConfig();

      expect(proxy.disableAuthHeader).toBe(true);
      expect(proxy.apiBaseUrl).toBe('http://localhost:8080');
      expect(proxy.infos.some((i) => i.includes('Proxy auth mode'))).toBe(true);
    });

    it('treats any value other than "true" as auth enabled', () => {
      process.env.EBAY_MCP_DISABLE_AUTH_HEADER = 'TRUE';
      expect(getProxyAuthConfig().disableAuthHeader).toBe(false);
    });

    it('errors on an unparseable base URL instead of silently ignoring it', () => {
      process.env.EBAY_MCP_API_BASE_URL = 'not a url';

      const proxy = getProxyAuthConfig();

      expect(proxy.apiBaseUrl).toBeUndefined();
      expect(proxy.errors.some((e) => e.includes('not a valid URL'))).toBe(true);
    });

    it('warns when auth is disabled but no base URL is set', () => {
      process.env.EBAY_MCP_DISABLE_AUTH_HEADER = 'true';

      const proxy = getProxyAuthConfig();

      expect(proxy.warnings.some((w) => w.includes('EBAY_MCP_API_BASE_URL is not set'))).toBe(true);
    });

    it('warns about cleartext http to a non-loopback host while auth is on', () => {
      process.env.EBAY_MCP_API_BASE_URL = 'http://proxy.example.com:8080';

      const proxy = getProxyAuthConfig();

      expect(proxy.warnings.some((w) => w.includes('transmitted unencrypted'))).toBe(true);
    });

    it('does not warn for cleartext http to a loopback host', () => {
      process.env.EBAY_MCP_API_BASE_URL = 'http://127.0.0.1:8080';
      expect(getProxyAuthConfig().warnings).toHaveLength(0);
    });

    it('does not warn for https to a non-loopback host', () => {
      process.env.EBAY_MCP_API_BASE_URL = 'https://proxy.example.com';
      expect(getProxyAuthConfig().warnings).toHaveLength(0);
    });

    it('does not warn about cleartext when auth is also disabled', () => {
      process.env.EBAY_MCP_DISABLE_AUTH_HEADER = 'true';
      process.env.EBAY_MCP_API_BASE_URL = 'http://proxy.example.com:8080';

      const proxy = getProxyAuthConfig();

      expect(proxy.warnings.some((w) => w.includes('transmitted unencrypted'))).toBe(false);
    });
  });

  describe('getTradingSiteId', () => {
    it('maps the configured marketplace to its Trading API site ID', () => {
      process.env.EBAY_MARKETPLACE_ID = 'EBAY_DE';
      delete process.env.EBAY_SITE_ID;

      expect(getTradingSiteId()).toBe('77');
    });

    it('defaults to the US site when no marketplace is configured', () => {
      delete process.env.EBAY_MARKETPLACE_ID;
      delete process.env.EBAY_SITE_ID;

      expect(getTradingSiteId()).toBe('0');
    });

    it('falls back to the US site for an unknown marketplace', () => {
      process.env.EBAY_MARKETPLACE_ID = 'EBAY_ATLANTIS';
      delete process.env.EBAY_SITE_ID;

      expect(getTradingSiteId()).toBe('0');
    });

    it('lets EBAY_SITE_ID override the marketplace mapping', () => {
      process.env.EBAY_MARKETPLACE_ID = 'EBAY_DE';
      process.env.EBAY_SITE_ID = '3';

      expect(getTradingSiteId()).toBe('3');
    });

    it('ignores a blank EBAY_SITE_ID override', () => {
      process.env.EBAY_MARKETPLACE_ID = 'EBAY_DE';
      process.env.EBAY_SITE_ID = '   ';

      expect(getTradingSiteId()).toBe('77');
    });
  });
});
