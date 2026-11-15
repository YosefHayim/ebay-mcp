import type { ToolCatalog, ToolCatalogTool } from '../../scripts/buildToolCatalog.ts';
import { FEATURED_TOOLS } from '@site/data/featured-tools.ts';

export interface ExplorerField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue: string;
}

export interface ExplorerEndpoint {
  method: string;
  path: string;
  createQueryString: (fieldValues: Record<string, string>) => string;
}

export interface ExplorerTool {
  toolName: string;
  familyKey: string;
  description: string;
  fields: ExplorerField[];
  endpoint?: ExplorerEndpoint;
  isFeatured: boolean;
  isReadOnly: boolean;
  isDestructive: boolean;
  createArguments: (fieldValues: Record<string, string>) => Record<string, unknown>;
  exampleResponse?: unknown;
}

export interface ExplorerToolGroup {
  groupKey: string;
  groupTitle: string;
  tools: ExplorerTool[];
}

const firstParagraph = (description: string): string => description.split('\n\n')[0]?.trim() ?? '';

const coerceFieldValue = (fieldType: string, rawText: string): unknown => {
  if (fieldType === 'number') {
    const parsedNumber = Number(rawText);

    return Number.isNaN(parsedNumber) ? rawText : parsedNumber;
  }
  if (fieldType === 'boolean') return rawText === 'true';
  if (fieldType === 'object' || fieldType === 'array') {
    try {
      return JSON.parse(rawText);
    } catch {
      return rawText;
    }
  }

  return rawText;
};

const createFeaturedExplorerTools = (): ExplorerTool[] =>
  FEATURED_TOOLS.map((featuredTool) => ({
    toolName: featuredTool.toolName,
    familyKey: featuredTool.familyKey,
    description: featuredTool.description,
    fields: featuredTool.fields.map((field) => ({
      name: field.name,
      type: field.type,
      required: false,
      description: '',
      defaultValue: field.defaultValue,
    })),
    endpoint: {
      method: featuredTool.method,
      path: featuredTool.path,
      createQueryString: featuredTool.createQueryString,
    },
    isFeatured: true,
    isReadOnly: featuredTool.method === 'GET',
    isDestructive: false,
    createArguments: featuredTool.createArguments,
    exampleResponse: featuredTool.exampleResponse,
  }));

const createCatalogExplorerTool = (
  familyKey: string,
  catalogTool: ToolCatalogTool,
): ExplorerTool => {
  const fields = catalogTool.fields.map((field) => ({
    name: field.name,
    type: field.type,
    required: field.required,
    description: field.description,
    defaultValue: '',
  }));

  return {
    toolName: catalogTool.name,
    familyKey,
    description: firstParagraph(catalogTool.description),
    fields,
    isFeatured: false,
    isReadOnly: catalogTool.readOnly,
    isDestructive: catalogTool.destructive,
    createArguments: (fieldValues) => {
      const toolArguments: Record<string, unknown> = {};
      for (const field of fields) {
        const rawText = fieldValues[field.name] ?? '';
        if (rawText !== '') toolArguments[field.name] = coerceFieldValue(field.type, rawText);
      }

      return toolArguments;
    },
  };
};

/** The featured tools in the order shown at the top of the list. */
export const listFeaturedExplorerTools = (): ExplorerTool[] => createFeaturedExplorerTools();

/** Every tool the explorer can show: the featured ones first, then the whole catalog. */
export const listAllExplorerTools = (catalog: ToolCatalog | undefined): ExplorerTool[] => {
  const featuredTools = createFeaturedExplorerTools();
  if (!catalog) return featuredTools;
  const catalogTools = catalog.families.flatMap((family) =>
    family.tools.map((catalogTool) => createCatalogExplorerTool(family.key, catalogTool)),
  );

  return [...featuredTools, ...catalogTools];
};

/** The search result groups: Featured first, then one group per family that has a match. */
export const createExplorerToolGroups = (
  catalog: ToolCatalog | undefined,
  searchText: string,
): ExplorerToolGroup[] => {
  const needle = searchText.trim().toLowerCase();
  const matches = (tool: ExplorerTool): boolean =>
    needle === '' ||
    tool.toolName.includes(needle) ||
    tool.familyKey.includes(needle) ||
    tool.description.toLowerCase().includes(needle);
  const groups: ExplorerToolGroup[] = [];
  const featuredToolNames = new Set(FEATURED_TOOLS.map((featuredTool) => featuredTool.toolName));
  const featuredMatches = createFeaturedExplorerTools().filter(matches);
  if (featuredMatches.length > 0) {
    groups.push({ groupKey: 'featured', groupTitle: 'Featured', tools: featuredMatches });
  }
  for (const family of catalog?.families ?? []) {
    const familyMatches = family.tools
      .filter((catalogTool) => !featuredToolNames.has(catalogTool.name))
      .map((catalogTool) => createCatalogExplorerTool(family.key, catalogTool))
      .filter(matches);
    if (familyMatches.length > 0) {
      groups.push({ groupKey: family.key, groupTitle: family.title, tools: familyMatches });
    }
  }

  return groups;
};

/** The starting text of every input of a tool. */
export const createDefaultFieldValues = (tool: ExplorerTool): Record<string, string> =>
  Object.fromEntries(tool.fields.map((field) => [field.name, field.defaultValue]));

/** The JSON-RPC tools/call message for a tool and the current inputs. */
export const createToolCallRequest = (
  tool: ExplorerTool,
  fieldValues: Record<string, string>,
): unknown => ({
  jsonrpc: '2.0',
  id: 7,
  method: 'tools/call',
  params: { name: tool.toolName, arguments: tool.createArguments(fieldValues) },
});
