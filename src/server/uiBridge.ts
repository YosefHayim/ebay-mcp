import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	getUiCapability,
	RESOURCE_MIME_TYPE,
	RESOURCE_URI_META_KEY,
	registerAppResource,
} from "@modelcontextprotocol/ext-apps/server";
import type {
	McpServer,
	RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getUiRuntimeConfig } from "@/shared/environment.js";
import { serverLogger } from "@/shared/logger.js";
import type { ResolvedToolUi, ToolEntry } from "@/tool-registry/registry.js";
import { uiArchetypes } from "@/tool-registry/ui/archetypes.js";
import type {
	ViewArchetype,
	ViewModel,
} from "@/tool-registry/ui/viewModels.js";

type ClientUiCapabilities = Parameters<typeof getUiCapability>[0];

export function resolveUiEnabled(
	capabilities: ClientUiCapabilities,
	uiEnabledByConfig = getUiRuntimeConfig().enabled,
): boolean {
	if (!uiEnabledByConfig) {
		return false;
	}

	const capability = getUiCapability(capabilities);
	return Boolean(capability?.mimeTypes?.includes(RESOURCE_MIME_TYPE));
}

export function summarizeView(view: ViewModel): string {
	switch (view.archetype) {
		case "table": {
			const count = view.rows.length;
			const tail = view.footnote ? ` — ${view.footnote}` : "";
			const prefix = view.title ? `${view.title}: ` : "";
			return `${prefix}${count} ${count == 1 ? "row" : "rows"}${tail}. Rendered as an interactive table.`;
		}
		case "card": {
			const heading = [view.title, view.subtitle].filter(Boolean).join(" — ");
			const prefix = heading ? `${heading}: ` : "";
			const fieldCount = view.sections.reduce(
				(total, section) => total + section.fields.length,
				0,
			);
			return `${prefix}${fieldCount} ${fieldCount == 1 ? "field" : "fields"}. Rendered as an interactive detail card.`;
		}
		case "chart": {
			const pointCount = view.series.reduce(
				(total, series) => total + series.points.length,
				0,
			);
			const prefix = view.title ? `${view.title} (${view.kind}): ` : "";
			return `${prefix}${view.series.length} series, ${pointCount} ${pointCount == 1 ? "point" : "points"}. Rendered as an interactive chart.`;
		}
		case "stat": {
			const count = view.tiles.length;
			const prefix = view.title ? `${view.title}: ` : "";
			return `${prefix}${count} ${count == 1 ? "metric" : "metrics"}. Rendered as an interactive stat grid.`;
		}
	}
}

function asStructuredContent(view: ViewModel): Record<string, unknown> {
	return view as unknown as Record<string, unknown>;
}

export function buildUiToolResult(
	ui: ResolvedToolUi,
	handlerOutput: unknown,
): CallToolResult {
	const view = ui.map(handlerOutput);
	return {
		content: [{ type: "text", text: summarizeView(view) }],
		structuredContent: asStructuredContent(view),
		_meta: { ui: { resourceUri: ui.resourceUri } },
	};
}

export function findRepoRoot(startDir: string): string | undefined {
	let current = startDir;
	for (;;) {
		if (existsSync(join(current, "package.json"))) {
			return current;
		}
		const parent = dirname(current);
		if (parent == current) {
			return;
		}
		current = parent;
	}
}

export function resolveBuiltUiDir(moduleUrl: string): string {
	const fromDir = dirname(fileURLToPath(moduleUrl));
	const root = findRepoRoot(fromDir);
	return root ? join(root, "build", "ui") : join(fromDir, "..", "ui");
}

export interface UiBridge {
	register(entry: ToolEntry, registered: RegisteredTool): void;
	shouldRender(entry: ToolEntry): entry is ToolEntry & { ui: ResolvedToolUi };
	installCapabilityGate(): void;
}

export function createUiBridge(server: McpServer, moduleUrl: string): UiBridge {
	const builtUiDir = resolveBuiltUiDir(moduleUrl);
	const available = new Set<ViewArchetype>();

	// `Object.keys` widens to `string[]`; the cast restores the manifest's key type.
	for (const archetype of Object.keys(uiArchetypes) as ViewArchetype[]) {
		const { uri, name, htmlFile } = uiArchetypes[archetype];
		const htmlPath = join(builtUiDir, htmlFile);

		if (!existsSync(htmlPath)) {
			serverLogger.warn(
				`UI view not built; "${uri}" disabled (expected ${htmlPath})`,
			);
			continue;
		}

		const html = readFileSync(htmlPath, "utf-8");
		registerAppResource(server, name, uri, {}, () => ({
			contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
		}));
		available.add(archetype);
	}

	let uiEnabled = false;
	const uiTools: { registered: RegisteredTool; resourceUri: string }[] = [];

	return {
		register(entry, registered) {
			const toolUi = entry.ui;
			const hasNoUi = toolUi == null;

			if (hasNoUi) return;

			const isAvailable = available.has(toolUi.archetype);
			const isUnavailable = isAvailable == false;

			if (isUnavailable) return;

			uiTools.push({ registered, resourceUri: toolUi.resourceUri });
		},

		shouldRender(entry): entry is ToolEntry & { ui: ResolvedToolUi } {
			const isUiOff = uiEnabled == false;

			if (isUiOff) return false;

			const toolUi = entry.ui;
			const hasNoUi = toolUi == null;

			if (hasNoUi) return false;

			const isAvailable = available.has(toolUi.archetype);
			const isUnavailable = isAvailable == false;

			if (isUnavailable) return false;

			return true;
		},

		installCapabilityGate() {
			const priorOnInitialized = server.server.oninitialized;
			server.server.oninitialized = () => {
				priorOnInitialized?.();
				const clientCapabilities = server.server.getClientCapabilities();
				const extensions = clientCapabilities?.extensions;
				const uiCapabilities = extensions == null ? undefined : { extensions };
				uiEnabled = resolveUiEnabled(uiCapabilities);
				if (!uiEnabled) {
					return;
				}
				for (const { registered, resourceUri } of uiTools) {
					registered.update({
						_meta: {
							ui: { resourceUri },
							[RESOURCE_URI_META_KEY]: resourceUri,
						},
					});
				}
			};
		},
	};
}
