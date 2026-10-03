/**
 * Unit tests for the `.env` serialization helpers in `envFile`.
 *
 * The regression these guard against: eBay OAuth tokens look like
 * `v^1.1#i^1#...`, and dotenv treats an unquoted `#` as the start of an inline
 * comment. An unquoted token is therefore truncated to `v^1.1` on the next
 * read, silently breaking authentication (`invalid_grant — the provided
 * authorization refresh token is invalid or was issued to another client`).
 */

import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { quoteEnvValue, stringifyEnv } from '@/utils/envFile.js';

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

  it('quotes whitespace values and escapes embedded double quotes', () => {
    expect(quoteEnvValue('a b')).toBe('"a b"');
    expect(quoteEnvValue('a"b')).toBe('"a\\"b"');
  });
});

describe('stringifyEnv', () => {
  it('writes one KEY=value line per entry that dotenv reads back verbatim', () => {
    const env = {
      EBAY_ENVIRONMENT: 'sandbox',
      EBAY_USER_REFRESH_TOKEN: SAMPLE_REFRESH_TOKEN,
      EBAY_REDIRECT_URI: 'Your App Name-YourApp-SBX-abc',
    };

    const content = stringifyEnv(env);

    expect(content.split('\n')).toHaveLength(3);
    expect(dotenv.parse(content)).toEqual(env);
  });

  it('returns an empty string for an empty env', () => {
    expect(stringifyEnv({})).toBe('');
  });
});
