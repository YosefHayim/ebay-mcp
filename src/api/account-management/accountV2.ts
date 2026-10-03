import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  marketplaceHeader,
  optionalStringEffect,
  requestGetEffect,
  requestPatchEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
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
import type { components } from '@/types/sell-apps/account-management/sellAccountV2Oas3.js';
import { Effect } from 'effect';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';

type GetRateTableInput = InferEffectSchema<typeof getRateTableInputSchema>;
type UpdateShippingCostInput = InferEffectSchema<typeof updateShippingCostInputSchema>;
type GetPayoutSettingsInput = InferEffectSchema<typeof getPayoutSettingsInputSchema>;
type UpdatePayoutPercentageInput = InferEffectSchema<typeof updatePayoutPercentageInputSchema>;
type GetCombinedShippingRulesInput = InferEffectSchema<typeof getCombinedShippingRulesInputSchema>;
type CalculatedShippingRulesInput = InferEffectSchema<typeof calculatedShippingRulesInputSchema>;
type FlatShippingRulesInput = InferEffectSchema<typeof flatShippingRulesInputSchema>;
type PromotionalShippingRuleInput = InferEffectSchema<typeof promotionalShippingRuleInputSchema>;
type UpdateCombinedPaymentsInput = InferEffectSchema<typeof updateCombinedPaymentsInputSchema>;
type GetUserPreferencesInput = InferEffectSchema<typeof getUserPreferencesInputSchema>;
type SetUserPreferencesInput = InferEffectSchema<typeof setUserPreferencesInputSchema>;

type Schemas = components['schemas'];
/** Generated request body for updateShippingCost. */
type RateTableUpdate = Schemas['RateTableUpdate'];
/** Generated request body for updatePayoutPercentage. */
type UpdatePayoutPercentageRequest = Schemas['UpdatePayoutPercentageRequest'];
/**
 * Request body for setUserPreferences. eBay's OAS3 file references an undefined
 * SetUserPreferencesRequest (generated as `unknown`), so the body is typed from the
 * tool schema, which mirrors eBay's published definition.
 */
type SetUserPreferencesRequest = SetUserPreferencesInput['preferences'];

/** Combined-shipping-rules POST operations that share the marketplace header contract. */
type CombinedShippingRulesOperation =
  | 'create_calculated_shipping_rules'
  | 'create_flat_shipping_rules'
  | 'create_promotional_shipping_rule'
  | 'update_calculated_shipping_rules'
  | 'update_combined_payments'
  | 'update_flat_shipping_rules'
  | 'update_promotional_shipping_rule';

/**
 * Response returned by eBay Account API v2 getRateTable.
 *
 * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/rate_table/methods/getRateTable
 */
export type RateTableDetailsResponse = Schemas['RateTableDetails'];

/**
 * Response returned by eBay Account API v2 getPayoutSettings.
 *
 * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/payout_settings/methods/getPayoutSettings
 */
export type PayoutSettingsResponse = Schemas['PayoutSettingsResponse'];

/**
 * Response returned by eBay Account API v2 getCombinedShippingRules.
 *
 * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/getCombinedShippingRules
 */
export type CombinedShippingRulesResponse = Schemas['GetCombinedShippingRulesPublicApiResponse'];

/**
 * Response returned by eBay Account API v2 getUserPreferences.
 *
 * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/user_preferences/methods/getUserPreferences
 */
export type UserPreferencesResponse = Schemas['GetUserPreferencesResponse'];

/** Account API v2 - rate tables, payout settings, combined shipping rules, and user preferences. */
export class AccountV2Api {
  private readonly basePath = '/sell/account/v2';
  private readonly client: EbayApiClient;

  public constructor(client: EbayApiClient) {
    this.client = client;
  }

  /**
   * Retrieves one shipping rate table with its rates, so their rateIds can be updated.
   *
   * @param input - Rate table ID (path), from Account API v1 getRateTables.
   * @returns An Effect that succeeds with eBay's generated RateTableDetails.
   *
   * @example
   * ```ts
   * const table = await Effect.runPromise(accountV2Api.getRateTable({ rateTableId: '5000000000' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/rate_table/methods/getRateTable
   */
  public getRateTable = (
    input: GetRateTableInput,
  ): Effect.Effect<RateTableDetailsResponse, EbayApiError | EndpointInputError> => {
    const { client, basePath } = this;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetRateTableInput>(input, 'input');
      const rateTableId = yield* requireStringEffect(request.rateTableId, 'rateTableId');

      return yield* requestGetEffect<RateTableDetailsResponse>(
        client,
        `${basePath}/rate_table/${encodeURIComponent(rateTableId)}`,
      );
    });
  };

  /**
   * Updates the shippingCost and/or additionalCost of rates in a shipping rate table.
   *
   * @param input - Rate table ID (path) and the RateTableUpdate body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.updateShippingCost({
   *     rateTableId: '5000000000',
   *     rateTableUpdate: { rates: [{ rateId: 'R1', shippingCost: { currency: 'USD', value: '4.99' } }] },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/rate_table/methods/updateShippingCost
   */
  public updateShippingCost = (
    input: UpdateShippingCostInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const { client, basePath } = this;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<UpdateShippingCostInput>(input, 'input');
      const rateTableId = yield* requireStringEffect(request.rateTableId, 'rateTableId');
      const body = yield* requireObjectEffect<RateTableUpdate>(
        request.rateTableUpdate,
        'rateTableUpdate',
      );
      const path = `${basePath}/rate_table/${encodeURIComponent(rateTableId)}/update_shipping_cost`;

      return yield* requestPostEffect<void>(client, path, body);
    });
  };

  /**
   * Retrieves the seller's payout instruments and split-payout percentages
   * (mainland China sellers only). Requires the sell.finances scope.
   *
   * @param _input - Empty object accepted for tool/API shape consistency.
   * @returns An Effect that succeeds with eBay's generated PayoutSettingsResponse.
   *
   * @example
   * ```ts
   * const settings = await Effect.runPromise(accountV2Api.getPayoutSettings({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/payout_settings/methods/getPayoutSettings
   */
  public getPayoutSettings = (
    _input: GetPayoutSettingsInput = {},
  ): Effect.Effect<PayoutSettingsResponse, EbayApiError> =>
    requestGetEffect<PayoutSettingsResponse>(this.client, `${this.basePath}/payout_settings`);

  /**
   * Sets the split-payout percentage across the seller's two payout instruments
   * (mainland China sellers only; percentages must total 100). Requires sell.finances.
   *
   * @param input - UpdatePayoutPercentageRequest body under `payoutSplit`.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.updatePayoutPercentage({
   *     payoutSplit: {
   *       payoutInstruments: [
   *         { instrumentId: 'BANK-1', payoutPercentage: '70' },
   *         { instrumentId: 'PAYONEER-1', payoutPercentage: '30' },
   *       ],
   *     },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/payout_settings/methods/updatePayoutPercentage
   */
  public updatePayoutPercentage = (
    input: UpdatePayoutPercentageInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${this.basePath}/payout_settings/update_percentage`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<UpdatePayoutPercentageInput>(input, 'input');
      const body = yield* requireObjectEffect<UpdatePayoutPercentageRequest>(
        request.payoutSplit,
        'payoutSplit',
      );

      return yield* requestPostEffect<void>(client, path, body);
    });
  };

  /**
   * Creates calculated combined-shipping rules (and optional handling rule or
   * combined payment window) for one marketplace.
   *
   * @param input - Marketplace header and the CreateCalculatedShippingRulesRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.createCalculatedShippingRules({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     shippingRules: { combinedDuration: 'DAYS_7' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/createCalculatedShippingRules
   */
  public createCalculatedShippingRules = (
    input: CalculatedShippingRulesInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['CreateCalculatedShippingRulesRequest']>(
      'create_calculated_shipping_rules',
      input,
      'shippingRules',
    );

  /**
   * Creates flat-rate combined-shipping rules for one marketplace.
   *
   * @param input - Marketplace header and the CreateFlatShippingRulesRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.createFlatShippingRules({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     shippingRules: { flatShippingRule: { combinedShippingRuleType: 'EACH_ADDITIONAL_AMOUNT' } },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/createFlatShippingRules
   */
  public createFlatShippingRules = (
    input: FlatShippingRulesInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['CreateFlatShippingRulesRequest']>(
      'create_flat_shipping_rules',
      input,
      'shippingRules',
    );

  /**
   * Creates the promotional combined-shipping rule (discount or free shipping
   * above an order amount or item count) for one marketplace.
   *
   * @param input - Marketplace header and the CreatePromotionalShippingRuleRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.createPromotionalShippingRule({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     shippingRules: { promotionalShippingRule: { itemCount: 3 } },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/createPromotionalShippingRule
   */
  public createPromotionalShippingRule = (
    input: PromotionalShippingRuleInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['CreatePromotionalShippingRuleRequest']>(
      'create_promotional_shipping_rule',
      input,
      'shippingRules',
    );

  /**
   * Retrieves the seller's calculated, flat, and promotional combined-shipping
   * rules and combined payment window for one marketplace.
   *
   * @param input - Marketplace sent as the X-EBAY-C-MARKETPLACE-ID header.
   * @returns An Effect that succeeds with eBay's GetCombinedShippingRulesPublicApiResponse.
   *
   * @example
   * ```ts
   * const rules = await Effect.runPromise(
   *   accountV2Api.getCombinedShippingRules({ marketplaceId: MarketplaceId.EBAY_US }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/getCombinedShippingRules
   */
  public getCombinedShippingRules = (
    input: GetCombinedShippingRulesInput,
  ): Effect.Effect<CombinedShippingRulesResponse, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${this.basePath}/combined_shipping_rules`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetCombinedShippingRulesInput>(input, 'input');
      const marketplaceId = yield* requireStringEffect(request.marketplaceId, 'marketplaceId');

      return yield* requestGetEffect<CombinedShippingRulesResponse>(
        client,
        path,
        undefined,
        marketplaceHeader(marketplaceId),
      );
    });
  };

  /**
   * Updates existing calculated combined-shipping rules for one marketplace.
   *
   * @param input - Marketplace header and the UpdateCalculatedShippingRulesRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.updateCalculatedShippingRules({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     shippingRules: { combinedDuration: 'DAYS_14' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/updateCalculatedShippingRules
   */
  public updateCalculatedShippingRules = (
    input: CalculatedShippingRulesInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['UpdateCalculatedShippingRulesRequest']>(
      'update_calculated_shipping_rules',
      input,
      'shippingRules',
    );

  /**
   * Changes the combined payment window for unpaid orders on one marketplace.
   *
   * @param input - Marketplace header and the UpdateCombinedPaymentsRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.updateCombinedPayments({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     combinedPayments: { combinedDuration: 'DAYS_30' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/updateCombinedPayments
   */
  public updateCombinedPayments = (
    input: UpdateCombinedPaymentsInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['UpdateCombinedPaymentsRequest']>(
      'update_combined_payments',
      input,
      'combinedPayments',
    );

  /**
   * Updates existing flat-rate combined-shipping rules for one marketplace.
   *
   * @param input - Marketplace header and the UpdateFlatShippingRulesRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.updateFlatShippingRules({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     shippingRules: { combinedDuration: 'DAYS_5' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/updateFlatShippingRules
   */
  public updateFlatShippingRules = (
    input: FlatShippingRulesInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['UpdateFlatShippingRulesRequest']>(
      'update_flat_shipping_rules',
      input,
      'shippingRules',
    );

  /**
   * Updates the existing promotional combined-shipping rule for one marketplace.
   *
   * @param input - Marketplace header and the UpdatePromotionalShippingRuleRequest body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.updatePromotionalShippingRule({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     shippingRules: { promotionalShippingRule: { orderAmount: { currency: 'USD', value: '50.00' } } },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/combined_shipping_rules/methods/updatePromotionalShippingRule
   */
  public updatePromotionalShippingRule = (
    input: PromotionalShippingRuleInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> =>
    this.postCombinedShippingRules<Schemas['UpdatePromotionalShippingRuleRequest']>(
      'update_promotional_shipping_rule',
      input,
      'shippingRules',
    );

  /**
   * Retrieves the seller's preferences for one marketplace, optionally limited to
   * specific field groups.
   *
   * @param input - Marketplace header and optional comma-separated `fieldgroups`.
   * @returns An Effect that succeeds with eBay's generated GetUserPreferencesResponse.
   *
   * @example
   * ```ts
   * const preferences = await Effect.runPromise(
   *   accountV2Api.getUserPreferences({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     fieldgroups: 'COMBINED_PAYMENT,DISPATCH_CUTOFF_TIME',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/user_preferences/methods/getUserPreferences
   */
  public getUserPreferences = (
    input: GetUserPreferencesInput,
  ): Effect.Effect<UserPreferencesResponse, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${this.basePath}/user_preferences`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetUserPreferencesInput>(input, 'input');
      const marketplaceId = yield* requireStringEffect(request.marketplaceId, 'marketplaceId');
      const fieldgroups = yield* optionalStringEffect(request.fieldgroups, 'fieldgroups');
      const params = buildEndpointParams({
        fieldgroups: { wireName: 'fieldgroups', value: fieldgroups },
      });

      return yield* requestGetEffect<UserPreferencesResponse>(
        client,
        path,
        params,
        marketplaceHeader(marketplaceId),
      );
    });
  };

  /**
   * Changes one or more seller preferences for one marketplace (PATCH: send only
   * the preferences being changed).
   *
   * eBay's OAS3 spec references an undefined `SetUserPreferencesRequest`, so the
   * generated body type is `unknown`. The body is typed from the tool schema,
   * which mirrors the definition in eBay's published Account v2 spec: the
   * `*PreferencesType` containers returned by getUserPreferences, with
   * SetItemsAwaitingPaymentPreferencesType for unpaid-item settings.
   *
   * @param input - Marketplace header and the preferences PATCH body.
   * @returns An Effect that succeeds when eBay returns 204 No Content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   accountV2Api.setUserPreferences({
   *     marketplaceId: MarketplaceId.EBAY_US,
   *     preferences: { outOfStockControlPreference: true },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/account/v2/resources/user_preferences/methods/setUserPreferences
   */
  public setUserPreferences = (
    input: SetUserPreferencesInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${this.basePath}/user_preferences`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<SetUserPreferencesInput>(input, 'input');
      const marketplaceId = yield* requireStringEffect(request.marketplaceId, 'marketplaceId');
      const body = yield* requireObjectEffect<SetUserPreferencesRequest>(
        request.preferences,
        'preferences',
      );

      return yield* requestPatchEffect<void>(client, path, body, marketplaceHeader(marketplaceId));
    });
  };

  /**
   * Validates the marketplace header and body field, then POSTs one
   * combined-shipping-rules request that eBay answers with 204 No Content.
   */
  private readonly postCombinedShippingRules = <Body extends object>(
    operation: CombinedShippingRulesOperation,
    input: unknown,
    bodyField: 'shippingRules' | 'combinedPayments',
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const { client } = this;
    const path = `${this.basePath}/combined_shipping_rules/${operation}`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<Record<string, unknown>>(input, 'input');
      const marketplaceId = yield* requireStringEffect(request.marketplaceId, 'marketplaceId');
      const body = yield* requireObjectEffect<Body>(request[bodyField], bodyField);

      return yield* requestPostEffect<void>(client, path, body, marketplaceHeader(marketplaceId));
    });
  };
}
