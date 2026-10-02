import { getCharityOrgInputSchema, getCharityOrgsInputSchema } from '@/schemas/taxonomy/charity.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

const CHARITY_AUTH_NOTE =
  'Supports marketplaceId EBAY_US or EBAY_GB only. Uses an application (client-credentials) token, so EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are enough; no user consent is needed.';

/** Charity API tools for finding charitable organizations supported by eBay for Charity. */
export const charityEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_charity_org',
    description: `Charity API: get one charitable organization supported by eBay for Charity by charityOrgId (from ebay_get_charity_orgs): name, mission statement, description, logo, location, registration ID (EIN on EBAY_US) and website. ${CHARITY_AUTH_NOTE}`,
    inputSchema: getCharityOrgInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.charity.getCharityOrg(args)),
  }),
  defineTool({
    name: 'ebay_get_charity_orgs',
    description: `Charity API: search charitable organizations supported by eBay for Charity, either by keywords (q) or by comma-separated registrationIds; supply exactly one. Paginated with limit (1-100) and offset (0-10000). ${CHARITY_AUTH_NOTE}`,
    inputSchema: getCharityOrgsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.charity.getCharityOrgs(args)),
  }),
];
