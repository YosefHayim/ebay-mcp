/**
 * Chart archetype view: a dependency-free inline-SVG line or bar chart. Backs
 * `ui://ebay/chart.html` and renders the traffic report (line) and customer
 * service metrics (bar). Kept deliberately small — one shared coordinate space,
 * a line branch and a bar branch — rather than pulling in a charting library.
 */

import type { ReactNode } from 'react';
import type { ChartSeries, ChartViewModel } from '../src/tools/ui/view-models';
import { AppShell, EmptyState, mount, useViewModel } from './host';

/** Fallback series colours, assigned by index when a series sets no explicit colour. */
const PALETTE = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const WIDTH = 640;
const HEIGHT = 320;
const PAD = { top: 16, right: 12, bottom: 44, left: 44 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const BASELINE = PAD.top + PLOT_H;

/** Returns the colour for a series, falling back to the palette by index. */
function seriesColor(series: ChartSeries, index: number): string {
  return series.color ?? PALETTE[index % PALETTE.length];
}

/** Picks a label stride so at most ~12 x-axis labels render without crowding. */
function labelStride(count: number): number {
  return count > 12 ? Math.ceil(count / 12) : 1;
}

/** Renders the chart SVG plus a legend. */
function Chart({ view }: { view: ChartViewModel }): ReactNode {
  const labels = view.series[0]?.points.map((point) => point.x) ?? [];
  const allValues = view.series.flatMap((series) => series.points.map((point) => point.y));
  const maxY = Math.max(1, ...allValues);
  const yFor = (value: number): number => BASELINE - (value / maxY) * PLOT_H;
  const stride = labelStride(labels.length);

  // Line points are spread edge-to-edge; bar groups each get an equal slot.
  const lineX = (index: number): number =>
    labels.length > 1 ? PAD.left + (index / (labels.length - 1)) * PLOT_W : PAD.left + PLOT_W / 2;
  const groupWidth = labels.length > 0 ? PLOT_W / labels.length : PLOT_W;
  const barWidth = (groupWidth * 0.8) / Math.max(1, view.series.length);

  return (
    <div className="chart">
      {view.title ? <h1 className="view-title">{view.title}</h1> : null}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={view.title ?? 'Chart'}>
        <line
          className="chart-axis"
          x1={PAD.left}
          y1={BASELINE}
          x2={WIDTH - PAD.right}
          y2={BASELINE}
        />
        <line className="chart-axis" x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={BASELINE} />
        <text className="chart-label" x={PAD.left - 6} y={PAD.top + 4} textAnchor="end">
          {maxY}
        </text>

        {view.kind === 'line'
          ? view.series.map((series, seriesIndex) => (
              <polyline
                key={series.name}
                fill="none"
                stroke={seriesColor(series, seriesIndex)}
                strokeWidth={2}
                points={series.points.map((point, i) => `${lineX(i)},${yFor(point.y)}`).join(' ')}
              />
            ))
          : view.series.map((series, seriesIndex) =>
              series.points.map((point, groupIndex) => {
                const slotStart = PAD.left + groupIndex * groupWidth + groupWidth * 0.1;
                const x = slotStart + seriesIndex * barWidth;
                const y = yFor(point.y);
                return (
                  <rect
                    key={`${series.name}-${groupIndex}`}
                    x={x}
                    y={y}
                    width={Math.max(1, barWidth - 1)}
                    height={BASELINE - y}
                    fill={seriesColor(series, seriesIndex)}
                  />
                );
              })
            )}

        {labels.map((label, index) =>
          index % stride === 0 ? (
            <text
              key={`${label}-${index}`}
              className="chart-label"
              x={view.kind === 'line' ? lineX(index) : PAD.left + (index + 0.5) * groupWidth}
              y={BASELINE + 16}
              textAnchor="middle"
            >
              {label}
            </text>
          ) : null
        )}
      </svg>

      <div className="chart-legend">
        {view.series.map((series, index) => (
          <span key={series.name}>
            <span className="chart-swatch" style={{ background: seriesColor(series, index) }} />
            {series.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Top-level chart app: handshake state plus the rendered chart. */
function ChartApp(): ReactNode {
  const { view, isConnected, error } = useViewModel('chart');
  const hasData = view ? view.series.some((series) => series.points.length > 0) : false;
  return (
    <AppShell isConnected={isConnected} error={error}>
      {view && hasData ? <Chart view={view} /> : <EmptyState label="No chart data" />}
    </AppShell>
  );
}

mount(<ChartApp />);
