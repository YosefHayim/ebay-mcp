import type { EbayApiClient } from '@/api/client.js';
import {
  EbayApiError,
  type EndpointInputError,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { getMediaBaseUrl } from '@/config/environment.js';
import type { components } from '@/types/sell-apps/listing-management/commerceMediaV1BetaOas3.js';
import { getErrorMessage } from '@/utils/errors.js';
import { Data, Effect } from 'effect';
import type { createInventoryItemsMethods } from './items.js';
import { createMediaAttachMethods, type MediaAttachMethods } from './mediaAttach.js';

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;

/** Media API base path; the host is `apim` rather than `api` (see {@link getMediaBaseUrl}). */
export const MEDIA_BASE_PATH = '/commerce/media/v1_beta';

/** Timeout for binary uploads, which can be far larger than JSON calls. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

/** How long {@link MediaApi.waitForVideo} waits for eBay processing by default. */
export const DEFAULT_VIDEO_WAIT_MS = 120_000;

/** Interval between video status polls. */
const DEFAULT_POLL_INTERVAL_MS = 5000;

/** Video statuses eBay treats as final. */
export const TERMINAL_VIDEO_STATUSES: ReadonlySet<string> = new Set([
  'LIVE',
  'BLOCKED',
  'PROCESSING_FAILED',
]);

/**
 * Response returned by createImageFromFile and getImage.
 *
 * @see https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/getImage
 */
export type ImageResponse = components['schemas']['ImageResponse'];

/**
 * Response returned by getVideo.
 *
 * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/getVideo
 */
export type Video = components['schemas']['Video'];

/**
 * Request body accepted by createVideo.
 *
 * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/createVideo
 */
export type CreateVideoRequest = components['schemas']['CreateVideoRequest'];

/** One file to upload, already read into memory. */
export interface MediaUpload {
  /** Caller-supplied reference, echoed back in results. */
  readonly source: string;
  /** File name sent with the multipart part. */
  readonly fileName: string;
  /** MIME type of the file contents. */
  readonly mimeType: string;
  /** File contents. */
  readonly bytes: Uint8Array;
}

/** An image hosted on eBay Picture Services. */
export interface UploadedImage {
  /** Caller-supplied reference of the uploaded file. */
  readonly source: string;
  /** Media API image ID parsed from the `Location` header, when eBay sent one. */
  readonly imageId?: string;
  /** EPS URL to place in `product.imageUrls`. */
  readonly imageUrl: string;
  /** When the unused image expires; it becomes permanent once a listing uses it. */
  readonly expirationDate?: string;
}

/** Input accepted by getImage. */
export interface ImageIdInput {
  /** Media API image identifier. */
  readonly imageId: string;
}

/** Input accepted by createVideo. */
export interface CreateVideoInput {
  /** Video title. */
  readonly title: string;
  /** Exact size in bytes of the file that will be uploaded. */
  readonly size: number;
  /** Optional description. */
  readonly description?: string;
}

/** Input accepted by uploadVideo. */
export interface UploadVideoInput {
  /** Video ID returned by createVideo. */
  readonly videoId: string;
  /** File contents; must be exactly `size` bytes long. */
  readonly bytes: Uint8Array;
}

/** Input accepted by getVideo. */
export interface VideoIdInput {
  /** Media API video identifier. */
  readonly videoId: string;
}

/** Input accepted by waitForVideo. */
export interface WaitForVideoInput extends VideoIdInput {
  /** Longest time to wait before returning the latest status. */
  readonly maxWaitMs?: number;
  /** Delay between status polls. */
  readonly pollIntervalMs?: number;
}

/** Input accepted by uploadVideoFile. */
export interface UploadVideoFileInput {
  /** File to upload. */
  readonly file: MediaUpload;
  /** Video title; defaults to the file name. */
  readonly title?: string;
  /** Optional description. */
  readonly description?: string;
  /** Longest time to wait for processing before returning. */
  readonly maxWaitMs?: number;
  /** Delay between status polls. */
  readonly pollIntervalMs?: number;
}

/** Result of uploading several images in order. */
export interface UploadImagesResult {
  /** Uploaded images in input order. */
  readonly images: readonly UploadedImage[];
}

/** Failure of one upload in a sequence, carrying what already succeeded. */
export class MediaUploadError extends Data.TaggedError('MediaUploadError')<{
  /** Reference of the file whose upload failed. */
  readonly source: string;
  /** Zero-based position of the failed file. */
  readonly index: number;
  /** Images uploaded before the failure, in order. */
  readonly uploaded: readonly UploadedImage[];
  /** Underlying failure. */
  readonly cause: unknown;
  /** Human-readable summary. */
  readonly message: string;
}> {}

const idFromLocation = (location: string | undefined): string | undefined =>
  location?.split('/').filter(Boolean).at(-1);

/** Media API resource path for an image or video ID, with the ID encoded as one path segment. */
const resourcePath = (resource: 'image' | 'video', id: string, suffix = ''): string =>
  `/${resource}/${encodeURIComponent(id)}${suffix}`;

const apiFailure =
  (method: 'GET' | 'POST', path: string) =>
  (cause: unknown): EbayApiError =>
    new EbayApiError({ method, path, cause });

const videoStatusFinal = (video: Video): boolean =>
  video.status !== undefined && TERMINAL_VIDEO_STATUSES.has(video.status);

/**
 * Media API client. Image and video uploads go to eBay's `apim` host and return
 * the artefacts (EPS URLs, video IDs) that Inventory API listings reference.
 */
export class MediaApi {
  private readonly client: EbayApiClient;

  /**
   * Uploads local media and rewrites an inventory item's `product.imageUrls` /
   * `product.videoIds` — the one composite in this surface; see {@link createMediaAttachMethods}.
   */
  public readonly attachMediaToInventoryItem: MediaAttachMethods['attachMediaToInventoryItem'];

  public constructor(client: EbayApiClient, items: InventoryItemsMethods) {
    this.client = client;
    this.attachMediaToInventoryItem = createMediaAttachMethods(
      items,
      this,
    ).attachMediaToInventoryItem;
  }

  private url(suffix: string): string {
    const config = this.client.getConfig();
    return `${getMediaBaseUrl(config.environment, config.apiBaseUrl)}${MEDIA_BASE_PATH}${suffix}`;
  }

  /**
   * Uploads one picture to eBay Picture Services.
   *
   * @param input - File name, MIME type, and contents.
   * @returns An Effect that succeeds with the EPS URL (and image ID when eBay returns one).
   *
   * @example
   * ```ts
   * const image = await Effect.runPromise(
   *   mediaApi.createImageFromFile({ source: 'front.jpg', fileName: 'front.jpg', mimeType: 'image/jpeg', bytes }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/createImageFromFile
   */
  public createImageFromFile = (
    input: MediaUpload,
  ): Effect.Effect<UploadedImage, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${MEDIA_BASE_PATH}/image/create_image_from_file`;
    const url = this.url('/image/create_image_from_file');

    return Effect.gen(function* () {
      const upload = yield* requireObjectEffect<MediaUpload>(input, 'input');
      const fileName = yield* requireStringEffect(upload.fileName, 'fileName');
      const form = new FormData();
      // Copy into a fresh ArrayBuffer-backed view: Blob rejects Node's ArrayBufferLike-typed views.
      form.append(
        'image',
        new Blob([new Uint8Array(upload.bytes)], { type: upload.mimeType }),
        fileName,
      );

      const response = yield* Effect.tryPromise({
        try: () =>
          client.postForResponse<ImageResponse | undefined>(url, form, {
            absolute: true,
            timeoutMs: UPLOAD_TIMEOUT_MS,
          }),
        catch: apiFailure('POST', path),
      });
      const imageUrl = response.data?.imageUrl;
      if (!imageUrl) {
        return yield* Effect.fail(
          new EbayApiError({
            method: 'POST',
            path,
            cause: new Error('eBay returned no imageUrl for the uploaded picture'),
          }),
        );
      }

      return {
        source: upload.source,
        imageId: idFromLocation(response.headers.location),
        imageUrl,
        expirationDate: response.data?.expirationDate,
      };
    });
  };

  /**
   * Uploads pictures one after another, keeping input order.
   *
   * @param files - Files to upload in listing order.
   * @returns An Effect with every uploaded image, or a `MediaUploadError` naming the first failure and what preceded it.
   *
   * @example
   * ```ts
   * const { images } = await Effect.runPromise(mediaApi.uploadImageFiles(files));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/createImageFromFile
   */
  public uploadImageFiles = (
    files: readonly MediaUpload[],
  ): Effect.Effect<UploadImagesResult, MediaUploadError> => {
    const createImageFromFile = this.createImageFromFile;

    return Effect.gen(function* () {
      const uploaded: UploadedImage[] = [];
      for (const [index, file] of files.entries()) {
        const image = yield* createImageFromFile(file).pipe(
          Effect.mapError(
            (cause) =>
              new MediaUploadError({
                source: file.source,
                index,
                uploaded: [...uploaded],
                cause,
                message: `upload of ${file.source} (file ${index + 1} of ${files.length}) failed: ${getErrorMessage(cause)}${uploaded.length > 0 ? `; already uploaded: ${uploaded.map((item) => item.imageUrl).join(', ')}` : ''}`,
              }),
          ),
        );
        uploaded.push(image);
      }
      return { images: uploaded };
    });
  };

  /**
   * Retrieves the EPS URL and expiry of an uploaded image.
   *
   * @param input - Media API image identifier.
   * @returns An Effect that succeeds with eBay's ImageResponse.
   *
   * @example
   * ```ts
   * const image = await Effect.runPromise(mediaApi.getImage({ imageId: 'IMG-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/getImage
   */
  public getImage = (
    input: ImageIdInput,
  ): Effect.Effect<ImageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const url = (imageId: string) => this.url(resourcePath('image', imageId));

    return Effect.gen(function* () {
      const validated = yield* requireObjectEffect<ImageIdInput>(input, 'input');
      const imageId = yield* requireStringEffect(validated.imageId, 'imageId');
      return yield* Effect.tryPromise({
        try: () => client.get<ImageResponse>(url(imageId), undefined, { absolute: true }),
        catch: apiFailure('GET', `${MEDIA_BASE_PATH}${resourcePath('image', imageId)}`),
      });
    });
  };

  /**
   * Creates a video resource that a file can then be uploaded to.
   *
   * @param input - Title, exact byte size, and optional description.
   * @returns An Effect that succeeds with the new video ID.
   *
   * @example
   * ```ts
   * const { videoId } = await Effect.runPromise(mediaApi.createVideo({ title: 'Demo', size: 1024 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/createVideo
   */
  public createVideo = (
    input: CreateVideoInput,
  ): Effect.Effect<VideoIdInput, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${MEDIA_BASE_PATH}/video`;
    const url = this.url('/video');

    return Effect.gen(function* () {
      const validated = yield* requireObjectEffect<CreateVideoInput>(input, 'input');
      const title = yield* requireStringEffect(validated.title, 'title');
      const body: CreateVideoRequest = {
        title,
        size: validated.size,
        description: validated.description,
        classification: ['ITEM'],
      };
      const response = yield* Effect.tryPromise({
        try: () => client.postForResponse<undefined>(url, body, { absolute: true }),
        catch: apiFailure('POST', path),
      });
      const videoId = idFromLocation(response.headers.location);
      if (!videoId) {
        return yield* Effect.fail(
          new EbayApiError({
            method: 'POST',
            path,
            cause: new Error('eBay returned no Location header with the new video ID'),
          }),
        );
      }
      return { videoId };
    });
  };

  /**
   * Uploads the file for a created video resource.
   *
   * @param input - Video ID and file contents (exactly the size given to createVideo).
   * @returns An Effect that succeeds once eBay accepted the bytes.
   *
   * @example
   * ```ts
   * await Effect.runPromise(mediaApi.uploadVideo({ videoId: 'VID-1', bytes }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/uploadVideo
   */
  public uploadVideo = (
    input: UploadVideoInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const url = (videoId: string) => this.url(resourcePath('video', videoId, '/upload'));

    return Effect.gen(function* () {
      const validated = yield* requireObjectEffect<UploadVideoInput>(input, 'input');
      const videoId = yield* requireStringEffect(validated.videoId, 'videoId');
      yield* Effect.tryPromise({
        try: () =>
          client.post<undefined>(url(videoId), validated.bytes, {
            absolute: true,
            timeoutMs: UPLOAD_TIMEOUT_MS,
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': String(validated.bytes.byteLength),
            },
          }),
        catch: apiFailure('POST', `${MEDIA_BASE_PATH}${resourcePath('video', videoId, '/upload')}`),
      });
    });
  };

  /**
   * Retrieves a video's metadata, processing status, and playlists.
   *
   * @param input - Media API video identifier.
   * @returns An Effect that succeeds with eBay's Video.
   *
   * @example
   * ```ts
   * const video = await Effect.runPromise(mediaApi.getVideo({ videoId: 'VID-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/getVideo
   */
  public getVideo = (
    input: VideoIdInput,
  ): Effect.Effect<Video, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const url = (videoId: string) => this.url(resourcePath('video', videoId));

    return Effect.gen(function* () {
      const validated = yield* requireObjectEffect<VideoIdInput>(input, 'input');
      const videoId = yield* requireStringEffect(validated.videoId, 'videoId');
      return yield* Effect.tryPromise({
        try: () => client.get<Video>(url(videoId), undefined, { absolute: true }),
        catch: apiFailure('GET', `${MEDIA_BASE_PATH}${resourcePath('video', videoId)}`),
      });
    });
  };

  /**
   * Polls getVideo until the status is final or the wait budget runs out. The
   * last sleep is cut to the remaining budget, so the total wait never exceeds
   * `maxWaitMs` by more than one status request.
   *
   * @param input - Video ID plus optional wait budget and poll interval.
   * @returns An Effect with the latest Video; check `status` — it may still be PROCESSING.
   *
   * @example
   * ```ts
   * const video = await Effect.runPromise(mediaApi.waitForVideo({ videoId: 'VID-1', maxWaitMs: 60_000 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/getVideo
   */
  public waitForVideo = (
    input: WaitForVideoInput,
  ): Effect.Effect<Video, EbayApiError | EndpointInputError> => {
    const getVideo = this.getVideo;
    const maxWaitMs = input.maxWaitMs ?? DEFAULT_VIDEO_WAIT_MS;
    const pollIntervalMs = input.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;

    return Effect.gen(function* () {
      let waitedMs = 0;
      let video = yield* getVideo({ videoId: input.videoId });
      while (!videoStatusFinal(video) && waitedMs < maxWaitMs) {
        const sleepMs = Math.min(pollIntervalMs, maxWaitMs - waitedMs);
        yield* Effect.sleep(sleepMs);
        waitedMs += sleepMs;
        video = yield* getVideo({ videoId: input.videoId });
      }
      return video;
    });
  };

  /**
   * Runs the whole video lifecycle: create the resource, upload the bytes, wait for processing.
   *
   * @param input - File plus optional title, description, and wait settings.
   * @returns An Effect with the Video (its `videoId` is always set); `status` is LIVE when ready.
   *
   * @example
   * ```ts
   * const video = await Effect.runPromise(mediaApi.uploadVideoFile({ file }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/video/methods/uploadVideo
   */
  public uploadVideoFile = (
    input: UploadVideoFileInput,
  ): Effect.Effect<Video, EbayApiError | EndpointInputError> => {
    const { createVideo, uploadVideo, waitForVideo } = this;

    return Effect.gen(function* () {
      const { videoId } = yield* createVideo({
        title: input.title ?? input.file.fileName,
        size: input.file.bytes.byteLength,
        description: input.description,
      });
      yield* uploadVideo({ videoId, bytes: input.file.bytes });
      const video = yield* waitForVideo({
        videoId,
        maxWaitMs: input.maxWaitMs,
        pollIntervalMs: input.pollIntervalMs,
      });
      return { ...video, videoId: video.videoId ?? videoId };
    });
  };
}
