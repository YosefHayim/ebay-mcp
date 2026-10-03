/**
 * Unit tests for `loadExistingConfig` in `setupShared`: values written with
 * `quoteEnvValue` (e.g. eBay OAuth tokens containing `#`) must read back
 * without the surrounding quotes.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadExistingConfig } from '@/scripts/setupShared.js';
import { quoteEnvValue } from '@/utils/envFile.js';

const SAMPLE_REFRESH_TOKEN = 'v^1.1#i^1#I^3#r^1#p^3#f^0#t^Ul41Xz==';

describe('loadExistingConfig', () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('reads a quoted #-token back without the surrounding quotes', () => {
    dir = mkdtempSync(join(tmpdir(), 'ebay-env-'));
    writeFileSync(
      join(dir, '.env'),
      [
        `EBAY_USER_REFRESH_TOKEN=${quoteEnvValue(SAMPLE_REFRESH_TOKEN)}`,
        'EBAY_ENVIRONMENT=sandbox',
        'EBAY_CLIENT_ID=your-client-id_here',
      ].join('\n'),
    );

    const config = loadExistingConfig(dir);

    expect(config.EBAY_USER_REFRESH_TOKEN).toBe(SAMPLE_REFRESH_TOKEN);
    expect(config.EBAY_ENVIRONMENT).toBe('sandbox');
    expect(config.EBAY_CLIENT_ID).toBeUndefined();
  });

  it('returns an empty object when no .env exists', () => {
    dir = mkdtempSync(join(tmpdir(), 'ebay-env-'));
    expect(loadExistingConfig(dir)).toEqual({});
  });
});
