import type { StoredTokenData } from '@/shared/ebay.js';

/**
 * Mock token storage for testing
 */
export class MockTokenStorage {
  private static tokens: StoredTokenData | null = null;

  static async hasTokens(): Promise<boolean> {
    return MockTokenStorage.tokens !== null;
  }

  static async loadTokens(): Promise<StoredTokenData> {
    if (!MockTokenStorage.tokens) {
      throw new Error('No tokens stored');
    }
    return MockTokenStorage.tokens;
  }

  static async saveTokens(tokens: StoredTokenData): Promise<void> {
    MockTokenStorage.tokens = tokens;
  }

  static async clearTokens(): Promise<void> {
    MockTokenStorage.tokens = null;
  }

  static isUserAccessTokenExpired(tokens: StoredTokenData): boolean {
    return Date.now() >= tokens.userAccessTokenExpiry;
  }

  static isUserRefreshTokenExpired(tokens: StoredTokenData): boolean {
    return Date.now() >= tokens.userRefreshTokenExpiry;
  }

  // Helper methods for testing
  static setMockTokens(tokens: StoredTokenData | null): void {
    MockTokenStorage.tokens = tokens;
  }

  static getMockTokens(): StoredTokenData | null {
    return MockTokenStorage.tokens;
  }

  static reset(): void {
    MockTokenStorage.tokens = null;
  }
}

/**
 * Create mock stored token data for testing
 *
 * @param overrides - Partial token fields to override in the default fixture.
 * @returns Stored token data with valid access and refresh expiries.
 *
 * @example
 * ```ts
 * const tokens = createMockTokens({ scope: 'scope-a scope-b' });
 * ```
 */
export const createMockTokens = (overrides: Partial<StoredTokenData> = {}): StoredTokenData => {
  const now = Date.now();
  return {
    userAccessToken: 'mock_access_token',
    userRefreshToken: 'mock_refresh_token',
    tokenType: 'Bearer',
    userAccessTokenExpiry: now + 7200 * 1000, // 2 hours from now
    userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // 18 months
    scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
    ...overrides,
  };
};

/**
 * Create expired mock tokens
 *
 * @returns Stored token data with an expired access token and valid refresh token.
 *
 * @example
 * ```ts
 * const tokens = createExpiredAccessToken();
 * ```
 */
export const createExpiredAccessToken = (): StoredTokenData => {
  const now = Date.now();
  return createMockTokens({
    userAccessTokenExpiry: now - 1000, // 1 second ago
    userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // Still valid
  });
};

/**
 * Create fully expired mock tokens (both access and refresh)
 *
 * @returns Stored token data with expired access and refresh tokens.
 *
 * @example
 * ```ts
 * const tokens = createFullyExpiredTokens();
 * ```
 */
export const createFullyExpiredTokens = (): StoredTokenData => {
  const now = Date.now();
  return createMockTokens({
    userAccessTokenExpiry: now - 1000, // 1 second ago
    userRefreshTokenExpiry: now - 1000, // Also expired
  });
};
