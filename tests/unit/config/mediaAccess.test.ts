import path from 'node:path';
import { getMediaAccessConfig } from '@/config/mediaAccess.js';
import { describe, expect, it } from 'vitest';

describe('getMediaAccessConfig', () => {
  it('disables local media access when nothing is configured', () => {
    const access = getMediaAccessConfig({});

    expect(access.allowedDirs).toEqual([]);
    expect(access.mediaRoot).toBeUndefined();
    expect(access.errors).toEqual([]);
  });

  it('splits EBAY_MCP_MEDIA_DIRS on the platform path delimiter and trims entries', () => {
    const access = getMediaAccessConfig({
      EBAY_MCP_MEDIA_DIRS: ` /srv/media ${path.delimiter} /var/uploads/ ${path.delimiter}`,
    });

    // Entries are normalized with path.resolve, which is drive-qualified on
    // Windows, so the expectations are derived the same way rather than pinned
    // to POSIX spellings.
    expect(access.allowedDirs).toEqual([path.resolve('/srv/media'), path.resolve('/var/uploads')]);
  });

  it('adds EBAY_MCP_MEDIA_ROOT to the allowed directories once', () => {
    const access = getMediaAccessConfig({
      EBAY_MCP_MEDIA_DIRS: '/srv/media',
      EBAY_MCP_MEDIA_ROOT: '/srv/media',
    });

    expect(access.mediaRoot).toBe(path.resolve('/srv/media'));
    expect(access.allowedDirs).toEqual([path.resolve('/srv/media')]);
  });

  it('rejects relative entries with an error naming the variable', () => {
    const access = getMediaAccessConfig({
      EBAY_MCP_MEDIA_DIRS: 'relative/dir',
      EBAY_MCP_MEDIA_ROOT: './media',
    });

    expect(access.allowedDirs).toEqual([]);
    expect(access.errors).toHaveLength(2);
    expect(access.errors[0]).toContain('EBAY_MCP_MEDIA_DIRS');
    expect(access.errors[1]).toContain('EBAY_MCP_MEDIA_ROOT');
  });
});
