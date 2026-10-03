import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Effect } from 'effect';
import {
  FindingApi,
  buildFindCompletedItemsParams,
  getFindingServiceBaseUrl,
  mapFindCompletedItemsResponse,
  mapFindingItem,
} from '@/api/other/finding.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';

describe('Finding API helpers', () => {
  describe('getFindingServiceBaseUrl', () => {
    it('returns production and sandbox svcs hosts', () => {
      expect(getFindingServiceBaseUrl('production')).toBe(
        'https://svcs.ebay.com/services/search/FindingService/v1',
      );
      expect(getFindingServiceBaseUrl('sandbox')).toBe(
        'https://svcs.sandbox.ebay.com/services/search/FindingService/v1',
      );
    });

    it('appends the Finding path when a proxy base URL is configured', () => {
      expect(getFindingServiceBaseUrl('production', 'https://proxy.example.com/')).toBe(
        'https://proxy.example.com/services/search/FindingService/v1',
      );
    });
  });

  describe('buildFindCompletedItemsParams', () => {
    it('builds core Finding query params with SoldItemsOnly', () => {
      const params = buildFindCompletedItemsParams({
        keywords: 'iphone 14',
        maxResults: 25,
        appId: 'app-client-id',
      });

      expect(params).toMatchObject({
        'OPERATION-NAME': 'findCompletedItems',
        'SERVICE-VERSION': '1.13.0',
        'SECURITY-APPNAME': 'app-client-id',
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        keywords: 'iphone 14',
        'paginationInput.entriesPerPage': 25,
        'itemFilter(0).name': 'SoldItemsOnly',
        'itemFilter(0).value': 'true',
      });
      expect(params['itemFilter(1).name']).toBeUndefined();
    });

    it('adds EndTimeFrom when daysBack is set', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));

      const params = buildFindCompletedItemsParams({
        keywords: 'nike dunk',
        maxResults: 10,
        daysBack: 30,
        appId: 'app-id',
      });

      expect(params['itemFilter(1).name']).toBe('EndTimeFrom');
      expect(params['itemFilter(1).value']).toBe('2024-05-16T12:00:00.000Z');

      vi.useRealTimers();
    });
  });

  describe('mapFindingItem / mapFindCompletedItemsResponse', () => {
    it('maps a single Finding item array-wrapped fields', () => {
      const mapped = mapFindingItem({
        itemId: ['110000000000'],
        title: ['Test Phone Sold'],
        sellingStatus: [
          {
            currentPrice: [{ '@currencyId': 'USD', __value__: '199.99' }],
          },
        ],
        shippingInfo: [
          {
            shippingServiceCost: [{ '@currencyId': 'USD', __value__: '8.50' }],
          },
        ],
        listingInfo: [{ endTime: ['2024-01-10T18:00:00.000Z'] }],
        condition: [{ conditionDisplayName: ['Used'] }],
        viewItemURL: ['https://www.ebay.com/itm/110000000000'],
      });

      expect(mapped).toEqual({
        itemId: '110000000000',
        title: 'Test Phone Sold',
        price: { currency: 'USD', value: '199.99' },
        shippingCost: { currency: 'USD', value: '8.50' },
        soldDate: '2024-01-10T18:00:00.000Z',
        condition: 'Used',
        listingUrl: 'https://www.ebay.com/itm/110000000000',
      });
    });

    it('returns undefined when itemId or title is missing', () => {
      expect(mapFindingItem({ itemId: ['1'] })).toBeUndefined();
      expect(mapFindingItem({ title: ['Only title'] })).toBeUndefined();
      expect(mapFindingItem(null)).toBeUndefined();
    });

    it('maps a full findCompletedItems response envelope', () => {
      const raw = {
        findCompletedItemsResponse: [
          {
            searchResult: [
              {
                '@count': '1',
                item: [
                  {
                    itemId: ['99'],
                    title: ['Sold Widget'],
                    sellingStatus: [
                      { currentPrice: [{ '@currencyId': 'USD', __value__: '12.00' }] },
                    ],
                  },
                ],
              },
            ],
            paginationOutput: [{ totalEntries: ['42'] }],
          },
        ],
      };

      const completedItems = mapFindCompletedItemsResponse(raw, 'widget');
      expect(completedItems.keywords).toBe('widget');
      expect(completedItems.totalEntries).toBe(42);
      expect(completedItems.items).toHaveLength(1);
      expect(completedItems.items[0]).toMatchObject({
        itemId: '99',
        title: 'Sold Widget',
        price: { currency: 'USD', value: '12.00' },
      });
    });

    it('returns empty items for unexpected payloads', () => {
      expect(mapFindCompletedItemsResponse(undefined, 'x')).toEqual({ items: [], keywords: 'x' });
      expect(mapFindCompletedItemsResponse({}, 'x')).toEqual({ items: [], keywords: 'x' });
    });
  });
});

describe('FindingApi', () => {
  let api: FindingApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      getWithFullUrl: vi.fn(),
      getConfig: vi.fn(() => ({
        clientId: 'test-client-id',
        environment: 'sandbox' as const,
      })),
    } as unknown as EbayApiClient;

    api = new FindingApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls Finding with absolute URL and maps the response', async () => {
    const raw = {
      findCompletedItemsResponse: [
        {
          searchResult: [
            {
              item: [{ itemId: ['1'], title: ['Sold'] }],
            },
          ],
        },
      ],
    };
    vi.mocked(mockClient.getWithFullUrl).mockResolvedValue(raw);

    const completedItems = await Effect.runPromise(
      api.findCompletedItems({ keywords: 'camera', maxResults: 5 }),
    );

    expect(mockClient.getWithFullUrl).toHaveBeenCalledWith(
      'https://svcs.sandbox.ebay.com/services/search/FindingService/v1',
      expect.objectContaining({
        'OPERATION-NAME': 'findCompletedItems',
        'SECURITY-APPNAME': 'test-client-id',
        keywords: 'camera',
        'paginationInput.entriesPerPage': 5,
        'itemFilter(0).name': 'SoldItemsOnly',
      }),
    );
    expect(completedItems.items).toEqual([{ itemId: '1', title: 'Sold' }]);
    expect(completedItems.keywords).toBe('camera');
  });

  it('defaults maxResults to 20', async () => {
    vi.mocked(mockClient.getWithFullUrl).mockResolvedValue({});

    await Effect.runPromise(api.findCompletedItems({ keywords: 'lens' }));

    expect(mockClient.getWithFullUrl).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        'paginationInput.entriesPerPage': 20,
      }),
    );
  });

  it('rejects maxResults above 100', async () => {
    await expect(
      Effect.runPromise(api.findCompletedItems({ keywords: 'x', maxResults: 101 })),
    ).rejects.toThrow(/maxResults/);
  });

  it('rejects daysBack above 90', async () => {
    await expect(
      Effect.runPromise(api.findCompletedItems({ keywords: 'x', daysBack: 91 })),
    ).rejects.toThrow(/daysBack/);
  });

  it('fails when clientId is missing', async () => {
    vi.mocked(mockClient.getConfig).mockReturnValue({
      clientId: '',
      environment: 'sandbox',
    } as never);

    await expect(Effect.runPromise(api.findCompletedItems({ keywords: 'x' }))).rejects.toThrow(
      /EBAY_CLIENT_ID|SECURITY-APPNAME|clientId/i,
    );
  });
});
