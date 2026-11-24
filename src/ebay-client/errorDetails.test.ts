import { describe, expect, it } from "vitest";
import { EbayClientRequestError } from "@/ebay-client/ebayClientRequestError.js";
import { EbayApiError } from "@/ebay-client/request.js";
import { getEbayErrorDetails } from "@/shared/errors.js";

describe("getEbayErrorDetails", () => {
	it("returns REST status and details from an EbayApiError", () => {
		const eBayErrors = [
			{
				errorId: 2004,
				longMessage: "Invalid request payload",
				parameters: [{ name: "sku", value: "BAD" }],
			},
		];
		const apiError = new EbayApiError({
			method: "PUT",
			path: "/sell/inventory/v1/inventory_item/BAD",
			cause: { status: 400, data: { errors: eBayErrors } },
		});

		expect(getEbayErrorDetails(apiError)).toEqual({
			message: "Invalid request payload",
			status: 400,
			errors: eBayErrors,
		});
	});

	it("unwraps a fiber failure cause and returns REST status and details", () => {
		const eBayErrors = [
			{
				errorId: 2004,
				longMessage: "Invalid request payload",
				parameters: [{ name: "sku", value: "BAD" }],
			},
		];
		const apiError = new EbayApiError({
			method: "PUT",
			path: "/sell/inventory/v1/inventory_item/BAD",
			cause: { status: 400, data: { errors: eBayErrors } },
		});
		const caught = {
			[Symbol.for("effect/Runtime/FiberFailure/Cause")]: {
				_tag: "Fail",
				error: apiError,
			},
		};

		expect(getEbayErrorDetails(caught)).toEqual({
			message: "Invalid request payload",
			status: 400,
			errors: eBayErrors,
		});
	});

	it("preserves remediation guidance while retaining raw error details", () => {
		const eBayErrors = [{ errorId: 1, longMessage: "raw rate-limit response" }];
		const error = new EbayClientRequestError({
			kind: "remoteRateLimit",
			method: "GET",
			url: "https://api.ebay.com/x",
			message: "eBay API rate limit exceeded. Retry after 12 seconds.",
			status: 429,
			cause: { status: 429, data: { errors: eBayErrors } },
		});

		expect(getEbayErrorDetails(error)).toEqual({
			message: "eBay API rate limit exceeded. Retry after 12 seconds.",
			status: 429,
			errors: eBayErrors,
		});
	});

	it("terminates a cyclic cause chain", () => {
		const cyclic: Record<string, unknown> = { message: "cyclic failure" };
		cyclic.cause = cyclic;

		expect(getEbayErrorDetails(cyclic)).toEqual({ message: "cyclic failure" });
	});
});
