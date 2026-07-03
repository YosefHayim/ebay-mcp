import type { EbayApiClient } from '@/api/client.js';
import { getErrorMessage } from '@/utils/errors.js';

/**
 * Query-string values accepted by the eBay REST client helpers.
 */
export type QueryParams = Record<string, string | number>;

/**
 * Run an API operation and prefix failures with endpoint-specific context.
 */
export async function withApiError<T>(
  failureMessage: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new Error(`${failureMessage}: ${getErrorMessage(error)}`);
  }
}

/**
 * Require a tool argument or API field to be a non-empty string.
 */
export function requireString(value: unknown, name: string): asserts value is string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${name} is required and must be a string`);
  }
}

/**
 * Require a tool argument or API payload field to be an object.
 */
export function requireObject<T extends object>(value: unknown, name: string): asserts value is T {
  if (!value || typeof value !== 'object') {
    throw new Error(`${name} is required and must be an object`);
  }
}

/**
 * Validate an optional string query parameter.
 */
export function optionalStringParam(value: unknown, name: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${name} must be a string when provided`);
  }

  return value;
}

/**
 * Build a query object from provided optional string parameters.
 */
export function buildOptionalStringParams(params: Record<string, unknown>): QueryParams {
  const query: QueryParams = {};

  for (const [name, value] of Object.entries(params)) {
    const stringValue = optionalStringParam(value, name);
    if (stringValue) {
      query[name] = stringValue;
    }
  }

  return query;
}

/**
 * Validate an optional positive numeric query parameter such as page size.
 */
export function optionalPositiveNumberParam(value: unknown, name: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || value < 1) {
    throw new Error(`${name} must be a positive number when provided`);
  }

  return value;
}

/**
 * Validate an optional non-negative numeric query parameter such as an offset.
 */
export function optionalNonNegativeNumberParam(value: unknown, name: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || value < 0) {
    throw new Error(`${name} must be a non-negative number when provided`);
  }

  return value;
}

/**
 * Build validated filter/limit/offset query parameters for paginated eBay APIs.
 */
export function buildValidatedPaginatedParams(
  filter?: string,
  limit?: number,
  offset?: number,
): QueryParams {
  const params: QueryParams = {};
  const validatedFilter = optionalStringParam(filter, 'filter');
  const validatedLimit = optionalPositiveNumberParam(limit, 'limit');
  const validatedOffset = optionalNonNegativeNumberParam(offset, 'offset');

  if (validatedFilter !== undefined) {
    params.filter = validatedFilter;
  }

  if (validatedLimit !== undefined) {
    params.limit = validatedLimit;
  }

  if (validatedOffset !== undefined) {
    params.offset = validatedOffset;
  }

  return params;
}

/**
 * Build validated continuation-token query parameters for cursor-based eBay APIs.
 */
export function buildContinuationParams(limit?: number, continuationToken?: string): QueryParams {
  const params: QueryParams = {};
  const validatedLimit = optionalPositiveNumberParam(limit, 'limit');
  const validatedContinuationToken = optionalStringParam(continuationToken, 'continuationToken');

  if (validatedLimit !== undefined) {
    params.limit = validatedLimit;
  }

  if (validatedContinuationToken !== undefined) {
    params.continuation_token = validatedContinuationToken;
  }

  return params;
}

/**
 * Execute a GET request with consistent eBay API error context.
 */
export async function getWithApiError<T = unknown>(
  client: EbayApiClient,
  path: string,
  failureMessage: string,
  params?: QueryParams,
): Promise<T> {
  return await withApiError(failureMessage, () =>
    params === undefined ? client.get<T>(path) : client.get<T>(path, params),
  );
}

/**
 * Execute a POST request with consistent eBay API error context.
 */
export async function postWithApiError<T = unknown>(
  client: EbayApiClient,
  path: string,
  failureMessage: string,
  body?: unknown,
): Promise<T> {
  return await withApiError(failureMessage, () => client.post<T>(path, body));
}

/**
 * Execute a PUT request with consistent eBay API error context.
 */
export async function putWithApiError<T = unknown>(
  client: EbayApiClient,
  path: string,
  failureMessage: string,
  body?: unknown,
): Promise<T> {
  return await withApiError(failureMessage, () => client.put<T>(path, body));
}

/**
 * Execute a DELETE request with consistent eBay API error context.
 */
export async function deleteWithApiError<T = unknown>(
  client: EbayApiClient,
  path: string,
  failureMessage: string,
): Promise<T> {
  return await withApiError(failureMessage, () => client.delete<T>(path));
}
