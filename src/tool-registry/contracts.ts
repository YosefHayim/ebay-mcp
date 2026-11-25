import { z } from "zod";
import { getToolEntries } from "@/tool-registry/registry.js";
import type {
	ToolAnnotations,
	ToolDefinition,
	ToolOutputSchema,
} from "@/tool-registry/types.js";

export interface ToolContract {
	annotations?: ToolAnnotations | undefined;
	description: string;
	name: string;
	inputSchema: ToolDefinition["inputSchema"];
	outputSchema?: ToolOutputSchema | undefined;
	title?: string | undefined;
}

export interface ToolContractValidation {
	duplicateContracts: string[];
	invalidInputSchemaFields: string[];
	malformedOutputSchemas: string[];
	missingDescriptions: string[];
	missingInputSchemas: string[];
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
	const isNotObject = typeof value != "object";

	if (isNotObject) return false;

	const isNull = value == null;

	if (isNull) return false;

	const isArray = Array.isArray(value);

	if (isArray) return false;

	return true;
}

function isObjectOutputSchema(outputSchema: unknown): boolean {
	const isZodSchema = outputSchema instanceof z.ZodType;

	if (isZodSchema) {
		return outputSchema instanceof z.ZodObject;
	}

	const isPlainObject = isJsonObject(outputSchema);

	if (isPlainObject) {
		return hasObjectType(outputSchema);
	}

	return false;
}

function hasObjectType(outputSchema: Record<string, unknown>): boolean {
	const hasType = "type" in outputSchema;

	if (hasType) {
		const typeName = outputSchema["type"];
		const isObjectType = typeName === "object";

		if (isObjectType) {
			return true;
		}

		return typeName === undefined;
	}

	return "$ref" in outputSchema;
}

export function getToolContracts(): ToolContract[] {
	return getToolEntries().map(({ definition }) => ({
		annotations: definition.annotations,
		description: definition.description,
		name: definition.name,
		inputSchema: definition.inputSchema,
		outputSchema: definition.outputSchema,
		title: definition.title,
	}));
}

export function validateToolContracts(
	contracts: ToolContract[] = getToolContracts(),
): ToolContractValidation {
	const seenNames = new Set<string>();
	const duplicateContracts = new Set<string>();
	const invalidInputSchemaFields: string[] = [];
	const malformedOutputSchemas: string[] = [];
	const missingDescriptions: string[] = [];
	const missingInputSchemas: string[] = [];

	function recordInvalidInputFields(
		toolName: string,
		inputSchema: unknown,
	): void {
		const isMissing = !inputSchema;

		if (isMissing) {
			missingInputSchemas.push(toolName);
			return;
		}

		const isNotObject = typeof inputSchema != "object";

		if (isNotObject) {
			missingInputSchemas.push(toolName);
			return;
		}

		for (const [fieldName, schema] of Object.entries(inputSchema)) {
			const isZodField = schema instanceof z.ZodType;

			if (isZodField) continue;

			invalidInputSchemaFields.push(`${toolName}.${fieldName}`);
		}
	}

	for (const contract of contracts) {
		if (seenNames.has(contract.name)) {
			duplicateContracts.add(contract.name);
		}
		seenNames.add(contract.name);

		recordInvalidInputFields(contract.name, contract.inputSchema);

		if (!contract.description.trim()) {
			missingDescriptions.push(contract.name);
		}

		const hasOutputSchema = contract.outputSchema != null;

		if (hasOutputSchema) {
			const isAcceptedOutput = isObjectOutputSchema(contract.outputSchema);
			const isMalformedOutput = !isAcceptedOutput;

			if (isMalformedOutput) {
				malformedOutputSchemas.push(contract.name);
			}
		}
	}

	return {
		duplicateContracts: [...duplicateContracts].sort(),
		invalidInputSchemaFields: invalidInputSchemaFields.sort(),
		malformedOutputSchemas: malformedOutputSchemas.sort(),
		missingDescriptions: missingDescriptions.sort(),
		missingInputSchemas: missingInputSchemas.sort(),
	};
}
