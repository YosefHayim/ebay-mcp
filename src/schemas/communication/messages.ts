import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { MessageReferenceType, FeedbackRating } from '@/types/ebay-enums.js';

/**
 * Communication API Schemas - Messages, Feedback, and Notifications
 *
 * This file contains Zod schemas for all Communication endpoints including:
 * - Message API
 * - Feedback API
 * - Notification API
 */

// ============================================================================
// Common Schemas
// ============================================================================

const errorSchema = z.object({
  errorId: z.number().optional(),
  domain: z.string().optional(),
  category: z.string().optional(),
  message: z.string().optional(),
  longMessage: z.string().optional(),
  parameters: z
    .array(
      z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),
});

const amountSchema = z.object({
  currency: z.string(),
  value: z.string(),
});

// ============================================================================
// Message API Schemas
// ============================================================================

const messageReferenceSchema = z.object({
  referenceId: z.string().optional(),
  referenceType: z.nativeEnum(MessageReferenceType).optional(),
});

const messageMediaSchema = z.object({
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
});

export const sendMessageInputSchema = z.object({
  messageText: z.string().describe('The text content of the message'),
  conversationId: z
    .string()
    .optional()
    .describe('The ID of the conversation to send the message in'),
  otherPartyUsername: z
    .string()
    .optional()
    .describe('The username of the other party (required if conversationId not provided)'),
  reference: messageReferenceSchema
    .optional()
    .describe('Reference information for the message (e.g., item or order ID)'),
  messageMedia: z
    .array(messageMediaSchema)
    .optional()
    .describe('Media attachments for the message'),
  emailCopyToSender: z.boolean().optional().describe('Whether to send an email copy to the sender'),
});

export const sendMessageOutputSchema = z.object({
  messageId: z.string().optional(),
  conversationId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

const messageSchema = z.object({
  messageId: z.string().optional(),
  messageText: z.string().optional(),
  creationDate: z.string().optional(),
  senderUsername: z.string().optional(),
  recipientUsername: z.string().optional(),
  messageType: z.string().optional(),
  messageMedia: z.array(messageMediaSchema).optional(),
});

export const getConversationsInputSchema = z.object({
  limit: z.number().optional().describe('Number of conversations to return'),
  offset: z.number().optional().describe('Number of conversations to skip'),
  status: z.string().optional().describe('Filter by conversation status'),
});

export const getConversationsOutputSchema = z.object({
  conversations: z
    .array(
      z.object({
        conversationId: z.string().optional(),
        creationDate: z.string().optional(),
        lastMessageDate: z.string().optional(),
        subject: z.string().optional(),
        otherPartyUsername: z.string().optional(),
        unreadMessageCount: z.number().optional(),
        status: z.string().optional(),
      })
    )
    .optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getConversationInputSchema = z.object({
  conversationId: z.string().describe('The unique identifier of the conversation'),
});

export const getConversationOutputSchema = z.object({
  conversationId: z.string().optional(),
  messages: z.array(messageSchema).optional(),
  otherPartyUsername: z.string().optional(),
  subject: z.string().optional(),
  creationDate: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Feedback API Schemas
// ============================================================================

export const leaveFeedbackInputSchema = z.object({
  orderLineItemId: z.string().describe('The unique identifier of the order line item'),
  rating: z
    .nativeEnum(FeedbackRating)
    .describe('The feedback rating (POSITIVE, NEGATIVE, NEUTRAL)'),
  feedbackText: z.string().optional().describe('The feedback comment text'),
});

export const leaveFeedbackOutputSchema = z.object({
  feedbackId: z.string().optional(),
  transactionId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getFeedbackInputSchema = z.object({
  transactionId: z.string().describe('The transaction ID'),
});

const feedbackDetailSchema = z.object({
  feedbackId: z.string().optional(),
  rating: z.string().optional(),
  feedbackText: z.string().optional(),
  commentingUser: z.string().optional(),
  creationDate: z.string().optional(),
  itemId: z.string().optional(),
  transactionId: z.string().optional(),
  orderLineItemId: z.string().optional(),
});

export const getFeedbackOutputSchema = z.object({
  feedback: feedbackDetailSchema.optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getFeedbackSummaryOutputSchema = z.object({
  positiveFeedbackPercent: z.string().optional(),
  uniquePositiveFeedbackCount: z.number().optional(),
  uniqueNegativeFeedbackCount: z.number().optional(),
  uniqueNeutralFeedbackCount: z.number().optional(),
  averageFeedbackRating: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getAwaitingFeedbackInputSchema = z.object({
  filter: z.string().optional().describe('Filter criteria for awaiting feedback'),
  limit: z.number().optional().describe('Number of items to return'),
  offset: z.number().optional().describe('Number of items to skip'),
});

export const getAwaitingFeedbackOutputSchema = z.object({
  items: z
    .array(
      z.object({
        orderLineItemId: z.string().optional(),
        transactionId: z.string().optional(),
        itemId: z.string().optional(),
        title: z.string().optional(),
        buyer: z.string().optional(),
        transactionDate: z.string().optional(),
        transactionPrice: amountSchema.optional(),
      })
    )
    .optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const respondToFeedbackInputSchema = z.object({
  feedbackId: z.string().describe('The unique identifier of the feedback'),
  responseText: z.string().describe('The response text'),
});

export const respondToFeedbackOutputSchema = z.object({
  responseId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Notification API Schemas
// ============================================================================

const deliveryConfigSchema = z.object({
  endpoint: z.string().optional(),
  format: z.string().optional(),
});

export const createNotificationDestinationInputSchema = z.object({
  name: z.string().describe('The name of the notification destination'),
  endpoint: z.string().describe('The endpoint URL for notifications'),
  verificationToken: z.string().optional().describe('Verification token for the endpoint'),
});

export const createNotificationDestinationOutputSchema = z.object({
  destinationId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getNotificationDestinationsInputSchema = z.object({
  limit: z.number().optional().describe('Number of destinations to return'),
  continuationToken: z.string().optional().describe('Token for pagination'),
});

export const getNotificationDestinationsOutputSchema = z.object({
  destinations: z
    .array(
      z.object({
        destinationId: z.string().optional(),
        name: z.string().optional(),
        endpoint: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const createNotificationSubscriptionInputSchema = z.object({
  topicId: z.string().describe('The topic ID to subscribe to'),
  destinationId: z.string().describe('The destination ID for notifications'),
  deliveryConfig: deliveryConfigSchema.optional().describe('Delivery configuration'),
});

export const createNotificationSubscriptionOutputSchema = z.object({
  subscriptionId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getNotificationSubscriptionsInputSchema = z.object({
  limit: z.number().optional().describe('Number of subscriptions to return'),
  continuationToken: z.string().optional().describe('Token for pagination'),
});

export const getNotificationSubscriptionsOutputSchema = z.object({
  subscriptions: z
    .array(
      z.object({
        subscriptionId: z.string().optional(),
        topicId: z.string().optional(),
        destinationId: z.string().optional(),
        status: z.string().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getNotificationTopicsOutputSchema = z.object({
  topics: z
    .array(
      z.object({
        topicId: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// Negotiation API Schemas
// ============================================================================

export const sendOfferToInterestedBuyersInputSchema = z.object({
  allowCounterOffer: z.boolean().optional().describe('Whether to allow counter offers'),
  message: z.string().optional().describe('Message to send with the offer'),
  offeredItems: z
    .array(
      z.object({
        offerId: z.string().optional(),
        availableQuantity: z.number().optional(),
        price: amountSchema.optional(),
      })
    )
    .optional()
    .describe('Items to include in the offer'),
});

export const sendOfferToInterestedBuyersOutputSchema = z.object({
  offerToInterestedBuyersId: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

export const getOffersToBuyersInputSchema = z.object({
  filter: z.string().optional().describe('Filter criteria'),
  limit: z.number().optional().describe('Number of offers to return'),
  offset: z.number().optional().describe('Number of offers to skip'),
});

export const getOffersToBuyersOutputSchema = z.object({
  offers: z
    .array(
      z.object({
        offerToInterestedBuyersId: z.string().optional(),
        offeredItems: z
          .array(
            z.object({
              offerId: z.string().optional(),
              price: amountSchema.optional(),
              quantity: z.number().optional(),
            })
          )
          .optional(),
        creationDate: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .optional(),
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  warnings: z.array(errorSchema).optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getCommunicationJsonSchemas() {
  return {
    // Message API
    sendMessageInput: zodToJsonSchema(sendMessageInputSchema, 'sendMessageInput'),
    sendMessageOutput: zodToJsonSchema(sendMessageOutputSchema, 'sendMessageOutput'),
    getConversationsInput: zodToJsonSchema(getConversationsInputSchema, 'getConversationsInput'),
    getConversationsOutput: zodToJsonSchema(getConversationsOutputSchema, 'getConversationsOutput'),
    getConversationInput: zodToJsonSchema(getConversationInputSchema, 'getConversationInput'),
    getConversationOutput: zodToJsonSchema(getConversationOutputSchema, 'getConversationOutput'),

    // Feedback API
    leaveFeedbackInput: zodToJsonSchema(leaveFeedbackInputSchema, 'leaveFeedbackInput'),
    leaveFeedbackOutput: zodToJsonSchema(leaveFeedbackOutputSchema, 'leaveFeedbackOutput'),
    getFeedbackInput: zodToJsonSchema(getFeedbackInputSchema, 'getFeedbackInput'),
    getFeedbackOutput: zodToJsonSchema(getFeedbackOutputSchema, 'getFeedbackOutput'),
    getFeedbackSummaryOutput: zodToJsonSchema(
      getFeedbackSummaryOutputSchema,
      'getFeedbackSummaryOutput'
    ),
    getAwaitingFeedbackInput: zodToJsonSchema(
      getAwaitingFeedbackInputSchema,
      'getAwaitingFeedbackInput'
    ),
    getAwaitingFeedbackOutput: zodToJsonSchema(
      getAwaitingFeedbackOutputSchema,
      'getAwaitingFeedbackOutput'
    ),
    respondToFeedbackInput: zodToJsonSchema(respondToFeedbackInputSchema, 'respondToFeedbackInput'),
    respondToFeedbackOutput: zodToJsonSchema(
      respondToFeedbackOutputSchema,
      'respondToFeedbackOutput'
    ),

    // Notification API
    createNotificationDestinationInput: zodToJsonSchema(
      createNotificationDestinationInputSchema,
      'createNotificationDestinationInput'
    ),
    createNotificationDestinationOutput: zodToJsonSchema(
      createNotificationDestinationOutputSchema,
      'createNotificationDestinationOutput'
    ),
    getNotificationDestinationsInput: zodToJsonSchema(
      getNotificationDestinationsInputSchema,
      'getNotificationDestinationsInput'
    ),
    getNotificationDestinationsOutput: zodToJsonSchema(
      getNotificationDestinationsOutputSchema,
      'getNotificationDestinationsOutput'
    ),
    createNotificationSubscriptionInput: zodToJsonSchema(
      createNotificationSubscriptionInputSchema,
      'createNotificationSubscriptionInput'
    ),
    createNotificationSubscriptionOutput: zodToJsonSchema(
      createNotificationSubscriptionOutputSchema,
      'createNotificationSubscriptionOutput'
    ),
    getNotificationSubscriptionsInput: zodToJsonSchema(
      getNotificationSubscriptionsInputSchema,
      'getNotificationSubscriptionsInput'
    ),
    getNotificationSubscriptionsOutput: zodToJsonSchema(
      getNotificationSubscriptionsOutputSchema,
      'getNotificationSubscriptionsOutput'
    ),
    getNotificationTopicsOutput: zodToJsonSchema(
      getNotificationTopicsOutputSchema,
      'getNotificationTopicsOutput'
    ),

    // Negotiation API
    sendOfferToInterestedBuyersInput: zodToJsonSchema(
      sendOfferToInterestedBuyersInputSchema,
      'sendOfferToInterestedBuyersInput'
    ),
    sendOfferToInterestedBuyersOutput: zodToJsonSchema(
      sendOfferToInterestedBuyersOutputSchema,
      'sendOfferToInterestedBuyersOutput'
    ),
    getOffersToBuyersInput: zodToJsonSchema(getOffersToBuyersInputSchema, 'getOffersToBuyersInput'),
    getOffersToBuyersOutput: zodToJsonSchema(
      getOffersToBuyersOutputSchema,
      'getOffersToBuyersOutput'
    ),
  };
}
