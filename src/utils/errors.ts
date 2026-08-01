import type { EbayClientRequestErrorKind } from '@/api/clientRequestError.js';
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

/**
 * Narrow an unknown value to an indexable object without asserting `any`.
 *
 * Unlike `isRecord` in `@/utils/typeGuards`, this deliberately admits arrays
 * (`typeof [] === 'object'`): the Trading (XML) error branch reads `node.cause`
 * as an array of error objects, and callers here only ever read named string
 * keys, so treating an array as a record is harmless. Kept local rather than
 * shared so that difference stays explicit at the one place it matters.
 */
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
    return;
  }
  const detail = first.longMessage ?? first.message;
  return typeof detail === 'string' ? detail : undefined;
};

/** Mutable accumulator threaded through the cause chain by {@link getEbayErrorDetails}. */
interface EbayErrorAccumulator {
  message: string;
  status?: number;
  errors?: unknown[];
  /** Set once a composed remediation message is captured so raw detail cannot overwrite it. */
  messageLocked?: boolean;
}

/**
 * Classify every `EbayClientRequestError.kind` by whether its message is
 * deliberate, actionable remediation guidance (retry-after seconds, "use the
 * ebay_set_user_tokens…" hint) that a deeper node's raw eBay `longMessage` must
 * not overwrite, versus a generic `httpStatus`/`transport` message that stays
 * overwritable so the eBay error detail can refine it.
 *
 * Typed as a total `Record` over the union so adding a new kind to
 * {@link EbayClientRequestErrorKind} is a compile error here until it is
 * classified — the guidance set can never silently drift out of sync.
 */
const KIND_IS_GUIDANCE: Record<EbayClientRequestErrorKind, boolean> = {
  missingCredentials: true,
  localRateLimit: true,
  tokenAcquisition: true,
  missingAccessToken: true,
  tokenRefresh: true,
  remoteRateLimit: true,
  httpStatus: false,
  transport: false,
};

/** Whether a node's `kind` string carries a remediation message to preserve. */
const isGuidanceKind = (kind: string): boolean =>
  Object.hasOwn(KIND_IS_GUIDANCE, kind) && KIND_IS_GUIDANCE[kind as EbayClientRequestErrorKind];

/** Fold one cause-chain node's message, status, and eBay errors into the accumulator. */
const collectEbayErrorNode = (node: Record<string, unknown>, acc: EbayErrorAccumulator): void => {
  const message =
    typeof node.message === 'string' && node.message.length > 0 ? node.message : undefined;
  if (message !== undefined && !acc.messageLocked) {
    acc.message = message;
    if (typeof node.kind === 'string' && isGuidanceKind(node.kind)) {
      acc.messageLocked = true;
    }
  }
  if (typeof node.status === 'number') {
    acc.status = node.status;
  }
  // eBay REST errors arrive on the transport-level HttpError as `data.errors`.
  const data = asRecord(node.data);
  if (data && Array.isArray(data.errors)) {
    acc.errors = data.errors;
    const detail = firstEbayErrorMessage(data.errors);
    if (detail && !acc.messageLocked) {
      acc.message = detail;
    }
    return;
  }
  // eBay Trading (XML) errors ride on the tagged-error `cause` as an array of
  // `{ ShortMessage, LongMessage, ErrorCode, ErrorParameters }` rather than
  // `data.errors`. Surface it verbatim so Trading failures carry the same
  // structured detail (errorId/parameters) as REST failures. The human-readable
  // message is already captured from the TradingApiFailure `message` field above.
  if (acc.errors === undefined && Array.isArray(node.cause) && node.cause.length > 0) {
    acc.errors = node.cause;
  }
};

/**
 * Flatten an eBay tagged-error cause chain into the detail a tool result should
 * surface. Walks `.cause` from the outermost error inward, collecting the best
 * message, the HTTP status, and the raw eBay `errors` array (which carries
 * `errorId` and `parameters`) so failures are no longer masked as a generic string.
 * A composed remediation message (rate-limit retry hint, token guidance) is kept
 * intact rather than being overwritten by a deeper raw eBay message.
 *
 * @param error - The value caught at the MCP tool boundary (typed `unknown`).
 * @returns Message, optional status, and optional raw eBay errors array.
 *
 * @example
 * ```ts
 * const { message, status, errors } = getEbayErrorDetails(error);
 * ```
 */
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
