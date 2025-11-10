import { z } from "zod";

/**
 * Zod schemas for Message API input validation
 * Based on: src/api/communication/message.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_message_v1_oas3.json
 */

// Reusable schema for filter parameter
const filterSchema = z.string({
  message: "Filter must be a string",
  invalid_type_error: "filter must be a string",
  description: "Filter criteria for the query"
}).optional();

// Reusable schema for limit parameter
const limitSchema = z.coerce.number({
  message: "Limit must be a positive number",
  invalid_type_error: "limit must be a number",
  description: "Maximum number of items to return"
}).positive({
  message: "limit must be a positive number"
}).int({
  message: "limit must be an integer"
}).optional();

// Reusable schema for offset parameter
const offsetSchema = z.coerce.number({
  message: "Offset must be a non-negative number",
  invalid_type_error: "offset must be a number",
  description: "Number of items to skip"
}).nonnegative({
  message: "offset must be a non-negative number"
}).int({
  message: "offset must be an integer"
}).optional();

/**
 * Schema for bulkUpdateConversation method
 * Endpoint: POST /bulk_update_conversation
 */
export const bulkUpdateConversationSchema = z.object({
  update_data: z.record(z.unknown(), {
    message: "Update data is required",
    required_error: "update_data is required",
    invalid_type_error: "update_data must be an object",
    description: "The conversation update data"
  })
});

/**
 * Schema for getConversations method
 * Endpoint: GET /conversation
 */
export const getConversationsSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema
});

/**
 * Schema for getConversation method
 * Endpoint: GET /conversation/{conversation_id}
 */
export const getConversationSchema = z.object({
  conversation_id: z.string({
    message: "Conversation ID is required",
    required_error: "conversation_id is required",
    invalid_type_error: "conversation_id must be a string",
    description: "The unique identifier for the conversation"
  })
});

/**
 * Schema for sendMessage method
 * Endpoint: POST /send_message
 */
export const sendMessageSchema = z.object({
  message_data: z.record(z.unknown(), {
    message: "Message data is required",
    required_error: "message_data is required",
    invalid_type_error: "message_data must be an object",
    description: "The message data to send"
  })
});

/**
 * Schema for updateConversation method
 * Endpoint: POST /update_conversation
 */
export const updateConversationSchema = z.object({
  update_data: z.record(z.unknown(), {
    message: "Update data is required",
    required_error: "update_data is required",
    invalid_type_error: "update_data must be an object",
    description: "The conversation update data"
  })
});
