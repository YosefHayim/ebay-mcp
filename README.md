# ebay-mcp

A local [MCP](https://modelcontextprotocol.io) server that calls the eBay Sell and Developer APIs with your own keys. It runs on your machine over stdio. There is no cloud relay.

Unofficial open-source project. Not affiliated with, authorized, or endorsed by eBay Inc.

## Setup

Node.js 24 or newer.

```bash
npm install -g ebay-mcp
```

Add this to your MCP client:

```json
{
  "mcpServers": {
    "ebay": {
      "command": "npx",
      "args": ["-y", "ebay-mcp"],
      "env": {
        "EBAY_CLIENT_ID": "your_client_id",
        "EBAY_CLIENT_SECRET": "your_client_secret",
        "EBAY_ENVIRONMENT": "sandbox",
        "EBAY_USER_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

Create keys in the [eBay Developer Portal](https://developer.ebay.com/my/keys). `EBAY_ENVIRONMENT` is `sandbox` or `production`. Inventory calls need a user refresh token from the [OAuth authorization code grant](https://developer.ebay.com/api-docs/static/oauth-authorization-code-grant.html). Application rate limits need only the client id and secret.

See [`.env.example`](.env.example) for every variable.

## Tools

| Tool | eBay call | Token |
| --- | --- | --- |
| `ebay_ping` | none | none |
| `ebay_get_rate_limits` | `GET /developer/analytics/v1_beta/rate_limit/` | application |
| `ebay_get_user_rate_limits` | `GET /developer/analytics/v1_beta/user_rate_limit/` | user |
| `ebay_list_inventory_items` | `GET /sell/inventory/v1/inventory_item` | user |
| `ebay_get_inventory_item` | `GET /sell/inventory/v1/inventory_item/{sku}` | user |

Ask the assistant to check your eBay API rate limits. That calls `ebay_get_rate_limits` and proves the server, the keys, and the client.

## OpenAPI types

`pnpm sync` downloads the official OpenAPI documents for the calls above and writes TypeScript types into `src/ebay-openapi-types/`. Each new API starts by adding its document URL to `scripts/sync-specs.ts` and running that command.

## Develop

```bash
pnpm install
pnpm dev
pnpm test
pnpm check
```
