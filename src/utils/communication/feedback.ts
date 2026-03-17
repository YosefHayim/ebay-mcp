import { z } from 'zod';

/**
 * Zod schemas for Feedback API input validation
 * Based on: src/api/communication/feedback.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_feedback_v1_beta_oas3.json
 * Types from: src/types/commerce_feedback_v1_beta_oas3.ts
 */

// Reusable schema for filter parameter
const filterSchema = z
  .string({
    error: 'filter must be a string',
  })
  .optional();

// Reusable schema for limit parameter (string in API, converted to number)
const limitSchema = z
  .string({
    error: 'limit must be a string',
  })
  .optional();

// Reusable schema for offset parameter (string in API, converted to number)
const offsetSchema = z
  .string({
    error: 'offset must be a string',
  })
  .optional();

// Reusable schema for sort parameter
const sortSchema = z
  .string({
    error: 'sort must be a string',
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
    error: 'user_id is required',
  }),
  feedback_type: z.string({
    error: 'feedback_type is required',
  }),
  feedback_id: z
    .string({
      error: 'feedback_id must be a string',
    })
    .optional(),
  filter: filterSchema,
  limit: limitSchema,
  listing_id: z
    .string({
      error: 'listing_id must be a string',
    })
    .optional(),
  offset: offsetSchema,
  order_line_item_id: z
    .string({
      error: 'order_line_item_id must be a string',
    })
    .optional(),
  sort: sortSchema,
  transaction_id: z
    .string({
      error: 'transaction_id must be a string',
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
    error: 'user_id is required',
  }),
  filter: z.string({
    error: 'filter is required',
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
      error: 'comment_text must be a string',
    })
    .max(500, 'comment_text must be 500 characters or less')
    .optional(),
  comment_type: z
    .string({
      error: 'comment_type must be a string',
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z
          .string({
            error: 'image url must be a string',
          })
          .optional(),
      }),
      {
        error: 'images must be an array',
      }
    )
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  listing_id: z
    .string({
      error: 'listing_id must be a string',
    })
    .optional(),
  order_line_item_id: z
    .string({
      error: 'order_line_item_id must be a string',
    })
    .optional(),
  seller_ratings: z
    .array(
      z.object({
        key: z
          .string({
            error: 'seller rating key must be a string',
          })
          .optional(),
        value: z
          .string({
            error: 'seller rating value must be a string',
          })
          .optional(),
      }),
      {
        error: 'seller_ratings must be an array',
      }
    )
    .optional(),
  transaction_id: z
    .string({
      error: 'transaction_id must be a string',
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
      error: 'feedback_id must be a string',
    })
    .optional(),
  recipient_user_id: z
    .string({
      error: 'recipient_user_id must be a string',
    })
    .optional(),
  response_text: z
    .string({
      error: 'response_text must be a string',
    })
    .max(500, 'response_text must be 500 characters or less')
    .optional(),
  response_type: z
    .string({
      error: 'response_type must be a string',
    })
    .optional(),
});
