import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  feedbackDataSchema,
  notificationConfigSchema,
  notificationDestinationSchema,
  offerToBuyersSchema,
} from '../schemas.js';
import { OutputArgs, ToolAnnotations } from '../tool-definitions.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  title?: string;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
}
export const communicationTools: ToolDefinition[] = [
  // Negotiation API
  {
    name: 'ebay_get_offers_to_buyers',
    description: 'Get offers to buyers (Best Offers) for the seller',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for offers'),
      limit: z.number().optional().describe('Number of offers to return'),
      offset: z.number().optional().describe('Number of offers to skip'),
    },
  },
  {
    name: 'ebay_send_offer_to_interested_buyers',
    description: 'Send offer to interested buyers',
    inputSchema: {
      offerId: z.string().describe('The offer ID'),
      offerData: offerToBuyersSchema.describe('Offer details to send to buyers'),
    },
  },
  // Message API
  {
    name: 'ebay_search_messages',
    description: 'Search for buyer-seller messages',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for messages'),
      limit: z.number().optional().describe('Number of messages to return'),
      offset: z.number().optional().describe('Number of messages to skip'),
    },
  },
  {
    name: 'ebay_get_message',
    description: 'Get a specific message by ID',
    inputSchema: {
      messageId: z.string().describe('The message ID'),
    },
  },
  {
    name: 'ebay_send_message',
    description:
      'Send a direct message to a buyer regarding a specific transaction or inquiry. Use this to communicate about orders, answer questions, resolve issues, or provide updates.',
    inputSchema: {
      messageData: z
        .object({
          conversationId: z
            .string()
            .optional()
            .describe(
              'Optional conversation ID to reply to an existing thread. Use getConversations to retrieve conversation IDs. Required if replying to existing conversation.'
            ),
          messageText: z
            .string()
            .describe('REQUIRED. The text of the message to send (max 2000 characters).'),
          otherPartyUsername: z
            .string()
            .optional()
            .describe(
              'eBay username of the other party (buyer or seller). Required when starting a new conversation.'
            ),
          emailCopyToSender: z
            .boolean()
            .optional()
            .describe('If true, a copy of the message will be emailed to the sender.'),
          reference: z
            .object({
              referenceId: z
                .string()
                .optional()
                .describe(
                  'The ID of the listing or order to reference (e.g., item ID or order ID)'
                ),
              referenceType: z
                .string()
                .optional()
                .describe(
                  'Type of reference. Valid values: "LISTING" (for item listings) or "ORDER" (for orders)'
                ),
            })
            .optional()
            .describe('Optional reference to associate message with a listing or order.'),
          messageMedia: z
            .array(
              z.object({
                mediaUrl: z.string().optional().describe('URL of the media to attach'),
                mediaType: z
                  .string()
                  .optional()
                  .describe('MIME type of the media (e.g., "image/jpeg")'),
              })
            )
            .optional()
            .describe('Optional array of media attachments (max 5 per message)'),
        })
        .describe(
          'Message details including recipient and content. Must include messageText (required), and either conversationId (for replies) OR otherPartyUsername (for new messages).'
        ),
    },
  },
  {
    name: 'ebay_reply_to_message',
    description: 'Reply to a buyer message in an existing conversation thread',
    inputSchema: {
      messageId: z.string().describe('The conversation/message ID to reply to'),
      messageContent: z.string().describe('The reply message content'),
    },
  },
  // Notification API
  {
    name: 'ebay_get_notification_config',
    description: 'Get notification configuration',
    inputSchema: {},
  },
  {
    name: 'ebay_update_notification_config',
    description: 'Update notification configuration',
    inputSchema: {
      config: notificationConfigSchema.describe('Notification configuration settings'),
    },
  },
  {
    name: 'ebay_get_notification_destinations',
    description: 'Get all notification destinations (paginated)',
    inputSchema: {
      limit: z
        .number()
        .optional()
        .describe('Maximum number of destinations to return (10-100, default: 20)'),
      continuationToken: z.string().optional().describe('Token to retrieve next page of results'),
    },
  },
  {
    name: 'ebay_create_notification_destination',
    description: 'Create a notification destination',
    inputSchema: {
      destination: notificationDestinationSchema.describe('Destination configuration'),
    },
  },
  // Notification API - Destination CRUD
  {
    name: 'ebay_get_notification_destination',
    description: 'Get a specific notification destination by ID',
    inputSchema: {
      destination_id: z.string().describe('The unique identifier for the destination'),
    },
  },
  {
    name: 'ebay_update_notification_destination',
    description: 'Update a notification destination',
    inputSchema: {
      destination_id: z.string().describe('The unique identifier for the destination'),
      delivery_config: z
        .object({
          endpoint: z.string().optional().describe('HTTPS endpoint URL'),
          verification_token: z
            .string()
            .optional()
            .describe('Verification token (32-80 characters)'),
        })
        .optional()
        .describe('Delivery configuration'),
      name: z.string().optional().describe('Destination name'),
      status: z.string().optional().describe('Status: ENABLED or DISABLED'),
    },
  },
  {
    name: 'ebay_delete_notification_destination',
    description: 'Delete a notification destination',
    inputSchema: {
      destination_id: z.string().describe('The unique identifier for the destination'),
    },
  },
  // Notification API - Subscription CRUD
  {
    name: 'ebay_get_notification_subscriptions',
    description: 'Get all notification subscriptions (paginated)',
    inputSchema: {
      limit: z.string().optional().describe('Maximum number of subscriptions to return'),
      continuation_token: z.string().optional().describe('Token for pagination'),
    },
  },
  {
    name: 'ebay_create_notification_subscription',
    description: 'Create a notification subscription',
    inputSchema: {
      destination_id: z.string().optional().describe('The destination endpoint ID'),
      payload: z
        .object({
          delivery_protocol: z.string().optional().describe('Delivery protocol (HTTPS)'),
          format: z.string().optional().describe('Payload format (JSON)'),
          schema_version: z.string().optional().describe('Schema version'),
        })
        .optional()
        .describe('Payload configuration'),
      status: z.string().optional().describe('Status: ENABLED or DISABLED'),
      topic_id: z.string().optional().describe('The notification topic ID'),
    },
  },
  {
    name: 'ebay_get_notification_subscription',
    description: 'Get a specific notification subscription by ID',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
    },
  },
  {
    name: 'ebay_update_notification_subscription',
    description: 'Update a notification subscription',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
      destination_id: z.string().optional().describe('The destination endpoint ID'),
      payload: z
        .object({
          delivery_protocol: z.string().optional().describe('Delivery protocol'),
          format: z.string().optional().describe('Payload format'),
          schema_version: z.string().optional().describe('Schema version'),
        })
        .optional()
        .describe('Payload configuration'),
      status: z.string().optional().describe('Status: ENABLED or DISABLED'),
    },
  },
  {
    name: 'ebay_delete_notification_subscription',
    description: 'Delete a notification subscription',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
    },
  },
  {
    name: 'ebay_disable_notification_subscription',
    description: 'Disable a notification subscription',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
    },
  },
  {
    name: 'ebay_enable_notification_subscription',
    description: 'Enable a notification subscription',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
    },
  },
  {
    name: 'ebay_test_notification_subscription',
    description: 'Test a notification subscription by sending a test message',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
    },
  },
  // Notification API - Subscription Filters
  {
    name: 'ebay_create_notification_subscription_filter',
    description: 'Create a filter for a notification subscription',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
      filter_schema: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('JSON Schema document to filter notifications'),
    },
  },
  {
    name: 'ebay_get_notification_subscription_filter',
    description: 'Get a specific subscription filter',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
      filter_id: z.string().describe('The unique identifier for the filter'),
    },
  },
  {
    name: 'ebay_delete_notification_subscription_filter',
    description: 'Delete a subscription filter',
    inputSchema: {
      subscription_id: z.string().describe('The unique identifier for the subscription'),
      filter_id: z.string().describe('The unique identifier for the filter'),
    },
  },
  // Notification API - Topics
  {
    name: 'ebay_get_notification_topic',
    description: 'Get a specific notification topic by ID',
    inputSchema: {
      topic_id: z.string().describe('The unique identifier for the topic'),
    },
  },
  {
    name: 'ebay_get_notification_topics',
    description: 'Get all available notification topics (paginated)',
    inputSchema: {
      limit: z.string().optional().describe('Maximum number of topics to return'),
      continuation_token: z.string().optional().describe('Token for pagination'),
    },
  },
  // Notification API - Public Key
  {
    name: 'ebay_get_notification_public_key',
    description: 'Get a public key for verifying notification signatures',
    inputSchema: {
      public_key_id: z.string().describe('The unique identifier for the public key'),
    },
  },
  // Message API - Conversations
  {
    name: 'ebay_get_conversations',
    description: 'Get all buyer-seller conversations (paginated)',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for conversations'),
      limit: z.number().optional().describe('Number of conversations to return'),
      offset: z.number().optional().describe('Number of conversations to skip'),
    },
  },
  {
    name: 'ebay_get_conversation',
    description: 'Get a specific conversation by ID',
    inputSchema: {
      conversation_id: z.string().describe('The unique identifier for the conversation'),
    },
  },
  {
    name: 'ebay_bulk_update_conversation',
    description: 'Bulk update multiple conversations (read status, flagged, etc.)',
    inputSchema: {
      conversations: z
        .array(
          z.object({
            conversation_id: z.string().describe('The conversation ID'),
            read: z.boolean().optional().describe('Mark as read/unread'),
            flagged: z.boolean().optional().describe('Mark as flagged/unflagged'),
          })
        )
        .describe('Array of conversations to update'),
    },
  },
  {
    name: 'ebay_update_conversation',
    description: 'Update a single conversation (read status, flagged, etc.)',
    inputSchema: {
      conversation_id: z.string().describe('The conversation ID'),
      read: z.boolean().optional().describe('Mark as read/unread'),
      flagged: z.boolean().optional().describe('Mark as flagged/unflagged'),
    },
  },
  // Feedback API
  {
    name: 'ebay_get_feedback',
    description: 'Get feedback for a user by type',
    inputSchema: {
      user_id: z.string().describe('The eBay username of the user'),
      feedback_type: z.string().describe('Type: FEEDBACK_RECEIVED or FEEDBACK_SENT'),
      feedback_id: z.string().optional().describe('Filter by specific feedback ID'),
      filter: z.string().optional().describe('Filter criteria'),
      limit: z.string().optional().describe('Maximum number of feedback items to return'),
      listing_id: z.string().optional().describe('Filter by listing ID'),
      offset: z.string().optional().describe('Number of items to skip'),
      order_line_item_id: z.string().optional().describe('Filter by order line item ID'),
      sort: z.string().optional().describe('Sort order'),
      transaction_id: z.string().optional().describe('Filter by transaction ID'),
    },
  },
  {
    name: 'ebay_leave_feedback_for_buyer',
    description: 'Leave feedback for a buyer',
    inputSchema: {
      feedbackData: feedbackDataSchema.describe('Feedback details including rating and comment'),
    },
  },
  {
    name: 'ebay_get_feedback_summary',
    description: 'Get feedback summary for the seller',
    inputSchema: {},
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    } as OutputArgs,
  },
  {
    name: 'ebay_get_awaiting_feedback',
    description: 'Get transactions awaiting feedback from the seller',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria'),
      limit: z.string().optional().describe('Maximum number of items to return (25-200)'),
      offset: z.string().optional().describe('Number of items to skip'),
      sort: z.string().optional().describe('Sort order'),
    },
  },
  {
    name: 'ebay_respond_to_feedback',
    description: 'Respond to feedback received from a buyer',
    inputSchema: {
      feedback_id: z.string().optional().describe('The feedback ID being responded to'),
      recipient_user_id: z.string().optional().describe('The user ID of the feedback provider'),
      response_text: z
        .string()
        .optional()
        .describe('The response text content (max 500 characters)'),
      response_type: z.string().optional().describe('The response type: REPLY or FOLLOW_UP'),
    },
  },
  {
    name: 'ebay_get_feedback_rating_summary',
    description: 'Get feedback rating summary for a user',
    inputSchema: {
      user_id: z.string().describe('The eBay username of the user'),
      filter: z.string().describe('Filter with required ratingType parameter'),
    },
  },
];
