import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { TaxonomyApi } from '@/api/listing-metadata/taxonomy.js';
import { MAX_INLINE_DOWNLOAD_BYTES } from '@/api/shared/download.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const TREE = '/commerce/taxonomy/v1/category_tree';
const client = { get: vi.fn(), getForResponse: vi.fn() };
// TaxonomyApi only reaches these two client methods for the endpoints under test.
const api = new TaxonomyApi(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('TaxonomyApi fetchItemAspects', () => {
  it('downloads the gzipped aspects file as bytes with its content type and file name', async () => {
    const gzip = Buffer.from([0x1f, 0x8b, 0x08, 0x00]);
    client.getForResponse.mockResolvedValue({
      data: gzip,
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'content-disposition': 'attachment; filename="FetchItemAspectsResponse.gz"',
      },
    });

    const file = await Effect.runPromise(api.fetchItemAspects({ categoryTreeId: '3' }));

    expect(file).toEqual({
      bytes: gzip,
      contentType: 'application/octet-stream',
      fileName: 'FetchItemAspectsResponse.gz',
    });
    expect(client.getForResponse).toHaveBeenCalledWith(`${TREE}/3/fetch_item_aspects`, undefined, {
      timeoutMs: 120_000,
      responseType: 'arraybuffer',
      maxBytes: MAX_INLINE_DOWNLOAD_BYTES,
    });
  });

  it('encodes the category tree ID into the path', async () => {
    client.getForResponse.mockResolvedValue({ data: Buffer.alloc(1), status: 200, headers: {} });

    await Effect.runPromise(api.fetchItemAspects({ categoryTreeId: 'A/B' }));

    expect(client.getForResponse.mock.calls[0]?.[0]).toBe(`${TREE}/A%2FB/fetch_item_aspects`);
  });

  it('fails with DownloadTooLargeError when the file exceeds the inline cap', async () => {
    client.getForResponse.mockResolvedValue({
      data: Buffer.alloc(MAX_INLINE_DOWNLOAD_BYTES + 1),
      status: 200,
      headers: { 'content-type': 'application/octet-stream' },
    });

    const error = await Effect.runPromise(
      Effect.flip(api.fetchItemAspects({ categoryTreeId: '0' })),
    );

    expect(error).toMatchObject({
      _tag: 'DownloadTooLargeError',
      path: `${TREE}/0/fetch_item_aspects`,
      limit: MAX_INLINE_DOWNLOAD_BYTES,
    });
  });

  it('rejects a missing category tree ID before any request', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.fetchItemAspects(invalidInput({ categoryTreeId: '' }))),
    );

    expect(error).toMatchObject({ _tag: 'EndpointInputError', parameter: 'categoryTreeId' });
    expect(client.getForResponse).not.toHaveBeenCalled();
  });
});

describe('TaxonomyApi getExpiredCategories', () => {
  it('GETs the expired-category mappings for the tree', async () => {
    const response = { expiredCategories: [{ fromCategoryId: '1', toCategoryId: '2' }] };
    client.get.mockResolvedValue(response);

    const result = await Effect.runPromise(api.getExpiredCategories({ categoryTreeId: '0' }));

    expect(result).toBe(response);
    expect(client.get).toHaveBeenCalledWith(`${TREE}/0/get_expired_categories`);
  });

  it('passes an empty HTTP 204 through as undefined', async () => {
    client.get.mockResolvedValue(undefined);

    const result = await Effect.runPromise(api.getExpiredCategories({ categoryTreeId: '0' }));

    expect(result).toBeUndefined();
  });

  it('wraps eBay failures in a tagged EbayApiError', async () => {
    client.get.mockRejectedValue(new Error('62004 category tree not found'));

    const error = await Effect.runPromise(
      Effect.flip(api.getExpiredCategories({ categoryTreeId: '999' })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'GET',
      path: `${TREE}/999/get_expired_categories`,
    });
  });
});
