import type { ReactNode } from "react";
import type { StatTile, StatViewModel } from "@/tool-registry/ui/viewModels.js";
import { AppShell, EmptyState, mount, useViewModel } from "./host.js";

function tileClass(tone: StatTile["tone"]): string {
	const hasNoTone = tone == null;

	if (hasNoTone) {
		return "stat-tile";
	}

	const isNeutral = tone == "neutral";

	if (isNeutral) {
		return "stat-tile";
	}

	return `stat-tile stat-tile--${tone}`;
}

function statBody(view: StatViewModel | null): ReactNode {
	const hasNoView = view == null;

	if (hasNoView) {
		return <EmptyState label="No metrics" />;
	}

	const hasNoTiles = view.tiles.length == 0;

	if (hasNoTiles) {
		return <EmptyState label="No metrics" />;
	}

	return <Stat view={view} />;
}

function Stat({ view }: { view: StatViewModel }): ReactNode {
	return (
		<div className="stat-view">
			{view.title ? <h1 className="view-title">{view.title}</h1> : null}
			<div className="stat-grid">
				{view.tiles.map((tile, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: tile labels can repeat
					<div key={`${tile.label}-${index}`} className={tileClass(tile.tone)}>
						<span className="stat-label">{tile.label}</span>
						<span className="stat-value">
							{tile.value === null ? "—" : tile.value}
						</span>
						{tile.sub ? <span className="stat-sub">{tile.sub}</span> : null}
					</div>
				))}
			</div>
			{view.footnote ? <p className="view-footnote">{view.footnote}</p> : null}
		</div>
	);
}

function StatApp(): ReactNode {
	const { view, isConnected, error } = useViewModel("stat");

	return (
		<AppShell isConnected={isConnected} error={error}>
			{statBody(view)}
		</AppShell>
	);
}

mount(<StatApp />);
