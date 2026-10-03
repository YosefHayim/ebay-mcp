import type { EbayApiClient } from '@/api/client.js';
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
  requireStringEffect,
} from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/communication/commerceFeedbackV1BetaOas3.js';
import { Effect } from 'effect';

/** Query parameters accepted by getItemsAwaitingFeedback. */
export interface GetAwaitingFeedbackInput {
  /** Optional OpenAPI filter expression. */
  readonly filter?: string;
  /** Optional page size. */
  readonly limit?: number;
  /** Optional zero-based page offset. */
  readonly offset?: number;
  /** Optional result sort order. */
  readonly sort?: string;
}

/** Query parameters accepted by getFeedback. */
export interface GetFeedbackInput {
  /** eBay user ID whose feedback is being retrieved. */
  readonly userId: string;
  /** Feedback direction, such as FEEDBACK_RECEIVED or FEEDBACK_SENT. */
  readonly feedbackType: string;
  /** Optional feedback ID filter. */
  readonly feedbackId?: string;
  /** Optional OpenAPI filter expression. */
  readonly filter?: string;
  /** Optional page size. */
  readonly limit?: number;
  /** Optional listing ID filter. */
  readonly listingId?: string;
  /** Optional zero-based page offset. */
  readonly offset?: number;
  /** Optional order line item ID filter. */
  readonly orderLineItemId?: string;
  /** Optional result sort order. */
  readonly sort?: string;
  /** Optional transaction ID filter. */
  readonly transactionId?: string;
}

/** Query parameters accepted by getFeedbackRatingSummary. */
export interface GetFeedbackRatingSummaryInput {
  /** eBay user ID whose feedback summary is being retrieved. */
  readonly userId: string;
  /** Required rating summary filter, including ratingType. */
  readonly filter: string;
}

/** Response returned by getItemsAwaitingFeedback. */
type AwaitingFeedbackResponse = components['schemas']['AwaitingFeedbackResponse'];
/** Response returned by getFeedback. */
type GetFeedbackResponse = components['schemas']['GetFeedbackResponse'];
/** Request body accepted by leaveFeedback. */
type LeaveFeedbackRequest = components['schemas']['LeaveFeedbackRequest'];
/** Response returned by leaveFeedback. */
type LeaveFeedbackResponse = components['schemas']['LeaveFeedbackResponse'];
/** Response returned by getFeedbackRatingSummary. */
type GetFeedbackRatingSummaryResponse = components['schemas']['GetFeedbackRatingSummaryResponse'];
/** Request body accepted by respondToFeedback. */
type RespondToFeedbackRequest = components['schemas']['RespondToFeedbackRequest'];
/** Response returned by respondToFeedback. */
type RespondToFeedbackResponse = Record<string, never>;

/**
 * Feedback API - Manage buyer and seller feedback
 * Based on: commerce_feedback_v1_beta_oas3.json
 */
export class FeedbackApi {
  private readonly basePath = '/commerce/feedback/v1';

  constructor(private readonly client: EbayApiClient) {}

  /**
   * Retrieves line items awaiting feedback.
   *
   * @param input - Optional filter, pagination, and sort query parameters.
   * @returns An Effect that succeeds with eBay's generated AwaitingFeedbackResponse.
   *
   * @example
   * ```ts
   * const awaiting = await Effect.runPromise(
   *   feedbackApi.getAwaitingFeedback({ filter: 'userRole:SELLER', limit: 25 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/awaiting_feedback/methods/getItemsAwaitingFeedback
   */
  getAwaitingFeedback = (
    input: GetAwaitingFeedbackInput = {},
  ): Effect.Effect<AwaitingFeedbackResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/awaiting_feedback`;

    return Effect.gen(function* () {
      const filter = yield* optionalStringEffect(input.filter, 'filter');
      const limit = yield* optionalPositiveNumberEffect(input.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(input.offset, 'offset');
      const sort = yield* optionalStringEffect(input.sort, 'sort');
      const params = buildEndpointParams({
        filter: { wireName: 'filter', value: filter },
        limit: { wireName: 'limit', value: limit },
        offset: { wireName: 'offset', value: offset },
        sort: { wireName: 'sort', value: sort },
      });

      return yield* requestGetEffect<AwaitingFeedbackResponse>(client, path, params);
    });
  };

  /**
   * Retrieves feedback for a specified eBay user.
   *
   * @param input - Required user and feedback type plus optional endpoint filters.
   * @returns An Effect that succeeds with eBay's generated GetFeedbackResponse.
   *
   * @example
   * ```ts
   * const feedback = await Effect.runPromise(
   *   feedbackApi.getFeedback({ userId: 'seller_123', feedbackType: 'FEEDBACK_RECEIVED' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/feedback/methods/getFeedback
   */
  getFeedback = (
    input: GetFeedbackInput,
  ): Effect.Effect<GetFeedbackResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/feedback`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetFeedbackInput>(input, 'input');
      const userId = yield* requireStringEffect(request.userId, 'userId');
      const feedbackType = yield* requireStringEffect(request.feedbackType, 'feedbackType');
      const feedbackId = yield* optionalStringEffect(request.feedbackId, 'feedbackId');
      const filter = yield* optionalStringEffect(request.filter, 'filter');
      const limit = yield* optionalPositiveNumberEffect(request.limit, 'limit');
      const listingId = yield* optionalStringEffect(request.listingId, 'listingId');
      const offset = yield* optionalNonNegativeNumberEffect(request.offset, 'offset');
      const orderLineItemId = yield* optionalStringEffect(
        request.orderLineItemId,
        'orderLineItemId',
      );
      const sort = yield* optionalStringEffect(request.sort, 'sort');
      const transactionId = yield* optionalStringEffect(request.transactionId, 'transactionId');
      const params = buildEndpointParams({
        userId: { wireName: 'user_id', value: userId },
        feedbackType: { wireName: 'feedback_type', value: feedbackType },
        feedbackId: { wireName: 'feedback_id', value: feedbackId },
        filter: { wireName: 'filter', value: filter },
        limit: { wireName: 'limit', value: limit },
        listingId: { wireName: 'listing_id', value: listingId },
        offset: { wireName: 'offset', value: offset },
        orderLineItemId: { wireName: 'order_line_item_id', value: orderLineItemId },
        sort: { wireName: 'sort', value: sort },
        transactionId: { wireName: 'transaction_id', value: transactionId },
      });

      return yield* requestGetEffect<GetFeedbackResponse>(client, path, params);
    });
  };

  /**
   * Retrieves a feedback rating summary for a user.
   *
   * @param input - Required eBay user ID and rating summary filter.
   * @returns An Effect that succeeds with eBay's generated GetFeedbackRatingSummaryResponse.
   *
   * @example
   * ```ts
   * const summary = await Effect.runPromise(
   *   feedbackApi.getFeedbackRatingSummary({
   *     userId: 'seller_123',
   *     filter: 'ratingType:OVERALL_EXPERIENCE',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/feedback_rating_summary/methods/getFeedbackRatingSummary
   */
  getFeedbackRatingSummary = (
    input: GetFeedbackRatingSummaryInput,
  ): Effect.Effect<GetFeedbackRatingSummaryResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/feedback_rating_summary`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetFeedbackRatingSummaryInput>(input, 'input');
      const userId = yield* requireStringEffect(request.userId, 'userId');
      const filter = yield* requireStringEffect(request.filter, 'filter');
      const params = buildEndpointParams({
        userId: { wireName: 'user_id', value: userId },
        filter: { wireName: 'filter', value: filter },
      });

      return yield* requestGetEffect<GetFeedbackRatingSummaryResponse>(client, path, params);
    });
  };

  /**
   * Leaves feedback for the user's order partner.
   *
   * @param feedbackData - Generated LeaveFeedbackRequest body.
   * @returns An Effect that succeeds with eBay's generated LeaveFeedbackResponse.
   *
   * @example
   * ```ts
   * const feedback = await Effect.runPromise(
   *   feedbackApi.leaveFeedbackForBuyer({ commentText: 'Great buyer', commentType: 'POSITIVE' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/feedback/methods/leaveFeedback
   */
  leaveFeedbackForBuyer = (
    feedbackData: LeaveFeedbackRequest,
  ): Effect.Effect<LeaveFeedbackResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/feedback`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<LeaveFeedbackRequest>(feedbackData, 'feedbackData');

      return yield* requestPostEffect<LeaveFeedbackResponse>(client, path, body);
    });
  };

  /**
   * Responds to feedback received from another eBay user.
   *
   * @param response - Generated RespondToFeedbackRequest body.
   * @returns An Effect that succeeds with eBay's generated empty response.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   feedbackApi.respondToFeedback({ feedbackId: 'feedback-1', responseText: 'Thank you' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/respond_to_feedback/methods/respondToFeedback
   */
  respondToFeedback = (
    response: RespondToFeedbackRequest,
  ): Effect.Effect<RespondToFeedbackResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/respond_to_feedback`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<RespondToFeedbackRequest>(response, 'response');

      return yield* requestPostEffect<RespondToFeedbackResponse>(client, path, body);
    });
  };
}
