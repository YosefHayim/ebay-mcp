import { z } from 'zod';

/**
 * Zod schemas for Feedback API input validation.
 * OpenAPI spec: commerce_feedback_v1_beta_oas3.json
 */

/** Optional feedback filter expression. */
const filterSchema = z
  .string({
    message: 'Filter must be a string',
    invalid_type_error: 'filter must be a string',
    description: 'Filter criteria for the query',
  })
  .optional();

/** Optional positive page size accepted by Feedback list endpoints. */
const limitSchema = z
  .number({
    invalid_type_error: 'limit must be a number',
    description: 'Maximum number of items to return per page (25-200)',
  })
  .positive('limit must be a positive number')
  .optional();

/** Optional zero-based page offset accepted by Feedback list endpoints. */
const offsetSchema = z
  .number({
    invalid_type_error: 'offset must be a number',
    description: 'Number of items to skip',
  })
  .min(0, 'offset must be a non-negative number')
  .optional();

/** Optional feedback result sort order. */
const sortSchema = z
  .string({
    invalid_type_error: 'sort must be a string',
    description: 'Sort order for results',
  })
  .optional();

/** Schema for getAwaitingFeedback input. */
export const getAwaitingFeedbackSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
  sort: sortSchema,
});

/** Schema for getFeedback input. */
export const getFeedbackSchema = z.object({
  userId: z.string({
    message: 'User ID is required',
    required_error: 'userId is required',
    invalid_type_error: 'userId must be a string',
    description: 'The unique identifier (eBay username) of the user',
  }),
  feedbackType: z.string({
    message: 'Feedback type is required',
    required_error: 'feedbackType is required',
    invalid_type_error: 'feedbackType must be a string',
    description: 'Type of feedback (FEEDBACK_RECEIVED or FEEDBACK_SENT)',
  }),
  feedbackId: z
    .string({
      invalid_type_error: 'feedbackId must be a string',
      description: 'Filter by specific feedback ID',
    })
    .optional(),
  filter: filterSchema,
  limit: limitSchema,
  listingId: z
    .string({
      invalid_type_error: 'listingId must be a string',
      description: 'Filter by listing ID',
    })
    .optional(),
  offset: offsetSchema,
  orderLineItemId: z
    .string({
      invalid_type_error: 'orderLineItemId must be a string',
      description: 'Filter by order line item ID',
    })
    .optional(),
  sort: sortSchema,
  transactionId: z
    .string({
      invalid_type_error: 'transactionId must be a string',
      description: 'The unique identifier of the transaction',
    })
    .optional(),
});

/** Schema for getFeedbackRatingSummary input. */
export const getFeedbackRatingSummarySchema = z.object({
  userId: z.string({
    message: 'User ID is required',
    required_error: 'userId is required',
    invalid_type_error: 'userId must be a string',
    description: 'The unique identifier of the eBay user',
  }),
  filter: z.string({
    message: 'Filter is required (must include ratingType)',
    required_error: 'filter is required',
    invalid_type_error: 'filter must be a string',
    description: 'Filter with required ratingType parameter',
  }),
});

/** Schema for leaveFeedback input. */
export const leaveFeedbackForBuyerSchema = z.object({
  commentText: z
    .string({
      invalid_type_error: 'commentText must be a string',
      description: 'The feedback comment text (max 500 characters)',
    })
    .max(500, 'commentText must be 500 characters or less')
    .optional(),
  commentType: z
    .string({
      invalid_type_error: 'commentType must be a string',
      description: 'Overall rating: POSITIVE, NEUTRAL, or NEGATIVE',
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z
          .string({
            invalid_type_error: 'image url must be a string',
            description: 'URL of the image',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'images must be an array',
        description: 'Array of up to 5 images',
      },
    )
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  listingId: z
    .string({
      invalid_type_error: 'listingId must be a string',
      description: 'The listing ID related to the transaction',
    })
    .optional(),
  orderLineItemId: z
    .string({
      invalid_type_error: 'orderLineItemId must be a string',
      description: 'The unique identifier of the line item',
    })
    .optional(),
  sellerRatings: z
    .array(
      z.object({
        key: z
          .string({
            invalid_type_error: 'seller rating key must be a string',
            description: 'Rating category (e.g., ON_TIME_DELIVERY, ITEM_AS_DESCRIBED)',
          })
          .optional(),
        value: z
          .string({
            invalid_type_error: 'seller rating value must be a string',
            description: 'Rating value (1-5)',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'sellerRatings must be an array',
        description: 'Array of seller performance ratings',
      },
    )
    .optional(),
  transactionId: z
    .string({
      invalid_type_error: 'transactionId must be a string',
      description: 'The unique identifier of the transaction',
    })
    .optional(),
});

/** Schema for respondToFeedback input. */
export const respondToFeedbackSchema = z.object({
  feedbackId: z
    .string({
      invalid_type_error: 'feedbackId must be a string',
      description: 'The unique identifier of the feedback being responded to',
    })
    .optional(),
  recipientUserId: z
    .string({
      invalid_type_error: 'recipientUserId must be a string',
      description: 'The user ID of the feedback provider',
    })
    .optional(),
  responseText: z
    .string({
      invalid_type_error: 'responseText must be a string',
      description: 'The text content of the response (max 500 characters)',
    })
    .max(500, 'responseText must be 500 characters or less')
    .optional(),
  responseType: z
    .string({
      invalid_type_error: 'responseType must be a string',
      description: 'The type of response: REPLY or FOLLOW_UP',
    })
    .optional(),
});
