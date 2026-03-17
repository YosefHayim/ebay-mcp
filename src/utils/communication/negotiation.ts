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
    error: 'filter must be a string',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    error: 'limit must be a string',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    error: 'offset must be a string',
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
      error: 'marketplace_id must be a string',
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
      error: 'allow_counter_offer must be a boolean',
    })
    .optional(),
  message: z
    .string({
      error: 'message must be a string',
    })
    .max(2000, 'message must be 2000 characters or less')
    .optional(),
  offer_duration: z
    .object(
      {
        unit: z
          .string({
            error: 'unit must be a string',
          })
          .optional(),
        value: z
          .number({
            error: 'value must be a number',
          })
          .int({
            message: 'value must be an integer',
          })
          .optional(),
      },
      {
        error: 'offer_duration must be an object',
      }
    )
    .optional(),
  offered_items: z
    .array(
      z.object({
        discount_percentage: z
          .string({
            error: 'discount_percentage must be a string',
          })
          .optional(),
        listing_id: z
          .string({
            error: 'listing_id must be a string',
          })
          .optional(),
        price: z
          .object(
            {
              currency: z
                .string({
                  error: 'currency must be a string',
                })
                .optional(),
              value: z
                .string({
                  error: 'value must be a string',
                })
                .optional(),
            },
            {
              error: 'price must be an object',
            }
          )
          .optional(),
        quantity: z
          .number({
            error: 'quantity must be a number',
          })
          .int({
            message: 'quantity must be an integer',
          })
          .optional(),
      }),
      {
        error: 'offered_items must be an array',
      }
    )
    .optional(),
  marketplace_id: z
    .string({
      error: 'marketplace_id must be a string',
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
