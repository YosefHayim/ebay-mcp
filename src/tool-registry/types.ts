import type { z } from "zod";
import type { EbaySellerApi } from "@/ebay-apis/ebaySellerApi.js";

export interface OutputArgs {
	[x: string]: unknown;
	type: "object";
	properties?: Record<string, object>;
	required?: string[];
}

export type ToolOutputSchema = OutputArgs | z.ZodTypeAny;

export interface ToolAnnotations {
	[x: string]: unknown;
	title?: string;
	readOnlyHint?: boolean;
	destructiveHint?: boolean;
	idempotentHint?: boolean;
	openWorldHint?: boolean;
}

export interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: z.ZodRawShape;
	title?: string;
	outputSchema?: ToolOutputSchema;
	annotations?: ToolAnnotations;
	_meta?: Record<string, unknown>;
}

export type ToolHandler = (
	api: EbaySellerApi,
	args: Record<string, unknown>,
) => unknown;

export type ToolHandlerMap = Record<string, ToolHandler>;
