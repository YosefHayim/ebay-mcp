/**
 * Unit tests for `isEntryModule`, which decides whether a script runs its CLI.
 *
 * The regression guarded here: Node keeps `process.argv[1]` as the symlink path
 * but reports `import.meta.url` as the real path, so a plain path comparison
 * silently skipped the CLI when it was launched through a symlinked bin.
 */

import { mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { isEntryModule } from '@/utils/entryModule.js';

const fixtureDir = path.join(process.cwd(), '.cache', 'entry-module-test');
const scriptPath = path.join(fixtureDir, 'cli.js');
const linkPath = path.join(fixtureDir, 'cli-link.js');
const scriptUrl = pathToFileURL(scriptPath).href;
const originalArgv = [...process.argv];

describe('isEntryModule', () => {
  beforeAll(() => {
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(scriptPath, '');
    rmSync(linkPath, { force: true });
    if (process.platform !== 'win32') {
      symlinkSync(scriptPath, linkPath);
    }
  });

  afterEach(() => {
    process.argv = [...originalArgv];
  });

  afterAll(() => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('is true when Node was started with the module file', () => {
    process.argv = [process.argv0, scriptPath];

    expect(isEntryModule(scriptUrl)).toBe(true);
  });

  it.skipIf(process.platform === 'win32')(
    'is true when Node was started through a symlink to the module file',
    () => {
      process.argv = [process.argv0, linkPath];

      expect(isEntryModule(scriptUrl)).toBe(true);
    },
  );

  it('is false when another file is the entry script', () => {
    process.argv = [process.argv0, path.join(fixtureDir, 'other.js')];

    expect(isEntryModule(scriptUrl)).toBe(false);
  });

  it('is false when there is no entry script', () => {
    process.argv = [process.argv0];

    expect(isEntryModule(scriptUrl)).toBe(false);
  });
});
