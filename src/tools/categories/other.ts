import { z } from 'zod';
import { defineTool } from '@/tools/define-tool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { shippingQuoteRequestSchema, veroReportDataSchema } from '@/tools/schemas.js';

/** Miscellaneous eBay API tools that do not fit the primary seller API categories. */
export const otherEntries: ToolEntry[] = [
  // Identity API
  defineTool({
    name: 'ebay_get_user',
    description: 'Get user identity information',
    inputSchema: {},
    handler: (api) => api.identity.getUser(),
  }),
  // Compliance API
  defineTool({
    name: 'ebay_get_listing_violations',
    description: 'Get listing violations for the seller',
    inputSchema: {
      complianceType: z.string().optional().describe('Type of compliance violation'),
      offset: z.number().optional().describe('Number of violations to skip'),
      limit: z.number().optional().describe('Number of violations to return'),
    },
    handler: (api, args) =>
      api.compliance.getListingViolations(args.complianceType, args.offset, args.limit),
  }),
  defineTool({
    name: 'ebay_get_listing_violations_summary',
    description: 'Get summary of listing violations',
    inputSchema: {
      complianceType: z.string().optional().describe('Type of compliance violation'),
    },
    handler: (api, args) => api.compliance.getListingViolationsSummary(args.complianceType),
  }),
  defineTool({
    name: 'ebay_suppress_violation',
    description: 'Suppress a listing violation',
    inputSchema: {
      listingViolationId: z.string().describe('The violation ID to suppress'),
    },
    handler: (api, args) => api.compliance.suppressViolation(args.listingViolationId),
  }),
  // VERO API
  defineTool({
    name: 'ebay_create_vero_report',
    description:
      'Create a VERO report to report intellectual property infringement. This endpoint is part of the Verified Rights Owner (VeRO) Program and allows rights owners to report listings that infringe on their intellectual property.',
    inputSchema: {
      reportData: veroReportDataSchema.describe(
        'VERO report data containing item details and intellectual property violation information',
      ),
    },
    handler: (api, args) => api.vero.createVeroReport(args.reportData),
  }),
  defineTool({
    name: 'ebay_get_vero_report',
    description: 'Get a specific VERO report by ID',
    inputSchema: {
      veroReportId: z.string().min(1).describe('The unique identifier of the VERO report'),
    },
    handler: (api, args) => api.vero.getVeroReport(args.veroReportId),
  }),
  defineTool({
    name: 'ebay_get_vero_report_items',
    description:
      'Get VERO report items (listings reported for intellectual property infringement). Supports filtering, pagination via limit and offset parameters.',
    inputSchema: {
      filter: z.string().optional().describe('Filter criteria for the query (e.g., date range)'),
      limit: z.number().optional().describe('Maximum number of items to return'),
      offset: z.number().optional().describe('Number of items to skip for pagination'),
    },
    handler: (api, args) => api.vero.getVeroReportItems(args.filter, args.limit, args.offset),
  }),
  defineTool({
    name: 'ebay_get_vero_reason_code',
    description:
      'Get a specific VERO reason code by ID. Reason codes categorize the types of intellectual property violations.',
    inputSchema: {
      veroReasonCodeId: z.string().min(1).describe('The unique identifier of the VERO reason code'),
    },
    handler: (api, args) => api.vero.getVeroReasonCode(args.veroReasonCodeId),
  }),
  defineTool({
    name: 'ebay_get_vero_reason_codes',
    description:
      'Get all available VERO reason codes. These codes are used when creating VERO reports to specify the type of intellectual property violation.',
    inputSchema: {},
    handler: (api) => api.vero.getVeroReasonCodes(),
  }),
  // Translation API
  defineTool({
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
    handler: (api, args) =>
      api.translation.translate(args.from, args.to, args.translationContext, args.text),
  }),
  // eDelivery API
  defineTool({
    name: 'ebay_create_shipping_quote',
    description: 'Create a shipping quote for international shipping',
    inputSchema: {
      shippingQuoteRequest: shippingQuoteRequestSchema.describe('Shipping quote request details'),
    },
    handler: (api, args) => api.edelivery.createShippingQuote(args.shippingQuoteRequest),
  }),
  defineTool({
    name: 'ebay_get_shipping_quote',
    description: 'Get a shipping quote by ID',
    inputSchema: {
      shippingQuoteId: z.string().describe('The shipping quote ID'),
    },
    handler: (api, args) => api.edelivery.getShippingQuote(args.shippingQuoteId),
  }),
  // eDelivery API - Cost & Preferences
  defineTool({
    name: 'ebay_get_actual_costs',
    description: 'Get actual costs for shipped packages',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., package_id)'),
    },
    handler: (api, args) => api.edelivery.getActualCosts(args.params),
  }),
  defineTool({
    name: 'ebay_get_address_preferences',
    description: 'Get address preferences for international shipping',
    inputSchema: {},
    handler: (api) => api.edelivery.getAddressPreferences(),
  }),
  defineTool({
    name: 'ebay_create_address_preference',
    description: 'Create an address preference for international shipping',
    inputSchema: {
      addressPreference: z.record(z.unknown()).describe('Address preference data'),
    },
    handler: (api, args) => api.edelivery.createAddressPreference(args.addressPreference),
  }),
  defineTool({
    name: 'ebay_get_consign_preferences',
    description: 'Get consign preferences for international shipping',
    inputSchema: {},
    handler: (api) => api.edelivery.getConsignPreferences(),
  }),
  defineTool({
    name: 'ebay_create_consign_preference',
    description: 'Create a consign preference for international shipping',
    inputSchema: {
      consignPreference: z.record(z.unknown()).describe('Consign preference data'),
    },
    handler: (api, args) => api.edelivery.createConsignPreference(args.consignPreference),
  }),
  // eDelivery API - Agents & Services
  defineTool({
    name: 'ebay_get_agents',
    description: 'Get available shipping agents for international shipping',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., country)'),
    },
    handler: (api, args) => api.edelivery.getAgents(args.params),
  }),
  defineTool({
    name: 'ebay_get_battery_qualifications',
    description: 'Get battery qualifications for international shipping',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., battery_type)'),
    },
    handler: (api, args) => api.edelivery.getBatteryQualifications(args.params),
  }),
  defineTool({
    name: 'ebay_get_dropoff_sites',
    description: 'Get available dropoff sites for international shipping',
    inputSchema: {
      params: z.record(z.string()).describe('Query parameters (postal_code, country required)'),
    },
    handler: (api, args) => api.edelivery.getDropoffSites(args.params),
  }),
  defineTool({
    name: 'ebay_get_shipping_services',
    description: 'Get available shipping services for international shipping',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., country)'),
    },
    handler: (api, args) => api.edelivery.getShippingServices(args.params),
  }),
  // eDelivery API - Bundles
  defineTool({
    name: 'ebay_create_bundle',
    description: 'Create a bundle of packages for international shipping',
    inputSchema: {
      bundleRequest: z.record(z.unknown()).describe('Bundle creation data'),
    },
    handler: (api, args) => api.edelivery.createBundle(args.bundleRequest),
  }),
  defineTool({
    name: 'ebay_get_bundle',
    description: 'Get bundle details by ID',
    inputSchema: {
      bundleId: z.string().describe('The bundle ID'),
    },
    handler: (api, args) => api.edelivery.getBundle(args.bundleId),
  }),
  defineTool({
    name: 'ebay_cancel_bundle',
    description: 'Cancel a bundle by ID',
    inputSchema: {
      bundleId: z.string().describe('The bundle ID to cancel'),
    },
    handler: (api, args) => api.edelivery.cancelBundle(args.bundleId),
  }),
  defineTool({
    name: 'ebay_get_bundle_label',
    description: 'Get shipping label for a bundle',
    inputSchema: {
      bundleId: z.string().describe('The bundle ID'),
    },
    handler: (api, args) => api.edelivery.getBundleLabel(args.bundleId),
  }),
  // eDelivery API - Packages (Single)
  defineTool({
    name: 'ebay_create_package',
    description: 'Create a package for international shipping',
    inputSchema: {
      packageRequest: z.record(z.unknown()).describe('Package creation data'),
    },
    handler: (api, args) => api.edelivery.createPackage(args.packageRequest),
  }),
  defineTool({
    name: 'ebay_get_package',
    description: 'Get package details by ID',
    inputSchema: {
      packageId: z.string().describe('The package ID'),
    },
    handler: (api, args) => api.edelivery.getPackage(args.packageId),
  }),
  defineTool({
    name: 'ebay_delete_package',
    description: 'Delete a package by ID',
    inputSchema: {
      packageId: z.string().describe('The package ID to delete'),
    },
    handler: (api, args) => api.edelivery.deletePackage(args.packageId),
  }),
  defineTool({
    name: 'ebay_get_package_by_order_line_item',
    description: 'Get package details by order line item ID',
    inputSchema: {
      orderLineItemId: z.string().describe('The order line item ID'),
    },
    handler: (api, args) => api.edelivery.getPackageByOrderLineItem(args.orderLineItemId),
  }),
  defineTool({
    name: 'ebay_cancel_package',
    description: 'Cancel a package by ID',
    inputSchema: {
      packageId: z.string().describe('The package ID to cancel'),
    },
    handler: (api, args) => api.edelivery.cancelPackage(args.packageId),
  }),
  defineTool({
    name: 'ebay_clone_package',
    description: 'Clone a package to create a duplicate',
    inputSchema: {
      packageId: z.string().describe('The package ID to clone'),
    },
    handler: (api, args) => api.edelivery.clonePackage(args.packageId),
  }),
  defineTool({
    name: 'ebay_confirm_package',
    description: 'Confirm a package for shipping',
    inputSchema: {
      packageId: z.string().describe('The package ID to confirm'),
    },
    handler: (api, args) => api.edelivery.confirmPackage(args.packageId),
  }),
  // eDelivery API - Packages (Bulk)
  defineTool({
    name: 'ebay_bulk_cancel_packages',
    description: 'Cancel multiple packages in one request',
    inputSchema: {
      bulkCancelRequest: z.record(z.unknown()).describe('Bulk cancel request data'),
    },
    handler: (api, args) => api.edelivery.bulkCancelPackages(args.bulkCancelRequest),
  }),
  defineTool({
    name: 'ebay_bulk_confirm_packages',
    description: 'Confirm multiple packages in one request',
    inputSchema: {
      bulkConfirmRequest: z.record(z.unknown()).describe('Bulk confirm request data'),
    },
    handler: (api, args) => api.edelivery.bulkConfirmPackages(args.bulkConfirmRequest),
  }),
  defineTool({
    name: 'ebay_bulk_delete_packages',
    description: 'Delete multiple packages in one request',
    inputSchema: {
      bulkDeleteRequest: z.record(z.unknown()).describe('Bulk delete request data'),
    },
    handler: (api, args) => api.edelivery.bulkDeletePackages(args.bulkDeleteRequest),
  }),
  // eDelivery API - Labels & Tracking
  defineTool({
    name: 'ebay_get_labels',
    description: 'Get shipping labels for packages',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., package_id)'),
    },
    handler: (api, args) => api.edelivery.getLabels(args.params),
  }),
  defineTool({
    name: 'ebay_get_handover_sheet',
    description: 'Get handover sheet for packages',
    inputSchema: {
      params: z.record(z.string()).optional().describe('Query parameters (e.g., bundle_id)'),
    },
    handler: (api, args) => api.edelivery.getHandoverSheet(args.params),
  }),
  defineTool({
    name: 'ebay_get_tracking',
    description: 'Get tracking information for packages',
    inputSchema: {
      params: z.record(z.string()).describe('Query parameters (tracking_number required)'),
    },
    handler: (api, args) => api.edelivery.getTracking(args.params),
  }),
  // eDelivery API - Other
  defineTool({
    name: 'ebay_create_complaint',
    description: 'Create a complaint for international shipping issues',
    inputSchema: {
      complaintRequest: z.record(z.unknown()).describe('Complaint request data'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    },
    handler: (api, args) => api.edelivery.createComplaint(args.complaintRequest),
  }),
];

/**
 * Handler-only Claude-facing utility tool.
 *
 * `SearchClaudeCodeDocs` is callable via `executeTool` but intentionally NOT
 * advertised in the registered tool list (preserving prior behavior, where its
 * definition lived in an un-aggregated `claudeTools` catalog). It is surfaced to
 * the registry via `handlerOnlyEntries`, never `allEntries`.
 */
export const claudeEntries: ToolEntry[] = [
  defineTool({
    name: 'SearchClaudeCodeDocs',
    description:
      'Search across the Claude Code Docs knowledge base to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about Claude Code Docs, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.',
    inputSchema: {
      query: z.string().describe('A query to search the content with.'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    },
    handler: (_api, args) => ({
      content: [
        {
          type: 'text',
          text: `Tool 'SearchClaudeCodeDocs' called with query: ${args.query}. This tool is not yet fully implemented.`,
        },
      ],
    }),
  }),
];
