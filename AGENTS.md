# AGENTS.md

Guidance for coding agents (and humans) working **on** this repo. For using the server, see [README.md](README.md).

## What this is

A local [MCP](https://modelcontextprotocol.io) server exposing 301 tools across 100% of eBay's Sell APIs. TypeScript/Node.js (ESM), built with `@modelcontextprotocol/sdk`, Effect-backed validation, a Zod SDK adapter, and OpenAPI-generated types.

- **Entry points:** `src/index.ts` (STDIO transport — default) and `src/serverHttp.ts` (HTTP transport).
- **Runtime:** Node.js ≥ 20. Package manager: pnpm (`pnpm@10.14.0`); npm scripts work too.

## Instruction sources

- **Shared agent contract:** this `AGENTS.md`.
- **Claude Code:** [CLAUDE.md](CLAUDE.md) imports `AGENTS.md`; keep Claude-only notes there only when needed.
- **GitHub Copilot:** [.github/copilot-instructions.md](.github/copilot-instructions.md) keeps Copilot-specific reminders and points back here.
- **Code style:** [CODE-STYLE.md](CODE-STYLE.md) owns the full rules; the digest below must stay aligned with it.
- **Domain/architecture read order:** [CONTEXT.md](CONTEXT.md), [LANGUAGE.md](LANGUAGE.md), [ARCHITECTURE.md](ARCHITECTURE.md), then relevant ADRs in `docs/adr/current/`.
- **User docs:** [README.md](README.md) is for installing and using the server, not contributor or agent rules.
- **Other agent surfaces:** add `GEMINI.md`, `.cursor/rules`, `.kiro/steering`, or `.roo/rules*` only for genuinely tool-specific or path-scoped behavior.

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
The `typecheck` leg now also covers `ui/` (`npm run typecheck:ui`), so
`npm run check` and `npm run verify` run the whole gate end-to-end.

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
| `serverHttp.ts` | HTTP transport entry point                                                                                                                                                                                                                                                                                                                   |
| `api/`           | eBay API client implementations (one area per file)                                                                                                                                                                                                                                                                                          |
| `auth/`          | OAuth 2.0 flow, token management, and setup callback helper (`oauthHelper`)                                                                                                                                                                                                                                                                  |
| `config/`        | Environment loading, constants, marketplace defaults                                                                                                                                                                                                                                                                                         |
| `tools/`         | MCP tool wiring — `registry.ts`, `contracts.ts`, `schemas.ts`, `defineTool.ts`, and `categories/` (family files co-locate each tool definition with its handler via `defineTool`; marketing pairs a large definition catalog with a handler map and must keep one public definition per handler) |
| `skills/`        | Agent-skills generator (`ebay-mcp skills`) — renders using/contributing skills for Codex, Claude Code, and Cursor                                                                                                                                                                                                                            |
| `schemas/`       | Shared Effect-backed schemas using the `@/utils/effectSchema.js` adapter                                                                                                                                                                                                                                                                     |
| `types/`         | TypeScript types — **auto-generated** from OpenAPI specs (don't hand-edit)                                                                                                                                                                                                                                                                   |
| `scripts/`       | CLI tooling: setup/diagnostics, wizards/validators, `devSync`, `skills`                                                                                                                                                                                                                                                                      |
| `utils/`         | Platform primitives (logging, http, errors, effectSchema*, cliUi) — not setup UX                                                                                                                                                                                                                                                             |

## Adding a new API endpoint

1. `npm run sync` — downloads the latest eBay specs, regenerates types, and reports missing endpoints (full list in `devSyncReport.json`).
2. Add the API method in `src/api/`.
3. Add a `defineTool({ ... handler })` entry in the matching `src/tools/categories/<family>.ts` — the definition and its handler live together; `registry.ts` derives everything from `categories/index.ts`. For marketing, close any definition/handler mismatch before moving a slice into `defineTool`.
4. Add tests in `tests/`.
5. `npm run check && npm test`.

## Conventions

<!-- rules digest — full guide in CODE-STYLE.md; edit there -->

- **Imports:** `@/` alias for anything outside the current folder; `./sibling.js` only for same-dir. Keep NodeNext `.js` extensions (not `.ts`).
- **Files:** hand-written source/test/UI file basenames are camelCase, never kebab-case or snake_case; generated specs/types and external docs keep upstream names.
- **Functions & exports:** new/migrated exported functions use `export const ... = (...) =>`; named exports only (no default exports). Existing API classes may stay classes, with migrated endpoint methods as public arrow properties. Tool-loader config files may use `module.exports` only when the tool cannot load named exports.
- **Effect & errors:** fallible async/API work returns `Effect.Effect<Success, TaggedError, Requirements>`; run with `Effect.runPromise` only at MCP/HTTP/CLI boundaries. No endpoint/tool `try/catch`; migrated API code uses typed tagged errors.
- **Docs:** endpoint-backed API methods require TSDoc with `@param`, `@returns`, a small `@example`, and the official eBay `@see` URL. Exported shared utilities document params/returns; public generated-response aliases include `@see`.
- **Types:** no `as any` — narrow, or use a documented boundary cast; no hand-written source excluded from typecheck. `types/` is generated — model new shapes from the specs, don't hand-edit.
- **Tools:** the Effect-backed endpoint input schema is the SSOT; import runtime schema helpers from `@/utils/effectSchema.js` and inference/helper types from `@/utils/effectSchemaTypes.js`; never add compatibility re-export facades. Derive the MCP wire schema from `.shape`, and let `defineTool` decode raw args through Effect before handlers run one endpoint Effect without response reshaping. Marketing's catalog adapter must keep one public definition per handler and is not a pattern for new tools.
- **API params:** endpoint methods pass an allowed-key object to the shared params builder. The builder owns omission/normalization; endpoints own wire names.
- **Mapping/UI:** API returns generated eBay DTOs. UI maps only at the presentation boundary; no one-use `toXRow` helpers and no `?? 'unknown'` display fallbacks.
- **Size:** split by purpose, not line count alone. Biome warns past ~300 lines/file and ~60 lines/function on logic dirs; declarative/generated/table files stay warning-exempt.
- **Logs** go to **stderr** in runtime code (stdout is reserved for the MCP protocol) — see [docs/logging.md](docs/logging.md). Human CLI commands may print to stdout.
- **CLI:** keep the hand-written router lean. Bare TTY commands may prompt; flags or non-TTY must never hang. Scriptable diagnostics/plans should provide stable exit codes and `--json`.
- **Tool exposure** is gated by `EBAY_MCP_TOOLS` (`all` | `dynamic` | family list). The env parsing/validation lives in `src/config/toolFamilies.ts` (kept free of tool-tree imports to avoid a cycle with `config/environment.ts`); the dynamic-mode discovery meta-tools and catalogue live in `src/mcp/toolGating.ts`; `src/mcp/runtime.ts` applies the mode. Family keys must stay in sync with `toolCategories` (a unit test enforces this).
- Commit with [Conventional Commits](https://www.conventionalcommits.org/) (releases are changeset-driven).

Full style guide: [CODE-STYLE.md](CODE-STYLE.md). Architecture map: [ARCHITECTURE.md](ARCHITECTURE.md).

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `YosefHayim/ebay-mcp`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: use root `CONTEXT.md` and `docs/adr/` if they exist. See `docs/agents/domain.md`.
