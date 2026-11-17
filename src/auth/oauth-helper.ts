/**
 * OAuth Helper - Assists with eBay OAuth token acquisition
 */

import { createServer, type Server } from 'http';

/**
 * Result captured from the local OAuth callback endpoint. Exactly one of `code`
 * (success) or `error` (failure / timeout / CSRF) is populated.
 */
interface OAuthCallbackResult {
  /** Authorization code eBay appended to the redirect, when successful. */
  code?: string;
  /** Opaque CSRF value echoed back by eBay, when a `state` was sent. */
  state?: string;
  /** Error code: an eBay `error`, `'timeout'`, or `'invalid_state'`. */
  error?: string;
  /** Human-readable detail for {@link OAuthCallbackResult.error}. */
  errorDescription?: string;
}

/**
 * Tuning for {@link startCallbackServer}. Both fields are optional so callers
 * can focus on port and timeout when they do not need callback validation.
 */
interface CallbackServerOptions {
  /** Loopback path eBay redirects to. Defaults to `/oauth/callback`. */
  path?: string;
  /**
   * Opaque value sent as the OAuth `state`. When provided, a callback whose
   * `state` does not match is rejected as `invalid_state` (CSRF defense).
   */
  expectedState?: string;
}

/**
 * Escape a string for safe interpolation into HTML text/attribute context.
 *
 * The callback page reflects eBay's `error` / `error_description` query params,
 * which are attacker-controllable: a crafted `…/oauth/callback?error=<script>…`
 * would otherwise execute in the browser (reflected XSS). Encoding the five
 * HTML-significant characters neutralizes the markup while keeping the message
 * legible.
 */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Render the small HTML page the user lands on after eBay redirects back.
 *
 * @param success Whether authorization succeeded.
 * @param detail Error detail shown when `success` is false. Caller-supplied and
 *   potentially attacker-controlled (eBay's `error_description`), so it is
 *   HTML-escaped before interpolation.
 */
const renderCallbackPage = (success: boolean, detail = ''): string => {
  const gradient = success
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  const headingColor = success ? '#4CAF50' : '#f44336';
  const icon = success ? '✅' : '❌';
  const heading = success ? 'Authorization Successful!' : 'Authorization Failed';
  const message = success
    ? `<p>You have successfully authorized the eBay MCP server.</p>
        <p>You can close this window and return to your terminal.</p>`
    : `<p>There was an error during authorization.</p>
        <div class="detail">${escapeHtml(detail)}</div>
        <p>Please return to your terminal and try again.</p>`;
  const autoClose = success ? '' : '<script>setTimeout(() => window.close(), 5000);</script>';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>eBay MCP — ${success ? 'Authorized' : 'Authorization Failed'}</title>
    <style>
      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: ${gradient}; }
      .container { background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); text-align: center; max-width: 500px; }
      .icon { font-size: 64px; margin-bottom: 20px; }
      h1 { color: ${headingColor}; margin-bottom: 10px; }
      p { color: #666; line-height: 1.6; }
      .detail { background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px; margin: 20px 0; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="icon">${icon}</div>
      <h1>${heading}</h1>
      ${message}
    </div>
    ${autoClose}
  </body>
</html>`;
};

/**
 * Start a loopback HTTP server that captures the eBay OAuth redirect.
 *
 * eBay redirects the browser to the URL registered under your RuName; point that
 * URL at `http://localhost:<port><path>` and this server captures the `?code=`
 * automatically, removing the copy-paste step. The returned `codePromise` settles
 * exactly once — on the first matching callback, a timeout, or a CSRF `state`
 * mismatch — and the internal timer is always cleared so no handle leaks. The
 * caller owns the server and must `server.close()` when done. The outer promise
 * rejects if the port cannot be bound (e.g. `EADDRINUSE`).
 *
 * @param port Loopback port to listen on (`0` lets the OS choose — handy in tests).
 * @param timeoutMs How long to wait for the redirect before settling with `timeout`.
 * @param options Path and CSRF-`state` tuning — see {@link CallbackServerOptions}.
 * @returns The live server plus a promise resolving to the callback result.
 * @example
 * ```ts
 * const { server, codePromise } = await startCallbackServer(3000);
 * ```
 */
export const startCallbackServer = async (
  port = 3000,
  timeoutMs = 300_000,
  options: CallbackServerOptions = {},
): Promise<{ server: Server; codePromise: Promise<OAuthCallbackResult> }> => {
  const callbackPath = options.path ?? '/oauth/callback';
  const { expectedState } = options;

  return await new Promise((onServerReady, onServerError) => {
    let timer: NodeJS.Timeout | undefined;
    let settled = false;
    let settle: (outcome: OAuthCallbackResult) => void;

    const codePromise = new Promise<OAuthCallbackResult>((resolveCode) => {
      settle = (outcome) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolveCode(outcome);
      };
    });

    const server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', `http://localhost:${port}`);
      if (url.pathname !== callbackPath) {
        response.writeHead(404);
        response.end('Not Found');
        return;
      }

      const code = url.searchParams.get('code') ?? undefined;
      const state = url.searchParams.get('state') ?? undefined;
      const error = url.searchParams.get('error') ?? undefined;
      const errorDescription = url.searchParams.get('error_description') ?? undefined;

      if (expectedState && state !== expectedState) {
        response.writeHead(400, { 'Content-Type': 'text/html' });
        response.end(
          renderCallbackPage(false, 'State mismatch — the request may have been tampered with.'),
        );
        settle({
          error: 'invalid_state',
          errorDescription: 'State parameter mismatch — possible CSRF.',
        });
        return;
      }
      if (code) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(renderCallbackPage(true));
        settle({ code, state });
        return;
      }
      if (error) {
        response.writeHead(400, { 'Content-Type': 'text/html' });
        response.end(renderCallbackPage(false, errorDescription ?? error));
        settle({ error, errorDescription });
        return;
      }

      response.writeHead(400);
      response.end('Missing authorization code');
    });

    server.on('error', (serverError) => {
      clearTimeout(timer);
      onServerError(serverError);
    });

    server.listen(port, () => {
      timer = setTimeout(
        () =>
          settle({
            error: 'timeout',
            errorDescription: 'OAuth callback timeout - no response received',
          }),
        timeoutMs,
      );
      // Don't let the timeout alone keep the process alive; the listening server does.
      timer.unref();
      onServerReady({ server, codePromise });
    });
  });
};
