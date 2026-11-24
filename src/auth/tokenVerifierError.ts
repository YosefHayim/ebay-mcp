export type TokenVerifierOperation =
	| "initialize"
	| "verifyToken"
	| "verifyViaIntrospection"
	| "verifyViaJWT";

export type TokenVerifierErrorReason =
	| "metadataRequest"
	| "notInitialized"
	| "missingIntrospectionEndpoint"
	| "introspectionRequest"
	| "inactiveToken"
	| "invalidAudience"
	| "missingScopes"
	| "missingJwksUri"
	| "jwtVerification";

export interface TokenVerifierErrorInput {
	readonly operation: TokenVerifierOperation;
	readonly reason: TokenVerifierErrorReason;
	readonly message: string;
	readonly cause?: unknown;
}

export class TokenVerifierError extends Error {
	readonly _tag = "TokenVerifierError";
	readonly operation: TokenVerifierOperation;
	readonly reason: TokenVerifierErrorReason;

	constructor(failure: TokenVerifierErrorInput) {
		super(failure.message);
		this.name = "TokenVerifierError";
		this.operation = failure.operation;
		this.reason = failure.reason;

		if (failure.cause !== undefined) {
			this.cause = failure.cause;
		}
	}
}

export function tokenVerifierError(
	failure: TokenVerifierErrorInput,
): TokenVerifierError {
	return new TokenVerifierError(failure);
}
