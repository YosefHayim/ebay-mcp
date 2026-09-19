import { describe, it, expect } from 'vitest';
import {
  getDefaultScopes,
  getRequestedScopes,
  validateScopes,
  getOAuthAuthorizationUrl,
} from '@/config/environment.js';
import process from 'node:process';

describe('Scope Validation', () => {
  describe('getDefaultScopes', () => {
    it('return production scopes for production environment', () => {
      const scopes = getDefaultScopes('production');

      expect(scopes).toBeInstanceOf(Array);
      expect(scopes.length).toBeGreaterThan(0);
      // Production-specific scopes (note: sell.edelivery uses different path format)
      expect(scopes).toContain('https://api.ebay.com/oauth/scope/sell.edelivery');
      expect(scopes).toContain('https://api.ebay.com/oauth/api_scope/commerce.shipping');
    });

    it('return sandbox scopes for sandbox environment', () => {
      const scopes = getDefaultScopes('sandbox');

      expect(scopes).toBeInstanceOf(Array);
      expect(scopes.length).toBeGreaterThan(0);
      // Sandbox-specific scopes
      expect(scopes).toContain('https://api.ebay.com/oauth/api_scope/sell.item.draft');
      expect(scopes).toContain('https://api.ebay.com/oauth/api_scope/sell.item');
    });

    it('include common scopes in both environments', () => {
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

    it('not include sandbox-only scopes in production', () => {
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

    it('not include production-only scopes in sandbox', () => {
      const sandboxScopes = getDefaultScopes('sandbox');

      const productionOnlyScopes = [
        'https://api.ebay.com/oauth/api_scope/commerce.message',
        'https://api.ebay.com/oauth/api_scope/commerce.shipping',
        'https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly',
        'https://api.ebay.com/oauth/scope/sell.edelivery',
      ];

      productionOnlyScopes.forEach((scope) => {
        expect(sandboxScopes).not.toContain(scope);
      });
    });
  });

  describe('validateScopes', () => {
    it('validate all common scopes successfully for production', () => {
      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const result = validateScopes(commonScopes, 'production');

      expect(result.warnings).toHaveLength(0);
      expect(result.validScopes).toEqual(commonScopes);
    });

    it('validate all common scopes successfully for sandbox', () => {
      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const result = validateScopes(commonScopes, 'sandbox');

      expect(result.warnings).toHaveLength(0);
      expect(result.validScopes).toEqual(commonScopes);
    });

    it('warn when requesting sandbox-only scope in production', () => {
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

    it('not warn for common scopes that exist in both environments', () => {
      const commonScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const result = validateScopes(commonScopes, 'sandbox');

      expect(result.warnings.length).toBe(0);
      expect(result.validScopes).toEqual(commonScopes);
    });

    it('warn for unrecognized scopes', () => {
      const unknownScopes = ['https://api.ebay.com/oauth/api_scope/unknown.scope'];

      const result = validateScopes(unknownScopes, 'production');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('not recognized');
      // Still includes the scope
      expect(result.validScopes).toEqual(unknownScopes);
    });

    it('handle mix of valid and invalid scopes', () => {
      const mixedScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory', // Valid for production
        'https://api.ebay.com/oauth/api_scope/sell.item.draft', // Sandbox-only
        'https://api.ebay.com/oauth/api_scope/unknown.scope', // Unknown
      ];

      const result = validateScopes(mixedScopes, 'production');

      expect(result.warnings.length).toBe(2); // Two invalid scopes
      expect(result.validScopes).toEqual(mixedScopes); // All included
    });

    it('return no warnings for empty scope list', () => {
      const result = validateScopes([], 'production');

      expect(result.warnings).toHaveLength(0);
      expect(result.validScopes).toEqual([]);
    });

    it('provide detailed warning messages', () => {
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

    it('generate direct branded OAuth URL for production', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production');
      const parsed = new URL(url);

      expect(parsed.origin).toBe('https://auth.ebay.com');
      expect(parsed.pathname).toBe('/oauth2/authorize');
      expect(parsed.searchParams.get('client_id')).toBe(clientId);
      expect(parsed.searchParams.get('redirect_uri')).toBe(redirectUri);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.has('scope')).toBe(true);
      expect(parsed.searchParams.has('hd')).toBe(false);
      expect(url).not.toContain('signin.ebay.com');
      expect(url).not.toContain('ru=');
      expect(url).not.toContain('AppName');
    });

    it('generate direct branded OAuth URL for sandbox', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'sandbox');
      const parsed = new URL(url);

      expect(parsed.origin).toBe('https://auth.sandbox.ebay.com');
      expect(parsed.pathname).toBe('/oauth2/authorize');
      expect(parsed.searchParams.get('client_id')).toBe(clientId);
      expect(parsed.searchParams.get('redirect_uri')).toBe(redirectUri);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.has('scope')).toBe(true);
      expect(parsed.searchParams.has('hd')).toBe(false);
      expect(url).not.toContain('signin.sandbox.ebay.com');
      expect(url).not.toContain('ru=');
      expect(url).not.toContain('AppName');
    });

    it('include default scopes when no scopes provided', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production');
      const parsed = new URL(url);

      const scope = parsed.searchParams.get('scope');
      expect(scope).toBeTruthy();
      expect(scope).toContain('sell.inventory');
    });

    it('include custom scopes when provided', () => {
      const customScopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production', customScopes);
      const parsed = new URL(url);

      const scope = parsed.searchParams.get('scope')!;
      customScopes.forEach((s) => {
        expect(scope).toContain(s);
      });
    });

    it('include state parameter when provided', () => {
      const state = 'random_state_12345';

      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production', undefined, state);
      const parsed = new URL(url);

      expect(parsed.searchParams.get('state')).toBe(state);
    });

    it('not include state parameter when not provided', () => {
      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production');
      const parsed = new URL(url);

      expect(parsed.searchParams.has('state')).toBe(false);
    });

    it('properly encode special characters in redirect URI', () => {
      const specialRedirectUri = 'https://localhost/callback?param=value&other=test';

      const url = getOAuthAuthorizationUrl(clientId, specialRedirectUri, 'production');
      const parsed = new URL(url);

      expect(parsed.searchParams.get('redirect_uri')).toBe(specialRedirectUri);
    });

    it('join multiple scopes with %20 and not percent-encode scope URIs', () => {
      const scopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ];

      const url = getOAuthAuthorizationUrl(clientId, redirectUri, 'production', scopes);

      expect(url).toContain(
        'scope=https://api.ebay.com/oauth/api_scope/sell.inventory%20https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      );
      expect(url).not.toContain('scope=https%3A%2F%2F');
      expect(url).not.toMatch(/scope=[^&]*\+/);

      const parsed = new URL(url);
      const scopeParam = parsed.searchParams.get('scope')!;
      expect(scopeParam).toBe(scopes.join(' '));
    });
  });

  describe('getRequestedScopes', () => {
    it('fall back to the environment scope table when nothing is configured', () => {
      expect(getRequestedScopes('production', {})).toEqual(getDefaultScopes('production'));
      expect(getRequestedScopes('sandbox', {})).toEqual(getDefaultScopes('sandbox'));
    });

    it('request exactly the configured scopes, split on spaces or commas', () => {
      const scopes = getRequestedScopes('production', {
        EBAY_OAUTH_SCOPES:
          ' https://api.ebay.com/oauth/api_scope, https://api.ebay.com/oauth/api_scope/sell.inventory ',
      });

      // A keyset is granted a subset of the published table, and eBay answers
      // invalid_scope for the whole request when it names a scope it never gave.
      expect(scopes).toEqual([
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
      ]);
    });

    it('drop entries that are not eBay OAuth scope URIs', () => {
      const scopes = getRequestedScopes('production', {
        EBAY_OAUTH_SCOPES:
          'https://api.ebay.com/oauth/api_scope https://evil.example/x&prompt=login not-a-scope',
      });

      expect(scopes).toEqual(['https://api.ebay.com/oauth/api_scope']);
    });

    it('keep the defaults when every configured entry is unusable', () => {
      const scopes = getRequestedScopes('sandbox', { EBAY_OAUTH_SCOPES: 'nonsense' });

      expect(scopes).toEqual(getDefaultScopes('sandbox'));
    });

    it('build the authorization URL from the configured scopes', () => {
      const previous = process.env.EBAY_OAUTH_SCOPES;
      process.env.EBAY_OAUTH_SCOPES = 'https://api.ebay.com/oauth/api_scope/sell.inventory';

      try {
        const url = getOAuthAuthorizationUrl('client', 'Ru-Name', 'production');
        const scopeParam = new URL(url).searchParams.get('scope');

        expect(scopeParam).toBe('https://api.ebay.com/oauth/api_scope/sell.inventory');
      } finally {
        if (previous === undefined) {
          delete process.env.EBAY_OAUTH_SCOPES;
        } else {
          process.env.EBAY_OAUTH_SCOPES = previous;
        }
      }
    });
  });
});
