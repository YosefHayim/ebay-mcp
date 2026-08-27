import { offerSchema, updateOfferBodySchema } from '@/schemas/inventory-management/inventory.js';
import { decodeEffectSchema } from '@/utils/effectSchema.js';
import { Effect, Either } from 'effect';
import { describe, expect, it } from 'vitest';

const decodeOffer = (value: unknown) =>
  Effect.runSync(Effect.either(decodeEffectSchema(offerSchema, value)));

const usd = (value: string) => ({ currency: 'USD', value });

describe('offer schema listing formats', () => {
  it('accepts auction pricing and a day-count duration', () => {
    const result = decodeOffer({
      sku: 'AUCTION-1',
      marketplaceId: 'EBAY_US',
      format: 'AUCTION',
      listingDuration: 'DAYS_7',
      pricingSummary: { auctionStartPrice: usd('9.99'), auctionReservePrice: usd('25.00') },
    });

    expect(Either.isRight(result)).toBe(true);
  });

  it('no longer requires pricingSummary.price', () => {
    const result = decodeOffer({
      sku: 'AUCTION-1',
      marketplaceId: 'EBAY_US',
      format: 'AUCTION',
      pricingSummary: { auctionStartPrice: usd('9.99') },
    });

    expect(Either.isRight(result)).toBe(true);
  });

  it('rejects listing durations eBay does not define', () => {
    const result = decodeOffer({
      sku: 'SKU-1',
      marketplaceId: 'EBAY_US',
      format: 'AUCTION',
      listingDuration: 'DAYS_2',
    });

    expect(Either.isLeft(result)).toBe(true);
  });

  it('still requires the offer keys', () => {
    expect(Either.isLeft(decodeOffer({ marketplaceId: 'EBAY_US', format: 'AUCTION' }))).toBe(true);
    expect(Either.isLeft(decodeOffer({ sku: 'SKU-1', marketplaceId: 'EBAY_US' }))).toBe(true);
  });

  it('passes generated fields it does not model through to the request', () => {
    const result = decodeOffer({
      sku: 'SKU-1',
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      regulatory: { energyEfficiencyLabel: { imageDescription: 'A+' } },
      listingPolicies: { shippingCostOverrides: [{ priority: 1, shippingCost: usd('0.00') }] },
      pricingSummary: { originallySoldForRetailPriceOn: 'ON_EBAY' },
    });

    expect(Either.isRight(result)).toBe(true);
    if (Either.isRight(result)) {
      expect(result.right).toMatchObject({
        regulatory: { energyEfficiencyLabel: { imageDescription: 'A+' } },
        listingPolicies: { shippingCostOverrides: [{ priority: 1 }] },
        pricingSummary: { originallySoldForRetailPriceOn: 'ON_EBAY' },
      });
    }
  });
});

describe('update offer body schema', () => {
  it('accepts auction fields without the offer keys', () => {
    const result = Effect.runSync(
      Effect.either(
        decodeEffectSchema(updateOfferBodySchema, {
          listingDuration: 'DAYS_3',
          pricingSummary: { auctionStartPrice: usd('1.00') },
        }),
      ),
    );

    expect(Either.isRight(result)).toBe(true);
  });
});
