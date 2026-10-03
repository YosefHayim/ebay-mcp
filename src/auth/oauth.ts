import {
  createAppAccessTokenExpiry,
  createStoredUserTokens,
  createStoredUserTokensFromResponse,
  CredentialStoreError,
  DotEnvCredentialStore,
  isTokenExpired,
  type CredentialStore,
  type EbayUserTokenResponse,
} from '@/auth/credentialSession.js';
import { getBaseUrl, getDefaultScopes } from '@/config/environment.js';
import type {
  EbayAppAccessTokenResponse,
  EbayConfig,
  EbayUserToken,
  StoredTokenData,
} from '@/types/ebay.js';
import { LocaleEnum } from '@/types/ebayEnums.js';
import { getErrorMessage } from '@/utils/errors.js';
import { describeHttpError, httpRequestEffect, type HttpRequestOptions } from '@/utils/http.js';
import { authLogger } from '@/utils/logger.js';
import { Data, Effect, Either } from 'effect';

/** OAuth operation names reported by {@link EbayOAuthError}. */
type OAuthOperation =
  | 'initialize'
  | 'getAccessToken'
  | 'getOrRefreshAppAccessToken'
  | 'exchangeCodeForToken'
  | 'refreshUserToken'
  | 'setUserTokens';

/** Tagged failure returned by migrated OAuth token Effects. */
export class EbayOAuthError extends Data.TaggedError('EbayOAuthError')<{
  /** OAuth client operation that failed. */
  readonly operation: OAuthOperation;
  /** Human-readable failure message safe to return at protocol boundaries. */
  readonly message: string;
  /** Lower-level transport, parsing, storage, or validation cause. */
  readonly cause?: unknown;
}> {}

/** Scope comparison returned by OAuth token status diagnostics. */
export interface OAuthTokenScopeInfo {
  /** Scopes carried by the current user token. */
  readonly tokenScopes: string[];
  /** Scopes expected for the configured eBay environment. */
  readonly environmentScopes: string[];
  /** Expected scopes missing from the current user token. */
  readonly missingScopes: string[];
}

/** Current in-memory OAuth token state used by status and diagnostic tools. */
export interface OAuthTokenInfo {
  /** Whether a non-expired user token is available. */
  readonly hasUserToken: boolean;
  /** Whether a non-expired app access token is available. */
  readonly hasAppAccessToken: boolean;
  /** Scope comparison details when a user token exposes its granted scopes. */
  readonly scopeInfo?: OAuthTokenScopeInfo;
}

const mapCredentialStoreError = (
  operation: OAuthOperation,
  message: string,
  cause: CredentialStoreError,
): EbayOAuthError =>
  new EbayOAuthError({
    operation,
    message: `${message}: ${cause.message}`,
    cause,
  });

const isCredentialPersistenceError = (error: EbayOAuthError): boolean =>
  error.cause instanceof CredentialStoreError;

/**
 * Manages eBay OAuth 2.0 authentication
 * Loads tokens exclusively from validated runtime config
 * Supports both client credentials (app tokens) and user access tokens with refresh
 */
export class EbayOAuthClient {
  private appAccessToken: string | null = null;
  private appAccessTokenExpiry = 0;
  private userTokens: StoredTokenData | null = null;

  constructor(
    private config: EbayConfig,
    private credentialStore: CredentialStore = new DotEnvCredentialStore(),
  ) {}

  /**
   * Execute an OAuth token endpoint request and map HTTP failures once.
   */
  private requestOAuthToken<T>(
    operation: OAuthOperation,
    failureMessage: string,
    options: HttpRequestOptions,
  ): Effect.Effect<T, EbayOAuthError> {
    return httpRequestEffect<T>(options).pipe(
      Effect.map((response) => response.data),
      Effect.mapError(
        (cause) =>
          new EbayOAuthError({
            operation,
            message: `${failureMessage}: ${describeHttpError(cause)}`,
            cause,
          }),
      ),
    );
  }

  /**
   * Initialize user tokens from validated runtime config.
   *
   * @returns An Effect that completes after loading and refreshing configured tokens.
   *
   * @example
   * ```ts
   * await Effect.runPromise(oauthClient.initialize());
   * ```
   */
  initialize = (): Effect.Effect<void> =>
    Effect.gen(this, function* () {
      const configRefreshToken = this.config.refreshToken;
      const configAccessToken = this.config.accessToken ?? '';
      const configAppToken = this.config.appAccessToken ?? '';
      const locale = this.config?.locale || LocaleEnum.en_US;

      if (configRefreshToken) {
        authLogger.info('Loading tokens from runtime config');

        this.userTokens = createStoredUserTokens({
          config: { ...this.config, locale },
          envAppToken: configAppToken,
          accessToken: configAccessToken,
          refreshToken: configRefreshToken,
        });

        // Immediately refresh to get a valid access token and scopes
        authLogger.info('Refreshing access token using refresh token from .env');
        const refreshed = yield* Effect.either(
          Effect.gen(this, function* () {
            yield* this.refreshUserToken();
            authLogger.info('Access token refreshed successfully');

            yield* this.getOrRefreshAppAccessToken();
          }),
        );

        if (Either.isLeft(refreshed)) {
          const error = refreshed.left;
          if (isCredentialPersistenceError(error)) {
            authLogger.error('Access token refreshed but could not be persisted', {
              error: getErrorMessage(error, String(error)),
              hint: 'The refreshed token remains available for this process, but the credential file must be writable to survive a restart',
            });
          } else {
            authLogger.error('Failed to refresh access token', {
              error: getErrorMessage(error, String(error)),
              hint: 'The configured EBAY_USER_REFRESH_TOKEN may be invalid or expired',
            });
            // Clear tokens only when the refresh itself failed.
            this.userTokens = null;
          }
        }
      }
    });

  /**
   * Check if user tokens are available.
   *
   * @returns True when user tokens are currently loaded in memory.
   *
   * @example
   * ```ts
   * const hasTokens = oauthClient.hasUserTokens();
   * ```
   */
  hasUserTokens(): boolean {
    return this.userTokens !== null;
  }

  /**
   * Check if user access token is expired
   */
  private isUserAccessTokenExpired(tokens: StoredTokenData): boolean {
    return isTokenExpired(tokens.userAccessTokenExpiry);
  }

  /**
   * Check if user refresh token is expired
   */
  private isUserRefreshTokenExpired(tokens: StoredTokenData): boolean {
    return isTokenExpired(tokens.userRefreshTokenExpiry);
  }

  /**
   * Get a valid access token, with priority order:
   * 1. User access token (if available and valid, or refreshable)
   * 2. App access token from client credentials (fallback)
   *
   * @returns An Effect that succeeds with the token used for eBay API requests.
   *
   * @example
   * ```ts
   * const token = await Effect.runPromise(oauthClient.getAccessToken());
   * ```
   */
  getAccessToken = (): Effect.Effect<string, EbayOAuthError> =>
    Effect.gen(this, function* () {
      // Try to use user token first
      if (this.userTokens) {
        // Check if access token is still valid
        if (!this.isUserAccessTokenExpired(this.userTokens)) {
          return this.userTokens.userAccessToken;
        }

        // Try to refresh if refresh token is valid
        if (this.isUserRefreshTokenExpired(this.userTokens)) {
          // Refresh token expired
          authLogger.error('User refresh token expired. User needs to re-authorize.');
          this.userTokens = null;
          return yield* Effect.fail(
            new EbayOAuthError({
              operation: 'getAccessToken',
              message:
                'User authorization expired. Please update EBAY_USER_REFRESH_TOKEN in .env with a new refresh token.',
            }),
          );
        }
        const refreshed = yield* Effect.either(this.refreshUserToken());

        if (Either.isLeft(refreshed)) {
          if (
            isCredentialPersistenceError(refreshed.left) &&
            this.userTokens &&
            !this.isUserAccessTokenExpired(this.userTokens)
          ) {
            authLogger.error('User token refreshed but could not be persisted', {
              error: getErrorMessage(refreshed.left, String(refreshed.left)),
              hint: 'Using the valid refreshed token for this process only',
            });
            return this.userTokens.userAccessToken;
          }

          authLogger.error('Failed to refresh user token, falling back to app access token', {
            error: getErrorMessage(refreshed.left, String(refreshed.left)),
          });
          // Clear tokens only when no valid refreshed access token remains.
          this.userTokens = null;
        } else if (this.userTokens) {
          return this.userTokens.userAccessToken;
        }
      }

      // Fallback to app access token (client credentials)
      if (this.appAccessToken && !isTokenExpired(this.appAccessTokenExpiry)) {
        return this.appAccessToken;
      }

      return yield* this.getOrRefreshAppAccessToken();
    });

  /**
   * Set user access token and refresh token.
   *
   * Stores tokens in memory and updates `.env` for persistence.
   *
   * @param accessToken - User access token returned by eBay OAuth.
   * @param refreshToken - User refresh token returned by eBay OAuth.
   * @param accessTokenExpiry - Optional access-token expiry timestamp in milliseconds.
   * @param refreshTokenExpiry - Optional refresh-token expiry timestamp in milliseconds.
   * @returns An Effect that completes after the tokens are stored and persisted.
   *
   * @example
   * ```ts
   * await Effect.runPromise(oauthClient.setUserTokens(accessToken, refreshToken));
   * ```
   */
  setUserTokens = (
    accessToken: string,
    refreshToken: string,
    accessTokenExpiry?: number,
    refreshTokenExpiry?: number,
  ): Effect.Effect<void, EbayOAuthError> =>
    Effect.gen(this, function* () {
      this.userTokens = createStoredUserTokens({
        config: this.config,
        accessToken,
        refreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
      });

      yield* this.credentialStore
        .write({
          EBAY_USER_ACCESS_TOKEN: accessToken,
          EBAY_USER_REFRESH_TOKEN: refreshToken,
        })
        .pipe(
          Effect.mapError((cause) =>
            mapCredentialStoreError('setUserTokens', 'Failed to persist user tokens', cause),
          ),
        );
    });

  /**
   * Get or refresh the app access token using the client credentials flow.
   * This method ensures that a valid app access token is always available.
   * Rate limit: 1,000 requests/day
   *
   * @returns An Effect that succeeds with a cached or newly minted app access token.
   *
   * @example
   * ```ts
   * const appToken = await Effect.runPromise(oauthClient.getOrRefreshAppAccessToken());
   * ```
   */
  getOrRefreshAppAccessToken = (): Effect.Effect<string, EbayOAuthError> =>
    Effect.gen(this, function* () {
      // Return cached token if still valid
      if (this.appAccessToken && !isTokenExpired(this.appAccessTokenExpiry)) {
        return this.appAccessToken;
      }

      const authUrl = `${getBaseUrl(this.config.environment, this.config.apiBaseUrl)}/identity/v1/oauth2/token`;
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      // Client credentials flow only supports basic scope
      // User authorization flows can request additional scopes
      const scopeParam = 'https://api.ebay.com/oauth/api_scope';

      const tokenData = yield* this.requestOAuthToken<EbayAppAccessTokenResponse>(
        'getOrRefreshAppAccessToken',
        'Failed to get app access token',
        {
          method: 'POST',
          url: authUrl,
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            scope: scopeParam,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      this.appAccessToken = tokenData.access_token;
      this.appAccessTokenExpiry = createAppAccessTokenExpiry(tokenData.expires_in);

      // Update .env file with app access token
      yield* this.credentialStore
        .write({
          EBAY_APP_ACCESS_TOKEN: this.appAccessToken ?? '',
        })
        .pipe(
          Effect.mapError((cause) =>
            mapCredentialStoreError(
              'getOrRefreshAppAccessToken',
              'Failed to persist app access token',
              cause,
            ),
          ),
        );

      this.config = {
        ...this.config,
        appAccessToken: this.appAccessToken,
      };

      return this.appAccessToken;
    });

  /**
   * Exchange authorization code for user access token.
   *
   * Persists received tokens to `.env` automatically.
   *
   * @param code - Authorization code received from eBay's OAuth redirect.
   * @returns An Effect that succeeds with eBay's user token response.
   *
   * @example
   * ```ts
   * const token = await Effect.runPromise(oauthClient.exchangeCodeForToken(code));
   * ```
   */
  exchangeCodeForToken = (code: string): Effect.Effect<EbayUserToken, EbayOAuthError> =>
    Effect.gen(this, function* () {
      if (!this.config.redirectUri) {
        return yield* Effect.fail(
          new EbayOAuthError({
            operation: 'exchangeCodeForToken',
            message: 'Redirect URI is required for authorization code exchange',
          }),
        );
      }

      const tokenUrl = `${getBaseUrl(this.config.environment, this.config.apiBaseUrl)}/identity/v1/oauth2/token`;
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      const tokenData = yield* this.requestOAuthToken<EbayUserToken>(
        'exchangeCodeForToken',
        'Failed to exchange code for token',
        {
          method: 'POST',
          url: tokenUrl,
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.config.redirectUri,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      // Authorization-code exchange must return a refresh token; without it we
      // cannot persist durable user credentials and must not claim success.
      const refreshToken = tokenData.refresh_token;
      if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
        return yield* Effect.fail(
          new EbayOAuthError({
            operation: 'exchangeCodeForToken',
            message:
              'eBay token response did not include a non-empty refresh_token; cannot complete authorization code exchange',
          }),
        );
      }

      this.userTokens = createStoredUserTokensFromResponse({
        config: this.config,
        tokenData,
      });

      // Persist tokens to .env so they survive process restarts.
      yield* this.credentialStore
        .write({
          EBAY_USER_ACCESS_TOKEN: tokenData.access_token,
          EBAY_USER_REFRESH_TOKEN: refreshToken,
        })
        .pipe(
          Effect.mapError((cause) =>
            mapCredentialStoreError(
              'exchangeCodeForToken',
              'Failed to persist exchanged user tokens',
              cause,
            ),
          ),
        );
      this.config = {
        ...this.config,
        accessToken: tokenData.access_token,
        refreshToken: refreshToken,
      };

      return tokenData;
    });

  /**
   * Refresh user access token using the stored refresh token.
   *
   * This method is public so tools can recover from authentication errors.
   *
   * @returns An Effect that completes after the user token is refreshed and persisted.
   *
   * @example
   * ```ts
   * await Effect.runPromise(oauthClient.refreshUserToken());
   * ```
   */
  refreshUserToken = (): Effect.Effect<void, EbayOAuthError> =>
    Effect.gen(this, function* () {
      if (!this.userTokens) {
        return yield* Effect.fail(
          new EbayOAuthError({
            operation: 'refreshUserToken',
            message: 'No user tokens available to refresh',
          }),
        );
      }

      // Use the token endpoint, not the authorization endpoint
      const authUrl = `${getBaseUrl(this.config.environment, this.config.apiBaseUrl)}/identity/v1/oauth2/token`;
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      // Prepare refresh token request parameters
      // Note: We do NOT include scopes in refresh requests as eBay will return
      // the scopes that were originally granted to the refresh token
      const params: Record<string, string> = {
        grant_type: 'refresh_token',
        refresh_token: this.userTokens.userRefreshToken,
      };

      const tokenData = yield* this.requestOAuthToken<EbayUserTokenResponse>(
        'refreshUserToken',
        'Failed to refresh token',
        {
          method: 'POST',
          url: authUrl,
          body: new URLSearchParams(params),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        },
      );

      this.userTokens = createStoredUserTokensFromResponse({
        config: this.config,
        previousTokens: this.userTokens,
        tokenData,
      });

      // Update .env file with new tokens
      const envUpdates: Record<string, string> = {
        EBAY_USER_ACCESS_TOKEN: tokenData.access_token,
      };

      // Reconcile persisted config with the authoritative in-memory refresh token.
      if (this.userTokens.userRefreshToken !== this.config.refreshToken) {
        envUpdates.EBAY_USER_REFRESH_TOKEN = this.userTokens.userRefreshToken;
      }

      // Write updates to .env file
      yield* this.credentialStore
        .write(envUpdates)
        .pipe(
          Effect.mapError((cause) =>
            mapCredentialStoreError(
              'refreshUserToken',
              'Failed to persist refreshed user token',
              cause,
            ),
          ),
        );
      this.config = {
        ...this.config,
        accessToken: tokenData.access_token,
        refreshToken: this.userTokens.userRefreshToken,
      };
    });

  /**
   * Check if currently authenticated with user or app credentials.
   *
   * @returns True when a non-expired user token or app token is available.
   *
   * @example
   * ```ts
   * const authenticated = oauthClient.isAuthenticated();
   * ```
   */
  isAuthenticated(): boolean {
    if (this.userTokens && !this.isUserAccessTokenExpired(this.userTokens)) {
      return true;
    }
    return this.appAccessToken !== null && !isTokenExpired(this.appAccessTokenExpiry);
  }

  /**
   * Clear all authentication tokens from memory.
   *
   * To persist this change, remove `EBAY_USER_REFRESH_TOKEN` from `.env`.
   *
   * @returns Nothing; the in-memory token cache is cleared synchronously.
   *
   * @example
   * ```ts
   * oauthClient.clearAllTokens();
   * ```
   */
  clearAllTokens(): void {
    this.appAccessToken = null;
    this.appAccessTokenExpiry = 0;
    this.userTokens = null;
  }

  /**
   * Get current token info for debugging and status tools.
   *
   * @returns Token availability and scope comparison details.
   *
   * @example
   * ```ts
   * const tokenInfo = oauthClient.getTokenInfo();
   * ```
   */
  getTokenInfo(): OAuthTokenInfo {
    const tokenInfo: OAuthTokenInfo = {
      hasUserToken: this.userTokens !== null && !this.isUserAccessTokenExpired(this.userTokens),
      hasAppAccessToken: this.appAccessToken !== null && Date.now() < this.appAccessTokenExpiry,
    };

    // Add scope comparison info if user tokens are available
    if (this.userTokens?.scope) {
      const tokenScopes = this.userTokens.scope.split(' ');
      const environmentScopes = getDefaultScopes(this.config.environment);
      const tokenScopeSet = new Set(tokenScopes);
      const missingScopes = environmentScopes.filter((scope) => !tokenScopeSet.has(scope));

      return {
        ...tokenInfo,
        scopeInfo: {
          tokenScopes,
          environmentScopes,
          missingScopes,
        },
      };
    }

    return tokenInfo;
  }

  /**
   * Get internal user tokens for debugging and status tools.
   *
   * @returns The loaded user token data, or null when no user token is available.
   *
   * @example
   * ```ts
   * const tokens = oauthClient.getUserTokens();
   * ```
   *
   * @internal
   */
  getUserTokens(): StoredTokenData | null {
    return this.userTokens;
  }

  /**
   * Get internal app access token cached value for debugging and status tools.
   *
   * @returns The cached app access token, or null when no token is cached.
   *
   * @example
   * ```ts
   * const appToken = oauthClient.getCachedAppAccessToken();
   * ```
   *
   * @internal
   */
  getCachedAppAccessToken(): string | null {
    return this.appAccessToken;
  }

  /**
   * Get internal app access token expiry for debugging and status tools.
   *
   * @returns The cached app access token expiry timestamp in milliseconds.
   *
   * @example
   * ```ts
   * const expiresAt = oauthClient.getCachedAppAccessTokenExpiry();
   * ```
   *
   * @internal
   */
  getCachedAppAccessTokenExpiry(): number {
    return this.appAccessTokenExpiry;
  }
}
