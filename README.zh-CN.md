<!-- Keywords: eBay MCP 服务器, 面向 eBay 的 Model Context Protocol, 面向 AI 助手的 eBay API, eBay Sell API, eBay 与 Claude 集成, eBay 与 Cursor, eBay 库存自动化, AI 管理 eBay 订单, eBay OAuth, eBay 开发者工具, 用于 eBay 的 MCP 服务器 -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="eBay MCP 服务器 — 一条命令将 Claude、Cursor 以及任意 AI 助手连接到 eBay 的 Sell API（npm run setup）" width="820" /></a>
</p>

<p align="center">
  <strong>eBay MCP 服务器 — 让 Claude、Cursor 以及任意 AI 助手完全访问 eBay 的 Sell API。322 个工具覆盖库存、订单、营销与分析，使用你自己的密钥在本地运行。</strong>
</p>

<p align="center"><sub>非官方开源项目 — 与 eBay Inc. 无任何关联，未获其授权或认可。</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="npm 版本" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="npm 月下载量" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="CI 状态" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="MIT 许可证" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="所需的 Node.js 版本" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="包含 TypeScript 类型" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 个 eBay API 工具" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% 覆盖 eBay Sell API" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="兼容 Model Context Protocol" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="超过 1000 个通过的测试" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="完全在你的机器上运行" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="MseeP.ai 安全评估徽章" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <strong>简体中文</strong> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** 是一个本地的 [Model Context Protocol](https://modelcontextprotocol.io) 服务器，可将 AI 助手 —Claude Desktop、Claude Code、Cursor、Cline、Windsurf、Zed、Continue.dev、Roo Code 和 Amazon Q— 直接连接到 **eBay 的 Sell API**。它提供 **322 个工具**，覆盖 **eBay Sell API 的 100% 范围**（270 个唯一端点），涵盖库存管理、订单履行、推广刊登营销、分析和开发者工具。一切都在你的机器上通过 STDIO 或本地 HTTP 运行 — **没有云端中继**，你的 eBay 凭据永远不会离开你的电脑。

> **免责声明：** 非官方第三方项目 — **与 eBay Inc. 无关联，也未获其认可。** 按"原样"提供，不附带任何担保。你需自行负责遵守 [eBay API 许可协议](https://developer.ebay.com/join/api-license-agreement) 和 [数据处理要求](https://developer.ebay.com/api-docs/static/data-handling-update.html)、妥善保管你的凭据并遵守速率限制。在投入生产前请先在沙盒中测试。参见 [LICENSE](LICENSE)、[SECURITY.md](SECURITY.md) 和 [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md)。

## 目录

- [功能特性](#功能特性)
- [eBay MCP 对比原生 eBay API](#ebay-mcp-对比原生-ebay-api)
- [AI 一键配置](#ai-一键配置)
- [快速开始](#快速开始)
- [演示](#演示)
- [配置](#配置)
- [可用工具](#可用工具)
- [交互式界面（MCP Apps · 测试版）](#交互式界面mcp-apps)
- [使用示例](#使用示例)
- [日志与故障排查](#日志与故障排查)
- [常见问题](#常见问题)
- [参与贡献](#参与贡献)
- [资源](#资源)
- [许可证](#许可证)
- [贡献者](#贡献者)

## 功能特性

- **322 个 eBay API 工具** — 100% 覆盖 eBay Sell API，涵盖库存、订单、营销、分析、元数据、分类法和开发者工具。
- **自动配置 9 个 AI 客户端** — Claude Desktop、Cursor、Zed、Cline、Continue.dev、Windsurf、Roo Code、Claude Code CLI 和 Amazon Q Developer。
- **内置 OAuth 2.0** — 完整的用户令牌管理与自动刷新，并能从用户令牌（每天 1 万–5 万次请求）智能回退到客户端凭据（每天 1 千次请求）。
- **默认具备韧性** — 遇到 `429` 速率限制时自动重试并采用指数退避，错误提示清晰一致。
- **类型安全** — 端到端 TypeScript，使用 Zod 校验工具输入，类型由 OpenAPI 生成。
- **本地且私密** — 通过 STDIO 或本地 HTTP 运行；你的凭据和数据永远不会离开你的机器。
- **沙盒与生产** — 用一个变量即可切换环境。
- **一条命令完成配置** — `npm run setup` 会配置凭据、OAuth 和你的 MCP 客户端，并自动打开浏览器完成 OAuth 流程。
- **测试充分** — 每次改动都会在 CI 中运行超过 1000 个自动化测试。

## eBay MCP 对比原生 eBay API

两者都与相同的 eBay 端点通信 — 区别在于其余一切原本都要你自己来构建。

| | **eBay MCP 服务器** | **原生 eBay REST API** |
| --- | --- | --- |
| 接口 | 通过 AI 助手使用自然语言 | 手写 HTTP 请求并解析 JSON |
| OAuth 与令牌刷新 | 内置，并自动刷新 | 由你自行实现和维护 |
| 速率限制处理 | 自动重试并指数退避 | 手动处理 `429` 与退避 |
| 输入校验 | 每个工具都有 Zod 模式 + TypeScript 类型 | 无 — 由你校验自己的载荷 |
| 配置 | 一个向导（`npm run setup`） | 每次调用都要处理认证、请求头和站点 |
| AI 客户端支持 | 自动配置 9 个客户端 | 不适用 |
| API 覆盖 | 322 个工具覆盖 100% Sell API，开箱即用 | 你需根据文档构建每个请求 |
| 托管 | 本地运行，无云端中继 | 你自己的基础设施 |

## AI 一键配置

> **让你的 AI 助手替你完成配置。** 复制下面的提示词，粘贴到 Claude、ChatGPT 或任何支持 MCP 的 AI 助手中。

<details>
<summary><strong>点击以复制 AI 配置提示词</strong></summary>

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

## 快速开始

### 1. 获取 eBay 凭据

1. 创建一个免费的 [eBay 开发者账号](https://developer.ebay.com/)。
2. 在 [开发者门户](https://developer.ebay.com/my/keys) 生成应用密钥。
3. 保存你的 **Client ID** 和 **Client Secret**。

### 2. 安装

```bash
npm install -g ebay-mcp            # 从 npm 安装（推荐）
```

或从源码安装：

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. 运行配置向导

```bash
npm run setup
```

向导会配置你的 eBay 凭据、设置 OAuth（以获得更高的速率限制）、自动检测并配置你的 MCP 客户端，并自动保存一切。

### 4. 使用

重启你的 MCP 客户端（Claude Desktop 等），开始通过 AI 助手管理 eBay。

<details>
<summary><strong>📸 可视化配置指南（eBay 开发者门户）</strong></summary>

<br />

配置向导（`npm run setup`）会自动处理 OAuth。以下是在 eBay 开发者门户中查找凭据的位置：

**第 1 步** — 在 [开发者门户](https://developer.ebay.com/my/keys) 中，复制你的 **App ID（Client ID）** 和 **Cert ID（Client Secret）**：

![第 1 步 - 从 eBay 开发者门户复制 Client ID 和 Client Secret](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**第 2 步** — 在你应用的 **User Tokens** 设置中，复制 **RuName**（eBay 重定向 URL）：

![第 2 步 - 从 eBay 登录设置复制 RuName 重定向 URL](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**第 3 步** — 运行 `npm run setup`。它会打开浏览器进行 OAuth 登录，并引导你完成 eBay 登录：

![第 3 步 - 在 npm run setup 启动的 OAuth 流程中登录 eBay](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**第 4 步** — 出现提示时，粘贴回调 URL 中的授权码：

![第 4 步 - 将授权码粘贴到 eBay MCP 配置向导中](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

向导会用授权码换取令牌、保存它们并配置你的 MCP 客户端。现在你已拥有用户令牌认证（每天 1 万–5 万次请求，而非默认的 1 千次/天）。

</details>

## 演示

通过 Claude Desktop 观看 eBay MCP 服务器的实际效果：

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## 配置

> 📖 完整参考 —每个环境变量、OAuth 步骤和 scope— 见 [配置指南](docs/auth/CONFIGURATION.md)。`npm run setup` 会为你写入 `.env`；下面的变量仅供参考。

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # 或 "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # 默认站点（可按工具覆盖）
EBAY_CONTENT_LANGUAGE=en-US         # 请求的默认内容语言
EBAY_USER_REFRESH_TOKEN=your_token  # 用于更高的速率限制
EBAY_MCP_UI=on                      # 交互式 MCP Apps 视图（测试版）；设为 "off" 可强制返回纯 JSON
```

### 认证与速率限制

| 模式                       | 每日限额              | 最适合           | 设置方式                          |
| -------------------------- | --------------------- | ---------------- | --------------------------------- |
| **客户端凭据**（默认）     | 每天 1000 次请求      | 开发、测试       | 使用 Client ID + Secret 自动完成  |
| **用户令牌**（推荐）       | 每天 1 万–5 万次请求  | 生产、高并发     | 通过 `npm run setup` 完成 OAuth   |

用户令牌的限额因账号等级而异（个人 1 万 · 商业 2.5 万 · 企业 5 万+）。遇到 `429` 时，服务器会以指数退避重试并报告错误。详情参见 [配置指南](docs/auth/CONFIGURATION.md) 和 [OAuth 快速参考](docs/auth/OAUTH_QUICK_REFERENCE.md)，并在 [开发者门户](https://developer.ebay.com/my/api_usage) 中监控用量。

### MCP 客户端兼容性

由 `npm run setup` 自动配置。需要 Node.js ≥ 18 以及通过 STDIO（默认）或 HTTP 的 MCP 协议 1.0+。

| 客户端                 | 平台                  | 配置路径                                                                    |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS、Windows、Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS、Windows、Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS、Windows、Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | VS Code 扩展          | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code、JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS、Windows、Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | VS Code 扩展          | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | 终端                  | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## 可用工具

**322 个工具**，100% Sell API 覆盖，按类别组织。每个链接都指向 [`src/tools/categories/`](src/tools/categories/) 中的工具定义及其处理程序：

| 类别 | 你可以做什么 |
| --- | --- |
| [Account](src/tools/categories/account.ts) | 业务、履行、付款和退货政策；计划；订阅；销售税 |
| [Inventory](src/tools/categories/inventory.ts) | 库存商品、报价、地点、商品分组、批量操作、SKU/地点映射 |
| [Fulfillment](src/tools/categories/fulfillment.ts) | 订单、配送、退款、纠纷、付款纠纷证据 |
| [Marketing](src/tools/categories/marketing.ts) | 推广刊登广告活动、广告、促销、出价、批量操作 |
| [Analytics](src/tools/categories/analytics.ts) | 流量报告、卖家标准、客户服务指标 |
| [Communication](src/tools/categories/communication.ts) | 买卖双方消息、议价、通知、评价 |
| [Metadata](src/tools/categories/metadata.ts) | 退货政策、销售税辖区、汽车兼容性 |
| [Taxonomy](src/tools/categories/taxonomy.ts) | 类目树、商品属性、商品成色 |
| [Trading（旧版 XML）](src/tools/categories/trading.ts) | 固定价格刊登的创建、修改、重新刊登和结束 |
| [Developer](src/tools/categories/developer.ts) | 速率限制、签名密钥、客户端注册 |
| [Token Management](src/tools/categories/token-management.ts) | OAuth URL 生成与令牌管理 |

**示例工具：** `ebay_get_inventory_items`、`ebay_get_orders`、`ebay_create_offer`、`ebay_get_campaigns`、`ebay_get_oauth_url`。

完整的机器可读索引见 [llms.txt](llms.txt)。

## 交互式界面（MCP Apps）

> **测试版** —— 此功能是全新的，会随 MCP Apps 规范一同演进，宿主端的支持仍在逐步推出。它需要主动启用，并会回退到纯 JSON，因此绝不会破坏现有客户端。可通过 `EBAY_MCP_UI` 开启或关闭。

在支持 [MCP Apps](https://modelcontextprotocol.io) 的宿主上，常用的读取类工具会将结果渲染为交互式视图，而非原始 JSON —— 可排序的**表格**、详情**卡片**或**图表** —— 并采用宿主自身的主题。在其他任何环境中，同样的这些工具都会返回纯 JSON，因此不会出现任何问题。它基于官方的 [MCP Apps SDK (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps) 构建 —— 这个扩展让 MCP 服务器能够向对话式客户端交付交互式界面。

- **可选启用且受宿主限制。** 视图仅向声明了 MCP Apps 能力的客户端（例如 Claude）公布。不具备该能力的宿主（例如 Cursor）会静默地获得 JSON。
- **紧急开关。** 设置 `EBAY_MCP_UI=off` 即可在所有环境强制返回纯 JSON，即使在具备能力的宿主上也是如此。
- **节省 token。** 每个视图的 HTML 由宿主在带外只获取一次（绝不进入模型的上下文）；模型始终只看到一行摘要，外加它本就会收到的结构化数据。
- **只读。** 视图只会触发读取类工具（深入查看某一行、翻页、刷新）—— 它们绝不会改动你的 eBay 数据。

目前有 13 个核心工作流工具选择了启用，分为三种类型：

| 类型 | 工具 |
| --- | --- |
| **表格** | `ebay_get_orders`、`ebay_get_shipping_fulfillments`、`ebay_get_offers`、`ebay_get_inventory_items`、`ebay_get_inventory_locations`、`ebay_get_payment_dispute_summaries` |
| **卡片** | `ebay_get_order`、`ebay_get_offer`、`ebay_get_inventory_item`、`ebay_get_payment_dispute`、`ebay_get_seller_standards_profile` |
| **图表** | `ebay_get_traffic_report`、`ebay_get_customer_service_metric` |

这些视图通过 `npm run build`（或 `npm run build:ui`）构建为自包含的 HTML；它们随发布的包一同分发，加载时无需自身的任何网络访问。

## 使用示例

常见任务，按你向 AI 助手提问的方式表述：

- **设置 OAuth** — *"帮我为我的 eBay 账号设置 OAuth。"* → 通过 `ebay_get_oauth_url` 生成授权 URL，然后配置刷新令牌。解锁每天 1 万–5 万次请求。
- **管理库存** — *"显示我所有的在售刊登。"* → `ebay_get_inventory_items` 返回 SKU、数量和状态。
- **处理订单** — *"获取过去 7 天所有未履行的订单。"* → 带日期和履行状态筛选的 `ebay_get_orders`。
- **创建广告活动** — *"为电子产品创建一个推广刊登广告活动。"* → `ebay_create_campaign` 及相关营销工具。
- **批量操作** — *"为所有'复古手表'商品应用 10% 折扣。"* → 在匹配项上使用 `ebay_get_inventory_items` + `ebay_update_offer`。

## 日志与故障排查

- **日志** — 基于 Winston，写入 stderr（对 MCP 安全），可选输出到文件。参见 [docs/logging.md](docs/logging.md)。
- **故障排查** — 服务器未出现、认证错误、速率限制、空结果。先运行 `npm run diagnose`，然后参见 [docs/troubleshooting.md](docs/troubleshooting.md)。

## 常见问题

### 什么是 eBay MCP 服务器？

一个本地的 [Model Context Protocol](https://modelcontextprotocol.io) 服务器，向 AI 助手提供 **322 个工具**，覆盖 **eBay Sell API 的 100%**（270 个端点）—— 库存、订单履行、营销、分析和开发者工具。

### 这是 eBay 的官方产品吗？

不是。这是一个非官方的第三方开源项目。它**与 eBay Inc. 无关联，未获其授权或认可。**

### 支持哪些 AI 助手和 MCP 客户端？

`npm run setup` 会自动配置九个客户端：Claude Desktop、Cursor、Zed、Cline、Continue.dev、Windsurf、Roo Code、Claude Code CLI 和 Amazon Q Developer。任何兼容 MCP 的客户端都可以连接。

### 我可以将它与 Claude、ChatGPT 或 Cursor 一起使用吗？

可以。它开箱即用地支持 Claude Desktop 和 Claude Code，支持 Cursor 和其他支持 MCP 的 IDE，以及任何支持 Model Context Protocol 的助手。上面的一键配置提示词也适用于 ChatGPT 和其他助手。

### 为什么我看不到交互式表格和图表？

交互式 [MCP Apps](#交互式界面mcp-apps) 视图仅出现在声明了该能力的宿主上（例如 Claude）；其他客户端会以纯 JSON 的形式获得相同的数据。另外请确认你没有设置 `EBAY_MCP_UI=off`，并且这些视图已经构建（`npm run build` 会运行 `build:ui`）。

### 它覆盖多少 eBay API 和工具？

322 个工具，覆盖 270 个唯一端点 —— eBay Sell API 的 100%。

### 它是免费且开源的吗？

是的。它以 [MIT 许可证](LICENSE) 发布。

### 它在本地运行还是在云端运行？

完全在你的机器上通过 STDIO（或本地 HTTP）运行。没有云端中继 —— 你的 eBay 凭据永远不会离开你的电脑。

### 我需要什么才能开始？

Node.js ≥ 18、一个免费的 [eBay 开发者账号](https://developer.ebay.com/)（Client ID + Client Secret），然后运行 `npm run setup`。

### eBay API 的速率限制是多少？

客户端凭据（默认）约允许每天 1000 次请求。通过 OAuth 使用用户令牌进行认证后，可根据账号等级提升到每天 10,000–50,000 次请求。

### 它是否同时支持沙盒和生产？

是的。用 `EBAY_ENVIRONMENT` 变量切换（`sandbox` 或 `production`）。

### 我的凭据和数据安全吗？

凭据本地存储在你的 `.env` 文件中，仅用于直接调用 eBay。参见 [SECURITY.md](SECURITY.md) 和 [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md)。

### 这与直接调用 eBay API 有何不同？

你通过 AI 助手以自然语言交互。OAuth 令牌管理、带退避的自动重试以及基于 Zod 的类型安全校验都是内置的。参见上面的 [对比表](#ebay-mcp-对比原生-ebay-api)。

### 它是否支持 eBay 的旧版 Trading API（XML）？

支持。固定价格刊登的创建、修改、重新刊登和结束操作通过 Trading API 工具提供。

### 如何获得更高的速率限制？

用 `npm run setup` 完成 OAuth 流程，以用户令牌进行认证（每天 1 万–5 万次请求，而非默认的 1 千次）。

### 它用什么构建？

TypeScript 和 Node.js（ESM），使用官方 MCP SDK、用于校验的 Zod 以及由 OpenAPI 生成的类型。

### 如何更新到最新版本？

运行 `npm install -g ebay-mcp@latest`（或 `npm update -g ebay-mcp`）。

### 它能离线工作吗？

不能。"在本地运行"指服务器进程在你的机器上运行 —— 它仍然需要互联网连接和有效凭据才能访问 eBay 的实时 API。

## 参与贡献

欢迎贡献。Fork → 新建分支 → 添加测试 → `npm run check && npm test` → 使用 [Conventional Commits](https://www.conventionalcommits.org/) 提交 → 提交 PR。

- 在代码库上工作或使用编程智能体？请从 **[AGENTS.md](AGENTS.md)** 开始 —— 构建/测试命令、模块地图以及添加端点的流程。
- 完整指南：**[CONTRIBUTING.md](CONTRIBUTING.md)**。

## 资源

- [eBay 开发者门户](https://developer.ebay.com/) — API 文档和凭据
- [eBay API 许可协议](https://developer.ebay.com/join/api-license-agreement) — 条款与合规
- [eBay 数据处理要求](https://developer.ebay.com/api-docs/static/data-handling-update.html) — 数据保护与隐私
- [MCP 文档](https://modelcontextprotocol.io/) — Model Context Protocol 规范
- [OAuth 快速参考](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes、故障排查、示例
- [eBay API 状态](https://developer.ebay.com/support/api-status) — 官方状态页面（也可通过 `ebay_get_api_status` 工具和[仓库内快照](docs/API_STATUS.md)）
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [问题跟踪](https://github.com/YosefHayim/ebay-mcp/issues) — 错误报告和功能请求

## 许可证

MIT — 参见 [LICENSE](LICENSE)。

## 贡献者

感谢所有帮助改进本项目的人！🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="eBay MCP 贡献者" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[支持本项目](https://www.buymeacoffee.com/yosefhayim)** · 由 [Yosef Hayim Sabag](https://github.com/YosefHayim) 创建

<sub>eBay MCP 服务器 · 面向 eBay Sell API 的 Model Context Protocol · 将 Claude、Cursor 以及任意 AI 助手连接到 eBay 的库存、订单、营销与分析。</sub>

</div>
