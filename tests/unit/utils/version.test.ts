/**
 * Unit tests for the version / update-notifier helpers.
 *
 * The behavior under test is the wiring that makes "a new version is available"
 * actually reach users: `checkForUpdates` must opt into npm-script contexts
 * (our CLIs run via `npm run setup` / `npx`, which update-notifier otherwise
 * silences), `getCachedUpdateNotice` must turn the cached check into a plain
 * stderr-safe line for the MCP server (no TTY box there), and `getUpdateInfo`
 * must report a newer version only when one exists. update-notifier is mocked
 * so no real registry request or background process is spawned.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
const fetchInfo = vi.fn();

/** Mutable state the mocked notifier exposes; reset before each test. */
let mockUpdate: { latest: string; current?: string } | undefined;
let lastConstructorOptions: { shouldNotifyInNpmScript?: boolean; updateCheckInterval?: number };

vi.mock('update-notifier', () => ({
  default: (options: { shouldNotifyInNpmScript?: boolean; updateCheckInterval?: number }) => {
    lastConstructorOptions = options;
    return { notify, fetchInfo, update: mockUpdate };
  },
}));

import {
  checkForUpdates,
  getCachedUpdateNotice,
  getUpdateInfo,
  getVersion,
} from '@/utils/version.js';

const CURRENT = getVersion();

beforeEach(() => {
  mockUpdate = undefined;
  lastConstructorOptions = {};
  notify.mockClear();
  fetchInfo.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('checkForUpdates', () => {
  it('opts into npm-script contexts so `npm run setup` is not silenced', () => {
    checkForUpdates();

    expect(lastConstructorOptions.shouldNotifyInNpmScript).toBe(true);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ isGlobal: true, defer: false }));
  });

  it('forwards the defer flag for the long-lived server context', () => {
    checkForUpdates({ defer: true });

    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ defer: true }));
  });
});

describe('getCachedUpdateNotice', () => {
  it('returns a one-line notice when a newer version is cached', () => {
    mockUpdate = { latest: '99.0.0' };

    const notice = getCachedUpdateNotice();

    expect(notice).toBe(`Update available ${CURRENT} → 99.0.0 — run \`npm i -g ebay-mcp\` to update`);
  });

  it('returns undefined before the cache is populated (first run)', () => {
    mockUpdate = undefined;

    expect(getCachedUpdateNotice()).toBeUndefined();
  });

  it('returns undefined when already on the latest version', () => {
    mockUpdate = { latest: CURRENT };

    expect(getCachedUpdateNotice()).toBeUndefined();
  });
});

describe('getUpdateInfo', () => {
  it('reports current/latest/name when a newer version exists', async () => {
    mockUpdate = { latest: '99.0.0' };

    const info = await getUpdateInfo();

    expect(fetchInfo).toHaveBeenCalled();
    expect(info).toEqual({ current: CURRENT, latest: '99.0.0', name: 'ebay-mcp' });
  });

  it('returns undefined when the latest version equals the current one', async () => {
    mockUpdate = { latest: CURRENT };

    expect(await getUpdateInfo()).toBeUndefined();
  });
});
