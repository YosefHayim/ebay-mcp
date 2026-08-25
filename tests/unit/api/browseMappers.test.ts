import { describe, it, expect } from 'vitest';
import { buildBrowseFilter } from '@/api/other/browseFilter.js';
import {
  mapItemDetailsResponse,
  mapItemSummary,
  mapSearchActiveItemsResponse,
} from '@/api/other/browseMappers.js';

// Shaped after eBay's documented item_summary/search response rather than this
// module's own assumptions: nested containers, the marketplace/legacy id fields
// we deliberately drop, and a thumbnail array we ignore.
const EBAY_SEARCH_PAYLOAD = {
  href: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=drone&limit=2&offset=0',
  total: 12_345,
  next: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=drone&limit=2&offset=2',
  limit: 2,
  offset: 0,
  itemSummaries: [
    {
      itemId: 'v1|254188828753|0',
      title: 'Drone Quadcopter 4K Camera',
      leafCategoryIds: ['179697'],
      categories: [{ categoryId: '179697', categoryName: 'Quadcopters & Multirotors' }],
      image: { imageUrl: 'https://i.ebayimg.com/images/g/abc/s-l225.jpg' },
      price: { value: '129.99', currency: 'USD' },
      itemHref: 'https://api.ebay.com/buy/browse/v1/item/v1%7C254188828753%7C0',
      seller: {
        username: 'drone_outlet',
        feedbackPercentage: '98.7',
        feedbackScore: 15_432,
      },
      condition: 'New',
      conditionId: '1000',
      thumbnailImages: [{ imageUrl: 'https://i.ebayimg.com/images/g/abc/s-l64.jpg' }],
      shippingOptions: [
        {
          shippingCostType: 'FIXED',
          shippingCost: { value: '0.00', currency: 'USD' },
        },
      ],
      buyingOptions: ['FIXED_PRICE'],
      itemWebUrl: 'https://www.ebay.com/itm/254188828753',
      itemLocation: { postalCode: '112**', country: 'US' },
      adultOnly: false,
      legacyItemId: '254188828753',
      availableCoupons: false,
      itemCreationDate: '2026-08-01T10:00:00.000Z',
      topRatedBuyingExperience: true,
      priorityListing: false,
      listingMarketplaceId: 'EBAY_US',
    },
  ],
};

describe('buildBrowseFilter', () => {
  it('returns undefined when no clause applies', () => {
    expect(buildBrowseFilter({})).toBeUndefined();
  });

  it('builds condition and buying option clauses', () => {
    expect(buildBrowseFilter({ conditions: ['NEW', 'USED'] })).toBe('conditions:{NEW|USED}');
    expect(buildBrowseFilter({ buyingOptions: ['AUCTION'] })).toBe('buyingOptions:{AUCTION}');
  });

  it('builds price ranges with a default USD currency', () => {
    expect(buildBrowseFilter({ priceMin: 10, priceMax: 50 })).toBe(
      'price:[10..50],priceCurrency:USD',
    );
    expect(buildBrowseFilter({ priceMin: 10 })).toBe('price:[10..],priceCurrency:USD');
    expect(buildBrowseFilter({ priceMax: 50, priceCurrency: 'EUR' })).toBe(
      'price:[..50],priceCurrency:EUR',
    );
  });

  it('appends the raw filter passthrough last', () => {
    expect(
      buildBrowseFilter({
        conditions: ['NEW'],
        filter: 'sellers:{user1|user2}',
      }),
    ).toBe('conditions:{NEW},sellers:{user1|user2}');
  });
});

describe('mapItemSummary', () => {
  it('maps a full summary', () => {
    const mapped = mapItemSummary({
      itemId: 'v1|123|0',
      title: 'Camera',
      price: { value: '99.99', currency: 'USD' },
      condition: 'New',
      buyingOptions: ['FIXED_PRICE'],
      itemWebUrl: 'https://www.ebay.com/itm/123',
      image: { imageUrl: 'https://i.ebayimg.com/img.jpg' },
      seller: { username: 'cam_seller', feedbackPercentage: '99.8' },
      shippingOptions: [{ shippingCost: { value: '0.00', currency: 'USD' } }],
      itemEndDate: '2026-09-01T00:00:00.000Z',
      itemLocation: { country: 'US' },
    });

    expect(mapped).toEqual({
      itemId: 'v1|123|0',
      title: 'Camera',
      price: { currency: 'USD', value: '99.99' },
      condition: 'New',
      buyingOptions: ['FIXED_PRICE'],
      itemWebUrl: 'https://www.ebay.com/itm/123',
      imageUrl: 'https://i.ebayimg.com/img.jpg',
      seller: 'cam_seller',
      sellerFeedbackPercentage: '99.8',
      shippingCost: { currency: 'USD', value: '0.00' },
      itemEndDate: '2026-09-01T00:00:00.000Z',
      itemLocationCountry: 'US',
    });
  });

  it('returns undefined when itemId or title are missing', () => {
    expect(mapItemSummary({ title: 'No id' })).toBeUndefined();
    expect(mapItemSummary({ itemId: 'v1|1|0' })).toBeUndefined();
    expect(mapItemSummary('not-an-object')).toBeUndefined();
  });

  it('omits optional fields that are absent or malformed', () => {
    const mapped = mapItemSummary({
      itemId: 'v1|1|0',
      title: 'Sparse',
      price: { value: 42 },
      seller: 'not-an-object',
    });

    expect(mapped).toEqual({ itemId: 'v1|1|0', title: 'Sparse' });
  });
});

describe('mapSearchActiveItemsResponse (realistic payload)', () => {
  // Shaped after eBay's documented item_summary/search response rather than
  // this module's own assumptions: nested containers, the marketplace/legacy
  // id fields we deliberately drop, and a thumbnail array we ignore.

  it('maps eBay-shaped payloads and ignores unmapped containers', () => {
    const result = mapSearchActiveItemsResponse(EBAY_SEARCH_PAYLOAD, {
      query: 'drone',
      offset: 0,
      limit: 2,
    });

    expect(result.total).toBe(12_345);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      itemId: 'v1|254188828753|0',
      title: 'Drone Quadcopter 4K Camera',
      price: { currency: 'USD', value: '129.99' },
      condition: 'New',
      buyingOptions: ['FIXED_PRICE'],
      itemWebUrl: 'https://www.ebay.com/itm/254188828753',
      imageUrl: 'https://i.ebayimg.com/images/g/abc/s-l225.jpg',
      seller: 'drone_outlet',
      sellerFeedbackPercentage: '98.7',
      shippingCost: { currency: 'USD', value: '0.00' },
      itemLocationCountry: 'US',
    });
  });

  it('prefers the pagination eBay returned over the requested window', () => {
    const result = mapSearchActiveItemsResponse(
      { ...EBAY_SEARCH_PAYLOAD, offset: 40, limit: 10 },
      { query: 'drone', offset: 9999, limit: 200 },
    );

    expect(result.offset).toBe(40);
    expect(result.limit).toBe(10);
  });

  it('falls back to the requested window when the payload omits it', () => {
    const result = mapSearchActiveItemsResponse(
      { itemSummaries: [] },
      { query: 'drone', offset: 5, limit: 25 },
    );

    expect(result.offset).toBe(5);
    expect(result.limit).toBe(25);
  });
});

describe('mapSearchActiveItemsResponse', () => {
  it('maps items and total', () => {
    const result = mapSearchActiveItemsResponse(
      {
        total: 1234,
        itemSummaries: [{ itemId: 'v1|1|0', title: 'One' }, { title: 'dropped - no id' }],
      },
      { query: 'widget', offset: 0, limit: 20 },
    );

    expect(result.total).toBe(1234);
    expect(result.items).toEqual([{ itemId: 'v1|1|0', title: 'One' }]);
    expect(result.query).toBe('widget');
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(20);
  });

  it('returns empty items for unexpected payloads', () => {
    const context = { query: 'x', offset: 0, limit: 20 };
    expect(mapSearchActiveItemsResponse(undefined, context)).toEqual({ items: [], ...context });
    expect(mapSearchActiveItemsResponse({}, context)).toEqual({ items: [], ...context });
  });
});

describe('mapItemDetailsResponse', () => {
  it('maps a full item detail', () => {
    const mapped = mapItemDetailsResponse({
      itemId: 'v1|123|0',
      title: 'Camera',
      price: { value: '99.99', currency: 'USD' },
      condition: 'New',
      conditionDescription: 'Open box',
      shortDescription: 'A nice camera',
      categoryPath: 'Cameras & Photo|Digital Cameras',
      buyingOptions: ['FIXED_PRICE', 'BEST_OFFER'],
      itemWebUrl: 'https://www.ebay.com/itm/123',
      image: { imageUrl: 'https://i.ebayimg.com/img.jpg' },
      additionalImages: [{ imageUrl: 'a' }, { imageUrl: 'b' }],
      seller: { username: 'cam_seller', feedbackPercentage: '99.8' },
      estimatedAvailabilities: [{ estimatedAvailableQuantity: 3 }],
      itemEndDate: '2026-09-01T00:00:00.000Z',
      itemLocation: { city: 'Austin', stateOrProvince: 'TX', country: 'US' },
      returnTerms: { returnsAccepted: true },
    });

    expect(mapped).toMatchObject({
      itemId: 'v1|123|0',
      title: 'Camera',
      price: { currency: 'USD', value: '99.99' },
      conditionDescription: 'Open box',
      shortDescription: 'A nice camera',
      additionalImageCount: 2,
      estimatedAvailableQuantity: 3,
      itemLocation: 'Austin, TX, US',
      returnsAccepted: true,
    });
  });

  it('returns undefined for payloads without itemId/title', () => {
    expect(mapItemDetailsResponse(undefined)).toBeUndefined();
    expect(mapItemDetailsResponse({})).toBeUndefined();
    expect(mapItemDetailsResponse({ itemId: 'v1|1|0' })).toBeUndefined();
  });
  it('reads estimatedAvailabilities when eBay sends a bare object', () => {
    // eBay returns this container either as a single-element array (covered
    // above) or as a bare object, depending on the listing.
    const mapped = mapItemDetailsResponse({
      itemId: 'v1|9|0',
      title: 'Bare availability container',
      estimatedAvailabilities: { estimatedAvailableQuantity: 7 },
    });

    expect(mapped?.estimatedAvailableQuantity).toBe(7);
  });
});

describe('mapItemSummary: auction pricing', () => {
  it('maps an auction summary using currentBidPrice and bidCount', () => {
    const mapped = mapItemSummary({
      itemId: 'v1|999|0',
      title: 'Vintage SLR, no reserve',
      currentBidPrice: { value: '42.50', currency: 'USD' },
      bidCount: 7,
      buyingOptions: ['AUCTION'],
      itemEndDate: '2026-09-01T18:00:00.000Z',
    });

    expect(mapped).toMatchObject({
      price: { currency: 'USD', value: '42.50' },
      bidCount: 7,
      buyingOptions: ['AUCTION'],
      itemEndDate: '2026-09-01T18:00:00.000Z',
    });
  });
  it('prefers a fixed price over currentBidPrice when both are present', () => {
    const mapped = mapItemSummary({
      itemId: 'v1|998|0',
      title: 'Auction with Buy It Now',
      price: { value: '99.00', currency: 'USD' },
      currentBidPrice: { value: '42.50', currency: 'USD' },
      buyingOptions: ['AUCTION', 'FIXED_PRICE'],
    });

    expect(mapped?.price).toEqual({ currency: 'USD', value: '99.00' });
  });
});
