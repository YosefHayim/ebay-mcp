import type { EbayApiClient, EbayRequestConfig } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  decodeEndpointInputEffect,
  type EbayApiError,
  EndpointInputError,
  requestGetEffect,
} from '@/api/shared/request.js';
import { getCharityOrgInputSchema, getCharityOrgsInputSchema } from '@/schemas/taxonomy/charity.js';
import type { components } from '@/types/sell-apps/listing-metadata/commerceCharityV1Oas3.js';
import type { z } from 'zod';
import { Effect } from 'effect';

const BASE_PATH = '/commerce/charity/v1';

/**
 * eBay documents the Charity API as client-credentials only (api_scope) with a required
 * marketplace header, so every call sends the application token and the caller's marketplace.
 */
const charityRequestConfig = (marketplaceId: string): EbayRequestConfig => ({
  headers: { 'X-EBAY-C-MARKETPLACE-ID': marketplaceId },
  tokenType: 'application',
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
export type CharityOrgResponse = components['schemas']['CharityOrg'];

/**
 * Response returned by getCharityOrgs.
 *
 * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrgs
 */
export type CharitySearchResponse = components['schemas']['CharitySearchResponse'];

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
   * @returns An Effect that succeeds with eBay's CharityOrg.
   *
   * @example
   * ```ts
   * const charity = await Effect.runPromise(
   *   charityApi.getCharityOrg({ charityOrgId: '1234', marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrg
   */
  public getCharityOrg = (
    input: GetCharityOrgInput,
  ): Effect.Effect<CharityOrgResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;

    return Effect.gen(function* () {
      const { charityOrgId, marketplaceId } = yield* decodeEndpointInputEffect(
        getCharityOrgInputSchema,
        input,
      );

      return yield* requestGetEffect<CharityOrgResponse>(
        client,
        `${BASE_PATH}/charity_org/${encodeURIComponent(charityOrgId)}`,
        undefined,
        charityRequestConfig(marketplaceId),
      );
    });
  };

  /**
   * Searches charitable organizations supported by eBay for Charity by keywords or by
   * registration IDs (eBay requires exactly one of the two).
   *
   * @param input - Marketplace, q or registrationIds, and optional limit/offset paging.
   * @returns An Effect that succeeds with eBay's paginated CharitySearchResponse.
   *
   * @example
   * ```ts
   * const results = await Effect.runPromise(
   *   charityApi.getCharityOrgs({ marketplaceId: 'EBAY_US', q: 'animal rescue', limit: 10 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/charity/resources/charity_org/methods/getCharityOrgs
   */
  public getCharityOrgs = (
    input: GetCharityOrgsInput,
  ): Effect.Effect<CharitySearchResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;

    return Effect.gen(function* () {
      const search = yield* decodeEndpointInputEffect(getCharityOrgsInputSchema, input);
      if ((search.q === undefined) === (search.registrationIds === undefined)) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'q',
            message: 'Supply either q or registrationIds to search charities, but not both',
          }),
        );
      }
      const params = buildEndpointParams({
        q: { wireName: 'q', value: search.q },
        registrationIds: { wireName: 'registration_ids', value: search.registrationIds },
        limit: { wireName: 'limit', value: search.limit },
        offset: { wireName: 'offset', value: search.offset },
      });

      return yield* requestGetEffect<CharitySearchResponse>(
        client,
        `${BASE_PATH}/charity_org`,
        params,
        charityRequestConfig(search.marketplaceId),
      );
    });
  };
}
