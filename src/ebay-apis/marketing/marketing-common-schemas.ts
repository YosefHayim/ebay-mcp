/**
 * Marketing API schemas — common slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';

/**
 * Validates the Marketing API amount model.
 */
export const amountSchema = z.object({
  currency: z.string().optional(),
  value: z.string().optional(),
});

// ============================================================================
// Inventory Reference Schemas
// ============================================================================

/**
 * Validates the Marketing API marketing inventory item model.
 */
export const marketingInventoryItemSchema = z.object({
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

/**
 * Validates the Marketing API inventory reference model.
 */
export const inventoryReferenceSchema = z.object({
  inventoryReferenceId: z.string().optional(),
  inventoryReferenceType: z.string().optional(),
});

/**
 * Validates the Marketing API find listing recommendation request model.
 */
const findListingRecommendationRequestSchema = z.object({
  listingIds: z.array(z.string()).optional(),
});

export const findListingRecommendationsInputSchema = z.object({
  requestBody: findListingRecommendationRequestSchema.optional(),
  filter: z.string().optional().describe('Recommendation filter expression'),
  limit: z.number().optional().describe('Maximum recommendations to return'),
  offset: z.number().optional().describe('Recommendations to skip before returning results'),
  marketplaceId: z.string().describe('Marketplace ID sent as X-EBAY-C-MARKETPLACE-ID'),
});
