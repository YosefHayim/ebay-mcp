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
 *
 * @param projectRoot - Project root containing the `.env` file.
 * @returns Parsed config values with placeholders removed.
 *
 * @example
 * ```ts
 * const config = loadExistingConfig(process.cwd());
 * ```
 */
export const loadExistingConfig = (projectRoot: string): Record<string, string> => {
  const envPath = join(projectRoot, '.env');
  if (!existsSync(envPath)) {
    return {};
  }

  const parsed = dotenv.parse(readFileSync(envPath, 'utf-8'));
  const envConfig: Record<string, string> = {};
  for (const [key, envValue] of Object.entries(parsed)) {
    if (envValue && !envValue.includes('_here')) {
      envConfig[key] = envValue;
    }
  }

  return envConfig;
};

/**
 * Parse environment with safe sandbox default.
 *
 * @param environmentName - Optional environment value from config or user input.
 * @returns `production` only for an exact production value; otherwise `sandbox`.
 *
 * @example
 * ```ts
 * const environment = readEnvironment(config.EBAY_ENVIRONMENT);
 * ```
 */
export const readEnvironment = (environmentName?: string): 'sandbox' | 'production' =>
  environmentName === 'production' ? 'production' : 'sandbox';
