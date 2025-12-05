# eBay MCP Server Configuration Guide

This guide provides detailed instructions for configuring the eBay MCP server, including all required environment variables, the OAuth authentication flow, and token management.

## Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Getting eBay Credentials](#getting-ebay-credentials)
- [Authentication Methods](#authentication-methods)
- [OAuth 2.0 Flow (User Tokens)](#oauth-20-flow-user-tokens)
- [Token Management](#token-management)
- [Example Configuration](#example-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The eBay MCP server requires configuration through environment variables stored in a `.env` file. These variables control authentication, API endpoints, and token management. The server supports two authentication methods:

1. **Client Credentials Flow** (Default) - Lower rate limits (1,000 requests/day)
2. **OAuth 2.0 Authorization Code Grant Flow** (Recommended) - Higher rate limits (10,000-50,000 requests/day)

## Environment Variables

### Required: eBay Application Credentials

These credentials are obtained from the [eBay Developer Portal](https://developer.ebay.com/).

#### `EBAY_CLIENT_ID`

- **Description:** Your eBay App ID (also called Client ID)
- **Where to Find:** 
  1. Log in to [eBay Developer Portal](https://developer.ebay.com/)
  2. Navigate to **My Account** → **Keys & Tokens**
  3. Find your application's **App ID (Client ID)**
- **Example:** `YourAppId-Prod-1234-5678-90ab-cdef`
- **Required:** Yes (for all authentication methods)
- **Note:** This is a public identifier and can be safely shared, but should still be kept secure

#### `EBAY_CLIENT_SECRET`

- **Description:** Your eBay Cert ID (also called Client Secret)
- **Where to Find:**
  1. Log in to [eBay Developer Portal](https://developer.ebay.com/)
  2. Navigate to **My Account** → **Keys & Tokens**
  3. Find your application's **Cert ID (Client Secret)**
- **Example:** `YourAppId-Prod-1234-5678-90ab-cdef-YourSecretKey`
- **Required:** Yes (for all authentication methods)
- **Security:** ⚠️ **KEEP THIS SECRET** - Never commit this to version control or share it publicly

#### `EBAY_REDIRECT_URI`

- **Description:** Your RuName (Redirect URL name) registered with your eBay application
- **Where to Find:**
  1. Log in to [eBay Developer Portal](https://developer.ebay.com/)
  2. Navigate to **My Account** → **OAuth Settings** or visit:
     - Sandbox: https://developer.ebay.com/my/auth?env=sandbox&index=0
     - Production: https://developer.ebay.com/my/auth?env=production&index=0
  3. Find your **RuName** (Redirect URL name) - it will look like: `YourAppId-YourAppId-abc-def-ghi`
- **Example:** `YourAppId-YourAppId-abc-def-ghi`
- **Required:** Yes (for OAuth user token flow)
- **Important:** This is **NOT** a full URL - it's just the RuName identifier. The server constructs the full redirect URL automatically.

#### `EBAY_ENVIRONMENT`

- **Description:** The eBay API environment to use
- **Valid Values:**
  - `sandbox` - For testing and development (recommended for initial setup)
  - `production` - For live eBay marketplace operations
- **Default:** `sandbox` (if not specified)
- **Required:** Yes
- **Recommendation:** Start with `sandbox` for testing, then switch to `production` when ready

### Required: User Refresh Token (For OAuth Flow)

#### `EBAY_USER_REFRESH_TOKEN`

- **Description:** Long-lived refresh token obtained through the OAuth 2.0 authorization code flow
- **How to Obtain:** See [OAuth 2.0 Flow](#oauth-20-flow-user-tokens) section below
- **Example:** `v^1.1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...`
- **Required:** No (only needed for higher rate limits via user token authentication)
- **Lifespan:** Typically 18 months (varies by eBay account)
- **Security:** ⚠️ **KEEP THIS SECRET** - This token provides long-term access to your eBay account
- **Note:** Once set, the server automatically uses this to refresh access tokens when they expire

### Auto-Generated (Do Not Set Manually)

These variables are automatically managed by the server. You should **NOT** set them manually in your `.env` file unless you have a specific reason.

#### `EBAY_USER_ACCESS_TOKEN`

- **Description:** Short-lived access token used for making API calls
- **Auto-Generated:** Yes - Automatically created and refreshed by the server using `EBAY_USER_REFRESH_TOKEN`
- **Lifespan:** Typically 2 hours
- **Management:** The server automatically refreshes this token when it expires (using the refresh token)
- **When to Set Manually:** Only if you're manually managing tokens (not recommended)

#### `EBAY_APP_ACCESS_TOKEN`

- **Description:** Application-level access token for client credentials flow
- **Auto-Generated:** Yes - Automatically created when using client credentials authentication
- **Lifespan:** Typically 2 hours
- **Management:** The server automatically refreshes this token when it expires
- **When to Set Manually:** Only if you're manually managing tokens (not recommended)

## Getting eBay Credentials

### Step 1: Create an eBay Developer Account

1. Visit [eBay Developer Portal](https://developer.ebay.com/)
2. Click **Join** or **Sign In** if you already have an account
3. Complete the registration process

### Step 2: Create an Application

1. Log in to the [eBay Developer Portal](https://developer.ebay.com/)
2. Navigate to **My Account** → **Keys & Tokens**
3. Click **Create an App Key** or **Get Your App Keys**
4. Fill in the application details:
   - **App Name:** Choose a descriptive name
   - **Environment:** Select Sandbox (for testing) or Production
   - **OAuth Redirect URI (RuName):** eBay will generate this automatically, or you can create a custom one
5. Save your credentials:
   - **App ID (Client ID)** → This is your `EBAY_CLIENT_ID`
   - **Cert ID (Client Secret)** → This is your `EBAY_CLIENT_SECRET`
   - **RuName (Redirect URI)** → This is your `EBAY_REDIRECT_URI`

### Step 3: Configure OAuth Settings

1. Navigate to **My Account** → **OAuth Settings**
2. Verify your **RuName (Redirect URL name)** is correctly configured
3. Note the RuName value - this is what you'll use for `EBAY_REDIRECT_URI`

## Authentication Methods

### Client Credentials Flow (Default)

**Best For:** Development, testing, low-volume operations

**Rate Limits:** 1,000 requests per day

**Setup Required:**
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`
- `EBAY_ENVIRONMENT`

**How It Works:**
1. Server automatically requests an app-level access token using client credentials
2. Token is cached and automatically refreshed when expired
3. No user interaction required

**Advantages:**
- Simple setup (just Client ID and Secret)
- No OAuth flow required
- Automatic token management

**Disadvantages:**
- Lower rate limits (1,000 requests/day)
- Limited to application-level permissions

### OAuth 2.0 Authorization Code Grant Flow (Recommended)

**Best For:** Production, high-volume operations

**Rate Limits:** 10,000-50,000 requests per day (varies by account type)

**Setup Required:**
- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`
- `EBAY_REDIRECT_URI` (RuName)
- `EBAY_ENVIRONMENT`
- `EBAY_USER_REFRESH_TOKEN` (obtained through OAuth flow)

**How It Works:**
1. Generate OAuth authorization URL
2. User authorizes the application
3. Exchange authorization code for access and refresh tokens
4. Server automatically refreshes access tokens using the refresh token

**Advantages:**
- Higher rate limits (10,000-50,000 requests/day)
- User-level permissions
- Long-term authentication (refresh tokens last ~18 months)

**Disadvantages:**
- Requires initial OAuth flow setup
- User must authorize the application

## OAuth 2.0 Flow (User Tokens)

This section provides a step-by-step guide for obtaining user tokens through the OAuth 2.0 authorization code grant flow.

### Prerequisites

Before starting the OAuth flow, ensure you have:
- ✅ `EBAY_CLIENT_ID` set in your `.env` file
- ✅ `EBAY_CLIENT_SECRET` set in your `.env` file
- ✅ `EBAY_REDIRECT_URI` (RuName) set in your `.env` file
- ✅ `EBAY_ENVIRONMENT` set to `sandbox` or `production`

### Step-by-Step OAuth Flow

#### Step 1: Generate Authorization URL

Ask your AI assistant to generate an OAuth authorization URL:

**Example Request:**
> "Can you help me set up OAuth authentication for my eBay account? Please generate the authorization URL."

**What Happens:**
- The AI assistant uses the `ebay_get_oauth_url` tool
- The tool reads your `EBAY_CLIENT_ID`, `EBAY_REDIRECT_URI`, and `EBAY_ENVIRONMENT` from your `.env` file
- An authorization URL is generated with the appropriate scopes for your environment

**Response:**
The assistant will provide you with:
- An authorization URL (e.g., `https://signin.sandbox.ebay.com/signin?ru=...`)
- Instructions to open the URL in your browser
- Information about the scopes being requested

#### Step 2: Authorize the Application

1. **Open the Authorization URL** in your web browser
2. **Log in** to your eBay account (sandbox or production, depending on your environment)
3. **Review the permissions** being requested
4. **Click "Agree"** or "Authorize" to grant permissions

#### Step 3: Receive Authorization Code

After authorization, eBay will redirect you to your redirect URI with an authorization code:

**What You'll See:**
- The URL will contain a `code` parameter, e.g.:
  ```
  https://your-redirect-uri?code=v^1.1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...
  ```
- You may also see a `state` parameter (if provided)

**Important:** 
- The authorization code is **short-lived** (typically expires in 10 minutes)
- Copy the entire `code` value from the URL
- If you see the code in the URL fragment (after `#`), make sure to copy everything after `code=`

#### Step 4: Exchange Code for Tokens

Provide the authorization code to your AI assistant:

**Example Request:**
> "Here's my authorization code: `v^1.1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...` Please exchange it for tokens."

**What Happens:**
- The AI assistant uses the `ebay_set_user_tokens` or `ebay_set_user_tokens_with_expiry` tool
- Internally, the server calls `exchangeCodeForToken()` method
- The server exchanges the authorization code for:
  - An **access token** (short-lived, ~2 hours)
  - A **refresh token** (long-lived, ~18 months)
  - Token expiry information
  - Granted scopes

**Automatic Token Persistence:**
- The server automatically saves the `EBAY_USER_REFRESH_TOKEN` to your `.env` file
- The `EBAY_USER_ACCESS_TOKEN` is also saved (but will be refreshed automatically)
- You'll see a confirmation message indicating tokens were saved

**Response:**
The assistant will confirm:
- ✅ Token exchange successful
- ✅ Refresh token saved to `.env` file
- ✅ Access token automatically refreshed and ready to use

#### Step 5: Verify Configuration

After the OAuth flow completes, verify your configuration:

**Check Your `.env` File:**
```bash
# You should now see:
EBAY_USER_REFRESH_TOKEN=v^1.1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...
EBAY_USER_ACCESS_TOKEN=v^1.1#a^1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...
```

**Test Authentication:**
Ask your AI assistant to check token status:

**Example Request:**
> "Can you check the status of my eBay authentication tokens?"

The assistant will use the `ebay_get_token_status` tool to verify:
- ✅ User tokens are configured
- ✅ Access token is valid
- ✅ Refresh token is available
- ✅ Token expiry information

### OAuth Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Request OAuth URL
       ▼
┌─────────────────────────────────┐
│  AI Assistant                   │
│  Uses: ebay_get_oauth_url       │
└──────┬──────────────────────────┘
       │
       │ 2. Returns Authorization URL
       ▼
┌─────────────┐
│   User      │
│  Opens URL  │
│  in Browser │
└──────┬──────┘
       │
       │ 3. Authorizes Application
       ▼
┌─────────────────────────────────┐
│  eBay OAuth Server              │
│  Redirects with Authorization   │
│  Code                           │
└──────┬──────────────────────────┘
       │
       │ 4. User provides code
       ▼
┌─────────────────────────────────┐
│  AI Assistant                   │
│  Uses: ebay_set_user_tokens     │
│  (calls exchangeCodeForToken)   │
└──────┬──────────────────────────┘
       │
       │ 5. Exchanges code for tokens
       ▼
┌─────────────────────────────────┐
│  eBay OAuth Server              │
│  Returns:                       │
│  - Access Token                 │
│  - Refresh Token                │
│  - Expiry Times                 │
└──────┬──────────────────────────┘
       │
       │ 6. Saves tokens to .env
       ▼
┌─────────────────────────────────┐
│  .env File                      │
│  EBAY_USER_REFRESH_TOKEN=...    │
│  EBAY_USER_ACCESS_TOKEN=...      │
└─────────────────────────────────┘
```

## Token Management

### Automatic Token Refresh

Once `EBAY_USER_REFRESH_TOKEN` is set in your `.env` file, the server automatically manages access tokens:

1. **On Server Start:**
   - Server reads `EBAY_USER_REFRESH_TOKEN` from `.env`
   - Automatically refreshes to get a new access token
   - Updates `EBAY_USER_ACCESS_TOKEN` in `.env`

2. **During API Calls:**
   - Server checks if access token is expired
   - If expired, automatically refreshes using the refresh token
   - Updates `.env` file with new access token
   - Continues with the API call

3. **Token Expiry:**
   - **Access Tokens:** Expire after ~2 hours (automatically refreshed)
   - **Refresh Tokens:** Expire after ~18 months (requires re-authorization)

### Manual Token Refresh

If you need to manually refresh your access token:

**Example Request:**
> "Please refresh my eBay access token."

The AI assistant will use the `ebay_refresh_access_token` tool to:
- Check if a refresh token is available
- Refresh the access token
- Update the `.env` file
- Return the new token information

### Token Status Check

Check the current status of your tokens:

**Example Request:**
> "What's the status of my eBay authentication tokens?"

The assistant will use the `ebay_get_token_status` tool to show:
- Current authentication method (user tokens vs client credentials)
- Token validity
- Expiry information
- Available scopes

### Token Expiry Validation

Validate token expiry times and get recommendations:

**Example Request:**
> "Check if my tokens are expiring soon."

The assistant can use the `ebay_validate_token_expiry` tool to:
- Check if tokens are expired or expiring soon
- Provide recommendations (refresh access token, re-authorize, etc.)
- Show exact expiry dates

### Clearing Tokens

To clear all stored tokens and start fresh:

**Example Request:**
> "Clear all my eBay authentication tokens."

The assistant will use the `ebay_clear_tokens` tool to:
- Remove all tokens from memory
- Clear tokens from `.env` file (optional, depending on implementation)
- Require re-authentication for subsequent API calls

## Example Configuration

### Minimal Configuration (Client Credentials)

```bash
# .env file
EBAY_CLIENT_ID=YourAppId-Prod-1234-5678-90ab-cdef
EBAY_CLIENT_SECRET=YourAppId-Prod-1234-5678-90ab-cdef-YourSecretKey
EBAY_ENVIRONMENT=sandbox
```

**Rate Limits:** 1,000 requests/day

### Full Configuration (OAuth User Tokens)

```bash
# .env file

# Required: eBay Application Credentials
EBAY_CLIENT_ID=YourAppId-Prod-1234-5678-90ab-cdef
EBAY_CLIENT_SECRET=YourAppId-Prod-1234-5678-90ab-cdef-YourSecretKey
EBAY_REDIRECT_URI=YourAppId-YourAppId-abc-def-ghi
EBAY_ENVIRONMENT=sandbox

# Required: User Refresh Token (obtained through OAuth flow)
EBAY_USER_REFRESH_TOKEN=v^1.1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...

# Auto-generated (do not set manually - will be created automatically)
# EBAY_USER_ACCESS_TOKEN=
# EBAY_APP_ACCESS_TOKEN=
```

**Rate Limits:** 10,000-50,000 requests/day

### Production Configuration

```bash
# .env file
EBAY_CLIENT_ID=YourAppId-Prod-1234-5678-90ab-cdef
EBAY_CLIENT_SECRET=YourAppId-Prod-1234-5678-90ab-cdef-YourSecretKey
EBAY_REDIRECT_URI=YourAppId-YourAppId-abc-def-ghi
EBAY_ENVIRONMENT=production
EBAY_USER_REFRESH_TOKEN=v^1.1#r^1#i^1#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVXa2...
```

## Troubleshooting

### Common Issues

#### "EBAY_CLIENT_ID environment variable is required"

**Problem:** Client ID is missing or not set correctly.

**Solution:**
1. Verify your `.env` file exists in the project root
2. Check that `EBAY_CLIENT_ID` is set (no quotes needed)
3. Ensure there are no extra spaces around the `=` sign
4. Restart the MCP server after making changes

#### "Redirect URI is required"

**Problem:** `EBAY_REDIRECT_URI` is missing or incorrect.

**Solution:**
1. Verify your RuName in the [eBay Developer Portal](https://developer.ebay.com/my/auth)
2. Ensure `EBAY_REDIRECT_URI` is set to your RuName (not a full URL)
3. The RuName should look like: `YourAppId-YourAppId-abc-def-ghi`

#### "Failed to exchange code for token"

**Problem:** Authorization code exchange failed.

**Common Causes:**
- Authorization code expired (codes expire in ~10 minutes)
- Invalid authorization code
- Mismatched redirect URI
- Invalid client credentials

**Solution:**
1. Generate a new authorization URL and try again
2. Ensure you copy the **entire** code value from the redirect URL
3. Verify your `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, and `EBAY_REDIRECT_URI` are correct
4. Check that you're using the same environment (sandbox/production) for the OAuth flow

#### "Failed to refresh access token"

**Problem:** Refresh token is invalid or expired.

**Common Causes:**
- Refresh token expired (typically after 18 months)
- Refresh token was revoked
- Invalid refresh token format

**Solution:**
1. Run `npm run diagnose` to check token status
2. If the refresh token is expired, complete the OAuth flow again to get a new one
3. Verify the refresh token format starts with `v^1.1#`
4. Check your eBay Developer Portal for any account restrictions

#### "Rate limit exceeded"

**Problem:** You've exceeded your daily API request limit.

**Solution:**
1. **Upgrade to User Token Authentication:**
   - Complete the OAuth flow to get user tokens
   - User tokens provide 10,000-50,000 requests/day vs 1,000 for client credentials

2. **Check Your Current Usage:**
   - Visit [eBay Developer Portal - API Usage](https://developer.ebay.com/my/api_usage)
   - Monitor your daily request count

3. **Implement Request Throttling:**
   - Add delays between API calls
   - Batch operations when possible
   - Cache responses when appropriate

#### Tokens Not Persisting to .env

**Problem:** Tokens are not being saved to the `.env` file.

**Solution:**
1. Verify the `.env` file exists and is writable
2. Check file permissions (should be readable/writable by the process)
3. Ensure the `.env` file is in the project root directory
4. Check server logs for any file write errors

### Diagnostic Tools

The server includes diagnostic tools to help troubleshoot configuration issues:

#### Interactive Diagnostics

```bash
npm run diagnose
```

This interactive tool checks:
- Environment variable configuration
- eBay API connectivity
- Authentication status
- Token validity
- Available scopes and permissions

#### Export Diagnostic Report

```bash
npm run diagnose:export
```

Exports a detailed diagnostic report that you can share when seeking help.

### Getting Help

If you're still experiencing issues:

1. **Check Existing Resources:**
   - Review [GitHub Issues](https://github.com/YosefHayim/ebay-mcp/issues)
   - Search [GitHub Discussions](https://github.com/YosefHayim/ebay-mcp/discussions)

2. **Create a New Issue:**
   - Include your diagnostic report (`npm run diagnose:export`)
   - Provide steps to reproduce the problem
   - Include error messages or logs
   - Specify your environment (OS, Node version, MCP client)

3. **Verify eBay API Status:**
   - Check [eBay API Status](https://developer.ebay.com/support/api-status) for any service outages

## Additional Resources

- [eBay Developer Portal](https://developer.ebay.com/) - API documentation and credentials
- [eBay API License Agreement](https://developer.ebay.com/join/api-license-agreement) - Terms of use
- [eBay Data Handling Requirements](https://developer.ebay.com/api-docs/static/data-handling-update.html) - Data protection guidelines
- [Main README](../README.md) - Project overview and quick start
- [OAuth Setup Guide](./) - Additional OAuth documentation

---

**Need Help?** If you encounter issues not covered in this guide, please [open a GitHub issue](https://github.com/YosefHayim/ebay-mcp/issues) or [start a discussion](https://github.com/YosefHayim/ebay-mcp/discussions).
