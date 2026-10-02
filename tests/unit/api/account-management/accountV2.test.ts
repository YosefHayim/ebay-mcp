import { AccountV2Api } from '@/api/account-management/accountV2.js';
import type { EbayApiClient } from '@/api/client.js';
import { MarketplaceId } from '@/types/ebayEnums.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = '/sell/account/v2';
const US = MarketplaceId.EBAY_US;
const usHeader = { headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } };

const client = { get: vi.fn(), post: vi.fn(), patch: vi.fn() };
// The API class only calls these mocked client methods.
const api = new AccountV2Api(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('rate table', () => {
  it('gets one rate table from its encoded path and returns the eBay DTO unchanged', async () => {
    const table = { rateTableId: 'RT 1/2', rates: [{ rateId: 'R1' }] };
    client.get.mockResolvedValue(table);

    expect(await Effect.runPromise(api.getRateTable({ rateTableId: 'RT 1/2' }))).toBe(table);
    expect(client.get).toHaveBeenCalledWith(`${BASE}/rate_table/RT%201%2F2`);
  });

  it('posts the RateTableUpdate body to the encoded rate table path', async () => {
    const rateTableUpdate = {
      rates: [{ rateId: 'R1', shippingCost: { currency: 'USD', value: '4.99' } }],
    };
    client.post.mockResolvedValue(undefined);

    await Effect.runPromise(api.updateShippingCost({ rateTableId: 'RT 1/2', rateTableUpdate }));

    expect(client.post).toHaveBeenCalledWith(
      `${BASE}/rate_table/RT%201%2F2/update_shipping_cost`,
      rateTableUpdate,
    );
  });

  it('fails with EndpointInputError before calling eBay when rateTableId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateShippingCost(invalidInput({ rateTableUpdate: { rates: [] } }))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error).toMatchObject({ parameter: 'rateTableId' });
    expect(client.post).not.toHaveBeenCalled();
  });
});

describe('payout settings', () => {
  it('gets payout settings and returns the eBay DTO unchanged', async () => {
    const response = { payoutInstruments: [{ instrumentId: 'I1', payoutPercentage: '100' }] };
    client.get.mockResolvedValue(response);

    expect(await Effect.runPromise(api.getPayoutSettings())).toBe(response);
    expect(client.get).toHaveBeenCalledWith(`${BASE}/payout_settings`);
  });

  it('posts the split-payout body to update_percentage', async () => {
    const payoutSplit = {
      payoutInstruments: [
        { instrumentId: 'BANK-1', payoutPercentage: '70' },
        { instrumentId: 'PAYONEER-1', payoutPercentage: '30' },
      ],
    };
    client.post.mockResolvedValue(undefined);

    await Effect.runPromise(api.updatePayoutPercentage({ payoutSplit }));

    expect(client.post).toHaveBeenCalledWith(
      `${BASE}/payout_settings/update_percentage`,
      payoutSplit,
    );
  });

  it('fails with EndpointInputError when the payoutSplit body is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updatePayoutPercentage(invalidInput({}))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error).toMatchObject({ parameter: 'payoutSplit' });
  });

  it('wraps a client failure in EbayApiError with the method and path', async () => {
    client.get.mockRejectedValue(new Error('403 Insufficient permissions'));

    const error = await Effect.runPromise(Effect.flip(api.getPayoutSettings()));

    expect(error._tag).toBe('EbayApiError');
    expect(error).toMatchObject({ method: 'GET', path: `${BASE}/payout_settings` });
  });
});

const calculated = {
  calculatedShippingRule: {
    combinedShippingRuleType: 'WEIGHT_OFF',
    combinedShippingRules: [{ weightOffTotalWeight: { unit: 'POUND', value: '1' } }],
  },
  combinedDuration: 'DAYS_7',
};
const flat = {
  flatShippingRule: {
    combinedShippingRuleType: 'EACH_ADDITIONAL_AMOUNT',
    combinedShippingRules: [
      { combinedShippingRuleId: 'C1', eachAdditionalAmount: { currency: 'USD', value: '1.00' } },
    ],
  },
};
const promotional = {
  promotionalShippingRule: { itemCount: 3, shippingCost: { currency: 'USD', value: '0.00' } },
};

describe('combined shipping rule writes', () => {
  it.each([
    ['createCalculatedShippingRules', 'create_calculated_shipping_rules', calculated],
    ['updateCalculatedShippingRules', 'update_calculated_shipping_rules', calculated],
    ['createFlatShippingRules', 'create_flat_shipping_rules', flat],
    ['updateFlatShippingRules', 'update_flat_shipping_rules', flat],
    ['createPromotionalShippingRule', 'create_promotional_shipping_rule', promotional],
    ['updatePromotionalShippingRule', 'update_promotional_shipping_rule', promotional],
  ] as const)('%s posts shippingRules with the marketplace header', async (method, segment, shippingRules) => {
    client.post.mockResolvedValue(undefined);

    await Effect.runPromise(api[method]({ marketplaceId: US, shippingRules }));

    expect(client.post).toHaveBeenCalledWith(
      `${BASE}/combined_shipping_rules/${segment}`,
      shippingRules,
      usHeader,
    );
  });

  it('posts the combined payment window to update_combined_payments', async () => {
    client.post.mockResolvedValue(undefined);

    await Effect.runPromise(
      api.updateCombinedPayments({
        marketplaceId: MarketplaceId.EBAY_GB,
        combinedPayments: { combinedDuration: 'DAYS_14' },
      }),
    );

    expect(client.post).toHaveBeenCalledWith(
      `${BASE}/combined_shipping_rules/update_combined_payments`,
      { combinedDuration: 'DAYS_14' },
      { headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB' } },
    );
  });
});

describe('combined shipping rule reads and failures', () => {
  it('gets combined shipping rules with only the marketplace header', async () => {
    const response = { combinedDuration: 'DAYS_7', promotionalShippingRule: { itemCount: 3 } };
    client.get.mockResolvedValue(response);

    expect(await Effect.runPromise(api.getCombinedShippingRules({ marketplaceId: US }))).toBe(
      response,
    );
    expect(client.get).toHaveBeenCalledWith(`${BASE}/combined_shipping_rules`, undefined, usHeader);
  });

  it('fails with EndpointInputError when the required marketplace header is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.createFlatShippingRules(invalidInput({ shippingRules: flat }))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error).toMatchObject({ parameter: 'marketplaceId' });
    expect(client.post).not.toHaveBeenCalled();
  });

  it('fails with EndpointInputError when the rules body is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateCombinedPayments(invalidInput({ marketplaceId: US }))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error).toMatchObject({ parameter: 'combinedPayments' });
  });

  it('wraps a rejected POST in EbayApiError', async () => {
    client.post.mockRejectedValue(new Error('400 Bad Request'));

    const error = await Effect.runPromise(
      Effect.flip(api.createPromotionalShippingRule({ marketplaceId: US, shippingRules: {} })),
    );

    expect(error._tag).toBe('EbayApiError');
    expect(error).toMatchObject({
      method: 'POST',
      path: `${BASE}/combined_shipping_rules/create_promotional_shipping_rule`,
    });
  });
});

describe('user preferences', () => {
  it('gets preferences with fieldgroups as a query param and the marketplace header', async () => {
    const response = { outOfStockControlPreference: true };
    client.get.mockResolvedValue(response);

    expect(
      await Effect.runPromise(
        api.getUserPreferences({
          marketplaceId: US,
          fieldgroups: 'COMBINED_PAYMENT,SELLER_PROFILE',
        }),
      ),
    ).toBe(response);
    expect(client.get).toHaveBeenCalledWith(
      `${BASE}/user_preferences`,
      { fieldgroups: 'COMBINED_PAYMENT,SELLER_PROFILE' },
      usHeader,
    );
  });

  it('omits the query string when fieldgroups is not given', async () => {
    client.get.mockResolvedValue({});

    await Effect.runPromise(api.getUserPreferences({ marketplaceId: US }));

    expect(client.get).toHaveBeenCalledWith(`${BASE}/user_preferences`, undefined, usHeader);
  });

  it('patches only the given preferences with the marketplace header', async () => {
    const preferences = {
      combinedPaymentPreferences: { combinedPaymentOption: 'DISCOUNT_SPECIFIED' },
      itemsAwaitingPaymentPreferences: { optInStatus: true, delayBeforeCancellingCommitment: 4 },
    };
    client.patch.mockResolvedValue(undefined);

    await Effect.runPromise(api.setUserPreferences({ marketplaceId: US, preferences }));

    expect(client.patch).toHaveBeenCalledWith(`${BASE}/user_preferences`, preferences, usHeader);
  });

  it('wraps a rejected PATCH in EbayApiError', async () => {
    client.patch.mockRejectedValue(new Error('400 Bad Request'));

    const error = await Effect.runPromise(
      Effect.flip(api.setUserPreferences({ marketplaceId: US, preferences: {} })),
    );

    expect(error._tag).toBe('EbayApiError');
    expect(error).toMatchObject({ method: 'PATCH', path: `${BASE}/user_preferences` });
  });

  it('fails with EndpointInputError when fieldgroups is not a string', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getUserPreferences(invalidInput({ marketplaceId: US, fieldgroups: 1 }))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error).toMatchObject({ parameter: 'fieldgroups' });
    expect(client.get).not.toHaveBeenCalled();
  });
});
