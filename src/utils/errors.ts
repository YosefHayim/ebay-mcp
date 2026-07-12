import { Cause, Runtime } from 'effect';

/**
 * Normalize an unknown thrown value into a human-readable message string.
 *
 * This is the single source of truth for the
 * `error instanceof Error ? error.message : …` idiom that otherwise recurs
 * across the codebase. It returns `error.message` for real `Error` instances
 * and `fallback` for anything else (thrown strings, plain objects, `undefined`).
 *
 * @param error - The value caught in a `catch` block (typed `unknown`).
 * @param fallback - Message to use when `error` is not an `Error`. Pass the
 *   call site's original fallback (e.g. `String(error)` or a domain-specific
 *   string) to preserve existing behavior; defaults to `'Unknown error'`.
 * @returns Human-readable error message.
 *
 * @example
 * ```ts
 * const message = getErrorMessage(error, 'Request failed');
 * ```
 */
export const getErrorMessage = (error: unknown, fallback = 'Unknown error'): string =>
  error instanceof Error ? error.message : fallback;

/** Structured view of an eBay failure, flattened from the tagged-error cause chain. */
export interface EbayErrorDetails {
  /** Most descriptive message available (eBay longMessage/message when present). */
  readonly message: string;
  /** HTTP status when the failure came from an eBay response. */
  readonly status?: number;
  /**
   * The raw eBay error array (`errorId`, `message`, `longMessage`, `parameters`, …)
   * when the response carried one. Surfaced verbatim so callers see exactly what
   * eBay rejected instead of a masked generic message.
   */
  readonly errors?: unknown[];
}

/** Narrow an unknown value to an indexable object without asserting `any`. */
const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;

/**
 * Resolve the next node to walk. `Effect.runPromise` rejects failures as an
 * opaque `FiberFailure` whose real error is sealed in an Effect `Cause` under a
 * symbol — every tool handler ends in `runPromise`, so the boundary always sees
 * one. Squash that Cause to recover the tagged error; otherwise follow `.cause`.
 */
const nextErrorNode = (node: Record<string, unknown>): unknown => {
  const fiberCause = (node as Record<symbol, unknown>)[Runtime.FiberFailureCauseId];
  if (fiberCause !== undefined) {
    return Cause.squash(fiberCause as Cause.Cause<unknown>);
  }
  return node.cause;
};

/** Pull the most descriptive string from the first element of an eBay errors array. */
const firstEbayErrorMessage = (errors: unknown[]): string | undefined => {
  const first = asRecord(errors[0]);
  if (!first) {
    return undefined;
  }
  const detail = first.longMessage ?? first.message;
  return typeof detail === 'string' ? detail : undefined;
};

/**
 * Flatten an eBay tagged-error cause chain into the detail a tool result should
 * surface. Walks `.cause` from the outermost error inward, collecting the best
 * message, the HTTP status, and the raw eBay `errors` array (which carries
 * `errorId` and `parameters`) so failures are no longer masked as a generic string.
 *
 * @param error - The value caught at the MCP tool boundary (typed `unknown`).
 * @returns Message, optional status, and optional raw eBay errors array.
 *
 * @example
 * ```ts
 * const { message, status, errors } = getEbayErrorDetails(error);
 * ```
 */
/** Mutable accumulator threaded through the cause chain by {@link getEbayErrorDetails}. */
interface EbayErrorAccumulator {
  message: string;
  status?: number;
  errors?: unknown[];
}

/** Fold one cause-chain node's message, status, and eBay errors into the accumulator. */
const collectEbayErrorNode = (node: Record<string, unknown>, acc: EbayErrorAccumulator): void => {
  if (typeof node.message === 'string' && node.message.length > 0) {
    acc.message = node.message;
  }
  if (typeof node.status === 'number') {
    acc.status = node.status;
  }
  // eBay REST errors arrive on the transport-level HttpError as `data.errors`.
  const data = asRecord(node.data);
  if (data && Array.isArray(data.errors)) {
    acc.errors = data.errors;
    const detail = firstEbayErrorMessage(data.errors);
    if (detail) {
      acc.message = detail;
    }
  }
};

export const getEbayErrorDetails = (error: unknown): EbayErrorDetails => {
  const acc: EbayErrorAccumulator = { message: getErrorMessage(error) };

  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current);
    const record = asRecord(current);
    if (!record) {
      break;
    }
    collectEbayErrorNode(record, acc);
    current = nextErrorNode(record);
  }

  return {
    message: acc.message,
    ...(acc.status === undefined ? {} : { status: acc.status }),
    ...(acc.errors === undefined ? {} : { errors: acc.errors }),
  };
};
