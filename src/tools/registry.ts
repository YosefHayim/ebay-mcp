import { handlerOnlyEntries, registeredEntries } from '@/tools/categories/index.js';
import type { ToolDefinition } from '@/tools/definitions/types.js';
import type { ToolHandler } from '@/tools/tool-handlers/types.js';
import type { ViewArchetype, ViewModel } from '@/tools/ui/view-models.js';

/**
 * Interactive-UI binding resolved onto a {@link ToolEntry} when a tool opts into
 * the MCP Apps layer via `defineTool({ ui })`.
 *
 * `map` is intentionally type-erased to `(result: unknown) => ViewModel` so the
 * entry stays non-generic and uniform across all 322 tools. The erasure is safe:
 * `defineTool` proves, against the handler's concrete return type, that `map`
 * produces the archetype's view model before erasing it here — so a drift between
 * handler shape and mapper is a compile error at the call site, not a runtime
 * surprise at this boundary. The runtime seam consumes `resourceUri` (to register
 * and advertise the view) and `map` (to project results into `structuredContent`).
 */
export interface ResolvedToolUi {
  archetype: ViewArchetype;
  resourceUri: string;
  map: (result: unknown) => ViewModel;
}

/** Runtime registry entry pairing a public tool definition with its executable handler. */
export interface ToolEntry {
  definition: ToolDefinition;
  handler: ToolHandler;
  /** Present only for tools that render an interactive view; consumed by the runtime seam. */
  ui?: ResolvedToolUi;
}

/** Validation report for duplicate definitions and definition-handler mismatches. */
export interface ToolRegistryValidation {
  duplicateToolNames: string[];
  missingHandlers: string[];
  orphanHandlers: string[];
}

/** Handler lookup keyed by tool name, including handler-only (unadvertised) tools. */
const handlerByName: Record<string, ToolHandler> = Object.fromEntries(
  [...registeredEntries, ...handlerOnlyEntries].map((entry) => [
    entry.definition.name,
    entry.handler,
  ])
);

let cachedEntries: ToolEntry[] | undefined;

/** Validates that tool definitions have unique names and matching handlers. */
export function validateToolRegistry(
  definitions: ToolDefinition[] = registeredEntries.map((entry) => entry.definition),
  handlers: Record<string, ToolHandler> = handlerByName
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
    orphanHandlers: [...handlerNames].filter((name) => !seenNames.has(name)).sort(),
  };
}

function assertRunnableRegistry(): void {
  const validation = validateToolRegistry();
  const failures = [
    validation.duplicateToolNames.length > 0
      ? `duplicate tool definitions: ${validation.duplicateToolNames.join(', ')}`
      : undefined,
    validation.missingHandlers.length > 0
      ? `missing handlers: ${validation.missingHandlers.join(', ')}`
      : undefined,
  ].filter(Boolean);

  if (failures.length > 0) {
    throw new Error(`Invalid tool registry: ${failures.join('; ')}`);
  }
}

/** Returns cached runnable registry entries after validating definitions and handlers. */
export function getToolEntries(): ToolEntry[] {
  if (cachedEntries) {
    return cachedEntries;
  }

  assertRunnableRegistry();
  cachedEntries = registeredEntries;
  return cachedEntries;
}

/** Returns public tool definitions in registry execution order. */
export function getToolDefinitions(): ToolDefinition[] {
  return getToolEntries().map((entry) => entry.definition);
}

/** Looks up the handler registered for a tool name, if one exists. */
export function getToolHandler(toolName: string): ToolHandler | undefined {
  return handlerByName[toolName];
}

/** Executes a registered tool handler or throws when the tool name is unknown. */
export async function executeTool(
  api: Parameters<ToolHandler>[0],
  toolName: string,
  args: Parameters<ToolHandler>[1]
): Promise<unknown> {
  const handler = getToolHandler(toolName);
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  return await handler(api, args);
}
