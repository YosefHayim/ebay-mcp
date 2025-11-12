import { z } from 'zod';
import type { components } from '@/types/commerce_vero_v1_oas3.js';

/**
 * Zod schemas for VERO API input validation
 * Based on: src/api/other/vero.ts
 * OpenAPI spec: docs/sell-apps/other-apis/commerce_vero_v1_oas3.json
 * Types from: src/types/commerce_vero_v1_oas3.ts
 *
 * Note: The VERO API is only available for members of the Verified Rights Owner (VeRO) Program
 */

// Extract operation parameter types for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _VeroReportItemsRequest = components['schemas']['VeroReportItemsRequest'];

// Reusable schema for filter parameter
const _filterSchema = z
  .string({
    message: 'Filter must be a string',
    invalid_type_error: 'filter must be a string',
    description: 'Filter criteria for the query (e.g., date range)',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    invalid_type_error: 'limit must be a string',
    description: 'Maximum number of items to return',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    invalid_type_error: 'offset must be a string',
    description: 'Number of items to skip',
  })
  .optional();

/**
 * Schema for reportInfringement method
 * Endpoint: POST /report_infringement
 * Body: VeroReportItemsRequest - infringement data
 *
 * Note: The actual API implementation uses a generic Record<string, unknown> type
 * This schema accepts any object structure as the infringement data
 */
export const reportInfringementSchema = z.object({
  infringement_data: z.record(z.unknown(), {
    message: 'Infringement data is required',
    required_error: 'infringement_data is required',
    invalid_type_error: 'infringement_data must be an object',
    description:
      'The VeRO infringement report data containing item details and violation information',
  }),
});

/**
 * Schema for getReportedItems method
 * Endpoint: GET /reported_item
 * Query: filter, limit, offset
 */
export const getReportedItemsSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
});
