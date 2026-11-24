import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, expect, it, vi } from "vitest";
import type { AnalyticsApiHarness } from "./testHarness.js";
import { captureThrown, createAnalyticsApiHarness } from "./testHarness.js";

let harness: AnalyticsApiHarness;

beforeEach(() => {
	harness = createAnalyticsApiHarness();
});

it("findSellerStandardsProfiles gets all seller standards profiles", async () => {
	const mockResponse = {
		standardsProfiles: [
			{
				cycle: { cycleType: "CURRENT" },
				defaultProgram: true,
				evaluationDate: "2024-01-01",
				program: "CUSTOMER_SERVICE",
				standardsLevel: "STANDARD",
			},
		],
	};
	vi.mocked(harness.client.get).mockResolvedValue(mockResponse);

	const profiles = await harness.api.findSellerStandardsProfiles({});

	expect(profiles).toEqual(mockResponse);
	expect(harness.client.get).toHaveBeenCalledWith(
		"/sell/analytics/v1/seller_standards_profile",
	);
});

it("findSellerStandardsProfiles wraps transport failures in EbayApiError", async () => {
	vi.mocked(harness.client.get).mockRejectedValue(new Error("API Error"));

	const error = await captureThrown(
		harness.api.findSellerStandardsProfiles({}),
	);

	expect((error as Error).message).toMatch(/^eBay /);
});

it("getSellerStandardsProfile gets a specific seller standards profile", async () => {
	const mockResponse = {
		cycle: { cycleType: "CURRENT" },
		defaultProgram: true,
		program: "CUSTOMER_SERVICE",
	};
	vi.mocked(harness.client.get).mockResolvedValue(mockResponse);

	const profile = await harness.api.getSellerStandardsProfile({
		program: "CUSTOMER_SERVICE",
		cycle: "CURRENT",
	});

	expect(profile).toEqual(mockResponse);
	expect(harness.client.get).toHaveBeenCalledWith(
		"/sell/analytics/v1/seller_standards_profile/CUSTOMER_SERVICE/CURRENT",
	);
});

it("getSellerStandardsProfile fails with a tagged error when program is missing", async () => {
	const error = await captureThrown(
		harness.api.getSellerStandardsProfile({
			program: invalidInput(""),
			cycle: "CURRENT",
		}),
	);

	expect((error as Error).message).toContain("program");
});

it("getSellerStandardsProfile fails with a tagged error when cycle is missing", async () => {
	const error = await captureThrown(
		harness.api.getSellerStandardsProfile({
			program: "CUSTOMER_SERVICE",
			cycle: invalidInput(""),
		}),
	);

	expect((error as Error).message).toContain("cycle");
});

it("getSellerStandardsProfile wraps transport failures in EbayApiError", async () => {
	vi.mocked(harness.client.get).mockRejectedValue(new Error("Not Found"));

	const error = await captureThrown(
		harness.api.getSellerStandardsProfile({
			program: "CUSTOMER_SERVICE",
			cycle: "CURRENT",
		}),
	);

	expect((error as Error).message).toMatch(/^eBay /);
});
