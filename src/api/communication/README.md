# Communication API

This directory contains the implementation of eBay's Communication APIs, which manage buyer-seller messaging, feedback, offer negotiations, and webhook notifications.

## Implementation Status

✅ **COMPLETE** - All Communication API endpoints implemented across 4 API classes with 38 total methods

## Files

- **`feedback.ts`** - FeedbackApi class for feedback management (6 methods)
- **`message.ts`** - MessageApi class for buyer-seller messaging (8 methods)
- **`negotiation.ts`** - NegotiationApi class for offer negotiations (3 methods)
- **`notification.ts`** - NotificationApi class for webhook notifications (21 methods)

## API Coverage

### Feedback API (6 methods)
- ✅ `createFeedback(feedback)` - Create feedback for a buyer
- ✅ `getFeedback(feedbackId)` - Get specific feedback record
- ✅ `getFeedbacks(filters)` - Get all feedback with filters
- ✅ `replyToFeedback(feedbackId, reply)` - Reply to feedback received
- ✅ `updateFeedback(feedbackId, update)` - Update feedback record
- ✅ `deleteFeedback(feedbackId)` - Delete feedback (within timeframe)

### Message API (8 methods)
- ✅ `createMessage(message)` - Send message to buyer
- ✅ `getMessage(messageId)` - Get specific message
- ✅ `getMessages(filters)` - Get all messages with filters
- ✅ `replyToMessage(messageId, reply)` - Reply to buyer message
- ✅ `markMessageRead(messageId)` - Mark message as read
- ✅ `markMessageUnread(messageId)` - Mark message as unread
- ✅ `archiveMessage(messageId)` - Archive message
- ✅ `unarchiveMessage(messageId)` - Unarchive message

### Negotiation API (3 methods)
- ✅ `sendOfferToBuyer(offer)` - Send price offer to buyer (Make Offer to Buyer)
- ✅ `getOffer(offerId)` - Get specific offer details
- ✅ `getOffers(filters)` - Get all offers with filters

### Notification API (21 methods)

#### Destination Management (5 methods)
- ✅ `createDestination(destination)` - Create webhook destination
- ✅ `getDestination(destinationId)` - Get specific destination
- ✅ `getDestinations()` - Get all destinations
- ✅ `updateDestination(destinationId, destination)` - Update destination
- ✅ `deleteDestination(destinationId)` - Delete destination

#### Subscription Management (8 methods)
- ✅ `createSubscription(subscription)` - Subscribe to event notifications
- ✅ `getSubscription(subscriptionId)` - Get specific subscription
- ✅ `getSubscriptions(filters)` - Get all subscriptions
- ✅ `updateSubscription(subscriptionId, subscription)` - Update subscription
- ✅ `deleteSubscription(subscriptionId)` - Delete subscription
- ✅ `enableSubscription(subscriptionId)` - Enable subscription
- ✅ `disableSubscription(subscriptionId)` - Disable subscription
- ✅ `testSubscription(subscriptionId)` - Send test notification

#### Topic Management (4 methods)
- ✅ `getTopic(topicId)` - Get specific topic details
- ✅ `getTopics(filters)` - Get all available topics
- ✅ `getTopicByName(topicName)` - Get topic by name
- ✅ `getTopicsByEventType(eventType)` - Get topics by event type

#### Public Key Management (4 methods)
- ✅ `getPublicKey(publicKeyId)` - Get specific public key
- ✅ `getPublicKeys()` - Get all public keys
- ✅ `createPublicKey(publicKey)` - Create public key
- ✅ `rotatePublicKey(publicKeyId)` - Rotate public key

## OpenAPI Specifications

- Feedback: `docs/sell-apps/communication/commerce_feedback_v1_beta_oas3.json`
- Message: `docs/sell-apps/communication/commerce_message_v1_oas3.json`
- Negotiation: `docs/sell-apps/communication/sell_negotiation_v1_oas3.json`
- Notification: `docs/sell-apps/communication/commerce_notification_v1_oas3.json`

## OAuth Scopes Required

### Feedback
- `https://api.ebay.com/oauth/api_scope/commerce.feedback` - Manage feedback

### Message
- `https://api.ebay.com/oauth/api_scope/commerce.message` - Manage messages

### Negotiation
- `https://api.ebay.com/oauth/api_scope/sell.negotiation` - Send offers to buyers

### Notification
- `https://api.ebay.com/oauth/api_scope/commerce.notification` - Manage webhooks

## Key Concepts

### Feedback System
eBay's feedback system where buyers and sellers rate transactions:
- **Positive, Neutral, Negative**: Rating types
- **Reply Period**: Limited time to reply to feedback
- **Removal**: Can request removal of defamatory feedback
- **Score Impact**: Affects seller reputation and search ranking

### Messaging
Secure buyer-seller communication through eBay platform:
- **Pre-Purchase Questions**: Buyers ask about items
- **Post-Purchase Messages**: Order updates, shipping info
- **Message Threading**: Organized by order or listing
- **Response Time**: Tracked in seller metrics

### Offer Negotiations
Make Offer to Buyer feature:
- **Price Offers**: Send discounted price to specific buyer
- **Quantity Discounts**: Offer bulk pricing
- **Expiration**: Offers expire after set time
- **Acceptance**: Buyer can accept, decline, or counter

### Webhook Notifications
Real-time event notifications via webhooks:
- **Destinations**: HTTPS endpoints to receive notifications
- **Subscriptions**: Event types you want to receive
- **Topics**: Available event categories
- **Security**: Signature verification with public keys

## Usage Examples

### Feedback Management

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Get all feedback received
const feedback = await api.feedback.getFeedbacks({
  feedbackType: 'RECEIVED',
  limit: 10
});

// Reply to negative feedback
await api.feedback.replyToFeedback('feedback-id', {
  reply: 'We apologize for the issue. We have shipped a replacement.'
});

// Leave feedback for buyer
await api.feedback.createFeedback({
  orderId: 'order-id',
  rating: 'POSITIVE',
  comment: 'Great buyer, quick payment!'
});
```

### Buyer-Seller Messaging

```typescript
// Get unread messages
const messages = await api.message.getMessages({
  messageStatus: 'UNREAD',
  limit: 20
});

// Reply to buyer question
await api.message.replyToMessage('message-id', {
  body: 'Yes, this item ships internationally to Canada.',
  attachments: []
});

// Mark message as read
await api.message.markMessageRead('message-id');

// Send proactive message (order update)
await api.message.createMessage({
  orderId: 'order-id',
  subject: 'Your order has shipped',
  body: 'Tracking number: 1Z999AA10123456784',
  messageType: 'ORDER_UPDATE'
});
```

### Offer Negotiations

```typescript
// Send offer to buyer who added item to watchlist
await api.negotiation.sendOfferToBuyer({
  itemId: '123456789',
  recipientId: 'buyer-username',
  price: {
    value: '79.99',
    currency: 'USD'
  },
  quantity: 1,
  message: 'Special 20% discount just for you!',
  expirationDate: '2024-12-31T23:59:59.999Z'
});

// Get all sent offers
const offers = await api.negotiation.getOffers({
  status: 'PENDING',
  limit: 10
});

// Check offer status
const offer = await api.negotiation.getOffer('offer-id');
console.log(offer.offerStatus);  // PENDING, ACCEPTED, DECLINED, EXPIRED
```

### Webhook Notifications

```typescript
// Create webhook destination
const destination = await api.notification.createDestination({
  name: 'Production Webhook',
  deliveryConfig: {
    endpoint: 'https://myapp.com/webhooks/ebay',
    verificationToken: 'my-secret-token'
  }
});

// Subscribe to order events
await api.notification.createSubscription({
  destinationId: destination.destinationId,
  topicId: 'MARKETPLACE_ORDER.CREATED',
  enabled: true
});

// Subscribe to multiple events
await api.notification.createSubscription({
  destinationId: destination.destinationId,
  topicId: 'MARKETPLACE_ORDER.SHIPPED',
  enabled: true
});

// Test webhook
await api.notification.testSubscription('subscription-id');

// Get all active subscriptions
const subscriptions = await api.notification.getSubscriptions({
  enabled: true
});
```

### Webhook Security

```typescript
// Get public keys for signature verification
const keys = await api.notification.getPublicKeys();

// Use public key to verify webhook signatures
// (Implement in your webhook handler)
function verifyWebhookSignature(payload, signature, publicKey) {
  // Verify signature using public key
  // Implementation depends on your crypto library
}

// Rotate public key periodically
await api.notification.rotatePublicKey('public-key-id');
```

## Webhook Event Topics

### Order Events
- `MARKETPLACE_ORDER.CREATED` - New order placed
- `MARKETPLACE_ORDER.SHIPPED` - Order shipped
- `MARKETPLACE_ORDER.DELIVERED` - Order delivered
- `MARKETPLACE_ORDER.CANCELLED` - Order cancelled

### Payment Events
- `MARKETPLACE_PAYMENT.RECEIVED` - Payment received
- `MARKETPLACE_PAYMENT.REFUNDED` - Refund issued

### Listing Events
- `MARKETPLACE_LISTING.ENDED` - Listing ended
- `MARKETPLACE_LISTING.OUT_OF_STOCK` - Item out of stock

### Dispute Events
- `MARKETPLACE_DISPUTE.OPENED` - Dispute opened
- `MARKETPLACE_DISPUTE.CLOSED` - Dispute closed

### Feedback Events
- `MARKETPLACE_FEEDBACK.RECEIVED` - Feedback received

## Feedback Rating Types

- `POSITIVE` - Positive feedback (+1 to feedback score)
- `NEUTRAL` - Neutral feedback (no score change)
- `NEGATIVE` - Negative feedback (-1 to feedback score)

## Message Types

- `PRE_PURCHASE` - Buyer question before purchase
- `POST_PURCHASE` - Message about completed order
- `ORDER_UPDATE` - Shipping/tracking updates
- `RETURN_REQUEST` - Return initiated
- `GENERAL` - General inquiry

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:

### Feedback Tools
- `ebay_create_feedback`
- `ebay_get_feedback`
- `ebay_get_feedbacks`
- `ebay_reply_to_feedback`
- `ebay_update_feedback`
- `ebay_delete_feedback`

### Message Tools
- `ebay_create_message`
- `ebay_get_message`
- `ebay_get_messages`
- `ebay_reply_to_message`
- `ebay_mark_message_read`
- `ebay_mark_message_unread`
- `ebay_archive_message`
- `ebay_unarchive_message`

### Negotiation Tools
- `ebay_send_offer_to_buyer`
- `ebay_get_negotiation_offer`
- `ebay_get_negotiation_offers`

### Notification Tools
- `ebay_create_notification_destination`
- `ebay_get_notification_destination`
- `ebay_get_notification_destinations`
- `ebay_update_notification_destination`
- `ebay_delete_notification_destination`
- `ebay_create_notification_subscription`
- `ebay_get_notification_subscription`
- `ebay_get_notification_subscriptions`
- `ebay_update_notification_subscription`
- `ebay_delete_notification_subscription`
- `ebay_enable_notification_subscription`
- `ebay_disable_notification_subscription`
- `ebay_test_notification_subscription`
- And 8+ more notification tools...

See `src/tools/definitions/` for complete tool definitions.

## Best Practices

### Feedback Management
- Respond to negative feedback within 24 hours
- Never leave retaliatory feedback
- Focus on resolving issues, not arguing
- Request feedback removal only for policy violations

### Messaging
- Respond to buyer messages within 24 hours (tracked metric)
- Keep communication professional and courteous
- Use templates for common questions
- Never share contact info or payment links (policy violation)
- Archive resolved conversations to stay organized

### Offer Negotiations
- Set realistic expiration times (24-48 hours)
- Target buyers who added items to watchlist
- Offer meaningful discounts (10%+ typically)
- Track offer acceptance rates to optimize pricing

### Webhook Implementation
- Use HTTPS endpoints only
- Verify webhook signatures (security)
- Implement idempotency (deduplicate events)
- Handle retries gracefully (exponential backoff)
- Test subscriptions before production deployment
- Rotate public keys every 6-12 months
- Monitor webhook delivery success rates
