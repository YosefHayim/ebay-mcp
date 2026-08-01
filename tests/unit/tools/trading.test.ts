import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import type { EbaySellerApi } from '@/api/index.js';
import { EndpointInputError } from '@/api/shared/request.js';
import { executeTool } from '@/tools/index.js';
import {
  MAX_BASE64_CHARS,
  MAX_IMAGE_BYTES,
  resolveUploadImageInput,
} from '@/tools/trading/uploadImageInput.js';
import { Cause, Effect, Exit } from 'effect';

/** Directories created for filePath tests, cleaned up after each test. */
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

/** Run the image resolver and return the tagged input error it fails with. */
const expectUploadInputError = async (
  input: Parameters<typeof resolveUploadImageInput>[0],
): Promise<EndpointInputError> => {
  const exit = await Effect.runPromiseExit(resolveUploadImageInput(input));
  expect(Exit.isFailure(exit)).toBe(true);
  if (!Exit.isFailure(exit)) {
    throw new Error('expected the resolver to fail');
  }
  const error = Cause.squash(exit.cause);
  if (!(error instanceof EndpointInputError)) {
    throw new Error(`expected an EndpointInputError, got ${String(error)}`);
  }
  return error;
};

const createTradingApiMock = (): EbaySellerApi =>
  ({
    trading: {
      getActiveListings: vi.fn(),
      getListing: vi.fn(),
      createListing: vi.fn(),
      reviseListing: vi.fn(),
      endListing: vi.fn(),
      relistItem: vi.fn(),
      uploadSiteHostedPictures: vi.fn(),
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

it('resolves an external picture URL to API input for uploadSiteHostedPictures', async () => {
  const api = createTradingApiMock();

  vi.mocked(api.trading.uploadSiteHostedPictures).mockReturnValue(
    Effect.succeed({ fullUrl: 'https://i.ebayimg.com/x.jpg' }),
  );

  await executeTool(api, 'ebay_upload_site_hosted_pictures', {
    externalPictureUrl: 'https://example.com/photo.jpg',
    pictureName: 'front',
  });

  expect(api.trading.uploadSiteHostedPictures).toHaveBeenCalledWith({
    externalPictureUrl: 'https://example.com/photo.jpg',
    pictureName: 'front',
  });
});

it('decodes base64 to image bytes for uploadSiteHostedPictures', async () => {
  const api = createTradingApiMock();
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

  vi.mocked(api.trading.uploadSiteHostedPictures).mockReturnValue(
    Effect.succeed({ fullUrl: 'https://i.ebayimg.com/x.jpg' }),
  );

  await executeTool(api, 'ebay_upload_site_hosted_pictures', {
    imageBase64: bytes.toString('base64'),
  });

  expect(api.trading.uploadSiteHostedPictures).toHaveBeenCalledWith({ imageBytes: bytes });
});

it('rejects invalid base64 with an imageBase64 input error', async () => {
  const error = await expectUploadInputError({ imageBase64: 'not valid base64 @@@' });

  expect(error.parameter).toBe('imageBase64');
  expect(error.message).toMatch(/not valid base64/i);
});

it('rejects oversized base64 before decoding, with an imageBase64 input error', async () => {
  const error = await expectUploadInputError({ imageBase64: 'A'.repeat(MAX_BASE64_CHARS + 1) });

  expect(error.parameter).toBe('imageBase64');
  expect(error.message).toMatch(/too large/i);
});

it('rejects a request with no image source using an imageSource input error', async () => {
  const error = await expectUploadInputError({ pictureName: 'front' });

  expect(error.parameter).toBe('imageSource');
  expect(error.message).toMatch(/provide one of/i);
});

it('rejects a request with multiple image sources using an imageSource input error', async () => {
  const error = await expectUploadInputError({
    filePath: '/tmp/front.jpg',
    externalPictureUrl: 'https://example.com/photo.jpg',
  });

  expect(error.parameter).toBe('imageSource');
  expect(error.message).toMatch(/only one of/i);
});

it('reads a local image file into imageBytes with its basename', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ebay-upload-'));
  tempDirs.push(dir);
  const filePath = join(dir, 'front.jpg');
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  await writeFile(filePath, bytes);

  const resolved = await Effect.runPromise(resolveUploadImageInput({ filePath }));

  expect(resolved.fileName).toBe('front.jpg');
  expect(Buffer.isBuffer(resolved.imageBytes)).toBe(true);
  expect(Buffer.from(resolved.imageBytes as Buffer)).toEqual(bytes);
});

it('rejects a non-regular file with a filePath input error', async () => {
  // /dev/null is a character device: stat reports a tiny size but it is not a
  // regular file, so the resolver must reject it rather than read it.
  const error = await expectUploadInputError({ filePath: '/dev/null' });

  expect(error.parameter).toBe('filePath');
  expect(error.message).toMatch(/not a regular file/i);
});

it('reports a filePath input error when the file does not exist', async () => {
  const error = await expectUploadInputError({ filePath: '/nonexistent/path/to/front.jpg' });

  expect(error.parameter).toBe('filePath');
  expect(error.message).toMatch(/failed to read image file/i);
});

it('rejects a file larger than the eBay Picture Services size cap', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ebay-upload-big-'));
  tempDirs.push(dir);
  const filePath = join(dir, 'huge.jpg');
  await writeFile(filePath, Buffer.alloc(MAX_IMAGE_BYTES + 16));

  const error = await expectUploadInputError({ filePath });

  expect(error.parameter).toBe('filePath');
  expect(error.message).toMatch(/over the .* limit/i);
});
