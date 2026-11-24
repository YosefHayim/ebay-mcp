import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
	type Implementation,
	isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import express, {
	type Request,
	type RequestHandler,
	type Response,
} from "express";
import helmet from "helmet";
import {
	createMetadataRouter,
	getProtectedResourceMetadataUrl,
} from "@/auth/oauthMetadata.js";
import { createBearerAuthMiddleware } from "@/auth/oauthMiddleware.js";
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
 * Runtime configuration for the Express-based HTTP MCP server.
 */
export interface HttpTransportConfig {
	/** Enables OAuth bearer-token middleware when true. */
	authEnabled: boolean;
	/** Browser origins allowed to call the server cross-origin. */
	corsOrigins: (string | RegExp)[];
	/** Optional eBay config override used by tests and embedded callers. */
	ebayConfig?: EbayConfig;
	/** Host interface for the Express server URL. */
	host: string;
	/** OAuth protection settings for the HTTP transport. */
	oauth: HttpOAuthConfig;
	/** TCP port for the Express server URL. */
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

async function createAuthMiddleware(
	config: HttpTransportConfig,
	serverUrl: string,
): Promise<RequestHandler | undefined> {
	if (config.staticAuthToken) {
		const staticToken = config.staticAuthToken;
		serverLogger.info("Static bearer auth enabled via MCP_AUTH_TOKEN.");
		return (request, response, next) => {
			if (request.headers.authorization === `Bearer ${staticToken}`) {
				next();
				return;
			}
			response.status(401).json({
				error: "unauthorized",
				error_description: "Missing or invalid bearer token",
			});
		};
	}

	if (!config.authEnabled) {
		serverLogger.warn(
			"OAuth is disabled. Server running in unauthenticated mode.",
		);
		return;
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

	return createBearerAuthMiddleware({
		verifier: tokenVerifier,
		resourceMetadataUrl: getProtectedResourceMetadataUrl(serverUrl),
		realm: "ebay-mcp",
	});
}

function createRequestLogger(): RequestHandler {
	return (request, response, next) => {
		const start = Date.now();
		response.on("finish", () => {
			const duration = Date.now() - start;
			serverLogger.http(
				`${request.method} ${request.path} -> ${response.statusCode} (${duration}ms)`,
			);
		});
		next();
	};
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
	request: Request,
	response: Response,
	allowedOrigins: readonly (string | RegExp)[],
): void {
	const requestOrigin = request.header("origin");

	if (requestOrigin == null) {
		return;
	}

	if (requestOrigin === "") {
		return;
	}

	const isAllowed = originIsListed(requestOrigin, allowedOrigins);
	const isNotAllowed = !isAllowed;

	if (isNotAllowed) {
		return;
	}

	response.setHeader("Access-Control-Allow-Origin", requestOrigin);
}

function endPreflight(response: Response): void {
	response.setHeader("Content-Length", "0");
	response.status(204).end();
}

function allowConfiguredOrigins(
	allowedOrigins: readonly (string | RegExp)[],
): RequestHandler {
	return function allowConfiguredOrigin(request, response, next) {
		response.vary("Origin");
		reflectAllowedOrigin(request, response, allowedOrigins);
		response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

		const isActualRequest = request.method !== "OPTIONS";

		if (isActualRequest) {
			next();
			return;
		}

		response.vary("Access-Control-Request-Headers");
		response.setHeader(
			"Access-Control-Allow-Methods",
			"GET,HEAD,PUT,PATCH,POST,DELETE",
		);

		const requestedHeaders =
			request.header("access-control-request-headers") ?? "";
		const hasRequestedHeaders = requestedHeaders !== "";

		if (hasRequestedHeaders) {
			response.setHeader("Access-Control-Allow-Headers", requestedHeaders);
		}

		endPreflight(response);
	};
}

function sendInvalidSession(response: Response): void {
	response.status(400).json({
		error: "invalid_session",
		error_description: "Invalid or missing session ID",
	});
}

/**
 * Create the Express app that serves OAuth metadata and streamable HTTP MCP sessions.
 *
 * @param config - HTTP transport config including OAuth and static asset settings.
 * @returns Express application with MCP, metadata, and health routes.
 *
 * @example
 * ```ts
 * const app = await createHttpMcpApp(createHttpTransportConfigFromEnv());
 * ```
 */
export const createHttpMcpApp = async (
	config: HttpTransportConfig,
): Promise<express.Application> => {
	const app = express();
	const serverUrl = getHttpServerUrl(config);
	const ebayConfig = config.ebayConfig ?? getEbayConfig();

	app.use(allowConfiguredOrigins(config.corsOrigins));
	app.use(express.json());
	app.use(helmet({ xPoweredBy: false }));
	app.use(createRequestLogger());

	app.use(
		createMetadataRouter({
			resourceServerUrl: serverUrl,
			authServerMetadata: getAuthServerMetadataUrl(config),
			scopesSupported: config.oauth.requiredScopes,
			resourceDocumentation: "https://github.com/YosefHayim/ebay-mcp",
			resourceName: "eBay API MCP Server",
			ebayEnvironment: ebayConfig.environment,
			ebayScopes: getDefaultScopes(ebayConfig.environment),
		}),
	);

	app.get("/health", (_request, response) => {
		response.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			oauth_enabled: config.authEnabled,
		});
	});

	const authMiddleware = await createAuthMiddleware(config, serverUrl);
	const transports = new Map<string, StreamableHTTPServerTransport>();

	const mcpPostHandler = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const sessionHeader = request.headers["mcp-session-id"];
		const sessionId =
			typeof sessionHeader === "string" ? sessionHeader : undefined;
		let transport: StreamableHTTPServerTransport;

		if (sessionId && transports.has(sessionId)) {
			transport = transports.get(sessionId)!;
		} else if (!sessionId && isInitializeRequest(request.body)) {
			transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
				onsessioninitialized: (initializedSessionId) => {
					transports.set(initializedSessionId, transport);
					serverLogger.info(
						`New MCP session initialized: ${initializedSessionId}`,
					);
				},
			});

			transport.onclose = () => {
				if (transport.sessionId) {
					transports.delete(transport.sessionId);
					serverLogger.info(`MCP session closed: ${transport.sessionId}`);
				}
			};

			const server = await createMcpServer();
			// SDK getters type callbacks as `T | undefined`, which Transport rejects.
			await server.connect(transport as Transport);
		} else {
			response.status(400).json({
				jsonrpc: "2.0",
				error: {
					code: -32_000,
					message: "Bad Request: No valid session ID provided",
				},
				id: null,
			});
			return;
		}

		await transport.handleRequest(request, response, request.body);
	};

	const handleSessionRequest = async (
		request: Request,
		response: Response,
	): Promise<void> => {
		const sessionHeader = request.headers["mcp-session-id"];
		const sessionId =
			typeof sessionHeader === "string" ? sessionHeader : undefined;

		if (!(sessionId && transports.has(sessionId))) {
			sendInvalidSession(response);
			return;
		}

		const transport = transports.get(sessionId)!;
		await transport.handleRequest(request, response);
	};

	const mcpMiddleware = authMiddleware
		? [authMiddleware, mcpPostHandler]
		: [mcpPostHandler];
	const sessionMiddleware = authMiddleware
		? [authMiddleware, handleSessionRequest]
		: [handleSessionRequest];

	app.post("/", ...mcpMiddleware);
	app.get("/", ...sessionMiddleware);
	app.delete("/", ...sessionMiddleware);

	return app;
};
