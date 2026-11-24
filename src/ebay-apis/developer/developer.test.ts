import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeveloperApi } from "@/ebay-apis/developer/developerApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

async function readFailure(call: () => Promise<unknown>) {
	try {
		await call();
	} catch (error) {
		return error;
	}

	throw new Error("expected failure");
}

describe("DeveloperApi", () => {
	let client: EbayApiClient;
	let api: DeveloperApi;

	beforeEach(() => {
		client = {
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
			getConfig: vi.fn(() => ({ environment: "production" })),
		} as unknown as EbayApiClient;
		api = new DeveloperApi(client);
	});

	describe("getRateLimits", () => {
		it("get rate limits without parameters", async () => {
			const mockResponse = {
				rateLimits: [
					{
						apiContext: "sell",
						apiName: "inventory",
						resources: [
							{
								name: "inventory_item",
								rates: [{ limit: 5000, remaining: 4500, timeWindow: 86_400 }],
							},
						],
					},
				],
			};
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			const rateLimits = await api.getRateLimits({});

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/rate_limit/",
			);
			expect(rateLimits).toEqual(mockResponse);
		});

		it("get rate limits with apiContext parameter", async () => {
			const mockResponse = { rateLimits: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			await api.getRateLimits({ apiContext: "sell" });

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/rate_limit/",
				{
					api_context: "sell",
				},
			);
		});

		it("get rate limits with apiName parameter", async () => {
			const mockResponse = { rateLimits: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			await api.getRateLimits({ apiName: "inventory" });

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/rate_limit/",
				{
					api_name: "inventory",
				},
			);
		});

		it("get rate limits with both parameters", async () => {
			const mockResponse = { rateLimits: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			await api.getRateLimits({ apiContext: "sell", apiName: "inventory" });

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/rate_limit/",
				{
					api_context: "sell",
					api_name: "inventory",
				},
			);
		});
	});

	describe("getUserRateLimits", () => {
		it("get user rate limits without parameters", async () => {
			const mockResponse = {
				rateLimits: [
					{
						apiContext: "sell",
						apiName: "fulfillment",
						resources: [
							{
								name: "order",
								rates: [{ limit: 10_000, remaining: 9500, timeWindow: 86_400 }],
							},
						],
					},
				],
			};
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			const userRateLimits = await api.getUserRateLimits({});

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/user_rate_limit/",
			);
			expect(userRateLimits).toEqual(mockResponse);
		});

		it("get user rate limits with apiContext parameter", async () => {
			const mockResponse = { rateLimits: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			await api.getUserRateLimits({ apiContext: "commerce" });

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/user_rate_limit/",
				{
					api_context: "commerce",
				},
			);
		});

		it("get user rate limits with apiName parameter", async () => {
			const mockResponse = { rateLimits: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			await api.getUserRateLimits({ apiName: "fulfillment" });

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/user_rate_limit/",
				{
					api_name: "fulfillment",
				},
			);
		});

		it("get user rate limits with both parameters", async () => {
			const mockResponse = { rateLimits: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			await api.getUserRateLimits({ apiContext: "sell", apiName: "marketing" });

			expect(client.get).toHaveBeenCalledWith(
				"/developer/analytics/v1_beta/user_rate_limit/",
				{
					api_context: "sell",
					api_name: "marketing",
				},
			);
		});
	});

	describe("registerClient", () => {
		it("register a new client", async () => {
			const clientSettings = {
				client_name: "Test Application",
				contacts: ["owner@example.com"],
				policy_uri: "https://example.com/privacy",
				redirect_uris: ["https://example.com/callback"],
				software_id: "test-application",
				software_statement: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
			};

			const mockResponse = {
				client_id: "new_client_123",
				client_secret: "secret_xyz",
				client_id_issued_at: 1_704_067_200,
				client_secret_expires_at: 0,
				registration_client_uri:
					"https://tppz.ebay.com/developer/registration/v1/client/new_client_123",
				registration_access_token: "access_token_abc",
			};

			vi.mocked(client.post).mockResolvedValue(mockResponse);

			const registration = await api.registerClient({ clientSettings });

			expect(client.post).toHaveBeenCalledWith(
				"https://tppz.ebay.com/developer/registration/v1/client/register",
				clientSettings,
				{ absolute: true },
			);
			expect(registration).toEqual(mockResponse);
		});

		it("handle registration with minimal settings", async () => {
			const clientSettings = {
				client_name: "Minimal App",
				redirect_uris: ["com.example.app://oauth/callback"],
			};

			const mockResponse = {
				client_id: "minimal_client_456",
			};

			vi.mocked(client.post).mockResolvedValue(mockResponse);

			const registration = await api.registerClient({ clientSettings });

			expect(client.post).toHaveBeenCalledWith(
				"https://tppz.ebay.com/developer/registration/v1/client/register",
				clientSettings,
				{ absolute: true },
			);
			expect(registration).toEqual(mockResponse);
		});
	});

	describe("getSigningKeys", () => {
		it("get all signing keys", async () => {
			const mockResponse = {
				signingKeys: [
					{
						signingKeyId: "key_001",
						creationTime: "2024-01-01T00:00:00.000Z",
						expirationTime: "2025-01-01T00:00:00.000Z",
						jwe: "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...",
						publicKey: "-----BEGIN PUBLIC KEY-----\nMIIB...",
					},
					{
						signingKeyId: "key_002",
						creationTime: "2024-06-01T00:00:00.000Z",
						expirationTime: "2025-06-01T00:00:00.000Z",
						jwe: "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...",
						publicKey: "-----BEGIN PUBLIC KEY-----\nMIIC...",
					},
				],
			};

			vi.mocked(client.get).mockResolvedValue(mockResponse);

			const signingKeyList = await api.getSigningKeys({});

			expect(client.get).toHaveBeenCalledWith(
				"https://apiz.ebay.com/developer/key_management/v1/signing_key",
				undefined,
				{ absolute: true, tokenType: "application" },
			);
			expect(signingKeyList).toEqual(mockResponse);
			expect(signingKeyList.signingKeys).toHaveLength(2);
		});

		it("return empty array when no signing keys exist", async () => {
			const mockResponse = { signingKeys: [] };
			vi.mocked(client.get).mockResolvedValue(mockResponse);

			const signingKeyList = await api.getSigningKeys({});

			expect(client.get).toHaveBeenCalledWith(
				"https://apiz.ebay.com/developer/key_management/v1/signing_key",
				undefined,
				{ absolute: true, tokenType: "application" },
			);
			expect(signingKeyList.signingKeys).toHaveLength(0);
		});
	});

	describe("createSigningKey", () => {
		it("create a signing key without request body", async () => {
			const mockResponse = {
				signingKeyId: "new_key_123",
				creationTime: "2024-01-15T12:00:00.000Z",
				expirationTime: "2025-01-15T12:00:00.000Z",
				jwe: "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...",
				publicKey:
					"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
				privateKey:
					"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAAOCAQ8A...",
			};

			vi.mocked(client.post).mockResolvedValue(mockResponse);

			const signingKey = await api.createSigningKey({});

			expect(client.post).toHaveBeenCalledWith(
				"https://apiz.ebay.com/developer/key_management/v1/signing_key",
				{},
				{ absolute: true, tokenType: "application" },
			);
			expect(signingKey).toEqual(mockResponse);
			expect(signingKey.signingKeyId).toBe("new_key_123");
		});

		it("create a signing key with request body", async () => {
			const input = {
				request: {
					signingKeyCipher: "RSA",
				},
			};

			const mockResponse = {
				signingKeyId: "rsa_key_456",
				creationTime: "2024-01-15T12:00:00.000Z",
				expirationTime: "2025-01-15T12:00:00.000Z",
				jwe: "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...",
				publicKey: "-----BEGIN PUBLIC KEY-----\nMIIBIjAN...",
			};

			vi.mocked(client.post).mockResolvedValue(mockResponse);

			const signingKey = await api.createSigningKey(input);

			expect(client.post).toHaveBeenCalledWith(
				"https://apiz.ebay.com/developer/key_management/v1/signing_key",
				input.request,
				{ absolute: true, tokenType: "application" },
			);
			expect(signingKey).toEqual(mockResponse);
		});

		it("fails with EbayApiError carrying the relative eBay path", async () => {
			vi.mocked(client.post).mockRejectedValue(
				new Error("eBay API Error: Bad request"),
			);

			const error = await readFailure(function createSigningKey() {
				return api.createSigningKey({});
			});

			expect((error as Error).message).toMatch(/^eBay /);
			expect((error as Error).message).toContain(
				`eBay POST /developer/key_management/v1/signing_key failed`,
			);
		});
	});

	describe("getSigningKey", () => {
		it("get a specific signing key by ID", async () => {
			const mockResponse = {
				signingKeyId: "key_001",
				creationTime: "2024-01-01T00:00:00.000Z",
				expirationTime: "2025-01-01T00:00:00.000Z",
				jwe: "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...",
				publicKey: "-----BEGIN PUBLIC KEY-----\nMIIBIjAN...",
			};

			vi.mocked(client.get).mockResolvedValue(mockResponse);

			const signingKey = await api.getSigningKey({ signingKeyId: "key_001" });

			expect(client.get).toHaveBeenCalledWith(
				"https://apiz.ebay.com/developer/key_management/v1/signing_key/key_001",
				undefined,
				{ absolute: true, tokenType: "application" },
			);
			expect(signingKey).toEqual(mockResponse);
			expect(signingKey.signingKeyId).toBe("key_001");
		});

		it("encodes the signing key ID in the path", async () => {
			vi.mocked(client.get).mockResolvedValue({});

			await api.getSigningKey({ signingKeyId: "key/1?x" });

			expect(client.get).toHaveBeenCalledWith(
				"https://apiz.ebay.com/developer/key_management/v1/signing_key/key%2F1%3Fx",
				undefined,
				{ absolute: true, tokenType: "application" },
			);
		});

		it("handle API errors when getting signing key", async () => {
			vi.mocked(client.get).mockRejectedValue(new Error("Key not found"));

			const error = await readFailure(function getMissingSigningKey() {
				return api.getSigningKey({ signingKeyId: "nonexistent_key" });
			});

			expect((error as Error).message).toMatch(/^eBay /);
			expect((error as Error).message).toContain(
				`eBay GET /developer/key_management/v1/signing_key/nonexistent_key failed`,
			);
		});
	});

	describe("getSigningKey input validation", () => {
		it("returns typed input error when signingKeyId is empty", async () => {
			const error = await readFailure(function getSigningKeyWithoutId() {
				return api.getSigningKey({ signingKeyId: "" });
			});

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toContain("signingKeyId");
		});

		it("returns typed input error when signingKeyId is null", async () => {
			const error = await readFailure(function getSigningKeyWithNullId() {
				return api.getSigningKey(invalidInput({ signingKeyId: null }));
			});

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toContain("signingKeyId");
		});

		it("returns typed input error when input is undefined", async () => {
			const error = await readFailure(function getSigningKeyWithoutInput() {
				return api.getSigningKey(invalidInput(undefined));
			});

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toContain("input");
		});

		it("returns typed input error when signingKeyId is not a string", async () => {
			const error = await readFailure(function getSigningKeyWithNumericId() {
				return api.getSigningKey(invalidInput({ signingKeyId: 123 }));
			});

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toContain("signingKeyId");
		});
	});

	describe("error handling", () => {
		it("propagate errors from getRateLimits", async () => {
			vi.mocked(client.get).mockRejectedValue(
				new Error("Rate limit API unavailable"),
			);

			const error = await (async () => {
				try {
					await api.getRateLimits({});
				} catch (error) {
					return error;
				}

				throw new Error("expected failure");
			})();

			expect((error as Error).message).toMatch(/^eBay /);
		});

		it("propagate errors from getUserRateLimits", async () => {
			vi.mocked(client.get).mockRejectedValue(
				new Error("User rate limit API unavailable"),
			);

			const error = await (async () => {
				try {
					await api.getUserRateLimits({});
				} catch (error) {
					return error;
				}

				throw new Error("expected failure");
			})();

			expect((error as Error).message).toMatch(/^eBay /);
		});

		it("propagate errors from registerClient", async () => {
			vi.mocked(client.post).mockRejectedValue(
				new Error("Registration failed"),
			);

			const error = await (async () => {
				try {
					await api.registerClient({ clientSettings: invalidInput({}) });
				} catch (error) {
					return error;
				}

				throw new Error("expected failure");
			})();

			expect((error as Error).message).toMatch(/^eBay /);
		});

		it("propagate errors from getSigningKeys", async () => {
			vi.mocked(client.get).mockRejectedValue(
				new Error("Key management API unavailable"),
			);

			const error = await readFailure(function getSigningKeys() {
				return api.getSigningKeys({});
			});

			expect((error as Error).message).toMatch(/^eBay /);
		});

		it("propagate errors from createSigningKey", async () => {
			vi.mocked(client.post).mockRejectedValue(
				new Error("Key creation failed"),
			);

			const error = await readFailure(function createSigningKeyAgain() {
				return api.createSigningKey({});
			});

			expect((error as Error).message).toMatch(/^eBay /);
		});
	});
});
