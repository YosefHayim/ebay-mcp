import { z } from 'zod';

/**
 * Reusable schema builder for required string ID parameters.
 *
 * @param name - Human-readable parameter name used in validation messages.
 * @param description - Schema description exposed to MCP clients.
 * @returns Zod string schema for a required ID parameter.
 *
 * @example
 * ```ts
 * const listingId = idSchema('Listing ID', 'The eBay listing identifier');
 * ```
 */
export const idSchema = (name: string, description: string) => {
  const normalized = name.toLowerCase().replace(/\s+/g, '_');

  return z.string({
    message: `${name} is required`,
    required_error: `${normalized} is required`,
    invalid_type_error: `${normalized} must be a string`,
    description,
  });
};
