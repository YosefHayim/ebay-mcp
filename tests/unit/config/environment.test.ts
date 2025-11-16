import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getEbayConfig,
  getBaseUrl,
  getAuthUrl,
  validateEnvironmentConfig,
} from '@/config/environment.js';

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
    it('should return config with valid credentials', () => {
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

    it('should default to sandbox environment', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      delete process.env.EBAY_ENVIRONMENT;

      const config = getEbayConfig();

      expect(config.environment).toBe('sandbox');
    });

    it('should handle missing credentials gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      delete process.env.EBAY_CLIENT_ID;
      delete process.env.EBAY_CLIENT_SECRET;

      const config = getEbayConfig();

      expect(config.clientId).toBe('');
      expect(config.clientSecret).toBe('');
      expect(config.environment).toBe('production');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing client ID only', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      delete process.env.EBAY_CLIENT_ID;
      process.env.EBAY_CLIENT_SECRET = 'test_secret';

      const config = getEbayConfig();

      expect(config.clientId).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing client secret only', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      process.env.EBAY_CLIENT_ID = 'test_id';
      delete process.env.EBAY_CLIENT_SECRET;

      const config = getEbayConfig();

      expect(config.clientSecret).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle undefined redirect URI', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      delete process.env.EBAY_REDIRECT_URI;

      const config = getEbayConfig();

      expect(config.redirectUri).toBeUndefined();
    });
  });

  describe('getBaseUrl', () => {
    it('should return production URL for production environment', () => {
      const url = getBaseUrl('production');
      expect(url).toBe('https://api.ebay.com');
    });

    it('should return sandbox URL for sandbox environment', () => {
      const url = getBaseUrl('sandbox');
      expect(url).toBe('https://api.sandbox.ebay.com');
    });
  });

  describe('getAuthUrl', () => {
    it('should return production auth URL for production environment', () => {
      const url = getAuthUrl('production');
      expect(url).toBe('https://api.ebay.com/identity/v1/oauth2/token');
    });

    it('should return sandbox auth URL for sandbox environment', () => {
      const url = getAuthUrl('sandbox');
      expect(url).toBe('https://api.sandbox.ebay.com/identity/v1/oauth2/token');
    });
  });

  describe('validateEnvironmentConfig', () => {
    it('should pass validation with valid config', () => {
      process.env.EBAY_CLIENT_ID = 'test_client_id';
      process.env.EBAY_CLIENT_SECRET = 'test_client_secret';
      process.env.EBAY_ENVIRONMENT = 'production';
      process.env.EBAY_REDIRECT_URI = 'https://example.com/callback';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when CLIENT_ID is missing', () => {
      delete process.env.EBAY_CLIENT_ID;
      process.env.EBAY_CLIENT_SECRET = 'test_secret';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EBAY_CLIENT_ID is not set. OAuth will not work.');
    });

    it('should fail validation when CLIENT_SECRET is missing', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      delete process.env.EBAY_CLIENT_SECRET;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('EBAY_CLIENT_SECRET is not set. OAuth will not work.');
    });

    it('should fail validation for invalid environment value', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      process.env.EBAY_ENVIRONMENT = 'invalid';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('EBAY_ENVIRONMENT'))).toBe(true);
    });

    it('should warn when ENVIRONMENT is not set', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      delete process.env.EBAY_ENVIRONMENT;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('EBAY_ENVIRONMENT not set'))).toBe(true);
    });

    it('should warn when REDIRECT_URI is not set', () => {
      process.env.EBAY_CLIENT_ID = 'test_id';
      process.env.EBAY_CLIENT_SECRET = 'test_secret';
      delete process.env.EBAY_REDIRECT_URI;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('EBAY_REDIRECT_URI'))).toBe(true);
    });
  });
});
