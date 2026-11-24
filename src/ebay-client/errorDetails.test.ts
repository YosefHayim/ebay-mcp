import { describe, expect, it } from "vitest";
import { getEbayErrorDetails } from "@/shared/errors.js";

describe("getEbayErrorDetails", () => {
	it("returns REST status and details from a nested error body", () => {
		const eBayErrors = [
			{
				errorId: 2004,
				longMessage: "Invalid request payload",
				parameters: [{ name: "sku", value: "BAD" }],
			},
		];
		const apiError = new Error(
			"eBay PUT /sell/inventory/v1/inventory_item/BAD failed: Invalid request payload",
			{ cause: { status: 400, data: { errors: eBayErrors } } },
		);

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
		const apiError = new Error(
			"eBay PUT /sell/inventory/v1/inventory_item/BAD failed: Invalid request payload",
			{ cause: { status: 400, data: { errors: eBayErrors } } },
		);
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

	it("keeps the rate-limit sentence from the thrown error", () => {
		const error = new Error(
			"eBay API rate limit exceeded. Retry after 12 seconds.",
			{ cause: { status: 429 } },
		);

		expect(getEbayErrorDetails(error)).toEqual({
			message: "eBay API rate limit exceeded. Retry after 12 seconds.",
			status: 429,
		});
	});

	it("terminates a cyclic cause chain", () => {
		const cyclic: Record<string, unknown> = { message: "cyclic failure" };
		cyclic.cause = cyclic;

		expect(getEbayErrorDetails(cyclic)).toEqual({ message: "cyclic failure" });
	});
});
