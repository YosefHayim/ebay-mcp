import type {
	McpServer,
	RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { TOOL_FAMILY_KEYS } from "@/shared/toolFamilies.js";
import { toolCategories } from "@/tool-registry/toolCategories.js";

const DEFAULT_LIST_LIMIT = 25;

const MAX_LIST_LIMIT = 100;

export const DYNAMIC_MODE_INSTRUCTIONS =
	"This eBay server keeps its full tool catalogue hidden to save context. Only the discovery tools are visible right now. " +
	"Call `list_ebay_tools` (no arguments) to see the tool families, then `list_ebay_tools` with a `family` or `query` to find specific tools, " +
	"then `enable_ebay_tools` with the tool names you need — they will appear as normal tools you can call. " +
	"Call `disable_ebay_tools` to remove tools you no longer need and reclaim context.";

interface ToolCatalogRow {
	name: string;
	family: string;
	summary: string;
}

interface FamilyOverviewRow {
	key: string;
	title: string;
	count: number;
}

interface ToolCatalog {
	rows: ToolCatalogRow[];
	families: FamilyOverviewRow[];
	familyByToolName: Map<string, string>;
}

function toSummary(description: string): string {
	const [firstLine] = description.split("\n", 1);
	const isFirstLineMissing = firstLine == null;

	if (isFirstLineMissing) {
		return "";
	}

	const trimmedLine = firstLine.trim();
	const sentenceEnd = trimmedLine.indexOf(". ");
	const sentence =
		sentenceEnd == -1 ? trimmedLine : trimmedLine.slice(0, sentenceEnd + 1);
	return sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence;
}

function buildCatalog(): ToolCatalog {
	const rows: ToolCatalogRow[] = [];
	const families: FamilyOverviewRow[] = [];
	const familyByToolName = new Map<string, string>();

	for (const category of toolCategories) {
		families.push({
			key: category.key,
			title: category.title,
			count: category.entries.length,
		});
		for (const entry of category.entries) {
			const { name, description } = entry.definition;
			rows.push({
				name,
				family: category.key,
				summary: toSummary(description),
			});
			familyByToolName.set(name, category.key);
		}
	}

	return { rows, families, familyByToolName };
}

const CATALOG = buildCatalog();

const listEbayToolsInputSchema = z.object({
	family: z
		.string()
		.optional()
		.describe('Restrict results to one family key (e.g. "inventory").'),
	query: z
		.string()
		.optional()
		.describe(
			"Case-insensitive keyword matched against tool name, summary, and family.",
		),
	cursor: z
		.string()
		.optional()
		.describe("Pagination cursor from a prior call."),
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_LIST_LIMIT)
		.optional()
		.describe(
			`Max rows per page (default ${DEFAULT_LIST_LIMIT}, max ${MAX_LIST_LIMIT}).`,
		),
});

const dynamicToolNamesInputSchema = z.object({
	names: z
		.array(z.string())
		.min(1)
		.describe(
			"Exact tool names to enable or disable, as returned by list_ebay_tools.",
		),
});

export function toolNamesInFamilies(families: Iterable<string>): Set<string> {
	const wanted = new Set(families);
	const names = new Set<string>();
	for (const [name, family] of CATALOG.familyByToolName) {
		if (wanted.has(family)) {
			names.add(name);
		}
	}
	return names;
}

interface MutationResult {
	enabled?: string[];
	disabled?: string[];
	unknown: string[];
	activeCount: number;
}

export interface ToolGatingController {
	list(args: {
		family?: string | undefined;
		query?: string | undefined;
		cursor?: string | undefined;
		limit?: number | undefined;
	}): unknown;
	enable(names: string[]): MutationResult;
	disable(names: string[]): MutationResult;
}

function parseCursor(cursor: string | undefined): number {
	if (!cursor) {
		return 0;
	}
	const offset = Number.parseInt(cursor, 10);
	return Number.isInteger(offset) && offset > 0 ? offset : 0;
}

export function createToolGatingController(
	handles: Map<string, RegisteredTool>,
): ToolGatingController {
	const activeCount = (): number =>
		[...handles.values()].filter((handle) => handle.enabled).length;

	const mutate = (names: string[], enable: boolean): MutationResult => {
		const changed: string[] = [];
		const unknown: string[] = [];

		for (const name of names) {
			const handle = handles.get(name);
			if (!handle) {
				unknown.push(name);
				continue;
			}
			if (handle.enabled != enable) {
				if (enable) {
					handle.enable();
				} else {
					handle.disable();
				}
			}
			changed.push(name);
		}

		return enable
			? { enabled: changed, unknown, activeCount: activeCount() }
			: { disabled: changed, unknown, activeCount: activeCount() };
	};

	return {
		list({ family, query, cursor, limit }) {
			if (!(family || query)) {
				return {
					families: CATALOG.families.map((row) => ({
						...row,
						enabledCount: [...handles.entries()].filter(
							([name, handle]) =>
								CATALOG.familyByToolName.get(name) == row.key && handle.enabled,
						).length,
					})),
					hint: "Call list_ebay_tools with { family } or { query } to list tools, then enable_ebay_tools.",
				};
			}

			if (family && !CATALOG.families.some((row) => row.key == family)) {
				return {
					error: `Unknown tool family "${family}".`,
					validFamilies: TOOL_FAMILY_KEYS,
				};
			}

			const needle = query?.toLowerCase();
			const matches = CATALOG.rows.filter((row) => {
				if (family && row.family != family) {
					return false;
				}
				if (needle) {
					return (
						row.name.toLowerCase().includes(needle) ||
						row.summary.toLowerCase().includes(needle) ||
						row.family.includes(needle)
					);
				}
				return true;
			});

			const offset = parseCursor(cursor);
			const size = Math.min(limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
			const page = matches.slice(offset, offset + size);
			const nextOffset = offset + size;

			return {
				tools: page.map((row) => ({
					...row,
					enabled: handles.get(row.name)?.enabled ?? false,
				})),
				total: matches.length,
				nextCursor:
					nextOffset < matches.length ? String(nextOffset) : undefined,
			};
		},

		enable: (names) => mutate(names, true),
		disable: (names) => mutate(names, false),
	};
}

function toToolResult(controllerOutput: unknown): CallToolResult {
	return {
		content: [
			{ type: "text", text: JSON.stringify(controllerOutput, null, 2) },
		],
	};
}

export function registerMetaTools(
	server: McpServer,
	controller: ToolGatingController,
): void {
	server.registerTool(
		"list_ebay_tools",
		{
			description:
				"Discover eBay tools without loading them into context. Call with no arguments to list the tool families; pass `family` to list a family's tools, or `query` to keyword-search across all tools. Returns lightweight rows (name, family, summary) — enable a tool with enable_ebay_tools to get its full schema and call it.",
			inputSchema: listEbayToolsInputSchema.shape,
		},
		(args) => toToolResult(controller.list(args)),
	);

	server.registerTool(
		"enable_ebay_tools",
		{
			description:
				"Load specific eBay tools into context so they can be called. Pass the exact tool names from list_ebay_tools. Returns the names enabled, any unknown names, and the active tool count.",
			inputSchema: dynamicToolNamesInputSchema.shape,
		},
		({ names }) => toToolResult(controller.enable(names)),
	);

	server.registerTool(
		"disable_ebay_tools",
		{
			description:
				"Unload eBay tools previously enabled, reclaiming their context. Pass the exact tool names. Returns the names disabled, any unknown names, and the active tool count.",
			inputSchema: dynamicToolNamesInputSchema.shape,
		},
		({ names }) => toToolResult(controller.disable(names)),
	);
}
