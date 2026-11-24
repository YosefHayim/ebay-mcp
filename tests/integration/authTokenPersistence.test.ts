import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import dotenv from "dotenv";
import { Effect } from "effect";
import nock from "nock";
import { afterEach, describe, expect, it } from "vitest";
import { DotEnvCredentialStore } from "@/auth/credentialSession.js";
import { EbayOAuthClient } from "@/auth/oauth.js";
import type { EbayConfig } from "@/shared/ebay.js";

const config: EbayConfig = {
	clientId: "integration_client_id",
	clientSecret: "integration_client_secret",
	environment: "sandbox",
	refreshToken: "integration_refresh_token",
};

describe("OAuth token persistence", () => {
	let tempDir: string | undefined;

	afterEach(() => {
		nock.cleanAll();
		nock.enableNetConnect();
		if (tempDir) {
			rmSync(tempDir, { recursive: true, force: true });
			tempDir = undefined;
		}
	});

	it("refreshes through the OAuth endpoint and writes back to the selected credential file", async () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "ebay-auth-refresh-"));
		const envPath = path.join(tempDir, ".env");
		writeFileSync(
			envPath,
			"EBAY_USER_REFRESH_TOKEN=integration_refresh_token\n",
			"utf-8",
		);
		const credentialStore = new DotEnvCredentialStore(() => envPath);
		const oauthClient = new EbayOAuthClient(config, credentialStore);

		nock.disableNetConnect();
		nock("https://api.sandbox.ebay.com")
			.post("/identity/v1/oauth2/token", {
				grant_type: "refresh_token",
				refresh_token: "integration_refresh_token",
			})
			.reply(200, {
				access_token: "integration_access_token",
				token_type: "Bearer",
				expires_in: 7200,
			});
		nock("https://api.sandbox.ebay.com")
			.post("/identity/v1/oauth2/token", {
				grant_type: "client_credentials",
				scope: "https://api.ebay.com/oauth/api_scope",
			})
			.reply(200, {
				access_token: "integration_app_token",
				token_type: "Bearer",
				expires_in: 7200,
			});

		await Effect.runPromise(oauthClient.initialize());

		const persisted = dotenv.parse(readFileSync(envPath, "utf-8"));
		expect(persisted).toMatchObject({
			EBAY_USER_ACCESS_TOKEN: "integration_access_token",
			EBAY_USER_REFRESH_TOKEN: "integration_refresh_token",
			EBAY_APP_ACCESS_TOKEN: "integration_app_token",
		});
		await expect(Effect.runPromise(oauthClient.getAccessToken())).resolves.toBe(
			"integration_access_token",
		);
		expect(nock.isDone()).toBe(true);
	});
});
