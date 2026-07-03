import type { EbayApiClient } from '@/api/client.js';
import {
  assertRequiredString,
  buildPaginatedQueryParams,
  getPathWithContextError,
  getWithContextError,
} from './shared.js';
import { withApiError } from '@/api/shared/request.js';

/**
 * Message API - Buyer-seller messaging
 * Based on: docs/sell-apps/communication/commerce_message_v1_oas3.json
 */
export class MessageApi {
  private readonly basePath = '/commerce/message/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Bulk update conversation
   * Endpoint: POST /bulk_update_conversation
   * @throws Error if required parameters are missing or invalid
   */
  async bulkUpdateConversation(updateData: Record<string, unknown>) {
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('updateData is required and must be an object');
    }

    return await withApiError('Failed to bulk update conversation', () =>
      this.client.post(`${this.basePath}/bulk_update_conversation`, updateData),
    );
  }

  /**
   * Get conversations
   * Endpoint: GET /conversation
   * @param filter API filter expression.
   * @param limit Maximum number of records to return.
   * @param offset Zero-based pagination offset.
   * @throws Error if the request fails
   */
  async getConversations(filter?: string, limit?: number, offset?: number) {
    const conversationPath = `${this.basePath}/conversation`;
    const queryParams = this.buildConversationQueryParams(filter, limit, offset);
    return await getWithContextError(
      this.client,
      conversationPath,
      queryParams,
      'Failed to get conversations',
    );
  }

  /**
   * Build query params used by conversation listing endpoints.
   *
   * @param filter API filter expression.
   * @param limit Maximum number of records to return.
   * @param offset Zero-based pagination offset.
   * @returns Validated conversation query params.
   */
  private buildConversationQueryParams(
    filter?: string,
    limit?: number,
    offset?: number,
  ): Record<string, string | number> {
    return buildPaginatedQueryParams(filter, limit, offset);
  }

  /**
   * Get a specific conversation
   * Endpoint: GET /conversation/{conversation_id}
   * @param conversationId Conversation identifier.
   * @throws Error if required parameters are missing or invalid
   */
  async getConversation(conversationId: string) {
    assertRequiredString(conversationId, 'conversationId');
    return await getPathWithContextError(
      this.client,
      `${this.basePath}/conversation/${conversationId}`,
      'Failed to get conversation',
    );
  }

  /**
   * Send a message
   * Endpoint: POST /send_message
   * @throws Error if required parameters are missing or invalid
   */
  async sendMessage(messageData: Record<string, unknown>) {
    if (!messageData || typeof messageData !== 'object') {
      throw new Error('messageData is required and must be an object');
    }

    return await withApiError('Failed to send message', () =>
      this.client.post(`${this.basePath}/send_message`, messageData),
    );
  }

  /**
   * Update a conversation
   * Endpoint: POST /update_conversation
   * @throws Error if required parameters are missing or invalid
   */
  async updateConversation(updateData: Record<string, unknown>) {
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('updateData is required and must be an object');
    }

    return await withApiError('Failed to update conversation', () =>
      this.client.post(`${this.basePath}/update_conversation`, updateData),
    );
  }

  /**
   * Search for messages
   * @deprecated Use getConversations() instead
   */
  async searchMessages(filter?: string, limit?: number, offset?: number) {
    return await this.getConversations(filter, limit, offset);
  }

  /**
   * Get a specific message
   * @deprecated Use getConversation() instead
   */
  async getMessage(messageId: string) {
    return await this.getConversation(messageId);
  }

  /**
   * Reply to a message
   * @deprecated Use sendMessage() instead
   */
  async replyToMessage(messageId: string, messageContent: string) {
    return await this.sendMessage({
      conversation_id: messageId,
      message_content: messageContent,
    });
  }
}
