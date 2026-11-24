import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellRecommendationV1Oas3.js";

export interface FindListingRecommendationsInput {
	readonly requestBody?: FindListingRecommendationRequest;
	readonly filter?: string;
	readonly limit?: number;
	readonly offset?: number;
	readonly marketplaceId: string;
}

export type FindListingRecommendationRequest =
	components["schemas"]["FindListingRecommendationRequest"];

export type PagedListingRecommendationCollection =
	components["schemas"]["PagedListingRecommendationCollection"];

export class RecommendationApi {
	private readonly basePath = "/sell/recommendation/v1";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public findListingRecommendations = async (
		input: FindListingRecommendationsInput,
	): Promise<PagedListingRecommendationCollection> => {
		const client = this.client;
		const path = `${this.basePath}/find`;

		const validatedInput = requireObjectEffect<FindListingRecommendationsInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const filter = optionalStringEffect(validatedInput.filter, "filter");
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		let requestBody: FindListingRecommendationRequest = {};

		if (validatedInput.requestBody !== undefined) {
			requestBody = requireObjectEffect<FindListingRecommendationRequest>(
				validatedInput.requestBody,
				"requestBody",
			);
		}

		const params = buildEndpointParams({
			filter: { wireName: "filter", value: filter },
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
		});
		const config: EbayRequestConfig = {
			headers: {
				"X-EBAY-C-MARKETPLACE-ID": marketplaceId,
			},
		};

		if (params !== undefined) {
			config.params = params;
		}

		return await requestPostEffect<PagedListingRecommendationCollection>(
			client,
			path,
			requestBody,
			config,
		);
	};
}
