import { Effect } from 'effect';
import {
  bundleIdInputSchema,
  createVeroReportInputSchema,
  edeliveryBodyInputSchema,
  edeliveryPaginationInputSchema,
  getActualCostsInputSchema,
  getAddressPreferencesInputSchema,
  getConsignPreferencesInputSchema,
  getHandoverSheetInputSchema,
  getLabelsInputSchema,
  getPackagesByLineItemIdInputSchema,
  getTrackingInputSchema,
  getUserInputSchema,
  getVeroReasonCodeInputSchema,
  getVeroReasonCodesInputSchema,
  getVeroReportInputSchema,
  getVeroReportItemsInputSchema,
  packageIdInputSchema,
  translateInputSchema,
} from '@/schemas/other/otherApis.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';

/** Miscellaneous eBay API tools that do not fit the primary seller API categories. */
export const otherEntries: ToolEntry[] = [
  // Identity API
  defineTool({
    name: 'ebay_get_user',
    description: 'Get user identity information',
    inputSchema: getUserInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.identity.getUser(args)),
  }),
  // VERO API
  defineTool({
    name: 'ebay_create_vero_report',
    description:
      'Create a VERO report to report intellectual property infringement. This endpoint is part of the Verified Rights Owner (VeRO) Program and allows rights owners to report listings that infringe on their intellectual property.',
    inputSchema: createVeroReportInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.vero.createVeroReport(args)),
  }),
  defineTool({
    name: 'ebay_get_vero_report',
    description: 'Get a specific VERO report by ID',
    inputSchema: getVeroReportInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.vero.getVeroReport(args)),
  }),
  defineTool({
    name: 'ebay_get_vero_report_items',
    description:
      'Get VERO report items (listings reported for intellectual property infringement). Supports filtering, pagination via limit and offset parameters.',
    inputSchema: getVeroReportItemsInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.vero.getVeroReportItems(args)),
  }),
  defineTool({
    name: 'ebay_get_vero_reason_code',
    description:
      'Get a specific VERO reason code by ID. Reason codes categorize the types of intellectual property violations.',
    inputSchema: getVeroReasonCodeInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.vero.getVeroReasonCode(args)),
  }),
  defineTool({
    name: 'ebay_get_vero_reason_codes',
    description:
      'Get all available VERO reason codes. These codes are used when creating VERO reports to specify the type of intellectual property violation.',
    inputSchema: getVeroReasonCodesInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.vero.getVeroReasonCodes(args)),
  }),
  // Translation API
  defineTool({
    name: 'ebay_translate',
    description: 'Translate listing text',
    inputSchema: translateInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.translation.translate(args)),
  }),
  // eDelivery API - Cost & Preferences
  defineTool({
    name: 'ebay_get_actual_costs',
    description: 'Get actual costs for shipped packages',
    inputSchema: getActualCostsInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getActualCosts(args)),
  }),
  defineTool({
    name: 'ebay_get_address_preferences',
    description: 'Get address preferences for international shipping',
    inputSchema: getAddressPreferencesInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getAddressPreferences(args)),
  }),
  defineTool({
    name: 'ebay_create_address_preference',
    description: 'Create an address preference for international shipping',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.createAddressPreference(args)),
  }),
  defineTool({
    name: 'ebay_get_consign_preferences',
    description: 'Get consign preferences for international shipping',
    inputSchema: getConsignPreferencesInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getConsignPreferences(args)),
  }),
  defineTool({
    name: 'ebay_create_consign_preference',
    description: 'Create a consign preference for international shipping',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.createConsignPreference(args)),
  }),
  // eDelivery API - Agents & Services
  defineTool({
    name: 'ebay_get_agents',
    description: 'Get available shipping agents for international shipping',
    inputSchema: edeliveryPaginationInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getAgents(args)),
  }),
  defineTool({
    name: 'ebay_get_battery_qualifications',
    description: 'Get battery qualifications for international shipping',
    inputSchema: edeliveryPaginationInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getBatteryQualifications(args)),
  }),
  defineTool({
    name: 'ebay_get_dropoff_sites',
    description: 'Get available dropoff sites for international shipping',
    inputSchema: edeliveryPaginationInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getDropoffSites(args)),
  }),
  defineTool({
    name: 'ebay_get_services',
    description: 'Get available shipping services for international shipping',
    inputSchema: edeliveryPaginationInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getServices(args)),
  }),
  // eDelivery API - Bundles
  defineTool({
    name: 'ebay_create_bundle',
    description: 'Create a bundle of packages for international shipping',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.createBundle(args)),
  }),
  defineTool({
    name: 'ebay_get_bundle',
    description: 'Get bundle details by ID',
    inputSchema: bundleIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getBundle(args)),
  }),
  defineTool({
    name: 'ebay_cancel_bundle',
    description: 'Cancel a bundle by ID',
    inputSchema: bundleIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.cancelBundle(args)),
  }),
  defineTool({
    name: 'ebay_get_bundle_label',
    description: 'Get shipping label for a bundle',
    inputSchema: bundleIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getBundleLabel(args)),
  }),
  // eDelivery API - Packages (Single)
  defineTool({
    name: 'ebay_create_package',
    description: 'Create a package for international shipping',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.createPackage(args)),
  }),
  defineTool({
    name: 'ebay_get_package',
    description: 'Get package details by ID',
    inputSchema: packageIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getPackage(args)),
  }),
  defineTool({
    name: 'ebay_delete_package',
    description: 'Delete a package by ID',
    inputSchema: packageIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.deletePackage(args)),
  }),
  defineTool({
    name: 'ebay_get_packages_by_line_item_id',
    description: 'Get package details by order line item ID',
    inputSchema: getPackagesByLineItemIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getPackagesByLineItemId(args)),
  }),
  defineTool({
    name: 'ebay_cancel_package',
    description: 'Cancel a package by ID',
    inputSchema: packageIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.cancelPackage(args)),
  }),
  defineTool({
    name: 'ebay_clone_package',
    description: 'Clone a package to create a duplicate',
    inputSchema: packageIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.clonePackage(args)),
  }),
  defineTool({
    name: 'ebay_confirm_package',
    description: 'Confirm a package for shipping',
    inputSchema: packageIdInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.confirmPackage(args)),
  }),
  // eDelivery API - Packages (Bulk)
  defineTool({
    name: 'ebay_bulk_cancel_packages',
    description: 'Cancel multiple packages in one request',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.bulkCancelPackages(args)),
  }),
  defineTool({
    name: 'ebay_bulk_confirm_packages',
    description: 'Confirm multiple packages in one request',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.bulkConfirmPackages(args)),
  }),
  defineTool({
    name: 'ebay_bulk_delete_packages',
    description: 'Delete multiple packages in one request',
    inputSchema: edeliveryBodyInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.bulkDeletePackages(args)),
  }),
  // eDelivery API - Labels & Tracking
  defineTool({
    name: 'ebay_get_labels',
    description: 'Get shipping labels for packages',
    inputSchema: getLabelsInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getLabels(args)),
  }),
  defineTool({
    name: 'ebay_get_handover_sheet',
    description: 'Get handover sheet for packages',
    inputSchema: getHandoverSheetInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getHandoverSheet(args)),
  }),
  defineTool({
    name: 'ebay_get_tracking',
    description: 'Get tracking information for packages',
    inputSchema: getTrackingInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.edelivery.getTracking(args)),
  }),
  // eDelivery API - Other
  defineTool({
    name: 'ebay_create_complaint',
    description: 'Create a complaint for international shipping issues',
    inputSchema: edeliveryBodyInputSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    },
    handler: (api, args) => Effect.runPromise(api.edelivery.createComplaint(args)),
  }),
];
