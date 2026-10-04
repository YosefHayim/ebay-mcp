import type { OutputArgs, ToolAnnotations, ToolDefinition } from '@/tools/types.js';
import { getToolEntries } from '@/tools/registry.js';
import { z } from 'zod';

/** Public tool contract shape exposed to consumers after registry normalization. */
export interface ToolContract {
  /** Optional MCP annotations copied from the public tool definition. */
  annotations?: ToolAnnotations;
  /** Human-readable description advertised for the tool. */
  description: string;
  /** Stable MCP tool name used by clients and handlers. */
  name: string;
  /** Zod raw shape advertised as the tool input schema. */
  inputSchema: ToolDefinition['inputSchema'];
  /** Optional JSON schema describing structured tool output. */
  outputSchema?: OutputArgs;
  /** Optional display title shown by MCP hosts that support it. */
  title?: string;
}

/** Validation report for duplicate, incomplete, or malformed tool contracts. */
export interface ToolContractValidation {
  /** Tool names declared more than once. */
  duplicateContracts: string[];
  /** Input fields that are not Zod schemas. */
  invalidInputSchemaFields: string[];
  /** Tool names whose output schema is not an object or reference schema. */
  malformedOutputSchemas: string[];
  /** Tool names missing a non-empty description. */
  missingDescriptions: string[];
  /** Tool names missing an input schema object. */
  missingInputSchemas: string[];
}

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Builds public tool contracts from the validated tool registry entries.
 *
 * @returns Normalized tool contracts in registry execution order.
 *
 * @example
 * ```ts
 * const contracts = getToolContracts();
 * ```
 */
export const getToolContracts = (): ToolContract[] =>
  getToolEntries().map(({ definition }) => ({
    annotations: definition.annotations,
    description: definition.description,
    name: definition.name,
    inputSchema: definition.inputSchema,
    outputSchema: definition.outputSchema,
    title: definition.title,
  }));

/**
 * Validates tool contracts for unique names, descriptions, input schemas, and output schemas.
 *
 * @param contracts - Contracts to validate, defaulting to the current registry projection.
 * @returns Duplicate names and malformed contract fields grouped by failure type.
 *
 * @example
 * ```ts
 * const validation = validateToolContracts(getToolContracts());
 * ```
 */
export const validateToolContracts = (
  contracts: ToolContract[] = getToolContracts(),
): ToolContractValidation => {
  const seenNames = new Set<string>();
  const duplicateContracts = new Set<string>();
  const invalidInputSchemaFields: string[] = [];
  const malformedOutputSchemas: string[] = [];
  const missingDescriptions: string[] = [];
  const missingInputSchemas: string[] = [];

  for (const contract of contracts) {
    if (seenNames.has(contract.name)) {
      duplicateContracts.add(contract.name);
    }
    seenNames.add(contract.name);

    if (!contract.inputSchema || typeof contract.inputSchema !== 'object') {
      missingInputSchemas.push(contract.name);
    } else {
      for (const [fieldName, schema] of Object.entries(contract.inputSchema)) {
        if (!(schema instanceof z.ZodType)) {
          invalidInputSchemaFields.push(`${contract.name}.${fieldName}`);
        }
      }
    }

    if (!contract.description.trim()) {
      missingDescriptions.push(contract.name);
    }

    const outputSchema = contract.outputSchema as Record<string, unknown> | undefined;
    if (outputSchema && !isJsonObject(outputSchema)) {
      malformedOutputSchemas.push(contract.name);
    } else if (
      outputSchema &&
      'type' in outputSchema &&
      outputSchema.type !== 'object' &&
      outputSchema.type !== undefined
    ) {
      malformedOutputSchemas.push(contract.name);
    } else if (outputSchema && !('type' in outputSchema) && !('$ref' in outputSchema)) {
      malformedOutputSchemas.push(contract.name);
    }
  }

  return {
    duplicateContracts: [...duplicateContracts].sort(),
    invalidInputSchemaFields: invalidInputSchemaFields.sort(),
    malformedOutputSchemas: malformedOutputSchemas.sort(),
    missingDescriptions: missingDescriptions.sort(),
    missingInputSchemas: missingInputSchemas.sort(),
  };
};
