import { z } from 'zod';

/**
 * Zod schemas for Message API input validation
 * Based on: src/api/communication/message.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_message_v1_oas3.json
 * Types from: src/types/commerce_message_v1_oas3.ts
 */

// Reusable schema for filter parameter
const _filterSchema = z
  .string({
    error: 'filter must be a string',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    error: 'limit must be a string',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    error: 'offset must be a string',
  })
  .optional();

/**
 * Schema for bulkUpdateConversation method
 * Endpoint: POST /bulk_update_conversation
 * Body: BulkUpdateConversationsRequest - conversations array
 */
export const bulkUpdateConversationSchema = z.object({
  conversations: z
    .array(
      z.object({
        conversation_id: z
          .string({
            error: 'conversation_id must be a string',
          })
          .optional(),
        conversation_status: z
          .string({
            error: 'conversation_status must be a string',
          })
          .optional(),
        conversation_type: z
          .string({
            error: 'conversation_type must be a string',
          })
          .describe('The existing type: FROM_MEMBERS or FROM_EBAY (required but cannot be updated)')
          .optional(),
      }),
      {
        error: 'conversations must be an array',
      }
    )
    .optional(),
});

/**
 * Schema for getConversations method
 * Endpoint: GET /conversation
 * Params: GetConversationsParams - conversation_type (required), conversation_status, end_time, limit, offset, other_party_username, reference_id, reference_type, start_time
 */
export const getConversationsSchema = z.object({
  conversation_type: z.string({
    error: 'conversation_type is required',
  }),
  conversation_status: z
    .string({
      error: 'conversation_status must be a string',
    })
    .optional(),
  end_time: z
    .string({
      error: 'end_time must be a string',
    })
    .optional(),
  limit: limitSchema,
  offset: offsetSchema,
  other_party_username: z
    .string({
      error: 'other_party_username must be a string',
    })
    .optional(),
  reference_id: z
    .string({
      error: 'reference_id must be a string',
    })
    .optional(),
  reference_type: z
    .string({
      error: 'reference_type must be a string',
    })
    .optional(),
  start_time: z
    .string({
      error: 'start_time must be a string',
    })
    .optional(),
});

/**
 * Schema for getConversation method
 * Endpoint: GET /conversation/{conversation_id}
 * Path: conversation_id (required)
 * Query: conversation_type (required), limit, offset
 */
export const getConversationSchema = z.object({
  conversation_id: z.string({
    error: 'conversation_id is required',
  }),
  conversation_type: z.string({
    error: 'conversation_type is required',
  }),
  limit: limitSchema,
  offset: offsetSchema,
});

/**
 * Schema for sendMessage method
 * Endpoint: POST /send_message
 * Body: SendMessageRequest - conversationId, emailCopyToSender, messageMedia, messageText, otherPartyUsername, reference
 */
export const sendMessageSchema = z.object({
  conversation_id: z
    .string({
      error: 'conversation_id must be a string',
    })
    .optional(),
  email_copy_to_sender: z
    .boolean({
      error: 'email_copy_to_sender must be a boolean',
    })
    .optional(),
  message_media: z
    .array(
      z.object({
        media_name: z
          .string({
            error: 'media_name must be a string',
          })
          .optional(),
        media_type: z
          .string({
            error: 'media_type must be a string',
          })
          .optional(),
        media_url: z
          .string({
            error: 'media_url must be a string',
          })
          .optional(),
      }),
      {
        error: 'message_media must be an array',
      }
    )
    .max(5, 'Maximum 5 media attachments allowed')
    .optional(),
  message_text: z
    .string({
      error: 'message_text must be a string',
    })
    .max(2000, 'message_text must be 2000 characters or less')
    .optional(),
  other_party_username: z
    .string({
      error: 'other_party_username must be a string',
    })
    .optional(),
  reference: z
    .object(
      {
        reference_id: z
          .string({
            error: 'reference_id must be a string',
          })
          .optional(),
        reference_type: z
          .string({
            error: 'reference_type must be a string',
          })
          .optional(),
      },
      {
        error: 'reference must be an object',
      }
    )
    .optional(),
});

/**
 * Schema for updateConversation method
 * Endpoint: POST /update_conversation
 * Body: UpdateConversationRequest - conversationId, conversationStatus, conversationType, read
 */
export const updateConversationSchema = z.object({
  conversation_id: z
    .string({
      error: 'conversation_id must be a string',
    })
    .optional(),
  conversation_status: z
    .string({
      error: 'conversation_status must be a string',
    })
    .optional(),
  conversation_type: z
    .string({
      error: 'conversation_type must be a string',
    })
    .optional(),
  read: z
    .boolean({
      error: 'read must be a boolean',
    })
    .optional(),
});
