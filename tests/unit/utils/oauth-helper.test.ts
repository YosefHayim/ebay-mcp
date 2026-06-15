/**
 * Unit tests for the OAuth loopback callback server (`startCallbackServer`).
 *
 * These exercise the inbound-redirect edge cases that gate the whole MCP flow:
 * code capture, URL-decoding, eBay error redirects, CSRF `state` validation,
 * stray non-callback requests, custom paths, timeouts, and port conflicts.
 * Every server binds to port `0` so the OS assigns a free port (no CI clashes),
 * and `afterEach` closes them so no listener or timer leaks between tests.
 */

import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'http';
import { startCallbackServer } from '@/utils/oauth-helper.js';

/** Resolve the actual TCP port a `0`-bound server was assigned. */
function portOf(server: Server): number {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('server is not bound to a TCP port');
  }
  return address.port;
}

describe('startCallbackServer', () => {
  const openServers: Server[] = [];

  /** Track a started server so it is always closed after the test. */
  function track(server: Server): Server {
    openServers.push(server);
    return server;
  }

  afterEach(() => {
    for (const server of openServers.splice(0)) {
      server.close();
    }
  });

  it('captures the authorization code from the redirect', async () => {
    const { server, codePromise } = await startCallbackServer(0);
    track(server);
    const response = await fetch(`http://localhost:${portOf(server)}/oauth/callback?code=abc123`);

    expect(response.status).toBe(200);
    await expect(codePromise).resolves.toMatchObject({ code: 'abc123' });
  });

  it('URL-decodes the captured code', async () => {
    const { server, codePromise } = await startCallbackServer(0);
    track(server);
    const raw = 'v^1.1#i^1+abc/def';
    await fetch(`http://localhost:${portOf(server)}/oauth/callback?code=${encodeURIComponent(raw)}`);

    await expect(codePromise).resolves.toMatchObject({ code: raw });
  });

  it('surfaces an OAuth error redirect with its description', async () => {
    const { server, codePromise } = await startCallbackServer(0);
    track(server);
    const response = await fetch(
      `http://localhost:${portOf(server)}/oauth/callback?error=access_denied&error_description=User%20declined`
    );

    expect(response.status).toBe(400);
    await expect(codePromise).resolves.toMatchObject({
      error: 'access_denied',
      errorDescription: 'User declined',
    });
  });

  it('HTML-escapes a malicious error_description in the response page (no reflected XSS)', async () => {
    const { server } = await startCallbackServer(0);
    track(server);
    const payload = '<script>alert(1)</script>';
    const response = await fetch(
      `http://localhost:${portOf(server)}/oauth/callback?error=access_denied&error_description=${encodeURIComponent(payload)}`
    );
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(body).not.toContain(payload);
    expect(body).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('rejects a state mismatch as a CSRF defense', async () => {
    const { server, codePromise } = await startCallbackServer(0, 300000, {
      expectedState: 'expected-state',
    });
    track(server);
    await fetch(`http://localhost:${portOf(server)}/oauth/callback?code=abc&state=tampered`);

    await expect(codePromise).resolves.toMatchObject({ error: 'invalid_state' });
  });

  it('accepts a matching state and echoes it back', async () => {
    const { server, codePromise } = await startCallbackServer(0, 300000, {
      expectedState: 'good-state',
    });
    track(server);
    await fetch(`http://localhost:${portOf(server)}/oauth/callback?code=abc&state=good-state`);

    await expect(codePromise).resolves.toMatchObject({ code: 'abc', state: 'good-state' });
  });

  it('ignores non-callback paths and keeps waiting for the real redirect', async () => {
    const { server, codePromise } = await startCallbackServer(0);
    track(server);
    const port = portOf(server);

    const stray = await fetch(`http://localhost:${port}/favicon.ico`);
    expect(stray.status).toBe(404);

    await fetch(`http://localhost:${port}/oauth/callback?code=later`);
    await expect(codePromise).resolves.toMatchObject({ code: 'later' });
  });

  it('honors a custom callback path', async () => {
    const { server, codePromise } = await startCallbackServer(0, 300000, { path: '/cb' });
    track(server);
    await fetch(`http://localhost:${portOf(server)}/cb?code=onpath`);

    await expect(codePromise).resolves.toMatchObject({ code: 'onpath' });
  });

  it('settles with a timeout when no redirect arrives', async () => {
    const { server, codePromise } = await startCallbackServer(0, 30);
    track(server);

    await expect(codePromise).resolves.toMatchObject({ error: 'timeout' });
  });

  it('rejects when the requested port is already in use', async () => {
    const { server } = await startCallbackServer(0);
    track(server);

    await expect(startCallbackServer(portOf(server))).rejects.toThrow();
  });
});
