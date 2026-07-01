# PROJECT.md

Purpose & direction for **ebay-mcp**. Orientation is in [CONTEXT.md](CONTEXT.md);
how to work here is [AGENTS.md](AGENTS.md).

> **⚠️ Confirm the inferred lines.** Purpose, users, scope, and non-goals are
> drawn from the README and package manifest and are solid. The **Direction**
> section is _inferred_ — review it and correct anything that doesn't match your
> intent.

## Problem

AI assistants can reason about selling on eBay but can't _act_ on it: eBay's Sell
APIs are broad (inventory, fulfilment, marketing, analytics, metadata, developer),
split across modern REST and a legacy XML Trading API, and gated behind OAuth.
Wiring that up per-agent is repetitive and error-prone.

## Purpose

Give any MCP-capable assistant a **complete, typed, authenticated** interface to
eBay's Sell APIs through one local server — so an agent can list, fulfil, market,
and analyse on eBay without bespoke integration code.

## Users

- **Developers** embedding eBay actions into an agent (Claude, Cursor, Cline, or
  any MCP host).
- **Sellers/ops** driving eBay workflows through an assistant.
- **Contributors** extending coverage as eBay's APIs evolve.

## What it does

- Exposes **322 tools across ~270 endpoints** (100% of the Sell surface) over MCP.
- Handles **OAuth** (setup wizard, refresh-token flow, JWT verification).
- Speaks both **STDIO** and **HTTP** transports.
- Lets operators **gate** the exposed tool set (`EBAY_MCP_TOOLS`: all / dynamic /
  family list) to control an agent's context budget.
- Ships an interactive **setup**, **skills** installer, and **diagnose** tooling.

## What it is not

- Not a hosted/multi-tenant service — it runs locally, per user.
- Not a UI product — the tool surface _is_ the product (a small MCP-Apps view
  layer aside).
- Not a general eBay Buy/Browse client — the focus is the **Sell** side.

## Direction _(inferred — confirm)_

- **Stay at 100% Sell coverage** as eBay ships/changes endpoints — the `sync`
  workflow exists to catch drift and file it.
- **Keep agent context lean** — dynamic tool-gating is the lever; grow it rather
  than exposing all 322 tools by default.
- **Harden the contributor gate** — this change set adds a real CI gate (Biome +
  typecheck + test + build across an OS×Node matrix) and codified docs so
  coverage can grow without regressions.
- **Adopt a thin CLI framework** (commander) around the existing wizards without
  disturbing the interactive flow (ADR 0002).

## Constraints

- **Node ≥ 20**, ESM (`Node16`), pnpm. TypeScript strict; `src/types/` is
  generated (never hand-edited).
- **stdout is the MCP channel** — all logging goes to stderr.
- Releases are changeset/tag-driven and publish to npm via OIDC trusted
  publishing (`publish.yml`).
