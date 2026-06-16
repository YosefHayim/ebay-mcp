<!-- Keywords: eBay MCP server, eBay Model Context Protocol, eBay API for AI assistants, eBay Sell API, Claude eBay integration, Cursor eBay, eBay inventory automation, eBay order management AI, eBay OAuth, eBay developer tools, MCP server for eBay -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="eBay MCP Server — connect Claude, Cursor, and any AI assistant to eBay's Sell APIs with one command (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>The eBay MCP server — give Claude, Cursor, and any AI assistant full access to eBay's Sell APIs. 322 tools for inventory, orders, marketing, and analytics, running locally with your own keys.</strong>
</p>

<p align="center"><sub>Unofficial, open-source project — not affiliated with, authorized, or endorsed by eBay Inc.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="npm downloads per month" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="MIT license" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="Required Node.js version" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="TypeScript types included" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 eBay API tools" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% eBay Sell API coverage" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="Model Context Protocol compatible" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="Over 1,000 passing tests" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="Runs entirely on your machine" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="MseeP.ai Security Assessment Badge" height="40" /></a>
</p>

<p align="center">
  <strong>English</strong> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** is a local [Model Context Protocol](https://modelcontextprotocol.io) server that connects AI assistants — Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code, and Amazon Q — directly to **eBay's Sell APIs**. It exposes **322 tools** spanning **100% of eBay's Sell API surface** (270 unique endpoints) for inventory management, order fulfillment, promoted-listings marketing, analytics, and developer tooling. Everything runs on your machine over STDIO or local HTTP — **no cloud relay**, and your eBay credentials never leave your computer.

> **Disclaimer:** Unofficial, third-party project — **not affiliated with or endorsed by eBay Inc.** Provided "as is" without warranty. You are responsible for complying with [eBay's API License Agreement](https://developer.ebay.com/join/api-license-agreement) and [data-handling requirements](https://developer.ebay.com/api-docs/static/data-handling-update.html), keeping your credentials secure, and staying within rate limits. Test in sandbox before production. See [LICENSE](LICENSE), [SECURITY.md](SECURITY.md), and [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

## Table of contents

- [Features](#features)
- [eBay MCP vs. the raw eBay API](#ebay-mcp-vs-the-raw-ebay-api)
- [One-click AI setup](#one-click-ai-setup)
- [Quick start](#quick-start)
- [Demo](#demo)
- [Configuration](#configuration)
- [Available tools](#available-tools)
- [Interactive UI (MCP Apps) — beta](#interactive-ui-mcp-apps)
- [Usage examples](#usage-examples)
- [Logging & troubleshooting](#logging--troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Resources](#resources)
- [License](#license)
- [Contributors](#contributors)

## Features

- **322 eBay API tools** — 100% coverage of the eBay Sell APIs across inventory, orders, marketing, analytics, metadata, taxonomy, and developer tooling.
- **9 AI clients, auto-configured** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI, and Amazon Q Developer.
- **OAuth 2.0 built in** — full user-token management with automatic refresh, and smart fallback from user tokens (10k–50k req/day) to client credentials (1k req/day).
- **Resilient by default** — automatic retry with exponential backoff on `429` rate limits, and consistent, loud error surfacing.
- **Type-safe** — TypeScript end to end, Zod-validated tool inputs, and OpenAPI-generated types.
- **Local-first & private** — runs over STDIO or local HTTP; your credentials and data never leave your machine.
- **Sandbox and production** — switch environments with a single variable.
- **One-command setup** — `npm run setup` configures credentials, OAuth, and your MCP client, with a browser auto-opened for the OAuth flow.
- **Well tested** — 1,000+ automated tests run in CI on every change.

## eBay MCP vs. the raw eBay API

Both talk to the same eBay endpoints — the difference is everything you'd otherwise build yourself.

| | **eBay MCP Server** | **Raw eBay REST API** |
| --- | --- | --- |
| Interface | Natural language through your AI assistant | Hand-written HTTP requests and JSON parsing |
| OAuth & token refresh | Built in, with automatic refresh | You implement and maintain it |
| Rate-limit handling | Automatic retry with exponential backoff | Manual `429` handling and backoff |
| Input validation | Zod schemas + TypeScript types on every tool | None — you validate your own payloads |
| Setup | One wizard (`npm run setup`) | Per-call auth, headers, and marketplace wiring |
| AI client support | 9 clients auto-configured | Not applicable |
| API coverage | 322 tools across 100% of the Sell APIs, ready to call | Build each request from the docs |
| Hosting | Runs locally, no cloud relay | Your own infrastructure |

## One-click AI setup

> **Let your AI assistant set this up for you.** Copy the prompt below and paste it into Claude, ChatGPT, or any AI assistant with MCP support.

<details>
<summary><strong>Click to copy the AI setup prompt</strong></summary>

```
I want to set up the eBay MCP Server for my AI assistant. Please help me:

1. Install the eBay MCP server:
   npm install -g ebay-mcp

2. I need to configure it for [Claude Desktop / Cursor / Cline / Zed / Continue.dev / Windsurf / Claude Code CLI / Amazon Q] (choose one)

3. My eBay credentials are:
   - Client ID: [YOUR_CLIENT_ID]
   - Client Secret: [YOUR_CLIENT_SECRET]
   - Environment: [sandbox / production]
   - Redirect URI (RuName): [YOUR_REDIRECT_URI]

Please:
- Create the appropriate config file for my MCP client
- Set up the environment variables
- Help me complete the OAuth flow to get a refresh token for higher rate limits
- Test that the connection works

If I don't have eBay credentials yet, guide me through creating a developer account at https://developer.ebay.com/
```

</details>

## Quick start

### 1. Get eBay credentials

1. Create a free [eBay Developer Account](https://developer.ebay.com/).
2. Generate application keys in the [Developer Portal](https://developer.ebay.com/my/keys).
3. Save your **Client ID** and **Client Secret**.

### 2. Install

```bash
npm install -g ebay-mcp            # from npm (recommended)
```

Or from source:

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. Run the setup wizard

```bash
npm run setup
```

The wizard configures your eBay credentials, sets up OAuth (for higher rate limits), auto-detects and configures your MCP client, and saves everything automatically.

### 4. Use

Restart your MCP client (Claude Desktop, etc.) and start managing eBay through your AI assistant.

<details>
<summary><strong>📸 Visual setup walkthrough (eBay Developer Portal)</strong></summary>

<br />

The setup wizard (`npm run setup`) handles OAuth automatically. Here's where to find your credentials in the eBay Developer Portal:

**Step 1** — In the [Developer Portal](https://developer.ebay.com/my/keys), copy your **App ID (Client ID)** and **Cert ID (Client Secret)**:

![Step 1 - Copy Client ID and Client Secret from the eBay Developer Portal](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**Step 2** — In your app's **User Tokens** settings, copy the **RuName** (eBay Redirect URL):

![Step 2 - Copy the RuName redirect URL from eBay sign-in settings](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**Step 3** — Run `npm run setup`. It opens your browser for OAuth login and guides you through eBay sign-in:

![Step 3 - Sign in to eBay during the OAuth flow started by npm run setup](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**Step 4** — Paste the authorization code from the callback URL when prompted:

![Step 4 - Paste the authorization code into the eBay MCP setup wizard](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

The wizard exchanges the code for tokens, saves them, and configures your MCP client. You now have user-token authentication (10k–50k requests/day instead of the default 1k/day).

</details>

## Demo

See the eBay MCP Server in action with Claude Desktop:

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## Configuration

> 📖 Full reference — every environment variable, OAuth step, and scope — is in the [Configuration Guide](docs/auth/CONFIGURATION.md). `npm run setup` writes the `.env` for you; the variables below are for reference.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # or "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # default marketplace (overridable per tool)
EBAY_CONTENT_LANGUAGE=en-US         # default request content language
EBAY_USER_REFRESH_TOKEN=your_token  # for higher rate limits
EBAY_MCP_UI=on                      # interactive MCP Apps views (beta); "off" forces plain JSON
```

### Authentication & rate limits

| Mode                             | Daily limit     | Best for                | Setup                             |
| -------------------------------- | --------------- | ----------------------- | --------------------------------- |
| **Client credentials** (default) | 1,000 req/day   | Development, testing    | Automatic with Client ID + Secret |
| **User token** (recommended)     | 10k–50k req/day | Production, high volume | OAuth via `npm run setup`         |

User-token limits vary by account tier (Individual 10k · Commercial 25k · Enterprise 50k+). On a `429`, the server retries with exponential backoff and surfaces the error. See the [Configuration Guide](docs/auth/CONFIGURATION.md) and [OAuth Quick Reference](docs/auth/OAUTH_QUICK_REFERENCE.md) for details, and monitor usage in the [Developer Portal](https://developer.ebay.com/my/api_usage).

### MCP client compatibility

Auto-configured by `npm run setup`. Requires Node.js ≥ 18 and MCP protocol 1.0+ over STDIO (default) or HTTP.

| Client                 | Platform              | Config path                                                                  |
| ---------------------- | --------------------- | ---------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`             |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                          |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                                 |
| **Cline**              | VS Code extension     | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`  |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                     |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                         |
| **Roo Code**           | VS Code extension     | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`    |
| **Claude Code CLI**    | Terminal              | `~/.claude.json`                                                             |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                     |

## Available tools

**322 tools**, 100% Sell API coverage, organized by category. Each link points to the tool definitions and handlers in [`src/tools/categories/`](src/tools/categories/):

| Category | What you can do |
| --- | --- |
| [Account](src/tools/categories/account.ts) | Business, fulfillment, payment, and return policies; programs; subscriptions; sales tax |
| [Inventory](src/tools/categories/inventory.ts) | Inventory items, offers, locations, item groups, bulk operations, SKU/location mapping |
| [Fulfillment](src/tools/categories/fulfillment.ts) | Orders, shipping, refunds, disputes, payment-dispute evidence |
| [Marketing](src/tools/categories/marketing.ts) | Promoted-listings campaigns, ads, promotions, bidding, bulk operations |
| [Analytics](src/tools/categories/analytics.ts) | Traffic reports, seller standards, customer-service metrics |
| [Communication](src/tools/categories/communication.ts) | Buyer–seller messaging, negotiations, notifications, feedback |
| [Metadata](src/tools/categories/metadata.ts) | Return policies, sales-tax jurisdictions, automotive compatibility |
| [Taxonomy](src/tools/categories/taxonomy.ts) | Category trees, item aspects, item conditions |
| [Trading (legacy XML)](src/tools/categories/trading.ts) | Fixed-price listing create, revise, relist, end |
| [Developer](src/tools/categories/developer.ts) | Rate limits, signing keys, client registration |
| [Token Management](src/tools/categories/token-management.ts) | OAuth URL generation and token management |

**Example tools:** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

For the complete machine-readable index, see [llms.txt](llms.txt).

## Interactive UI (MCP Apps)

> **Beta** — this feature is new and evolving alongside the MCP Apps spec, and host support is still rolling out. It is opt-in and falls back to plain JSON, so it never breaks existing clients. Toggle it with `EBAY_MCP_UI` (see [Configuration](#configuration)).

On hosts that support [MCP Apps](https://modelcontextprotocol.io), common read tools render their results as interactive views instead of raw JSON — a sortable **table**, a detail **card**, or a **chart** — using the host's own theme. Everywhere else, the exact same tools return plain JSON, so nothing breaks. It is built on the official [MCP Apps SDK (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps), the extension that lets MCP servers ship interactive UI to conversational clients.

- **Opt-in and host-gated.** Views are advertised only to clients that announce the MCP Apps capability (e.g. Claude). Hosts without it (e.g. Cursor) silently get JSON.
- **Kill-switch.** Set `EBAY_MCP_UI=off` to force plain JSON everywhere, even on capable hosts.
- **Token-cheap.** Each view's HTML is fetched once by the host out of band (never into the model's context); the model only ever sees a one-line summary plus the structured data it would have received anyway.
- **Read-only.** Views only ever trigger read tools (drill into a row, page, refresh) — they never mutate your eBay data.

13 core-workflow tools opt in today, across three archetypes:

| Archetype | Tools |
| --- | --- |
| **Table** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **Card** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **Chart** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

The views build into self-contained HTML with `npm run build` (or `npm run build:ui`); they ship in the published package and load with no network access of their own.

## Usage examples

Common tasks, phrased as you'd ask your AI assistant:

- **Set up OAuth** — *"Help me set up OAuth for my eBay account."* → generates an authorization URL via `ebay_get_oauth_url`, then configures the refresh token. Unlocks 10k–50k req/day.
- **Manage inventory** — *"Show me all my active listings."* → `ebay_get_inventory_items` returns SKUs, quantities, and status.
- **Process orders** — *"Get all unfulfilled orders from the last 7 days."* → `ebay_get_orders` with date and fulfillment-status filters.
- **Create campaigns** — *"Create a promoted-listing campaign for electronics."* → `ebay_create_campaign` and related marketing tools.
- **Bulk operations** — *"Apply a 10% discount to all 'Vintage Watches' items."* → `ebay_get_inventory_items` + `ebay_update_offer` across matches.

## Logging & troubleshooting

- **Logging** — Winston-based, written to stderr (MCP-safe) with optional file output. See [docs/logging.md](docs/logging.md).
- **Troubleshooting** — server not appearing, auth errors, rate limits, empty results. Start with `npm run diagnose`, then see [docs/troubleshooting.md](docs/troubleshooting.md).

## FAQ

### What is the eBay MCP server?

A local [Model Context Protocol](https://modelcontextprotocol.io) server that exposes **322 tools** covering **100% of eBay's Sell APIs** (270 endpoints) to AI assistants — inventory, order fulfillment, marketing, analytics, and developer tools.

### Is this an official eBay product?

No. This is an unofficial, third-party open-source project. It is **not affiliated with, authorized, or endorsed by eBay Inc.**

### Which AI assistants and MCP clients are supported?

Nine clients are auto-configured by `npm run setup`: Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI, and Amazon Q Developer. Any MCP-compatible client can connect.

### Can I use it with Claude, ChatGPT, or Cursor?

Yes. It works with Claude Desktop and Claude Code out of the box, with Cursor and other MCP-enabled IDEs, and with any assistant that supports the Model Context Protocol. The one-click setup prompt above works with ChatGPT and other assistants too.

### Why don't I see the interactive tables and charts?

Interactive [MCP Apps](#interactive-ui-mcp-apps) views only appear on hosts that announce the capability (e.g. Claude); other clients get the same data as plain JSON. Also confirm you have not set `EBAY_MCP_UI=off` and that the views are built (`npm run build` runs `build:ui`).

### How many eBay APIs and tools does it cover?

322 tools across 270 unique endpoints — 100% of eBay's Sell APIs.

### Is it free and open source?

Yes. It is released under the [MIT license](LICENSE).

### Does it run locally or in the cloud?

It runs entirely on your machine over STDIO (or local HTTP). There is no cloud relay — your eBay credentials never leave your computer.

### What do I need to get started?

Node.js ≥ 18, a free [eBay Developer Account](https://developer.ebay.com/) (Client ID + Client Secret), then run `npm run setup`.

### What are the eBay API rate limits?

Client credentials (the default) allow about 1,000 requests/day. Authenticating with a user token via OAuth raises this to 10,000–50,000 requests/day depending on your account tier.

### Does it support both sandbox and production?

Yes. Switch with the `EBAY_ENVIRONMENT` variable (`sandbox` or `production`).

### Are my credentials and data secure?

Credentials are stored locally in your `.env` file and used only to call eBay directly. See [SECURITY.md](SECURITY.md) and [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

### How is this different from calling the eBay API directly?

You interact in natural language through your AI assistant. OAuth token management, automatic retries with backoff, and type-safe Zod validation are built in. See the [comparison table](#ebay-mcp-vs-the-raw-ebay-api) above.

### Does it support eBay's legacy Trading API (XML)?

Yes. Fixed-price listing create, revise, relist, and end operations are supported through the Trading API tools.

### How do I get higher rate limits?

Complete the OAuth flow with `npm run setup` to authenticate with a user token (10k–50k requests/day instead of the default 1k).

### What is it built with?

TypeScript and Node.js (ESM), using the official MCP SDK, Zod for validation, and OpenAPI-generated types.

### How do I update to the latest version?

Run `npm install -g ebay-mcp@latest` (or `npm update -g ebay-mcp`).

### Does it work offline?

No. "Runs locally" means the server process runs on your machine — it still needs an internet connection and valid credentials to reach eBay's live APIs.

## Contributing

Contributions welcome. Fork → branch → add tests → `npm run check && npm test` → commit with [Conventional Commits](https://www.conventionalcommits.org/) → open a PR.

- Working on the codebase or with a coding agent? Start with **[AGENTS.md](AGENTS.md)** — build/test commands, module map, and the add-an-endpoint workflow.
- Full guidelines: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Resources

- [eBay Developer Portal](https://developer.ebay.com/) — API docs and credentials
- [eBay API License Agreement](https://developer.ebay.com/join/api-license-agreement) — terms and compliance
- [eBay Data Handling Requirements](https://developer.ebay.com/api-docs/static/data-handling-update.html) — data protection and privacy
- [MCP Documentation](https://modelcontextprotocol.io/) — Model Context Protocol spec
- [OAuth Quick Reference](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes, troubleshooting, examples
- [eBay API Status](https://developer.ebay.com/support/api-status) — official status page (also via the `ebay_get_api_status` tool and the [in-repo snapshot](docs/API_STATUS.md))
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Issue Tracker](https://github.com/YosefHayim/ebay-mcp/issues) — bug reports and feature requests

## License

MIT — see [LICENSE](LICENSE).

## Contributors

Thanks to everyone who has helped make this project better! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="eBay MCP contributors" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[Support this project](https://www.buymeacoffee.com/yosefhayim)** · Created by [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>eBay MCP server · Model Context Protocol for eBay Sell APIs · connect Claude, Cursor, and any AI assistant to eBay inventory, orders, marketing, and analytics.</sub>

</div>
