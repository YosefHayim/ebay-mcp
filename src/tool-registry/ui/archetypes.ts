import type { ViewArchetype } from "@/tool-registry/ui/viewModels.js";

export interface UiArchetypeManifestEntry {
	uri: string;
	name: string;
	htmlFile: string;
}

export const uiArchetypes: Record<ViewArchetype, UiArchetypeManifestEntry> = {
	table: {
		uri: "ui://ebay/table.html",
		name: "eBay table view",
		htmlFile: "table.html",
	},
	card: {
		uri: "ui://ebay/card.html",
		name: "eBay detail card view",
		htmlFile: "card.html",
	},
	chart: {
		uri: "ui://ebay/chart.html",
		name: "eBay chart view",
		htmlFile: "chart.html",
	},
	stat: {
		uri: "ui://ebay/stat.html",
		name: "eBay stat grid view",
		htmlFile: "stat.html",
	},
};
