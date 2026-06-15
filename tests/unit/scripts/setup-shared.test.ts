/**
 * Unit tests for the `.env` (de)serialization helpers in `setup-shared`.
 *
 * The regression these guard against: eBay OAuth tokens look like
 * `v^1.1#i^1#...`, and dotenv treats an unquoted `#` as the start of an inline
 * comment. An unquoted token is therefore truncated to `v^1.1` on the next
 * read, silently breaking authentication (`invalid_grant — the provided
 * authorization refresh token is invalid or was issued to another client`).
 * `quoteEnvValue` must wrap such values so `dotenv.parse` restores them whole,
 * and `loadExistingConfig` must read those quoted values back without the
 * stray quotes.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import dotenv from 'dotenv';
import { loadExistingConfig, quoteEnvValue } from '@/scripts/setup-shared.js';

const SAMPLE_REFRESH_TOKEN = 'v^1.1#i^1#I^3#r^1#p^3#f^0#t^Ul41Xz==';

describe('quoteEnvValue', () => {
  it('quotes a token containing # so dotenv does not treat it as a comment', () => {
    const line = `EBAY_USER_REFRESH_TOKEN=${quoteEnvValue(SAMPLE_REFRESH_TOKEN)}`;
    const parsed = dotenv.parse(line);

    expect(parsed.EBAY_USER_REFRESH_TOKEN).toBe(SAMPLE_REFRESH_TOKEN);
  });

  it('truncates at # when NOT quoted (documents the bug being prevented)', () => {
    const parsed = dotenv.parse(`EBAY_USER_REFRESH_TOKEN=${SAMPLE_REFRESH_TOKEN}`);

    expect(parsed.EBAY_USER_REFRESH_TOKEN).toBe('v^1.1');
  });

  it('leaves plain values unquoted', () => {
    expect(quoteEnvValue('sandbox')).toBe('sandbox');
    expect(quoteEnvValue('EBAY_US')).toBe('EBAY_US');
    expect(quoteEnvValue('')).toBe('');
  });

  it('quotes whitespace values and escapes quotes like dotenv-stringify', () => {
    expect(quoteEnvValue('a b')).toBe('"a b"');
    // Matches the runtime store's dotenv-stringify output exactly.
    expect(quoteEnvValue('a"b')).toBe('"a\\"b"');
  });
});

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
      ].join('\n')
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
