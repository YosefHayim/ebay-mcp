import { z } from '@/utils/effectSchema.js';

/**
 * Media API Schemas
 *
 * Effect-backed schemas for the local-media upload tools (images via eBay
 * Picture Services, videos via the Media API lifecycle).
 */

const mediaReferenceSchema = z
  .string()
  .min(1)
  .describe(
    'Absolute local path, or media://<relative-path> resolved under EBAY_MCP_MEDIA_ROOT. The file must sit inside EBAY_MCP_MEDIA_DIRS / EBAY_MCP_MEDIA_ROOT',
  );

const waitForProcessingSchema = z
  .number()
  .int()
  .min(0)
  .max(600)
  .optional()
  .describe(
    'Seconds to wait for eBay to finish processing a video before returning (default 120). A video still PROCESSING can be checked later with ebay_get_video',
  );

/** Validates the ebay_upload_images input. */
export const uploadImagesInputSchema = z.object({
  paths: z
    .array(mediaReferenceSchema)
    .min(1)
    .max(24)
    .describe(
      'Image files in listing order: JPG, PNG, GIF, BMP, TIFF, WEBP, AVIF, or HEIC, up to 12 MB each',
    ),
});

/** Validates the ebay_upload_video input. */
export const uploadVideoInputSchema = z.object({
  path: mediaReferenceSchema.describe(
    'Absolute local path or media:// reference to an MP4 or MOV file up to 150 MB',
  ),
  title: z
    .string()
    .max(100)
    .optional()
    .describe('Video title shown in eBay; defaults to the file name'),
  description: z.string().max(1000).optional().describe('Optional video description'),
  waitForProcessingSeconds: waitForProcessingSchema,
});

/** Validates the ebay_get_video input. */
export const videoIdInputSchema = z.object({
  videoId: z.string().min(1).describe('eBay video ID returned by ebay_upload_video'),
});

/** Validates the ebay_attach_media_to_inventory_item input. */
export const attachMediaInputSchema = z.object({
  sku: z.string().min(1).describe('SKU of the existing inventory item to attach media to'),
  imagePaths: z
    .array(mediaReferenceSchema)
    .max(24)
    .optional()
    .describe(
      'Image files in listing order (appended to product.imageUrls unless replaceExisting)',
    ),
  videoPaths: z
    .array(mediaReferenceSchema)
    .max(1)
    .optional()
    .describe('Video files (appended to product.videoIds unless replaceExisting)'),
  replaceExisting: z
    .boolean()
    .optional()
    .describe(
      "Replace the item's current imageUrls/videoIds instead of appending (default: append)",
    ),
  allowPartial: z
    .boolean()
    .optional()
    .describe(
      'Update the item with the uploads that succeeded even if some failed (default false: any failure leaves the item untouched)',
    ),
  waitForProcessingSeconds: waitForProcessingSchema,
});

const uploadedImageSchema = z.object({
  source: z.string(),
  imageId: z.string().optional(),
  imageUrl: z.string(),
  expirationDate: z.string().optional(),
});

/** Validates the ebay_upload_images output. */
export const uploadImagesOutputSchema = z.object({
  images: z.array(uploadedImageSchema),
});

/** Validates the Media API video payload returned by upload and get tools. */
export const videoOutputSchema = z
  .object({
    videoId: z.string().optional(),
    status: z.string().optional(),
    statusMessage: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    size: z.number().optional(),
    expirationDate: z.string().optional(),
  })
  .passthrough();

const mediaOutcomeSchema = z.object({
  source: z.string(),
  kind: z.enum(['image', 'video']),
  status: z.enum(['uploaded', 'processing', 'failed']),
  imageUrl: z.string().optional(),
  imageId: z.string().optional(),
  expirationDate: z.string().optional(),
  videoId: z.string().optional(),
  videoStatus: z.string().optional(),
  error: z.string().optional(),
});

/** Validates the ebay_attach_media_to_inventory_item output. */
export const attachMediaOutputSchema = z.object({
  sku: z.string(),
  updated: z.boolean(),
  images: z.array(mediaOutcomeSchema),
  videos: z.array(mediaOutcomeSchema),
  imageUrls: z.array(z.string()),
  videoIds: z.array(z.string()),
});
