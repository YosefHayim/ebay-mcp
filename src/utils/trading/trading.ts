import { z } from '@/utils/effectSchema.js';

/** Input accepted by getActiveListings. */
export const getActiveListingsSchema = z.object({
  page: z.number().optional().describe('Page number, defaulting to 1'),
  entriesPerPage: z.number().optional().describe('Items per page, defaulting to 50'),
});

/** Input accepted by getListing. */
export const getListingSchema = z.object({
  itemId: z.string().describe('The eBay item ID to retrieve'),
});

/** Input accepted by createListing. */
export const createListingSchema = z.object({
  item: z.record(z.unknown()).describe('Trading API Item payload for AddFixedPriceItem'),
});

/** Input accepted by reviseListing. */
export const reviseListingSchema = z.object({
  itemId: z.string().describe('The eBay item ID to revise'),
  fields: z.record(z.unknown()).describe('Trading API Item fields to update'),
});

/** Input accepted by endListing. */
export const endListingSchema = z.object({
  itemId: z.string().describe('The eBay item ID to end'),
  reason: z
    .enum(['NotAvailable', 'Incorrect', 'LostOrBroken', 'OtherListingError', 'SellToHighBidder'])
    .optional()
    .describe('Trading API ending reason, defaulting to NotAvailable'),
});

/** Input accepted by relistItem. */
export const relistItemSchema = z.object({
  itemId: z.string().describe('The eBay item ID to relist'),
  modifications: z
    .record(z.unknown())
    .optional()
    .describe('Optional Trading API Item fields to change while relisting'),
});

/** Input accepted by uploadSiteHostedPictures. */
export const uploadSiteHostedPicturesSchema = z.object({
  filePath: z
    .string()
    .optional()
    .describe('Absolute path to a local image file to upload (JPEG/PNG/GIF)'),
  imageBase64: z
    .string()
    .optional()
    .describe('Base64-encoded image bytes, as an alternative to filePath'),
  externalPictureUrl: z
    .string()
    .optional()
    .describe('Public image URL for eBay to fetch instead of uploading local bytes'),
  pictureName: z
    .string()
    .optional()
    .describe('Optional name for the picture in eBay Picture Services (EPS)'),
  pictureSet: z
    .enum(['Standard', 'Supersize'])
    .optional()
    .describe('EPS picture set; Supersize enables larger hosted images'),
});
