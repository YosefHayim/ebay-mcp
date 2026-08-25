import type { EbayApiClient } from '@/api/client.js';
import {
  findOfferFormatViolation,
  validateOfferFormatEffect,
} from '@/api/listing-management/offerFormat.js';
import { createInventoryOffersMethods } from '@/api/listing-management/offers.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const usd = (value: string) => ({ currency: 'USD', value });

const auctionOffer = {
  sku: 'AUCTION-1',
  marketplaceId: 'EBAY_US',
  format: 'AUCTION',
  listingDuration: 'DAYS_7',
  availableQuantity: 1,
  pricingSummary: { auctionStartPrice: usd('9.99'), auctionReservePrice: usd('25.00') },
};

const fixedPriceOffer = {
  sku: 'FIXED-1',
  marketplaceId: 'EBAY_US',
  format: 'FIXED_PRICE',
  listingDuration: 'GTC',
  availableQuantity: 5,
  pricingSummary: { price: usd('19.99') },
};

describe('findOfferFormatViolation', () => {
  it('accepts a consistent auction offer', () => {
    expect(findOfferFormatViolation(auctionOffer, 'body')).toBeUndefined();
  });

  it('accepts a consistent fixed-price offer', () => {
    expect(findOfferFormatViolation(fixedPriceOffer, 'body')).toBeUndefined();
  });

  it('keeps publish-time fields optional so drafts still pass', () => {
    expect(findOfferFormatViolation({ format: 'AUCTION' }, 'body')).toBeUndefined();
    expect(findOfferFormatViolation({ format: 'FIXED_PRICE' }, 'body')).toBeUndefined();
    expect(findOfferFormatViolation({}, 'body')).toBeUndefined();
  });

  it('lets an auction carry a Buy It Now price beside the starting bid', () => {
    const offer = {
      ...auctionOffer,
      pricingSummary: { auctionStartPrice: usd('9.99'), price: usd('49.99') },
    };

    expect(findOfferFormatViolation(offer, 'body')).toBeUndefined();
  });

  it('rejects GTC on an auction', () => {
    const violation = findOfferFormatViolation({ ...auctionOffer, listingDuration: 'GTC' }, 'body');

    expect(violation).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'body.listingDuration',
    });
  });

  it('rejects an auction quantity other than 1', () => {
    expect(
      findOfferFormatViolation({ ...auctionOffer, availableQuantity: 3 }, 'body'),
    ).toMatchObject({ parameter: 'body.availableQuantity' });
  });

  it('rejects a per-buyer limit on an auction', () => {
    expect(
      findOfferFormatViolation({ ...auctionOffer, quantityLimitPerBuyer: 2 }, 'body'),
    ).toMatchObject({ parameter: 'body.quantityLimitPerBuyer' });
  });

  it('rejects Best Offer on an auction but tolerates it switched off', () => {
    const enabled = {
      ...auctionOffer,
      listingPolicies: { bestOfferTerms: { bestOfferEnabled: true } },
    };
    const disabled = {
      ...auctionOffer,
      listingPolicies: { bestOfferTerms: { bestOfferEnabled: false } },
    };

    expect(findOfferFormatViolation(enabled, 'body')).toMatchObject({
      parameter: 'body.listingPolicies.bestOfferTerms.bestOfferEnabled',
    });
    expect(findOfferFormatViolation(disabled, 'body')).toBeUndefined();
  });

  it('rejects a reserve at or below the starting bid', () => {
    const equal = {
      ...auctionOffer,
      pricingSummary: { auctionStartPrice: usd('10.00'), auctionReservePrice: usd('10.00') },
    };
    const lower = {
      ...auctionOffer,
      pricingSummary: { auctionStartPrice: usd('10.00'), auctionReservePrice: usd('9.50') },
    };

    expect(findOfferFormatViolation(equal, 'body')).toMatchObject({
      parameter: 'body.pricingSummary.auctionReservePrice',
    });
    expect(findOfferFormatViolation(lower, 'body')).toMatchObject({
      parameter: 'body.pricingSummary.auctionReservePrice',
    });
  });

  it('checks the reserve rule on update bodies that carry no format', () => {
    const update = {
      pricingSummary: { auctionStartPrice: usd('10.00'), auctionReservePrice: usd('5.00') },
    };

    expect(findOfferFormatViolation(update, 'body')).toMatchObject({
      parameter: 'body.pricingSummary.auctionReservePrice',
    });
  });

  it('leaves unparseable amounts to eBay', () => {
    const offer = {
      ...auctionOffer,
      pricingSummary: { auctionStartPrice: usd('ten'), auctionReservePrice: usd('5.00') },
    };

    expect(findOfferFormatViolation(offer, 'body')).toBeUndefined();
  });

  it('rejects a day-count duration on a fixed-price offer', () => {
    expect(
      findOfferFormatViolation({ ...fixedPriceOffer, listingDuration: 'DAYS_7' }, 'body'),
    ).toMatchObject({ parameter: 'body.listingDuration' });
  });

  it('rejects auction prices on a fixed-price offer', () => {
    const offer = {
      ...fixedPriceOffer,
      pricingSummary: { price: usd('19.99'), auctionStartPrice: usd('1.00') },
    };

    expect(findOfferFormatViolation(offer, 'body')).toMatchObject({
      parameter: 'body.pricingSummary',
    });
  });
});

describe('validateOfferFormatEffect', () => {
  it('succeeds with void for a consistent body', async () => {
    await expect(Effect.runPromise(validateOfferFormatEffect(auctionOffer, 'body'))).resolves.toBe(
      undefined,
    );
  });

  it('fails with the tagged input error', async () => {
    const error = await Effect.runPromise(
      Effect.flip(validateOfferFormatEffect({ ...auctionOffer, listingDuration: 'GTC' }, 'body')),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('GTC');
  });
});

describe('offer methods apply the format rules before calling eBay', () => {
  let client: EbayApiClient;
  let methods: ReturnType<typeof createInventoryOffersMethods>;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({ offerId: 'OFFER-1' }),
      put: vi.fn().mockResolvedValue({ offerId: 'OFFER-1' }),
      delete: vi.fn(),
    } as unknown as EbayApiClient;
    methods = createInventoryOffersMethods(client);
  });

  it('posts a consistent auction offer unchanged', async () => {
    await Effect.runPromise(methods.createOffer({ body: auctionOffer }));

    expect(client.post).toHaveBeenCalledWith('/sell/inventory/v1/offer', auctionOffer);
  });

  it('rejects an inconsistent createOffer body without a request', async () => {
    const error = await Effect.runPromise(
      Effect.flip(methods.createOffer({ body: { ...auctionOffer, availableQuantity: 2 } })),
    );

    expect(error).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'body.availableQuantity',
    });
    expect(client.post).not.toHaveBeenCalled();
  });

  it('rejects an inconsistent updateOffer body without a request', async () => {
    const body = {
      pricingSummary: { auctionStartPrice: usd('10.00'), auctionReservePrice: usd('1.00') },
    };
    const error = await Effect.runPromise(
      Effect.flip(methods.updateOffer({ offerId: 'OFFER-1', body })),
    );

    expect(error).toMatchObject({ parameter: 'body.pricingSummary.auctionReservePrice' });
    expect(client.put).not.toHaveBeenCalled();
  });

  it('labels the failing bulk request by index', async () => {
    const error = await Effect.runPromise(
      Effect.flip(
        methods.bulkCreateOffer({
          body: { requests: [fixedPriceOffer, { ...auctionOffer, listingDuration: 'GTC' }] },
        }),
      ),
    );

    expect(error).toMatchObject({ parameter: 'body.requests[1].listingDuration' });
    expect(client.post).not.toHaveBeenCalled();
  });
});
