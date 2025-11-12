import { z } from 'zod';
import type { operations } from '@/types/sell_compliance_v1_oas3.js';

/**
 * Zod schemas for Compliance API input validation
 * Based on: src/api/other/compliance.ts
 * OpenAPI spec: docs/sell-apps/other-apis/sell_compliance_v1_oas3.json
 * Types from: src/types/sell_compliance_v1_oas3.ts
 */

// Extract operation parameter types for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetListingViolationsParams = operations['getListingViolations']['parameters']['query'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _GetListingViolationsSummaryParams =
  operations['getListingViolationsSummary']['parameters']['query'];

// Reusable schema for compliance_type parameter
const complianceTypeSchema = z
  .string({
    invalid_type_error: 'compliance_type must be a string',
    description:
      'Compliance type(s) to filter violations (e.g., ASPECTS_ADOPTION, HTTPS, OUTSIDE_EBAY_BUYING_AND_SELLING, RETURNS_POLICY)',
  })
  .optional();

// Reusable schema for offset parameter (string in API)
const offsetSchema = z
  .string({
    invalid_type_error: 'offset must be a string',
    description: 'Number of items to skip (zero-based index)',
  })
  .optional();

// Reusable schema for limit parameter (string in API)
const limitSchema = z
  .string({
    invalid_type_error: 'limit must be a string',
    description: 'Maximum number of items to return (default: 100, max: 200)',
  })
  .optional();

/**
 * Schema for getListingViolations method
 * Endpoint: GET /listing_violation
 * Query: GetListingViolationsParams - compliance_type (required), offset, limit, listing_id, filter
 */
export const getListingViolationsSchema = z.object({
  compliance_type: z.string({
    message: 'Compliance type is required',
    required_error: 'compliance_type is required',
    invalid_type_error: 'compliance_type must be a string',
    description: 'The compliance type of violations to retrieve (only one type allowed per call)',
  }),
  offset: offsetSchema,
  limit: limitSchema,
  listing_id: z
    .string({
      invalid_type_error: 'listing_id must be a string',
      description: 'Filter by specific eBay listing ID (not yet supported)',
    })
    .optional(),
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
 * Query: GetListingViolationsSummaryParams - compliance_type
 */
export const getListingViolationsSummarySchema = z.object({
  compliance_type: complianceTypeSchema,
});

/**
 * Schema for suppressViolation method
 * Endpoint: POST /suppress_violation
 * Body: listing_violation_id (required)
 */
export const suppressViolationSchema = z.object({
  listing_violation_id: z.string({
    message: 'Listing violation ID is required',
    required_error: 'listing_violation_id is required',
    invalid_type_error: 'listing_violation_id must be a string',
    description: 'The unique identifier of the listing violation to suppress',
  }),
});
