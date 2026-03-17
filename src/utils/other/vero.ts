import { z } from 'zod';

/**
 * Zod schemas for VERO API input validation
 * Based on: src/api/other/vero.ts
 * OpenAPI spec: docs/sell-apps/other-apis/commerce_vero_v1_oas3.json
 * Types from: src/types/commerce_vero_v1_oas3.ts
 *
 * Note: The VERO API is only available for members of the Verified Rights Owner (VeRO) Program
 */

// Reusable schema for filter parameter
const filterSchema = z
  .string({
    error: 'filter must be a string',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    error: 'limit must be a string',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    error: 'offset must be a string',
  })
  .optional();

/**
 * Schema for createVeroReport method
 * Endpoint: POST /vero_report
 * Body: VeroReportItemsRequest - report data
 */
export const createVeroReportSchema = z.object({
  report_data: z.record(z.string(), z.unknown()),
});

/**
 * Schema for getVeroReport method
 * Endpoint: GET /vero_report/{vero_report_id}
 * Path: vero_report_id
 */
export const getVeroReportSchema = z.object({
  vero_report_id: z
    .string({
      error: 'vero_report_id is required and must be a string',
    })
    .min(1, 'VERO report ID cannot be empty'),
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
  vero_reason_code_id: z
    .string({
      error: 'vero_reason_code_id is required and must be a string',
    })
    .min(1, 'VERO reason code ID cannot be empty'),
});

/**
 * Schema for getVeroReasonCodes method
 * Endpoint: GET /vero_reason_code
 * No parameters required
 */
export const getVeroReasonCodesSchema = z.object({});
