/**
 * OAuth 2.1 bearer authentication for the HTTP MCP server.
 * Implements RFC 6750 Bearer Token authentication.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { getErrorMessage } from "@/shared/errors.js";
import type { VerifiedToken } from "./oauthTypes.js";
import type { TokenVerifier } from "./tokenVerifier.js";

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

/**
 * Node request with the verified bearer token attached after success.
 */
export interface AuthenticatedRequest extends IncomingMessage {
	/** Verified bearer token attached after authentication succeeds. */
	auth?: VerifiedToken;
}

/**
 * Configuration for MCP Bearer-token authentication.
 */
export interface BearerAuthConfig {
	/**
	 * Token verifier instance
	 */
	verifier: TokenVerifier;

	/**
	 * Protected Resource Metadata URL for WWW-Authenticate header
	 */
	resourceMetadataUrl: string;

	/**
	 * Realm for WWW-Authenticate header
	 */
	realm?: string;
}

interface BearerChallenge {
	error?: string;
	error_description?: string;
	scope?: string;
}

function writeJson(
	response: ServerResponse,
	statusCode: number,
	document: unknown,
): void {
	response.statusCode = statusCode;
	response.setHeader("Content-Type", JSON_CONTENT_TYPE);
	response.end(JSON.stringify(document));
}

function createWwwAuthenticate(
	realm: string,
	resourceMetadataUrl: string,
	challenge: BearerChallenge,
): string {
	const fields = [
		`realm="${realm}"`,
		`resource_metadata="${resourceMetadataUrl}"`,
	];
	const errorCode = challenge.error;
	const hasError = errorCode !== undefined;

	if (hasError) {
		fields.push(`error="${errorCode}"`);
	}

	const errorDescription = challenge.error_description;
	const hasErrorDescription = errorDescription !== undefined;

	if (hasErrorDescription) {
		fields.push(`error_description="${errorDescription}"`);
	}

	const scope = challenge.scope;
	const hasScope = scope !== undefined;

	if (hasScope) {
		fields.push(`scope="${scope}"`);
	}

	return `Bearer ${fields.join(", ")}`;
}

function writeUnauthorized(
	response: ServerResponse,
	realm: string,
	resourceMetadataUrl: string,
	challenge: BearerChallenge,
): void {
	response.setHeader(
		"WWW-Authenticate",
		createWwwAuthenticate(realm, resourceMetadataUrl, challenge),
	);
	writeJson(response, 401, {
		error: challenge.error ?? "unauthorized",
		error_description: challenge.error_description ?? "Authorization required",
	});
}

function readBearerToken(authorization: string): string | undefined {
	const parts = authorization.split(" ");
	const hasTwoParts = parts.length === 2;

	if (!hasTwoParts) {
		return undefined;
	}

	const isBearerScheme = parts[0] === "Bearer";

	if (!isBearerScheme) {
		return undefined;
	}

	const token = parts[1];
	const isTokenMissing = token === undefined;

	if (isTokenMissing) {
		return undefined;
	}

	const isTokenEmpty = token === "";

	if (isTokenEmpty) {
		return undefined;
	}

	return token;
}

/**
 * Verify a bearer token and attach it to the request.
 *
 * @returns True when the request may continue.
 */
export async function authenticateBearer(
	request: AuthenticatedRequest,
	response: ServerResponse,
	bearerConfig: BearerAuthConfig,
): Promise<boolean> {
	const realm = bearerConfig.realm ?? "mcp";
	const authorization = request.headers.authorization ?? "";
	const isAuthorizationMissing = authorization === "";

	if (isAuthorizationMissing) {
		writeUnauthorized(response, realm, bearerConfig.resourceMetadataUrl, {
			error: "invalid_token",
			error_description: "No authorization header provided",
		});
		return false;
	}

	const token = readBearerToken(authorization);

	if (token === undefined) {
		writeUnauthorized(response, realm, bearerConfig.resourceMetadataUrl, {
			error: "invalid_token",
			error_description:
				"Invalid authorization header format. Expected: Bearer <token>",
		});
		return false;
	}

	let verified: VerifiedToken;

	try {
		verified = await bearerConfig.verifier.verifyToken(token);
	} catch (error) {
		writeUnauthorized(response, realm, bearerConfig.resourceMetadataUrl, {
			error: "invalid_token",
			error_description: getErrorMessage(error, "Token verification failed"),
		});
		return false;
	}

	request.auth = verified;
	return true;
}

/**
 * Reject the request when the verified token is missing a required scope.
 *
 * @returns True when every required scope is present.
 */
export function requireScopes(
	request: AuthenticatedRequest,
	response: ServerResponse,
	requiredScopes: string[],
): boolean {
	const auth = request.auth;

	if (auth === undefined) {
		writeJson(response, 401, {
			error: "unauthorized",
			error_description: "No authentication information found",
		});
		return false;
	}

	const providedScopes = auth.scopes;

	function isScopeMissing(scope: string): boolean {
		return providedScopes.includes(scope) === false;
	}

	const isMissingScope = requiredScopes.some(isScopeMissing);

	if (isMissingScope) {
		writeJson(response, 403, {
			error: "insufficient_scope",
			error_description: `Missing required scopes: ${requiredScopes.join(", ")}`,
			required_scopes: requiredScopes,
			provided_scopes: providedScopes,
		});
		return false;
	}

	return true;
}
