# eBay API MCP Server

<div align="center">

[![npm version](https://img.shields.io/npm/v/ebay-api-mcp-server)](https://www.npmjs.com/package/ebay-api-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/ebay-api-mcp-server)](https://www.npmjs.com/package/ebay-api-mcp-server)
[![Tests](https://img.shields.io/badge/tests-890%2B%20passing-brightgreen)](tests/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server providing AI assistants with comprehensive access to eBay's Sell APIs. Includes 230+ tools for inventory management, order fulfillment, marketing campaigns, analytics, and more.

**API Coverage:** 99.1% (~110 of 111 eBay Sell API endpoints)

</div>

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **230+ eBay API Tools** - Comprehensive coverage of eBay Sell APIs across inventory, orders, marketing, analytics, and more
- **OAuth 2.0 Support** - Full user token management with automatic refresh
- **Type Safety** - Built with TypeScript, Zod validation, and OpenAPI-generated types
- **MCP Integration** - STDIO transport for direct integration with AI assistants
- **Smart Authentication** - Automatic fallback from user tokens (10k-50k req/day) to client credentials (1k req/day)
- **Well Tested** - 870+ tests with 99%+ function coverage

## Quick Start

### 1. Get eBay Credentials

1. Create a free [eBay Developer Account](https://developer.ebay.com/)
2. Generate application keys in the [Developer Portal](https://developer.ebay.com/my/keys)
3. Save your **Client ID** and **Client Secret**

### 2. Install

```bash
git clone https://github.com/YosefHayim/ebay-api-mcp-server.git
cd ebay-api-mcp-server
npm install
```

### 3. Configure

Run the interactive setup wizard:

```bash
npm run setup
```

Or manually configure:

```bash
cp .env.example .env
# Edit .env with your credentials
npm run auto-setup
```

### 4. Use

Restart your MCP client (Claude Desktop, etc.) and start using eBay tools through your AI assistant.

## Configuration

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

For detailed OAuth setup, see the [OAuth documentation](docs/auth/).

## Available Tools

The server provides 230+ tools organized into the following categories:

- **Account Management** - Policies, programs, subscriptions, sales tax
- **Inventory Management** - Items, offers, locations, bulk operations
- **Order Fulfillment** - Orders, shipping, refunds, disputes
- **Marketing & Promotions** - Campaigns, ads, promotions, bidding
- **Analytics** - Traffic reports, seller standards, metrics
- **Communication** - Buyer-seller messaging, negotiations
- **Metadata & Taxonomy** - Categories, item aspects, policies
- **Token Management** - OAuth URL generation, token management

**Example Tools:**
- `ebay_get_inventory_items` - List all inventory items
- `ebay_get_orders` - Retrieve seller orders
- `ebay_create_offer` - Create new listing offer
- `ebay_get_campaigns` - Get marketing campaigns
- `ebay_get_oauth_url` - Generate OAuth authorization URL

For the complete tool list, see [src/tools/definitions/](src/tools/definitions/).

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- eBay Developer Account

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/ebay-api-mcp-server.git
cd ebay-api-mcp-server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Build and test
npm run build
npm test
```

### Development Commands

```bash
npm run dev              # Run STDIO server
npm run dev:http         # Run HTTP server
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run typecheck        # Type-check code
npm run lint             # Lint code
npm run format           # Format code
```

### Project Structure

```
ebay-api-mcp-server/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── api/               # eBay API implementations
│   ├── auth/              # OAuth & token management
│   ├── tools/             # MCP tool definitions
│   ├── types/             # TypeScript types
│   └── utils/             # Validation schemas
├── tests/                 # Test suite
├── docs/                  # Documentation
└── build/                 # Compiled output
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

## Resources

- [eBay Developer Portal](https://developer.ebay.com/) - API documentation and credentials
- [MCP Documentation](https://modelcontextprotocol.io/) - Model Context Protocol specification
- [GitHub Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions) - Community Q&A
- [Issue Tracker](https://github.com/YosefHayim/ebay-api-mcp-server/issues) - Bug reports and feature requests
- [Security Policy](SECURITY.md) - Vulnerability reporting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [eBay Developers Program](https://developer.ebay.com/) for API access
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
- All [contributors](https://github.com/YosefHayim/ebay-api-mcp-server/graphs/contributors) who have helped improve this project

---

<div align="center">

**[Support this project](https://www.buymeacoffee.com/yosefhayim)** | Created by [Yosef Hayim Sabag](https://github.com/YosefHayim)

</div>
