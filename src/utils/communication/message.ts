import { z } from 'zod';

/**
 * Zod schemas for Message API input validation.
 * OpenAPI spec: commerce_message_v1_oas3.json
 */

/** Optional positive page size accepted by Message list endpoints. */
const limitSchema = z
  .number({
    invalid_type_error: 'limit must be a number',
    description: 'Maximum number of items to return (25-50)',
  })
  .positive('limit must be a positive number')
  .optional();

/** Optional zero-based page offset accepted by Message list endpoints. */
const offsetSchema = z
  .number({
    invalid_type_error: 'offset must be a number',
    description: 'Number of items to skip',
  })
  .min(0, 'offset must be a non-negative number')
  .optional();

/** Schema for bulkUpdateConversation input. */
export const bulkUpdateConversationSchema = z.object({
  conversations: z
    .array(
      z.object({
        conversationId: z
          .string({
            invalid_type_error: 'conversationId must be a string',
            description: 'The unique identifier of the conversation',
          })
          .optional(),
        conversationStatus: z
          .string({
            invalid_type_error: 'conversationStatus must be a string',
            description: 'The updated status: ACTIVE, ARCHIVE, DELETE, READ, UNREAD',
          })
          .optional(),
        conversationType: z
          .string({
            invalid_type_error: 'conversationType must be a string',
            description:
              'The existing type: FROM_MEMBERS or FROM_EBAY (required but cannot be updated)',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'conversations must be an array',
        description: 'Array of conversations to update',
      },
    )
    .optional(),
});

/** Schema for getConversations input. */
export const getConversationsSchema = z.object({
  conversationType: z.string({
    message: 'Conversation type is required',
    required_error: 'conversationType is required',
    invalid_type_error: 'conversationType must be a string',
    description: 'Type of conversation: FROM_EBAY or FROM_MEMBERS',
  }),
  conversationStatus: z
    .string({
      invalid_type_error: 'conversationStatus must be a string',
      description: 'Filter by status: ACTIVE, ARCHIVE, DELETE, READ, UNREAD',
    })
    .optional(),
  endTime: z
    .string({
      invalid_type_error: 'endTime must be a string',
      description: 'End time for retrieving conversations (ISO 8601 format)',
    })
    .optional(),
  limit: limitSchema,
  offset: offsetSchema,
  otherPartyUsername: z
    .string({
      invalid_type_error: 'otherPartyUsername must be a string',
      description: 'Filter by specific eBay user',
    })
    .optional(),
  referenceId: z
    .string({
      invalid_type_error: 'referenceId must be a string',
      description: 'Filter by reference ID (e.g., listing ID)',
    })
    .optional(),
  referenceType: z
    .string({
      invalid_type_error: 'referenceType must be a string',
      description: 'Reference type (currently only LISTING is supported)',
    })
    .optional(),
  startTime: z
    .string({
      invalid_type_error: 'startTime must be a string',
      description: 'Start time for retrieving conversations (ISO 8601 format)',
    })
    .optional(),
});

/** Schema for getConversation input. */
export const getConversationSchema = z.object({
  conversationId: z.string({
    message: 'Conversation ID is required',
    required_error: 'conversationId is required',
    invalid_type_error: 'conversationId must be a string',
    description: 'The unique identifier for the conversation',
  }),
  conversationType: z.string({
    message: 'Conversation type is required',
    required_error: 'conversationType is required',
    invalid_type_error: 'conversationType must be a string',
    description: 'Type of conversation: FROM_EBAY or FROM_MEMBERS',
  }),
  limit: limitSchema,
  offset: offsetSchema,
});

/** Schema for sendMessage input. */
export const sendMessageSchema = z.object({
  conversationId: z
    .string({
      invalid_type_error: 'conversationId must be a string',
      description: 'ID of existing conversation (required if sending in existing conversation)',
    })
    .optional(),
  emailCopyToSender: z
    .boolean({
      invalid_type_error: 'emailCopyToSender must be a boolean',
      description: 'Whether to email a copy to the sender',
    })
    .optional(),
  messageMedia: z
    .array(
      z.object({
        mediaName: z
          .string({
            invalid_type_error: 'mediaName must be a string',
            description: 'Name of the media',
          })
          .optional(),
        mediaType: z
          .string({
            invalid_type_error: 'mediaType must be a string',
            description: 'Type of media: IMAGE, PDF, DOC, TXT',
          })
          .optional(),
        mediaUrl: z
          .string({
            invalid_type_error: 'mediaUrl must be a string',
            description: 'HTTPS URL of the self-hosted media',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'messageMedia must be an array',
        description: 'Array of up to 5 media attachments',
      },
    )
    .max(5, 'Maximum 5 media attachments allowed')
    .optional(),
  messageText: z
    .string({
      invalid_type_error: 'messageText must be a string',
      description: 'The text of the message (max 2000 characters)',
    })
    .max(2000, 'messageText must be 2000 characters or less')
    .optional(),
  otherPartyUsername: z
    .string({
      invalid_type_error: 'otherPartyUsername must be a string',
      description: 'eBay username to send message to (required for new conversations)',
    })
    .optional(),
  reference: z
    .object(
      {
        referenceId: z
          .string({
            invalid_type_error: 'referenceId must be a string',
            description: 'The reference ID (e.g., item ID for LISTING)',
          })
          .optional(),
        referenceType: z
          .string({
            invalid_type_error: 'referenceType must be a string',
            description: 'The reference type (currently only LISTING is supported)',
          })
          .optional(),
      },
      {
        invalid_type_error: 'reference must be an object',
        description: 'Reference to associate with the conversation',
      },
    )
    .optional(),
});

/** Schema for updateConversation input. */
export const updateConversationSchema = z.object({
  conversationId: z
    .string({
      invalid_type_error: 'conversationId must be a string',
      description: 'The unique identifier of the conversation',
    })
    .optional(),
  conversationStatus: z
    .string({
      invalid_type_error: 'conversationStatus must be a string',
      description: 'The updated status: ACTIVE, ARCHIVE, DELETE',
    })
    .optional(),
  conversationType: z
    .string({
      invalid_type_error: 'conversationType must be a string',
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
