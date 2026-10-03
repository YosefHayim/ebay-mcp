import { z } from 'zod';
import { buildCredentialDisplay, maskToken } from '@/auth/credentialSession.js';
import { getOAuthAuthorizationUrl, validateScopes } from '@/config/environment.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { convertToTimestamp, validateTokenExpiry } from '@/utils/dateConverter.js';
import { getErrorMessage } from '@/utils/errors.js';
import { Data, Effect, Either } from 'effect';

type TokenManagementToolOperation =
  | 'getOAuthUrl'
  | 'setUserTokens'
  | 'validateTokenExpiry'
  | 'convertDateToTimestamp'
  | 'refreshAccessToken'
  | 'exchangeAuthorizationCode';

/** Tagged failure raised inside token-management tool handlers. */
class TokenManagementToolError extends Data.TaggedError('TokenManagementToolError')<{
  /** Tool operation that failed. */
  readonly operation: TokenManagementToolOperation;
  /** Human-readable failure message returned at the MCP boundary. */
  readonly message: string;
  /** Lower-level OAuth, storage, date parsing, or decoding cause. */
  readonly cause?: unknown;
}> {}

const tokenToolError = (
  operation: TokenManagementToolOperation,
  message: string,
  error?: unknown,
): TokenManagementToolError =>
  new TokenManagementToolError({
    operation,
    message: error === undefined ? message : `${message}: ${getErrorMessage(error, String(error))}`,
    ...(error === undefined ? {} : { cause: error }),
  });

/** Convert an optional token expiry value into a timestamp inside the token tool Effect. */
const optionalTokenExpiryTimestamp = (
  value: string | number | undefined,
  operation: TokenManagementToolOperation,
  message: string,
): Effect.Effect<number | undefined, TokenManagementToolError> => {
  if (value === undefined) {
    return Effect.succeed(undefined);
  }

  return convertToTimestamp(value).pipe(
    Effect.mapError((error) => tokenToolError(operation, message, error)),
  );
};

const missingClientIdError = tokenToolError(
  'getOAuthUrl',
  'EBAY_CLIENT_ID environment variable is required to generate OAuth URL',
);

const missingRedirectUriError = tokenToolError(
  'getOAuthUrl',
  'Redirect URI is required. Either provide it as a parameter or set EBAY_REDIRECT_URI in your .env file.',
);

const missingUserTokensError = tokenToolError(
  'refreshAccessToken',
  'No user tokens available. Please set user tokens first using ebay_set_user_tokens_with_expiry or add EBAY_USER_REFRESH_TOKEN to your .env file.',
);

const oauthUrlInputSchema = z.object({
  redirectUri: z
    .string()
    .optional()
    .describe(
      'Optional redirect URI registered with your eBay application (RuName). If not provided, will use EBAY_REDIRECT_URI from .env file.',
    ),
  scopes: z
    .array(z.string())
    .optional()
    .describe(
      'Optional array of OAuth scopes. If not provided, uses environment-specific default scopes (production or sandbox based on EBAY_ENVIRONMENT). Custom scopes will be validated against the environment.',
    ),
  state: z.string().optional().describe('Optional state parameter for CSRF protection'),
});

const setUserTokensInputSchema = z.object({
  accessToken: z.string().min(1).describe('The user access token obtained from OAuth flow'),
  refreshToken: z.string().min(1).describe('The refresh token obtained from OAuth flow'),
});

const setUserTokensWithExpiryInputSchema = z.object({
  accessToken: z.string().min(1).describe('eBay user access token'),
  refreshToken: z.string().min(1).describe('eBay user refresh token'),
  accessTokenExpiry: z
    .union([z.string(), z.number()])
    .optional()
    .describe(
      'Optional access-token expiry. Supports ISO date strings, Unix timestamps, and relative time.',
    ),
  refreshTokenExpiry: z
    .union([z.string(), z.number()])
    .optional()
    .describe(
      'Optional refresh-token expiry. Supports ISO date strings, Unix timestamps, and relative time.',
    ),
  autoRefresh: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to validate and refresh the access token immediately'),
});

const getTokenStatusInputSchema = z.object({});

const clearTokensInputSchema = z.object({});

const validateTokenExpiryInputSchema = z.object({
  accessTokenExpiry: z
    .union([z.string(), z.number()])
    .describe('Access token expiry as an ISO date string, Unix timestamp, or relative time'),
  refreshTokenExpiry: z
    .union([z.string(), z.number()])
    .describe('Refresh token expiry as an ISO date string, Unix timestamp, or relative time'),
});

const convertDateToTimestampInputSchema = z.object({
  dateInput: z
    .union([z.string(), z.number()])
    .describe('Date to convert as an ISO date string, Unix timestamp, or relative time'),
});

const displayCredentialsInputSchema = z.object({});

const refreshAccessTokenInputSchema = z.object({});

const exchangeAuthorizationCodeInputSchema = z.object({
  code: z
    .string()
    .min(1)
    .describe('The authorization code received from eBay after user authorization'),
});

/**
 * OAuth token management tools for consent URLs, token storage, refresh, status,
 * and date/expiry helpers. Handlers receive validated runtime config from the API facade.
 */
export const tokenManagementEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_oauth_url',
    description:
      'Generate the eBay OAuth authorization URL for user consent. The user should open this URL in a browser to grant permissions to the application. This supports the OAuth 2.0 Authorization Code grant flow. The redirect URI can be provided as a parameter or will be read from EBAY_REDIRECT_URI environment variable.\n\n' +
      'IMPORTANT: eBay has different OAuth scopes available for production vs sandbox environments:\n' +
      '- Sandbox includes additional Buy API scopes (e.g., buy.order.readonly, buy.guest.order, buy.shopping.cart) and extended Identity scopes\n' +
      '- Production includes sell.edelivery, commerce.message (explicit), and commerce.shipping scopes not available in sandbox\n' +
      '- If you provide custom scopes, they will be validated against the current environment (set via EBAY_ENVIRONMENT). Any scopes not valid for the environment will generate warnings.\n\n' +
      'OAUTH FLOW INSTRUCTIONS:\n' +
      '1. Generate OAuth URL with this tool (optionally specify scopes)\n' +
      '2. User opens URL in browser, authorizes, and gets redirected with a code parameter\n' +
      '3. Use ebay_exchange_authorization_code tool with the code (URL-encoded format accepted)\n' +
      '4. Tokens are automatically stored and will auto-refresh every 2 hours\n\n' +
      'COMMON SCOPES:\n' +
      '- Basic (always included): https://api.ebay.com/oauth/api_scope\n' +
      '- Inventory: https://api.ebay.com/oauth/api_scope/sell.inventory\n' +
      '- Inventory (readonly): https://api.ebay.com/oauth/api_scope/sell.inventory.readonly\n' +
      '- Account: https://api.ebay.com/oauth/api_scope/sell.account\n' +
      '- Fulfillment: https://api.ebay.com/oauth/api_scope/sell.fulfillment\n\n' +
      'TROUBLESHOOTING:\n' +
      '- Authorization codes expire in ~5 minutes - get fresh code if "invalid grant" error\n' +
      '- "Insufficient permissions" errors mean you need to re-authorize with additional scopes\n' +
      '- OAuth URL format: Use + to separate scopes (e.g., scope=scope1+scope2), not %2B\n' +
      '- Refresh tokens last 18 months and are saved to .env file for persistence',
    inputSchema: oauthUrlInputSchema.shape,
    handler: (api, args) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const config = api.getConfig();
          const redirectUri = args.redirectUri ?? config.redirectUri;

          if (!config.clientId) {
            return yield* Effect.fail(missingClientIdError);
          }

          if (!redirectUri) {
            return yield* Effect.fail(missingRedirectUriError);
          }

          const scopes = args.scopes;
          const scopeValidation =
            scopes && scopes.length > 0
              ? validateScopes(scopes, config.environment)
              : { warnings: [], validScopes: scopes };
          const authUrl = getOAuthAuthorizationUrl(
            config.clientId,
            redirectUri,
            config.environment,
            scopeValidation.validScopes,
            args.state,
          );

          const result: Record<string, unknown> = {
            authorizationUrl: authUrl,
            redirectUri,
            instructions:
              'Open this URL in a browser to authorize the application. After authorization, you will be redirected to your redirect URI with an authorization code that can be exchanged for an access token.',
            environment: config.environment,
            scopes: scopes ?? 'default (all Sell API scopes)',
          };

          if (scopeValidation.warnings.length > 0) {
            result.warnings = scopeValidation.warnings;
          }

          return result;
        }),
      ),
  }),
  defineTool({
    name: 'ebay_set_user_tokens',
    description:
      'Set the user access token and refresh token for authenticated API requests. These tokens should be obtained through the OAuth authorization code flow. Tokens will be persisted to disk and automatically refreshed when needed. User tokens provide higher rate limits (10,000-50,000 requests/day) compared to client credentials (1,000 requests/day).',
    inputSchema: setUserTokensInputSchema.shape,
    handler: (api, args) =>
      Effect.runPromise(
        api.setUserTokens(args.accessToken, args.refreshToken).pipe(
          Effect.mapError((error) =>
            tokenToolError('setUserTokens', 'Failed to set user tokens', error),
          ),
          Effect.map(() => ({
            success: true,
            message:
              'User tokens successfully stored. These tokens will be used for all subsequent API requests and will be automatically refreshed when needed.',
            tokenInfo: api.getTokenInfo(),
          })),
        ),
      ),
  }),
  defineTool({
    name: 'ebay_set_user_tokens_with_expiry',
    description:
      "Set user access and refresh tokens with custom expiry times. This is an enhanced version of ebay_set_user_tokens that accepts expiry times and can automatically refresh the access token if it's expired but the refresh token is valid. Useful when user provides tokens that may already be partially expired.",
    inputSchema: setUserTokensWithExpiryInputSchema.shape,
    handler: (api, args) => {
      const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry, autoRefresh } =
        args;

      return Effect.runPromise(
        Effect.gen(function* () {
          const accessExpiry = yield* optionalTokenExpiryTimestamp(
            accessTokenExpiry,
            'setUserTokens',
            'Failed to set user tokens',
          );
          const refreshExpiry = yield* optionalTokenExpiryTimestamp(
            refreshTokenExpiry,
            'setUserTokens',
            'Failed to set user tokens',
          );

          yield* api
            .setUserTokens(accessToken, refreshToken, accessExpiry, refreshExpiry)
            .pipe(
              Effect.mapError((error) =>
                tokenToolError('setUserTokens', 'Failed to set user tokens', error),
              ),
            );

          if (autoRefresh) {
            const refreshResult = yield* Effect.either(
              api.getAuthClient().getOAuthClient().getAccessToken(),
            );

            if (Either.isRight(refreshResult)) {
              return {
                success: true,
                message:
                  'User tokens stored successfully in memory. Access token validated and refreshed if needed. To persist tokens, update EBAY_USER_REFRESH_TOKEN in .env file.',
                tokenInfo: api.getTokenInfo(),
                refreshed: true,
              };
            }

            return {
              success: true,
              message:
                'User tokens stored, but failed to validate/refresh access token. You may need to re-authorize.',
              tokenInfo: api.getTokenInfo(),
              refreshed: false,
              refreshError: getErrorMessage(refreshResult.left),
            };
          }

          return {
            success: true,
            message:
              'User tokens successfully stored in memory. These tokens will be used for all subsequent API requests and will be automatically refreshed when needed. To persist tokens, update EBAY_USER_REFRESH_TOKEN in .env file.',
            tokenInfo: api.getTokenInfo(),
            refreshed: false,
          };
        }),
      );
    },
  }),
  defineTool({
    name: 'ebay_get_token_status',
    description:
      'Check the current OAuth token status. Returns information about whether user tokens or client credentials are being used, and whether tokens are valid.',
    inputSchema: getTokenStatusInputSchema.shape,
    handler: (api) => {
      const tokenInfo = api.getTokenInfo();
      const hasUserTokens = api.hasUserTokens();
      let currentTokenType = 'none';
      if (tokenInfo.hasUserToken) {
        currentTokenType = 'user_token (10,000-50,000 req/day)';
      } else if (tokenInfo.hasAppAccessToken) {
        currentTokenType = 'app_access_token (1,000 req/day)';
      }

      return {
        hasUserToken: tokenInfo.hasUserToken,
        hasAppAccessToken: tokenInfo.hasAppAccessToken,
        authenticated: api.isAuthenticated(),
        currentTokenType,
        message: hasUserTokens
          ? 'Using user access token with automatic refresh'
          : 'Using app access token from client credentials flow (lower rate limits). Consider setting user tokens for higher rate limits.',
      };
    },
  }),
  defineTool({
    name: 'ebay_clear_tokens',
    description:
      'Clear all stored OAuth tokens (both user tokens and client credentials). This will require re-authentication for subsequent API calls.',
    inputSchema: clearTokensInputSchema.shape,
    handler: (api) => {
      const authClient = api.getAuthClient().getOAuthClient();
      authClient.clearAllTokens();

      return {
        success: true,
        message:
          'All tokens cleared successfully. You will need to re-authenticate for subsequent API calls.',
      };
    },
  }),
  defineTool({
    name: 'ebay_validate_token_expiry',
    description:
      'Validate token expiry times and get recommendations. Checks if access/refresh tokens are expired or expiring soon, and provides actionable recommendations (e.g., refresh access token, re-authorize user).',
    inputSchema: validateTokenExpiryInputSchema.shape,
    handler: (_api, args) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const accessExpiry = yield* convertToTimestamp(args.accessTokenExpiry).pipe(
            Effect.mapError((error) =>
              tokenToolError('validateTokenExpiry', 'Failed to validate token expiry', error),
            ),
          );
          const refreshExpiry = yield* convertToTimestamp(args.refreshTokenExpiry).pipe(
            Effect.mapError((error) =>
              tokenToolError('validateTokenExpiry', 'Failed to validate token expiry', error),
            ),
          );
          const validation = validateTokenExpiry(accessExpiry, refreshExpiry);

          return {
            ...validation,
            accessTokenExpiryTimestamp: accessExpiry,
            refreshTokenExpiryTimestamp: refreshExpiry,
            accessTokenExpiryDate: new Date(accessExpiry).toISOString(),
            refreshTokenExpiryDate: new Date(refreshExpiry).toISOString(),
          };
        }),
      ),
  }),
  defineTool({
    name: 'ebay_convert_date_to_timestamp',
    description:
      'Convert a date string or number to Unix timestamp (milliseconds). Supports ISO 8601 dates, Unix timestamps (seconds or milliseconds), and relative time (e.g., "in 2 hours", "in 7200 seconds"). Useful when setting token expiry times from user input.',
    inputSchema: convertDateToTimestampInputSchema.shape,
    handler: (_api, args) => {
      const { dateInput } = args;

      return Effect.runPromise(
        Effect.gen(function* () {
          const timestamp = yield* convertToTimestamp(dateInput).pipe(
            Effect.mapError((error) =>
              tokenToolError('convertDateToTimestamp', 'Failed to convert date', error),
            ),
          );

          return {
            success: true,
            timestamp,
            input: dateInput,
            formattedDate: new Date(timestamp).toISOString(),
            message: `Successfully converted to timestamp: ${timestamp}ms (${new Date(timestamp).toISOString()})`,
          };
        }),
      );
    },
  }),
  defineTool({
    name: 'ebay_display_credentials',
    description:
      'Display all eBay API credentials and current token information. Shows client ID, client secret (masked), environment (production/sandbox), redirect URI, and current token status including access token (masked), refresh token (masked), app token (masked), and their expiry times. Useful for debugging authentication issues and verifying configuration.',
    inputSchema: displayCredentialsInputSchema.shape,
    handler: (api) => {
      const tokenInfo = api.getTokenInfo();
      const authClient = api.getAuthClient().getOAuthClient();

      return buildCredentialDisplay({
        appAccessToken: authClient.getCachedAppAccessToken(),
        appAccessTokenExpiry: authClient.getCachedAppAccessTokenExpiry(),
        authenticated: api.isAuthenticated(),
        config: api.getConfig(),
        tokenInfo,
        userTokens: authClient.getUserTokens(),
      });
    },
  }),
  defineTool({
    name: 'ebay_refresh_access_token',
    description:
      'Manually refresh the user access token using the stored refresh token. This is useful when you want to proactively refresh an access token before it expires, or when recovering from authentication errors. Requires that user tokens are already set (either via EBAY_USER_REFRESH_TOKEN in .env or via ebay_set_user_tokens_with_expiry). Returns the new access token and expiry time.',
    inputSchema: refreshAccessTokenInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    },
    handler: (api) => {
      const authClient = api.getAuthClient().getOAuthClient();

      return Effect.runPromise(
        Effect.gen(function* () {
          if (!api.hasUserTokens()) {
            return yield* Effect.fail(missingUserTokensError);
          }

          yield* authClient
            .refreshUserToken()
            .pipe(
              Effect.mapError((error) =>
                tokenToolError('refreshAccessToken', 'Failed to refresh access token', error),
              ),
            );

          return yield* Effect.sync(() => {
            const internalTokens = authClient.getUserTokens();

            return {
              success: true,
              message: 'Access token refreshed successfully',
              accessToken: internalTokens?.userAccessToken
                ? maskToken(internalTokens.userAccessToken)
                : null,
              accessTokenExpiry: internalTokens?.userAccessTokenExpiry
                ? {
                    timestamp: internalTokens.userAccessTokenExpiry,
                    date: new Date(internalTokens.userAccessTokenExpiry).toISOString(),
                    expiresInSeconds: Math.floor(
                      (internalTokens.userAccessTokenExpiry - Date.now()) / 1000,
                    ),
                  }
                : null,
              tokenInfo: api.getTokenInfo(),
            };
          });
        }),
      );
    },
  }),
  defineTool({
    name: 'ebay_exchange_authorization_code',
    description:
      'Exchange an OAuth authorization code for access and refresh tokens. This completes the OAuth 2.0 Authorization Code grant flow. After the user authorizes the application using the URL from ebay_get_oauth_url, eBay redirects back with an authorization code in the URL. Use this tool to exchange that code for tokens that can be used to make API calls. The tokens will be automatically stored and used for subsequent API requests.\n\n' +
      'IMPORTANT NOTES:\n' +
      '- Authorization codes expire in ~5 minutes - if you get "invalid grant" error, get a fresh code\n' +
      '- Codes can be URL-encoded (e.g., v%5E1.1%23...) - this tool automatically decodes them\n' +
      '- Extract the code parameter from the redirect URL (your RuName Accept URL): https://your-redirect-uri?code=YOUR_CODE&expires_in=299\n' +
      '- Tokens are saved to .env file and will auto-refresh every 2 hours\n' +
      '- Refresh tokens last 18 months before requiring re-authorization\n\n' +
      'COMMON ERRORS:\n' +
      '- "invalid or was issued to another client": Code expired, get fresh code\n' +
      '- "Insufficient permissions": Re-run OAuth flow with additional scopes in ebay_get_oauth_url\n\n' +
      'For scopes and rate limits, see the "Authentication & rate limits" section of the ebay-mcp README.',
    inputSchema: exchangeAuthorizationCodeInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description:
        'Token exchange response including access token, refresh token, and expiry times',
    },
    handler: (api, args) => {
      const { code } = args;

      return Effect.runPromise(
        Effect.gen(function* () {
          // Codes arriving from a redirect URL may be percent-encoded.
          const decodedCode = yield* Effect.try({
            try: () => (code.includes('%') ? decodeURIComponent(code) : code),
            catch: (error) =>
              tokenToolError(
                'exchangeAuthorizationCode',
                'Failed to exchange authorization code',
                error,
              ),
          });

          const authClient = api.getAuthClient().getOAuthClient();
          const tokenData = yield* authClient
            .exchangeCodeForToken(decodedCode)
            .pipe(
              Effect.mapError((error) =>
                tokenToolError(
                  'exchangeAuthorizationCode',
                  'Failed to exchange authorization code',
                  error,
                ),
              ),
            );

          return {
            success: true,
            message:
              'Authorization code successfully exchanged for tokens. Tokens have been stored and will be used for subsequent API requests.',
            tokenData: {
              accessToken: maskToken(tokenData.access_token),
              refreshToken: maskToken(tokenData.refresh_token),
              expiresIn: tokenData.expires_in,
              refreshTokenExpiresIn: tokenData.refresh_token_expires_in,
              tokenType: tokenData.token_type,
              scope: tokenData.scope,
            },
            note: 'The refresh token has been saved to your .env file for future use.',
          };
        }),
      );
    },
  }),
];
