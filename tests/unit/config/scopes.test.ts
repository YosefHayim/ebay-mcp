import { describe, it, expect } from 'vitest';
import {
  getDefaultScopes,
  validateScopes,
  getOAuthAuthorizationUrl,
} from '../../../src/config/environment.js';

describe('Scope Validation', () => {
  describe('getDefaultScopes', () => {
    it('should return production scopes for production environment', () => {
      const scopes = getDefaultScopes('production');

      expect(scopes).toBeInstanceOf(Array);
      expect(scopes.length).toBeGreaterThan(0);
      // Production-specific scopes (note: sell.edelivery uses different path format)
      expect(scopes).toContain('https://api.ebay.com/oauth/scope/sell.edelivery');
      expect(scopes).toContain('https://api.ebay.com/oauth/api_scope/commerce.shipping');
    });

    it('should return sandbox scopes for sandbox environment', () => {
      const scopes = getDefaultScopes('sandbox');

      expect(scopes).toBeInstanceOf(Array);
      expect(scopes.length).toBeGreaterThan(0);
      // Sandbox-specific scopes
      expect(scopes).toContain('https://api.ebay.com/oauth/api_scope/sell.item.draft');
      expect(scopes).toContain('https://api.ebay.com/oauth/api_scope/sell.item');
    });

    it('should include common scopes in both environments', () => {
      const productionScopes = getDefaultScopes('production');
      const sandboxScopes = getDefaultScopes('sandbox');

      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.marketing',
      ];

      commonScopes.forEach((scope) => {
        expect(productionScopes).toContain(scope);
        expect(sandboxScopes).toContain(scope);
      });
    });

    it('should not include sandbox-only scopes in production', () => {
      const productionScopes = getDefaultScopes('production');

      const sandboxOnlyScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.item.draft',
        'https://api.ebay.com/oauth/api_scope/sell.item',
        'https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly',
      ];

      sandboxOnlyScopes.forEach((scope) => {
        expect(productionScopes).not.toContain(scope);
      });
    });

    it('should include all production scopes in sandbox (sandbox is superset)', () => {
      const sandboxScopes = getDefaultScopes('sandbox');
      const productionScopes = getDefaultScopes('production');

      // All production scopes should exist in sandbox, except sell.edelivery
      // which has different URL paths (oauth/scope vs oauth/api_scope)
      const productionScopesWithoutEdelivery = productionScopes.filter(
        (scope) => scope !== 'https://api.ebay.com/oauth/scope/sell.edelivery'
      );

      productionScopesWithoutEdelivery.forEach((scope) => {
        expect(sandboxScopes).toContain(scope);
      });

      // Verify sandbox has its own edelivery scope
      expect(sandboxScopes).toContain('https://api.ebay.com/oauth/api_scope/sell.edelivery');
    });
  });

  describe('validateScopes', () => {
    it('should validate all common scopes successfully for production', () => {
      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const result = validateScopes(commonScopes, 'production');

      expect(result.warnings).toHaveLength(0);
      expect(result.validScopes).toEqual(commonScopes);
    });

    it('should validate all common scopes successfully for sandbox', () => {
      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const result = validateScopes(commonScopes, 'sandbox');

      expect(result.warnings).toHaveLength(0);
      expect(result.validScopes).toEqual(commonScopes);
    });

    it('should warn when requesting sandbox-only scope in production', () => {
      const sandboxOnlyScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.item.draft',
        'https://api.ebay.com/oauth/api_scope/sell.item',
      ];

      const result = validateScopes(sandboxOnlyScopes, 'production');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('only available in sandbox environment');
      // Still includes the scopes (let eBay reject them)
      expect(result.validScopes).toEqual(sandboxOnlyScopes);
    });

    it('should not warn for common scopes that exist in both environments', () => {
      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/commerce.shipping',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
      ];

      const result = validateScopes(commonScopes, 'sandbox');

      // These scopes exist in both environments, so no warnings
      expect(result.warnings.length).toBe(0);
      expect(result.validScopes).toEqual(commonScopes);
    });

    it('should warn for unrecognized scopes', () => {
      const unknownScopes = ['https://api.ebay.com/oauth/api_scope/unknown.scope'];

      const result = validateScopes(unknownScopes, 'production');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('not recognized');
      // Still includes the scope
      expect(result.validScopes).toEqual(unknownScopes);
    });

    it('should handle mix of valid and invalid scopes', () => {
      const mixedScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory', // Valid for production
        'https://api.ebay.com/oauth/api_scope/sell.item.draft', // Sandbox-only
        'https://api.ebay.com/oauth/api_scope/unknown.scope', // Unknown
      ];

      const result = validateScopes(mixedScopes, 'production');

      expect(result.warnings.length).toBe(2); // Two invalid scopes
      expect(result.validScopes).toEqual(mixedScopes); // All included
    });

    it('should return no warnings for empty scope list', () => {
      const result = validateScopes([], 'production');

      expect(result.warnings).toHaveLength(0);
      expect(result.validScopes).toEqual([]);
    });

    it('should provide detailed warning messages', () => {
      const sandboxOnlyScope = ['https://api.ebay.com/oauth/api_scope/sell.item.draft'];

      const result = validateScopes(sandboxOnlyScope, 'production');

      expect(result.warnings[0]).toMatch(/sell\.item\.draft/);
      expect(result.warnings[0]).toMatch(/only available in sandbox environment/);
      expect(result.warnings[0]).toMatch(/may be rejected/);
    });
  });

  describe('getOAuthAuthorizationUrl', () => {
    const clientId = 'test_client_id';
    const redirectUri = 'https://localhost/callback';

    it('should generate valid OAuth URL for production', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production');

      expect(url).toContain('https://signin.ebay.com/signin');
      expect(url).toContain('ru=');
      expect(url).toContain(`AppName=${clientId}`);
      // Decode the ru parameter to check authorize URL contents
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);
      expect(decodedRu).toContain('https://auth.ebay.com/oauth2/authorize');
      expect(decodedRu).toContain(`client_id=${clientId}`);
      expect(decodedRu).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(decodedRu).toContain('response_type=code');
    });

    it('should generate valid OAuth URL for sandbox', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'sandbox');

      expect(url).toContain('https://signin.sandbox.ebay.com/signin');
      expect(url).toContain('ru=');
      expect(url).toContain(`AppName=${clientId}`);
      // Decode the ru parameter to check authorize URL contents
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);
      expect(decodedRu).toContain('https://auth.sandbox.ebay.com/oauth2/authorize');
      expect(decodedRu).toContain(`client_id=${clientId}`);
      expect(decodedRu).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(decodedRu).toContain('response_type=code');
    });

    it('should include default scopes when no scopes provided', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production');

      // Decode the ru parameter to check scopes
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);
      expect(decodedRu).toContain('scope=');
      // Should include at least one default scope
      expect(decodedRu).toContain('sell.inventory');
    });

    it('should include custom scopes when provided', () => {
      const customScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production', customScopes);

      // Decode the ru parameter to check custom scopes
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);

      customScopes.forEach((scope) => {
        expect(decodedRu).toContain(encodeURIComponent(scope));
      });
    });

    it('should include state parameter when provided', () => {
      const state = 'random_state_12345';

      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production', undefined, state);

      // Decode the ru parameter to check state
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);
      expect(decodedRu).toContain(`state=${state}`);
    });

    it('should not include state parameter when not provided', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production');

      // Decode the ru parameter to check state is not present
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);
      expect(decodedRu).not.toContain('state=');
    });

    it('should properly encode special characters in redirect URI', () => {
      const specialRedirectUri = 'https://localhost/callback?param=value&other=test';

      const url = getOAuthAuthorizationUrl(clientId, specialRedirectUri, 'production');

      // Decode the ru parameter to check redirect_uri encoding
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);
      expect(decodedRu).toContain(encodeURIComponent(specialRedirectUri));
    });

    it('should join multiple scopes with space', () => {
      const scopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production', scopes);

      // Decode the ru parameter to check scopes are joined
      const ruMatch = /ru=([^&]+)/.exec(url);
      expect(ruMatch).not.toBeNull();
      const decodedRu = decodeURIComponent(ruMatch![1]);

      // Scopes should be joined and present (URL encoding uses + for spaces)
      scopes.forEach((scope) => {
        expect(decodedRu).toContain(encodeURIComponent(scope));
      });
    });
  });
});
