import { z } from 'zod';

/**
 * Media API Schemas
 *
 * Zod schemas for the local-media upload tools (images via eBay
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
