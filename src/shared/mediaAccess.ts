import path from 'node:path';
import process from 'node:process';

/** Environment variable holding the path-delimited list of directories media tools may read. */
export const MEDIA_DIRS_ENV = 'EBAY_MCP_MEDIA_DIRS';

/** Environment variable holding the single root that `media://` references resolve under. */
export const MEDIA_ROOT_ENV = 'EBAY_MCP_MEDIA_ROOT';

/** Parsed local-media allowlist. */
export interface MediaAccessConfig {
  /** Absolute directories the media tools may read from (the root is included when set). */
  readonly allowedDirs: readonly string[];
  /** Absolute directory that `media://<relative>` references resolve under. */
  readonly mediaRoot?: string;
  /** Configuration problems, reported by startup validation and by the tools themselves. */
  readonly errors: readonly string[];
}

const parseAbsoluteDir = (raw: string, variable: string, errors: string[]): string | undefined => {
  if (!path.isAbsolute(raw)) {
    errors.push(`${variable} entries must be absolute paths; got "${raw}".`);
    return;
  }
  return path.resolve(raw);
};

/**
 * Reads the local-media allowlist from the environment.
 *
 * Local file access is off unless the operator names the directories the server
 * may read: `EBAY_MCP_MEDIA_DIRS` (a `path.delimiter`-separated list) and/or
 * `EBAY_MCP_MEDIA_ROOT` (one directory that also anchors `media://` references).
 *
 * @param env - Environment to read; defaults to `process.env`.
 * @returns The allowed directories, the optional media root, and any configuration errors.
 *
 * @example
 * ```ts
 * const access = getMediaAccessConfig();
 * if (access.allowedDirs.length === 0) {
 *   // media tools stay disabled
 * }
 * ```
 */
export const getMediaAccessConfig = (env: NodeJS.ProcessEnv = process.env): MediaAccessConfig => {
  const errors: string[] = [];
  const allowedDirs: string[] = [];

  const rawDirs = (env[MEDIA_DIRS_ENV] ?? '')
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  for (const raw of rawDirs) {
    const dir = parseAbsoluteDir(raw, MEDIA_DIRS_ENV, errors);
    if (dir && !allowedDirs.includes(dir)) {
      allowedDirs.push(dir);
    }
  }

  const rawRoot = (env[MEDIA_ROOT_ENV] ?? '').trim();
  const mediaRoot = rawRoot ? parseAbsoluteDir(rawRoot, MEDIA_ROOT_ENV, errors) : undefined;
  if (mediaRoot && !allowedDirs.includes(mediaRoot)) {
    allowedDirs.push(mediaRoot);
  }

  return { allowedDirs, mediaRoot, errors };
};
