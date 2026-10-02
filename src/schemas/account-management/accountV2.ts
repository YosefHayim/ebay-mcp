import { MarketplaceId } from '@/types/ebayEnums.js';
import { z } from '@/utils/effectSchema.js';

/**
 * Account API v2 Schemas
 *
 * Effect-backed tool/endpoint input schemas for rate tables, payout settings,
 * combined shipping rules, and user preferences. Request bodies mirror the
 * generated `sellAccountV2Oas3` DTOs; enum fields stay strings and list their
 * eBay values in the description.
 */

const nonempty = z.string().min(1).regex(/\S/, 'Must contain a non-whitespace character');

const marketplaceId = z
  .nativeEnum(MarketplaceId)
  .describe('eBay marketplace sent as the required X-EBAY-C-MARKETPLACE-ID header, e.g. EBAY_US');

const combinedDurationDescription =
  'Window in which unpaid orders can be combined into one invoice (CombinedPaymentPeriodEnum): DAYS_3, DAYS_5, DAYS_7, DAYS_14, DAYS_30, or INELIGIBLE';

const shippingRuleTypeDescription =
  'CombinedShippingRuleTypeEnum: COMBINED_ITEM_WEIGHT, EACH_ADDITIONAL_AMOUNT, EACH_ADDITIONAL_AMOUNT_OFF, EACH_ADDITIONAL_PERCENT_OFF, INDIVIDUAL_ITEM_WEIGHT, MAXIMUM_SHIPPING_COST_PER_ORDER, SHIPPING_COST_X_FOR_AMOUNT_Y, SHIPPING_COST_X_FOR_ITEM_COUNT_N, or WEIGHT_OFF';

const amountSchema = z.object({
  currency: z.string().optional().describe('ISO 4217 currency code, e.g. USD'),
  value: z.string().optional().describe('Monetary amount as a decimal string, e.g. "2.50"'),
});

const weightSchema = z.object({
  unit: z.string().optional().describe('WeightUnitOfMeasureEnum: POUND, KILOGRAM, OUNCE, or GRAM'),
  value: z.string().optional().describe('Weight as a decimal string in the given unit'),
});

const eachAdditionalFields = {
  eachAdditionalAmount: amountSchema.optional().describe('Charge added for each additional item'),
  eachAdditionalAmountOffShippingCost: amountSchema
    .optional()
    .describe('Fixed discount off shipping for each additional item'),
  eachAdditionalPercentOffShippingCost: z
    .number()
    .optional()
    .describe('Percentage discount off shipping for each additional item'),
};

const combinedShippingRuleSchema = z.object({
  combinedShippingRuleId: z
    .string()
    .optional()
    .describe('Rule ID from ebay_get_combined_shipping_rules; omit when creating rules'),
  combinedShippingRuleName: z.string().optional().describe('Seller-defined rule profile name'),
  ...eachAdditionalFields,
  mappedCombinedShippingRuleId: z
    .string()
    .optional()
    .describe('ID of a related combined-shipping rule this rule links to'),
  weightOffTotalWeight: weightSchema
    .optional()
    .describe('Weight subtracted from the combined shipment total'),
});

const shippingRuleListSchema = z.object({
  combinedShippingRules: z
    .array(combinedShippingRuleSchema)
    .optional()
    .describe('Discount rules applied to combined shipments'),
  combinedShippingRuleType: z.string().optional().describe(shippingRuleTypeDescription),
});

const calculatedHandlingRuleSchema = z.object({
  combinedShippingRuleType: z
    .string()
    .optional()
    .describe(
      'CombinedShippingRuleTypeHandlingEnum: COMBINED_HANDLING_FEE, EACH_ADDITIONAL_AMOUNT, EACH_ADDITIONAL_AMOUNT_OFF, EACH_ADDITIONAL_PERCENT_OFF, or INDIVIDUAL_HANDLING_FEE',
    ),
  ...eachAdditionalFields,
  orderHandlingAmount: amountSchema
    .optional()
    .describe('Handling fee charged for a combined order'),
});

const promotionalShippingRuleSchema = z.object({
  combinedShippingRuleType: z.string().optional().describe(shippingRuleTypeDescription),
  itemCount: z
    .number()
    .int()
    .optional()
    .describe('Number of items a buyer must purchase to qualify for the promotion'),
  orderAmount: amountSchema
    .optional()
    .describe('Minimum order amount required to qualify for the promotion'),
  shippingCost: amountSchema
    .optional()
    .describe('Total (discounted) shipping cost for the qualifying combined order'),
});

const combinedDuration = z.string().optional().describe(combinedDurationDescription);

const rateUpdateSchema = z.object({
  rateId: nonempty.describe('Rate ID from the rate table (Account API v1 ebay_get_rate_tables)'),
  shippingCost: amountSchema
    .optional()
    .describe('New base shipping rate (ITEM or WEIGHT rate table basis)'),
  additionalCost: amountSchema
    .optional()
    .describe('New additional cost (WEIGHT per-unit or SURCHARGE rate table basis)'),
});

const itemsAwaitingPaymentPreferencesSchema = z.object({
  optInStatus: z.boolean().optional().describe('Opt in to (true) or out of unpaid item assistance'),
  delayBeforeCancellingCommitment: z
    .number()
    .int()
    .optional()
    .describe(
      'Business days without payment before eBay cancels the line item; required when optInStatus is true',
    ),
  autoRelist: z
    .boolean()
    .optional()
    .describe('Relist automatically when cancelled; requires optInStatus true'),
  excludedUsers: z
    .array(z.string())
    .optional()
    .describe('eBay usernames excluded from unpaid item assistance'),
  removeAllExcludedUsers: z
    .boolean()
    .optional()
    .describe('Clear the excluded users list; do not combine with excludedUsers'),
});

const endOfAuctionEmailPreferencesSchema = z.object({
  emailCustomized: z.boolean().optional().describe('Send a customized email to winning bidders'),
  logoCustomized: z.boolean().optional().describe('Use a customized logo in winning-bidder emails'),
  logoType: z
    .string()
    .optional()
    .describe('EndOfAuctionLogoTypeEnum: WINNING_BIDDER_NOTICE, STORE, CUSTOMIZED, or NONE'),
  logoUrl: z.string().optional().describe('URL of the custom logo image'),
  templateText: z.string().optional().describe('Custom email body text (max 1000 characters)'),
  textCustomized: z.boolean().optional().describe('Use customized text in winning-bidder emails'),
});

/**
 * PATCH body for setUserPreferences. eBay's OAS3 file references an undefined
 * SetUserPreferencesRequest, so this mirrors the definition in eBay's published
 * Account v2 spec (the GetUserPreferencesResponse `*PreferencesType` containers,
 * with SetItemsAwaitingPaymentPreferencesType for unpaid-item settings).
 */
const setUserPreferencesSchema = z.object({
  combinedPaymentPreferences: z
    .object({
      combinedPaymentOption: z
        .string()
        .optional()
        .describe(
          'CombinedPaymentOptionEnum: NO_COMBINED_PAYMENT, DISCOUNT_SPECIFIED, or SPECIFY_DISCOUNT_LATER',
        ),
    })
    .optional()
    .describe('Allow combined invoices for multiple unpaid orders from one buyer'),
  dispatchCutoffTimePreference: z
    .object({
      cutoffTime: z
        .string()
        .optional()
        .describe(
          'Same-day shipping cut-off as HH:mm:ss.SSSZ; interpreted in the marketplace default timezone',
        ),
    })
    .optional()
    .describe('Order cut-off time for same-day shipping'),
  emailShipmentTrackingNumberPreference: z
    .boolean()
    .optional()
    .describe('Automatically email buyers the tracking number'),
  endOfAuctionEmailPreferences: endOfAuctionEmailPreferencesSchema
    .optional()
    .describe('End-of-auction email sent to winning bidders'),
  globalShippingProgramListingPreference: z
    .boolean()
    .optional()
    .describe('New eBay UK listings use the Global Shipping Program (seller must be opted in)'),
  itemsAwaitingPaymentPreferences: itemsAwaitingPaymentPreferencesSchema
    .optional()
    .describe('Unpaid item assistance settings'),
  outOfStockControlPreference: z
    .boolean()
    .optional()
    .describe('Opt in to Out-of-Stock control (keep sold-out listings alive but hidden)'),
  purchaseReminderEmailPreferences: z
    .boolean()
    .optional()
    .describe('Let eBay send purchase reminder emails for unpaid line items'),
  requiredShipPhoneNumberPreference: z
    .boolean()
    .optional()
    .describe('Require buyers to provide a shipping phone number at checkout'),
  shippingCarrierRatePreferences: z
    .object({
      fedexRateOption: z
        .string()
        .optional()
        .describe('FedexRateOptionEnum: FEDEX_STANDARD_LIST or FEDEX_COUNTER'),
      upsRateOption: z
        .string()
        .optional()
        .describe('UPSRateOptionEnum: UPS_DAILY_RATES or UPS_ON_DEMAND_RATES'),
    })
    .optional()
    .describe('FedEx/UPS carrier rate types (eBay US only)'),
});

// ============================================================================
// Rate table
// ============================================================================

/** Input for updateShippingCost: rate table path ID plus the RateTableUpdate body. */
/** Input for Account API v2 getRateTable. */
export const getRateTableInputSchema = z.object({
  rateTableId: nonempty.describe('Shipping rate table ID (from Account API v1 getRateTables)'),
});

export const updateShippingCostInputSchema = z.object({
  rateTableId: nonempty.describe('Shipping rate table ID (from Account API v1 getRateTables)'),
  rateTableUpdate: z
    .object({
      rates: z
        .array(rateUpdateSchema)
        .min(1)
        .describe('Rate objects whose shippingCost and/or additionalCost change'),
    })
    .describe('RateTableUpdate request body'),
});

// ============================================================================
// Payout settings
// ============================================================================

/** Input for getPayoutSettings (no parameters). */
export const getPayoutSettingsInputSchema = z.object({});

/** Input for updatePayoutPercentage: the UpdatePayoutPercentageRequest body. */
export const updatePayoutPercentageInputSchema = z.object({
  payoutSplit: z
    .object({
      payoutInstruments: z
        .array(
          z.object({
            instrumentId: nonempty.describe('Payout instrument ID from ebay_get_payout_settings'),
            payoutPercentage: nonempty.describe(
              'Whole-number percentage 0-100 as a string, e.g. "70"; both instruments must total 100',
            ),
          }),
        )
        .min(1)
        .describe('Split-payout percentage for each ACTIVE payout instrument'),
    })
    .describe('UpdatePayoutPercentageRequest body'),
});

// ============================================================================
// Combined shipping rules
// ============================================================================

/** Input for getCombinedShippingRules: the marketplace header only. */
export const getCombinedShippingRulesInputSchema = z.object({ marketplaceId });

/** Input for create/updateCalculatedShippingRules: marketplace header plus request body. */
export const calculatedShippingRulesInputSchema = z.object({
  marketplaceId,
  shippingRules: z
    .object({
      calculatedShippingRule: shippingRuleListSchema
        .optional()
        .describe('Calculated combined-shipping discount rules'),
      calculatedHandlingRule: calculatedHandlingRuleSchema
        .optional()
        .describe('Calculated handling-fee rule for combined orders'),
      combinedDuration,
    })
    .describe('Create/UpdateCalculatedShippingRulesRequest body'),
});

/** Input for create/updateFlatShippingRules: marketplace header plus request body. */
export const flatShippingRulesInputSchema = z.object({
  marketplaceId,
  shippingRules: z
    .object({
      flatShippingRule: shippingRuleListSchema
        .optional()
        .describe('Flat-rate combined-shipping rules'),
      combinedDuration,
    })
    .describe('Create/UpdateFlatShippingRulesRequest body'),
});

/** Input for create/updatePromotionalShippingRule: marketplace header plus request body. */
export const promotionalShippingRuleInputSchema = z.object({
  marketplaceId,
  shippingRules: z
    .object({
      promotionalShippingRule: promotionalShippingRuleSchema
        .optional()
        .describe('Promotional rule: discount or free shipping above an amount or item count'),
      combinedDuration,
    })
    .describe('Create/UpdatePromotionalShippingRuleRequest body'),
});

/** Input for updateCombinedPayments: marketplace header plus request body. */
export const updateCombinedPaymentsInputSchema = z.object({
  marketplaceId,
  combinedPayments: z
    .object({ combinedDuration: z.string().describe(combinedDurationDescription) })
    .describe('UpdateCombinedPaymentsRequest body'),
});

// ============================================================================
// User preferences
// ============================================================================

/** Input for getUserPreferences: marketplace header plus optional field groups. */
export const getUserPreferencesInputSchema = z.object({
  marketplaceId,
  fieldgroups: z
    .string()
    .optional()
    .describe(
      'Comma-separated preference groups; omit or ALL for every group. Values: COMBINED_PAYMENT, DISPATCH_CUTOFF_TIME, EMAIL_SHIPMENT_TRACKING_NUMBER, END_OF_AUCTION_EMAIL, GLOBAL_SHIPPING_PROGRAM, GLOBAL_SHIPPING_PROGRAM_LISTING, ITEMS_AWAITING_PAYMENT, OUT_OF_STOCK_CONTROL, SELLER_PROFILE, OVERRIDE_GSP_SERVICE_WITH_INTL_SERVICE, PICKUP_DROPOFF_SELLER, PURCHASE_REMINDER_EMAIL, REQUIRED_SHIP_PHONE_NUMBER, SELLER_EXCLUDE_SHIP_TO_LOCATION, SHIPPING_CARRIER_RATE',
    ),
});

/** Input for setUserPreferences: marketplace header plus the preferences PATCH body. */
export const setUserPreferencesInputSchema = z.object({
  marketplaceId,
  preferences: setUserPreferencesSchema.describe(
    'Only the preferences to change (PATCH semantics); omitted preferences are left as-is',
  ),
});
