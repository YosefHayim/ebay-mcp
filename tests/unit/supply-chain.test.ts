import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Supply-chain hygiene guards.
 *
 * The project standardized on pnpm (`packageManager` in package.json) and every CI
 * workflow installs with `pnpm install --frozen-lockfile`. A stale, committed
 * `package-lock.json` used to shadow the pnpm tree and roughly doubled the Dependabot
 * alert surface — each advisory was counted once per ecosystem, and the npm lockfile
 * even pinned phantom dependencies (e.g. a root `axios`) that were not in package.json
 * at all. Removing it left pnpm-lock.yaml as the single source of truth.
 *
 * These guards fail loudly if a second lockfile or a non-pnpm package manager is
 * reintroduced, so that single-source-of-truth invariant cannot silently regress.
 */
const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Minimal view of package.json — only the fields these guards assert on. */
interface PackageManifest {
  packageManager?: string;
  pnpm?: { overrides?: Record<string, string> };
}

const manifest = JSON.parse(readFileSync(`${repoRoot}package.json`, 'utf8')) as PackageManifest;

describe('supply-chain hygiene', () => {
  it('declares pnpm as the single package manager', () => {
    expect(manifest.packageManager).toMatch(/^pnpm@/);
  });

  it('commits exactly one lockfile — pnpm-lock.yaml, never package-lock.json or yarn.lock', () => {
    expect(existsSync(`${repoRoot}pnpm-lock.yaml`)).toBe(true);
    expect(existsSync(`${repoRoot}package-lock.json`)).toBe(false);
    expect(existsSync(`${repoRoot}yarn.lock`)).toBe(false);
  });

  it('pins the security overrides that force patched transitives', () => {
    // esbuild >=0.28.1 and yaml >=2.8.3 sit below vite's declared ranges, and js-yaml
    // >=4.2.0 patches GHSA-h67p-54hq-rp68 (quadratic-complexity DoS) pulled in by
    // @redocly/openapi-core via openapi-typescript. Without these overrides the
    // dev-tooling chain resolves back to vulnerable versions.
    expect(manifest.pnpm?.overrides).toMatchObject({
      esbuild: expect.stringContaining('0.28.1'),
      yaml: expect.stringContaining('2.8.3'),
      'js-yaml': expect.stringContaining('4.2.0'),
    });
  });
});
