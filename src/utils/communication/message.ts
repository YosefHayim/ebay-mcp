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
    message: 'Filter must be a string',
    invalid_type_error: 'filter must be a string',
    description: 'Filter criteria for the query',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    invalid_type_error: 'limit must be a string',
    description: 'Maximum number of items to return (25-50)',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    invalid_type_error: 'offset must be a string',
    description: 'Number of items to skip',
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
            invalid_type_error: 'conversation_id must be a string',
            description: 'The unique identifier of the conversation',
          })
          .optional(),
        conversation_status: z
          .string({
            invalid_type_error: 'conversation_status must be a string',
            description: 'The updated status: ACTIVE, ARCHIVE, DELETE, READ, UNREAD',
          })
          .optional(),
        conversation_type: z
          .string({
            invalid_type_error: 'conversation_type must be a string',
            description:
              'The existing type: FROM_MEMBERS or FROM_EBAY (required but cannot be updated)',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'conversations must be an array',
        description: 'Array of conversations to update',
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
    message: 'Conversation type is required',
    required_error: 'conversation_type is required',
    invalid_type_error: 'conversation_type must be a string',
    description: 'Type of conversation: FROM_EBAY or FROM_MEMBERS',
  }),
  conversation_status: z
    .string({
      invalid_type_error: 'conversation_status must be a string',
      description: 'Filter by status: ACTIVE, ARCHIVE, DELETE, READ, UNREAD',
    })
    .optional(),
  end_time: z
    .string({
      invalid_type_error: 'end_time must be a string',
      description: 'End time for retrieving conversations (ISO 8601 format)',
    })
    .optional(),
  limit: limitSchema,
  offset: offsetSchema,
  other_party_username: z
    .string({
      invalid_type_error: 'other_party_username must be a string',
      description: 'Filter by specific eBay user',
    })
    .optional(),
  reference_id: z
    .string({
      invalid_type_error: 'reference_id must be a string',
      description: 'Filter by reference ID (e.g., listing ID)',
    })
    .optional(),
  reference_type: z
    .string({
      invalid_type_error: 'reference_type must be a string',
      description: 'Reference type (currently only LISTING is supported)',
    })
    .optional(),
  start_time: z
    .string({
      invalid_type_error: 'start_time must be a string',
      description: 'Start time for retrieving conversations (ISO 8601 format)',
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
    message: 'Conversation ID is required',
    required_error: 'conversation_id is required',
    invalid_type_error: 'conversation_id must be a string',
    description: 'The unique identifier for the conversation',
  }),
  conversation_type: z.string({
    message: 'Conversation type is required',
    required_error: 'conversation_type is required',
    invalid_type_error: 'conversation_type must be a string',
    description: 'Type of conversation: FROM_EBAY or FROM_MEMBERS',
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
      invalid_type_error: 'conversation_id must be a string',
      description: 'ID of existing conversation (required if sending in existing conversation)',
    })
    .optional(),
  email_copy_to_sender: z
    .boolean({
      invalid_type_error: 'email_copy_to_sender must be a boolean',
      description: 'Whether to email a copy to the sender',
    })
    .optional(),
  message_media: z
    .array(
      z.object({
        media_name: z
          .string({
            invalid_type_error: 'media_name must be a string',
            description: 'Name of the media',
          })
          .optional(),
        media_type: z
          .string({
            invalid_type_error: 'media_type must be a string',
            description: 'Type of media: IMAGE, PDF, DOC, TXT',
          })
          .optional(),
        media_url: z
          .string({
            invalid_type_error: 'media_url must be a string',
            description: 'HTTPS URL of the self-hosted media',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'message_media must be an array',
        description: 'Array of up to 5 media attachments',
      }
    )
    .max(5, 'Maximum 5 media attachments allowed')
    .optional(),
  message_text: z
    .string({
      invalid_type_error: 'message_text must be a string',
      description: 'The text of the message (max 2000 characters)',
    })
    .max(2000, 'message_text must be 2000 characters or less')
    .optional(),
  other_party_username: z
    .string({
      invalid_type_error: 'other_party_username must be a string',
      description: 'eBay username to send message to (required for new conversations)',
    })
    .optional(),
  reference: z
    .object(
      {
        reference_id: z
          .string({
            invalid_type_error: 'reference_id must be a string',
            description: 'The reference ID (e.g., item ID for LISTING)',
          })
          .optional(),
        reference_type: z
          .string({
            invalid_type_error: 'reference_type must be a string',
            description: 'The reference type (currently only LISTING is supported)',
          })
          .optional(),
      },
      {
        invalid_type_error: 'reference must be an object',
        description: 'Reference to associate with the conversation',
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
      invalid_type_error: 'conversation_id must be a string',
      description: 'The unique identifier of the conversation',
    })
    .optional(),
  conversation_status: z
    .string({
      invalid_type_error: 'conversation_status must be a string',
      description: 'The updated status: ACTIVE, ARCHIVE, DELETE',
    })
    .optional(),
  conversation_type: z
    .string({
      invalid_type_error: 'conversation_type must be a string',
      description: 'The existing type: FROM_MEMBERS or FROM_EBAY (required but cannot be updated)',
    })
    .optional(),
  read: z
    .boolean({
      invalid_type_error: 'read must be a boolean',
      description: 'The read status to set (true = read, false = unread)',
    })
    .optional(),
});
