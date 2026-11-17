import type { ToolEntry } from '@/tool-registry/registry.js';
import { connectorEntries } from '../server/connector-tools.js';
import { tokenManagementEntries } from '../auth/token-management-tools.js';
import { accountEntries } from '../ebay-apis/account/account-tools.js';
import { accountV2Entries } from '../ebay-apis/account/account-v2-tools.js';
import { financesEntries } from '../ebay-apis/finances/finances-tools.js';
import { inventoryEntries } from '../ebay-apis/inventory/inventory-tools.js';
import { mediaEntries } from '../ebay-apis/inventory/media-tools.js';
import { feedEntries } from '../ebay-apis/feed/feed-tools.js';
import { storesEntries } from '../ebay-apis/stores/stores-tools.js';
import { fulfillmentEntries } from '../ebay-apis/fulfillment/fulfillment-tools.js';
import { logisticsEntries } from '../ebay-apis/logistics/logistics-tools.js';
import { marketingEntries } from '../ebay-apis/marketing/marketing-tools.js';
import { analyticsEntries } from '../ebay-apis/analytics/analytics-tools.js';
import { metadataEntries } from '../ebay-apis/metadata/metadata-tools.js';
import { taxonomyEntries } from '../ebay-apis/taxonomy/taxonomy-tools.js';
import { charityEntries } from '../ebay-apis/taxonomy/charity-tools.js';
import { communicationEntries } from '../ebay-apis/communication/communication-tools.js';
import { browseEntries } from '../ebay-apis/browse/browse-tools.js';
import { otherEntries } from '../ebay-apis/other/other-tools.js';
import { developerEntries } from '../ebay-apis/developer/developer-tools.js';
import { tradingEntries } from '../ebay-apis/trading/trading-tools.js';

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
