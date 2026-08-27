import type { MediaApi } from '@/api/listing-management/media.js';
import { createMediaAttachMethods } from '@/api/listing-management/mediaAttach.js';
import type { LocalMediaFile } from '@/utils/localMedia.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type AttachItems = Parameters<typeof createMediaAttachMethods>[0];

const mediaFile = (source: string, kind: 'image' | 'video'): LocalMediaFile => ({
  source,
  path: source,
  fileName: source.split('/').at(-1) ?? source,
  mimeType: kind === 'image' ? 'image/jpeg' : 'video/mp4',
  size: 4,
  kind,
  bytes: Buffer.from([1, 2, 3, 4]),
});

const existingItem = {
  sku: 'SKU-1',
  locale: 'en_US',
  condition: 'USED_GOOD',
  availability: { shipToLocationAvailability: { quantity: 1 } },
  product: {
    title: 'Mega Drive',
    imageUrls: ['https://i.ebayimg.com/old.jpg'],
    aspects: { Brand: ['Sega'] },
  },
  groupIds: ['G1'],
};

interface MockItems {
  getInventoryItem: ReturnType<typeof vi.fn>;
  createOrReplaceInventoryItem: ReturnType<typeof vi.fn>;
}

interface MockMedia {
  createImageFromFile: ReturnType<typeof vi.fn>;
  uploadVideoFile: ReturnType<typeof vi.fn>;
}

describe('attachMediaToInventoryItem', () => {
  let items: MockItems;
  let media: MockMedia;
  let attach: ReturnType<typeof createMediaAttachMethods>['attachMediaToInventoryItem'];

  beforeEach(() => {
    items = {
      getInventoryItem: vi.fn().mockReturnValue(Effect.succeed(existingItem)),
      createOrReplaceInventoryItem: vi.fn().mockReturnValue(Effect.succeed(undefined)),
    };
    media = {
      createImageFromFile: vi.fn((file: LocalMediaFile) =>
        Effect.succeed({ source: file.source, imageUrl: `https://i.ebayimg.com/${file.fileName}` }),
      ),
      uploadVideoFile: vi.fn(() => Effect.succeed({ videoId: 'VID-1', status: 'LIVE' })),
    };
    ({ attachMediaToInventoryItem: attach } = createMediaAttachMethods(
      items as unknown as AttachItems,
      media as unknown as MediaApi,
    ));
  });

  it('appends uploaded media in order and preserves the rest of the item', async () => {
    const result = await Effect.runPromise(
      attach({
        sku: 'SKU-1',
        images: [mediaFile('/m/a.jpg', 'image'), mediaFile('/m/b.jpg', 'image')],
        videos: [mediaFile('/m/clip.mp4', 'video')],
      }),
    );

    expect(result.updated).toBe(true);
    expect(result.imageUrls).toEqual([
      'https://i.ebayimg.com/old.jpg',
      'https://i.ebayimg.com/a.jpg',
      'https://i.ebayimg.com/b.jpg',
    ]);
    expect(result.videoIds).toEqual(['VID-1']);
    expect(items.createOrReplaceInventoryItem).toHaveBeenCalledWith({
      sku: 'SKU-1',
      contentLanguage: 'en-US',
      body: {
        availability: existingItem.availability,
        condition: 'USED_GOOD',
        conditionDescription: undefined,
        conditionDescriptors: undefined,
        packageWeightAndSize: undefined,
        product: {
          title: 'Mega Drive',
          aspects: { Brand: ['Sega'] },
          imageUrls: result.imageUrls,
          videoIds: ['VID-1'],
        },
      },
    });
  });

  it('replaces existing media when asked', async () => {
    const result = await Effect.runPromise(
      attach({
        sku: 'SKU-1',
        images: [mediaFile('/m/a.jpg', 'image')],
        videos: [],
        replaceExisting: true,
      }),
    );

    expect(result.imageUrls).toEqual(['https://i.ebayimg.com/a.jpg']);
  });

  it('replaces only the media family the caller supplied', async () => {
    const withVideo = {
      ...existingItem,
      product: { ...existingItem.product, videoIds: ['VID-OLD'] },
    };
    items.getInventoryItem.mockReturnValue(Effect.succeed(withVideo));

    const imagesOnly = await Effect.runPromise(
      attach({
        sku: 'SKU-1',
        images: [mediaFile('/m/a.jpg', 'image')],
        videos: [],
        replaceExisting: true,
      }),
    );
    expect(imagesOnly.imageUrls).toEqual(['https://i.ebayimg.com/a.jpg']);
    expect(imagesOnly.videoIds).toEqual(['VID-OLD']);

    const videosOnly = await Effect.runPromise(
      attach({
        sku: 'SKU-1',
        images: [],
        videos: [mediaFile('/m/clip.mp4', 'video')],
        replaceExisting: true,
      }),
    );
    expect(videosOnly.imageUrls).toEqual(['https://i.ebayimg.com/old.jpg']);
    expect(videosOnly.videoIds).toEqual(['VID-1']);
    expect(items.createOrReplaceInventoryItem).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          product: expect.objectContaining({
            imageUrls: ['https://i.ebayimg.com/old.jpg'],
            videoIds: ['VID-1'],
          }),
        }),
      }),
    );
  });

  it('writes onto the item as it is right before the update, not the earlier snapshot', async () => {
    const edited = {
      ...existingItem,
      availability: { shipToLocationAvailability: { quantity: 7 } },
      product: {
        ...existingItem.product,
        title: 'Mega Drive II',
        imageUrls: ['https://i.ebayimg.com/old.jpg', 'https://i.ebayimg.com/meanwhile.jpg'],
      },
    };
    items.getInventoryItem
      .mockReturnValueOnce(Effect.succeed(existingItem))
      .mockReturnValueOnce(Effect.succeed(edited));

    const result = await Effect.runPromise(
      attach({ sku: 'SKU-1', images: [mediaFile('/m/a.jpg', 'image')], videos: [] }),
    );

    expect(items.getInventoryItem).toHaveBeenCalledTimes(2);
    expect(result.imageUrls).toEqual([
      'https://i.ebayimg.com/old.jpg',
      'https://i.ebayimg.com/meanwhile.jpg',
      'https://i.ebayimg.com/a.jpg',
    ]);
    expect(items.createOrReplaceInventoryItem).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          availability: { shipToLocationAvailability: { quantity: 7 } },
          product: expect.objectContaining({ title: 'Mega Drive II', imageUrls: result.imageUrls }),
        }),
      }),
    );
  });

  it('sends the item locale as Content-Language and omits it when eBay returned none', async () => {
    items.getInventoryItem.mockReturnValue(Effect.succeed({ ...existingItem, locale: 'de_DE' }));
    await Effect.runPromise(
      attach({ sku: 'SKU-1', images: [mediaFile('/m/a.jpg', 'image')], videos: [] }),
    );
    expect(items.createOrReplaceInventoryItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ contentLanguage: 'de-DE' }),
    );

    items.getInventoryItem.mockReturnValue(Effect.succeed({ ...existingItem, locale: undefined }));
    await Effect.runPromise(
      attach({ sku: 'SKU-1', images: [mediaFile('/m/a.jpg', 'image')], videos: [] }),
    );
    expect(items.createOrReplaceInventoryItem).toHaveBeenLastCalledWith(
      expect.objectContaining({ contentLanguage: undefined }),
    );
  });

  it('leaves the item untouched when any upload fails', async () => {
    media.createImageFromFile.mockImplementationOnce(() => Effect.fail(new Error('EPS down')));

    const error = await Effect.runPromise(
      Effect.flip(
        attach({
          sku: 'SKU-1',
          images: [mediaFile('/m/a.jpg', 'image'), mediaFile('/m/b.jpg', 'image')],
          videos: [],
        }),
      ),
    );

    expect(error._tag).toBe('MediaAttachError');
    expect(error.message).toContain('1 of 2 uploads failed');
    expect(error.message).toContain('allowPartial');
    if (error._tag === 'MediaAttachError') {
      expect(error.result.updated).toBe(false);
      expect(error.result.images).toEqual([
        { source: '/m/a.jpg', kind: 'image', status: 'failed', error: 'EPS down' },
        expect.objectContaining({ source: '/m/b.jpg', status: 'uploaded' }),
      ]);
    }
    expect(items.createOrReplaceInventoryItem).not.toHaveBeenCalled();
    expect(items.getInventoryItem).toHaveBeenCalledTimes(1);
  });

  it('attaches the successful uploads when allowPartial is set', async () => {
    media.createImageFromFile.mockImplementationOnce(() => Effect.fail(new Error('EPS down')));

    const result = await Effect.runPromise(
      attach({
        sku: 'SKU-1',
        images: [mediaFile('/m/a.jpg', 'image'), mediaFile('/m/b.jpg', 'image')],
        videos: [],
        allowPartial: true,
      }),
    );

    expect(result.updated).toBe(true);
    expect(result.imageUrls).toEqual([
      'https://i.ebayimg.com/old.jpg',
      'https://i.ebayimg.com/b.jpg',
    ]);
    expect(result.images[0].status).toBe('failed');
  });

  it('treats a blocked video as a failure and a processing one as attachable', async () => {
    media.uploadVideoFile
      .mockReturnValueOnce(
        Effect.succeed({
          videoId: 'VID-BAD',
          status: 'BLOCKED',
          moderation: { rejectReasons: ['COPYRIGHT'] },
        }),
      )
      .mockReturnValueOnce(Effect.succeed({ videoId: 'VID-SLOW', status: 'PROCESSING' }));

    const blocked = await Effect.runPromise(
      Effect.flip(attach({ sku: 'SKU-1', images: [], videos: [mediaFile('/m/bad.mp4', 'video')] })),
    );
    expect(blocked.message).toContain('COPYRIGHT');

    const slow = await Effect.runPromise(
      attach({ sku: 'SKU-1', images: [], videos: [mediaFile('/m/slow.mp4', 'video')] }),
    );
    expect(slow.videos[0]).toMatchObject({ status: 'processing', videoId: 'VID-SLOW' });
    expect(slow.videoIds).toEqual(['VID-SLOW']);
  });

  it('fails before reading the item when nothing was given', async () => {
    const error = await Effect.runPromise(
      Effect.flip(attach({ sku: 'SKU-1', images: [], videos: [] })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(items.getInventoryItem).not.toHaveBeenCalled();
  });

  it('propagates a missing inventory item without uploading anything', async () => {
    items.getInventoryItem.mockReturnValue(Effect.fail(new Error('404')));

    await expect(
      Effect.runPromise(
        attach({ sku: 'SKU-404', images: [mediaFile('/m/a.jpg', 'image')], videos: [] }),
      ),
    ).rejects.toThrow('404');
    expect(media.createImageFromFile).not.toHaveBeenCalled();
  });
});
