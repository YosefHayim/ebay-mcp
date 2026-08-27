import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getToolDefinitions } from '@/tools/index.js';

/**
 * Advertised-tool-count guard.
 *
 * The tool count is quoted as a bare literal in the English README (shields badge
 * plus seven prose mentions), all eight locale READMEs, llms.txt, AGENTS.md,
 * CONTEXT.md, PROJECT.md, and the package.json description. Nothing derived any of
 * them from the registry, so the advertised figure silently drifted to 322 while
 * `getToolDefinitions()` returned 298 — a number users, npm, and AI clients read as
 * fact.
 *
 * These guards pin every one of those literals to the live registry, so adding or
 * removing a tool fails CI until the docs move with it.
 */
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

const advertisedToolCount = getToolDefinitions().length;

/**
 * Numbers inside {@link COUNT_BAND} that legitimately are not the tool count.
 * Anything else in the band is treated as a stale tool-count claim.
 */
const NON_COUNT_NUMBERS = new Set([
  274, // unique eBay Sell API endpoints covered
  300, // Biome per-file line-count warning threshold, cited in AGENTS.md
]);

/**
 * Range searched for stale counts. Wide enough to catch a drifting tool count in any
 * language, narrow enough to exclude HTTP status codes, percentages, and port numbers.
 */
const COUNT_BAND = { min: 250, max: 400 };

/** Matches `README.md` and every `README.<locale>.md` sibling. */
const README_PATTERN = /^README(\.[\w-]+)?\.md$/;

/** Captures the tool count rendered into each README's shields.io badge. */
const BADGE_COUNT_PATTERN = /img\.shields\.io\/badge\/tools-(\d+)-/;

/** Every run of digits, so the sweep is language-independent across locale READMEs. */
const DIGITS_PATTERN = /\d+/g;

const localeReadmes = readdirSync(repoRoot).filter((name) => README_PATTERN.test(name));

/** Prose docs swept in full; package.json is handled separately to skip dependency versions. */
const proseDocs = [...localeReadmes, 'llms.txt', 'AGENTS.md', 'CONTEXT.md', 'PROJECT.md'];

const readDoc = (name: string): string => readFileSync(`${repoRoot}${name}`, 'utf8');

/** Collect every in-band number that is neither the live count nor a known non-count. */
const staleCountsIn = (text: string): number[] => {
  const found = [...text.matchAll(DIGITS_PATTERN)]
    .map((match) => Number(match[0]))
    .filter((value) => value >= COUNT_BAND.min && value <= COUNT_BAND.max)
    .filter((value) => value !== advertisedToolCount && !NON_COUNT_NUMBERS.has(value));

  return [...new Set(found)];
};

describe('advertised tool count', () => {
  it('sweeps every localized README so the guard cannot pass vacuously', () => {
    expect(localeReadmes).toContain('README.md');
    expect(localeReadmes).toContain('README.zh-CN.md');
    expect(localeReadmes).toContain('README.pt-BR.md');
    expect(localeReadmes.length).toBe(9);
  });

  it.each(proseDocs)('%s quotes no tool count other than the live registry', (name) => {
    expect(staleCountsIn(readDoc(name))).toEqual([]);
  });

  it.each(localeReadmes)('%s shields badge shows the live tool count', (name) => {
    const badge = readDoc(name).match(BADGE_COUNT_PATTERN);

    expect(badge?.[1]).toBe(String(advertisedToolCount));
  });

  it('package.json description quotes the live tool count', () => {
    const { description } = JSON.parse(readDoc('package.json')) as { description: string };

    expect(description).toContain(`${advertisedToolCount} tools`);
    expect(staleCountsIn(description)).toEqual([]);
  });
});
