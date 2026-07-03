import type { EbayApiClient } from '@/api/client.js';
import {
  buildValidatedPaginatedParams,
  getWithApiError,
  requireString,
} from '@/api/shared/request.js';

/**
 * Build validated pagination query params.
 *
 * @param filter API filter expression.
 * @param limit Maximum number of records.
 * @param offset Zero-based pagination offset.
 * @returns Query parameter object for paginated GET calls.
 */
export function buildPaginatedQueryParams(
  filter?: string,
  limit?: number,
  offset?: number,
): Record<string, string | number> {
  return buildValidatedPaginatedParams(filter, limit, offset);
}

/**
 * Validate that a required parameter is a non-empty string.
 *
 * @param value Value to validate.
 * @param paramName Parameter name used in error text.
 */
export function assertRequiredString(value: string, paramName: string): void {
  requireString(value, paramName);
}

/**
 * Perform a GET request and wrap errors with endpoint-specific context.
 *
 * @param client Configured eBay API client.
 * @param path Endpoint path to request.
 * @param failureMessage Prefix text for thrown error messages.
 * @returns API response payload.
 */
export async function getPathWithContextError(
  client: EbayApiClient,
  path: string,
  failureMessage: string,
) {
  return await getWithApiError(client, path, failureMessage);
}

/**
 * Perform a GET request with query params and wrap errors with endpoint-specific context.
 *
 * @param client Configured eBay API client.
 * @param path Endpoint path to request.
 * @param params Query parameters sent with the request.
 * @param failureMessage Prefix text for thrown error messages.
 * @returns API response payload.
 */
export async function getWithContextError(
  client: EbayApiClient,
  path: string,
  params: Record<string, string | number>,
  failureMessage: string,
) {
  return await getWithApiError(client, path, failureMessage, params);
}

/**
 * Perform a paginated GET request with validated filter/limit/offset params.
 *
 * @param client Configured eBay API client.
 * @param path Endpoint path to request.
 * @param failureMessage Prefix text for thrown error messages.
 * @param filter API filter expression.
 * @param limit Maximum number of records.
 * @param offset Zero-based pagination offset.
 * @returns API response payload.
 */
export async function getPaginatedWithContextError(
  client: EbayApiClient,
  path: string,
  failureMessage: string,
  filter?: string,
  limit?: number,
  offset?: number,
) {
  const params = buildPaginatedQueryParams(filter, limit, offset);
  return await getWithContextError(client, path, params, failureMessage);
}
