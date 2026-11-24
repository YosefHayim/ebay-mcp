import { describe, expect, it, vi } from "vitest";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	EbayApiError,
	marketplaceHeader,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestGetEffect,
	requestPatchEffect,
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

		expect(stringError).toMatchObject({
			_tag: "EndpointInputError",
			parameter: "sku",
		});
		expect(objectError).toMatchObject({
			_tag: "EndpointInputError",
			parameter: "body",
		});
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

		expect(stringError).toMatchObject({
			_tag: "EndpointInputError",
			parameter: "filter",
		});
		expect(limitError).toMatchObject({
			_tag: "EndpointInputError",
			parameter: "limit",
		});
		expect(offsetError).toMatchObject({
			_tag: "EndpointInputError",
			parameter: "offset",
		});
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
		expect(error).toBeInstanceOf(EbayApiError);
		expect(error).toMatchObject({
			_tag: "EbayApiError",
			method: "GET",
			path: "/sell/account/v1/custom_policy",
		});
		expect(error).toMatchObject({
			message: "eBay GET /sell/account/v1/custom_policy failed: network down",
		});
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
		expect(error).toMatchObject({
			_tag: "EbayApiError",
			method: "PATCH",
			path: "/sell/account/v2/user_preferences",
		});
	});

	it("builds EbayApiError.message from method, path, and cause", () => {
		const fromError = new EbayApiError({
			method: "POST",
			path: "/sell/inventory/v1/offer",
			cause: new Error("rate limited"),
		});
		expect(fromError.message).toBe(
			"eBay POST /sell/inventory/v1/offer failed: rate limited",
		);

		const fromString = new EbayApiError({
			method: "DELETE",
			path: "/sell/inventory/v1/offer/1",
			cause: "gone",
		});
		expect(fromString.message).toBe(
			"eBay DELETE /sell/inventory/v1/offer/1 failed: gone",
		);
	});
});
