<!-- Keywords: eBay MCP 서버, eBay용 Model Context Protocol, AI 어시스턴트용 eBay API, eBay Sell API, eBay와 Claude 연동, eBay와 Cursor, eBay 재고 자동화, AI로 eBay 주문 관리, eBay OAuth, eBay 개발자 도구, eBay용 MCP 서버 -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="eBay MCP 서버 — 명령 한 번으로 Claude, Cursor 및 모든 AI 어시스턴트를 eBay의 Sell API에 연결 (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>eBay MCP 서버 — Claude, Cursor 및 모든 AI 어시스턴트에 eBay Sell API에 대한 완전한 접근 권한을. 재고, 주문, 마케팅, 분석을 위한 322개 도구를 자신의 키로 로컬에서 실행합니다.</strong>
</p>

<p align="center"><sub>비공식 오픈소스 프로젝트 — eBay Inc.와 제휴, 승인 또는 보증 관계가 없습니다.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="npm 버전" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="npm 월간 다운로드" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="CI 상태" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="MIT 라이선스" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="필요한 Node.js 버전" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="TypeScript 타입 포함" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322개 eBay API 도구" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="eBay Sell API 100% 커버리지" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="Model Context Protocol 호환" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="1,000개 이상의 테스트 통과" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="전적으로 사용자의 컴퓨터에서 실행" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="MseeP.ai 보안 평가 배지" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <strong>한국어</strong> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP**는 AI 어시스턴트 —Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code, Amazon Q— 를 **eBay의 Sell API**에 직접 연결하는 로컬 [Model Context Protocol](https://modelcontextprotocol.io) 서버입니다. **eBay Sell API 전체(고유 엔드포인트 270개)의 100%**를 포괄하는 **322개 도구**를 제공하여 재고 관리, 주문 처리, 프로모션 광고 마케팅, 분석, 개발자 도구를 다룹니다. 모든 것은 STDIO 또는 로컬 HTTP를 통해 사용자의 컴퓨터에서 실행되며 — **클라우드 중계가 없고** — eBay 자격 증명은 절대 사용자의 컴퓨터를 벗어나지 않습니다.

> **면책 조항:** 비공식 서드파티 프로젝트로서 **eBay Inc.와 제휴하거나 보증받지 않습니다.** "있는 그대로" 제공되며 어떠한 보증도 없습니다. [eBay API 라이선스 계약](https://developer.ebay.com/join/api-license-agreement) 및 [데이터 처리 요건](https://developer.ebay.com/api-docs/static/data-handling-update.html) 준수, 자격 증명의 안전한 보관, 속도 제한 준수는 사용자의 책임입니다. 프로덕션 전에 샌드박스에서 테스트하세요. [LICENSE](LICENSE), [SECURITY.md](SECURITY.md), [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md)를 참조하세요.

## 목차

- [기능](#기능)
- [eBay MCP vs 순수 eBay API](#ebay-mcp-vs-순수-ebay-api)
- [AI 원클릭 설정](#ai-원클릭-설정)
- [빠른 시작](#빠른-시작)
- [데모](#데모)
- [구성](#구성)
- [사용 가능한 도구](#사용-가능한-도구)
- [대화형 UI (MCP Apps) — 베타](#대화형-ui-mcp-apps)
- [사용 예시](#사용-예시)
- [로깅 및 문제 해결](#로깅-및-문제-해결)
- [자주 묻는 질문](#자주-묻는-질문)
- [기여하기](#기여하기)
- [리소스](#리소스)
- [라이선스](#라이선스)
- [기여자](#기여자)

## 기능

- **322개 eBay API 도구** — 재고, 주문, 마케팅, 분석, 메타데이터, 분류체계, 개발자 도구 전반에서 eBay Sell API를 100% 커버.
- **9개 AI 클라이언트 자동 구성** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI, Amazon Q Developer.
- **OAuth 2.0 내장** — 사용자 토큰의 완전한 관리와 자동 갱신, 그리고 사용자 토큰(일 1만~5만 요청)에서 클라이언트 자격 증명(일 1천 요청)으로의 스마트 폴백.
- **기본적으로 견고함** — `429` 속도 제한 시 지수 백오프로 자동 재시도하고, 일관되고 명확하게 오류를 표시합니다.
- **타입 안전** — 엔드투엔드 TypeScript, Zod로 검증되는 도구 입력, OpenAPI에서 생성된 타입.
- **로컬 및 프라이빗** — STDIO 또는 로컬 HTTP로 실행되며, 자격 증명과 데이터가 컴퓨터를 벗어나지 않습니다.
- **샌드박스와 프로덕션** — 변수 하나로 환경을 전환합니다.
- **한 번의 명령으로 설정** — `npm run setup`이 자격 증명, OAuth, MCP 클라이언트를 구성하고 OAuth 플로우를 위해 브라우저를 자동으로 엽니다.
- **충분한 테스트** — 변경마다 1,000개 이상의 자동화 테스트가 CI에서 실행됩니다.

## eBay MCP vs 순수 eBay API

둘 다 동일한 eBay 엔드포인트와 통신합니다 — 차이는 그렇지 않으면 직접 만들어야 할 모든 것입니다.

| | **eBay MCP 서버** | **순수 eBay REST API** |
| --- | --- | --- |
| 인터페이스 | AI 어시스턴트를 통한 자연어 | 직접 작성한 HTTP 요청과 JSON 파싱 |
| OAuth 및 토큰 갱신 | 내장, 자동 갱신 | 직접 구현하고 유지보수 |
| 속도 제한 처리 | 지수 백오프로 자동 재시도 | `429`와 백오프 수동 처리 |
| 입력 검증 | 모든 도구에 Zod 스키마 + TypeScript 타입 | 없음 — 페이로드를 직접 검증 |
| 설정 | 단일 마법사(`npm run setup`) | 호출마다 인증, 헤더, 마켓플레이스 |
| AI 클라이언트 지원 | 9개 클라이언트 자동 구성 | 해당 없음 |
| API 커버리지 | Sell API 100%에 걸친 322개 도구, 바로 호출 가능 | 문서를 보고 각 요청을 직접 구성 |
| 호스팅 | 로컬 실행, 클라우드 중계 없음 | 자체 인프라 |

## AI 원클릭 설정

> **AI 어시스턴트가 대신 설정하게 하세요.** 아래 프롬프트를 복사하여 Claude, ChatGPT 또는 MCP를 지원하는 모든 AI 어시스턴트에 붙여넣으세요.

<details>
<summary><strong>클릭하여 AI 설정 프롬프트 복사</strong></summary>

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

## 빠른 시작

### 1. eBay 자격 증명 받기

1. 무료 [eBay 개발자 계정](https://developer.ebay.com/)을 만듭니다.
2. [개발자 포털](https://developer.ebay.com/my/keys)에서 애플리케이션 키를 생성합니다.
3. **Client ID**와 **Client Secret**을 저장합니다.

### 2. 설치

```bash
npm install -g ebay-mcp            # npm에서 (권장)
```

또는 소스에서:

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. 설정 마법사 실행

```bash
npm run setup
```

마법사는 eBay 자격 증명을 구성하고, OAuth를 설정하며(더 높은 속도 제한을 위해), MCP 클라이언트를 자동으로 감지·구성하고 모든 것을 자동으로 저장합니다.

### 4. 사용

MCP 클라이언트(Claude Desktop 등)를 재시작하고 AI 어시스턴트를 통해 eBay 관리를 시작하세요.

<details>
<summary><strong>📸 시각적 설정 가이드 (eBay 개발자 포털)</strong></summary>

<br />

설정 마법사(`npm run setup`)는 OAuth를 자동으로 처리합니다. eBay 개발자 포털에서 자격 증명을 찾는 위치는 다음과 같습니다:

**1단계** — [개발자 포털](https://developer.ebay.com/my/keys)에서 **App ID(Client ID)**와 **Cert ID(Client Secret)**를 복사합니다:

![1단계 - eBay 개발자 포털에서 Client ID와 Client Secret 복사](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**2단계** — 앱의 **User Tokens** 설정에서 **RuName**(eBay 리디렉션 URL)을 복사합니다:

![2단계 - eBay 로그인 설정에서 RuName 리디렉션 URL 복사](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**3단계** — `npm run setup`을 실행합니다. 브라우저가 열려 OAuth 로그인이 진행되고 eBay 로그인을 안내합니다:

![3단계 - npm run setup이 시작한 OAuth 플로우 중 eBay에 로그인](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**4단계** — 메시지가 표시되면 콜백 URL의 인증 코드를 붙여넣습니다:

![4단계 - eBay MCP 설정 마법사에 인증 코드 붙여넣기](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

마법사는 코드를 토큰으로 교환하여 저장하고 MCP 클라이언트를 구성합니다. 이제 사용자 토큰 인증(기본 일 1천 건 대신 일 1만~5만 요청)을 사용할 수 있습니다.

</details>

## 데모

Claude Desktop으로 eBay MCP 서버의 동작을 확인하세요:

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## 구성

> 📖 전체 레퍼런스 —모든 환경 변수, OAuth 단계, scope— 는 [구성 가이드](docs/auth/CONFIGURATION.md)에 있습니다. `npm run setup`이 `.env`를 작성해 줍니다. 아래 변수는 참고용입니다.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # 또는 "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # 기본 마켓플레이스 (도구별 재정의 가능)
EBAY_CONTENT_LANGUAGE=en-US         # 요청의 기본 콘텐츠 언어
EBAY_USER_REFRESH_TOKEN=your_token  # 더 높은 속도 제한용
EBAY_MCP_UI=on                      # 대화형 MCP Apps 보기(베타); 일반 JSON을 강제하려면 "off"로 설정
```

### 인증 및 속도 제한

| 모드                          | 일일 한도            | 적합한 용도         | 설정                              |
| ----------------------------- | -------------------- | ------------------- | --------------------------------- |
| **클라이언트 자격 증명**(기본) | 일 1000 요청         | 개발, 테스트        | Client ID + Secret으로 자동       |
| **사용자 토큰**(권장)         | 일 1만~5만 요청      | 프로덕션, 대용량    | `npm run setup`을 통한 OAuth      |

사용자 토큰 한도는 계정 등급에 따라 다릅니다(Individual 1만 · Commercial 2.5만 · Enterprise 5만+). `429`가 발생하면 서버는 지수 백오프로 재시도하고 오류를 표시합니다. 자세한 내용은 [구성 가이드](docs/auth/CONFIGURATION.md)와 [OAuth 빠른 참조](docs/auth/OAUTH_QUICK_REFERENCE.md)를 참조하고, 사용량은 [개발자 포털](https://developer.ebay.com/my/api_usage)에서 모니터링하세요.

### MCP 클라이언트 호환성

`npm run setup`으로 자동 구성됩니다. Node.js ≥ 18과 STDIO(기본) 또는 HTTP를 통한 MCP 프로토콜 1.0+가 필요합니다.

| 클라이언트             | 플랫폼                | 구성 경로                                                                   |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | VS Code 확장          | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | VS Code 확장          | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | 터미널                | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## 사용 가능한 도구

**322개 도구**, Sell API 100% 커버리지, 카테고리별로 구성. 각 링크는 [`src/tools/categories/`](src/tools/categories/)의 도구 정의와 핸들러를 가리킵니다:

| 카테고리 | 할 수 있는 일 |
| --- | --- |
| [Account](src/tools/categories/account.ts) | 비즈니스·배송·결제·반품 정책, 프로그램, 구독, 판매세 |
| [Inventory](src/tools/categories/inventory.ts) | 재고 항목, 오퍼, 위치, 항목 그룹, 일괄 작업, SKU/위치 매핑 |
| [Fulfillment](src/tools/categories/fulfillment.ts) | 주문, 배송, 환불, 분쟁, 결제 분쟁 증거 |
| [Marketing](src/tools/categories/marketing.ts) | 프로모션 광고 캠페인, 광고, 프로모션, 입찰, 일괄 작업 |
| [Analytics](src/tools/categories/analytics.ts) | 트래픽 보고서, 판매자 기준, 고객 서비스 지표 |
| [Communication](src/tools/categories/communication.ts) | 구매자–판매자 메시지, 협상, 알림, 피드백 |
| [Metadata](src/tools/categories/metadata.ts) | 반품 정책, 판매세 관할, 자동차 호환성 |
| [Taxonomy](src/tools/categories/taxonomy.ts) | 카테고리 트리, 항목 속성, 항목 상태 |
| [Trading(레거시 XML)](src/tools/categories/trading.ts) | 고정 가격 리스팅 생성, 수정, 재등록, 종료 |
| [Developer](src/tools/categories/developer.ts) | 속도 제한, 서명 키, 클라이언트 등록 |
| [Token Management](src/tools/categories/token-management.ts) | OAuth URL 생성 및 토큰 관리 |

**예시 도구:** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

전체 기계 판독 인덱스는 [llms.txt](llms.txt)를 참조하세요.

## 대화형 UI (MCP Apps)

> **베타** — 이 기능은 새로 추가되었으며 MCP Apps 사양과 함께 발전하고 있고, 호스트 지원도 아직 확대되는 중입니다. 옵트인 방식이며 일반 JSON으로 폴백하므로 기존 클라이언트를 절대 깨뜨리지 않습니다. `EBAY_MCP_UI`로 켜고 끌 수 있습니다.

[MCP Apps](https://modelcontextprotocol.io)를 지원하는 호스트에서는 일반적인 읽기 도구가 결과를 원시 JSON 대신 대화형 보기로 — 정렬 가능한 **테이블**, 상세 **카드**, 또는 **차트** — 호스트 자체 테마를 사용해 렌더링합니다. 그 외 모든 곳에서는 완전히 동일한 도구가 일반 JSON을 반환하므로 아무것도 깨지지 않습니다. 이 기능은 MCP 서버가 대화형 클라이언트에 대화형 UI를 제공할 수 있게 해주는 공식 확장인 [MCP Apps SDK (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps) 위에 구축되었습니다.

- **옵트인이며 호스트에 따라 제한됨.** 보기는 MCP Apps 기능을 알리는 클라이언트(예: Claude)에만 광고됩니다. 이를 지원하지 않는 호스트(예: Cursor)는 조용히 JSON을 받습니다.
- **킬 스위치.** `EBAY_MCP_UI=off`로 설정하면 지원하는 호스트에서도 모든 곳에서 일반 JSON을 강제합니다.
- **토큰 절약.** 각 보기의 HTML은 호스트가 한 번만 별도 경로로 가져오며(모델의 컨텍스트로는 절대 들어가지 않음), 모델은 한 줄 요약과 어차피 받았을 구조화된 데이터만 보게 됩니다.
- **읽기 전용.** 보기는 읽기 도구만 트리거하며(행 상세 보기, 페이지 이동, 새로 고침) — eBay 데이터를 절대 변경하지 않습니다.

오늘 기준 13개의 핵심 워크플로 도구가 세 가지 원형에 걸쳐 옵트인되어 있습니다:

| 원형 | 도구 |
| --- | --- |
| **테이블** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **카드** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **차트** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

보기는 `npm run build`(또는 `npm run build:ui`)로 자체 완결형 HTML로 빌드되며, 게시된 패키지에 포함되어 자체적인 네트워크 접근 없이 로드됩니다.

## 사용 예시

AI 어시스턴트에게 묻듯이 표현한 일반적인 작업:

- **OAuth 설정** — *"내 eBay 계정의 OAuth 설정을 도와줘."* → `ebay_get_oauth_url`로 인증 URL을 생성한 뒤 리프레시 토큰을 구성합니다. 일 1만~5만 요청을 해제합니다.
- **재고 관리** — *"내 활성 리스팅을 모두 보여줘."* → `ebay_get_inventory_items`가 SKU, 수량, 상태를 반환합니다.
- **주문 처리** — *"지난 7일간 미처리 주문을 모두 가져와줘."* → 날짜와 처리 상태 필터를 적용한 `ebay_get_orders`.
- **캠페인 생성** — *"전자제품용 프로모션 광고 캠페인을 만들어줘."* → `ebay_create_campaign` 및 관련 마케팅 도구.
- **일괄 작업** — *"'빈티지 시계' 항목 전체에 10% 할인을 적용해줘."* → 일치 항목에 `ebay_get_inventory_items` + `ebay_update_offer`.

## 로깅 및 문제 해결

- **로깅** — Winston 기반으로 stderr에 기록되며(MCP 안전), 선택적 파일 출력이 가능합니다. [docs/logging.md](docs/logging.md)를 참조하세요.
- **문제 해결** — 서버가 표시되지 않음, 인증 오류, 속도 제한, 빈 결과. 먼저 `npm run diagnose`를 실행한 뒤 [docs/troubleshooting.md](docs/troubleshooting.md)를 참조하세요.

## 자주 묻는 질문

### eBay MCP 서버란 무엇인가요?

AI 어시스턴트에 **eBay Sell API의 100%**(270개 엔드포인트)를 포괄하는 **322개 도구**를 제공하는 로컬 [Model Context Protocol](https://modelcontextprotocol.io) 서버입니다 — 재고, 주문 처리, 마케팅, 분석, 개발자 도구.

### 이것은 eBay 공식 제품인가요?

아니요. 비공식 서드파티 오픈소스 프로젝트입니다. **eBay Inc.와 제휴, 승인 또는 보증 관계가 없습니다.**

### 어떤 AI 어시스턴트와 MCP 클라이언트를 지원하나요?

`npm run setup`이 9개 클라이언트를 자동 구성합니다: Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI, Amazon Q Developer. MCP 호환 클라이언트라면 연결할 수 있습니다.

### Claude, ChatGPT, Cursor에서 사용할 수 있나요?

네. Claude Desktop과 Claude Code에서 기본 지원되고, Cursor 및 기타 MCP 지원 IDE, 그리고 Model Context Protocol을 지원하는 모든 어시스턴트에서 작동합니다. 위의 원클릭 설정 프롬프트는 ChatGPT 및 다른 어시스턴트에서도 작동합니다.

### 대화형 테이블과 차트가 보이지 않는 이유는 무엇인가요?

대화형 [MCP Apps](#대화형-ui-mcp-apps) 보기는 해당 기능을 알리는 호스트(예: Claude)에서만 나타나며, 다른 클라이언트는 동일한 데이터를 일반 JSON으로 받습니다. 또한 `EBAY_MCP_UI=off`로 설정하지 않았는지, 그리고 보기가 빌드되어 있는지(`npm run build`가 `build:ui`를 실행함) 확인하세요.

### eBay API와 도구를 얼마나 커버하나요?

270개 고유 엔드포인트에 걸친 322개 도구 — eBay Sell API의 100%입니다.

### 무료이고 오픈소스인가요?

네. [MIT 라이선스](LICENSE)로 배포됩니다.

### 로컬에서 실행되나요, 클라우드에서 실행되나요?

STDIO(또는 로컬 HTTP)를 통해 전적으로 사용자의 컴퓨터에서 실행됩니다. 클라우드 중계가 없으며 — eBay 자격 증명은 절대 컴퓨터를 벗어나지 않습니다.

### 시작하려면 무엇이 필요한가요?

Node.js ≥ 18, 무료 [eBay 개발자 계정](https://developer.ebay.com/)(Client ID + Client Secret), 그리고 `npm run setup` 실행입니다.

### eBay API 속도 제한은 어떻게 되나요?

클라이언트 자격 증명(기본)은 일 약 1000 요청을 허용합니다. OAuth로 사용자 토큰을 사용해 인증하면 계정 등급에 따라 일 10,000~50,000 요청으로 늘어납니다.

### 샌드박스와 프로덕션을 모두 지원하나요?

네. `EBAY_ENVIRONMENT` 변수(`sandbox` 또는 `production`)로 전환합니다.

### 내 자격 증명과 데이터는 안전한가요?

자격 증명은 로컬 `.env` 파일에 저장되어 eBay를 직접 호출하는 데만 사용됩니다. [SECURITY.md](SECURITY.md)와 [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md)를 참조하세요.

### eBay API를 직접 호출하는 것과 무엇이 다른가요?

AI 어시스턴트를 통해 자연어로 상호작용합니다. OAuth 토큰 관리, 백오프가 적용된 자동 재시도, Zod를 통한 타입 안전 검증이 내장되어 있습니다. 위의 [비교 표](#ebay-mcp-vs-순수-ebay-api)를 참조하세요.

### eBay의 레거시 Trading API(XML)를 지원하나요?

네. 고정 가격 리스팅의 생성, 수정, 재등록, 종료 작업이 Trading API 도구를 통해 지원됩니다.

### 더 높은 속도 제한은 어떻게 얻나요?

`npm run setup`으로 OAuth 플로우를 완료하여 사용자 토큰으로 인증하세요(기본 1천 대신 일 1만~5만 요청).

### 무엇으로 만들어졌나요?

TypeScript와 Node.js(ESM), 공식 MCP SDK, 검증용 Zod, OpenAPI에서 생성된 타입을 사용합니다.

### 최신 버전으로 어떻게 업데이트하나요?

`npm install -g ebay-mcp@latest`(또는 `npm update -g ebay-mcp`)를 실행하세요.

### 오프라인에서 작동하나요?

아니요. "로컬에서 실행"은 서버 프로세스가 사용자의 컴퓨터에서 실행된다는 의미이며, eBay의 라이브 API에 도달하려면 여전히 인터넷 연결과 유효한 자격 증명이 필요합니다.

## 기여하기

기여를 환영합니다. 포크 → 브랜치 생성 → 테스트 추가 → `npm run check && npm test` → [Conventional Commits](https://www.conventionalcommits.org/)로 커밋 → PR 열기.

- 코드베이스에서 작업하거나 코딩 에이전트를 사용하나요? **[AGENTS.md](AGENTS.md)**부터 시작하세요 — 빌드/테스트 명령, 모듈 맵, 엔드포인트 추가 워크플로.
- 전체 가이드라인: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## 리소스

- [eBay 개발자 포털](https://developer.ebay.com/) — API 문서 및 자격 증명
- [eBay API 라이선스 계약](https://developer.ebay.com/join/api-license-agreement) — 약관 및 컴플라이언스
- [eBay 데이터 처리 요건](https://developer.ebay.com/api-docs/static/data-handling-update.html) — 데이터 보호 및 개인정보
- [MCP 문서](https://modelcontextprotocol.io/) — Model Context Protocol 사양
- [OAuth 빠른 참조](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes, 문제 해결, 예시
- [eBay API 상태](https://developer.ebay.com/support/api-status) — 공식 상태 페이지(`ebay_get_api_status` 도구 및 [리포지토리 내 스냅샷](docs/API_STATUS.md)으로도 가능)
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [이슈 트래커](https://github.com/YosefHayim/ebay-mcp/issues) — 버그 신고 및 기능 요청

## 라이선스

MIT — [LICENSE](LICENSE)를 참조하세요.

## 기여자

이 프로젝트를 개선하는 데 도움을 주신 모든 분께 감사드립니다! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="eBay MCP 기여자" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[이 프로젝트 후원하기](https://www.buymeacoffee.com/yosefhayim)** · 제작자 [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>eBay MCP 서버 · eBay Sell API를 위한 Model Context Protocol · Claude, Cursor 및 모든 AI 어시스턴트를 eBay 재고, 주문, 마케팅, 분석에 연결.</sub>

</div>
