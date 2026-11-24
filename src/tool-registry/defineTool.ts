import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { EbaySellerApi } from "@/ebay-apis/ebaySellerApi.js";
import { formatZodIssues } from "@/shared/zodIssues.js";
import type { ResolvedToolUi, ToolEntry } from "@/tool-registry/registry.js";
import type {
	OutputArgs,
	ToolAnnotations,
	ToolHandler,
} from "@/tool-registry/types.js";
import { uiArchetypes } from "@/tool-registry/ui/archetypes.js";
import type {
	CardViewModel,
	ChartViewModel,
	StatViewModel,
	TableViewModel,
	ViewModel,
} from "@/tool-registry/ui/viewModels.js";

/** Tagged failure thrown when tool arguments do not match the tool's input schema. */
export class ToolInputError extends Error {
	readonly _tag = "ToolInputError";
	/** Tool whose arguments failed validation. */
	readonly toolName: string;

	constructor(failure: {
		readonly toolName: string;
		readonly message: string;
	}) {
		super(failure.message);
		this.name = "ToolInputError";
		this.toolName = failure.toolName;
	}
}

/**
 * Declarative opt-in for the interactive MCP Apps layer, co-located on the tool
 * so the projection lives next to the handler it projects.
 *
 * It is a discriminated union over the archetype: each member pairs an archetype
 * with a `map` whose **input is the handler's awaited return type** and whose
 * **output is that archetype's view model**. That double binding is what makes UI
 * drift a compile error — if a handler stops returning a field the mapper reads,
 * or a mapper returns the wrong archetype's shape, `tsc` fails at the `defineTool`
 * call site, exactly as the input `Shape` guards argument drift.
 *
 * @typeParam Result - The handler's awaited return type, supplied by {@link ToolSpec}.
 */
export type ToolUiSpec<Result> =
	| { archetype: "table"; map: (handlerOutput: Result) => TableViewModel }
	| { archetype: "card"; map: (handlerOutput: Result) => CardViewModel }
	| { archetype: "chart"; map: (handlerOutput: Result) => ChartViewModel }
	| { archetype: "stat"; map: (handlerOutput: Result) => StatViewModel };

/**
 * Specification for a single MCP tool, co-locating its public definition with a
 * type-safe handler.
 *
 * `Shape` is the Zod raw shape backing the tool's input. It is the
 * single source of truth for two things that used to be declared separately and
 * drift apart: the schema advertised to MCP clients, and the compile-time type
 * of the arguments the handler receives. Because the handler's `args` are
 * inferred from `Shape`, call sites read `args.sku` as a `string` (not
 * `unknown`) and never cast.
 *
 * `Result` is inferred from the handler's return type and exists so an optional
 * {@link ToolUiSpec} can be type-checked against the exact data the handler
 * produces. Tools that do not opt into UI never name it.
 */
export interface ToolSpec<Shape extends z.ZodRawShape, Result = unknown> {
	name: string;
	description: string;
	/** Zod raw shape; doubles as the MCP wire schema and handler arg types. */
	inputSchema: Shape;
	title?: string;
	outputSchema?: OutputArgs;
	annotations?: ToolAnnotations;
	/** Opaque MCP metadata (e.g. connector category/version) passed through verbatim. */
	_meta?: Record<string, unknown>;
	/** Executes the tool against validated, fully-typed arguments; may be async. */
	handler: (api: EbaySellerApi, args: z.infer<z.ZodObject<Shape>>) => Result;
	/** Optional protocol formatter, run only at the MCP boundary. */
	formatResult?: (
		handlerOutput: Awaited<Result>,
		args: z.infer<z.ZodObject<Shape>>,
	) => CallToolResult;
	/** Optional interactive view rendered by hosts that support MCP Apps. */
	ui?: ToolUiSpec<Awaited<Result>>;
}

function createToolEntry(
	definition: ToolEntry["definition"],
	handler: ToolHandler,
	ui: ResolvedToolUi | undefined,
	formatResult: ToolEntry["formatResult"],
): ToolEntry {
	const entry: ToolEntry = { definition, handler };

	if (ui != null) {
		entry.ui = ui;
	}

	if (formatResult != null) {
		entry.formatResult = formatResult;
	}

	return entry;
}

function bindToolUi<Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ResolvedToolUi | undefined {
	const ui = spec.ui;

	if (ui == null) {
		return undefined;
	}

	return resolveToolUi(ui);
}

function bindFormatResult<Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ToolEntry["formatResult"] {
	const formatResult = spec.formatResult;

	if (formatResult == null) {
		return undefined;
	}

	// Registry erases the result and argument types; the spec checks them here.
	return function formatRegisteredResult(handlerOutput, args): CallToolResult {
		return formatResult(
			handlerOutput as Awaited<Result>,
			args as z.infer<z.ZodObject<Shape>>,
		);
	};
}

/**
 * Erases the compile-time result type from a {@link ToolUiSpec} so the binding can
 * live on the non-generic {@link ToolEntry}, and resolves the archetype's
 * `resourceUri` from the single-source-of-truth {@link uiArchetypes} manifest.
 *
 * The `handlerOutput as Result` cast is the type-erasure boundary: at runtime `map` only
 * ever receives the very value its own handler returned, so the cast restores the
 * type the mapper was written and type-checked against.
 */
function resolveToolUi<Result>(ui: ToolUiSpec<Result>): ResolvedToolUi {
	return {
		archetype: ui.archetype,
		resourceUri: uiArchetypes[ui.archetype].uri,
		map: (handlerOutput: unknown): ViewModel => ui.map(handlerOutput as Result),
	};
}

/** Builds the public MCP definition from the richer tool spec. */
function toDefinition<Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ToolEntry["definition"] {
	const definition: ToolEntry["definition"] = {
		name: spec.name,
		description: spec.description,
		inputSchema: spec.inputSchema,
	};
	const title = spec.title;

	if (title != null) {
		definition.title = title;
	}

	const outputSchema = spec.outputSchema;

	if (outputSchema != null) {
		definition.outputSchema = outputSchema;
	}

	const annotations = spec.annotations;

	if (annotations != null) {
		definition.annotations = annotations;
	}

	const meta = spec._meta;

	if (meta != null) {
		definition._meta = meta;
	}

	return definition;
}

/**
 * Binds a tool's Zod input shape to its handler so the shape is the single
 * source of truth for both the advertised MCP schema and the handler's
 * compile-time argument types.
 *
 * The returned {@link ToolEntry} carries a `ToolHandler` that validates raw
 * arguments against the shape before delegating, throwing {@link ToolInputError}
 * on a mismatch. The SDK already validates registered tools, but callers that
 * bypass it (the dynamic-mode tool runner, `executeTool`) rely on this check.
 * Input schemas contain no async refinements, so the second parse is idempotent.
 *
 * @param spec - Tool definition, input schema, handler, and optional UI projection.
 * @returns A registry entry whose handler validates args from the schema before execution.
 *
 * @example
 * ```ts
 * const entry = defineTool({
 *   name: 'ebay_get_custom_policies',
 *   description: 'Retrieve custom policies defined for the seller account',
 *   inputSchema: getCustomPoliciesInputSchema.shape,
 *   handler: (api, args) => api.account.getCustomPolicies(args),
 * });
 * ```
 */
export const defineTool = <Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ToolEntry => {
	const schema = z.object(spec.inputSchema);
	// Non-async: parsing runs synchronously so invalid input rejects via the
	// caller's `await`, and the handler's returned promise passes straight
	// through without an extra await layer.
	const handler: ToolHandler = (api, args) => {
		const parsedArgs = schema.safeParse(args);
		if (!parsedArgs.success) {
			throw new ToolInputError({
				toolName: spec.name,
				message: `Invalid arguments for ${spec.name}: ${formatZodIssues(parsedArgs.error)}`,
			});
		}
		return spec.handler(api, parsedArgs.data);
	};

	return createToolEntry(
		toDefinition(spec),
		handler,
		bindToolUi(spec),
		bindFormatResult(spec),
	);
};

/**
 * Like {@link defineTool}, but invokes the handler with the raw transport
 * arguments WITHOUT re-validating them against `inputSchema`.
 *
 * Use this for tools whose handler performs its own validation against a
 * dedicated schema, and whose advertised `inputSchema` intentionally differs
 * from that internal schema. The communication tools are the motivating case:
 * each handler re-parses its arguments with a `@/ebay-apis/communication` schema
 * (the real call contract), while the advertised input schema describes a
 * different, client-facing shape. Re-parsing against the advertised schema here
 * would strip or reject fields the handler's own schema needs.
 *
 * `args` is typed from the shape for handler ergonomics, but the values are not
 * validated by this factory — the handler is responsible for that.
 *
 * @param spec - Tool definition, advertised input schema, raw handler, and optional UI projection.
 * @returns A registry entry whose handler receives raw transport args.
 *
 * @example
 * ```ts
 * const entry = rawTool({
 *   name: 'ebay_send_message',
 *   description: 'Send a member message',
 *   inputSchema: advertisedMessageShape,
 *   handler: (api, args) => api.message.sendMessage(args),
 * });
 * ```
 */
export const rawTool = <Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ToolEntry => {
	const handler: ToolHandler = (api, args) =>
		spec.handler(api, args as z.infer<z.ZodObject<Shape>>);

	return createToolEntry(
		toDefinition(spec),
		handler,
		bindToolUi(spec),
		bindFormatResult(spec),
	);
};
