import { z } from 'zod';
import type { operations, components } from '@/types/commerce_notification_v1_oas3.js';

/**
 * Zod schemas for Notification API input validation
 * Based on: src/api/communication/notification.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_notification_v1_oas3.json
 * Types from: src/types/commerce_notification_v1_oas3.ts
 */

// Extract operation parameter types for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetPublicKeyParams = operations['getPublicKey']['parameters']['path'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ConfigType = components['schemas']['Config'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _DestinationRequest = components['schemas']['DestinationRequest'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _DestinationParams = operations['getDestinations']['parameters']['query'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _SubscriptionParams = operations['getSubscriptions']['parameters']['query'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CreateSubscriptionRequest = components['schemas']['CreateSubscriptionRequest'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _UpdateSubscriptionRequest = components['schemas']['UpdateSubscriptionRequest'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CreateSubscriptionFilterRequest = components['schemas']['CreateSubscriptionFilterRequest'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _TopicParams = operations['getTopics']['parameters']['query'];

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    invalid_type_error: 'limit must be a string',
    description: 'Maximum number of items to return per page (10-100)',
  })
  .optional();

// Reusable schema for continuation token parameter
const continuationTokenSchema = z
  .string({
    message: 'Continuation token must be a string',
    invalid_type_error: 'continuation_token must be a string',
    description: 'Token for pagination',
  })
  .optional();

// Reusable schema for ID parameters (required)
const idSchema = (name: string, description: string) =>
  z.string({
    message: `${name} is required`,
    required_error: `${name.toLowerCase().replace(/\s+/g, '_')} is required`,
    invalid_type_error: `${name.toLowerCase().replace(/\s+/g, '_')} must be a string`,
    description,
  });

// Reusable schema for object data parameters (currently unused)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _objectDataSchema = (name: string, description: string) =>
  z.record(z.unknown(), {
    message: `${name} is required`,
    required_error: `${name.toLowerCase().replace(/\s+/g, '_')} is required`,
    invalid_type_error: `${name.toLowerCase().replace(/\s+/g, '_')} must be an object`,
    description,
  });

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
      invalid_type_error: 'alert_email must be a string',
      description: 'Email address for Notification API alerts',
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
            invalid_type_error: 'endpoint must be a string',
            description: 'HTTPS endpoint URL (no internal IPs or localhost)',
          })
          .url({
            message: 'endpoint must be a valid URL',
          })
          .optional(),
        verification_token: z
          .string({
            invalid_type_error: 'verification_token must be a string',
            description: 'Verification token (32-80 alphanumeric, underscore, hyphen characters)',
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
        invalid_type_error: 'delivery_config must be an object',
        description: 'Delivery configuration with endpoint and verification token',
      }
    )
    .optional(),
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Seller-specified name for the destination',
    })
    .optional(),
  status: z
    .string({
      invalid_type_error: 'status must be a string',
      description: 'Status: ENABLED or DISABLED',
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
          invalid_type_error: 'endpoint must be a string',
          description: 'HTTPS endpoint URL',
        })
        .url({
          message: 'endpoint must be a valid URL',
        })
        .optional(),
      verification_token: z
        .string({
          invalid_type_error: 'verification_token must be a string',
          description: 'Verification token (32-80 characters)',
        })
        .min(32)
        .max(80)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .optional(),
    })
    .optional(),
  name: z
    .string({
      invalid_type_error: 'name must be a string',
      description: 'Destination name',
    })
    .optional(),
  status: z
    .string({
      invalid_type_error: 'status must be a string',
      description: 'Status: ENABLED or DISABLED',
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
      invalid_type_error: 'destination_id must be a string',
      description: 'The unique identifier of the destination endpoint',
    })
    .optional(),
  payload: z
    .object(
      {
        delivery_protocol: z
          .string({
            invalid_type_error: 'delivery_protocol must be a string',
            description: 'Delivery protocol (currently only HTTPS is supported)',
          })
          .optional(),
        format: z
          .string({
            invalid_type_error: 'format must be a string',
            description: 'Payload format (currently only JSON is supported)',
          })
          .optional(),
        schema_version: z
          .string({
            invalid_type_error: 'schema_version must be a string',
            description: 'Schema version for the notification topic',
          })
          .optional(),
      },
      {
        invalid_type_error: 'payload must be an object',
        description: 'Payload configuration',
      }
    )
    .optional(),
  status: z
    .string({
      invalid_type_error: 'status must be a string',
      description: 'Status: ENABLED or DISABLED',
    })
    .optional(),
  topic_id: z
    .string({
      invalid_type_error: 'topic_id must be a string',
      description: 'The unique identifier of the notification topic',
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
      invalid_type_error: 'destination_id must be a string',
      description: 'The unique identifier of the destination',
    })
    .optional(),
  payload: z
    .object({
      delivery_protocol: z
        .string({
          invalid_type_error: 'delivery_protocol must be a string',
          description: 'Delivery protocol',
        })
        .optional(),
      format: z
        .string({
          invalid_type_error: 'format must be a string',
          description: 'Payload format',
        })
        .optional(),
      schema_version: z
        .string({
          invalid_type_error: 'schema_version must be a string',
          description: 'Schema version',
        })
        .optional(),
    })
    .optional(),
  status: z
    .string({
      invalid_type_error: 'status must be a string',
      description: 'Status: ENABLED or DISABLED',
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
  filter_schema: z
    .record(z.any(), {
      invalid_type_error: 'filter_schema must be an object',
      description:
        'Valid JSON Schema Core document (version 2020-12 or later) to filter notifications',
    })
    .optional(),
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
