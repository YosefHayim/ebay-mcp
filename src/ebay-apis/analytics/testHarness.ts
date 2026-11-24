import { vi } from "vitest";
import { AnalyticsApi } from "@/ebay-apis/analytics/analyticsApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

export interface AnalyticsApiHarness {
	readonly api: AnalyticsApi;
	readonly client: EbayApiClient;
}

export function createAnalyticsApiHarness(): AnalyticsApiHarness {
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
}

export async function captureThrown(call: Promise<unknown>): Promise<unknown> {
	try {
		await call;
	} catch (caught) {
		return caught;
	}

	throw new Error("expected the call to throw");
}
