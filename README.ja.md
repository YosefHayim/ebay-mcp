<!-- Keywords: eBay MCP サーバー, eBay 向け Model Context Protocol, AI アシスタント向け eBay API, eBay Sell API, eBay と Claude の連携, eBay と Cursor, eBay 在庫の自動化, AI による eBay 注文管理, eBay OAuth, eBay 開発者ツール, eBay 用 MCP サーバー -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="eBay MCP サーバー — 1 つのコマンドで Claude、Cursor、そしてあらゆる AI アシスタントを eBay の Sell API に接続（npm run setup）" width="820" /></a>
</p>

<p align="center">
  <strong>eBay MCP サーバー — Claude、Cursor、そしてあらゆる AI アシスタントに eBay の Sell API への完全なアクセスを。在庫・注文・マーケティング・分析向けの 322 ツールを、自分の鍵でローカル実行。</strong>
</p>

<p align="center"><sub>非公式のオープンソースプロジェクト — eBay Inc. との提携・認可・承認はありません。</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="npm バージョン" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="npm 月間ダウンロード数" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="CI ステータス" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="MIT ライセンス" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="必要な Node.js バージョン" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="TypeScript 型定義を同梱" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 個の eBay API ツール" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="eBay Sell API を 100% カバー" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="Model Context Protocol 対応" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="1000 件以上のテストに合格" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="完全にあなたのマシンで動作" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="MseeP.ai セキュリティ評価バッジ" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <strong>日本語</strong> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** は、AI アシスタント —Claude Desktop、Claude Code、Cursor、Cline、Windsurf、Zed、Continue.dev、Roo Code、Amazon Q— を **eBay の Sell API** に直接接続するローカルの [Model Context Protocol](https://modelcontextprotocol.io) サーバーです。**eBay Sell API の全面（270 の固有エンドポイント）の 100%** をカバーする **322 個のツール** を提供し、在庫管理、注文処理、プロモーション広告のマーケティング、分析、開発者向けツールに対応します。すべては STDIO またはローカル HTTP 経由であなたのマシン上で動作し、**クラウド中継はありません**。eBay の認証情報がコンピューターから外に出ることは決してありません。

> **免責事項：** 非公式のサードパーティ製プロジェクトであり、**eBay Inc. との提携・承認はありません。** 「現状のまま」提供され、いかなる保証もありません。[eBay API ライセンス契約](https://developer.ebay.com/join/api-license-agreement) と [データ取り扱い要件](https://developer.ebay.com/api-docs/static/data-handling-update.html) の遵守、認証情報の安全な保管、レート制限の遵守はご自身の責任です。本番前にサンドボックスでテストしてください。[LICENSE](LICENSE)、[SECURITY.md](SECURITY.md)、[EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md) を参照してください。

## 目次

- [機能](#機能)
- [eBay MCP と素の eBay API](#ebay-mcp-と素の-ebay-api)
- [AI ワンクリック設定](#ai-ワンクリック設定)
- [クイックスタート](#クイックスタート)
- [デモ](#デモ)
- [設定](#設定)
- [利用可能なツール](#利用可能なツール)
- [インタラクティブ UI（MCP Apps・ベータ）](#インタラクティブ-ui-mcp-apps)
- [使用例](#使用例)
- [ログとトラブルシューティング](#ログとトラブルシューティング)
- [よくある質問](#よくある質問)
- [貢献する](#貢献する)
- [リソース](#リソース)
- [ライセンス](#ライセンス)
- [コントリビューター](#コントリビューター)

## 機能

- **322 個の eBay API ツール** — 在庫、注文、マーケティング、分析、メタデータ、タクソノミー、開発者向けツールにわたり eBay Sell API を 100% カバー。
- **9 つの AI クライアントを自動設定** — Claude Desktop、Cursor、Zed、Cline、Continue.dev、Windsurf、Roo Code、Claude Code CLI、Amazon Q Developer。
- **OAuth 2.0 を内蔵** — ユーザートークンの完全な管理と自動更新に加え、ユーザートークン（1 日 1 万〜5 万リクエスト）からクライアント認証情報（1 日 1 千リクエスト）へのスマートなフォールバック。
- **既定で堅牢** — `429` レート制限時に指数バックオフで自動リトライし、一貫した明確なエラー表示を行います。
- **型安全** — エンドツーエンドの TypeScript、Zod による検証付きのツール入力、OpenAPI から生成された型。
- **ローカルかつプライベート** — STDIO またはローカル HTTP で動作。認証情報やデータがマシンから外に出ることはありません。
- **サンドボックスと本番** — 変数 1 つで環境を切り替え。
- **1 コマンドで設定** — `npm run setup` が認証情報、OAuth、MCP クライアントを設定し、OAuth フローのためにブラウザを自動で開きます。
- **十分にテスト済み** — 変更ごとに 1000 件以上の自動テストが CI で実行されます。

## eBay MCP と素の eBay API

どちらも同じ eBay エンドポイントと通信します。違いは、そうでなければ自分で構築しなければならないすべてです。

| | **eBay MCP サーバー** | **素の eBay REST API** |
| --- | --- | --- |
| インターフェース | AI アシスタントを介した自然言語 | 手書きの HTTP リクエストと JSON 解析 |
| OAuth とトークン更新 | 内蔵、自動更新あり | 自分で実装・保守 |
| レート制限の処理 | 指数バックオフによる自動リトライ | `429` とバックオフの手動処理 |
| 入力検証 | すべてのツールに Zod スキーマ + TypeScript 型 | なし — 自分でペイロードを検証 |
| セットアップ | 1 つのウィザード（`npm run setup`） | 呼び出しごとに認証・ヘッダー・マーケットプレイス |
| AI クライアント対応 | 9 クライアントを自動設定 | 該当なし |
| API カバレッジ | Sell API の 100% にわたる 322 ツール、すぐ呼び出し可能 | ドキュメントから各リクエストを構築 |
| ホスティング | ローカル動作、クラウド中継なし | 自前のインフラ |

## AI ワンクリック設定

> **AI アシスタントに設定を任せましょう。** 下のプロンプトをコピーし、Claude、ChatGPT、または MCP 対応の任意の AI アシスタントに貼り付けてください。

<details>
<summary><strong>クリックして AI 設定プロンプトをコピー</strong></summary>

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

## クイックスタート

### 1. eBay の認証情報を取得

1. 無料の [eBay 開発者アカウント](https://developer.ebay.com/) を作成します。
2. [開発者ポータル](https://developer.ebay.com/my/keys) でアプリケーションキーを生成します。
3. **Client ID** と **Client Secret** を保存します。

### 2. インストール

```bash
npm install -g ebay-mcp            # npm から（推奨）
```

またはソースから：

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. 設定ウィザードを実行

```bash
npm run setup
```

ウィザードは、eBay の認証情報の設定、OAuth のセットアップ（より高いレート制限のため）、MCP クライアントの自動検出と設定を行い、すべてを自動的に保存します。

### 4. 使用する

MCP クライアント（Claude Desktop など）を再起動し、AI アシスタントを通じて eBay の管理を始めましょう。

<details>
<summary><strong>📸 ビジュアル設定ガイド（eBay 開発者ポータル）</strong></summary>

<br />

設定ウィザード（`npm run setup`）は OAuth を自動的に処理します。eBay 開発者ポータルで認証情報を見つける場所は次のとおりです：

**ステップ 1** — [開発者ポータル](https://developer.ebay.com/my/keys) で、**App ID（Client ID）** と **Cert ID（Client Secret）** をコピーします：

![ステップ 1 - eBay 開発者ポータルから Client ID と Client Secret をコピー](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**ステップ 2** — アプリの **User Tokens** 設定で、**RuName**（eBay リダイレクト URL）をコピーします：

![ステップ 2 - eBay サインイン設定から RuName リダイレクト URL をコピー](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**ステップ 3** — `npm run setup` を実行します。ブラウザが開いて OAuth ログインが行われ、eBay へのサインインを案内します：

![ステップ 3 - npm run setup が開始した OAuth フロー中に eBay にサインイン](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**ステップ 4** — 求められたら、コールバック URL の認可コードを貼り付けます：

![ステップ 4 - eBay MCP 設定ウィザードに認可コードを貼り付け](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

ウィザードはコードをトークンと交換して保存し、MCP クライアントを設定します。これでユーザートークン認証（既定の 1 日 1 千件ではなく 1 日 1 万〜5 万件のリクエスト）が利用できます。

</details>

## デモ

Claude Desktop で eBay MCP サーバーの動作をご覧ください：

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## 設定

> 📖 完全なリファレンス —すべての環境変数、OAuth ステップ、scope— は [設定ガイド](docs/auth/CONFIGURATION.md) にあります。`npm run setup` が `.env` を書き込みます。以下の変数は参考用です。

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # または "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # 既定のマーケットプレイス（ツールごとに上書き可能）
EBAY_CONTENT_LANGUAGE=en-US         # リクエストの既定コンテンツ言語
EBAY_USER_REFRESH_TOKEN=your_token  # より高いレート制限のため
EBAY_MCP_UI=on                      # インタラクティブな MCP Apps 表示（ベータ）。プレーンな JSON を強制するには "off" に設定
```

### 認証とレート制限

| モード                            | 1 日の上限              | 最適な用途           | セットアップ                          |
| --------------------------------- | ----------------------- | -------------------- | ------------------------------------- |
| **クライアント認証情報**（既定）  | 1 日 1000 リクエスト    | 開発、テスト         | Client ID + Secret で自動             |
| **ユーザートークン**（推奨）      | 1 日 1 万〜5 万リクエスト | 本番、大量処理       | `npm run setup` 経由の OAuth          |

ユーザートークンの上限はアカウント階層により異なります（Individual 1 万 · Commercial 2.5 万 · Enterprise 5 万+）。`429` の際、サーバーは指数バックオフでリトライし、エラーを表示します。詳細は [設定ガイド](docs/auth/CONFIGURATION.md) と [OAuth クイックリファレンス](docs/auth/OAUTH_QUICK_REFERENCE.md) を参照し、使用状況は [開発者ポータル](https://developer.ebay.com/my/api_usage) で監視してください。

### MCP クライアント互換性

`npm run setup` により自動設定されます。Node.js ≥ 18 と、STDIO（既定）または HTTP 経由の MCP プロトコル 1.0+ が必要です。

| クライアント           | プラットフォーム      | 設定パス                                                                    |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | VS Code 拡張機能      | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | VS Code 拡張機能      | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | ターミナル            | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## 利用可能なツール

**322 ツール**、Sell API を 100% カバー、カテゴリ別に整理。各リンクは [`src/tools/categories/`](src/tools/categories/) 内のツール定義とそのハンドラーを指します：

| カテゴリ | できること |
| --- | --- |
| [Account](src/tools/categories/account.ts) | ビジネス・配送・支払い・返品ポリシー、プログラム、サブスクリプション、販売税 |
| [Inventory](src/tools/categories/inventory.ts) | 在庫アイテム、オファー、ロケーション、アイテムグループ、一括操作、SKU/ロケーションのマッピング |
| [Fulfillment](src/tools/categories/fulfillment.ts) | 注文、配送、返金、係争、支払い係争の証拠 |
| [Marketing](src/tools/categories/marketing.ts) | プロモーション広告キャンペーン、広告、プロモーション、入札、一括操作 |
| [Analytics](src/tools/categories/analytics.ts) | トラフィックレポート、出品者基準、カスタマーサービス指標 |
| [Communication](src/tools/categories/communication.ts) | 購入者と出品者のメッセージ、交渉、通知、評価 |
| [Metadata](src/tools/categories/metadata.ts) | 返品ポリシー、販売税の管轄、自動車適合性 |
| [Taxonomy](src/tools/categories/taxonomy.ts) | カテゴリツリー、アイテムの特性、アイテムのコンディション |
| [Trading（レガシー XML）](src/tools/categories/trading.ts) | 固定価格出品の作成・修正・再出品・終了 |
| [Developer](src/tools/categories/developer.ts) | レート制限、署名キー、クライアント登録 |
| [Token Management](src/tools/categories/token-management.ts) | OAuth URL の生成とトークン管理 |

**ツール例：** `ebay_get_inventory_items`、`ebay_get_orders`、`ebay_create_offer`、`ebay_get_campaigns`、`ebay_get_oauth_url`。

完全な機械可読インデックスは [llms.txt](llms.txt) を参照してください。

## インタラクティブ UI（MCP Apps）

> **ベータ版** — この機能は新しく、MCP Apps の仕様とともに進化を続けており、ホスト側の対応もまだ広がっている段階です。オプトイン方式で、対応していない場合はプレーンな JSON にフォールバックするため、既存のクライアントを壊すことは決してありません。`EBAY_MCP_UI` で切り替えられます。

[MCP Apps](https://modelcontextprotocol.io) に対応するホストでは、よく使う読み取り系ツールが結果を生の JSON ではなくインタラクティブな表示として描画します — 並べ替え可能な **テーブル**、詳細を示す **カード**、または **チャート** — ホスト自身のテーマを用いて。それ以外の環境では、まったく同じツールがプレーンな JSON を返すため、何も壊れません。これは、MCP サーバーが会話型クライアントにインタラクティブな UI を提供できるようにする公式の拡張機能、[MCP Apps SDK (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps) を基盤に構築されています。

- **オプトインかつホスト依存。** 表示は、MCP Apps 機能を通知するクライアント（例：Claude）にのみ提供されます。それを持たないホスト（例：Cursor）には何も告知されず、JSON が返されます。
- **キルスイッチ。** `EBAY_MCP_UI=off` を設定すると、対応ホストであってもどこでもプレーンな JSON を強制できます。
- **トークン効率。** 各表示の HTML はホストが帯域外で一度だけ取得し（モデルのコンテキストに入ることは決してありません）、モデルが目にするのは 1 行の要約と、いずれにせよ受け取っていた構造化データだけです。
- **読み取り専用。** 表示が呼び出すのは読み取り系ツールのみです（行の詳細表示、ページング、更新） — あなたの eBay データを変更することは決してありません。

現在、3 つの基本タイプにわたり 13 個のコアワークフローツールがオプトインしています：

| タイプ | ツール |
| --- | --- |
| **テーブル** | `ebay_get_orders`、`ebay_get_shipping_fulfillments`、`ebay_get_offers`、`ebay_get_inventory_items`、`ebay_get_inventory_locations`、`ebay_get_payment_dispute_summaries` |
| **カード** | `ebay_get_order`、`ebay_get_offer`、`ebay_get_inventory_item`、`ebay_get_payment_dispute`、`ebay_get_seller_standards_profile` |
| **チャート** | `ebay_get_traffic_report`、`ebay_get_customer_service_metric` |

これらの表示は `npm run build`（または `npm run build:ui`）で自己完結型の HTML にビルドされ、公開パッケージに同梱されて、それ自体は一切のネットワークアクセスなしで読み込まれます。

## 使用例

AI アシスタントに尋ねるように表現した一般的なタスク：

- **OAuth を設定** — *「eBay アカウントの OAuth を設定するのを手伝って。」* → `ebay_get_oauth_url` で認可 URL を生成し、リフレッシュトークンを設定します。1 日 1 万〜5 万リクエストを解放。
- **在庫を管理** — *「アクティブな出品をすべて見せて。」* → `ebay_get_inventory_items` が SKU、数量、ステータスを返します。
- **注文を処理** — *「過去 7 日間の未処理注文をすべて取得して。」* → 日付と履行ステータスのフィルター付き `ebay_get_orders`。
- **キャンペーンを作成** — *「電子機器向けのプロモーション広告キャンペーンを作成して。」* → `ebay_create_campaign` と関連するマーケティングツール。
- **一括操作** — *「『ヴィンテージ時計』のすべての商品に 10% 割引を適用して。」* → 一致した項目に `ebay_get_inventory_items` + `ebay_update_offer`。

## ログとトラブルシューティング

- **ログ** — Winston ベースで、stderr に書き込まれ（MCP に安全）、任意でファイル出力。[docs/logging.md](docs/logging.md) を参照。
- **トラブルシューティング** — サーバーが表示されない、認証エラー、レート制限、結果が空。まず `npm run diagnose` を実行し、次に [docs/troubleshooting.md](docs/troubleshooting.md) を参照してください。

## よくある質問

### eBay MCP サーバーとは何ですか？

AI アシスタントに **eBay Sell API の 100%**（270 エンドポイント）をカバーする **322 個のツール** を公開するローカルの [Model Context Protocol](https://modelcontextprotocol.io) サーバーです — 在庫、注文処理、マーケティング、分析、開発者向けツール。

### これは eBay の公式製品ですか？

いいえ。非公式のサードパーティ製オープンソースプロジェクトです。**eBay Inc. との提携・認可・承認はありません。**

### どの AI アシスタントと MCP クライアントに対応していますか？

`npm run setup` が 9 つのクライアントを自動設定します：Claude Desktop、Cursor、Zed、Cline、Continue.dev、Windsurf、Roo Code、Claude Code CLI、Amazon Q Developer。MCP 対応のクライアントであれば接続できます。

### Claude、ChatGPT、Cursor で使えますか？

はい。Claude Desktop と Claude Code でそのまま動作し、Cursor やその他の MCP 対応 IDE、そして Model Context Protocol に対応するあらゆるアシスタントで利用できます。上のワンクリック設定プロンプトは ChatGPT や他のアシスタントでも機能します。

### インタラクティブなテーブルやチャートが表示されないのはなぜですか？

インタラクティブな [MCP Apps](#インタラクティブ-ui-mcp-apps) の表示は、その機能を通知するホスト（例：Claude）でのみ現れます。他のクライアントには同じデータがプレーンな JSON として返されます。あわせて、`EBAY_MCP_UI=off` を設定していないこと、そして表示がビルドされていること（`npm run build` が `build:ui` を実行します）を確認してください。

### eBay の API とツールはどれくらいカバーしていますか？

270 の固有エンドポイントにわたる 322 ツール — eBay Sell API の 100% です。

### 無料でオープンソースですか？

はい。[MIT ライセンス](LICENSE) で公開されています。

### ローカルで動作しますか、それともクラウドで動作しますか？

STDIO（またはローカル HTTP）経由で完全にあなたのマシン上で動作します。クラウド中継はありません — eBay の認証情報がコンピューターから外に出ることはありません。

### 始めるには何が必要ですか？

Node.js ≥ 18、無料の [eBay 開発者アカウント](https://developer.ebay.com/)（Client ID + Client Secret）、そして `npm run setup` の実行です。

### eBay API のレート制限はどれくらいですか？

クライアント認証情報（既定）で 1 日約 1000 リクエストです。OAuth でユーザートークンを使って認証すると、アカウント階層に応じて 1 日 10,000〜50,000 リクエストに引き上げられます。

### サンドボックスと本番の両方に対応していますか？

はい。`EBAY_ENVIRONMENT` 変数（`sandbox` または `production`）で切り替えます。

### 認証情報やデータは安全ですか？

認証情報はローカルの `.env` ファイルに保存され、eBay への直接呼び出しにのみ使用されます。[SECURITY.md](SECURITY.md) と [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md) を参照してください。

### eBay API を直接呼び出すのと何が違いますか？

AI アシスタントを通じて自然言語でやり取りします。OAuth トークン管理、バックオフ付きの自動リトライ、Zod による型安全な検証が組み込まれています。上の [比較表](#ebay-mcp-と素の-ebay-api) を参照してください。

### eBay のレガシー Trading API（XML）に対応していますか？

はい。固定価格出品の作成・修正・再出品・終了の操作が Trading API ツールでサポートされています。

### より高いレート制限を得るには？

`npm run setup` で OAuth フローを完了し、ユーザートークンで認証してください（既定の 1 千件ではなく 1 日 1 万〜5 万リクエスト）。

### 何で構築されていますか？

TypeScript と Node.js（ESM）で、公式の MCP SDK、検証用の Zod、OpenAPI から生成された型を使用しています。

### 最新バージョンへの更新方法は？

`npm install -g ebay-mcp@latest`（または `npm update -g ebay-mcp`）を実行してください。

### オフラインで動作しますか？

いいえ。「ローカルで動作」とはサーバープロセスがあなたのマシンで動くという意味で、eBay のライブ API に到達するにはインターネット接続と有効な認証情報が依然として必要です。

## 貢献する

貢献を歓迎します。フォーク → ブランチ作成 → テスト追加 → `npm run check && npm test` → [Conventional Commits](https://www.conventionalcommits.org/) でコミット → PR を作成。

- コードベースで作業中、またはコーディングエージェントを使用中ですか？ まず **[AGENTS.md](AGENTS.md)** から始めてください — ビルド/テストコマンド、モジュールマップ、エンドポイント追加のワークフロー。
- 完全なガイドライン：**[CONTRIBUTING.md](CONTRIBUTING.md)**。

## リソース

- [eBay 開発者ポータル](https://developer.ebay.com/) — API ドキュメントと認証情報
- [eBay API ライセンス契約](https://developer.ebay.com/join/api-license-agreement) — 規約とコンプライアンス
- [eBay データ取り扱い要件](https://developer.ebay.com/api-docs/static/data-handling-update.html) — データ保護とプライバシー
- [MCP ドキュメント](https://modelcontextprotocol.io/) — Model Context Protocol の仕様
- [OAuth クイックリファレンス](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes、トラブルシューティング、例
- [eBay API ステータス](https://developer.ebay.com/support/api-status) — 公式ステータスページ（`ebay_get_api_status` ツールおよび[リポジトリ内スナップショット](docs/API_STATUS.md)経由でも）
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [課題トラッカー](https://github.com/YosefHayim/ebay-mcp/issues) — バグ報告と機能リクエスト

## ライセンス

MIT — [LICENSE](LICENSE) を参照してください。

## コントリビューター

このプロジェクトの改善に協力してくださったすべての方に感謝します！🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="eBay MCP コントリビューター" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[このプロジェクトを支援する](https://www.buymeacoffee.com/yosefhayim)** · 作成者 [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>eBay MCP サーバー · eBay Sell API 向けの Model Context Protocol · Claude、Cursor、そしてあらゆる AI アシスタントを eBay の在庫・注文・マーケティング・分析に接続。</sub>

</div>
