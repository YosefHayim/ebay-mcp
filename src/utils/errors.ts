import type { EbayClientRequestErrorKind } from '@/api/client/ebayClientRequestError.js';
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

/** Structured eBay failure data recovered from an Effect error cause chain. */
export interface EbayErrorDetails {
  /** Most actionable human-readable failure message available. */
  readonly message: string;
  /** HTTP status returned by eBay, when the request reached eBay. */
  readonly status?: number;
  /** Raw eBay error entries, including identifiers and parameters. */
  readonly errors?: unknown[];
}

interface EbayErrorAccumulator {
  message: string;
  status?: number;
  errors?: unknown[];
  messageLocked?: boolean;
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;

const nextErrorNode = (node: Record<string, unknown>): unknown => {
  const fiberCause = (node as Record<symbol, unknown>)[Runtime.FiberFailureCauseId];
  if (fiberCause !== undefined) {
    return Cause.squash(fiberCause as Cause.Cause<unknown>);
  }
  return node.cause;
};

const firstEbayErrorMessage = (errors: unknown[]): string | undefined => {
  const first = asRecord(errors[0]);
  if (!first) {
    return;
  }
  const detail = first.longMessage ?? first.message;
  return typeof detail === 'string' ? detail : undefined;
};

const KIND_IS_GUIDANCE: Record<EbayClientRequestErrorKind, boolean> = {
  missingCredentials: true,
  localRateLimit: true,
  tokenAcquisition: true,
  missingAccessToken: true,
  tokenRefresh: true,
  signing: true,
  remoteRateLimit: true,
  httpStatus: false,
  transport: false,
};

const isGuidanceKind = (kind: string): boolean =>
  Object.hasOwn(KIND_IS_GUIDANCE, kind) && KIND_IS_GUIDANCE[kind as EbayClientRequestErrorKind];

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

  const errorBody = asRecord(node.data);
  if (errorBody && Array.isArray(errorBody.errors)) {
    acc.errors = errorBody.errors;
    const detail = firstEbayErrorMessage(errorBody.errors);
    if (detail && !acc.messageLocked) {
      acc.message = detail;
    }
    return;
  }

  // Trading XML failures store their structured entries directly on `cause`.
  if (acc.errors === undefined && Array.isArray(node.cause) && node.cause.length > 0) {
    acc.errors = node.cause;
  }
};

/**
 * Recovers status, structured eBay errors, and the best message from nested
 * tagged errors and Effect FiberFailures.
 *
 * @param error - Failure caught at an external boundary.
 * @returns Structured details suitable for an MCP error result.
 *
 * @example
 * ```ts
 * const details = getEbayErrorDetails(error);
 * ```
 */
export const getEbayErrorDetails = (error: unknown): EbayErrorDetails => {
  const acc: EbayErrorAccumulator = { message: getErrorMessage(error) };
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current);
    const node = asRecord(current);
    if (!node) {
      break;
    }
    collectEbayErrorNode(node, acc);
    current = nextErrorNode(node);
  }

  return {
    message: acc.message,
    ...(acc.status === undefined ? {} : { status: acc.status }),
    ...(acc.errors === undefined ? {} : { errors: acc.errors }),
  };
};
