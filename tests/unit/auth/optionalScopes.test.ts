import {
  getRequiredScopesForTool,
  getScopeTypeDescription,
  validateScopesDetailed,
} from '@/auth/scopeUtils.js';
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

  it.each([
    'ebay_get_order_earnings',
    'ebay_get_order_earnings_by_id',
    'ebay_get_order_earnings_summary',
  ])('requires order-earnings consent for %s', (tool) => {
    expect(getRequiredScopesForTool(tool)).toMatchObject({
      requiredScopes: [FINANCES_EARNINGS_SCOPE],
      minimumScope: FINANCES_EARNINGS_SCOPE,
    });
  });

  it.each([
    'ebay_create_shipping_quote',
    'ebay_get_shipping_quote',
    'ebay_create_shipment_from_shipping_quote',
    'ebay_get_shipment',
    'ebay_cancel_shipment',
    'ebay_download_shipping_label_file',
  ])('requires logistics consent for %s', (tool) => {
    expect(getRequiredScopesForTool(tool)).toMatchObject({
      requiredScopes: [LOGISTICS_SCOPE],
      minimumScope: LOGISTICS_SCOPE,
    });
  });
});
