import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NegotiationApi } from "@/ebay-apis/communication/negotiationApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

let client: EbayApiClient;
let api: NegotiationApi;

beforeEach(() => {
	client = {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	} as unknown as EbayApiClient;
	api = new NegotiationApi(client);
});

describe("sendOfferToInterestedBuyers", () => {
	it("send offer to interested buyers", async () => {
		const mockResponse = { offerId: "123" };
		const offerData = {
			offeredItems: [
				{ listingId: "123", price: { value: "10.00", currency: "USD" } },
			],
		};
		vi.mocked(client.post).mockResolvedValue(mockResponse);

		await api.sendOfferToInterestedBuyers({
			...offerData,
			marketplaceId: "EBAY_US",
		});

		expect(client.post).toHaveBeenCalledWith(
			"/sell/negotiation/v1/send_offer_to_interested_buyers",
			offerData,
			{ headers: { "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" } },
		);
	});

	it("fail when offerData is missing", async () => {
		const error = await (async () => {
			try {
				await api.sendOfferToInterestedBuyers(invalidInput(undefined));
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("input is required");
	});
});

describe("findEligibleItems", () => {
	it("find eligible items with marketplace and pagination parameters", async () => {
		const mockResponse = { items: [] };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.findEligibleItems({
			marketplaceId: "EBAY_US",
			limit: 10,
			offset: 0,
		});

		expect(client.get).toHaveBeenCalledWith(
			"/sell/negotiation/v1/find_eligible_items",
			{
				limit: 10,
				offset: 0,
			},
			{ headers: { "X-EBAY-C-MARKETPLACE-ID": "EBAY_US" } },
		);
	});

	it("handle missing optional parameters", async () => {
		const mockResponse = { items: [] };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.findEligibleItems();

		expect(client.get).toHaveBeenCalledWith(
			"/sell/negotiation/v1/find_eligible_items",
		);
	});
});
