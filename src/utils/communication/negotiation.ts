import { z } from 'zod';

/**
 * Zod schemas for Negotiation API input validation
 * Based on: src/api/communication/negotiation.ts
 * OpenAPI spec: docs/sell-apps/communication/sell_negotiation_v1_oas3.json
 * Types from: src/types/sell_negotiation_v1_oas3.ts
 */

// Reusable schema for filter parameter
const filterSchema = z
  .string({
    message: 'Filter must be a string',
    invalid_type_error: 'filter must be a string',
    description: 'Filter criteria for the query',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    invalid_type_error: 'limit must be a string',
    description: 'Maximum number of items to return (1-200)',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    invalid_type_error: 'offset must be a string',
    description: 'Number of items to skip',
  })
  .optional();

/**
 * Schema for findEligibleItems method
 * Endpoint: GET /find_eligible_items
 * Query Params: FindEligibleItemsParams - limit, offset
 * Headers: X-EBAY-C-MARKETPLACE-ID (required)
 */
export const findEligibleItemsSchema = z.object({
  limit: limitSchema,
  offset: offsetSchema,
  marketplace_id: z
    .string({
      invalid_type_error: 'marketplace_id must be a string',
      description: 'The eBay marketplace ID (X-EBAY-C-MARKETPLACE-ID header)',
    })
    .optional(),
});

/**
 * Schema for sendOfferToInterestedBuyers method
 * Endpoint: POST /send_offer_to_interested_buyers
 * Body: CreateOffersRequest - allowCounterOffer, message, offerDuration, offeredItems
 * Headers: X-EBAY-C-MARKETPLACE-ID (required)
 */
export const sendOfferToInterestedBuyersSchema = z.object({
  allow_counter_offer: z
    .boolean({
      invalid_type_error: 'allow_counter_offer must be a boolean',
      description: 'Whether to allow counter-offers (currently must be false)',
    })
    .optional(),
  message: z
    .string({
      invalid_type_error: 'message must be a string',
      description: 'Seller-defined message to buyers (max 2000 characters)',
    })
    .max(2000, 'message must be 2000 characters or less')
    .optional(),
  offer_duration: z
    .object(
      {
        unit: z
          .string({
            invalid_type_error: 'unit must be a string',
            description: 'Time unit (currently must be DAY)',
          })
          .optional(),
        value: z
          .number({
            invalid_type_error: 'value must be a number',
            description: 'Duration value (currently must be 2)',
          })
          .int({
            message: 'value must be an integer',
          })
          .optional(),
      },
      {
        invalid_type_error: 'offer_duration must be an object',
        description: 'Duration the offer is valid (default: 2 days)',
      }
    )
    .optional(),
  offered_items: z
    .array(
      z.object({
        discount_percentage: z
          .string({
            invalid_type_error: 'discount_percentage must be a string',
            description: 'Percentage discount (minimum 5)',
          })
          .optional(),
        listing_id: z
          .string({
            invalid_type_error: 'listing_id must be a string',
            description: 'The unique eBay listing ID',
          })
          .optional(),
        price: z
          .object(
            {
              currency: z
                .string({
                  invalid_type_error: 'currency must be a string',
                  description: '3-letter ISO 4217 currency code',
                })
                .optional(),
              value: z
                .string({
                  invalid_type_error: 'value must be a string',
                  description: 'The monetary amount',
                })
                .optional(),
            },
            {
              invalid_type_error: 'price must be an object',
              description: 'The discounted price',
            }
          )
          .optional(),
        quantity: z
          .number({
            invalid_type_error: 'quantity must be a number',
            description: 'Number of items (all-or-nothing offer)',
          })
          .int({
            message: 'quantity must be an integer',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'offered_items must be an array',
        description: 'Array of items to offer (currently limited to one item)',
      }
    )
    .optional(),
  marketplace_id: z
    .string({
      invalid_type_error: 'marketplace_id must be a string',
      description: 'The eBay marketplace ID (X-EBAY-C-MARKETPLACE-ID header)',
    })
    .optional(),
});

/**
 * Schema for getOffersToBuyers method (deprecated)
 * Note: This method does not match any endpoint in the OpenAPI spec
 */
export const getOffersToBuyersSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
});
