import { z } from "zod";

/**
 * Zod schemas for Feedback API input validation
 * Based on: src/api/communication/feedback.ts
 * OpenAPI spec: docs/sell-apps/communication/commerce_feedback_v1_beta_oas3.json
 */

// Reusable schema for filter parameter
const filterSchema = z.string({
  message: "Filter must be a string",
  invalid_type_error: "filter must be a string",
  description: "Filter criteria for the query"
}).optional();

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

// Reusable schema for offset parameter
const offsetSchema = z.coerce.number({
  message: "Offset must be a non-negative number",
  invalid_type_error: "offset must be a number",
  description: "Number of items to skip"
}).nonnegative({
  message: "offset must be a non-negative number"
}).int({
  message: "offset must be an integer"
}).optional();

/**
 * Schema for getAwaitingFeedback method
 * Endpoint: GET /awaiting_feedback
 */
export const getAwaitingFeedbackSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema
});

/**
 * Schema for getFeedback method
 * Endpoint: GET /feedback
 */
export const getFeedbackSchema = z.object({
  transaction_id: z.string({
    message: "Transaction ID is required",
    required_error: "transaction_id is required",
    invalid_type_error: "transaction_id must be a string",
    description: "The unique identifier for the transaction"
  })
});

/**
 * Schema for getFeedbackRatingSummary method
 * Endpoint: GET /feedback_rating_summary
 */
export const getFeedbackRatingSummarySchema = z.object({});

/**
 * Schema for leaveFeedbackForBuyer method
 * Endpoint: POST /feedback
 */
export const leaveFeedbackForBuyerSchema = z.object({
  feedback_data: z.record(z.unknown(), {
    message: "Feedback data is required",
    required_error: "feedback_data is required",
    invalid_type_error: "feedback_data must be an object",
    description: "The feedback data to submit"
  })
});

/**
 * Schema for respondToFeedback method
 * Endpoint: POST /respond_to_feedback
 */
export const respondToFeedbackSchema = z.object({
  feedback_id: z.string({
    message: "Feedback ID is required",
    required_error: "feedback_id is required",
    invalid_type_error: "feedback_id must be a string",
    description: "The unique identifier for the feedback"
  }),
  response_text: z.string({
    message: "Response text is required",
    required_error: "response_text is required",
    invalid_type_error: "response_text must be a string",
    description: "The text of the response to the feedback"
  })
});
