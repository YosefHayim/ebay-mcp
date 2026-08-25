import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Effect } from 'effect';
import { BrowseApi } from '@/api/other/browse.js';
import type { EbayApiClient } from '@/api/client.js';

const ERR_LIMIT_MUST_BE_BETWEEN = /limit must be an integer between 1 and 200/;
const ERR_SORT_MUST_BE_ONE = /sort must be one of/;
const ERR_OFFSET_MUST_BE_ZERO = /offset must be zero or a multiple of limit \(3\); got 20/;
const ERR_OFFSET_MUST_BE_BETWEEN = /offset must be an integer between 0 and 10000/;
const ERR_CONDITIONS_MUST_BE_AN = /conditions must be an array of non-empty strings/;
const ERR_BUYINGOPTIONS_MUST_BE_AN = /buyingOptions must be an array of non-empty strings/;
const ERR_PRICEMIN_MUST_NOT_EXCEED = /priceMin \(50\) must not exceed priceMax \(10\)/;
const ERR_FILTER_ALREADY_CONTAINS_A = /filter already contains a price clause/;
const ERR_CATEGORYIDS_MUST_BE_NON_EMPTY = /categoryIds must be a non-empty string when provided/;
const ERR_PRICECURRENCY_MUST_BE_NON_EMPTY =
  /priceCurrency must be a non-empty string when provided/;
const ERR_FILTER_MUST_BE_NON_EMPTY = /filter must be a non-empty string when provided/;
const ERR_NO_ITEM_FOUND = /No item found/;

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

describe('searchActiveItems: request shape', () => {
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
});

describe('searchActiveItems: pagination guards', () => {
  it('rejects a limit above 200', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 201 })),
    ).rejects.toThrow(ERR_LIMIT_MUST_BE_BETWEEN);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects an offset that is not a whole number of pages', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 3, offset: 20 })),
    ).rejects.toThrow(ERR_OFFSET_MUST_BE_ZERO);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('accepts an offset that is a multiple of limit', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({});

    await Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 3, offset: 21 }));

    expect(mockClient.get).toHaveBeenCalledWith(
      '/buy/browse/v1/item_summary/search',
      expect.objectContaining({ limit: 3, offset: 21 }),
    );
  });
  it('rejects an offset above the Browse maximum', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 1, offset: 10_001 })),
    ).rejects.toThrow(ERR_OFFSET_MUST_BE_BETWEEN);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects a fractional limit', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 1.5 })),
    ).rejects.toThrow(ERR_LIMIT_MUST_BE_BETWEEN);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects a fractional offset', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', limit: 5, offset: 2.5 })),
    ).rejects.toThrow(ERR_OFFSET_MUST_BE_BETWEEN);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('blames limit, not offset, for a NaN limit', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', limit: Number.NaN })),
    ).rejects.toThrow(ERR_LIMIT_MUST_BE_BETWEEN);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('accepts an offset at the Browse maximum', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({});

    await Effect.runPromise(api.searchActiveItems({ query: 'x', offset: 10_000 }));

    expect(mockClient.get).toHaveBeenCalledWith(
      '/buy/browse/v1/item_summary/search',
      expect.objectContaining({ offset: 10_000 }),
    );
  });
});

describe('searchActiveItems: input validation', () => {
  it('rejects an unsupported sort value', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', sort: 'distance' as never })),
    ).rejects.toThrow(ERR_SORT_MUST_BE_ONE);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects non-string entries in conditions and buyingOptions', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', conditions: [1 as never] })),
    ).rejects.toThrow(ERR_CONDITIONS_MUST_BE_AN);
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', buyingOptions: ['' as never] })),
    ).rejects.toThrow(ERR_BUYINGOPTIONS_MUST_BE_AN);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects a negative price bound', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', priceMin: -1 })),
    ).rejects.toThrow();
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects an inverted price window', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', priceMin: 50, priceMax: 10 })),
    ).rejects.toThrow(ERR_PRICEMIN_MUST_NOT_EXCEED);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects a missing query', async () => {
    await expect(Effect.runPromise(api.searchActiveItems({ query: '' }))).rejects.toThrow();
    expect(mockClient.get).not.toHaveBeenCalled();
  });
});

describe('searchActiveItems: blank optional strings', () => {
  it('rejects a blank categoryIds instead of sending an empty category_ids', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', categoryIds: '' })),
    ).rejects.toThrow(ERR_CATEGORYIDS_MUST_BE_NON_EMPTY);
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', categoryIds: '   ' })),
    ).rejects.toThrow(ERR_CATEGORYIDS_MUST_BE_NON_EMPTY);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects a blank priceCurrency instead of emitting a bare priceCurrency clause', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', priceMax: 100, priceCurrency: '' })),
    ).rejects.toThrow(ERR_PRICECURRENCY_MUST_BE_NON_EMPTY);
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', priceMax: 100, priceCurrency: '  ' })),
    ).rejects.toThrow(ERR_PRICECURRENCY_MUST_BE_NON_EMPTY);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('rejects a blank raw filter', async () => {
    await expect(
      Effect.runPromise(api.searchActiveItems({ query: 'x', filter: '' })),
    ).rejects.toThrow(ERR_FILTER_MUST_BE_NON_EMPTY);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('trims surrounding whitespace on the optional string inputs', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({});

    await Effect.runPromise(
      api.searchActiveItems({
        query: 'x',
        categoryIds: ' 27386 ',
        priceMax: 100,
        priceCurrency: ' EUR ',
      }),
    );

    expect(mockClient.get).toHaveBeenCalledWith(
      '/buy/browse/v1/item_summary/search',
      expect.objectContaining({
        category_ids: '27386',
        filter: 'price:[..100],priceCurrency:EUR',
      }),
    );
  });
});

describe('searchActiveItems: raw filter conflicts', () => {
  it('rejects a raw filter whose price clause collides with priceMin/priceMax', async () => {
    await expect(
      Effect.runPromise(
        api.searchActiveItems({
          query: 'x',
          priceMax: 100,
          filter: 'price:[5..10],priceCurrency:USD',
        }),
      ),
    ).rejects.toThrow(ERR_FILTER_ALREADY_CONTAINS_A);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
  it('allows a raw filter without a price clause alongside price bounds', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({});

    await Effect.runPromise(
      api.searchActiveItems({ query: 'x', priceMax: 100, filter: 'sellers:{acme}' }),
    );

    expect(mockClient.get).toHaveBeenCalledWith(
      '/buy/browse/v1/item_summary/search',
      expect.objectContaining({
        filter: 'price:[..100],priceCurrency:USD,sellers:{acme}',
      }),
    );
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
      ERR_NO_ITEM_FOUND,
    );
  });
});
