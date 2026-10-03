import cors from 'cors';
import { randomUUID } from 'crypto';
import express, { type Request, type RequestHandler, type Response } from 'express';
import helmet from 'helmet';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest, type Implementation } from '@modelcontextprotocol/sdk/types.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createBearerAuthMiddleware } from '@/auth/oauthMiddleware.js';
import { createMetadataRouter, getProtectedResourceMetadataUrl } from '@/auth/oauthMetadata.js';
import { TokenVerifier } from '@/auth/tokenVerifier.js';
import { getDefaultScopes, getEbayConfig } from '@/config/environment.js';
import { createEbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { getErrorMessage } from '@/utils/errors.js';
import { serverLogger } from '@/utils/logger.js';
import { getVersion } from '@/utils/version.js';
import { Effect, Either } from 'effect';

/**
 * OAuth settings for protecting the HTTP MCP transport.
 */
export interface HttpOAuthConfig {
  /** OAuth authorization server issuer/base URL. */
  authServerUrl: string;
  /** Optional client ID used for token introspection. */
  clientId?: string;
  /** Optional client secret used for token introspection. */
  clientSecret?: string;
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
  /** Optional eBay config override used by tests and embedded callers. */
  ebayConfig?: EbayConfig;
  /** Host interface for the Express server URL. */
  host: string;
  /** OAuth protection settings for the HTTP transport. */
  oauth: HttpOAuthConfig;
  /** TCP port for the Express server URL. */
  port: number;
  /** Repo root used to serve static icon assets. */
  projectRoot: string;
  /**
   * Optional static bearer token. When set, HTTP MCP routes require
   * `Authorization: Bearer <token>` and skip the OAuth token verifier.
   */
  staticAuthToken?: string;
}

const getProjectRoot = (): string => {
  const filename = fileURLToPath(import.meta.url);
  const directory = dirname(filename);
  return join(directory, '../..');
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
export const createHttpTransportConfigFromEnv = (env: NodeJS.ProcessEnv): HttpTransportConfig => ({
  // Cloud platforms (Railway, Render, Fly, etc.) inject PORT; bind all interfaces
  // by default so the container is reachable unless MCP_HOST is set explicitly.
  host: env.MCP_HOST || (env.PORT ? '0.0.0.0' : 'localhost'),
  port: Number(env.MCP_PORT) || Number(env.PORT) || 3000,
  oauth: {
    authServerUrl: env.OAUTH_AUTH_SERVER_URL ?? 'http://localhost:8080/realms/master',
    clientId: env.OAUTH_CLIENT_ID,
    clientSecret: env.OAUTH_CLIENT_SECRET,
    requiredScopes: (env.OAUTH_REQUIRED_SCOPES || 'mcp:tools')
      .split(',')
      .map((scope) => scope.trim()),
    useIntrospection: env.OAUTH_USE_INTROSPECTION !== 'false',
  },
  authEnabled: env.OAUTH_ENABLED !== 'false',
  projectRoot: getProjectRoot(),
  staticAuthToken: env.MCP_AUTH_TOKEN,
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
export const getHttpServerUrl = (config: Pick<HttpTransportConfig, 'host' | 'port'>): string =>
  `http://${config.host}:${config.port}`;

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
export const getAuthServerMetadataUrl = (config: Pick<HttpTransportConfig, 'oauth'>): string => {
  const baseUrl = config.oauth.authServerUrl;

  if (baseUrl.includes('/realms/')) {
    return `${baseUrl}/.well-known/openid-configuration`;
  }

  return `${baseUrl}/.well-known/oauth-authorization-server`;
};

function createServerConfig(serverUrl: string): Implementation {
  const iconBaseUrl = `${serverUrl}/icons`;
  const iconSizes = ['16x16', '32x32', '48x48', '128x128', '256x256', '512x512', '1024x1024'];

  return {
    name: 'ebay-mcp',
    version: getVersion(),
    title: 'eBay API MCP Server',
    websiteUrl: 'https://github.com/YosefHayim/ebay-mcp',
    icons: iconSizes.map((size) => ({
      src: `${iconBaseUrl}/${size}.png`,
      mimeType: 'image/png',
      sizes: [size],
    })),
  };
}

async function createMcpServer(serverUrl: string): Promise<McpServer> {
  const runtime = createEbayMcpRuntime({
    serverConfig: createServerConfig(serverUrl),
  });

  const initialized = await Effect.runPromise(
    Effect.either(
      Effect.tryPromise({
        try: () => runtime.initializeApi(),
        catch: (error) => error,
      }),
    ),
  );

  if (Either.isLeft(initialized)) {
    const error = initialized.left;
    const message = getErrorMessage(error, String(error));
    serverLogger.error(`Failed to initialize eBay API client: ${message}`);
    throw error;
  }

  return runtime.server;
}

async function createAuthMiddleware(
  config: HttpTransportConfig,
  serverUrl: string,
): Promise<RequestHandler | undefined> {
  if (config.staticAuthToken) {
    const staticToken = config.staticAuthToken;
    serverLogger.info('Static bearer auth enabled via MCP_AUTH_TOKEN.');
    return (request, response, next) => {
      if (request.headers.authorization === `Bearer ${staticToken}`) {
        next();
        return;
      }
      response.status(401).json({
        error: 'unauthorized',
        error_description: 'Missing or invalid bearer token',
      });
    };
  }

  if (!config.authEnabled) {
    serverLogger.warn('OAuth is disabled. Server running in unauthenticated mode.');
    return;
  }

  serverLogger.info('Initializing OAuth token verifier...');

  const tokenVerifier = new TokenVerifier({
    authServerMetadata: getAuthServerMetadataUrl(config),
    clientId: config.oauth.clientId,
    clientSecret: config.oauth.clientSecret,
    expectedAudience: serverUrl,
    requiredScopes: config.oauth.requiredScopes,
    useIntrospection: config.oauth.useIntrospection,
  });

  const initialized = await Effect.runPromise(Effect.either(tokenVerifier.initialize()));

  if (Either.isLeft(initialized)) {
    const error = initialized.left;
    serverLogger.error('Failed to initialize token verifier', {
      error: getErrorMessage(error, String(error)),
    });
    throw error;
  }

  serverLogger.info('Token verifier initialized');

  return createBearerAuthMiddleware({
    verifier: tokenVerifier,
    resourceMetadataUrl: getProtectedResourceMetadataUrl(serverUrl),
    realm: 'ebay-mcp',
  });
}

function createRequestLogger(): RequestHandler {
  return (request, response, next) => {
    const start = Date.now();
    response.on('finish', () => {
      const duration = Date.now() - start;
      serverLogger.http(
        `${request.method} ${request.path} -> ${response.statusCode} (${duration}ms)`,
      );
    });
    next();
  };
}

function sendInvalidSession(response: Response): void {
  response.status(400).json({
    error: 'invalid_session',
    error_description: 'Invalid or missing session ID',
  });
}

/**
 * Create the Express app that serves OAuth metadata and streamable HTTP MCP sessions.
 *
 * @param config - HTTP transport config including OAuth and static asset settings.
 * @returns Express application with MCP, metadata, health, and icon routes.
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

  app.use(
    cors({
      origin: '*',
      exposedHeaders: ['Mcp-Session-Id'],
    }),
  );
  app.use(express.json());
  app.use(helmet({ xPoweredBy: false }));
  app.use(createRequestLogger());
  app.use('/icons', express.static(join(config.projectRoot, 'public', 'icons')));

  app.use(
    createMetadataRouter({
      resourceServerUrl: serverUrl,
      authServerMetadata: getAuthServerMetadataUrl(config),
      scopesSupported: config.oauth.requiredScopes,
      resourceDocumentation: 'https://github.com/YosefHayim/ebay-mcp',
      resourceName: 'eBay API MCP Server',
      ebayEnvironment: ebayConfig.environment,
      ebayScopes: getDefaultScopes(ebayConfig.environment),
    }),
  );

  app.get('/health', (_request, response) => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      oauth_enabled: config.authEnabled,
    });
  });

  const authMiddleware = await createAuthMiddleware(config, serverUrl);
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const mcpPostHandler = async (request: Request, response: Response): Promise<void> => {
    const sessionHeader = request.headers['mcp-session-id'];
    const sessionId = typeof sessionHeader === 'string' ? sessionHeader : undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(request.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (initializedSessionId) => {
          transports.set(initializedSessionId, transport);
          serverLogger.info(`New MCP session initialized: ${initializedSessionId}`);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
          serverLogger.info(`MCP session closed: ${transport.sessionId}`);
        }
      };

      const server = await createMcpServer(serverUrl);
      await server.connect(transport);
    } else {
      response.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32_000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    await transport.handleRequest(request, response, request.body);
  };

  const handleSessionRequest = async (request: Request, response: Response): Promise<void> => {
    const sessionHeader = request.headers['mcp-session-id'];
    const sessionId = typeof sessionHeader === 'string' ? sessionHeader : undefined;

    if (!(sessionId && transports.has(sessionId))) {
      sendInvalidSession(response);
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handleRequest(request, response);
  };

  const mcpMiddleware = authMiddleware ? [authMiddleware, mcpPostHandler] : [mcpPostHandler];
  const sessionMiddleware = authMiddleware
    ? [authMiddleware, handleSessionRequest]
    : [handleSessionRequest];

  app.post('/', ...mcpMiddleware);
  app.get('/', ...sessionMiddleware);
  app.delete('/', ...sessionMiddleware);

  return app;
};
