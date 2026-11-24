import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { EbaySellerApi } from "@/ebay-apis/ebaySellerApi.js";
import { formatZodIssues } from "@/shared/zodIssues.js";
import type { ResolvedToolUi, ToolEntry } from "@/tool-registry/registry.js";
import type {
	ToolAnnotations,
	ToolHandler,
	ToolOutputSchema,
} from "@/tool-registry/types.js";
import { uiArchetypes } from "@/tool-registry/ui/archetypes.js";
import type {
	CardViewModel,
	ChartViewModel,
	StatViewModel,
	TableViewModel,
	ViewModel,
} from "@/tool-registry/ui/viewModels.js";

export type ToolUiSpec<Result> =
	| { archetype: "table"; map: (handlerOutput: Result) => TableViewModel }
	| { archetype: "card"; map: (handlerOutput: Result) => CardViewModel }
	| { archetype: "chart"; map: (handlerOutput: Result) => ChartViewModel }
	| { archetype: "stat"; map: (handlerOutput: Result) => StatViewModel };

export interface ToolSpec<Shape extends z.ZodRawShape, Result = unknown> {
	name: string;
	description: string;
	inputSchema: Shape;
	title?: string;
	outputSchema?: ToolOutputSchema;
	annotations?: ToolAnnotations;
	_meta?: Record<string, unknown>;
	handler: (api: EbaySellerApi, args: z.infer<z.ZodObject<Shape>>) => Result;
	formatResult?: (
		handlerOutput: Awaited<Result>,
		args: z.infer<z.ZodObject<Shape>>,
	) => CallToolResult;
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

function resolveToolUi<Result>(ui: ToolUiSpec<Result>): ResolvedToolUi {
	return {
		archetype: ui.archetype,
		resourceUri: uiArchetypes[ui.archetype].uri,
		map: (handlerOutput: unknown): ViewModel => ui.map(handlerOutput as Result),
	};
}

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

export function defineTool<Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ToolEntry {
	const schema = z.object(spec.inputSchema);
	// Non-async: parsing runs synchronously so invalid input rejects via the
	// caller's `await`, and the handler's returned promise passes straight
	// through without an extra await layer.
	const handler: ToolHandler = (api, args) => {
		const parsedArgs = schema.safeParse(args);
		if (!parsedArgs.success) {
			throw new Error(
				`Invalid arguments for ${spec.name}: ${formatZodIssues(parsedArgs.error)}`,
			);
		}
		return spec.handler(api, parsedArgs.data);
	};

	return createToolEntry(
		toDefinition(spec),
		handler,
		bindToolUi(spec),
		bindFormatResult(spec),
	);
}

export function rawTool<Shape extends z.ZodRawShape, Result>(
	spec: ToolSpec<Shape, Result>,
): ToolEntry {
	const handler: ToolHandler = (api, args) =>
		spec.handler(api, args as z.infer<z.ZodObject<Shape>>);

	return createToolEntry(
		toDefinition(spec),
		handler,
		bindToolUi(spec),
		bindFormatResult(spec),
	);
}
