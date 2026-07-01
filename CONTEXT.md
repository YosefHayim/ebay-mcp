# CONTEXT.md

Orientation for anyone (human or agent) landing in this repo. _What it is, who
talks to it, and the shape data moves through_ — not a glossary (that's
[LANGUAGE.md](LANGUAGE.md)) and not the file map (that's
[ARCHITECTURE.md](ARCHITECTURE.md)).

## What it is

A **local [MCP](https://modelcontextprotocol.io) server** that exposes eBay's
Sell APIs — 322 tools across ~270 endpoints — to AI assistants. It runs on the
developer's machine (or a container), speaks the Model Context Protocol over
**STDIO** (default) or **HTTP**, holds the eBay OAuth tokens, and turns each tool
call into an authenticated eBay API request.

It is **not** a hosted service and **not** a UI app. The product is the tool
surface and the auth/plumbing behind it.

## Actors

```
┌────────────────────┐   MCP (stdio/http)   ┌──────────────────┐   HTTPS   ┌──────────────┐
│  MCP host           │ ───────────────────► │  ebay-mcp server │ ────────► │  eBay APIs   │
│  Claude / Cursor /  │ ◄─────────────────── │  (this repo)     │ ◄──────── │  Sell + Trading│
│  Cline / agent      │     tool results     │                  │           └──────────────┘
└────────────────────┘                       └──────────────────┘
                                                     │
                                              OAuth token store
                                              (refresh-token flow)
```

- **MCP host** — the agent runtime that discovers and calls tools.
- **ebay-mcp server** — validates input (Zod), routes to the right eBay area,
  authenticates, and normalises the response.
- **eBay APIs** — the modern **Sell** REST APIs and the legacy **Trading** XML
  API, depending on the area.
- **OAuth** — user/app tokens obtained via `ebay-mcp setup`, refreshed
  automatically; JWTs verified with `jose`.

## Shape — a tool call, end to end

```
host calls "account_getKyc"
  → registry looks up the ToolEntry
  → defineTool handler validates args against the Zod shape
  → EbaySellerApi facade  (api.account.getKyc)
  → area API class        (src/api/account-management/…)
  → EbayApiClient (REST)  or  TradingApiClient (XML, fast-xml-parser)
      wrapped in withApiError  → eBay
  ← normalised result  → (optional) MCP-Apps view model  → host
```

Two cross-cutting concerns shape the surface:

- **Tool gating** (`EBAY_MCP_TOOLS`): `all` exposes everything; `dynamic` exposes
  discovery meta-tools that reveal families on demand (to keep an agent's context
  small); a family list exposes just those. Applied in `src/mcp/runtime.ts`.
- **Transports**: `src/index.ts` (STDIO) and `src/server-http.ts` (HTTP) wrap the
  same runtime; **stdout is reserved for the protocol**, so all logs go to stderr.

## Where to look first

- Using the server → [README.md](README.md)
- Working on the code → [AGENTS.md](AGENTS.md) + [CODE-STYLE.md](CODE-STYLE.md)
- The file map → [ARCHITECTURE.md](ARCHITECTURE.md)
- Vocabulary → [LANGUAGE.md](LANGUAGE.md)
- Why a decision was made → [docs/adr/current/](docs/adr/current/)
