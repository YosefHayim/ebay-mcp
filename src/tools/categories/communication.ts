import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';
import {
  getAwaitingFeedbackSchema,
  getFeedbackRatingSummarySchema,
  getFeedbackSchema,
  leaveFeedbackForBuyerSchema,
  respondToFeedbackSchema,
} from '@/utils/communication/feedback.js';
import {
  bulkUpdateConversationSchema,
  getConversationSchema,
  getConversationsSchema,
  sendMessageSchema,
  updateConversationSchema,
} from '@/utils/communication/message.js';
import {
  findEligibleItemsSchema,
  sendOfferToInterestedBuyersSchema,
} from '@/utils/communication/negotiation.js';
import {
  createDestinationSchema,
  createSubscriptionFilterSchema,
  createSubscriptionSchema,
  deleteDestinationSchema,
  deleteSubscriptionFilterSchema,
  deleteSubscriptionSchema,
  disableSubscriptionSchema,
  enableSubscriptionSchema,
  getConfigSchema,
  getDestinationSchema,
  getDestinationsSchema,
  getPublicKeySchema,
  getSubscriptionFilterSchema,
  getSubscriptionSchema,
  getSubscriptionsSchema,
  getTopicSchema,
  getTopicsSchema,
  testSubscriptionSchema,
  updateConfigSchema,
  updateDestinationSchema,
  updateSubscriptionSchema,
} from '@/utils/communication/notification.js';

/**
 * Communication API tools for member messages, notifications, and seller feedback.
 *
 * Each tool derives its transport schema from the same Zod object whose inferred
 * args are passed directly to the endpoint method. Handlers stay at the MCP
 * boundary: they run one endpoint Effect and avoid response or input reshaping.
 */
export const communicationEntries: ToolEntry[] = [
  // Negotiation API
  defineTool({
    name: 'ebay_find_eligible_items',
    description: 'Find items eligible for Send Offer to Buyers',
    inputSchema: findEligibleItemsSchema.shape,
    handler: (api, args) => Effect.runPromise(api.negotiation.findEligibleItems(args)),
  }),
  defineTool({
    name: 'ebay_send_offer_to_interested_buyers',
    description: 'Send offer to interested buyers',
    inputSchema: sendOfferToInterestedBuyersSchema.shape,
    handler: (api, args) => Effect.runPromise(api.negotiation.sendOfferToInterestedBuyers(args)),
  }),
  // Notification API
  defineTool({
    name: 'ebay_get_notification_config',
    description: 'Get notification configuration',
    inputSchema: getConfigSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getConfig(args)),
  }),
  defineTool({
    name: 'ebay_update_notification_config',
    description: 'Update notification configuration',
    inputSchema: updateConfigSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.updateConfig(args)),
  }),
  defineTool({
    name: 'ebay_get_notification_destinations',
    description: 'Get all notification destinations (paginated)',
    inputSchema: getDestinationsSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getDestinations(args)),
  }),
  defineTool({
    name: 'ebay_create_notification_destination',
    description: 'Create a notification destination',
    inputSchema: createDestinationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.createDestination(args)),
  }),
  // Notification API - Destination CRUD
  defineTool({
    name: 'ebay_get_notification_destination',
    description: 'Get a specific notification destination by ID',
    inputSchema: getDestinationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getDestination(args)),
  }),
  defineTool({
    name: 'ebay_update_notification_destination',
    description: 'Update a notification destination',
    inputSchema: updateDestinationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.updateDestination(args)),
  }),
  defineTool({
    name: 'ebay_delete_notification_destination',
    description: 'Delete a notification destination',
    inputSchema: deleteDestinationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.deleteDestination(args)),
  }),
  // Notification API - Subscription CRUD
  defineTool({
    name: 'ebay_get_notification_subscriptions',
    description: 'Get all notification subscriptions (paginated)',
    inputSchema: getSubscriptionsSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getSubscriptions(args)),
  }),
  defineTool({
    name: 'ebay_create_notification_subscription',
    description: 'Create a notification subscription',
    inputSchema: createSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.createSubscription(args)),
  }),
  defineTool({
    name: 'ebay_get_notification_subscription',
    description: 'Get a specific notification subscription by ID',
    inputSchema: getSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getSubscription(args)),
  }),
  defineTool({
    name: 'ebay_update_notification_subscription',
    description: 'Update a notification subscription',
    inputSchema: updateSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.updateSubscription(args)),
  }),
  defineTool({
    name: 'ebay_delete_notification_subscription',
    description: 'Delete a notification subscription',
    inputSchema: deleteSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.deleteSubscription(args)),
  }),
  defineTool({
    name: 'ebay_disable_notification_subscription',
    description: 'Disable a notification subscription',
    inputSchema: disableSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.disableSubscription(args)),
  }),
  defineTool({
    name: 'ebay_enable_notification_subscription',
    description: 'Enable a notification subscription',
    inputSchema: enableSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.enableSubscription(args)),
  }),
  defineTool({
    name: 'ebay_test_notification_subscription',
    description: 'Test a notification subscription by sending a test message',
    inputSchema: testSubscriptionSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.testSubscription(args)),
  }),
  // Notification API - Subscription Filters
  defineTool({
    name: 'ebay_create_notification_subscription_filter',
    description: 'Create a filter for a notification subscription',
    inputSchema: createSubscriptionFilterSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.createSubscriptionFilter(args)),
  }),
  defineTool({
    name: 'ebay_get_notification_subscription_filter',
    description: 'Get a specific subscription filter',
    inputSchema: getSubscriptionFilterSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getSubscriptionFilter(args)),
  }),
  defineTool({
    name: 'ebay_delete_notification_subscription_filter',
    description: 'Delete a subscription filter',
    inputSchema: deleteSubscriptionFilterSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.deleteSubscriptionFilter(args)),
  }),
  // Notification API - Topics
  defineTool({
    name: 'ebay_get_notification_topic',
    description: 'Get a specific notification topic by ID',
    inputSchema: getTopicSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getTopic(args)),
  }),
  defineTool({
    name: 'ebay_get_notification_topics',
    description: 'Get all available notification topics (paginated)',
    inputSchema: getTopicsSchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getTopics(args)),
  }),
  // Notification API - Public Key
  defineTool({
    name: 'ebay_get_notification_public_key',
    description: 'Get a public key for verifying notification signatures',
    inputSchema: getPublicKeySchema.shape,
    handler: (api, args) => Effect.runPromise(api.notification.getPublicKey(args)),
  }),
  // Message API - Conversations
  defineTool({
    name: 'ebay_get_conversations',
    description: 'Get all buyer-seller conversations (paginated)',
    inputSchema: getConversationsSchema.shape,
    handler: (api, args) => Effect.runPromise(api.message.getConversations(args)),
  }),
  defineTool({
    name: 'ebay_get_conversation',
    description: 'Get a specific conversation by ID',
    inputSchema: getConversationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.message.getConversation(args)),
  }),
  defineTool({
    name: 'ebay_send_message',
    description:
      'Send a direct message to a buyer regarding a specific transaction or inquiry. Use this to communicate about orders, answer questions, resolve issues, or provide updates.',
    inputSchema: sendMessageSchema.shape,
    handler: (api, args) => Effect.runPromise(api.message.sendMessage(args)),
  }),
  defineTool({
    name: 'ebay_bulk_update_conversation',
    description:
      'Bulk update multiple conversations. Each entry sets conversationStatus (ACTIVE, ARCHIVE, DELETE, READ, UNREAD) for a conversationId.',
    inputSchema: bulkUpdateConversationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.message.bulkUpdateConversation(args)),
  }),
  defineTool({
    name: 'ebay_update_conversation',
    description:
      'Update a single conversation (conversationStatus: ACTIVE, ARCHIVE, DELETE; or read flag).',
    inputSchema: updateConversationSchema.shape,
    handler: (api, args) => Effect.runPromise(api.message.updateConversation(args)),
  }),
  // Feedback API
  defineTool({
    name: 'ebay_get_feedback',
    description: 'Get feedback for a user by type',
    inputSchema: getFeedbackSchema.shape,
    handler: (api, args) => Effect.runPromise(api.feedback.getFeedback(args)),
  }),
  defineTool({
    name: 'ebay_leave_feedback_for_buyer',
    description:
      'Leave feedback for a buyer. Provide orderLineItemId, commentType (POSITIVE/NEUTRAL/NEGATIVE), and commentText.',
    inputSchema: leaveFeedbackForBuyerSchema.shape,
    handler: (api, args) => Effect.runPromise(api.feedback.leaveFeedbackForBuyer(args)),
  }),
  defineTool({
    name: 'ebay_get_awaiting_feedback',
    description: 'Get transactions awaiting feedback from the seller',
    inputSchema: getAwaitingFeedbackSchema.shape,
    handler: (api, args) => Effect.runPromise(api.feedback.getAwaitingFeedback(args)),
  }),
  defineTool({
    name: 'ebay_respond_to_feedback',
    description: 'Respond to feedback received from a buyer',
    inputSchema: respondToFeedbackSchema.shape,
    handler: (api, args) => Effect.runPromise(api.feedback.respondToFeedback(args)),
  }),
  defineTool({
    name: 'ebay_get_feedback_rating_summary',
    description: 'Get feedback rating summary for a user',
    inputSchema: getFeedbackRatingSummarySchema.shape,
    handler: (api, args) => Effect.runPromise(api.feedback.getFeedbackRatingSummary(args)),
  }),
];
