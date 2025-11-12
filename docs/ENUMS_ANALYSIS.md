# eBay API Enums Analysis

## Overview

This document catalogs all enum types used across the eBay Sell APIs and identifies which have been implemented in the MCP server.

## Summary Statistics

- **Total enum types found**: 180+
- **Implemented in ebay-enums.ts**: 33 core enums (updated from 22)
- **Currently used in tool definitions**: 19 tool schemas using native enums (23 schema objects updated)
- **Test coverage**: 86 tests (49 enum structure + 37 schema validation)
- **Missing**: 147+ specialized enums (down from 158+)

## Implemented Enums

The following enums have been implemented in `src/types/ebay-enums.ts`:

### Core Business Enums
1. **MarketplaceId** - 40 marketplace identifiers (EBAY_US, EBAY_GB, etc.)
2. **Condition** - 17 item condition values
3. **FormatType** - 2 listing formats (AUCTION, FIXED_PRICE)
4. **OrderPaymentStatus** - 5 payment statuses
5. **CampaignStatus** - 9 campaign lifecycle statuses

### Policy Enums
6. **RefundMethod** - 2 refund types
7. **ReturnMethod** - 2 return handling methods
8. **ReturnShippingCostPayer** - 2 options (BUYER, SELLER)
9. **ShippingCostType** - 3 shipping calculation types
10. **ShippingOptionType** - 2 shipping types (DOMESTIC, INTERNATIONAL)
11. **CategoryType** - 2 category classifications
12. **PaymentMethodType** - 6 payment options

### Fulfillment & Inventory Enums
13. **LineItemFulfillmentStatus** - 3 fulfillment statuses
14. **OfferStatus** - 2 offer states
15. **ListingStatus** - 4 listing states

### Compliance & Standards
16. **ComplianceType** - 5 compliance issue types

### Measurement Units
17. **TimeDurationUnit** - 9 time units
18. **WeightUnit** - 4 weight measurements
19. **LengthUnit** - 4 length measurements

### Localization
20. **LanguageCode** - 13 ISO 639-1 language codes
21. **CurrencyCode** - 14 ISO 4217 currency codes

## Missing Enums by API Domain

### Account Management (28 missing)
- **CustomPolicyTypeEnum** - Custom policy types
- **ProgramTypeEnum** - Seller program types
- **SubscriptionTypeEnum** - Subscription types
- **SubscriptionStatusEnum** - Subscription statuses
- **RecipientAccountReferenceTypeEnum** - Payment account references
- **RegionTypeEnum** - Geographic region types
- **CountryCodeEnum** - ISO 3166 country codes

### Inventory Management (15 missing)
- **PackageTypeEnum** - Package types for shipping
- **AvailabilityTypeEnum** - Stock availability statuses
- **LocaleEnum** - Content localization (partially implemented as LanguageCode)
- **MarketplaceEnum** - Alternative marketplace enum
- **SoldOnEnum** - Where item was sold
- **CompatibilityTypeEnum** - Product compatibility types
- **CompatibleVehicleTypeEnum** - Vehicle compatibility
- **ListingDurationEnum** - Listing duration options
- **MinimumAdvertisedPriceHandlingEnum** - MAP handling
- **ShippingServiceTypeEnum** - Shipping service types
- **ResponsiblePersonTypeEnum** - Regulatory responsibility

### Order Management / Fulfillment (20 missing)
- **LineItemFulfillmentStatusEnum** - Extended fulfillment states
- **CancelRequestStateEnum** - Cancellation request states
- **CancelStateEnum** - Order cancellation states
- **PaymentStatusEnum** - Extended payment statuses
- **RefundStatusEnum** - Refund processing statuses
- **ReasonForRefundEnum** - Refund reason codes
- **DisputeStateEnum** - Dispute lifecycle states
- **DisputeReasonEnum** - Dispute reason codes
- **MonetaryTransactionTypeEnum** - Transaction types
- **MonetaryTransactionReasonEnum** - Transaction reasons
- **EbayVaultFulfillmentTypeEnum** - eBay Vault fulfillment
- **CollectionMethodEnum** - How items are collected
- **AuthenticityVerificationStatusEnum** - Authentication status
- **AuthenticityVerificationReasonEnum** - Authentication reasons
- **AppointmentStatusEnum** - Appointment scheduling status
- **AppointmentTypeEnum** - Appointment types
- **AppointmentWindowEnum** - Time windows for appointments

### Marketing & Promotions (35 missing)
- **AdGroupStatusEnum** - Ad group lifecycle states
- **AdStatusEnum** - Individual ad states
- **AdRateStrategyEnum** - Bidding rate strategies
- **AlertTypeEnum** - Campaign alert types
- **AspectKeyEnum** - Product aspect keys
- **BiddingStrategyEnum** - Auction bidding strategies
- **BudgetStatusEnum** - Campaign budget states
- **CampaignTargetingTypeEnum** - Targeting options
- **CategoryScopeEnum** - Category targeting scope
- **ChannelEnum** - Marketing channels
- **CriterionTypeEnum** - Targeting criterion types
- **DimensionKeyEnum** - Analytics dimensions
- **ExclusionsEnum** - What to exclude from campaigns
- **FundingModelEnum** - How campaigns are funded (CPC, CPS)
- **InventoryReferenceTypeEnum** - Inventory item references
- **KeywordStatusEnum** - Keyword activation states
- **MatchTypeEnum** - Keyword match types
- **MetricEnum** - Performance metrics
- **NegativeKeywordMatchTypeEnum** - Negative keyword matching
- **NegativeKeywordStatusEnum** - Negative keyword states
- **TargetingMetricsEnum** - Targeting performance metrics
- **AdvertisingProgramEnum** - Available ad programs
- **SellerIneligibleReasonEnum** - Why seller can't use ads
- **PromotionStatusEnum** - Promotion lifecycle states
- **PromotionTypeEnum** - Types of promotions
- **CouponTypeEnum** - Coupon types
- **InventoryCriterionEnum** - Inventory selection criteria
- **ItemMarkdownStatusEnum** - Markdown status
- **PromotionPriorityEnum** - Promotion priority levels
- **PromotionSelectModeEnum** - How items are selected
- **OfferTypeEnum** - Offer type classifications
- **ItemSelectModeEnum** - Item selection modes
- **ItemSortEnum** - Item sorting options

### Analytics & Reports (10 missing)
- **DimensionTypeEnum** - Report dimension types
- **BenchmarkTypeEnum** - Performance benchmarks
- **EvaluationTypeEnum** - Evaluation criteria
- **DataTypeEnum** - Report data types
- **ReportFormatEnum** - Report output formats
- **ReportTypeEnum** - Types of reports
- **TaskStatusEnum** - Report generation status
- **AdditionalRecordEnum** - Additional record types

### Communication (25 missing)
- **FeedbackRatingTypeEnum** - Feedback rating types
- **FeedbackRatingValuesEnum** - Feedback rating values
- **FeedbackRatingValueTypeEnum** - Rating value types
- **FeedbackStateEnum** - Feedback lifecycle states
- **FeedbackStarTypeEnum** - Star rating types
- **FeedbackCommentStateEnum** - Comment states
- **FeedbackAggregationTypeEnum** - Aggregation methods
- **OrderLineItemAttributesEnum** - Line item attributes
- **ThresholdTypeEnum** - Threshold types
- **UserAttributeEnum** - User attributes
- **UserRoleEnum** - User roles
- **ActorEnum** - Who performed action
- **ContextEnum** - Message context
- **DestinationStatusEnum** - Message destination status
- **ResponseTypeEnum** - Response types
- **SellerDecisionEnum** - Seller's decision
- **SellerResponseEnum** - Seller's response
- **ComplaintTypeEnum** - Complaint categories
- **OutcomeEnum** - Negotiation outcomes
- **UserStatusEnum** - User account status

### Metadata & Regulatory (30 missing)
- **ExtendedProducerResponsibilityEnum** - EPR compliance
- **RegulatoryAttributeEnum** - Regulatory attributes
- **ProductIdentiferEnabledEnum** - Product ID requirements
- **AdFormatEnabledEnum** - Ad format availability
- **ClassifiedAdBestOfferEnabledEnum** - Best offer enabled
- **ClassifiedAdPaymentMethodEnabledEnum** - Payment methods
- **CardinalityEnum** - Attribute cardinality
- **CompatibilityTypeEnum** - Compatibility categories
- **DescriptorUsageEnum** - How descriptors are used
- **DurationEnum** - Listing duration
- **GenericUsageEnum** - Generic usage types
- **GeographicExposureEnum** - Geographic visibility
- **ListingTypeEnum** - Listing type classifications
- **ModeEnum** - Operating modes
- **UsageEnum** - Usage types
- **SoldFormatEnum** - Sold listing formats
- **TaxIdentifierTypeEnum** - Tax ID types
- **TaxTypeEnum** - Tax types
- **EvidenceTypeEnum** - Evidence for disputes/VERO
- **VeroReportedItemStatusEnum** - VERO report statuses
- **VeroReportStatusEnum** - VERO report processing status
- **WorldRegionEnum** - World regions

### Other Specialized Enums (25 missing)
- **AccountTypeEnum** - Individual vs Business
- **ActivityEnum** - Activity types
- **AudienceTypeEnum** - Target audience types
- **ConsignTypeEnum** - Consignment types
- **DayOfWeekEnum** - Days of week
- **EmailCampaignStatusEnum** - Email campaign states
- **FormatTypeEnum** (variations) - Extended format types
- **IncotermEnum** - International commercial terms
- **KeyEnum** - Key types
- **LanguageEnum** (extended) - Additional languages
- **LiBatteryTypeEnum** - Lithium battery types
- **PackageStatusEnum** - Package tracking status
- **PaymentEnum** - Payment types
- **PaymentInstrumentBrandEnum** - Payment card brands
- **PickUpTimeTypeEnum** - Pickup time options
- **ProtectionStatusEnum** - Buyer protection status
- **ProtocolEnum** - Communication protocols
- **RatingAdjustmentTypeEnum** - Rating adjustment types
- **RatingTypeEnum** - Rating categories
- **ScheduleDateTypeEnum** - Schedule date types
- **ScopeEnum** - Authorization scopes
- **StatusEnum** (generic) - Generic status values
- **StoreTypeEnum** - eBay store types
- **TranslationContextEnum** - Translation context types
- **CycleTypeEnum** - Evaluation cycle types
- **ProgramEnum** - Program types
- **StandardsLevelEnum** - Seller standards levels

## Current Usage in Project

### Tool Definitions (`src/tools/tool-definitions.ts`)
Currently, enums are referenced as example strings in descriptions:
```typescript
marketplaceId: z.string().optional().describe('eBay marketplace ID (e.g., EBAY_US)')
```

### Recommendation: Enhanced Type Safety

**Before** (Current):
```typescript
marketplaceId: z.string().optional()
```

**After** (Recommended):
```typescript
import { MarketplaceId } from '@/types/ebay-enums.js';

marketplaceId: z.nativeEnum(MarketplaceId).optional()
```

This provides:
1. **Auto-completion** in IDEs
2. **Type safety** at compile time
3. **Runtime validation** via Zod
4. **Better documentation** with actual enum values

## Implementation Priority

### High Priority (Immediate Use)
1. ✅ **MarketplaceId** - Used in 10+ tool definitions
2. ✅ **Condition** - Required for inventory items
3. ✅ **FormatType** - Required for offers
4. ✅ **CampaignStatus** - Marketing operations
5. ✅ **OrderPaymentStatus** - Fulfillment operations

### Medium Priority (Frequently Referenced)
6. **LineItemFulfillmentStatus** - Order tracking
7. **FundingModelEnum** - Marketing campaigns (CPC vs CPS)
8. **KeywordStatusEnum** - Keyword management
9. **MatchTypeEnum** - Search optimization
10. **DisputeStateEnum** - Dispute handling
11. **ReasonForRefundEnum** - Refund processing
12. **ComplianceTypeEnum** - Compliance checking
13. **PromotionTypeEnum** - Promotion management

### Low Priority (Specialized Use Cases)
- Regulatory enums (EPR, regulatory attributes)
- Advanced marketing metrics
- Specialized feedback aggregation
- VERO reporting enums

## How to Add New Enums

When adding a new enum to `src/types/ebay-enums.ts`:

1. **Find the eBay documentation**:
   ```
   https://developer.ebay.com/api-docs/sell/[api]/types/[prefix]:[EnumName]
   ```

2. **Extract all values** with descriptions

3. **Add to ebay-enums.ts** with JSDoc:
   ```typescript
   /**
    * Brief description
    *
    * Reference: [URL]
    */
   export enum EnumName {
     /** Description */
     VALUE_ONE = 'VALUE_ONE',

     /** Description */
     VALUE_TWO = 'VALUE_TWO'
   }
   ```

4. **Update validation schemas** in `src/utils/`:
   ```typescript
   import { EnumName } from '@/types/ebay-enums.js';

   const schema = z.object({
     field: z.nativeEnum(EnumName)
   });
   ```

5. **Update tool definitions** in `src/tools/tool-definitions.ts`:
   ```typescript
   import { zodToJsonSchema } from 'zod-to-json-schema';
   import { EnumName } from '@/types/ebay-enums.js';

   // In tool definition
   inputSchema: zodToJsonSchema(
     z.object({
       field: z.nativeEnum(EnumName)
     })
   )
   ```

## Enum Namespaces in eBay Documentation

eBay uses prefixes to organize enums:

- **api:** - General API enums (account, fulfillment)
- **ba:** - Base types (marketplace, currency, time)
- **bas:** - Base seller types
- **br:** - Browse API types
- **cmlib:** - Commerce library types
- **com:** - Commerce types (compliance)
- **fdb:** - Feedback types
- **plr:** - Promoted Listings reports
- **pls:** - Promoted Listings standard
- **plser:** - Promoted Listings seller eligibility
- **sel:** - Sell API types
- **slr:** - Seller types (inventory, listing)
- **sme:** - Seller marketing engine
- **sol:** - Seller online
- **ssp:** - Seller standards profile

## OpenAPI Type References

Enums in the OpenAPI specs are referenced with:
```
For implementation help, refer to <a href='https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum'>eBay API documentation</a>
```

## Next Steps

1. ✅ Created `src/types/ebay-enums.ts` with 33 core enums (updated from 22)
2. ✅ Updated Zod schemas in `src/tools/schemas.ts` to use native enums (23 schemas updated)
3. ✅ Updated tool definitions to reference enum types (19 occurrences updated)
4. ✅ Added remaining high-priority enums (11 additional enums: DepositType, PublishStatus, RegionType, ExtendedProducerResponsibilityEnum, and 7 more)
5. ⏳ Generate enum helper functions (optional enhancement)
6. ✅ Added comprehensive enum validation tests (49 enum structure tests + 37 schema validation tests = 86 total tests)

## Benefits of Using Enums

### Type Safety
```typescript
// ❌ Current - any string accepted
function getOrders(marketplace: string) { ... }
getOrders("EBAY_XX"); // No error, but invalid

// ✅ With enum - only valid values
function getOrders(marketplace: MarketplaceId) { ... }
getOrders(MarketplaceId.EBAY_US); // ✓
getOrders("EBAY_XX"); // ✗ Compile error
```

### Auto-completion
IDEs can suggest valid enum values as you type.

### Runtime Validation
Zod validates enum values at runtime:
```typescript
const schema = z.object({
  marketplace: z.nativeEnum(MarketplaceId)
});

schema.parse({ marketplace: "INVALID" }); // Throws error
```

### Documentation
Enum values are self-documenting and discoverable.

### Refactoring Safety
Changing enum values is safe with TypeScript's type checking.

## References

- [eBay Sell Account API Types](https://developer.ebay.com/api-docs/sell/account/types/api:CategoryTypeEnum)
- [eBay Sell Inventory API Types](https://developer.ebay.com/api-docs/sell/inventory/types/slr:ConditionEnum)
- [eBay Sell Fulfillment API Types](https://developer.ebay.com/api-docs/sell/fulfillment/types/sel:OrderPaymentStatusEnum)
- [eBay Sell Marketing API Types](https://developer.ebay.com/api-docs/sell/marketing/types/pls:CampaignStatusEnum)
- [OpenAPI Specification Format](https://github.com/OAI/OpenAPI-Specification)
