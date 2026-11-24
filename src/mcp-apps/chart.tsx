import type { ReactNode } from "react";
import type {
	ChartSeries,
	ChartViewModel,
} from "@/tool-registry/ui/viewModels.js";
import { AppShell, EmptyState, mount, useViewModel } from "./host.js";

const PALETTE = [
	"#3b82f6",
	"#ef4444",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#06b6d4",
];

const WIDTH = 640;
const HEIGHT = 320;
const PAD = { top: 16, right: 12, bottom: 44, left: 44 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const BASELINE = PAD.top + PLOT_H;

function seriesColor(series: ChartSeries, index: number): string {
	const fallbackColor = PALETTE[index % PALETTE.length] ?? "#64748b";
	return series.color ?? fallbackColor;
}

function labelStride(count: number): number {
	return count > 12 ? Math.ceil(count / 12) : 1;
}

function Chart({ view }: { view: ChartViewModel }): ReactNode {
	const labels = view.series[0]?.points.map((point) => point.x) ?? [];
	const allValues = view.series.flatMap((series) =>
		series.points.map((point) => point.y),
	);
	const maxY = Math.max(1, ...allValues);
	function yFor(y: number): number {
		return BASELINE - (y / maxY) * PLOT_H;
	}
	const stride = labelStride(labels.length);

	// Line points are spread edge-to-edge; bar groups each get an equal slot.
	function lineX(index: number): number {
		return labels.length > 1
			? PAD.left + (index / (labels.length - 1)) * PLOT_W
			: PAD.left + PLOT_W / 2;
	}
	const groupWidth = labels.length > 0 ? PLOT_W / labels.length : PLOT_W;
	const barWidth = (groupWidth * 0.8) / Math.max(1, view.series.length);

	return (
		<div className="chart">
			{view.title ? <h1 className="view-title">{view.title}</h1> : null}
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role="img"
				aria-label={view.title}
			>
				<line
					className="chart-axis"
					x1={PAD.left}
					y1={BASELINE}
					x2={WIDTH - PAD.right}
					y2={BASELINE}
				/>
				<line
					className="chart-axis"
					x1={PAD.left}
					y1={PAD.top}
					x2={PAD.left}
					y2={BASELINE}
				/>
				<text
					className="chart-label"
					x={PAD.left - 6}
					y={PAD.top + 4}
					textAnchor="end"
				>
					{maxY}
				</text>

				{view.kind == "line"
					? view.series.map((series, seriesIndex) => (
							<polyline
								// biome-ignore lint/suspicious/noArrayIndexKey: series names can repeat
								key={`${series.name}-${seriesIndex}`}
								fill="none"
								stroke={seriesColor(series, seriesIndex)}
								strokeWidth={2}
								points={series.points
									.map((point, i) => `${lineX(i)},${yFor(point.y)}`)
									.join(" ")}
							/>
						))
					: view.series.map((series, seriesIndex) =>
							series.points.map((point, groupIndex) => {
								const slotStart =
									PAD.left + groupIndex * groupWidth + groupWidth * 0.1;
								const x = slotStart + seriesIndex * barWidth;
								const y = yFor(point.y);
								return (
									<rect
										// biome-ignore lint/suspicious/noArrayIndexKey: series names can repeat
										key={`${series.name}-${groupIndex}`}
										x={x}
										y={y}
										width={Math.max(1, barWidth - 1)}
										height={BASELINE - y}
										fill={seriesColor(series, seriesIndex)}
									/>
								);
							}),
						)}

				{labels.map((label, index) =>
					index % stride == 0 ? (
						<text
							// biome-ignore lint/suspicious/noArrayIndexKey: axis labels can repeat
							key={`${label}-${index}`}
							className="chart-label"
							x={
								view.kind == "line"
									? lineX(index)
									: PAD.left + (index + 0.5) * groupWidth
							}
							y={BASELINE + 16}
							textAnchor="middle"
						>
							{label}
						</text>
					) : null,
				)}
			</svg>

			<div className="chart-legend">
				{view.series.map((series, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: series names can repeat
					<span key={`${series.name}-${index}`}>
						<span
							className="chart-swatch"
							style={{ background: seriesColor(series, index) }}
						/>
						{series.name}
					</span>
				))}
			</div>
		</div>
	);
}

function ChartApp(): ReactNode {
	const { view, isConnected, error } = useViewModel("chart");
	const hasData = view
		? view.series.some((series) => series.points.length > 0)
		: false;
	return (
		<AppShell isConnected={isConnected} error={error}>
			{view && hasData ? (
				<Chart view={view} />
			) : (
				<EmptyState label="No chart data" />
			)}
		</AppShell>
	);
}

mount(<ChartApp />);
