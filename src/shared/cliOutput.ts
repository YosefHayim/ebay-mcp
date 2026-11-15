import process from 'node:process';

/**
 * Writes one line to stdout for interactive CLI-only flows.
 *
 * @param message - Text to write before the trailing newline.
 * @returns Nothing; writes to stdout.
 *
 * @example
 * ```ts
 * writeCliLine('Setup complete');
 * ```
 */
export const writeCliLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};
