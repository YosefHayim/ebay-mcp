import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { httpRequest, isHttpError } from '@/utils/http.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * A real loopback server is used instead of a fetch mock because the behaviour
 * under test is the response *stream* stalling after the headers have already
 * arrived — something only a live socket reproduces.
 */
let server: Server;
let baseUrl: string;
const openSockets: NodeJS.WritableStream[] = [];

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === '/stalled-body') {
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': '64' });
      response.write('{"inventoryItems":');
      // Headers and a first chunk land, then the stream stops forever.
      openSockets.push(response);
      return;
    }

    if (request.url === '/stalled-headers') {
      openSockets.push(response);
      return;
    }

    response.writeHead(200, { 'content-type': 'application/json' });
    response.end('{"ok":true}');
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  for (const socket of openSockets) {
    socket.end();
  }
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('httpRequest timeouts', () => {
  it('returns the decoded body when the response completes', async () => {
    const response = await httpRequest<{ ok: boolean }>({ url: `${baseUrl}/ok`, timeoutMs: 5000 });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ok: true });
  });

  it('fails a request whose response body never finishes arriving', async () => {
    const error = await httpRequest({ url: `${baseUrl}/stalled-body`, timeoutMs: 150 }).catch(
      (cause: unknown) => cause,
    );

    expect(isHttpError(error)).toBe(true);
    expect(isHttpError(error) && error.isTimeout).toBe(true);
    // The status is kept: the headers did arrive, only the body stalled.
    expect(isHttpError(error) && error.status).toBe(200);
  });

  it('fails a request whose response headers never arrive', async () => {
    const error = await httpRequest({ url: `${baseUrl}/stalled-headers`, timeoutMs: 150 }).catch(
      (cause: unknown) => cause,
    );

    expect(isHttpError(error)).toBe(true);
    expect(isHttpError(error) && error.isTimeout).toBe(true);
    expect(isHttpError(error) && error.status).toBeUndefined();
  });
});
