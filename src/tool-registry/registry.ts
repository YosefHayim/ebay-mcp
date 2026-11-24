import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { registeredEntries } from "@/tool-registry/toolCategories.js";
import type { ToolDefinition, ToolHandler } from "@/tool-registry/types.js";
import type {
	ViewArchetype,
	ViewModel,
} from "@/tool-registry/ui/viewModels.js";

export interface ResolvedToolUi {
	archetype: ViewArchetype;
	resourceUri: string;
	map: (handlerOutput: unknown) => ViewModel;
}

export interface ToolEntry {
	definition: ToolDefinition;
	handler: ToolHandler;
	formatResult?: (
		handlerOutput: unknown,
		args: Record<string, unknown>,
	) => CallToolResult;
	ui?: ResolvedToolUi;
}

export interface ToolRegistryValidation {
	duplicateToolNames: string[];
	missingHandlers: string[];
	orphanHandlers: string[];
}

const handlerByName: Record<string, ToolHandler> = Object.fromEntries(
	registeredEntries.map((entry) => [entry.definition.name, entry.handler]),
);

let cachedEntries: ToolEntry[] | undefined;

export function validateToolRegistry(
	definitions: ToolDefinition[] = registeredEntries.map(
		(entry) => entry.definition,
	),
	handlers: Record<string, ToolHandler> = handlerByName,
): ToolRegistryValidation {
	const seenNames = new Set<string>();
	const duplicateNames = new Set<string>();

	for (const definition of definitions) {
		if (seenNames.has(definition.name)) {
			duplicateNames.add(definition.name);
		}
		seenNames.add(definition.name);
	}

	const handlerNames = new Set(Object.keys(handlers));

	return {
		duplicateToolNames: [...duplicateNames].sort(),
		missingHandlers: definitions
			.map((definition) => definition.name)
			.filter((name) => !handlerNames.has(name))
			.sort(),
		orphanHandlers: [...handlerNames]
			.filter((name) => !seenNames.has(name))
			.sort(),
	};
}

function validateRunnableRegistry(): void {
	const validation = validateToolRegistry();
	const failures = [
		validation.duplicateToolNames.length > 0
			? `duplicate tool definitions: ${validation.duplicateToolNames.join(", ")}`
			: undefined,
		validation.missingHandlers.length > 0
			? `missing handlers: ${validation.missingHandlers.join(", ")}`
			: undefined,
	].filter(Boolean);

	const hasFailures = failures.length > 0;
	if (hasFailures) {
		throw new Error(`Invalid tool registry: ${failures.join("; ")}`);
	}
}

export function getToolEntries(): ToolEntry[] {
	if (cachedEntries) {
		return cachedEntries;
	}

	validateRunnableRegistry();
	cachedEntries = registeredEntries;
	return cachedEntries;
}

export function getToolDefinitions(): ToolDefinition[] {
	return getToolEntries().map((entry) => entry.definition);
}

export function getToolHandler(toolName: string): ToolHandler | undefined {
	return handlerByName[toolName];
}

export async function executeTool(
	api: Parameters<ToolHandler>[0],
	toolName: string,
	args: Parameters<ToolHandler>[1],
): Promise<unknown> {
	const handler = getToolHandler(toolName);

	const isUnknownTool = handler == null;
	if (isUnknownTool) {
		throw new Error(`Unknown tool: ${toolName}`);
	}

	return await handler(api, args);
}
