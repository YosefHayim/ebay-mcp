/**
 * OAuth metadata endpoints for MCP server
 * Implements RFC 9728 Protected Resource Metadata
 */

import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { ProtectedResourceMetadata, OAuthServerMetadata } from './oauthTypes.js';

/**
 * Inputs for the MCP OAuth protected-resource metadata endpoints.
 */
export interface MetadataConfig {
  /**
   * Resource server URL (e.g., "http://localhost:3000")
   */
  resourceServerUrl: string;

  /**
   * Authorization server URL or metadata
   */
  authServerMetadata: string | OAuthServerMetadata;

  /**
   * Scopes supported by this resource server
   */
  scopesSupported: string[];

  /**
   * Optional documentation URL for this resource server
   */
  resourceDocumentation?: string;

  /**
   * Resource name for display purposes
   */
  resourceName?: string;

  /**
   * eBay environment (production or sandbox) - optional
   * Used to indicate which eBay environment the server is configured for
   */
  ebayEnvironment?: 'production' | 'sandbox';

  /**
   * eBay-specific OAuth scopes - optional
   * Separate from MCP OAuth scopes, indicates what eBay API access is available
   */
  ebayScopes?: string[];
}

/**
 * Create Express router with OAuth metadata endpoints
 *
 * @param config - Protected resource metadata and optional eBay context.
 * @returns Express router exposing OAuth protected-resource metadata endpoints.
 *
 * @example
 * ```ts
 * const router = createMetadataRouter({ resourceServerUrl, authServerMetadata, scopesSupported });
 * ```
 */
export const createMetadataRouter = (config: MetadataConfig): Router => {
  const router = createRouter();

  // RFC 9728: Protected Resource Metadata endpoint
  // Path: /.well-known/oauth-protected-resource
  router.get('/.well-known/oauth-protected-resource', (_request, response) => {
    const authServers =
      typeof config.authServerMetadata === 'string'
        ? [config.authServerMetadata]
        : [config.authServerMetadata.issuer];

    const metadata: ProtectedResourceMetadata = {
      resource: config.resourceServerUrl,
      authorization_servers: authServers,
      scopes_supported: config.scopesSupported,
    };

    if (config.resourceDocumentation) {
      metadata.resource_documentation = config.resourceDocumentation;
    }

    response.json(metadata);
  });

  // Optional: Server info endpoint for debugging
  router.get('/.well-known/mcp-server-info', (_request, response) => {
    const serverInfo: Record<string, unknown> = {
      name: config.resourceName || 'MCP Resource Server',
      version: '1.0.0',
      resource_url: config.resourceServerUrl,
      authorization_required: true,
      scopes_supported: config.scopesSupported,
      documentation: config.resourceDocumentation,
    };

    // Add eBay-specific information if provided
    if (config.ebayEnvironment) {
      serverInfo.ebay = {
        environment: config.ebayEnvironment,
        base_url:
          config.ebayEnvironment === 'production'
            ? 'https://api.ebay.com'
            : 'https://api.sandbox.ebay.com',
        scopes: config.ebayScopes || [],
        note: 'MCP OAuth scopes (scopes_supported) are separate from eBay API OAuth scopes (ebay.scopes)',
      };
    }

    response.json(serverInfo);
  });

  return router;
};

/**
 * Helper to get Protected Resource Metadata URL from server URL
 *
 * @param serverUrl - Public HTTP server URL.
 * @returns URL for the RFC 9728 protected-resource metadata endpoint.
 *
 * @example
 * ```ts
 * const url = getProtectedResourceMetadataUrl('http://localhost:3000');
 * ```
 */
export const getProtectedResourceMetadataUrl = (serverUrl: string): string => {
  const url = new URL(serverUrl);
  url.pathname = '/.well-known/oauth-protected-resource';
  return url.toString();
};
