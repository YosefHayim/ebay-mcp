/**
 * Card archetype view: a single-entity detail panel with status badges and
 * grouped field sections. Backs `ui://ebay/card.html` and renders one order,
 * offer, inventory item, dispute, or seller standards profile.
 */

import type { ReactNode } from 'react';
import type { CardBadge, CardViewModel } from '../src/tools/ui/view-models';
import { AppShell, EmptyState, mount, useViewModel } from './host';

/** Maps a badge tone to its CSS modifier class. */
function badgeClass(tone: CardBadge['tone']): string {
  return tone && tone !== 'neutral' ? `badge badge--${tone}` : 'badge';
}

/** Renders the header, badges, and sections of a detail card. */
function Card({ view }: { view: CardViewModel }): ReactNode {
  return (
    <div className="card-view">
      <div className="card-header">
        {view.title ? <h1 className="view-title">{view.title}</h1> : null}
        {view.subtitle ? <span className="card-subtitle">{view.subtitle}</span> : null}
      </div>
      {view.badges && view.badges.length > 0 ? (
        <div className="badges">
          {view.badges.map((badge, index) => (
            <span key={`${badge.label}-${index}`} className={badgeClass(badge.tone)}>
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
      {view.sections.map((section, sectionIndex) => (
        <div key={section.heading ?? sectionIndex} className="card-section">
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.fields.map((field, fieldIndex) => (
            <div key={`${field.label}-${fieldIndex}`} className="field">
              <span className="field-label">{field.label}</span>
              <span className="field-value">{field.value === null ? '—' : field.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Top-level card app: handshake state plus the rendered card. */
function CardApp(): ReactNode {
  const { view, isConnected, error } = useViewModel('card');
  return (
    <AppShell isConnected={isConnected} error={error}>
      {view ? <Card view={view} /> : <EmptyState label="No details" />}
    </AppShell>
  );
}

mount(<CardApp />);
