import { describe, expect, it } from 'vitest';
import { specFileName, specSources } from '@/scripts/specSources.js';

describe('specFileName', () => {
  it('uses the URL basename when no file name is set', () => {
    const source = {
      api: 'Feed API',
      folder: 'sell-apps/listing-management',
      url: 'https://developer.ebay.com/api-docs/master/sell/feed/openapi/3/sell_feed_v1_oas3.json',
    };
    expect(specFileName(source)).toBe('sell_feed_v1_oas3.json');
  });

  it('keeps the Account v2 cache name while downloading from the API portal', () => {
    const accountV2 = specSources.find(({ api }) => api === 'Account API (v2)');
    expect(accountV2?.url).toBe('https://developer.ebay.com/develop/api/spec/account_api_v2.json');
    expect(accountV2 && specFileName(accountV2)).toBe('sell_account_v2_oas3.json');
  });

  it('gives every spec a unique cache path', () => {
    const cachePaths = specSources.map((source) => `${source.folder}/${specFileName(source)}`);
    expect(new Set(cachePaths).size).toBe(specSources.length);
  });
});
