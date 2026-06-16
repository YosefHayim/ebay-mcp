<!-- Keywords: servidor MCP de eBay, Model Context Protocol para eBay, API de eBay para asistentes de IA, eBay Sell API, integración de eBay con Claude, eBay con Cursor, automatización de inventario de eBay, gestión de pedidos de eBay con IA, OAuth de eBay, herramientas para desarrolladores de eBay, servidor MCP para eBay -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="Servidor MCP de eBay — conecta Claude, Cursor y cualquier asistente de IA con las Sell APIs de eBay con un solo comando (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>El servidor MCP de eBay — da a Claude, Cursor y cualquier asistente de IA acceso completo a las Sell APIs de eBay. 322 herramientas para inventario, pedidos, marketing y analítica, ejecutándose localmente con tus propias claves.</strong>
</p>

<p align="center"><sub>Proyecto de código abierto no oficial — sin afiliación, autorización ni respaldo de eBay Inc.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="versión en npm" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="descargas mensuales en npm" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="estado de CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="licencia MIT" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="versión de Node.js requerida" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="tipos de TypeScript incluidos" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 herramientas de la API de eBay" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% de cobertura de la Sell API de eBay" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="compatible con el Model Context Protocol" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="más de 1000 pruebas que pasan" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="se ejecuta íntegramente en tu máquina" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="Insignia de evaluación de seguridad de MseeP.ai" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <strong>Español</strong> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** es un servidor local del [Model Context Protocol](https://modelcontextprotocol.io) que conecta asistentes de IA —Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code y Amazon Q— directamente con las **Sell APIs de eBay**. Expone **322 herramientas** que abarcan el **100% de la superficie de la Sell API de eBay** (270 endpoints únicos) para gestión de inventario, procesamiento de pedidos, marketing de anuncios promocionados, analítica y herramientas para desarrolladores. Todo se ejecuta en tu máquina mediante STDIO o HTTP local: **sin relé en la nube**, y tus credenciales de eBay nunca salen de tu equipo.

> **Aviso legal:** Proyecto no oficial de terceros — **sin afiliación ni respaldo de eBay Inc.** Se ofrece "tal cual", sin garantía. Eres responsable de cumplir con el [Acuerdo de licencia de la API de eBay](https://developer.ebay.com/join/api-license-agreement) y los [requisitos de manejo de datos](https://developer.ebay.com/api-docs/static/data-handling-update.html), de mantener tus credenciales seguras y de respetar los límites de tasa. Prueba en sandbox antes de pasar a producción. Consulta [LICENSE](LICENSE), [SECURITY.md](SECURITY.md) y [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

## Tabla de contenidos

- [Características](#características)
- [eBay MCP frente a la API de eBay sin procesar](#ebay-mcp-frente-a-la-api-de-ebay-sin-procesar)
- [Configuración con IA en un clic](#configuración-con-ia-en-un-clic)
- [Inicio rápido](#inicio-rápido)
- [Demostración](#demostración)
- [Configuración](#configuración)
- [Herramientas disponibles](#herramientas-disponibles)
- [Interfaz interactiva (MCP Apps) — beta](#interfaz-interactiva-mcp-apps)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Registro y solución de problemas](#registro-y-solución-de-problemas)
- [Preguntas frecuentes](#preguntas-frecuentes)
- [Contribuir](#contribuir)
- [Recursos](#recursos)
- [Licencia](#licencia)
- [Colaboradores](#colaboradores)

## Características

- **322 herramientas de la API de eBay** — 100% de cobertura de las Sell APIs de eBay en inventario, pedidos, marketing, analítica, metadatos, taxonomía y herramientas para desarrolladores.
- **9 clientes de IA, autoconfigurados** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI y Amazon Q Developer.
- **OAuth 2.0 integrado** — gestión completa de tokens de usuario con renovación automática y respaldo inteligente desde tokens de usuario (10k–50k solicitudes/día) a credenciales de cliente (1k solicitudes/día).
- **Resistente por defecto** — reintento automático con retroceso exponencial ante límites de tasa `429` y notificación de errores clara y coherente.
- **Con seguridad de tipos** — TypeScript de principio a fin, entradas de herramientas validadas con Zod y tipos generados a partir de OpenAPI.
- **Local y privado** — se ejecuta mediante STDIO o HTTP local; tus credenciales y datos nunca salen de tu máquina.
- **Sandbox y producción** — cambia de entorno con una sola variable.
- **Configuración con un solo comando** — `npm run setup` configura las credenciales, OAuth y tu cliente MCP, abriendo el navegador automáticamente para el flujo de OAuth.
- **Bien probado** — más de 1000 pruebas automatizadas se ejecutan en CI con cada cambio.

## eBay MCP frente a la API de eBay sin procesar

Ambos hablan con los mismos endpoints de eBay; la diferencia es todo lo que de otro modo tendrías que construir tú mismo.

| | **Servidor MCP de eBay** | **API REST de eBay sin procesar** |
| --- | --- | --- |
| Interfaz | Lenguaje natural a través de tu asistente de IA | Solicitudes HTTP escritas a mano y análisis de JSON |
| OAuth y renovación de tokens | Integrados, con renovación automática | Lo implementas y mantienes tú |
| Gestión de límites de tasa | Reintento automático con retroceso exponencial | Manejo manual de `429` y retroceso |
| Validación de entradas | Esquemas Zod + tipos de TypeScript en cada herramienta | Ninguna: validas tus propias cargas útiles |
| Configuración | Un asistente (`npm run setup`) | Auth, cabeceras y mercado por cada llamada |
| Compatibilidad con clientes de IA | 9 clientes autoconfigurados | No aplica |
| Cobertura de la API | 322 herramientas en el 100% de las Sell APIs, listas para usar | Construyes cada solicitud desde la documentación |
| Alojamiento | Se ejecuta localmente, sin relé en la nube | Tu propia infraestructura |

## Configuración con IA en un clic

> **Deja que tu asistente de IA lo configure por ti.** Copia el mensaje de abajo y pégalo en Claude, ChatGPT o cualquier asistente de IA con soporte para MCP.

<details>
<summary><strong>Haz clic para copiar el mensaje de configuración con IA</strong></summary>

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

## Inicio rápido

### 1. Obtén credenciales de eBay

1. Crea una [cuenta de desarrollador de eBay](https://developer.ebay.com/) gratuita.
2. Genera las claves de la aplicación en el [Portal de desarrolladores](https://developer.ebay.com/my/keys).
3. Guarda tu **Client ID** y tu **Client Secret**.

### 2. Instala

```bash
npm install -g ebay-mcp            # desde npm (recomendado)
```

O desde el código fuente:

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. Ejecuta el asistente de configuración

```bash
npm run setup
```

El asistente configura tus credenciales de eBay, establece OAuth (para límites de tasa más altos), detecta y configura automáticamente tu cliente MCP y lo guarda todo de forma automática.

### 4. Úsalo

Reinicia tu cliente MCP (Claude Desktop, etc.) y empieza a gestionar eBay a través de tu asistente de IA.

<details>
<summary><strong>📸 Guía visual de configuración (Portal de desarrolladores de eBay)</strong></summary>

<br />

El asistente de configuración (`npm run setup`) gestiona OAuth automáticamente. Aquí tienes dónde encontrar tus credenciales en el Portal de desarrolladores de eBay:

**Paso 1** — En el [Portal de desarrolladores](https://developer.ebay.com/my/keys), copia tu **App ID (Client ID)** y tu **Cert ID (Client Secret)**:

![Paso 1 - Copia el Client ID y el Client Secret desde el Portal de desarrolladores de eBay](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**Paso 2** — En los ajustes de **User Tokens** de tu aplicación, copia el **RuName** (URL de redirección de eBay):

![Paso 2 - Copia la URL de redirección RuName desde los ajustes de inicio de sesión de eBay](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**Paso 3** — Ejecuta `npm run setup`. Abre tu navegador para el inicio de sesión OAuth y te guía por el acceso a eBay:

![Paso 3 - Inicia sesión en eBay durante el flujo de OAuth iniciado por npm run setup](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**Paso 4** — Pega el código de autorización de la URL de retorno cuando se te solicite:

![Paso 4 - Pega el código de autorización en el asistente de configuración de eBay MCP](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

El asistente intercambia el código por tokens, los guarda y configura tu cliente MCP. Ahora tienes autenticación con token de usuario (10k–50k solicitudes/día en lugar de las 1k/día predeterminadas).

</details>

## Demostración

Mira el servidor MCP de eBay en acción con Claude Desktop:

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## Configuración

> 📖 La referencia completa —cada variable de entorno, paso de OAuth y scope— está en la [Guía de configuración](docs/auth/CONFIGURATION.md). `npm run setup` escribe el `.env` por ti; las variables de abajo son solo de referencia.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # o "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # mercado predeterminado (anulable por herramienta)
EBAY_CONTENT_LANGUAGE=en-US         # idioma de contenido predeterminado de las solicitudes
EBAY_USER_REFRESH_TOKEN=your_token  # para límites de tasa más altos
EBAY_MCP_UI=on                      # vistas interactivas MCP Apps (beta); pon "off" para forzar JSON simple
```

### Autenticación y límites de tasa

| Modo                                      | Límite diario           | Ideal para               | Configuración                     |
| ----------------------------------------- | ----------------------- | ------------------------ | --------------------------------- |
| **Credenciales de cliente** (por defecto) | 1000 solicitudes/día    | Desarrollo, pruebas      | Automática con Client ID + Secret |
| **Token de usuario** (recomendado)        | 10k–50k solicitudes/día | Producción, alto volumen | OAuth mediante `npm run setup`    |

Los límites del token de usuario varían según el nivel de cuenta (Individual 10k · Comercial 25k · Empresa 50k+). Ante un `429`, el servidor reintenta con retroceso exponencial y notifica el error. Consulta la [Guía de configuración](docs/auth/CONFIGURATION.md) y la [Referencia rápida de OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) para más detalles, y supervisa el uso en el [Portal de desarrolladores](https://developer.ebay.com/my/api_usage).

### Compatibilidad de clientes MCP

Autoconfigurados por `npm run setup`. Requiere Node.js ≥ 18 y el protocolo MCP 1.0+ mediante STDIO (predeterminado) o HTTP.

| Cliente                | Plataforma            | Ruta de configuración                                                       |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | Extensión de VS Code  | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | Extensión de VS Code  | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | Terminal              | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## Herramientas disponibles

**322 herramientas**, 100% de cobertura de la Sell API, organizadas por categoría. Cada enlace apunta a las definiciones de herramientas y a sus handlers en [`src/tools/categories/`](src/tools/categories/):

| Categoría | Lo que puedes hacer |
| --- | --- |
| [Account](src/tools/categories/account.ts) | Políticas de negocio, envío, pago y devolución; programas; suscripciones; impuesto sobre ventas |
| [Inventory](src/tools/categories/inventory.ts) | Artículos de inventario, ofertas, ubicaciones, grupos de artículos, operaciones masivas, mapeo SKU/ubicación |
| [Fulfillment](src/tools/categories/fulfillment.ts) | Pedidos, envíos, reembolsos, disputas, evidencias de disputas de pago |
| [Marketing](src/tools/categories/marketing.ts) | Campañas de anuncios promocionados, anuncios, promociones, pujas, operaciones masivas |
| [Analytics](src/tools/categories/analytics.ts) | Informes de tráfico, estándares de vendedor, métricas de atención al cliente |
| [Communication](src/tools/categories/communication.ts) | Mensajería comprador–vendedor, negociaciones, notificaciones, valoraciones |
| [Metadata](src/tools/categories/metadata.ts) | Políticas de devolución, jurisdicciones de impuesto sobre ventas, compatibilidad de automoción |
| [Taxonomy](src/tools/categories/taxonomy.ts) | Árboles de categorías, aspectos de artículos, condiciones de artículos |
| [Trading (XML heredado)](src/tools/categories/trading.ts) | Crear, revisar, volver a publicar y finalizar anuncios de precio fijo |
| [Developer](src/tools/categories/developer.ts) | Límites de tasa, claves de firma, registro de clientes |
| [Token Management](src/tools/categories/token-management.ts) | Generación de URL de OAuth y gestión de tokens |

**Herramientas de ejemplo:** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

Para el índice completo legible por máquina, consulta [llms.txt](llms.txt).

## Interfaz interactiva (MCP Apps)

> **Beta** — esta función es nueva y evoluciona junto con la especificación de MCP Apps, y la compatibilidad de los hosts aún se está desplegando. Es opcional y recurre a JSON simple, así que nunca rompe los clientes existentes. Actívala o desactívala con `EBAY_MCP_UI`.

En los hosts compatibles con [MCP Apps](https://modelcontextprotocol.io), las herramientas de lectura más habituales muestran sus resultados como vistas interactivas en lugar de JSON sin procesar —una **tabla** ordenable, una **ficha** de detalle o un **gráfico**— usando el propio tema del host. En cualquier otro lugar, esas mismas herramientas devuelven JSON simple, así que nada se rompe. Está construido sobre el [SDK de MCP Apps (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps), la extensión que permite a los servidores MCP ofrecer interfaces interactivas a los clientes conversacionales.

- **Opcional y supeditado al host.** Las vistas solo se anuncian a los clientes que declaran la capacidad de MCP Apps (p. ej. Claude). Los hosts que no la tienen (p. ej. Cursor) reciben JSON sin más.
- **Interruptor de emergencia.** Define `EBAY_MCP_UI=off` para forzar JSON simple en todas partes, incluso en hosts compatibles.
- **Eficiente en tokens.** El host obtiene el HTML de cada vista una sola vez y de forma externa (nunca entra en el contexto del modelo); el modelo solo ve un resumen de una línea más los datos estructurados que habría recibido de todos modos.
- **Solo lectura.** Las vistas únicamente activan herramientas de lectura (profundizar en una fila, paginar, actualizar): nunca modifican tus datos de eBay.

Hoy se acogen 13 herramientas de flujos de trabajo esenciales, repartidas en tres arquetipos:

| Arquetipo | Herramientas |
| --- | --- |
| **Tabla** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **Ficha** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **Gráfico** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

Las vistas se compilan en HTML autónomo con `npm run build` (o `npm run build:ui`); se incluyen en el paquete publicado y se cargan sin acceso de red propio.

## Ejemplos de uso

Tareas comunes, formuladas como se las pedirías a tu asistente de IA:

- **Configurar OAuth** — *"Ayúdame a configurar OAuth para mi cuenta de eBay."* → genera una URL de autorización mediante `ebay_get_oauth_url` y luego configura el token de renovación. Desbloquea 10k–50k solicitudes/día.
- **Gestionar inventario** — *"Muéstrame todos mis anuncios activos."* → `ebay_get_inventory_items` devuelve SKUs, cantidades y estado.
- **Procesar pedidos** — *"Obtén todos los pedidos sin completar de los últimos 7 días."* → `ebay_get_orders` con filtros de fecha y estado de envío.
- **Crear campañas** — *"Crea una campaña de anuncios promocionados para electrónica."* → `ebay_create_campaign` y herramientas de marketing relacionadas.
- **Operaciones masivas** — *"Aplica un 10% de descuento a todos los artículos de 'Relojes Vintage'."* → `ebay_get_inventory_items` + `ebay_update_offer` en las coincidencias.

## Registro y solución de problemas

- **Registro** — basado en Winston, escrito en stderr (seguro para MCP) con salida de archivo opcional. Consulta [docs/logging.md](docs/logging.md).
- **Solución de problemas** — el servidor no aparece, errores de autenticación, límites de tasa, resultados vacíos. Empieza con `npm run diagnose` y luego consulta [docs/troubleshooting.md](docs/troubleshooting.md).

## Preguntas frecuentes

### ¿Qué es el servidor MCP de eBay?

Un servidor local del [Model Context Protocol](https://modelcontextprotocol.io) que expone **322 herramientas** que cubren el **100% de las Sell APIs de eBay** (270 endpoints) a los asistentes de IA: inventario, procesamiento de pedidos, marketing, analítica y herramientas para desarrolladores.

### ¿Es un producto oficial de eBay?

No. Es un proyecto de código abierto de terceros no oficial. **No está afiliado, autorizado ni respaldado por eBay Inc.**

### ¿Qué asistentes de IA y clientes MCP son compatibles?

`npm run setup` autoconfigura nueve clientes: Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI y Amazon Q Developer. Cualquier cliente compatible con MCP puede conectarse.

### ¿Puedo usarlo con Claude, ChatGPT o Cursor?

Sí. Funciona con Claude Desktop y Claude Code de forma nativa, con Cursor y otros IDE con MCP, y con cualquier asistente que soporte el Model Context Protocol. El mensaje de configuración con un clic de arriba también funciona con ChatGPT y otros asistentes.

### ¿Por qué no veo las tablas y los gráficos interactivos?

Las vistas interactivas de [MCP Apps](#interfaz-interactiva-mcp-apps) solo aparecen en los hosts que declaran la capacidad (p. ej. Claude); los demás clientes reciben los mismos datos como JSON simple. Comprueba también que no hayas definido `EBAY_MCP_UI=off` y que las vistas estén compiladas (`npm run build` ejecuta `build:ui`).

### ¿Cuántas APIs y herramientas de eBay cubre?

322 herramientas en 270 endpoints únicos: el 100% de las Sell APIs de eBay.

### ¿Es gratuito y de código abierto?

Sí. Se publica bajo la [licencia MIT](LICENSE).

### ¿Se ejecuta localmente o en la nube?

Se ejecuta íntegramente en tu máquina mediante STDIO (o HTTP local). No hay relé en la nube: tus credenciales de eBay nunca salen de tu equipo.

### ¿Qué necesito para empezar?

Node.js ≥ 18, una [cuenta de desarrollador de eBay](https://developer.ebay.com/) gratuita (Client ID + Client Secret) y luego ejecutar `npm run setup`.

### ¿Cuáles son los límites de tasa de la API de eBay?

Las credenciales de cliente (predeterminadas) permiten unas 1000 solicitudes/día. Autenticarse con un token de usuario mediante OAuth lo eleva a 10 000–50 000 solicitudes/día según el nivel de tu cuenta.

### ¿Es compatible con sandbox y producción?

Sí. Cambia con la variable `EBAY_ENVIRONMENT` (`sandbox` o `production`).

### ¿Están seguros mis credenciales y datos?

Las credenciales se almacenan localmente en tu archivo `.env` y se usan solo para llamar a eBay directamente. Consulta [SECURITY.md](SECURITY.md) y [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

### ¿En qué se diferencia de llamar directamente a la API de eBay?

Interactúas en lenguaje natural a través de tu asistente de IA. La gestión de tokens OAuth, los reintentos automáticos con retroceso y la validación con seguridad de tipos mediante Zod están integrados. Consulta la [tabla comparativa](#ebay-mcp-frente-a-la-api-de-ebay-sin-procesar) de arriba.

### ¿Es compatible con la antigua Trading API de eBay (XML)?

Sí. Se admiten las operaciones de crear, revisar, volver a publicar y finalizar anuncios de precio fijo mediante las herramientas de la Trading API.

### ¿Cómo obtengo límites de tasa más altos?

Completa el flujo de OAuth con `npm run setup` para autenticarte con un token de usuario (10k–50k solicitudes/día en lugar de las 1k predeterminadas).

### ¿Con qué está construido?

TypeScript y Node.js (ESM), usando el SDK oficial de MCP, Zod para la validación y tipos generados a partir de OpenAPI.

### ¿Cómo actualizo a la última versión?

Ejecuta `npm install -g ebay-mcp@latest` (o `npm update -g ebay-mcp`).

### ¿Funciona sin conexión?

No. "Se ejecuta localmente" significa que el proceso del servidor corre en tu máquina, pero aún necesita conexión a internet y credenciales válidas para llegar a las APIs en vivo de eBay.

## Contribuir

Las contribuciones son bienvenidas. Haz fork → crea una rama → añade pruebas → `npm run check && npm test` → haz commit con [Conventional Commits](https://www.conventionalcommits.org/) → abre un PR.

- ¿Trabajas en el código o con un agente de programación? Empieza por **[AGENTS.md](AGENTS.md)** — comandos de compilación/pruebas, mapa de módulos y el flujo para añadir un endpoint.
- Guía completa: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Recursos

- [Portal de desarrolladores de eBay](https://developer.ebay.com/) — documentación de la API y credenciales
- [Acuerdo de licencia de la API de eBay](https://developer.ebay.com/join/api-license-agreement) — términos y cumplimiento
- [Requisitos de manejo de datos de eBay](https://developer.ebay.com/api-docs/static/data-handling-update.html) — protección de datos y privacidad
- [Documentación de MCP](https://modelcontextprotocol.io/) — especificación del Model Context Protocol
- [Referencia rápida de OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes, solución de problemas, ejemplos
- [Estado de la API de eBay](https://developer.ebay.com/support/api-status) — página de estado oficial (también mediante la herramienta `ebay_get_api_status` y la [instantánea en el repositorio](docs/API_STATUS.md))
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Gestor de incidencias](https://github.com/YosefHayim/ebay-mcp/issues) — informes de errores y solicitudes de funciones

## Licencia

MIT — consulta [LICENSE](LICENSE).

## Colaboradores

¡Gracias a todos los que han ayudado a mejorar este proyecto! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="Colaboradores de eBay MCP" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[Apoya este proyecto](https://www.buymeacoffee.com/yosefhayim)** · Creado por [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>Servidor MCP de eBay · Model Context Protocol para las Sell APIs de eBay · conecta Claude, Cursor y cualquier asistente de IA con el inventario, los pedidos, el marketing y la analítica de eBay.</sub>

</div>
