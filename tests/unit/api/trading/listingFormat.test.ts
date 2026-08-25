import { describe, expect, it } from 'vitest';
import {
  findTradingListingFormatViolation,
  resolveTradingFormat,
  tradingCallName,
  validateTradingEndingReasonEffect,
  validateTradingListingFormatEffect,
} from '@/api/trading/listingFormat.js';
import { FormatType } from '@/types/ebayEnums.js';
import { Effect } from 'effect';

const auctionItem = {
  Title: 'Rare coin',
  StartPrice: 9.99,
  ListingDuration: 'Days_7',
};

const auctionCreate = (item: Record<string, unknown>) =>
  findTradingListingFormatViolation({
    item,
    format: FormatType.AUCTION,
    parameter: 'item',
    isCreate: true,
  });

const auctionRevise = (item: Record<string, unknown>) =>
  findTradingListingFormatViolation({
    item,
    format: FormatType.AUCTION,
    parameter: 'fields',
    isCreate: false,
  });

const fixedPrice = (item: Record<string, unknown>) =>
  findTradingListingFormatViolation({
    item,
    format: FormatType.FIXED_PRICE,
    parameter: 'item',
    isCreate: true,
  });

describe('auction Item rules', () => {
  it('accepts a complete auction with reserve and Buy It Now above the opening bid', () => {
    expect(
      auctionCreate({ ...auctionItem, ReservePrice: 25, BuyItNowPrice: 49.99, Quantity: 1 }),
    ).toBeUndefined();
  });

  it('accepts attributed XML amounts', () => {
    expect(
      auctionCreate({
        ...auctionItem,
        StartPrice: { '#text': '9.99', '@_currencyID': 'USD' },
        ReservePrice: { '#text': 25, '@_currencyID': 'USD' },
      }),
    ).toBeUndefined();
  });

  it('accepts an explicit Chinese ListingType', () => {
    expect(auctionCreate({ ...auctionItem, ListingType: 'Chinese' })).toBeUndefined();
  });

  it('rejects a non-auction ListingType', () => {
    const violation = auctionCreate({ ...auctionItem, ListingType: 'FixedPriceItem' });

    expect(violation?.parameter).toBe('item.ListingType');
    expect(violation?.message).toContain('Chinese');
  });

  it('rejects GTC', () => {
    const violation = auctionCreate({ ...auctionItem, ListingDuration: 'GTC' });

    expect(violation?.parameter).toBe('item.ListingDuration');
    expect(violation?.message).toContain('Days_7');
  });

  it('rejects a quantity other than one', () => {
    expect(auctionCreate({ ...auctionItem, Quantity: 3 })?.parameter).toBe('item.Quantity');
    expect(auctionCreate({ ...auctionItem, Quantity: '1' })).toBeUndefined();
  });

  it('rejects Best Offer', () => {
    expect(
      auctionCreate({ ...auctionItem, BestOfferDetails: { BestOfferEnabled: true } })?.parameter,
    ).toBe('item.BestOfferDetails.BestOfferEnabled');
    expect(
      auctionCreate({ ...auctionItem, BestOfferDetails: { BestOfferEnabled: 'true' } })?.parameter,
    ).toBe('item.BestOfferDetails.BestOfferEnabled');
    expect(
      auctionCreate({ ...auctionItem, BestOfferDetails: { BestOfferEnabled: false } }),
    ).toBeUndefined();
  });

  it('requires a duration and opening bid on create only', () => {
    expect(auctionCreate({ Title: 'No duration', StartPrice: 5 })?.parameter).toBe(
      'item.ListingDuration',
    );
    expect(auctionCreate({ Title: 'No bid', ListingDuration: 'Days_3' })?.parameter).toBe(
      'item.StartPrice',
    );
    expect(auctionRevise({ Title: 'Renamed' })).toBeUndefined();
  });

  it('rejects a reserve at or below the opening bid', () => {
    const violation = auctionCreate({ ...auctionItem, ReservePrice: 9.99 });

    expect(violation?.parameter).toBe('item.ReservePrice');
    expect(violation?.message).toContain('higher than StartPrice');
  });

  it('rejects a Buy It Now price at or below the opening bid', () => {
    expect(auctionRevise({ StartPrice: 10, BuyItNowPrice: 8 })?.parameter).toBe(
      'fields.BuyItNowPrice',
    );
  });

  it('skips price comparisons when the opening bid is not in the payload', () => {
    expect(auctionRevise({ ReservePrice: 30 })).toBeUndefined();
  });
});

describe('fixed-price Item rules', () => {
  it('accepts a fixed-price item', () => {
    expect(
      fixedPrice({ Title: 'Widget', StartPrice: 14.99, Quantity: 10, ListingDuration: 'GTC' }),
    ).toBeUndefined();
  });

  it('rejects the auction ListingType', () => {
    const violation = fixedPrice({ Title: 'Widget', ListingType: 'Chinese' });

    expect(violation?.parameter).toBe('item.ListingType');
    expect(violation?.message).toContain('format AUCTION');
  });

  it('rejects auction-only prices', () => {
    expect(fixedPrice({ StartPrice: 10, ReservePrice: 20 })?.parameter).toBe('item.ReservePrice');
    expect(fixedPrice({ StartPrice: 10, BuyItNowPrice: 20 })?.parameter).toBe('item.BuyItNowPrice');
  });
});

describe('Effect wrappers and call names', () => {
  it('fails the Effect with a tagged input error', async () => {
    const error = await Effect.runPromise(
      Effect.flip(
        validateTradingListingFormatEffect({
          item: { ...auctionItem, ListingDuration: 'GTC' },
          format: FormatType.AUCTION,
          parameter: 'item',
          isCreate: true,
        }),
      ),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('item.ListingDuration');
  });

  it('only allows SellToHighBidder on auctions', async () => {
    await expect(
      Effect.runPromise(
        validateTradingEndingReasonEffect('SellToHighBidder', FormatType.AUCTION, 'reason'),
      ),
    ).resolves.toBeUndefined();
    await expect(
      Effect.runPromise(
        validateTradingEndingReasonEffect(undefined, FormatType.FIXED_PRICE, 'reason'),
      ),
    ).resolves.toBeUndefined();

    const error = await Effect.runPromise(
      Effect.flip(
        validateTradingEndingReasonEffect('SellToHighBidder', FormatType.FIXED_PRICE, 'reason'),
      ),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.parameter).toBe('reason');
  });

  it('maps each operation to the format-specific Trading call', () => {
    expect(tradingCallName('create', FormatType.AUCTION)).toBe('AddItem');
    expect(tradingCallName('create', FormatType.FIXED_PRICE)).toBe('AddFixedPriceItem');
    expect(tradingCallName('revise', FormatType.AUCTION)).toBe('ReviseItem');
    expect(tradingCallName('end', FormatType.AUCTION)).toBe('EndItem');
    expect(tradingCallName('relist', FormatType.AUCTION)).toBe('RelistItem');
    expect(tradingCallName('relist', FormatType.FIXED_PRICE)).toBe('RelistFixedPriceItem');
  });

  it('defaults the format to fixed price', () => {
    expect(resolveTradingFormat(undefined)).toBe(FormatType.FIXED_PRICE);
    expect(resolveTradingFormat(FormatType.AUCTION)).toBe(FormatType.AUCTION);
  });
});
