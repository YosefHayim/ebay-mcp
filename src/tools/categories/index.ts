import type { ToolEntry } from '@/tools/registry.js';
import { connectorEntries } from './connector.js';
import { tokenManagementEntries } from './token-management.js';
import { accountEntries } from './account.js';
import { inventoryEntries } from './inventory.js';
import { fulfillmentEntries } from './fulfillment.js';
import { marketingEntries, marketingHandlerOnlyEntries } from './marketing.js';
import { analyticsEntries } from './analytics.js';
import { metadataEntries } from './metadata.js';
import { taxonomyEntries } from './taxonomy.js';
import { communicationEntries, communicationHandlerOnlyEntries } from './communication.js';
import { otherEntries, claudeEntries } from './other.js';
import { developerEntries } from './developer.js';
import { tradingEntries } from './trading.js';

/**
 * A named group of registered tool entries, owned by one eBay API area (or the
 * ChatGPT connector). This is the single source of truth for both the registry
 * order and any feature that needs the tool catalogue grouped by family — e.g.
 * the skills generator's live family index. `key` is the stable identifier;
 * `title` is a short human label.
 */
export interface ToolCategory {
  key: string;
  title: string;
  entries: ToolEntry[];
}

/**
 * Registered tool families in registry execution order. Connector tools
 * (`search`/`fetch`) are registered ahead of the eBay API tools, matching the
 * prior registry. {@link registeredEntries} is derived from this list, so adding
 * a family here both registers its tools and surfaces it in the family index.
 */
export const toolCategories: ToolCategory[] = [
  { key: 'connector', title: 'Connector', entries: connectorEntries },
  { key: 'token-management', title: 'Token Management', entries: tokenManagementEntries },
  { key: 'account', title: 'Account', entries: accountEntries },
  { key: 'inventory', title: 'Inventory', entries: inventoryEntries },
  { key: 'fulfillment', title: 'Fulfillment', entries: fulfillmentEntries },
  { key: 'marketing', title: 'Marketing', entries: marketingEntries },
  { key: 'analytics', title: 'Analytics', entries: analyticsEntries },
  { key: 'metadata', title: 'Metadata', entries: metadataEntries },
  { key: 'taxonomy', title: 'Taxonomy', entries: taxonomyEntries },
  { key: 'communication', title: 'Communication', entries: communicationEntries },
  { key: 'other', title: 'Other', entries: otherEntries },
  { key: 'developer', title: 'Developer', entries: developerEntries },
  { key: 'trading', title: 'Trading', entries: tradingEntries },
];

/**
 * Registered tool entries in registry execution order, flattened from
 * {@link toolCategories}.
 */
export const registeredEntries: ToolEntry[] = toolCategories.flatMap(
  (category) => category.entries
);

/**
 * Handler-only entries: callable via `executeTool`/`getToolHandler` but intentionally
 * not advertised to MCP clients (no registered definition). Preserves prior behavior
 * for handlers that existed without a corresponding definition.
 */
export const handlerOnlyEntries: ToolEntry[] = [
  ...claudeEntries,
  ...communicationHandlerOnlyEntries,
  ...marketingHandlerOnlyEntries,
];
