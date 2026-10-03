import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Reports whether a module is the script Node was started with, so a file can run
 * its CLI only when executed directly and stay side-effect free when imported.
 *
 * @param moduleUrl - The calling module's `import.meta.url`.
 * @returns True when `process.argv[1]` points at that module.
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
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(moduleUrl));
