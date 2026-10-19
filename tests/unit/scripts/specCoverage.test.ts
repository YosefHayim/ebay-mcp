import { describe, expect, it } from 'vitest';
import {
  classifyOperation,
  collectImplementedNames,
  normalizeForMatching,
} from '@/scripts/specCoverage.js';

describe('classifyOperation', () => {
  it('reports exact when an API method carries the operationId unchanged', () => {
    const implemented = collectImplementedNames(['getInventoryItem'], []);
    expect(classifyOperation('getInventoryItem', implemented)).toBe('exact');
  });

  it('reports fuzzy when the method name differs only in case', () => {
    const implemented = collectImplementedNames(['getKyc'], []);
    expect(classifyOperation('getKYC', implemented)).toBe('fuzzy');
  });

  it('reports fuzzy for singular/plural differences', () => {
    const implemented = collectImplementedNames(['getRateTable'], []);
    expect(classifyOperation('getRateTables', implemented)).toBe('fuzzy');
  });

  it('reports fuzzy for ByX and ForX suffix differences', () => {
    const implemented = collectImplementedNames(['getOffer', 'getReportMetadata'], []);
    expect(classifyOperation('getOfferBySku', implemented)).toBe('fuzzy');
    expect(classifyOperation('getReportMetadataForType', implemented)).toBe('fuzzy');
  });

  it('reports fuzzy when only a tool name matches', () => {
    const implemented = collectImplementedNames([], ['ebay_get_offer']);
    expect(classifyOperation('getOffer', implemented)).toBe('fuzzy');
  });

  it('reports fuzzy for known operation mappings', () => {
    const implemented = collectImplementedNames([], ['ebay_get_awaiting_feedback']);
    expect(classifyOperation('getItemsAwaitingFeedback', implemented)).toBe('fuzzy');
  });

  it('reports missing when nothing matches', () => {
    const implemented = collectImplementedNames(['getOffer'], ['ebay_get_offer']);
    expect(classifyOperation('deleteSalesTax', implemented)).toBe('missing');
  });
});

describe('normalizeForMatching', () => {
  it('compares camelCase methods and snake_case tools by letters and digits only', () => {
    expect(normalizeForMatching('ebay_get_offer')).toBe('ebaygetoffer');
    expect(normalizeForMatching('getOffer')).toBe('getoffer');
  });
});
