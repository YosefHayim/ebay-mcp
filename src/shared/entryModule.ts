import { realpathSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Resolve symlinks so a script launched through a link (an npm global bin, `npm link`)
 * still matches its module URL, which Node reports as the real path. Paths that do not
 * exist on disk fall back to plain resolution.
 */
const toRealPath = (filePath: string): string => {
  try {
    return realpathSync(filePath);
  } catch {
    return path.resolve(filePath);
  }
};

/**
 * Reports whether a module is the script Node was started with, so a file can run
 * its CLI only when executed directly and stay side-effect free when imported.
 *
 * @param moduleUrl - The calling module's `import.meta.url`.
 * @returns True when `process.argv[1]` points at that module, directly or through a symlink.
 *
 * @example
 * ```ts
 * if (isEntryModule(import.meta.url)) {
 *   await main();
 * }
 * ```
 */
export const isEntryModule = (moduleUrl: string): boolean =>
  process.argv[1] !== undefined &&
  toRealPath(process.argv[1]) === toRealPath(fileURLToPath(moduleUrl));
