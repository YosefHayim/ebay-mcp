import { z } from 'zod';

/**
 * Zod schemas for token utility tools
 */

/**
 * Input schema for converting date strings or timestamps into milliseconds.
 */
export const ConvertDateToTimestampSchema = z
  .object({
    dateInput: z
      .union([z.string(), z.number()])
      .describe(
        'Date to convert. Supports ISO 8601 strings (e.g., "2025-01-15T10:30:00Z"), Unix timestamps (seconds or milliseconds), or relative time (e.g., "in 2 hours")',
      ),
  })
  .passthrough();

/**
 * Input schema for validating access and refresh token expiry values.
 */
export const ValidateTokenExpirySchema = z
  .object({
    accessTokenExpiry: z
      .union([z.string(), z.number()])
      .describe(
        'Access token expiry time. Can be ISO date string, Unix timestamp (seconds or milliseconds), or relative time',
      ),
    refreshTokenExpiry: z
      .union([z.string(), z.number()])
      .describe(
        'Refresh token expiry time. Can be ISO date string, Unix timestamp (seconds or milliseconds), or relative time',
      ),
  })
  .passthrough();

/**
 * Input schema for storing user tokens with optional expiry metadata.
 */
export const SetUserTokensWithExpirySchema = z
  .object({
    accessToken: z.string().min(1).describe('eBay user access token'),
    refreshToken: z.string().min(1).describe('eBay user refresh token'),
    accessTokenExpiry: z
      .union([z.string(), z.number()])
      .optional()
      .describe(
        "Optional: Access token expiry time. If not provided, defaults to 2 hours from now. Can be ISO date string, Unix timestamp, or relative time (e.g., 'in 7200 seconds')",
      ),
    refreshTokenExpiry: z
      .union([z.string(), z.number()])
      .optional()
      .describe(
        'Optional: Refresh token expiry time. If not provided, defaults to 18 months from now. Can be ISO date string, Unix timestamp, or relative time',
      ),
    autoRefresh: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'If true and access token is expired but refresh token is valid, automatically refresh the access token. Default: true',
      ),
  })
  .passthrough();
