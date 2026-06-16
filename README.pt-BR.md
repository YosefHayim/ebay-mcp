<!-- Keywords: servidor MCP do eBay, Model Context Protocol para eBay, API do eBay para assistentes de IA, eBay Sell API, integração do eBay com Claude, eBay com Cursor, automação de estoque do eBay, gestão de pedidos do eBay com IA, OAuth do eBay, ferramentas para desenvolvedores do eBay, servidor MCP para eBay -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="Servidor MCP do eBay — conecte o Claude, o Cursor e qualquer assistente de IA às Sell APIs do eBay com um único comando (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>O servidor MCP do eBay — dê ao Claude, ao Cursor e a qualquer assistente de IA acesso completo às Sell APIs do eBay. 322 ferramentas para estoque, pedidos, marketing e analytics, rodando localmente com suas próprias chaves.</strong>
</p>

<p align="center"><sub>Projeto de código aberto não oficial — sem afiliação, autorização ou endosso da eBay Inc.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="versão no npm" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="downloads mensais no npm" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="status do CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="licença MIT" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="versão do Node.js necessária" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="tipos do TypeScript incluídos" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 ferramentas da API do eBay" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% de cobertura da Sell API do eBay" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="compatível com o Model Context Protocol" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="mais de 1000 testes passando" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="roda inteiramente na sua máquina" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="Selo de avaliação de segurança da MseeP.ai" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <strong>Português (BR)</strong> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** é um servidor local do [Model Context Protocol](https://modelcontextprotocol.io) que conecta assistentes de IA —Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code e Amazon Q— diretamente às **Sell APIs do eBay**. Ele expõe **322 ferramentas** abrangendo **100% da superfície da Sell API do eBay** (270 endpoints únicos) para gestão de estoque, processamento de pedidos, marketing de anúncios patrocinados, analytics e ferramentas para desenvolvedores. Tudo roda na sua máquina via STDIO ou HTTP local — **sem relay na nuvem**, e suas credenciais do eBay nunca saem do seu computador.

> **Aviso legal:** Projeto não oficial de terceiros — **sem afiliação ou endosso da eBay Inc.** Fornecido "como está", sem garantia. Você é responsável por cumprir o [Contrato de licença da API do eBay](https://developer.ebay.com/join/api-license-agreement) e os [requisitos de tratamento de dados](https://developer.ebay.com/api-docs/static/data-handling-update.html), por manter suas credenciais seguras e por respeitar os limites de taxa. Teste no sandbox antes de ir para produção. Consulte [LICENSE](LICENSE), [SECURITY.md](SECURITY.md) e [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

## Índice

- [Recursos](#recursos)
- [eBay MCP vs. a API bruta do eBay](#ebay-mcp-vs-a-api-bruta-do-ebay)
- [Configuração com IA em um clique](#configuração-com-ia-em-um-clique)
- [Início rápido](#início-rápido)
- [Demonstração](#demonstração)
- [Configuração](#configuração)
- [Ferramentas disponíveis](#ferramentas-disponíveis)
- [Interface interativa (MCP Apps) — beta](#interface-interativa-mcp-apps)
- [Exemplos de uso](#exemplos-de-uso)
- [Logs e solução de problemas](#logs-e-solução-de-problemas)
- [Perguntas frequentes](#perguntas-frequentes)
- [Como contribuir](#como-contribuir)
- [Links úteis](#links-úteis)
- [Licença](#licença)
- [Colaboradores](#colaboradores)

## Recursos

- **322 ferramentas da API do eBay** — 100% de cobertura das Sell APIs do eBay em estoque, pedidos, marketing, analytics, metadados, taxonomia e ferramentas para desenvolvedores.
- **9 clientes de IA, autoconfigurados** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI e Amazon Q Developer.
- **OAuth 2.0 integrado** — gestão completa de tokens de usuário com renovação automática e fallback inteligente de tokens de usuário (10k–50k req/dia) para credenciais de cliente (1k req/dia).
- **Resiliente por padrão** — nova tentativa automática com recuo exponencial em limites de taxa `429` e exibição de erros clara e consistente.
- **Com segurança de tipos** — TypeScript de ponta a ponta, entradas de ferramentas validadas com Zod e tipos gerados a partir do OpenAPI.
- **Local e privado** — roda via STDIO ou HTTP local; suas credenciais e dados nunca saem da sua máquina.
- **Sandbox e produção** — troque de ambiente com uma única variável.
- **Configuração em um comando** — `npm run setup` configura credenciais, OAuth e seu cliente MCP, abrindo o navegador automaticamente para o fluxo OAuth.
- **Bem testado** — mais de 1000 testes automatizados rodam no CI a cada alteração.

## eBay MCP vs. a API bruta do eBay

Ambos falam com os mesmos endpoints do eBay — a diferença é tudo o que você teria que construir sozinho.

| | **Servidor MCP do eBay** | **API REST bruta do eBay** |
| --- | --- | --- |
| Interface | Linguagem natural pelo seu assistente de IA | Requisições HTTP escritas à mão e parsing de JSON |
| OAuth e renovação de tokens | Integrados, com renovação automática | Você implementa e mantém |
| Tratamento de limites de taxa | Nova tentativa automática com recuo exponencial | Tratamento manual de `429` e recuo |
| Validação de entradas | Esquemas Zod + tipos TypeScript em cada ferramenta | Nenhuma — você valida seus próprios payloads |
| Configuração | Um assistente (`npm run setup`) | Auth, cabeçalhos e marketplace por chamada |
| Suporte a clientes de IA | 9 clientes autoconfigurados | Não se aplica |
| Cobertura da API | 322 ferramentas em 100% das Sell APIs, prontas para usar | Você constrói cada requisição a partir da documentação |
| Hospedagem | Roda localmente, sem relay na nuvem | Sua própria infraestrutura |

## Configuração com IA em um clique

> **Deixe seu assistente de IA configurar para você.** Copie o prompt abaixo e cole no Claude, no ChatGPT ou em qualquer assistente de IA com suporte a MCP.

<details>
<summary><strong>Clique para copiar o prompt de configuração com IA</strong></summary>

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

## Início rápido

### 1. Obtenha credenciais do eBay

1. Crie uma [conta de desenvolvedor do eBay](https://developer.ebay.com/) gratuita.
2. Gere as chaves do aplicativo no [Portal do desenvolvedor](https://developer.ebay.com/my/keys).
3. Salve seu **Client ID** e seu **Client Secret**.

### 2. Instale

```bash
npm install -g ebay-mcp            # pelo npm (recomendado)
```

Ou a partir do código-fonte:

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. Rode o assistente de configuração

```bash
npm run setup
```

O assistente configura suas credenciais do eBay, estabelece o OAuth (para limites de taxa mais altos), detecta e configura automaticamente seu cliente MCP e salva tudo automaticamente.

### 4. Use

Reinicie seu cliente MCP (Claude Desktop, etc.) e comece a gerenciar o eBay pelo seu assistente de IA.

<details>
<summary><strong>📸 Guia visual de configuração (Portal do desenvolvedor do eBay)</strong></summary>

<br />

O assistente de configuração (`npm run setup`) cuida do OAuth automaticamente. Veja onde encontrar suas credenciais no Portal do desenvolvedor do eBay:

**Passo 1** — No [Portal do desenvolvedor](https://developer.ebay.com/my/keys), copie seu **App ID (Client ID)** e seu **Cert ID (Client Secret)**:

![Passo 1 - Copie o Client ID e o Client Secret do Portal do desenvolvedor do eBay](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**Passo 2** — Nas configurações de **User Tokens** do seu aplicativo, copie o **RuName** (URL de redirecionamento do eBay):

![Passo 2 - Copie a URL de redirecionamento RuName das configurações de login do eBay](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**Passo 3** — Rode `npm run setup`. Ele abre seu navegador para o login OAuth e guia você pelo acesso ao eBay:

![Passo 3 - Faça login no eBay durante o fluxo OAuth iniciado pelo npm run setup](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**Passo 4** — Cole o código de autorização da URL de retorno quando solicitado:

![Passo 4 - Cole o código de autorização no assistente de configuração do eBay MCP](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

O assistente troca o código por tokens, salva-os e configura seu cliente MCP. Agora você tem autenticação com token de usuário (10k–50k req/dia em vez das 1k/dia padrão).

</details>

## Demonstração

Veja o servidor MCP do eBay em ação com o Claude Desktop:

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## Configuração

> 📖 A referência completa —cada variável de ambiente, etapa do OAuth e escopo— está no [Guia de configuração](docs/auth/CONFIGURATION.md). `npm run setup` escreve o `.env` para você; as variáveis abaixo são apenas para referência.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # ou "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # marketplace padrão (substituível por ferramenta)
EBAY_CONTENT_LANGUAGE=en-US         # idioma de conteúdo padrão das requisições
EBAY_USER_REFRESH_TOKEN=your_token  # para limites de taxa mais altos
EBAY_MCP_UI=on                      # visualizações interativas MCP Apps (beta); defina "off" para forçar JSON puro
```

### Autenticação e limites de taxa

| Modo                                    | Limite diário      | Ideal para           | Configuração                      |
| --------------------------------------- | ------------------ | -------------------- | --------------------------------- |
| **Credenciais de cliente** (padrão)     | 1000 req/dia       | Desenvolvimento, teste | Automática com Client ID + Secret |
| **Token de usuário** (recomendado)      | 10k–50k req/dia    | Produção, alto volume | OAuth via `npm run setup`         |

Os limites do token de usuário variam conforme o nível da conta (Individual 10k · Comercial 25k · Enterprise 50k+). Em um `429`, o servidor tenta novamente com recuo exponencial e exibe o erro. Consulte o [Guia de configuração](docs/auth/CONFIGURATION.md) e a [Referência rápida do OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) para detalhes, e monitore o uso no [Portal do desenvolvedor](https://developer.ebay.com/my/api_usage).

### Compatibilidade de clientes MCP

Autoconfigurados pelo `npm run setup`. Requer Node.js ≥ 18 e o protocolo MCP 1.0+ via STDIO (padrão) ou HTTP.

| Cliente                | Plataforma            | Caminho de configuração                                                     |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | Extensão do VS Code   | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | Extensão do VS Code   | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | Terminal              | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## Ferramentas disponíveis

**322 ferramentas**, 100% de cobertura da Sell API, organizadas por categoria. Cada link aponta para as definições de ferramentas e seus handlers em [`src/tools/categories/`](src/tools/categories/):

| Categoria | O que você pode fazer |
| --- | --- |
| [Account](src/tools/categories/account.ts) | Políticas de negócio, envio, pagamento e devolução; programas; assinaturas; imposto sobre vendas |
| [Inventory](src/tools/categories/inventory.ts) | Itens de estoque, ofertas, locais, grupos de itens, operações em massa, mapeamento SKU/local |
| [Fulfillment](src/tools/categories/fulfillment.ts) | Pedidos, envio, reembolsos, disputas, evidências de disputas de pagamento |
| [Marketing](src/tools/categories/marketing.ts) | Campanhas de anúncios patrocinados, anúncios, promoções, lances, operações em massa |
| [Analytics](src/tools/categories/analytics.ts) | Relatórios de tráfego, padrões do vendedor, métricas de atendimento ao cliente |
| [Communication](src/tools/categories/communication.ts) | Mensagens comprador–vendedor, negociações, notificações, avaliações |
| [Metadata](src/tools/categories/metadata.ts) | Políticas de devolução, jurisdições de imposto sobre vendas, compatibilidade automotiva |
| [Taxonomy](src/tools/categories/taxonomy.ts) | Árvores de categorias, aspectos de itens, condições de itens |
| [Trading (XML legado)](src/tools/categories/trading.ts) | Criar, revisar, republicar e encerrar anúncios de preço fixo |
| [Developer](src/tools/categories/developer.ts) | Limites de taxa, chaves de assinatura, registro de clientes |
| [Token Management](src/tools/categories/token-management.ts) | Geração de URL de OAuth e gestão de tokens |

**Ferramentas de exemplo:** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

Para o índice completo legível por máquina, consulte [llms.txt](llms.txt).

## Interface interativa (MCP Apps)

> **Beta** — este recurso é novo e evolui junto com a especificação do MCP Apps, e o suporte dos hosts ainda está sendo lançado. É opcional (opt-in) e tem fallback para JSON puro, então nunca quebra clientes existentes. Ative ou desative com `EBAY_MCP_UI`.

Em hosts compatíveis com [MCP Apps](https://modelcontextprotocol.io), as ferramentas de leitura mais comuns exibem seus resultados como visualizações interativas em vez de JSON bruto — uma **tabela** ordenável, um **cartão** de detalhes ou um **gráfico** — usando o próprio tema do host. Em qualquer outro lugar, exatamente as mesmas ferramentas retornam JSON puro, então nada quebra. É construída sobre o [SDK oficial do MCP Apps (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps), a extensão que permite que servidores MCP entreguem interfaces interativas a clientes conversacionais.

- **Opt-in e condicionado ao host.** As visualizações só são anunciadas aos clientes que declaram a capacidade MCP Apps (por exemplo, o Claude). Hosts sem ela (por exemplo, o Cursor) recebem JSON silenciosamente.
- **Interruptor de desligamento.** Defina `EBAY_MCP_UI=off` para forçar JSON puro em todos os lugares, mesmo em hosts compatíveis.
- **Econômico em tokens.** O HTML de cada visualização é buscado uma única vez pelo host fora de banda (nunca entra no contexto do modelo); o modelo só vê um resumo de uma linha mais os dados estruturados que receberia de qualquer forma.
- **Somente leitura.** As visualizações só acionam ferramentas de leitura (detalhar uma linha, paginar, atualizar) — elas nunca alteram seus dados do eBay.

13 ferramentas de fluxos de trabalho essenciais adotam isso hoje, em três arquétipos:

| Arquétipo | Ferramentas |
| --- | --- |
| **Tabela** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **Cartão** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **Gráfico** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

As visualizações são compiladas em HTML autocontido com `npm run build` (ou `npm run build:ui`); elas são distribuídas no pacote publicado e carregam sem nenhum acesso à rede próprio.

## Exemplos de uso

Tarefas comuns, formuladas como você pediria ao seu assistente de IA:

- **Configurar OAuth** — *"Me ajude a configurar o OAuth para minha conta do eBay."* → gera uma URL de autorização via `ebay_get_oauth_url` e depois configura o refresh token. Desbloqueia 10k–50k req/dia.
- **Gerenciar estoque** — *"Mostre todos os meus anúncios ativos."* → `ebay_get_inventory_items` retorna SKUs, quantidades e status.
- **Processar pedidos** — *"Pegue todos os pedidos não atendidos dos últimos 7 dias."* → `ebay_get_orders` com filtros de data e status de envio.
- **Criar campanhas** — *"Crie uma campanha de anúncios patrocinados para eletrônicos."* → `ebay_create_campaign` e ferramentas de marketing relacionadas.
- **Operações em massa** — *"Aplique 10% de desconto a todos os itens de 'Relógios Vintage'."* → `ebay_get_inventory_items` + `ebay_update_offer` nas correspondências.

## Logs e solução de problemas

- **Logs** — baseados em Winston, gravados em stderr (seguro para MCP) com saída de arquivo opcional. Consulte [docs/logging.md](docs/logging.md).
- **Solução de problemas** — servidor não aparece, erros de autenticação, limites de taxa, resultados vazios. Comece com `npm run diagnose` e depois consulte [docs/troubleshooting.md](docs/troubleshooting.md).

## Perguntas frequentes

### O que é o servidor MCP do eBay?

Um servidor local do [Model Context Protocol](https://modelcontextprotocol.io) que expõe **322 ferramentas** cobrindo **100% das Sell APIs do eBay** (270 endpoints) para assistentes de IA — estoque, processamento de pedidos, marketing, analytics e ferramentas para desenvolvedores.

### Este é um produto oficial do eBay?

Não. É um projeto de código aberto de terceiros não oficial. **Não tem afiliação, autorização ou endosso da eBay Inc.**

### Quais assistentes de IA e clientes MCP são compatíveis?

`npm run setup` autoconfigura nove clientes: Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI e Amazon Q Developer. Qualquer cliente compatível com MCP pode se conectar.

### Posso usar com Claude, ChatGPT ou Cursor?

Sim. Funciona com Claude Desktop e Claude Code de forma nativa, com Cursor e outros IDEs com MCP, e com qualquer assistente que suporte o Model Context Protocol. O prompt de configuração em um clique acima também funciona com ChatGPT e outros assistentes.

### Por que não vejo as tabelas e os gráficos interativos?

As visualizações interativas do [MCP Apps](#interface-interativa-mcp-apps) só aparecem em hosts que declaram a capacidade (por exemplo, o Claude); outros clientes recebem os mesmos dados como JSON puro. Confirme também que você não definiu `EBAY_MCP_UI=off` e que as visualizações foram compiladas (`npm run build` executa `build:ui`).

### Quantas APIs e ferramentas do eBay ele cobre?

322 ferramentas em 270 endpoints únicos — 100% das Sell APIs do eBay.

### É gratuito e de código aberto?

Sim. É publicado sob a [licença MIT](LICENSE).

### Ele roda localmente ou na nuvem?

Roda inteiramente na sua máquina via STDIO (ou HTTP local). Não há relay na nuvem — suas credenciais do eBay nunca saem do seu computador.

### O que preciso para começar?

Node.js ≥ 18, uma [conta de desenvolvedor do eBay](https://developer.ebay.com/) gratuita (Client ID + Client Secret) e então rodar `npm run setup`.

### Quais são os limites de taxa da API do eBay?

As credenciais de cliente (padrão) permitem cerca de 1000 requisições/dia. Autenticar com um token de usuário via OAuth eleva isso para 10.000–50.000 requisições/dia, conforme o nível da sua conta.

### Ele suporta sandbox e produção?

Sim. Troque com a variável `EBAY_ENVIRONMENT` (`sandbox` ou `production`).

### Minhas credenciais e dados estão seguros?

As credenciais são armazenadas localmente no seu arquivo `.env` e usadas apenas para chamar o eBay diretamente. Consulte [SECURITY.md](SECURITY.md) e [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

### Qual a diferença em relação a chamar a API do eBay diretamente?

Você interage em linguagem natural pelo seu assistente de IA. Gestão de tokens OAuth, novas tentativas automáticas com recuo e validação com segurança de tipos via Zod já vêm integradas. Consulte a [tabela comparativa](#ebay-mcp-vs-a-api-bruta-do-ebay) acima.

### Ele suporta a antiga Trading API do eBay (XML)?

Sim. As operações de criar, revisar, republicar e encerrar anúncios de preço fixo são suportadas pelas ferramentas da Trading API.

### Como obtenho limites de taxa mais altos?

Conclua o fluxo OAuth com `npm run setup` para autenticar com um token de usuário (10k–50k req/dia em vez das 1k padrão).

### Com o que ele é construído?

TypeScript e Node.js (ESM), usando o SDK oficial do MCP, Zod para validação e tipos gerados a partir do OpenAPI.

### Como atualizo para a versão mais recente?

Rode `npm install -g ebay-mcp@latest` (ou `npm update -g ebay-mcp`).

### Funciona offline?

Não. "Roda localmente" significa que o processo do servidor é executado na sua máquina — ele ainda precisa de conexão com a internet e credenciais válidas para acessar as APIs ao vivo do eBay.

## Como contribuir

Contribuições são bem-vindas. Faça fork → crie um branch → adicione testes → `npm run check && npm test` → faça commit com [Conventional Commits](https://www.conventionalcommits.org/) → abra um PR.

- Trabalhando no código ou com um agente de programação? Comece pelo **[AGENTS.md](AGENTS.md)** — comandos de build/teste, mapa de módulos e o fluxo para adicionar um endpoint.
- Guia completo: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Links úteis

- [Portal do desenvolvedor do eBay](https://developer.ebay.com/) — documentação da API e credenciais
- [Contrato de licença da API do eBay](https://developer.ebay.com/join/api-license-agreement) — termos e conformidade
- [Requisitos de tratamento de dados do eBay](https://developer.ebay.com/api-docs/static/data-handling-update.html) — proteção de dados e privacidade
- [Documentação do MCP](https://modelcontextprotocol.io/) — especificação do Model Context Protocol
- [Referência rápida do OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) — escopos, solução de problemas, exemplos
- [Status da API do eBay](https://developer.ebay.com/support/api-status) — página de status oficial (também pela ferramenta `ebay_get_api_status` e pelo [snapshot no repositório](docs/API_STATUS.md))
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Rastreador de issues](https://github.com/YosefHayim/ebay-mcp/issues) — relatos de bugs e solicitações de recursos

## Licença

MIT — consulte [LICENSE](LICENSE).

## Colaboradores

Obrigado a todos que ajudaram a melhorar este projeto! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="Colaboradores do eBay MCP" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[Apoie este projeto](https://www.buymeacoffee.com/yosefhayim)** · Criado por [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>Servidor MCP do eBay · Model Context Protocol para as Sell APIs do eBay · conecte o Claude, o Cursor e qualquer assistente de IA ao estoque, pedidos, marketing e analytics do eBay.</sub>

</div>
