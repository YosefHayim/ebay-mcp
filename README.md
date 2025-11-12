[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png)](https://mseep.ai/app/yosefhayim-ebay-api-mcp-server)

# eBay API MCP Server

<div align="center">

[![npm version](https://img.shields.io/npm/v/ebay-api-mcp-server)](https://www.npmjs.com/package/ebay-api-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/ebay-api-mcp-server)](https://www.npmjs.com/package/ebay-api-mcp-server)
[![npm bundle size](https://img.shields.io/bundlephobia/min/ebay-api-mcp-server)](https://bundlephobia.com/package/ebay-api-mcp-server)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-api-mcp-server/ci.yml?branch=main&label=CI)](https://github.com/YosefHayim/ebay-api-mcp-server/actions)
[![MCP](https://img.shields.io/badge/MCP-1.21.1-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-870%20passing-brightgreen)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-99%25%2B-brightgreen)](tests/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides AI assistants with full access to eBay's Sell APIs through 170+ tools for inventory management, order fulfillment, marketing campaigns, analytics, and more.

[Features](#-features) • [Quick Start](#-quick-start) • [Configuration](#-configuration) • [OAuth Setup](#-oauth-setup) • [Documentation](#-documentation) • [Community](#-community) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
  - [Automated Setup (Recommended)](#automated-setup-recommended)
  - [Manual Setup](#manual-setup)
- [OAuth Setup](#-oauth-setup)
- [Available Tools](#-available-tools)
- [MCP Clients](#-supported-mcp-clients)
- [Documentation](#-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Community](#-community)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Capabilities

- **170+ eBay API Tools** - Comprehensive coverage of eBay Sell APIs across 9 categories
- **Dual Transport Modes** - STDIO (local) and HTTP with OAuth 2.1 (remote multi-user)
- **OAuth 2.0 Support** - Full user token management with automatic refresh
- **Token Persistence** - Secure file-based storage across sessions with `.ebay-mcp-tokens.json`
- **Type Safety** - Built with TypeScript, Zod validation, OpenAPI-generated types, and 33+ native enums
- **Smart Authentication** - Automatic fallback from user tokens (10k-50k req/day) to client credentials (1k req/day)
- **Centralized Configuration** - Single source of truth with `mcp-setup.json` and automated setup scripts
- **Comprehensive Testing** - 870+ tests with 99%+ function coverage and 85%+ line coverage

### API Coverage

| Category | Tools | Description |
|----------|-------|-------------|
| **Account Management** | 28 | Policies, payments, subscriptions, sales tax |
| **Inventory** | 30 | Items, offers, locations, product compatibility |
| **Fulfillment** | 4 | Orders, shipping, refunds |
| **Marketing** | 9 | Campaigns, promotions, recommendations |
| **Analytics** | 4 | Traffic reports, seller standards, metrics |
| **Communication** | 3 | Messaging, negotiation, feedback |
| **Metadata** | 25 | Policies, compatibility, jurisdictions |
| **Taxonomy** | 4 | Category trees, suggestions, item aspects |
| **Other** | 8+ | Compliance, identity, translation, eDelivery |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **eBay Developer Account** ([sign up here](https://developer.ebay.com/))
- **eBay App Credentials** (Client ID + Secret from [Developer Portal](https://developer.ebay.com/my/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/YosefHayim/ebay-api-mcp-server.git
cd ebay-api-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

---

## ⚙️ Configuration

### Automated Setup (Recommended)

The centralized configuration approach uses a single `mcp-setup.json` file to manage all credentials and automatically configure supported MCP clients.

#### Step 1: Create Configuration Template

```bash
./scripts/create-mcp-setup.sh
```

This generates `mcp-setup.json` with the following structure:

```json
{
  "ebay": {
    "credentials": {
      "clientId": "YOUR_EBAY_CLIENT_ID",
      "clientSecret": "YOUR_EBAY_CLIENT_SECRET",
      "environment": "sandbox",
      "redirectUri": "YOUR_RUNAME"
    },
    "tokens": {
      "accessToken": "YOUR_USER_ACCESS_TOKEN_OPTIONAL",
      "refreshToken": "YOUR_USER_REFRESH_TOKEN_OPTIONAL"
    }
  },
  "mcpServer": {
    "buildPath": "/absolute/path/to/ebay-api-mcp-server/build/index.js",
    "autoGenerateConfigs": true,
    "clients": {
      "claude": { "enabled": true },
      "gemini": { "enabled": false },
      "chatgpt": { "enabled": false }
    }
  }
}
```

#### Step 2: Configure Credentials

Edit `mcp-setup.json` with your eBay credentials:

1. Get your **Client ID** and **Client Secret** from [eBay Developer Portal](https://developer.ebay.com/my/keys)
2. Set **environment** to `sandbox` (testing) or `production`
3. Set **redirectUri** to your RuName (for OAuth user flow)
4. *Optional:* Add OAuth tokens (see [OAuth Setup](#-oauth-setup))

#### Step 3: Auto-Generate Client Configs

```bash
./scripts/setup-mcp-clients.sh
```

This script automatically:
- ✅ Reads your `mcp-setup.json` configuration
- ✅ Generates MCP client configs for enabled clients (Claude, Gemini, ChatGPT)
- ✅ Creates `.ebay-mcp-tokens.json` with your tokens (if provided)
- ✅ Backs up existing configs before modifying
- ✅ Validates all paths and configurations

#### Step 4: Restart Your MCP Client

1. Restart Claude Desktop, Gemini, or ChatGPT
2. Open MCP inspector or check client logs to verify connection
3. Test by asking: "List my eBay inventory items"

---

### Manual Setup

#### With Claude Desktop

1. Locate Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add server configuration:

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
        "EBAY_REDIRECT_URI": "your_runame"
      }
    }
  }
}
```

3. Restart Claude Desktop

#### With Gemini

1. Locate Gemini config file: `~/.config/gemini/config.json`

2. Add server configuration:

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
        "EBAY_REDIRECT_URI": "your_runame"
      }
    }
  }
}
```

3. Restart Gemini

#### With ChatGPT

1. Locate ChatGPT config file: `~/.config/chatgpt/config.json`

2. Add server configuration:

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
        "EBAY_REDIRECT_URI": "your_runame"
      }
    }
  }
}
```

3. Restart ChatGPT

---

## 🔐 OAuth Setup

The server supports two authentication modes:

### 1. User Tokens (Recommended - High Rate Limits)

**Benefits:**
- 10,000-50,000 requests/day
- Full API access
- Automatic token refresh

**Setup Steps:**

1. **Generate OAuth URL**
   ```
   Use the ebay_get_oauth_url tool to generate an authorization URL
   ```

2. **User Authorization**
   - Open the URL in a browser
   - Sign in with your eBay account
   - Grant permissions to your application

3. **Exchange Authorization Code**
   - Copy the authorization code from redirect URL
   - Exchange it for tokens using eBay's OAuth API or your application

4. **Configure Tokens**

   **Option A: Via mcp-setup.json** (Recommended)
   ```json
   {
     "ebay": {
       "tokens": {
         "accessToken": "v^1.1#...",
         "refreshToken": "v^1.1#..."
       }
     }
   }
   ```
   Then run: `./scripts/setup-mcp-clients.sh`

   **Option B: Via MCP Tool**
   ```
   Use the ebay_set_user_tokens tool with your access and refresh tokens
   ```

5. **Verify Token Status**
   ```
   Use the ebay_get_token_status tool to verify tokens are loaded
   ```

### 2. Client Credentials (Automatic Fallback - Low Rate Limits)

**Benefits:**
- Automatic authentication
- No user interaction required

**Limitations:**
- Only 1,000 requests/day
- Limited API access (app-level operations only)

**Setup:**
- Automatically used when no user tokens are available
- Just provide EBAY_CLIENT_ID and EBAY_CLIENT_SECRET

---

## 🛠️ Available Tools

### Token Management
- `ebay_get_oauth_url` - Generate OAuth authorization URL
- `ebay_set_user_tokens` - Set user access and refresh tokens
- `ebay_set_user_tokens_with_expiry` - Set tokens with custom expiry
- `ebay_get_token_status` - Check current token status
- `ebay_validate_token_expiry` - Validate token expiration
- `ebay_clear_tokens` - Clear all stored tokens
- `ebay_convert_date_to_timestamp` - Convert dates for token expiry

### Account Management
- `ebay_get_fulfillment_policies` - Get shipping policies
- `ebay_get_payment_policies` - Get payment policies
- `ebay_get_return_policies` - Get return policies
- `ebay_create_fulfillment_policy` - Create shipping policy
- `ebay_get_subscription` - Get seller subscription info
- `ebay_get_kyc` - Get KYC verification status
- ...and 22 more account tools

### Inventory Management
- `ebay_get_inventory_items` - List all inventory items
- `ebay_get_inventory_item` - Get specific item by SKU
- `ebay_create_inventory_item` - Create new inventory item
- `ebay_get_offers` - Get all offers
- `ebay_create_offer` - Create new offer
- `ebay_publish_offer` - Publish offer to create listing
- `ebay_bulk_create_inventory_item` - Bulk create items
- ...and 23 more inventory tools

### Order Fulfillment
- `ebay_get_orders` - Retrieve seller orders
- `ebay_get_order` - Get specific order details
- `ebay_create_shipping_fulfillment` - Mark order as shipped
- `ebay_issue_refund` - Issue full or partial refund

### Marketing & Promotions
- `ebay_get_campaigns` - Get marketing campaigns
- `ebay_get_campaign` - Get campaign details
- `ebay_pause_campaign` - Pause running campaign
- `ebay_resume_campaign` - Resume paused campaign
- `ebay_clone_campaign` - Clone campaign with new settings
- ...and 4 more marketing tools

### Analytics & Reporting
- `ebay_get_traffic_report` - Get listing traffic data
- `ebay_find_seller_standards_profiles` - Get seller standards
- `ebay_get_customer_service_metric` - Get service metrics

### Communication
- `ebay_send_message` - Send message to buyer
- `ebay_reply_to_message` - Reply to buyer message
- `ebay_get_message` - Get message details
- `ebay_search_messages` - Search buyer-seller messages
- `ebay_send_offer_to_interested_buyers` - Send promotional offer

### Metadata & Taxonomy
- `ebay_get_default_category_tree_id` - Get default category tree
- `ebay_get_category_tree` - Get category hierarchy
- `ebay_get_category_suggestions` - Get category suggestions
- `ebay_get_item_aspects_for_category` - Get required item aspects
- ...and 21 more metadata tools

### Other APIs
- `ebay_get_user` - Get authenticated user identity
- `ebay_get_listing_violations` - Get compliance violations
- `ebay_translate` - Translate listing text
- `SearchClaudeCodeDocs` - Search Claude Code documentation

For the complete list of 170+ tools, see [Tool Definitions](src/tools/tool-definitions.ts).

---

## 📱 Supported MCP Clients

This server is compatible with the following MCP clients:

- **[Claude Desktop](https://claude.ai/download)** - Anthropic's official desktop application
- **[Google Gemini](https://gemini.google.com/)** - Google's AI assistant
- **[ChatGPT](https://chatgpt.com/)** - OpenAI's conversational AI

**Setup:** Use the [automated setup script](#automated-setup-recommended) or [manual configuration](#manual-setup) for your preferred client.

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](#quick-start) - Get up and running in 5 minutes
- [OAuth Setup Guide](OAUTH-SETUP.md) - Step-by-step OAuth configuration
- [Authentication Guide](docs/auth/README.md) - OAuth scopes and token management

### Development
- [Architecture Guide](CLAUDE.md) - Project structure and design patterns
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to this project
- [Security Policy](SECURITY.md) - Vulnerability reporting and security best practices
- [API Documentation](docs/) - OpenAPI specifications for all eBay APIs
- [Enum Types Documentation](docs/ENUMS_ANALYSIS.md) - Comprehensive enum catalog and migration guide
- [Scripts Documentation](scripts/README.md) - Build and setup scripts
- [Changelog](CHANGELOG.md) - Version history and release notes

### Resources
- [eBay Developer Portal](https://developer.ebay.com/) - API documentation and keys
- [MCP Documentation](https://modelcontextprotocol.io/) - Model Context Protocol spec
- [GitHub Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions) - Community discussions and Q&A
- [Issue Tracker](https://github.com/YosefHayim/ebay-api-mcp-server/issues) - Report bugs and request features

---

## 💻 Development

### Project Structure

```
ebay-api-mcp-server/
├── src/
│   ├── index.ts                # STDIO MCP server entry point
│   ├── server-http.ts          # HTTP MCP server with OAuth 2.1
│   ├── api/                    # eBay API implementations
│   │   ├── client.ts           # HTTP client with interceptors
│   │   ├── account-management/ # Account APIs
│   │   ├── listing-management/ # Inventory APIs
│   │   ├── order-management/   # Fulfillment APIs
│   │   ├── marketing-and-promotions/ # Marketing APIs
│   │   └── ...
│   ├── auth/                   # OAuth & token management
│   │   ├── oauth.ts            # OAuth client
│   │   ├── token-storage.ts    # File-based token persistence
│   │   └── ...
│   ├── tools/                  # MCP tool definitions
│   │   ├── tool-definitions.ts # 170+ tool schemas
│   │   └── index.ts            # Tool dispatcher
│   ├── types/                  # TypeScript types
│   │   ├── ebay.ts             # Core types
│   │   └── sell_*.ts           # OpenAPI-generated types
│   └── utils/                  # Zod validation schemas
├── docs/                       # Documentation
│   ├── auth/                   # OAuth & authentication guides
│   └── sell-apps/              # OpenAPI specifications
├── scripts/                    # Build and setup scripts
│   ├── create-mcp-setup.sh     # Generate mcp-setup.json
│   ├── setup-mcp-clients.sh    # Auto-configure MCP clients
│   └── ...
├── tests/                      # Test suite
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── build/                      # Compiled JavaScript
├── .env.example                # Environment template
├── mcp-setup.json.template     # Configuration template
└── package.json                # Dependencies & scripts
```

### Available Scripts

```bash
# Development
npm run dev              # Run STDIO server in development mode
npm run dev:http         # Run HTTP server in development mode
npm run watch            # Watch mode for TypeScript compilation

# Building
npm run build            # Compile TypeScript to JavaScript
npm run clean            # Remove build artifacts
npm run typecheck        # Type-check without emitting

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI dashboard
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Lint and auto-fix issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run check            # Run typecheck + lint + format check

# Type Generation
npm run generate:types   # Generate TypeScript types from OpenAPI specs
```

### Tech Stack

- **Runtime**: Node.js 18+ with ES2022 modules
- **Language**: TypeScript 5.9.3 with strict mode
- **MCP SDK**: @modelcontextprotocol/sdk v1.21.1
- **HTTP Client**: axios v1.7.9
- **Validation**: zod v3
- **Testing**: vitest v4.0.8
- **Server**: express v5.1.0 (HTTP mode)
- **JWT**: jose v6.1.1, jsonwebtoken v9.0.2

---

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

### Manual Testing

```bash
# Test OAuth URL generation
node test-oauth-url.js

# Test token refresh
node test-token-refresh.js

# Test user identity API
node test-user-identity.js
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Access token is missing" Error

**Cause**: No user tokens configured

**Solution**:
```bash
# Generate OAuth URL
Use ebay_get_oauth_url tool

# After user authorization, set tokens
Use ebay_set_user_tokens tool with your access and refresh tokens
```

#### 2. "401 Unauthorized" Error

**Cause**: Expired or invalid tokens

**Solution**:
```bash
# Check token status
Use ebay_get_token_status tool

# If tokens expired, re-authorize
Use ebay_get_oauth_url tool and repeat OAuth flow
```

#### 3. Module Import Errors

**Cause**: Missing build step

**Solution**:
```bash
npm run build
```

#### 4. Line Ending Issues (Scripts)

**Cause**: Windows line endings (CRLF) in shell scripts

**Solution**:
```bash
dos2unix scripts/*.sh || sed -i '' 's/\r$//' scripts/*.sh
```

### Debug Mode

Enable verbose logging:

```bash
# In .env file
EBAY_DEBUG=true
```

### Getting Help

- [GitHub Issues](https://github.com/YosefHayim/ebay-api-mcp-server/issues) - Report bugs
- [eBay Developer Support](https://developer.ebay.com/support) - eBay API issues
- [MCP Discord](https://discord.gg/modelcontextprotocol) - MCP protocol questions

---

## 👥 Community

### Getting Help

We have multiple channels for getting help and engaging with the community:

- **[GitHub Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions)** - Ask questions, share ideas, and discuss with the community
- **[Issue Tracker](https://github.com/YosefHayim/ebay-api-mcp-server/issues)** - Report bugs or request features using our templates
- **[Documentation](https://github.com/YosefHayim/ebay-api-mcp-server#readme)** - Comprehensive guides and API references

### Reporting Issues

We use structured issue templates to help us resolve problems quickly:

- **[🐛 Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml)** - Report unexpected behavior or errors
- **[✨ Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml)** - Suggest new features or enhancements
- **[📝 Documentation](.github/ISSUE_TEMPLATE/documentation.yml)** - Report missing or unclear documentation

Before opening an issue, please:
1. Search existing issues to avoid duplicates
2. Review the [documentation](https://github.com/YosefHayim/ebay-api-mcp-server#readme)
3. Use the appropriate template for your issue type

### Security Vulnerabilities

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, use one of these secure channels:
- **[GitHub Security Advisories](https://github.com/YosefHayim/ebay-api-mcp-server/security/advisories/new)** (recommended) - Private vulnerability reporting
- **Email**: See [SECURITY.md](SECURITY.md) for contact details

For more information, see our [Security Policy](SECURITY.md).

---

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're fixing bugs, adding features, improving documentation, or helping with tests, your contributions are valued.

### Quick Start for Contributors

1. **Read the guidelines** - Review [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions
2. **Fork the repository** - Create your own copy of the project
3. **Create a feature branch** - `git checkout -b feature/amazing-feature`
4. **Make your changes** - Follow our coding standards
5. **Run tests** - `npm run test` (ensure 90%+ coverage)
6. **Commit your changes** - Use [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m 'feat: add amazing feature'`
7. **Push to your fork** - `git push origin feature/amazing-feature`
8. **Open a Pull Request** - Use our [PR template](.github/pull_request_template.md)

### Development Guidelines

Before submitting your pull request, ensure:

- ✅ Code follows TypeScript best practices and project style
- ✅ All tests pass (`npm run test`)
- ✅ Test coverage meets thresholds (90%+ on critical paths)
- ✅ Code is properly formatted (`npm run format`)
- ✅ Linting passes (`npm run lint`)
- ✅ Type checking passes (`npm run typecheck`)
- ✅ Documentation is updated (README, JSDoc comments, etc.)
- ✅ Commits follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- ✅ CHANGELOG.md is updated (if applicable)

### Types of Contributions

We welcome these types of contributions:

- 🐛 **Bug Fixes** - Fix issues and improve reliability
- ✨ **New Features** - Add new eBay API tools or MCP capabilities
- 📝 **Documentation** - Improve guides, examples, or API references
- 🧪 **Tests** - Increase test coverage or improve test quality
- 🎨 **Code Quality** - Refactoring, performance improvements, or style fixes
- 🌐 **Translations** - Help translate documentation
- 💡 **Ideas** - Share suggestions in [Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions)

For detailed guidelines, code examples, and testing requirements, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [eBay Developers Program](https://developer.ebay.com/) - API access and documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification and SDK
- [Anthropic](https://anthropic.com/) - Claude and MCP support

---

<div align="center">

**[⬆ Back to Top](#ebay-api-mcp-server)**

Made with ❤️ by [Yosef Hayim Sabag](https://github.com/YosefHayim)

</div>
