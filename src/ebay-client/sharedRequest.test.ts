import { describe, expect, it, vi } from "vitest";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	marketplaceHeader,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPatchEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";

async function rejected(read: () => unknown): Promise<unknown> {
	try {
		await read();
	} catch (error) {
		return error;
	}

	throw new Error("expected a failure");
}

describe("shared API request helpers", () => {
	it("builds endpoint-owned query params and omits empty values", () => {
		expect(
			buildEndpointParams({
				policyTypes: { wireName: "policy_types", value: "TAKE_BACK" },
				missing: { wireName: "missing", value: undefined },
				empty: { wireName: "empty", value: "" },
			}),
		).toEqual({ policy_types: "TAKE_BACK" });

		expect(
			buildEndpointParams({
				missing: { wireName: "missing", value: undefined },
				empty: { wireName: "empty", value: "" },
			}),
		).toBeUndefined();
	});

	it("rejects invalid required endpoint values", async () => {
		const stringError = await rejected(() => requireStringEffect("", "sku"));
		const objectError = await rejected(() => requireObjectEffect(null, "body"));

		expect(stringError).toBeInstanceOf(Error);
		expect((stringError as Error).message).toBe(
			"sku is required and must be a string",
		);
		expect(objectError).toBeInstanceOf(Error);
		expect((objectError as Error).message).toBe(
			"body is required and must be an object",
		);
	});

	it("checks optional query values", async () => {
		expect(optionalStringEffect(undefined, "filter")).toBe(undefined);
		expect(optionalPositiveNumberEffect(50, "limit")).toBe(50);
		expect(optionalNonNegativeNumberEffect(0, "offset")).toBe(0);

		const stringError = await rejected(() => optionalStringEffect(1, "filter"));
		const limitError = await rejected(() =>
			optionalPositiveNumberEffect(0, "limit"),
		);
		const offsetError = await rejected(() =>
			optionalNonNegativeNumberEffect(-1, "offset"),
		);

		expect((stringError as Error).message).toBe(
			"filter must be a string when provided",
		);
		expect((limitError as Error).message).toBe(
			"limit must be a positive number when provided",
		);
		expect((offsetError as Error).message).toBe(
			"offset must be a non-negative number when provided",
		);
	});

	it("builds a per-call marketplace header config", () => {
		expect(marketplaceHeader("EBAY_GB")).toEqual({
			headers: { "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB" },
		});
	});

	it("wraps a failed GET in EbayApiError", async () => {
		const client = {
			get: vi.fn().mockRejectedValue(new Error("network down")),
		} as unknown as EbayApiClient;

		const error = await rejected(() =>
			requestGetEffect(client, "/sell/account/v1/custom_policy", {
				policy_types: "TAKE_BACK",
			}),
		);

		expect(client.get).toHaveBeenCalledWith("/sell/account/v1/custom_policy", {
			policy_types: "TAKE_BACK",
		});
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe(
			"eBay GET /sell/account/v1/custom_policy failed: network down",
		);
	});

	it("wraps a failed PATCH in EbayApiError", async () => {
		const client = {
			patch: vi.fn().mockRejectedValue(new Error("conflict")),
		} as unknown as EbayApiClient;
		const config = { headers: { "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" } };

		const error = await rejected(() =>
			requestPatchEffect(
				client,
				"/sell/account/v2/user_preferences",
				{},
				config,
			),
		);

		expect(client.patch).toHaveBeenCalledWith(
			"/sell/account/v2/user_preferences",
			{},
			config,
		);
		expect((error as Error).message).toBe(
			"eBay PATCH /sell/account/v2/user_preferences failed: conflict",
		);
	});

	it("builds the failure message from method, path, and cause", async () => {
		const postClient = {
			post: vi.fn().mockRejectedValue(new Error("rate limited")),
		} as unknown as EbayApiClient;
		const deleteClient = {
			delete: vi.fn().mockRejectedValue("gone"),
		} as unknown as EbayApiClient;

		const fromError = await rejected(() =>
			requestPostEffect(postClient, "/sell/inventory/v1/offer"),
		);
		const fromString = await rejected(() =>
			requestDeleteEffect(deleteClient, "/sell/inventory/v1/offer/1"),
		);

		expect((fromError as Error).message).toBe(
			"eBay POST /sell/inventory/v1/offer failed: rate limited",
		);
		expect((fromString as Error).message).toBe(
			"eBay DELETE /sell/inventory/v1/offer/1 failed: gone",
		);
	});
});
