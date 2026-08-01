import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TradingApiClient } from '@/api/clientTrading.js';
import { sniffImageContentType, TradingApi } from '@/api/trading/trading.js';
import { Effect } from 'effect';

let api: TradingApi;
let mockClient: {
  execute: ReturnType<typeof vi.fn>;
  uploadPicture: ReturnType<typeof vi.fn>;
  getTradingEndpoint: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  mockClient = {
    execute: vi.fn(),
    uploadPicture: vi.fn(),
    getTradingEndpoint: vi.fn(() => 'https://api.ebay.com/ws/api.dll'),
  };
  api = new TradingApi(mockClient as unknown as TradingApiClient);
});

it('returns raw active listings payload from GetMyeBaySelling', async () => {
  const activeListingsResponse = {
    Ack: 'Success',
    ActiveList: {
      ItemArray: {
        Item: [
          {
            ItemID: '167382780779',
            Title: 'Bambu Lab 0.2mm Nozzle',
            SKU: 'NZ-2MM',
            Quantity: 10,
            QuantityAvailable: 4,
            SellingStatus: { CurrentPrice: { '#text': 12.99 } },
            WatchCount: 3,
            ListingType: 'FixedPriceItem',
          },
        ],
      },
      PaginationResult: { TotalNumberOfEntries: 1, TotalNumberOfPages: 1 },
    },
  };
  mockClient.execute.mockReturnValue(Effect.succeed(activeListingsResponse));

  const result = await Effect.runPromise(api.getActiveListings());

  expect(result).toBe(activeListingsResponse);
});

it('returns empty active listings payload unchanged', async () => {
  const emptyListingsResponse = {
    Ack: 'Success',
    ActiveList: {
      ItemArray: null,
      PaginationResult: { TotalNumberOfEntries: 0 },
    },
  };
  mockClient.execute.mockReturnValue(Effect.succeed(emptyListingsResponse));

  const result = await Effect.runPromise(api.getActiveListings());

  expect(result).toBe(emptyListingsResponse);
});

it('passes active listing pagination params to execute', async () => {
  mockClient.execute.mockReturnValue(
    Effect.succeed({
      Ack: 'Success',
      ActiveList: {
        ItemArray: null,
        PaginationResult: { TotalNumberOfEntries: 0 },
      },
    }),
  );

  await Effect.runPromise(api.getActiveListings({ page: 2, entriesPerPage: 25 }));

  expect(mockClient.execute).toHaveBeenCalledWith('GetMyeBaySelling', {
    ActiveList: {
      Sort: 'TimeLeft',
      Pagination: { EntriesPerPage: 25, PageNumber: 2 },
    },
  });
});

it('gets one listing by item ID', async () => {
  mockClient.execute.mockReturnValue(
    Effect.succeed({
      Ack: 'Success',
      Item: [{ ItemID: '12345', Title: 'Test', SKU: 'T1', Quantity: 5 }],
    }),
  );

  const result = await Effect.runPromise(api.getListing({ itemId: '12345' }));

  expect(mockClient.execute).toHaveBeenCalledWith('GetItem', {
    ItemID: '12345',
    DetailLevel: 'ReturnAll',
  });
  expect(result.ItemID).toBe('12345');
});

it('fails getListing when itemId is missing', async () => {
  const error = await Effect.runPromise(Effect.flip(api.getListing({ itemId: '' })));

  expect(error._tag).toBe('EndpointInputError');
  expect(error.message).toContain('itemId is required');
});

it('creates a fixed-price listing', async () => {
  mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success', ItemID: '99999' }));

  const item = { Title: 'New Item', SKU: 'NEW', StartPrice: 9.99 };
  const result = await Effect.runPromise(api.createListing({ item }));

  expect(mockClient.execute).toHaveBeenCalledWith('AddFixedPriceItem', {
    Item: item,
  });
  expect(result.ItemID).toBe('99999');
});

it('revises a fixed-price listing', async () => {
  mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success', ItemID: '12345' }));

  const result = await Effect.runPromise(
    api.reviseListing({ itemId: '12345', fields: { Quantity: 10 } }),
  );

  expect(mockClient.execute).toHaveBeenCalledWith('ReviseFixedPriceItem', {
    Item: { ItemID: '12345', Quantity: 10 },
  });
  expect(result.ItemID).toBe('12345');
});

it('fails reviseListing when itemId is missing', async () => {
  const error = await Effect.runPromise(Effect.flip(api.reviseListing({ itemId: '', fields: {} })));

  expect(error._tag).toBe('EndpointInputError');
  expect(error.message).toContain('itemId is required');
});

it('ends a fixed-price listing', async () => {
  mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success' }));

  await Effect.runPromise(api.endListing({ itemId: '12345', reason: 'NotAvailable' }));

  expect(mockClient.execute).toHaveBeenCalledWith('EndFixedPriceItem', {
    ItemID: '12345',
    EndingReason: 'NotAvailable',
  });
});

it('defaults endListing reason to NotAvailable', async () => {
  mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success' }));

  await Effect.runPromise(api.endListing({ itemId: '12345' }));

  expect(mockClient.execute).toHaveBeenCalledWith('EndFixedPriceItem', {
    ItemID: '12345',
    EndingReason: 'NotAvailable',
  });
});

it('fails endListing when itemId is missing', async () => {
  const error = await Effect.runPromise(Effect.flip(api.endListing({ itemId: '' })));

  expect(error._tag).toBe('EndpointInputError');
  expect(error.message).toContain('itemId is required');
});

it('relists an ended listing', async () => {
  mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success', ItemID: '12345' }));

  const result = await Effect.runPromise(api.relistItem({ itemId: '12345' }));

  expect(mockClient.execute).toHaveBeenCalledWith('RelistFixedPriceItem', {
    Item: { ItemID: '12345' },
  });
  expect(result.ItemID).toBe('12345');
});

it('passes relist modifications', async () => {
  mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success', ItemID: '12345' }));

  await Effect.runPromise(
    api.relistItem({ itemId: '12345', modifications: { Quantity: 20, StartPrice: 15.99 } }),
  );

  expect(mockClient.execute).toHaveBeenCalledWith('RelistFixedPriceItem', {
    Item: { ItemID: '12345', Quantity: 20, StartPrice: 15.99 },
  });
});

it('fails relistItem when itemId is missing', async () => {
  const error = await Effect.runPromise(Effect.flip(api.relistItem({ itemId: '' })));

  expect(error._tag).toBe('EndpointInputError');
  expect(error.message).toContain('itemId is required');
});

describe('sniffImageContentType', () => {
  const cases: Array<[string, Buffer, string | undefined]> = [
    ['JPEG', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), 'image/jpeg'],
    ['PNG', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png'],
    ['GIF', Buffer.from('GIF89a', 'ascii'), 'image/gif'],
    [
      'WebP',
      Buffer.concat([
        Buffer.from('RIFF', 'ascii'),
        Buffer.from([0x00, 0x00, 0x00, 0x00]),
        Buffer.from('WEBP', 'ascii'),
      ]),
      'image/webp',
    ],
    ['BMP', Buffer.from([0x42, 0x4d, 0x00, 0x00]), 'image/bmp'],
    ['little-endian TIFF', Buffer.from([0x49, 0x49, 0x2a, 0x00]), 'image/tiff'],
    ['big-endian TIFF', Buffer.from([0x4d, 0x4d, 0x00, 0x2a]), 'image/tiff'],
    ['unknown bytes', Buffer.from([0x01, 0x02, 0x03, 0x04]), undefined],
    ['too-short buffer', Buffer.from([0xff]), undefined],
  ];

  for (const [name, bytes, expected] of cases) {
    it(`detects ${name}`, () => {
      expect(sniffImageContentType(bytes)).toBe(expected);
    });
  }
});

describe('uploadSiteHostedPictures', () => {
  const successResponse = {
    Ack: 'Success',
    SiteHostedPictureDetails: { FullURL: 'https://i.ebayimg.com/images/g/abc/s-l1600.jpg' },
  };

  it('fetches an external picture URL via a pure-XML call and returns the hosted URL', async () => {
    mockClient.execute.mockReturnValue(Effect.succeed(successResponse));

    const result = await Effect.runPromise(
      api.uploadSiteHostedPictures({
        externalPictureUrl: 'https://example.com/front.jpg',
        pictureName: 'front',
      }),
    );

    expect(mockClient.execute).toHaveBeenCalledWith('UploadSiteHostedPictures', {
      PictureName: 'front',
      ExternalPictureURL: 'https://example.com/front.jpg',
    });
    expect(mockClient.uploadPicture).not.toHaveBeenCalled();
    expect(result.fullUrl).toBe('https://i.ebayimg.com/images/g/abc/s-l1600.jpg');
  });

  it('uploads resolved image bytes via multipart, sniffing the content type', async () => {
    mockClient.uploadPicture.mockReturnValue(Effect.succeed(successResponse));
    const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

    const result = await Effect.runPromise(
      api.uploadSiteHostedPictures({ imageBytes: pngBytes, fileName: 'mislabeled.jpg' }),
    );

    expect(mockClient.execute).not.toHaveBeenCalled();
    expect(mockClient.uploadPicture).toHaveBeenCalledWith(
      'UploadSiteHostedPictures',
      {},
      { data: pngBytes, contentType: 'image/png', fileName: 'mislabeled.jpg' },
    );
    expect(result.fullUrl).toBe('https://i.ebayimg.com/images/g/abc/s-l1600.jpg');
  });

  it('fails when eBay returns no SiteHostedPictureDetails.FullURL', async () => {
    mockClient.execute.mockReturnValue(Effect.succeed({ Ack: 'Success' }));

    const error = await Effect.runPromise(
      Effect.flip(
        api.uploadSiteHostedPictures({ externalPictureUrl: 'https://example.com/front.jpg' }),
      ),
    );

    expect(error._tag).toBe('EbayApiError');
    expect(error.message).toContain('no SiteHostedPictureDetails.FullURL');
  });

  it('fails with an input error when no image source is provided', async () => {
    const error = await Effect.runPromise(Effect.flip(api.uploadSiteHostedPictures({})));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('Provide one of');
  });
});
