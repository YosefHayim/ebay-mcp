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

/** Query parameters accepted by getConversations. */
export interface GetConversationsInput {
	/** Required conversation type such as FROM_EBAY or FROM_MEMBERS. */
	readonly conversationType: string;
	/** Optional conversation status filter. */
	readonly conversationStatus?: string;
	/** Optional ISO-8601 end time. */
	readonly endTime?: string;
	/** Optional page size. */
	readonly limit?: number;
	/** Optional zero-based page offset. */
	readonly offset?: number;
	/** Optional other party username filter. */
	readonly otherPartyUsername?: string;
	/** Optional reference ID filter. */
	readonly referenceId?: string;
	/** Optional reference type filter. */
	readonly referenceType?: string;
	/** Optional ISO-8601 start time. */
	readonly startTime?: string;
}

/** Path and query parameters accepted by getConversation. */
export interface GetConversationInput {
	/** Conversation identifier in the path. */
	readonly conversationId: string;
	/** Required conversation type such as FROM_EBAY or FROM_MEMBERS. */
	readonly conversationType: string;
	/** Optional page size for messages in the conversation. */
	readonly limit?: number;
	/** Optional zero-based page offset. */
	readonly offset?: number;
}

/** Request body accepted by bulkUpdateConversation. */
type BulkUpdateConversationsRequest =
	components["schemas"]["BulkUpdateConversationsRequest"];
/** Response returned by bulkUpdateConversation. */
type BulkUpdateConversationsResponse =
	components["schemas"]["BulkUpdateConversationsResponse"];
/** Response returned by getConversations. */
type GetAllMyConversationsResponse =
	components["schemas"]["GetAllMyConversationsResponse"];
/** Response returned by getConversation. */
type GetMessagesByConversationIdResponse =
	components["schemas"]["GetMessagesByConversationIdResponse"];
/** Request body accepted by sendMessage. */
type SendMessageRequest = components["schemas"]["SendMessageRequest"];
/** Response returned by sendMessage. */
type SendMessageResponse = components["schemas"]["SendMessageResponse"];
/** Request body accepted by updateConversation. */
type UpdateConversationRequest =
	components["schemas"]["UpdateConversationRequest"];

/**
 * Message API - Buyer-seller messaging
 * Based on: commerce_message_v1_oas3.json
 */
export class MessageApi {
	private readonly basePath = "/commerce/message/v1";

	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Updates multiple conversations in one request.
	 *
	 * @param updateData - Generated BulkUpdateConversationsRequest body.
	 * @returns eBay's generated bulk update response.
	 *
	 * @example
	 * ```ts
	 * const updatedConversations = await messageApi.bulkUpdateConversation({ conversations: [{ conversationId: 'c1' }] });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/message/resources/bulk_update_conversation/methods/bulkUpdateConversation
	 */
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

	/**
	 * Retrieves buyer-seller conversations.
	 *
	 * @param input - Required conversation type plus optional filters and pagination.
	 * @returns eBay's generated conversation collection response.
	 *
	 * @example
	 * ```ts
	 * const conversations = await messageApi.getConversations({ conversationType: 'FROM_MEMBERS', limit: 25 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/message/resources/conversation/methods/getConversations
	 */
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

	/**
	 * Retrieves messages in a specific conversation.
	 *
	 * @param input - Conversation path ID plus required type and optional pagination.
	 * @returns eBay's generated conversation message response.
	 *
	 * @example
	 * ```ts
	 * const conversation = await messageApi.getConversation({ conversationId: 'c1', conversationType: 'FROM_MEMBERS' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/message/resources/conversation/methods/getConversation
	 */
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

	/**
	 * Sends a message to another eBay user.
	 *
	 * @param messageData - Generated SendMessageRequest body.
	 * @returns eBay's generated SendMessageResponse.
	 *
	 * @example
	 * ```ts
	 * const sent = await messageApi.sendMessage({ messageText: 'Hello', otherPartyUsername: 'buyer_123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/message/resources/send_message/methods/sendMessage
	 */
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

	/**
	 * Updates a conversation status.
	 *
	 * @param updateData - Generated UpdateConversationRequest body.
	 * @returns A promise that resolves when eBay accepts the update.
	 *
	 * @example
	 * ```ts
	 * await messageApi.updateConversation({ conversationId: 'c1', conversationStatus: 'READ' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/message/resources/update_conversation/methods/updateConversation
	 */
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
