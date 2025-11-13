# Marketing and Promotions API

This directory contains the implementation of eBay's Sell Marketing API v1 and Sell Recommendation API v1, which manage PLA (Promoted Listings Advanced) campaigns, ads, keywords, and promotions.

## Implementation Status

✅ **COMPLETE** - All 63 Marketing API + 1 Recommendation API endpoints implemented with 76 methods

## Files

- **`marketing.ts`** - MarketingApi class with 76 methods for campaigns, ads, keywords, targeting, and promotions
- **`recommendation.ts`** - RecommendationApi class with listing optimization recommendations

## API Coverage

### Campaign Management (9 methods)
- ✅ `getCampaigns(status, marketplace, limit)` - Get all campaigns
- ✅ `getCampaign(campaignId)` - Get specific campaign
- ✅ `getCampaignByName(name)` - Get campaign by name
- ✅ `createCampaign(campaign)` - Create new CPC/CPS campaign
- ✅ `cloneCampaign(campaignId, data)` - Clone existing campaign
- ✅ `pauseCampaign(campaignId)` - Pause active campaign
- ✅ `resumeCampaign(campaignId)` - Resume paused campaign
- ✅ `endCampaign(campaignId)` - End campaign permanently
- ✅ `updateCampaignIdentification(campaignId, data)` - Update campaign name/details

### Ad Operations - Bulk (8 methods)
- ✅ `bulkCreateAdsByInventoryReference(campaignId, ads)` - Bulk create ads (up to 500)
- ✅ `bulkCreateAdsByListingId(campaignId, ads)` - Bulk create ads by listing ID
- ✅ `bulkDeleteAdsByInventoryReference(campaignId, ads)` - Bulk delete ads
- ✅ `bulkDeleteAdsByListingId(campaignId, ads)` - Bulk delete by listing ID
- ✅ `bulkUpdateAdsBidByInventoryReference(campaignId, ads)` - Bulk update bids
- ✅ `bulkUpdateAdsBidByListingId(campaignId, ads)` - Bulk update bids by listing
- ✅ `bulkUpdateAdsStatus(campaignId, ads)` - Bulk change ad status
- ✅ `bulkUpdateAdsStatusByListingId(campaignId, ads)` - Bulk status by listing

### Ad Operations - Single (10 methods)
- ✅ `createAd(campaignId, ad)` - Create single ad
- ✅ `createAdsByInventoryReference(campaignId, ads)` - Create ads by inventory
- ✅ `getAd(campaignId, adId)` - Get specific ad
- ✅ `getAds(campaignId, filters)` - Get all ads with filters
- ✅ `getAdsByInventoryReference(campaignId, ref)` - Get ads by inventory ref
- ✅ `getAdsByListingId(campaignId, listingId)` - Get ads by listing ID
- ✅ `deleteAd(campaignId, adId)` - Delete single ad
- ✅ `cloneAd(campaignId, adId, data)` - Clone ad to another campaign
- ✅ `updateBid(campaignId, adId, bid)` - Update ad bid percentage

### Ad Group Management (6 methods)
- ✅ `createAdGroup(campaignId, group)` - Create ad group (for CPC campaigns)
- ✅ `getAdGroup(campaignId, groupId)` - Get specific ad group
- ✅ `getAdGroups(campaignId, filters)` - Get all ad groups
- ✅ `cloneAdGroup(campaignId, groupId, data)` - Clone ad group
- ✅ `updateAdGroupBids(campaignId, groupId, bids)` - Update all bids in group
- ✅ `updateAdGroupKeywords(campaignId, groupId, keywords)` - Update keywords

### Keyword Management (8 methods)
- ✅ `createKeyword(campaignId, groupId, keyword)` - Create keyword
- ✅ `getKeyword(campaignId, groupId, keywordId)` - Get specific keyword
- ✅ `getKeywords(campaignId, groupId, filters)` - Get all keywords
- ✅ `deleteKeyword(campaignId, groupId, keywordId)` - Delete keyword
- ✅ `updateKeywordBid(campaignId, groupId, keywordId, bid)` - Update keyword bid
- ✅ `bulkCreateKeywords(campaignId, groupId, keywords)` - Bulk create keywords
- ✅ `bulkDeleteKeywords(campaignId, groupId, keywords)` - Bulk delete keywords
- ✅ `bulkUpdateKeywordBids(campaignId, groupId, bids)` - Bulk update keyword bids

### Negative Keywords - Campaign Level (8 methods)
- ✅ `createNegativeKeyword(campaignId, keyword)` - Create negative keyword
- ✅ `getNegativeKeyword(campaignId, keywordId)` - Get specific negative keyword
- ✅ `getNegativeKeywords(campaignId, filters)` - Get all negative keywords
- ✅ `deleteNegativeKeyword(campaignId, keywordId)` - Delete negative keyword
- ✅ `updateNegativeKeyword(campaignId, keywordId, keyword)` - Update negative keyword
- ✅ `bulkCreateNegativeKeywords(campaignId, keywords)` - Bulk create negative keywords
- ✅ `bulkUpdateNegativeKeywords(campaignId, keywords)` - Bulk update negative keywords
- ✅ `bulkDeleteNegativeKeywords(campaignId, keywords)` - Bulk delete negative keywords

### Negative Keywords - Ad Group Level (8 methods)
- ✅ `createNegativeKeywordForAdGroup(groupId, keyword)` - Create negative keyword for ad group
- ✅ `getNegativeKeywordForAdGroup(groupId, keywordId)` - Get ad group negative keyword
- ✅ `getNegativeKeywordsForAdGroup(groupId, filters)` - Get all ad group negative keywords
- ✅ `deleteNegativeKeywordForAdGroup(groupId, keywordId)` - Delete ad group negative keyword
- ✅ `updateNegativeKeywordForAdGroup(groupId, keywordId, keyword)` - Update ad group negative keyword
- ✅ `bulkCreateNegativeKeywordsForAdGroup(groupId, keywords)` - Bulk create for ad group
- ✅ `bulkUpdateNegativeKeywordsForAdGroup(groupId, keywords)` - Bulk update for ad group
- ✅ `bulkDeleteNegativeKeywordsForAdGroup(groupId, keywords)` - Bulk delete for ad group

### Targeting (3 methods)
- ✅ `createTargeting(campaignId, targeting)` - Create targeting criteria
- ✅ `getTargeting(campaignId)` - Get campaign targeting
- ✅ `updateTargeting(campaignId, targeting)` - Update targeting criteria

### Suggestions (2 methods)
- ✅ `suggestBids(campaignId, groupId)` - Get bid suggestions
- ✅ `suggestKeywords(campaignId, groupId, data)` - Get keyword suggestions

### Reporting (5 methods)
- ✅ `createReportTask(task)` - Create async report generation task
- ✅ `getReportTask(taskId)` - Get report task status
- ✅ `getReportTasks(filters)` - Get all report tasks
- ✅ `getAdReport(dimension, metric, dates)` - Get ad performance report
- ✅ `getAdReportMetadata()` - Get available report metrics
- ✅ `getAdReportMetadataForReportType(type)` - Get metrics for report type

### Promotions - Item Promotion (9 methods)
- ✅ `getPromotions(marketplace, limit)` - Get all item promotions
- ✅ `getItemPromotion(promotionId)` - Get specific promotion
- ✅ `createPromotion(promotion)` - Create sale/markdown promotion
- ✅ `updateItemPromotion(promotionId, promotion)` - Update promotion
- ✅ `deleteItemPromotion(promotionId)` - Delete promotion
- ✅ `pauseItemPromotion(promotionId)` - Pause active promotion
- ✅ `resumeItemPromotion(promotionId)` - Resume paused promotion
- ✅ `getPromotionReport(marketplace, filters)` - Get promotion performance report
- ✅ `getPromotionSummaryReport(marketplace)` - Get promotion summary

### Recommendation API (1 method)
- ✅ `findListingRecommendations(listingIds, marketplace)` - Get listing optimization tips

## OpenAPI Specifications

- Marketing: `docs/sell-apps/markeitng-and-promotions/sell_marketing_v1_oas3.json`
- Recommendation: `docs/sell-apps/markeitng-and-promotions/sell_recommendation_v1_oas3.json`

## OAuth Scopes Required

- `https://api.ebay.com/oauth/api_scope/sell.marketing` - Manage campaigns, ads, and promotions
- `https://api.ebay.com/oauth/api_scope/sell.marketing.readonly` - Read-only access
- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Required for ad operations

## Key Concepts

### Campaign Types

#### CPC (Cost Per Click)
- Keyword-based advertising
- Pay when shoppers click your ad
- More control over targeting
- Requires ad groups and keywords

#### CPS (Cost Per Sale)
- Automatic targeting by eBay
- Pay percentage of sale price
- Simpler setup, no keywords needed
- eBay optimizes ad placement

### Campaign Structure

```
Campaign (CPC)
├── Ad Group 1
│   ├── Ads (listings)
│   ├── Keywords
│   └── Negative Keywords
├── Ad Group 2
│   ├── Ads (listings)
│   ├── Keywords
│   └── Negative Keywords
└── Campaign Negative Keywords
```

### Keywords
- **Broad Match**: Reaches wider audience (e.g., "vintage camera" matches "old camera lens")
- **Phrase Match**: More specific (e.g., "vintage camera" matches "buy vintage camera")
- **Exact Match**: Precise targeting (e.g., [vintage camera] only matches "vintage camera")

### Negative Keywords
- Exclude searches you don't want (e.g., "broken", "parts", "repair")
- Can be set at campaign or ad group level
- Prevents wasted ad spend on irrelevant searches

### Bid Strategies
- **Manual Bidding**: Set specific bid percentage per ad/keyword
- **Suggested Bids**: eBay provides recommendations based on competition
- **Bid Range**: Typically 2%-100% of item price

## Usage Examples

### Create CPC Campaign

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Create CPC campaign
const campaign = await api.marketing.createCampaign({
  campaignName: 'Electronics Q1 2024',
  marketplaceId: 'EBAY_US',
  campaignType: 'COST_PER_CLICK',
  campaignStatus: 'RUNNING',
  budget: {
    amount: {
      value: '500.00',
      currency: 'USD'
    },
    budgetType: 'DAILY'
  }
});

// Create ad group
const adGroup = await api.marketing.createAdGroup(campaign.campaignId, {
  name: 'Cameras',
  defaultBid: {
    value: '0.50',
    currency: 'USD'
  }
});

// Add keywords
await api.marketing.bulkCreateKeywords(campaign.campaignId, adGroup.adGroupId, [
  { keywordText: 'vintage camera', matchType: 'BROAD' },
  { keywordText: '"canon camera"', matchType: 'PHRASE' },
  { keywordText: '[nikon d850]', matchType: 'EXACT' }
]);

// Add ads
await api.marketing.bulkCreateAdsByListingId(campaign.campaignId, {
  adGroupId: adGroup.adGroupId,
  requests: [
    { listingId: '123456789', bidPercentage: '5.0' },
    { listingId: '987654321', bidPercentage: '7.5' }
  ]
});
```

### Create Item Promotion

```typescript
// Create 20% off sale
const promotion = await api.marketing.createPromotion({
  name: 'Summer Sale 2024',
  marketplaceId: 'EBAY_US',
  promotionType: 'MARKDOWN_SALE',
  discountRules: [{
    discountType: 'PERCENTAGE',
    discountPercentage: '20',
    inventoryCriteria: {
      inventoryCriterionType: 'INVENTORY_ANY',
      inventoryItems: [{
        inventoryReferenceId: 'SKU-001',
        inventoryReferenceType: 'SKU'
      }]
    }
  }],
  startDate: '2024-06-01T00:00:00.000Z',
  endDate: '2024-08-31T23:59:59.999Z'
});
```

### Get Performance Reports

```typescript
// Get campaign performance
const report = await api.marketing.getAdReport(
  'campaign',
  'click,impression,cost',
  '2024-01-01T00:00:00.000Z',
  '2024-01-31T23:59:59.999Z'
);

// Get keyword suggestions
const keywords = await api.marketing.suggestKeywords(
  campaignId,
  adGroupId,
  { adIds: ['ad-1', 'ad-2'] }
);
```

## Bulk Operations Limits

- **Ads**: Up to 500 per bulk request
- **Keywords**: Up to 500 per bulk request
- **Negative Keywords**: Up to 500 per bulk request

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:
- `ebay_create_campaign`
- `ebay_get_campaigns`
- `ebay_create_ad_group`
- `ebay_bulk_create_ads_by_listing_id`
- `ebay_create_keyword`
- `ebay_suggest_keywords`
- `ebay_create_negative_keyword`
- `ebay_get_ad_report`
- `ebay_create_item_promotion`
- And 67+ more marketing tools...

See `src/tools/definitions/marketing.ts` for complete tool definitions.

## Best Practices

### Campaign Management
- Start with suggested bids, then optimize based on performance
- Use negative keywords to filter irrelevant traffic
- Monitor daily budget to control costs
- Pause underperforming campaigns/ad groups

### Keyword Strategy
- Use broad match for discovery, exact match for high-converting terms
- Add negative keywords for terms that don't convert
- Monitor search term reports to find new opportunities

### Promotions
- Schedule promotions during peak shopping periods
- Test different discount levels (15%, 20%, 25%)
- Use inventory criteria to target specific items
- Track performance with promotion reports

### Performance Optimization
- Check reports weekly
- Adjust bids based on ROI
- A/B test different ad groups
- Optimize product titles/photos for better click-through rates
