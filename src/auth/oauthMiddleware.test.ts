import type { IncomingHttpHeaders, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type AuthenticatedRequest,
	authenticateBearer,
	requireScopes,
} from "@/auth/oauthMiddleware.js";
import type { VerifiedToken } from "@/auth/oauthTypes.js";
import type { TokenVerifier } from "@/auth/tokenVerifier.js";

const METADATA_URL =
	"http://localhost:3000/.well-known/oauth-protected-resource";

interface CapturedResponse {
	statusCode: number;
	headers: Record<string, string>;
	body: string;
	ended: boolean;
	setHeader(name: string, value: string | number | readonly string[]): void;
	end(chunk?: string): void;
}

function createCapturedResponse(): CapturedResponse {
	const headers: Record<string, string> = {};
	const captured: CapturedResponse = {
		statusCode: 200,
		headers,
		body: "",
		ended: false,
		setHeader(name: string, value: string | number | readonly string[]) {
			headers[name.toLowerCase()] = String(value);
		},
		end(chunk?: string) {
			captured.body = chunk ?? "";
			captured.ended = true;
		},
	};
	return captured;
}

function asServerResponse(captured: CapturedResponse): ServerResponse {
	return captured as unknown as ServerResponse;
}

function createRequest(
	headers: IncomingHttpHeaders,
	auth?: VerifiedToken,
): AuthenticatedRequest {
	const request = { headers } as AuthenticatedRequest;

	if (auth !== undefined) {
		request.auth = auth;
	}

	return request;
}

function readEndedJson(captured: CapturedResponse): unknown {
	return JSON.parse(captured.body);
}

describe("OAuth Middleware", () => {
	describe("authenticateBearer", () => {
		let mockVerifier: TokenVerifier;
		let captured: CapturedResponse;

		beforeEach(() => {
			captured = createCapturedResponse();
			mockVerifier = {
				verifyToken: vi.fn(),
			} as unknown as TokenVerifier;
		});

		it("reject requests without authorization header", async () => {
			const continued = await authenticateBearer(
				createRequest({}),
				asServerResponse(captured),
				{
					verifier: mockVerifier,
					resourceMetadataUrl: METADATA_URL,
					realm: "test-realm",
				},
			);

			expect(continued).toBe(false);
			expect(captured.statusCode).toBe(401);
			expect(captured.headers["www-authenticate"]).toBe(
				`Bearer realm="test-realm", resource_metadata="${METADATA_URL}", error="invalid_token", error_description="No authorization header provided"`,
			);
			expect(readEndedJson(captured)).toEqual({
				error: "invalid_token",
				error_description: "No authorization header provided",
			});
		});

		it("reject invalid authorization header format", async () => {
			const continued = await authenticateBearer(
				createRequest({ authorization: "InvalidFormat token123" }),
				asServerResponse(captured),
				{
					verifier: mockVerifier,
					resourceMetadataUrl: METADATA_URL,
				},
			);

			expect(continued).toBe(false);
			expect(captured.statusCode).toBe(401);
			expect(readEndedJson(captured)).toEqual({
				error: "invalid_token",
				error_description:
					"Invalid authorization header format. Expected: Bearer <token>",
			});
		});

		it("reject authorization header without token", async () => {
			const continued = await authenticateBearer(
				createRequest({ authorization: "Bearer" }),
				asServerResponse(captured),
				{
					verifier: mockVerifier,
					resourceMetadataUrl: METADATA_URL,
				},
			);

			expect(continued).toBe(false);
			expect(captured.statusCode).toBe(401);
			expect(readEndedJson(captured)).toEqual({
				error: "invalid_token",
				error_description:
					"Invalid authorization header format. Expected: Bearer <token>",
			});
		});

		it("verify valid bearer token", async () => {
			const validToken: VerifiedToken = {
				token: "valid-token",
				clientId: "test-client",
				scopes: ["mcp:tools"],
				expiresAt: Date.now() / 1000 + 3600,
				audience: "http://localhost:3000",
				subject: "user123",
			};
			const request = createRequest({ authorization: "Bearer valid-token" });

			(mockVerifier.verifyToken as ReturnType<typeof vi.fn>).mockResolvedValue(
				validToken,
			);

			const continued = await authenticateBearer(
				request,
				asServerResponse(captured),
				{
					verifier: mockVerifier,
					resourceMetadataUrl: METADATA_URL,
				},
			);

			expect(mockVerifier.verifyToken).toHaveBeenCalledWith("valid-token");
			expect(continued).toBe(true);
			expect(request.auth).toEqual(validToken);
			expect(captured.ended).toBe(false);
		});

		it("reject invalid token", async () => {
			(mockVerifier.verifyToken as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error("Token expired"),
			);

			const continued = await authenticateBearer(
				createRequest({ authorization: "Bearer invalid-token" }),
				asServerResponse(captured),
				{
					verifier: mockVerifier,
					resourceMetadataUrl: METADATA_URL,
				},
			);

			expect(continued).toBe(false);
			expect(captured.statusCode).toBe(401);
			expect(readEndedJson(captured)).toEqual({
				error: "invalid_token",
				error_description: "Token expired",
			});
		});

		it("handle verifier errors gracefully", async () => {
			(mockVerifier.verifyToken as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error("Unexpected error"),
			);

			const continued = await authenticateBearer(
				createRequest({ authorization: "Bearer some-token" }),
				asServerResponse(captured),
				{
					verifier: mockVerifier,
					resourceMetadataUrl: METADATA_URL,
				},
			);

			expect(continued).toBe(false);
			expect(captured.statusCode).toBe(401);
			expect(readEndedJson(captured)).toEqual({
				error: "invalid_token",
				error_description: "Unexpected error",
			});
		});
	});

	describe("requireScopes", () => {
		let captured: CapturedResponse;

		beforeEach(() => {
			captured = createCapturedResponse();
		});

		it("reject requests without auth", () => {
			const allowed = requireScopes(
				createRequest({}),
				asServerResponse(captured),
				["mcp:admin"],
			);

			expect(allowed).toBe(false);
			expect(captured.statusCode).toBe(401);
			expect(readEndedJson(captured)).toEqual({
				error: "unauthorized",
				error_description: "No authentication information found",
			});
		});

		it("allow requests with required scopes", () => {
			const allowed = requireScopes(
				createRequest(
					{},
					{
						token: "test-token",
						clientId: "test-client",
						scopes: ["mcp:admin", "mcp:tools"],
						expiresAt: Date.now() / 1000 + 3600,
					},
				),
				asServerResponse(captured),
				["mcp:admin"],
			);

			expect(allowed).toBe(true);
			expect(captured.ended).toBe(false);
			expect(captured.statusCode).toBe(200);
		});

		it("reject requests with insufficient scopes", () => {
			const allowed = requireScopes(
				createRequest(
					{},
					{
						token: "test-token",
						clientId: "test-client",
						scopes: ["mcp:tools"],
						expiresAt: Date.now() / 1000 + 3600,
					},
				),
				asServerResponse(captured),
				["mcp:admin", "mcp:superuser"],
			);

			expect(allowed).toBe(false);
			expect(captured.statusCode).toBe(403);
			expect(readEndedJson(captured)).toEqual({
				error: "insufficient_scope",
				error_description: "Missing required scopes: mcp:admin, mcp:superuser",
				required_scopes: ["mcp:admin", "mcp:superuser"],
				provided_scopes: ["mcp:tools"],
			});
		});

		it("allow requests with all required scopes", () => {
			const allowed = requireScopes(
				createRequest(
					{},
					{
						token: "test-token",
						clientId: "test-client",
						scopes: ["mcp:admin", "mcp:tools", "mcp:read"],
						expiresAt: Date.now() / 1000 + 3600,
					},
				),
				asServerResponse(captured),
				["mcp:admin", "mcp:tools"],
			);

			expect(allowed).toBe(true);
			expect(captured.ended).toBe(false);
		});
	});
});
