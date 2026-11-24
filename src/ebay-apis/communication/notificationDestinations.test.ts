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

describe("getDestination", () => {
	it("get destination by ID", async () => {
		const mockResponse = { destinationId: "dest123" };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getDestination({ destinationId: "dest123" });

		expect(client.get).toHaveBeenCalledWith(
			"/commerce/notification/v1/destination/dest123",
		);
	});

	it("fail when destinationId is missing", async () => {
		const error = await (async () => {
			try {
				await api.getDestination({ destinationId: "" });
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("destinationId is required");
	});
});

describe("createDestination", () => {
	it("create notification destination", async () => {
		const mockResponse = { destinationId: "123" };
		const destination = {
			name: "webhook",
			deliveryConfig: {
				endpoint: "https://example.com/webhook",
				verificationToken: "token123456789012345678901234567",
			},
		};
		vi.mocked(client.post).mockResolvedValue(mockResponse);

		await api.createDestination(destination);

		expect(client.post).toHaveBeenCalledWith(
			"/commerce/notification/v1/destination",
			destination,
		);
	});

	it("fail when destination is missing", async () => {
		const error = await (async () => {
			try {
				await api.createDestination(invalidInput(undefined));
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("input is required");
	});
});

describe("updateDestination", () => {
	it("update notification destination", async () => {
		const mockResponse = { success: true };
		const destination = {
			deliveryConfig: { endpoint: "https://new-endpoint.com/webhook" },
		};
		vi.mocked(client.put).mockResolvedValue(mockResponse);

		await api.updateDestination({ destinationId: "dest123", ...destination });

		expect(client.put).toHaveBeenCalledWith(
			"/commerce/notification/v1/destination/dest123",
			destination,
		);
	});

	it("fail when destinationId is missing", async () => {
		const error = await (async () => {
			try {
				await api.updateDestination({ destinationId: "", ...invalidInput({}) });
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("destinationId is required");
	});

	it("fail when destination input is missing", async () => {
		const error = await (async () => {
			try {
				await api.updateDestination(invalidInput(undefined));
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("input is required");
	});
});

describe("deleteDestination", () => {
	it("delete notification destination", async () => {
		vi.mocked(client.delete).mockResolvedValue(undefined);

		await api.deleteDestination({ destinationId: "dest123" });

		expect(client.delete).toHaveBeenCalledWith(
			"/commerce/notification/v1/destination/dest123",
		);
	});

	it("fail when destinationId is missing", async () => {
		const error = await (async () => {
			try {
				await api.deleteDestination({ destinationId: "" });
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("destinationId is required");
	});
});
