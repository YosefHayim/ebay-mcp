# Listing Metadata API

This directory contains the implementation of eBay's Sell Metadata API v1, which provides marketplace-specific policies, regulations, and configurations for creating compliant listings.

## Implementation Status

✅ **COMPLETE** - All 22 OpenAPI endpoints implemented with 23 methods

## Files

- **`metadata.ts`** - MetadataApi class with all marketplace policy and configuration methods

## API Coverage

### Marketplace Policies (13 methods)
- ✅ `getAutomotivePartsCompatibilityPolicies(marketplaceId, filter)` - Get automotive parts compatibility requirements
- ✅ `getCategoryPolicies(marketplaceId, filter)` - Get category-specific policies
- ✅ `getExtendedProducerResponsibilityPolicies(marketplaceId, filter)` - Get EPR policies for eco-products
- ✅ `getItemConditionPolicies(marketplaceId, filter)` - Get allowed item conditions per category
- ✅ `getListingStructurePolicies(marketplaceId, filter)` - Get listing format requirements
- ✅ `getNegotiatedPricePolicies(marketplaceId, filter)` - Get Best Offer policies
- ✅ `getRegulatoryPolicies(marketplaceId, filter)` - Get regulatory compliance requirements
- ✅ `getReturnPolicies(marketplaceId, filter)` - Get return policy requirements
- ✅ `getShippingCostTypePolicies(marketplaceId, filter)` - Get shipping cost type policies
- ✅ `getTaskPolicies(marketplaceId, filter)` - Get task verification policies
- ✅ `getTakebackPolicies(marketplaceId, filter)` - Get product takeback policies
- ✅ `getProductAdoptionPolicies(marketplaceId, filter)` - Get product adoption policies
- ✅ `getProductCompliancePolicies(marketplaceId, filter)` - Get product compliance policies

### Product Safety & Labels (2 methods)
- ✅ `getHazardousMaterialsLabels(marketplaceId)` - Get hazmat labels and warnings
- ✅ `getProductSafetyLabels(marketplaceId)` - Get product safety labels

### Marketplace Configuration (8 methods)
- ✅ `getCountry(countryCode)` - Get country details
- ✅ `getCountries()` - Get all countries where eBay operates
- ✅ `getCurrency(currencyCode)` - Get currency details
- ✅ `getCurrencies()` - Get all supported currencies
- ✅ `getSalesTaxJurisdiction(countryCode, jurisdictionId)` - Get sales tax jurisdiction details
- ✅ `getSalesTaxJurisdictions(countryCode)` - Get all sales tax jurisdictions for a country
- ✅ `getMarketplace(marketplaceId)` - Get marketplace details
- ✅ `getMarketplaces()` - Get all eBay marketplaces

## OpenAPI Specification

Source: `docs/sell-apps/listing-metadata/sell_metadata_v1_oas3.json`

## OAuth Scopes Required

- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Read metadata for listing creation
- `https://api.ebay.com/oauth/api_scope/sell.inventory.readonly` - Read-only access

## Key Concepts

### Marketplace-Specific Policies
Each eBay marketplace (US, UK, DE, etc.) has unique policies and requirements. Metadata API provides these policies so sellers can create compliant listings.

### Category Policies
Different categories have different requirements:
- **Condition Policies**: Which conditions are allowed (New, Used, Refurbished)
- **Best Offer**: Whether Best Offer is supported
- **Returns**: Required return policies
- **Product Compliance**: Regulatory requirements (batteries, electronics, etc.)

### Regulatory Compliance
- **EPR (Extended Producer Responsibility)**: Environmental regulations for product waste
- **Hazardous Materials**: Shipping restrictions for dangerous goods
- **Product Safety**: Required safety labels and certifications

### Filters
Most policy endpoints support filtering by category ID to get category-specific requirements:
```
filter=categoryIds:{categoryId}
```

## Usage Examples

### Get Category Policies

```typescript
import { EbaySellerApi } from '@/api/index.js';

const api = new EbaySellerApi(config);
await api.initialize();

// Get policies for Electronics category (293) in US marketplace
const policies = await api.metadata.getCategoryPolicies(
  'EBAY_US',
  'categoryIds:{293}'
);

console.log(policies.categoryPolicies);  // Array of policies
// Check: bestOfferEnabled, conditionRequired, itemConditions, etc.
```

### Check Item Condition Requirements

```typescript
// Get allowed conditions for a category
const conditions = await api.metadata.getItemConditionPolicies(
  'EBAY_US',
  'categoryIds:{9355}'  // Clothing category
);

// Returns conditions like: NEW, NEW_WITH_TAGS, PRE_OWNED, etc.
console.log(conditions.itemConditionPolicies[0].categoryTreeNodeId);
console.log(conditions.itemConditionPolicies[0].itemConditions);
```

### Get Hazmat Requirements

```typescript
// Get hazardous materials labels for marketplace
const hazmatLabels = await api.metadata.getHazardousMaterialsLabels('EBAY_US');

// Returns labels like: BATTERY, FLAMMABLE, CORROSIVE, etc.
console.log(hazmatLabels.hazardousMaterialsLabels);
```

### Get Marketplace Configuration

```typescript
// Get all eBay marketplaces
const marketplaces = await api.metadata.getMarketplaces();

// Get specific marketplace details
const usMarketplace = await api.metadata.getMarketplace('EBAY_US');
console.log(usMarketplace.name);  // "United States"
console.log(usMarketplace.countryCode);  // "US"
console.log(usMarketplace.defaultCurrencyCode);  // "USD"

// Get all currencies
const currencies = await api.metadata.getCurrencies();

// Get all countries
const countries = await api.metadata.getCountries();
```

### Get Sales Tax Jurisdictions

```typescript
// Get all US sales tax jurisdictions (states)
const jurisdictions = await api.metadata.getSalesTaxJurisdictions('US');

// Get specific jurisdiction (California)
const caJurisdiction = await api.metadata.getSalesTaxJurisdiction('US', 'CA');
console.log(caJurisdiction.salesTaxJurisdictionId);  // "CA"
console.log(caJurisdiction.salesTaxJurisdictionName);  // "California"
```

### Check Regulatory Requirements

```typescript
// Get regulatory policies for a category
const regulatory = await api.metadata.getRegulatoryPolicies(
  'EBAY_US',
  'categoryIds:{31388}'  // Batteries category
);

// Check if batteries policy applies
console.log(regulatory.regulatoryPolicies);  // Contains battery regulations
```

### Extended Producer Responsibility (EPR)

```typescript
// Get EPR policies for electronics in Germany
const epr = await api.metadata.getExtendedProducerResponsibilityPolicies(
  'EBAY_DE',
  'categoryIds:{293}'
);

// Check if EPR registration required
console.log(epr.extendedProducerResponsibilityPolicies[0].isRequired);
```

## Common Policy Types

### Item Condition Policies
Defines allowed conditions for categories:
- NEW
- NEW_WITH_TAGS
- NEW_WITHOUT_TAGS
- PRE_OWNED
- REFURBISHED
- FOR_PARTS_OR_NOT_WORKING

### Listing Structure Policies
Defines listing format restrictions:
- Fixed Price only
- Auction only
- Both formats allowed

### Return Policies
Defines return requirements:
- Returns accepted required
- Returns accepted optional
- No returns allowed

### Best Offer Policies
Defines negotiated price options:
- Best Offer enabled
- Best Offer disabled

### Regulatory Policies
Defines compliance requirements:
- Battery policies
- Electronic waste (WEEE)
- Product safety certifications

## Related Tools

All methods are exposed as MCP tools with the prefix `ebay_`:

### Policy Tools
- `ebay_get_automotive_parts_compatibility_policies`
- `ebay_get_category_policies`
- `ebay_get_extended_producer_responsibility_policies`
- `ebay_get_item_condition_policies`
- `ebay_get_listing_structure_policies`
- `ebay_get_negotiated_price_policies`
- `ebay_get_regulatory_policies`
- `ebay_get_return_policies`
- `ebay_get_shipping_cost_type_policies`

### Label Tools
- `ebay_get_hazardous_materials_labels`
- `ebay_get_product_safety_labels`

### Configuration Tools
- `ebay_get_marketplace`
- `ebay_get_marketplaces`
- `ebay_get_country`
- `ebay_get_countries`
- `ebay_get_currency`
- `ebay_get_currencies`
- `ebay_get_sales_tax_jurisdiction`
- `ebay_get_sales_tax_jurisdictions`

See `src/tools/definitions/metadata.ts` for complete tool definitions.

## Best Practices

### Listing Creation
- Always check category policies before creating listings
- Verify allowed item conditions for your category
- Check if Best Offer is supported before enabling it
- Validate regulatory requirements for your products

### Marketplace Expansion
- Use getMarketplaces() to discover available markets
- Check marketplace-specific policies before listing
- Verify currency and tax jurisdiction requirements
- Review regulatory policies for international markets

### Compliance
- Check hazmat labels for shipping restricted items
- Review EPR requirements for eco-regulated products
- Verify product safety label requirements
- Stay updated on regulatory policy changes

### Performance
- Cache policy responses (they change infrequently)
- Use category filters to reduce response sizes
- Batch policy checks when creating multiple listings
