import type { EbaySellerApi } from '@/api/ebaySellerApi.js';
import type { EffectBackedRawShape } from '@/utils/effectSchemaTypes.js';

/** JSON-schema-like output contract attached to a tool definition. */
export interface OutputArgs {
  [x: string]: unknown;
  type: 'object';
  properties?: Record<string, object>;
  required?: string[];
}

/** Optional MCP annotations that describe tool execution behavior to clients. */
export interface ToolAnnotations {
  [x: string]: unknown;
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

/** Public definition for a tool, including name, Effect-backed schemas, metadata, and annotations. */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: EffectBackedRawShape;
  title?: string;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
}

/** Executes a tool against the configured eBay seller API client and parsed arguments. */
export type ToolHandler = (api: EbaySellerApi, args: Record<string, unknown>) => unknown;

/** Lookup table that binds registered tool names to their execution handlers. */
export type ToolHandlerMap = Record<string, ToolHandler>;
