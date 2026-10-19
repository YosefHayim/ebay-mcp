import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getToolDefinitions } from '@/tools/index.js';

/**
 * Advertised-tool-count guard.
 *
 * The tool count is quoted as a bare literal in the README (shields badge plus
 * several prose mentions), llms.txt, and the package.json description. Nothing
 * derived any of them from the registry, so the advertised figure silently drifted to 322 while
 * `getToolDefinitions()` returned 298 — a number users, npm, and AI clients read as
 * fact.
 *
 * These guards pin every one of those literals to the live registry, so adding or
 * removing a tool fails CI until the docs move with it.
 */
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

const advertisedToolCount = getToolDefinitions().length;

/**
 * An endpoint count such as "356 unique endpoints" (from `pnpm sync --report`), which is not a
 * tool count. Only the phrase is skipped, so the same number quoted as tools is still caught.
 */
const ENDPOINT_COUNT_PATTERN = /\d+ (?:unique )?endpoints/g;

/**
 * Range searched for stale counts. Wide enough to catch a drifting tool count,
 * narrow enough to exclude HTTP status codes, percentages, and port numbers.
 */
const COUNT_BAND = { min: 250, max: 400 };

/** Captures the tool count rendered into the README's shields.io badge. */
const BADGE_COUNT_PATTERN = /img\.shields\.io\/badge\/tools-(\d+)-/;

/** Every run of digits in a document. */
const DIGITS_PATTERN = /\d+/g;

/** Prose docs swept in full; package.json is handled separately to skip dependency versions. */
const proseDocs = ['README.md', 'llms.txt'];

const readDoc = (name: string): string => readFileSync(`${repoRoot}${name}`, 'utf8');

/** Collect every in-band number that is neither the live count nor an endpoint count. */
const staleCountsIn = (text: string): number[] => {
  const toolCountText = text.replace(ENDPOINT_COUNT_PATTERN, '');
  const found = [...toolCountText.matchAll(DIGITS_PATTERN)]
    .map((match) => Number(match[0]))
    .filter((count) => count >= COUNT_BAND.min && count <= COUNT_BAND.max)
    .filter((count) => count !== advertisedToolCount);

  return [...new Set(found)];
};

describe('advertised tool count', () => {
  it('skips endpoint counts but still flags the same number quoted as tools', () => {
    expect(staleCountsIn('across 356 unique endpoints (356 endpoints)')).toEqual([]);
    expect(staleCountsIn('356 tools across 356 endpoints')).toEqual([356]);
  });

  it.each(proseDocs)('%s quotes no tool count other than the live registry', (name) => {
    expect(staleCountsIn(readDoc(name))).toEqual([]);
  });

  it('README shields badge shows the live tool count', () => {
    const badge = readDoc('README.md').match(BADGE_COUNT_PATTERN);

    expect(badge?.[1]).toBe(String(advertisedToolCount));
  });

  it('package.json description quotes the live tool count', () => {
    const { description } = JSON.parse(readDoc('package.json')) as { description: string };

    expect(description).toContain(`${advertisedToolCount} tools`);
    expect(staleCountsIn(description)).toEqual([]);
  });
});
