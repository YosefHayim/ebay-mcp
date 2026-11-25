import { existsSync, readFileSync } from 'fs';

/**
 * Parse a dotenv-style KEY=VALUE file into a simple map.
 *
 * @param filePath - Path to the dotenv-style file.
 * @returns Parsed environment map, or an empty object when the file is absent.
 *
 * @example
 * ```ts
 * const env = parseEnvFile('.env');
 * ```
 */
export const parseEnvFile = (filePath: string): Record<string, string> => {
  const env: Record<string, string> = {};

  if (!existsSync(filePath)) {
    return env;
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = /^([^=]+)=(.*)$/.exec(trimmed);
    if (!match) {
      continue;
    }

    const key = match[1].trim();
    let envValue = match[2].trim();

    if (
      (envValue.startsWith('"') && envValue.endsWith('"')) ||
      (envValue.startsWith("'") && envValue.endsWith("'"))
    ) {
      envValue = envValue.slice(1, -1);
    }

    env[key] = envValue;
  }

  return env;
};
