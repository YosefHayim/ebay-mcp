import { z } from '@/utils/effectSchema.js';

/** Marketplace sent as the Charity API's required X-EBAY-C-MARKETPLACE-ID header. */
const charityMarketplaceIdSchema = z
  .enum(['EBAY_US', 'EBAY_GB'])
  .describe('Marketplace sent as the required X-EBAY-C-MARKETPLACE-ID header: EBAY_US or EBAY_GB');

/** Input for Charity API getCharityOrg. */
export const getCharityOrgInputSchema = z.object({
  charityOrgId: z
    .string()
    .min(1)
    .describe('eBay charitable organization ID (charityOrgId from ebay_get_charity_orgs)'),
  marketplaceId: charityMarketplaceIdSchema,
});

/** Input for Charity API getCharityOrgs; eBay requires exactly one of q or registrationIds. */
export const getCharityOrgsInputSchema = z.object({
  marketplaceId: charityMarketplaceIdSchema,
  q: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Keywords matched against charity name, mission statement and description. Supply q or registrationIds, not both.',
    ),
  registrationIds: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Comma-separated charity registration IDs (the EIN on EBAY_US), at most 20. Supply q or registrationIds, not both.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Results per page, 1-100 (eBay default 20)'),
  offset: z
    .number()
    .int()
    .min(0)
    .max(10_000)
    .optional()
    .describe('Results to skip, 0-10000 (eBay default 0)'),
});
