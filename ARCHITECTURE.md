# ebay-mcp Architecture

The real file map and the pipeline a tool call flows through. Orientation is in
[CONTEXT.md](CONTEXT.md); code idioms are in [CODE-STYLE.md](CODE-STYLE.md).

## Layout

```txt
src/
├── index.ts          # bin entry — routes `setup` / `skills` subcommands, else runs the MCP stdio server
├── server-http.ts    # HTTP transport entry point
├── api/              # eBay API area classes + clients — one subfolder per area
│                     #   (account-management, order-management, marketing-and-promotions, …)
│                     #   plus client.ts (REST) and client-trading.ts (Trading XML)
├── auth/             # OAuth 2.0 flow, token store, JWT verification (jose)
├── config/           # environment loading, constants, tool-families
├── mcp/              # runtime.ts, http-transport.ts, tool-gating.ts, ui-bridge.ts
├── tools/            # tool wiring: define-tool.ts, registry.ts, contracts.ts, schemas.ts,
│                     #   categories/ (13 families), definitions/, tool-handlers/, ui/
├── schemas/          # shared Zod schemas
├── skills/           # agent-skills generator (`ebay-mcp skills`)
├── scripts/          # CLI tooling (setup, skills, dev-sync, diagnostics, build-ui, …)
├── types/            # generated OpenAPI types — do NOT hand-edit (`pnpm run sync`)
└── utils/            # logging, http, errors, version, cli-ui
```

## Pipeline — a tool call

```txt
src/tools/categories/<family>.ts
  → defineTool(spec)                     # Zod raw shape = SSOT for wire schema + handler args
  → registry (src/tools/registry.ts)     # assembles ToolEntry[] from categories/index.ts

host call → registry.executeTool
  → handler (validates args)
  → EbaySellerApi facade                 # api.<area>.<method>
  → src/api/<area>/*.ts
  → EbayApiClient (REST)  |  TradingApiClient (XML, fast-xml-parser)   [wrapped in withApiError]
  → eBay
  ← result  → optional MCP-Apps view model (archetype: table | card | chart)  → host
```

Tool exposure is gated by `EBAY_MCP_TOOLS` (`all` | `dynamic` | family list),
applied in `src/mcp/runtime.ts`. Both transports (`index.ts` stdio,
`server-http.ts`) wrap the same runtime; **stdout is reserved for the protocol**,
so logs go to stderr.

## Code style (the load-bearing rules)

Full guide: [CODE-STYLE.md](CODE-STYLE.md). In short:

| Rule | Shape |
| --- | --- |
| Imports | `@/` alias except same-dir siblings; keep NodeNext `.js` |
| Casts | boundary-only; never `as any`; no hand-written source excluded from typecheck |
| Functions | `export function` declarations, named exports only |
| Errors | thin handlers → `api.<area>.<method>`; area methods wrap I/O in `withApiError`; no custom Error classes |
| File size | Biome warns > ~300 lines/file, ~60 lines/function on logic dirs; `schemas/`, `tools/definitions/`, `tools/categories/`, `types/`, `scripts/` exempt |

Enforcement is **Biome** (`biome.json`) + `tsc`, run as `pnpm run check:ci` and
`pnpm run typecheck`. (There is no `lint:lines` script; size caps are Biome
rules.)
