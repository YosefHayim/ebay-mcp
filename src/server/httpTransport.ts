import { randomUUID } from "node:crypto";
import {
	createServer,
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from "node:http";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
	type Implementation,
	isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";
import {
	getProtectedResourceMetadataUrl,
	type MetadataConfig,
	serveMetadataRoute,
} from "@/auth/oauthMetadata.js";
import {
	type AuthenticatedRequest,
	authenticateBearer,
} from "@/auth/oauthMiddleware.js";
import {
	TokenVerifier,
	type TokenVerifierConfig,
} from "@/auth/tokenVerifier.js";
import { createEbayMcpRuntime } from "@/server/runtime.js";
import type { EbayConfig } from "@/shared/ebay.js";
import { getDefaultScopes, getEbayConfig } from "@/shared/environment.js";
import { getErrorMessage } from "@/shared/errors.js";
import { serverLogger } from "@/shared/logger.js";
import { getVersion } from "@/shared/version.js";

/**
 * OAuth settings for protecting the HTTP MCP transport.
 */
export interface HttpOAuthConfig {
	/** OAuth authorization server issuer/base URL. */
	authServerUrl: string;
	/** Optional client ID used for token introspection. */
	clientId?: string | undefined;
	/** Optional client secret used for token introspection. */
	clientSecret?: string | undefined;
	/** OAuth scopes required to access MCP tools over HTTP. */
	requiredScopes: string[];
	/** Whether bearer tokens are validated through introspection. */
	useIntrospection: boolean;
}

/**
 * Runtime configuration for the HTTP MCP server.
 */
export interface HttpTransportConfig {
	/** Enables OAuth bearer-token middleware when true. */
	authEnabled: boolean;
	/** Browser origins allowed to call the server cross-origin. */
	corsOrigins: (string | RegExp)[];
	/** Optional eBay config override used by tests and embedded callers. */
	ebayConfig?: EbayConfig;
	/** Host interface for the HTTP server. */
	host: string;
	/** OAuth protection settings for the HTTP transport. */
	oauth: HttpOAuthConfig;
	/** TCP port for the HTTP server. */
	port: number;
	/**
	 * Optional static bearer token. When set, HTTP MCP routes require
	 * `Authorization: Bearer <token>` and skip the OAuth token verifier.
	 */
	staticAuthToken?: string | undefined;
}

const LOOPBACK_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

const parseCorsOrigins = (value: string | undefined): (string | RegExp)[] => {
	const origins = (value || "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
	if (origins.length === 0) {
		return [LOOPBACK_ORIGIN];
	}
	return origins;
};

/**
 * Build HTTP transport configuration from process environment variables.
 *
 * @param env - Environment object to read transport and OAuth settings from.
 * @returns HTTP transport config with defaults filled in.
 *
 * @example
 * ```ts
 * const config = createHttpTransportConfigFromEnv(process.env);
 * ```
 */
export const createHttpTransportConfigFromEnv = (
	env: NodeJS.ProcessEnv,
): HttpTransportConfig => ({
	// Cloud platforms (Railway, Render, Fly, etc.) inject PORT; bind all interfaces
	// by default so the container is reachable unless MCP_HOST is set explicitly.
	host: env["MCP_HOST"] || (env["PORT"] ? "0.0.0.0" : "localhost"),
	port: Number(env["MCP_PORT"]) || Number(env["PORT"]) || 3000,
	oauth: {
		authServerUrl:
			env["OAUTH_AUTH_SERVER_URL"] ?? "http://localhost:8080/realms/master",
		clientId: env["OAUTH_CLIENT_ID"],
		clientSecret: env["OAUTH_CLIENT_SECRET"],
		requiredScopes: (env["OAUTH_REQUIRED_SCOPES"] || "mcp:tools")
			.split(",")
			.map((scope) => scope.trim()),
		useIntrospection: env["OAUTH_USE_INTROSPECTION"] !== "false",
	},
	authEnabled: env["OAUTH_ENABLED"] !== "false",
	corsOrigins: parseCorsOrigins(env["MCP_CORS_ORIGINS"]),
	staticAuthToken: env["MCP_AUTH_TOKEN"],
});

/**
 * Build the public server URL used for MCP metadata and OAuth audience checks.
 *
 * @param config - HTTP host and port values.
 * @returns Public HTTP server URL.
 *
 * @example
 * ```ts
 * const url = getHttpServerUrl({ host: 'localhost', port: 3000 });
 * ```
 */
export const getHttpServerUrl = (
	config: Pick<HttpTransportConfig, "host" | "port">,
): string => `http://${config.host}:${config.port}`;

/**
 * Resolve the OAuth authorization-server metadata endpoint for the configured issuer.
 *
 * @param config - HTTP OAuth config containing the authorization server URL.
 * @returns Well-known OAuth/OIDC metadata URL for the issuer.
 *
 * @example
 * ```ts
 * const metadataUrl = getAuthServerMetadataUrl({ oauth: config.oauth });
 * ```
 */
export const getAuthServerMetadataUrl = (
	config: Pick<HttpTransportConfig, "oauth">,
): string => {
	const baseUrl = config.oauth.authServerUrl;

	if (baseUrl.includes("/realms/")) {
		return `${baseUrl}/.well-known/openid-configuration`;
	}

	return `${baseUrl}/.well-known/oauth-authorization-server`;
};

function createServerConfig(): Implementation {
	return {
		name: "ebay-mcp",
		version: getVersion(),
		title: "eBay API MCP Server",
		websiteUrl: "https://github.com/YosefHayim/ebay-mcp",
	};
}

async function createMcpServer(): Promise<McpServer> {
	const runtime = createEbayMcpRuntime({
		serverConfig: createServerConfig(),
	});

	try {
		await runtime.initializeApi();
	} catch (error) {
		const message = getErrorMessage(error, String(error));
		serverLogger.error(`Failed to initialize eBay API client: ${message}`);
		throw error;
	}

	return runtime.server;
}

function createTokenVerifierConfig(
	config: HttpTransportConfig,
	serverUrl: string,
): TokenVerifierConfig {
	const verifierConfig: TokenVerifierConfig = {
		authServerMetadata: getAuthServerMetadataUrl(config),
		expectedAudience: serverUrl,
		requiredScopes: config.oauth.requiredScopes,
		useIntrospection: config.oauth.useIntrospection,
	};
	const clientId = config.oauth.clientId;

	if (clientId != null) {
		verifierConfig.clientId = clientId;
	}

	const clientSecret = config.oauth.clientSecret;

	if (clientSecret != null) {
		verifierConfig.clientSecret = clientSecret;
	}

	return verifierConfig;
}

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

type JsonBody =
	| { kind: "absent" }
	| { kind: "parsed"; parsedBody: unknown }
	| { kind: "invalid" }
	| { kind: "too_large" };

type BodyRead = { kind: "ready"; parsedBody: unknown } | { kind: "rejected" };

type AllowHttpRequest = (
	request: AuthenticatedRequest,
	response: ServerResponse,
) => Promise<boolean>;

interface HttpRouteContext {
	allowRequest: AllowHttpRequest;
	authEnabled: boolean;
	corsOrigins: readonly (string | RegExp)[];
	metadata: MetadataConfig;
	transports: Map<string, StreamableHTTPServerTransport>;
}

function createSessionId(): string {
	return randomUUID();
}

function copyChunk(chunk: Buffer | string): Buffer {
	if (typeof chunk === "string") {
		return Buffer.from(chunk);
	}

	return chunk;
}

function readRequestPath(requestUrl: string | undefined): string {
	const pathToRead = requestUrl ?? "/";

	try {
		const parsedUrl = new URL(pathToRead, "http://127.0.0.1");
		return parsedUrl.pathname;
	} catch {
		return "/";
	}
}

function readHeaderValue(request: IncomingMessage, name: string): string {
	const header = request.headers[name];

	if (typeof header === "string") {
		return header;
	}

	if (Array.isArray(header)) {
		return header.join(", ");
	}

	return "";
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

function writeNotFound(response: ServerResponse): void {
	writeJson(response, 404, {
		error: "not_found",
		error_description: "Not found",
	});
}

function writeInvalidSession(response: ServerResponse): void {
	writeJson(response, 400, {
		error: "invalid_session",
		error_description: "Invalid or missing session ID",
	});
}

function writeMissingSession(response: ServerResponse): void {
	writeJson(response, 400, {
		jsonrpc: "2.0",
		error: {
			code: -32_000,
			message: "Bad Request: No valid session ID provided",
		},
		id: null,
	});
}

function writeHealth(response: ServerResponse, authEnabled: boolean): void {
	writeJson(response, 200, {
		status: "healthy",
		timestamp: new Date().toISOString(),
		oauth_enabled: authEnabled,
	});
}

function allowStaticToken(
	request: IncomingMessage,
	response: ServerResponse,
	staticToken: string,
): boolean {
	const authorization = readHeaderValue(request, "authorization");
	const isMatch = authorization === `Bearer ${staticToken}`;

	if (isMatch) {
		return true;
	}

	writeJson(response, 401, {
		error: "unauthorized",
		error_description: "Missing or invalid bearer token",
	});
	return false;
}

async function createHttpAuthorizer(
	config: HttpTransportConfig,
	serverUrl: string,
): Promise<AllowHttpRequest> {
	const staticToken = config.staticAuthToken ?? "";
	const hasStaticToken = staticToken !== "";

	if (hasStaticToken) {
		serverLogger.info("Static bearer auth enabled via MCP_AUTH_TOKEN.");

		async function allowStaticBearer(
			request: AuthenticatedRequest,
			response: ServerResponse,
		): Promise<boolean> {
			return allowStaticToken(request, response, staticToken);
		}

		return allowStaticBearer;
	}

	if (config.authEnabled === false) {
		serverLogger.warn(
			"OAuth is disabled. Server running in unauthenticated mode.",
		);

		async function allowOpenRequest(): Promise<boolean> {
			return true;
		}

		return allowOpenRequest;
	}

	serverLogger.info("Initializing OAuth token verifier...");

	const tokenVerifier = new TokenVerifier(
		createTokenVerifierConfig(config, serverUrl),
	);

	try {
		await tokenVerifier.initialize();
	} catch (error) {
		serverLogger.error("Failed to initialize token verifier", {
			error: getErrorMessage(error, String(error)),
		});
		throw error;
	}

	serverLogger.info("Token verifier initialized");

	const resourceMetadataUrl = getProtectedResourceMetadataUrl(serverUrl);

	async function allowOAuthBearer(
		request: AuthenticatedRequest,
		response: ServerResponse,
	): Promise<boolean> {
		return authenticateBearer(request, response, {
			verifier: tokenVerifier,
			resourceMetadataUrl,
			realm: "ebay-mcp",
		});
	}

	return allowOAuthBearer;
}

function attachRequestLog(
	request: IncomingMessage,
	response: ServerResponse,
): void {
	const startedAt = Date.now();
	const method = request.method ?? "GET";
	const path = readRequestPath(request.url);

	function logFinishedRequest(): void {
		const duration = Date.now() - startedAt;
		serverLogger.http(
			`${method} ${path} -> ${response.statusCode} (${duration}ms)`,
		);
	}

	response.on("finish", logFinishedRequest);
}

function isJsonContentType(request: IncomingMessage): boolean {
	const header = request.headers["content-type"];

	if (typeof header !== "string") {
		return false;
	}

	const mediaType = header.split(";")[0]?.trim().toLowerCase() ?? "";
	return mediaType === "application/json";
}

function methodHasBody(method: string): boolean {
	if (method === "POST") {
		return true;
	}

	if (method === "PUT") {
		return true;
	}

	return method === "PATCH";
}

function readJsonBody(request: IncomingMessage): Promise<JsonBody> {
	const jsonBodyLimitBytes = 100 * 1024;

	function collectJsonBody(
		complete: (jsonBody: JsonBody) => void,
		fail: (error: unknown) => void,
	): void {
		const chunks: Buffer[] = [];
		let receivedBytes = 0;

		function cleanup(): void {
			request.off("data", onData);
			request.off("end", onEnd);
			request.off("error", onError);
		}

		function onData(chunk: Buffer | string): void {
			const buffer = copyChunk(chunk);
			receivedBytes += buffer.length;
			const isTooLarge = receivedBytes > jsonBodyLimitBytes;

			if (isTooLarge) {
				request.pause();
				cleanup();
				complete({ kind: "too_large" });
				return;
			}

			chunks.push(buffer);
		}

		function onEnd(): void {
			cleanup();
			const receivedUtf8 = Buffer.concat(chunks).toString("utf8");

			if (receivedUtf8 === "") {
				complete({ kind: "parsed", parsedBody: {} });
				return;
			}

			try {
				const parsedBody: unknown = JSON.parse(receivedUtf8);
				complete({ kind: "parsed", parsedBody });
			} catch (error) {
				const isSyntaxError = error instanceof SyntaxError;

				if (isSyntaxError) {
					complete({ kind: "invalid" });
					return;
				}

				fail(error);
			}
		}

		function onError(error: Error): void {
			cleanup();
			fail(error);
		}

		request.on("data", onData);
		request.on("end", onEnd);
		request.on("error", onError);
	}

	return new Promise(collectJsonBody);
}

async function readParsedJsonBody(request: IncomingMessage): Promise<JsonBody> {
	const hasJsonBody = isJsonContentType(request);

	if (!hasJsonBody) {
		return { kind: "absent" };
	}

	return readJsonBody(request);
}

async function readBodyIfPresent(
	request: IncomingMessage,
	response: ServerResponse,
	method: string,
): Promise<BodyRead> {
	const hasBody = methodHasBody(method);

	if (!hasBody) {
		return { kind: "ready", parsedBody: undefined };
	}

	const jsonBody = await readParsedJsonBody(request);
	const isTooLarge = jsonBody.kind === "too_large";

	if (isTooLarge) {
		writeJson(response, 413, {
			error: "payload_too_large",
			error_description: "Request body exceeds 100kb",
		});
		return { kind: "rejected" };
	}

	const isInvalid = jsonBody.kind === "invalid";

	if (isInvalid) {
		writeJson(response, 400, {
			error: "invalid_json",
			error_description: "Invalid JSON",
		});
		return { kind: "rejected" };
	}

	if (jsonBody.kind === "parsed") {
		return { kind: "ready", parsedBody: jsonBody.parsedBody };
	}

	return { kind: "ready", parsedBody: undefined };
}

function originMatchesAllowed(
	origin: string,
	allowedOrigin: string | RegExp,
): boolean {
	const isPattern = allowedOrigin instanceof RegExp;

	if (isPattern) {
		return allowedOrigin.test(origin);
	}

	return allowedOrigin === origin;
}

function originIsListed(
	origin: string,
	allowedOrigins: readonly (string | RegExp)[],
): boolean {
	for (const allowedOrigin of allowedOrigins) {
		const isListed = originMatchesAllowed(origin, allowedOrigin);

		if (isListed) {
			return true;
		}
	}

	return false;
}

function reflectAllowedOrigin(
	request: IncomingMessage,
	response: ServerResponse,
	allowedOrigins: readonly (string | RegExp)[],
): void {
	const requestOrigin = readHeaderValue(request, "origin");

	if (requestOrigin === "") {
		return;
	}

	const isAllowed = originIsListed(requestOrigin, allowedOrigins);

	if (isAllowed === false) {
		return;
	}

	response.setHeader("Access-Control-Allow-Origin", requestOrigin);
}

function applyCors(
	request: IncomingMessage,
	response: ServerResponse,
	allowedOrigins: readonly (string | RegExp)[],
): boolean {
	response.setHeader("Vary", "Origin");
	reflectAllowedOrigin(request, response, allowedOrigins);
	response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

	const isOptions = request.method === "OPTIONS";

	if (!isOptions) {
		return false;
	}

	const requestedHeaders = readHeaderValue(
		request,
		"access-control-request-headers",
	);
	const hasRequestedHeaders = requestedHeaders !== "";

	if (hasRequestedHeaders) {
		response.setHeader("Vary", "Origin, Access-Control-Request-Headers");
		response.setHeader("Access-Control-Allow-Headers", requestedHeaders);
	}

	response.setHeader(
		"Access-Control-Allow-Methods",
		"GET,HEAD,PUT,PATCH,POST,DELETE",
	);
	response.statusCode = 204;
	response.setHeader("Content-Length", "0");
	response.end();
	return true;
}

function readSessionId(request: IncomingMessage): string | undefined {
	const header = request.headers["mcp-session-id"];

	if (typeof header !== "string") {
		return undefined;
	}

	if (header === "") {
		return undefined;
	}

	return header;
}

function findSessionTransport(
	transports: Map<string, StreamableHTTPServerTransport>,
	sessionId: string | undefined,
): StreamableHTTPServerTransport | undefined {
	if (sessionId === undefined) {
		return undefined;
	}

	return transports.get(sessionId);
}

async function openMcpSession(
	request: IncomingMessage,
	response: ServerResponse,
	transports: Map<string, StreamableHTTPServerTransport>,
	parsedBody: unknown,
): Promise<void> {
	let transport: StreamableHTTPServerTransport | undefined;

	function rememberSession(initializedSessionId: string): void {
		if (transport === undefined) {
			return;
		}

		transports.set(initializedSessionId, transport);
		serverLogger.info(`New MCP session initialized: ${initializedSessionId}`);
	}

	function closeSession(): void {
		if (transport === undefined) {
			return;
		}

		const sessionId = transport.sessionId;

		if (sessionId === undefined) {
			return;
		}

		transports.delete(sessionId);
		serverLogger.info(`MCP session closed: ${sessionId}`);
	}

	transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: createSessionId,
		onsessioninitialized: rememberSession,
	});
	transport.onclose = closeSession;

	const server = await createMcpServer();
	// SDK getters type callbacks as `T | undefined`, which Transport rejects.
	await server.connect(transport as Transport);
	await transport.handleRequest(request, response, parsedBody);
}

async function handleMcpPost(
	request: IncomingMessage,
	response: ServerResponse,
	routes: HttpRouteContext,
	parsedBody: unknown,
): Promise<void> {
	const authenticated = request as AuthenticatedRequest;
	const isAllowed = await routes.allowRequest(authenticated, response);

	if (isAllowed === false) {
		return;
	}

	const sessionId = readSessionId(request);
	const existing = findSessionTransport(routes.transports, sessionId);

	if (existing !== undefined) {
		await existing.handleRequest(request, response, parsedBody);
		return;
	}

	if (sessionId !== undefined) {
		writeMissingSession(response);
		return;
	}

	const isInitialize = isInitializeRequest(parsedBody);

	if (isInitialize) {
		await openMcpSession(request, response, routes.transports, parsedBody);
		return;
	}

	writeMissingSession(response);
}

async function handleMcpSession(
	request: IncomingMessage,
	response: ServerResponse,
	routes: HttpRouteContext,
): Promise<void> {
	const authenticated = request as AuthenticatedRequest;
	const isAllowed = await routes.allowRequest(authenticated, response);

	if (isAllowed === false) {
		return;
	}

	const sessionId = readSessionId(request);
	const existing = findSessionTransport(routes.transports, sessionId);

	if (existing === undefined) {
		writeInvalidSession(response);
		return;
	}

	await existing.handleRequest(request, response);
}

function isHealthGet(method: string, pathname: string): boolean {
	if (method !== "GET") {
		return false;
	}

	return pathname === "/health";
}

async function routeHttpRequest(
	request: IncomingMessage,
	response: ServerResponse,
	routes: HttpRouteContext,
): Promise<void> {
	attachRequestLog(request, response);

	const endedPreflight = applyCors(request, response, routes.corsOrigins);

	if (endedPreflight) {
		return;
	}

	const method = request.method ?? "GET";
	const bodyRead = await readBodyIfPresent(request, response, method);

	if (bodyRead.kind === "rejected") {
		return;
	}

	const servedMetadata = serveMetadataRoute(request, response, routes.metadata);

	if (servedMetadata) {
		return;
	}

	const pathname = readRequestPath(request.url);

	if (isHealthGet(method, pathname)) {
		writeHealth(response, routes.authEnabled);
		return;
	}

	const isRoot = pathname === "/";

	if (isRoot === false) {
		writeNotFound(response);
		return;
	}

	const parsedBody = bodyRead.parsedBody;
	const isPost = method === "POST";

	if (isPost) {
		await handleMcpPost(request, response, routes, parsedBody);
		return;
	}

	const isGet = method === "GET";

	if (isGet) {
		await handleMcpSession(request, response, routes);
		return;
	}

	const isDelete = method === "DELETE";

	if (isDelete) {
		await handleMcpSession(request, response, routes);
		return;
	}

	writeNotFound(response);
}

async function serveHttp(
	request: IncomingMessage,
	response: ServerResponse,
	routes: HttpRouteContext,
): Promise<void> {
	try {
		await routeHttpRequest(request, response, routes);
	} catch (error) {
		serverLogger.error("HTTP request failed", {
			error: getErrorMessage(error, String(error)),
		});

		const canReply = response.headersSent === false;

		if (!canReply) {
			return;
		}

		try {
			writeJson(response, 500, {
				error: "internal_error",
				error_description: "Internal server error",
			});
		} catch (writeError) {
			serverLogger.error("HTTP error response failed", {
				error: getErrorMessage(writeError, String(writeError)),
			});
		}
	}
}

/**
 * Create the HTTP server that serves OAuth metadata and streamable HTTP MCP sessions.
 *
 * @param config - HTTP transport config including OAuth settings.
 * @returns Node HTTP server with MCP, metadata, and health routes.
 *
 * @example
 * ```ts
 * const app = await createHttpMcpApp(createHttpTransportConfigFromEnv());
 * ```
 */
export async function createHttpMcpApp(
	config: HttpTransportConfig,
): Promise<Server> {
	const serverUrl = getHttpServerUrl(config);
	const ebayConfig = config.ebayConfig ?? getEbayConfig();
	const allowRequest = await createHttpAuthorizer(config, serverUrl);
	const routes: HttpRouteContext = {
		allowRequest,
		authEnabled: config.authEnabled,
		corsOrigins: config.corsOrigins,
		metadata: {
			resourceServerUrl: serverUrl,
			authServerMetadata: getAuthServerMetadataUrl(config),
			scopesSupported: config.oauth.requiredScopes,
			resourceDocumentation: "https://github.com/YosefHayim/ebay-mcp",
			resourceName: "eBay API MCP Server",
			ebayEnvironment: ebayConfig.environment,
			ebayScopes: getDefaultScopes(ebayConfig.environment),
		},
		transports: new Map(),
	};

	async function handleConnection(
		request: IncomingMessage,
		response: ServerResponse,
	): Promise<void> {
		await serveHttp(request, response, routes);
	}

	return createServer(handleConnection);
}
