import type { EbayApiClient } from '@/api/client.js';
import { MediaApi, type Video } from '@/api/listing-management/media.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MediaApiItems = ConstructorParameters<typeof MediaApi>[1];

const bytes = new Uint8Array([1, 2, 3, 4]);
const file = { source: '/media/front.jpg', fileName: 'front.jpg', mimeType: 'image/jpeg', bytes };

const items = {
  getInventoryItem: vi.fn(),
  createOrReplaceInventoryItem: vi.fn(),
} as unknown as MediaApiItems;

interface MockClient {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  postForResponse: ReturnType<typeof vi.fn>;
  getConfig: ReturnType<typeof vi.fn>;
}

describe('MediaApi', () => {
  let client: MockClient;
  let media: MediaApi;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      postForResponse: vi.fn(),
      getConfig: vi.fn().mockReturnValue({ environment: 'sandbox' }),
    };
    media = new MediaApi(client as unknown as EbayApiClient, items);
  });

  it('uploads a picture as multipart form data to the apim host', async () => {
    client.postForResponse.mockResolvedValue({
      status: 201,
      headers: { location: 'https://apim.sandbox.ebay.com/commerce/media/v1_beta/image/IMG-1' },
      data: {
        imageUrl: 'https://i.ebayimg.com/00/s/front.jpg',
        expirationDate: '2026-09-01T00:00:00.000Z',
      },
    });

    const image = await Effect.runPromise(media.createImageFromFile(file));

    expect(image).toEqual({
      source: '/media/front.jpg',
      imageId: 'IMG-1',
      imageUrl: 'https://i.ebayimg.com/00/s/front.jpg',
      expirationDate: '2026-09-01T00:00:00.000Z',
    });
    const [url, form, config] = client.postForResponse.mock.calls[0];
    expect(url).toBe(
      'https://apim.sandbox.ebay.com/commerce/media/v1_beta/image/create_image_from_file',
    );
    expect(form).toBeInstanceOf(FormData);
    const part = (form as FormData).get('image');
    expect(part).toBeInstanceOf(Blob);
    expect((part as File).name).toBe('front.jpg');
    expect((part as Blob).type).toBe('image/jpeg');
    expect(config).toMatchObject({ absolute: true });
    expect(config.timeoutMs).toBeGreaterThan(30_000);
  });

  it('honours the proxy base URL override for the Media API host', async () => {
    client.getConfig.mockReturnValue({
      environment: 'production',
      apiBaseUrl: 'http://proxy:8080',
    });
    client.postForResponse.mockResolvedValue({ status: 201, headers: {}, data: { imageUrl: 'u' } });

    await Effect.runPromise(media.createImageFromFile(file));

    expect(client.postForResponse.mock.calls[0][0]).toBe(
      'http://proxy:8080/commerce/media/v1_beta/image/create_image_from_file',
    );
  });

  it('fails when eBay returns no image URL', async () => {
    client.postForResponse.mockResolvedValue({ status: 201, headers: {}, data: {} });

    const error = await Effect.runPromise(Effect.flip(media.createImageFromFile(file)));

    expect(error._tag).toBe('EbayApiError');
    expect(error.message).toContain('no imageUrl');
  });

  it('uploads pictures in order and reports what succeeded before a failure', async () => {
    client.postForResponse
      .mockResolvedValueOnce({
        status: 201,
        headers: {},
        data: { imageUrl: 'https://i.ebayimg.com/1.jpg' },
      })
      .mockRejectedValueOnce(new Error('boom'));
    const second = { ...file, source: '/media/back.jpg', fileName: 'back.jpg' };

    const error = await Effect.runPromise(Effect.flip(media.uploadImageFiles([file, second])));

    expect(error).toMatchObject({ _tag: 'MediaUploadError', source: '/media/back.jpg', index: 1 });
    expect(error.uploaded.map((image) => image.imageUrl)).toEqual(['https://i.ebayimg.com/1.jpg']);
    expect(error.message).toContain('file 2 of 2');
    expect(error.message).toContain('https://i.ebayimg.com/1.jpg');
  });

  it('creates a video and reads the ID from the Location header', async () => {
    client.postForResponse.mockResolvedValue({
      status: 201,
      headers: { location: 'https://apim.sandbox.ebay.com/commerce/media/v1_beta/video/VID-1' },
      data: undefined,
    });

    const result = await Effect.runPromise(media.createVideo({ title: 'Demo', size: 4 }));

    expect(result).toEqual({ videoId: 'VID-1' });
    expect(client.postForResponse).toHaveBeenCalledWith(
      'https://apim.sandbox.ebay.com/commerce/media/v1_beta/video',
      { title: 'Demo', size: 4, description: undefined, classification: ['ITEM'] },
      { absolute: true },
    );
  });

  it('fails createVideo without a Location header', async () => {
    client.postForResponse.mockResolvedValue({ status: 201, headers: {}, data: undefined });

    const error = await Effect.runPromise(
      Effect.flip(media.createVideo({ title: 'Demo', size: 4 })),
    );

    expect(error.message).toContain('Location');
  });

  it('uploads video bytes as an octet stream with the exact length', async () => {
    client.post.mockResolvedValue(undefined);

    await Effect.runPromise(media.uploadVideo({ videoId: 'VID-1', bytes }));

    const [url, body, config] = client.post.mock.calls[0];
    expect(url).toBe('https://apim.sandbox.ebay.com/commerce/media/v1_beta/video/VID-1/upload');
    expect(body).toBe(bytes);
    expect(config.headers).toEqual({
      'Content-Type': 'application/octet-stream',
      'Content-Length': '4',
    });
    expect(config.absolute).toBe(true);
  });

  it('polls getVideo until a terminal status', async () => {
    client.get
      .mockResolvedValueOnce({ videoId: 'VID-1', status: 'PROCESSING' })
      .mockResolvedValueOnce({ videoId: 'VID-1', status: 'PROCESSING' })
      .mockResolvedValueOnce({ videoId: 'VID-1', status: 'LIVE' });

    const video = await Effect.runPromise(
      media.waitForVideo({ videoId: 'VID-1', maxWaitMs: 1000, pollIntervalMs: 1 }),
    );

    expect(video.status).toBe('LIVE');
    expect(client.get).toHaveBeenCalledTimes(3);
  });

  it('returns the latest status when the wait budget runs out', async () => {
    client.get.mockResolvedValue({ videoId: 'VID-1', status: 'PROCESSING' });

    const video = await Effect.runPromise(
      media.waitForVideo({ videoId: 'VID-1', maxWaitMs: 2, pollIntervalMs: 1 }),
    );

    expect(video.status).toBe('PROCESSING');
    expect(client.get).toHaveBeenCalledTimes(3);
  });

  it('runs the whole video lifecycle and always returns the video ID', async () => {
    client.postForResponse.mockResolvedValue({
      status: 201,
      headers: { location: '/commerce/media/v1_beta/video/VID-9' },
      data: undefined,
    });
    client.post.mockResolvedValue(undefined);
    client.get.mockResolvedValue({ status: 'LIVE' } satisfies Video);

    const video = await Effect.runPromise(
      media.uploadVideoFile({
        file: { ...file, fileName: 'clip.mp4', mimeType: 'video/mp4' },
        pollIntervalMs: 1,
      }),
    );

    expect(video).toEqual({ status: 'LIVE', videoId: 'VID-9' });
    expect(client.postForResponse.mock.calls[0][1]).toMatchObject({ title: 'clip.mp4', size: 4 });
  });
});
