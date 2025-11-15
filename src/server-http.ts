/**
 * eBay API MCP Server with HTTP Transport and OAuth 2.1 Authorization
 *
 *
 * This server implements:
 * - HTTP transport using Express
 * - OAuth 2.1 authorization (RFC 8414, RFC 9728)
 * - Bearer token authentication (RFC 6750)
 * - Token verification via introspection (RFC 7662) or JWT validation
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/index.js';
import {
  getEbayConfig,
  getDefaultScopes,
  validateEnvironmentConfig,
} from '@/config/environment.js';
import { getToolDefinitions, executeTool } from '@/tools/index.js';
import { TokenVerifier } from '@/auth/token-verifier.js';
import { createBearerAuthMiddleware } from '@/auth/oauth-middleware.js';
import { createMetadataRouter, getProtectedResourceMetadataUrl } from '@/auth/oauth-metadata.js';

// Configuration from environment
const CONFIG = {
  // Server settings
  host: process.env.MCP_HOST || 'localhost',
  port: Number(process.env.MCP_PORT) || 3000,

  // OAuth settings
  oauth: {
    // Authorization server metadata URL or custom metadata
    authServerUrl: process.env.OAUTH_AUTH_SERVER_URL ?? 'http://localhost:8080/realms/master',

    // Client credentials for token introspection
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,

    // Scopes required for this server
    requiredScopes: (process.env.OAUTH_REQUIRED_SCOPES || 'mcp:tools')
      .split(',')
      .map((s) => s.trim()),

    // Whether to use token introspection (true) or JWT validation (false)
    useIntrospection: process.env.OAUTH_USE_INTROSPECTION !== 'false',
  },

  // Whether OAuth is enabled (disable for local development)
  authEnabled: process.env.OAUTH_ENABLED !== 'false',
};

/**
 * Create OAuth server metadata URL
 */
function getAuthServerMetadataUrl(): string {
  // Support both OIDC Discovery and OAuth Server Metadata
  const baseUrl = CONFIG.oauth.authServerUrl;

  // Try OIDC Discovery first
  if (baseUrl.includes('/realms/')) {
    // Keycloak-style URL
    return `${baseUrl}/.well-known/openid-configuration`;
  }

  // Fall back to OAuth 2.0 Authorization Server Metadata
  return `${baseUrl}/.well-known/oauth-authorization-server`;
}

/**
 * Create Express app with OAuth support
 */
async function createApp(): Promise<express.Application> {
  const app = express();

  // Enable CORS
  app.use(
    cors({
      // TODO: Restrict origin to known clients in production
      // For development, allow all origins
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      origin: '*',
      exposedHeaders: ['Mcp-Session-Id'],
    })
  );

  // Parse JSON bodies
  app.use(express.json());

  // Add security best practices (disable X-Powered-By header)
  app.use(helmet({ xPoweredBy: false }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Server URL
  const serverUrl = `http://${CONFIG.host}:${CONFIG.port}`;

  // Get eBay configuration for metadata
  const ebayConfig = getEbayConfig();

  // Add OAuth metadata endpoints
  const metadataRouter = createMetadataRouter({
    resourceServerUrl: serverUrl,
    authServerMetadata: getAuthServerMetadataUrl(),
    scopesSupported: CONFIG.oauth.requiredScopes,
    resourceDocumentation: 'https://github.com/your-repo/ebay-api-mcp-server',
    resourceName: 'eBay API MCP Server',
    ebayEnvironment: ebayConfig.environment,
    ebayScopes: getDefaultScopes(ebayConfig.environment),
  });

  app.use(metadataRouter);

  // Health check endpoint (no auth required)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      oauth_enabled: CONFIG.authEnabled,
    });
  });

  // Initialize token verifier if OAuth is enabled
  let tokenVerifier: TokenVerifier | undefined;
  let authMiddleware: express.RequestHandler | undefined;

  if (CONFIG.authEnabled) {
    console.log('Initializing OAuth token verifier...');

    tokenVerifier = new TokenVerifier({
      authServerMetadata: getAuthServerMetadataUrl(),
      clientId: CONFIG.oauth.clientId,
      clientSecret: CONFIG.oauth.clientSecret,
      expectedAudience: serverUrl,
      requiredScopes: CONFIG.oauth.requiredScopes,
      useIntrospection: CONFIG.oauth.useIntrospection,
    });

    try {
      await tokenVerifier.initialize();
      console.log('Token verifier initialized');

      authMiddleware = createBearerAuthMiddleware({
        verifier: tokenVerifier,
        resourceMetadataUrl: getProtectedResourceMetadataUrl(serverUrl),
        realm: 'ebay-mcp',
      });
    } catch (error) {
      console.error('Failed to initialize token verifier:', error);
      throw error;
    }
  } else {
    console.error('OAuth is disabled. Server running in unauthenticated mode.');
  }

  // MCP session storage
  const transports = new Map<string, StreamableHTTPServerTransport>();

  /**
   * Create a new MCP server instance
   */
  function createMcpServer(): McpServer {
    const ebayConfig = getEbayConfig();
    const api = new EbaySellerApi(ebayConfig);

    const server = new McpServer(
      {
        name: 'ebay-api-mcp-server',
        version: '1.4.0',
        title: 'eBay API MCP Server',
        websiteUrl: 'https://coming-soon.com',
        icons: [
          {
            src: './icons/16x16.png',
            mimeType: 'image/png',
            sizes: ['16x16'],
          },
          {
            src: './icons/32x32.png',
            mimeType: 'image/png',
            sizes: ['32x32'],
          },
          {
            src: './icons/48x48.png',
            mimeType: 'image/png',
            sizes: ['48x48'],
          },
          {
            src: './icons/128x128.png',
            mimeType: 'image/png',
            sizes: ['128x128'],
          },
          {
            src: './icons/256x256.png',
            mimeType: 'image/png',
            sizes: ['256x256'],
          },
          {
            src: './icons/512x512.png',
            mimeType: 'image/png',
            sizes: ['512x512'],
          },
          {
            src: './icons/1024x1024.png',
            mimeType: 'image/png',
            sizes: ['1024x1024'],
          }
        ],
      },

    );

    // Register tools
    const tools = getToolDefinitions();
    for (const toolDef of tools) {
      server.registerTool(
        toolDef.name,
        {
          description: toolDef.description,
          // ToolDefinition uses Zod schemas internally, but MCP SDK expects Zod schemas
          // This is a safe cast since both are Zod-based schema types
          inputSchema: toolDef.inputSchema,
        },
        async (args: Record<string, unknown>) => {
          try {
            const result = await executeTool(api, toolDef.name, args);
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({ error: errorMessage }, null, 2),
                },
              ],
              isError: true,
            };
          }
        }
      );
    }

    return server;
  }

  /**
   * MCP POST handler
   */
  const mcpPostHandler = async (req: express.Request, res: express.Response): Promise<void> => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId)!;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // Create new session
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          transports.set(sessionId, transport);
          console.log(`New MCP session initialized: ${sessionId}`);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
          console.log(`MCP session closed: ${transport.sessionId}`);
        }
      };

      const server = createMcpServer();
      await server.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  };

  /**
   * MCP session request handler (GET/DELETE)
   */
  const handleSessionRequest = async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).json({
        error: 'invalid_session',
        error_description: 'Invalid or missing session ID',
      });
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  };

  // Apply auth middleware to MCP endpoints if enabled
  const mcpMiddleware = authMiddleware ? [authMiddleware, mcpPostHandler] : [mcpPostHandler];

  const sessionMiddleware = authMiddleware
    ? [authMiddleware, handleSessionRequest]
    : [handleSessionRequest];

  // MCP endpoints
  app.post('/', ...mcpMiddleware);
  app.get('/', ...sessionMiddleware);
  app.delete('/', ...sessionMiddleware);

  return app;
}

/**
 * Start the server
 */
async function main() {
  try {
    console.log('Starting eBay API MCP Server (HTTP + OAuth)...');
    console.log();

    // Validate environment configuration
    const validation = validateEnvironmentConfig();

    // Display warnings
    if (validation.warnings.length > 0) {
      console.log('Environment Configuration Warnings:');
      validation.warnings.forEach((warning) => {
        console.log(`  • ${warning}`);
      });
      console.log();
    }

    // Display errors and exit if configuration is invalid
    if (!validation.isValid) {
      console.error('Environment Configuration Errors:');
      validation.errors.forEach((error) => {
        console.error(`  • ${error}`);
      });
      console.error('\nPlease fix the configuration errors and restart the server.\n');
      process.exit(1);
    }

    console.log('Configuration:');
    console.log(`Host: ${CONFIG.host}`);
    console.log(`Port: ${CONFIG.port}`);
    console.log(`OAuth Enabled: ${CONFIG.authEnabled}`);

    if (CONFIG.authEnabled) {
      console.log(`Auth Server: ${CONFIG.oauth.authServerUrl}`);
      console.log(`Required Scopes: ${CONFIG.oauth.requiredScopes.join(', ')}`);
      console.log(`Verification Method: ${CONFIG.oauth.useIntrospection ? 'Introspection' : 'JWT'}`
      );
    }

    const app = await createApp();

    const server = app.listen(CONFIG.port, CONFIG.host, () => {
      const serverUrl = `http://${CONFIG.host}:${CONFIG.port}`;

      console.log('Server is running!');
      console.log();
      console.log(`MCP endpoint: ${serverUrl}/`);
      console.log(
        `Protected Resource Metadata: ${serverUrl}/.well-known/oauth-protected-resource`
      );
      console.log(`Health check: ${serverUrl}/health`);
      console.log();

      if (CONFIG.authEnabled) {
        console.log('Authorization is ENABLED');
        console.log('Clients must provide valid Bearer tokens to access MCP endpoints');
      } else {
        console.log('Authorization is DISABLED');
        console.log('Set OAUTH_ENABLED=true to enable OAuth protection');
      }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n Shutting down...');
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
