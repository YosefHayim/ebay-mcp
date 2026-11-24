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
	EndpointInputError,
	requestGetEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceCharityV1Oas3.js";

const BASE_PATH = "/commerce/charity/v1";

/**
 * eBay documents the Charity API as client-credentials only (api_scope) with a required
 * marketplace header, so every call sends the application token and the caller's marketplace.
 */
const charityRequestConfig = (marketplaceId: string): EbayRequestConfig => ({
	headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId },
	tokenType: "application",
});

/** Charity organization ID and marketplace accepted by getCharityOrg. */
export type GetCharityOrgInput = z.infer<typeof getCharityOrgInputSchema>;

/** Marketplace, search criteria (q or registrationIds), and paging accepted by getCharityOrgs. */
export type GetCharityOrgsInput = z.infer<typeof getCharityOrgsInputSchema>;

/**
 * Response returned by getCharityOrg.
 *
 * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrg
 */
export type CharityOrgResponse = components["schemas"]["CharityOrg"];

/**
 * Response returned by getCharityOrgs.
 *
 * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrgs
 */
export type CharitySearchResponse =
	components["schemas"]["CharitySearchResponse"];

/** Charity API - charitable organizations supported by eBay for Charity. */
export class CharityApi {
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Retrieves one charitable organization supported by eBay for Charity.
	 *
	 * @param input - Charity organization ID and the EBAY_US or EBAY_GB marketplace.
	 * @returns eBay's CharityOrg.
	 *
	 * @example
	 * ```ts
	 * const charity = await charityApi.getCharityOrg({ charityOrgId: '1234', marketplaceId: 'EBAY_US' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrg
	 */
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

	/**
	 * Searches charitable organizations supported by eBay for Charity by keywords or by
	 * registration IDs (eBay requires exactly one of the two).
	 *
	 * @param input - Marketplace, q or registrationIds, and optional limit/offset paging.
	 * @returns eBay's paginated CharitySearchResponse.
	 *
	 * @example
	 * ```ts
	 * const results = await charityApi.getCharityOrgs({ marketplaceId: 'EBAY_US', q: 'animal rescue', limit: 10 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrgs
	 */
	public getCharityOrgs = async (
		input: GetCharityOrgsInput,
	): Promise<CharitySearchResponse> => {
		const search = decodeEndpointInputEffect(getCharityOrgsInputSchema, input);
		const hasNeitherQuery =
			search.q === undefined && search.registrationIds === undefined;
		const hasBothQueries =
			search.q !== undefined && search.registrationIds !== undefined;

		if (hasNeitherQuery) {
			throw new EndpointInputError({
				parameter: "q",
				message:
					"Supply either q or registrationIds to search charities, but not both",
			});
		}

		if (hasBothQueries) {
			throw new EndpointInputError({
				parameter: "q",
				message:
					"Supply either q or registrationIds to search charities, but not both",
			});
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
