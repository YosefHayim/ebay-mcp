# AGENTS.md

Guidance for coding agents (and humans) working **on** this repo. For using the server, see [README.md](README.md).

## What this is

A local [MCP](https://modelcontextprotocol.io) server exposing 322 tools across 100% of eBay's Sell APIs. TypeScript/Node.js (ESM), built with `@modelcontextprotocol/sdk`, Zod validation, and OpenAPI-generated types.

- **Entry points:** `src/index.ts` (STDIO transport — default) and `src/server-http.ts` (HTTP transport).
- **Runtime:** Node.js ≥ 20. Package manager: pnpm (`pnpm@10.14.0`); npm scripts work too.

## Validation commands

Run before opening a PR:

```bash
npm run typecheck        # tsc --noEmit (src)                    — must pass
npm run check:ci         # biome ci . (lint + format)            — must pass
npm test                 # vitest run (unit)                     — must pass
npm run test:integration # vitest (hermetic integration suite)   — must pass
npm run build            # tsc + tsc-alias + UI bundle → build/  — must pass
```

CI runs exactly these behind one **CI Gate** status check — see
[docs/adr/current/0004-ci-workflow-architecture.md](docs/adr/current/0004-ci-workflow-architecture.md).
(`npm run check` also typechecks `ui/`, but that leg needs a `ui/tsconfig.json`
that isn't committed yet; prefer the split commands above until it lands.)

Other useful scripts:

| Command             | Purpose                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `npm run dev`       | Run the server with hot reload (tsx)                                       |
| `npm run typecheck` | `tsc --noEmit`                                                             |
| `npm run fix`       | Auto-fix lint + format (Biome)                                             |
| `npm run setup`     | Interactive credential/OAuth/client setup wizard                           |
| `npm run sync`      | Download eBay OpenAPI specs, regenerate types, report missing endpoints    |
| `npm run diagnose`  | Check configuration and connectivity                                       |
| `npm run skills`    | Install AI skills (Codex / Claude Code / Cursor) for using or contributing |

## Module map (`src/`)

| Path             | Owns                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`       | MCP server entry point (STDIO)                                                                                                                                                                                                                                                                                                               |
| `server-http.ts` | HTTP transport entry point                                                                                                                                                                                                                                                                                                                   |
| `api/`           | eBay API client implementations (one area per file)                                                                                                                                                                                                                                                                                          |
| `auth/`          | OAuth 2.0 flow and token management                                                                                                                                                                                                                                                                                                          |
| `config/`        | Environment loading, constants, marketplace defaults                                                                                                                                                                                                                                                                                         |
| `tools/`         | MCP tool wiring — `registry.ts`, `contracts.ts`, `schemas.ts`, `define-tool.ts`, and `categories/` (13 family files that co-locate each tool definition with its handler via `defineTool`: connector, token-management, account, inventory, fulfillment, marketing, analytics, metadata, taxonomy, communication, other, developer, trading) |
| `skills/`        | Agent-skills generator (`ebay-mcp skills`) — renders using/contributing skills for Codex, Claude Code, and Cursor                                                                                                                                                                                                                            |
| `schemas/`       | Shared Zod schemas                                                                                                                                                                                                                                                                                                                           |
| `types/`         | TypeScript types — **auto-generated** from OpenAPI specs (don't hand-edit)                                                                                                                                                                                                                                                                   |
| `scripts/`       | CLI tooling: `setup.ts`, `skills.ts`, `dev-sync.ts`, `diagnostics.ts`                                                                                                                                                                                                                                                                        |
| `utils/`         | Shared utilities (logging, http, errors)                                                                                                                                                                                                                                                                                                     |

## Adding a new API endpoint

1. `npm run sync` — downloads the latest eBay specs, regenerates types, and reports missing endpoints (full list in `dev-sync-report.json`).
2. Add the API method in `src/api/`.
3. Add a `defineTool({ ... handler })` entry in the matching `src/tools/categories/<family>.ts` — the definition and its handler live together; `registry.ts` derives everything from `categories/index.ts`.
4. Add tests in `tests/`.
5. `npm run check && npm test`.

## Conventions

<!-- rules digest — full guide in CODE-STYLE.md; edit there -->

- **Imports:** `@/` alias for anything outside the current folder; `./sibling.js` only for same-dir. Keep NodeNext `.js` extensions (not `.ts`).
- **Types:** no `as any` — narrow, or use a documented boundary cast; no hand-written source excluded from typecheck. `types/` is generated — model new shapes from the specs, don't hand-edit.
- **Functions & exports:** `export function` declarations, named exports only (no default exports).
- **Errors:** thin handlers delegate one line to `api.<area>.<method>`; area methods wrap I/O in `withApiError`; the `instanceof Error` idiom is centralised in `getErrorMessage`. No custom `Error` subclasses.
- **Tools:** the Zod raw shape in `defineTool` is the SSOT for both the wire schema and the handler's arg types; derive related schemas rather than duplicating fields.
- **Size:** Biome warns past ~300 lines/file and ~60 lines/function on logic dirs; `schemas/`, `tools/definitions/`, `tools/categories/`, `types/`, `scripts/` are exempt.
- **Logs** go to **stderr** only (stdout is reserved for the MCP protocol) — see [docs/logging.md](docs/logging.md).
- **Tool exposure** is gated by `EBAY_MCP_TOOLS` (`all` | `dynamic` | family list). The env parsing/validation lives in `src/config/tool-families.ts` (kept free of tool-tree imports to avoid a cycle with `config/environment.ts`); the dynamic-mode discovery meta-tools and catalogue live in `src/mcp/tool-gating.ts`; `src/mcp/runtime.ts` applies the mode. Family keys must stay in sync with `toolCategories` (a unit test enforces this).
- Commit with [Conventional Commits](https://www.conventionalcommits.org/) (releases are changeset-driven).

Full style guide: [CODE-STYLE.md](CODE-STYLE.md). Architecture map: [ARCHITECTURE.md](ARCHITECTURE.md).

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `YosefHayim/ebay-mcp`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: use root `CONTEXT.md` and `docs/adr/` if they exist. See `docs/agents/domain.md`.
