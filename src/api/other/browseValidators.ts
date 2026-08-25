/**
 * Input validators for the Buy Browse tools.
 *
 * Each returns a tagged `EndpointInputError` rather than letting eBay answer
 * with an opaque 400, so a caller learns which parameter was wrong and why.
 */

import { EndpointInputError } from '@/api/shared/request.js';
import { BROWSE_SORT_VALUES, type BrowseSortValue } from '@/api/other/browseTypes.js';
import { Effect } from 'effect';

/** Hard upper bound for the Browse search `limit` parameter. */
const MAX_LIMIT = 200;

/** Hard upper bound for the Browse search `offset` parameter. */
const MAX_OFFSET = 10_000;

/** Default page size when limit is omitted. */
export const DEFAULT_LIMIT = 20;

/**
 * Validate an optional string array input.
 *
 * @param value - Raw value supplied by the caller.
 * @param parameter - Parameter name used in the tagged error.
 * @returns The array (or undefined) when valid, or a tagged input error.
 */
export const optionalStringArrayEffect = (
  value: unknown,
  parameter: string,
): Effect.Effect<readonly string[] | undefined, EndpointInputError> => {
  if (value === undefined) {
    return Effect.succeed(undefined);
  }

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || !entry)) {
    return Effect.fail(
      new EndpointInputError({
        parameter,
        message: `${parameter} must be an array of non-empty strings`,
      }),
    );
  }

  return Effect.succeed(value as readonly string[]);
};

/**
 * Validate offset falls within Browse's supported range.
 *
 * @param offset - Non-negative offset already validated as >= 0.
 * @returns The same value when in range, or a tagged input error.
 */
export const requireOffsetInRange = (
  offset: number,
  limit: number,
): Effect.Effect<number, EndpointInputError> => {
  if (offset > MAX_OFFSET) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'offset',
        message: `offset must be between 0 and ${MAX_OFFSET}`,
      }),
    );
  }

  // Browse rejects an offset that is not a whole number of pages (error 12515)
  // with an opaque 400, so the page arithmetic is enforced here instead.
  if (offset % limit !== 0) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'offset',
        message: `offset must be zero or a multiple of limit (${limit}); got ${offset}`,
      }),
    );
  }

  return Effect.succeed(offset);
};

/**
 * Reject a price window whose bounds are inverted.
 *
 * eBay accepts `price:[50..10]` and simply matches nothing, so an inverted
 * window would look like a legitimate empty result rather than a mistake.
 *
 * @param priceMin - Optional lower bound.
 * @param priceMax - Optional upper bound.
 * @returns Unit when the window is coherent, or a tagged input error.
 */
export const requireCoherentPriceRange = (
  priceMin: number | undefined,
  priceMax: number | undefined,
): Effect.Effect<void, EndpointInputError> => {
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'priceMin',
        message: `priceMin (${priceMin}) must not exceed priceMax (${priceMax})`,
      }),
    );
  }

  return Effect.succeed(undefined);
};

/**
 * Validate limit falls within Browse's supported range.
 *
 * @param limit - Positive page size already validated as > 0.
 * @returns The same value when in range, or a tagged input error.
 */
export const requireLimitInRange = (limit: number): Effect.Effect<number, EndpointInputError> => {
  if (limit > MAX_LIMIT) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'limit',
        message: `limit must be between 1 and ${MAX_LIMIT}`,
      }),
    );
  }

  return Effect.succeed(limit);
};

/**
 * Validate sort is one of the supported Browse sort orders when provided.
 *
 * @param sort - Optional sort string.
 * @returns The validated sort value (or undefined), or a tagged input error.
 */
export const requireSupportedSort = (
  sort: string | undefined,
): Effect.Effect<BrowseSortValue | undefined, EndpointInputError> => {
  if (sort === undefined) {
    return Effect.succeed(undefined);
  }

  if (!(BROWSE_SORT_VALUES as readonly string[]).includes(sort)) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'sort',
        message: `sort must be one of: ${BROWSE_SORT_VALUES.join(', ')}`,
      }),
    );
  }

  return Effect.succeed(sort as BrowseSortValue);
};
