import { getErrorMessage } from "@/shared/errors.js";
import {
	describeHttpError,
	type HttpRequestOptions,
	type HttpResponse,
	httpRequestEffect,
	readHttpFailureMessage,
} from "@/shared/http.js";
import { isRecord } from "@/shared/typeGuards.js";
import type {
	OAuthServerMetadata,
	TokenIntrospectionRequest,
	TokenIntrospectionResponse,
	VerifiedToken,
} from "./oauthTypes.js";

export interface TokenVerifierConfig {
	authServerMetadata: string | OAuthServerMetadata;

	clientId?: string;

	clientSecret?: string;

	expectedAudience: string;

	requiredScopes?: string[];

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

interface CompactJwt {
	headerSegment: string;
	claimsSegment: string;
	signatureSegment: string;
}

interface JwtHeader {
	alg: "RS256";
	kid: string | undefined;
}

interface JwtClaims {
	iss: unknown;
	exp: unknown;
	aud: unknown;
	sub: unknown;
	scope: unknown;
	client_id: unknown;
	azp: unknown;
}

interface JwtCheck {
	token: string;
	jwksUri: string;
	issuer: string;
	expectedAudience: string | null | undefined;
}

interface VerificationKey {
	jwk: JsonWebKey;
	kid: string | undefined;
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

function isOutsideSuccessStatus(status: number): boolean {
	const minimumSuccessStatus = 200;
	const isBelowSuccess = status < minimumSuccessStatus;

	if (isBelowSuccess) {
		return true;
	}

	const maximumSuccessStatus = 299;

	return status > maximumSuccessStatus;
}

function isStringClaim(claim: unknown): claim is string {
	return typeof claim == "string";
}

function isBase64UrlSegment(segment: string): boolean {
	const isEmpty = segment.length == 0;

	if (isEmpty) {
		return false;
	}

	const base64GroupSize = 4;
	const remainder = segment.length % base64GroupSize;
	const impossibleRemainder = 1;
	const isImpossibleLength = remainder == impossibleRemainder;

	if (isImpossibleLength) {
		return false;
	}

	const base64UrlAlphabet =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

	for (const character of segment) {
		const isAllowed = base64UrlAlphabet.includes(character);
		const isIllegal = !isAllowed;

		if (isIllegal) {
			return false;
		}
	}

	return true;
}

function readSegment(segments: string[], index: number): string {
	const segment = segments[index];
	const isMissing = segment === undefined;

	if (isMissing) {
		throw new Error("JWT must have three base64url segments");
	}

	const isBase64Url = isBase64UrlSegment(segment);

	if (!isBase64Url) {
		throw new Error("JWT must have three base64url segments");
	}

	return segment;
}

function splitCompactJwt(token: string): CompactJwt {
	const segments = token.split(".");
	const compactSegmentCount = 3;
	const hasThreeSegments = segments.length == compactSegmentCount;

	if (!hasThreeSegments) {
		throw new Error("JWT must have three base64url segments");
	}

	const headerIndex = 0;
	const claimsIndex = 1;
	const signatureIndex = 2;

	return {
		headerSegment: readSegment(segments, headerIndex),
		claimsSegment: readSegment(segments, claimsIndex),
		signatureSegment: readSegment(segments, signatureIndex),
	};
}

function requireObject(
	parsed: unknown,
	label: string,
): Record<string, unknown> {
	const isObject = isRecord(parsed);

	if (isObject) {
		return parsed;
	}

	throw new Error(`${label} is not an object`);
}

function readObjectSegment(
	encodedSegment: string,
	label: string,
): Record<string, unknown> {
	const decodedSegment = Buffer.from(encodedSegment, "base64url").toString(
		"utf8",
	);
	var parsed: unknown;

	try {
		parsed = JSON.parse(decodedSegment);
	} catch (cause) {
		throw new Error(`${label} is not JSON`, { cause });
	}

	return requireObject(parsed, label);
}

function readKeyId(headerFields: Record<string, unknown>): string | undefined {
	const keyId = headerFields["kid"];
	const isMissing = keyId === undefined;

	if (isMissing) {
		return undefined;
	}

	const isKeyId = typeof keyId == "string";
	const isNotKeyId = !isKeyId;

	if (isNotKeyId) {
		throw new Error("JWT kid must be a string");
	}

	const isEmpty = keyId == "";

	if (isEmpty) {
		throw new Error("JWT kid must be a string");
	}

	return keyId;
}

function readJwtHeader(headerSegment: string): JwtHeader {
	const headerFields = readObjectSegment(headerSegment, "JWT header");
	const isRs256 = headerFields["alg"] === "RS256";
	const isNotRs256 = !isRs256;

	if (isNotRs256) {
		throw new Error("JWT algorithm must be RS256");
	}

	return {
		alg: "RS256",
		kid: readKeyId(headerFields),
	};
}

function hasRejectedAlgorithm(algorithm: unknown): boolean {
	const isMissing = algorithm === undefined;

	if (isMissing) {
		return false;
	}

	return algorithm !== "RS256";
}

function hasRejectedUse(use: unknown): boolean {
	const isMissing = use === undefined;

	if (isMissing) {
		return false;
	}

	return use !== "sig";
}

function readPublicRsaJwk(key: unknown): VerificationKey | null {
	const isKeyRecord = isRecord(key);
	const isNotKeyRecord = !isKeyRecord;

	if (isNotKeyRecord) {
		return null;
	}

	const isRsa = key["kty"] === "RSA";
	const isNotRsa = !isRsa;

	if (isNotRsa) {
		return null;
	}

	const modulus = key["n"];
	const isModulus = typeof modulus == "string";
	const isNotModulus = !isModulus;

	if (isNotModulus) {
		return null;
	}

	const exponent = key["e"];
	const isExponent = typeof exponent == "string";
	const isNotExponent = !isExponent;

	if (isNotExponent) {
		return null;
	}

	const rejectsAlgorithm = hasRejectedAlgorithm(key["alg"]);

	if (rejectsAlgorithm) {
		return null;
	}

	const rejectsUse = hasRejectedUse(key["use"]);

	if (rejectsUse) {
		return null;
	}

	return {
		jwk: {
			kty: "RSA",
			n: modulus,
			e: exponent,
			alg: "RS256",
			key_ops: ["verify"],
		},
		kid: readKeyId(key),
	};
}

function isVerificationKey(
	key: VerificationKey | null,
): key is VerificationKey {
	return key !== null;
}

async function fetchVerificationKeys(
	jwksUri: string,
): Promise<VerificationKey[]> {
	var jwksReply: Response;

	try {
		jwksReply = await fetch(jwksUri);
	} catch (cause) {
		throw new Error("Failed to fetch JWKS", { cause });
	}

	const isSuccess = jwksReply.ok;
	const isNotSuccess = !isSuccess;

	if (isNotSuccess) {
		throw new Error(`JWKS request failed with status ${jwksReply.status}`);
	}

	var jwksDocument: unknown;

	try {
		jwksDocument = await jwksReply.json();
	} catch (cause) {
		throw new Error("JWKS response is not JSON", { cause });
	}

	const document = requireObject(jwksDocument, "JWKS response");
	const listedKeys = document["keys"];
	const hasKeyList = Array.isArray(listedKeys);
	const hasNoKeyList = !hasKeyList;

	if (hasNoKeyList) {
		throw new Error("JWKS response has no keys");
	}

	return listedKeys.map(readPublicRsaJwk).filter(isVerificationKey);
}

function findKeyById(keys: VerificationKey[], keyId: string): VerificationKey {
	function keyHasId(key: VerificationKey): boolean {
		return key.kid == keyId;
	}

	const matchedKey = keys.find(keyHasId);
	const isMissing = matchedKey === undefined;

	if (isMissing) {
		throw new Error("No JWK matches the JWT kid");
	}

	return matchedKey;
}

function pickVerificationKey(
	keys: VerificationKey[],
	keyId: string | undefined,
): VerificationKey {
	const hasKeyId = keyId !== undefined;

	if (hasKeyId) {
		return findKeyById(keys, keyId);
	}

	const singleKeyCount = 1;
	const isSingleKey = keys.length == singleKeyCount;
	const isNotSingleKey = !isSingleKey;

	if (isNotSingleKey) {
		throw new Error("JWT has no kid and JWKS does not contain exactly one key");
	}

	const onlyKey = keys[0];
	const isMissing = onlyKey === undefined;

	if (isMissing) {
		throw new Error("JWKS response has no keys");
	}

	return onlyKey;
}

async function importVerificationKey(
	publicJwk: JsonWebKey,
): Promise<CryptoKey> {
	try {
		return await crypto.subtle.importKey(
			"jwk",
			publicJwk,
			{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
			false,
			["verify"],
		);
	} catch (cause) {
		throw new Error("JWKS key could not be imported", { cause });
	}
}

async function verifyRs256Signature(
	publicJwk: JsonWebKey,
	signingInput: string,
	signatureSegment: string,
): Promise<void> {
	const publicKey = await importVerificationKey(publicJwk);
	const signingBytes = new TextEncoder().encode(signingInput);
	const signatureBytes = Buffer.from(signatureSegment, "base64url");
	var isSignatureValid: boolean;

	try {
		isSignatureValid = await crypto.subtle.verify(
			"RSASSA-PKCS1-v1_5",
			publicKey,
			signatureBytes,
			signingBytes,
		);
	} catch (cause) {
		throw new Error("JWT signature could not be verified", { cause });
	}

	const isSignatureRejected = isSignatureValid == false;

	if (isSignatureRejected) {
		throw new Error("Invalid signature");
	}
}

function readJwtClaims(claimsSegment: string): JwtClaims {
	const fields = readObjectSegment(claimsSegment, "JWT claims");

	return {
		iss: fields["iss"],
		exp: fields["exp"],
		aud: fields["aud"],
		sub: fields["sub"],
		scope: fields["scope"],
		client_id: fields["client_id"],
		azp: fields["azp"],
	};
}

function assertNotExpired(claims: JwtClaims, nowSeconds: number): void {
	const expiry = claims.exp;
	const hasExpiry = typeof expiry == "number";
	const hasNoExpiry = !hasExpiry;

	if (hasNoExpiry) {
		return;
	}

	const isExpired = nowSeconds >= expiry;

	if (isExpired) {
		throw new Error("JWT has expired");
	}
}

function assertIssuer(claims: JwtClaims, issuer: string): void {
	const isExpectedIssuer = claims.iss === issuer;

	if (isExpectedIssuer) {
		return;
	}

	throw new Error("JWT issuer does not match");
}

function isNonEmptyAudience(
	expectedAudience: string | null | undefined,
): expectedAudience is string {
	const isNull = expectedAudience === null;

	if (isNull) {
		return false;
	}

	const isUndefined = expectedAudience === undefined;

	if (isUndefined) {
		return false;
	}

	return expectedAudience != "";
}

function audienceIncludes(
	audienceClaim: unknown,
	expectedAudience: string,
): boolean {
	const isSingleAudience = typeof audienceClaim == "string";

	if (isSingleAudience) {
		return audienceClaim == expectedAudience;
	}

	const isAudienceList = Array.isArray(audienceClaim);

	if (isAudienceList) {
		return audienceClaim.includes(expectedAudience);
	}

	return false;
}

function assertAudience(
	claims: JwtClaims,
	expectedAudience: string | null | undefined,
): void {
	const shouldCheckAudience = isNonEmptyAudience(expectedAudience);
	const shouldSkipAudience = !shouldCheckAudience;

	if (shouldSkipAudience) {
		return;
	}

	const isAccepted = audienceIncludes(claims.aud, expectedAudience);

	if (isAccepted) {
		return;
	}

	throw new Error("JWT audience does not match");
}

async function readVerifiedJwtClaims(check: JwtCheck): Promise<JwtClaims> {
	const compactJwt = splitCompactJwt(check.token);
	const header = readJwtHeader(compactJwt.headerSegment);
	const verificationKeys = await fetchVerificationKeys(check.jwksUri);
	const verificationKey = pickVerificationKey(verificationKeys, header.kid);
	const signingInput = `${compactJwt.headerSegment}.${compactJwt.claimsSegment}`;

	await verifyRs256Signature(
		verificationKey.jwk,
		signingInput,
		compactJwt.signatureSegment,
	);

	const claims = readJwtClaims(compactJwt.claimsSegment);
	const millisecondsPerSecond = 1000;
	const nowSeconds = Date.now() / millisecondsPerSecond;
	assertNotExpired(claims, nowSeconds);
	assertIssuer(claims, check.issuer);
	assertAudience(claims, check.expectedAudience);

	return claims;
}

function readScopes(claims: JwtClaims): string[] {
	const scopeClaim = claims.scope;
	const isScopeString = typeof scopeClaim == "string";

	if (isScopeString) {
		return scopeClaim.split(" ");
	}

	const isScopeList = Array.isArray(scopeClaim);

	if (isScopeList) {
		return scopeClaim.filter(isStringClaim);
	}

	return [];
}

function readClientId(claims: JwtClaims): string {
	const clientId = claims.client_id;
	const hasClientId = typeof clientId == "string";

	if (hasClientId) {
		return clientId;
	}

	const authorizedParty = claims.azp;
	const hasAuthorizedParty = typeof authorizedParty == "string";

	if (hasAuthorizedParty) {
		return authorizedParty;
	}

	return "missing-client-id";
}

function readOptionalNumber(claim: unknown): number | undefined {
	const isNumber = typeof claim == "number";

	if (isNumber) {
		return claim;
	}

	return undefined;
}

function readOptionalString(claim: unknown): string | undefined {
	const isString = typeof claim == "string";

	if (isString) {
		return claim;
	}

	return undefined;
}

function readAudienceList(audienceList: unknown[]): string[] | undefined {
	const audienceParts = audienceList.filter(isStringClaim);
	const keptEveryPart = audienceParts.length == audienceList.length;

	if (keptEveryPart) {
		return audienceParts;
	}

	return undefined;
}

function readOptionalAudience(claim: unknown): string | string[] | undefined {
	const isSingleAudience = typeof claim == "string";

	if (isSingleAudience) {
		return claim;
	}

	const isAudienceList = Array.isArray(claim);

	if (isAudienceList) {
		return readAudienceList(claim);
	}

	return undefined;
}

export class TokenVerifier {
	private config: TokenVerifierConfig;
	private metadata: OAuthServerMetadata | null = null;

	constructor(config: TokenVerifierConfig) {
		this.config = config;
	}

	private requestVerifierData = async <T>(
		failureMessage: string,
		options: HttpRequestOptions,
	): Promise<T> => {
		var verifierResponse: HttpResponse<T>;

		try {
			verifierResponse = await httpRequestEffect<T>(options);
		} catch (cause) {
			throw new Error(`${failureMessage}: ${describeHttpError(cause)}`, {
				cause,
			});
		}

		const isFailedStatus = isOutsideSuccessStatus(verifierResponse.status);

		if (isFailedStatus) {
			const detail = readHttpFailureMessage(
				verifierResponse.data,
				`Request failed with status ${verifierResponse.status}`,
			);
			throw new Error(`${failureMessage}: ${detail}`);
		}

		return verifierResponse.data;
	};

	initialize = async (): Promise<void> => {
		if (typeof this.config.authServerMetadata == "string") {
			this.metadata = await this.requestVerifierData<OAuthServerMetadata>(
				"Failed to load OAuth server metadata",
				{
					url: this.config.authServerMetadata,
				},
			);
			return;
		}

		this.metadata = this.config.authServerMetadata;
	};

	verifyToken = async (token: string): Promise<VerifiedToken> => {
		if (!this.metadata) {
			throw new Error("Token verifier not initialized");
		}

		if (this.config.useIntrospection == false) {
			return await this.verifyViaJWT(token);
		}

		return await this.verifyViaIntrospection(token);
	};

	private verifyViaIntrospection = async (
		token: string,
	): Promise<VerifiedToken> => {
		if (!this.metadata) {
			throw new Error("Token verifier not initialized");
		}

		// Check if introspection endpoint is available
		const introspectionEndpoint = this.metadata.introspection_endpoint;
		if (!introspectionEndpoint) {
			throw new Error(
				"Introspection endpoint not available in OAuth server metadata",
			);
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

		const clientId = this.config.clientId;
		const clientSecret = this.config.clientSecret;

		function readBasicAuthorization(): string | null {
			const hasNoClientId = !clientId;

			if (hasNoClientId) {
				return null;
			}

			const hasNoClientSecret = !clientSecret;

			if (hasNoClientSecret) {
				return null;
			}

			const credentials = `${clientId}:${clientSecret}`;
			const encodedCredentials = Buffer.from(credentials).toString("base64");

			return `Basic ${encodedCredentials}`;
		}

		const basicAuthorization = readBasicAuthorization();
		const hasBasicAuthorization = basicAuthorization != null;

		if (hasBasicAuthorization) {
			headers["Authorization"] = basicAuthorization;
		}

		const params = new URLSearchParams({
			token: introspectionRequest.token,
		});

		// Make introspection request
		const introspection =
			await this.requestVerifierData<TokenIntrospectionResponse>(
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
			throw new Error("Token is not active");
		}

		// Validate audience
		if (!this.validateAudience(introspection.aud)) {
			throw new Error(
				`Invalid audience. Expected: ${this.config.expectedAudience}, Got: ${introspection.aud}`,
			);
		}

		// Validate scopes
		const scopes = introspection.scope ? introspection.scope.split(" ") : [];
		if (this.config.requiredScopes) {
			const hasRequiredScopes = this.config.requiredScopes.every((scope) =>
				scopes.includes(scope),
			);
			if (!hasRequiredScopes) {
				throw new Error(
					`Missing required scopes. Required: ${this.config.requiredScopes.join(", ")}, Got: ${scopes.join(", ")}`,
				);
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

	private verifyViaJWT = async (token: string): Promise<VerifiedToken> => {
		if (!this.metadata) {
			throw new Error("Token verifier not initialized");
		}

		const metadata = this.metadata;
		const jwksUri = metadata.jwks_uri;

		if (!jwksUri) {
			throw new Error("JWKS URI not available in OAuth server metadata");
		}

		var claims: JwtClaims;

		try {
			claims = await readVerifiedJwtClaims({
				token,
				jwksUri,
				issuer: metadata.issuer,
				expectedAudience: this.config.expectedAudience,
			});
		} catch (cause) {
			throw new Error(`JWT verification failed: ${getErrorMessage(cause)}`, {
				cause,
			});
		}

		const scopes = readScopes(claims);
		const requiredScopes = this.config.requiredScopes;
		const hasRequiredList = requiredScopes !== undefined;

		if (hasRequiredList) {
			function scopeIsHeld(scope: string): boolean {
				return scopes.includes(scope);
			}

			const holdsRequiredScopes = requiredScopes.every(scopeIsHeld);
			const isMissingScopes = !holdsRequiredScopes;

			if (isMissingScopes) {
				throw new Error(
					`Missing required scopes. Required: ${requiredScopes.join(", ")}, Got: ${scopes.join(", ")}`,
				);
			}
		}

		return createVerifiedToken({
			token,
			clientId: readClientId(claims),
			scopes,
			expiresAt: readOptionalNumber(claims.exp),
			audience: readOptionalAudience(claims.aud),
			subject: readOptionalString(claims.sub),
		});
	};

	private validateAudience = (
		audience: string | string[] | undefined,
	): boolean => {
		if (!audience) {
			return false;
		}

		const audiences = Array.isArray(audience) ? audience : [audience];
		const normalizedExpected = this.config.expectedAudience.replace(/\/$/, "");

		function isExpectedAudience(candidateAudience: string): boolean {
			const normalizedAud = candidateAudience.replace(/\/$/, "");

			const audienceIsExpected = normalizedAud == normalizedExpected;

			if (audienceIsExpected) {
				return true;
			}

			const audienceIsExpectedWithSlash =
				normalizedAud == normalizedExpected + "/";

			if (audienceIsExpectedWithSlash) {
				return true;
			}

			const expectedIsAudienceWithSlash =
				normalizedExpected == normalizedAud + "/";

			if (expectedIsAudienceWithSlash) {
				return true;
			}

			return false;
		}

		return audiences.some(isExpectedAudience);
	};
}
