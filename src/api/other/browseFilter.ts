/**
 * Browse filter-expression builder.
 *
 * Browse takes its filters as a single comma-separated expression with its own
 * grammar, which is fiddly enough to be worth isolating and testing on its own.
 */

import { EndpointInputError } from '@/api/shared/request.js';
import { Effect } from 'effect';

/** Detects a price clause in a caller-supplied raw filter expression. */
const RAW_PRICE_CLAUSE = /(^|,)\s*price(Currency)?:/;

/**
 * Build the Browse `filter` expression from convenience inputs.
 *
 * Clauses are joined with commas per the Browse filter grammar. A raw
 * `filter` passthrough is appended last so advanced expressions compose with
 * the convenience parameters instead of replacing them.
 *
 * @param input - Validated convenience filter values plus optional raw filter.
 * @returns Combined filter expression, or undefined when no clause applies.
 *
 * @example
 * ```ts
 * buildBrowseFilter({ conditions: ['NEW'], priceMax: 50, priceCurrency: 'USD' });
 * // 'conditions:{NEW},price:[..50],priceCurrency:USD'
 * ```
 */
export const buildBrowseFilter = (input: {
  readonly conditions?: readonly string[];
  readonly buyingOptions?: readonly string[];
  readonly priceMin?: number;
  readonly priceMax?: number;
  readonly priceCurrency?: string;
  readonly filter?: string;
}): string | undefined => {
  const clauses: string[] = [];

  if (input.conditions && input.conditions.length > 0) {
    clauses.push(`conditions:{${input.conditions.join('|')}}`);
  }

  if (input.buyingOptions && input.buyingOptions.length > 0) {
    clauses.push(`buyingOptions:{${input.buyingOptions.join('|')}}`);
  }

  const hasMin = input.priceMin !== undefined;
  const hasMax = input.priceMax !== undefined;
  if (hasMin || hasMax) {
    // `price:[10]` reads as an exact match to eBay, so a lower bound on its own
    // must still emit the open-ended `[10..]` form.
    let range = `[..${input.priceMax}]`;
    if (hasMin && hasMax) {
      range = `[${input.priceMin}..${input.priceMax}]`;
    } else if (hasMin) {
      range = `[${input.priceMin}..]`;
    }
    clauses.push(`price:${range}`);
    clauses.push(`priceCurrency:${input.priceCurrency ?? 'USD'}`);
  }

  if (input.filter) {
    clauses.push(input.filter);
  }

  return clauses.length > 0 ? clauses.join(',') : undefined;
};

/**
 * Reject a raw filter that would collide with the generated price clauses.
 *
 * Both are appended to one comma-joined expression, so a caller-supplied
 * `price:`/`priceCurrency:` clause alongside priceMin/priceMax yields a
 * duplicate key that eBay rejects with an opaque 400.
 *
 * @param rawFilter - Optional caller-supplied filter expression.
 * @param hasPriceBounds - Whether priceMin or priceMax was supplied.
 * @returns Unit when the two cannot collide, or a tagged input error.
 */
export const requireNoPriceFilterConflict = (
  rawFilter: string | undefined,
  hasPriceBounds: boolean,
): Effect.Effect<void, EndpointInputError> => {
  if (rawFilter && hasPriceBounds && RAW_PRICE_CLAUSE.test(rawFilter)) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'filter',
        message:
          'filter already contains a price clause; use either priceMin/priceMax or a raw price filter, not both',
      }),
    );
  }

  return Effect.succeed(undefined);
};
