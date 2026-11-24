import { vi } from "vitest";
import { AnalyticsApi } from "@/ebay-apis/analytics/analyticsApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

/** Analytics API test harness with the API instance and mocked eBay client. */
export interface AnalyticsApiHarness {
	/** Analytics API under test. */
	readonly api: AnalyticsApi;
	/** Mocked eBay client used to assert request path and params. */
	readonly client: EbayApiClient;
}

/**
 * Creates an Analytics API instance with a mocked eBay client.
 *
 * @returns A fresh Analytics API test harness.
 *
 * @example
 * ```ts
 * const { api, client } = createAnalyticsApiHarness();
 * ```
 */
export const createAnalyticsApiHarness = (): AnalyticsApiHarness => {
	const client = {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	} as unknown as EbayApiClient;

	return {
		api: new AnalyticsApi(client),
		client,
	};
};

/**
 * Awaits a call that is expected to throw and returns that error.
 *
 * @param call - Promise expected to reject.
 * @returns The thrown error, unchanged.
 *
 * @example
 * ```ts
 * const error = await captureThrown(api.getTrafficReport(input));
 * ```
 */
export async function captureThrown(call: Promise<unknown>): Promise<unknown> {
	try {
		await call;
	} catch (caught) {
		return caught;
	}

	throw new Error("expected the call to throw");
}
