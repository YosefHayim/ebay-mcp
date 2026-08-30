import { EbayOAuthClient, type EbayOAuthError } from '@/auth/oauth.js';
import { clientRequestError, type EbayClientRequestError } from '@/api/clientRequestError.js';
import { RateLimitTracker } from '@/api/rateLimitTracker.js';
import { getBaseUrl } from '@/config/environment.js';
import type { EbayConfig } from '@/types/ebay.js';
import { getErrorMessage } from '@/utils/errors.js';
import { httpRequestEffect, isHttpError, type ResponseType } from '@/utils/http.js';
import { isRecord } from '@/utils/typeGuards.js';
import { apiLogger, logRequest, logResponse, logErrorResponse } from '@/utils/logger.js';
import { Cause, Effect, Exit } from 'effect';

/**
 * Which eBay OAuth token a request authenticates with.
 *
 * `'application'` forces the client-credentials application token. Omitting
 * the token type keeps the default path, which prefers a configured user token
 * and falls back to the application token.
 */
export type EbayTokenType = 'application';

/**
 * Per-request overrides accepted by the verb helpers ({@link EbayApiClient.get}
 * et al). `headers` are merged over the client defaults (the auth header is
 * always applied last and cannot be overridden); `params` are appended to the
 * query string — useful for POSTs that also take query parameters.
 */
export interface EbayRequestConfig {
  /** Headers merged over the client defaults before auth is applied. */
  headers?: Record<string, string>;
  /** Query parameters appended to the request URL. */
  params?: Record<string, unknown>;
  /** Successful response decoder for non-JSON endpoints such as binary evidence files. */
  responseType?: ResponseType;
  /**
   * Token the request must authenticate with. Omit for the default
   * user-first token, or pass `'application'` for endpoints eBay documents as
   * requiring a client-credentials application token (the Buy APIs).
   */
  tokenType?: EbayTokenType;
}

/** Normalized request options used by the client transport Effect. */
interface EbayRequestOptions {
  /** Query-string parameters appended to the request URL. */
  readonly params?: Record<string, unknown>;
  /** JSON/XML/form body passed to the HTTP adapter. */
  readonly data?: unknown;
  /** Headers merged over the client defaults before auth is applied. */
  readonly headers?: Record<string, string>;
  /** Successful response decoder for non-JSON endpoints. */
  readonly responseType?: ResponseType;
  /** Whether `endpoint` was already an absolute URL. */
  readonly absolute?: boolean;
  /** Token the request must authenticate with; omit for the default path. */
  readonly tokenType?: EbayTokenType;
}

/** Retry counters carried between recursive request attempts. */
interface RequestRetryState {
  /** Whether a 401 already triggered the one allowed token-refresh retry. */
  readonly authRetried: boolean;
  /** Number of server-error backoff retries already attempted. */
  readonly serverRetries: number;
}

/** Context required to turn an HTTP failure into a retry or final error. */
interface RequestFailureContext {
  /** HTTP method used for this request. */
  readonly method: string;
  /** Fully qualified request URL. */
  readonly url: string;
  /** Normalized request options for a retry. */
  readonly options: EbayRequestOptions;
  /** Retry counters for this attempt. */
  readonly state: RequestRetryState;
}

/**
 * Remediation hint for a token failure, matched to the token the request needs.
 *
 * Setting user tokens cannot repair rejected client credentials, so an
 * application request has to point at the credentials instead.
 */
const tokenFailureRemediation = (tokenType: EbayTokenType | undefined): string =>
  tokenType === 'application'
    ? 'This endpoint requires an application access token minted from client credentials, which a user token cannot supply. Check EBAY_CLIENT_ID and EBAY_CLIENT_SECRET.'
    : 'Please use the ebay_set_user_tokens_with_expiry tool to provide valid tokens.';

/** Sleep for a retry backoff delay without exposing timers to callers. */
const sleep = (delayMs: number): Effect.Effect<void> =>
  Effect.promise(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      }),
  );

/**
 * Base client for making eBay API requests.
 *
 * Wraps the native-`fetch` helper ({@link httpRequest}) with eBay-specific
 * concerns the old axios interceptors used to handle: per-request auth-token
 * injection, a sliding-window rate-limit guard, request/response logging, and
 * retry/refresh handling for 401 (refresh once), 429, and 5xx (exponential
 * backoff) responses.
 */
export class EbayApiClient {
  private readonly authClient: EbayOAuthClient;
  private readonly baseUrl: string;
  private readonly rateLimitTracker: RateLimitTracker;
  private readonly config: EbayConfig;
  private readonly timeoutMs = 30_000;

  /**
   * Build default request headers based on configured marketplace and language.
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.config.contentLanguage) {
      headers['Content-Language'] = this.config.contentLanguage;
      // undici defaults Accept-Language to `*`, which eBay Inventory rejects (error 25709).
      headers['Accept-Language'] = this.config.contentLanguage;
    }

    if (this.config.marketplaceId) {
      headers['X-EBAY-C-MARKETPLACE-ID'] = this.config.marketplaceId;
    }

    return headers;
  }

  constructor(config: EbayConfig) {
    this.config = config;
    this.authClient = new EbayOAuthClient(config);
    this.baseUrl = getBaseUrl(config.environment, config.apiBaseUrl);
    this.rateLimitTracker = new RateLimitTracker();
  }

  /**
   * Acquire the access token a request should authenticate with.
   *
   * Both token-acquisition sites (the initial attempt and the 401 retry) route
   * through here, so an `'application'` request cannot silently downgrade to
   * the user token on a retry.
   */
  private acquireAccessToken(
    tokenType: EbayTokenType | undefined,
  ): Effect.Effect<string, EbayOAuthError> {
    return tokenType === 'application'
      ? this.authClient.getOrRefreshAppAccessToken()
      : this.authClient.getAccessToken();
  }

  /**
   * Return the credential validation error that would block an authenticated request.
   */
  private accessTokenValidationError(
    method: string,
    url: string,
  ): EbayClientRequestError | undefined {
    if (!(this.config.clientId && this.config.clientSecret)) {
      return clientRequestError({
        kind: 'missingCredentials',
        method,
        url,
        message:
          'Missing required eBay credentials. Please set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in your .env file.',
      });
    }
  }

  /**
   * Pull the most descriptive eBay error string from a response body when present.
   * eBay REST errors arrive as `{ errors: [{ message, longMessage }] }`.
   */
  private ebayErrorDetail(data: unknown): string | undefined {
    if (isRecord(data) && Array.isArray(data.errors)) {
      const [firstError] = data.errors;
      if (isRecord(firstError)) {
        const detail = firstError.longMessage ?? firstError.message;
        if (typeof detail === 'string') {
          return detail;
        }
      }
    }
  }

  /**
   * Serialize the full error response body so structured fields (errorId, parameters)
   * survive into the thrown message for diagnostics.
   */
  private ebayErrorBody(data: unknown): string {
    if (data == null) return '';
    try {
      return ` | response: ${JSON.stringify(data)}`;
    } catch {
      return '';
    }
  }

  /**
   * Core request boundary shared by every verb.
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options: EbayRequestOptions,
  ): Promise<T> {
    // Preserve the typed request error for endpoint adapters. Plain runPromise
    // rejects with a FiberFailure whose generic message hides eBay response data.
    const exit = await Effect.runPromiseExit(this.requestEffect<T>(method, endpoint, options));
    if (Exit.isSuccess(exit)) {
      return exit.value;
    }
    throw Cause.squash(exit.cause);
  }

  /**
   * Build the request Effect that owns auth, logging, retry, and transport errors.
   */
  private requestEffect<T>(
    method: string,
    endpoint: string,
    options: EbayRequestOptions,
  ): Effect.Effect<T, EbayClientRequestError> {
    const url = options.absolute ? endpoint : `${this.baseUrl}${endpoint}`;
    return this.sendWithRetry<T>(method, url, options, {
      authRetried: false,
      serverRetries: 0,
    });
  }

  /**
   * Execute one request attempt, recursively re-entering for bounded retries.
   */
  private sendWithRetry<T>(
    method: string,
    url: string,
    options: EbayRequestOptions,
    state: RequestRetryState,
  ): Effect.Effect<T, EbayClientRequestError> {
    return Effect.gen(this, function* () {
      // In proxy auth mode the upstream proxy supplies credentials, so the server
      // neither requires nor validates its own. See EBAY_MCP_DISABLE_AUTH_HEADER.
      if (!this.config.disableAuthHeader) {
        const validationError = this.accessTokenValidationError(method, url);
        if (validationError) {
          return yield* Effect.fail(validationError);
        }
      }

      if (!this.rateLimitTracker.canMakeRequest()) {
        const stats = this.rateLimitTracker.getStats();
        return yield* Effect.fail(
          clientRequestError({
            kind: 'localRateLimit',
            method,
            url,
            message: `Rate limit exceeded: ${stats.current}/${stats.max} requests in ${stats.windowMs}ms window. Please wait before making more requests.`,
          }),
        );
      }

      const headers: Record<string, string> = {
        ...this.getDefaultHeaders(),
        ...options.headers,
      };

      // Proxy auth mode: attach no Authorization header and acquire no token —
      // the upstream proxy injects whatever credentials eBay requires.
      if (!this.config.disableAuthHeader) {
        const token = yield* this.acquireAccessToken(options.tokenType).pipe(
          Effect.mapError((cause) =>
            clientRequestError({
              kind: 'tokenAcquisition',
              method,
              url,
              message: `Failed to get access token: ${getErrorMessage(cause)}`,
              cause,
            }),
          ),
        );
        if (!token) {
          return yield* Effect.fail(
            clientRequestError({
              kind: 'missingAccessToken',
              method,
              url,
              message:
                'Access token is missing. Provide EBAY_USER_REFRESH_TOKEN or valid app credentials, then retry.',
            }),
          );
        }
        headers.Authorization = `Bearer ${token}`;
      }

      this.rateLimitTracker.recordRequest();
      logRequest(method, url, options.params, options.data);

      return yield* httpRequestEffect<T>({
        method,
        url,
        params: options.params,
        headers,
        body: options.data,
        timeoutMs: this.timeoutMs,
        responseType: options.responseType,
      }).pipe(
        Effect.map((response) => {
          logResponse(
            response.status,
            response.statusText,
            response.data,
            response.headers['x-ebay-c-ratelimit-remaining'],
            response.headers['x-ebay-c-ratelimit-limit'],
          );

          return response.data;
        }),
        Effect.catchAll((error) =>
          this.handleRequestFailure<T>(error, { method, url, options, state }),
        ),
      );
    });
  }

  /**
   * Convert an HTTP failure into a bounded retry or final request error.
   */
  private handleRequestFailure<T>(
    error: unknown,
    context: RequestFailureContext,
  ): Effect.Effect<T, EbayClientRequestError> {
    const { method, url, options, state } = context;

    if (!isHttpError(error)) {
      return Effect.fail(
        clientRequestError({
          kind: 'transport',
          method,
          url,
          message: getErrorMessage(error),
          cause: error,
        }),
      );
    }

    if (error.status == null) {
      apiLogger.error('No response received from server', { url });
    } else {
      logErrorResponse(error.status, error.statusText, url, error.data);
    }

    // 401 — refresh the token once, then retry the request. Skipped in proxy
    // auth mode: the server holds no token to refresh, so a 401 (the proxy's
    // own auth failing) is surfaced directly rather than retried.
    if (error.status === 401 && !this.config.disableAuthHeader) {
      if (!state.authRetried) {
        apiLogger.warn('Authentication error (401). Attempting to refresh the access token...');

        return this.acquireAccessToken(options.tokenType).pipe(
          Effect.catchAll((refreshError) => {
            const reason = getErrorMessage(refreshError);
            apiLogger.error('Failed to refresh token', { error: reason });

            const detail = this.ebayErrorDetail(error.data) ?? 'Invalid access token';
            return Effect.fail(
              clientRequestError({
                kind: 'tokenRefresh',
                method,
                url,
                status: error.status,
                message:
                  `${detail}. Token refresh failed: ${reason}. ` +
                  tokenFailureRemediation(options.tokenType),
                cause: refreshError,
              }),
            );
          }),
          Effect.flatMap(() => {
            apiLogger.info('Token refreshed successfully. Retrying request...');
            return this.sendWithRetry<T>(method, url, options, {
              ...state,
              authRetried: true,
            });
          }),
        );
      }

      const detail = this.ebayErrorDetail(error.data) ?? 'Invalid access token';
      return Effect.fail(
        clientRequestError({
          kind: 'tokenRefresh',
          method,
          url,
          status: error.status,
          message:
            `${detail}. Automatic token refresh failed. ` +
            tokenFailureRemediation(options.tokenType),
          cause: error,
        }),
      );
    }

    // 429 — surface a clear rate-limit message with the server's retry hint.
    if (error.status === 429) {
      const retryAfter = error.headers['retry-after'];
      const waitTime = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 60_000;
      return Effect.fail(
        clientRequestError({
          kind: 'remoteRateLimit',
          method,
          url,
          status: error.status,
          message:
            `eBay API rate limit exceeded. Retry after ${waitTime / 1000} seconds. ` +
            'Consider reducing request frequency or upgrading to user tokens for higher limits.',
          cause: error,
        }),
      );
    }

    // 5xx — retry up to three times with exponential backoff.
    if (error.status != null && error.status >= 500 && state.serverRetries < 3) {
      const delay = 2 ** state.serverRetries * 1000;
      const delayMs = Math.min(delay, 5000);
      const nextServerRetries = state.serverRetries + 1;
      apiLogger.warn(`Server error (${error.status}). Retrying...`, {
        attempt: `${nextServerRetries}/3`,
        delayMs,
      });

      return sleep(delayMs).pipe(
        Effect.flatMap(() =>
          this.sendWithRetry<T>(method, url, options, {
            ...state,
            serverRetries: nextServerRetries,
          }),
        ),
      );
    }

    if (error.status != null) {
      return Effect.fail(
        clientRequestError({
          kind: 'httpStatus',
          method,
          url,
          status: error.status,
          message: `eBay API Error: ${this.ebayErrorDetail(error.data) ?? error.message}${this.ebayErrorBody(error.data)}`,
          cause: error,
        }),
      );
    }

    return Effect.fail(
      clientRequestError({
        kind: 'transport',
        method,
        url,
        message: error.message,
        cause: error,
      }),
    );
  }

  /**
   * Make a GET request to eBay API
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    config?: EbayRequestConfig,
  ): Promise<T> {
    return await this.request<T>('GET', endpoint, {
      params: { ...params, ...config?.params },
      headers: config?.headers,
      responseType: config?.responseType,
      tokenType: config?.tokenType,
    });
  }

  /**
   * Make a POST request to eBay API
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: EbayRequestConfig,
  ): Promise<T> {
    return await this.request<T>('POST', endpoint, {
      data,
      params: config?.params,
      headers: config?.headers,
      responseType: config?.responseType,
      tokenType: config?.tokenType,
    });
  }

  /**
   * Make a PUT request to eBay API
   */
  async put<T = unknown>(endpoint: string, data?: unknown, config?: EbayRequestConfig): Promise<T> {
    return await this.request<T>('PUT', endpoint, {
      data,
      params: config?.params,
      headers: config?.headers,
      responseType: config?.responseType,
      tokenType: config?.tokenType,
    });
  }

  /**
   * Make a DELETE request to eBay API
   */
  async delete<T = unknown>(endpoint: string, config?: EbayRequestConfig): Promise<T> {
    return await this.request<T>('DELETE', endpoint, {
      params: config?.params,
      headers: config?.headers,
      responseType: config?.responseType,
      tokenType: config?.tokenType,
    });
  }

  /**
   * Initialize the client (load user tokens from storage)
   */
  initialize = (): Effect.Effect<void, EbayOAuthError> => this.authClient.initialize();

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.authClient.isAuthenticated();
  }

  /**
   * Check if user tokens are available
   */
  hasUserTokens(): boolean {
    return this.authClient.hasUserTokens();
  }

  /**
   * Set user access and refresh tokens
   */
  setUserTokens = (
    accessToken: string,
    refreshToken: string,
    accessTokenExpiry?: number,
    refreshTokenExpiry?: number,
  ): Effect.Effect<void, EbayOAuthError> =>
    this.authClient.setUserTokens(accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry);

  /**
   * Get token information for debugging
   */
  getTokenInfo() {
    return this.authClient.getTokenInfo();
  }

  /**
   * Get the OAuth client instance for advanced operations
   */
  getOAuthClient(): EbayOAuthClient {
    return this.authClient;
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats() {
    return this.rateLimitTracker.getStats();
  }

  /**
   * Get the config object (for accessing environment, etc.)
   */
  getConfig(): EbayConfig {
    return this.config;
  }

  /**
   * Manually refresh user access token using the refresh token
   * This is useful when you encounter "Invalid access token" errors
   * The token will be automatically saved to storage after refresh
   */
  refreshUserToken = (): Effect.Effect<void, EbayOAuthError> => this.authClient.refreshUserToken();

  /**
   * Make a GET request with a full URL (for APIs that use different base URLs)
   * Used by Identity API which uses the apiz subdomain
   */
  async getWithFullUrl<T = unknown>(fullUrl: string, params?: Record<string, unknown>): Promise<T> {
    return await this.request<T>('GET', fullUrl, { params, absolute: true });
  }
}
