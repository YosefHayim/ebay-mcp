import { getRequiredScopesForTool, validateScopesDetailed } from '@/auth/scopeUtils.js';
import {
  getDefaultScopes,
  getRequestedScopes,
  POST_ORDER_DOCUMENT_SCOPE,
  validateScopes,
} from '@/config/environment.js';
import { isReadOnlyTool } from '@/mcp/readOnlyFilter.js';
import { toolNamesInFamilies } from '@/mcp/toolGating.js';
import { mediaEntries } from '@/tools/categories/media.js';
import { describe, expect, it } from 'vitest';

const listing = [
  'create_image_from_url',
  'create_document',
  'create_document_from_url',
  'get_document',
  'upload_document',
];
const postOrder = [
  'upload_post_order_document',
  'download_post_order_document',
  'remove_post_order_document',
];

describe('media scopes and discovery', () => {
  it.each([
    'production',
    'sandbox',
  ] as const)('recognizes optional consent without changing %s defaults', (environment) => {
    expect(getDefaultScopes(environment)).not.toContain(POST_ORDER_DOCUMENT_SCOPE);
    expect(getRequestedScopes(environment, {})).not.toContain(POST_ORDER_DOCUMENT_SCOPE);
    expect(
      getRequestedScopes(environment, { EBAY_OAUTH_SCOPES: POST_ORDER_DOCUMENT_SCOPE }),
    ).toEqual([POST_ORDER_DOCUMENT_SCOPE]);
    expect(validateScopes([POST_ORDER_DOCUMENT_SCOPE], environment).warnings).toEqual([]);
    expect(validateScopesDetailed([POST_ORDER_DOCUMENT_SCOPE], environment).isValid).toBe(true);
  });
  it.each(listing)('requires inventory consent for %s', (name) => {
    expect(getRequiredScopesForTool(`ebay_${name}`)?.requiredScopes).toEqual([
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
    ]);
  });
  it.each(postOrder)('requires post-order consent for %s', (name) => {
    expect(getRequiredScopesForTool(`ebay_${name}`)?.requiredScopes).toEqual([
      POST_ORDER_DOCUMENT_SCOPE,
    ]);
  });
  it('discovers all eight tools in inventory and exposes only the two reads in read-only mode', () => {
    const family = toolNamesInFamilies(['inventory']);
    for (const name of [...listing, ...postOrder]) expect(family.has(`ebay_${name}`)).toBe(true);
    const definitions = mediaEntries
      .filter((entry) =>
        [...listing, ...postOrder].some((name) => entry.definition.name === `ebay_${name}`),
      )
      .map((entry) => entry.definition);
    expect(definitions).toHaveLength(8);
    expect(
      definitions
        .filter(isReadOnlyTool)
        .map((entry) => entry.name)
        .sort(),
    ).toEqual(['ebay_download_post_order_document', 'ebay_get_document']);
  });
});
