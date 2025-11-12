# Migration Guide

This guide helps you upgrade between major versions of the eBay API MCP Server, including breaking changes, deprecated features, and migration strategies.

## Table of Contents

- [Version Compatibility Matrix](#version-compatibility-matrix)
- [Migration Paths](#migration-paths)
  - [v1.0.x → v1.1.x](#v10x--v11x)
  - [Future: v1.x → v2.0](#future-v1x--v20)
- [Breaking Changes](#breaking-changes)
- [Deprecation Notices](#deprecation-notices)
- [Database/Storage Migrations](#databasestorage-migrations)
- [Configuration Changes](#configuration-changes)

---

## Version Compatibility Matrix

| Version | Node.js | MCP SDK | eBay API | TypeScript | Status |
|---------|---------|---------|----------|------------|--------|
| 1.1.7 (current) | ≥18.0.0 | 1.21.1 | Sell APIs v1 | 5.9.3 | ✅ Active |
| 1.1.0 - 1.1.6 | ≥18.0.0 | 1.21.1 | Sell APIs v1 | 5.9.3 | ✅ Supported |
| 1.0.x | ≥18.0.0 | 1.x | Sell APIs v1 | 5.x | ⚠️ Deprecated (EOL: 2025-06-01) |
| < 1.0 | ≥16.0.0 | 0.x | Sell APIs v1 | 4.x | ❌ Unsupported |

### Support Policy

- **Active**: Current release, receives all updates (features + bug fixes + security patches)
- **Supported**: Previous minor version, receives critical bug fixes + security patches only
- **Deprecated**: No new features, security patches only until EOL date
- **Unsupported**: No updates, upgrade immediately

---

## Migration Paths

### v1.0.x → v1.1.x

**Migration Difficulty**: 🟢 Easy (30-60 minutes)

#### Summary of Changes

- ✅ Backward compatible - no breaking changes
- ✨ New features: 33 TypeScript enums, improved type safety
- 🔧 Enhanced Zod validation with native enums
- 📦 Package size optimization (-46%)
- 🚀 CI/CD pipeline improvements

#### Step-by-Step Migration

**1. Update Dependencies**

```bash
# Update to latest v1.1.x
npm install ebay-api-mcp-server@^1.1.7

# Or with pnpm
pnpm update ebay-api-mcp-server@^1.1.7
```

**2. Rebuild Project** (if self-hosted)

```bash
npm run clean
npm install
npm run build
```

**3. Update MCP Client Configuration**

No changes required - `claude_desktop_config.json` remains the same.

**4. Optional: Migrate to Native Enums**

If you were using string literals, you can now use native TypeScript enums:

```typescript
// Before (v1.0.x) - Still works in v1.1.x
const marketplace = "EBAY_US";
const condition = "NEW";

// After (v1.1.x) - Recommended for type safety
import { MarketplaceId, Condition } from 'ebay-api-mcp-server/types/ebay-enums';

const marketplace = MarketplaceId.EBAY_US;
const condition = Condition.NEW;
```

**Available Enums** (v1.1.4+):
- `MarketplaceId`, `Condition`, `FormatType`
- `OrderPaymentStatus`, `CampaignStatus`
- `RefundMethod`, `ReturnMethod`, `ShippingCostType`
- `LanguageCode`, `CurrencyCode`, `TimeDurationUnit`
- Plus 20+ more (see `src/types/ebay-enums.ts`)

**5. Update Environment Variables** (Optional)

New optional variables in v1.1.x:

```bash
# OAuth 2.1 (HTTP server mode)
OAUTH_ENABLED=true
OAUTH_AUTH_SERVER_URL=http://localhost:8080/realms/master
OAUTH_USE_INTROSPECTION=true

# Performance tuning
AXIOS_TIMEOUT=60000
EBAY_DEBUG=false
```

**6. Test Your Integration**

```bash
# Run tests to verify compatibility
npm run test

# Test token refresh flow
npm run dev  # or npm run dev:http
```

#### Rollback Plan

If you encounter issues:

```bash
# Rollback to v1.0.x
npm install ebay-api-mcp-server@^1.0.0

# Restore previous build
npm run clean && npm run build
```

Token files (`.ebay-mcp-tokens.json`) are forward and backward compatible.

---

### Future: v1.x → v2.0

**Status**: Not yet released (projected Q2 2025)

**Expected Changes** (subject to change):

#### Potential Breaking Changes

1. **Node.js 20+ Required**
   - Drop support for Node.js 18.x
   - Leverage native `fetch` API (no more axios dependency)

2. **TypeScript 5.5+ Required**
   - Use new TypeScript features (e.g., satisfies operator)
   - Improved inference for enum types

3. **MCP SDK 2.0**
   - Follow MCP SDK major version upgrade
   - New tool registration format
   - Enhanced streaming support

4. **Token Storage Format Change**
   - Migration script: `.ebay-mcp-tokens.json` → `.ebay-mcp-tokens-v2.json`
   - New fields: `tokenVersion`, `lastRefresh`, `scopeChangelog`

5. **Environment Variable Renaming**
   ```bash
   # Old (v1.x)
   EBAY_CLIENT_ID=...
   EBAY_CLIENT_SECRET=...

   # New (v2.0)
   EBAY_APP_ID=...
   EBAY_APP_SECRET=...
   ```

#### Migration Tools (Coming Soon)

We will provide:
- Automated migration CLI: `npx ebay-mcp migrate`
- Token format converter
- Configuration validator
- Compatibility checker

#### Pre-Migration Checklist (v2.0)

- [ ] Upgrade to latest v1.x (v1.1.7+) first
- [ ] Backup `.ebay-mcp-tokens.json`
- [ ] Review CHANGELOG.md for v2.0 breaking changes
- [ ] Test in sandbox environment
- [ ] Update CI/CD pipelines for Node.js 20+
- [ ] Run migration script: `npx ebay-mcp migrate`
- [ ] Verify all tests pass

---

## Breaking Changes

### v1.1.x (None)

✅ **No breaking changes** - v1.1.x is fully backward compatible with v1.0.x.

### v1.0.0 (Initial Release)

**From Beta/Alpha Versions**:

1. **Tool Name Changes**
   - `ebay.getInventoryItem` → `ebay_get_inventory_item` (snake_case)
   - All tool names now use `ebay_` prefix + snake_case

2. **Configuration Format**
   - Old: Individual env vars only
   - New: `mcp-setup.json` centralized config (env vars still supported)

3. **Token Storage Location**
   - Old: `.ebay-tokens.json`
   - New: `.ebay-mcp-tokens.json`
   - Migration: Rename file manually

4. **Response Format Standardization**
   - All tools now return consistent `{ success: true, data: {...} }` format
   - Error responses: `{ success: false, error: { message, code } }`

---

## Deprecation Notices

### Currently Deprecated (Will be Removed in v2.0)

1. **Custom Weekly Dependency Update Script**
   - **Deprecated in**: v1.1.7
   - **Reason**: Replaced by Dependabot (`.github/dependabot.yml`)
   - **Removal Date**: v2.0.0 (Q2 2025)
   - **Migration**: GitHub Dependabot is now enabled automatically

2. **String Literal Enum Values** (Soft Deprecation)
   - **Deprecated in**: v1.1.4
   - **Reason**: Native TypeScript enums provide better type safety
   - **Removal Date**: Never (backward compatible forever)
   - **Migration**: Optional - switch to `z.nativeEnum()` in Zod schemas

### Future Deprecations (Tentative)

1. **STDIO-Only Deployment** (v2.1+)
   - HTTP mode with OAuth 2.1 will become the recommended default
   - STDIO mode will remain supported but with limited updates

2. **App Token Fallback** (v3.0+)
   - User tokens will become required for production deployments
   - App tokens will only work in sandbox environment

---

## Database/Storage Migrations

### Token Storage Format

#### v1.0.x → v1.1.x (No Changes)

Token file format is identical:

```json
{
  "userAccessToken": "v^1.1#...",
  "userRefreshToken": "v^1.1#...",
  "userAccessTokenExpiry": 1234567890000,
  "userRefreshTokenExpiry": 1234567890000,
  "scope": "https://api.ebay.com/oauth/api_scope/...",
  "environment": "sandbox"
}
```

No migration required.

#### Future: v1.x → v2.0 (Planned)

New fields will be added:

```json
{
  "tokenVersion": "2.0",
  "userAccessToken": "v^1.1#...",
  "userRefreshToken": "v^1.1#...",
  "userAccessTokenExpiry": 1234567890000,
  "userRefreshTokenExpiry": 1234567890000,
  "lastRefreshTimestamp": 1234567890000,
  "scope": "https://api.ebay.com/oauth/api_scope/...",
  "scopeChangelog": [
    {
      "timestamp": 1234567890000,
      "addedScopes": ["sell.inventory"],
      "removedScopes": []
    }
  ],
  "environment": "sandbox"
}
```

**Migration Script** (will be provided):

```bash
# Automatic migration
npx ebay-mcp migrate-tokens

# Manual migration
cp .ebay-mcp-tokens.json .ebay-mcp-tokens.json.backup
node scripts/migrate-tokens-v2.js
```

### MCP Client Configuration

#### v1.0.x → v1.1.x (No Changes)

Configuration format remains the same in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ebay-api": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "env": {
        "EBAY_CLIENT_ID": "...",
        "EBAY_CLIENT_SECRET": "...",
        "EBAY_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

#### Automated Setup Script (v1.1.3+)

Use the automated setup script:

```bash
# Generate mcp-setup.json template
./scripts/create-mcp-setup.sh

# Edit mcp-setup.json with your credentials

# Auto-generate MCP client configs
./scripts/setup-mcp-clients.sh
```

This generates configs for:
- Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)
- Google Gemini (if enabled)
- ChatGPT (if enabled)

---

## Configuration Changes

### Environment Variables

#### Added in v1.1.x

```bash
# OAuth 2.1 (HTTP server mode only)
OAUTH_ENABLED=true
OAUTH_AUTH_SERVER_URL=http://localhost:8080/realms/master
OAUTH_CLIENT_ID=mcp-client-id
OAUTH_CLIENT_SECRET=mcp-client-secret
OAUTH_REQUIRED_SCOPES=mcp:tools
OAUTH_USE_INTROSPECTION=true

# Performance tuning
AXIOS_TIMEOUT=60000  # Request timeout (ms)
EBAY_DEBUG=false     # Verbose logging
```

All variables are **optional** and backward compatible.

#### Removed in v1.1.x

None - all v1.0.x variables are still supported.

### Package.json Scripts

#### Added in v1.1.x

```json
{
  "scripts": {
    "dev:http": "tsx src/server-http.ts",
    "start:http": "node build/server-http.js"
  }
}
```

Existing scripts remain unchanged.

---

## Common Migration Issues

### Issue: "Cannot find module '@/types/ebay-enums'"

**Cause**: Using native enums in TypeScript before rebuilding.

**Solution**:
```bash
npm run clean
npm run build
```

### Issue: "Invalid access token" after upgrade

**Cause**: Token file permissions or corrupted token.

**Solution**:
```bash
# Re-authenticate
rm .ebay-mcp-tokens.json
# Restart server and generate new OAuth URL
npm run dev
```

### Issue: Tests failing after upgrade

**Cause**: Test dependencies out of sync.

**Solution**:
```bash
rm -rf node_modules
npm install
npm run test
```

### Issue: MCP client not recognizing tools

**Cause**: Stale MCP client cache.

**Solution**:
```bash
# Restart Claude Desktop / MCP client
# Or regenerate config
./scripts/setup-mcp-clients.sh
```

---

## Getting Help

### Before Migrating

1. Read [CHANGELOG.md](CHANGELOG.md) for detailed version history
2. Check [GitHub Issues](https://github.com/YosefHayim/ebay-api-mcp-server/issues) for known migration issues
3. Backup your `.ebay-mcp-tokens.json` and `mcp-setup.json`

### During Migration

1. Follow this guide step-by-step
2. Test in sandbox environment first
3. Keep backups of all config files

### After Migration

1. Run full test suite: `npm run test`
2. Verify OAuth flow: `npm run dev`
3. Check all integrations with MCP clients

### Support Channels

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/YosefHayim/ebay-api-mcp-server/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/YosefHayim/ebay-api-mcp-server/discussions)
- 📧 **Security Issues**: See [SECURITY.md](SECURITY.md)

---

## Related Documentation

- [CHANGELOG.md](CHANGELOG.md) - Detailed version history
- [README.md](README.md) - Main documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup
- [SECURITY.md](SECURITY.md) - Security policy

---

**Last Updated**: 2025-11-12
**Current Version**: 1.1.7
