import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Effect } from 'effect';
import {
  BrowseApi,
  buildBrowseFilter,
  mapItemDetailsResponse,
  mapItemSummary,
  mapSearchActiveItemsResponse,
} from '@/api/other/browse.js';
import type { EbayApiClient } from '@/api/client.js';

describe('Browse API helpers', () => {
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
      expect(buildBrowseFilter({ priceMin: 10 })).toBe('price:[10],priceCurrency:USD');
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
  });
});

describe('BrowseApi', () => {
  let api: BrowseApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    } as unknown as EbayApiClient;

    api = new BrowseApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('searchActiveItems', () => {
    it('calls item_summary/search and maps the response', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({
        total: 2,
        itemSummaries: [{ itemId: 'v1|1|0', title: 'One' }],
      });

      const result = await Effect.runPromise(
        api.searchActiveItems({ query: 'camera', limit: 5, offset: 10 }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/buy/browse/v1/item_summary/search', {
        q: 'camera',
        limit: 5,
        offset: 10,
      });
      expect(result.items).toEqual([{ itemId: 'v1|1|0', title: 'One' }]);
      expect(result.total).toBe(2);
    });

    it('defaults limit to 20 and offset to 0', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({});

      const result = await Effect.runPromise(api.searchActiveItems({ query: 'lens' }));

      expect(mockClient.get).toHaveBeenCalledWith(
        '/buy/browse/v1/item_summary/search',
        expect.objectContaining({ q: 'lens', limit: 20, offset: 0 }),
      );
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('passes sort, category ids, and the combined filter expression', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({});

      await Effect.runPromise(
        api.searchActiveItems({
          query: 'gpu',
          sort: 'price',
          categoryIds: '27386',
          conditions: ['NEW'],
          priceMax: 500,
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/buy/browse/v1/item_summary/search',
        expect.objectContaining({
          sort: 'price',
          category_ids: '27386',
          filter: 'conditions:{NEW},price:[..500],priceCurrency:USD',
        }),
      );
    });

    it('rejects a limit above 200', async () => {
      await expect(
        Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 201 })),
      ).rejects.toThrow(/limit must be between 1 and 200/);
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('rejects an unsupported sort value', async () => {
      await expect(
        Effect.runPromise(api.searchActiveItems({ query: 'x', sort: 'distance' as never })),
      ).rejects.toThrow(/sort must be one of/);
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('rejects a missing query', async () => {
      await expect(Effect.runPromise(api.searchActiveItems({ query: '' }))).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getItemDetails', () => {
    it('URL-encodes the item id and maps the response', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({
        itemId: 'v1|110587051479|0',
        title: 'Camera',
      });

      const result = await Effect.runPromise(api.getItemDetails({ itemId: 'v1|110587051479|0' }));

      expect(mockClient.get).toHaveBeenCalledWith('/buy/browse/v1/item/v1%7C110587051479%7C0');
      expect(result).toEqual({ itemId: 'v1|110587051479|0', title: 'Camera' });
    });

    it('fails with a tagged input error when the response has no item', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({});

      await expect(Effect.runPromise(api.getItemDetails({ itemId: 'v1|1|0' }))).rejects.toThrow(
        /No item found/,
      );
    });
  });
});
