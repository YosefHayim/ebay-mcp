import { getScopeTypeDescription, validateScopesDetailed } from '@/auth/scopeUtils.js';
import {
  FINANCES_EARNINGS_SCOPE,
  getDefaultScopes,
  getRequestedScopes,
  LOGISTICS_SCOPE,
  validateScopes,
} from '@/config/environment.js';
import { describe, expect, it } from 'vitest';

const optionalScopes = [FINANCES_EARNINGS_SCOPE, LOGISTICS_SCOPE];

describe('optional Finances earnings and Logistics scopes', () => {
  it.each([
    'production',
    'sandbox',
  ] as const)('recognizes both scopes without requesting them by default in %s', (environment) => {
    for (const scope of optionalScopes) {
      expect(getDefaultScopes(environment)).not.toContain(scope);
      expect(getRequestedScopes(environment, {})).not.toContain(scope);
    }
    expect(
      getRequestedScopes(environment, { EBAY_OAUTH_SCOPES: optionalScopes.join(' ') }),
    ).toEqual(optionalScopes);
    expect(validateScopes(optionalScopes, environment).warnings).toEqual([]);
    expect(validateScopesDetailed(optionalScopes, environment).isValid).toBe(true);
  });

  it('describes both scopes for consent and diagnostics output', () => {
    expect(getScopeTypeDescription(FINANCES_EARNINGS_SCOPE)).toBe('View your order earnings');
    expect(getScopeTypeDescription(LOGISTICS_SCOPE)).toBe(
      'Create shipping quotes and purchase shipping labels',
    );
  });
});
