/**
 * Input validators for the Buy Browse tools.
 *
 * Each returns a tagged `EndpointInputError` rather than letting eBay answer
 * with an opaque 400, so a caller learns which parameter was wrong and why.
 */

import { EndpointInputError, optionalStringEffect } from '@/api/shared/request.js';
import { BROWSE_SORT_VALUES, type BrowseSortValue } from '@/api/other/browseTypes.js';
import { Effect } from 'effect';

/** Hard upper bound for the Browse search `limit` parameter. */
const MAX_LIMIT = 200;

/** Hard upper bound for the Browse search `offset` parameter. */
const MAX_OFFSET = 10_000;

/**
 * Validate a pagination value is a whole number inside an inclusive range.
 *
 * The shared numeric helpers only compare against their floor, so a fractional
 * or non-finite value survives them. Without `Number.isInteger` the public
 * `api.browse` surface would forward a `limit` of `1.5` (which the MCP schema
 * rejects) straight to eBay, and a `NaN` limit would surface later as a page
 * alignment failure blamed on `offset`.
 *
 * @param value - Pagination value supplied by the caller.
 * @param parameter - Parameter name used in the tagged error.
 * @param min - Inclusive lower bound.
 * @param max - Inclusive upper bound.
 * @returns The same value when valid, or a tagged input error.
 */
const requireIntegerInRange = (
  value: number,
  parameter: string,
  min: number,
  max: number,
): Effect.Effect<number, EndpointInputError> => {
  if (!Number.isInteger(value) || value < min || value > max) {
    return Effect.fail(
      new EndpointInputError({
        parameter,
        message: `${parameter} must be an integer between ${min} and ${max}`,
      }),
    );
  }

  return Effect.succeed(value);
};

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
 * Validate an optional string input, rejecting a blank value.
 *
 * `optionalStringEffect` accepts `''`, and both `defined` and the query
 * builder drop only `undefined`, so a blank value survives to the wire: as an
 * empty `category_ids=` parameter, or as a bare `priceCurrency:` clause that
 * makes eBay silently discard the whole price filter and answer with
 * unfiltered results instead of an error.
 *
 * @param value - Raw value supplied by the caller.
 * @param parameter - Parameter name used in the tagged error.
 * @returns The trimmed string (or undefined) when valid, or a tagged input error.
 *
 * @example
 * ```ts
 * const categoryIds = yield* optionalNonBlankStringEffect(input.categoryIds, 'categoryIds');
 * ```
 */
export const optionalNonBlankStringEffect = (
  value: unknown,
  parameter: string,
): Effect.Effect<string | undefined, EndpointInputError> =>
  Effect.flatMap(optionalStringEffect(value, parameter), (text) => {
    if (text === undefined) {
      return Effect.succeed(undefined);
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return Effect.fail(
        new EndpointInputError({
          parameter,
          message: `${parameter} must be a non-empty string when provided`,
        }),
      );
    }

    return Effect.succeed(trimmed);
  });

/**
 * Validate offset is a whole number inside Browse's supported range.
 *
 * @param offset - Offset already validated as a number >= 0.
 * @param limit - Validated page size the offset must align to.
 * @returns The same value when in range, or a tagged input error.
 */
export const requireOffsetInRange = (
  offset: number,
  limit: number,
): Effect.Effect<number, EndpointInputError> =>
  Effect.flatMap(requireIntegerInRange(offset, 'offset', 0, MAX_OFFSET), (validated) => {
    // Browse rejects an offset that is not a whole number of pages (error 12515)
    // with an opaque 400, so the page arithmetic is enforced here instead.
    if (validated % limit !== 0) {
      return Effect.fail(
        new EndpointInputError({
          parameter: 'offset',
          message: `offset must be zero or a multiple of limit (${limit}); got ${validated}`,
        }),
      );
    }

    return Effect.succeed(validated);
  });

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
 * Validate limit is a whole number inside Browse's supported range.
 *
 * @param limit - Page size already validated as a number > 0.
 * @returns The same value when in range, or a tagged input error.
 */
export const requireLimitInRange = (limit: number): Effect.Effect<number, EndpointInputError> =>
  requireIntegerInRange(limit, 'limit', 1, MAX_LIMIT);

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
