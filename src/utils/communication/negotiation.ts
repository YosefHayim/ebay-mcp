import { z } from "zod";

/**
 * Zod schemas for Negotiation API input validation
 * Based on: src/api/communication/negotiation.ts
 * OpenAPI spec: docs/sell-apps/communication/sell_negotiation_v1_oas3.json
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
 * Schema for findEligibleItems method
 * Endpoint: GET /find_eligible_items
 */
export const findEligibleItemsSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema
});

/**
 * Schema for sendOfferToInterestedBuyers method
 * Endpoint: POST /send_offer_to_interested_buyers
 */
export const sendOfferToInterestedBuyersSchema = z.object({
  offer_data: z.record(z.unknown(), {
    message: "Offer data is required",
    required_error: "offer_data is required",
    invalid_type_error: "offer_data must be an object",
    description: "The offer data to send to interested buyers"
  })
});

/**
 * Schema for getOffersToBuyers method (deprecated)
 * Note: This method does not match any endpoint in the OpenAPI spec
 */
export const getOffersToBuyersSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema
});
