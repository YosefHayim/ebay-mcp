import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import updateNotifier from 'update-notifier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_JSON_PATH = join(__dirname, '../../package.json');

interface PackageJson {
  name: string;
  version: string;
  [key: string]: unknown;
}

let cachedPackageJson: PackageJson | null = null;

function isPackageJson(value: unknown): value is PackageJson {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    typeof Reflect.get(value, 'name') === 'string' &&
    typeof Reflect.get(value, 'version') === 'string'
  );
}

/**
 * Reads and caches package metadata used by version helpers.
 */
export function getPackageJson(): PackageJson {
  if (cachedPackageJson) {
    return cachedPackageJson;
  }

  try {
    const content = readFileSync(PACKAGE_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (isPackageJson(parsed)) {
      cachedPackageJson = parsed;
      return cachedPackageJson;
    }

    cachedPackageJson = { name: 'ebay-mcp', version: '0.0.0' };
    return cachedPackageJson;
  } catch {
    return { name: 'ebay-mcp', version: '0.0.0' };
  }
}

/**
 * Returns the package version from package.json.
 */
export function getVersion(): string {
  return getPackageJson().version;
}

/**
 * Returns the package name from package.json.
 */
export function getPackageName(): string {
  return getPackageJson().name;
}

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
 */
export function checkForUpdates(options: { defer?: boolean } = {}): void {
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
}

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
 */
export function getCachedUpdateNotice(): string | undefined {
  const pkg = getPackageJson();

  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: ONE_DAY_MS,
  });

  const { update } = notifier;
  if (!update || update.latest === pkg.version) {
    return undefined;
  }

  return `Update available ${pkg.version} → ${update.latest} — run \`npm i -g ${pkg.name}\` to update`;
}

/**
 * Fetches update metadata without printing a notification.
 */
export async function getUpdateInfo(): Promise<
  { current: string; latest: string; name: string } | undefined
> {
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

  return undefined;
}
