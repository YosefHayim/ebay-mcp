import type { EbayApiClient, EbayRequestConfig } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
} from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/communication/sellNegotiationV1Oas3.js';
import type {
  findEligibleItemsSchema,
  sendOfferToInterestedBuyersSchema,
} from '@/utils/communication/negotiation.js';
import { Effect } from 'effect';
import type { z } from 'zod';

type FindEligibleItemsInput = z.infer<typeof findEligibleItemsSchema>;
type SendOfferToInterestedBuyersInput = z.infer<typeof sendOfferToInterestedBuyersSchema>;
/** Request body accepted by sendOfferToInterestedBuyers. */
type CreateOffersRequest = components['schemas']['CreateOffersRequest'];

/**
 * Response returned by eBay Negotiation findEligibleItems.
 *
 * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/findEligibleItems
 */
export type FindEligibleItemsResponse = components['schemas']['PagedEligibleItemCollection'];
/**
 * Response returned by eBay Negotiation sendOfferToInterestedBuyers.
 *
 * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/sendOfferToInterestedBuyers
 */
export type SendOfferToInterestedBuyersResponse =
  components['schemas']['SendOfferToInterestedBuyersCollectionResponse'];

/**
 * Negotiation API - Buyer-seller negotiations and offers
 * Based on: sell_negotiation_v1_oas3.json
 */
export class NegotiationApi {
  private readonly basePath = '/sell/negotiation/v1';
  private readonly client: EbayApiClient;

  constructor(client: EbayApiClient) {
    this.client = client;
  }

  /**
   * Finds listings eligible for a seller-initiated offer.
   *
   * @param input - Optional marketplace header override plus pagination query parameters.
   * @returns An Effect that succeeds with eBay's generated PagedEligibleItemCollection.
   *
   * @example
   * ```ts
   * const eligible = await Effect.runPromise(
   *   negotiationApi.findEligibleItems({ marketplaceId: 'EBAY_US', limit: 10 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/findEligibleItems
   */
  findEligibleItems = (
    input: FindEligibleItemsInput = {},
  ): Effect.Effect<FindEligibleItemsResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/find_eligible_items`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<FindEligibleItemsInput>(input, 'input');
      const {
        marketplaceId: inputMarketplaceId,
        limit: inputLimit,
        offset: inputOffset,
      } = validatedInput;
      const marketplaceId = yield* optionalStringEffect(inputMarketplaceId, 'marketplaceId');
      const limit = yield* optionalPositiveNumberEffect(inputLimit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(inputOffset, 'offset');
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit },
        offset: { wireName: 'offset', value: offset },
      });
      const config: EbayRequestConfig | undefined =
        marketplaceId === undefined
          ? undefined
          : { headers: { 'X-EBAY-C-MARKETPLACE-ID': marketplaceId } };

      return yield* requestGetEffect<FindEligibleItemsResponse>(apiClient, path, params, config);
    });
  };

  /**
   * Sends an offer to buyers interested in a listing.
   *
   * @param input - Offer body fields plus optional marketplace header override.
   * @returns An Effect that succeeds with eBay's generated offer collection response.
   *
   * @example
   * ```ts
   * const offers = await Effect.runPromise(
   *   negotiationApi.sendOfferToInterestedBuyers({
   *     marketplaceId: 'EBAY_US',
   *     message: 'Limited offer',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/negotiation/resources/offer/methods/sendOfferToInterestedBuyers
   */
  sendOfferToInterestedBuyers = (
    input: SendOfferToInterestedBuyersInput,
  ): Effect.Effect<SendOfferToInterestedBuyersResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/send_offer_to_interested_buyers`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<SendOfferToInterestedBuyersInput>(
        input,
        'input',
      );
      const { marketplaceId, ...offerData } = validatedInput;
      const createOffersRequest = yield* requireObjectEffect<CreateOffersRequest>(
        offerData,
        'offerData',
      );
      const validatedMarketplaceId = yield* optionalStringEffect(marketplaceId, 'marketplaceId');
      const config: EbayRequestConfig | undefined =
        validatedMarketplaceId === undefined
          ? undefined
          : { headers: { 'X-EBAY-C-MARKETPLACE-ID': validatedMarketplaceId } };

      return yield* requestPostEffect<SendOfferToInterestedBuyersResponse>(
        apiClient,
        path,
        createOffersRequest,
        config,
      );
    });
  };
}
