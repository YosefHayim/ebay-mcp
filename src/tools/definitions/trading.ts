import { z } from 'zod';
import type { ToolDefinition } from './account.js';

export const tradingTools: ToolDefinition[] = [
  {
    name: 'ebay_get_active_listings',
    description:
      'Get all active fixed-price listings with SKU, quantity, price, and watch count.\n\nUses the Trading API (GetMyeBaySelling). Returns listings created via any method (UI, Trading API, or REST API).\n\nRequired: User OAuth token.',
    inputSchema: {
      page: z.number().optional().describe('Page number (default 1)'),
      entriesPerPage: z
        .number()
        .optional()
        .describe('Items per page, max 200 (default 50)'),
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'ebay_get_listing',
    description:
      'Get full details for a single listing by item ID.\n\nUses the Trading API (GetItem). Returns all listing fields including description, specifics, shipping, and images.\n\nRequired: User OAuth token.',
    inputSchema: {
      itemId: z
        .string()
        .describe('The eBay item ID (e.g., "167382780779")'),
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'ebay_create_listing',
    description:
      'Create a new fixed-price listing.\n\nUses the Trading API (AddFixedPriceItem). Requires complete item details.\n\nRequired: User OAuth token.',
    inputSchema: {
      item: z
        .record(z.string(), z.unknown())
        .describe(
          'Item details object. Required fields: Title, PrimaryCategory.CategoryID, StartPrice, ConditionID, Country, Currency, DispatchTimeMax, ListingDuration, ListingType ("FixedPriceItem"), Quantity, SKU.'
        ),
    },
    annotations: { readOnlyHint: false },
  },
  {
    name: 'ebay_revise_listing',
    description:
      'Revise an existing fixed-price listing. Update quantity, price, title, description, or any other field.\n\nUses the Trading API (ReviseFixedPriceItem). Only send the fields you want to change.\n\nExamples:\n- Update quantity: { "Quantity": 10 }\n- Update price: { "StartPrice": 14.99 }\n- Update title: { "Title": "New Title" }\n- Multiple fields: { "Quantity": 10, "StartPrice": 14.99 }\n\nRequired: User OAuth token.',
    inputSchema: {
      itemId: z.string().describe('The eBay item ID to revise'),
      fields: z
        .record(z.string(), z.unknown())
        .describe(
          'Fields to update (e.g., { "Quantity": 10, "StartPrice": 14.99 })'
        ),
    },
    annotations: { readOnlyHint: false },
  },
  {
    name: 'ebay_end_listing',
    description:
      'End/remove an active fixed-price listing.\n\nUses the Trading API (EndFixedPriceItem).\n\nRequired: User OAuth token.',
    inputSchema: {
      itemId: z.string().describe('The eBay item ID to end'),
      reason: z
        .enum([
          'NotAvailable',
          'Incorrect',
          'LostOrBroken',
          'OtherListingError',
          'SellToHighBidder',
        ])
        .optional()
        .describe('Reason for ending (default: NotAvailable)'),
    },
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  {
    name: 'ebay_relist_item',
    description:
      'Relist an ended fixed-price listing, optionally with modifications.\n\nUses the Trading API (RelistFixedPriceItem).\n\nRequired: User OAuth token.',
    inputSchema: {
      itemId: z.string().describe('The eBay item ID to relist'),
      modifications: z
        .record(z.string(), z.unknown())
        .optional()
        .describe(
          'Optional fields to change when relisting (e.g., { "Quantity": 20 })'
        ),
    },
    annotations: { readOnlyHint: false },
  },
];