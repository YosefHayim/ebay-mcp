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

export interface GetAwaitingFeedbackInput {
	readonly filter?: string;
	readonly limit?: number;
	readonly offset?: number;
	readonly sort?: string;
}

export interface GetFeedbackInput {
	readonly userId: string;
	readonly feedbackType: string;
	readonly feedbackId?: string;
	readonly filter?: string;
	readonly limit?: number;
	readonly listingId?: string;
	readonly offset?: number;
	readonly orderLineItemId?: string;
	readonly sort?: string;
	readonly transactionId?: string;
}

export interface GetFeedbackRatingSummaryInput {
	readonly userId: string;
	readonly filter: string;
}

type AwaitingFeedbackResponse =
	components["schemas"]["AwaitingFeedbackResponse"];
type GetFeedbackResponse = components["schemas"]["GetFeedbackResponse"];
type LeaveFeedbackRequest = components["schemas"]["LeaveFeedbackRequest"];
type LeaveFeedbackResponse = components["schemas"]["LeaveFeedbackResponse"];
type GetFeedbackRatingSummaryResponse =
	components["schemas"]["GetFeedbackRatingSummaryResponse"];
type RespondToFeedbackRequest =
	components["schemas"]["RespondToFeedbackRequest"];
type RespondToFeedbackResponse = Record<string, never>;

export class FeedbackApi {
	private readonly basePath = "/commerce/feedback/v1";

	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

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
