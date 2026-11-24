import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { toolCategories } from "@/tool-registry/toolCategories.js";

/** One input field of a tool, as shown on the website and in the README. */
export interface ToolCatalogField {
	name: string;
	type: string;
	required: boolean;
	description: string;
}

/** One tool with its flags and input fields. */
export interface ToolCatalogTool {
	name: string;
	title: string;
	description: string;
	readOnly: boolean;
	destructive: boolean;
	fields: ToolCatalogField[];
}

/** One tool family (for example inventory) with its tools. */
export interface ToolCatalogFamily {
	key: string;
	title: string;
	toolCount: number;
	tools: ToolCatalogTool[];
}

/** The full tool catalog: every family and every tool. */
export interface ToolCatalog {
	toolCount: number;
	familyCount: number;
	families: ToolCatalogFamily[];
}

interface JsonSchemaNode {
	type?: string | string[];
	enum?: unknown[];
	description?: string;
	anyOf?: JsonSchemaNode[];
	oneOf?: JsonSchemaNode[];
	properties?: Record<string, JsonSchemaNode>;
	required?: string[];
	const?: unknown;
}

/** Short type word for a JSON Schema node: string, number, boolean, array, object or enum. */
function shortTypeName(node: JsonSchemaNode): string {
	if (node.enum || node.const !== undefined) return "enum";
	if (typeof node.type === "string")
		return node.type === "integer" ? "number" : node.type;
	if (Array.isArray(node.type)) {
		const first = node.type.find((typeName) => typeName !== "null");
		return first === "integer" ? "number" : (first ?? "object");
	}
	const variants = node.anyOf ?? node.oneOf ?? [];
	const named = variants
		.map(shortTypeName)
		.filter((typeName) => typeName !== "null");
	return named[0] ?? "object";
}

function fieldsOf(inputSchema: z.ZodRawShape): ToolCatalogField[] {
	const jsonSchema = zodToJsonSchema(z.object(inputSchema), {
		$refStrategy: "none",
	}) as JsonSchemaNode;
	const requiredNames = new Set(jsonSchema.required ?? []);
	return Object.entries(jsonSchema.properties ?? {}).map(([name, node]) => ({
		name,
		type: shortTypeName(node),
		required: requiredNames.has(name),
		description: node.description ?? "",
	}));
}

/** Builds the catalog of every registered tool, grouped by family. */
export function createToolCatalog(): ToolCatalog {
	const families: ToolCatalogFamily[] = toolCategories.map((category) => {
		const tools = category.entries.map(
			({ definition }): ToolCatalogTool => ({
				name: definition.name,
				title: definition.title ?? definition.name,
				description: definition.description,
				readOnly: definition.annotations?.readOnlyHint ?? false,
				destructive: definition.annotations?.destructiveHint ?? false,
				fields: fieldsOf(definition.inputSchema),
			}),
		);
		return {
			key: category.key,
			title: category.title,
			toolCount: tools.length,
			tools,
		};
	});
	return {
		toolCount: families.reduce((total, family) => total + family.toolCount, 0),
		familyCount: families.length,
		families,
	};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const outFile = process.argv[2];
	if (!outFile) {
		console.error("Usage: tsx scripts/buildToolCatalog.ts <outFile>");
		process.exit(1);
	}
	const catalog = createToolCatalog();
	mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
	writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`);
	console.log(
		`${catalog.toolCount} tools in ${catalog.familyCount} families -> ${outFile}`,
	);
}
