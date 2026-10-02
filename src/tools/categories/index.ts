import type { ToolEntry } from '@/tools/registry.js';
import { connectorEntries } from './connector.js';
import { tokenManagementEntries } from './tokenManagement.js';
import { accountEntries } from './account.js';
import { accountV2Entries } from './accountV2.js';
import { financesEntries } from './finances.js';
import { inventoryEntries } from './inventory.js';
import { mediaEntries } from './media.js';
import { feedEntries } from './feed.js';
import { storesEntries } from './stores.js';
import { fulfillmentEntries } from './fulfillment.js';
import { logisticsEntries } from './logistics.js';
import { marketingEntries } from './marketing.js';
import { analyticsEntries } from './analytics.js';
import { metadataEntries } from './metadata.js';
import { taxonomyEntries } from './taxonomy.js';
import { charityEntries } from './charity.js';
import { communicationEntries } from './communication.js';
import { browseEntries } from './browse.js';
import { otherEntries } from './other.js';
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
  { key: 'account', title: 'Account', entries: [...accountEntries, ...accountV2Entries] },
  { key: 'finances', title: 'Finances', entries: financesEntries },
  { key: 'inventory', title: 'Inventory', entries: [...inventoryEntries, ...mediaEntries] },
  { key: 'feed', title: 'Feed', entries: feedEntries },
  { key: 'stores', title: 'Stores', entries: storesEntries },
  { key: 'fulfillment', title: 'Fulfillment', entries: fulfillmentEntries },
  { key: 'logistics', title: 'Logistics', entries: logisticsEntries },
  { key: 'marketing', title: 'Marketing', entries: marketingEntries },
  { key: 'analytics', title: 'Analytics', entries: analyticsEntries },
  { key: 'metadata', title: 'Metadata', entries: metadataEntries },
  { key: 'taxonomy', title: 'Taxonomy', entries: [...taxonomyEntries, ...charityEntries] },
  { key: 'communication', title: 'Communication', entries: communicationEntries },
  { key: 'browse', title: 'Browse', entries: browseEntries },
  { key: 'other', title: 'Other', entries: otherEntries },
  { key: 'developer', title: 'Developer', entries: developerEntries },
  { key: 'trading', title: 'Trading', entries: tradingEntries },
];

/**
 * Registered tool entries in registry execution order, flattened from
 * {@link toolCategories}.
 */
export const registeredEntries: ToolEntry[] = toolCategories.flatMap(
  (category) => category.entries,
);
