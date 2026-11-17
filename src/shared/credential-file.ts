import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve the credential `.env` file from an installed source or build module URL.
 *
 * @param moduleUrl - URL of a module in `src/shared` or `build/shared`.
 * @returns Absolute path to the package-root credential file.
 *
 * @example
 * ```ts
 * resolveCredentialEnvPath(import.meta.url);
 * ```
 */
export const resolveCredentialEnvPath = (moduleUrl: string | URL): string =>
  join(dirname(fileURLToPath(moduleUrl)), '../../.env');

/** Package-root credential file used for both runtime reads and token writes. */
export const CREDENTIAL_ENV_PATH = resolveCredentialEnvPath(import.meta.url);
