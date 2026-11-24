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
import type { components } from "@/ebay-openapi-types/commerceMessageV1Oas3.js";

export interface GetConversationsInput {
	readonly conversationType: string;
	readonly conversationStatus?: string;
	readonly endTime?: string;
	readonly limit?: number;
	readonly offset?: number;
	readonly otherPartyUsername?: string;
	readonly referenceId?: string;
	readonly referenceType?: string;
	readonly startTime?: string;
}

export interface GetConversationInput {
	readonly conversationId: string;
	readonly conversationType: string;
	readonly limit?: number;
	readonly offset?: number;
}

type BulkUpdateConversationsRequest =
	components["schemas"]["BulkUpdateConversationsRequest"];
type BulkUpdateConversationsResponse =
	components["schemas"]["BulkUpdateConversationsResponse"];
type GetAllMyConversationsResponse =
	components["schemas"]["GetAllMyConversationsResponse"];
type GetMessagesByConversationIdResponse =
	components["schemas"]["GetMessagesByConversationIdResponse"];
type SendMessageRequest = components["schemas"]["SendMessageRequest"];
type SendMessageResponse = components["schemas"]["SendMessageResponse"];
type UpdateConversationRequest =
	components["schemas"]["UpdateConversationRequest"];

export class MessageApi {
	private readonly basePath = "/commerce/message/v1";

	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	bulkUpdateConversation = async (
		updateData: BulkUpdateConversationsRequest,
	): Promise<BulkUpdateConversationsResponse> => {
		const client = this.client;
		const path = `${this.basePath}/bulk_update_conversation`;

		const bulkUpdateRequest =
			requireObjectEffect<BulkUpdateConversationsRequest>(
				updateData,
				"updateData",
			);

		return await requestPostEffect<BulkUpdateConversationsResponse>(
			client,
			path,
			bulkUpdateRequest,
		);
	};

	getConversations = async (
		input: GetConversationsInput,
	): Promise<GetAllMyConversationsResponse> => {
		const client = this.client;
		const path = `${this.basePath}/conversation`;

		const validatedInput = requireObjectEffect<GetConversationsInput>(
			input,
			"input",
		);
		const conversationType = requireStringEffect(
			validatedInput.conversationType,
			"conversationType",
		);
		const conversationStatus = optionalStringEffect(
			validatedInput.conversationStatus,
			"conversationStatus",
		);
		const endTime = optionalStringEffect(validatedInput.endTime, "endTime");
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const otherPartyUsername = optionalStringEffect(
			validatedInput.otherPartyUsername,
			"otherPartyUsername",
		);
		const referenceId = optionalStringEffect(
			validatedInput.referenceId,
			"referenceId",
		);
		const referenceType = optionalStringEffect(
			validatedInput.referenceType,
			"referenceType",
		);
		const startTime = optionalStringEffect(
			validatedInput.startTime,
			"startTime",
		);
		const params = buildEndpointParams({
			conversationType: {
				wireName: "conversation_type",
				value: conversationType,
			},
			conversationStatus: {
				wireName: "conversation_status",
				value: conversationStatus,
			},
			endTime: { wireName: "end_time", value: endTime },
			limit: { wireName: "limit", value: limit },
			offset: { wireName: "offset", value: offset },
			otherPartyUsername: {
				wireName: "other_party_username",
				value: otherPartyUsername,
			},
			referenceId: { wireName: "reference_id", value: referenceId },
			referenceType: { wireName: "reference_type", value: referenceType },
			startTime: { wireName: "start_time", value: startTime },
		});

		return await requestGetEffect<GetAllMyConversationsResponse>(
			client,
			path,
			params,
		);
	};

	getConversation = async (
		input: GetConversationInput,
	): Promise<GetMessagesByConversationIdResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<GetConversationInput>(
			input,
			"input",
		);
		const conversationId = requireStringEffect(
			validatedInput.conversationId,
			"conversationId",
		);
		const conversationType = requireStringEffect(
			validatedInput.conversationType,
			"conversationType",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const params = buildEndpointParams({
			conversationType: {
				wireName: "conversation_type",
				value: conversationType,
			},
			limit: { wireName: "limit", value: limit },
			offset: { wireName: "offset", value: offset },
		});

		return await requestGetEffect<GetMessagesByConversationIdResponse>(
			client,
			`${basePath}/conversation/${conversationId}`,
			params,
		);
	};

	sendMessage = async (
		messageData: SendMessageRequest,
	): Promise<SendMessageResponse> => {
		const client = this.client;
		const path = `${this.basePath}/send_message`;

		const messageRequest = requireObjectEffect<SendMessageRequest>(
			messageData,
			"messageData",
		);

		return await requestPostEffect<SendMessageResponse>(
			client,
			path,
			messageRequest,
		);
	};

	updateConversation = async (
		updateData: UpdateConversationRequest,
	): Promise<void> => {
		const client = this.client;
		const path = `${this.basePath}/update_conversation`;

		const conversationUpdate = requireObjectEffect<UpdateConversationRequest>(
			updateData,
			"updateData",
		);

		return await requestPostEffect<void>(client, path, conversationUpdate);
	};
}
