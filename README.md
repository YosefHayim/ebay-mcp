# eBay API MCP Server

<div align="center">

[![npm version](https://img.shields.io/npm/v/ebay-mcp)](https://www.npmjs.com/package/ebay-mcp)
[![npm downloads](https://img.shields.io/npm/dm/ebay-mcp)](https://www.npmjs.com/package/ebay-mcp)
[![Tests](https://img.shields.io/badge/tests-914%20passing-brightgreen)](tests/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png)](https://mseep.ai/app/yosefhayim-ebay-api-mcp-server)
<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server providing AI assistants with comprehensive access to eBay's Sell APIs. Includes **339 tools** for inventory management, order fulfillment, marketing campaigns, analytics, developer tools, and more.

**API Coverage:** 82.5% (293 of 355 eBay API endpoints)

</div>

---

## ⚠️ Disclaimer

**IMPORTANT: Please read this disclaimer carefully before using this software.**

This is an **open-source project** provided "as is" without warranty of any kind, either express or implied. By using this software, you acknowledge and agree to the following:

- **No Liability:** The authors, contributors, and maintainers of this project accept **NO responsibility or liability** for any damages, losses, or issues that may arise from using this software, including but not limited to:
  - Data loss or corruption
  - Financial losses
  - Service disruptions
  - eBay account suspension or termination
  - Violations of eBay's Terms of Service or API usage policies
  - Any other direct or indirect damages

- **eBay API Usage:** This project is an unofficial third-party implementation and is **NOT affiliated with, endorsed by, or sponsored by eBay Inc.** You are solely responsible for:
  - Complying with [eBay's API Terms of Use](https://developer.ebay.com/join/api-license-agreement)
  - Ensuring your usage stays within eBay's rate limits and policies
  - Managing your eBay Developer credentials securely
  - Understanding and complying with [eBay's data handling requirements](https://developer.ebay.com/api-docs/static/data-handling-update.html)
  - Any actions performed through the API

- **Use at Your Own Risk:** This software is provided for educational and development purposes. Users must:
  - Test thoroughly in eBay's sandbox environment before production use
  - Understand the API calls being made on their behalf
  - Maintain backups of critical data
  - Monitor their API usage and account status

- **Security:** You are responsible for:
  - Keeping your API credentials secure
  - Properly configuring environment variables
  - Understanding the security implications of MCP server usage
  - Following security best practices

- **No Warranty:** This software is provided without any guarantees of functionality, reliability, or fitness for a particular purpose.

**By using this software, you accept all risks and agree to hold harmless the authors, contributors, and maintainers from any claims, damages, or liabilities.**

For official eBay API support, please refer to the [eBay Developer Program](https://developer.ebay.com/).

---

## Table of Contents

- [⚠️ Disclaimer](#️-disclaimer)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)
- [License](#license)

## Features

- **339 eBay API Tools** - Comprehensive coverage of eBay Sell APIs across inventory, orders, marketing, analytics, developer tools, and more
- **OAuth 2.0 Support** - Full user token management with automatic refresh
- **Type Safety** - Built with TypeScript, Zod validation, and OpenAPI-generated types
- **MCP Integration** - STDIO transport for direct integration with AI assistants
- **Smart Authentication** - Automatic fallback from user tokens (10k-50k req/day) to client credentials (1k req/day)
- **Well Tested** - 914+ tests with comprehensive coverage
- **Developer Analytics** - Rate limit monitoring and signing key management

## Quick Start

### 1. Get eBay Credentials

1. Create a free [eBay Developer Account](https://developer.ebay.com/)
2. Generate application keys in the [Developer Portal](https://developer.ebay.com/my/keys)
3. Save your **Client ID** and **Client Secret**

### 2. Install

**Option A: Install from npm (Recommended)**

```bash
npm install -g ebay-mcp
```

**Option B: Install from source**

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp
npm install
npm run build
```

### 3. Configure

Run the interactive setup wizard:

```bash
npm run setup
```

Or configure manually by copying `.env.example` to `.env` and editing your credentials.

### 4. Configure MCP Client

Add this server to your MCP client configuration:

**Claude Desktop:**

Edit your Claude Desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Add the server configuration:

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
        "EBAY_REDIRECT_URI": "your_runame"
      }
    }
  }
}
```

**Alternative: Use locally installed version**

If you installed from source:

```json
{
  "mcpServers": {
    "ebay": {
      "command": "node",
      "args": ["/absolute/path/to/ebay-mcp/build/index.js"],
      "env": {
        "EBAY_CLIENT_ID": "your_client_id",
        "EBAY_CLIENT_SECRET": "your_client_secret",
        "EBAY_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

### 5. Use

Restart your MCP client (Claude Desktop, etc.) and start using eBay tools through your AI assistant.

## Configuration

> 📖 **For a comprehensive configuration guide with detailed explanations of all environment variables, OAuth flow steps, and troubleshooting, see [Configuration Documentation](docs/auth/CONFIGURATION.md).**

### Environment Variables

Create a `.env` file with your eBay credentials:

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox  # or "production"
EBAY_REDIRECT_URI=your_runame

# Optional: For higher rate limits (10k-50k req/day)
EBAY_USER_REFRESH_TOKEN=your_refresh_token
```

### OAuth Authentication

**Client Credentials (Automatic):**

- Default authentication method
- 1,000 requests/day
- No setup required beyond client ID and secret

**User Tokens (Recommended for Production):**

- 10,000-50,000 requests/day
- Use `ebay_get_oauth_url` tool to generate authorization URL
- Add `EBAY_USER_REFRESH_TOKEN` to `.env` after OAuth flow
- Tokens refresh automatically

For detailed OAuth setup and comprehensive configuration guide, see the [Configuration Documentation](docs/auth/CONFIGURATION.md).

### MCP Client Compatibility

This server is compatible with any MCP client that supports STDIO transport:

**Tested and Supported:**

- ✅ **Claude Desktop** (macOS, Windows, Linux) - Full support
- ✅ **MCP Inspector** - For development and testing
- ✅ **Custom MCP Clients** - Via STDIO or HTTP transport

**Configuration Requirements:**

- MCP Protocol version: 1.0+
- Transport: STDIO (default) or HTTP
- Node.js runtime: 18.0.0 or higher

**Other MCP Clients:**

While not specifically tested, the server should work with any MCP-compliant client including:

- Continue.dev
- Other editors with MCP support
- Custom implementations

If you successfully use this server with another MCP client, please let us know by [opening a discussion](https://github.com/YosefHayim/ebay-mcp/discussions)!

### Rate Limiting

Understanding eBay API rate limits is crucial for production use:

**Client Credentials (Default):**

- **Daily Limit:** 1,000 requests per day
- **Best For:** Development, testing, low-volume operations
- **Setup:** Automatic with just Client ID and Secret

**User Token (Recommended):**

- **Daily Limit:** 10,000-50,000 requests per day (varies by account type)
- **Best For:** Production, high-volume operations
- **Setup:** Requires OAuth flow (use `ebay_get_oauth_url` tool)

**Rate Limit Tiers by Account Type:**

- Individual Developer: 10,000 requests/day
- Commercial Developer: 25,000 requests/day
- Enterprise: 50,000+ requests/day (custom limits)

**Rate Limit Best Practices:**

1. Use user tokens for production workloads
2. Implement exponential backoff on rate limit errors
3. Cache responses when possible
4. Monitor your usage in the eBay Developer Portal
5. Batch operations when the API supports it
6. Consider upgrading your developer account tier for higher limits

**Handling Rate Limits:**

When you hit a rate limit, the API returns a 429 status code. The server will:

- Automatically retry with exponential backoff
- Inform you of rate limit errors
- Suggest upgrading to user token authentication

**Check Current Usage:**

Monitor your API usage in the [eBay Developer Portal](https://developer.ebay.com/my/api_usage).

## Available Tools

The server provides **339 tools** organized into the following categories:

- **Account Management** - Policies, programs, subscriptions, sales tax
- **Inventory Management** - Items, offers, locations, bulk operations, SKU location mapping
- **Order Fulfillment** - Orders, shipping, refunds, disputes, payment dispute evidence
- **Marketing & Promotions** - Campaigns, ads, promotions, bidding, bulk operations
- **Analytics** - Traffic reports, seller standards, metrics
- **Communication** - Buyer-seller messaging, negotiations, notifications, feedback
- **Metadata & Taxonomy** - Categories, item aspects, policies
- **Developer Tools** - Rate limits, signing keys, client registration
- **Token Management** - OAuth URL generation, token management

**Example Tools:**

- `ebay_get_inventory_items` - List all inventory items
- `ebay_get_orders` - Retrieve seller orders
- `ebay_create_offer` - Create new listing offer
- `ebay_get_campaigns` - Get marketing campaigns
- `ebay_get_oauth_url` - Generate OAuth authorization URL

For the complete tool list, see [src/tools/definitions/](src/tools/definitions/).

## Usage Examples

Here are some common tasks you can accomplish with the eBay MCP server:

### Setting Up OAuth for Higher Rate Limits

**User:** "Can you help me set up OAuth authentication for my eBay account?"

**Assistant:** Uses `ebay_get_oauth_url` tool to generate an authorization URL. You visit the URL, grant permissions, and the assistant helps you configure the refresh token in your `.env` file.

**Result:** Access to 10,000-50,000 API requests per day instead of 1,000.

### Managing Inventory

**User:** "Show me all my active listings on eBay"

**Assistant:** Uses `ebay_get_inventory_items` to retrieve all inventory items.

**Result:** Displays a formatted list of all your products with SKUs, quantities, and status.

### Processing Orders

**User:** "Get all unfulfilled orders from the last 7 days"

**Assistant:** Uses `ebay_get_orders` with date filters and fulfillment status parameters.

**Result:** Returns a list of pending orders ready for shipment processing.

### Creating Marketing Campaigns

**User:** "Create a promoted listing campaign for my electronics category"

**Assistant:** Uses `ebay_create_campaign` and related marketing tools to set up ad campaigns.

**Result:** New campaign created with specified budget and target items.

### Bulk Operations

**User:** "Update prices for all items in category 'Vintage Watches' with a 10% discount"

**Assistant:** Combines `ebay_get_inventory_items`, filters by category, and uses `ebay_update_offer` to apply bulk pricing changes.

**Result:** All matching items updated with new pricing.

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- eBay Developer Account

### Quick Start for Contributors

```bash
git clone https://github.com/YOUR_USERNAME/ebay-mcp.git
cd ebay-mcp
npm install
npm run setup      # Interactive setup wizard
npm run build
npm test
```

### Commands Reference

| Command            | Description                                        |
| ------------------ | -------------------------------------------------- |
| `npm run build`    | Compile TypeScript to JavaScript                   |
| `npm start`        | Run the MCP server                                 |
| `npm run dev`      | Run server with hot reload                         |
| `npm test`         | Run test suite                                     |
| `npm run setup`    | Interactive setup wizard                           |
| `npm run sync`     | Sync specs, generate types, find missing endpoints |
| `npm run diagnose` | Check configuration and connectivity               |
| `npm run check`    | Run typecheck + lint + format check                |
| `npm run fix`      | Auto-fix lint and format issues                    |

### Adding New API Endpoints

When eBay releases new API endpoints, use the sync tool to identify what's missing:

```bash
npm run sync
```

This single command will:

1. Download latest OpenAPI specs from eBay
2. Generate TypeScript types from specs
3. Analyze which endpoints are implemented
4. Report missing endpoints that need tools

**Workflow for adding a new endpoint:**

1. Run `npm run sync` to identify missing endpoints
2. Check `dev-sync-report.json` for the full list
3. Create a new tool in `src/tools/definitions/`
4. Add the API method in `src/api/`
5. Write tests in `tests/`
6. Run `npm run check && npm test`

### Project Structure

```
ebay-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── api/               # eBay API implementations
│   ├── auth/              # OAuth & token management
│   ├── tools/             # MCP tool definitions
│   ├── types/             # TypeScript types (auto-generated)
│   ├── scripts/           # CLI tools (setup, sync, diagnose)
│   └── utils/             # Shared utilities
├── docs/                  # OpenAPI specs (auto-downloaded)
├── tests/                 # Test suite
└── build/                 # Compiled output
```

### Docker Support

```bash
docker-compose up -d       # Start container
docker-compose logs -f     # View logs
docker-compose down        # Stop container
```

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run quality checks: `npm run check && npm test`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push to your fork and open a Pull Request

**Before submitting:**

- Ensure all tests pass
- Follow TypeScript best practices
- Update documentation as needed
- Maintain test coverage

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Troubleshooting

### Common Issues

#### Server Not Appearing in Claude Desktop

**Problem:** The eBay MCP server doesn't show up in your MCP client.

**Solutions:**

1. Verify the config file path is correct for your OS
2. Check JSON syntax is valid (use a JSON validator)
3. Ensure environment variables are properly set
4. Restart Claude Desktop completely
5. Check Claude Desktop logs for error messages

#### Authentication Errors

**Problem:** "Invalid credentials" or "Authentication failed" errors.

**Solutions:**

1. Verify your `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` are correct
2. Ensure you're using the right environment (sandbox vs production)
3. Check if your app keys are active in the eBay Developer Portal
4. For user tokens, verify your `EBAY_USER_REFRESH_TOKEN` is valid
5. Run `npm run diagnose` to check your configuration

#### Rate Limit Errors

**Problem:** "Rate limit exceeded" errors.

**Solutions:**

1. Upgrade to user token authentication (10k-50k requests/day)
2. Implement request throttling in your usage
3. Check your current rate limit in the Developer Portal
4. Consider upgrading your eBay Developer account tier

#### Tools Not Working Correctly

**Problem:** Tools return unexpected errors or empty results.

**Solutions:**

1. Verify you're using the correct environment (sandbox vs production)
2. Ensure you have proper permissions/scopes for the operation
3. Check eBay API status: https://developer.ebay.com/support/api-status
4. Run `npm run diagnose` to check your configuration
5. Review the [eBay API documentation](https://developer.ebay.com/docs) for endpoint requirements

### Diagnostic Tools

Run diagnostics to troubleshoot configuration issues:

```bash
# Interactive diagnostics
npm run diagnose

# Export diagnostic report
npm run diagnose:export
```

The diagnostic tool checks:

- Environment variable configuration
- eBay API connectivity
- Authentication status
- Token validity
- Available scopes and permissions

### Getting Help

If you're still experiencing issues:

1. Check existing [GitHub Issues](https://github.com/YosefHayim/ebay-mcp/issues)
2. Review [GitHub Discussions](https://github.com/YosefHayim/ebay-mcp/discussions)
3. Create a new issue with:
   - Your diagnostic report (`npm run diagnose:export`)
   - Steps to reproduce the problem
   - Error messages or logs
   - Your environment (OS, Node version, MCP client)

## Resources

### Documentation

- [eBay Developer Portal](https://developer.ebay.com/) - API documentation and credentials
- [eBay API License Agreement](https://developer.ebay.com/join/api-license-agreement) - Terms of use and compliance requirements
- [eBay Data Handling Requirements](https://developer.ebay.com/api-docs/static/data-handling-update.html) - Important data protection and privacy guidelines
- [eBay API Status](https://developer.ebay.com/support/api-status) - Real-time API health and status
- [MCP Documentation](https://modelcontextprotocol.io/) - Model Context Protocol specification
- [OAuth Quick Reference](docs/auth/OAUTH_QUICK_REFERENCE.md) - **Complete OAuth authentication guide with scopes, troubleshooting, and examples**
- [OAuth Setup Guide](docs/auth/) - Detailed authentication configuration
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to this project
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines and expectations
- [Changelog](CHANGELOG.md) - Version history and release notes
- [Security Policy](SECURITY.md) - Vulnerability reporting guidelines

### Support

- [GitHub Discussions](https://github.com/YosefHayim/ebay-mcp/discussions) - Community Q&A and general discussions
- [Issue Tracker](https://github.com/YosefHayim/ebay-mcp/issues) - Bug reports and feature requests
- [Bug Report Template](BUG_REPORT.md) - Detailed bug reporting guide

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [eBay Developers Program](https://developer.ebay.com/) for API access
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- All [contributors](https://github.com/YosefHayim/ebay-mcp/graphs/contributors) who have helped improve this project

---

<div align="center">

**[Support this project](https://www.buymeacoffee.com/yosefhayim)** | Created by [Yosef Hayim Sabag](https://github.com/YosefHayim)

</div>
