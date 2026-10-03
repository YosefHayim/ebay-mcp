/**
 * eBay API MCP Server with HTTP Transport and OAuth 2.1 Authorization.
 */

import { validateEnvironmentConfig } from '@/config/environment.js';
import {
  createHttpMcpApp,
  createHttpTransportConfigFromEnv,
  getHttpServerUrl,
} from '@/mcp/httpTransport.js';
import { getErrorMessage } from '@/utils/errors.js';
import { serverLogger } from '@/utils/logger.js';
import { Effect, Either } from 'effect';
import process from 'node:process';
import { isEntryModule } from '@/utils/entryModule.js';

const CONFIG = createHttpTransportConfigFromEnv(process.env);

function logEnvironmentValidation(): void {
  const validation = validateEnvironmentConfig();

  validation.infos.forEach((notice) => {
    serverLogger.info(notice);
  });

  if (validation.warnings.length > 0) {
    serverLogger.warn('Environment Configuration Warnings:');
    validation.warnings.forEach((warning) => {
      serverLogger.warn(warning);
    });
  }

  if (!validation.isValid) {
    serverLogger.error('Environment Configuration Errors:');
    validation.errors.forEach((error) => {
      serverLogger.error(error);
    });
    serverLogger.error('Please fix the configuration errors and restart the server.');
    process.exit(1);
  }
}

function logConfiguration(): void {
  serverLogger.info('Configuration:');
  serverLogger.info(`Host: ${CONFIG.host}`);
  serverLogger.info(`Port: ${CONFIG.port}`);
  serverLogger.info(`OAuth Enabled: ${CONFIG.authEnabled}`);

  if (CONFIG.authEnabled) {
    serverLogger.info(`Auth Server: ${CONFIG.oauth.authServerUrl}`);
    serverLogger.info(`Required Scopes: ${CONFIG.oauth.requiredScopes.join(', ')}`);
    serverLogger.info(
      `Verification Method: ${CONFIG.oauth.useIntrospection ? 'Introspection' : 'JWT'}`,
    );
  }
}

function logStartupUrls(serverUrl: string): void {
  serverLogger.info('Server is running!');
  serverLogger.info(`MCP endpoint: ${serverUrl}/`);
  serverLogger.info(
    `Protected Resource Metadata: ${serverUrl}/.well-known/oauth-protected-resource`,
  );
  serverLogger.info(`Health check: ${serverUrl}/health`);

  if (CONFIG.authEnabled) {
    serverLogger.info('Authorization is ENABLED');
    serverLogger.info('Clients must provide valid Bearer tokens to access MCP endpoints');
  } else {
    serverLogger.warn('Authorization is DISABLED');
    serverLogger.warn(
      'Set OAUTH_ENABLED=true (or remove OAUTH_ENABLED=false) to enable OAuth protection',
    );
  }
}

async function main(): Promise<void> {
  const started = await Effect.runPromise(
    Effect.either(
      Effect.gen(function* () {
        serverLogger.info('Starting eBay API MCP Server (HTTP + OAuth)...');

        logEnvironmentValidation();
        logConfiguration();

        const app = yield* Effect.tryPromise({
          try: () => createHttpMcpApp(CONFIG),
          catch: (error) => error,
        });
        const serverUrl = getHttpServerUrl(CONFIG);
        const server = app.listen(CONFIG.port, CONFIG.host, () => {
          logStartupUrls(serverUrl);
        });

        process.on('SIGINT', () => {
          serverLogger.info('Shutting down...');
          server.close(() => {
            serverLogger.info('Server closed');
            process.exit(0);
          });
        });
      }),
    ),
  );

  if (Either.isLeft(started)) {
    serverLogger.error('Fatal error starting server', {
      error: getErrorMessage(started.left, String(started.left)),
    });
    process.exit(1);
  }
}

if (isEntryModule(import.meta.url)) {
  await main();
}
