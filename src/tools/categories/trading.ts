import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { resolveUploadImageInput } from '@/tools/trading/uploadImageInput.js';
import {
  createListingSchema,
  endListingSchema,
  getActiveListingsSchema,
  getListingSchema,
  relistItemSchema,
  reviseListingSchema,
  uploadSiteHostedPicturesSchema,
} from '@/utils/trading/trading.js';
import { Effect } from 'effect';

/** Trading API tools for fixed-price listing operations. */
export const tradingEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_active_listings',
    description:
      'Get all active fixed-price listings with SKU, quantity, price, and watch count.\n\nUses the Trading API (GetMyeBaySelling). Returns listings created via any method (UI, Trading API, or REST API).\n\nRequired: User OAuth token.',
    inputSchema: getActiveListingsSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.trading.getActiveListings(args)),
  }),
  defineTool({
    name: 'ebay_get_listing',
    description:
      'Get full details for a single listing by item ID.\n\nUses the Trading API (GetItem). Returns all listing fields including description, specifics, shipping, and images.\n\nRequired: User OAuth token.',
    inputSchema: getListingSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.trading.getListing(args)),
  }),
  defineTool({
    name: 'ebay_create_listing',
    description:
      'Create a new fixed-price listing.\n\nUses the Trading API (AddFixedPriceItem). Requires complete item details.\n\nRequired: User OAuth token.',
    inputSchema: createListingSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.trading.createListing(args)),
  }),
  defineTool({
    name: 'ebay_revise_listing',
    description:
      'Revise an existing fixed-price listing. Update quantity, price, title, description, or any other field.\n\nUses the Trading API (ReviseFixedPriceItem). Only send the fields you want to change.\n\nExamples:\n- Update quantity: { "Quantity": 10 }\n- Update price: { "StartPrice": 14.99 }\n- Update title: { "Title": "New Title" }\n- Multiple fields: { "Quantity": 10, "StartPrice": 14.99 }\n\nRequired: User OAuth token.',
    inputSchema: reviseListingSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.trading.reviseListing(args)),
  }),
  defineTool({
    name: 'ebay_end_listing',
    description:
      'End/remove an active fixed-price listing.\n\nUses the Trading API (EndFixedPriceItem).\n\nRequired: User OAuth token.',
    inputSchema: endListingSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.trading.endListing(args)),
  }),
  defineTool({
    name: 'ebay_relist_item',
    description:
      'Relist an ended fixed-price listing, optionally with modifications.\n\nUses the Trading API (RelistFixedPriceItem).\n\nRequired: User OAuth token.',
    inputSchema: relistItemSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.trading.relistItem(args)),
  }),
  defineTool({
    name: 'ebay_upload_site_hosted_pictures',
    description:
      'Upload an image to eBay Picture Services (EPS) and get back a hosted image URL.\n\nUses the Trading API (UploadSiteHostedPictures). Supply the image as a local file path, inline base64 data, or an external URL for eBay to fetch. Returns the EPS `fullUrl` for use in PictureDetails.PictureURL when creating or revising a listing.\n\nExamples:\n- Local file: { "filePath": "/path/to/photo.jpg", "pictureName": "front" }\n- Base64: { "imageBase64": "<...>", "pictureName": "front" }\n- External URL: { "externalPictureUrl": "https://example.com/photo.jpg" }\n\nRequired: User OAuth token.',
    inputSchema: uploadSiteHostedPicturesSchema.shape,
    annotations: { readOnlyHint: false },
    // Resolve the image at the tool boundary (read file / decode + validate
    // base64 / enforce the size cap), then hand the API layer only bytes or an
    // external URL — the API layer performs no filesystem I/O.
    handler: (api, args) =>
      Effect.runPromise(
        resolveUploadImageInput(args).pipe(
          Effect.flatMap((input) => api.trading.uploadSiteHostedPictures(input)),
        ),
      ),
  }),
];
