/**
 * Tool Definitions Index
 *
 * This file aggregates all tool definitions from category-specific files.
 * Each category is in its own file for better organization and reduced context.
 *
 * Benefits:
 * - Reduced file size (each file ~50-300 lines vs 1,402 lines)
 * - Better organization by API domain
 * - Easier to find and modify tools
 * - Less context for AI to process per category
 */

import { tokenManagementTools } from './token-management.js';
import { accountTools } from './account.js';
import { inventoryTools } from './inventory.js';
import { fulfillmentTools } from './fulfillment.js';
import { marketingTools } from './marketing.js';
import { analyticsTools } from './analytics.js';
import { metadataTools } from './metadata.js';
import { taxonomyTools } from './taxonomy.js';
import { communicationTools } from './communication.js';
import { otherApiTools } from './other.js';

// Export individual categories
export {
  tokenManagementTools,
  accountTools,
  inventoryTools,
  fulfillmentTools,
  marketingTools,
  analyticsTools,
  metadataTools,
  taxonomyTools,
  communicationTools,
  otherApiTools,
};

// Export all tools as a single array
export const allTools = [
  ...tokenManagementTools,
  ...accountTools,
  ...inventoryTools,
  ...fulfillmentTools,
  ...marketingTools,
  ...analyticsTools,
  ...metadataTools,
  ...taxonomyTools,
  ...communicationTools,
  ...otherApiTools,
];

// Export types
export type { ToolDefinition } from './account.js';
