# eBay API MCP Server - Utility Scripts

This directory contains automated setup and utility scripts for the eBay API MCP Server.

## Available Scripts

### 1. Automatic Setup (`auto-setup.ts`)

**Automated configuration for all MCP clients with zero manual configuration**

#### Quick Start
```bash
# Automatically runs after npm install, or run manually:
npm run auto-setup
```

#### What It Does

1. **Validates Environment**: Checks `.env` file for required eBay credentials
2. **Detects MCP Clients**: Automatically finds installed MCP clients (Claude Desktop, Gemini, ChatGPT)
3. **Generates Configurations**: Creates/updates MCP client config files with your credentials
4. **Creates Token File**: Generates `.ebay-mcp-tokens.json` if user tokens are in `.env`

#### Requirements

- Node.js 18+ installed
- `.env` file configured with eBay credentials
- Built project (runs automatically during `npm install`)

#### Configuration

Edit `.env` file with your eBay credentials:

```bash
# Required
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox
EBAY_REDIRECT_URI=https://your-app.com/callback

# Optional (for high rate limits)
EBAY_USER_ACCESS_TOKEN=v^1.1#...
EBAY_USER_REFRESH_TOKEN=v^1.1#...
```

#### Supported MCP Clients

- ✅ **Claude Desktop** (macOS, Windows, Linux)
- ✅ **Gemini** (all platforms)
- ✅ **ChatGPT** (all platforms)

#### Platform-Specific Config Paths

**macOS:**
- Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Gemini: `~/.config/gemini/config.json`
- ChatGPT: `~/.config/chatgpt/config.json`

**Linux:**
- Claude Desktop: `~/.config/Claude/claude_desktop_config.json`
- Gemini: `~/.config/gemini/config.json`
- ChatGPT: `~/.config/chatgpt/config.json`

**Windows:**
- Claude Desktop: `%APPDATA%/Claude/claude_desktop_config.json`
- Gemini: `~/.config/gemini/config.json`
- ChatGPT: `~/.config/chatgpt/config.json`

#### Usage

```bash
# Configure your credentials
cp .env.example .env
nano .env

# Run auto-setup (also runs automatically after npm install)
npm run auto-setup

# Restart your MCP client to load the configuration
```

#### Features

- ✅ Zero configuration required
- ✅ Runs automatically during installation
- ✅ Detects all installed MCP clients
- ✅ Backs up existing configurations
- ✅ No external dependencies (no jq required)
- ✅ Cross-platform support (macOS, Linux, Windows)

For more details, see [AUTO-SETUP.md](../docs/AUTO-SETUP.md).

---

### 2. Type Generation (`generate-types.sh`)

**Generate TypeScript types from OpenAPI specifications**

#### Quick Start
```bash
npm run generate:types
```

#### What It Does

Generates TypeScript type definitions for all eBay APIs from the OpenAPI specifications in the `docs/` folder:

- Account API
- Analytics API
- Communication API (Feed, Feedback, Notification)
- Fulfillment API
- Inventory API
- Marketing API
- Metadata API
- Other APIs (Recommendation, Taxonomy)

#### Requirements

- `openapi-typescript` package (installed as dev dependency)
- OpenAPI spec files in `docs/` directory

#### Generated Files

Types are generated in `src/types/`:
- `account.ts` - Account management types
- `analytics.ts` - Analytics and reporting types
- `communication.ts` - Messaging and notification types
- `fulfillment.ts` - Order and shipping types
- `inventory.ts` - Inventory management types
- `marketing.ts` - Marketing campaign types
- `metadata.ts` - Metadata and location types
- `other.ts` - Miscellaneous API types

#### Usage

```bash
# Generate all types
npm run generate:types

# Or run the script directly
bash scripts/generate-types.sh
```

#### When to Regenerate Types

Run this script when:
- eBay updates their OpenAPI specifications
- You add new API endpoints
- You update OpenAPI spec files in `docs/`

---

## Script Development

All scripts are located in the `scripts/` directory and follow these conventions:

- **TypeScript scripts**: Run via npm scripts (e.g., `npm run auto-setup`)
- **Shell scripts**: Use bash and should be cross-platform compatible
- **Documentation**: Each script has detailed documentation in this README

### Adding New Scripts

When adding a new script:

1. Create the script in the `scripts/` directory
2. Add it to `package.json` scripts section if it's a TypeScript script
3. Make shell scripts executable: `chmod +x scripts/your-script.sh`
4. Document it in this README with:
   - Purpose and overview
   - Requirements
   - Usage examples
   - Configuration options

---

## Troubleshooting

### Auto-setup Issues

**Error: "Environment validation failed"**
- Make sure `.env` file exists and contains `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`
- Check that `.env` is in the project root directory

**Error: "No MCP clients detected"**
- Install an MCP client (Claude Desktop, Gemini, or ChatGPT)
- Run `npm run auto-setup` again after installation

**Error: "Build directory not found"**
- Run `npm run build` first
- Make sure the build completed successfully

### Type Generation Issues

**Error: "OpenAPI spec not found"**
- Check that OpenAPI spec files exist in `docs/` directory
- Verify file paths match those in `generate-types.sh`

**Error: "openapi-typescript command not found"**
- Run `npm install` to install dev dependencies
- Make sure you're in the project root directory

---

## Security

- **Never commit `.env` files** - Already protected in `.gitignore`
- **Never commit `.ebay-mcp-tokens.json`** - Already protected in `.gitignore`
- **Set restrictive permissions**: `chmod 600 .env .ebay-mcp-tokens.json`
- **Rotate tokens regularly**, especially if exposed

---

## Documentation

For more information, see:

- [AUTO-SETUP.md](../docs/AUTO-SETUP.md) - Detailed auto-setup documentation
- [Authentication Guide](../docs/auth/README.md) - OAuth and token management
- [README.md](../README.md) - Main project documentation
