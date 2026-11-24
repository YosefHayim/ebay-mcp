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
/** Request body accepted by sendOfferToInterestedBuyers. */
type CreateOffersRequest = components["schemas"]["CreateOffersRequest"];

/**
 * Response returned by eBay Negotiation findEligibleItems.
 *
 * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/findEligibleItems
 */
export type FindEligibleItemsResponse =
	components["schemas"]["PagedEligibleItemCollection"];
/**
 * Response returned by eBay Negotiation sendOfferToInterestedBuyers.
 *
 * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/sendOfferToInterestedBuyers
 */
export type SendOfferToInterestedBuyersResponse =
	components["schemas"]["SendOfferToInterestedBuyersCollectionResponse"];

/**
 * Negotiation API - Buyer-seller negotiations and offers
 * Based on: sell_negotiation_v1_oas3.json
 */
export class NegotiationApi {
	private readonly basePath = "/sell/negotiation/v1";
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Finds listings eligible for a seller-initiated offer.
	 *
	 * @param input - Optional marketplace header override plus pagination query parameters.
	 * @returns eBay's generated PagedEligibleItemCollection.
	 *
	 * @example
	 * ```ts
	 * const eligible = await negotiationApi.findEligibleItems({ marketplaceId: 'EBAY_US', limit: 10 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/findEligibleItems
	 */
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

	/**
	 * Sends an offer to buyers interested in a listing.
	 *
	 * @param input - Offer body fields plus optional marketplace header override.
	 * @returns eBay's generated offer collection response.
	 *
	 * @example
	 * ```ts
	 * const offers = await negotiationApi.sendOfferToInterestedBuyers({
	 *     marketplaceId: 'EBAY_US',
	 *     message: 'Limited offer',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/sendOfferToInterestedBuyers
	 */
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
