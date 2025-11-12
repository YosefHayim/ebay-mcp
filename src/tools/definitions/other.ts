import { z } from 'zod';
import { shippingQuoteRequestSchema, veroReportDataSchema } from '../schemas.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}
export const otherApiTools: ToolDefinition[] = [
  // Identity API
  {
    name: 'ebay_get_user',
    description: 'Get user identity information',
    inputSchema: {},
  },
  // Compliance API
  {
    name: 'ebay_get_listing_violations',
    description: 'Get listing violations for the seller',
    inputSchema: {
      complianceType: z.string().optional().describe('Type of compliance violation'),
      offset: z.number().optional().describe('Number of violations to skip'),
      limit: z.number().optional().describe('Number of violations to return'),
    },
  },
  {
    name: 'ebay_get_listing_violations_summary',
    description: 'Get summary of listing violations',
    inputSchema: {
      complianceType: z.string().optional().describe('Type of compliance violation'),
    },
  },
  {
    name: 'ebay_suppress_violation',
    description: 'Suppress a listing violation',
    inputSchema: {
      listingViolationId: z.string().describe('The violation ID to suppress'),
    },
  },
  // VERO API
  {
    name: 'ebay_create_vero_report',
    description:
      'Create a VERO report to report intellectual property infringement. This endpoint is part of the Verified Rights Owner (VeRO) Program and allows rights owners to report listings that infringe on their intellectual property.',
    inputSchema: {
      reportData: veroReportDataSchema.describe(
        'VERO report data containing item details and intellectual property violation information'
      ),
    },
  },
  {
    name: 'ebay_get_vero_report',
    description: 'Get a specific VERO report by ID',
    inputSchema: {
      veroReportId: z.string().min(1).describe('The unique identifier of the VERO report'),
    },
  },
  {
    name: 'ebay_get_vero_report_items',
    description:
      'Get VERO report items (listings reported for intellectual property infringement). Supports filtering, pagination via limit and offset parameters.',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for the query (e.g., date range)'),
      limit: z.number().optional().describe('Maximum number of items to return'),
      offset: z.number().optional().describe('Number of items to skip for pagination'),
    },
  },
  {
    name: 'ebay_get_vero_reason_code',
    description:
      'Get a specific VERO reason code by ID. Reason codes categorize the types of intellectual property violations.',
    inputSchema: {
      veroReasonCodeId: z.string().min(1).describe('The unique identifier of the VERO reason code'),
    },
  },
  {
    name: 'ebay_get_vero_reason_codes',
    description:
      'Get all available VERO reason codes. These codes are used when creating VERO reports to specify the type of intellectual property violation.',
    inputSchema: {},
  },
  // Translation API
  {
    name: 'ebay_translate',
    description: 'Translate listing text',
    inputSchema: {
      from: z.string().describe('Source language code'),
      to: z.string().describe('Target language code'),
      translationContext: z
        .string()
        .describe('Translation context (e.g., ITEM_TITLE, ITEM_DESCRIPTION)'),
      text: z.array(z.string()).describe('Array of text to translate'),
    },
  },
  // eDelivery API
  {
    name: 'ebay_create_shipping_quote',
    description: 'Create a shipping quote for international shipping',
    inputSchema: {
      shippingQuoteRequest: shippingQuoteRequestSchema.describe('Shipping quote request details'),
    },
  },
  {
    name: 'ebay_get_shipping_quote',
    description: 'Get a shipping quote by ID',
    inputSchema: {
      shippingQuoteId: z.string().describe('The shipping quote ID'),
    },
  },
];

export const claudeTools: ToolDefinition[] = [
  {
    name: 'SearchClaudeCodeDocs',
    description:
      'Search across the Claude Code Docs knowledge base to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about Claude Code Docs, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.',
    inputSchema: {
      query: z.string().describe('A query to search the content with.'),
    },
  },
];
