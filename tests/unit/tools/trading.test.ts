import { expect, it, vi } from 'vitest';
import type { EbaySellerApi } from '@/api/ebaySellerApi.js';
import { executeTool } from '@/tools/index.js';
import { Effect } from 'effect';

const createTradingApiMock = (): EbaySellerApi =>
  ({
    trading: {
      getActiveListings: vi.fn(),
      getListing: vi.fn(),
      createListing: vi.fn(),
      reviseListing: vi.fn(),
      endListing: vi.fn(),
      relistItem: vi.fn(),
    },
  }) as unknown as EbaySellerApi;

it('passes getActiveListings args through unchanged', async () => {
  const api = createTradingApiMock();
  const input = { page: 2, entriesPerPage: 25 };

  vi.mocked(api.trading.getActiveListings).mockReturnValue(
    Effect.succeed({ listings: [], total: 0, totalPages: 0 }),
  );

  await executeTool(api, 'ebay_get_active_listings', input);

  expect(api.trading.getActiveListings).toHaveBeenCalledWith(input);
});

it('passes getListing args through unchanged', async () => {
  const api = createTradingApiMock();
  const input = { itemId: '12345' };

  vi.mocked(api.trading.getListing).mockReturnValue(Effect.succeed({ ItemID: '12345' }));

  await executeTool(api, 'ebay_get_listing', input);

  expect(api.trading.getListing).toHaveBeenCalledWith(input);
});

it('passes createListing args through unchanged', async () => {
  const api = createTradingApiMock();
  const input = { item: { Title: 'New item', StartPrice: 9.99 } };

  vi.mocked(api.trading.createListing).mockReturnValue(Effect.succeed({ ItemID: '12345' }));

  await executeTool(api, 'ebay_create_listing', input);

  expect(api.trading.createListing).toHaveBeenCalledWith(input);
});

it('passes reviseListing args through unchanged', async () => {
  const api = createTradingApiMock();
  const input = { itemId: '12345', fields: { Quantity: 10 } };

  vi.mocked(api.trading.reviseListing).mockReturnValue(Effect.succeed({ ItemID: '12345' }));

  await executeTool(api, 'ebay_revise_listing', input);

  expect(api.trading.reviseListing).toHaveBeenCalledWith(input);
});

it('passes endListing args through unchanged', async () => {
  const api = createTradingApiMock();
  const input = { itemId: '12345', reason: 'NotAvailable' as const };

  vi.mocked(api.trading.endListing).mockReturnValue(Effect.succeed({ Ack: 'Success' }));

  await executeTool(api, 'ebay_end_listing', input);

  expect(api.trading.endListing).toHaveBeenCalledWith(input);
});

it('passes relistItem args through unchanged', async () => {
  const api = createTradingApiMock();
  const input = { itemId: '12345', modifications: { Quantity: 20 } };

  vi.mocked(api.trading.relistItem).mockReturnValue(Effect.succeed({ ItemID: '12345' }));

  await executeTool(api, 'ebay_relist_item', input);

  expect(api.trading.relistItem).toHaveBeenCalledWith(input);
});
