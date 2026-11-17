import { z } from 'zod';

/**
 * Zod schemas for Identity API input validation
 * Based on: src/ebay-apis/other/identity/identity-api.ts
 * OpenAPI spec: commerce_identity_v1_oas3.json
 * Types from: src/ebay-openapi-types/commerceIdentityV1Oas3.ts
 */

/**
 * Schema for getUser method
 * Endpoint: GET /user
 * No parameters required - retrieves the authenticated user's account profile
 */
export const getUserSchema = z.object({});
