import type { RegistrySnapshot, SkillDoc } from '@/skills/types.js';

/** Renders the live family index as a Markdown table. */
const familyTable = (snapshot: RegistrySnapshot): string => {
  const rows = snapshot.families
    .map((family) => `| ${family.title} | ${family.count} | ${family.blurb} |`)
    .join('\n');
  return ['| Family | Tools | Covers |', '| --- | --- | --- |', rows].join('\n');
};

/**
 * Builds the "using" skill: how a developer's AI should drive the eBay MCP
 * tools. Workflow-first and lean — the per-tool schemas are already visible via
 * MCP `tools/list`, so this focuses on sequencing, auth, and disambiguation that
 * tool discovery can't convey. The family index is injected live from the
 * registry snapshot.
 *
 * @param snapshot Live tool count and family index.
 * @returns The provider-neutral skill document.
 *
 * @example
 * ```ts
 * const doc = buildUsingDoc(snapshot);
 * ```
 */
export const buildUsingDoc = (snapshot: RegistrySnapshot): SkillDoc => ({
  slug: 'ebay-mcp-using',
  title: 'Using the eBay MCP tools',
  description: `Drive eBay's Sell APIs through the ebay-mcp server: ${snapshot.toolCount} tools for listings, orders, marketing, and analytics. Use when creating or revising listings, fulfilling orders, issuing refunds, running Promoted Listings campaigns, or debugging eBay auth/rate-limit errors.`,
  intro: `The \`ebay-mcp\` server exposes **${snapshot.toolCount} tools across 100% of eBay's Sell APIs**, running locally over MCP. Every tool is named \`ebay_<verb>_<noun>\` (plus two ChatGPT-connector tools, \`search\`/\`fetch\`). You already see each tool's input schema via \`tools/list\` — this skill covers what discovery can't: which tools to chain, what eBay requires first, and how to read its errors.`,
  sections: [
    {
      heading: 'Authentication & environment',
      body: [
        '- **Two auth tiers.** An app token allows ≈1,000 requests/day; user OAuth allows ≈10k–50k/day. Most write operations require user OAuth.',
        '- **A 401 / "access denied" is almost always a scope or environment problem**, not a malformed request. Check `ebay_get_token_status`, then re-run `npm run setup` if a scope is missing.',
        '- **Sandbox and production are separate worlds** — separate credentials and separate data. Confirm `EBAY_ENVIRONMENT` before investigating "missing" data.',
        '- **Marketplace & language headers matter.** Calls honor `EBAY_MARKETPLACE_ID` (e.g. `EBAY_US`) and `Content-Language` (e.g. `en-US`); a wrong pair causes empty or rejected results.',
      ].join('\n'),
    },
    {
      heading: 'Core workflows',
      body: [
        '**Publish a fixed-price listing (REST Inventory model).**',
        '1. One-time account setup: `ebay_opt_in_to_program` (business-policy management), then `ebay_create_payment_policy`, `ebay_create_return_policy`, `ebay_create_fulfillment_policy` for reusable policy IDs, and `ebay_create_inventory_location` for a `merchantLocationKey`.',
        '2. Pick the category and fetch its current item-specific requirements: `ebay_get_default_category_tree_id` (marketplace) → `ebay_get_category_suggestions` (query) → `ebay_get_item_aspects_for_category`.',
        '3. Add every required aspect from that response to `ebay_create_or_replace_inventory_item` (SKU + product details + availability). Requirements vary by category and marketplace; do not treat examples from another category as permanent rules.',
        '4. `ebay_create_offer` (SKU, marketplace, price, the policy IDs, location).',
        '5. Check the aspects again when the category changes and before `ebay_get_listing_fees`, then `ebay_publish_offer` (offerId) → a live `listingId`. Use `ebay_bulk_publish_offer` for many at once.',
        '',
        '**Run an auction (same Inventory model).**',
        'Same steps, but confirm the category allows auctions first with `ebay_get_listing_type_policies` (it also lists the allowed durations). Then `ebay_create_offer` with `format: "AUCTION"`, `pricingSummary.auctionStartPrice` (opening bid), an optional `auctionReservePrice` above it, an optional `pricingSummary.price` as Buy It Now, and a day-count `listingDuration` such as `DAYS_7` (never `GTC`); leave `availableQuantity` out (eBay rejects it on auctions). Reserve prices add a fee — check `ebay_get_listing_fees` before `ebay_publish_offer`. Best Offer and per-buyer limits are fixed-price only; the server rejects mixed-format bodies before they reach eBay.',
        '',
        '**Add photos or a video to an inventory item (local files).**',
        'Listings need at least one picture before publish. `ebay_attach_media_to_inventory_item` (sku + imagePaths / videoPaths) uploads the files through the Media API and rewrites only `product.imageUrls` / `product.videoIds`, never publishing. Primitives: `ebay_upload_images` → EPS URLs in order, `ebay_upload_video` → `videoId` (poll `ebay_get_video` while PROCESSING). Paths must be absolute or `media://<relative>` and inside `EBAY_MCP_MEDIA_DIRS` / `EBAY_MCP_MEDIA_ROOT`; otherwise the tool refuses before uploading.',
        '',
        '**Fulfill an order.**',
        '`ebay_get_orders` (filter unfulfilled) → `ebay_get_order` (detail) → `ebay_create_shipping_fulfillment` (tracking number + carrier).',
        '',
        '**Refund or handle a payment dispute.**',
        'Voluntary refund: `ebay_issue_refund`. Disputes: `ebay_get_payment_dispute_summaries` → `ebay_get_payment_dispute` → `ebay_accept_payment_dispute` (or contest it).',
        '',
        '**Promote listings (Promoted Listings).**',
        '`ebay_create_campaign` → `ebay_bulk_create_ads_by_inventory_reference`. The Marketing family also covers promotions and reports.',
        '',
        '**Legacy XML path (Trading API).**',
        '`ebay_create_listing` / `ebay_revise_listing` / `ebay_relist_item` / `ebay_end_listing`, list via `ebay_get_active_listings`. Each takes `format` (`FIXED_PRICE` default, or `format: "AUCTION"`): auctions go through `AddItem` / `ReviseItem` / `EndItem` / `RelistItem` with `ListingType` Chinese added for you, `StartPrice` as the opening bid, a day-count `ListingDuration` such as `Days_7` (never `GTC`), `Quantity` 1, and optional `ReservePrice` / `BuyItNowPrice` above the bid; mixed payloads are rejected locally. Read `ListingType` from `ebay_get_listing` before revising or ending when the format is unknown. Use only when you specifically need the legacy flow — do not mix it with the REST Inventory model for the same SKU.',
        '',
        '**Diagnose failing calls.**',
        '`ebay_get_token_status` (auth valid/expiring?) → `ebay_get_rate_limits` / `ebay_get_user_rate_limits` (quota hit?) → `ebay_get_api_status` (eBay-side outage?).',
      ].join('\n'),
    },
    {
      heading: 'Gotchas & disambiguation',
      body: [
        '- **Two listing models.** REST Inventory (`inventory_item` → `offer` → `publish`) vs legacy Trading (XML). Pick one per SKU and stay in it.',
        '- **Offers need policies + a location first.** A "policy not found" error usually means the one-time account setup was skipped.',
        '- **Auction vs fixed price is set per offer.** `FIXED_PRICE` uses `pricingSummary.price` + `listingDuration: "GTC"`; `AUCTION` uses `auctionStartPrice` + a day-count duration and no `availableQuantity`. Never add `listingStartDate` unless the user asked for a scheduled start — it can incur a fee. An unsold auction turns into a GTC fixed-price listing on eBay\'s side. The Trading tools make the same split with their `format` argument: `Days_N` durations, `ReservePrice`, and `BuyItNowPrice` are auction-only; `GTC` is fixed-price only.',
        '- **Item specifics are category-specific.** Use `ebay_get_item_aspects_for_category` for the selected category instead of relying on a fixed fallback value or requirements learned from another category.',
        '- **Local media access is opt-in.** The media tools only read files inside `EBAY_MCP_MEDIA_DIRS` / `EBAY_MCP_MEDIA_ROOT`; a "local media access is disabled" error means the operator has not allowed a directory yet — do not try other paths.',
        '- **`search` and `fetch` are ChatGPT-connector only** — ignore them when driving the Sell API directly.',
        '- **Write actions are real.** `publish`, `issue_refund`, `end_listing`, and any `bulk_*` change live seller data — confirm intent before calling.',
      ].join('\n'),
    },
    {
      heading: `Tool families (${snapshot.toolCount} tools)`,
      body: familyTable(snapshot),
    },
  ],
});

/**
 * Builds the "contributing" skill: how an AI working on the ebay-mcp repo should
 * operate. Mirrors AGENTS.md (validation commands, module map, the add-a-tool
 * flow, conventions) against the real `src/tools/categories/` layout.
 *
 * @param snapshot Live tool count and family index.
 * @returns The provider-neutral skill document.
 *
 * @example
 * ```ts
 * const doc = buildContributingDoc(snapshot);
 * ```
 */
export const buildContributingDoc = (snapshot: RegistrySnapshot): SkillDoc => ({
  slug: 'ebay-mcp-contributing',
  title: 'Contributing to ebay-mcp',
  description: `Work on the ebay-mcp server itself: ${snapshot.toolCount} tools across eBay's Sell APIs (TypeScript/ESM, Effect-backed validation, OpenAPI-generated types). Use when adding or changing eBay tools/endpoints, wiring the registry, or running the project's checks.`,
  intro: `A local MCP server exposing **${snapshot.toolCount} tools across 100% of eBay's Sell APIs** — TypeScript/Node.js (ESM), \`@modelcontextprotocol/sdk\`, Effect-backed validation, OpenAPI-generated types. Entry points: \`src/index.ts\` (STDIO) and \`src/serverHttp.ts\` (HTTP).`,
  sections: [
    {
      heading: 'Validation (run before a PR)',
      body: [
        '```bash',
        'npm run check     # tsc --noEmit + eslint + prettier --check  (must pass)',
        'npm test          # vitest run',
        'npm run build     # tsc + tsc-alias → build/',
        '```',
      ].join('\n'),
    },
    {
      heading: 'Module map (`src/`)',
      body: [
        '| Path | Owns |',
        '| --- | --- |',
        '| `index.ts` / `serverHttp.ts` | MCP entry points (STDIO / HTTP) |',
        '| `api/` | eBay API client implementations (one area per file) |',
        '| `auth/` | OAuth 2.0 flow and token management |',
        '| `config/` | Environment loading, constants, marketplace defaults |',
        '| `tools/` | Tool wiring — `registry.ts`, `contracts.ts`, `defineTool.ts`, and `categories/` (13 family files that co-locate each tool definition with its handler via `defineTool`) |',
        "| `skills/` | Agent-skills generator (this skill's source) |",
        '| `schemas/` | Shared Effect-backed schemas |',
        "| `types/` | TypeScript types — **auto-generated** from OpenAPI specs (don't hand-edit) |",
        '| `scripts/` | CLI tooling: `setup.ts`, `skills.ts`, `devSync.ts`, `diagnostics.ts` |',
        '| `utils/` | Shared utilities (logging, http, errors) |',
      ].join('\n'),
    },
    {
      heading: 'Add a tool or endpoint',
      body: [
        '1. `npm run sync` — download the latest eBay specs, regenerate types, report missing endpoints.',
        '2. Add the API method in `src/api/`.',
        '3. Add a `defineTool({ ... handler })` entry in the matching `src/tools/categories/<family>.ts` — definition and handler live together; `registry.ts` derives everything from `categories/index.ts`.',
        '4. Add tests in `tests/`.',
        '5. `npm run check && npm test`.',
      ].join('\n'),
    },
    {
      heading: 'Conventions',
      body: [
        '- **No `any`** — specific types; prefer narrowing over assertions. `types/` is generated, so model new shapes from the specs.',
        '- Validate tool inputs with Effect-backed schemas from `@/utils/effectSchema.js`; derive related schemas rather than duplicating fields.',
        '- Commit with Conventional Commits (releases are changeset-driven).',
        '- Logs go to **stderr** only — stdout is reserved for the MCP protocol.',
      ].join('\n'),
    },
  ],
});
