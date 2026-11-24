import type { z } from "zod";
import {
	getCharityOrgInputSchema,
	getCharityOrgsInputSchema,
} from "@/ebay-apis/taxonomy/charitySchemas.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	decodeEndpointInputEffect,
	requestGetEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceCharityV1Oas3.js";

const BASE_PATH = "/commerce/charity/v1";

function charityRequestConfig(marketplaceId: string): EbayRequestConfig {
	return {
		headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId },
		tokenType: "application",
	};
}

export type GetCharityOrgInput = z.infer<typeof getCharityOrgInputSchema>;

export type GetCharityOrgsInput = z.infer<typeof getCharityOrgsInputSchema>;

export type CharityOrgResponse = components["schemas"]["CharityOrg"];

export type CharitySearchResponse =
	components["schemas"]["CharitySearchResponse"];

export class CharityApi {
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public getCharityOrg = async (
		input: GetCharityOrgInput,
	): Promise<CharityOrgResponse> => {
		const { charityOrgId, marketplaceId } = decodeEndpointInputEffect(
			getCharityOrgInputSchema,
			input,
		);

		return requestGetEffect<CharityOrgResponse>(
			this.client,
			`${BASE_PATH}/charity_org/${encodeURIComponent(charityOrgId)}`,
			undefined,
			charityRequestConfig(marketplaceId),
		);
	};

	public getCharityOrgs = async (
		input: GetCharityOrgsInput,
	): Promise<CharitySearchResponse> => {
		const search = decodeEndpointInputEffect(getCharityOrgsInputSchema, input);
		const hasNeitherQuery =
			search.q === undefined && search.registrationIds === undefined;
		const hasBothQueries =
			search.q !== undefined && search.registrationIds !== undefined;

		if (hasNeitherQuery) {
			throw new Error(
				"Supply either q or registrationIds to search charities, but not both",
			);
		}

		if (hasBothQueries) {
			throw new Error(
				"Supply either q or registrationIds to search charities, but not both",
			);
		}

		const params = buildEndpointParams({
			q: { wireName: "q", value: search.q },
			registrationIds: {
				wireName: "registration_ids",
				value: search.registrationIds,
			},
			limit: { wireName: "limit", value: search.limit },
			offset: { wireName: "offset", value: search.offset },
		});

		return requestGetEffect<CharitySearchResponse>(
			this.client,
			`${BASE_PATH}/charity_org`,
			params,
			charityRequestConfig(search.marketplaceId),
		);
	};
}
