import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

/**
 * Load existing key/value config from the project .env file.
 *
 * Uses `dotenv.parse` (not a hand-rolled splitter) so quoted values are
 * unwrapped and `#`-bearing tokens survive — eBay refresh tokens look like
 * `v^1.1#i^1#...`, and a naive parser either keeps stray quotes or trips over
 * the `#`. Placeholder values (e.g. `your-client-id_here`) are skipped so the
 * wizard treats them as unset.
 */
export function loadExistingConfig(projectRoot: string): Record<string, string> {
  const envPath = join(projectRoot, '.env');
  if (!existsSync(envPath)) {
    return {};
  }

  const parsed = dotenv.parse(readFileSync(envPath, 'utf-8'));
  const envConfig: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (value && !value.includes('_here')) {
      envConfig[key] = value;
    }
  }

  return envConfig;
}

/**
 * Quote a value for safe inclusion in a `.env` line.
 *
 * eBay OAuth tokens look like `v^1.1#i^1#...`; dotenv treats an unquoted `#` as
 * the start of an inline comment, so an unquoted token is truncated to `v^1.1`
 * on the next read — silently breaking authentication. Wrap any value
 * containing `#`, whitespace, or quote characters in double quotes (escaping
 * embedded backslashes and double quotes) so dotenv restores it verbatim. This
 * mirrors the quoting `dotenv-stringify` already applies in the runtime
 * credential store, keeping both `.env` writers consistent.
 */
export function quoteEnvValue(value: string): string {
  if (value === '' || !/[#\s"'`]/.test(value)) {
    return value;
  }
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Parse environment with safe sandbox default.
 */
export function readEnvironment(value?: string): 'sandbox' | 'production' {
  return value === 'production' ? 'production' : 'sandbox';
}
