import { EbayApiError } from '@/api/shared/request.js';
import { Effect } from 'effect';

/** Resource created by an eBay endpoint that reports its identifier only in `Location`. */
export interface LocatedResource {
  /** Location header exactly as eBay returned it. */
  readonly location: string;
  /** Decoded final path segment, e.g. a task or schedule ID. */
  readonly id: string;
}

/**
 * Reads the created resource ID from a `Location` header and checks it points at the
 * expected collection, so a malformed or foreign header never becomes an ID.
 *
 * @param location - `Location` header from the create response, if any.
 * @param collectionPath - eBay REST collection path the resource must live under, e.g. `/sell/feed/v1/order_task`.
 * @returns An Effect with the header and its decoded ID, or an EbayApiError for a missing/invalid header.
 *
 * @example
 * ```ts
 * const task = yield* locatedResourceId(response.headers.location, '/sell/feed/v1/order_task');
 * ```
 */
export const locatedResourceId = (
  location: string | undefined,
  collectionPath: string,
): Effect.Effect<LocatedResource, EbayApiError> =>
  Effect.try({
    try: () => {
      if (!location) {
        throw new Error('eBay returned no Location header');
      }
      const url = new URL(location);
      const prefix = `${collectionPath}/`;
      const segment = url.pathname.slice(prefix.length);
      if (
        url.protocol !== 'https:' ||
        !url.pathname.startsWith(prefix) ||
        !segment ||
        segment.includes('/')
      ) {
        throw new Error('eBay returned an invalid resource Location');
      }
      return { location, id: decodeURIComponent(segment) };
    },
    catch: (cause) => new EbayApiError({ method: 'POST', path: collectionPath, cause }),
  });
