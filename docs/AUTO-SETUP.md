# Auto-Setup System Documentation

## Overview

The eBay API MCP Server features an automatic configuration system that eliminates manual setup complexity. When you run `npm install`, the system automatically detects installed MCP clients and generates their configurations from your `.env` file.

## How It Works

### 1. Single Configuration Source

All configuration is managed through a single `.env` file:

```bash
# Required (4 values)
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox
EBAY_REDIRECT_URI=your_runame

# Optional (for high rate limits)
EBAY_USER_ACCESS_TOKEN=v^1.1#...
EBAY_USER_REFRESH_TOKEN=v^1.1#...
```

### 2. Automatic Client Detection

The `auto-setup.ts` script automatically detects installed MCP clients by checking standard configuration directories:

**Claude Desktop:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Gemini:**
- All platforms: `~/.config/gemini/config.json`

**ChatGPT:**
- All platforms: `~/.config/chatgpt/config.json`

### 3. Automatic Configuration Generation

For each detected client, the script:
1. Creates/updates the client's MCP server configuration
2. Injects eBay credentials from `.env`
3. Sets the correct path to `build/index.js`
4. Backs up existing configs before modification

### 4. Token File Creation

If user tokens are present in `.env`, the script creates `.ebay-mcp-tokens.json`:

```json
{
  "userAccessToken": "v^1.1#...",
  "userRefreshToken": "v^1.1#...",
  "environment": "sandbox"
}
```

## Installation Flow

```
npm install
    ↓
npm run prepare (build)
    ↓
npm run build (tsc && tsc-alias)
    ↓
npm run postinstall
    ↓
npm run auto-setup
    ↓
node build/scripts/auto-setup.js
    ↓
✅ All MCP clients configured!
```

## Manual Execution

You can also run auto-setup manually:

```bash
# After editing .env
npm run auto-setup
```

## What Gets Generated

### Claude Desktop Config

```json
{
  "mcpServers": {
    "ebay": {
      "command": "node",
      "args": ["/path/to/ebay-api-mcp-server/build/index.js"],
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

### Token File (.ebay-mcp-tokens.json)

```json
{
  "userAccessToken": "v^1.1#...",
  "userRefreshToken": "v^1.1#...",
  "environment": "sandbox"
}
```

## Error Handling

### Missing .env

```
❌ .env file not found. Copy .env.example to .env and fill in your credentials.
```

### Missing Required Variables

```
❌ EBAY_CLIENT_ID is not set in .env
❌ EBAY_CLIENT_SECRET is not set in .env
```

### Invalid Environment

```
❌ EBAY_ENVIRONMENT must be "production" or "sandbox", got: "invalid"
```

### No Clients Detected

```
⚠️  No MCP clients detected on this system
ℹ️  Supported clients: Claude Desktop, Gemini, ChatGPT
ℹ️  Install a client and run this script again
```

## Validation Steps

The auto-setup script performs these validations:

1. **Environment File:** Checks if `.env` exists
2. **Required Variables:** Validates `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` are set
3. **Environment Value:** Ensures `EBAY_ENVIRONMENT` is "sandbox" or "production"
4. **Build Directory:** Warns if `build/index.js` doesn't exist
5. **Client Detection:** Identifies installed MCP clients
6. **Config Generation:** Creates/updates client configurations
7. **Token Setup:** Creates token file if user tokens provided

## Benefits

### For Users

- **3-Step Setup:** Clone → Edit .env → npm install
- **Zero Manual Config:** No JSON editing required
- **Cross-Platform:** Works on macOS, Windows, Linux
- **Multiple Clients:** Detects and configures all installed clients
- **Safe Updates:** Backs up existing configs

### For Developers

- **Standard .env Pattern:** Familiar workflow
- **Single Source of Truth:** No config duplication
- **Automatic Testing:** Validates setup on install
- **Clear Error Messages:** Actionable feedback
- **Type-Safe:** Written in TypeScript with full type checking

## Comparison: Old vs New

### Old Setup (10+ steps)

1. Run `./scripts/create-mcp-setup.sh`
2. Edit `mcp-setup.json` (complex nested JSON)
3. Set credentials in JSON
4. Enable/disable clients in JSON
5. Set token values in JSON
6. Verify buildPath is correct
7. Run `./scripts/setup-mcp-clients.sh`
8. Wait for bash script to execute
9. Check for errors
10. Restart MCP clients
11. Test connection

### New Setup (3 steps)

1. `cp .env.example .env`
2. Edit 4 values in `.env`
3. `npm install` (auto-configures everything!)

**Time Saved:** ~5-10 minutes per installation

## Backwards Compatibility

The old `mcp-setup.json` approach still works but is marked as **deprecated**:

```
⚠️  Using legacy mcp-setup.json (deprecated)
ℹ️  Migrate to .env for simpler configuration
ℹ️  Run: npm run migrate-to-env
```

## Future Enhancements

- [ ] Migration tool for existing `mcp-setup.json` users
- [ ] Support for custom client config paths
- [ ] Auto-detection of more MCP clients
- [ ] Interactive setup wizard (optional)
- [ ] Health check after configuration

## Technical Details

### File Structure

```
src/
  scripts/
    auto-setup.ts          # Main auto-setup script
build/
  scripts/
    auto-setup.js          # Compiled script
.env                       # User configuration
.ebay-mcp-tokens.json      # Auto-generated token file
```

### Dependencies

- `dotenv` - Load environment variables
- `fs` - File system operations
- `os` - Platform detection
- `path` - Path manipulation

### Exit Codes

- `0` - Success
- `1` - Validation errors or setup failure

## Troubleshooting

### Script Doesn't Run on Install

Check that `postinstall` hook is present in `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm run auto-setup --if-present || true"
  }
}
```

### Config Not Generated

1. Check that MCP client is installed
2. Verify client config directory exists
3. Check file permissions
4. Run `npm run auto-setup` manually for detailed output

### Token File Not Created

1. Ensure `EBAY_USER_ACCESS_TOKEN` and `EBAY_USER_REFRESH_TOKEN` are set in `.env`
2. Check file permissions in project root
3. Look for error messages in auto-setup output

## Support

- **Documentation:** https://github.com/YosefHayim/ebay-api-mcp-server#readme
- **Issues:** https://github.com/YosefHayim/ebay-api-mcp-server/issues
- **Discussions:** https://github.com/YosefHayim/ebay-api-mcp-server/discussions
