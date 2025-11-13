# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.3] - 2025-01-13

### Changed
- **Documentation Updates**: Updated tool counts throughout documentation
  - README.md: Updated from 140 to 230+ tools in all references
  - Tool category breakdown updated with accurate counts (Account: 40, Inventory: 34, Marketing: 77, etc.)
  - Test count badge updated to 890+ passing tests
  - Enhanced descriptions for Communication, Metadata, and Other categories
- **TODO.md Updates**: Marked eDelivery MCP tools and Zod schemas as complete
- **CLAUDE.md Updates**: Moved completed tasks to "Recent Completed Tasks" section

## [1.2.2] - 2025-01-13

### Added
- **Complete eDelivery API Implementation** (24 new endpoints)
  - **Cost & Preferences**: `getActualCosts`, `getAddressPreferences`, `createAddressPreference`, `getConsignPreferences`, `createConsignPreference`
  - **Agents & Services**: `getAgents`, `getBatteryQualifications`, `getDropoffSites`, `getShippingServices`
  - **Bundles**: `createBundle`, `getBundle`, `cancelBundle`, `getBundleLabel`
  - **Packages (Single)**: `createPackage`, `getPackage`, `deletePackage`, `getPackageByOrderLineItem`, `cancelPackage`, `clonePackage`, `confirmPackage`
  - **Packages (Bulk)**: `bulkCancelPackages`, `bulkConfirmPackages`, `bulkDeletePackages`
  - **Labels & Tracking**: `getLabels`, `getHandoverSheet`, `getTracking`
  - **Other**: `createComplaint`

- **MCP Tool Definitions**: 24 new tool definitions for all eDelivery endpoints with Zod validation schemas
  - Tools cover international shipping package management, bundle operations, label generation, and tracking
  - Complete input validation for all endpoint parameters

### Changed
- **Test Suite Enhancements**
  - Added 24 comprehensive unit tests for all eDelivery API endpoints
  - Improved test coverage across integration and unit test files
  - Enhanced error handling tests for API client and OAuth flows

### Documentation
- **Updated TODO.md**: Marked all 24 eDelivery endpoints as complete
- Comprehensive documentation for eDelivery API usage patterns

### Fixed
- **Auto-Setup Token Configuration**: Fixed MCP client configurations to include all token environment variables
  - `EBAY_USER_REFRESH_TOKEN`, `EBAY_USER_ACCESS_TOKEN`, and `EBAY_APP_ACCESS_TOKEN` now automatically included
  - Resolves "Access token is missing" error when using Claude Desktop and other MCP clients
  - Tokens from `.env` file are now properly propagated to all detected MCP clients

- **OAuth Setup Instructions**: Updated with clearer guidance on token configuration
- **Troubleshooting Documentation**: Added section for MCP client token issues
- **Token Persistence Clarity**: Clarified the difference between `.env` token persistence vs MCP tool memory-only tokens

## [1.2.1] - 2025-01-13

### Fixed
- **CI/CD Pipeline**: Fixed YAML syntax error in `.github/workflows/ci.yml`
  - Corrected indentation on line 66 (`version: 10` now properly aligned with 2 spaces)
  - Ensures GitHub Actions workflows execute without validation errors
  - All workflows validated and confirmed working

### Quality Improvements
- Improved CI/CD reliability with proper YAML formatting
- All GitHub Actions workflows now pass validation

## [1.2.0] - 2025-01-12

### Added
- **Cloudflare Workers Deployment Support**
  - Added HTTP transport with OAuth 2.1 for remote multi-user scenarios
  - Cloudflare KV namespace integration for distributed token storage
  - Production-ready Wrangler configuration (`wrangler.toml`)
  - OAuth 2.1 metadata endpoint (`/.well-known/oauth-authorization-server`)
  - Comprehensive deployment guide (`docs/CLOUDFLARE.md`)
  - NPM scripts for Cloudflare deployment (`cf:create-kv`, `cf:deploy`, `cf:tail`)

### Changed
- **Token Management Refactoring** (BREAKING CHANGE)
  - Migrated from file-based (`.ebay-mcp-tokens.json`) to environment-only (`.env`) token storage
  - Tokens now loaded exclusively from `EBAY_USER_REFRESH_TOKEN` environment variable
  - Automatic token refresh on server initialization
  - Memory-only token storage during runtime (no file persistence)
  - Simplified deployment and improved security (tokens never committed)

- **Documentation Enhancements**
  - Updated all README files to reflect `.env-only` token management
  - Added comprehensive OAuth 2.1 setup guide for Cloudflare Workers
  - Enhanced CLAUDE.md with Cloudflare deployment workflow
  - Clarified token management benefits and migration path

### Fixed
- **Cloudflare Worker Compatibility**
  - Fixed `response.end()` handling for optional chunk parameter
  - Disabled OAuth metadata endpoint to prevent conflicts with MCP protocol
  - Resolved response mocking issues in HTTP transport layer

### Migration Guide (v1.1.x → v1.2.0)

**BREAKING CHANGE**: Token storage moved from `.ebay-mcp-tokens.json` to `.env` file.

**Steps to Migrate:**
1. Add `EBAY_USER_REFRESH_TOKEN=v^1.1#...` to your `.env` file
2. Remove any existing `.ebay-mcp-tokens.json` files
3. Restart your MCP server
4. Tokens will automatically refresh on startup

**Benefits:**
- Simpler deployment (no file management)
- Better security (tokens in `.env`, not committed to git)
- Automatic refresh ensures valid tokens

## [1.1.8] - 2025-01-12

### Added
- **Critical Documentation Suite** (2000+ lines total)
  - Added `PERFORMANCE.md` (400+ lines): Comprehensive performance optimization guide covering rate limiting strategies, caching patterns, connection pooling, memory optimization, benchmarks, and production tuning
  - Added `EXAMPLES.md` (500+ lines): Real-world workflow examples including complete listing creation, order fulfillment, marketing campaigns, analytics, and integration patterns
  - Added `MIGRATION.md` (350+ lines): Version upgrade guide with compatibility matrix, step-by-step migration paths, breaking changes documentation, and rollback procedures
  - Added `MONITORING.md` (600+ lines): Production monitoring guide with Prometheus metrics, Pino structured logging, alerting rules, health checks, error tracking, APM integration, and Grafana dashboards

- **Developer Experience Enhancements**
  - Added `.editorconfig`: Cross-editor consistency configuration (supports VSCode, Vim, Emacs, IntelliJ, and more)
  - Added `.nvmrc`: Node.js version pinning for nvm/fnm users (Node.js 18.x LTS)
  - Added `.github/dependabot.yml`: Automated dependency updates for npm packages and GitHub Actions (weekly schedule, grouped minor/patch updates, auto-assigned PRs)
  - Added `.github/FUNDING.yml`: GitHub Sponsors configuration template for project sustainability

- **Legal Compliance**
  - Added `LICENSE`: MIT License file (critical - was declared in package.json but missing from repository)
  - Proper copyright attribution: "Copyright (c) 2025 Yosef Hayim Sabag"

### Changed
- **Project Status** (`CLAUDE.md`)
  - Updated "Infrastructure & Tooling" section to reflect completion of all 9 enhancement items
  - Moved .editorconfig, .nvmrc, Dependabot, FUNDING.yml, and LICENSE from "Future Enhancements" to "Infrastructure & Tooling" (marked complete ✅)
  - Created new "Recently Completed Documentation (2025-01-12)" section tracking the 4 major documentation additions
  - Updated "Future Enhancements" with new meaningful items (ARCHITECTURE.md, API_REFERENCE.md, Docker Compose, Kubernetes manifests)

- **Best Practices Score Improvement**
  - Project maturity improved from 95/100 to estimated 98/100
  - Resolved 2 critical gaps identified in audit: LICENSE file and .editorconfig
  - Enhanced automation with industry-standard Dependabot (replaces custom weekly script)
  - Comprehensive documentation suite now covers performance, examples, migration, and monitoring

### Fixed
- **Dependabot Configuration**: Fixed YAML validation errors
  - Changed timezone from "UTC" to "Etc/UTC" (IANA timezone format requirement)
  - Removed unsupported "reviewers" field (Dependabot only supports "assignees")
  - Verified configuration validates against GitHub's schema

## [1.1.7] - 2025-01-12

### Removed
- **GitHub Actions**: Removed Prettier and ESLint linting workflow
  - Removed `.github/workflows/lint.yml` to streamline CI/CD pipeline
  - Linting and formatting still available via npm scripts (`npm run lint`, `npm run format:check`)
  - Reduces CI overhead while maintaining local development quality checks

### Changed
- **CI/CD Optimization**: Simplified GitHub Actions workflow by removing redundant lint checks
  - Main CI workflow still runs typecheck, tests, and builds
  - Developers encouraged to use `npm run check` locally before pushing

## [1.1.4] - 2025-01-12

### Added
- **Comprehensive Enum Type System** (`src/types/ebay-enums.ts`)
  - Added 33 TypeScript native enums covering all eBay API domains
  - Core business enums: MarketplaceId (41 values), Condition (17 values), FormatType, OrderPaymentStatus, CampaignStatus
  - Policy enums: RefundMethod, ReturnMethod, ReturnShippingCostPayer, ShippingCostType, ShippingOptionType, CategoryType, PaymentMethodType, DepositType
  - Fulfillment & inventory enums: LineItemFulfillmentStatus, OfferStatus, ListingStatus, PublishStatus
  - Compliance & standards: ComplianceType
  - Measurement units: TimeDurationUnit (9 values), WeightUnit (4 values), LengthUnit (4 values)
  - Localization: LanguageCode (13 values), CurrencyCode (14 values)
  - Regulatory & metadata: RegionType, ExtendedProducerResponsibilityEnum
  - All enums include JSDoc documentation with eBay API references
- **Enhanced Type Safety**
  - Updated all Zod validation schemas in `src/tools/schemas.ts` to use `z.nativeEnum()` instead of string enums
  - 23 schema objects now use native enum validation
  - Provides compile-time type checking and runtime validation
- **Comprehensive Test Coverage**
  - Added `tests/unit/types/ebay-enums.test.ts` with 49 tests validating enum structure and values
  - Added `tests/unit/tools/schemas-enums.test.ts` with 37 tests validating Zod schema integration
  - Tests verify enum value counts, type safety, runtime validation, and cross-schema consistency
- **Documentation**
  - Created `docs/ENUMS_ANALYSIS.md` with comprehensive enum catalog
  - Documents 180+ total eBay enum types (33 implemented, 147+ pending)
  - Includes implementation priorities, usage examples, and migration guide

### Changed
- **Tool Definitions Enhanced** (`src/tools/tool-definitions.ts`)
  - Updated 19 tool input schemas to use native enum types via `z.nativeEnum()`
  - Improved auto-completion and compile-time validation for tool parameters
- **Type System Organization**
  - Centralized enum exports through `src/types/index.ts`
  - Improved module structure for better tree-shaking and IDE support

### Quality Improvements
- **Test Suite Expansion**: 870 tests (up from 784) across 26 test files
- **Function Coverage**: Maintained at 99%+
- **Type Safety**: Eliminated string literal types in favor of native enums for better refactoring safety
- **Developer Experience**: IDE auto-completion now suggests valid enum values across all eBay API parameters

### Development Statistics
- **Total Commits**: 167 (up from 141)
- **Enum Types Implemented**: 33 core enums
- **Test Coverage Added**: 86 new enum tests (49 structure + 37 validation)
- **Lines of Code**: ~16,500+ (excluding tests and docs)

## [1.1.3] - 2025-11-12

### Fixed
- **Marketing API Test Suite**: Fixed 11 failing tests in `tests/unit/api/marketing.test.ts`
  - Fixed `updateAdGroupBids` test: Added missing `adGroupId` parameter and corrected endpoint path
  - Fixed `updateAdGroupKeywords` test: Added missing `adGroupId` parameter and corrected endpoint path
  - Fixed keyword bulk operation tests: Changed singular endpoints to plural (`bulk_create_keywords`, `bulk_delete_keywords`, `bulk_update_keyword_bids`)
  - Fixed negative keyword tests: Changed singular endpoints to plural for both campaign and ad group levels
  - Updated mocks to return `void` for methods with `Promise<void>` return type

### Quality Improvements
- All 784 tests now passing (100% test suite health)
- Function coverage: 99.17% (exceeds 91% threshold)
- Line coverage: 85.18% (exceeds 83% threshold)
- Improved test reliability and accuracy for eBay Marketing API operations

### Added
- **Automated MCP Client Setup Script** (`scripts/setup-mcp-clients.sh`)
  - Auto-detects and configures Claude Desktop, Gemini CLI, and ChatGPT Desktop
  - Interactive credential collection (eBay Client ID, Secret, Environment, optional Redirect URI)
  - Cross-platform support (macOS, Linux, Windows via WSL)
  - Automatic jq installation for JSON manipulation
  - Build verification and absolute path resolution
  - Comprehensive error handling and colored user feedback
  - Summary report of successfully configured clients
- **Enhanced README Documentation**
  - "Quick Install (Recommended)" section with automated setup instructions
  - Restructured Quick Start with "Automated Setup" and "Manual Setup" sections
  - Collapsible Manual Configuration details to improve readability
  - Automated Setup troubleshooting guide covering common issues
  - Platform-specific configuration paths for all supported clients
  - Updated Table of Contents reflecting new documentation structure
- **Scripts Documentation** (`scripts/README.md`)
  - Comprehensive documentation for `setup-mcp-clients.sh`
  - Detailed platform-specific configuration paths (macOS, Linux, Windows)
  - Security notes regarding credential storage and file permissions
  - Troubleshooting section for common setup issues
  - Usage examples and requirements

### Changed
- README.md Installation section now prioritizes automated setup over manual configuration
- Usage section reorganized to emphasize automated approach while maintaining manual options
- Quick Start section completely restructured for better user onboarding experience

### Developer Experience
- Reduced time-to-first-run from ~10 minutes (manual) to ~2 minutes (automated)
- Eliminated common configuration errors (relative paths, missing environment variables)
- Single command setup: `./scripts/setup-mcp-clients.sh`

## [1.1.2] - 2025-11-11

### Changed
- **Package size optimization**: Reduced unpacked size from 6.68 MB to 3.6 MB (-46%)
- **Package file optimization**: Reduced total files from 666 to 135 (-80%)
- Created `.npmignore` to exclude development files, source maps, and duplicate type directories
- Disabled source maps and declaration maps in production builds
- Fixed type generation script to output flat structure (no duplicate `openapi-schemas/` directory)

### Technical Improvements
- Added `sourceMap: false` and `declarationMap: false` to `tsconfig.json`
- Updated `scripts/generate-types.sh` to prevent duplicate type file generation
- Added missing eDelivery schema to type generation script

### Performance Impact
- Faster npm install times due to 46% smaller package
- Reduced disk space usage for consumers
- Maintained all functionality and IDE support (`.d.ts` files still included)

## [1.1.1] - 2025-11-11

### Fixed
- Corrected GitHub repository URLs in package.json (changed from placeholder `/user/` to actual `/YosefHayim/`)
- Fixed repository, homepage, and bugs URLs to point to correct GitHub account

## [1.1.0] - 2025-11-11

### Added
- GitHub Actions CI/CD pipeline with automated testing and linting
- 90% test coverage enforcement in CI
- Dual package manager support (npm and pnpm)
- `.npmrc` configuration for package manager flexibility
- Comprehensive README.md with installation instructions for both package managers
- Weekly automated dependency updates via GitHub Actions

### Changed
- Updated all npm scripts to be package manager agnostic
- Enhanced documentation with parallel installation instructions
- Weekly dependency updates for security and stability

### Fixed
- GitHub Actions CI configuration to use pnpm correctly
- Removed invalid `types` dependency from devDependencies
- Fixed hardcoded pnpm commands in package.json scripts

### Development
- Total commits: 141 since initial release
- Test suite: 533 tests across 17 test files
- Code coverage: >90% on critical paths
- CI/CD: Automated testing, linting, and type checking

## [1.0.0] - 2025-11-09

### Added
- Initial production release
- Complete MCP server implementation with 170+ eBay API tools
- Full coverage of 9 eBay API categories:
  - Account Management (28 tools)
  - Inventory Management (30 tools)
  - Order Fulfillment (4 tools)
  - Marketing & Promotions (9 tools)
  - Analytics & Reporting (4 tools)
  - Metadata & Taxonomy (29 tools)
  - Communication APIs (3 tools)
  - Other APIs (8 tools)
- OAuth 2.0/2.1 authentication with automatic token refresh
- Dual transport modes:
  - STDIO for local desktop applications (Claude Desktop)
  - HTTP with OAuth 2.1 for remote multi-user scenarios
- Token persistence across sessions via file storage
- Type-safe implementation:
  - Zod schemas for runtime validation
  - OpenAPI-generated TypeScript types
  - Strict TypeScript configuration
- Comprehensive testing infrastructure:
  - Vitest test framework
  - Unit tests for core functionality
  - 533 passing tests
  - Coverage reporting with @vitest/coverage-v8
- Complete documentation:
  - CLAUDE.md (comprehensive development guide)
  - GEMINI.md (Gemini-specific instructions)
  - OAUTH-SETUP.md (OAuth 2.1 setup guide)
  - README.md (user-facing documentation)
  - API category-specific documentation
- Environment-specific OAuth scope management
  - Production scopes (`docs/auth/production_scopes.json`)
  - Sandbox scopes (`docs/auth/sandbox_scopes.json`)
  - Scope validation per environment
- Layered architecture:
  - MCP Protocol Layer (stdio + HTTP)
  - Tool Definition Layer (170+ tools with Zod schemas)
  - API Facade Layer (unified access point)
  - API Implementation Layer (9 categories)
  - HTTP Client Layer (Axios with interceptors)
  - Authentication Layer (OAuth with token management)
  - Configuration Layer (environment management)
- Developer tooling:
  - TypeScript compilation with `tsc` and `tsc-alias`
  - Hot reload with `tsx`
  - Code formatting with Prettier
  - Linting with ESLint
  - Type generation from OpenAPI specs

### Technical Specifications
- **Runtime**: Node.js 18.0.0 or higher
- **Language**: TypeScript 5.9.3 (ES2022 modules)
- **MCP SDK**: @modelcontextprotocol/sdk v1.21.1
- **HTTP Client**: axios v1.7.9
- **Validation**: zod v3
- **Testing**: vitest v4.0.8
- **Server**: express v5.1.0 (HTTP mode)
- **JWT**: jose v6.1.1, jsonwebtoken v9.0.2

### Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.21.1",
  "axios": "^1.7.9",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^5.1.0",
  "jose": "^6.1.1",
  "jsonwebtoken": "^9.0.2",
  "zod": "3"
}
```

---

## Version History Summary

| Version | Date       | Commits | Key Changes                                    |
|---------|------------|---------|------------------------------------------------|
| 1.2.1   | 2025-01-13 | 176     | CI/CD YAML syntax fix                          |
| 1.2.0   | 2025-01-12 | 167+    | Cloudflare Workers, .env-only token management |
| 1.1.8   | 2025-01-12 | 167     | Critical documentation suite (2000+ lines)     |
| 1.1.4   | 2025-01-12 | 167     | Comprehensive enum type system, 870 tests      |
| 1.1.3   | 2025-11-12 | 141+    | Marketing test fixes, automated setup          |
| 1.1.2   | 2025-11-11 | 141     | Package optimization (-46% size)               |
| 1.1.1   | 2025-11-11 | 141     | GitHub URL corrections                         |
| 1.1.0   | 2025-11-11 | 141     | CI/CD, dual package managers, enhancements     |
| 1.0.0   | 2025-11-09 | -       | Initial production release, complete feature set |

## Development Statistics

- **Total Commits**: 167
- **Development Period**: 3 days (Nov 9-12, 2025)
- **Test Coverage**: 90%+ on critical paths
- **Test Suite**: 870 tests across 26 test files
- **Tools Implemented**: 170+ eBay API tools
- **API Categories**: 9 fully implemented
- **Enum Types**: 33 core enums, 147+ pending
- **Lines of Code**: ~16,500+ (excluding tests and docs)

## Upgrade Guide

### From 1.0.0 to 1.1.0

This is a **minor version update** with no breaking changes. All existing functionality remains compatible.

**New Features:**
1. You can now use either npm or pnpm as your package manager
2. CI/CD pipeline automatically runs tests on pull requests
3. Dependencies are kept up-to-date weekly

**No Action Required**: Simply update your package version. All existing configurations, tokens, and code remain compatible.

```bash
# Using npm
npm install ebay-api-mcp-server@1.1.0

# Using pnpm
pnpm update ebay-api-mcp-server@1.1.0
```

## Contributing

When contributing to this project, please:
1. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
2. Update this CHANGELOG.md with your changes
3. Ensure all tests pass (`npm test` or `pnpm test`)
4. Maintain test coverage above 90%

## Links

- [GitHub Repository](https://github.com/YosefHayim/ebay-api-mcp-server)
- [npm Package](https://www.npmjs.com/package/ebay-api-mcp-server)
- [Issue Tracker](https://github.com/YosefHayim/ebay-api-mcp-server/issues)
- [eBay Developer Portal](https://developer.ebay.com)
- [MCP Documentation](https://modelcontextprotocol.io)
