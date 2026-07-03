import { z } from 'zod';
import { idSchema } from '@/utils/schema-helpers.js';

/**
 * Zod schemas for eDelivery API input validation
 * Based on: src/api/other/edelivery.ts
 * OpenAPI spec: docs/sell-apps/other-apis/sell_edelivery_international_shipping_oas3.json
 * Types from: src/types/sell_edelivery_international_shipping_oas3.ts
 *
 * Note: The eDelivery API is only available for Greater-China based sellers with an active eDIS account.
 */

// Reusable schema for query parameters
const paramsSchema = z
  .record(z.string(), {
    description: 'Query parameters for the request',
  })
  .optional();

// Reusable schema for request body objects
const requestBodySchema = (name: string) =>
  z.record(z.unknown(), {
    message: `${name} is required`,
    required_error: `${name.toLowerCase().replace(/\s+/g, '_')} is required`,
    invalid_type_error: `${name.toLowerCase().replace(/\s+/g, '_')} must be an object`,
    description: `The ${name.toLowerCase()} containing required details`,
  });

/**
 * Schema for createShippingQuote method
 * Endpoint: POST /shipping_quote
 * Body: ShippingQuoteRequest - complex object with shipping details
 */
export const createShippingQuoteSchema = z.object({
  shipping_quote_request: requestBodySchema('Shipping quote request'),
});

/**
 * Schema for getShippingQuote method
 * Endpoint: GET /shipping_quote/{shipping_quote_id}
 * Path: shipping_quote_id (required)
 */
export const getShippingQuoteSchema = z.object({
  shipping_quote_id: idSchema('Shipping quote ID', 'The unique identifier for the shipping quote'),
});

// ==================== Cost & Preferences ====================

/**
 * Schema for getActualCosts method
 * Endpoint: GET /actual_costs
 */
export const getActualCostsSchema = z.object({
  params: paramsSchema,
});

/**
 * Schema for getAddressPreferences method
 * Endpoint: GET /address_preference
 */
export const getAddressPreferencesSchema = z.object({});

/**
 * Schema for createAddressPreference method
 * Endpoint: POST /address_preference
 */
export const createAddressPreferenceSchema = z.object({
  address_preference: requestBodySchema('Address preference'),
});

/**
 * Schema for getConsignPreferences method
 * Endpoint: GET /consign_preference
 */
export const getConsignPreferencesSchema = z.object({});

/**
 * Schema for createConsignPreference method
 * Endpoint: POST /consign_preference
 */
export const createConsignPreferenceSchema = z.object({
  consign_preference: requestBodySchema('Consign preference'),
});

// ==================== Agents & Services ====================

/**
 * Schema for getAgents method
 * Endpoint: GET /agents
 */
export const getAgentsSchema = z.object({
  params: paramsSchema,
});

/**
 * Schema for getBatteryQualifications method
 * Endpoint: GET /battery_qualifications
 */
export const getBatteryQualificationsSchema = z.object({
  params: paramsSchema,
});

/**
 * Schema for getDropoffSites method
 * Endpoint: GET /dropoff_sites
 */
export const getDropoffSitesSchema = z.object({
  params: z.record(z.string(), {
    description: 'Query parameters (postal_code, country, etc.)',
  }),
});

/**
 * Schema for getShippingServices method
 * Endpoint: GET /services
 */
export const getShippingServicesSchema = z.object({
  params: paramsSchema,
});

// ==================== Bundles ====================

/**
 * Schema for createBundle method
 * Endpoint: POST /bundle
 */
export const createBundleSchema = z.object({
  bundle_request: requestBodySchema('Bundle request'),
});

/**
 * Schema for getBundle method
 * Endpoint: GET /bundle/{bundle_id}
 */
export const getBundleSchema = z.object({
  bundle_id: idSchema('Bundle ID', 'The unique identifier for the bundle'),
});

/**
 * Schema for cancelBundle method
 * Endpoint: POST /bundle/{bundle_id}/cancel
 */
export const cancelBundleSchema = z.object({
  bundle_id: idSchema('Bundle ID', 'The unique identifier for the bundle to cancel'),
});

/**
 * Schema for getBundleLabel method
 * Endpoint: GET /bundle/{bundle_id}/label
 */
export const getBundleLabelSchema = z.object({
  bundle_id: idSchema('Bundle ID', 'The unique identifier for the bundle'),
});

// ==================== Packages (Single) ====================

/**
 * Schema for createPackage method
 * Endpoint: POST /package
 */
export const createPackageSchema = z.object({
  package_request: requestBodySchema('Package request'),
});

/**
 * Schema for getPackage method
 * Endpoint: GET /package/{package_id}
 */
export const getPackageSchema = z.object({
  package_id: idSchema('Package ID', 'The unique identifier for the package'),
});

/**
 * Schema for deletePackage method
 * Endpoint: DELETE /package/{package_id}
 */
export const deletePackageSchema = z.object({
  package_id: idSchema('Package ID', 'The unique identifier for the package to delete'),
});

/**
 * Schema for getPackageByOrderLineItem method
 * Endpoint: GET /package/{order_line_item_id}/item
 */
export const getPackageByOrderLineItemSchema = z.object({
  order_line_item_id: idSchema('Order line item ID', 'The order line item identifier'),
});

/**
 * Schema for cancelPackage method
 * Endpoint: POST /package/{package_id}/cancel
 */
export const cancelPackageSchema = z.object({
  package_id: idSchema('Package ID', 'The unique identifier for the package to cancel'),
});

/**
 * Schema for clonePackage method
 * Endpoint: POST /package/{package_id}/clone
 */
export const clonePackageSchema = z.object({
  package_id: idSchema('Package ID', 'The unique identifier for the package to clone'),
});

/**
 * Schema for confirmPackage method
 * Endpoint: POST /package/{package_id}/confirm
 */
export const confirmPackageSchema = z.object({
  package_id: idSchema('Package ID', 'The unique identifier for the package to confirm'),
});

// ==================== Packages (Bulk) ====================

/**
 * Schema for bulkCancelPackages method
 * Endpoint: POST /package/bulk_cancel_packages
 */
export const bulkCancelPackagesSchema = z.object({
  bulk_cancel_request: requestBodySchema('Bulk cancel request'),
});

/**
 * Schema for bulkConfirmPackages method
 * Endpoint: POST /package/bulk_confirm_packages
 */
export const bulkConfirmPackagesSchema = z.object({
  bulk_confirm_request: requestBodySchema('Bulk confirm request'),
});

/**
 * Schema for bulkDeletePackages method
 * Endpoint: POST /package/bulk_delete_packages
 */
export const bulkDeletePackagesSchema = z.object({
  bulk_delete_request: requestBodySchema('Bulk delete request'),
});

// ==================== Labels & Tracking ====================

/**
 * Schema for getLabels method
 * Endpoint: GET /labels
 */
export const getLabelsSchema = z.object({
  params: paramsSchema,
});

/**
 * Schema for getHandoverSheet method
 * Endpoint: GET /handover_sheet
 */
export const getHandoverSheetSchema = z.object({
  params: paramsSchema,
});

/**
 * Schema for getTracking method
 * Endpoint: GET /tracking
 */
export const getTrackingSchema = z.object({
  params: z.record(z.string(), {
    description: 'Query parameters (tracking_number required)',
  }),
});

// ==================== Other ====================

/**
 * Schema for createComplaint method
 * Endpoint: POST /complaint
 */
export const createComplaintSchema = z.object({
  complaint_request: requestBodySchema('Complaint request'),
});
