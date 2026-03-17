import { z } from 'zod';

/**
 * Zod schemas for Compliance API input validation
 * Based on: src/api/other/compliance.ts
 * OpenAPI spec: docs/sell-apps/other-apis/sell_compliance_v1_oas3.json
 */

const complianceTypeSchema = z
  .string({ error: 'compliance_type must be a string' })
  .optional();

const offsetSchema = z.string({ error: 'offset must be a string' }).optional();

const limitSchema = z.string({ error: 'limit must be a string' }).optional();

/**
 * Schema for getListingViolations method
 * Endpoint: GET /listing_violation
 */
export const getListingViolationsSchema = z.object({
  compliance_type: z.string({ error: 'compliance_type is required and must be a string' }),
  offset: offsetSchema,
  limit: limitSchema,
  listing_id: z.string({ error: 'listing_id must be a string' }).optional(),
  filter: z.string({ error: 'filter must be a string' }).optional(),
});

/**
 * Schema for getListingViolationsSummary method
 * Endpoint: GET /listing_violation_summary
 */
export const getListingViolationsSummarySchema = z.object({
  compliance_type: complianceTypeSchema,
});

/**
 * Schema for suppressViolation method
 * Endpoint: POST /suppress_violation
 */
export const suppressViolationSchema = z.object({
  listing_violation_id: z.string({
    error: 'listing_violation_id is required and must be a string',
  }),
});
