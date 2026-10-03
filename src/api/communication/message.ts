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
import type { components } from '@/types/sell-apps/communication/commerceMessageV1Oas3.js';
import { Effect } from 'effect';

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
type BulkUpdateConversationsRequest = components['schemas']['BulkUpdateConversationsRequest'];
/** Response returned by bulkUpdateConversation. */
type BulkUpdateConversationsResponse = components['schemas']['BulkUpdateConversationsResponse'];
/** Response returned by getConversations. */
type GetAllMyConversationsResponse = components['schemas']['GetAllMyConversationsResponse'];
/** Response returned by getConversation. */
type GetMessagesByConversationIdResponse =
  components['schemas']['GetMessagesByConversationIdResponse'];
/** Request body accepted by sendMessage. */
type SendMessageRequest = components['schemas']['SendMessageRequest'];
/** Response returned by sendMessage. */
type SendMessageResponse = components['schemas']['SendMessageResponse'];
/** Request body accepted by updateConversation. */
type UpdateConversationRequest = components['schemas']['UpdateConversationRequest'];

/**
 * Message API - Buyer-seller messaging
 * Based on: commerce_message_v1_oas3.json
 */
export class MessageApi {
  private readonly basePath = '/commerce/message/v1';

  constructor(private readonly client: EbayApiClient) {}

  /**
   * Updates multiple conversations in one request.
   *
   * @param updateData - Generated BulkUpdateConversationsRequest body.
   * @returns An Effect that succeeds with eBay's generated bulk update response.
   *
   * @example
   * ```ts
   * const result = await Effect.runPromise(
   *   messageApi.bulkUpdateConversation({ conversations: [{ conversationId: 'c1' }] }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/message/resources/bulk_update_conversation/methods/bulkUpdateConversation
   */
  bulkUpdateConversation = (
    updateData: BulkUpdateConversationsRequest,
  ): Effect.Effect<BulkUpdateConversationsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/bulk_update_conversation`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<BulkUpdateConversationsRequest>(
        updateData,
        'updateData',
      );

      return yield* requestPostEffect<BulkUpdateConversationsResponse>(client, path, body);
    });
  };

  /**
   * Retrieves buyer-seller conversations.
   *
   * @param input - Required conversation type plus optional filters and pagination.
   * @returns An Effect that succeeds with eBay's generated conversation collection response.
   *
   * @example
   * ```ts
   * const conversations = await Effect.runPromise(
   *   messageApi.getConversations({ conversationType: 'FROM_MEMBERS', limit: 25 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/message/resources/conversation/methods/getConversations
   */
  getConversations = (
    input: GetConversationsInput,
  ): Effect.Effect<GetAllMyConversationsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/conversation`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetConversationsInput>(input, 'input');
      const conversationType = yield* requireStringEffect(
        request.conversationType,
        'conversationType',
      );
      const conversationStatus = yield* optionalStringEffect(
        request.conversationStatus,
        'conversationStatus',
      );
      const endTime = yield* optionalStringEffect(request.endTime, 'endTime');
      const limit = yield* optionalPositiveNumberEffect(request.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(request.offset, 'offset');
      const otherPartyUsername = yield* optionalStringEffect(
        request.otherPartyUsername,
        'otherPartyUsername',
      );
      const referenceId = yield* optionalStringEffect(request.referenceId, 'referenceId');
      const referenceType = yield* optionalStringEffect(request.referenceType, 'referenceType');
      const startTime = yield* optionalStringEffect(request.startTime, 'startTime');
      const params = buildEndpointParams({
        conversationType: { wireName: 'conversation_type', value: conversationType },
        conversationStatus: { wireName: 'conversation_status', value: conversationStatus },
        endTime: { wireName: 'end_time', value: endTime },
        limit: { wireName: 'limit', value: limit },
        offset: { wireName: 'offset', value: offset },
        otherPartyUsername: { wireName: 'other_party_username', value: otherPartyUsername },
        referenceId: { wireName: 'reference_id', value: referenceId },
        referenceType: { wireName: 'reference_type', value: referenceType },
        startTime: { wireName: 'start_time', value: startTime },
      });

      return yield* requestGetEffect<GetAllMyConversationsResponse>(client, path, params);
    });
  };

  /**
   * Retrieves messages in a specific conversation.
   *
   * @param input - Conversation path ID plus required type and optional pagination.
   * @returns An Effect that succeeds with eBay's generated conversation message response.
   *
   * @example
   * ```ts
   * const conversation = await Effect.runPromise(
   *   messageApi.getConversation({ conversationId: 'c1', conversationType: 'FROM_MEMBERS' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/message/resources/conversation/methods/getConversation
   */
  getConversation = (
    input: GetConversationInput,
  ): Effect.Effect<GetMessagesByConversationIdResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetConversationInput>(input, 'input');
      const conversationId = yield* requireStringEffect(request.conversationId, 'conversationId');
      const conversationType = yield* requireStringEffect(
        request.conversationType,
        'conversationType',
      );
      const limit = yield* optionalPositiveNumberEffect(request.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(request.offset, 'offset');
      const params = buildEndpointParams({
        conversationType: { wireName: 'conversation_type', value: conversationType },
        limit: { wireName: 'limit', value: limit },
        offset: { wireName: 'offset', value: offset },
      });

      return yield* requestGetEffect<GetMessagesByConversationIdResponse>(
        client,
        `${basePath}/conversation/${conversationId}`,
        params,
      );
    });
  };

  /**
   * Sends a message to another eBay user.
   *
   * @param messageData - Generated SendMessageRequest body.
   * @returns An Effect that succeeds with eBay's generated SendMessageResponse.
   *
   * @example
   * ```ts
   * const sent = await Effect.runPromise(
   *   messageApi.sendMessage({ messageText: 'Hello', otherPartyUsername: 'buyer_123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/message/resources/send_message/methods/sendMessage
   */
  sendMessage = (
    messageData: SendMessageRequest,
  ): Effect.Effect<SendMessageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/send_message`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<SendMessageRequest>(messageData, 'messageData');

      return yield* requestPostEffect<SendMessageResponse>(client, path, body);
    });
  };

  /**
   * Updates a conversation status.
   *
   * @param updateData - Generated UpdateConversationRequest body.
   * @returns An Effect that succeeds when eBay accepts the update.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   messageApi.updateConversation({ conversationId: 'c1', conversationStatus: 'READ' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/message/resources/update_conversation/methods/updateConversation
   */
  updateConversation = (
    updateData: UpdateConversationRequest,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/update_conversation`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<UpdateConversationRequest>(updateData, 'updateData');

      return yield* requestPostEffect<void>(client, path, body);
    });
  };
}
