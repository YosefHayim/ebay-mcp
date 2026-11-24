import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetadataApi } from "@/ebay-apis/metadata/metadataApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { MarketplaceId } from "@/shared/ebayEnums.js";

async function readThrownError(call: Promise<unknown>): Promise<
	Error & {
		_tag: string;
		parameter: string;
		method: string;
		path: string;
		cause: unknown;
	}
> {
	try {
		await call;
	} catch (error) {
		return error as Error & {
			_tag: string;
			parameter: string;
			method: string;
			path: string;
			cause: unknown;
		};
	}

	throw new Error("expected the call to throw");
}

const SHIPPING = "/sell/metadata/v1/shipping/marketplace";
const client = { get: vi.fn() };
// MetadataApi only reaches client.get for the shipping:marketplace methods.
const api = new MetadataApi(client as unknown as EbayApiClient);

beforeEach(() => {
	vi.resetAllMocks();
});

describe("MetadataApi shipping:marketplace methods", () => {
	it.each([
		["getExcludeShippingLocations", "get_exclude_shipping_locations"],
		["getHandlingTimes", "get_handling_times"],
		["getShippingCarriers", "get_shipping_carriers"],
		["getShippingLocations", "get_shipping_locations"],
		["getShippingServices", "get_shipping_services"],
	] as const)("%s GETs the marketplace path and returns eBay data unchanged", async (method, resource) => {
		const stubShippingMetadata = {
			[resource]: [{ description: "eBay value" }],
		};
		client.get.mockResolvedValue(stubShippingMetadata);

		const shippingMetadata = await api[method]({
			marketplaceId: MarketplaceId.EBAY_US,
		});

		expect(shippingMetadata).toBe(stubShippingMetadata);
		expect(client.get).toHaveBeenCalledWith(`${SHIPPING}/EBAY_US/${resource}`);
	});

	it("sends Accept-Language only when the caller selects a localized marketplace", async () => {
		client.get.mockResolvedValue({ shippingServices: [] });

		await api.getShippingServices({
			marketplaceId: MarketplaceId.EBAY_CA,
			acceptLanguage: "fr-CA",
		});

		expect(client.get).toHaveBeenCalledWith(
			`${SHIPPING}/EBAY_CA/get_shipping_services`,
			undefined,
			{ headers: { "Accept-Language": "fr-CA" } },
		);
	});

	it("rejects an unknown marketplace before any request", async () => {
		const error = await readThrownError(
			api.getShippingCarriers(invalidInput({ marketplaceId: "EBAY_XX" })),
		);

		expect(error._tag).toBe("EndpointInputError");
		expect(client.get).not.toHaveBeenCalled();
	});

	it("wraps transport failures in a tagged EbayApiError with the request path", async () => {
		client.get.mockRejectedValue(new Error("eBay 500"));

		const error = await readThrownError(
			api.getHandlingTimes({ marketplaceId: MarketplaceId.EBAY_GB }),
		);

		expect(error).toMatchObject({
			_tag: "EbayApiError",
			method: "GET",
			path: `${SHIPPING}/EBAY_GB/get_handling_times`,
		});
	});
});
