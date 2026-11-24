import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationApi } from "@/ebay-apis/communication/notificationApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

let client: EbayApiClient;
let api: NotificationApi;

beforeEach(() => {
	client = {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	} as unknown as EbayApiClient;
	api = new NotificationApi(client);
});

describe("getPublicKey", () => {
	it("get public key by ID", async () => {
		const mockResponse = { publicKey: "key123" };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getPublicKey({ publicKeyId: "key123" });

		expect(client.get).toHaveBeenCalledWith(
			"/commerce/notification/v1/public_key/key123",
		);
	});

	it("fail when publicKeyId is missing", async () => {
		const error = await (async () => {
			try {
				await api.getPublicKey({ publicKeyId: "" });
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error).toBeInstanceOf(Error);
		expect(error.message).toContain("publicKeyId is required");
	});
});

describe("getConfig", () => {
	it("get notification configuration", async () => {
		const mockResponse = { config: {} };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getConfig({});

		expect(client.get).toHaveBeenCalledWith("/commerce/notification/v1/config");
	});
});

describe("updateConfig", () => {
	it("update notification configuration", async () => {
		const mockResponse = { success: true };
		const config = { alertEmail: "alerts@example.com" };
		vi.mocked(client.put).mockResolvedValue(mockResponse);

		await api.updateConfig(config);

		expect(client.put).toHaveBeenCalledWith(
			"/commerce/notification/v1/config",
			config,
		);
	});

	it("fail when config is missing", async () => {
		const error = await (async () => {
			try {
				await api.updateConfig(invalidInput(undefined));
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error).toBeInstanceOf(Error);
		expect(error.message).toContain("input is required");
	});
});
