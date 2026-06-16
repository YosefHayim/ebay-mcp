<!-- Keywords: eBay MCP-Server, Model Context Protocol für eBay, eBay-API für KI-Assistenten, eBay Sell API, eBay-Integration mit Claude, eBay mit Cursor, eBay-Bestandsautomatisierung, eBay-Auftragsverwaltung mit KI, eBay OAuth, eBay-Entwicklertools, MCP-Server für eBay -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="eBay MCP-Server — verbinde Claude, Cursor und jeden KI-Assistenten mit einem einzigen Befehl mit den Sell-APIs von eBay (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>Der eBay MCP-Server — gib Claude, Cursor und jedem KI-Assistenten vollen Zugriff auf die Sell-APIs von eBay. 322 Tools für Bestand, Bestellungen, Marketing und Analytik, lokal ausgeführt mit deinen eigenen Schlüsseln.</strong>
</p>

<p align="center"><sub>Inoffizielles Open-Source-Projekt — ohne Zugehörigkeit, Genehmigung oder Billigung durch eBay Inc.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="npm-Version" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="npm-Downloads pro Monat" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="CI-Status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="MIT-Lizenz" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="erforderliche Node.js-Version" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="TypeScript-Typen enthalten" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 eBay-API-Tools" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% Abdeckung der eBay Sell API" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="Model Context Protocol kompatibel" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="über 1000 bestandene Tests" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="läuft vollständig auf deinem Rechner" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="MseeP.ai-Sicherheitsbewertungs-Badge" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <strong>Deutsch</strong> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** ist ein lokaler [Model-Context-Protocol](https://modelcontextprotocol.io)-Server, der KI-Assistenten —Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code und Amazon Q— direkt mit den **Sell-APIs von eBay** verbindet. Er stellt **322 Tools** bereit, die **100% der eBay-Sell-API-Oberfläche** (270 eindeutige Endpunkte) abdecken — für Bestandsverwaltung, Auftragsabwicklung, Marketing mit beworbenen Angeboten, Analytik und Entwicklerwerkzeuge. Alles läuft auf deinem Rechner über STDIO oder lokales HTTP — **kein Cloud-Relay**, und deine eBay-Zugangsdaten verlassen niemals deinen Computer.

> **Haftungsausschluss:** Inoffizielles Drittanbieterprojekt — **ohne Zugehörigkeit zu oder Billigung durch eBay Inc.** Bereitgestellt „wie besehen“, ohne Gewährleistung. Du bist selbst dafür verantwortlich, die [eBay-API-Lizenzvereinbarung](https://developer.ebay.com/join/api-license-agreement) und die [Anforderungen an die Datenverarbeitung](https://developer.ebay.com/api-docs/static/data-handling-update.html) einzuhalten, deine Zugangsdaten zu schützen und die Ratenlimits einzuhalten. Teste im Sandbox-Modus vor dem Produktivbetrieb. Siehe [LICENSE](LICENSE), [SECURITY.md](SECURITY.md) und [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

## Inhaltsverzeichnis

- [Funktionen](#funktionen)
- [eBay MCP im Vergleich zur reinen eBay-API](#ebay-mcp-im-vergleich-zur-reinen-ebay-api)
- [KI-gestützte Einrichtung mit einem Klick](#ki-gestützte-einrichtung-mit-einem-klick)
- [Schnellstart](#schnellstart)
- [Demo](#demo)
- [Konfiguration](#konfiguration)
- [Verfügbare Tools](#verfügbare-tools)
- [Interaktive Oberfläche (MCP Apps) — Beta](#interaktive-oberfläche-mcp-apps)
- [Anwendungsbeispiele](#anwendungsbeispiele)
- [Protokollierung und Fehlerbehebung](#protokollierung-und-fehlerbehebung)
- [FAQ](#faq)
- [Mitwirken](#mitwirken)
- [Ressourcen](#ressourcen)
- [Lizenz](#lizenz)
- [Mitwirkende](#mitwirkende)

## Funktionen

- **322 eBay-API-Tools** — 100% Abdeckung der eBay-Sell-APIs für Bestand, Bestellungen, Marketing, Analytik, Metadaten, Taxonomie und Entwicklerwerkzeuge.
- **9 KI-Clients, automatisch konfiguriert** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI und Amazon Q Developer.
- **OAuth 2.0 integriert** — vollständige Verwaltung von Benutzer-Tokens mit automatischer Erneuerung und intelligentem Rückfall von Benutzer-Tokens (10k–50k Anfragen/Tag) auf Client-Zugangsdaten (1k Anfragen/Tag).
- **Standardmäßig robust** — automatischer Wiederholungsversuch mit exponentiellem Backoff bei `429`-Ratenlimits und konsistente, deutliche Fehlermeldungen.
- **Typsicher** — durchgängig TypeScript, mit Zod validierte Tool-Eingaben und aus OpenAPI generierte Typen.
- **Lokal und privat** — läuft über STDIO oder lokales HTTP; deine Zugangsdaten und Daten verlassen niemals deinen Rechner.
- **Sandbox und Produktion** — wechsle die Umgebung mit einer einzigen Variablen.
- **Einrichtung mit einem Befehl** — `npm run setup` konfiguriert Zugangsdaten, OAuth und deinen MCP-Client und öffnet automatisch den Browser für den OAuth-Ablauf.
- **Gut getestet** — über 1000 automatisierte Tests laufen bei jeder Änderung in der CI.

## eBay MCP im Vergleich zur reinen eBay-API

Beide sprechen mit denselben eBay-Endpunkten — der Unterschied ist alles, was du sonst selbst bauen müsstest.

| | **eBay MCP-Server** | **Reine eBay-REST-API** |
| --- | --- | --- |
| Schnittstelle | Natürliche Sprache über deinen KI-Assistenten | Handgeschriebene HTTP-Anfragen und JSON-Parsing |
| OAuth & Token-Erneuerung | Integriert, mit automatischer Erneuerung | Du implementierst und pflegst sie |
| Umgang mit Ratenlimits | Automatischer Wiederholungsversuch mit exponentiellem Backoff | Manuelle `429`-Behandlung und Backoff |
| Eingabevalidierung | Zod-Schemata + TypeScript-Typen für jedes Tool | Keine — du validierst deine eigenen Payloads |
| Einrichtung | Ein Assistent (`npm run setup`) | Auth, Header und Marketplace pro Aufruf |
| Unterstützung von KI-Clients | 9 Clients automatisch konfiguriert | Nicht zutreffend |
| API-Abdeckung | 322 Tools über 100% der Sell-APIs, einsatzbereit | Du baust jede Anfrage anhand der Doku selbst |
| Hosting | Läuft lokal, kein Cloud-Relay | Deine eigene Infrastruktur |

## KI-gestützte Einrichtung mit einem Klick

> **Lass deinen KI-Assistenten das für dich einrichten.** Kopiere den Prompt unten und füge ihn in Claude, ChatGPT oder einen beliebigen KI-Assistenten mit MCP-Unterstützung ein.

<details>
<summary><strong>Klicke, um den KI-Einrichtungs-Prompt zu kopieren</strong></summary>

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

## Schnellstart

### 1. eBay-Zugangsdaten besorgen

1. Erstelle ein kostenloses [eBay-Entwicklerkonto](https://developer.ebay.com/).
2. Generiere App-Schlüssel im [Entwicklerportal](https://developer.ebay.com/my/keys).
3. Speichere deine **Client ID** und dein **Client Secret**.

### 2. Installieren

```bash
npm install -g ebay-mcp            # von npm (empfohlen)
```

Oder aus dem Quellcode:

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. Den Einrichtungsassistenten ausführen

```bash
npm run setup
```

Der Assistent konfiguriert deine eBay-Zugangsdaten, richtet OAuth ein (für höhere Ratenlimits), erkennt und konfiguriert deinen MCP-Client automatisch und speichert alles automatisch.

### 4. Verwenden

Starte deinen MCP-Client (Claude Desktop usw.) neu und beginne, eBay über deinen KI-Assistenten zu verwalten.

<details>
<summary><strong>📸 Visuelle Einrichtungsanleitung (eBay-Entwicklerportal)</strong></summary>

<br />

Der Einrichtungsassistent (`npm run setup`) übernimmt OAuth automatisch. Hier findest du deine Zugangsdaten im eBay-Entwicklerportal:

**Schritt 1** — Kopiere im [Entwicklerportal](https://developer.ebay.com/my/keys) deine **App ID (Client ID)** und deine **Cert ID (Client Secret)**:

![Schritt 1 - Client ID und Client Secret aus dem eBay-Entwicklerportal kopieren](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**Schritt 2** — Kopiere in den **User Tokens**-Einstellungen deiner App den **RuName** (eBay-Weiterleitungs-URL):

![Schritt 2 - RuName-Weiterleitungs-URL aus den eBay-Anmeldeeinstellungen kopieren](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**Schritt 3** — Führe `npm run setup` aus. Es öffnet deinen Browser für die OAuth-Anmeldung und führt dich durch die eBay-Anmeldung:

![Schritt 3 - Während des von npm run setup gestarteten OAuth-Ablaufs bei eBay anmelden](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**Schritt 4** — Füge den Autorisierungscode aus der Callback-URL ein, wenn du dazu aufgefordert wirst:

![Schritt 4 - Autorisierungscode in den eBay-MCP-Einrichtungsassistenten einfügen](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

Der Assistent tauscht den Code gegen Tokens, speichert sie und konfiguriert deinen MCP-Client. Du hast nun eine Authentifizierung mit Benutzer-Token (10k–50k Anfragen/Tag statt der standardmäßigen 1k/Tag).

</details>

## Demo

Sieh dir den eBay MCP-Server in Aktion mit Claude Desktop an:

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## Konfiguration

> 📖 Die vollständige Referenz —jede Umgebungsvariable, jeder OAuth-Schritt und jeder Scope— steht im [Konfigurationsleitfaden](docs/auth/CONFIGURATION.md). `npm run setup` schreibt die `.env` für dich; die Variablen unten dienen nur als Referenz.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # oder "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # Standard-Marketplace (pro Tool überschreibbar)
EBAY_CONTENT_LANGUAGE=en-US         # Standard-Inhaltssprache der Anfragen
EBAY_USER_REFRESH_TOKEN=your_token  # für höhere Ratenlimits
EBAY_MCP_UI=on                      # interaktive MCP-Apps-Ansichten (Beta); auf "off" setzen, um reines JSON zu erzwingen
```

### Authentifizierung & Ratenlimits

| Modus                                   | Tageslimit            | Am besten für           | Einrichtung                          |
| --------------------------------------- | --------------------- | ----------------------- | ------------------------------------ |
| **Client-Zugangsdaten** (Standard)      | 1000 Anfragen/Tag     | Entwicklung, Tests      | Automatisch mit Client ID + Secret   |
| **Benutzer-Token** (empfohlen)          | 10k–50k Anfragen/Tag  | Produktion, hohe Last   | OAuth über `npm run setup`           |

Die Limits des Benutzer-Tokens variieren je nach Kontostufe (Individual 10k · Commercial 25k · Enterprise 50k+). Bei einem `429` wiederholt der Server die Anfrage mit exponentiellem Backoff und meldet den Fehler. Details im [Konfigurationsleitfaden](docs/auth/CONFIGURATION.md) und in der [OAuth-Kurzreferenz](docs/auth/OAUTH_QUICK_REFERENCE.md); die Nutzung kannst du im [Entwicklerportal](https://developer.ebay.com/my/api_usage) überwachen.

### MCP-Client-Kompatibilität

Automatisch konfiguriert durch `npm run setup`. Erfordert Node.js ≥ 18 und das MCP-Protokoll 1.0+ über STDIO (Standard) oder HTTP.

| Client                 | Plattform             | Konfigurationspfad                                                          |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | VS-Code-Erweiterung   | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | VS-Code-Erweiterung   | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | Terminal              | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## Verfügbare Tools

**322 Tools**, 100% Sell-API-Abdeckung, nach Kategorie geordnet. Jeder Link verweist auf die Tool-Definitionen und ihre Handler in [`src/tools/categories/`](src/tools/categories/):

| Kategorie | Was du tun kannst |
| --- | --- |
| [Account](src/tools/categories/account.ts) | Geschäfts-, Versand-, Zahlungs- und Rückgaberichtlinien; Programme; Abonnements; Verkaufssteuer |
| [Inventory](src/tools/categories/inventory.ts) | Bestandsartikel, Angebote, Standorte, Artikelgruppen, Massenvorgänge, SKU/Standort-Zuordnung |
| [Fulfillment](src/tools/categories/fulfillment.ts) | Bestellungen, Versand, Rückerstattungen, Streitfälle, Nachweise zu Zahlungsstreitfällen |
| [Marketing](src/tools/categories/marketing.ts) | Kampagnen für beworbene Angebote, Anzeigen, Aktionen, Gebote, Massenvorgänge |
| [Analytics](src/tools/categories/analytics.ts) | Traffic-Berichte, Verkäuferstandards, Kundenservice-Kennzahlen |
| [Communication](src/tools/categories/communication.ts) | Käufer-Verkäufer-Nachrichten, Verhandlungen, Benachrichtigungen, Bewertungen |
| [Metadata](src/tools/categories/metadata.ts) | Rückgaberichtlinien, Verkaufssteuer-Zuständigkeiten, Fahrzeugkompatibilität |
| [Taxonomy](src/tools/categories/taxonomy.ts) | Kategoriebäume, Artikelmerkmale, Artikelzustände |
| [Trading (Legacy-XML)](src/tools/categories/trading.ts) | Festpreisangebote erstellen, überarbeiten, neu einstellen und beenden |
| [Developer](src/tools/categories/developer.ts) | Ratenlimits, Signaturschlüssel, Client-Registrierung |
| [Token Management](src/tools/categories/token-management.ts) | OAuth-URL-Generierung und Token-Verwaltung |

**Beispiel-Tools:** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

Den vollständigen maschinenlesbaren Index findest du in [llms.txt](llms.txt).

## Interaktive Oberfläche (MCP Apps)

> **Beta** — diese Funktion ist neu und entwickelt sich gemeinsam mit der MCP-Apps-Spezifikation weiter, und die Host-Unterstützung wird gerade erst ausgerollt. Sie ist Opt-in und greift auf reines JSON zurück, sodass bestehende Clients niemals kaputtgehen. Schalte sie mit `EBAY_MCP_UI` um.

Auf Hosts, die [MCP Apps](https://modelcontextprotocol.io) unterstützen, stellen gängige Lese-Tools ihre Ergebnisse als interaktive Ansichten statt als reines JSON dar — eine sortierbare **Tabelle**, eine Detail-**Karte** oder ein **Diagramm** — und nutzen dabei das eigene Theme des Hosts. Überall sonst liefern dieselben Tools weiterhin reines JSON, sodass nichts kaputtgeht. Sie basiert auf dem [MCP Apps SDK (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps), der Erweiterung, mit der MCP-Server interaktive Oberflächen an dialogorientierte Clients ausliefern können.

- **Opt-in und Host-gesteuert.** Ansichten werden nur Clients angeboten, die die MCP-Apps-Fähigkeit ankündigen (z. B. Claude). Hosts ohne sie (z. B. Cursor) erhalten stillschweigend JSON.
- **Notausschalter.** Setze `EBAY_MCP_UI=off`, um überall reines JSON zu erzwingen, selbst auf fähigen Hosts.
- **Token-sparsam.** Das HTML jeder Ansicht wird vom Host einmalig außerhalb des Kontexts abgerufen (niemals in den Kontext des Modells); das Modell sieht nur eine einzeilige Zusammenfassung sowie die strukturierten Daten, die es ohnehin erhalten hätte.
- **Schreibgeschützt.** Ansichten lösen ausschließlich Lese-Tools aus (in eine Zeile eintauchen, blättern, aktualisieren) — sie verändern deine eBay-Daten niemals.

13 Tools für zentrale Arbeitsabläufe nehmen heute teil, über drei Archetypen hinweg:

| Archetyp | Tools |
| --- | --- |
| **Tabelle** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **Karte** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **Diagramm** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

Die Ansichten werden mit `npm run build` (oder `npm run build:ui`) zu eigenständigem HTML gebaut; sie sind im veröffentlichten Paket enthalten und laden ohne eigenen Netzwerkzugriff.

## Anwendungsbeispiele

Häufige Aufgaben, formuliert wie du sie deinem KI-Assistenten stellen würdest:

- **OAuth einrichten** — *„Hilf mir, OAuth für mein eBay-Konto einzurichten.“* → generiert eine Autorisierungs-URL über `ebay_get_oauth_url` und konfiguriert dann das Refresh-Token. Schaltet 10k–50k Anfragen/Tag frei.
- **Bestand verwalten** — *„Zeig mir alle meine aktiven Angebote.“* → `ebay_get_inventory_items` liefert SKUs, Mengen und Status.
- **Bestellungen bearbeiten** — *„Hol alle unerledigten Bestellungen der letzten 7 Tage.“* → `ebay_get_orders` mit Datums- und Versandstatus-Filtern.
- **Kampagnen erstellen** — *„Erstelle eine Kampagne für beworbene Angebote für Elektronik.“* → `ebay_create_campaign` und zugehörige Marketing-Tools.
- **Massenvorgänge** — *„Gewähre 10% Rabatt auf alle Artikel der Kategorie 'Vintage-Uhren'.“* → `ebay_get_inventory_items` + `ebay_update_offer` über die Treffer.

## Protokollierung und Fehlerbehebung

- **Protokollierung** — auf Winston basierend, nach stderr geschrieben (MCP-sicher), mit optionaler Dateiausgabe. Siehe [docs/logging.md](docs/logging.md).
- **Fehlerbehebung** — Server erscheint nicht, Authentifizierungsfehler, Ratenlimits, leere Ergebnisse. Beginne mit `npm run diagnose` und siehe dann [docs/troubleshooting.md](docs/troubleshooting.md).

## FAQ

### Was ist der eBay MCP-Server?

Ein lokaler [Model-Context-Protocol](https://modelcontextprotocol.io)-Server, der **322 Tools** bereitstellt, die **100% der Sell-APIs von eBay** (270 Endpunkte) für KI-Assistenten abdecken — Bestand, Auftragsabwicklung, Marketing, Analytik und Entwicklertools.

### Ist das ein offizielles eBay-Produkt?

Nein. Es ist ein inoffizielles Open-Source-Projekt eines Drittanbieters. Es ist **nicht mit eBay Inc. verbunden, von eBay autorisiert oder gebilligt.**

### Welche KI-Assistenten und MCP-Clients werden unterstützt?

`npm run setup` konfiguriert neun Clients automatisch: Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI und Amazon Q Developer. Jeder MCP-kompatible Client kann sich verbinden.

### Kann ich es mit Claude, ChatGPT oder Cursor verwenden?

Ja. Es funktioniert von Haus aus mit Claude Desktop und Claude Code, mit Cursor und anderen MCP-fähigen IDEs sowie mit jedem Assistenten, der das Model Context Protocol unterstützt. Der Ein-Klick-Einrichtungs-Prompt oben funktioniert auch mit ChatGPT und anderen Assistenten.

### Warum sehe ich die interaktiven Tabellen und Diagramme nicht?

Interaktive Ansichten via [MCP Apps](#interaktive-oberfläche-mcp-apps) erscheinen nur auf Hosts, die die Fähigkeit ankündigen (z. B. Claude); andere Clients erhalten dieselben Daten als reines JSON. Stelle außerdem sicher, dass du `EBAY_MCP_UI=off` nicht gesetzt hast und dass die Ansichten gebaut sind (`npm run build` führt `build:ui` aus).

### Wie viele eBay-APIs und Tools deckt es ab?

322 Tools über 270 eindeutige Endpunkte — 100% der Sell-APIs von eBay.

### Ist es kostenlos und Open Source?

Ja. Es wird unter der [MIT-Lizenz](LICENSE) veröffentlicht.

### Läuft es lokal oder in der Cloud?

Es läuft vollständig auf deinem Rechner über STDIO (oder lokales HTTP). Es gibt kein Cloud-Relay — deine eBay-Zugangsdaten verlassen niemals deinen Computer.

### Was brauche ich, um loszulegen?

Node.js ≥ 18, ein kostenloses [eBay-Entwicklerkonto](https://developer.ebay.com/) (Client ID + Client Secret) und dann `npm run setup`.

### Wie hoch sind die Ratenlimits der eBay-API?

Client-Zugangsdaten (Standard) erlauben etwa 1000 Anfragen/Tag. Die Authentifizierung mit einem Benutzer-Token über OAuth hebt dies je nach Kontostufe auf 10.000–50.000 Anfragen/Tag an.

### Unterstützt es sowohl Sandbox als auch Produktion?

Ja. Wechsle mit der Variablen `EBAY_ENVIRONMENT` (`sandbox` oder `production`).

### Sind meine Zugangsdaten und Daten sicher?

Zugangsdaten werden lokal in deiner `.env`-Datei gespeichert und nur verwendet, um eBay direkt aufzurufen. Siehe [SECURITY.md](SECURITY.md) und [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

### Worin unterscheidet es sich vom direkten Aufruf der eBay-API?

Du interagierst in natürlicher Sprache über deinen KI-Assistenten. OAuth-Token-Verwaltung, automatische Wiederholungen mit Backoff und typsichere Zod-Validierung sind integriert. Siehe die [Vergleichstabelle](#ebay-mcp-im-vergleich-zur-reinen-ebay-api) oben.

### Unterstützt es die alte Trading-API von eBay (XML)?

Ja. Das Erstellen, Überarbeiten, Neueinstellen und Beenden von Festpreisangeboten wird über die Trading-API-Tools unterstützt.

### Wie bekomme ich höhere Ratenlimits?

Schließe den OAuth-Ablauf mit `npm run setup` ab, um dich mit einem Benutzer-Token zu authentifizieren (10k–50k Anfragen/Tag statt der standardmäßigen 1k).

### Womit ist es gebaut?

TypeScript und Node.js (ESM), mit dem offiziellen MCP-SDK, Zod zur Validierung und aus OpenAPI generierten Typen.

### Wie aktualisiere ich auf die neueste Version?

Führe `npm install -g ebay-mcp@latest` (oder `npm update -g ebay-mcp`) aus.

### Funktioniert es offline?

Nein. „Läuft lokal“ bedeutet, dass der Serverprozess auf deinem Rechner läuft — er benötigt dennoch eine Internetverbindung und gültige Zugangsdaten, um die Live-APIs von eBay zu erreichen.

## Mitwirken

Beiträge sind willkommen. Forken → Branch erstellen → Tests hinzufügen → `npm run check && npm test` → mit [Conventional Commits](https://www.conventionalcommits.org/) committen → PR öffnen.

- Arbeitest du am Code oder mit einem Programmieragenten? Beginne mit **[AGENTS.md](AGENTS.md)** — Build-/Test-Befehle, Modulübersicht und der Ablauf zum Hinzufügen eines Endpunkts.
- Vollständiger Leitfaden: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Ressourcen

- [eBay-Entwicklerportal](https://developer.ebay.com/) — API-Dokumentation und Zugangsdaten
- [eBay-API-Lizenzvereinbarung](https://developer.ebay.com/join/api-license-agreement) — Bedingungen und Compliance
- [eBay-Anforderungen an die Datenverarbeitung](https://developer.ebay.com/api-docs/static/data-handling-update.html) — Datenschutz und Privatsphäre
- [MCP-Dokumentation](https://modelcontextprotocol.io/) — Spezifikation des Model Context Protocol
- [OAuth-Kurzreferenz](docs/auth/OAUTH_QUICK_REFERENCE.md) — Scopes, Fehlerbehebung, Beispiele
- [eBay-API-Status](https://developer.ebay.com/support/api-status) — offizielle Statusseite (auch über das Tool `ebay_get_api_status` und den [Snapshot im Repository](docs/API_STATUS.md))
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Issue-Tracker](https://github.com/YosefHayim/ebay-mcp/issues) — Fehlerberichte und Funktionswünsche

## Lizenz

MIT — siehe [LICENSE](LICENSE).

## Mitwirkende

Danke an alle, die geholfen haben, dieses Projekt zu verbessern! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="eBay-MCP-Mitwirkende" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[Dieses Projekt unterstützen](https://www.buymeacoffee.com/yosefhayim)** · Erstellt von [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>eBay MCP-Server · Model Context Protocol für die eBay-Sell-APIs · verbinde Claude, Cursor und jeden KI-Assistenten mit eBay-Bestand, -Bestellungen, -Marketing und -Analytik.</sub>

</div>
