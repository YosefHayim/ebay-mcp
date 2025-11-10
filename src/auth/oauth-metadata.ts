/**
 * OAuth metadata endpoints for MCP server
 * Implements RFC 9728 Protected Resource Metadata
 */

import type { Router } from "express";
import { Router as createRouter } from "express";
import type {
  ProtectedResourceMetadata,
  OAuthServerMetadata,
} from "./oauth-types.js";

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
}

/**
 * Create Express router with OAuth metadata endpoints
 */
export function createMetadataRouter(config: MetadataConfig): Router {
  const router = createRouter();

  // RFC 9728: Protected Resource Metadata endpoint
  // Path: /.well-known/oauth-protected-resource
  router.get("/.well-known/oauth-protected-resource", (req, res) => {
    const authServers =
      typeof config.authServerMetadata === "string"
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

    res.json(metadata);
  });

  // Optional: Server info endpoint for debugging
  router.get("/.well-known/mcp-server-info", (req, res) => {
    res.json({
      name: config.resourceName || "MCP Resource Server",
      version: "1.0.0",
      resource_url: config.resourceServerUrl,
      authorization_required: true,
      scopes_supported: config.scopesSupported,
      documentation: config.resourceDocumentation,
    });
  });

  return router;
}

/**
 * Helper to get Protected Resource Metadata URL from server URL
 */
export function getProtectedResourceMetadataUrl(serverUrl: string): string {
  const url = new URL(serverUrl);
  url.pathname = "/.well-known/oauth-protected-resource";
  return url.toString();
}
