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

/** Input accepted by attachMediaToInventoryItem. */
export interface AttachMediaInput {
  /** Seller-defined SKU of the inventory item to update. */
  readonly sku: string;
  /** Validated image files in listing order. */
  readonly images: readonly LocalMediaFile[];
  /** Validated video files. */
  readonly videos: readonly LocalMediaFile[];
  /** Replace the item's current media instead of appending to it. */
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

/**
 * Builds the attach orchestration over the inventory-item and media primitives.
 *
 * This is deliberately the one composite in the media surface: it reads the
 * inventory item, uploads every file, and rewrites only `product.imageUrls` /
 * `product.videoIds`, keeping the rest of the item as eBay returned it. It never
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
      const item = yield* items.getInventoryItem({ sku: input.sku });

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

      const failed = [...images, ...videos].filter((outcome) => outcome.status === 'failed');
      const newImageUrls = images.flatMap((outcome) =>
        outcome.imageUrl ? [outcome.imageUrl] : [],
      );
      const newVideoIds = videos.flatMap((outcome) =>
        outcome.status !== 'failed' && outcome.videoId ? [outcome.videoId] : [],
      );
      const product = item.product ?? {};
      const imageUrls = dedupe(
        input.replaceExisting ? newImageUrls : [...(product.imageUrls ?? []), ...newImageUrls],
      );
      const videoIds = dedupe(
        input.replaceExisting ? newVideoIds : [...(product.videoIds ?? []), ...newVideoIds],
      );
      const result: AttachMediaResult = {
        sku: input.sku,
        updated: false,
        images,
        videos,
        imageUrls,
        videoIds,
      };

      if (failed.length > 0 && !input.allowPartial) {
        return yield* Effect.fail(
          attachFailure(
            `${failed.length} of ${total} uploads failed; inventory item ${input.sku} was not updated (pass allowPartial: true to attach the successful ones)`,
            result,
          ),
        );
      }
      if (newImageUrls.length + newVideoIds.length === 0) {
        return yield* Effect.fail(
          attachFailure(
            `no media was uploaded successfully; inventory item ${input.sku} was not updated`,
            result,
          ),
        );
      }

      yield* items.createOrReplaceInventoryItem({
        sku: input.sku,
        body: { ...toInventoryItemBody(item), product: { ...product, imageUrls, videoIds } },
      });

      return { ...result, updated: true };
    }),
});
