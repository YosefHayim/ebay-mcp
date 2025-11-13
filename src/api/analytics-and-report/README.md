# Analytics and Report API

This directory contains the implementation of eBay's Sell Analytics API v1, which provides sales and traffic analytics, seller standards profiles, and customer service metrics.

## Implementation Status

✅ **COMPLETE** - All 4 OpenAPI endpoints implemented with 4 methods

## Files

- **`analytics.ts`** - AnalyticsApi class with all analytics and reporting methods

## API Coverage

### Traffic Reports (1 method)
- ✅ `getTrafficReport(dimension, filter, metric, sort)` - Get traffic report for listings with dimensions and metrics

### Seller Standards (2 methods)
- ✅ `findSellerStandardsProfiles()` - Get all seller standards profiles
- ✅ `getSellerStandardsProfile(program, cycle)` - Get specific seller standards profile

### Customer Service Metrics (1 method)
- ✅ `getCustomerServiceMetric(metricType, evaluationType, marketplaceId)` - Get customer service metrics

## OpenAPI Specification

Source: `docs/sell-apps/analytics-and-report/sell_analytics_v1_oas3.json`

## OAuth Scopes Required

- `https://api.ebay.com/oauth/api_scope/sell.analytics.readonly` - Read-only access to analytics data

## Key Concepts

### Traffic Reports
Track listing performance with various dimensions and metrics:
- **Dimensions**: Listing, Day, Week, Month
- **Metrics**: Click count, impression count, listing views
- **Filters**: Date ranges, listing IDs, marketplace IDs

### Seller Standards
eBay's seller performance evaluation program:
- **Programs**: CUSTOMER_SERVICE, SHIPPING_PERFORMANCE
- **Cycles**: Monthly evaluation periods (e.g., "2024_01")
- **Metrics**: Defect rates, late shipments, tracking uploaded

### Customer Service Metrics
Track customer service performance:
- **Metric Types**: INQUIRY_CLOSED_WITHOUT_SELLER_RESPONSE, RETURN_CLOSED_WITHOUT_SELLER_RESPONSE
- **Evaluation Types**: CURRENT, PROJECTED
- **Marketplace Scoped**: Metrics per marketplace

## Usage Examples

### Traffic Reports

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Get listing traffic for last 30 days
const traffic = await api.analytics.getTrafficReport(
  'LISTING',
  'creationDate:[2024-01-01..2024-01-31]',
  'CLICK_THROUGH_RATE,LISTING_IMPRESSION_TOTAL,LISTING_VIEWS_TOTAL',
  '-CLICK_THROUGH_RATE'  // Sort by CTR descending
);

// Get daily traffic breakdown
const dailyTraffic = await api.analytics.getTrafficReport(
  'DAY',
  'creationDate:[2024-01-01..2024-01-31],listingIds:[123456,789012]',
  'LISTING_IMPRESSION_TOTAL,LISTING_VIEWS_TOTAL'
);
```

### Seller Standards

```typescript
// Get all seller standards profiles
const profiles = await api.analytics.findSellerStandardsProfiles();

// Get specific profile for customer service in January 2024
const profile = await api.analytics.getSellerStandardsProfile(
  'CUSTOMER_SERVICE',
  '2024_01'
);

console.log(profile.standards);  // Metrics like transaction defect rate
console.log(profile.evaluationReason);  // Above/Below standard
```

### Customer Service Metrics

```typescript
// Get current inquiry response metrics for US marketplace
const metrics = await api.analytics.getCustomerServiceMetric(
  'INQUIRY_CLOSED_WITHOUT_SELLER_RESPONSE',
  'CURRENT',
  'EBAY_US'
);

console.log(metrics.dimensionMetrics);  // Metrics breakdown
console.log(metrics.evaluationCycle);  // Current evaluation period
```

## Traffic Report Dimensions

- `LISTING` - Report by listing ID
- `DAY` - Daily breakdown
- `WEEK` - Weekly breakdown
- `MONTH` - Monthly breakdown

## Traffic Report Metrics

- `CLICK_THROUGH_RATE` - Percentage of impressions that resulted in clicks
- `LISTING_IMPRESSION_TOTAL` - Total times listings were shown
- `LISTING_VIEWS_TOTAL` - Total listing page views
- `LISTING_IMPRESSION_SEARCH_RESULTS_PAGE` - Impressions in search results
- `LISTING_VIEWS_SOURCE_DIRECT` - Direct traffic to listings

## Seller Standards Programs

### CUSTOMER_SERVICE
Evaluates:
- Transaction defect rate
- Cases closed without seller resolution
- Low detailed seller ratings

### SHIPPING_PERFORMANCE
Evaluates:
- Late shipment rate
- Tracking uploaded on time
- Valid tracking provided

## Customer Service Metric Types

- `INQUIRY_CLOSED_WITHOUT_SELLER_RESPONSE` - Inquiries closed without response
- `RETURN_CLOSED_WITHOUT_SELLER_RESPONSE` - Returns closed without response

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:
- `ebay_get_traffic_report`
- `ebay_find_seller_standards_profiles`
- `ebay_get_seller_standards_profile`
- `ebay_get_customer_service_metric`

See `src/tools/definitions/analytics.ts` for complete tool definitions.

## Best Practices

### Traffic Analysis
- Monitor click-through rates to optimize listings
- Compare listing vs search impression sources
- Track weekly trends to identify seasonal patterns
- Filter by listing ID to analyze specific products

### Seller Standards
- Check profiles monthly to stay Above Standard
- Address defect rates proactively
- Upload tracking within handling time
- Respond to all buyer inquiries promptly

### Customer Service
- Monitor CURRENT metrics weekly
- Use PROJECTED metrics to forecast next evaluation
- Keep inquiry response rate above eBay's threshold
- Document all buyer communications
