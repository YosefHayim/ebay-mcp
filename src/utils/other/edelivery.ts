import { z } from 'zod';

/**
 * Zod schemas for eDelivery API input validation
 * Based on: src/api/other/edelivery.ts
 * OpenAPI spec: docs/sell-apps/other-apis/sell_edelivery_international_shipping_oas3.json
 *
 * Note: The eDelivery API is only available for Greater-China based sellers with an active eDIS account.
 */

// Reusable schema for ID parameters
const idSchema = (name: string) =>
  z.string({
    error: `${name.toLowerCase().replace(/\s+/g, '_')} is required and must be a string`,
  });

// Reusable schema for query parameters (Record<string, string>)
const paramsSchema = z.record(z.string(), z.string()).optional();

// Reusable schema for request body objects (Record<string, unknown>)
const requestBodySchema = (_name: string) => z.record(z.string(), z.unknown());

/**
 * Schema for createShippingQuote method
 * Endpoint: POST /shipping_quote
 */
export const createShippingQuoteSchema = z.object({
  shipping_quote_request: requestBodySchema('Shipping quote request'),
});

/**
 * Schema for getShippingQuote method
 * Endpoint: GET /shipping_quote/{shipping_quote_id}
 */
export const getShippingQuoteSchema = z.object({
  shipping_quote_id: idSchema('Shipping quote ID'),
});

// ==================== Cost & Preferences ====================

export const getActualCostsSchema = z.object({
  params: paramsSchema,
});

export const getAddressPreferencesSchema = z.object({});

export const createAddressPreferenceSchema = z.object({
  address_preference: requestBodySchema('Address preference'),
});

export const getConsignPreferencesSchema = z.object({});

export const createConsignPreferenceSchema = z.object({
  consign_preference: requestBodySchema('Consign preference'),
});

// ==================== Agents & Services ====================

export const getAgentsSchema = z.object({
  params: paramsSchema,
});

export const getBatteryQualificationsSchema = z.object({
  params: paramsSchema,
});

export const getDropoffSitesSchema = z.object({
  params: z.record(z.string(), z.string()),
});

export const getShippingServicesSchema = z.object({
  params: paramsSchema,
});

// ==================== Bundles ====================

export const createBundleSchema = z.object({
  bundle_request: requestBodySchema('Bundle request'),
});

export const getBundleSchema = z.object({
  bundle_id: idSchema('Bundle ID'),
});

export const cancelBundleSchema = z.object({
  bundle_id: idSchema('Bundle ID'),
});

export const getBundleLabelSchema = z.object({
  bundle_id: idSchema('Bundle ID'),
});

// ==================== Packages (Single) ====================

export const createPackageSchema = z.object({
  package_request: requestBodySchema('Package request'),
});

export const getPackageSchema = z.object({
  package_id: idSchema('Package ID'),
});

export const deletePackageSchema = z.object({
  package_id: idSchema('Package ID'),
});

export const getPackageByOrderLineItemSchema = z.object({
  order_line_item_id: idSchema('Order line item ID'),
});

export const cancelPackageSchema = z.object({
  package_id: idSchema('Package ID'),
});

export const clonePackageSchema = z.object({
  package_id: idSchema('Package ID'),
});

export const confirmPackageSchema = z.object({
  package_id: idSchema('Package ID'),
});

// ==================== Packages (Bulk) ====================

export const bulkCancelPackagesSchema = z.object({
  bulk_cancel_request: requestBodySchema('Bulk cancel request'),
});

export const bulkConfirmPackagesSchema = z.object({
  bulk_confirm_request: requestBodySchema('Bulk confirm request'),
});

export const bulkDeletePackagesSchema = z.object({
  bulk_delete_request: requestBodySchema('Bulk delete request'),
});

// ==================== Labels & Tracking ====================

export const getLabelsSchema = z.object({
  params: paramsSchema,
});

export const getHandoverSheetSchema = z.object({
  params: paramsSchema,
});

export const getTrackingSchema = z.object({
  params: z.record(z.string(), z.string()),
});

// ==================== Other ====================

export const createComplaintSchema = z.object({
  complaint_request: requestBodySchema('Complaint request'),
});
