/**
 * Central export for all eBay MCP API Schemas
 *
 * This file provides convenient access to all Zod schemas and their JSON Schema conversions
 * for use with MCP (Model Context Protocol) tools.
 *
 * Usage:
 * ```typescript
 * import {
 *   getAccountManagementJsonSchemas,
 *   getInventoryManagementJsonSchemas,
 *   getCommunicationJsonSchemas,
 *   getFulfillmentJsonSchemas,
 *   getMarketingJsonSchemas,
 *   getMetadataJsonSchemas,
 *   getAnalyticsJsonSchemas,
 *   getTaxonomyJsonSchemas,
 *   getOtherApisJsonSchemas,
 *   getAllJsonSchemas,
 * } from '@/schemas';
 * ```
 */

// Account Management
export * from './account-management/account.js';

// Inventory Management
export * from './inventory-management/inventory.js';

// Communication (Messages, Feedback, Notifications)
export * from './communication/messages.js';

// Fulfillment (Orders, Shipping, Refunds)
export * from './fulfillment/orders.js';

// Marketing & Promotions (Campaigns, Ads, Keywords, Promotions)
export * from './marketing/marketing.js';

// Metadata (Marketplace Policies, Compatibility)
export * from './metadata/metadata.js';

// Analytics (Reports, Metrics, Standards)
export * from './analytics/analytics.js';

// Taxonomy (Categories, Suggestions, Aspects)
export * from './taxonomy/taxonomy.js';

// Other APIs (Identity, Compliance, VERO, Translation, eDelivery)
export * from './other/other-apis.js';

// Re-export commonly used schema converters
import { getAccountManagementJsonSchemas } from './account-management/account.js';
import { getInventoryManagementJsonSchemas } from './inventory-management/inventory.js';
import { getCommunicationJsonSchemas } from './communication/messages.js';
import { getFulfillmentJsonSchemas } from './fulfillment/orders.js';
import { getMarketingJsonSchemas } from './marketing/marketing.js';
import { getMetadataJsonSchemas } from './metadata/metadata.js';
import { getAnalyticsJsonSchemas } from './analytics/analytics.js';
import { getTaxonomyJsonSchemas } from './taxonomy/taxonomy.js';
import { getOtherApisJsonSchemas } from './other/other-apis.js';

/**
 * Get all JSON schemas for all eBay APIs
 *
 * @returns An object containing all JSON schemas organized by API category
 */
export function getAllJsonSchemas() {
  return {
    accountManagement: getAccountManagementJsonSchemas(),
    inventoryManagement: getInventoryManagementJsonSchemas(),
    communication: getCommunicationJsonSchemas(),
    fulfillment: getFulfillmentJsonSchemas(),
    marketing: getMarketingJsonSchemas(),
    metadata: getMetadataJsonSchemas(),
    analytics: getAnalyticsJsonSchemas(),
    taxonomy: getTaxonomyJsonSchemas(),
    otherApis: getOtherApisJsonSchemas(),
  };
}

/**
 * Type representing all available JSON schemas
 */
export type AllJsonSchemas = ReturnType<typeof getAllJsonSchemas>;

