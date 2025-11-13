# OAuth 2.1 Setup Guide for Cloudflare Workers

This guide explains how to enable OAuth 2.1 authentication for the eBay API MCP Server deployed on Cloudflare Workers.

## Overview

The Cloudflare Worker implementation supports **conditional OAuth 2.1 authentication**:

- **By default**: OAuth is **disabled** - server works without authentication
- **When configured**: OAuth is **enabled** - all requests require valid Bearer tokens
- **Backward compatible**: Existing deployments continue to work without changes

## Security Benefits

When OAuth is enabled:

✅ **Bearer Token Authentication** - All MCP requests require valid OAuth tokens
✅ **Proper 401 Responses** - Unauthorized requests rejected with `WWW-Authenticate` header
✅ **Scope Support** - Configurable OAuth scopes (default: `mcp:tools`)
✅ **Conditional Advertisement** - OAuth only advertised when properly configured

## Quick Start

### Step 1: Set Up OAuth Secrets

Configure OAuth secrets in your Cloudflare Worker:

```bash
# Required: OAuth authorization server URL
npx wrangler secret put OAUTH_AUTH_SERVER_URL

# Optional: OAuth client credentials (if using custom auth server)
npx wrangler secret put OAUTH_CLIENT_ID
npx wrangler secret put OAUTH_CLIENT_SECRET

# Optional: Required OAuth scopes (defaults to "mcp:tools")
npx wrangler secret put OAUTH_REQUIRED_SCOPES
```

**Example OAUTH_AUTH_SERVER_URL values:**
- Claude: `https://claude.ai/api/oauth` (recommended for Claude Desktop)
- Custom: `https://your-auth-server.com/oauth`

### Step 2: Redeploy Your Worker

```bash
npm run build
npx wrangler deploy
```

### Step 3: Verify OAuth is Enabled

```bash
# Check OAuth metadata endpoint (should return metadata, not 404)
curl https://your-worker.workers.dev/.well-known/oauth-protected-resource

# Expected response:
{
  "resource": "https://your-worker.workers.dev",
  "authorization_servers": ["https://claude.ai/api/oauth"],
  "scopes_supported": ["mcp:tools"],
  "bearer_methods_supported": ["header"],
  "resource_signing_alg_values_supported": ["RS256"],
  "resource_documentation": "https://github.com/YosefHayim/ebay-api-mcp-server",
  "resource_policy_uri": "https://your-worker.workers.dev/policy"
}
```

## Configuration Options

### Required Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `OAUTH_AUTH_SERVER_URL` | OAuth 2.1 authorization server URL | `https://claude.ai/api/oauth` |

### Optional Secrets

| Secret | Description | Default |
|--------|-------------|---------|
| `OAUTH_CLIENT_ID` | OAuth client ID (if using custom auth) | Not set |
| `OAUTH_CLIENT_SECRET` | OAuth client secret (if using custom auth) | Not set |
| `OAUTH_REQUIRED_SCOPES` | Comma-separated list of required scopes | `mcp:tools` |
| `OAUTH_ENABLED` | Explicitly disable OAuth (set to "false") | Not set |

### Environment Variables

Configure in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "MCP_HOST": "0.0.0.0",
    "EBAY_ENVIRONMENT": "sandbox"
  }
}
```

## Using OAuth with Claude Desktop

Claude Desktop automatically detects OAuth support and handles the authorization flow.

**Configuration:**

```json
{
  "mcpServers": {
    "ebay-api-mcp-server": {
      "url": "https://your-worker.workers.dev"
    }
  }
}
```

**What happens:**

1. Claude Desktop discovers OAuth metadata via `/.well-known/oauth-protected-resource`
2. Redirects you to the authorization server for approval
3. Exchanges authorization code for access token
4. Includes `Authorization: Bearer <token>` header in all MCP requests

## Using OAuth with Custom Clients

### 1. Discover OAuth Metadata

```bash
GET https://your-worker.workers.dev/.well-known/oauth-protected-resource
```

### 2. Obtain Access Token

Follow OAuth 2.1 authorization flow with the authorization server URL from metadata.

### 3. Make Authenticated Requests

Include Bearer token in all MCP requests:

```bash
curl -X POST https://your-worker.workers.dev \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "custom-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```

## Error Responses

### 401 Unauthorized (Missing/Invalid Token)

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized: Invalid or missing OAuth token"
  },
  "id": null
}
```

**Response Headers:**
```
HTTP/2 401
WWW-Authenticate: Bearer realm="MCP Server", scope="mcp:tools"
```

### 404 Not Found (OAuth Not Configured)

If `OAUTH_AUTH_SERVER_URL` is not set:

```bash
curl https://your-worker.workers.dev/.well-known/oauth-protected-resource
# Returns: HTTP/2 404 Not Found
```

## Disabling OAuth

### Temporarily Disable

Set the `OAUTH_ENABLED` secret to `false`:

```bash
npx wrangler secret put OAUTH_ENABLED
# Enter: false
```

### Permanently Disable

Delete the `OAUTH_AUTH_SERVER_URL` secret:

```bash
npx wrangler secret delete OAUTH_AUTH_SERVER_URL
```

Then redeploy:

```bash
npx wrangler deploy
```

## Token Validation (Current Implementation)

**Current behavior:**
- OAuth verification accepts any non-empty Bearer token
- Suitable for development and testing

**Production recommendations:**

1. **Implement proper token validation:**
   - Validate JWT signature using authorization server's public key
   - Verify token expiration (`exp` claim)
   - Verify token audience (`aud` claim)
   - Verify token scopes match required scopes

2. **Use KV storage for session management:**
   - Store validated tokens in `OAUTH_KV` namespace
   - Cache authorization server metadata
   - Implement token refresh logic

3. **Add rate limiting per token:**
   - Track requests per token in KV
   - Implement sliding window rate limits

## Example: Full OAuth Setup for Production

```bash
# 1. Configure OAuth secrets
npx wrangler secret put OAUTH_AUTH_SERVER_URL
# Enter: https://your-auth-server.com/oauth

npx wrangler secret put OAUTH_CLIENT_ID
# Enter: your-client-id

npx wrangler secret put OAUTH_CLIENT_SECRET
# Enter: your-client-secret

npx wrangler secret put OAUTH_REQUIRED_SCOPES
# Enter: mcp:tools,mcp:read,mcp:write

# 2. Configure eBay secrets (if not already set)
npx wrangler secret put EBAY_CLIENT_ID
npx wrangler secret put EBAY_CLIENT_SECRET
npx wrangler secret put EBAY_REDIRECT_URI
npx wrangler secret put EBAY_USER_REFRESH_TOKEN

# 3. Deploy
npm run build
npx wrangler deploy

# 4. Test OAuth metadata
curl https://your-worker.workers.dev/.well-known/oauth-protected-resource

# 5. Test authenticated request
curl -X POST https://your-worker.workers.dev \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}'
```

## Troubleshooting

### OAuth endpoint returns 404

**Cause:** `OAUTH_AUTH_SERVER_URL` not set or `OAUTH_ENABLED` set to "false"

**Solution:**
```bash
npx wrangler secret put OAUTH_AUTH_SERVER_URL
# Enter your authorization server URL
npx wrangler deploy
```

### Requests fail with 401 Unauthorized

**Cause:** Missing or invalid Bearer token when OAuth is enabled

**Solution:** Include valid Bearer token in Authorization header:
```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Claude Desktop shows OAuth redirect but fails

**Cause:** Authorization server URL is invalid or unreachable

**Solution:**
1. Verify `OAUTH_AUTH_SERVER_URL` is correct
2. Test authorization server is accessible
3. Check authorization server supports OAuth 2.1 spec

### Cannot disable OAuth

**Cause:** `OAUTH_AUTH_SERVER_URL` secret still exists

**Solution:**
```bash
npx wrangler secret delete OAUTH_AUTH_SERVER_URL
npx wrangler deploy
```

## Security Best Practices

✅ **Use HTTPS only** - Cloudflare Workers enforce HTTPS by default
✅ **Rotate secrets regularly** - Update OAuth credentials periodically
✅ **Monitor failed auth attempts** - Track 401 responses in Cloudflare Analytics
✅ **Implement token expiration** - Use short-lived access tokens (15-60 minutes)
✅ **Validate token signatures** - Verify JWT signatures in production
✅ **Use secure scopes** - Request only necessary OAuth scopes
✅ **Rate limit by token** - Prevent token abuse with per-token rate limits

## Additional Resources

- [MCP OAuth 2.1 Specification](https://spec.modelcontextprotocol.io/specification/2024-11-05/security/oauth/)
- [OAuth 2.1 RFC](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-11)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)

## Support

For issues or questions:
- GitHub Issues: https://github.com/YosefHayim/ebay-api-mcp-server/issues
- MCP Specification: https://spec.modelcontextprotocol.io
