import { Effect } from 'effect';
import {
  calculatedShippingRulesInputSchema,
  flatShippingRulesInputSchema,
  getCombinedShippingRulesInputSchema,
  getPayoutSettingsInputSchema,
  getRateTableInputSchema,
  getUserPreferencesInputSchema,
  promotionalShippingRuleInputSchema,
  setUserPreferencesInputSchema,
  updateCombinedPaymentsInputSchema,
  updatePayoutPercentageInputSchema,
  updateShippingCostInputSchema,
} from '@/schemas/account-management/accountV2.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';

const SPLIT_PAYOUT_NOTE =
  'Split payouts are only available to mainland China sellers (Payoneer + bank account). Requires the sell.finances scope.';
const COMBINED_RULES_NOTE =
  'marketplaceId is sent as the required X-EBAY-C-MARKETPLACE-ID header. Returns success (eBay 204 No Content); confirm with ebay_get_combined_shipping_rules. Requires sell.account.';

/** Account API v2 tools for rate tables, payout settings, combined shipping rules, and user preferences. */
export const accountV2Entries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_rate_table',
    description:
      'Get one shipping rate table with its rates, rateIds, regions, and shipping costs (Account API v2 getRateTable). Pass rateTableId from ebay_get_rate_tables; use the rateIds with ebay_update_rate_table_shipping_cost. Rate tables are supported on US, CA, GB, DE, AU, FR, IT and ES. Requires sell.account or sell.account.readonly.',
    inputSchema: getRateTableInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.getRateTable(args)),
  }),
  defineTool({
    name: 'ebay_update_rate_table_shipping_cost',
    description:
      'Update shippingCost and/or additionalCost for rates in a shipping rate table (Account API v2 updateShippingCost). Pass rateTableId (from ebay_get_rate_tables) and rateTableUpdate.rates[] with each rateId (from ebay_get_rate_table). Returns success (eBay 204 No Content). Rate tables are supported on US, CA, GB, DE, AU, FR, IT and ES. Requires sell.account.',
    inputSchema: updateShippingCostInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.updateShippingCost(args)),
  }),
  defineTool({
    name: 'ebay_get_payout_settings',
    description: `Get the seller's payout instruments (ID, type, status, nickname, last four digits) and current split-payout percentages (Account API v2 getPayoutSettings). Use instrumentId with ebay_update_payout_percentage; only ACTIVE instruments can receive split payouts. ${SPLIT_PAYOUT_NOTE}`,
    inputSchema: getPayoutSettingsInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.getPayoutSettings(args)),
  }),
  defineTool({
    name: 'ebay_update_payout_percentage',
    description: `Set the split-payout percentage for the seller's two payout instruments (Account API v2 updatePayoutPercentage). Pass payoutSplit.payoutInstruments[] with instrumentId (from ebay_get_payout_settings) and a whole-number payoutPercentage; the values must total 100 or eBay rejects the call. Returns success (eBay 204 No Content). ${SPLIT_PAYOUT_NOTE}`,
    inputSchema: updatePayoutPercentageInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.updatePayoutPercentage(args)),
  }),
  defineTool({
    name: 'ebay_create_calculated_shipping_rules',
    description: `Create calculated combined-shipping rules for listings that use calculated shipping (Account API v2 createCalculatedShippingRules): shippingRules.calculatedShippingRule (weight/item/cost-based discounts), calculatedHandlingRule, and/or combinedDuration. ${COMBINED_RULES_NOTE}`,
    inputSchema: calculatedShippingRulesInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.accountV2.createCalculatedShippingRules(args)),
  }),
  defineTool({
    name: 'ebay_create_flat_shipping_rules',
    description: `Create flat-rate combined-shipping rules (Account API v2 createFlatShippingRules): shippingRules.flatShippingRule and/or combinedDuration. ${COMBINED_RULES_NOTE}`,
    inputSchema: flatShippingRulesInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.accountV2.createFlatShippingRules(args)),
  }),
  defineTool({
    name: 'ebay_create_promotional_shipping_rule',
    description: `Create the promotional combined-shipping rule, e.g. discounted or free shipping above an order amount or item count (Account API v2 createPromotionalShippingRule): shippingRules.promotionalShippingRule and/or combinedDuration. ${COMBINED_RULES_NOTE}`,
    inputSchema: promotionalShippingRuleInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.accountV2.createPromotionalShippingRule(args)),
  }),
  defineTool({
    name: 'ebay_get_combined_shipping_rules',
    description:
      "Get the seller's combined-shipping configuration for one marketplace (Account API v2 getCombinedShippingRules): calculated, flat and promotional rules, handling rule, and the combined payment window. Rule IDs returned here are needed by the update tools. marketplaceId is sent as the required X-EBAY-C-MARKETPLACE-ID header. Requires sell.account.readonly or sell.account.",
    inputSchema: getCombinedShippingRulesInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.getCombinedShippingRules(args)),
  }),
  defineTool({
    name: 'ebay_update_calculated_shipping_rules',
    description: `Update existing calculated combined-shipping rules (Account API v2 updateCalculatedShippingRules): change discount percentages, weight offsets, amounts, handling rule, and/or combinedDuration. Reference rules by combinedShippingRuleId from ebay_get_combined_shipping_rules. ${COMBINED_RULES_NOTE}`,
    inputSchema: calculatedShippingRulesInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.updateCalculatedShippingRules(args)),
  }),
  defineTool({
    name: 'ebay_update_combined_payments',
    description: `Change how long unpaid orders from one buyer can be combined into a single invoice (Account API v2 updateCombinedPayments): combinedPayments.combinedDuration DAYS_3, DAYS_5, DAYS_7, DAYS_14, DAYS_30 or INELIGIBLE. ${COMBINED_RULES_NOTE}`,
    inputSchema: updateCombinedPaymentsInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.updateCombinedPayments(args)),
  }),
  defineTool({
    name: 'ebay_update_flat_shipping_rules',
    description: `Update existing flat-rate combined-shipping rules and/or combinedDuration (Account API v2 updateFlatShippingRules). Reference rules by combinedShippingRuleId from ebay_get_combined_shipping_rules. ${COMBINED_RULES_NOTE}`,
    inputSchema: flatShippingRulesInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.updateFlatShippingRules(args)),
  }),
  defineTool({
    name: 'ebay_update_promotional_shipping_rule',
    description: `Update the existing promotional combined-shipping rule: thresholds, item count, shipping cost, and/or combinedDuration (Account API v2 updatePromotionalShippingRule). ${COMBINED_RULES_NOTE}`,
    inputSchema: promotionalShippingRuleInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.updatePromotionalShippingRule(args)),
  }),
  defineTool({
    name: 'ebay_get_user_preferences',
    description:
      "Get the seller's preferences for one marketplace (Account API v2 getUserPreferences): combined payment, dispatch cut-off time, unpaid item assistance, end-of-auction email, Out-of-Stock control, Business Policies opt-in, excluded ship-to locations, carrier rates, and more. Optional fieldgroups (comma-separated, default ALL) limits the groups returned. marketplaceId is sent as the required X-EBAY-C-MARKETPLACE-ID header. Requires sell.account.readonly or sell.account.",
    inputSchema: getUserPreferencesInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.getUserPreferences(args)),
  }),
  defineTool({
    name: 'ebay_set_user_preferences',
    description:
      'Change one or more seller preferences for one marketplace (Account API v2 setUserPreferences, HTTP PATCH): include only the preferences to change under preferences, e.g. combinedPaymentPreferences, dispatchCutoffTimePreference, itemsAwaitingPaymentPreferences, outOfStockControlPreference. Excluded ship-to locations cannot be changed here (My eBay only). marketplaceId is sent as the required X-EBAY-C-MARKETPLACE-ID header. Returns success (eBay 204 No Content); confirm with ebay_get_user_preferences. Requires sell.account.',
    inputSchema: setUserPreferencesInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: true },
    handler: (api, args) => Effect.runPromise(api.accountV2.setUserPreferences(args)),
  }),
];
