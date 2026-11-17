import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createToolCatalog, type ToolCatalog } from './build-tool-catalog.js';

/** Markers that wrap the generated tool family list in README.md and llms.txt. */
export const TOOL_FAMILIES_START_MARKER = '<!-- tool-families:start -->';
export const TOOL_FAMILIES_END_MARKER = '<!-- tool-families:end -->';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

/** Files that carry a generated tool family block, as paths from the repository root. */
export const TOOL_FAMILY_DOCUMENTS = ['README.md', 'llms.txt'] as const;

/** Markdown table of every tool family: key, title, tool count and one example tool. */
export function createReadmeToolTable(catalog: ToolCatalog): string {
  const rows = catalog.families.map((family) => {
    const exampleTool = family.tools.find((tool) => tool.readOnly) ?? family.tools[0];
    return `| \`${family.key}\` | ${family.title} | ${family.toolCount} | \`${exampleTool?.name ?? ''}\` |`;
  });
  return [
    '| Family (`EBAY_MCP_TOOLS` key) | Title | Tools | Example tool |',
    '| --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

/** Bullet list of every tool family, for llms.txt. */
export function createToolFamilyList(catalog: ToolCatalog): string {
  return catalog.families
    .map((family) => `- \`${family.key}\`: ${family.title}, ${family.toolCount} tools`)
    .join('\n');
}

/** Returns the document with the text between the two markers replaced. */
export function replaceToolFamilyBlock(document: string, block: string): string {
  const start = document.indexOf(TOOL_FAMILIES_START_MARKER);
  const end = document.indexOf(TOOL_FAMILIES_END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing ${TOOL_FAMILIES_START_MARKER} / ${TOOL_FAMILIES_END_MARKER} markers`);
  }
  const before = document.slice(0, start + TOOL_FAMILIES_START_MARKER.length);
  const after = document.slice(end);
  return `${before}\n${block}\n${after}`;
}

/** The generated block that belongs in the given document. */
export function createToolFamilyBlock(documentName: string, catalog: ToolCatalog): string {
  return documentName === 'README.md'
    ? createReadmeToolTable(catalog)
    : createToolFamilyList(catalog);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes('--check');
  const catalog = createToolCatalog();
  let stale = false;
  for (const documentName of TOOL_FAMILY_DOCUMENTS) {
    const documentPath = `${repositoryRoot}${documentName}`;
    const current = readFileSync(documentPath, 'utf8');
    const updated = replaceToolFamilyBlock(current, createToolFamilyBlock(documentName, catalog));
    const isDocumentStale = updated !== current;

    if (isDocumentStale && checkOnly) {
      console.error(`${documentName} tool family block is stale. Run: pnpm readme:tools`);
      stale = true;
    }

    if (isDocumentStale && !checkOnly) {
      writeFileSync(documentPath, updated);
      console.log(`Updated ${documentName}`);
    }
  }

  if (stale) {
    process.exit(1);
  }
}
