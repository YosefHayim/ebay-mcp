import type { z } from "zod";
import {
	getFeedbackRatingSummarySchema,
	getFeedbackSchema,
	getItemsAwaitingFeedbackSchema,
	leaveFeedbackSchema,
	respondToFeedbackSchema,
} from "@/ebay-apis/communication/feedbackHelpers.js";
import {
	bulkUpdateConversationSchema,
	getConversationSchema,
	getConversationsSchema,
	sendMessageSchema,
	updateConversationSchema,
} from "@/ebay-apis/communication/messageHelpers.js";
import {
	findEligibleItemsSchema,
	sendOfferToInterestedBuyersSchema,
} from "@/ebay-apis/communication/negotiationHelpers.js";
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
} from "@/ebay-apis/communication/notificationHelpers.js";
import { defined } from "@/shared/objects.js";
import { defineTool } from "@/tool-registry/defineTool.js";
import type { ToolEntry } from "@/tool-registry/registry.js";

type SendMessageInput = z.infer<typeof sendMessageSchema>;
type BulkUpdateConversationInput = z.infer<typeof bulkUpdateConversationSchema>;
type LeaveFeedbackInput = z.infer<typeof leaveFeedbackSchema>;

function isMissing<Field>(
	field: Field | null | undefined,
): field is null | undefined {
	return field == null;
}

function omitUndefinedMessageMedia(
	media: NonNullable<SendMessageInput["messageMedia"]>[number],
) {
	return defined({
		mediaName: media.mediaName,
		mediaType: media.mediaType,
		mediaUrl: media.mediaUrl,
	});
}

function listDefinedMessageMedia(message: SendMessageInput) {
	if (isMissing(message.messageMedia)) {
		return undefined;
	}

	return message.messageMedia.map(omitUndefinedMessageMedia);
}

function omitUndefinedMessageReference(message: SendMessageInput) {
	if (isMissing(message.reference)) {
		return undefined;
	}

	return defined({
		referenceId: message.reference.referenceId,
		referenceType: message.reference.referenceType,
	});
}

function omitUndefinedSendMessage(message: SendMessageInput) {
	const messageMedia = listDefinedMessageMedia(message);
	const reference = omitUndefinedMessageReference(message);

	return defined({
		conversationId: message.conversationId,
		emailCopyToSender: message.emailCopyToSender,
		messageMedia,
		messageText: message.messageText,
		otherPartyUsername: message.otherPartyUsername,
		reference,
	});
}

function omitUndefinedConversation(
	conversation: NonNullable<
		BulkUpdateConversationInput["conversations"]
	>[number],
) {
	return defined({
		conversationId: conversation.conversationId,
		conversationStatus: conversation.conversationStatus,
		conversationType: conversation.conversationType,
	});
}

function omitUndefinedBulkUpdate(update: BulkUpdateConversationInput) {
	if (isMissing(update.conversations)) {
		return defined({});
	}

	return defined({
		conversations: update.conversations.map(omitUndefinedConversation),
	});
}

function omitUndefinedFeedbackImage(
	image: NonNullable<LeaveFeedbackInput["images"]>[number],
) {
	return defined({ url: image.url });
}

function omitUndefinedSellerRating(
	rating: NonNullable<LeaveFeedbackInput["sellerRatings"]>[number],
) {
	return defined({ key: rating.key, value: rating.value });
}

function listDefinedFeedbackImages(feedback: LeaveFeedbackInput) {
	if (isMissing(feedback.images)) {
		return undefined;
	}

	return feedback.images.map(omitUndefinedFeedbackImage);
}

function listDefinedSellerRatings(feedback: LeaveFeedbackInput) {
	if (isMissing(feedback.sellerRatings)) {
		return undefined;
	}

	return feedback.sellerRatings.map(omitUndefinedSellerRating);
}

function omitUndefinedLeaveFeedback(feedback: LeaveFeedbackInput) {
	const images = listDefinedFeedbackImages(feedback);
	const sellerRatings = listDefinedSellerRatings(feedback);

	return defined({
		commentText: feedback.commentText,
		commentType: feedback.commentType,
		images,
		listingId: feedback.listingId,
		orderLineItemId: feedback.orderLineItemId,
		sellerRatings,
		transactionId: feedback.transactionId,
	});
}

/**
 * Communication API tools for member messages, notifications, and seller feedback.
 *
 * Each tool derives its transport schema from the same Zod object whose inferred
 * args are passed to the endpoint method. Handlers stay at the MCP boundary:
 * they run one endpoint call and leave off optional fields that are undefined.
 */
export const communicationEntries: ToolEntry[] = [
	// Negotiation API
	defineTool({
		name: "ebay_find_eligible_items",
		description: "Find items eligible for Send Offer to Buyers",
		inputSchema: findEligibleItemsSchema.shape,
		handler: (api, args) => api.negotiation.findEligibleItems(args),
	}),
	defineTool({
		name: "ebay_send_offer_to_interested_buyers",
		description: "Send offer to interested buyers",
		inputSchema: sendOfferToInterestedBuyersSchema.shape,
		handler: (api, args) => api.negotiation.sendOfferToInterestedBuyers(args),
	}),
	// Notification API
	defineTool({
		name: "ebay_get_notification_config",
		description: "Get notification configuration",
		inputSchema: getConfigSchema.shape,
		handler: (api, args) => api.notification.getConfig(args),
	}),
	defineTool({
		name: "ebay_update_notification_config",
		description: "Update notification configuration",
		inputSchema: updateConfigSchema.shape,
		handler: (api, args) => api.notification.updateConfig(args),
	}),
	defineTool({
		name: "ebay_get_notification_destinations",
		description: "Get all notification destinations (paginated)",
		inputSchema: getDestinationsSchema.shape,
		handler: (api, args) => api.notification.getDestinations(args),
	}),
	defineTool({
		name: "ebay_create_notification_destination",
		description: "Create a notification destination",
		inputSchema: createDestinationSchema.shape,
		handler: (api, args) => api.notification.createDestination(args),
	}),
	// Notification API - Destination CRUD
	defineTool({
		name: "ebay_get_notification_destination",
		description: "Get a specific notification destination by ID",
		inputSchema: getDestinationSchema.shape,
		handler: (api, args) => api.notification.getDestination(args),
	}),
	defineTool({
		name: "ebay_update_notification_destination",
		description: "Update a notification destination",
		inputSchema: updateDestinationSchema.shape,
		handler: (api, args) => api.notification.updateDestination(args),
	}),
	defineTool({
		name: "ebay_delete_notification_destination",
		description: "Delete a notification destination",
		inputSchema: deleteDestinationSchema.shape,
		handler: (api, args) => api.notification.deleteDestination(args),
	}),
	// Notification API - Subscription CRUD
	defineTool({
		name: "ebay_get_notification_subscriptions",
		description: "Get all notification subscriptions (paginated)",
		inputSchema: getSubscriptionsSchema.shape,
		handler: (api, args) => api.notification.getSubscriptions(args),
	}),
	defineTool({
		name: "ebay_create_notification_subscription",
		description: "Create a notification subscription",
		inputSchema: createSubscriptionSchema.shape,
		handler: (api, args) => api.notification.createSubscription(args),
	}),
	defineTool({
		name: "ebay_get_notification_subscription",
		description: "Get a specific notification subscription by ID",
		inputSchema: getSubscriptionSchema.shape,
		handler: (api, args) => api.notification.getSubscription(args),
	}),
	defineTool({
		name: "ebay_update_notification_subscription",
		description: "Update a notification subscription",
		inputSchema: updateSubscriptionSchema.shape,
		handler: (api, args) => api.notification.updateSubscription(args),
	}),
	defineTool({
		name: "ebay_delete_notification_subscription",
		description: "Delete a notification subscription",
		inputSchema: deleteSubscriptionSchema.shape,
		handler: (api, args) => api.notification.deleteSubscription(args),
	}),
	defineTool({
		name: "ebay_disable_notification_subscription",
		description: "Disable a notification subscription",
		inputSchema: disableSubscriptionSchema.shape,
		handler: (api, args) => api.notification.disableSubscription(args),
	}),
	defineTool({
		name: "ebay_enable_notification_subscription",
		description: "Enable a notification subscription",
		inputSchema: enableSubscriptionSchema.shape,
		handler: (api, args) => api.notification.enableSubscription(args),
	}),
	defineTool({
		name: "ebay_test_notification_subscription",
		description: "Test a notification subscription by sending a test message",
		inputSchema: testSubscriptionSchema.shape,
		handler: (api, args) => api.notification.testSubscription(args),
	}),
	// Notification API - Subscription Filters
	defineTool({
		name: "ebay_create_notification_subscription_filter",
		description: "Create a filter for a notification subscription",
		inputSchema: createSubscriptionFilterSchema.shape,
		handler: (api, args) => api.notification.createSubscriptionFilter(args),
	}),
	defineTool({
		name: "ebay_get_notification_subscription_filter",
		description: "Get a specific subscription filter",
		inputSchema: getSubscriptionFilterSchema.shape,
		handler: (api, args) => api.notification.getSubscriptionFilter(args),
	}),
	defineTool({
		name: "ebay_delete_notification_subscription_filter",
		description: "Delete a subscription filter",
		inputSchema: deleteSubscriptionFilterSchema.shape,
		handler: (api, args) => api.notification.deleteSubscriptionFilter(args),
	}),
	// Notification API - Topics
	defineTool({
		name: "ebay_get_notification_topic",
		description: "Get a specific notification topic by ID",
		inputSchema: getTopicSchema.shape,
		handler: (api, args) => api.notification.getTopic(args),
	}),
	defineTool({
		name: "ebay_get_notification_topics",
		description: "Get all available notification topics (paginated)",
		inputSchema: getTopicsSchema.shape,
		handler: (api, args) => api.notification.getTopics(args),
	}),
	// Notification API - Public Key
	defineTool({
		name: "ebay_get_notification_public_key",
		description: "Get a public key for verifying notification signatures",
		inputSchema: getPublicKeySchema.shape,
		handler: (api, args) => api.notification.getPublicKey(args),
	}),
	// Message API - Conversations
	defineTool({
		name: "ebay_get_conversations",
		description: "Get all buyer-seller conversations (paginated)",
		inputSchema: getConversationsSchema.shape,
		handler: (api, args) =>
			api.message.getConversations({
				conversationType: args.conversationType,
				...defined({
					conversationStatus: args.conversationStatus,
					endTime: args.endTime,
					limit: args.limit,
					offset: args.offset,
					otherPartyUsername: args.otherPartyUsername,
					referenceId: args.referenceId,
					referenceType: args.referenceType,
					startTime: args.startTime,
				}),
			}),
	}),
	defineTool({
		name: "ebay_get_conversation",
		description: "Get a specific conversation by ID",
		inputSchema: getConversationSchema.shape,
		handler: (api, args) =>
			api.message.getConversation({
				conversationId: args.conversationId,
				conversationType: args.conversationType,
				...defined({ limit: args.limit, offset: args.offset }),
			}),
	}),
	defineTool({
		name: "ebay_send_message",
		description:
			"Send a direct message to a buyer regarding a specific transaction or inquiry. Use this to communicate about orders, answer questions, resolve issues, or provide updates.",
		inputSchema: sendMessageSchema.shape,
		handler: (api, args) =>
			api.message.sendMessage(omitUndefinedSendMessage(args)),
	}),
	defineTool({
		name: "ebay_bulk_update_conversation",
		description:
			"Bulk update multiple conversations. Each entry sets conversationStatus (ACTIVE, ARCHIVE, DELETE, READ, UNREAD) for a conversationId.",
		inputSchema: bulkUpdateConversationSchema.shape,
		handler: (api, args) =>
			api.message.bulkUpdateConversation(omitUndefinedBulkUpdate(args)),
	}),
	defineTool({
		name: "ebay_update_conversation",
		description:
			"Update a single conversation (conversationStatus: ACTIVE, ARCHIVE, DELETE; or read flag).",
		inputSchema: updateConversationSchema.shape,
		handler: (api, args) =>
			api.message.updateConversation(
				defined({
					conversationId: args.conversationId,
					conversationStatus: args.conversationStatus,
					conversationType: args.conversationType,
					read: args.read,
				}),
			),
	}),
	// Feedback API
	defineTool({
		name: "ebay_get_feedback",
		description: "Get feedback for a user by type",
		inputSchema: getFeedbackSchema.shape,
		handler: (api, args) =>
			api.feedback.getFeedback({
				userId: args.userId,
				feedbackType: args.feedbackType,
				...defined({
					feedbackId: args.feedbackId,
					filter: args.filter,
					limit: args.limit,
					listingId: args.listingId,
					offset: args.offset,
					orderLineItemId: args.orderLineItemId,
					sort: args.sort,
					transactionId: args.transactionId,
				}),
			}),
	}),
	defineTool({
		name: "ebay_leave_feedback_for_buyer",
		description:
			"Leave feedback for a buyer. Provide orderLineItemId, commentType (POSITIVE/NEUTRAL/NEGATIVE), and commentText.",
		inputSchema: leaveFeedbackSchema.shape,
		handler: (api, args) =>
			api.feedback.leaveFeedback(omitUndefinedLeaveFeedback(args)),
	}),
	defineTool({
		name: "ebay_get_awaiting_feedback",
		description: "Get transactions awaiting feedback from the seller",
		inputSchema: getItemsAwaitingFeedbackSchema.shape,
		handler: (api, args) =>
			api.feedback.getItemsAwaitingFeedback(
				defined({
					filter: args.filter,
					limit: args.limit,
					offset: args.offset,
					sort: args.sort,
				}),
			),
	}),
	defineTool({
		name: "ebay_respond_to_feedback",
		description: "Respond to feedback received from a buyer",
		inputSchema: respondToFeedbackSchema.shape,
		handler: (api, args) =>
			api.feedback.respondToFeedback(
				defined({
					feedbackId: args.feedbackId,
					recipientUserId: args.recipientUserId,
					responseText: args.responseText,
					responseType: args.responseType,
				}),
			),
	}),
	defineTool({
		name: "ebay_get_feedback_rating_summary",
		description: "Get feedback rating summary for a user",
		inputSchema: getFeedbackRatingSummarySchema.shape,
		handler: (api, args) => api.feedback.getFeedbackRatingSummary(args),
	}),
];
