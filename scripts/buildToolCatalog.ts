import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { toolCategories } from "@/tool-registry/toolCategories.js";

export interface ToolCatalogField {
	name: string;
	type: string;
	required: boolean;
	description: string;
}

export interface ToolCatalogTool {
	name: string;
	title: string;
	description: string;
	readOnly: boolean;
	destructive: boolean;
	fields: ToolCatalogField[];
}

export interface ToolCatalogFamily {
	key: string;
	title: string;
	toolCount: number;
	tools: ToolCatalogTool[];
}

export interface ToolCatalog {
	toolCount: number;
	familyCount: number;
	families: ToolCatalogFamily[];
}

function unwrapFieldSchema(schema: z.ZodTypeAny): z.ZodTypeAny | null {
	if (schema instanceof z.ZodOptional) {
		return schema.unwrap();
	}

	if (schema instanceof z.ZodNullable) {
		return schema.unwrap();
	}

	if (schema instanceof z.ZodDefault) {
		return schema.removeDefault();
	}

	if (schema instanceof z.ZodEffects) {
		return schema.innerType();
	}

	if (schema instanceof z.ZodBranded) {
		return schema.unwrap();
	}

	if (schema instanceof z.ZodCatch) {
		return schema.removeCatch();
	}

	if (schema instanceof z.ZodReadonly) {
		return schema.unwrap();
	}

	if (schema instanceof z.ZodPipeline) {
		return schema._def.out;
	}

	return null;
}

function fieldDescription(schema: z.ZodTypeAny): string {
	const written = schema.description ?? "";
	const hasDescription = written != "";

	if (hasDescription) {
		return written;
	}

	const inner = unwrapFieldSchema(schema);

	if (inner == null) {
		return "";
	}

	return fieldDescription(inner);
}

function shortTypeName(schema: z.ZodTypeAny): string {
	const inner = unwrapFieldSchema(schema) ?? schema;

	if (inner instanceof z.ZodNull) {
		return "null";
	}

	if (inner instanceof z.ZodEnum) {
		return "enum";
	}

	if (inner instanceof z.ZodNativeEnum) {
		return "enum";
	}

	if (inner instanceof z.ZodLiteral) {
		return "enum";
	}

	if (inner instanceof z.ZodNumber) {
		return "number";
	}

	if (inner instanceof z.ZodBigInt) {
		return "number";
	}

	if (inner instanceof z.ZodString) {
		return "string";
	}

	if (inner instanceof z.ZodDate) {
		return "string";
	}

	if (inner instanceof z.ZodBoolean) {
		return "boolean";
	}

	if (inner instanceof z.ZodArray) {
		return "array";
	}

	if (inner instanceof z.ZodTuple) {
		return "array";
	}

	if (inner instanceof z.ZodSet) {
		return "array";
	}

	if (inner instanceof z.ZodUnion) {
		return firstVariantType(inner.options);
	}

	if (inner instanceof z.ZodDiscriminatedUnion) {
		return firstVariantType(inner.options);
	}

	const nested = unwrapFieldSchema(inner);

	if (nested != null) {
		return shortTypeName(nested);
	}

	return "object";
}

function firstVariantType(options: readonly z.ZodTypeAny[]): string {
	for (const option of options) {
		const typeName = shortTypeName(option);
		const isValue = typeName != "null";

		if (isValue) {
			return typeName;
		}
	}

	return "object";
}

function isFieldRequired(schema: z.ZodTypeAny): boolean {
	const canOmit = schema.isOptional();

	if (canOmit) {
		return false;
	}

	return true;
}

function toCatalogField([name, schema]: [
	string,
	z.ZodTypeAny,
]): ToolCatalogField {
	return {
		name,
		type: shortTypeName(schema),
		required: isFieldRequired(schema),
		description: fieldDescription(schema),
	};
}

function fieldsOf(inputSchema: z.ZodRawShape): ToolCatalogField[] {
	return Object.entries(inputSchema).map(toCatalogField);
}

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

if (process.argv[1] == fileURLToPath(import.meta.url)) {
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
