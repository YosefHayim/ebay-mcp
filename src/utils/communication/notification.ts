import { z } from 'zod';

/**
 * Zod schemas for Notification API input validation
 * Based on: src/api/communication/notification.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_notification_v1_oas3.json
 * Types from: src/types/commerce_notification_v1_oas3.ts
 */

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    error: 'limit must be a string',
  })
  .optional();

// Reusable schema for continuation token parameter
const continuationTokenSchema = z
  .string({
    error: 'continuation_token must be a string',
  })
  .optional();

// Reusable schema for ID parameters (required)
const idSchema = (name: string, _description?: string) =>
  z.string({
    error: `${name.toLowerCase().replace(/\s+/g, '_')} is required and must be a string`,
  });

// Reusable schema for object data parameters
const _objectDataSchema = (_name: string, _description?: string) =>
  z.record(z.string(), z.unknown());

/**
 * Schema for getPublicKey method
 * Endpoint: GET /public_key/{public_key_id}
 * Path: GetPublicKeyParams - public_key_id (required)
 */
export const getPublicKeySchema = z.object({
  public_key_id: idSchema('Public key ID', 'The unique identifier for the public key'),
});

/**
 * Schema for getConfig method
 * Endpoint: GET /config
 */
export const getConfigSchema = z.object({});

/**
 * Schema for updateConfig method
 * Endpoint: PUT /config
 * Body: ConfigType - alertEmail
 */
export const updateConfigSchema = z.object({
  alert_email: z
    .string({
      error: 'alert_email must be a string',
    })
    .email({
      message: 'alert_email must be a valid email address',
    })
    .optional(),
});

/**
 * Schema for getDestinations method
 * Endpoint: GET /destination
 * Query: DestinationParams - continuation_token, limit
 */
export const getDestinationsSchema = z.object({
  continuation_token: continuationTokenSchema,
  limit: limitSchema,
});

/**
 * Schema for getDestination method
 * Endpoint: GET /destination/{destination_id}
 * Path: destination_id (required)
 */
export const getDestinationSchema = z.object({
  destination_id: idSchema('Destination ID', 'The unique identifier for the destination'),
});

/**
 * Schema for createDestination method
 * Endpoint: POST /destination
 * Body: DestinationRequest - deliveryConfig, name, status
 */
export const createDestinationSchema = z.object({
  delivery_config: z
    .object(
      {
        endpoint: z
          .string({
            error: 'endpoint must be a string',
          })
          .url({
            message: 'endpoint must be a valid URL',
          })
          .optional(),
        verification_token: z
          .string({
            error: 'verification_token must be a string',
          })
          .min(32, 'verification_token must be at least 32 characters')
          .max(80, 'verification_token must be at most 80 characters')
          .regex(
            /^[a-zA-Z0-9_-]+$/,
            'verification_token can only contain alphanumeric, underscore, and hyphen characters'
          )
          .optional(),
      },
      {
        error: 'delivery_config must be an object',
      }
    )
    .optional(),
  name: z
    .string({
      error: 'name must be a string',
    })
    .optional(),
  status: z
    .string({
      error: 'status must be a string',
    })
    .optional(),
});

/**
 * Schema for updateDestination method
 * Endpoint: PUT /destination/{destination_id}
 * Path: destination_id (required)
 * Body: DestinationRequest
 */
export const updateDestinationSchema = z.object({
  destination_id: idSchema('Destination ID', 'The unique identifier for the destination'),
  delivery_config: z
    .object({
      endpoint: z
        .string({
          error: 'endpoint must be a string',
        })
        .url({
          message: 'endpoint must be a valid URL',
        })
        .optional(),
      verification_token: z
        .string({
          error: 'verification_token must be a string',
        })
        .min(32)
        .max(80)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .optional(),
    })
    .optional(),
  name: z
    .string({
      error: 'name must be a string',
    })
    .optional(),
  status: z
    .string({
      error: 'status must be a string',
    })
    .optional(),
});

/**
 * Schema for deleteDestination method
 * Endpoint: DELETE /destination/{destination_id}
 * Path: destination_id (required)
 */
export const deleteDestinationSchema = z.object({
  destination_id: idSchema('Destination ID', 'The unique identifier for the destination'),
});

/**
 * Schema for getSubscriptions method
 * Endpoint: GET /subscription
 * Query: SubscriptionParams - continuation_token, limit
 */
export const getSubscriptionsSchema = z.object({
  limit: limitSchema,
  continuation_token: continuationTokenSchema,
});

/**
 * Schema for createSubscription method
 * Endpoint: POST /subscription
 * Body: CreateSubscriptionRequest - destinationId, payload, status, topicId
 */
export const createSubscriptionSchema = z.object({
  destination_id: z
    .string({
      error: 'destination_id must be a string',
    })
    .optional(),
  payload: z
    .object(
      {
        delivery_protocol: z
          .string({
            error: 'delivery_protocol must be a string',
          })
          .optional(),
        format: z
          .string({
            error: 'format must be a string',
          })
          .optional(),
        schema_version: z
          .string({
            error: 'schema_version must be a string',
          })
          .optional(),
      },
      {
        error: 'payload must be an object',
      }
    )
    .optional(),
  status: z
    .string({
      error: 'status must be a string',
    })
    .optional(),
  topic_id: z
    .string({
      error: 'topic_id must be a string',
    })
    .optional(),
});

/**
 * Schema for getSubscription method
 * Endpoint: GET /subscription/{subscription_id}
 * Path: subscription_id (required)
 */
export const getSubscriptionSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
});

/**
 * Schema for updateSubscription method
 * Endpoint: PUT /subscription/{subscription_id}
 * Path: subscription_id (required)
 * Body: UpdateSubscriptionRequest - destinationId, payload, status
 */
export const updateSubscriptionSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
  destination_id: z
    .string({
      error: 'destination_id must be a string',
    })
    .optional(),
  payload: z
    .object({
      delivery_protocol: z
        .string({
          error: 'delivery_protocol must be a string',
        })
        .optional(),
      format: z
        .string({
          error: 'format must be a string',
        })
        .optional(),
      schema_version: z
        .string({
          error: 'schema_version must be a string',
        })
        .optional(),
    })
    .optional(),
  status: z
    .string({
      error: 'status must be a string',
    })
    .optional(),
});

/**
 * Schema for deleteSubscription method
 * Endpoint: DELETE /subscription/{subscription_id}
 * Path: subscription_id (required)
 */
export const deleteSubscriptionSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
});

/**
 * Schema for disableSubscription method
 * Endpoint: POST /subscription/{subscription_id}/disable
 * Path: subscription_id (required)
 */
export const disableSubscriptionSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
});

/**
 * Schema for enableSubscription method
 * Endpoint: POST /subscription/{subscription_id}/enable
 * Path: subscription_id (required)
 */
export const enableSubscriptionSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
});

/**
 * Schema for testSubscription method
 * Endpoint: POST /subscription/{subscription_id}/test
 * Path: subscription_id (required)
 */
export const testSubscriptionSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
});

/**
 * Schema for getTopic method
 * Endpoint: GET /topic/{topic_id}
 * Path: topic_id (required)
 */
export const getTopicSchema = z.object({
  topic_id: idSchema('Topic ID', 'The unique identifier for the topic'),
});

/**
 * Schema for getTopics method
 * Endpoint: GET /topic
 * Query: TopicParams - continuation_token, limit
 */
export const getTopicsSchema = z.object({
  limit: limitSchema,
  continuation_token: continuationTokenSchema,
});

/**
 * Schema for createSubscriptionFilter method
 * Endpoint: POST /subscription/{subscription_id}/filter
 * Path: subscription_id (required)
 * Body: CreateSubscriptionFilterRequest - filterSchema
 */
export const createSubscriptionFilterSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
  filter_schema: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for getSubscriptionFilter method
 * Endpoint: GET /subscription/{subscription_id}/filter/{filter_id}
 * Path: subscription_id (required), filter_id (required)
 */
export const getSubscriptionFilterSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
  filter_id: idSchema('Filter ID', 'The unique identifier for the filter'),
});

/**
 * Schema for deleteSubscriptionFilter method
 * Endpoint: DELETE /subscription/{subscription_id}/filter/{filter_id}
 * Path: subscription_id (required), filter_id (required)
 */
export const deleteSubscriptionFilterSchema = z.object({
  subscription_id: idSchema('Subscription ID', 'The unique identifier for the subscription'),
  filter_id: idSchema('Filter ID', 'The unique identifier for the filter'),
});
