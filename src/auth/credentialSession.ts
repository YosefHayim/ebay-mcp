import dotenv from 'dotenv';
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, writeFileSync } from 'fs';
import { CREDENTIAL_ENV_PATH } from '@/config/credentialFile.js';
import { stringifyEnv } from '@/utils/envFile.js';
import type { EbayConfig, EbayUserToken, StoredTokenData } from '@/types/ebay.js';
import { Data, Effect } from 'effect';

/**
 * Default lifetime for stored eBay user access tokens when eBay omits an expiry.
 */
export const DEFAULT_USER_ACCESS_TOKEN_TTL_SECONDS = 7200;

/**
 * Default lifetime for stored eBay user refresh tokens when eBay omits an expiry.
 */
export const DEFAULT_USER_REFRESH_TOKEN_TTL_SECONDS = 18 * 30 * 24 * 60 * 60;

/**
 * Safety buffer removed from app-token expiry to avoid using near-expired tokens.
 */
export const APP_ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS = 60;

/**
 * eBay user-token response shape with the required access token fields enforced.
 */
export type EbayUserTokenResponse = Pick<EbayUserToken, 'access_token' | 'expires_in'> &
  Partial<Omit<EbayUserToken, 'access_token' | 'expires_in'>>;

/** Tagged failure returned when credential persistence cannot write to disk. */
export class CredentialStoreError extends Data.TaggedError('CredentialStoreError')<{
  /** Path of the credential backing file that failed to update. */
  readonly envPath: string;
  /** Human-readable persistence failure message. */
  readonly message: string;
  /** Lower-level filesystem or serialization failure. */
  readonly cause: unknown;
}> {}

/**
 * Persistence boundary for writing refreshed credential values.
 */
export interface CredentialStore {
  /**
   * Writes credential updates to the backing store.
   *
   * @param updates - Environment variable names and values to merge into storage.
   * @returns An Effect that succeeds after the backing store is updated.
   *
   * @example
   * ```ts
   * yield* credentialStore.write({ EBAY_USER_REFRESH_TOKEN: refreshToken });
   * ```
   */
  write(updates: Record<string, string>): Effect.Effect<void, CredentialStoreError>;
}

/**
 * Process-wide write mutexes keyed by absolute `.env` path so concurrent
 * DotEnvCredentialStore instances cannot interleave read-modify-write on the
 * same file (e.g. user-token write racing app-token write).
 */
const writeLocksByEnvPath = new Map<string, Effect.Semaphore>();

const writeLockForEnvPath = (envPath: string): Effect.Semaphore => {
  const existing = writeLocksByEnvPath.get(envPath);
  if (existing) {
    return existing;
  }

  const created = Effect.runSync(Effect.makeSemaphore(1));
  writeLocksByEnvPath.set(envPath, created);
  return created;
};

/**
 * Credential store that merges token updates into the project .env file.
 *
 * Writes are serialized through a one-permit semaphore so concurrent Effect
 * callers cannot interleave read-modify-write on the same `.env` path.
 */
export class DotEnvCredentialStore implements CredentialStore {
  constructor(private readonly getEnvPath: () => string = () => CREDENTIAL_ENV_PATH) {}

  /**
   * Merges credential updates into the project `.env` file.
   *
   * Concurrent writes are serialized so one call cannot overwrite another
   * caller's keys. After the file is written, the store fsyncs the file
   * descriptor when the path exists so crash/kill is less likely to drop tokens.
   *
   * @param updates - Environment variable names and values to persist.
   * @returns An Effect that succeeds after `.env` is written.
   *
   * @example
   * ```ts
   * yield* new DotEnvCredentialStore().write({ EBAY_APP_ACCESS_TOKEN: appToken });
   * ```
   */
  write(updates: Record<string, string>): Effect.Effect<void, CredentialStoreError> {
    const envPath = this.getEnvPath();
    const writeLock = writeLockForEnvPath(envPath);

    return writeLock.withPermits(1)(
      Effect.try({
        try: () => {
          // Drop non-string values so a missing refresh_token cannot persist as empty.
          const sanitizedUpdates: Record<string, string> = {};
          for (const [name, envValue] of Object.entries(updates)) {
            if (typeof envValue === 'string') {
              sanitizedUpdates[name] = envValue;
            }
          }

          const existingEnv = existsSync(envPath)
            ? dotenv.parse(readFileSync(envPath, 'utf-8'))
            : {};
          const safeEnvContent = stringifyEnv({ ...existingEnv, ...sanitizedUpdates });

          writeFileSync(envPath, safeEnvContent, 'utf-8');

          // Durability: best-effort fsync. Windows and mocked FS may reject fsync
          // on a read-only open; never fail the write after a successful writeFileSync.
          if (existsSync(envPath)) {
            try {
              const fd = openSync(envPath, 'r+');
              try {
                fsyncSync(fd);
              } finally {
                closeSync(fd);
              }
            } catch {
              // Ignore fsync failures — tokens are already on disk for the write path.
            }
          }
        },
        catch: (cause) =>
          new CredentialStoreError({
            envPath,
            message: `Failed to write credential updates to ${envPath}`,
            cause,
          }),
      }),
    );
  }
}

/**
 * Redact token values for status and credential display output.
 *
 * @param token - Raw credential or token string.
 * @returns Redacted token with only short prefix/suffix visible.
 *
 * @example
 * ```ts
 * maskToken('abcdef1234567890');
 * ```
 */
export const maskToken = (token: string): string => {
  if (!token || token.length < 12) {
    return '***';
  }

  return `${token.substring(0, 6)}...${token.substring(token.length - 6)}`;
};

/**
 * Convert an expires-in duration from eBay into an absolute timestamp.
 *
 * @param expiresInSeconds - Relative lifetime returned by eBay.
 * @param now - Timestamp used as the calculation base.
 * @returns Absolute expiry timestamp in milliseconds.
 *
 * @example
 * ```ts
 * createExpiryTimestamp(7200, Date.UTC(2026, 0, 1));
 * ```
 */
export const createExpiryTimestamp = (expiresInSeconds: number, now = Date.now()): number =>
  now + expiresInSeconds * 1000;

/**
 * Create the fallback expiry timestamp for a stored eBay user access token.
 *
 * @param now - Timestamp used as the calculation base.
 * @returns Absolute fallback access-token expiry timestamp in milliseconds.
 *
 * @example
 * ```ts
 * createDefaultAccessTokenExpiry(Date.UTC(2026, 0, 1));
 * ```
 */
export const createDefaultAccessTokenExpiry = (now = Date.now()): number =>
  createExpiryTimestamp(DEFAULT_USER_ACCESS_TOKEN_TTL_SECONDS, now);

/**
 * Create the fallback expiry timestamp for a stored eBay user refresh token.
 *
 * @param now - Timestamp used as the calculation base.
 * @returns Absolute fallback refresh-token expiry timestamp in milliseconds.
 *
 * @example
 * ```ts
 * createDefaultRefreshTokenExpiry(Date.UTC(2026, 0, 1));
 * ```
 */
export const createDefaultRefreshTokenExpiry = (now = Date.now()): number =>
  createExpiryTimestamp(DEFAULT_USER_REFRESH_TOKEN_TTL_SECONDS, now);

/**
 * Create the cached app-token expiry timestamp with an early refresh buffer.
 *
 * @param expiresInSeconds - Relative app-token lifetime returned by eBay.
 * @param now - Timestamp used as the calculation base.
 * @returns Absolute app-token expiry timestamp in milliseconds.
 *
 * @example
 * ```ts
 * createAppAccessTokenExpiry(7200, Date.UTC(2026, 0, 1));
 * ```
 */
export const createAppAccessTokenExpiry = (expiresInSeconds: number, now = Date.now()): number =>
  createExpiryTimestamp(
    Math.max(0, expiresInSeconds - APP_ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS),
    now,
  );

/**
 * Determine whether a stored token expiry is missing or no longer valid.
 *
 * @param expiry - Absolute expiry timestamp, null, or undefined.
 * @param now - Timestamp used as the comparison base.
 * @returns True when no expiry exists or the expiry is at or before now.
 *
 * @example
 * ```ts
 * isTokenExpired(Date.now() - 1);
 * ```
 */
export const isTokenExpired = (expiry: number | null | undefined, now = Date.now()): boolean =>
  expiry ? now >= expiry : true;

/**
 * Inputs for constructing the stored credential snapshot after user auth.
 */
export interface CreateStoredUserTokensInput {
  /** Fresh user access token value. */
  accessToken: string;
  /** Optional precomputed access-token expiry timestamp. */
  accessTokenExpiry?: number;
  /** eBay app configuration persisted alongside token values. */
  config: EbayConfig;
  /** Optional app access token already cached in the environment. */
  envAppToken?: string;
  /** Optional clock override used by tests. */
  now?: number;
  /** Fresh or existing user refresh token value. */
  refreshToken: string;
  /** Optional precomputed refresh-token expiry timestamp. */
  refreshTokenExpiry?: number;
  /** OAuth scope string returned by eBay. */
  scope?: string;
  /** OAuth token type, defaulting to Bearer. */
  tokenType?: string;
}

/**
 * Build a StoredTokenData object from normalized eBay user-token fields.
 *
 * @param input - Normalized token fields plus app configuration.
 * @returns Stored token snapshot used by the credential session.
 *
 * @example
 * ```ts
 * const tokens = createStoredUserTokens({ config, accessToken: 'access', refreshToken: 'refresh' });
 * ```
 */
export const createStoredUserTokens = (input: CreateStoredUserTokensInput): StoredTokenData => {
  const now = input.now ?? Date.now();

  return {
    clientId: input.config.clientId,
    clientSecret: input.config.clientSecret,
    redirectUri: input.config.redirectUri,
    locale: input.config.locale,
    marketplaceId: input.config.marketplaceId,
    contentLanguage: input.config.contentLanguage,
    envAppToken: input.envAppToken ?? input.config.appAccessToken,
    userAccessToken: input.accessToken,
    userRefreshToken: input.refreshToken,
    tokenType: input.tokenType ?? 'Bearer',
    userAccessTokenExpiry: input.accessTokenExpiry ?? createDefaultAccessTokenExpiry(now),
    userRefreshTokenExpiry: input.refreshTokenExpiry ?? createDefaultRefreshTokenExpiry(now),
    scope: input.scope,
  };
};

/**
 * Inputs for merging a fresh eBay token response with any existing stored tokens.
 */
export interface CreateStoredUserTokensFromResponseInput {
  /** eBay app configuration persisted alongside token values. */
  config: EbayConfig;
  /** Optional app access token already cached in the environment. */
  envAppToken?: string;
  /** Existing token snapshot used when refresh responses omit stable fields. */
  previousTokens?: StoredTokenData | null;
  /** Raw eBay user-token response. */
  tokenData: EbayUserTokenResponse;
  /** Optional clock override used by tests. */
  now?: number;
}

/**
 * Build stored token data from an eBay token endpoint response.
 *
 * @param input - eBay token response plus config and optional prior token snapshot.
 * @returns Stored token snapshot with omitted refresh fields preserved from previous data.
 *
 * @example
 * ```ts
 * const tokens = createStoredUserTokensFromResponse({ config, tokenData });
 * ```
 */
export const createStoredUserTokensFromResponse = (
  input: CreateStoredUserTokensFromResponseInput,
): StoredTokenData => {
  const now = input.now ?? Date.now();
  const previousTokens = input.previousTokens;

  return createStoredUserTokens({
    config: input.config,
    envAppToken: input.envAppToken ?? previousTokens?.envAppToken,
    accessToken: input.tokenData.access_token,
    refreshToken: input.tokenData.refresh_token ?? previousTokens?.userRefreshToken ?? '',
    tokenType: input.tokenData.token_type ?? previousTokens?.tokenType,
    accessTokenExpiry: createExpiryTimestamp(input.tokenData.expires_in, now),
    refreshTokenExpiry: input.tokenData.refresh_token_expires_in
      ? createExpiryTimestamp(input.tokenData.refresh_token_expires_in, now)
      : previousTokens?.userRefreshTokenExpiry,
    scope: input.tokenData.scope ?? previousTokens?.scope,
    now,
  });
};

const tokenExpiry = (expiry: number | null | undefined) => {
  if (!expiry) {
    return 'Not available';
  }

  return {
    timestamp: expiry,
    date: new Date(expiry).toISOString(),
    expired: Date.now() >= expiry,
  };
};

/**
 * Inputs used to render redacted credential and token status details.
 */
export interface CredentialDisplayInput {
  /** Cached app access token value, when available. */
  appAccessToken: string | null | undefined;
  /** Cached app-token expiry timestamp, when available. */
  appAccessTokenExpiry: number | null | undefined;
  /** Whether the auth manager currently considers the user authenticated. */
  authenticated: boolean;
  /** Validated eBay API runtime configuration used by the current facade. */
  config: EbayConfig;
  /** Boolean token availability flags returned by the auth manager. */
  tokenInfo: {
    /** Whether an app access token exists. */
    hasAppAccessToken: boolean;
    /** Whether a user token exists. */
    hasUserToken: boolean;
  };
  /** Stored user tokens, when available. */
  userTokens: StoredTokenData | null;
}

/**
 * Build redacted credential and token status data for auth diagnostics.
 *
 * @param input - Raw credential, token, and environment values to redact.
 * @returns Redacted credential display data for diagnostics and token-management tools.
 *
 * @example
 * ```ts
 * const display = buildCredentialDisplay({ appAccessToken, appAccessTokenExpiry, authenticated, config, tokenInfo, userTokens });
 * ```
 */
export const buildCredentialDisplay = (input: CredentialDisplayInput) => {
  const { appAccessToken, appAccessTokenExpiry, authenticated, config, tokenInfo, userTokens } =
    input;
  const refreshToken = config.refreshToken ?? userTokens?.userRefreshToken ?? '';
  let currentTokenType = 'none';

  if (tokenInfo.hasUserToken) {
    currentTokenType = 'user_token (10,000-50,000 req/day)';
  } else if (tokenInfo.hasAppAccessToken) {
    currentTokenType = 'app_access_token (1,000 req/day)';
  }

  return {
    credentials: {
      clientId: config.clientId ? maskToken(config.clientId) : 'Not set',
      clientSecret: config.clientSecret ? '****** (set)' : 'Not set',
      environment: config.environment,
      redirectUri: config.redirectUri || 'Not set',
    },
    tokens: {
      refreshToken: refreshToken ? maskToken(refreshToken) : 'Not set (in .env)',
      accessToken: userTokens?.userAccessToken
        ? maskToken(userTokens.userAccessToken)
        : 'Not available',
      accessTokenExpiry: tokenExpiry(userTokens?.userAccessTokenExpiry),
      refreshTokenExpiry: tokenExpiry(userTokens?.userRefreshTokenExpiry),
      appToken: appAccessToken ? maskToken(appAccessToken) : 'Not cached',
      appTokenExpiry: tokenExpiry(appAccessTokenExpiry),
    },
    status: {
      hasUserToken: tokenInfo.hasUserToken,
      hasAppAccessToken: tokenInfo.hasAppAccessToken,
      authenticated,
      currentTokenType,
    },
    scopes: userTokens?.scope ? userTokens.scope.split(' ') : [],
  };
};
