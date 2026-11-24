import type { z } from "zod";
import type {
	findEligibleItemsSchema,
	sendOfferToInterestedBuyersSchema,
} from "@/ebay-apis/communication/negotiationHelpers.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellNegotiationV1Oas3.js";

type FindEligibleItemsInput = z.infer<typeof findEligibleItemsSchema>;
type SendOfferToInterestedBuyersInput = z.infer<
	typeof sendOfferToInterestedBuyersSchema
>;
type CreateOffersRequest = components["schemas"]["CreateOffersRequest"];

export type FindEligibleItemsResponse =
	components["schemas"]["PagedEligibleItemCollection"];
export type SendOfferToInterestedBuyersResponse =
	components["schemas"]["SendOfferToInterestedBuyersCollectionResponse"];

export class NegotiationApi {
	private readonly basePath = "/sell/negotiation/v1";
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	findEligibleItems = async (
		input: FindEligibleItemsInput = {},
	): Promise<FindEligibleItemsResponse> => {
		const apiClient = this.client;
		const path = `${this.basePath}/find_eligible_items`;

		const validatedInput = requireObjectEffect<FindEligibleItemsInput>(
			input,
			"input",
		);
		const {
			marketplaceId: inputMarketplaceId,
			limit: inputLimit,
			offset: inputOffset,
		} = validatedInput;
		const marketplaceId = optionalStringEffect(
			inputMarketplaceId,
			"marketplaceId",
		);
		const limit = optionalPositiveNumberEffect(inputLimit, "limit");
		const offset = optionalNonNegativeNumberEffect(inputOffset, "offset");
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: limit },
			offset: { wireName: "offset", value: offset },
		});
		const config: EbayRequestConfig | undefined =
			marketplaceId === undefined
				? undefined
				: { headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId } };

		return await requestGetEffect<FindEligibleItemsResponse>(
			apiClient,
			path,
			params,
			config,
		);
	};

	sendOfferToInterestedBuyers = async (
		input: SendOfferToInterestedBuyersInput,
	): Promise<SendOfferToInterestedBuyersResponse> => {
		const apiClient = this.client;
		const path = `${this.basePath}/send_offer_to_interested_buyers`;

		const validatedInput =
			requireObjectEffect<SendOfferToInterestedBuyersInput>(input, "input");
		const { marketplaceId, ...offerData } = validatedInput;
		const createOffersRequest = requireObjectEffect<CreateOffersRequest>(
			offerData,
			"offerData",
		);
		const validatedMarketplaceId = optionalStringEffect(
			marketplaceId,
			"marketplaceId",
		);
		const config: EbayRequestConfig | undefined =
			validatedMarketplaceId === undefined
				? undefined
				: { headers: { "X-EBAY-C-MARKETPLACE-ID": validatedMarketplaceId } };

		return await requestPostEffect<SendOfferToInterestedBuyersResponse>(
			apiClient,
			path,
			createOffersRequest,
			config,
		);
	};
}
