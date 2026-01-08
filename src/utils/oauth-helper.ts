/**
 * OAuth Helper - Assists with eBay OAuth token acquisition
 */

import chalk from 'chalk';
import { createServer, type Server } from 'http';
import type { EbayConfig } from '../types/ebay.js';
import { getOAuthAuthorizationUrl } from '../config/environment.js';

export interface OAuthCallbackResult {
  code?: string;
  error?: string;
  errorDescription?: string;
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
 * Start a local server to capture OAuth callback
 */
export async function startCallbackServer(
  port = 3000,
  timeout = 300000 // 5 minutes
): Promise<{ server: Server; codePromise: Promise<OAuthCallbackResult> }> {
  return await new Promise((resolve) => {
    let callbackResolver: (result: OAuthCallbackResult) => void;

    const codePromise = new Promise<OAuthCallbackResult>((res) => {
      callbackResolver = res;
    });

    const server = createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      const url = new URL(req.url, `http://localhost:${port}`);

      // Handle OAuth callback
      if (url.pathname === '/oauth/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>eBay MCP - Authorization Successful</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  }
                  .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    text-align: center;
                    max-width: 500px;
                  }
                  .success-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                  }
                  h1 {
                    color: #4CAF50;
                    margin-bottom: 10px;
                  }
                  p {
                    color: #666;
                    line-height: 1.6;
                  }
                  .code {
                    background: #f5f5f5;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    word-break: break-all;
                    margin: 20px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="success-icon">✅</div>
                  <h1>Authorization Successful!</h1>
                  <p>You have successfully authorized the eBay MCP server.</p>
                  <p>You can close this window and return to your terminal.</p>
                  <p class="code">Authorization code received</p>
                </div>
              </body>
            </html>
          `);

          callbackResolver({ code });
        } else if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>eBay MCP - Authorization Failed</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                  }
                  .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    text-align: center;
                    max-width: 500px;
                  }
                  .error-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                  }
                  h1 {
                    color: #f44336;
                    margin-bottom: 10px; /* Fix: Changed color to red for error */
                  }
                  p {
                    color: #666;
                    line-height: 1.6;
                  }
                  .error {
                    background: #ffebee;
                    color: #c62828;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 20px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="error-icon">❌</div>
                  <h1>Authorization Failed</h1>
                  <p>There was an error during authorization.</p>
                  <div class="error">${errorDescription ?? error}</div>
                  <p>Please return to your terminal and try again.</p>
                </div>
                <script>
                  // Close the window after a short delay
                  setTimeout(() => window.close(), 5000);
                </script>
              </body>
            </html>
          `);

          callbackResolver({ error, errorDescription: errorDescription ?? undefined });
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      console.log(chalk.gray(`  OAuth callback server listening on http://localhost:${port}`));
      resolve({ server, codePromise });
    });

    // Set timeout
    setTimeout(() => {
      callbackResolver({
        error: 'timeout',
        errorDescription: 'OAuth callback timeout - no response received',
      });
    }, timeout);
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
