import type { EbayApiClient, EbayRequestConfig } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/marketing-and-promotions/sellRecommendationV1Oas3.js';
import { Effect } from 'effect';

/** Input accepted by findListingRecommendations. */
export interface FindListingRecommendationsInput {
  /** Generated FindListingRecommendationRequest body. Omit it to target all active listings. */
  readonly requestBody?: FindListingRecommendationRequest;
  /** Recommendation filter expression, such as recommendationTypes:{AD}. */
  readonly filter?: string;
  /** Maximum number of recommendations to return. */
  readonly limit?: number;
  /** Number of recommendations to skip. */
  readonly offset?: number;
  /** Marketplace whose listings should be evaluated. */
  readonly marketplaceId: string;
}

/**
 * Request body accepted by findListingRecommendations.
 *
 * @see https://developer.ebay.com/api-docs/sell/recommendation/resources/find/methods/findListingRecommendations
 */
export type FindListingRecommendationRequest =
  components['schemas']['FindListingRecommendationRequest'];

/**
 * Response returned by findListingRecommendations.
 *
 * @see https://developer.ebay.com/api-docs/sell/recommendation/resources/find/methods/findListingRecommendations
 */
export type PagedListingRecommendationCollection =
  components['schemas']['PagedListingRecommendationCollection'];

/** Recommendation API - Promoted Listings recommendation discovery. */
export class RecommendationApi {
  private readonly basePath = '/sell/recommendation/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Finds listing recommendations for active listings in one marketplace.
   *
   * @param input - Request body, recommendation filter, pagination, and marketplace header.
   * @returns An Effect that succeeds with eBay's PagedListingRecommendationCollection.
   *
   * @example
   * ```ts
   * const recommendations = await Effect.runPromise(
   *   recommendationApi.findListingRecommendations({
   *     marketplaceId: 'EBAY_US',
   *     requestBody: { listingIds: ['110000000000'] },
   *     limit: 10,
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/recommendation/resources/find/methods/findListingRecommendations
   */
  public findListingRecommendations = (
    input: FindListingRecommendationsInput,
  ): Effect.Effect<PagedListingRecommendationCollection, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/find`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<FindListingRecommendationsInput>(
        input,
        'input',
      );
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const filter = yield* optionalStringEffect(validatedInput.filter, 'filter');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      let requestBody: FindListingRecommendationRequest = {};

      if (validatedInput.requestBody !== undefined) {
        requestBody = yield* requireObjectEffect<FindListingRecommendationRequest>(
          validatedInput.requestBody,
          'requestBody',
        );
      }

      const params = buildEndpointParams({
        filter: { wireName: 'filter', value: filter },
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });
      const config: EbayRequestConfig = {
        headers: {
          'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
        },
      };

      if (params !== undefined) {
        config.params = params;
      }

      return yield* requestPostEffect<PagedListingRecommendationCollection>(
        client,
        path,
        requestBody,
        config,
      );
    });
  };
}
