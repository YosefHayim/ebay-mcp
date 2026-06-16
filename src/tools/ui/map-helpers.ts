/**
 * Formatting primitives shared by the tool → view-model mappers in `maps.ts`.
 *
 * These are deliberately tiny and pure: each takes a value straight off an eBay
 * response (often `string | undefined`, or a JSON leaf typed as
 * `Record<string, never>` by the OpenAPI generator) and returns a display-ready
 * primitive a {@link ViewModel} can carry. Centralising them keeps the 13
 * mappers free of repeated null-handling and number coercion, and gives the
 * unit tests one obvious place to pin formatting behaviour.
 */

import type { CardBadge } from '@/tools/ui/view-models.js';

/**
 * Minimal monetary shape common to eBay's `Amount` and `SimpleAmount` schemas.
 * Declared locally so the helper accepts either without importing generated
 * types or widening to `unknown`.
 */
interface MoneyLike {
  value?: string;
  currency?: string;
}

/**
 * Renders an eBay money object as `"<value> <currency>"` (e.g. `"25.99 USD"`),
 * or just the value when no currency is present. Returns `null` for a missing
 * amount so callers can drop it straight into a nullable cell or field.
 */
export function formatAmount(amount: MoneyLike | undefined): string | null {
  if (amount?.value == null) {
    return null;
  }
  return amount.currency ? `${amount.value} ${amount.currency}` : amount.value;
}

/**
 * Turns eBay's `SCREAMING_SNAKE_CASE` status codes into human-readable sentence
 * case (`"ITEM_NOT_RECEIVED"` → `"Item not received"`): underscores become
 * spaces and only the first word is capitalised, which reads more naturally for
 * multi-word statuses than Title Case. Returns an em dash for a missing status
 * so tables and cards never render a blank cell.
 */
export function humanizeStatus(status: string | undefined): string {
  if (!status) {
    return '—';
  }
  const lowered = status.toLowerCase().replace(/_/g, ' ');
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

/**
 * Maps a status code to a {@link CardBadge} tone so detail cards can colour
 * their state pills. Unknown or terminal-neutral statuses fall back to
 * `'neutral'`. The buckets are intentionally broad keyword matches rather than
 * an exhaustive enum — new eBay statuses degrade to neutral, never to a wrong
 * colour-implied meaning.
 */
export function statusTone(status: string | undefined): CardBadge['tone'] {
  if (!status) {
    return 'neutral';
  }
  const upper = status.toUpperCase();
  if (/FAIL|CANCEL|UNPAID|DECLINE|SUSPEND|OUT_OF_STOCK|BELOW_STANDARD|DISABLED/.test(upper)) {
    return 'danger';
  }
  if (/PENDING|IN_PROGRESS|NOT_STARTED|PARTIALLY|ACTION|WAITING|OPEN|UNDER_REVIEW/.test(upper)) {
    return 'warning';
  }
  if (
    /COMPLETE|FULFILLED|PAID|ACTIVE|PUBLISHED|ENABLED|RESOLVED|TOP_RATED|ABOVE_STANDARD/.test(upper)
  ) {
    return 'success';
  }
  return 'neutral';
}

/**
 * Coerces an untyped JSON leaf (the analytics specs type report values as
 * `Record<string, never>`, though at runtime they are numbers or numeric
 * strings) to a finite number, defaulting to `0`. Used for chart Y values.
 */
export function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Coerces an untyped JSON leaf to a chart-axis label string, returning `''` for
 * values that have no sensible textual form (objects, `null`, `undefined`).
 */
export function toLabel(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

/**
 * Shortens free-text (product descriptions, titles) to `max` characters with a
 * trailing ellipsis, so a table cell or card field stays one line. Returns `''`
 * for missing text.
 */
export function truncate(text: string | undefined, max = 80): string {
  if (!text) {
    return '';
  }
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
