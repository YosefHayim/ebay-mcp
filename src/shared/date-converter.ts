import { Data, Effect } from 'effect';

/** Utility functions for date/timestamp conversion and validation. */

/** Tagged failure returned when user-supplied date input cannot be parsed. */
export class DateConversionError extends Data.TaggedError('DateConversionError')<{
  /** Original date value supplied by the caller. */
  readonly input: string | Date | number;
  /** Human-readable parse failure. */
  readonly message: string;
}> {}

/** Return a tagged date-conversion failure for invalid user input. */
const invalidDateInput = (
  input: string | Date | number,
  message: string,
): Effect.Effect<never, DateConversionError> =>
  Effect.fail(new DateConversionError({ input, message }));

/**
 * Convert a date string or Date object to Unix timestamp (milliseconds).
 *
 * Supported formats:
 * - ISO 8601: "2025-01-15T10:30:00Z" or "2025-01-15T10:30:00.000Z"
 * - Date object: new Date()
 * - Unix timestamp (milliseconds): 1736938200000
 * - Unix timestamp (seconds): 1736938200
 * - Relative time: "in 2 hours", "in 7200 seconds"
 *
 * @param dateInput - Date string, Date object, or Unix timestamp
 * @returns An Effect that succeeds with a Unix timestamp in milliseconds.
 *
 * @example
 * ```ts
 * const timestamp = await Effect.runPromise(convertToTimestamp('2026-01-15T10:30:00Z'));
 * ```
 */
export const convertToTimestamp = (
  dateInput: string | Date | number,
): Effect.Effect<number, DateConversionError> => {
  // If already a number, handle as timestamp
  if (typeof dateInput === 'number') {
    // If appears to be seconds (less than year 2100 in milliseconds)
    if (dateInput < 4_102_444_800_000) {
      // Could be seconds, check if reasonable
      const now = Date.now();
      const asSeconds = dateInput * 1000;

      // If multiplying by 1000 gives reasonable future date, it's seconds
      if (asSeconds > now - 100 * 365 * 24 * 60 * 60 * 1000) {
        return Effect.succeed(Math.floor(asSeconds));
      }
    }

    // Already milliseconds
    return Effect.succeed(Math.floor(dateInput));
  }

  // If Date object
  if (dateInput instanceof Date) {
    const timestamp = dateInput.getTime();
    if (Number.isNaN(timestamp)) {
      return invalidDateInput(dateInput, 'Invalid Date object');
    }
    return Effect.succeed(timestamp);
  }

  // If string, try parsing
  if (typeof dateInput === 'string') {
    // Handle relative time: "in X hours/minutes/seconds"
    const relativeMatch = /^in\s+(\d+)\s+(hours?|minutes?|seconds?|days?)$/i.exec(dateInput);
    if (relativeMatch) {
      const amount = Number.parseInt(relativeMatch[1], 10);
      const unit = relativeMatch[2].toLowerCase();

      let multiplier = 1000; // Default to seconds
      if (unit.startsWith('minute')) multiplier = 60 * 1000;
      else if (unit.startsWith('hour')) multiplier = 60 * 60 * 1000;
      else if (unit.startsWith('day')) multiplier = 24 * 60 * 60 * 1000;

      return Effect.succeed(Date.now() + amount * multiplier);
    }

    // Try parsing as ISO date or other standard format
    const parsed = Date.parse(dateInput);
    if (Number.isNaN(parsed)) {
      return invalidDateInput(
        dateInput,
        `Invalid date format: ${dateInput}. Supported formats: ISO 8601, Unix timestamp, or relative time (e.g., "in 2 hours")`,
      );
    }

    return Effect.succeed(parsed);
  }

  return invalidDateInput(dateInput, `Unsupported date input type: ${typeof dateInput}`);
};

/**
 * Calculate expiry timestamp from duration in seconds
 * Useful for eBay token responses which provide expires_in in seconds
 *
 * @param expiresInSeconds - Duration in seconds (e.g., 7200 for 2 hours)
 * @param fromTimestamp - Optional base timestamp (defaults to now)
 * @returns Expiry timestamp in milliseconds
 *
 * @example
 * ```ts
 * const expiry = calculateExpiry(7200, Date.UTC(2026, 0, 1));
 * ```
 */
export const calculateExpiry = (expiresInSeconds: number, fromTimestamp?: number): number => {
  const baseTime = fromTimestamp ?? Date.now();
  return baseTime + expiresInSeconds * 1000;
};

/**
 * Check if a timestamp is expired
 *
 * @param expiryTimestamp - Expiry timestamp in milliseconds
 * @param bufferSeconds - Optional buffer time in seconds (default: 60)
 * @returns true if expired (or will expire within buffer time)
 *
 * @example
 * ```ts
 * const expired = isExpired(Date.now() - 1, 0);
 * ```
 */
export const isExpired = (expiryTimestamp: number, bufferSeconds = 60): boolean => {
  const now = Date.now();
  const buffer = bufferSeconds * 1000;
  return now + buffer >= expiryTimestamp;
};

/**
 * Get human-readable time remaining until expiry
 *
 * @param expiryTimestamp - Expiry timestamp in milliseconds
 * @returns Human-readable string (e.g., "2 hours 15 minutes")
 *
 * @example
 * ```ts
 * const remaining = getTimeRemaining(Date.now() + 120_000);
 * ```
 */
export const getTimeRemaining = (expiryTimestamp: number): string => {
  const now = Date.now();
  const diff = expiryTimestamp - now;

  if (diff <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : ''}`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : ''}`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes > 1 ? 's' : ''}${remainingSeconds > 0 ? ` ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}` : ''}`;
  }

  return `${seconds} second${seconds > 1 ? 's' : ''}`;
};

/**
 * Validate token expiry times and provide recommendations
 *
 * @param accessTokenExpiry - Access token expiry timestamp
 * @param refreshTokenExpiry - Refresh token expiry timestamp
 * @returns Validation result with warnings and recommendations
 */
export interface TokenExpiryValidation {
  /** True when both access and refresh tokens are still valid. */
  valid: boolean;
  /** Access-token expiry bucket. */
  accessTokenStatus: 'valid' | 'expiring-soon' | 'expired';
  /** Refresh-token expiry bucket. */
  refreshTokenStatus: 'valid' | 'expiring-soon' | 'expired';
  /** Human-readable access-token time remaining. */
  accessTokenRemaining: string;
  /** Human-readable refresh-token time remaining. */
  refreshTokenRemaining: string;
  /** User-facing warnings for expired or soon-expiring tokens. */
  warnings: string[];
  /** User-facing remediation steps for expired or soon-expiring tokens. */
  recommendations: string[];
}

/**
 * Validate access and refresh token expiry timestamps and return renewal guidance.
 *
 * @param accessTokenExpiry - Access-token expiry timestamp in milliseconds.
 * @param refreshTokenExpiry - Refresh-token expiry timestamp in milliseconds.
 * @returns Token validity flags, remaining-time labels, warnings, and recommendations.
 *
 * @example
 * ```ts
 * const validation = validateTokenExpiry(accessTokenExpiry, refreshTokenExpiry);
 * ```
 */
export const validateTokenExpiry = (
  accessTokenExpiry: number,
  refreshTokenExpiry: number,
): TokenExpiryValidation => {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const accessExpired = isExpired(accessTokenExpiry, 0);
  const accessExpiringSoon = isExpired(accessTokenExpiry, 300); // 5 minutes
  const refreshExpired = isExpired(refreshTokenExpiry, 0);
  const refreshExpiringSoon = isExpired(refreshTokenExpiry, 86_400); // 1 day

  let accessTokenStatus: 'valid' | 'expiring-soon' | 'expired' = 'valid';
  let refreshTokenStatus: 'valid' | 'expiring-soon' | 'expired' = 'valid';

  if (accessExpired) {
    accessTokenStatus = 'expired';
    warnings.push('Access token has expired');
    if (!refreshExpired) {
      recommendations.push('Use the refresh token to obtain a new access token');
    }
  } else if (accessExpiringSoon) {
    accessTokenStatus = 'expiring-soon';
    warnings.push('Access token will expire soon');
  }

  if (refreshExpired) {
    refreshTokenStatus = 'expired';
    warnings.push('Refresh token has expired');
    recommendations.push('User needs to re-authorize the application to get new tokens');
  } else if (refreshExpiringSoon) {
    refreshTokenStatus = 'expiring-soon';
    warnings.push('Refresh token will expire soon (within 24 hours)');
    recommendations.push('Consider prompting user to re-authorize before refresh token expires');
  }

  return {
    valid: !(accessExpired || refreshExpired),
    accessTokenStatus,
    refreshTokenStatus,
    accessTokenRemaining: getTimeRemaining(accessTokenExpiry),
    refreshTokenRemaining: getTimeRemaining(refreshTokenExpiry),
    warnings,
    recommendations,
  };
};
