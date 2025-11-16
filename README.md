<div align="center">

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20the%20Project-yellow?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.buymeacoffee.com/yosefhayim)

</div>

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
[![Tests](https://img.shields.io/badge/tests-890%2B%20passing-brightgreen)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-99%25%2B-brightgreen)](tests/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides AI assistants with full access to eBay's Sell APIs through 230+ tools for inventory management, order fulfillment, marketing campaigns, analytics, shipping, and more.

**🎯 99.1% API Coverage** - Implements ~110 of 111 eBay Sell API endpoints ([see details below](#api-coverage))

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

- **230+ eBay API Tools** - 99.1% coverage of eBay Sell APIs (~110 of 111 endpoints) across 8 categories
- **Local MCP Server** - STDIO transport for direct integration with MCP clients (Claude Desktop, Cline, etc.)
- **OAuth 2.0 Support** - Full user token management with automatic refresh
- **Simple Configuration** - All authentication managed through `.env` file only (no token files)
- **Type Safety** - Built with TypeScript, Zod validation, OpenAPI-generated types, and 33+ native enums
- **Smart Authentication** - Automatic fallback from user tokens (10k-50k req/day) to client credentials (1k req/day)
- **Comprehensive Testing** - 870+ tests with 99%+ function coverage and 85%+ line coverage

### API Coverage

**Overall: 99.1% Complete** - Implements ~110 of 111 eBay Sell API endpoints

<table width="100%">
<thead>
  <tr>
    <th width="20%">Category</th>
    <th width="10%">Endpoints</th>
    <th width="10%">Coverage</th>
    <th width="10%">Status</th>
    <th width="50%">Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><strong>Account API</strong></td>
    <td align="center">36/37</td>
    <td align="center">97.3%</td>
    <td align="center">✅</td>
    <td>Fulfillment policies, payment policies, return policies, sales tax, subscriptions, advertising eligibility, program management</td>
  </tr>
  <tr>
    <td><strong>Analytics API</strong></td>
    <td align="center">4/4</td>
    <td align="center">100%</td>
    <td align="center">✅</td>
    <td>Traffic reports, seller standards profiles, customer service metrics</td>
  </tr>
  <tr>
    <td><strong>Fulfillment API</strong></td>
    <td align="center">15/15</td>
    <td align="center">100%</td>
    <td align="center">✅</td>
    <td>Order retrieval, shipping fulfillment, refunds, payment disputes</td>
  </tr>
  <tr>
    <td><strong>Inventory API</strong></td>
    <td align="center">20/20</td>
    <td align="center">100%</td>
    <td align="center">✅</td>
    <td>Inventory items, offers, bulk operations, locations, publish/withdraw</td>
  </tr>
  <tr>
    <td><strong>Marketing API</strong></td>
    <td align="center">30/30</td>
    <td align="center">100%</td>
    <td align="center">✅</td>
    <td>Campaigns, ads, item promotions, price markdowns, bidding</td>
  </tr>
  <tr>
    <td><strong>Metadata API</strong></td>
    <td align="center">5/5</td>
    <td align="center">100%</td>
    <td align="center">✅</td>
    <td>Automotive compatibility, item conditions, listing structure, negotiated prices, return policies</td>
  </tr>
  <tr>
    <td><strong>Communication</strong></td>
    <td align="center">~22</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
    <td>Buyer-seller messaging, negotiation, feedback, notifications</td>
  </tr>
  <tr>
    <td><strong>Taxonomy</strong></td>
    <td align="center">4</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
    <td>Category trees, suggestions, item aspects, attribute schemas</td>
  </tr>
  <tr>
    <td><strong>Other APIs</strong></td>
    <td align="center">~39</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
    <td>Compliance, identity, translation, eDelivery, VERO reporting</td>
  </tr>
</tbody>
</table>

<details>
<summary><strong>📊 View Detailed Endpoint Coverage</strong></summary>

### Account API (v1) - 36/37 Endpoints (97.3%)

**✅ Implemented:**
- Custom Policy: `createCustomPolicy`, `getCustomPolicies`, `getCustomPolicy`, `updateCustomPolicy`
- Fulfillment Policy: `createFulfillmentPolicy`, `deleteFulfillmentPolicy`, `getFulfillmentPolicies`, `getFulfillmentPolicy`, `getFulfillmentPolicyByName`, `updateFulfillmentPolicy`
- Payment Policy: `createPaymentPolicy`, `deletePaymentPolicy`, `getPaymentPolicies`, `getPaymentPolicy`, `getPaymentPolicyByName`, `updatePaymentPolicy`
- Return Policy: `createReturnPolicy`, `deleteReturnPolicy`, `getReturnPolicies`, `getReturnPolicy`, `getReturnPolicyByName`, `updateReturnPolicy`
- Sales Tax: `bulkCreateOrReplaceSalesTax`, `createOrReplaceSalesTax`, `deleteSalesTax`, `getSalesTax`, `getSalesTaxes`
- Programs & Features: `getPrivileges`, `getOptedInPrograms`, `optInToProgram`, `optOutOfProgram`, `getRateTables`, `getSubscription`, `getAdvertisingEligibility`
- Deprecated (Still Supported): `getPaymentsProgram`, `getPaymentsProgramOnboarding`

**❌ Missing:** 1 deprecated endpoint (`getKYC`) - Low priority, deprecated by eBay

### Analytics API (v1) - 4/4 Endpoints (100%)

**✅ Complete Coverage:**
- Customer Service Metrics: `getCustomerServiceMetric`
- Seller Standards: `findSellerStandardsProfiles`, `getSellerStandardsProfile`
- Traffic Reports: `getTrafficReport`

### Fulfillment API (v1) - 15/15 Endpoints (100%)

**✅ Complete Coverage:**
- Orders: `getOrders`, `getOrder`, `issueRefund`
- Shipping: `createShippingFulfillment`, `getShippingFulfillments`, `getShippingFulfillment`
- Payment Disputes: `getPaymentDisputeSummaries`, `getPaymentDispute` + full dispute lifecycle

### Inventory API (v1) - 20/20 Endpoints (100%)

**✅ Complete Coverage:**
- Inventory Items: `createOrReplaceInventoryItem`, `getInventoryItems`, `getInventoryItem`, `deleteInventoryItem`, `bulkCreateOrReplaceInventoryItem`
- Locations: `createInventoryLocation`, `getInventoryLocations`, `getInventoryLocation` + full management
- Offers: `createOffer`, `getOffers`, `getOffer`, `updateOffer`, `deleteOffer`, `publishOffer`, `withdrawOffer`

### Marketing API (v1) - 30/30 Endpoints (100%)

**✅ Complete Coverage:**
- Campaigns: `createCampaign`, `getCampaigns`, `getCampaign`, `updateCampaign`, `deleteCampaign` + full management
- Ads: `createAdsByInventoryReference`, `getAds` + complete ad operations
- Promotions: `createItemPromotion`, `getItemPromotions` + full lifecycle
- Price Markdown: `createItemPriceMarkdownPromotion`, `getItemPriceMarkdownPromotions` + management

### Metadata API (v1) - 5/5 Endpoints (100%)

**✅ Complete Coverage:**
- `getAutomotivePartsCompatibilityPolicies`
- `getItemConditionPolicies`
- `getListingStructurePolicies`
- `getNegotiatedPricePolicies`
- `getReturnPolicies`

</details>

---

## 🚀 Quick Start

Get up and running in **3 simple steps** (< 2 minutes):

### Step 1: Get eBay Credentials

1. Sign up for [eBay Developer Account](https://developer.ebay.com/) (free)
2. Create an application in [Developer Portal](https://developer.ebay.com/my/keys)
3. Copy your **Client ID** and **Client Secret**

### Step 2: Clone & Install

```bash
# Clone the repository
git clone https://github.com/YosefHayim/ebay-api-mcp-server.git
cd ebay-api-mcp-server

# Install dependencies
npm install
```

### Step 3: Interactive Setup ✨ NEW!

Run the beautiful interactive setup wizard:

```bash
npm run setup
```

The wizard will guide you through:
- 🎨 **Beautiful eBay logo** and colored interface
- 📝 **Step-by-step prompts** for credentials and tokens
- ✅ **Input validation** to catch errors early
- 🔄 **Reconfigure anytime** by running the command again
- 🚀 **Auto-detection** of MCP clients
- 💾 **Automatic .env creation** with proper formatting

**Alternative: Manual Setup**

If you prefer manual configuration:

```bash
# Copy and edit the environment file
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here
EBAY_ENVIRONMENT=sandbox  # or "production"
EBAY_REDIRECT_URI=your_runame_here
```

Then run auto-setup to configure MCP clients:

```bash
npm run auto-setup
```

**That's it!** 🎉 The setup will automatically:
- ✅ Build the project
- ✅ Detect installed MCP clients (Claude Desktop, Gemini, ChatGPT)
- ✅ Generate MCP client configurations
- ✅ Validate environment tokens (.env)

### Step 4: Restart & Test

1. **Restart your MCP client** (Claude Desktop, Gemini, etc.)
2. **Verify connection** in MCP client settings/logs
3. **Test it:** Ask your AI assistant "List my eBay inventory items"

> **Pro Tip:** For high rate limits (10k-50k req/day), add `EBAY_USER_REFRESH_TOKEN` to your `.env` file. The interactive setup wizard makes this easy! See [OAuth Setup](#-oauth-setup) for details.

---

## ⚙️ Configuration

### ✨ Interactive Setup Wizard (Recommended)

**The easiest way to configure!** Run the interactive setup wizard:

```bash
npm run setup
```

Features a beautiful CLI interface with:
- 🎨 Colorful eBay-branded logo
- 📝 Step-by-step guided prompts
- ✅ Real-time input validation
- 🔄 Easy reconfiguration anytime
- 💾 Automatic .env file generation
- 🚀 Optional MCP client auto-configuration

### Automatic Setup (Alternative)

**Quick configuration from existing .env!** The server automatically detects and configures all MCP clients when you run `npm install`.

Just edit `.env` with your eBay credentials and run:

```bash
npm run auto-setup
```

### Legacy: Manual Configuration (Advanced Users Only)

If you prefer to manually configure MCP clients or need custom settings, you can still do so.

> **Note:** The automatic setup is recommended for 99% of users. Only use manual configuration if you need special customization.

<details>
<summary><strong>Click to expand manual configuration instructions</strong></summary>

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

</details>

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

   **Option A: Via .env** (Recommended - Works with MCP Clients)

   Add tokens to your `.env` file:
   ```bash
   EBAY_USER_ACCESS_TOKEN=v^1.1#...
   EBAY_USER_REFRESH_TOKEN=v^1.1#...
   ```
   Then run: `npm run auto-setup`

   **✅ This automatically configures all detected MCP clients (Claude Desktop, Gemini, ChatGPT) with your tokens!**

   **Option B: Via MCP Tool** (Memory-only, not persisted)
   ```
   Use the ebay_set_user_tokens_with_expiry tool with your access and refresh tokens
   ```

   ⚠️ **Note:** Tokens set via MCP tool are stored in memory only and will be lost when the server restarts. For persistent tokens across restarts, use Option A (.env file).

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

For the complete list of 230+ tools, see the modular [Tool Definitions](src/tools/definitions/).

---

## 📱 Supported MCP Clients

This server has been tested and verified with the following MCP clients:

### ✅ Fully Supported & Verified

| Client | Status | Version Tested | Notes |
| :----- | :----- | :------------- | :---- |
| **[Gemini CLI](https://gemini.google.com/)** | ✅ **Working** | Latest | Fully functional with all 230+ tools |
| **[Claude Code](https://claude.ai/code)** | ✅ **Working** | Latest | Complete integration, all features supported |
| **[Codex](https://github.com/openai/codex)** | ✅ **Working** | Latest | Tested and verified |

### 🚧 In Development

<table width="100%"><thead><tr><th width="25%">Client</th><th width="15%">Status</th><th width="15%">Progress</th><th width="45%">ETA</th></tr></thead><tbody><tr><td><strong><a href="https://claude.ai/download">Claude Desktop</a></strong></td><td>🚧 <strong>In Progress</strong></td><td>85%</td><td>Coming Soon</td></tr><tr><td><strong><a href="https://chatgpt.com/">ChatGPT Desktop</a></strong></td><td>🚧 <strong>In Progress</strong></td><td>70%</td><td>Q2 2025</td></tr></tbody>
</table>

### Setup Instructions

**For Verified Clients** (Gemini CLI, Claude Code, Codex):
- Use the [automated setup script](#automated-setup-recommended) for quick configuration
- Or follow the [manual configuration](#manual-setup) guide

**For Clients in Development** (Claude Desktop, ChatGPT):
- Configuration templates are available but may require adjustments
- Join [GitHub Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions) for updates
- Contributions and testing help welcome!

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](#quick-start) - Get up and running in 2 minutes
- [Interactive Setup](#step-3-interactive-setup--new) - Beautiful CLI wizard walkthrough
- [OAuth Setup](#-oauth-setup) - User tokens and authentication management

### Development
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to this project
- [Security Policy](SECURITY.md) - Vulnerability reporting and security best practices
- [API Coverage](#api-coverage) - Comprehensive endpoint coverage analysis (99.1% complete)
- [API Documentation](docs/) - OpenAPI specifications for all eBay APIs
- [Changelog](CHANGELOG.md) - Version history and release notes

### Resources
- [eBay Developer Portal](https://developer.ebay.com/) - API documentation and keys
- [MCP Documentation](https://modelcontextprotocol.io/) - Model Context Protocol spec
- [GitHub Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions) - Community discussions and Q&A
- [Issue Tracker](https://github.com/YosefHayim/ebay-api-mcp-server/issues) - Report bugs and request features

---

## 💻 Development

> **New to the project?** Check out our [Developer Quick Start](#developer-quick-start) below!

### Developer Quick Start

Want to contribute to the eBay API MCP Server? Follow these steps to get your development environment up and running:

#### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.0.0 (check with `node --version`)
- **npm** or **pnpm** package manager
- **Git** for version control
- **eBay Developer Account** ([sign up here](https://developer.ebay.com/)) for API credentials
- A code editor (VS Code recommended with TypeScript/ESLint extensions)

#### 2. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/ebay-api-mcp-server.git
cd ebay-api-mcp-server

# Add upstream remote to sync with the main repository
git remote add upstream https://github.com/YosefHayim/ebay-api-mcp-server.git
```

#### 3. Install Dependencies

```bash
npm install
# or
pnpm install
```

This will:
- Install all project dependencies
- Run the build automatically (via `postinstall` hook)
- Attempt to configure MCP clients (will skip if `.env` doesn't exist)

#### 4. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your eBay developer credentials
# Get your credentials from: https://developer.ebay.com/my/keys
```

Required environment variables:
```bash
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here
EBAY_ENVIRONMENT=sandbox  # Use sandbox for development
EBAY_REDIRECT_URI=your_runame_here
```

#### 5. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `build/` directory.

#### 6. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Check test coverage
npm run test:coverage
```

#### 7. Start Development

```bash
# Run the MCP server in development mode (STDIO)
npm run dev

# Or run the HTTP server with OAuth support
npm run dev:http

# Or watch TypeScript compilation
npm run watch
```

#### 8. Test Your Changes Locally

To test your changes with an MCP client (Claude Desktop, etc.):

```bash
# 1. Build your changes
npm run build

# 2. Update MCP client configuration to point to your local build
npm run auto-setup

# 3. Restart your MCP client

# 4. Test using the MCP Inspector (optional)
npx @modelcontextprotocol/inspector node build/index.js
```

#### 9. Code Quality Checks

Before committing, ensure your code passes all quality checks:

```bash
# Run all checks (typecheck + lint + format)
npm run check

# Or run individually:
npm run typecheck  # Type check without emitting
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

#### 10. Make Your Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Run tests and quality checks
npm run check && npm test

# Commit using Conventional Commits format
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

#### 11. Submit a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit for review

For more detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

### Project Structure

```
ebay-api-mcp-server/
├── src/
│   ├── index.ts                # STDIO MCP server entry point
│   ├── server-http.ts          # HTTP MCP server with OAuth 2.1
│   ├── api/                    # eBay API implementations
│   │   ├── client.ts           # HTTP client with interceptors
│   │   ├── index.ts            # API facade/entry point
│   │   ├── account-management/ # Account API implementations
│   │   ├── listing-management/ # Inventory API implementations
│   │   ├── order-management/   # Fulfillment API implementations
│   │   ├── marketing-and-promotions/ # Marketing API implementations
│   │   ├── analytics-and-report/ # Analytics API implementations
│   │   ├── communication/      # Communication API implementations
│   │   ├── listing-metadata/   # Metadata API implementations
│   │   └── other/              # Other API implementations
│   ├── auth/                   # OAuth & token management
│   │   ├── oauth.ts            # OAuth client with auto-refresh
│   │   └── token-manager.ts    # Token storage and management
│   ├── tools/                  # MCP tool definitions
│   │   ├── definitions/        # Modular tool schemas by category
│   │   │   ├── account/        # Account management tools
│   │   │   ├── inventory/      # Inventory management tools
│   │   │   ├── fulfillment/    # Order fulfillment tools
│   │   │   ├── marketing/      # Marketing tools
│   │   │   └── ...
│   │   └── index.ts            # Tool dispatcher and registry
│   ├── scripts/                # Build and utility scripts
│   │   ├── auto-setup.ts       # Automatic MCP client configuration
│   │   ├── interactive-setup.ts # Interactive CLI setup wizard
│   │   ├── test-endpoints.ts   # Endpoint testing utility
│   │   ├── download-specs.ts   # Download OpenAPI specifications
│   │   └── generate-types.sh   # Generate TypeScript types from OpenAPI
│   ├── types/                  # TypeScript types and enums
│   │   ├── ebay.ts             # Core eBay types
│   │   ├── ebay-enums.ts       # Native TypeScript enums
│   │   ├── sell_*.ts           # OpenAPI-generated types
│   │   └── ...
│   ├── utils/                  # Zod validation schemas
│   │   ├── account-management/ # Account API validators
│   │   ├── communication/      # Communication API validators
│   │   ├── order-management/   # Order API validators
│   │   └── ...
│   └── config/                 # Configuration management
│       └── env.ts              # Environment variable handling
├── docs/                       # Documentation and specifications
│   ├── auth/                   # OAuth & authentication guides
│   ├── sell-apps/              # OpenAPI specifications for Sell APIs
│   ├── buy-apps/               # OpenAPI specifications for Buy APIs
│   ├── enums/                  # Enum documentation
│   └── application-settings/   # Application settings docs
├── tests/                      # Test suite
│   ├── unit/                   # Unit tests for individual components
│   ├── integration/            # Integration tests for API interactions
│   └── helpers/                # Test utilities and mocks
├── build/                      # Compiled JavaScript output (gitignored)
├── .env.example                # Environment variable template
├── .env                        # Your local environment (gitignored)
├── package.json                # Dependencies & npm scripts
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest test configuration
└── eslint.config.js            # ESLint configuration
```

### Architecture Overview

The project follows a modular, layered architecture:

1. **Entry Point Layer** (`src/index.ts`, `src/server-http.ts`)
   - STDIO MCP server for local clients (Claude Desktop, etc.)
   - HTTP server with OAuth 2.1 for web-based integrations

2. **Tools Layer** (`src/tools/`)
   - MCP tool definitions organized by API category
   - Zod schemas for input validation
   - Tool dispatcher for routing tool calls

3. **API Layer** (`src/api/`)
   - eBay API client implementations
   - HTTP client with authentication interceptors
   - Request/response handling and error management
   - Organized by eBay API categories

4. **Auth Layer** (`src/auth/`)
   - OAuth 2.0 client with PKCE support
   - Token management (access, refresh, app tokens)
   - Automatic token refresh
   - Token persistence via environment variables

5. **Types Layer** (`src/types/`)
   - OpenAPI-generated TypeScript interfaces
   - Native TypeScript enums for constants
   - Custom type definitions

6. **Validation Layer** (`src/utils/`)
   - Zod schemas for API request validation
   - Input sanitization and type coercion
   - Error handling utilities

### Adding New eBay API Endpoints

Want to add support for a new eBay API endpoint? Follow this guide:

#### 1. Find the OpenAPI Specification

Locate the OpenAPI spec in `docs/sell-apps/` or download it:

```bash
npm run download:specs
```

#### 2. Generate TypeScript Types (if needed)

If the API category is new, generate types:

```bash
npm run generate:types
```

This runs `src/scripts/generate-types.sh` which uses `openapi-typescript`.

#### 3. Create the API Implementation

Create a new method in the appropriate API class in `src/api/[category]/`:

```typescript
// Example: src/api/listing-management/inventory.ts
import { z } from 'zod';
import type { InventoryItem } from '@/types/sell_inventory.js';

export class EbayInventoryApi {
  /**
   * Get inventory item by SKU
   * @param sku - The seller-defined SKU
   * @returns The inventory item details
   */
  async getInventoryItem(sku: string): Promise<InventoryItem> {
    return this.client.get(`/sell/inventory/v1/inventory_item/${sku}`);
  }
}
```

#### 4. Create Zod Validation Schema

Add validation in `src/utils/[category]/`:

```typescript
// Example: src/utils/inventory/schemas.ts
import { z } from 'zod';

export const getInventoryItemSchema = z.object({
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or less')
    .describe('The seller-defined SKU for the inventory item'),
});
```

#### 5. Create MCP Tool Definition

Add tool definition in `src/tools/definitions/[category]/`:

```typescript
// Example: src/tools/definitions/inventory/get-inventory-item.ts
import { getInventoryItemSchema } from '@/utils/inventory/schemas.js';

export const getInventoryItemTool = {
  name: 'ebay_get_inventory_item',
  description: 'Get details of a specific inventory item by SKU',
  inputSchema: {
    type: 'object',
    properties: {
      sku: {
        type: 'string',
        description: 'The seller-defined SKU of the inventory item',
      },
    },
    required: ['sku'],
  },
  handler: async (args: unknown) => {
    const { sku } = getInventoryItemSchema.parse(args);
    const api = new EbayInventoryApi(client);
    const item = await api.getInventoryItem(sku);
    return { content: [{ type: 'text', text: JSON.stringify(item, null, 2) }] };
  },
};
```

#### 6. Register the Tool

Add the tool to `src/tools/index.ts`:

```typescript
import { getInventoryItemTool } from './definitions/inventory/get-inventory-item.js';

export const tools = [
  // ... existing tools
  getInventoryItemTool,
];
```

#### 7. Write Tests

Create unit tests in `tests/unit/api/[category]/`:

```typescript
// Example: tests/unit/api/inventory.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EbayInventoryApi } from '@/api/listing-management/inventory.js';

describe('EbayInventoryApi', () => {
  describe('getInventoryItem', () => {
    it('should fetch inventory item by SKU', async () => {
      // Test implementation
    });

    it('should validate SKU format', async () => {
      // Validation test
    });

    it('should handle API errors', async () => {
      // Error handling test
    });
  });
});
```

#### 8. Update Documentation

- Update README.md with the new tool in the [Available Tools](#available-tools) section
- Add JSDoc comments to your code
- Update CHANGELOG.md with your changes

#### 9. Test Your Implementation

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint:fix

# Run tests
npm test

# Test the endpoint manually
npm run test:endpoints
```

For more examples, browse existing API implementations in `src/api/` and tool definitions in `src/tools/definitions/`.

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

### Endpoint Testing

Test all eBay API endpoints to verify which ones are working and which are failing:

```bash
npm run test:endpoints
```

This command will:
- Test all 230+ endpoints across 9 API categories
- Generate detailed logs in `logs/endpoint-tests/<timestamp>/`
- Create a summary report showing passed/failed/skipped endpoints
- Identify authentication and permission issues

**Output:**
- `summary.log` - Human-readable test summary
- `summary.json` - Machine-readable results
- Category-specific logs (e.g., `account-management.log`, `inventory.log`)

**Use cases:**
- ✅ Verify API endpoint functionality before using with LLMs
- 🐛 Debug authentication and permission issues
- 📊 Identify which endpoints have data available
- 🔍 Test in sandbox/production environments safely

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

**Cause**: No user tokens configured in MCP client

**Solution**:

**For MCP Clients (Claude Desktop, Gemini, ChatGPT):**
```bash
# 1. Add tokens to .env file
echo 'EBAY_USER_REFRESH_TOKEN=v^1.1#...' >> .env

# 2. Run auto-setup to update MCP client configs
npm run auto-setup

# 3. Restart your MCP client
```

**For Direct API Usage:**
```bash
# Generate OAuth URL
Use ebay_get_oauth_url tool

# After user authorization, set tokens
Use ebay_set_user_tokens tool with your access and refresh tokens
```

**Note:** As of v1.2.1+, the auto-setup script automatically includes all token environment variables (EBAY_USER_REFRESH_TOKEN, EBAY_USER_ACCESS_TOKEN, etc.) in MCP client configurations, ensuring tokens are available when using MCP clients like Claude Desktop.

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

## 📄 License (Apache 2.0)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [eBay Developers Program](https://developer.ebay.com/) - API access and documentation
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification and SDK
- [Anthropic](https://anthropic.com/) - Claude and MCP support
- [eBay Open Source](https://opensource.ebay.com/) - Learn more about eBay's open source initiatives

---

## 👥 Contributors

Thanks to all the amazing people who have contributed to this project!

<a href="https://github.com/YosefHayim/ebay-api-mcp-server/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp-server" alt="Contributors" />
</a>

---

<div align="center">

Dedicated to the open source community by [Yosef Hayim Sabag](https://github.com/YosefHayim)

</div>
