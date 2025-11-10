# eBay API MCP Server - Feature Roadmap & Todo List

This document tracks completed features and outlines the next priorities for development.

## 🎉 Recently Completed

### ✅ Zod Schema Implementation (Completed: 2025-11-11)
- **Status**: COMPLETED
- **Impact**: High - Improves type safety and developer experience
- **Details**:
  - Created comprehensive Zod schema library (`src/tools/schemas.ts`, ~450 lines)
  - Replaced all 38 instances of `z.unknown()` with properly typed schemas
  - Categories covered: Account, Inventory, Fulfillment, Marketing, Communication, Metadata, Bulk Operations
  - All schemas use `.passthrough()` for flexibility while validating core fields
  - Build verified successfully with no TypeScript errors

**Benefits Delivered**:
- ✅ Type safety for all tool inputs
- ✅ Clear structure and required fields documentation
- ✅ Better validation and error messages
- ✅ Centralized schema management

---

## 🔴 Critical Priority - Next Features

### 1. Environment-Specific OAuth Scope Management
**Priority**: CRITICAL | **Effort**: Medium (3-5 days) | **Impact**: High

**Current Issue**:
OAuth scopes are hardcoded and not environment-aware. Sandbox and Production environments have different available scopes, but the code doesn't handle this distinction properly.

**Scope Differences Summary**:
- Production: 27 unique scopes (includes `sell.edelivery`, `commerce.shipping`)
- Sandbox: 35 unique scopes (includes Buy API scopes, extended Identity scopes, `sell.item.draft`)
- Common: 21 scopes available in both environments

**Tasks**:
- [ ] **Phase 1.1**: Update `src/config/environment.ts`
  - Already has `getProductionScopes()` and `getSandboxScopes()` functions (DONE)
  - Already has `validateScopes()` function (DONE)
  - Already has `validateEnvironmentConfig()` (DONE)
  - ✅ Functions load scopes from JSON files dynamically
  - ✅ Scope validation working

- [ ] **Phase 1.2**: Add scope validation to tools
  - Update `ebay_get_oauth_url` tool to validate scopes against environment
  - Warn users when requesting environment-incompatible scopes
  - Add scope validation error messages

- [ ] **Phase 1.3**: Token scope validation
  - Validate scopes when loading persisted tokens
  - Warn if stored token scopes don't match current environment
  - Consider auto-refresh if scopes are insufficient

- [ ] **Phase 1.4**: Documentation
  - Create `docs/auth/scope-differences.md`
  - Update main README with scope information
  - Add troubleshooting guide for scope-related errors

**Files to Modify**:
- `src/tools/tool-definitions.ts` (scope validation in tools)
- `src/auth/oauth.ts` (token scope validation)
- `docs/auth/` (new documentation)

**Reference Files** (already exist):
- `docs/auth/production_scopes.json` ✅
- `docs/auth/sandbox_scopes.json` ✅
- `src/config/environment.ts` ✅ (has helper functions)

---

### 2. Enhanced Error Handling & Logging
**Priority**: HIGH | **Effort**: Small (1-2 days) | **Impact**: High

**Current Issue**:
Error messages are generic and don't provide enough context for debugging. No structured logging system.

**Tasks**:
- [ ] Create `src/utils/logger.ts` with structured logging
  - Support different log levels (debug, info, warn, error)
  - Environment-aware (verbose in dev, quiet in prod)
  - Optional log file output

- [ ] Enhance error messages in API calls
  - Include request details in errors (endpoint, params)
  - Parse and format eBay error responses better
  - Add error codes for common issues

- [ ] Add request/response logging (optional via env var)
  - Log all API requests when `EBAY_DEBUG=true`
  - Sanitize sensitive data (tokens, passwords)

- [ ] Create error recovery suggestions
  - Suggest fixes for common errors (invalid token, missing scope, etc.)
  - Link to relevant documentation

**Files to Create**:
- `src/utils/logger.ts`
- `src/utils/error-formatter.ts`
- `src/types/errors.ts`

**Files to Modify**:
- `src/api/client.ts` (enhanced error handling)
- `src/auth/oauth.ts` (better OAuth error messages)
- All API implementation files (add logging)

---

### 3. Rate Limiting & Request Throttling
**Priority**: HIGH | **Effort**: Medium (2-3 days) | **Impact**: Medium-High

**Current Issue**:
No rate limiting protection. Users can easily exceed eBay's API limits:
- Client credentials: 1,000 requests/day
- User tokens: 10,000-50,000 requests/day (varies by account tier)

**Tasks**:
- [ ] Create `src/utils/rate-limiter.ts`
  - Track request counts per token type
  - Implement sliding window rate limiting
  - Queue requests when approaching limits
  - Respect eBay's rate limit headers

- [ ] Add rate limit awareness to tools
  - Display remaining requests in debug mode
  - Warn when approaching limits
  - Auto-throttle bulk operations

- [ ] Create rate limit monitoring tool
  - `ebay_get_rate_limit_status` tool
  - Shows current usage and remaining requests
  - Estimates time until reset

**Files to Create**:
- `src/utils/rate-limiter.ts`
- `src/tools/rate-limit-tools.ts`

**Files to Modify**:
- `src/api/client.ts` (integrate rate limiter)
- `src/tools/tool-definitions.ts` (add rate limit tool)

---

## 🟡 Medium Priority - Quality of Life Improvements

### 4. Bulk Operation Utilities
**Priority**: MEDIUM | **Effort**: Medium (3-4 days) | **Impact**: Medium

**Current Issue**:
Many bulk operations exist but lack helper utilities for common patterns (batching, progress tracking, error recovery).

**Tasks**:
- [ ] Create `src/utils/bulk-operations.ts`
  - Generic batch processor with configurable batch sizes
  - Progress tracking for long-running operations
  - Automatic retry on failures
  - Partial success handling

- [ ] Add bulk operation helper tools
  - `ebay_bulk_create_inventory_items_from_csv` (CSV import)
  - `ebay_bulk_update_prices` (price updates from data)
  - Progress reporting for bulk operations

- [ ] Create bulk operation templates
  - Example CSV formats
  - Batch operation best practices
  - Error handling patterns

**Files to Create**:
- `src/utils/bulk-operations.ts`
- `src/tools/bulk-helpers.ts`
- `docs/guides/bulk-operations.md`
- `examples/bulk-inventory-import.csv`

---

### 5. Tool Scope Requirements Documentation
**Priority**: MEDIUM | **Effort**: Medium (2-3 days) | **Impact**: Medium

**Current Issue**:
Tool descriptions mention required scopes but it's inconsistent. Users don't know which scopes they need until they get an error.

**Tasks**:
- [ ] Add `requiredScopes` metadata to all tools
  - Extend ToolDefinition interface
  - Document minimum scopes for each tool
  - Add scope checking before execution

- [ ] Create scope requirement matrix
  - Map each tool to required scopes
  - Group tools by scope requirements
  - Create visual documentation

- [ ] Add runtime scope validation
  - Check token scopes before tool execution
  - Provide helpful error messages
  - Suggest missing scopes to request

**Files to Modify**:
- `src/tools/tool-definitions.ts` (add requiredScopes metadata)
- `src/types/tools.ts` (extend ToolDefinition interface)

**Files to Create**:
- `docs/auth/tool-scope-requirements.md`
- `src/utils/scope-checker.ts`

---

### 6. Testing Infrastructure
**Priority**: MEDIUM | **Effort**: Large (5-7 days) | **Impact**: High

**Current Issue**:
No automated tests. Changes risk breaking existing functionality.

**Tasks**:
- [ ] Setup testing framework
  - Add Jest or Vitest
  - Configure TypeScript for tests
  - Setup test environments (sandbox/production mocks)

- [ ] Unit tests
  - OAuth token management
  - Scope validation
  - Schema validation
  - Rate limiting

- [ ] Integration tests
  - API client with mocked responses
  - Tool execution
  - Error handling

- [ ] E2E tests (sandbox only)
  - Full OAuth flow
  - Key user workflows
  - Bulk operations

**Files to Create**:
- `tests/unit/auth/oauth.test.ts`
- `tests/unit/auth/scopes.test.ts`
- `tests/unit/tools/schemas.test.ts`
- `tests/integration/api/inventory.test.ts`
- `tests/e2e/oauth-flow.test.ts`
- `jest.config.js` or `vitest.config.ts`

**Dependencies to Add**:
- `jest` or `vitest`
- `@types/jest` or `@vitest/ui`
- `nock` (HTTP mocking)

---

## 🟢 Low Priority - Nice to Have Features

### 7. Webhook Support
**Priority**: LOW | **Effort**: Large (7-10 days) | **Impact**: Medium

**Description**:
Add support for eBay notification webhooks (order updates, inventory changes, messages).

**Tasks**:
- [ ] Create webhook receiver endpoint
- [ ] Implement webhook signature validation
- [ ] Add webhook event storage/forwarding
- [ ] Create webhook management tools
- [ ] Document webhook setup

---

### 8. Multi-Account Management
**Priority**: LOW | **Effort**: Large (7-10 days) | **Impact**: Low-Medium

**Description**:
Support managing multiple eBay seller accounts from one server instance.

**Tasks**:
- [ ] Add account switching mechanism
- [ ] Store tokens per account
- [ ] Create account selection tool
- [ ] Update documentation

---

### 9. Advanced Analytics Dashboard
**Priority**: LOW | **Effort**: Large (10-14 days) | **Impact**: Low

**Description**:
Web-based analytics dashboard for eBay seller metrics.

**Tasks**:
- [ ] Create Express-based web server
- [ ] Build React/Vue dashboard UI
- [ ] Integrate with Analytics API
- [ ] Add data visualization
- [ ] Create custom reports

---

### 10. CLI Tool for Common Operations
**Priority**: LOW | **Effort**: Medium (3-5 days) | **Impact**: Low-Medium

**Description**:
Command-line interface for common operations (token management, quick queries, bulk imports).

**Tasks**:
- [ ] Create CLI entry point
- [ ] Add token management commands
- [ ] Add inventory query commands
- [ ] Add bulk import commands
- [ ] Create man pages/help docs

---

## 📋 Implementation Phases

### Phase 1: Foundation & Critical Fixes (Week 1-2)
**Focus**: Stability, proper OAuth scope handling, better error messages

1. ✅ Zod Schema Implementation (COMPLETED)
2. 🔄 Environment-Specific OAuth Scope Management (IN PROGRESS)
3. Enhanced Error Handling & Logging
4. Rate Limiting & Request Throttling

**Expected Outcomes**:
- Proper sandbox/production separation
- Better developer experience
- Protection against rate limits
- Clear error messages

---

### Phase 2: Quality of Life & Developer Tools (Week 3-4)
**Focus**: Making the server easier to use and more powerful

1. Bulk Operation Utilities
2. Tool Scope Requirements Documentation
3. Testing Infrastructure (begin)

**Expected Outcomes**:
- Easier bulk operations
- Better documentation
- Test coverage for critical paths

---

### Phase 3: Advanced Features (Week 5+)
**Focus**: Nice-to-have features based on user feedback

1. Complete Testing Infrastructure
2. Webhook Support
3. Multi-Account Management
4. CLI Tool
5. Advanced Analytics Dashboard (if needed)

**Expected Outcomes**:
- Production-ready quality
- Advanced use cases supported
- Complete test coverage

---

## 🔍 Technical Debt & Refactoring

### Items to Address
- [ ] Consolidate error handling patterns across API classes
- [ ] Extract common API client patterns to base class
- [ ] Review and optimize type imports (reduce duplication)
- [ ] Add JSDoc comments to all public APIs
- [ ] Review and update all tool descriptions for consistency
- [ ] Consider splitting large files (tool-definitions.ts is 2087 lines)

---

## 📚 Documentation Improvements Needed

### High Priority
- [ ] Complete OAuth setup guide with screenshots
- [ ] Add troubleshooting guide for common errors
- [ ] Create "Getting Started" video tutorial
- [ ] Document all environment variables

### Medium Priority
- [ ] Add API reference documentation
- [ ] Create architecture decision records (ADRs)
- [ ] Document contribution guidelines
- [ ] Add code examples for common use cases

### Low Priority
- [ ] Create Postman collection
- [ ] Add OpenAPI/Swagger documentation
- [ ] Create integration guides for popular frameworks

---

## 💡 Future Ideas (Not Yet Prioritized)

- **AI-Powered Listing Optimization**: Use AI to suggest optimal pricing, titles, descriptions
- **Inventory Sync with Other Platforms**: Shopify, WooCommerce, Amazon
- **Automated Repricing**: Dynamic pricing based on competition
- **Smart Shipping Calculator**: Optimize shipping costs and methods
- **Customer Communication Templates**: AI-generated response templates
- **Fraud Detection**: Flag suspicious orders/buyers
- **Performance Monitoring**: Track API latency, error rates, success metrics
- **GraphQL API Layer**: Alternative to REST for complex queries
- **Real-time Inventory Updates**: WebSocket-based inventory sync
- **Mobile App**: Companion mobile app for quick updates

---

## 🎯 Success Metrics

### Phase 1 Success Criteria
- ✅ Zero `z.unknown()` instances in codebase (ACHIEVED)
- [ ] All tools have proper scope requirements documented
- [ ] Error messages include actionable suggestions
- [ ] Rate limiting prevents API limit violations
- [ ] 90%+ of common errors have helpful messages

### Phase 2 Success Criteria
- [ ] Bulk operations support batches of 100+ items
- [ ] Unit test coverage > 70%
- [ ] Integration test coverage for all API categories
- [ ] Documentation completeness score > 80%

### Phase 3 Success Criteria
- [ ] Webhook support for all major event types
- [ ] Multi-account switching in < 1 second
- [ ] CLI supports 90% of common operations
- [ ] E2E test coverage for critical workflows

---

## 🤝 Contributing

We welcome contributions! Priority areas:
1. **OAuth scope validation** (Critical)
2. **Error handling improvements** (High)
3. **Testing infrastructure** (High)
4. **Documentation** (Medium)
5. **Bulk operation utilities** (Medium)

See individual tasks above for specific contribution opportunities.

---

## 📞 Questions or Suggestions?

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions or share ideas
- **Pull Requests**: Submit improvements

---

**Last Updated**: 2025-11-11
**Status**: Phase 1 in progress (Zod schemas completed, OAuth scopes next)
**Next Milestone**: Complete OAuth scope validation by 2025-11-18
