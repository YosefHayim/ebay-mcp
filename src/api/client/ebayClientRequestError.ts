import { Data } from 'effect';

/** Failure categories raised inside the REST client's request/retry Effect. */
export type EbayClientRequestErrorKind =
  | 'missingCredentials'
  | 'localRateLimit'
  | 'tokenAcquisition'
  | 'missingAccessToken'
  | 'tokenRefresh'
  | 'remoteRateLimit'
  | 'httpStatus'
  | 'transport';

/** Tagged failure raised inside the REST client's request/retry Effect. */
export class EbayClientRequestError extends Data.TaggedError('EbayClientRequestError')<{
  /** Request failure category used by tests and endpoint wrappers. */
  readonly kind: EbayClientRequestErrorKind;
  /** HTTP method used by the failed request. */
  readonly method: string;
  /** Fully qualified request URL. */
  readonly url: string;
  /** Human-readable failure message. */
  readonly message: string;
  /** HTTP response status when the failure came from eBay. */
  readonly status?: number;
  /** Lower-level transport, auth, or response parsing cause. */
  readonly cause?: unknown;
}> {}

/** Fields required to construct an {@link EbayClientRequestError}. */
export interface EbayClientRequestErrorInput {
  /** Request failure category used by tests and endpoint wrappers. */
  readonly kind: EbayClientRequestErrorKind;
  /** HTTP method used by the failed request. */
  readonly method: string;
  /** Fully qualified request URL. */
  readonly url: string;
  /** Human-readable failure message. */
  readonly message: string;
  /** HTTP response status when the failure came from eBay. */
  readonly status?: number;
  /** Lower-level transport, auth, or response parsing cause. */
  readonly cause?: unknown;
}

/**
 * Builds a tagged REST-client request error while omitting absent optional fields.
 *
 * @param input - Request failure fields captured by the REST client.
 * @returns Tagged client request error used as the internal request Effect failure.
 *
 * @example
 * ```ts
 * clientRequestError({ kind: 'httpStatus', method: 'GET', url, message, status: 429 });
 * ```
 */
export const clientRequestError = ({
  kind,
  method,
  url,
  message,
  status,
  cause,
}: EbayClientRequestErrorInput): EbayClientRequestError =>
  new EbayClientRequestError({
    kind,
    method,
    url,
    message,
    ...(status === undefined ? {} : { status }),
    ...(cause === undefined ? {} : { cause }),
  });
