import type { ViewArchetype } from '@/tools/ui/view-models.js';

/**
 * Static description of one reusable UI archetype: the `ui://` resource it is
 * served under and the built HTML file that backs it.
 *
 * This is the single place that ties an archetype literal to its wire identity.
 * Adding a new archetype is therefore a three-step, fully type-checked change:
 * add the literal to {@link ViewArchetype}, add its view-model shape, and add one
 * entry here — `tsc` then forces a matching React app and `ui.map` everywhere.
 */
export interface UiArchetypeManifestEntry {
  /**
   * Stable resource identifier. A tool advertises this via `_meta.ui.resourceUri`
   * and the runtime registers the HTML under the same URI, so the host can fetch
   * the view out of band with `resources/read`.
   */
  uri: string;
  /** Human-readable name shown in the `resources/list` response. */
  name: string;
  /** File under `build/ui/` (produced by the Vite build) that holds the inlined app. */
  htmlFile: string;
}

/**
 * The archetype manifest — the authoritative map from {@link ViewArchetype} to its
 * resource URI and built asset. Both `defineTool` (to resolve a tool's
 * `resourceUri`) and the runtime seam (to register resources and gate emission)
 * read from here, so the two halves can never disagree on a URI or filename.
 */
export const uiArchetypes: Record<ViewArchetype, UiArchetypeManifestEntry> = {
  table: { uri: 'ui://ebay/table.html', name: 'eBay table view', htmlFile: 'table.html' },
  card: { uri: 'ui://ebay/card.html', name: 'eBay detail card view', htmlFile: 'card.html' },
  chart: { uri: 'ui://ebay/chart.html', name: 'eBay chart view', htmlFile: 'chart.html' },
};
