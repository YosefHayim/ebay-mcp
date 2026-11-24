import nock from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { OAuthServerMetadata } from "@/auth/oauthTypes.js";
import { TokenVerifier } from "@/auth/tokenVerifier.js";

// All test endpoints live on this origin; nock intercepts native fetch.
const ORIGIN = "http://localhost:8080";
const METADATA_PATH = "/realms/master/.well-known/openid-configuration";
const INTROSPECT_PATH =
	"/realms/master/protocol/openid-connect/token/introspect";
const JWKS_PATH = "/realms/master/protocol/openid-connect/certs";
const TEST_KEY_ID = "test-key";

interface PublishedJwk extends JsonWebKey {
	kid: string;
}

interface SignedAccessToken {
	token: string;
	publicJwk: PublishedJwk;
}

function encodeJwtSegment(fields: Record<string, unknown>): string {
	return Buffer.from(JSON.stringify(fields)).toString("base64url");
}

async function signAccessToken(
	claims: Record<string, unknown>,
): Promise<SignedAccessToken> {
	const rsaModulusLength = 2048;
	const rsaPublicExponent = new Uint8Array([1, 0, 1]);
	const keyPair = await crypto.subtle.generateKey(
		{
			name: "RSASSA-PKCS1-v1_5",
			modulusLength: rsaModulusLength,
			publicExponent: rsaPublicExponent,
			hash: "SHA-256",
		},
		true,
		["sign", "verify"],
	);
	const exportedJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
	const publicJwk: PublishedJwk = {
		...exportedJwk,
		kid: TEST_KEY_ID,
		alg: "RS256",
		use: "sig",
	};

	const headerSegment = encodeJwtSegment({
		alg: "RS256",
		kid: TEST_KEY_ID,
		typ: "JWT",
	});
	const claimsSegment = encodeJwtSegment(claims);
	const signingBytes = new TextEncoder().encode(
		`${headerSegment}.${claimsSegment}`,
	);
	const signature = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5",
		keyPair.privateKey,
		signingBytes,
	);
	const signatureSegment = Buffer.from(signature).toString("base64url");

	return {
		token: `${headerSegment}.${claimsSegment}.${signatureSegment}`,
		publicJwk,
	};
}

async function signWithOtherKey(
	claims: Record<string, unknown>,
): Promise<SignedAccessToken> {
	const signed = await signAccessToken(claims);
	const other = await signAccessToken(claims);

	return {
		token: signed.token,
		publicJwk: other.publicJwk,
	};
}

function stubJsonWebKeySet(publicJwk: JsonWebKey): void {
	nock(ORIGIN)
		.get(JWKS_PATH)
		.reply(200, { keys: [publicJwk] });
}

async function initializeVerifier(verifier: TokenVerifier): Promise<void> {
	await verifier.initialize();
}

async function verifyToken(verifier: TokenVerifier, token: string) {
	return await verifier.verifyToken(token);
}

async function expectVerifierFailure(
	verification: Promise<unknown>,
	message: string | RegExp,
): Promise<void> {
	try {
		await verification;
	} catch (error) {
		const isError = error instanceof Error;

		if (!isError) {
			throw new Error("Expected token verifier to throw an Error");
		}

		const isPattern = message instanceof RegExp;

		if (isPattern) {
			expect(error.message).toMatch(message);
			return;
		}

		expect(error.message).toBe(message);
		return;
	}

	throw new Error("Expected token verifier to fail");
}

describe("TokenVerifier", () => {
	const mockMetadata: OAuthServerMetadata = {
		issuer: "http://localhost:8080/realms/master",
		authorization_endpoint:
			"http://localhost:8080/realms/master/protocol/openid-connect/auth",
		token_endpoint:
			"http://localhost:8080/realms/master/protocol/openid-connect/token",
		jwks_uri: `${ORIGIN}${JWKS_PATH}`,
		introspection_endpoint: `${ORIGIN}${INTROSPECT_PATH}`,
		response_types_supported: ["code"],
	};

	function createJwtClaims(
		claims: Record<string, unknown>,
	): Record<string, unknown> {
		const lifetimeSeconds = 3600;

		return {
			iss: mockMetadata.issuer,
			aud: "http://localhost:3000",
			exp: Math.floor(Date.now() / 1000) + lifetimeSeconds,
			...claims,
		};
	}

	beforeEach(() => {
		nock.disableNetConnect();
	});

	afterEach(() => {
		nock.cleanAll();
		nock.enableNetConnect();
	});

	describe("initialize", () => {
		it("load metadata from URL", async () => {
			const scope = nock(ORIGIN).get(METADATA_PATH).reply(200, mockMetadata);

			const verifier = new TokenVerifier({
				authServerMetadata: `${ORIGIN}${METADATA_PATH}`,
				expectedAudience: "http://localhost:3000",
			});

			await initializeVerifier(verifier);

			expect(scope.isDone()).toBe(true);
		});

		it("use provided metadata object", async () => {
			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
			});

			// No HTTP call is made when metadata is supplied inline.
			await expect(initializeVerifier(verifier)).resolves.toBeUndefined();
			expect(nock.pendingMocks()).toHaveLength(0);
		});

		it("fails if metadata loading fails", async () => {
			nock(ORIGIN).get(METADATA_PATH).reply(500, { error: "server_error" });

			const verifier = new TokenVerifier({
				authServerMetadata: `${ORIGIN}${METADATA_PATH}`,
				expectedAudience: "http://localhost:3000",
			});

			await expectVerifierFailure(
				verifier.initialize(),
				"Failed to load OAuth server metadata: Request failed with status 500",
			);
		});
	});

	describe("verifyToken - introspection", () => {
		it("verify token via introspection", async () => {
			const expectedBasic = `Basic ${Buffer.from("mcp-server:secret").toString("base64")}`;
			nock(ORIGIN)
				.get("/.well-known/openid-configuration")
				.reply(200, mockMetadata);
			nock(ORIGIN)
				.post(INTROSPECT_PATH, (introspectionBody) => {
					// nock parses urlencoded bodies into objects; credentials must not appear here
					const params =
						typeof introspectionBody === "string"
							? Object.fromEntries(new URLSearchParams(introspectionBody))
							: (introspectionBody as Record<string, string>);
					expect(params["token"]).toBe("test-token");
					expect(params["client_id"]).toBeUndefined();
					expect(params["client_secret"]).toBeUndefined();
					return true;
				})
				.matchHeader("Authorization", expectedBasic)
				.matchHeader("Content-Type", "application/x-www-form-urlencoded")
				.reply(200, {
					active: true,
					client_id: "test-client",
					scope: "mcp:tools mcp:admin",
					exp: Math.floor(Date.now() / 1000) + 3600,
					aud: "http://localhost:3000",
					sub: "user123",
				});

			const verifier = new TokenVerifier({
				authServerMetadata: `${ORIGIN}/.well-known/openid-configuration`,
				expectedAudience: "http://localhost:3000",
				clientId: "mcp-server",
				clientSecret: "secret",
				requiredScopes: ["mcp:tools"],
				useIntrospection: true,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, "test-token");

			expect(verifiedToken).toMatchObject({
				token: "test-token",
				clientId: "test-client",
				scopes: ["mcp:tools", "mcp:admin"],
				audience: "http://localhost:3000",
				subject: "user123",
			});
		});

		it("sends client credentials as HTTP Basic auth, not form fields", async () => {
			const clientId = "basic-client";
			const clientSecret = "basic-secret";
			const expectedBasic = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
			let capturedAuth: string | undefined;
			let capturedBody: string | undefined;

			nock(ORIGIN)
				.post(INTROSPECT_PATH, (introspectionBody) => {
					capturedBody =
						typeof introspectionBody === "string"
							? introspectionBody
							: new URLSearchParams(introspectionBody).toString();
					return true;
				})
				.matchHeader("Authorization", (authorizationHeader) => {
					capturedAuth = authorizationHeader;
					return authorizationHeader === expectedBasic;
				})
				.reply(200, {
					active: true,
					client_id: "test-client",
					scope: "mcp:tools",
					aud: "http://localhost:3000",
				});

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				clientId,
				clientSecret,
				useIntrospection: true,
			});

			await initializeVerifier(verifier);
			await verifyToken(verifier, "opaque-token");

			expect(capturedAuth).toBe(expectedBasic);
			expect(capturedBody).toContain("token=opaque-token");
			expect(capturedBody).not.toContain("client_id");
			expect(capturedBody).not.toContain("client_secret");
		});

		it("omits Authorization when client credentials are incomplete", async () => {
			nock(ORIGIN)
				.post(INTROSPECT_PATH)
				.matchHeader(
					"Authorization",
					(authorizationHeader) => authorizationHeader === undefined,
				)
				.reply(200, {
					active: true,
					client_id: "test-client",
					scope: "mcp:tools",
					aud: "http://localhost:3000",
				});

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				clientId: "only-id",
				// clientSecret intentionally omitted
				useIntrospection: true,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, "test-token");
			expect(verifiedToken.token).toBe("test-token");
		});

		it("reject inactive tokens", async () => {
			nock(ORIGIN).post(INTROSPECT_PATH).reply(200, { active: false });

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: true,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken("invalid-token"),
				"Token is not active",
			);
		});

		it("reject tokens with invalid audience", async () => {
			nock(ORIGIN).post(INTROSPECT_PATH).reply(200, {
				active: true,
				aud: "http://different-server:3000",
				scope: "mcp:tools",
			});

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: true,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken("test-token"),
				"Invalid audience. Expected: http://localhost:3000, Got: http://different-server:3000",
			);
		});

		it("reject tokens with missing scopes", async () => {
			nock(ORIGIN).post(INTROSPECT_PATH).reply(200, {
				active: true,
				aud: "http://localhost:3000",
				scope: "mcp:tools",
			});

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				requiredScopes: ["mcp:admin", "mcp:superuser"],
				useIntrospection: true,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken("test-token"),
				"Missing required scopes. Required: mcp:admin, mcp:superuser, Got: mcp:tools",
			);
		});

		it("handle introspection endpoint errors", async () => {
			nock(ORIGIN)
				.post(INTROSPECT_PATH)
				.reply(400, { error_description: "Invalid token" });

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: true,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken("test-token"),
				"Token introspection failed: Invalid token",
			);
		});

		it("fails if introspection endpoint is not available", async () => {
			const metadataWithoutIntrospection = {
				issuer: "http://localhost:8080/realms/master",
				authorization_endpoint:
					"http://localhost:8080/realms/master/protocol/openid-connect/auth",
				token_endpoint:
					"http://localhost:8080/realms/master/protocol/openid-connect/token",
				jwks_uri: `${ORIGIN}${JWKS_PATH}`,
				response_types_supported: ["code"],
			};

			const verifier = new TokenVerifier({
				authServerMetadata: metadataWithoutIntrospection,
				expectedAudience: "http://localhost:3000",
				useIntrospection: true,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken("test-token"),
				"Introspection endpoint not available in OAuth server metadata",
			);
		});
	});

	describe("verifyToken - JWT", () => {
		it("verify token via JWT validation", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					sub: "user123",
					client_id: "test-client",
					scope: "mcp:tools mcp:admin",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				requiredScopes: ["mcp:tools"],
				useIntrospection: false,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, signed.token);

			expect(verifiedToken).toMatchObject({
				token: signed.token,
				clientId: "test-client",
				scopes: ["mcp:tools", "mcp:admin"],
				subject: "user123",
			});
		});

		it("handle scope as array in JWT", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					scope: ["mcp:tools", "mcp:admin"],
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, signed.token);

			expect(verifiedToken.scopes).toEqual(["mcp:tools", "mcp:admin"]);
		});

		it("accepts an audience array that includes the expected audience", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					aud: ["http://localhost:3000", "http://example.com"],
					scope: "mcp:tools",
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, signed.token);

			expect(verifiedToken.audience).toEqual([
				"http://localhost:3000",
				"http://example.com",
			]);
		});

		it("reject JWT with missing scopes", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					scope: "mcp:tools",
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				requiredScopes: ["mcp:admin"],
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken(signed.token),
				"Missing required scopes. Required: mcp:admin, Got: mcp:tools",
			);
		});

		it("fails if JWKS URI is not available", async () => {
			const metadataWithoutJWKS = {
				issuer: "http://localhost:8080/realms/master",
				authorization_endpoint:
					"http://localhost:8080/realms/master/protocol/openid-connect/auth",
				token_endpoint:
					"http://localhost:8080/realms/master/protocol/openid-connect/token",
			};

			const verifier = new TokenVerifier({
				authServerMetadata: metadataWithoutJWKS as OAuthServerMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken("test-token"),
				"JWKS URI not available in OAuth server metadata",
			);
		});

		it("handle JWT verification failures", async () => {
			const signed = await signWithOtherKey(
				createJwtClaims({
					scope: "mcp:tools",
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken(signed.token),
				"JWT verification failed: Invalid signature",
			);
		});

		it("rejects alg none before verifying", async () => {
			const headerSegment = encodeJwtSegment({ alg: "none" });
			const claimsSegment = encodeJwtSegment(
				createJwtClaims({ scope: "mcp:tools" }),
			);
			const signatureSegment = encodeJwtSegment({ n: 1 });
			const token = `${headerSegment}.${claimsSegment}.${signatureSegment}`;

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken(token),
				"JWT verification failed: JWT algorithm must be RS256",
			);
			expect(nock.pendingMocks()).toHaveLength(0);
		});

		it("rejects a JWT whose audience does not match", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					aud: "http://different-server:3000",
					scope: "mcp:tools",
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken(signed.token),
				"JWT verification failed: JWT audience does not match",
			);
		});

		it("rejects a JWT whose issuer does not match", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					iss: "https://evil.example",
					scope: "mcp:tools",
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken(signed.token),
				"JWT verification failed: JWT issuer does not match",
			);
		});

		it("rejects an expired JWT", async () => {
			const expiredSecondsAgo = 10;
			const signed = await signAccessToken(
				createJwtClaims({
					exp: Math.floor(Date.now() / 1000) - expiredSecondsAgo,
					scope: "mcp:tools",
					client_id: "test-client",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);

			await expectVerifierFailure(
				verifier.verifyToken(signed.token),
				"JWT verification failed: JWT has expired",
			);
		});

		it("use azp claim if client_id not present", async () => {
			const signed = await signAccessToken(
				createJwtClaims({
					azp: "authorized-party-client",
					scope: "mcp:tools",
				}),
			);
			stubJsonWebKeySet(signed.publicJwk);

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: false,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, signed.token);

			expect(verifiedToken.clientId).toBe("authorized-party-client");
		});
	});

	describe("validateAudience", () => {
		it("validate audience with trailing slash normalization", async () => {
			nock(ORIGIN).post(INTROSPECT_PATH).reply(200, {
				active: true,
				aud: "http://localhost:3000/",
				scope: "mcp:tools",
			});

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: true,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, "test-token");

			expect(verifiedToken).toBeDefined();
		});

		it("validate audience array", async () => {
			nock(ORIGIN)
				.post(INTROSPECT_PATH)
				.reply(200, {
					active: true,
					aud: ["http://localhost:3000", "http://example.com"],
					scope: "mcp:tools",
				});

			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
				useIntrospection: true,
			});

			await initializeVerifier(verifier);
			const verifiedToken = await verifyToken(verifier, "test-token");

			expect(verifiedToken).toBeDefined();
		});
	});

	describe("verifyToken - not initialized", () => {
		it("fails if verify token is called before initialization", async () => {
			const verifier = new TokenVerifier({
				authServerMetadata: mockMetadata,
				expectedAudience: "http://localhost:3000",
			});

			await expectVerifierFailure(
				verifier.verifyToken("test-token"),
				"Token verifier not initialized",
			);
		});
	});
});
