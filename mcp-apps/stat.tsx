/**
 * Stat archetype view: a responsive grid of headline metric tiles. Backs
 * `ui://ebay/stat.html` and renders API rate-limit headroom (calls remaining
 * against the quota) for the application- and user-scoped rate-limit tools.
 */

import type { ReactNode } from 'react';
import type { StatTile, StatViewModel } from '@/tools/ui/viewModels.js';
import { AppShell, EmptyState, mount, useViewModel } from './host.js';

/** Maps a tile tone to its CSS modifier class. */
function tileClass(tone: StatTile['tone']): string {
  return tone && tone !== 'neutral' ? `stat-tile stat-tile--${tone}` : 'stat-tile';
}

/** Renders the grid of metric tiles. */
function Stat({ view }: { view: StatViewModel }): ReactNode {
  return (
    <div className="stat-view">
      {view.title ? <h1 className="view-title">{view.title}</h1> : null}
      <div className="stat-grid">
        {view.tiles.map((tile, index) => (
          <div key={`${tile.label}-${index}`} className={tileClass(tile.tone)}>
            <span className="stat-label">{tile.label}</span>
            <span className="stat-value">{tile.value === null ? '—' : tile.value}</span>
            {tile.sub ? <span className="stat-sub">{tile.sub}</span> : null}
          </div>
        ))}
      </div>
      {view.footnote ? <p className="view-footnote">{view.footnote}</p> : null}
    </div>
  );
}

/** Top-level stat app: handshake state plus the rendered grid. */
function StatApp(): ReactNode {
  const { view, isConnected, error } = useViewModel('stat');
  const hasTiles = view ? view.tiles.length > 0 : false;
  return (
    <AppShell isConnected={isConnected} error={error}>
      {view && hasTiles ? <Stat view={view} /> : <EmptyState label="No metrics" />}
    </AppShell>
  );
}

mount(<StatApp />);
