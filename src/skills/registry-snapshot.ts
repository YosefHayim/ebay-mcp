import { toolCategories } from '@/tools/categories/index.js';
import type { RegistrySnapshot, ToolFamily } from '@/skills/types.js';

/**
 * Human descriptions for each tool family, keyed by the category `key` exported
 * from the registry. Kept here (next to the snapshot) so copy lives in one place
 * while counts stay live; an unknown key falls back to its registry title.
 */
const FAMILY_BLURBS: Record<string, string> = {
  connector:
    'ChatGPT connector protocol tools (`search`/`fetch`) — not used when driving the API directly',
  'token-management': 'OAuth URL, token status, refresh, and credential diagnostics',
  account:
    'Business policies (payment, return, fulfillment), privileges, program opt-in, sales tax',
  inventory:
    'Inventory items, offers, locations, inventory groups, bulk publish — the REST listing model',
  fulfillment: 'Orders, shipping fulfillments, refunds, and payment disputes',
  marketing: 'Promoted Listings campaigns, ads, promotions, and marketing reports',
  analytics: 'Seller standards, traffic reports, and customer-service metrics',
  metadata: 'Marketplace policies, item conditions, listing constraints, automotive compatibility',
  taxonomy: 'Category trees, category suggestions, and required item aspects',
  communication: 'Buyer messages, member messages, and notification settings',
  other: 'Feedback, recommendations, and assorted Sell-API helpers',
  developer: 'API status, rate limits, client registration, and signing keys',
  trading: 'Legacy Trading API (XML) — create / revise / relist / end fixed-price listings',
};

/**
 * Builds a {@link RegistrySnapshot} from the live tool registry so a rendered
 * skill always reflects the real catalogue. Counts come from {@link toolCategories}
 * (the single source of truth for registry families); blurbs are static copy.
 *
 * @returns The current tool count and per-family index, in registry order.
 */
export function buildRegistrySnapshot(): RegistrySnapshot {
  const families: ToolFamily[] = toolCategories.map((category) => ({
    key: category.key,
    title: category.title,
    count: category.entries.length,
    blurb: FAMILY_BLURBS[category.key] ?? category.title,
  }));

  const toolCount = families.reduce((sum, family) => sum + family.count, 0);

  return { toolCount, families };
}
