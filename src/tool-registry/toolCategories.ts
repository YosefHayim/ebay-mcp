import { tokenManagementEntries } from "@/auth/tokenManagementTools.js";
import { accountEntries } from "@/ebay-apis/account/accountTools.js";
import { accountV2Entries } from "@/ebay-apis/account/accountV2Tools.js";
import { analyticsEntries } from "@/ebay-apis/analytics/analyticsTools.js";
import { browseEntries } from "@/ebay-apis/browse/browseTools.js";
import { communicationEntries } from "@/ebay-apis/communication/communicationTools.js";
import { developerEntries } from "@/ebay-apis/developer/developerTools.js";
import { feedEntries } from "@/ebay-apis/feed/feedTools.js";
import { financesEntries } from "@/ebay-apis/finances/financesTools.js";
import { fulfillmentEntries } from "@/ebay-apis/fulfillment/fulfillmentTools.js";
import { inventoryEntries } from "@/ebay-apis/inventory/inventoryTools.js";
import { mediaEntries } from "@/ebay-apis/inventory/mediaTools.js";
import { logisticsEntries } from "@/ebay-apis/logistics/logisticsTools.js";
import { marketingEntries } from "@/ebay-apis/marketing/marketingTools.js";
import { metadataEntries } from "@/ebay-apis/metadata/metadataTools.js";
import { otherEntries } from "@/ebay-apis/other/otherTools.js";
import { storesEntries } from "@/ebay-apis/stores/storesTools.js";
import { charityEntries } from "@/ebay-apis/taxonomy/charityTools.js";
import { taxonomyEntries } from "@/ebay-apis/taxonomy/taxonomyTools.js";
import { tradingEntries } from "@/ebay-apis/trading/tradingTools.js";
import { connectorEntries } from "@/server/connectorTools.js";
import type { ToolEntry } from "@/tool-registry/registry.js";

export interface ToolCategory {
	key: string;
	title: string;
	entries: ToolEntry[];
}

export const toolCategories: ToolCategory[] = [
	{ key: "connector", title: "Connector", entries: connectorEntries },
	{
		key: "token-management",
		title: "Token Management",
		entries: tokenManagementEntries,
	},
	{
		key: "account",
		title: "Account",
		entries: [...accountEntries, ...accountV2Entries],
	},
	{ key: "finances", title: "Finances", entries: financesEntries },
	{
		key: "inventory",
		title: "Inventory",
		entries: [...inventoryEntries, ...mediaEntries],
	},
	{ key: "feed", title: "Feed", entries: feedEntries },
	{ key: "stores", title: "Stores", entries: storesEntries },
	{ key: "fulfillment", title: "Fulfillment", entries: fulfillmentEntries },
	{ key: "logistics", title: "Logistics", entries: logisticsEntries },
	{ key: "marketing", title: "Marketing", entries: marketingEntries },
	{ key: "analytics", title: "Analytics", entries: analyticsEntries },
	{ key: "metadata", title: "Metadata", entries: metadataEntries },
	{
		key: "taxonomy",
		title: "Taxonomy",
		entries: [...taxonomyEntries, ...charityEntries],
	},
	{
		key: "communication",
		title: "Communication",
		entries: communicationEntries,
	},
	{ key: "browse", title: "Browse", entries: browseEntries },
	{ key: "other", title: "Other", entries: otherEntries },
	{ key: "developer", title: "Developer", entries: developerEntries },
	{ key: "trading", title: "Trading", entries: tradingEntries },
];

export const registeredEntries: ToolEntry[] = toolCategories.flatMap(
	(category) => category.entries,
);
