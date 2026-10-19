import { describe, expect, it } from 'vitest';
import { generatedNamespaceNames, renameGeneratedNamespaces } from '@/scripts/specTypeNames.js';

const generatedTypes = `export interface paths {
  '/compliance': {
    /** @description See the components page for operations limits. */
    get: operations['getListingViolations'];
  };
}
export interface components {
  schemas: {
    Summary: { violations?: components['schemas']['Violation'][] };
  };
}
export interface operations {
  getListingViolations: { responses: { 200: components['schemas']['Summary'] } };
}
`;

describe('renameGeneratedNamespaces', () => {
  it('renames namespace declarations and references but not description text', () => {
    const renamedTypes = renameGeneratedNamespaces(
      generatedTypes,
      generatedNamespaceNames.sellComplianceV1Oas3,
    );

    expect(renamedTypes).toContain('export interface SellComplianceComponents {');
    expect(renamedTypes).toContain('export interface SellComplianceOperations {');
    expect(renamedTypes).toContain("get: SellComplianceOperations['getListingViolations'];");
    expect(renamedTypes).toContain(
      "violations?: SellComplianceComponents['schemas']['Violation'][]",
    );
    expect(renamedTypes).toContain('See the components page for operations limits.');
    expect(renamedTypes).not.toContain("components['");
    expect(renamedTypes).not.toContain('interface operations');
  });
});
