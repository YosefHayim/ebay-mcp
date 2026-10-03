import { MarketplaceId } from '@/types/ebayEnums.js';
import { z } from 'zod';

/**
 * Input shared by the five Metadata API `shipping:marketplace` methods (carriers, services,
 * locations, excluded locations, and handling times): one path parameter and one header.
 */
export const shippingMetadataInputSchema = z.object({
  marketplaceId: z
    .nativeEnum(MarketplaceId)
    .describe('eBay marketplace ID sent as the marketplace_id path parameter, e.g. EBAY_US'),
  acceptLanguage: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Accept-Language header. Required for French Canada (EBAY_CA + fr-CA), French Belgium (EBAY_BE + fr-BE) and Dutch Belgium (EBAY_BE + nl-BE); EBAY_CA without it returns English Canada.',
    ),
});
