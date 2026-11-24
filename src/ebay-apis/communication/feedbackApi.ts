import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceFeedbackV1BetaOas3.js";

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
type AwaitingFeedbackResponse =
	components["schemas"]["AwaitingFeedbackResponse"];
/** Response returned by getFeedback. */
type GetFeedbackResponse = components["schemas"]["GetFeedbackResponse"];
/** Request body accepted by leaveFeedback. */
type LeaveFeedbackRequest = components["schemas"]["LeaveFeedbackRequest"];
/** Response returned by leaveFeedback. */
type LeaveFeedbackResponse = components["schemas"]["LeaveFeedbackResponse"];
/** Response returned by getFeedbackRatingSummary. */
type GetFeedbackRatingSummaryResponse =
	components["schemas"]["GetFeedbackRatingSummaryResponse"];
/** Request body accepted by respondToFeedback. */
type RespondToFeedbackRequest =
	components["schemas"]["RespondToFeedbackRequest"];
/** Response returned by respondToFeedback. */
type RespondToFeedbackResponse = Record<string, never>;

/**
 * Feedback API - Manage buyer and seller feedback
 * Based on: commerce_feedback_v1_beta_oas3.json
 */
export class FeedbackApi {
	private readonly basePath = "/commerce/feedback/v1";

	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Retrieves line items awaiting feedback.
	 *
	 * @param input - Optional filter, pagination, and sort query parameters.
	 * @returns eBay's generated AwaitingFeedbackResponse.
	 *
	 * @example
	 * ```ts
	 * const awaiting = await feedbackApi.getItemsAwaitingFeedback({ filter: 'userRole:SELLER', limit: 25 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/awaiting_feedback/methods/getItemsAwaitingFeedback
	 */
	getItemsAwaitingFeedback = async (
		input: GetAwaitingFeedbackInput = {},
	): Promise<AwaitingFeedbackResponse> => {
		const client = this.client;
		const path = `${this.basePath}/awaiting_feedback`;

		const filter = optionalStringEffect(input.filter, "filter");
		const limit = optionalPositiveNumberEffect(input.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(input.offset, "offset");
		const sort = optionalStringEffect(input.sort, "sort");
		const params = buildEndpointParams({
			filter: { wireName: "filter", value: filter },
			limit: { wireName: "limit", value: limit },
			offset: { wireName: "offset", value: offset },
			sort: { wireName: "sort", value: sort },
		});

		return await requestGetEffect<AwaitingFeedbackResponse>(
			client,
			path,
			params,
		);
	};

	/**
	 * Retrieves feedback for a specified eBay user.
	 *
	 * @param input - Required user and feedback type plus optional endpoint filters.
	 * @returns eBay's generated GetFeedbackResponse.
	 *
	 * @example
	 * ```ts
	 * const feedback = await feedbackApi.getFeedback({ userId: 'seller_123', feedbackType: 'FEEDBACK_RECEIVED' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/feedback/methods/getFeedback
	 */
	getFeedback = async (
		input: GetFeedbackInput,
	): Promise<GetFeedbackResponse> => {
		const client = this.client;
		const path = `${this.basePath}/feedback`;

		const validatedInput = requireObjectEffect<GetFeedbackInput>(
			input,
			"input",
		);
		const userId = requireStringEffect(validatedInput.userId, "userId");
		const feedbackType = requireStringEffect(
			validatedInput.feedbackType,
			"feedbackType",
		);
		const feedbackId = optionalStringEffect(
			validatedInput.feedbackId,
			"feedbackId",
		);
		const filter = optionalStringEffect(validatedInput.filter, "filter");
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const listingId = optionalStringEffect(
			validatedInput.listingId,
			"listingId",
		);
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const orderLineItemId = optionalStringEffect(
			validatedInput.orderLineItemId,
			"orderLineItemId",
		);
		const sort = optionalStringEffect(validatedInput.sort, "sort");
		const transactionId = optionalStringEffect(
			validatedInput.transactionId,
			"transactionId",
		);
		const params = buildEndpointParams({
			userId: { wireName: "user_id", value: userId },
			feedbackType: { wireName: "feedback_type", value: feedbackType },
			feedbackId: { wireName: "feedback_id", value: feedbackId },
			filter: { wireName: "filter", value: filter },
			limit: { wireName: "limit", value: limit },
			listingId: { wireName: "listing_id", value: listingId },
			offset: { wireName: "offset", value: offset },
			orderLineItemId: {
				wireName: "order_line_item_id",
				value: orderLineItemId,
			},
			sort: { wireName: "sort", value: sort },
			transactionId: { wireName: "transaction_id", value: transactionId },
		});

		return await requestGetEffect<GetFeedbackResponse>(client, path, params);
	};

	/**
	 * Retrieves a feedback rating summary for a user.
	 *
	 * @param input - Required eBay user ID and rating summary filter.
	 * @returns eBay's generated GetFeedbackRatingSummaryResponse.
	 *
	 * @example
	 * ```ts
	 * const summary = await feedbackApi.getFeedbackRatingSummary({
	 *     userId: 'seller_123',
	 *     filter: 'ratingType:OVERALL_EXPERIENCE',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/feedback_rating_summary/methods/getFeedbackRatingSummary
	 */
	getFeedbackRatingSummary = async (
		input: GetFeedbackRatingSummaryInput,
	): Promise<GetFeedbackRatingSummaryResponse> => {
		const client = this.client;
		const path = `${this.basePath}/feedback_rating_summary`;

		const validatedInput = requireObjectEffect<GetFeedbackRatingSummaryInput>(
			input,
			"input",
		);
		const userId = requireStringEffect(validatedInput.userId, "userId");
		const filter = requireStringEffect(validatedInput.filter, "filter");
		const params = buildEndpointParams({
			userId: { wireName: "user_id", value: userId },
			filter: { wireName: "filter", value: filter },
		});

		return await requestGetEffect<GetFeedbackRatingSummaryResponse>(
			client,
			path,
			params,
		);
	};

	/**
	 * Leaves feedback for the user's order partner.
	 *
	 * @param feedbackData - Generated LeaveFeedbackRequest body.
	 * @returns eBay's generated LeaveFeedbackResponse.
	 *
	 * @example
	 * ```ts
	 * const feedback = await feedbackApi.leaveFeedback({ commentText: 'Great buyer', commentType: 'POSITIVE' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/feedback/methods/leaveFeedback
	 */
	leaveFeedback = async (
		feedbackData: LeaveFeedbackRequest,
	): Promise<LeaveFeedbackResponse> => {
		const client = this.client;
		const path = `${this.basePath}/feedback`;

		const feedbackRequest = requireObjectEffect<LeaveFeedbackRequest>(
			feedbackData,
			"feedbackData",
		);

		return await requestPostEffect<LeaveFeedbackResponse>(
			client,
			path,
			feedbackRequest,
		);
	};

	/**
	 * Responds to feedback received from another eBay user.
	 *
	 * @param feedbackReply - Generated RespondToFeedbackRequest body.
	 * @returns eBay's generated empty response.
	 *
	 * @example
	 * ```ts
	 * await feedbackApi.respondToFeedback({ feedbackId: 'feedback-1', responseText: 'Thank you' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/feedback/resources/respond_to_feedback/methods/respondToFeedback
	 */
	respondToFeedback = async (
		feedbackReply: RespondToFeedbackRequest,
	): Promise<RespondToFeedbackResponse> => {
		const client = this.client;
		const path = `${this.basePath}/respond_to_feedback`;

		const replyRequest = requireObjectEffect<RespondToFeedbackRequest>(
			feedbackReply,
			"feedbackReply",
		);

		return await requestPostEffect<RespondToFeedbackResponse>(
			client,
			path,
			replyRequest,
		);
	};
}
