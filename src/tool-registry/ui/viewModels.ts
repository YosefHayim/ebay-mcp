export type ViewArchetype = "table" | "card" | "chart" | "stat";

export interface ToolCallRef {
	tool: string;
	arguments: Record<string, unknown>;
	label?: string;
}

export type CellValue = string | number | null;

export interface TableColumn {
	key: string;
	label: string;
	align?: "left" | "right";
}

export interface TableRow {
	id: string;
	cells: Record<string, CellValue>;
	drill?: ToolCallRef;
}

export interface TableViewModel {
	archetype: "table";
	title?: string;
	columns: TableColumn[];
	rows: TableRow[];
	loadMore?: ToolCallRef;
	footnote?: string;
}

export type Tone = "neutral" | "success" | "warning" | "danger";

export interface CardBadge {
	label: string;
	tone?: Tone;
}

export interface CardField {
	label: string;
	value: CellValue;
}

export interface CardSection {
	heading?: string;
	fields: CardField[];
}

export interface CardViewModel {
	archetype: "card";
	title?: string;
	subtitle?: string;
	badges?: CardBadge[];
	sections: CardSection[];
}

export interface ChartPoint {
	x: string;
	y: number;
}

export interface ChartSeries {
	name: string;
	points: ChartPoint[];
	color?: string;
}

export interface ChartViewModel {
	archetype: "chart";
	title?: string;
	kind: "line" | "bar";
	xLabel?: string;
	yLabel?: string;
	series: ChartSeries[];
}

export interface StatTile {
	label: string;
	value: CellValue;
	sub?: string;
	tone?: Tone;
}

export interface StatViewModel {
	archetype: "stat";
	title?: string;
	tiles: StatTile[];
	footnote?: string;
}

export type ViewModel =
	| TableViewModel
	| CardViewModel
	| ChartViewModel
	| StatViewModel;

export interface ViewModelByArchetype {
	table: TableViewModel;
	card: CardViewModel;
	chart: ChartViewModel;
	stat: StatViewModel;
}
