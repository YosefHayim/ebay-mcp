import { z } from 'zod';
import { MarketplaceId } from '@/types/ebay-enums.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}

// Reusable schemas
const campaignIdSchema = z.string().describe('Campaign ID');
const adIdSchema = z.string().describe('Ad ID');
const adGroupIdSchema = z.string().describe('Ad Group ID');
const keywordIdSchema = z.string().describe('Keyword ID');
const negativeKeywordIdSchema = z.string().describe('Negative Keyword ID');
const promotionIdSchema = z.string().describe('Promotion ID');
const reportIdSchema = z.string().describe('Report ID');
const reportTaskIdSchema = z.string().describe('Report Task ID');
const limitSchema = z.number().optional().describe('Maximum number of results to return');
const offsetSchema = z.number().optional().describe('Number of results to skip');

export const marketingTools: ToolDefinition[] = [
  // ========================================
  // CAMPAIGN MANAGEMENT (11 tools)
  // ========================================
  {
    name: 'ebay_get_campaigns',
    description:
      'Get all marketing campaigns for the seller. Returns campaigns with status, budget, and performance data.',
    inputSchema: {
      campaignStatus: z
        .string()
        .optional()
        .describe('Filter by campaign status: RUNNING, PAUSED, ENDED, or ARCHIVED'),
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_get_campaign',
    description:
      'Get details of a specific marketing campaign by ID. Returns campaign configuration, status, and statistics.',
    inputSchema: {
      campaignId: campaignIdSchema,
    },
  },
  {
    name: 'ebay_get_campaign_by_name',
    description:
      'Find a campaign by its name. Returns campaign details if a matching name is found.',
    inputSchema: {
      campaignName: z.string().describe('Campaign name to search for'),
    },
  },
  {
    name: 'ebay_create_campaign',
    description:
      'Create a new marketing campaign. Supports both CPS (Cost Per Sale) and CPC (Cost Per Click) campaigns.',
    inputSchema: {
      campaign: z
        .object({
          campaignName: z.string().describe('Campaign name'),
          marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
          fundingStrategy: z
            .object({
              fundingModel: z
                .enum(['COST_PER_SALE', 'COST_PER_CLICK'])
                .describe('Funding model: CPS or CPC'),
              bidPercentage: z
                .string()
                .optional()
                .describe('Bid percentage for CPS campaigns (e.g., "10.5")'),
            })
            .describe('Funding strategy configuration'),
          startDate: z.string().optional().describe('Campaign start date (ISO 8601 format)'),
          endDate: z.string().optional().describe('Campaign end date (ISO 8601 format)'),
        })
        .describe('Campaign configuration'),
    },
  },
  {
    name: 'ebay_clone_campaign',
    description:
      'Clone an existing campaign with new settings. Useful for creating campaigns with modified budget or duration.',
    inputSchema: {
      campaignId: campaignIdSchema,
      cloneData: z
        .object({
          campaignName: z.string().optional().describe('Name for the cloned campaign'),
          fundingStrategy: z
            .object({
              fundingModel: z.enum(['COST_PER_SALE', 'COST_PER_CLICK']).optional(),
              bidPercentage: z.string().optional().describe('Bid percentage (e.g., "10.5")'),
            })
            .optional(),
          startDate: z.string().optional().describe('Start date (ISO 8601 format)'),
          endDate: z.string().optional().describe('End date (ISO 8601 format)'),
        })
        .describe('New campaign settings'),
    },
  },
  {
    name: 'ebay_pause_campaign',
    description: 'Pause a running marketing campaign. Campaign can be resumed later.',
    inputSchema: {
      campaignId: campaignIdSchema,
    },
  },
  {
    name: 'ebay_resume_campaign',
    description: 'Resume a paused marketing campaign. Campaign will start running again.',
    inputSchema: {
      campaignId: campaignIdSchema,
    },
  },
  {
    name: 'ebay_end_campaign',
    description: 'Permanently end a marketing campaign. Cannot be restarted after ending.',
    inputSchema: {
      campaignId: campaignIdSchema,
    },
  },
  {
    name: 'ebay_update_campaign_identification',
    description: 'Update campaign name or other identification details.',
    inputSchema: {
      campaignId: campaignIdSchema,
      updateData: z
        .object({
          campaignName: z.string().optional().describe('New campaign name'),
        })
        .describe('Campaign identification data to update'),
    },
  },

  // ========================================
  // AD OPERATIONS - BULK (8 tools)
  // ========================================
  {
    name: 'ebay_bulk_create_ads_by_inventory_reference',
    description:
      'Create multiple ads using Inventory API references (SKU/inventory item group key). CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          inventoryReferences: z
            .array(
              z.object({
                inventoryReferenceId: z.string().describe('SKU or inventory item group key'),
                inventoryReferenceType: z
                  .enum(['INVENTORY_ITEM', 'INVENTORY_ITEM_GROUP'])
                  .describe('Reference type'),
              })
            )
            .describe('Array of inventory references'),
          bidPercentage: z
            .string()
            .optional()
            .describe('Bid percentage for all ads (e.g., "10.5")'),
        })
        .describe('Bulk ad creation request'),
    },
  },
  {
    name: 'ebay_bulk_create_ads_by_listing_id',
    description:
      'Create multiple ads using listing IDs. Maximum 500 listings per call. Supports both CPS and CPC campaigns.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          requests: z
            .array(
              z.object({
                listingId: z.string().describe('eBay listing ID'),
                bidPercentage: z.string().optional().describe('Bid percentage (e.g., "10.5")'),
              })
            )
            .max(500)
            .describe('Array of ad requests (max 500)'),
        })
        .describe('Bulk ad creation request'),
    },
  },
  {
    name: 'ebay_bulk_delete_ads_by_inventory_reference',
    description: 'Delete multiple ads by inventory reference. CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          inventoryReferences: z
            .array(
              z.object({
                inventoryReferenceId: z.string().describe('SKU or inventory item group key'),
                inventoryReferenceType: z
                  .enum(['INVENTORY_ITEM', 'INVENTORY_ITEM_GROUP'])
                  .describe('Reference type'),
              })
            )
            .describe('Array of inventory references to delete'),
        })
        .describe('Bulk ad deletion request'),
    },
  },
  {
    name: 'ebay_bulk_delete_ads_by_listing_id',
    description: 'Delete multiple ads by listing ID. CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          listingIds: z.array(z.string()).describe('Array of listing IDs to delete'),
        })
        .describe('Bulk ad deletion request'),
    },
  },
  {
    name: 'ebay_bulk_update_ads_bid_by_inventory_reference',
    description:
      'Update bid percentages for multiple ads by inventory reference. CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          requests: z
            .array(
              z.object({
                inventoryReferenceId: z.string().describe('SKU or inventory item group key'),
                inventoryReferenceType: z
                  .enum(['INVENTORY_ITEM', 'INVENTORY_ITEM_GROUP'])
                  .describe('Reference type'),
                bidPercentage: z.string().describe('New bid percentage (e.g., "10.5")'),
              })
            )
            .describe('Array of bid update requests'),
        })
        .describe('Bulk bid update request'),
    },
  },
  {
    name: 'ebay_bulk_update_ads_bid_by_listing_id',
    description: 'Update bid percentages for multiple ads by listing ID. CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          requests: z
            .array(
              z.object({
                listingId: z.string().describe('eBay listing ID'),
                bidPercentage: z.string().describe('New bid percentage (e.g., "10.5")'),
              })
            )
            .describe('Array of bid update requests'),
        })
        .describe('Bulk bid update request'),
    },
  },
  {
    name: 'ebay_bulk_update_ads_status',
    description: 'Update status for multiple ads. CPC priority strategy campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          requests: z
            .array(
              z.object({
                adId: z.string().describe('Ad ID'),
                adStatus: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).describe('New ad status'),
              })
            )
            .describe('Array of status update requests'),
        })
        .describe('Bulk status update request'),
    },
  },
  {
    name: 'ebay_bulk_update_ads_status_by_listing_id',
    description:
      'Update status for multiple ads by listing ID. CPC priority strategy campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          requests: z
            .array(
              z.object({
                listingId: z.string().describe('eBay listing ID'),
                adStatus: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).describe('New ad status'),
              })
            )
            .describe('Array of status update requests'),
        })
        .describe('Bulk status update request'),
    },
  },

  // ========================================
  // AD OPERATIONS - SINGLE (9 tools)
  // ========================================
  {
    name: 'ebay_create_ad',
    description: 'Create a single ad in a campaign. Supports both CPS and CPC campaigns.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ad: z
        .object({
          listingId: z.string().describe('eBay listing ID'),
          bidPercentage: z.string().optional().describe('Bid percentage (e.g., "10.5")'),
          adGroupId: z
            .string()
            .optional()
            .describe('Ad group ID (required for manual targeting CPC campaigns)'),
        })
        .describe('Ad configuration'),
    },
  },
  {
    name: 'ebay_create_ads_by_inventory_reference',
    description: 'Create ads using Inventory API references. CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      ads: z
        .object({
          inventoryReferences: z
            .array(
              z.object({
                inventoryReferenceId: z.string().describe('SKU or inventory item group key'),
                inventoryReferenceType: z
                  .enum(['INVENTORY_ITEM', 'INVENTORY_ITEM_GROUP'])
                  .describe('Reference type'),
              })
            )
            .describe('Array of inventory references'),
          bidPercentage: z.string().optional().describe('Bid percentage for all ads'),
        })
        .describe('Ad creation request'),
    },
  },
  {
    name: 'ebay_get_ad',
    description: 'Get details of a specific ad in a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adId: adIdSchema,
    },
  },
  {
    name: 'ebay_get_ads',
    description: 'Get all ads for a campaign with optional filters.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupIds: z.string().optional().describe('Comma-separated ad group IDs to filter by'),
      adStatus: z.string().optional().describe('Filter by ad status: ACTIVE, PAUSED, or ARCHIVED'),
      limit: limitSchema,
      listingIds: z.string().optional().describe('Comma-separated listing IDs to filter by'),
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_get_ads_by_inventory_reference',
    description:
      'Get ads by inventory reference (SKU or inventory item group key). CPS campaigns only.',
    inputSchema: {
      campaignId: campaignIdSchema,
      inventoryReferenceId: z.string().describe('SKU or inventory item group key'),
      inventoryReferenceType: z
        .enum(['INVENTORY_ITEM', 'INVENTORY_ITEM_GROUP'])
        .describe('Reference type'),
    },
  },
  {
    name: 'ebay_get_ads_by_listing_id',
    description: 'Get ads by listing ID. Returns all ads for the specified listing.',
    inputSchema: {
      campaignId: campaignIdSchema,
      listingId: z.string().describe('eBay listing ID'),
    },
  },
  {
    name: 'ebay_delete_ad',
    description: 'Delete a specific ad from a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adId: adIdSchema,
    },
  },
  {
    name: 'ebay_clone_ad',
    description: 'Clone an ad within a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adId: adIdSchema,
    },
  },
  {
    name: 'ebay_update_ad_bid',
    description: 'Update the bid percentage for a specific ad.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adId: adIdSchema,
      bidPercentage: z.string().describe('New bid percentage (e.g., "10.5")'),
    },
  },

  // ========================================
  // AD GROUP MANAGEMENT (6 tools)
  // ========================================
  {
    name: 'ebay_create_ad_group',
    description:
      'Create an ad group for manual targeting in a CPC campaign. Required for CPC campaigns with manual targeting.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroup: z
        .object({
          name: z.string().describe('Ad group name'),
          defaultBid: z
            .object({
              amount: z.string().describe('Default bid amount'),
              currency: z.string().describe('Currency code (e.g., USD)'),
            })
            .optional()
            .describe('Default bid for keywords in this ad group'),
        })
        .describe('Ad group configuration'),
    },
  },
  {
    name: 'ebay_get_ad_group',
    description: 'Get details of a specific ad group.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
    },
  },
  {
    name: 'ebay_get_ad_groups',
    description: 'Get all ad groups for a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_clone_ad_group',
    description: 'Clone an ad group within a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
    },
  },
  {
    name: 'ebay_update_ad_group_bids',
    description: 'Update default bids for an ad group.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      updateData: z
        .object({
          defaultBid: z
            .object({
              amount: z.string().describe('New default bid amount'),
              currency: z.string().describe('Currency code'),
            })
            .describe('New default bid'),
        })
        .describe('Bid update data'),
    },
  },
  {
    name: 'ebay_update_ad_group_keywords',
    description: 'Update keywords for an ad group.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      updateData: z.record(z.unknown()).describe('Keyword update data'),
    },
  },

  // ========================================
  // KEYWORD MANAGEMENT (8 tools)
  // ========================================
  {
    name: 'ebay_create_keyword',
    description: 'Create a keyword for manual targeting in a CPC campaign ad group.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keyword: z
        .object({
          keywordText: z.string().describe('Keyword text'),
          matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).describe('Keyword match type'),
          bid: z
            .object({
              amount: z.string().describe('Bid amount'),
              currency: z.string().describe('Currency code'),
            })
            .optional()
            .describe('Keyword-specific bid (overrides ad group default)'),
        })
        .describe('Keyword configuration'),
    },
  },
  {
    name: 'ebay_get_keyword',
    description: 'Get details of a specific keyword.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keywordId: keywordIdSchema,
    },
  },
  {
    name: 'ebay_get_keywords',
    description: 'Get all keywords for a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupIds: z.string().optional().describe('Comma-separated ad group IDs to filter by'),
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_delete_keyword',
    description: 'Delete a specific keyword from a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keywordId: keywordIdSchema,
    },
  },
  {
    name: 'ebay_update_keyword_bid',
    description: 'Update the bid for a specific keyword.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keywordId: keywordIdSchema,
      bid: z
        .object({
          amount: z.string().describe('New bid amount'),
          currency: z.string().describe('Currency code'),
        })
        .describe('New bid'),
    },
  },
  {
    name: 'ebay_bulk_create_keywords',
    description:
      'Create multiple keywords in a campaign. Maximum recommended per call varies by eBay.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keywords: z
        .object({
          requests: z
            .array(
              z.object({
                keywordText: z.string().describe('Keyword text'),
                matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).describe('Match type'),
                adGroupId: z.string().optional().describe('Ad group ID'),
                bid: z
                  .object({
                    amount: z.string(),
                    currency: z.string(),
                  })
                  .optional(),
              })
            )
            .describe('Array of keyword creation requests'),
        })
        .describe('Bulk keyword creation request'),
    },
  },
  {
    name: 'ebay_bulk_delete_keywords',
    description: 'Delete multiple keywords from a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keywords: z
        .object({
          keywordIds: z.array(z.string()).describe('Array of keyword IDs to delete'),
        })
        .describe('Bulk keyword deletion request'),
    },
  },
  {
    name: 'ebay_bulk_update_keyword_bids',
    description: 'Update bids for multiple keywords.',
    inputSchema: {
      campaignId: campaignIdSchema,
      keywords: z
        .object({
          requests: z
            .array(
              z.object({
                keywordId: z.string().describe('Keyword ID'),
                bid: z
                  .object({
                    amount: z.string().describe('New bid amount'),
                    currency: z.string().describe('Currency code'),
                  })
                  .describe('New bid'),
              })
            )
            .describe('Array of bid update requests'),
        })
        .describe('Bulk keyword bid update request'),
    },
  },

  // ========================================
  // NEGATIVE KEYWORDS - CAMPAIGN LEVEL (8 tools)
  // ========================================
  {
    name: 'ebay_create_campaign_negative_keyword',
    description:
      'Create a campaign-level negative keyword. Prevents ads from showing for this keyword across entire campaign.',
    inputSchema: {
      negativeKeyword: z
        .object({
          keywordText: z.string().describe('Negative keyword text'),
          matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).describe('Match type'),
        })
        .describe('Negative keyword configuration'),
    },
  },
  {
    name: 'ebay_get_campaign_negative_keyword',
    description: 'Get details of a specific campaign-level negative keyword.',
    inputSchema: {
      negativeKeywordId: negativeKeywordIdSchema,
    },
  },
  {
    name: 'ebay_get_campaign_negative_keywords',
    description: 'Get all campaign-level negative keywords.',
    inputSchema: {
      campaignIds: z.string().optional().describe('Comma-separated campaign IDs to filter by'),
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_delete_campaign_negative_keyword',
    description: 'Delete a campaign-level negative keyword.',
    inputSchema: {
      negativeKeywordId: negativeKeywordIdSchema,
    },
  },
  {
    name: 'ebay_update_campaign_negative_keyword',
    description: 'Update a campaign-level negative keyword.',
    inputSchema: {
      negativeKeywordId: negativeKeywordIdSchema,
      updateData: z
        .object({
          keywordText: z.string().optional().describe('New keyword text'),
          matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).optional().describe('New match type'),
        })
        .describe('Negative keyword update data'),
    },
  },
  {
    name: 'ebay_bulk_create_campaign_negative_keywords',
    description: 'Create multiple campaign-level negative keywords.',
    inputSchema: {
      negativeKeywords: z
        .object({
          requests: z
            .array(
              z.object({
                campaignId: z.string().describe('Campaign ID'),
                keywordText: z.string().describe('Negative keyword text'),
                matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).describe('Match type'),
              })
            )
            .describe('Array of negative keyword creation requests'),
        })
        .describe('Bulk negative keyword creation request'),
    },
  },
  {
    name: 'ebay_bulk_update_campaign_negative_keywords',
    description: 'Update multiple campaign-level negative keywords.',
    inputSchema: {
      negativeKeywords: z
        .object({
          requests: z
            .array(
              z.object({
                negativeKeywordId: z.string().describe('Negative keyword ID'),
                keywordText: z.string().optional().describe('New keyword text'),
                matchType: z
                  .enum(['BROAD', 'PHRASE', 'EXACT'])
                  .optional()
                  .describe('New match type'),
              })
            )
            .describe('Array of update requests'),
        })
        .describe('Bulk negative keyword update request'),
    },
  },
  {
    name: 'ebay_bulk_delete_campaign_negative_keywords',
    description: 'Delete multiple campaign-level negative keywords.',
    inputSchema: {
      negativeKeywords: z
        .object({
          negativeKeywordIds: z
            .array(z.string())
            .describe('Array of negative keyword IDs to delete'),
        })
        .describe('Bulk negative keyword deletion request'),
    },
  },

  // ========================================
  // NEGATIVE KEYWORDS - AD GROUP LEVEL (8 tools)
  // ========================================
  {
    name: 'ebay_create_ad_group_negative_keyword',
    description:
      'Create an ad group-level negative keyword. Prevents ads in this ad group from showing for this keyword.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeyword: z
        .object({
          keywordText: z.string().describe('Negative keyword text'),
          matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).describe('Match type'),
        })
        .describe('Negative keyword configuration'),
    },
  },
  {
    name: 'ebay_get_ad_group_negative_keyword',
    description: 'Get details of a specific ad group-level negative keyword.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeywordId: negativeKeywordIdSchema,
    },
  },
  {
    name: 'ebay_get_ad_group_negative_keywords',
    description: 'Get all negative keywords for an ad group.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_delete_ad_group_negative_keyword',
    description: 'Delete an ad group-level negative keyword.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeywordId: negativeKeywordIdSchema,
    },
  },
  {
    name: 'ebay_update_ad_group_negative_keyword',
    description: 'Update an ad group-level negative keyword.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeywordId: negativeKeywordIdSchema,
      updateData: z
        .object({
          keywordText: z.string().optional().describe('New keyword text'),
          matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).optional().describe('New match type'),
        })
        .describe('Negative keyword update data'),
    },
  },
  {
    name: 'ebay_bulk_create_ad_group_negative_keywords',
    description: 'Create multiple ad group-level negative keywords.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeywords: z
        .object({
          requests: z
            .array(
              z.object({
                keywordText: z.string().describe('Negative keyword text'),
                matchType: z.enum(['BROAD', 'PHRASE', 'EXACT']).describe('Match type'),
              })
            )
            .describe('Array of negative keyword creation requests'),
        })
        .describe('Bulk negative keyword creation request'),
    },
  },
  {
    name: 'ebay_bulk_update_ad_group_negative_keywords',
    description: 'Update multiple ad group-level negative keywords.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeywords: z
        .object({
          requests: z
            .array(
              z.object({
                negativeKeywordId: z.string().describe('Negative keyword ID'),
                keywordText: z.string().optional().describe('New keyword text'),
                matchType: z
                  .enum(['BROAD', 'PHRASE', 'EXACT'])
                  .optional()
                  .describe('New match type'),
              })
            )
            .describe('Array of update requests'),
        })
        .describe('Bulk negative keyword update request'),
    },
  },
  {
    name: 'ebay_bulk_delete_ad_group_negative_keywords',
    description: 'Delete multiple ad group-level negative keywords.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
      negativeKeywords: z
        .object({
          negativeKeywordIds: z
            .array(z.string())
            .describe('Array of negative keyword IDs to delete'),
        })
        .describe('Bulk negative keyword deletion request'),
    },
  },

  // ========================================
  // TARGETING (3 tools)
  // ========================================
  {
    name: 'ebay_create_targeting',
    description: 'Create targeting configuration for a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      targeting: z.record(z.unknown()).describe('Targeting configuration'),
    },
  },
  {
    name: 'ebay_get_targeting',
    description: 'Get targeting configuration for a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
    },
  },
  {
    name: 'ebay_update_targeting',
    description: 'Update targeting configuration for a campaign.',
    inputSchema: {
      campaignId: campaignIdSchema,
      targeting: z.record(z.unknown()).describe('Updated targeting configuration'),
    },
  },

  // ========================================
  // SUGGESTIONS (2 tools)
  // ========================================
  {
    name: 'ebay_suggest_bids',
    description:
      'Get bid suggestions for an ad group. Helps optimize bid amounts based on competition.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
    },
  },
  {
    name: 'ebay_suggest_keywords',
    description:
      'Get keyword suggestions for an ad group. Returns relevant keywords based on listings.',
    inputSchema: {
      campaignId: campaignIdSchema,
      adGroupId: adGroupIdSchema,
    },
  },

  // ========================================
  // REPORTING (6 tools)
  // ========================================
  {
    name: 'ebay_create_report_task',
    description:
      'Create an asynchronous report generation task. Reports are generated in the background.',
    inputSchema: {
      reportTask: z
        .object({
          reportType: z
            .enum([
              'CAMPAIGN_PERFORMANCE_REPORT',
              'LISTING_PERFORMANCE_REPORT',
              'KEYWORD_PERFORMANCE_REPORT',
              'ACCOUNT_PERFORMANCE_REPORT',
            ])
            .describe('Type of report to generate'),
          campaignIds: z.array(z.string()).optional().describe('Campaign IDs to include in report'),
          dateFrom: z.string().describe('Start date for report data (ISO 8601 format)'),
          dateTo: z.string().describe('End date for report data (ISO 8601 format)'),
          marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Marketplace ID'),
          dimensions: z.array(z.string()).optional().describe('Report dimensions'),
          metrics: z.array(z.string()).optional().describe('Report metrics'),
        })
        .describe('Report task configuration'),
    },
  },
  {
    name: 'ebay_get_report_task',
    description: 'Get status and details of a specific report task.',
    inputSchema: {
      reportTaskId: reportTaskIdSchema,
    },
  },
  {
    name: 'ebay_get_report_tasks',
    description: 'Get all report tasks with optional filters.',
    inputSchema: {
      limit: limitSchema,
      offset: offsetSchema,
      reportTaskStatuses: z
        .string()
        .optional()
        .describe('Comma-separated status filters: PENDING, IN_PROGRESS, SUCCESS, FAILED'),
    },
  },
  {
    name: 'ebay_get_ad_report',
    description: 'Download a completed ad report by report ID.',
    inputSchema: {
      reportId: reportIdSchema,
    },
  },
  {
    name: 'ebay_get_ad_report_metadata',
    description:
      'Get metadata for all available report types. Returns dimensions, metrics, and filters.',
    inputSchema: {},
  },
  {
    name: 'ebay_get_ad_report_metadata_for_type',
    description: 'Get metadata for a specific report type.',
    inputSchema: {
      reportType: z
        .enum([
          'CAMPAIGN_PERFORMANCE_REPORT',
          'LISTING_PERFORMANCE_REPORT',
          'KEYWORD_PERFORMANCE_REPORT',
          'ACCOUNT_PERFORMANCE_REPORT',
        ])
        .describe('Report type'),
    },
  },

  // ========================================
  // PROMOTIONS - ITEM PROMOTION (9 tools)
  // ========================================
  {
    name: 'ebay_get_promotions',
    description:
      'Get all item promotions with optional filters. Returns order discounts, shipping discounts, etc.',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).optional().describe('Filter by marketplace ID'),
      promotionStatus: z
        .string()
        .optional()
        .describe('Filter by status: DRAFT, SCHEDULED, RUNNING, PAUSED, ENDED'),
      promotionType: z
        .string()
        .optional()
        .describe('Filter by type: ORDER_DISCOUNT, MARKDOWN_SALE, etc.'),
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_get_item_promotion',
    description: 'Get details of a specific item promotion.',
    inputSchema: {
      promotionId: promotionIdSchema,
    },
  },
  {
    name: 'ebay_create_item_promotion',
    description: 'Create a new item promotion (order discount, volume pricing, etc.).',
    inputSchema: {
      promotion: z
        .record(z.unknown())
        .describe('Promotion configuration with discountRules, inventoryCriterion, etc.'),
    },
  },
  {
    name: 'ebay_update_item_promotion',
    description: 'Update an existing item promotion.',
    inputSchema: {
      promotionId: promotionIdSchema,
      promotion: z.record(z.unknown()).describe('Updated promotion configuration'),
    },
  },
  {
    name: 'ebay_delete_item_promotion',
    description: 'Delete an item promotion.',
    inputSchema: {
      promotionId: promotionIdSchema,
    },
  },
  {
    name: 'ebay_pause_item_promotion',
    description: 'Pause a running item promotion. Can be resumed later.',
    inputSchema: {
      promotionId: promotionIdSchema,
    },
  },
  {
    name: 'ebay_resume_item_promotion',
    description: 'Resume a paused item promotion.',
    inputSchema: {
      promotionId: promotionIdSchema,
    },
  },
  {
    name: 'ebay_get_promotion_report',
    description: 'Get promotion performance report with sales and revenue data.',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      promotionStatus: z.string().optional().describe('Filter by promotion status'),
      promotionType: z.string().optional().describe('Filter by promotion type'),
      limit: limitSchema,
      offset: offsetSchema,
    },
  },
  {
    name: 'ebay_get_promotion_summary_report',
    description: 'Get summary report of promotion performance across all promotions.',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
  },

  // ========================================
  // RECOMMENDATION (1 tool - already exists)
  // ========================================
  {
    name: 'ebay_find_listing_recommendations',
    description:
      'Find listing recommendations for items. Returns suggestions to improve listing performance.',
    inputSchema: {
      listingIds: z
        .array(z.string())
        .optional()
        .describe('Array of listing IDs to get recommendations for'),
      filter: z.string().optional().describe('Filter criteria'),
      limit: limitSchema,
      offset: offsetSchema,
      marketplaceId: z.string().optional().describe('Marketplace ID'),
    },
  },
];
