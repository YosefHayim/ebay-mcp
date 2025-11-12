import { z } from 'zod';
import { MarketplaceId } from '@/types/ebay-enums.js';


export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}
export const marketingTools: ToolDefinition[] = [
  {
    name: 'ebay_get_campaigns',
    description: 'Get marketing campaigns for the seller',
    inputSchema: {
      campaignStatus: z
        .string()
        .optional()
        .describe('Filter by campaign status (RUNNING, PAUSED, ENDED)'),
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of campaigns to return'),
    },
  },
  {
    name: 'ebay_get_campaign',
    description: 'Get details of a specific marketing campaign by ID',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID'),
    },
  },
  {
    name: 'ebay_pause_campaign',
    description:
      'Pause a running marketing campaign. Use this to temporarily stop a campaign without ending it.',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID to pause'),
    },
  },
  {
    name: 'ebay_resume_campaign',
    description:
      'Resume a paused marketing campaign. Use this to restart a campaign that was previously paused.',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID to resume'),
    },
  },
  {
    name: 'ebay_end_campaign',
    description: 'Permanently end a marketing campaign. Note: Ended campaigns cannot be restarted.',
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID to end'),
    },
  },
  {
    name: 'ebay_update_campaign_identification',
    description:
      "Update a campaign's name or other identification details. Note: eBay does not support directly updating campaign budget or duration - you must clone the campaign with new settings.",
    inputSchema: {
      campaignId: z.string().describe('The unique campaign ID'),
      updateData: z
        .object({
          campaignName: z.string().optional().describe('New campaign name'),
        })
        .describe('Campaign identification data to update (e.g., campaign name)'),
    },
  },
  {
    name: 'ebay_clone_campaign',
    description:
      'Clone an existing campaign with new settings. Use this to create a campaign with modified budget or duration, as eBay does not support direct budget/duration updates.',
    inputSchema: {
      campaignId: z.string().describe('The campaign ID to clone'),
      cloneData: z
        .object({
          campaignName: z.string().optional().describe('Name for the new cloned campaign'),
          fundingStrategy: z
            .object({
              fundingModel: z
                .string()
                .optional()
                .describe(
                  'The funding model for the campaign. Valid values: "COST_PER_SALE" (CPS) or "COST_PER_CLICK" (CPC)'
                ),
              bidPercentage: z
                .string()
                .optional()
                .describe(
                  'The bid percentage for CPS campaigns (e.g., "10.5" for 10.5%). Required for COST_PER_SALE funding model.'
                ),
            })
            .optional()
            .describe(
              'Budget settings for the campaign. Includes fundingModel (COST_PER_SALE or COST_PER_CLICK) and bidPercentage.'
            ),
          startDate: z
            .string()
            .optional()
            .describe(
              'Campaign start date in UTC format (yyyy-MM-ddThh:mm:ssZ, e.g., "2025-01-15T00:00:00Z")'
            ),
          endDate: z
            .string()
            .optional()
            .describe(
              'Campaign end date in UTC format (yyyy-MM-ddThh:mm:ssZ, e.g., "2025-12-31T23:59:59Z")'
            ),
        })
        .describe('New campaign settings including name, budget, start/end dates'),
    },
  },
  {
    name: 'ebay_get_promotions',
    description: 'Get promotions for the seller',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: z.number().optional().describe('Number of promotions to return'),
    },
  },
  {
    name: 'ebay_find_listing_recommendations',
    description: 'Find listing recommendations for items',
    inputSchema: {
      listingIds: z
        .array(z.string())
        .optional()
        .describe('Array of listing IDs to get recommendations for'),
      filter: z.string().optional().describe('Filter criteria'),
      limit: z.number().optional().describe('Number of recommendations to return'),
      offset: z.number().optional().describe('Number to skip'),
      marketplaceId: z.string().optional().describe('Marketplace ID'),
    },
  },
];
