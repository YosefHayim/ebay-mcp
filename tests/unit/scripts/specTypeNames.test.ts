import { describe, expect, it } from 'vitest';
import { generatedNamespaceNames, renameGeneratedNamespaces } from '@/scripts/specTypeNames.js';

const generatedTypes = `export interface paths {
  '/signing_key': {
    /** @description See the components page for operations limits. */
    get: operations['getSigningKeys'];
  };
}
export interface components {
  schemas: {
    QuerySigningKeysResponse: { signingKeys?: components['schemas']['SigningKey'][] };
  };
}
export interface operations {
  getSigningKeys: { responses: { 200: components['schemas']['QuerySigningKeysResponse'] } };
}
`;

describe('renameGeneratedNamespaces', () => {
  it('renames namespace declarations and references but not description text', () => {
    const renamedTypes = renameGeneratedNamespaces(
      generatedTypes,
      generatedNamespaceNames.developerKeyManagementV1Oas3,
    );

    expect(renamedTypes).toContain('export interface DeveloperKeyManagementComponents {');
    expect(renamedTypes).toContain('export interface DeveloperKeyManagementOperations {');
    expect(renamedTypes).toContain("get: DeveloperKeyManagementOperations['getSigningKeys'];");
    expect(renamedTypes).toContain(
      "signingKeys?: DeveloperKeyManagementComponents['schemas']['SigningKey'][]",
    );
    expect(renamedTypes).toContain('See the components page for operations limits.');
    expect(renamedTypes).not.toContain("components['");
    expect(renamedTypes).not.toContain('interface operations');
  });
});
