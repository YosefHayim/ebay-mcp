import { apiLogger, logRequest, logResponse } from '@/utils/logger.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HTTP logging', () => {
  it('logs binary request and response bodies by size only', () => {
    const http = vi.spyOn(apiLogger, 'http').mockImplementation(() => {});
    const file = Buffer.alloc(2048, 0x41);

    logRequest('PUT', 'https://api.ebay.com/x', undefined, file);
    logResponse(200, 'OK', file);

    expect(http.mock.calls).toEqual([
      ['Request: PUT https://api.ebay.com/x', { params: undefined, body: '[binary 2048 bytes]' }],
      ['Response: 200 OK', { data: '[binary 2048 bytes]' }],
    ]);
  });

  it('keeps small JSON bodies as they are and truncates large ones', () => {
    const http = vi.spyOn(apiLogger, 'http').mockImplementation(() => {});
    const small = { ok: true };

    logResponse(200, 'OK', small);
    logResponse(200, 'OK', { text: 'x'.repeat(2000) });

    expect(http.mock.calls[0]?.[1]).toEqual({ data: small });
    expect(http.mock.calls[1]?.[1]).toEqual({
      data: expect.stringMatching(/\.\.\. \[truncated\]$/),
    });
  });
});
