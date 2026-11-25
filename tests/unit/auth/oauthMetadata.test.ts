import { describe, it, expect, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import { createMetadataRouter, getProtectedResourceMetadataUrl } from '@/auth/oauthMetadata.js';

describe('OAuth Metadata', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
  });

  describe('createMetadataRouter', () => {
    it('create metadata router with string auth server metadata', async () => {
      const router = createMetadataRouter({
        resourceServerUrl: 'http://localhost:3000',
        authServerMetadata: 'http://localhost:8080/realms/master',
        scopesSupported: ['mcp:tools', 'mcp:admin'],
        resourceDocumentation: 'https://github.com/test/repo',
        resourceName: 'Test MCP Server',
      });

      app.use(router);

      const response = await request(app).get('/.well-known/oauth-protected-resource');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        resource: 'http://localhost:3000',
        authorization_servers: ['http://localhost:8080/realms/master'],
        scopes_supported: ['mcp:tools', 'mcp:admin'],
        resource_documentation: 'https://github.com/test/repo',
      });
    });

    it('create metadata router with OAuth server metadata object', async () => {
      const router = createMetadataRouter({
        resourceServerUrl: 'http://localhost:3000',
        authServerMetadata: {
          issuer: 'http://localhost:8080/realms/master',
          authorization_endpoint:
            'http://localhost:8080/realms/master/protocol/openid-connect/auth',
          token_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/token',
          jwks_uri: 'http://localhost:8080/realms/master/protocol/openid-connect/certs',
        },
        scopesSupported: ['mcp:tools'],
      });

      app.use(router);

      const response = await request(app).get('/.well-known/oauth-protected-resource');

      expect(response.status).toBe(200);
      expect(response.body.authorization_servers).toEqual(['http://localhost:8080/realms/master']);
    });

    it('provide MCP server info endpoint', async () => {
      const router = createMetadataRouter({
        resourceServerUrl: 'http://localhost:3000',
        authServerMetadata: 'http://localhost:8080/realms/master',
        scopesSupported: ['mcp:tools'],
        resourceName: 'eBay MCP Server',
        resourceDocumentation: 'https://example.com/docs',
      });

      app.use(router);

      const response = await request(app).get('/.well-known/mcp-server-info');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'eBay MCP Server',
        version: '1.0.0',
        resource_url: 'http://localhost:3000',
        authorization_required: true,
        scopes_supported: ['mcp:tools'],
        documentation: 'https://example.com/docs',
      });
    });

    it('include eBay-specific info when provided', async () => {
      const router = createMetadataRouter({
        resourceServerUrl: 'http://localhost:3000',
        authServerMetadata: 'http://localhost:8080/realms/master',
        scopesSupported: ['mcp:tools'],
        resourceName: 'eBay MCP Server',
        ebayEnvironment: 'production',
        ebayScopes: [
          'https://api.ebay.com/oauth/api_scope/sell.inventory',
          'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        ],
      });

      app.use(router);

      const response = await request(app).get('/.well-known/mcp-server-info');

      expect(response.status).toBe(200);
      expect(response.body.ebay).toBeDefined();
      expect(response.body.ebay.environment).toBe('production');
      expect(response.body.ebay.base_url).toBe('https://api.ebay.com');
      expect(response.body.ebay.scopes).toHaveLength(2);
    });

    it('use sandbox eBay base URL when environment is sandbox', async () => {
      const router = createMetadataRouter({
        resourceServerUrl: 'http://localhost:3000',
        authServerMetadata: 'http://localhost:8080/realms/master',
        scopesSupported: ['mcp:tools'],
        resourceName: 'eBay MCP Server',
        ebayEnvironment: 'sandbox',
        ebayScopes: [],
      });

      app.use(router);

      const response = await request(app).get('/.well-known/mcp-server-info');

      expect(response.status).toBe(200);
      expect(response.body.ebay.base_url).toBe('https://api.sandbox.ebay.com');
    });

    it('not include documentation if not provided', async () => {
      const router = createMetadataRouter({
        resourceServerUrl: 'http://localhost:3000',
        authServerMetadata: 'http://localhost:8080/realms/master',
        scopesSupported: ['mcp:tools'],
      });

      app.use(router);

      const response = await request(app).get('/.well-known/oauth-protected-resource');

      expect(response.status).toBe(200);
      expect(response.body.resource_documentation).toBeUndefined();
    });
  });

  describe('getProtectedResourceMetadataUrl', () => {
    it('generate correct metadata URL', () => {
      const url = getProtectedResourceMetadataUrl('http://localhost:3000');
      expect(url).toBe('http://localhost:3000/.well-known/oauth-protected-resource');
    });

    it('handle URLs with paths', () => {
      const url = getProtectedResourceMetadataUrl('http://localhost:3000/api');
      expect(url).toBe('http://localhost:3000/.well-known/oauth-protected-resource');
    });

    it('handle URLs with trailing slash', () => {
      const url = getProtectedResourceMetadataUrl('http://localhost:3000/');
      expect(url).toBe('http://localhost:3000/.well-known/oauth-protected-resource');
    });

    it('handle HTTPS URLs', () => {
      const url = getProtectedResourceMetadataUrl('https://example.com');
      expect(url).toBe('https://example.com/.well-known/oauth-protected-resource');
    });
  });
});
