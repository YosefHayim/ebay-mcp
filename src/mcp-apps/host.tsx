import "./styles.css";
import type { App } from "@modelcontextprotocol/ext-apps/react";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { type ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import type {
	ToolCallRef,
	ViewArchetype,
	ViewModelByArchetype,
} from "@/tool-registry/ui/viewModels.js";

function isArchetypeRecord(
	structured: object,
): structured is Record<string, unknown> {
	return "archetype" in structured;
}

function extractView<A extends ViewArchetype>(
	toolResult: CallToolResult,
	archetype: A,
): ViewModelByArchetype[A] | null {
	const structured = toolResult.structuredContent;
	const hasNoStructuredContent = structured == null;

	if (hasNoStructuredContent) {
		return null;
	}

	const isNotRecord = typeof structured != "object";

	if (isNotRecord) {
		return null;
	}

	const structuredRecord = isArchetypeRecord(structured) ? structured : null;
	const hasNoArchetype = structuredRecord == null;

	if (hasNoArchetype) {
		return null;
	}

	const archetypeMatches = structuredRecord["archetype"] === archetype;

	if (archetypeMatches) {
		// Wire data is an open record; the discriminant check above confirms the
		// archetype, so the `unknown` hop is the safe bridge to the concrete model.
		return structuredRecord as unknown as ViewModelByArchetype[A];
	}

	return null;
}

export interface ViewState<A extends ViewArchetype> {
	view: ViewModelByArchetype[A] | null;
	app: App | null;
	isConnected: boolean;
	error: Error | null;
}

export function useViewModel<A extends ViewArchetype>(
	archetype: A,
): ViewState<A> {
	const [view, setView] = useState<ViewModelByArchetype[A] | null>(null);
	const { app, isConnected, error } = useApp({
		appInfo: { name: `ebay-${archetype}-view`, version: "1.0.0" },
		capabilities: {},
		onAppCreated: (created) => {
			created.ontoolresult = (toolResult: CallToolResult) => {
				const next = extractView(toolResult, archetype);
				if (next) {
					setView(next);
				}
			};
		},
	});

	useHostStyles(app, app?.getHostContext());

	return { view, app, isConnected, error };
}

interface AppShellProps {
	isConnected: boolean;
	error: Error | null;
	children: ReactNode;
}

export function AppShell({
	isConnected,
	error,
	children,
}: AppShellProps): ReactNode {
	if (error) {
		return (
			<div className="state state--error">
				Unable to load view: {error.message}
			</div>
		);
	}
	if (!isConnected) {
		return <div className="state">Connecting…</div>;
	}
	return children;
}

interface EmptyStateProps {
	label: string;
}

export function EmptyState({ label }: EmptyStateProps): ReactNode {
	return <div className="state">{label}</div>;
}

function describeRef(ref: ToolCallRef): string {
	const args = Object.entries(ref.arguments)
		.map(([name, argument]) => `${name}=${String(argument)}`)
		.join(", ");
	return `Run the ${ref.tool} tool${args ? ` with ${args}` : ""}.`;
}

export function drill(app: App | null, ref: ToolCallRef): void {
	if (!app) {
		return;
	}
	void app.sendMessage({
		role: "user",
		content: [{ type: "text", text: describeRef(ref) }],
	});
}

export async function runServerTool<A extends ViewArchetype>(
	app: App | null,
	ref: ToolCallRef,
	archetype: A,
): Promise<ViewModelByArchetype[A] | null> {
	if (!app) {
		return null;
	}
	const toolResult = await app.callServerTool({
		name: ref.tool,
		arguments: ref.arguments,
	});
	return extractView(toolResult, archetype);
}

export function mount(node: ReactNode): void {
	const container = document.getElementById("root");
	if (!container) {
		throw new Error("Missing #root container");
	}
	createRoot(container).render(node);
}
