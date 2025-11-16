import { z } from 'zod';
import { shippingQuoteRequestSchema, veroReportDataSchema } from '../schemas.js';

export interface OutputArgs {
  [x: string]: unknown;
  type: 'object';
  properties?: Record<string, object>;
  required?: string[];
}

export interface ToolAnnotations {
  [x: string]: unknown;
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  title?: string;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
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
  // eDelivery API - Cost & Preferences
  {
    name: 'ebay_get_actual_costs',
    description: 'Get actual costs for shipped packages',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., package_id)'),
    },
  },
  {
    name: 'ebay_get_address_preferences',
    description: 'Get address preferences for international shipping',
    inputSchema: {},
  },
  {
    name: 'ebay_create_address_preference',
    description: 'Create an address preference for international shipping',
    inputSchema: {
      addressPreference: z.record(z.unknown()).describe('Address preference data'),
    },
  },
  {
    name: 'ebay_get_consign_preferences',
    description: 'Get consign preferences for international shipping',
    inputSchema: {},
  },
  {
    name: 'ebay_create_consign_preference',
    description: 'Create a consign preference for international shipping',
    inputSchema: {
      consignPreference: z.record(z.unknown()).describe('Consign preference data'),
    },
  },
  // eDelivery API - Agents & Services
  {
    name: 'ebay_get_agents',
    description: 'Get available shipping agents for international shipping',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., country)'),
    },
  },
  {
    name: 'ebay_get_battery_qualifications',
    description: 'Get battery qualifications for international shipping',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., battery_type)'),
    },
  },
  {
    name: 'ebay_get_dropoff_sites',
    description: 'Get available dropoff sites for international shipping',
    inputSchema: {
      params: z.record(z.string()).describe('Query parameters (postal_code, country required)'),
    },
  },
  {
    name: 'ebay_get_shipping_services',
    description: 'Get available shipping services for international shipping',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., country)'),
    },
  },
  // eDelivery API - Bundles
  {
    name: 'ebay_create_bundle',
    description: 'Create a bundle of packages for international shipping',
    inputSchema: {
      bundleRequest: z.record(z.unknown()).describe('Bundle creation data'),
    },
  },
  {
    name: 'ebay_get_bundle',
    description: 'Get bundle details by ID',
    inputSchema: {
      bundleId: z.string().describe('The bundle ID'),
    },
  },
  {
    name: 'ebay_cancel_bundle',
    description: 'Cancel a bundle by ID',
    inputSchema: {
      bundleId: z.string().describe('The bundle ID to cancel'),
    },
  },
  {
    name: 'ebay_get_bundle_label',
    description: 'Get shipping label for a bundle',
    inputSchema: {
      bundleId: z.string().describe('The bundle ID'),
    },
  },
  // eDelivery API - Packages (Single)
  {
    name: 'ebay_create_package',
    description: 'Create a package for international shipping',
    inputSchema: {
      packageRequest: z.record(z.unknown()).describe('Package creation data'),
    },
  },
  {
    name: 'ebay_get_package',
    description: 'Get package details by ID',
    inputSchema: {
      packageId: z.string().describe('The package ID'),
    },
  },
  {
    name: 'ebay_delete_package',
    description: 'Delete a package by ID',
    inputSchema: {
      packageId: z.string().describe('The package ID to delete'),
    },
  },
  {
    name: 'ebay_get_package_by_order_line_item',
    description: 'Get package details by order line item ID',
    inputSchema: {
      orderLineItemId: z.string().describe('The order line item ID'),
    },
  },
  {
    name: 'ebay_cancel_package',
    description: 'Cancel a package by ID',
    inputSchema: {
      packageId: z.string().describe('The package ID to cancel'),
    },
  },
  {
    name: 'ebay_clone_package',
    description: 'Clone a package to create a duplicate',
    inputSchema: {
      packageId: z.string().describe('The package ID to clone'),
    },
  },
  {
    name: 'ebay_confirm_package',
    description: 'Confirm a package for shipping',
    inputSchema: {
      packageId: z.string().describe('The package ID to confirm'),
    },
  },
  // eDelivery API - Packages (Bulk)
  {
    name: 'ebay_bulk_cancel_packages',
    description: 'Cancel multiple packages in one request',
    inputSchema: {
      bulkCancelRequest: z.record(z.unknown()).describe('Bulk cancel request data'),
    },
  },
  {
    name: 'ebay_bulk_confirm_packages',
    description: 'Confirm multiple packages in one request',
    inputSchema: {
      bulkConfirmRequest: z.record(z.unknown()).describe('Bulk confirm request data'),
    },
  },
  {
    name: 'ebay_bulk_delete_packages',
    description: 'Delete multiple packages in one request',
    inputSchema: {
      bulkDeleteRequest: z.record(z.unknown()).describe('Bulk delete request data'),
    },
  },
  // eDelivery API - Labels & Tracking
  {
    name: 'ebay_get_labels',
    description: 'Get shipping labels for packages',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., package_id)'),
    },
  },
  {
    name: 'ebay_get_handover_sheet',
    description: 'Get handover sheet for packages',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., bundle_id)'),
    },
  },
  {
    name: 'ebay_get_tracking',
    description: 'Get tracking information for packages',
    inputSchema: {
      params: z.record(z.string()).describe('Query parameters (tracking_number required)'),
    },
  },
  // eDelivery API - Other
  {
    name: 'ebay_create_complaint',
    description: 'Create a complaint for international shipping issues',
    inputSchema: {
      complaintRequest: z.record(z.unknown()).describe('Complaint request data'),
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
