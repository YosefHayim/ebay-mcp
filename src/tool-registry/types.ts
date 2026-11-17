import type { EbaySellerApi } from '@/ebay-apis/ebay-seller-api.js';
import type { z } from 'zod';

/** Optional MCP annotations that describe tool execution behavior to clients. */
export interface ToolAnnotations {
  [x: string]: unknown;
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

/** Public definition for a tool, including name, Zod schemas, metadata, and annotations. */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodRawShape;
  title?: string;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
}

/** Executes a tool against the configured eBay seller API client and parsed arguments. */
export type ToolHandler = (api: EbaySellerApi, args: Record<string, unknown>) => unknown;
