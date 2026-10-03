import { z } from '@/utils/effectSchema.js';

/**
 * Effect-backed schemas for Identity API input validation
 * Based on: src/api/other/identity.ts
 * OpenAPI spec: commerce_identity_v1_oas3.json
 * Types from: src/types/commerce_identity_v1_oas3.ts
 */

/**
 * Schema for getUser method
 * Endpoint: GET /user
 * No parameters required - retrieves the authenticated user's account profile
 */
export const getUserSchema = z.object({});
