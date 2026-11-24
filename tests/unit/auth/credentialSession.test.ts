import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Effect } from "effect";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
	buildCredentialDisplay,
	createAppAccessTokenExpiry,
	createDefaultAccessTokenExpiry,
	createDefaultRefreshTokenExpiry,
	createStoredUserTokens,
	createStoredUserTokensFromResponse,
	DotEnvCredentialStore,
	isTokenExpired,
	maskToken,
} from "@/auth/credentialSession.js";
import {
	CREDENTIAL_ENV_PATH,
	resolveCredentialEnvPath,
} from "@/shared/credentialFile.js";

describe("credential session", () => {
	let tempDir: string | undefined;

	afterEach(() => {
		if (tempDir) {
			rmSync(tempDir, { recursive: true, force: true });
			tempDir = undefined;
		}
	});

	it("masks tokens without exposing full secrets", () => {
		expect(maskToken("short")).toBe("***");
		expect(maskToken("abcdef1234567890")).toBe("abcdef...567890");
	});

	it("persists env updates through an adapter", () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "ebay-credential-store-"));
		const envPath = path.join(tempDir, ".env");
		writeFileSync(envPath, "EBAY_CLIENT_ID=client\n", "utf-8");

		const store = new DotEnvCredentialStore(() => envPath);
		Effect.runSync(
			store.write({
				EBAY_USER_ACCESS_TOKEN: "access",
				EBAY_USER_REFRESH_TOKEN: "refresh",
			}),
		);

		const parsed = dotenv.parse(readFileSync(envPath, "utf-8"));
		expect(parsed).toMatchObject({
			EBAY_CLIENT_ID: "client",
			EBAY_USER_ACCESS_TOKEN: "access",
			EBAY_USER_REFRESH_TOKEN: "refresh",
		});
	});

	it("resolves the credential file from the installed package root (issue #157)", () => {
		const installedModuleUrl = new URL(
			"../../../build/shared/credentialFile.js",
			import.meta.url,
		);

		expect(CREDENTIAL_ENV_PATH).toBe(
			fileURLToPath(new URL("../../../.env", import.meta.url)),
		);
		expect(resolveCredentialEnvPath(installedModuleUrl)).toBe(
			fileURLToPath(new URL("../../.env", installedModuleUrl)),
		);
	});

	it("preserves both keys under concurrent dual writes (issue #154)", async () => {
		tempDir = mkdtempSync(
			path.join(tmpdir(), "ebay-credential-store-concurrent-"),
		);
		const envPath = path.join(tempDir, ".env");
		writeFileSync(envPath, "EBAY_CLIENT_ID=client\n", "utf-8");

		const store = new DotEnvCredentialStore(() => envPath);

		await Effect.runPromise(
			Effect.all(
				[
					store.write({ EBAY_APP_ACCESS_TOKEN: "app-token-value" }),
					store.write({
						EBAY_USER_ACCESS_TOKEN: "user-access-value",
						EBAY_USER_REFRESH_TOKEN: "user-refresh-value",
					}),
				],
				{ concurrency: 2 },
			),
		);

		const parsed = dotenv.parse(readFileSync(envPath, "utf-8"));
		expect(parsed).toMatchObject({
			EBAY_CLIENT_ID: "client",
			EBAY_APP_ACCESS_TOKEN: "app-token-value",
			EBAY_USER_ACCESS_TOKEN: "user-access-value",
			EBAY_USER_REFRESH_TOKEN: "user-refresh-value",
		});
	});

	it("centralizes default token expiry calculations", () => {
		const now = Date.UTC(2026, 0, 1);

		expect(createDefaultAccessTokenExpiry(now)).toBe(now + 7200 * 1000);
		expect(createDefaultRefreshTokenExpiry(now)).toBe(
			now + 18 * 30 * 24 * 60 * 60 * 1000,
		);
		expect(createAppAccessTokenExpiry(7200, now)).toBe(now + 7140 * 1000);
		expect(isTokenExpired(now - 1, now)).toBe(true);
		expect(isTokenExpired(now + 1, now)).toBe(false);
		expect(isTokenExpired(undefined, now)).toBe(true);
	});

	it("builds stored token data from manual credentials", () => {
		const now = Date.UTC(2026, 0, 1);
		const tokens = createStoredUserTokens({
			config: {
				clientId: "client",
				clientSecret: "secret",
				contentLanguage: "en-US",
				environment: "sandbox",
				marketplaceId: "EBAY_US",
				redirectUri: "redirect",
			},
			accessToken: "access",
			refreshToken: "refresh",
			now,
		});

		expect(tokens).toMatchObject({
			clientId: "client",
			clientSecret: "secret",
			contentLanguage: "en-US",
			marketplaceId: "EBAY_US",
			redirectUri: "redirect",
			tokenType: "Bearer",
			userAccessToken: "access",
			userAccessTokenExpiry: now + 7200 * 1000,
			userRefreshToken: "refresh",
			userRefreshTokenExpiry: now + 18 * 30 * 24 * 60 * 60 * 1000,
		});
	});

	it("preserves refresh-session fields when refresh responses omit them", () => {
		const now = Date.UTC(2026, 0, 1);
		const refreshExpiry = now + 100_000;
		const tokens = createStoredUserTokensFromResponse({
			config: {
				clientId: "client",
				clientSecret: "secret",
				environment: "sandbox",
			},
			now,
			previousTokens: {
				clientId: "client",
				clientSecret: "secret",
				tokenType: "Bearer",
				userAccessToken: "old-access",
				userAccessTokenExpiry: now - 1,
				userRefreshToken: "existing-refresh",
				userRefreshTokenExpiry: refreshExpiry,
				scope: "scope-a scope-b",
			},
			tokenData: {
				access_token: "new-access",
				expires_in: 7200,
			},
		});

		expect(tokens.userAccessToken).toBe("new-access");
		expect(tokens.userRefreshToken).toBe("existing-refresh");
		expect(tokens.userRefreshTokenExpiry).toBe(refreshExpiry);
		expect(tokens.scope).toBe("scope-a scope-b");
	});

	it("builds token status without exposing raw token values", () => {
		const display = buildCredentialDisplay({
			appAccessToken: "app-token-123456",
			appAccessTokenExpiry: Date.now() + 1000,
			authenticated: true,
			config: {
				clientId: "client-id-123456",
				clientSecret: "secret",
				contentLanguage: "en-US",
				environment: "sandbox",
				marketplaceId: "EBAY_US",
				redirectUri: "https://example.test/callback",
				refreshToken: "refresh-token-123456",
			},
			tokenInfo: {
				hasAppAccessToken: true,
				hasUserToken: true,
			},
			userTokens: {
				clientId: "client-id-123456",
				clientSecret: "secret",
				redirectUri: "https://example.test/callback",
				tokenType: "Bearer",
				userAccessToken: "access-token-123456",
				userAccessTokenExpiry: Date.now() + 1000,
				userRefreshToken: "refresh-token-123456",
				userRefreshTokenExpiry: Date.now() + 1000,
				scope: "scope-a scope-b",
			},
		});

		expect(display.credentials.clientId).toContain("...");
		expect(display.credentials.clientSecret).toBe("****** (set)");
		expect(display.tokens.accessToken).toContain("...");
		expect(display.tokens.refreshToken).toContain("...");
		expect(JSON.stringify(display)).not.toContain("access-token-123456");
		expect(display.scopes).toEqual(["scope-a", "scope-b"]);
	});
});
