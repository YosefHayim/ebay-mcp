import { FormatType } from '@/types/ebayEnums.js';
import { z } from '@/utils/effectSchema.js';

/** Listing format selector shared by the Trading listing tools. */
const listingFormatSchema = z
  .nativeEnum(FormatType)
  .optional()
  .describe(
    'Listing format, defaulting to FIXED_PRICE. AUCTION switches to the auction-capable Trading calls (AddItem, ReviseItem, EndItem, RelistItem) and enforces the auction Item rules.',
  );

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
  format: listingFormatSchema,
  item: z
    .record(z.unknown())
    .describe(
      'Trading API Item payload. FIXED_PRICE: StartPrice is the listing price and ListingDuration is GTC. AUCTION: StartPrice is the opening bid, ListingDuration is a day count (Days_1/3/5/7/10), Quantity is 1, an optional ReservePrice must exceed StartPrice, an optional BuyItNowPrice must be at least 30% above it (and excludes Best Offer); ListingType Chinese is added for you.',
    ),
});

/** Input accepted by reviseListing. */
export const reviseListingSchema = z.object({
  format: listingFormatSchema,
  itemId: z.string().describe('The eBay item ID to revise'),
  fields: z.record(z.unknown()).describe('Trading API Item fields to update'),
});

/** Input accepted by endListing. */
export const endListingSchema = z.object({
  format: listingFormatSchema,
  itemId: z.string().describe('The eBay item ID to end'),
  reason: z
    .enum(['NotAvailable', 'Incorrect', 'LostOrBroken', 'OtherListingError', 'SellToHighBidder'])
    .optional()
    .describe(
      'Trading API ending reason, defaulting to NotAvailable. SellToHighBidder only applies to AUCTION listings with bids.',
    ),
});

/** Input accepted by relistItem. */
export const relistItemSchema = z.object({
  format: listingFormatSchema,
  itemId: z.string().describe('The eBay item ID to relist'),
  modifications: z
    .record(z.unknown())
    .optional()
    .describe('Optional Trading API Item fields to change while relisting'),
});
