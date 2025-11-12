import { z } from 'zod';
import type { operations, components } from '@/types/commerce_feedback_v1_beta_oas3.js';

/**
 * Zod schemas for Feedback API input validation
 * Based on: src/api/communication/feedback.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_feedback_v1_beta_oas3.json
 * Types from: src/types/commerce_feedback_v1_beta_oas3.ts
 */

// Extract operation parameter types for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetAwaitingFeedbackParams = operations['getItemsAwaitingFeedback']['parameters']['query'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetFeedbackParams = operations['getFeedback']['parameters']['query'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _LeaveFeedbackRequest = components['schemas']['LeaveFeedbackRequest'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _RespondToFeedbackRequest = components['schemas']['RespondToFeedbackRequest'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetFeedbackRatingSummaryParams = operations['getFeedbackRatingSummary']['parameters']['query'];

// Reusable schema for filter parameter
const filterSchema = z
  .string({
    message: 'Filter must be a string',
    invalid_type_error: 'filter must be a string',
    description: 'Filter criteria for the query',
  })
  .optional();

// Reusable schema for limit parameter (string in API, converted to number)
const limitSchema = z
  .string({
    invalid_type_error: 'limit must be a string',
    description: 'Maximum number of items to return per page (25-200)',
  })
  .optional();

// Reusable schema for offset parameter (string in API, converted to number)
const offsetSchema = z
  .string({
    invalid_type_error: 'offset must be a string',
    description: 'Number of items to skip',
  })
  .optional();

// Reusable schema for sort parameter
const sortSchema = z
  .string({
    invalid_type_error: 'sort must be a string',
    description: 'Sort order for results',
  })
  .optional();

/**
 * Schema for getAwaitingFeedback method
 * Endpoint: GET /awaiting_feedback
 * Params: GetAwaitingFeedbackParams - filter, limit, offset, sort
 */
export const getAwaitingFeedbackSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
  sort: sortSchema,
});

/**
 * Schema for getFeedback method
 * Endpoint: GET /feedback
 * Params: GetFeedbackParams - user_id (required), feedback_type (required), feedback_id, filter, limit, listing_id, offset, order_line_item_id, sort, transaction_id
 */
export const getFeedbackSchema = z.object({
  user_id: z.string({
    message: 'User ID is required',
    required_error: 'user_id is required',
    invalid_type_error: 'user_id must be a string',
    description: 'The unique identifier (eBay username) of the user',
  }),
  feedback_type: z.string({
    message: 'Feedback type is required',
    required_error: 'feedback_type is required',
    invalid_type_error: 'feedback_type must be a string',
    description: 'Type of feedback (FEEDBACK_RECEIVED or FEEDBACK_SENT)',
  }),
  feedback_id: z
    .string({
      invalid_type_error: 'feedback_id must be a string',
      description: 'Filter by specific feedback ID',
    })
    .optional(),
  filter: filterSchema,
  limit: limitSchema,
  listing_id: z
    .string({
      invalid_type_error: 'listing_id must be a string',
      description: 'Filter by listing ID',
    })
    .optional(),
  offset: offsetSchema,
  order_line_item_id: z
    .string({
      invalid_type_error: 'order_line_item_id must be a string',
      description: 'Filter by order line item ID',
    })
    .optional(),
  sort: sortSchema,
  transaction_id: z
    .string({
      invalid_type_error: 'transaction_id must be a string',
      description: 'Filter by transaction ID',
    })
    .optional(),
});

/**
 * Schema for getFeedbackRatingSummary method
 * Endpoint: GET /feedback_rating_summary
 * Params: GetFeedbackRatingSummaryParams - user_id (required), filter (required)
 */
export const getFeedbackRatingSummarySchema = z.object({
  user_id: z.string({
    message: 'User ID is required',
    required_error: 'user_id is required',
    invalid_type_error: 'user_id must be a string',
    description: 'The unique identifier of the eBay user',
  }),
  filter: z.string({
    message: 'Filter is required (must include ratingType)',
    required_error: 'filter is required',
    invalid_type_error: 'filter must be a string',
    description: 'Filter with required ratingType parameter',
  }),
});

/**
 * Schema for leaveFeedbackForBuyer method
 * Endpoint: POST /feedback
 * Body: LeaveFeedbackRequest - commentText, commentType, images, listingId, orderLineItemId, sellerRatings, transactionId
 */
export const leaveFeedbackForBuyerSchema = z.object({
  comment_text: z
    .string({
      invalid_type_error: 'comment_text must be a string',
      description: 'The feedback comment text (max 500 characters)',
    })
    .max(500, 'comment_text must be 500 characters or less')
    .optional(),
  comment_type: z
    .string({
      invalid_type_error: 'comment_type must be a string',
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
      }
    )
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  listing_id: z
    .string({
      invalid_type_error: 'listing_id must be a string',
      description: 'The listing ID related to the transaction',
    })
    .optional(),
  order_line_item_id: z
    .string({
      invalid_type_error: 'order_line_item_id must be a string',
      description: 'The unique identifier of the line item',
    })
    .optional(),
  seller_ratings: z
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
        invalid_type_error: 'seller_ratings must be an array',
        description: 'Array of seller performance ratings',
      }
    )
    .optional(),
  transaction_id: z
    .string({
      invalid_type_error: 'transaction_id must be a string',
      description: 'The unique identifier of the transaction',
    })
    .optional(),
});

/**
 * Schema for respondToFeedback method
 * Endpoint: POST /respond_to_feedback
 * Body: RespondToFeedbackRequest - feedbackId, recipientUserId, responseText, responseType
 */
export const respondToFeedbackSchema = z.object({
  feedback_id: z
    .string({
      invalid_type_error: 'feedback_id must be a string',
      description: 'The unique identifier of the feedback being responded to',
    })
    .optional(),
  recipient_user_id: z
    .string({
      invalid_type_error: 'recipient_user_id must be a string',
      description: 'The user ID of the feedback provider',
    })
    .optional(),
  response_text: z
    .string({
      invalid_type_error: 'response_text must be a string',
      description: 'The text content of the response (max 500 characters)',
    })
    .max(500, 'response_text must be 500 characters or less')
    .optional(),
  response_type: z
    .string({
      invalid_type_error: 'response_type must be a string',
      description: 'The type of response: REPLY or FOLLOW_UP',
    })
    .optional(),
});
