import { type EbayApiError, EndpointInputError } from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/listing-management/sellInventoryV1Oas3.js';
import { getErrorMessage } from '@/utils/errors.js';
import type { LocalMediaFile } from '@/utils/localMedia.js';
import { Data, Effect } from 'effect';
import type { createInventoryItemsMethods } from './items.js';
import type { MediaApi, UploadedImage, Video } from './media.js';

type InventoryItemsMethods = ReturnType<typeof createInventoryItemsMethods>;

type InventoryItem = components['schemas']['InventoryItem'];
type InventoryItemWithSku = components['schemas']['InventoryItemWithSkuLocaleGroupid'];
type Product = components['schemas']['Product'];

/** Input accepted by attachMediaToInventoryItem. */
export interface AttachMediaInput {
  /** Seller-defined SKU of the inventory item to update. */
  readonly sku: string;
  /** Validated image files in listing order. */
  readonly images: readonly LocalMediaFile[];
  /** Validated video files. */
  readonly videos: readonly LocalMediaFile[];
  /**
   * Replace the item's current media instead of appending to it. Only the
   * families with supplied files are replaced: images-only input keeps the
   * item's videos, and videos-only input keeps its images.
   */
  readonly replaceExisting?: boolean;
  /** Update the item with the successful uploads even when some failed. */
  readonly allowPartial?: boolean;
  /** Longest time to wait for each video to process. */
  readonly maxWaitMs?: number;
  /** Delay between video status polls. */
  readonly pollIntervalMs?: number;
}

/** Per-file outcome of an attach run. */
export interface MediaUploadOutcome {
  /** Caller-supplied reference. */
  readonly source: string;
  /** Media family. */
  readonly kind: 'image' | 'video';
  /** `uploaded` is final; `processing` means eBay is still transcoding the video; `failed` was not attached. */
  readonly status: 'uploaded' | 'processing' | 'failed';
  /** EPS URL for uploaded images. */
  readonly imageUrl?: string;
  /** Media API image ID when eBay returned one. */
  readonly imageId?: string;
  /** Expiry of an unused image. */
  readonly expirationDate?: string;
  /** Video ID for uploaded or processing videos. */
  readonly videoId?: string;
  /** eBay's video status. */
  readonly videoStatus?: string;
  /** Why the upload failed. */
  readonly error?: string;
}

/** Result of attachMediaToInventoryItem. */
export interface AttachMediaResult {
  /** Seller-defined SKU. */
  readonly sku: string;
  /** Whether the inventory item was rewritten. */
  readonly updated: boolean;
  /** Image outcomes in input order. */
  readonly images: readonly MediaUploadOutcome[];
  /** Video outcomes in input order. */
  readonly videos: readonly MediaUploadOutcome[];
  /** `product.imageUrls` after the update (or as it would have been). */
  readonly imageUrls: readonly string[];
  /** `product.videoIds` after the update (or as it would have been). */
  readonly videoIds: readonly string[];
}

/** Attach run that uploaded media but left the inventory item untouched. */
export class MediaAttachError extends Data.TaggedError('MediaAttachError')<{
  /** Human-readable summary including the per-file outcomes. */
  readonly message: string;
  /** Per-file outcomes; `updated` is always false. */
  readonly result: AttachMediaResult;
}> {}

/** Methods added onto {@link MediaApi} by {@link createMediaAttachMethods}. */
export interface MediaAttachMethods {
  attachMediaToInventoryItem: (
    input: AttachMediaInput,
  ) => Effect.Effect<AttachMediaResult, EbayApiError | EndpointInputError | MediaAttachError>;
}

/** Media fields of `product` that the attach run rewrites. */
interface ProductMedia {
  readonly imageUrls: string[];
  readonly videoIds: string[];
}

const dedupe = (values: readonly string[]): string[] => [...new Set(values)];

/** Keeps only the fields createOrReplaceInventoryItem accepts (drops sku/group metadata). */
const toInventoryItemBody = (item: InventoryItemWithSku): InventoryItem => ({
  availability: item.availability,
  condition: item.condition,
  conditionDescription: item.conditionDescription,
  conditionDescriptors: item.conditionDescriptors,
  packageWeightAndSize: item.packageWeightAndSize,
  product: item.product,
});

/** `Content-Language` value for an inventory item locale such as `en_US`. */
const contentLanguageOf = (locale: string | undefined): string | undefined =>
  locale?.replace('_', '-');

/**
 * Merges freshly uploaded media into the product's current media. With
 * `replaceExisting`, a family is replaced only when the caller supplied files
 * for it; the other family is carried over untouched.
 */
const mergeMedia = (
  product: Product,
  input: AttachMediaInput,
  uploaded: ProductMedia,
): ProductMedia => {
  const replaceImages = input.replaceExisting === true && input.images.length > 0;
  const replaceVideos = input.replaceExisting === true && input.videos.length > 0;
  return {
    imageUrls: dedupe(
      replaceImages ? uploaded.imageUrls : [...(product.imageUrls ?? []), ...uploaded.imageUrls],
    ),
    videoIds: dedupe(
      replaceVideos ? uploaded.videoIds : [...(product.videoIds ?? []), ...uploaded.videoIds],
    ),
  };
};

/** Media references from the outcomes that can go onto the item. */
const uploadedMedia = (
  images: readonly MediaUploadOutcome[],
  videos: readonly MediaUploadOutcome[],
): ProductMedia => ({
  imageUrls: images.flatMap((outcome) => (outcome.imageUrl ? [outcome.imageUrl] : [])),
  videoIds: videos.flatMap((outcome) =>
    outcome.status !== 'failed' && outcome.videoId ? [outcome.videoId] : [],
  ),
});

const imageOutcome = (image: UploadedImage): MediaUploadOutcome => ({
  source: image.source,
  kind: 'image',
  status: 'uploaded',
  imageUrl: image.imageUrl,
  imageId: image.imageId,
  expirationDate: image.expirationDate,
});

const videoOutcome = (source: string, video: Video): MediaUploadOutcome => {
  const base = {
    source,
    kind: 'video' as const,
    videoId: video.videoId,
    videoStatus: video.status,
  };
  if (video.status === 'LIVE') {
    return { ...base, status: 'uploaded' };
  }
  if (video.status === 'BLOCKED' || video.status === 'PROCESSING_FAILED') {
    const reasons = video.moderation?.rejectReasons?.join(', ');
    return {
      ...base,
      status: 'failed',
      error: video.statusMessage ?? reasons ?? `eBay reported ${video.status}`,
    };
  }
  return { ...base, status: 'processing' };
};

const failedOutcome = (
  file: LocalMediaFile,
  kind: 'image' | 'video',
  cause: unknown,
): MediaUploadOutcome => ({
  source: file.source,
  kind,
  status: 'failed',
  error: getErrorMessage(cause),
});

const attachFailure = (summary: string, result: AttachMediaResult): MediaAttachError =>
  new MediaAttachError({
    message: `${summary}. Results: ${JSON.stringify({ images: result.images, videos: result.videos })}`,
    result,
  });

/** Uploads every file, turning each failure into a `failed` outcome instead of aborting. */
const uploadAll = (
  media: MediaApi,
  input: AttachMediaInput,
): Effect.Effect<{ images: MediaUploadOutcome[]; videos: MediaUploadOutcome[] }> =>
  Effect.gen(function* () {
    const images = yield* Effect.forEach(input.images, (file) =>
      media.createImageFromFile(file).pipe(
        Effect.map(imageOutcome),
        Effect.catchAll((cause) => Effect.succeed(failedOutcome(file, 'image', cause))),
      ),
    );
    const videos = yield* Effect.forEach(input.videos, (file) =>
      media
        .uploadVideoFile({
          file,
          maxWaitMs: input.maxWaitMs,
          pollIntervalMs: input.pollIntervalMs,
        })
        .pipe(
          Effect.map((video) => videoOutcome(file.source, video)),
          Effect.catchAll((cause) => Effect.succeed(failedOutcome(file, 'video', cause))),
        ),
    );
    return { images, videos };
  });

/**
 * Builds the attach orchestration over the inventory-item and media primitives.
 *
 * This is deliberately the one composite in the media surface: it checks that the
 * inventory item exists, uploads every file, then reads the item again right
 * before the write and rewrites only `product.imageUrls` / `product.videoIds`
 * on that fresh copy, so edits made during the uploads survive. It never
 * publishes an offer, and it leaves the item untouched when any upload fails
 * unless `allowPartial` is set.
 *
 * @param items - Inventory item methods used to read and rewrite the item.
 * @param media - Media API used for the uploads.
 * @returns The attach method map to merge onto {@link MediaApi}.
 *
 * @example
 * ```ts
 * const { attachMediaToInventoryItem } = createMediaAttachMethods(items, media);
 * ```
 */
export const createMediaAttachMethods = (
  items: InventoryItemsMethods,
  media: MediaApi,
): MediaAttachMethods => ({
  attachMediaToInventoryItem: (input) =>
    Effect.gen(function* () {
      const total = input.images.length + input.videos.length;
      if (total === 0) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'imagePaths',
            message: 'provide at least one image or video to attach',
          }),
        );
      }
      // Existence check before any upload; the write below re-reads the item.
      const snapshot = yield* items.getInventoryItem({ sku: input.sku });

      const { images, videos } = yield* uploadAll(media, input);
      const failed = [...images, ...videos].filter((outcome) => outcome.status === 'failed');
      const uploaded = uploadedMedia(images, videos);
      const result: AttachMediaResult = {
        sku: input.sku,
        updated: false,
        images,
        videos,
        ...mergeMedia(snapshot.product ?? {}, input, uploaded),
      };

      if (failed.length > 0 && !input.allowPartial) {
        return yield* Effect.fail(
          attachFailure(
            `${failed.length} of ${total} uploads failed; inventory item ${input.sku} was not updated (pass allowPartial: true to attach the successful ones)`,
            result,
          ),
        );
      }
      if (uploaded.imageUrls.length + uploaded.videoIds.length === 0) {
        return yield* Effect.fail(
          attachFailure(
            `no media was uploaded successfully; inventory item ${input.sku} was not updated`,
            result,
          ),
        );
      }

      // Re-read right before the complete-replacement PUT: the uploads can take
      // minutes, and the earlier snapshot must not overwrite edits made meanwhile.
      const latest = yield* items.getInventoryItem({ sku: input.sku });
      const product = latest.product ?? {};
      const merged = mergeMedia(product, input, uploaded);
      yield* items.createOrReplaceInventoryItem({
        sku: input.sku,
        contentLanguage: contentLanguageOf(latest.locale),
        body: { ...toInventoryItemBody(latest), product: { ...product, ...merged } },
      });

      return { ...result, ...merged, updated: true };
    }),
});
