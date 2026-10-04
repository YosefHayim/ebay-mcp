import { offerSchema, updateOfferBodySchema } from '@/schemas/inventory-management/inventory.js';
import { describe, expect, it } from 'vitest';

const usd = (amount: string) => ({ currency: 'USD', value: amount });

describe('offer schema listing formats', () => {
  it('accepts auction pricing and a day-count duration', () => {
    const parsedOffer = offerSchema.safeParse({
      sku: 'AUCTION-1',
      marketplaceId: 'EBAY_US',
      format: 'AUCTION',
      listingDuration: 'DAYS_7',
      pricingSummary: { auctionStartPrice: usd('9.99'), auctionReservePrice: usd('25.00') },
    });

    expect(parsedOffer.success).toBe(true);
  });

  it('no longer requires pricingSummary.price', () => {
    const parsedOffer = offerSchema.safeParse({
      sku: 'AUCTION-1',
      marketplaceId: 'EBAY_US',
      format: 'AUCTION',
      pricingSummary: { auctionStartPrice: usd('9.99') },
    });

    expect(parsedOffer.success).toBe(true);
  });

  it('rejects listing durations eBay does not define', () => {
    const parsedOffer = offerSchema.safeParse({
      sku: 'SKU-1',
      marketplaceId: 'EBAY_US',
      format: 'AUCTION',
      listingDuration: 'DAYS_2',
    });

    expect(parsedOffer.success).toBe(false);
  });

  it('still requires the offer keys', () => {
    expect(offerSchema.safeParse({ marketplaceId: 'EBAY_US', format: 'AUCTION' }).success).toBe(
      false,
    );
    expect(offerSchema.safeParse({ sku: 'SKU-1', marketplaceId: 'EBAY_US' }).success).toBe(false);
  });

  it('passes generated fields it does not model through to the request', () => {
    const parsedOffer = offerSchema.safeParse({
      sku: 'SKU-1',
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      regulatory: { energyEfficiencyLabel: { imageDescription: 'A+' } },
      listingPolicies: { shippingCostOverrides: [{ priority: 1, shippingCost: usd('0.00') }] },
      pricingSummary: { originallySoldForRetailPriceOn: 'ON_EBAY' },
    });

    expect(parsedOffer.success).toBe(true);
    if (parsedOffer.success) {
      expect(parsedOffer.data).toMatchObject({
        regulatory: { energyEfficiencyLabel: { imageDescription: 'A+' } },
        listingPolicies: { shippingCostOverrides: [{ priority: 1 }] },
        pricingSummary: { originallySoldForRetailPriceOn: 'ON_EBAY' },
      });
    }
  });
});

describe('update offer body schema', () => {
  it('accepts auction fields without the offer keys', () => {
    const parsedUpdate = updateOfferBodySchema.safeParse({
      listingDuration: 'DAYS_3',
      pricingSummary: { auctionStartPrice: usd('1.00') },
    });

    expect(parsedUpdate.success).toBe(true);
  });
});
