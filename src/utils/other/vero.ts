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
type VeroReportItemsRequest = components['schemas']['VeroReportItemsRequest'];

// Reusable schema for filter parameter
const filterSchema = z
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
 * Schema for createVeroReport method
 * Endpoint: POST /vero_report
 * Body: VeroReportItemsRequest - report data
 */
export const createVeroReportSchema = z.object({
  report_data: z.record(z.unknown(), {
    message: 'Report data is required',
    required_error: 'report_data is required',
    invalid_type_error: 'report_data must be an object',
    description:
      'The VeRO report data containing item details and intellectual property violation information',
  }),
});

/**
 * Schema for getVeroReport method
 * Endpoint: GET /vero_report/{vero_report_id}
 * Path: vero_report_id
 */
export const getVeroReportSchema = z.object({
  vero_report_id: z.string({
    message: 'VERO report ID is required',
    required_error: 'vero_report_id is required',
    invalid_type_error: 'vero_report_id must be a string',
    description: 'The unique identifier of the VERO report',
  }).min(1, 'VERO report ID cannot be empty'),
});

/**
 * Schema for getVeroReportItems method
 * Endpoint: GET /vero_report_items
 * Query: filter, limit, offset
 */
export const getVeroReportItemsSchema = z.object({
  filter: filterSchema,
  limit: limitSchema,
  offset: offsetSchema,
});

/**
 * Schema for getVeroReasonCode method
 * Endpoint: GET /vero_reason_code/{vero_reason_code_id}
 * Path: vero_reason_code_id
 */
export const getVeroReasonCodeSchema = z.object({
  vero_reason_code_id: z.string({
    message: 'VERO reason code ID is required',
    required_error: 'vero_reason_code_id is required',
    invalid_type_error: 'vero_reason_code_id must be a string',
    description: 'The unique identifier of the VERO reason code',
  }).min(1, 'VERO reason code ID cannot be empty'),
});

/**
 * Schema for getVeroReasonCodes method
 * Endpoint: GET /vero_reason_code
 * No parameters required
 */
export const getVeroReasonCodesSchema = z.object({});
