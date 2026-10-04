import { apiLogger, createLogger, logRequest, logResponse } from '@/utils/logger.js';
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

  it('redacts secret fields before truncating a large body to text', () => {
    const http = vi.spyOn(apiLogger, 'http').mockImplementation(() => {});

    logResponse(200, 'OK', { access_token: 'tok-123', text: 'x'.repeat(2000) });

    const logged = String(http.mock.calls[0]?.[1]?.data);
    expect(logged).toContain('"access_token":"[REDACTED]"');
    expect(logged).not.toContain('tok-123');
  });
});

describe('component logger', () => {
  it('redacts secrets before they reach the log output', () => {
    const { _stderr: stderr } = console as unknown as { _stderr: NodeJS.WriteStream };
    const write = vi.spyOn(stderr, 'write').mockImplementation(() => true);

    const credentials = 'client:s3cret';

    createLogger('Test').error(`Auth Server: https://${credentials}@auth.example.test/realms/mcp`, {
      clientSecret: 'hunter2',
      scopes: ['mcp:tools'],
    });

    const output = write.mock.calls.map(([chunk]) => String(chunk)).join('');
    expect(output).toContain('[Test] Auth Server: https://[REDACTED]@auth.example.test/realms/mcp');
    expect(output).toContain('mcp:tools');
    expect(output).not.toContain('s3cret');
    expect(output).not.toContain('hunter2');
  });
});
