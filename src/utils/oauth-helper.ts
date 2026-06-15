/**
 * OAuth Helper - Assists with eBay OAuth token acquisition
 */

import chalk from 'chalk';
import { createServer, type Server } from 'http';
import type { EbayConfig } from '../types/ebay.js';
import { getOAuthAuthorizationUrl } from '../config/environment.js';

/**
 * Result captured from the local OAuth callback endpoint. Exactly one of `code`
 * (success) or `error` (failure / timeout / CSRF) is populated.
 */
export interface OAuthCallbackResult {
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
 * Tuning for {@link startCallbackServer}. Both fields are optional so the legacy
 * positional call `startCallbackServer(port)` keeps working unchanged.
 */
export interface CallbackServerOptions {
  /** Loopback path eBay redirects to. Defaults to `/oauth/callback`. */
  path?: string;
  /**
   * Opaque value sent as the OAuth `state`. When provided, a callback whose
   * `state` does not match is rejected as `invalid_state` (CSRF defense).
   */
  expectedState?: string;
}

/**
 * Generate terminal hyperlink (if supported)
 */
function hyperlink(text: string, url: string): string {
  return `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;
}

/**
 * Generate eBay OAuth authorization URL
 */
export function generateAuthUrl(
  clientId: string,
  redirectUri: string,
  environment: 'sandbox' | 'production',
  scopes?: string[]
): string {
  return getOAuthAuthorizationUrl(clientId, redirectUri, environment, scopes);
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
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render the small HTML page the user lands on after eBay redirects back.
 *
 * @param success Whether authorization succeeded.
 * @param detail Error detail shown when `success` is false. Caller-supplied and
 *   potentially attacker-controlled (eBay's `error_description`), so it is
 *   HTML-escaped before interpolation.
 */
function renderCallbackPage(success: boolean, detail = ''): string {
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
}

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
 */
export async function startCallbackServer(
  port = 3000,
  timeoutMs = 300000,
  options: CallbackServerOptions = {}
): Promise<{ server: Server; codePromise: Promise<OAuthCallbackResult> }> {
  const callbackPath = options.path ?? '/oauth/callback';
  const { expectedState } = options;

  return await new Promise((resolve, reject) => {
    let timer: NodeJS.Timeout | undefined;
    let settled = false;
    let settle: (result: OAuthCallbackResult) => void;

    const codePromise = new Promise<OAuthCallbackResult>((resolveCode) => {
      settle = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolveCode(result);
      };
    });

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${port}`);
      if (url.pathname !== callbackPath) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const code = url.searchParams.get('code') ?? undefined;
      const state = url.searchParams.get('state') ?? undefined;
      const error = url.searchParams.get('error') ?? undefined;
      const errorDescription = url.searchParams.get('error_description') ?? undefined;

      if (expectedState && state !== expectedState) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(
          renderCallbackPage(false, 'State mismatch — the request may have been tampered with.')
        );
        settle({
          error: 'invalid_state',
          errorDescription: 'State parameter mismatch — possible CSRF.',
        });
        return;
      }
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderCallbackPage(true));
        settle({ code, state });
        return;
      }
      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(renderCallbackPage(false, errorDescription ?? error));
        settle({ error, errorDescription });
        return;
      }

      res.writeHead(400);
      res.end('Missing authorization code');
    });

    server.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    server.listen(port, () => {
      timer = setTimeout(
        () =>
          settle({
            error: 'timeout',
            errorDescription: 'OAuth callback timeout - no response received',
          }),
        timeoutMs
      );
      // Don't let the timeout alone keep the process alive; the listening server does.
      timer.unref();
      resolve({ server, codePromise });
    });
  });
}

/**
 * Interactive OAuth flow with local callback server
 */
export async function interactiveOAuthFlow(
  config: EbayConfig,
  scopes?: string[]
): Promise<string | null> {
  console.log(chalk.bold.cyan('\n🔐 Interactive OAuth Flow\n'));

  // Check if redirect URI is localhost
  const redirectUri = config.redirectUri || 'http://localhost:3000/oauth/callback';
  const isLocalhost = redirectUri.includes('localhost') || redirectUri.includes('127.0.0.1');

  if (!isLocalhost) {
    console.log(
      chalk.yellow(
        '⚠️  Your redirect URI is not localhost. Interactive flow requires localhost callback.\n'
      )
    );
    return null;
  }

  // Extract port from redirect URI
  const portMatch = /:(\d+)/.exec(redirectUri);
  const port = portMatch ? parseInt(portMatch[1], 10) : 3000;

  // Start callback server
  console.log(chalk.cyan('Starting local OAuth callback server...\n'));
  const { server, codePromise } = await startCallbackServer(port);

  // Generate auth URL
  const authUrl = generateAuthUrl(config.clientId, redirectUri, config.environment, scopes);

  console.log(chalk.bold.white('📋 Step 1: Authorize the Application\n'));
  console.log(chalk.gray('Open this URL in your browser:\n'));

  console.log(chalk.blue.underline(hyperlink(authUrl.substring(0, 20) + '...', authUrl)));
  console.log('');

  console.log(chalk.gray('Waiting for authorization...'));
  console.log(chalk.gray('(This window will update automatically after you authorize)\n'));

  // Wait for callback
  const result = await codePromise;

  // Close server
  server.close();

  if (result.error) {
    console.log(
      chalk.red(`\n✗ Authorization failed: ${result.errorDescription || result.error}\n`)
    );
    return null;
  }

  if (result.code) {
    console.log(chalk.green('\n✓ Authorization successful!\n'));
    return result.code;
  }

  console.log(chalk.yellow('\n⚠️  No authorization code received.\n'));
  return null;
}

/**
 * Display manual OAuth instructions
 */
export function displayManualOAuthInstructions(
  clientId: string,
  redirectUri: string,
  environment: 'sandbox' | 'production',
  scopes?: string[]
): void {
  const authUrl = generateAuthUrl(clientId, redirectUri, environment, scopes);

  console.log(chalk.bold.cyan('\n📖 Manual OAuth Token Acquisition Guide\n'));
  console.log(chalk.white('Step 1: Generate Authorization URL\n'));
  console.log(chalk.gray('Copy this URL and open it in your browser:\n'));
  console.log(chalk.blue.underline(authUrl));
  console.log('');

  console.log(chalk.white('\nStep 2: Authorize the Application\n'));
  console.log(chalk.gray('  • Log in to your eBay account'));
  console.log(chalk.gray('  • Review the permissions requested'));
  console.log(chalk.gray('  • Click "Agree" to authorize\n'));

  console.log(chalk.white('Step 3: Get the Authorization Code\n'));
  console.log(chalk.gray('  • After authorization, you will be redirected to your redirect URI'));
  console.log(chalk.gray('  • The URL will contain a "code" parameter'));
  console.log(chalk.gray('  • Example: https://your-redirect-uri?code=v^1.1#i^1...\n'));

  console.log(chalk.white('Step 4: Exchange Code for Tokens\n'));
  console.log(chalk.gray('  • Use the code to get your refresh token'));
  console.log(chalk.gray('  • This can be done through the MCP tool: ebay_exchange_auth_code'));
  console.log(chalk.gray('  • Or paste the code in the setup wizard when prompted\n'));
}

/**
 * Get help text for RuName (Redirect URI)
 */
export function getRuNameHelp(): string {
  return `
${chalk.bold.cyan('What is a RuName (Redirect URI)?')}

A RuName (Redirect URL name) is a unique identifier for your OAuth redirect URI.
It's required for eBay's OAuth flow to know where to send users after authorization.

${chalk.bold.white('How to create a RuName:')}

1. Go to eBay Developer Portal:
   ${chalk.blue.underline('https://developer.ebay.com/my/keys')}

2. Select your application

3. Navigate to "User Tokens" section

4. Click "Add RuName"

5. Enter your redirect URI:
   ${chalk.gray('For local development: http://localhost:3000/oauth/callback')}
   ${chalk.gray('For production: https://your-domain.com/oauth/callback')}

6. Copy the generated RuName and use it in your configuration

${chalk.bold.white('Common RuName formats:')}

  ${chalk.gray('• For localhost:')} YourCompany-YourApp-LocalTest-RuName
  ${chalk.gray('• For production:')} YourCompany-YourApp-Production-RuName

${chalk.yellow('Note:')} The RuName is NOT the same as the redirect URI itself.
It's a reference name that eBay associates with your redirect URI.
`;
}

/**
 * Display first-time developer guide
 */
export function displayFirstTimeDeveloperGuide(): void {
  console.log(chalk.bold.cyan('\n🆕 First-Time eBay Developer Guide\n'));
  console.log(chalk.white("Welcome! Here's how to get started:\n"));

  console.log(chalk.bold.yellow('Step 1: Create eBay Developer Account\n'));
  console.log(chalk.gray('  1. Visit: ') + chalk.blue.underline('https://developer.ebay.com/'));
  console.log(chalk.gray('  2. Click "Register" or "Join"'));
  console.log(chalk.gray('  3. Complete the registration form'));
  console.log(chalk.gray('  4. Verify your email address\n'));

  console.log(chalk.bold.yellow('Step 2: Create an Application\n'));
  console.log(
    chalk.gray('  1. Go to: ') + chalk.blue.underline('https://developer.ebay.com/my/keys')
  );
  console.log(chalk.gray('  2. Click "Create Application"'));
  console.log(chalk.gray('  3. Fill in application details (name, description)'));
  console.log(chalk.gray('  4. Choose Sandbox environment to start\n'));

  console.log(chalk.bold.yellow('Step 3: Get Your Credentials\n'));
  console.log(chalk.gray('  After creating the app, you will see:'));
  console.log(chalk.gray('  • App ID (Client ID) - Copy this'));
  console.log(chalk.gray('  • Cert ID (Client Secret) - Copy this'));
  console.log(chalk.gray('  • These are needed for the setup wizard\n'));

  console.log(chalk.bold.yellow('Step 4: Create RuName (Redirect URI)\n'));
  console.log(chalk.gray('  1. In your application settings'));
  console.log(chalk.gray('  2. Navigate to "User Tokens" section'));
  console.log(chalk.gray('  3. Click "Add RuName"'));
  console.log(chalk.gray('  4. Enter: http://localhost:3000/oauth/callback'));
  console.log(chalk.gray('  5. Save and copy the generated RuName\n'));

  console.log(chalk.bold.yellow('Step 5: Get User Token\n'));
  console.log(chalk.gray('  Option A: Use this setup wizard (recommended)'));
  console.log(chalk.gray('  Option B: Manual OAuth flow through eBay Developer Portal\n'));

  console.log(chalk.green.bold("✅ Once you have these, you're ready to continue!\n"));
  console.log(chalk.gray('Press Enter to continue when you have your credentials ready...'));
}
