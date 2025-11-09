# GEMINI.md - Project Context for AI Assistant

This document provides a comprehensive overview of the `ebay-api-mcp-server` project, intended to serve as instructional context for AI assistants.

## Project Overview

The `ebay-api-mcp-server` is a Model Context Protocol (MCP) server built with Node.js and TypeScript. Its primary purpose is to provide AI assistants with programmatic access to eBay's extensive suite of Sell APIs. This enables AI models to interact with eBay's seller functionality, including inventory management, order fulfillment, marketing campaigns, and account configuration, through a standardized protocol.

**Key Features:**
*   **Comprehensive API Access:** Provides access to core selling APIs (Account Management, Inventory Management, Order Management, Marketing, Analytics) and supporting APIs (Metadata & Taxonomy, Recommendation, Communication, Compliance, Identity, Translation, VERO, eDelivery).
*   **Model Context Protocol (MCP) Compliance:** Designed to integrate seamlessly with MCP-compatible AI clients like Claude Desktop and Claude Code, exposing eBay functionalities as discoverable and callable tools.
*   **OAuth 2.0 Authentication:** Handles eBay's OAuth 2.0 Client Credentials flow, including automatic token management and refreshing.
*   **Detailed Error Handling:** Provides specific error messages for authentication failures, API request errors, invalid parameters, and network issues.

## Technologies Used

*   **Node.js (18+):** Runtime environment.
*   **TypeScript:** For type-safe development.
*   **eBay Sell APIs:** The core functionality exposed by the server.
*   **Model Context Protocol (MCP):** The communication protocol for AI integration.

## Project Structure

```
src/
├── api/                          # eBay API client implementations
│   ├── account-management/       # Account API handlers
│   ├── analytics-and-report/     # Analytics API handlers
│   ├── communication/            # Message, Negotiation, Feedback, Notification
│   ├── listing-management/       # Inventory API handlers
│   ├── listing-metadata/         # Metadata and Taxonomy APIs
│   ├── marketing-and-promotions/ # Marketing and Recommendation APIs
│   ├── order-management/         # Fulfillment API handlers
│   ├── other/                    # Identity, Compliance, VERO, Translation, eDelivery
│   ├── client.ts                 # Base HTTP client with OAuth
│   └── index.ts                  # Main API facade
├── auth/                         # OAuth authentication
│   └── oauth.ts                  # eBay OAuth 2.0 client
├── config/                       # Configuration management
│   └── environment.ts            # Environment variable handling
├── tools/                        # MCP tool definitions
│   ├── tool-definitions.ts       # Tool schemas by category
│   └── index.ts                  # Tool execution logic
├── types/                        # TypeScript type definitions
│   └── ebay.ts                   # eBay API types
└── index.ts                      # MCP server entrypoint
```

## Building and Running

### Prerequisites

*   Node.js 18 or higher
*   eBay Developer account with API credentials

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ebay-api-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

Create a `.env` file by copying `.env.example` and populate it with your eBay API credentials:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here
EBAY_ENVIRONMENT=sandbox  # or 'production'
```

### Running the Server

*   **Development Mode (with hot reload):**
    ```bash
    npm run dev
    ```
*   **Production Mode:**
    ```bash
    npm start
    ```

## Development Commands

*   **Type Check:**
    ```bash
    npm run typecheck
    ```
*   **Watch Mode (for development):**
    ```bash
    npm run watch
    ```
*   **Clean Build Artifacts:**
    ```bash
    npm run clean
    ```
*   **Rebuild Project:**
    ```bash
    npm run build
    ```

## Development Conventions

*   All API implementations should match the OpenAPI specifications found in the `docs/` folder.
*   Adherence to TypeScript strict mode.
*   Proper error handling is crucial.
*   Tool definitions must follow the MCP specification.

## Authentication

The server utilizes eBay's OAuth 2.0 Client Credentials flow. Access tokens are automatically managed, refreshed, and cached with a 60-second safety buffer before expiry. All API requests automatically include valid authentication.

## Error Handling

The server provides detailed error messages for:
*   Authentication failures (invalid credentials, expired tokens).
*   eBay API request errors with specific messages.
*   Invalid parameters for tool arguments.
*   Network issues (connection timeouts, network errors).

Errors are returned in an MCP-compatible format for proper handling by AI clients.

## Best Practices for AI Integration

1.  **Start with Sandbox Environment:** Always test with `EBAY_ENVIRONMENT=sandbox` first before using production credentials.
2.  **Use Appropriate OAuth Scopes:** Ensure your eBay application has the necessary OAuth scopes (e.g., `https://api.ebay.com/oauth/api_scope`, `https://api.ebay.com/oauth/api_scope/sell.account`, `https://api.ebay.com/oauth/api_scope/sell.inventory`).
3.  **Handle Rate Limits:** Be aware that eBay enforces rate limits (default: 5,000 calls/day; burst: up to 10 calls/second). The client will return rate limit errors.
4.  **Secure Credential Storage:** Never commit `.env` files to version control. Use environment variables in production and rotate credentials regularly. Use separate credentials for sandbox and production.
5.  **Monitor API Usage:** Regularly check the eBay Developer Portal for API usage, deprecation notices, and call logs.

## Troubleshooting

*   **Server won't start:**
    *   Check Node.js version (must be 18+).
    *   Rebuild the project (`npm run clean && npm run build`).
    *   Check for TypeScript errors (`npm run typecheck`).
*   **Authentication errors:**
    *   Verify `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` are set correctly in `.env`.
    *   Confirm `EBAY_ENVIRONMENT` is set to `sandbox` or `production` as intended.
    *   Test credentials directly at the eBay Developer Portal.
*   **MCP connection issues:**
    *   Ensure absolute paths are used in the MCP configuration.
    *   Restart the AI client after configuration changes.
    *   Check server logs for error messages.
    *   Verify the `build` directory exists and contains compiled JavaScript files.

## Resources

*   **eBay Developer Program:** https://developer.ebay.com/
*   **eBay API Documentation:** https://developer.ebay.com/docs
*   **Model Context Protocol:** https://modelcontextprotocol.io/
*   **MCP Specification:** https://spec.modelcontextprotocol.io/
*   **eBay Sandbox:** https://developer.ebay.com/sandbox
