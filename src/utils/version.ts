import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import updateNotifier from 'update-notifier';
import { Effect, Either } from 'effect';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_JSON_PATH = join(__dirname, '../../package.json');

interface PackageJson {
  name: string;
  version: string;
  [key: string]: unknown;
}

let cachedPackageJson: PackageJson | null = null;

const isPackageJson = (value: unknown): value is PackageJson => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    typeof Reflect.get(value, 'name') === 'string' &&
    typeof Reflect.get(value, 'version') === 'string'
  );
};

/**
 * Reads and caches package metadata used by version helpers.
 *
 * @returns Parsed package metadata, or a fallback package identity.
 *
 * @example
 * ```ts
 * const pkg = getPackageJson();
 * ```
 */
export const getPackageJson = (): PackageJson => {
  if (cachedPackageJson) {
    return cachedPackageJson;
  }

  const loaded = Effect.runSync(
    Effect.either(
      Effect.try({
        try: () => JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8')) as unknown,
        catch: (error) => error,
      }),
    ),
  );

  if (Either.isRight(loaded) && isPackageJson(loaded.right)) {
    cachedPackageJson = loaded.right;
    return cachedPackageJson;
  }

  cachedPackageJson = { name: 'ebay-mcp', version: '0.0.0' };
  return cachedPackageJson;
};

/**
 * Returns the package version from package.json.
 *
 * @returns Current package version.
 *
 * @example
 * ```ts
 * const version = getVersion();
 * ```
 */
export const getVersion = (): string => getPackageJson().version;

/**
 * Returns the package name from package.json.
 *
 * @returns Current package name.
 *
 * @example
 * ```ts
 * const name = getPackageName();
 * ```
 */
export const getPackageName = (): string => getPackageJson().name;

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Surface a "newer version available" box in an interactive terminal — the
 * setup wizard and `diagnose`.
 *
 * `shouldNotifyInNpmScript: true` is essential: these CLIs are launched via
 * `npm run setup` / `npx`, and without this flag update-notifier suppresses the
 * notice whenever it detects an npm/yarn user agent (the common case). The
 * notice is still a no-op when stdout is not a TTY (e.g. the MCP server's piped
 * stdio); that path uses {@link getCachedUpdateNotice} instead. Dropping the
 * old custom `message` lets update-notifier render its default colorized
 * template (dim current → green latest, cyan command).
 *
 * @param options - Update-notifier options used by CLI/server callers.
 * @returns Nothing; delegates display to update-notifier.
 *
 * @example
 * ```ts
 * checkForUpdates({ defer: true });
 * ```
 */
export const checkForUpdates = (options: { defer?: boolean } = {}): void => {
  const pkg = getPackageJson();

  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: ONE_DAY_MS,
    shouldNotifyInNpmScript: true,
  });

  notifier.notify({
    isGlobal: true,
    defer: options.defer ?? false,
  });
};

/**
 * Build a one-line "update available" notice from update-notifier's cached
 * daily check, for contexts with no TTY where {@link checkForUpdates} stays
 * silent — chiefly the MCP server, whose stdout is reserved for the protocol so
 * the notice must go to a stderr log line instead of a box.
 *
 * Constructing the notifier triggers the once-a-day background check and reads
 * its cached result, so this never blocks startup or hits the network on the
 * hot path. Returns `undefined` when already current, or before the first
 * background check has populated the cache (so the notice appears from the
 * second run onward — update-notifier's normal behavior).
 *
 * @returns One-line update notice for stderr logging, or undefined when absent.
 *
 * @example
 * ```ts
 * const notice = getCachedUpdateNotice();
 * ```
 */
export const getCachedUpdateNotice = (): string | undefined => {
  const pkg = getPackageJson();

  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: ONE_DAY_MS,
  });

  const { update } = notifier;
  if (!update || update.latest === pkg.version) {
    return;
  }

  return `Update available ${pkg.version} → ${update.latest} — run \`npm i -g ${pkg.name}\` to update`;
};

/**
 * Fetches update metadata without printing a notification.
 *
 * @returns Update metadata when a newer version exists, otherwise undefined.
 *
 * @example
 * ```ts
 * const updateInfo = await getUpdateInfo();
 * ```
 */
export const getUpdateInfo = async (): Promise<
  { current: string; latest: string; name: string } | undefined
> => {
  const pkg = getPackageJson();

  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 0,
  });

  await notifier.fetchInfo();

  if (notifier.update && notifier.update.latest !== pkg.version) {
    return {
      current: pkg.version,
      latest: notifier.update.latest,
      name: pkg.name,
    };
  }
};
