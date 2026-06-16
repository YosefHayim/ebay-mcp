<!-- Keywords: MCP-сервер eBay, Model Context Protocol для eBay, API eBay для ИИ-ассистентов, eBay Sell API, интеграция eBay с Claude, eBay с Cursor, автоматизация инвентаря eBay, управление заказами eBay через ИИ, OAuth eBay, инструменты разработчика eBay, MCP-сервер для eBay -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="MCP-сервер eBay — подключите Claude, Cursor и любой ИИ-ассистент к Sell API eBay одной командой (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>MCP-сервер eBay — дайте Claude, Cursor и любому ИИ-ассистенту полный доступ к Sell API eBay. 322 инструмента для инвентаря, заказов, маркетинга и аналитики, работающих локально с вашими собственными ключами.</strong>
</p>

<p align="center"><sub>Неофициальный проект с открытым исходным кодом — не связан с eBay Inc., не авторизован и не одобрен ею.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="версия в npm" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="загрузки npm в месяц" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="статус CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="лицензия MIT" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="требуемая версия Node.js" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="типы TypeScript включены" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 инструмента API eBay" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% покрытие Sell API eBay" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="совместим с Model Context Protocol" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="более 1000 пройденных тестов" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="работает полностью на вашей машине" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="Значок оценки безопасности MseeP.ai" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <strong>Русский</strong>
</p>

---

**eBay MCP** — это локальный сервер [Model Context Protocol](https://modelcontextprotocol.io), который подключает ИИ-ассистентов —Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code и Amazon Q— напрямую к **Sell API eBay**. Он предоставляет **322 инструмента**, охватывающих **100% поверхности Sell API eBay** (270 уникальных эндпоинтов): управление инвентарём, обработка заказов, маркетинг продвигаемых объявлений, аналитика и инструменты разработчика. Всё работает на вашей машине через STDIO или локальный HTTP — **без облачного ретранслятора**, и ваши учётные данные eBay никогда не покидают компьютер.

> **Отказ от ответственности:** Неофициальный сторонний проект — **не связан с eBay Inc. и не одобрен ею.** Предоставляется «как есть», без гарантий. Вы сами отвечаете за соблюдение [Лицензионного соглашения API eBay](https://developer.ebay.com/join/api-license-agreement) и [требований к обработке данных](https://developer.ebay.com/api-docs/static/data-handling-update.html), за сохранность учётных данных и за соблюдение лимитов запросов. Протестируйте в песочнице перед продакшеном. См. [LICENSE](LICENSE), [SECURITY.md](SECURITY.md) и [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

## Содержание

- [Возможности](#возможности)
- [eBay MCP против обычного API eBay](#ebay-mcp-против-обычного-api-ebay)
- [Настройка с помощью ИИ в один клик](#настройка-с-помощью-ии-в-один-клик)
- [Быстрый старт](#быстрый-старт)
- [Демонстрация](#демонстрация)
- [Конфигурация](#конфигурация)
- [Доступные инструменты](#доступные-инструменты)
- [Интерактивный интерфейс (MCP Apps) — бета](#интерактивный-интерфейс-mcp-apps)
- [Примеры использования](#примеры-использования)
- [Логирование и устранение неполадок](#логирование-и-устранение-неполадок)
- [Часто задаваемые вопросы](#часто-задаваемые-вопросы)
- [Участие в разработке](#участие-в-разработке)
- [Ресурсы](#ресурсы)
- [Лицензия](#лицензия)
- [Участники](#участники)

## Возможности

- **322 инструмента API eBay** — 100% покрытие Sell API eBay: инвентарь, заказы, маркетинг, аналитика, метаданные, таксономия и инструменты разработчика.
- **9 ИИ-клиентов с автонастройкой** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI и Amazon Q Developer.
- **Встроенный OAuth 2.0** — полное управление пользовательскими токенами с автоматическим обновлением и умным переходом от пользовательских токенов (10–50 тыс. запросов/день) к клиентским учётным данным (1 тыс. запросов/день).
- **Надёжность по умолчанию** — автоматический повтор с экспоненциальной задержкой при лимитах `429` и понятный, последовательный вывод ошибок.
- **Типобезопасность** — TypeScript от начала до конца, входные данные инструментов проверяются Zod, типы генерируются из OpenAPI.
- **Локально и приватно** — работает через STDIO или локальный HTTP; ваши учётные данные и данные никогда не покидают машину.
- **Песочница и продакшен** — переключайте окружение одной переменной.
- **Настройка одной командой** — `npm run setup` настраивает учётные данные, OAuth и ваш MCP-клиент, автоматически открывая браузер для потока OAuth.
- **Хорошо протестирован** — более 1000 автоматических тестов выполняются в CI при каждом изменении.

## eBay MCP против обычного API eBay

Оба обращаются к одним и тем же эндпоинтам eBay — разница в том, что иначе вам пришлось бы строить самому.

| | **MCP-сервер eBay** | **Обычный REST API eBay** |
| --- | --- | --- |
| Интерфейс | Естественный язык через ИИ-ассистента | HTTP-запросы вручную и разбор JSON |
| OAuth и обновление токенов | Встроены, с автоматическим обновлением | Вы реализуете и поддерживаете сами |
| Обработка лимитов | Автоматический повтор с экспоненциальной задержкой | Ручная обработка `429` и задержки |
| Валидация входных данных | Схемы Zod + типы TypeScript на каждом инструменте | Нет — вы проверяете свои полезные данные сами |
| Настройка | Один мастер (`npm run setup`) | Авторизация, заголовки и маркетплейс на каждый вызов |
| Поддержка ИИ-клиентов | 9 клиентов с автонастройкой | Неприменимо |
| Покрытие API | 322 инструмента на 100% Sell API, готовы к вызову | Вы строите каждый запрос по документации |
| Размещение | Работает локально, без облачного ретранслятора | Ваша собственная инфраструктура |

## Настройка с помощью ИИ в один клик

> **Пусть ваш ИИ-ассистент настроит всё за вас.** Скопируйте приведённый ниже промпт и вставьте его в Claude, ChatGPT или любой ИИ-ассистент с поддержкой MCP.

<details>
<summary><strong>Нажмите, чтобы скопировать промпт настройки с помощью ИИ</strong></summary>

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

## Быстрый старт

### 1. Получите учётные данные eBay

1. Создайте бесплатный [аккаунт разработчика eBay](https://developer.ebay.com/).
2. Сгенерируйте ключи приложения в [портале разработчика](https://developer.ebay.com/my/keys).
3. Сохраните свой **Client ID** и **Client Secret**.

### 2. Установите

```bash
npm install -g ebay-mcp            # из npm (рекомендуется)
```

Или из исходного кода:

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. Запустите мастер настройки

```bash
npm run setup
```

Мастер настраивает ваши учётные данные eBay, устанавливает OAuth (для более высоких лимитов), автоматически определяет и настраивает ваш MCP-клиент и сохраняет всё автоматически.

### 4. Используйте

Перезапустите ваш MCP-клиент (Claude Desktop и т. д.) и начните управлять eBay через ИИ-ассистента.

<details>
<summary><strong>📸 Визуальное руководство по настройке (портал разработчика eBay)</strong></summary>

<br />

Мастер настройки (`npm run setup`) обрабатывает OAuth автоматически. Вот где найти ваши учётные данные в портале разработчика eBay:

**Шаг 1** — В [портале разработчика](https://developer.ebay.com/my/keys) скопируйте свой **App ID (Client ID)** и **Cert ID (Client Secret)**:

![Шаг 1 - Скопируйте Client ID и Client Secret из портала разработчика eBay](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**Шаг 2** — В настройках **User Tokens** вашего приложения скопируйте **RuName** (URL перенаправления eBay):

![Шаг 2 - Скопируйте URL перенаправления RuName из настроек входа eBay](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**Шаг 3** — Запустите `npm run setup`. Он открывает браузер для входа через OAuth и проводит вас через вход в eBay:

![Шаг 3 - Войдите в eBay во время потока OAuth, запущенного npm run setup](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**Шаг 4** — Вставьте код авторизации из URL обратного вызова, когда появится запрос:

![Шаг 4 - Вставьте код авторизации в мастер настройки eBay MCP](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

Мастер обменивает код на токены, сохраняет их и настраивает ваш MCP-клиент. Теперь у вас аутентификация по пользовательскому токену (10–50 тыс. запросов/день вместо стандартной 1 тыс./день).

</details>

## Демонстрация

Посмотрите MCP-сервер eBay в действии с Claude Desktop:

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## Конфигурация

> 📖 Полный справочник —каждая переменная окружения, шаг OAuth и scope— находится в [руководстве по конфигурации](docs/auth/CONFIGURATION.md). `npm run setup` записывает `.env` за вас; переменные ниже приведены для справки.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # или "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # маркетплейс по умолчанию (переопределяется на уровне инструмента)
EBAY_CONTENT_LANGUAGE=en-US         # язык содержимого запросов по умолчанию
EBAY_USER_REFRESH_TOKEN=your_token  # для более высоких лимитов
EBAY_MCP_UI=on                      # интерактивные представления MCP Apps (бета); установите "off", чтобы принудительно выводить обычный JSON
```

### Аутентификация и лимиты запросов

| Режим                                       | Дневной лимит              | Лучше всего для         | Настройка                              |
| ------------------------------------------- | -------------------------- | ----------------------- | -------------------------------------- |
| **Клиентские учётные данные** (по умолчанию) | 1000 запросов/день         | Разработка, тестирование | Автоматически с Client ID + Secret     |
| **Пользовательский токен** (рекомендуется)  | 10–50 тыс. запросов/день   | Продакшен, высокая нагрузка | OAuth через `npm run setup`         |

Лимиты пользовательского токена зависят от уровня аккаунта (Individual 10 тыс. · Commercial 25 тыс. · Enterprise 50 тыс.+). При `429` сервер повторяет запрос с экспоненциальной задержкой и выводит ошибку. Подробности см. в [руководстве по конфигурации](docs/auth/CONFIGURATION.md) и [кратком справочнике по OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md), а использование отслеживайте в [портале разработчика](https://developer.ebay.com/my/api_usage).

### Совместимость MCP-клиентов

Автоматически настраиваются `npm run setup`. Требуется Node.js ≥ 18 и протокол MCP 1.0+ через STDIO (по умолчанию) или HTTP.

| Клиент                 | Платформа             | Путь к конфигурации                                                         |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | Расширение VS Code    | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | Расширение VS Code    | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | Терминал              | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## Доступные инструменты

**322 инструмента**, 100% покрытие Sell API, сгруппированы по категориям. Каждая ссылка ведёт к определениям инструментов и их обработчикам в [`src/tools/categories/`](src/tools/categories/):

| Категория | Что вы можете делать |
| --- | --- |
| [Account](src/tools/categories/account.ts) | Бизнес-, отгрузочные, платёжные и возвратные политики; программы; подписки; налог с продаж |
| [Inventory](src/tools/categories/inventory.ts) | Товары инвентаря, предложения, локации, группы товаров, массовые операции, сопоставление SKU/локации |
| [Fulfillment](src/tools/categories/fulfillment.ts) | Заказы, доставка, возвраты средств, споры, доказательства по платёжным спорам |
| [Marketing](src/tools/categories/marketing.ts) | Кампании продвигаемых объявлений, реклама, акции, ставки, массовые операции |
| [Analytics](src/tools/categories/analytics.ts) | Отчёты о трафике, стандарты продавца, метрики поддержки клиентов |
| [Communication](src/tools/categories/communication.ts) | Переписка покупатель–продавец, переговоры, уведомления, отзывы |
| [Metadata](src/tools/categories/metadata.ts) | Политики возврата, юрисдикции налога с продаж, автомобильная совместимость |
| [Taxonomy](src/tools/categories/taxonomy.ts) | Деревья категорий, характеристики товаров, состояния товаров |
| [Trading (устаревший XML)](src/tools/categories/trading.ts) | Создание, изменение, повторное размещение и завершение объявлений с фиксированной ценой |
| [Developer](src/tools/categories/developer.ts) | Лимиты запросов, ключи подписи, регистрация клиентов |
| [Token Management](src/tools/categories/token-management.ts) | Генерация URL OAuth и управление токенами |

**Примеры инструментов:** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

Полный машиночитаемый индекс см. в [llms.txt](llms.txt).

## Интерактивный интерфейс (MCP Apps)

> **Бета** — это новая возможность, которая развивается вместе со спецификацией MCP Apps, а поддержка на стороне хостов всё ещё внедряется. Она подключается по выбору и откатывается к обычному JSON, поэтому никогда не ломает существующих клиентов. Переключается переменной `EBAY_MCP_UI`.

На хостах с поддержкой [MCP Apps](https://modelcontextprotocol.io) распространённые инструменты чтения отображают свои результаты как интерактивные представления вместо «сырого» JSON — сортируемую **таблицу**, **карточку** с деталями или **график** — используя собственную тему хоста. Везде в остальных случаях те же самые инструменты возвращают обычный JSON, так что ничего не ломается. Он построен на официальном [MCP Apps SDK (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps) — расширении, которое позволяет MCP-серверам предоставлять интерактивный интерфейс диалоговым клиентам.

- **Подключение по выбору и контроль на стороне хоста.** Представления объявляются только тем клиентам, которые сообщают о поддержке возможности MCP Apps (например, Claude). Хосты без неё (например, Cursor) без лишних слов получают JSON.
- **Аварийный выключатель.** Установите `EBAY_MCP_UI=off`, чтобы принудительно выводить обычный JSON везде, даже на поддерживающих хостах.
- **Экономия токенов.** HTML каждого представления хост загружает один раз вне основного канала (никогда не в контекст модели); модель всегда видит только однострочное резюме и те же структурированные данные, которые она получила бы в любом случае.
- **Только для чтения.** Представления всегда запускают только инструменты чтения (углубиться в строку, перелистнуть страницу, обновить) — они никогда не изменяют ваши данные на eBay.

Сегодня подключены 13 инструментов основных рабочих процессов, разделённых на три архетипа:

| Архетип | Инструменты |
| --- | --- |
| **Таблица** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **Карточка** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **График** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

Представления собираются в самодостаточный HTML командой `npm run build` (или `npm run build:ui`); они входят в опубликованный пакет и загружаются без собственного доступа к сети.

## Примеры использования

Типичные задачи, сформулированные так, как вы попросили бы ИИ-ассистента:

- **Настроить OAuth** — *«Помоги мне настроить OAuth для моего аккаунта eBay.»* → генерирует URL авторизации через `ebay_get_oauth_url`, затем настраивает токен обновления. Разблокирует 10–50 тыс. запросов/день.
- **Управлять инвентарём** — *«Покажи все мои активные объявления.»* → `ebay_get_inventory_items` возвращает SKU, количества и статусы.
- **Обрабатывать заказы** — *«Получи все невыполненные заказы за последние 7 дней.»* → `ebay_get_orders` с фильтрами по дате и статусу выполнения.
- **Создавать кампании** — *«Создай кампанию продвигаемых объявлений для электроники.»* → `ebay_create_campaign` и связанные маркетинговые инструменты.
- **Массовые операции** — *«Примени скидку 10% ко всем товарам 'Винтажные часы'.»* → `ebay_get_inventory_items` + `ebay_update_offer` по совпадениям.

## Логирование и устранение неполадок

- **Логирование** — на основе Winston, пишется в stderr (безопасно для MCP) с опциональным выводом в файл. См. [docs/logging.md](docs/logging.md).
- **Устранение неполадок** — сервер не появляется, ошибки аутентификации, лимиты запросов, пустые результаты. Начните с `npm run diagnose`, затем см. [docs/troubleshooting.md](docs/troubleshooting.md).

## Часто задаваемые вопросы

### Что такое MCP-сервер eBay?

Локальный сервер [Model Context Protocol](https://modelcontextprotocol.io), предоставляющий **322 инструмента**, охватывающих **100% Sell API eBay** (270 эндпоинтов), ИИ-ассистентам — инвентарь, обработка заказов, маркетинг, аналитика и инструменты разработчика.

### Это официальный продукт eBay?

Нет. Это неофициальный сторонний проект с открытым исходным кодом. Он **не связан с eBay Inc., не авторизован и не одобрен ею.**

### Какие ИИ-ассистенты и MCP-клиенты поддерживаются?

`npm run setup` автоматически настраивает девять клиентов: Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI и Amazon Q Developer. Подключиться может любой MCP-совместимый клиент.

### Можно ли использовать его с Claude, ChatGPT или Cursor?

Да. Он работает с Claude Desktop и Claude Code «из коробки», с Cursor и другими IDE с поддержкой MCP, а также с любым ассистентом, поддерживающим Model Context Protocol. Промпт настройки в один клик выше также работает с ChatGPT и другими ассистентами.

### Почему я не вижу интерактивные таблицы и графики?

Интерактивные представления [MCP Apps](#интерактивный-интерфейс-mcp-apps) появляются только на хостах, которые сообщают о поддержке этой возможности (например, Claude); другие клиенты получают те же данные в виде обычного JSON. Также убедитесь, что вы не установили `EBAY_MCP_UI=off` и что представления собраны (`npm run build` запускает `build:ui`).

### Сколько API и инструментов eBay он охватывает?

322 инструмента на 270 уникальных эндпоинтах — 100% Sell API eBay.

### Это бесплатно и с открытым исходным кодом?

Да. Распространяется под [лицензией MIT](LICENSE).

### Он работает локально или в облаке?

Полностью на вашей машине через STDIO (или локальный HTTP). Облачного ретранслятора нет — ваши учётные данные eBay никогда не покидают компьютер.

### Что нужно для начала работы?

Node.js ≥ 18, бесплатный [аккаунт разработчика eBay](https://developer.ebay.com/) (Client ID + Client Secret), затем запустите `npm run setup`.

### Каковы лимиты запросов API eBay?

Клиентские учётные данные (по умолчанию) позволяют около 1000 запросов/день. Аутентификация по пользовательскому токену через OAuth повышает это до 10 000–50 000 запросов/день в зависимости от уровня аккаунта.

### Поддерживает ли он и песочницу, и продакшен?

Да. Переключайтесь переменной `EBAY_ENVIRONMENT` (`sandbox` или `production`).

### В безопасности ли мои учётные данные и данные?

Учётные данные хранятся локально в вашем файле `.env` и используются только для прямых вызовов eBay. См. [SECURITY.md](SECURITY.md) и [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

### Чем это отличается от прямого вызова API eBay?

Вы взаимодействуете на естественном языке через ИИ-ассистента. Управление токенами OAuth, автоматические повторы с задержкой и типобезопасная валидация через Zod встроены. См. [таблицу сравнения](#ebay-mcp-против-обычного-api-ebay) выше.

### Поддерживает ли он устаревший Trading API eBay (XML)?

Да. Операции создания, изменения, повторного размещения и завершения объявлений с фиксированной ценой поддерживаются через инструменты Trading API.

### Как получить более высокие лимиты запросов?

Завершите поток OAuth с `npm run setup`, чтобы пройти аутентификацию по пользовательскому токену (10–50 тыс. запросов/день вместо стандартной 1 тыс.).

### На чём он построен?

TypeScript и Node.js (ESM), с официальным MCP SDK, Zod для валидации и типами, сгенерированными из OpenAPI.

### Как обновиться до последней версии?

Запустите `npm install -g ebay-mcp@latest` (или `npm update -g ebay-mcp`).

### Работает ли он офлайн?

Нет. «Работает локально» означает, что процесс сервера выполняется на вашей машине — ему по-прежнему нужны интернет-соединение и действительные учётные данные для доступа к рабочим API eBay.

## Участие в разработке

Будем рады вашему вкладу. Форк → ветка → добавьте тесты → `npm run check && npm test` → коммит по [Conventional Commits](https://www.conventionalcommits.org/) → откройте PR.

- Работаете над кодом или с программным агентом? Начните с **[AGENTS.md](AGENTS.md)** — команды сборки/тестов, карта модулей и процесс добавления эндпоинта.
- Полное руководство: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Ресурсы

- [Портал разработчика eBay](https://developer.ebay.com/) — документация API и учётные данные
- [Лицензионное соглашение API eBay](https://developer.ebay.com/join/api-license-agreement) — условия и соответствие требованиям
- [Требования к обработке данных eBay](https://developer.ebay.com/api-docs/static/data-handling-update.html) — защита данных и конфиденциальность
- [Документация MCP](https://modelcontextprotocol.io/) — спецификация Model Context Protocol
- [Краткий справочник по OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes, устранение неполадок, примеры
- [Статус API eBay](https://developer.ebay.com/support/api-status) — официальная страница статуса (также через инструмент `ebay_get_api_status` и [снимок в репозитории](docs/API_STATUS.md))
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Трекер задач](https://github.com/YosefHayim/ebay-mcp/issues) — сообщения об ошибках и запросы функций

## Лицензия

MIT — см. [LICENSE](LICENSE).

## Участники

Спасибо всем, кто помог улучшить этот проект! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="Участники eBay MCP" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[Поддержать проект](https://www.buymeacoffee.com/yosefhayim)** · Создано [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>MCP-сервер eBay · Model Context Protocol для Sell API eBay · подключите Claude, Cursor и любой ИИ-ассистент к инвентарю, заказам, маркетингу и аналитике eBay.</sub>

</div>
