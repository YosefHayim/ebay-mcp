/**
 * Compatibility wrapper for zod-to-json-schema v3.x with Zod v4.
 *
 * zod-to-json-schema@3.25.x types its parameter as ZodSchema from "zod/v3"
 * (the backwards-compat shim). Our schemas use native Zod v4 types.
 * The runtime conversion works correctly; this wrapper suppresses the
 * TypeScript type mismatch.
 */
import { zodToJsonSchema as _zodToJsonSchema } from 'zod-to-json-schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const zodToJsonSchema = (schema: any, nameOrOptions?: any): object =>
  _zodToJsonSchema(schema, nameOrOptions);
