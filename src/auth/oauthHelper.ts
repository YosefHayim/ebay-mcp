import { createServer, type Server } from "http";
import { writeCliLine } from "@/shared/cliOutput.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { getOAuthAuthorizationUrl } from "@/shared/environment.js";
import { paint } from "@/shared/paint.js";

export interface OAuthCallbackResult {
	code?: string;
	state?: string | undefined;
	error?: string;
	errorDescription?: string | undefined;
}

export interface CallbackServerOptions {
	path?: string;
	expectedState?: string;
}

function hyperlink(text: string, url: string): string {
	return `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;
}

export function generateAuthUrl(
	clientId: string,
	redirectUri: string,
	environment: "sandbox" | "production",
	scopes?: string[],
): string {
	return getOAuthAuthorizationUrl(clientId, redirectUri, environment, scopes);
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function renderCallbackPage(success: boolean, detail = ""): string {
	const gradient = success
		? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
		: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
	const headingColor = success ? "#4CAF50" : "#f44336";
	const icon = success ? "✅" : "❌";
	const heading = success
		? "Authorization Successful!"
		: "Authorization Failed";
	const message = success
		? `<p>You have successfully authorized the eBay MCP server.</p>
        <p>You can close this window and return to your terminal.</p>`
		: `<p>There was an error during authorization.</p>
        <div class="detail">${escapeHtml(detail)}</div>
        <p>Please return to your terminal and try again.</p>`;
	const autoClose = success
		? ""
		: "<script>setTimeout(() => window.close(), 5000);</script>";

	return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>eBay MCP — ${success ? "Authorized" : "Authorization Failed"}</title>
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

export async function startCallbackServer(
	port = 3000,
	timeoutMs = 300_000,
	options: CallbackServerOptions = {},
): Promise<{ server: Server; codePromise: Promise<OAuthCallbackResult> }> {
	const callbackPath = options.path ?? "/oauth/callback";
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
			const url = new URL(request.url ?? "/", `http://localhost:${port}`);
			if (url.pathname != callbackPath) {
				response.writeHead(404);
				response.end("Not Found");
				return;
			}

			const code = url.searchParams.get("code") ?? undefined;
			const state = url.searchParams.get("state") ?? undefined;
			const error = url.searchParams.get("error") ?? undefined;
			const errorDescription =
				url.searchParams.get("error_description") ?? undefined;

			function hasStateMismatch(): boolean {
				const hasNoExpectedState = !expectedState;

				if (hasNoExpectedState) {
					return false;
				}

				const isExpectedState = state == expectedState;

				if (isExpectedState) {
					return false;
				}

				return true;
			}

			const isStateMismatch = hasStateMismatch();

			if (isStateMismatch) {
				response.writeHead(400, { "Content-Type": "text/html" });
				response.end(
					renderCallbackPage(
						false,
						"State mismatch — the request may have been tampered with.",
					),
				);
				settle({
					error: "invalid_state",
					errorDescription: "State parameter mismatch — possible CSRF.",
				});
				return;
			}

			if (code) {
				response.writeHead(200, { "Content-Type": "text/html" });
				response.end(renderCallbackPage(true));
				settle({ code, state });
				return;
			}
			if (error) {
				response.writeHead(400, { "Content-Type": "text/html" });
				response.end(renderCallbackPage(false, errorDescription ?? error));
				settle({ error, errorDescription });
				return;
			}

			response.writeHead(400);
			response.end("Missing authorization code");
		});

		server.on("error", (serverError) => {
			clearTimeout(timer);
			onServerError(serverError);
		});

		server.listen(port, () => {
			timer = setTimeout(
				() =>
					settle({
						error: "timeout",
						errorDescription: "OAuth callback timeout - no response received",
					}),
				timeoutMs,
			);
			// Don't let the timeout alone keep the process alive; the listening server does.
			timer.unref();
			onServerReady({ server, codePromise });
		});
	});
}

export async function interactiveOAuthFlow(
	config: EbayConfig,
	scopes?: string[],
): Promise<string | null> {
	writeCliLine(paint.bold.cyan("\n🔐 Interactive OAuth Flow\n"));

	const redirectUri =
		config.redirectUri || "http://localhost:3000/oauth/callback";

	function isLocalRedirect(): boolean {
		const isLocalhostName = redirectUri.includes("localhost");

		if (isLocalhostName) {
			return true;
		}

		const isLoopbackAddress = redirectUri.includes("127.0.0.1");

		if (isLoopbackAddress) {
			return true;
		}

		return false;
	}

	const isLocalhost = isLocalRedirect();
	const isRemoteRedirect = !isLocalhost;

	if (isRemoteRedirect) {
		writeCliLine(
			paint.yellow(
				"⚠️  Your redirect URI is not localhost. Interactive flow requires localhost callback.\n",
			),
		);
		return null;
	}

	// Extract port from redirect URI
	const portMatch = /:(\d+)/.exec(redirectUri);
	const portText = portMatch?.[1];
	const isPortMissing = portText == null;
	const port = isPortMissing ? 3000 : Number.parseInt(portText, 10);

	// Start callback server
	writeCliLine(paint.cyan("Starting local OAuth callback server...\n"));
	const { server, codePromise } = await startCallbackServer(port);

	// Generate auth URL
	const authUrl = generateAuthUrl(
		config.clientId,
		redirectUri,
		config.environment,
		scopes,
	);

	writeCliLine(paint.bold.white("📋 Step 1: Authorize the Application\n"));
	writeCliLine(paint.gray("Open this URL in your browser:\n"));

	writeCliLine(
		paint.blue.underline(hyperlink(authUrl.substring(0, 20) + "...", authUrl)),
	);
	writeCliLine("");

	writeCliLine(paint.gray("Waiting for authorization..."));
	writeCliLine(
		paint.gray("(This window will update automatically after you authorize)\n"),
	);

	// Wait for callback
	const callback = await codePromise;

	// Close server
	server.close();

	if (callback.error) {
		writeCliLine(
			paint.red(
				`\n✗ Authorization failed: ${callback.errorDescription || callback.error}\n`,
			),
		);
		return null;
	}

	if (callback.code) {
		writeCliLine(paint.green("\n✓ Authorization successful!\n"));
		return callback.code;
	}

	writeCliLine(paint.yellow("\n⚠️  No authorization code received.\n"));
	return null;
}

export function displayManualOAuthInstructions(
	clientId: string,
	redirectUri: string,
	environment: "sandbox" | "production",
	scopes?: string[],
): void {
	const authUrl = generateAuthUrl(clientId, redirectUri, environment, scopes);

	writeCliLine(paint.bold.cyan("\n📖 Manual OAuth Token Acquisition Guide\n"));
	writeCliLine(paint.white("Step 1: Generate Authorization URL\n"));
	writeCliLine(paint.gray("Copy this URL and open it in your browser:\n"));
	writeCliLine(paint.blue.underline(authUrl));
	writeCliLine("");

	writeCliLine(paint.white("\nStep 2: Authorize the Application\n"));
	writeCliLine(paint.gray("  • Log in to your eBay account"));
	writeCliLine(paint.gray("  • Review the permissions requested"));
	writeCliLine(paint.gray('  • Click "Agree" to authorize\n'));

	writeCliLine(paint.white("Step 3: Get the Authorization Code\n"));
	writeCliLine(
		paint.gray(
			"  • After authorization, you will be redirected to your redirect URI",
		),
	);
	writeCliLine(paint.gray('  • The URL will contain a "code" parameter'));
	writeCliLine(
		paint.gray("  • Example: https://your-redirect-uri?code=v^1.1#i^1...\n"),
	);

	writeCliLine(paint.white("Step 4: Exchange Code for Tokens\n"));
	writeCliLine(paint.gray("  • Use the code to get your refresh token"));
	writeCliLine(
		paint.gray(
			"  • This can be done through the MCP tool: ebay_exchange_auth_code",
		),
	);
	writeCliLine(
		paint.gray("  • Or paste the code in the setup wizard when prompted\n"),
	);
}

export function getRuNameHelp(): string {
	return `
${paint.bold.cyan("What is a RuName (Redirect URI)?")}

A RuName (Redirect URL name) is a unique identifier for your OAuth redirect URI.
It's required for eBay's OAuth flow to know where to send users after authorization.

${paint.bold.white("How to create a RuName:")}

1. Go to eBay Developer Portal:
   ${paint.blue.underline("https://developer.ebay.com/my/keys")}

2. Select your application

3. Navigate to "User Tokens" section

4. Click "Add RuName"

5. Enter your redirect URI:
   ${paint.gray("For local development: http://localhost:3000/oauth/callback")}
   ${paint.gray("For production: https://your-domain.com/oauth/callback")}

6. Copy the generated RuName and use it in your configuration

${paint.bold.white("Common RuName formats:")}

  ${paint.gray("• For localhost:")} YourCompany-YourApp-LocalTest-RuName
  ${paint.gray("• For production:")} YourCompany-YourApp-Production-RuName

${paint.yellow("Note:")} The RuName is NOT the same as the redirect URI itself.
It's a reference name that eBay associates with your redirect URI.
`;
}

export function displayFirstTimeDeveloperGuide(): void {
	writeCliLine(paint.bold.cyan("\n🆕 First-Time eBay Developer Guide\n"));
	writeCliLine(paint.white("Welcome! Here's how to get started:\n"));

	writeCliLine(paint.bold.yellow("Step 1: Create eBay Developer Account\n"));
	writeCliLine(
		paint.gray("  1. Visit: ") +
			paint.blue.underline("https://developer.ebay.com/"),
	);
	writeCliLine(paint.gray('  2. Click "Register" or "Join"'));
	writeCliLine(paint.gray("  3. Complete the registration form"));
	writeCliLine(paint.gray("  4. Verify your email address\n"));

	writeCliLine(paint.bold.yellow("Step 2: Create an Application\n"));
	writeCliLine(
		paint.gray("  1. Go to: ") +
			paint.blue.underline("https://developer.ebay.com/my/keys"),
	);
	writeCliLine(paint.gray('  2. Click "Create Application"'));
	writeCliLine(
		paint.gray("  3. Fill in application details (name, description)"),
	);
	writeCliLine(paint.gray("  4. Choose Sandbox environment to start\n"));

	writeCliLine(paint.bold.yellow("Step 3: Get Your Credentials\n"));
	writeCliLine(paint.gray("  After creating the app, you will see:"));
	writeCliLine(paint.gray("  • App ID (Client ID) - Copy this"));
	writeCliLine(paint.gray("  • Cert ID (Client Secret) - Copy this"));
	writeCliLine(paint.gray("  • These are needed for the setup wizard\n"));

	writeCliLine(paint.bold.yellow("Step 4: Create RuName (Redirect URI)\n"));
	writeCliLine(paint.gray("  1. In your application settings"));
	writeCliLine(paint.gray('  2. Navigate to "User Tokens" section'));
	writeCliLine(paint.gray('  3. Click "Add RuName"'));
	writeCliLine(paint.gray("  4. Enter: http://localhost:3000/oauth/callback"));
	writeCliLine(paint.gray("  5. Save and copy the generated RuName\n"));

	writeCliLine(paint.bold.yellow("Step 5: Get User Token\n"));
	writeCliLine(paint.gray("  Option A: Use this setup wizard (recommended)"));
	writeCliLine(
		paint.gray("  Option B: Manual OAuth flow through eBay Developer Portal\n"),
	);

	writeCliLine(
		paint.green.bold("✅ Once you have these, you're ready to continue!\n"),
	);
	writeCliLine(
		paint.gray(
			"Press Enter to continue when you have your credentials ready...",
		),
	);
}
