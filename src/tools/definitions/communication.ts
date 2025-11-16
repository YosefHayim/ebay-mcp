import { z } from 'zod';
import {
  feedbackDataSchema,
  notificationConfigSchema,
  notificationDestinationSchema,
  offerToBuyersSchema,
} from '../schemas.js';

export interface OutputArgs {
  [x: string]: unknown;
  type: 'object';
  properties?: Record<string, object>;
  required?: string[];
}

export interface ToolAnnotations {
  [x: string]: unknown;
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

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
  // Feedback API
  {
    name: 'ebay_get_feedback',
    description: 'Get feedback for a transaction',
    inputSchema: {
      transactionId: z.string().describe('The transaction ID'),
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
  },
];
