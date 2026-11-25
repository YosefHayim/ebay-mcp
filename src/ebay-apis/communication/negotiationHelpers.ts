import { z } from 'zod';

/**
 * Zod schemas for Negotiation API input validation.
 * OpenAPI spec: sell_negotiation_v1_oas3.json
 */

/** Optional positive page size accepted by Negotiation list endpoints. */
const limitSchema = z
  .number({
    invalid_type_error: 'limit must be a number',
    description: 'Maximum number of items to return (1-200)',
  })
  .positive('limit must be a positive number')
  .optional();

/** Optional zero-based page offset accepted by Negotiation list endpoints. */
const offsetSchema = z
  .number({
    invalid_type_error: 'offset must be a number',
    description: 'Number of items to skip',
  })
  .min(0, 'offset must be a non-negative number')
  .optional();

/** Schema for findEligibleItems input. */
export const findEligibleItemsSchema = z.object({
  limit: limitSchema,
  offset: offsetSchema,
  marketplaceId: z
    .string({
      invalid_type_error: 'marketplaceId must be a string',
      description: 'The eBay marketplace ID (X-EBAY-C-MARKETPLACE-ID header)',
    })
    .optional(),
});

/** Schema for sendOfferToInterestedBuyers input. */
export const sendOfferToInterestedBuyersSchema = z.object({
  allowCounterOffer: z
    .boolean({
      invalid_type_error: 'allowCounterOffer must be a boolean',
      description: 'Whether to allow counter-offers (currently must be false)',
    })
    .optional(),
  marketplaceId: z
    .string({
      invalid_type_error: 'marketplaceId must be a string',
      description: 'The eBay marketplace ID (X-EBAY-C-MARKETPLACE-ID header)',
    })
    .optional(),
  message: z
    .string({
      invalid_type_error: 'message must be a string',
      description: 'Seller-defined message to buyers (max 2000 characters)',
    })
    .max(2000, 'message must be 2000 characters or less')
    .optional(),
  offerDuration: z
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
        invalid_type_error: 'offerDuration must be an object',
        description: 'Duration the offer is valid (default: 2 days)',
      },
    )
    .optional(),
  offeredItems: z
    .array(
      z.object({
        discountPercentage: z
          .string({
            invalid_type_error: 'discountPercentage must be a string',
            description: 'Percentage discount (minimum 5)',
          })
          .optional(),
        listingId: z
          .string({
            invalid_type_error: 'listingId must be a string',
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
            },
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
        invalid_type_error: 'offeredItems must be an array',
        description: 'Array of items to offer (currently limited to one item)',
      },
    )
    .optional(),
});
