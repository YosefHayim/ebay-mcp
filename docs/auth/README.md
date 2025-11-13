# eBay OAuth Authentication & Scopes Guide

Complete guide to OAuth 2.0 authentication, scopes, and troubleshooting for the eBay API MCP Server.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication Methods](#authentication-methods)
4. [OAuth Scopes](#oauth-scopes)
   - [Environment-Specific Scopes](#environment-specific-scopes)
   - [Scope Requirements by API](#scope-requirements-by-api)
   - [Scope Selection Strategies](#scope-selection-strategies)
5. [Token Management](#token-management)
   - [Automatic Token Setup](#automatic-token-setup)
   - [Manual Token Configuration](#manual-token-configuration)
6. [Environment Differences](#environment-differences)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Tools Reference](#tools-reference)

---

## Overview

eBay uses OAuth 2.0 for authentication and authorization. **OAuth scopes** determine what actions your application can perform on behalf of a user. This MCP server supports both **sandbox** and **production** environments, each with different sets of available scopes.

### Important: Two OAuth Systems

This MCP server uses **two separate OAuth systems**:

1. **MCP OAuth** - Controls access to the MCP server itself
   - Scopes: `mcp:tools` (allows calling MCP tools)
   - Used by: MCP clients (Claude Desktop, etc.)
   - Configured in: `OAUTH_REQUIRED_SCOPES` environment variable

2. **eBay OAuth** - Controls access to eBay's APIs
   - Scopes: eBay-specific scopes (see below)
   - Used by: This MCP server when making eBay API calls
   - Configured in: eBay Developer credentials + user authorization

---

## Quick Start

### 1. Set Up Credentials

Create a `.env` file with your eBay credentials:

```env
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox  # or 'production'
EBAY_REDIRECT_URI=your_redirect_uri  # Optional, for OAuth user flow
```

Get credentials from [eBay Developer Program](https://developer.ebay.com).

### 2. Obtain User Tokens

**Option A: Using MCP Tools (Recommended)**

```javascript
// 1. Generate OAuth URL
const result = await use_mcp_tool("ebay_get_oauth_url", {
  redirectUri: "https://your-app.com/callback"
  // Omit scopes to use environment-appropriate defaults
});

// 2. User opens URL in browser and authorizes

// 3. Set tokens after user authorization
await use_mcp_tool("ebay_set_user_tokens", {
  accessToken: "v^1.1#...",
  refreshToken: "v^1.1#..."
});
```

**Option B: Manual Token File**

See [Manual Token Configuration](#manual-token-configuration) section below.

### 3. Verify Authentication

```javascript
const status = await use_mcp_tool("ebay_get_token_status", {});
console.log(status);
```

---

## Authentication Methods

### User Tokens (Recommended)

**Rate Limit**: 10,000-50,000 requests/day

User tokens provide the highest rate limits and full API access. They require user authorization via OAuth flow.

**Token Validity**:
- Access token: ~2 hours
- Refresh token: ~18 months
- Automatically refreshed by the server

**How to Obtain**:
1. Use `ebay_get_oauth_url` tool to generate an authorization URL
2. User opens URL in browser and grants permissions
3. User is redirected to your callback with an authorization code
4. Exchange the code for tokens or use `ebay_set_user_tokens` if you have them

### Client Credentials (Fallback)

**Rate Limit**: 1,000 requests/day

Client credentials provide basic API access without user authorization. Used automatically as fallback when no user tokens are available.

**Scope**: `https://api.ebay.com/oauth/api_scope` (basic access only)

---

## OAuth Scopes

### Environment-Specific Scopes

eBay's Production and Sandbox environments support different OAuth scopes.

#### Key Statistics

| Environment | Total Scopes | Unique Features |
|-------------|--------------|-----------------|
| **Production** | 27 | eDelivery, Commerce Shipping |
| **Sandbox** | 35 | Buy API (8 scopes), Extended Identity |
| **Common** | 21 | Core Sell APIs, Commerce APIs |

#### Scope Configuration Files

- **Production Scopes**: [`production_scopes.json`](./production_scopes.json) - 27 unique scopes
- **Sandbox Scopes**: [`sandbox_scopes.json`](./sandbox_scopes.json) - 35 unique scopes

#### Production-Only Scopes

These scopes are **only** available in Production:

| Scope | Description | Use Case |
|-------|-------------|----------|
| `https://api.ebay.com/oauth/api_scope/sell.edelivery` | Digital delivery API | International shipping, eDelivery services |
| `https://api.ebay.com/oauth/api_scope/commerce.shipping` | Shipping services | Advanced shipping operations |

#### Sandbox-Only Scopes

**Buy API Scopes (8 scopes)** - For testing buyer-facing features:
```
https://api.ebay.com/oauth/api_scope/buy.order.readonly
https://api.ebay.com/oauth/api_scope/buy.guest.order
https://api.ebay.com/oauth/api_scope/buy.shopping.cart
https://api.ebay.com/oauth/api_scope/buy.offer.auction
https://api.ebay.com/oauth/api_scope/buy.item.feed
https://api.ebay.com/oauth/api_scope/buy.marketing
https://api.ebay.com/oauth/api_scope/buy.product.feed
https://api.ebay.com/oauth/api_scope/buy.marketplace.insights
```

**Extended Identity Scopes (5 scopes)** - For testing identity verification:
```
https://api.ebay.com/oauth/api_scope/commerce.identity.email.readonly
https://api.ebay.com/oauth/api_scope/commerce.identity.phone.readonly
https://api.ebay.com/oauth/api_scope/commerce.identity.address.readonly
https://api.ebay.com/oauth/api_scope/commerce.identity.name.readonly
https://api.ebay.com/oauth/api_scope/commerce.identity.status.readonly
```

**Other Sandbox-Only Scopes**:
```
https://api.ebay.com/oauth/api_scope/sell.item.draft
https://api.ebay.com/oauth/api_scope/sell.item
https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly
https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly
```

#### Common Scopes (Both Environments)

These 21 scopes work in **both** Production and Sandbox:

**Core Access**:
```
https://api.ebay.com/oauth/api_scope
```

**Sell APIs**:
```
https://api.ebay.com/oauth/api_scope/sell.marketing.readonly
https://api.ebay.com/oauth/api_scope/sell.marketing
https://api.ebay.com/oauth/api_scope/sell.inventory.readonly
https://api.ebay.com/oauth/api_scope/sell.inventory
https://api.ebay.com/oauth/api_scope/sell.account.readonly
https://api.ebay.com/oauth/api_scope/sell.account
https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly
https://api.ebay.com/oauth/api_scope/sell.fulfillment
https://api.ebay.com/oauth/api_scope/sell.analytics.readonly
https://api.ebay.com/oauth/api_scope/sell.finances
https://api.ebay.com/oauth/api_scope/sell.payment.dispute
https://api.ebay.com/oauth/api_scope/sell.reputation
https://api.ebay.com/oauth/api_scope/sell.reputation.readonly
https://api.ebay.com/oauth/api_scope/sell.stores
https://api.ebay.com/oauth/api_scope/sell.stores.readonly
```

**Commerce APIs**:
```
https://api.ebay.com/oauth/api_scope/commerce.identity.readonly
https://api.ebay.com/oauth/api_scope/commerce.notification.subscription
https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly
https://api.ebay.com/oauth/api_scope/commerce.vero
https://api.ebay.com/oauth/api_scope/commerce.feedback
https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly
```

### Scope Requirements by API

Complete mapping of API operations to required OAuth scopes.

#### Account Management API

| Operation | Required Scope | Read/Write |
|-----------|---------------|------------|
| Get/Create/Update/Delete fulfillment policies | `sell.account` | Write |
| Get fulfillment policies | `sell.account.readonly` | Read |
| Get/Create/Update/Delete payment policies | `sell.account` | Write |
| Get payment policies | `sell.account.readonly` | Read |
| Get/Create/Update/Delete return policies | `sell.account` | Write |
| Get return policies | `sell.account.readonly` | Read |
| Get/Set sales tax | `sell.account` | Write |
| Get sales tax | `sell.account.readonly` | Read |

#### Inventory Management API

| Operation | Required Scope | Read/Write |
|-----------|---------------|------------|
| Create/Update/Delete inventory items | `sell.inventory` | Write |
| Get inventory items | `sell.inventory.readonly` | Read |
| Create/Update/Delete offers | `sell.inventory` | Write |
| Get offers | `sell.inventory.readonly` | Read |
| Publish/Withdraw offer | `sell.inventory` | Write |
| Manage inventory locations | `sell.inventory` | Write |
| Get product compatibility | `sell.inventory.readonly` | Read |

#### Order Fulfillment API

| Operation | Required Scope | Read/Write |
|-----------|---------------|------------|
| Get orders | `sell.fulfillment.readonly` | Read |
| Create shipping fulfillment | `sell.fulfillment` | Write |
| Issue refund | `sell.fulfillment` | Write |

#### Marketing API

| Operation | Required Scope | Read/Write |
|-----------|---------------|------------|
| Get campaigns | `sell.marketing.readonly` | Read |
| Create/Update/Pause/Resume/End campaign | `sell.marketing` | Write |
| Get/Create/Update promotions | `sell.marketing` | Write |

#### Analytics API

| Operation | Required Scope | Read/Write |
|-----------|---------------|------------|
| Get traffic report | `sell.analytics.readonly` | Read |
| Get customer service metrics | `sell.analytics.readonly` | Read |
| Get seller standards profiles | `sell.analytics.readonly` | Read |

#### Communication APIs

| Operation | Required Scope | Read/Write |
|-----------|---------------|------------|
| **Messaging** - Search/Send messages | `commerce.message` (Production only) | Read/Write |
| **Feedback** - Get/Leave feedback | `commerce.feedback` | Write |
| **Feedback** - Get feedback | `commerce.feedback.readonly` | Read |
| **Negotiation** - Manage offers to buyers | `sell.inventory` | Read/Write |

#### Other APIs

| API | Required Scope | Notes |
|-----|---------------|-------|
| **Taxonomy** | `https://api.ebay.com/oauth/api_scope` | Public data |
| **Metadata** | `https://api.ebay.com/oauth/api_scope` | Public data |
| **Identity** | `commerce.identity.readonly` | Basic identity |
| **eDelivery** | `sell.edelivery` | Production only |
| **Shipping** | `commerce.shipping` | Production only |
| **Dispute** | `sell.payment.dispute` | Payment disputes |
| **Compliance** | `sell.inventory.readonly` | Listing violations |
| **VERO** | `commerce.vero` | IP rights |

For complete scope requirements, see the [Scope Requirement Matrix](#scope-requirement-matrix) below.

### Scope Selection Strategies

#### 1. Minimal Scopes (Read-Only)

For applications that only need to read data:

```javascript
const readOnlyScopes = [
  "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
  "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
  "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
];
```

#### 2. Full Seller Scopes (Read/Write)

For full seller functionality:

```javascript
const sellerScopes = [
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
  "https://api.ebay.com/oauth/api_scope/sell.account",
  "https://api.ebay.com/oauth/api_scope/sell.marketing",
  "https://api.ebay.com/oauth/api_scope/sell.finances",
  "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
  "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
];
```

#### 3. All Scopes (Maximum Access)

Let the server auto-select environment-appropriate scopes:

```javascript
// Don't specify scopes parameter - uses defaults for current environment
const result = await use_mcp_tool("ebay_get_oauth_url", {
  redirectUri: "https://your-app.com/callback"
  // No scopes parameter
});
// Production: 27 scopes | Sandbox: 35 scopes
```

#### 4. Use Case-Specific Combinations

**Inventory Manager App**:
```
sell.inventory
sell.account.readonly
commerce.identity.readonly
```

**Order Fulfillment App**:
```
sell.fulfillment
sell.finances
commerce.identity.readonly
```

**Marketing Dashboard**:
```
sell.marketing
sell.inventory.readonly
sell.analytics.readonly
```

**Complete Seller Portal**:
```
sell.inventory
sell.fulfillment
sell.account
sell.marketing
sell.finances
sell.analytics.readonly
commerce.identity.readonly
commerce.notification.subscription
```

---

## Token Management

### Automatic Token Setup

The recommended approach using MCP tools:

#### Step 1: Generate OAuth URL

```javascript
const result = await use_mcp_tool("ebay_get_oauth_url", {
  redirectUri: "https://your-app.com/callback",
  // Optional: custom scopes (omit to use environment defaults)
  scopes: [
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment"
  ],
  // Optional: CSRF protection
  state: "random-state-string"
});

console.log(result.authorizationUrl);
// User opens this URL in browser
```

#### Step 2: User Authorization

User opens the URL, logs into eBay, and grants permissions. After authorization, eBay redirects to your `redirect_uri` with a `code` parameter:

```
https://your-app.com/callback?code=v%5E1.1%23i%23...&state=random-state-string
```

#### Step 3: Set User Tokens

```javascript
await use_mcp_tool("ebay_set_user_tokens", {
  accessToken: "v^1.1#i^1#...",
  refreshToken: "v^1.1#i^1#..."
});
```

Tokens are automatically:
- Stored in `.env` file as `EBAY_USER_REFRESH_TOKEN` (project root directory)
- Loaded on server startup
- Refreshed when access token expires

### Manual Token Configuration

You have **four methods** to configure OAuth tokens for development and testing. Choose based on your workflow:

---

#### Method 1: Automatic Setup (⚡ Fastest - Recommended)

**Best for:** Quick start, multi-client setup, single source of truth, automatic configuration

Use the automatic setup system that runs during installation:

```bash
# Step 1: Configure .env file
cp .env.example .env
nano .env  # Add your eBay credentials

# Step 2: Run automatic setup (also runs after npm install)
npm run auto-setup
```

**What this workflow does:**

**Step 1** (Configure `.env`):
- 🔑 Add your eBay credentials (EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_ENVIRONMENT)
- 🎟️ Optionally add user tokens (EBAY_USER_ACCESS_TOKEN, EBAY_USER_REFRESH_TOKEN)
- 🔧 Set redirect URI (EBAY_REDIRECT_URI)

**Step 2** (`npm run auto-setup`):
- ✅ Detects installed MCP clients (Claude Desktop, Gemini, ChatGPT)
- ✅ Auto-generates configs for detected clients
- ✅ Validates tokens from `.env` file
- ✅ Backs up existing configs before modifying
- ✅ Works on macOS, Linux, and Windows

**Benefits:**
- ✅ One command setup for all MCP clients
- ✅ Runs automatically after `npm install`
- ✅ No external dependencies (no jq required)
- ✅ Easy to update and maintain
- ✅ Supports Claude Desktop, Gemini, and ChatGPT

**Example .env:**
```bash
# Required
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox
EBAY_REDIRECT_URI=https://your-app.com/callback

# Optional (for high rate limits)
EBAY_USER_ACCESS_TOKEN=v^1.1#i^1#...
EBAY_USER_REFRESH_TOKEN=v^1.1#i^1#...
```

**Security:**
- ⚠️ **File:** `.env` (project root)
- ⚠️ **Permissions:** Recommended `chmod 600 .env`
- ⚠️ **Never commit to version control!** (already in `.gitignore`)

For more details, see [AUTO-SETUP.md](../AUTO-SETUP.md).

---

#### Method 2: MCP Client Configuration (⚡ Quick Setup)

**Best for:** Production use, quick setup, avoiding manual file editing, all MCP clients

**How it works:**
1. Configure eBay credentials in your MCP client config (e.g., `claude_desktop_config.json`)
2. Use the `ebay_set_user_tokens` tool to save tokens
3. Tokens automatically persist to `.env (tokens stored as EBAY_USER_REFRESH_TOKEN)`

**Example Configuration:**

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "ebay": {
      "command": "node",
      "args": ["/absolute/path/to/ebay-api-mcp-server/build/index.js"],
      "env": {
        "EBAY_CLIENT_ID": "your_client_id",
        "EBAY_CLIENT_SECRET": "your_client_secret",
        "EBAY_ENVIRONMENT": "sandbox",
        "EBAY_REDIRECT_URI": "https://your-redirect-uri.com/callback"
      }
    }
  }
}
```

**Then in your MCP client:**
```
Use tool: ebay_set_user_tokens
Parameters:
  - accessToken: "v^1.1#i^1#..."
  - refreshToken: "v^1.1#i^1#..."
```

**Benefits:**
- ✅ No manual file editing required
- ✅ Tokens managed through MCP interface
- ✅ Easy to update and rotate tokens
- ✅ Works across all MCP clients
- ✅ Automatic persistence to file

---

#### Token Storage & Security

**Environment-Based Storage:**
- Location: `.env` file in project root (same folder as `package.json`)
- Variable: `EBAY_USER_REFRESH_TOKEN=v^1.1#...`
- Validated automatically by `npm run auto-setup`
- Can be updated via `ebay_set_user_tokens_with_expiry` tool (memory-only, requires manual .env update)

**Security:**
- ✅ Already protected in `.gitignore` (line 17) - won't be committed to git
- ⚠️ **Recommended:** Set file permissions to user-only (600):
  ```bash
  chmod 600 .env
  ```
- ⚠️ **Never commit actual tokens to version control**
- ⚠️ **Rotate tokens regularly** (especially if exposed)

---

#### Authentication Priority

The server checks for tokens in this order:

1. **Environment Variable** (`EBAY_USER_REFRESH_TOKEN` in `.env`) - Highest priority
   - Loaded automatically on server startup
   - Immediately refreshed to get valid access token

2. **Runtime Token Setting** - Via `ebay_set_user_tokens_with_expiry` tool
   - Stores tokens in memory only (not persisted to .env)
   - Requires manual .env update for persistence across restarts

3. **Client Credentials** - Fallback (lowest priority)
   - Only if no user tokens available
   - Lower rate limits (1,000 requests/day vs 10,000-50,000)
   - Limited API access

---

## Environment Differences

### Production vs Sandbox

Understanding environment-specific scopes is critical for proper authentication.

#### Quick Comparison

| Feature | Production | Sandbox |
|---------|-----------|---------|
| **Total Scopes** | 27 | 35 |
| **Buy API Scopes** | ❌ Not available | ✅ Available (8 scopes) |
| **Extended Identity** | ❌ Basic only | ✅ Email, phone, address, name, status |
| **eDelivery** | ✅ Available | ❌ Not available |
| **Item Draft** | ❌ Not available | ✅ Available |
| **Commerce Shipping** | ✅ Available | ❌ Not available |

#### Scope Validation

The MCP server automatically validates scopes against the environment:

**On OAuth URL Generation**:
```javascript
const result = await use_mcp_tool("ebay_get_oauth_url", {
  scopes: [
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    "https://api.ebay.com/oauth/api_scope/sell.edelivery" // Production-only
  ]
});

// If EBAY_ENVIRONMENT=sandbox, you'll get a warning:
// {
//   "authorizationUrl": "...",
//   "warnings": [
//     "Scope \"sell.edelivery\" is only available in production, not sandbox"
//   ]
// }
```

**On Server Startup**:
```
⚠️  Token scope validation warnings:
  - Scope "https://api.ebay.com/oauth/api_scope/buy.browse"
    is only available in sandbox, not production.
Token will still be used, but some scopes may not work.
```

### Migration Between Environments

#### Sandbox → Production

```bash
# 1. Update environment
EBAY_ENVIRONMENT=production

# 2. Update credentials in .env
EBAY_CLIENT_ID=production_client_id
EBAY_CLIENT_SECRET=production_client_secret

# 3. Clear old tokens
ebay_clear_tokens

# 4. Re-authenticate with production scopes
ebay_get_oauth_url
# (Omit Buy API and sandbox-specific scopes)

# 5. Set new tokens
ebay_set_user_tokens
```

#### Production → Sandbox

```bash
# 1. Update environment
EBAY_ENVIRONMENT=sandbox

# 2. Update credentials
EBAY_CLIENT_ID=sandbox_client_id
EBAY_CLIENT_SECRET=sandbox_client_secret

# 3. Clear tokens and re-authenticate
ebay_clear_tokens
ebay_get_oauth_url
ebay_set_user_tokens
```

---

## Troubleshooting

Complete guide to diagnosing and resolving common OAuth issues.

### Quick Diagnostics

#### Check Token Status (First Step)

```javascript
const status = await use_mcp_tool("ebay_get_token_status", {});
```

**Interpretation**:
```json
{
  "hasUserToken": true,         // ✅ User tokens are set
  "hasClientToken": false,       // Normal (client creds not cached)
  "scopeInfo": {
    "tokenScopes": [...],        // Scopes your token has
    "environmentScopes": [...],  // Scopes available in environment
    "missingScopes": [...]       // Scopes you lack
  }
}
```

**Red Flags**:
- `hasUserToken: false` → Using client credentials (1k req/day limit)
- `missingScopes` not empty → Some operations may fail
- Console warnings → Scope/environment mismatch

### Common Issues & Solutions

#### 1. "Access token is missing"

**Error**:
```
Error: Access token is missing. Please call ebay_set_user_tokens first.
```

**Cause**: No user tokens set, client credentials not being used.

**Solution**:
```javascript
// 1. Generate OAuth URL
const result = await use_mcp_tool("ebay_get_oauth_url", {});

// 2. User authorizes in browser

// 3. Set tokens
await use_mcp_tool("ebay_set_user_tokens", {
  accessToken: "v^1.1#...",
  refreshToken: "v^1.1#..."
});
```

**Alternative**: Check `.env` file for `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`, then restart server.

---

#### 2. "User authorization expired"

**Error**:
```
Error: User authorization expired. Please provide new access and refresh tokens.
```

**Cause**: Refresh token expired (~18 months since authorization).

**Solution**:
```javascript
// 1. Clear old tokens
await use_mcp_tool("ebay_clear_tokens", {});

// 2. Re-authorize (same as issue #1)
const result = await use_mcp_tool("ebay_get_oauth_url", {});
// ... follow authorization flow
```

**Prevention**: Re-authorize before 18 months expire.

---

#### 3. "Rate limit exceeded"

**Error**:
```
eBay API Error: Rate limit exceeded
```

**Cause**: Exceeded daily request limit.

**Check Token Type**:
```javascript
const status = await use_mcp_tool("ebay_get_token_status", {});
console.log(status.hasUserToken);
```

- `false` → Using client credentials (1,000 req/day)
- `true` → Using user tokens (10,000-50,000 req/day)

**Solution**:

**If using client credentials**:
1. Set up user tokens (10-50x higher limits)
2. Follow steps in issue #1

**If using user tokens**:
1. Check eBay seller account tier (Professional has higher limits)
2. Implement request throttling
3. Cache API responses
4. Use batch operations

**Temporary workaround**: Wait until tomorrow (limits reset daily)

---

#### 4. Scope validation warnings on startup

**Warning**:
```
⚠️  Token scope validation warnings:
  - Scope "buy.order.readonly" only available in sandbox, not production
```

**Cause**: Stored tokens have scopes from different environment.

**Impact**:
- Tokens still work
- Some scopes may be rejected
- Some operations may fail with 403

**Solution if you switched environments**:
```javascript
// 1. Clear tokens
await use_mcp_tool("ebay_clear_tokens", {});

// 2. Update .env
EBAY_ENVIRONMENT=production  // or sandbox

// 3. Restart MCP server

// 4. Re-authorize
await use_mcp_tool("ebay_get_oauth_url", {});
```

**If you didn't switch**: Ignore if everything works, or re-authorize for clean scopes.

---

#### 5. "403 Forbidden" on API calls

**Error**:
```
eBay API Error: Forbidden. Access is not allowed.
```

**Cause**: Missing required scope for operation.

**Diagnosis**:

1. **Find required scope**:
   - Check [Scope Requirements Matrix](#scope-requirements-by-api)
   - Note the scope needed for your operation

2. **Check your token scopes**:
   ```javascript
   const status = await use_mcp_tool("ebay_get_token_status", {});
   console.log(status.scopeInfo.tokenScopes);
   ```

3. **Compare**:
   - Is required scope in `tokenScopes`?
   - If no → Missing scope (re-authorize)
   - If yes → Different issue (check credentials, environment)

**Solution - Re-authorize with required scope**:
```javascript
const result = await use_mcp_tool("ebay_get_oauth_url", {
  scopes: [
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
    // Add other needed scopes
  ]
});
```

**Or use all scopes**:
```javascript
// Omit scopes parameter to get all environment-specific scopes
const result = await use_mcp_tool("ebay_get_oauth_url", {});
```

---

#### 6. "Scope not recognized for environment"

**Warning**:
```
Scope "sell.edelivery" only available in production, not sandbox
```

**Cause**: Requested scope not available in current environment.

**Impact**:
- eBay may reject scope during authorization
- Related API calls may fail

**Solution**:

**Check environment**:
```bash
echo $EBAY_ENVIRONMENT
# Should output: sandbox or production
```

**If environment is correct**:
- Don't request that scope
- See environment-specific scope lists above

**If environment is wrong**:
```bash
# Update .env
EBAY_ENVIRONMENT=production

# Restart server, re-authorize
```

---

#### 7. Tokens work in sandbox but not production

**Symptom**: Sandbox works, production returns errors.

**Cause**: Using sandbox credentials in production (or vice versa).

**Solution**:

1. **Get correct credentials** from eBay Developer Portal:
   - Sandbox keys (under "Sandbox Keys")
   - Production keys (under "Production Keys")
   - **They are different!**

2. **Update `.env`**:
   ```env
   EBAY_CLIENT_ID=your-production-client-id
   EBAY_CLIENT_SECRET=your-production-client-secret
   EBAY_ENVIRONMENT=production
   ```

3. **Restart server**

4. **Clear old tokens and re-authorize**:
   ```javascript
   await use_mcp_tool("ebay_clear_tokens", {});
   await use_mcp_tool("ebay_get_oauth_url", {});
   ```

---

#### 8. "Invalid scope" error from eBay

**Error**:
```
eBay API Error: Invalid scope requested
```

**Causes**:
- Typo in scope name
- Scope doesn't exist
- Scope not available for your account type

**Solution**:

1. **Check scope spelling** (case-sensitive!):
   - See [`production_scopes.json`](./production_scopes.json)
   - See [`sandbox_scopes.json`](./sandbox_scopes.json)

2. **Check account eligibility**:
   - Some scopes require Professional seller account
   - Some require enrollment in specific eBay programs

3. **Use default scopes**:
   ```javascript
   // Let server choose valid scopes for your environment
   const result = await use_mcp_tool("ebay_get_oauth_url", {});
   ```

---

#### 9. Missing scopes in token status

**Symptom**:
```json
{
  "scopeInfo": {
    "missingScopes": [
      "sell.marketing",
      "sell.analytics.readonly"
    ]
  }
}
```

**Meaning**: Token doesn't have these scopes, but environment supports them.

**Impact**:
- Operations requiring these scopes will fail
- Other operations work fine

**When to fix**:
- **Now** - If you need those operations
- **Later** - If you might need them
- **Never** - If you don't use those APIs

**Solution (if needed)**:
```javascript
const result = await use_mcp_tool("ebay_get_oauth_url", {
  scopes: [
    // Include all current scopes
    "https://api.ebay.com/oauth/api_scope/sell.inventory",
    // Plus new scopes
    "https://api.ebay.com/oauth/api_scope/sell.marketing",
    "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly"
  ]
});
```

---

#### 10. Token refresh failures

**Error**:
```
Failed to refresh token: invalid_grant
```

**Causes**:
1. Refresh token expired (18 months)
2. User revoked authorization
3. Token manually invalidated

**Solution**:
```javascript
// Clear and re-authorize
await use_mcp_tool("ebay_clear_tokens", {});
await use_mcp_tool("ebay_get_oauth_url", {});
```

**Prevention**:
- Monitor token expiry
- Re-authorize before 18 months
- Don't share tokens between servers

---

### Diagnostic Checklist

Use this systematic checklist to diagnose issues:

- [ ] Run `ebay_get_token_status` - what does it show?
- [ ] Check console logs - any warnings or errors?
- [ ] Verify `.env` file settings:
  - [ ] `EBAY_CLIENT_ID` set?
  - [ ] `EBAY_CLIENT_SECRET` set?
  - [ ] `EBAY_ENVIRONMENT` correct (matches credentials)?
  - [ ] `EBAY_REDIRECT_URI` set (if using OAuth flow)?
  - [ ] `EBAY_USER_REFRESH_TOKEN` set (for user tokens)?
- [ ] Environment match:
  - [ ] Sandbox credentials with `EBAY_ENVIRONMENT=sandbox`?
  - [ ] Production credentials with `EBAY_ENVIRONMENT=production`?
- [ ] Scope requirements:
  - [ ] Does operation require specific scopes?
  - [ ] Do your tokens have those scopes?

### When to Re-Authorize

Re-authorize when:

1. **First time setup** - No tokens set
2. **After 18 months** - Refresh token expiry
3. **Switching environments** - Sandbox ↔ Production
4. **Changing credentials** - New client ID/secret
5. **After clearing tokens** - `ebay_clear_tokens` called
6. **Need new scopes** - Missing required scopes
7. **After revocation** - User revoked app access
8. **Errors persist** - Nuclear option: clear and re-auth

### Advanced Troubleshooting

#### Check Environment Variables Directly

```bash
grep EBAY_USER_REFRESH_TOKEN .env
```

(`.env` file is located in the project root directory)

**Expected format**:
```bash
EBAY_USER_REFRESH_TOKEN=v^1.1#i^1#...
```

**Issues**:
- Variable not set → No user tokens configured (will use client credentials)
- Empty value → Token was cleared
- Server not starting → Check token validity with `ebay_get_token_status` tool

#### Manual OAuth Test

Test outside MCP server:

```bash
# 1. Get authorization URL
curl "https://auth.sandbox.ebay.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=https://api.ebay.com/oauth/api_scope/sell.inventory"

# 2. Open in browser, authorize

# 3. Exchange code for token
curl -X POST https://api.sandbox.ebay.com/identity/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic BASE64(CLIENT_ID:CLIENT_SECRET)" \
  -d "grant_type=authorization_code&code=AUTH_CODE&redirect_uri=YOUR_REDIRECT_URI"
```

- If this works → Issue with MCP server
- If this fails → Issue with eBay credentials

#### Enable Debug Logging

Edit `src/auth/oauth.ts` to add console logging:

```typescript
async getAccessToken(): Promise<string> {
  console.log('[DEBUG] Getting access token...');
  console.log('[DEBUG] Has user tokens:', this.userTokens !== null);

  if (this.userTokens) {
    console.log('[DEBUG] Token expiry:', new Date(this.userTokens.accessTokenExpiry));
    console.log('[DEBUG] Is expired:', TokenStorage.isAccessTokenExpired(this.userTokens));
  }
  // ... rest of method
}
```

Rebuild and restart:
```bash
npm run build
# Restart MCP server
```

### Getting Help

If none of these solutions work:

1. **Check MCP server logs** - Additional error details
2. **Check eBay API status** - https://developer.ebay.com/support/api-status
3. **Verify account status** - Some operations require approval
4. **Review eBay docs** - https://developer.ebay.com/api-docs
5. **Open GitHub issue** - Include:
   - Error message (sanitize tokens!)
   - Reproduction steps
   - `ebay_get_token_status` output
   - Environment (sandbox/production)

---

## Best Practices

### General Best Practices

1. **Request Only Needed Scopes** - Don't request all scopes if you only need a few APIs
2. **Use Readonly When Possible** - Reduces risk if token is compromised
3. **Monitor Token Status** - Use `ebay_get_token_status` to check validity
4. **Handle Refresh Gracefully** - Server auto-refreshes, but handle expiry in your app
5. **Test in Sandbox First** - Always test scope changes in sandbox before production
6. **Store Tokens Securely** - Protect `.env` file with user-only permissions (chmod 600)
7. **Rotate Tokens Regularly** - Re-authorize periodically for security

### Environment-Specific Best Practices

#### Match Scopes to Environment

**❌ DON'T**:
```javascript
// Using production-only scope in sandbox
const scopes = [
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.edelivery"  // Production-only!
];
// In sandbox environment - will fail
```

**✅ DO**:
```javascript
// Use environment-appropriate scopes
const environment = process.env.EBAY_ENVIRONMENT || "sandbox";

const scopes = ["https://api.ebay.com/oauth/api_scope/sell.inventory"];
if (environment === "production") {
  scopes.push("https://api.ebay.com/oauth/api_scope/sell.edelivery");
}
```

#### Use Default Scopes

**Recommended**:
```javascript
// Let server auto-select environment-appropriate scopes
const result = await use_mcp_tool("ebay_get_oauth_url", {
  redirectUri: "https://your-app.com/callback"
  // No scopes parameter - uses defaults
});
```

#### Testing Workflow

1. **Develop in Sandbox**:
   ```bash
   EBAY_ENVIRONMENT=sandbox
   ```
   - Test with sandbox-specific scopes
   - Validate core functionality

2. **Deploy to Production**:
   ```bash
   EBAY_ENVIRONMENT=production
   ```
   - Re-authenticate with production scopes
   - Remove sandbox-only scopes
   - Test production-specific features

### Scope Hierarchy & Dependencies

#### Write Implies Read

If you have write access, you can also read:
- `sell.inventory` → Includes `sell.inventory.readonly`
- `sell.fulfillment` → Includes `sell.fulfillment.readonly`
- `sell.account` → Includes `sell.account.readonly`

#### Dependent Operations

**Publishing an offer requires**:
- `sell.inventory` (create/update offer)
- `sell.account` (policies must exist)
- `sell.fulfillment` (for shipping)

**Creating a campaign requires**:
- `sell.marketing` (campaign operations)
- `sell.inventory.readonly` (verify items exist)

---

## Tools Reference

### ebay_get_token_status

Check current authentication status.

```javascript
const status = await use_mcp_tool("ebay_get_token_status", {});
```

**Returns**:
```json
{
  "hasUserToken": boolean,
  "hasClientToken": boolean,
  "scopeInfo": {
    "tokenScopes": string[],
    "environmentScopes": string[],
    "missingScopes": string[]
  }
}
```

### ebay_get_oauth_url

Generate OAuth authorization URL.

```javascript
const result = await use_mcp_tool("ebay_get_oauth_url", {
  redirectUri: "https://your-app.com/callback",  // Optional
  scopes: ["scope1", "scope2"],                   // Optional (uses defaults if omitted)
  state: "random-csrf-token"                      // Optional
});
```

**Returns**:
```json
{
  "authorizationUrl": "https://auth.ebay.com/oauth2/authorize?...",
  "warnings": ["..."]  // If any scopes are invalid for environment
}
```

### ebay_set_user_tokens

Store user OAuth tokens.

```javascript
await use_mcp_tool("ebay_set_user_tokens", {
  accessToken: "v^1.1#i^1#...",
  refreshToken: "v^1.1#i^1#..."
});
```

Tokens are stored in memory only. For persistence across server restarts, manually add `EBAY_USER_REFRESH_TOKEN` to `.env` file.

### ebay_clear_tokens

Remove all stored tokens.

```javascript
await use_mcp_tool("ebay_clear_tokens", {});
```

Clears both user tokens and cached client credentials.

---

## Additional Resources

- **eBay Developer Portal**: https://developer.ebay.com
- **eBay API Documentation**: https://developer.ebay.com/api-docs
- **OAuth 2.0 Guide**: https://developer.ebay.com/api-docs/static/oauth-authorization-code-grant.html
- **OAuth Scopes Reference**: https://developer.ebay.com/api-docs/static/oauth-scopes.html
- **Sandbox vs Production**: https://developer.ebay.com/api-docs/static/ebay-rest/sandbox.html

---

## Scope Update Policy

eBay may add new scopes over time. This server:
- ✅ Allows unrecognized scopes (forwards to eBay)
- ⚠️ Warns about unrecognized scopes
- 📝 Logs warnings for debugging
- 🔄 Update JSON files periodically

**To update scope files**:
1. Check eBay Developer Portal for new scopes
2. Update `production_scopes.json` and `sandbox_scopes.json`
3. Rebuild: `npm run build`
4. Restart MCP server

---

**Last Updated**: 2025-11-11
**Server Version**: 1.0.0
**Status**: Environment-specific scope validation active
