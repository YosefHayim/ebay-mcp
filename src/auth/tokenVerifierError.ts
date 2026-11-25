import { Data } from 'effect';

/** Token verifier operation names reported by {@link TokenVerifierError}. */
export type TokenVerifierOperation =
  | 'initialize'
  | 'verifyToken'
  | 'verifyViaIntrospection'
  | 'verifyViaJWT';

/** Stable token verifier failure reasons reported by {@link TokenVerifierError}. */
export type TokenVerifierErrorReason =
  | 'metadataRequest'
  | 'notInitialized'
  | 'missingIntrospectionEndpoint'
  | 'introspectionRequest'
  | 'inactiveToken'
  | 'invalidAudience'
  | 'missingScopes'
  | 'missingJwksUri'
  | 'jwtVerification';

/** Tagged failure returned by token verifier Effects. */
export class TokenVerifierError extends Data.TaggedError('TokenVerifierError')<{
  /** Verifier operation that failed. */
  readonly operation: TokenVerifierOperation;
  /** Stable reason for the verifier failure. */
  readonly reason: TokenVerifierErrorReason;
  /** Human-readable failure message safe for the HTTP auth boundary. */
  readonly message: string;
  /** Lower-level HTTP, JWT, or parsing cause. */
  readonly cause?: unknown;
}> {}

/** Fields required to construct a {@link TokenVerifierError}. */
export interface TokenVerifierErrorInput {
  /** Verifier operation that failed. */
  readonly operation: TokenVerifierOperation;
  /** Stable reason for the verifier failure. */
  readonly reason: TokenVerifierErrorReason;
  /** Human-readable failure message safe for the HTTP auth boundary. */
  readonly message: string;
  /** Lower-level HTTP, JWT, or parsing cause. */
  readonly cause?: unknown;
}

/**
 * Builds a tagged token-verifier error while omitting absent optional fields.
 *
 * @param input - Token verifier failure fields captured at the failing boundary.
 * @returns Tagged verifier error returned by token verifier Effects.
 *
 * @example
 * ```ts
 * tokenVerifierError({ operation: 'verifyToken', reason: 'notInitialized', message });
 * ```
 */
export const tokenVerifierError = ({
  operation,
  reason,
  message,
  cause,
}: TokenVerifierErrorInput): TokenVerifierError =>
  new TokenVerifierError({
    operation,
    reason,
    message,
    ...(cause === undefined ? {} : { cause }),
  });
