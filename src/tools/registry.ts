import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { registeredEntries } from '@/tools/categories/index.js';
import type { ToolDefinition } from '@/tools/types.js';
import type { ToolHandler } from '@/tools/types.js';
import type { ViewArchetype, ViewModel } from '@/tools/ui/viewModels.js';
import { Data, Effect } from 'effect';

/** Tagged failure returned when the tool registry cannot resolve a runnable tool. */
export class ToolRegistryError extends Data.TaggedError('ToolRegistryError')<{
  /** Human-readable registry failure message. */
  readonly message: string;
  /** Tool name involved in the failure, when a single lookup failed. */
  readonly toolName?: string;
}> {}

/**
 * Interactive-UI binding resolved onto a {@link ToolEntry} when a tool opts into
 * the MCP Apps layer via `defineTool({ ui })`.
 *
 * `map` is intentionally type-erased to `(result: unknown) => ViewModel` so the
 * entry stays non-generic and uniform across all 298 tools. The erasure is safe:
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
  /** Optional formatting of endpoint data into protocol content. */
  formatResult?: (result: unknown, args: Record<string, unknown>) => CallToolResult;
  /** Present only for tools that render an interactive view; consumed by the runtime seam. */
  ui?: ResolvedToolUi;
}

/** Validation report for duplicate definitions and definition-handler mismatches. */
export interface ToolRegistryValidation {
  duplicateToolNames: string[];
  missingHandlers: string[];
  orphanHandlers: string[];
}

/** Handler lookup keyed by registered public tool name. */
const handlerByName: Record<string, ToolHandler> = Object.fromEntries(
  registeredEntries.map((entry) => [entry.definition.name, entry.handler]),
);

let cachedEntries: ToolEntry[] | undefined;

/**
 * Validates that tool definitions have unique names and matching handlers.
 *
 * @param definitions - Public tool definitions to validate, defaulting to registered tools.
 * @param handlers - Handler lookup used to verify every definition can execute.
 * @returns Duplicate definition names plus missing or orphaned handlers.
 *
 * @example
 * ```ts
 * const validation = validateToolRegistry();
 * const hasDuplicates = validation.duplicateToolNames.length > 0;
 * ```
 */
export const validateToolRegistry = (
  definitions: ToolDefinition[] = registeredEntries.map((entry) => entry.definition),
  handlers: Record<string, ToolHandler> = handlerByName,
): ToolRegistryValidation => {
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
};

const validateRunnableRegistry = (): Effect.Effect<void, ToolRegistryError> => {
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
    return Effect.fail(
      new ToolRegistryError({
        message: `Invalid tool registry: ${failures.join('; ')}`,
      }),
    );
  }

  return Effect.void;
};

/**
 * Returns cached runnable registry entries after validating definitions and handlers.
 *
 * @returns Registered tool entries in execution order.
 *
 * @example
 * ```ts
 * const entries = getToolEntries();
 * ```
 */
export const getToolEntries = (): ToolEntry[] => {
  if (cachedEntries) {
    return cachedEntries;
  }

  Effect.runSync(validateRunnableRegistry());
  cachedEntries = registeredEntries;
  return cachedEntries;
};

/**
 * Returns public tool definitions in registry execution order.
 *
 * @returns MCP tool definitions advertised to clients.
 *
 * @example
 * ```ts
 * const definitions = getToolDefinitions();
 * ```
 */
export const getToolDefinitions = (): ToolDefinition[] =>
  getToolEntries().map((entry) => entry.definition);

/**
 * Looks up the handler registered for a tool name, if one exists.
 *
 * @param toolName - MCP tool name to resolve.
 * @returns The registered handler, or undefined when the name is unknown.
 *
 * @example
 * ```ts
 * const handler = getToolHandler('ebay_get_custom_policies');
 * ```
 */
export const getToolHandler = (toolName: string): ToolHandler | undefined =>
  handlerByName[toolName];

/**
 * Executes a registered tool handler and rejects when the tool name is unknown.
 *
 * @param api - eBay API facade passed to the selected tool handler.
 * @param toolName - MCP tool name to execute.
 * @param args - Raw transport arguments parsed by the selected tool entry.
 * @returns The selected handler's result.
 *
 * @example
 * ```ts
 * const result = await executeTool(api, 'ebay_get_custom_policies', {});
 * ```
 */
export const executeTool = async (
  api: Parameters<ToolHandler>[0],
  toolName: string,
  args: Parameters<ToolHandler>[1],
): Promise<unknown> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const handler = getToolHandler(toolName);
      if (!handler) {
        return yield* Effect.fail(
          new ToolRegistryError({
            message: `Unknown tool: ${toolName}`,
            toolName,
          }),
        );
      }

      return yield* Effect.tryPromise({
        try: () => Promise.resolve(handler(api, args)),
        catch: (error) => error,
      });
    }),
  );
