import { z } from 'zod';

/**
 * Zod schemas for Compliance API input validation
 * Based on: src/api/other/compliance.ts
 * OpenAPI spec: sell_compliance_v1_oas3.json
 * Types from: src/types/sell_compliance_v1_oas3.ts
 */

// Reusable schema for complianceType parameter
const complianceTypeSchema = z
  .string({
    invalid_type_error: 'complianceType must be a string',
    description:
      'Compliance type(s) to filter violations (e.g., ASPECTS_ADOPTION, HTTPS, OUTSIDE_EBAY_BUYING_AND_SELLING, RETURNS_POLICY)',
  })
  .optional();

// Reusable schema for offset parameter
const offsetSchema = z
  .number({
    invalid_type_error: 'offset must be a number',
    description: 'Number of items to skip (zero-based index)',
  })
  .int()
  .nonnegative()
  .optional();

// Reusable schema for limit parameter
const limitSchema = z
  .number({
    invalid_type_error: 'limit must be a number',
    description: 'Maximum number of items to return (default: 100, max: 200)',
  })
  .int()
  .positive()
  .optional();

/**
 * Schema for getListingViolations method
 * Endpoint: GET /listing_violation
 * Query: complianceType, offset, limit, filter
 */
export const getListingViolationsSchema = z.object({
  complianceType: complianceTypeSchema,
  offset: offsetSchema,
  limit: limitSchema,
  filter: z
    .string({
      invalid_type_error: 'filter must be a string',
      description: 'Filter by compliance state (e.g., complianceState:{OUT_OF_COMPLIANCE})',
    })
    .optional(),
});

/**
 * Schema for getListingViolationsSummary method
 * Endpoint: GET /listing_violation_summary
 * Query: complianceType
 */
export const getListingViolationsSummarySchema = z.object({
  complianceType: complianceTypeSchema,
});
