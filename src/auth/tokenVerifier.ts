/**
 * Token verification using OAuth 2.0 Token Introspection (RFC 7662)
 * and JWT validation
 */

import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import {
	type TokenVerifierErrorReason,
	type TokenVerifierOperation,
	tokenVerifierError,
} from "@/auth/tokenVerifierError.js";
import { getErrorMessage } from "@/shared/errors.js";
import {
	describeHttpError,
	type HttpRequestOptions,
	httpRequestEffect,
} from "@/shared/http.js";
import type {
	OAuthServerMetadata,
	TokenIntrospectionRequest,
	TokenIntrospectionResponse,
	VerifiedToken,
} from "./oauthTypes.js";

export type { TokenVerifierError } from "@/auth/tokenVerifierError.js";

/**
 * OAuth issuer and audience settings used to validate MCP access tokens.
 */
export interface TokenVerifierConfig {
	/**
	 * OAuth authorization server metadata URL or metadata object
	 */
	authServerMetadata: string | OAuthServerMetadata;

	/**
	 * Client ID for introspection endpoint authentication
	 */
	clientId?: string;

	/**
	 * Client secret for introspection endpoint authentication
	 */
	clientSecret?: string;

	/**
	 * Expected audience (resource server URL)
	 */
	expectedAudience: string;

	/**
	 * Required scopes for access
	 */
	requiredScopes?: string[];

	/**
	 * Whether to use token introspection (true) or JWT validation (false)
	 * Default: true
	 */
	useIntrospection?: boolean;
}

interface VerifiedTokenClaims {
	token: string;
	clientId: string;
	scopes: string[];
	expiresAt: number | undefined;
	audience: string | string[] | undefined;
	subject: string | undefined;
}

function createVerifiedToken(claims: VerifiedTokenClaims): VerifiedToken {
	const verifiedToken: VerifiedToken = {
		token: claims.token,
		clientId: claims.clientId,
		scopes: claims.scopes,
	};
	const expiresAt = claims.expiresAt;
	const hasExpiry = expiresAt != null;

	if (hasExpiry) {
		verifiedToken.expiresAt = expiresAt;
	}

	const audience = claims.audience;
	const hasAudience = audience != null;

	if (hasAudience) {
		verifiedToken.audience = audience;
	}

	const subject = claims.subject;
	const hasSubject = subject != null;

	if (hasSubject) {
		verifiedToken.subject = subject;
	}

	return verifiedToken;
}

/**
 * Verifies MCP Bearer tokens using OAuth introspection or JWT validation.
 */
export class TokenVerifier {
	private config: TokenVerifierConfig;
	private metadata: OAuthServerMetadata | null = null;

	constructor(config: TokenVerifierConfig) {
		this.config = config;
	}

	/**
	 * Execute an OAuth verifier HTTP request and return its decoded body.
	 */
	private async requestVerifierData<T>(
		operation: TokenVerifierOperation,
		reason: TokenVerifierErrorReason,
		failureMessage: string,
		options: HttpRequestOptions,
	): Promise<T> {
		try {
			const verifierResponse = await httpRequestEffect<T>(options);
			return verifierResponse.data;
		} catch (cause) {
			throw tokenVerifierError({
				operation,
				reason,
				message: `${failureMessage}: ${describeHttpError(cause)}`,
				cause,
			});
		}
	}

	/**
	 * Initialize the verifier by loading OAuth server metadata.
	 *
	 * @returns Completes after metadata is loaded or assigned.
	 *
	 * @example
	 * ```ts
	 * await verifier.initialize();
	 * ```
	 */
	initialize = async (): Promise<void> => {
		if (typeof this.config.authServerMetadata === "string") {
			this.metadata = await this.requestVerifierData<OAuthServerMetadata>(
				"initialize",
				"metadataRequest",
				"Failed to load OAuth server metadata",
				{
					url: this.config.authServerMetadata,
				},
			);
			return;
		}

		this.metadata = this.config.authServerMetadata;
	};

	/**
	 * Verify an access token.
	 *
	 * @param token - Bearer token received by the MCP HTTP transport.
	 * @returns Verified token claims.
	 *
	 * @example
	 * ```ts
	 * const verified = await verifier.verifyToken(token);
	 * ```
	 */
	verifyToken = async (token: string): Promise<VerifiedToken> => {
		if (!this.metadata) {
			throw tokenVerifierError({
				operation: "verifyToken",
				reason: "notInitialized",
				message: "Token verifier not initialized",
			});
		}

		if (this.config.useIntrospection === false) {
			return await this.verifyViaJWT(token);
		}

		return await this.verifyViaIntrospection(token);
	};

	/**
	 * Verify token using OAuth 2.0 Token Introspection (RFC 7662)
	 */
	private verifyViaIntrospection = async (
		token: string,
	): Promise<VerifiedToken> => {
		if (!this.metadata) {
			throw tokenVerifierError({
				operation: "verifyViaIntrospection",
				reason: "notInitialized",
				message: "Token verifier not initialized",
			});
		}

		// Check if introspection endpoint is available
		const introspectionEndpoint = this.metadata.introspection_endpoint;
		if (!introspectionEndpoint) {
			throw tokenVerifierError({
				operation: "verifyViaIntrospection",
				reason: "missingIntrospectionEndpoint",
				message:
					"Introspection endpoint not available in OAuth server metadata",
			});
		}

		// Prepare introspection request. Client credentials authenticate via HTTP
		// Basic (RFC 7662 §2.1) rather than form body fields.
		const introspectionRequest: TokenIntrospectionRequest = {
			token,
			token_type_hint: "access_token",
		};

		const headers: Record<string, string> = {
			"Content-Type": "application/x-www-form-urlencoded",
		};

		if (this.config.clientId && this.config.clientSecret) {
			headers["Authorization"] = `Basic ${Buffer.from(
				`${this.config.clientId}:${this.config.clientSecret}`,
			).toString("base64")}`;
		}

		const params = new URLSearchParams({
			token: introspectionRequest.token,
		});

		// Make introspection request
		const introspection =
			await this.requestVerifierData<TokenIntrospectionResponse>(
				"verifyViaIntrospection",
				"introspectionRequest",
				"Token introspection failed",
				{
					method: "POST",
					url: introspectionEndpoint,
					body: params,
					headers,
				},
			);

		// Check if token is active
		if (!introspection.active) {
			throw tokenVerifierError({
				operation: "verifyViaIntrospection",
				reason: "inactiveToken",
				message: "Token is not active",
			});
		}

		// Validate audience
		if (!this.validateAudience(introspection.aud)) {
			throw tokenVerifierError({
				operation: "verifyViaIntrospection",
				reason: "invalidAudience",
				message: `Invalid audience. Expected: ${this.config.expectedAudience}, Got: ${introspection.aud}`,
			});
		}

		// Validate scopes
		const scopes = introspection.scope ? introspection.scope.split(" ") : [];
		if (this.config.requiredScopes) {
			const hasRequiredScopes = this.config.requiredScopes.every((scope) =>
				scopes.includes(scope),
			);
			if (!hasRequiredScopes) {
				throw tokenVerifierError({
					operation: "verifyViaIntrospection",
					reason: "missingScopes",
					message: `Missing required scopes. Required: ${this.config.requiredScopes.join(", ")}, Got: ${scopes.join(", ")}`,
				});
			}
		}

		return createVerifiedToken({
			token,
			clientId: introspection.client_id || "missing-client-id",
			scopes,
			expiresAt: introspection.exp,
			audience: introspection.aud,
			subject: introspection.sub,
		});
	};

	/**
	 * Verify token using JWT validation
	 */
	private verifyViaJWT = async (token: string): Promise<VerifiedToken> => {
		if (!this.metadata) {
			throw tokenVerifierError({
				operation: "verifyViaJWT",
				reason: "notInitialized",
				message: "Token verifier not initialized",
			});
		}

		const metadata = this.metadata;
		const jwksUri = metadata.jwks_uri;
		if (!jwksUri) {
			throw tokenVerifierError({
				operation: "verifyViaJWT",
				reason: "missingJwksUri",
				message: "JWKS URI not available in OAuth server metadata",
			});
		}

		let claims: JWTPayload;

		try {
			const remoteJwks = createRemoteJWKSet(new URL(jwksUri));
			const verifiedJwt = await jwtVerify(token, remoteJwks, {
				issuer: metadata.issuer,
				audience: this.config.expectedAudience,
			});
			claims = verifiedJwt.payload;
		} catch (cause) {
			throw tokenVerifierError({
				operation: "verifyViaJWT",
				reason: "jwtVerification",
				message: `JWT verification failed: ${getErrorMessage(cause)}`,
				cause,
			});
		}

		let scopes: string[] = [];
		if (typeof claims["scope"] === "string") {
			scopes = claims["scope"].split(" ");
		} else if (Array.isArray(claims["scope"])) {
			scopes = claims["scope"].filter(
				(scope): scope is string => typeof scope === "string",
			);
		}

		if (this.config.requiredScopes) {
			const hasRequiredScopes = this.config.requiredScopes.every((scope) =>
				scopes.includes(scope),
			);
			if (!hasRequiredScopes) {
				throw tokenVerifierError({
					operation: "verifyViaJWT",
					reason: "missingScopes",
					message: `Missing required scopes. Required: ${this.config.requiredScopes.join(", ")}, Got: ${scopes.join(", ")}`,
				});
			}
		}

		let clientId = "missing-client-id";
		if (typeof claims["client_id"] === "string") {
			clientId = claims["client_id"];
		} else if (typeof claims["azp"] === "string") {
			clientId = claims["azp"];
		}

		return createVerifiedToken({
			token,
			clientId,
			scopes,
			expiresAt: claims.exp,
			audience: claims.aud,
			subject: claims.sub,
		});
	};

	/**
	 * Validate audience claim
	 */
	private validateAudience(audience: string | string[] | undefined): boolean {
		if (!audience) {
			return false;
		}

		const audiences = Array.isArray(audience) ? audience : [audience];
		const normalizedExpected = this.config.expectedAudience.replace(/\/$/, "");

		return audiences.some((aud) => {
			const normalizedAud = aud.replace(/\/$/, "");
			return (
				normalizedAud === normalizedExpected ||
				normalizedAud === normalizedExpected + "/" ||
				normalizedExpected === normalizedAud + "/"
			);
		});
	}
}
