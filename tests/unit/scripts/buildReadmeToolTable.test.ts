import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createToolCatalog } from '../../../scripts/buildToolCatalog.js';
import {
  TOOL_FAMILY_DOCUMENTS,
  createReadmeToolTable,
  createToolFamilyBlock,
  replaceToolFamilyBlock,
} from '../../../scripts/buildReadmeToolTable.js';

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = createToolCatalog();

describe('buildReadmeToolTable', () => {
  it('has one row per tool family plus the header', () => {
    const lines = createReadmeToolTable(catalog).split('\n');
    expect(lines).toHaveLength(catalog.familyCount + 2);
  });

  it('replaces only the text between the markers', () => {
    const document = 'top\n<!-- tool-families:start -->\nold\n<!-- tool-families:end -->\nbottom\n';
    expect(replaceToolFamilyBlock(document, 'new')).toBe(
      'top\n<!-- tool-families:start -->\nnew\n<!-- tool-families:end -->\nbottom\n',
    );
  });

  it('fails when the markers are missing', () => {
    expect(() => replaceToolFamilyBlock('no markers', 'new')).toThrow(/markers/);
  });

  it.each(TOOL_FAMILY_DOCUMENTS)('%s block matches the tool catalog', (documentName) => {
    const current = readFileSync(`${repositoryRoot}${documentName}`, 'utf8');
    const expected = replaceToolFamilyBlock(current, createToolFamilyBlock(documentName, catalog));
    expect(current).toBe(expected);
  });
});
