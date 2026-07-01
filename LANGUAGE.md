# LANGUAGE.md

The human↔agent vocabulary bridge: **names only** — each term, its definition,
and aliases to avoid. Use these exact words in code, commits, and PRs. Concepts
and flow live in [CONTEXT.md](CONTEXT.md); this file just pins the names.

| Term | Means | Avoid calling it |
| --- | --- | --- |
| **tool** | One MCP-exposed capability (name + input schema + handler). The unit an agent calls. | "endpoint", "command", "function" |
| **family** / **category** | A group of related tools, one file per group in `src/tools/categories/` (account, inventory, fulfillment, marketing, analytics, metadata, taxonomy, communication, developer, trading, connector, token-management, other). | "module", "domain" |
| **`defineTool`** | The factory binding a tool's Zod raw shape to its handler; the shape is the SSOT for both wire schema and arg types. | "registerTool", "createTool" |
| **`rawTool`** | Variant of `defineTool` that skips re-validating args (the handler validates against its own schema). | — |
| **`ToolSpec`** | The input to `defineTool` (name, description, inputSchema, handler, optional ui). | — |
| **`ToolEntry`** | The output of `defineTool` (definition + handler + resolved ui); what the registry stores. | — |
| **registry** | `src/tools/registry.ts` — assembles all `ToolEntry`s from `categories/` and exposes `executeTool`. | "router" (that's the CLI sense) |
| **gating** | Controlling which tools are exposed via `EBAY_MCP_TOOLS`: **all**, **dynamic** (discovery meta-tools), or a **static** family list. | "filtering", "scoping" |
| **connector** | The MCP connector-metadata tools/plumbing (category/version passed through `_meta`). | — |
| **archetype** | A tool's optional MCP-Apps view shape: `table`, `card`, or `chart`. | "widget", "component" |
| **area** | An eBay API surface implemented as a class under `src/api/<area>/` (e.g. account-management, order-management). | "service" |
| **facade** | `EbaySellerApi` — the object handlers call (`api.account.…`, `api.fulfillment.…`) that fronts all areas. | — |
| **`EbayApiClient`** | The REST HTTP client (modern Sell APIs). | — |
| **`TradingApiClient`** | The legacy Trading **XML** client (fast-xml-parser). | — |
| **`withApiError`** | The wrapper that prefixes an I/O failure with a contextual message. | "try/catch helper" |
| **marketplace** | An eBay site/locale (e.g. `EBAY_US`), `MarketplaceId` enum. | "region", "site" (in code) |
| **scope** | An OAuth permission string granted to a token. | "permission" (in code) |
| **sync** | `pnpm run sync` — download eBay specs, regenerate `src/types/`, report endpoints not yet exposed as tools. | "codegen" |
