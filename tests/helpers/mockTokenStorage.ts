import type { StoredTokenData } from "@/shared/ebay.js";

export class MockTokenStorage {
	private static tokens: StoredTokenData | null = null;

	static hasTokens = async (): Promise<boolean> => {
		return MockTokenStorage.tokens !== null;
	};

	static loadTokens = async (): Promise<StoredTokenData> => {
		if (!MockTokenStorage.tokens) {
			throw new Error("No tokens stored");
		}
		return MockTokenStorage.tokens;
	};

	static saveTokens = async (tokens: StoredTokenData): Promise<void> => {
		MockTokenStorage.tokens = tokens;
	};

	static clearTokens = async (): Promise<void> => {
		MockTokenStorage.tokens = null;
	};

	static isUserAccessTokenExpired = (tokens: StoredTokenData): boolean => {
		return Date.now() >= tokens.userAccessTokenExpiry;
	};

	static isUserRefreshTokenExpired = (tokens: StoredTokenData): boolean => {
		return Date.now() >= tokens.userRefreshTokenExpiry;
	};

	// Helper methods for testing
	static setMockTokens = (tokens: StoredTokenData | null): void => {
		MockTokenStorage.tokens = tokens;
	};

	static getMockTokens = (): StoredTokenData | null => {
		return MockTokenStorage.tokens;
	};

	static reset = (): void => {
		MockTokenStorage.tokens = null;
	};
}

export function createMockTokens(
	overrides: Partial<StoredTokenData> = {},
): StoredTokenData {
	const now = Date.now();
	return {
		userAccessToken: "mock_access_token",
		userRefreshToken: "mock_refresh_token",
		tokenType: "Bearer",
		userAccessTokenExpiry: now + 7200 * 1000, // 2 hours from now
		userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // 18 months
		scope: "https://api.ebay.com/oauth/api_scope/sell.inventory",
		...overrides,
	};
}

export function createExpiredAccessToken(): StoredTokenData {
	const now = Date.now();
	return createMockTokens({
		userAccessTokenExpiry: now - 1000, // 1 second ago
		userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000, // Still valid
	});
}

export function createFullyExpiredTokens(): StoredTokenData {
	const now = Date.now();
	return createMockTokens({
		userAccessTokenExpiry: now - 1000, // 1 second ago
		userRefreshTokenExpiry: now - 1000, // Also expired
	});
}
