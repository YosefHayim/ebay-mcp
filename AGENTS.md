# AGENTS.md

Guidance for coding agents (and humans) working **on** this repo. For using the server, see [README.md](README.md).

## What this is

A local [MCP](https://modelcontextprotocol.io) server exposing 322 tools across 100% of eBay's Sell APIs. TypeScript/Node.js (ESM), built with `@modelcontextprotocol/sdk`, Zod validation, and OpenAPI-generated types.

- **Entry points:** `src/index.ts` (STDIO transport — default) and `src/server-http.ts` (HTTP transport).
- **Runtime:** Node.js ≥ 18. Package manager: pnpm (`pnpm@10.14.0`); npm scripts work too.

## Validation commands

Run before opening a PR:

```bash
npm run check     # typecheck + eslint + prettier --check  (must pass)
npm test          # vitest run (1005+ tests)
npm run build     # tsc + tsc-alias → build/
```

Other useful scripts:

| Command             | Purpose                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `npm run dev`       | Run the server with hot reload (tsx)                                       |
| `npm run typecheck` | `tsc --noEmit`                                                             |
| `npm run fix`       | Auto-fix eslint + prettier                                                 |
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

- **No `any`** — use specific types; prefer narrowing over assertions. `types/` is generated, so model new shapes from the specs.
- Validate tool inputs with Zod; derive related schemas rather than duplicating fields.
- Commit with [Conventional Commits](https://www.conventionalcommits.org/) (releases are changeset-driven).
- Logs go to **stderr** only (stdout is reserved for the MCP protocol) — see [docs/logging.md](docs/logging.md).

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `YosefHayim/ebay-mcp`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: use root `CONTEXT.md` and `docs/adr/` if they exist. See `docs/agents/domain.md`.
