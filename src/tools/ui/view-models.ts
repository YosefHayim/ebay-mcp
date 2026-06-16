/**
 * View models for the interactive MCP Apps UI layer.
 *
 * These shapes are the **single source of truth** shared across the two build
 * graphs that make up the feature:
 *
 *  - the **server** (`src/mcp/runtime.ts` + each tool's `ui.map`) produces a
 *    `ViewModel` and ships it as the tool result's `structuredContent`, and
 *  - the **React apps** in `ui/` consume that same `structuredContent` to render.
 *
 * Because both sides import these types, a field rename is a compile error on
 * both ends rather than a silent runtime mismatch — the same anti-drift property
 * `defineTool` gives the rest of the registry. Keep this module dependency-free
 * (no Node, no React, no eBay types) so the `ui/` Vite build can import it
 * without dragging the server graph in.
 *
 * Each archetype carries an `archetype` discriminant so a consumer that receives
 * an untyped `structuredContent` can narrow to the concrete shape it expects.
 */

/** The fixed set of reusable UI archetypes a tool may render into. */
export type ViewArchetype = 'table' | 'card' | 'chart';

/**
 * A reference to a non-destructive server tool call the UI can trigger on the
 * user's behalf (e.g. drill into a row, load the next page, refresh). Only
 * read-only tools should ever be referenced here — the UI layer never wires
 * mutating calls. `label` is shown on the control that triggers it.
 */
export interface ToolCallRef {
  tool: string;
  arguments: Record<string, unknown>;
  label?: string;
}

/** A single value rendered in a table cell. Mapping functions pre-format these. */
export type CellValue = string | number | null;

/** Column header + how its cells align. `key` indexes into each row's `cells`. */
export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

/**
 * One table row. `id` is a stable key for React rendering. `drill`, when set,
 * makes the row clickable and runs a read-only tool call (e.g. order → detail).
 */
export interface TableRow {
  id: string;
  cells: Record<string, CellValue>;
  drill?: ToolCallRef;
}

/**
 * Tabular list view (inventory items, offers, orders, fulfillments, disputes,
 * locations). The most common archetype: a sortable, optionally paginated table
 * whose rows can drill into a detail view.
 */
export interface TableViewModel {
  archetype: 'table';
  title?: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** When present, renders a "Load more" control that runs this read-only call. */
  loadMore?: ToolCallRef;
  /** Small contextual line under the table (e.g. "showing 25 of 240"). */
  footnote?: string;
}

/** Coloured status pill, e.g. an order's fulfillment state. */
export interface CardBadge {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

/** A labelled key/value shown inside a card section. */
export interface CardField {
  label: string;
  value: CellValue;
}

/** A titled group of fields within a detail card. */
export interface CardSection {
  heading?: string;
  fields: CardField[];
}

/**
 * Single-entity detail view (one order, inventory item, offer, dispute, seller
 * standards profile). Renders a header with badges plus grouped field sections.
 */
export interface CardViewModel {
  archetype: 'card';
  title?: string;
  subtitle?: string;
  badges?: CardBadge[];
  sections: CardSection[];
}

/** One plotted point. `x` is a category/time label; `y` is the numeric value. */
export interface ChartPoint {
  x: string;
  y: number;
}

/** A named line/bar series with its points and an optional explicit colour. */
export interface ChartSeries {
  name: string;
  points: ChartPoint[];
  color?: string;
}

/**
 * Time-series / categorical chart (traffic report, customer-service metrics).
 * Rendered as inline SVG so the chart archetype stays dependency-free.
 */
export interface ChartViewModel {
  archetype: 'chart';
  title?: string;
  kind: 'line' | 'bar';
  xLabel?: string;
  yLabel?: string;
  series: ChartSeries[];
}

/**
 * The data a tool ships as `structuredContent` for the host to render. A
 * discriminated union over {@link ViewArchetype}; each member is consumed by the
 * matching React app in `ui/`.
 */
export type ViewModel = TableViewModel | CardViewModel | ChartViewModel;

/** Maps an archetype literal to its concrete view-model type. */
export interface ViewModelByArchetype {
  table: TableViewModel;
  card: CardViewModel;
  chart: ChartViewModel;
}
