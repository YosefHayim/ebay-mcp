import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NegotiationApi } from '../../../src/api/communication/negotiation.js';
import { MessageApi } from '../../../src/api/communication/message.js';
import { FeedbackApi } from '../../../src/api/communication/feedback.js';
import { NotificationApi } from '../../../src/api/communication/notification.js';
import type { EbayApiClient } from '../../../src/api/client.js';

describe('Communication APIs', () => {
  let client: EbayApiClient;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    } as unknown as EbayApiClient;
  });

  describe('NegotiationApi', () => {
    let api: NegotiationApi;

    beforeEach(() => {
      api = new NegotiationApi(client);
    });

    describe('getOffersToBuyers', () => {
      it('should get offers to buyers with filter', async () => {
        const mockResponse = { offers: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getOffersToBuyers('filter:test', 10, 5);

        expect(client.get).toHaveBeenCalledWith('/sell/negotiation/v1/offer', {
          filter: 'filter:test',
          limit: 10,
          offset: 5
        });
      });

      it('should handle missing optional parameters', async () => {
        const mockResponse = { offers: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getOffersToBuyers();

        expect(client.get).toHaveBeenCalledWith('/sell/negotiation/v1/offer', {});
      });
    });

    describe('sendOfferToInterestedBuyers', () => {
      it('should send offer to interested buyers', async () => {
        const mockResponse = { offerId: '123' };
        const offerData = {
          offeredItems: [{ offerId: '123', price: { value: '10.00', currency: 'USD' } }]
        };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.sendOfferToInterestedBuyers(offerData);

        expect(client.post).toHaveBeenCalledWith(
          '/sell/negotiation/v1/send_offer_to_interested_buyers',
          offerData
        );
      });

      it('should throw error when offerData is missing', async () => {
        await expect(
          api.sendOfferToInterestedBuyers(undefined as any)
        ).rejects.toThrow('offerData is required');
      });
    });

    describe('findEligibleItems', () => {
      it('should find eligible items with parameters', async () => {
        const mockResponse = { items: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.findEligibleItems('filter:test', 10, 0);

        expect(client.get).toHaveBeenCalledWith('/sell/negotiation/v1/find_eligible_items', {
          filter: 'filter:test',
          limit: 10,
          offset: 0
        });
      });

      it('should handle missing optional parameters', async () => {
        const mockResponse = { items: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.findEligibleItems();

        expect(client.get).toHaveBeenCalledWith('/sell/negotiation/v1/find_eligible_items', {});
      });
    });
  });

  describe('MessageApi', () => {
    let api: MessageApi;

    beforeEach(() => {
      api = new MessageApi(client);
    });

    describe('getConversations', () => {
      it('should get conversations with parameters', async () => {
        const mockResponse = { conversations: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getConversations('filter:test', 10, 0);

        expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation', {
          filter: 'filter:test',
          limit: 10,
          offset: 0
        });
      });

      it('should handle missing optional parameters', async () => {
        const mockResponse = { conversations: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getConversations();

        expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation', {});
      });
    });

    describe('getConversation', () => {
      it('should get conversation by ID', async () => {
        const mockResponse = { conversationId: '123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getConversation('conv123');

        expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation/conv123');
      });

      it('should throw error when conversationId is missing', async () => {
        await expect(api.getConversation('')).rejects.toThrow('conversationId is required');
      });
    });

    describe('sendMessage', () => {
      it('should send message', async () => {
        const mockResponse = { messageId: '123' };
        const messageData = { messageText: 'Hello', otherPartyUsername: 'buyer123' };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.sendMessage(messageData);

        expect(client.post).toHaveBeenCalledWith('/commerce/message/v1/send_message', messageData);
      });

      it('should throw error when messageData is missing', async () => {
        await expect(api.sendMessage(undefined as any)).rejects.toThrow(
          'messageData is required'
        );
      });
    });

    describe('updateConversation', () => {
      it('should update conversation', async () => {
        const mockResponse = { success: true };
        const updateData = { read: true };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.updateConversation(updateData);

        expect(client.post).toHaveBeenCalledWith('/commerce/message/v1/update_conversation', updateData);
      });

      it('should throw error when updateData is missing', async () => {
        await expect(api.updateConversation(undefined as any)).rejects.toThrow(
          'updateData is required'
        );
      });
    });

    describe('bulkUpdateConversation', () => {
      it('should bulk update conversations', async () => {
        const mockResponse = { success: true };
        const updateData = { conversationIds: ['123', '456'], read: true };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.bulkUpdateConversation(updateData);

        expect(client.post).toHaveBeenCalledWith('/commerce/message/v1/bulk_update_conversation', updateData);
      });

      it('should throw error when updateData is missing', async () => {
        await expect(api.bulkUpdateConversation(undefined as any)).rejects.toThrow(
          'updateData is required'
        );
      });
    });

    describe('deprecated methods', () => {
      it('should call getConversations via searchMessages', async () => {
        const mockResponse = { conversations: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.searchMessages('filter:test', 10, 0);

        expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation', {
          filter: 'filter:test',
          limit: 10,
          offset: 0
        });
      });

      it('should call getConversation via getMessage', async () => {
        const mockResponse = { conversationId: '123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getMessage('msg123');

        expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation/msg123');
      });

      it('should call sendMessage via replyToMessage', async () => {
        const mockResponse = { messageId: '123' };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.replyToMessage('conv123', 'Hello');

        expect(client.post).toHaveBeenCalledWith('/commerce/message/v1/send_message', {
          conversation_id: 'conv123',
          message_content: 'Hello'
        });
      });
    });

    describe('error handling', () => {
      it('should handle API errors in getConversations', async () => {
        vi.mocked(client.get).mockRejectedValue(new Error('API Error'));

        await expect(api.getConversations()).rejects.toThrow('Failed to get conversations');
      });

      it('should handle API errors in getConversation', async () => {
        vi.mocked(client.get).mockRejectedValue(new Error('API Error'));

        await expect(api.getConversation('123')).rejects.toThrow('Failed to get conversation');
      });

      it('should handle API errors in sendMessage', async () => {
        vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

        await expect(api.sendMessage({ text: 'test' })).rejects.toThrow('Failed to send message');
      });

      it('should handle API errors in updateConversation', async () => {
        vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

        await expect(api.updateConversation({ read: true })).rejects.toThrow('Failed to update conversation');
      });

      it('should handle API errors in bulkUpdateConversation', async () => {
        vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

        await expect(api.bulkUpdateConversation({ ids: ['123'] })).rejects.toThrow('Failed to bulk update conversation');
      });

      it('should validate filter parameter type', async () => {
        await expect(api.getConversations(123 as any)).rejects.toThrow('filter must be a string');
      });

      it('should validate limit parameter type', async () => {
        await expect(api.getConversations(undefined, 0)).rejects.toThrow('limit must be a positive number');
      });

      it('should validate offset parameter type', async () => {
        await expect(api.getConversations(undefined, undefined, -1)).rejects.toThrow('offset must be a non-negative number');
      });
    });
  });

  describe('FeedbackApi', () => {
    let api: FeedbackApi;

    beforeEach(() => {
      api = new FeedbackApi(client);
    });

    describe('getAwaitingFeedback', () => {
      it('should get awaiting feedback with parameters', async () => {
        const mockResponse = { feedback: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getAwaitingFeedback('filter:test', 10, 0);

        expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/awaiting_feedback', {
          filter: 'filter:test',
          limit: 10,
          offset: 0
        });
      });

      it('should handle missing optional parameters', async () => {
        const mockResponse = { feedback: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getAwaitingFeedback();

        expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/awaiting_feedback', {});
      });
    });

    describe('getFeedback', () => {
      it('should get feedback for transaction', async () => {
        const mockResponse = { feedback: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getFeedback('txn123');

        expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/feedback', {
          transaction_id: 'txn123'
        });
      });

      it('should throw error when transactionId is missing', async () => {
        await expect(api.getFeedback('')).rejects.toThrow('transactionId is required');
      });
    });

    describe('getFeedbackRatingSummary', () => {
      it('should get feedback rating summary', async () => {
        const mockResponse = { positive: 100, negative: 0, neutral: 5 };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getFeedbackRatingSummary();

        expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/feedback_rating_summary');
      });
    });

    describe('leaveFeedbackForBuyer', () => {
      it('should leave feedback for buyer', async () => {
        const mockResponse = { feedbackId: '123' };
        const feedbackData = {
          orderLineItemId: 'order123',
          rating: 'POSITIVE' as const,
          feedbackText: 'Great buyer!'
        };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.leaveFeedbackForBuyer(feedbackData);

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/feedback/v1/feedback',
          feedbackData
        );
      });

      it('should throw error when feedbackData is missing', async () => {
        await expect(api.leaveFeedbackForBuyer(undefined as any)).rejects.toThrow(
          'feedbackData is required'
        );
      });
    });

    describe('respondToFeedback', () => {
      it('should respond to feedback', async () => {
        const mockResponse = { success: true };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.respondToFeedback('feedback123', 'Thank you for the feedback!');

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/feedback/v1/respond_to_feedback',
          { feedback_id: 'feedback123', response_text: 'Thank you for the feedback!' }
        );
      });

      it('should throw error when feedbackId is missing', async () => {
        await expect(api.respondToFeedback('', 'response')).rejects.toThrow(
          'feedbackId is required'
        );
      });

      it('should throw error when responseText is missing', async () => {
        await expect(api.respondToFeedback('feedback123', '')).rejects.toThrow(
          'responseText is required'
        );
      });
    });

    describe('getFeedbackSummary', () => {
      it('should get feedback summary (deprecated alias)', async () => {
        const mockResponse = { positive: 100, negative: 0, neutral: 5 };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getFeedbackSummary();

        expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/feedback_rating_summary');
      });
    });
  });

  describe('NotificationApi', () => {
    let api: NotificationApi;

    beforeEach(() => {
      api = new NotificationApi(client);
    });

    describe('getPublicKey', () => {
      it('should get public key by ID', async () => {
        const mockResponse = { publicKey: 'key123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getPublicKey('key123');

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/public_key/key123');
      });

      it('should throw error when publicKeyId is missing', async () => {
        await expect(api.getPublicKey('')).rejects.toThrow('publicKeyId is required');
      });
    });

    describe('getConfig', () => {
      it('should get notification configuration', async () => {
        const mockResponse = { config: {} };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getConfig();

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/config');
      });
    });

    describe('updateConfig', () => {
      it('should update notification configuration', async () => {
        const mockResponse = { success: true };
        const config = { deliveryConfigs: [] };
        vi.mocked(client.put).mockResolvedValue(mockResponse);

        await api.updateConfig(config);

        expect(client.put).toHaveBeenCalledWith('/commerce/notification/v1/config', config);
      });

      it('should throw error when config is missing', async () => {
        await expect(api.updateConfig(undefined as any)).rejects.toThrow('config is required');
      });
    });

    describe('getDestination', () => {
      it('should get destination by ID', async () => {
        const mockResponse = { destinationId: 'dest123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getDestination('dest123');

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/destination/dest123');
      });

      it('should throw error when destinationId is missing', async () => {
        await expect(api.getDestination('')).rejects.toThrow('destinationId is required');
      });
    });

    describe('createDestination', () => {
      it('should create notification destination', async () => {
        const mockResponse = { destinationId: '123' };
        const destination = {
          name: 'webhook',
          endpoint: 'https://example.com/webhook',
          verificationToken: 'token123'
        };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.createDestination(destination);

        expect(client.post).toHaveBeenCalledWith('/commerce/notification/v1/destination', destination);
      });

      it('should throw error when destination is missing', async () => {
        await expect(api.createDestination(undefined as any)).rejects.toThrow(
          'destination is required'
        );
      });
    });

    describe('updateDestination', () => {
      it('should update notification destination', async () => {
        const mockResponse = { success: true };
        const destination = { endpoint: 'https://new-endpoint.com/webhook' };
        vi.mocked(client.put).mockResolvedValue(mockResponse);

        await api.updateDestination('dest123', destination);

        expect(client.put).toHaveBeenCalledWith(
          '/commerce/notification/v1/destination/dest123',
          destination
        );
      });

      it('should throw error when destinationId is missing', async () => {
        await expect(api.updateDestination('', {} as any)).rejects.toThrow(
          'destinationId is required'
        );
      });

      it('should throw error when destination data is missing', async () => {
        await expect(api.updateDestination('dest123', undefined as any)).rejects.toThrow(
          'destination is required'
        );
      });
    });

    describe('deleteDestination', () => {
      it('should delete notification destination', async () => {
        vi.mocked(client.delete).mockResolvedValue(undefined);

        await api.deleteDestination('dest123');

        expect(client.delete).toHaveBeenCalledWith('/commerce/notification/v1/destination/dest123');
      });

      it('should throw error when destinationId is missing', async () => {
        await expect(api.deleteDestination('')).rejects.toThrow('destinationId is required');
      });
    });

    describe('getSubscriptions', () => {
      it('should get subscriptions with parameters', async () => {
        const mockResponse = { subscriptions: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getSubscriptions(10, 'cursor123');

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/subscription', {
          limit: 10,
          continuation_token: 'cursor123'
        });
      });

      it('should handle missing optional parameters', async () => {
        const mockResponse = { subscriptions: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getSubscriptions();

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/subscription', {});
      });
    });

    describe('createSubscription', () => {
      it('should create subscription', async () => {
        const mockResponse = { subscriptionId: 'sub123' };
        const subscription = { topicId: 'topic123', destinationId: 'dest123' };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.createSubscription(subscription);

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription',
          subscription
        );
      });

      it('should throw error when subscription is missing', async () => {
        await expect(api.createSubscription(undefined as any)).rejects.toThrow(
          'subscription is required'
        );
      });
    });

    describe('getSubscription', () => {
      it('should get subscription by ID', async () => {
        const mockResponse = { subscriptionId: 'sub123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getSubscription('sub123');

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/subscription/sub123');
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.getSubscription('')).rejects.toThrow('subscriptionId is required');
      });
    });

    describe('updateSubscription', () => {
      it('should update subscription', async () => {
        const mockResponse = { success: true };
        const subscription = { enabled: false };
        vi.mocked(client.put).mockResolvedValue(mockResponse);

        await api.updateSubscription('sub123', subscription);

        expect(client.put).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123',
          subscription
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.updateSubscription('', {} as any)).rejects.toThrow(
          'subscriptionId is required'
        );
      });

      it('should throw error when subscription data is missing', async () => {
        await expect(api.updateSubscription('sub123', undefined as any)).rejects.toThrow(
          'subscription is required'
        );
      });
    });

    describe('deleteSubscription', () => {
      it('should delete subscription', async () => {
        vi.mocked(client.delete).mockResolvedValue(undefined);

        await api.deleteSubscription('sub123');

        expect(client.delete).toHaveBeenCalledWith('/commerce/notification/v1/subscription/sub123');
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.deleteSubscription('')).rejects.toThrow('subscriptionId is required');
      });
    });

    describe('disableSubscription', () => {
      it('should disable subscription', async () => {
        const mockResponse = { success: true };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.disableSubscription('sub123');

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123/disable',
          {}
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.disableSubscription('')).rejects.toThrow('subscriptionId is required');
      });
    });

    describe('enableSubscription', () => {
      it('should enable subscription', async () => {
        const mockResponse = { success: true };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.enableSubscription('sub123');

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123/enable',
          {}
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.enableSubscription('')).rejects.toThrow('subscriptionId is required');
      });
    });

    describe('testSubscription', () => {
      it('should test subscription', async () => {
        const mockResponse = { success: true };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.testSubscription('sub123');

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123/test',
          {}
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.testSubscription('')).rejects.toThrow('subscriptionId is required');
      });
    });

    describe('getTopic', () => {
      it('should get topic by ID', async () => {
        const mockResponse = { topicId: 'topic123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getTopic('topic123');

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/topic/topic123');
      });

      it('should throw error when topicId is missing', async () => {
        await expect(api.getTopic('')).rejects.toThrow('topicId is required');
      });
    });

    describe('getTopics', () => {
      it('should get topics with parameters', async () => {
        const mockResponse = { topics: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getTopics(10, 'cursor123');

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/topic', {
          limit: 10,
          continuation_token: 'cursor123'
        });
      });

      it('should handle missing optional parameters', async () => {
        const mockResponse = { topics: [] };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getTopics();

        expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/topic', {});
      });
    });

    describe('createSubscriptionFilter', () => {
      it('should create subscription filter', async () => {
        const mockResponse = { filterId: 'filter123' };
        const filter = { field: 'status', operator: 'EQUALS', value: 'ACTIVE' };
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        await api.createSubscriptionFilter('sub123', filter);

        expect(client.post).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123/filter',
          filter
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.createSubscriptionFilter('', {} as any)).rejects.toThrow(
          'subscriptionId is required'
        );
      });

      it('should throw error when filter is missing', async () => {
        await expect(api.createSubscriptionFilter('sub123', undefined as any)).rejects.toThrow(
          'filter is required'
        );
      });
    });

    describe('getSubscriptionFilter', () => {
      it('should get subscription filter', async () => {
        const mockResponse = { filterId: 'filter123' };
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        await api.getSubscriptionFilter('sub123', 'filter123');

        expect(client.get).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123/filter/filter123'
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.getSubscriptionFilter('', 'filter123')).rejects.toThrow(
          'subscriptionId is required'
        );
      });

      it('should throw error when filterId is missing', async () => {
        await expect(api.getSubscriptionFilter('sub123', '')).rejects.toThrow(
          'filterId is required'
        );
      });
    });

    describe('deleteSubscriptionFilter', () => {
      it('should delete subscription filter', async () => {
        vi.mocked(client.delete).mockResolvedValue(undefined);

        await api.deleteSubscriptionFilter('sub123', 'filter123');

        expect(client.delete).toHaveBeenCalledWith(
          '/commerce/notification/v1/subscription/sub123/filter/filter123'
        );
      });

      it('should throw error when subscriptionId is missing', async () => {
        await expect(api.deleteSubscriptionFilter('', 'filter123')).rejects.toThrow(
          'subscriptionId is required'
        );
      });

      it('should throw error when filterId is missing', async () => {
        await expect(api.deleteSubscriptionFilter('sub123', '')).rejects.toThrow(
          'filterId is required'
        );
      });
    });
  });
});
