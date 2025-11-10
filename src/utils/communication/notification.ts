import { z } from "zod";

/**
 * Zod schemas for Notification API input validation
 * Based on: src/api/communication/notification.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_notification_v1_oas3.json
 */

// Reusable schema for limit parameter
const limitSchema = z.coerce.number({
  message: "Limit must be a positive number",
  invalid_type_error: "limit must be a number",
  description: "Maximum number of items to return"
}).positive({
  message: "limit must be a positive number"
}).int({
  message: "limit must be an integer"
}).optional();

// Reusable schema for continuation token parameter
const continuationTokenSchema = z.string({
  message: "Continuation token must be a string",
  invalid_type_error: "continuation_token must be a string",
  description: "Token for pagination"
}).optional();

// Reusable schema for ID parameters (required)
const idSchema = (name: string, description: string) =>
  z.string({
    message: `${name} is required`,
    required_error: `${name.toLowerCase().replace(/\s+/g, '_')} is required`,
    invalid_type_error: `${name.toLowerCase().replace(/\s+/g, '_')} must be a string`,
    description
  });

// Reusable schema for object data parameters
const objectDataSchema = (name: string, description: string) =>
  z.record(z.unknown(), {
    message: `${name} is required`,
    required_error: `${name.toLowerCase().replace(/\s+/g, '_')} is required`,
    invalid_type_error: `${name.toLowerCase().replace(/\s+/g, '_')} must be an object`,
    description
  });

/**
 * Schema for getPublicKey method
 * Endpoint: GET /public_key/{public_key_id}
 */
export const getPublicKeySchema = z.object({
  public_key_id: idSchema("Public key ID", "The unique identifier for the public key")
});

/**
 * Schema for getConfig method
 * Endpoint: GET /config
 */
export const getConfigSchema = z.object({});

/**
 * Schema for updateConfig method
 * Endpoint: PUT /config
 */
export const updateConfigSchema = z.object({
  config: objectDataSchema("Config", "The notification configuration data")
});

/**
 * Schema for getDestination method
 * Endpoint: GET /destination/{destination_id}
 */
export const getDestinationSchema = z.object({
  destination_id: idSchema("Destination ID", "The unique identifier for the destination")
});

/**
 * Schema for createDestination method
 * Endpoint: POST /destination
 */
export const createDestinationSchema = z.object({
  destination: objectDataSchema("Destination", "The destination data to create")
});

/**
 * Schema for updateDestination method
 * Endpoint: PUT /destination/{destination_id}
 */
export const updateDestinationSchema = z.object({
  destination_id: idSchema("Destination ID", "The unique identifier for the destination"),
  destination: objectDataSchema("Destination", "The destination data to update")
});

/**
 * Schema for deleteDestination method
 * Endpoint: DELETE /destination/{destination_id}
 */
export const deleteDestinationSchema = z.object({
  destination_id: idSchema("Destination ID", "The unique identifier for the destination")
});

/**
 * Schema for getSubscriptions method
 * Endpoint: GET /subscription
 */
export const getSubscriptionsSchema = z.object({
  limit: limitSchema,
  continuation_token: continuationTokenSchema
});

/**
 * Schema for createSubscription method
 * Endpoint: POST /subscription
 */
export const createSubscriptionSchema = z.object({
  subscription: objectDataSchema("Subscription", "The subscription data to create")
});

/**
 * Schema for getSubscription method
 * Endpoint: GET /subscription/{subscription_id}
 */
export const getSubscriptionSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription")
});

/**
 * Schema for updateSubscription method
 * Endpoint: PUT /subscription/{subscription_id}
 */
export const updateSubscriptionSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription"),
  subscription: objectDataSchema("Subscription", "The subscription data to update")
});

/**
 * Schema for deleteSubscription method
 * Endpoint: DELETE /subscription/{subscription_id}
 */
export const deleteSubscriptionSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription")
});

/**
 * Schema for disableSubscription method
 * Endpoint: POST /subscription/{subscription_id}/disable
 */
export const disableSubscriptionSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription")
});

/**
 * Schema for enableSubscription method
 * Endpoint: POST /subscription/{subscription_id}/enable
 */
export const enableSubscriptionSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription")
});

/**
 * Schema for testSubscription method
 * Endpoint: POST /subscription/{subscription_id}/test
 */
export const testSubscriptionSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription")
});

/**
 * Schema for getTopic method
 * Endpoint: GET /topic/{topic_id}
 */
export const getTopicSchema = z.object({
  topic_id: idSchema("Topic ID", "The unique identifier for the topic")
});

/**
 * Schema for getTopics method
 * Endpoint: GET /topic
 */
export const getTopicsSchema = z.object({
  limit: limitSchema,
  continuation_token: continuationTokenSchema
});

/**
 * Schema for createSubscriptionFilter method
 * Endpoint: POST /subscription/{subscription_id}/filter
 */
export const createSubscriptionFilterSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription"),
  filter: objectDataSchema("Filter", "The filter data to create")
});

/**
 * Schema for getSubscriptionFilter method
 * Endpoint: GET /subscription/{subscription_id}/filter/{filter_id}
 */
export const getSubscriptionFilterSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription"),
  filter_id: idSchema("Filter ID", "The unique identifier for the filter")
});

/**
 * Schema for deleteSubscriptionFilter method
 * Endpoint: DELETE /subscription/{subscription_id}/filter/{filter_id}
 */
export const deleteSubscriptionFilterSchema = z.object({
  subscription_id: idSchema("Subscription ID", "The unique identifier for the subscription"),
  filter_id: idSchema("Filter ID", "The unique identifier for the filter")
});
