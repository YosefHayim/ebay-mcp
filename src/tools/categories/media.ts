import { getMediaAccessConfig } from '@/config/mediaAccess.js';
import {
  attachMediaInputSchema,
  attachMediaOutputSchema,
  uploadImagesInputSchema,
  uploadImagesOutputSchema,
  uploadVideoInputSchema,
  videoIdInputSchema,
  videoOutputSchema,
} from '@/schemas/inventory-management/media.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import type { OutputArgs } from '@/tools/types.js';
import { loadLocalMedia, loadLocalMediaList } from '@/utils/localMedia.js';
import { Effect } from 'effect';
import { zodToJsonSchema } from 'zod-to-json-schema';

const MEDIA_ACCESS_NOTE =
  'Local file access is opt-in: the file must sit inside a directory listed in EBAY_MCP_MEDIA_DIRS (or under EBAY_MCP_MEDIA_ROOT, which also anchors media://<relative-path> references). Symlinks are resolved before the check.';

const toMilliseconds = (seconds: number | undefined): number | undefined =>
  seconds === undefined ? undefined : seconds * 1000;

/**
 * Media tools. These are the only tools that read the local filesystem, and the
 * attach tool is the one deliberate composite (read item → upload → rewrite media
 * fields); both are documented exceptions to the one-endpoint-per-tool rule.
 */
export const mediaEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_upload_images',
    description: `Upload local pictures to eBay Picture Services and return the EPS image URLs in the same order, ready for product.imageUrls on an inventory item. Uses the Media API (createImageFromFile). Unused images expire after a while; they become permanent once a listing uses them.\n\n${MEDIA_ACCESS_NOTE}`,
    inputSchema: uploadImagesInputSchema.shape,
    outputSchema: zodToJsonSchema(uploadImagesOutputSchema, {
      name: 'UploadImagesResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) =>
      Effect.runPromise(
        loadLocalMediaList(args.paths, 'image', getMediaAccessConfig()).pipe(
          Effect.flatMap((files) => api.media.uploadImageFiles(files)),
        ),
      ),
  }),
  defineTool({
    name: 'ebay_upload_video',
    description: `Upload a local video through the Media API lifecycle (createVideo → uploadVideo → getVideo) and return the videoId with its processing status. Waits up to waitForProcessingSeconds (default 120) for status LIVE; PROCESSING means check again with ebay_get_video, BLOCKED or PROCESSING_FAILED explain why eBay rejected it (statusMessage). MP4/MOV up to 150 MB; one video per listing.\n\n${MEDIA_ACCESS_NOTE}`,
    inputSchema: uploadVideoInputSchema.shape,
    outputSchema: zodToJsonSchema(videoOutputSchema, {
      name: 'UploadVideoResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) =>
      Effect.runPromise(
        loadLocalMedia(args.path, 'video', getMediaAccessConfig()).pipe(
          Effect.flatMap((file) =>
            api.media.uploadVideoFile({
              file,
              title: args.title,
              description: args.description,
              maxWaitMs: toMilliseconds(args.waitForProcessingSeconds),
            }),
          ),
        ),
      ),
  }),
  defineTool({
    name: 'ebay_get_video',
    description:
      'Get a Media API video by ID: processing status (PENDING_UPLOAD, PROCESSING, LIVE, BLOCKED, PROCESSING_FAILED), statusMessage, expiry, and playlists. Use it to re-check a video that was still PROCESSING after ebay_upload_video.',
    inputSchema: videoIdInputSchema.shape,
    outputSchema: zodToJsonSchema(videoOutputSchema, {
      name: 'GetVideoResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.media.getVideo(args)),
  }),
  defineTool({
    name: 'ebay_attach_media_to_inventory_item',
    description: `Upload local pictures and/or a video and attach them to an existing inventory item: reads the item, uploads every file in order, then rewrites only product.imageUrls and product.videoIds (appending by default, replacing with replaceExisting). Everything else on the item is preserved and no offer is published. If any upload fails the item is left untouched and the per-file results are returned in the error, unless allowPartial is true.\n\n${MEDIA_ACCESS_NOTE}`,
    inputSchema: attachMediaInputSchema.shape,
    outputSchema: zodToJsonSchema(attachMediaOutputSchema, {
      name: 'AttachMediaResponse',
      $refStrategy: 'none',
    }) as OutputArgs,
    annotations: { readOnlyHint: false },
    handler: (api, args) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const access = getMediaAccessConfig();
          const images = yield* loadLocalMediaList(args.imagePaths ?? [], 'image', access);
          const videos = yield* loadLocalMediaList(args.videoPaths ?? [], 'video', access);
          return yield* api.media.attachMediaToInventoryItem({
            sku: args.sku,
            images,
            videos,
            replaceExisting: args.replaceExisting,
            allowPartial: args.allowPartial,
            maxWaitMs: toMilliseconds(args.waitForProcessingSeconds),
          });
        }),
      ),
  }),
];
