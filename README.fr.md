<!-- Keywords: serveur MCP eBay, Model Context Protocol pour eBay, API eBay pour assistants IA, eBay Sell API, intégration eBay Claude, eBay avec Cursor, automatisation de l'inventaire eBay, gestion des commandes eBay par IA, OAuth eBay, outils développeur eBay, serveur MCP pour eBay -->

<p align="center">
  <a href="https://github.com/YosefHayim/ebay-mcp"><img src="public/ebay-mcp-hero.png" alt="Serveur MCP eBay — connectez Claude, Cursor et n'importe quel assistant IA aux Sell APIs d'eBay en une seule commande (npm run setup)" width="820" /></a>
</p>

<p align="center">
  <strong>Le serveur MCP eBay — donnez à Claude, Cursor et tout assistant IA un accès complet aux Sell APIs d'eBay. 322 outils pour l'inventaire, les commandes, le marketing et l'analytique, le tout en local avec vos propres clés.</strong>
</p>

<p align="center"><sub>Projet open source non officiel — sans affiliation, autorisation ni approbation d'eBay Inc.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/v/ebay-mcp?logo=npm&color=cb3837" alt="version npm" /></a>
  <a href="https://www.npmjs.com/package/ebay-mcp"><img src="https://img.shields.io/npm/dm/ebay-mcp?logo=npm&color=cb3837" alt="téléchargements npm par mois" /></a>
  <a href="https://github.com/YosefHayim/ebay-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/YosefHayim/ebay-mcp/ci.yml?branch=main&logo=github&label=CI" alt="statut CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/ebay-mcp?color=blue" alt="licence MIT" /></a>
  <img src="https://img.shields.io/node/v/ebay-mcp?logo=node.js&color=339933" alt="version de Node.js requise" />
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="types TypeScript inclus" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/tools-322-8957e5?logo=ebay&logoColor=white" alt="322 outils de l'API eBay" />
  <img src="https://img.shields.io/badge/Sell%20API%20coverage-100%25-success" alt="100% de couverture de la Sell API d'eBay" />
  <img src="https://img.shields.io/badge/Model%20Context%20Protocol-compatible-000000" alt="compatible Model Context Protocol" />
  <img src="https://img.shields.io/badge/tests-1%2C000%2B%20passing-3fb950?logo=vitest&logoColor=white" alt="plus de 1000 tests réussis" />
  <img src="https://img.shields.io/badge/runs-100%25%20local-blue" alt="s'exécute entièrement sur votre machine" />
</p>

<p align="center">
  <a href="https://mseep.ai/app/yosefhayim-ebay-api-mcp-server"><img src="https://mseep.net/pr/yosefhayim-ebay-api-mcp-server-badge.png" alt="Badge d'évaluation de sécurité MseeP.ai" height="40" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (BR)</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <strong>Français</strong> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a>
</p>

---

**eBay MCP** est un serveur local du [Model Context Protocol](https://modelcontextprotocol.io) qui connecte les assistants IA —Claude Desktop, Claude Code, Cursor, Cline, Windsurf, Zed, Continue.dev, Roo Code et Amazon Q— directement aux **Sell APIs d'eBay**. Il expose **322 outils** couvrant **100% de la surface de la Sell API d'eBay** (270 endpoints uniques) pour la gestion de l'inventaire, le traitement des commandes, le marketing d'annonces sponsorisées, l'analytique et l'outillage développeur. Tout s'exécute sur votre machine via STDIO ou HTTP local — **sans relais cloud**, et vos identifiants eBay ne quittent jamais votre ordinateur.

> **Avertissement :** Projet tiers non officiel — **sans affiliation ni approbation d'eBay Inc.** Fourni « tel quel », sans garantie. Il vous incombe de respecter l'[Accord de licence de l'API eBay](https://developer.ebay.com/join/api-license-agreement) et les [exigences de traitement des données](https://developer.ebay.com/api-docs/static/data-handling-update.html), de protéger vos identifiants et de respecter les limites de débit. Testez en sandbox avant la production. Voir [LICENSE](LICENSE), [SECURITY.md](SECURITY.md) et [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [eBay MCP face à l'API brute d'eBay](#ebay-mcp-face-à-lapi-brute-debay)
- [Configuration assistée par IA en un clic](#configuration-assistée-par-ia-en-un-clic)
- [Démarrage rapide](#démarrage-rapide)
- [Démonstration](#démonstration)
- [Configuration](#configuration)
- [Outils disponibles](#outils-disponibles)
- [Interface interactive (MCP Apps) — bêta](#interface-interactive-mcp-apps)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Journalisation et dépannage](#journalisation-et-dépannage)
- [FAQ](#faq)
- [Contribuer](#contribuer)
- [Ressources](#ressources)
- [Licence](#licence)
- [Contributeurs](#contributeurs)

## Fonctionnalités

- **322 outils de l'API eBay** — 100% de couverture des Sell APIs d'eBay pour l'inventaire, les commandes, le marketing, l'analytique, les métadonnées, la taxonomie et l'outillage développeur.
- **9 clients IA, configurés automatiquement** — Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI et Amazon Q Developer.
- **OAuth 2.0 intégré** — gestion complète des jetons utilisateur avec renouvellement automatique et bascule intelligente des jetons utilisateur (10k–50k req/jour) vers les identifiants client (1k req/jour).
- **Résilient par défaut** — nouvelle tentative automatique avec recul exponentiel sur les limites de débit `429` et remontée d'erreurs claire et cohérente.
- **Typage sûr** — TypeScript de bout en bout, entrées d'outils validées par Zod et types générés à partir d'OpenAPI.
- **Local et privé** — s'exécute via STDIO ou HTTP local ; vos identifiants et données ne quittent jamais votre machine.
- **Sandbox et production** — changez d'environnement avec une seule variable.
- **Configuration en une commande** — `npm run setup` configure les identifiants, OAuth et votre client MCP, en ouvrant automatiquement le navigateur pour le flux OAuth.
- **Bien testé** — plus de 1000 tests automatisés s'exécutent en CI à chaque changement.

## eBay MCP face à l'API brute d'eBay

Les deux dialoguent avec les mêmes endpoints eBay — la différence, c'est tout ce que vous auriez sinon à construire vous-même.

| | **Serveur MCP eBay** | **API REST brute d'eBay** |
| --- | --- | --- |
| Interface | Langage naturel via votre assistant IA | Requêtes HTTP écrites à la main et analyse JSON |
| OAuth et renouvellement des jetons | Intégrés, avec renouvellement automatique | Vous les implémentez et les maintenez |
| Gestion des limites de débit | Nouvelle tentative automatique avec recul exponentiel | Gestion manuelle des `429` et du recul |
| Validation des entrées | Schémas Zod + types TypeScript sur chaque outil | Aucune — vous validez vos propres charges utiles |
| Configuration | Un assistant (`npm run setup`) | Auth, en-têtes et marketplace par appel |
| Prise en charge des clients IA | 9 clients configurés automatiquement | Sans objet |
| Couverture de l'API | 322 outils sur 100% des Sell APIs, prêts à l'emploi | Vous construisez chaque requête depuis la documentation |
| Hébergement | S'exécute en local, sans relais cloud | Votre propre infrastructure |

## Configuration assistée par IA en un clic

> **Laissez votre assistant IA la configurer pour vous.** Copiez l'invite ci-dessous et collez-la dans Claude, ChatGPT ou tout assistant IA prenant en charge MCP.

<details>
<summary><strong>Cliquez pour copier l'invite de configuration assistée par IA</strong></summary>

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

## Démarrage rapide

### 1. Obtenez des identifiants eBay

1. Créez un [compte développeur eBay](https://developer.ebay.com/) gratuit.
2. Générez les clés d'application dans le [Portail développeur](https://developer.ebay.com/my/keys).
3. Enregistrez votre **Client ID** et votre **Client Secret**.

### 2. Installez

```bash
npm install -g ebay-mcp            # depuis npm (recommandé)
```

Ou depuis les sources :

```bash
git clone https://github.com/YosefHayim/ebay-mcp.git
cd ebay-mcp && npm install && npm run build
```

### 3. Lancez l'assistant de configuration

```bash
npm run setup
```

L'assistant configure vos identifiants eBay, met en place OAuth (pour des limites de débit plus élevées), détecte et configure automatiquement votre client MCP, et enregistre tout automatiquement.

### 4. Utilisez

Redémarrez votre client MCP (Claude Desktop, etc.) et commencez à gérer eBay via votre assistant IA.

<details>
<summary><strong>📸 Guide visuel de configuration (Portail développeur eBay)</strong></summary>

<br />

L'assistant de configuration (`npm run setup`) gère OAuth automatiquement. Voici où trouver vos identifiants dans le Portail développeur eBay :

**Étape 1** — Dans le [Portail développeur](https://developer.ebay.com/my/keys), copiez votre **App ID (Client ID)** et votre **Cert ID (Client Secret)** :

![Étape 1 - Copiez le Client ID et le Client Secret depuis le Portail développeur eBay](public/screenshot-guides/STEP%20-%201%20-%20COPY%20CLIENT%20ID%20AND%20CLIENT%20SECRET%20TO%20ENV%20FILE.png)

**Étape 2** — Dans les paramètres **User Tokens** de votre application, copiez le **RuName** (URL de redirection eBay) :

![Étape 2 - Copiez l'URL de redirection RuName depuis les paramètres de connexion eBay](public/screenshot-guides/STEP%20-%202%20-%20COPY%20REDIRECT%20URL.png)

**Étape 3** — Lancez `npm run setup`. Il ouvre votre navigateur pour la connexion OAuth et vous guide dans la connexion à eBay :

![Étape 3 - Connectez-vous à eBay pendant le flux OAuth lancé par npm run setup](public/screenshot-guides/STEP%203%20-%20RUN%20COMMAND%20NPM%20RUN%20SETUP%20AND%20PREFORM%20OAUTH%20LOGIN.png)

**Étape 4** — Collez le code d'autorisation depuis l'URL de rappel lorsqu'on vous le demande :

![Étape 4 - Collez le code d'autorisation dans l'assistant de configuration eBay MCP](public/screenshot-guides/STEP%20-%204%20-%20PASTE%20INTO%20THE%20SETUP%20WIZARD.png)

L'assistant échange le code contre des jetons, les enregistre et configure votre client MCP. Vous disposez maintenant d'une authentification par jeton utilisateur (10k–50k requêtes/jour au lieu des 1k/jour par défaut).

</details>

## Démonstration

Découvrez le serveur MCP eBay en action avec Claude Desktop :

https://github.com/user-attachments/assets/0173c8df-221c-4943-a4ce-cd20bce79f4b

## Configuration

> 📖 La référence complète —chaque variable d'environnement, étape OAuth et scope— se trouve dans le [Guide de configuration](docs/auth/CONFIGURATION.md). `npm run setup` écrit le `.env` pour vous ; les variables ci-dessous sont fournies à titre de référence.

```bash
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
EBAY_ENVIRONMENT=sandbox            # ou "production"
EBAY_REDIRECT_URI=your_runame
EBAY_MARKETPLACE_ID=EBAY_US         # marketplace par défaut (modifiable par outil)
EBAY_CONTENT_LANGUAGE=en-US         # langue de contenu par défaut des requêtes
EBAY_USER_REFRESH_TOKEN=your_token  # pour des limites de débit plus élevées
EBAY_MCP_UI=on                      # vues interactives MCP Apps (bêta) ; mettez "off" pour forcer le JSON brut
```

### Authentification et limites de débit

| Mode                                    | Limite quotidienne   | Idéal pour              | Configuration                       |
| --------------------------------------- | -------------------- | ----------------------- | ----------------------------------- |
| **Identifiants client** (par défaut)    | 1000 req/jour        | Développement, tests    | Automatique avec Client ID + Secret |
| **Jeton utilisateur** (recommandé)      | 10k–50k req/jour     | Production, gros volume | OAuth via `npm run setup`           |

Les limites du jeton utilisateur varient selon le niveau de compte (Individuel 10k · Commercial 25k · Entreprise 50k+). En cas de `429`, le serveur réessaie avec un recul exponentiel et remonte l'erreur. Consultez le [Guide de configuration](docs/auth/CONFIGURATION.md) et la [Référence rapide OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) pour les détails, et surveillez l'utilisation dans le [Portail développeur](https://developer.ebay.com/my/api_usage).

### Compatibilité des clients MCP

Configurés automatiquement par `npm run setup`. Nécessite Node.js ≥ 18 et le protocole MCP 1.0+ via STDIO (par défaut) ou HTTP.

| Client                 | Plateforme            | Chemin de configuration                                                     |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Claude Desktop**     | macOS, Windows, Linux | `~/Library/Application Support/Claude/claude_desktop_config.json`            |
| **Cursor IDE**         | macOS, Windows, Linux | `~/.cursor/mcp.json`                                                         |
| **Zed Editor**         | macOS, Windows, Linux | `~/.config/zed/settings.json`                                               |
| **Cline**              | Extension VS Code     | `~/...globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |
| **Continue.dev**       | VS Code, JetBrains    | `~/.continue/config.json`                                                    |
| **Windsurf (Codeium)** | macOS, Windows, Linux | `~/.codeium/windsurf/mcp_config.json`                                        |
| **Roo Code**           | Extension VS Code     | `~/...globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`   |
| **Claude Code CLI**    | Terminal              | `~/.claude.json`                                                            |
| **Amazon Q Developer** | AWS                   | `~/.aws/amazonq/mcp.json`                                                    |

## Outils disponibles

**322 outils**, 100% de couverture de la Sell API, organisés par catégorie. Chaque lien pointe vers les définitions d'outils et leurs handlers dans [`src/tools/categories/`](src/tools/categories/) :

| Catégorie | Ce que vous pouvez faire |
| --- | --- |
| [Account](src/tools/categories/account.ts) | Politiques commerciales, d'expédition, de paiement et de retour ; programmes ; abonnements ; taxe de vente |
| [Inventory](src/tools/categories/inventory.ts) | Articles d'inventaire, offres, emplacements, groupes d'articles, opérations en masse, mappage SKU/emplacement |
| [Fulfillment](src/tools/categories/fulfillment.ts) | Commandes, expédition, remboursements, litiges, preuves de litiges de paiement |
| [Marketing](src/tools/categories/marketing.ts) | Campagnes d'annonces sponsorisées, annonces, promotions, enchères, opérations en masse |
| [Analytics](src/tools/categories/analytics.ts) | Rapports de trafic, standards vendeur, métriques de service client |
| [Communication](src/tools/categories/communication.ts) | Messagerie acheteur–vendeur, négociations, notifications, évaluations |
| [Metadata](src/tools/categories/metadata.ts) | Politiques de retour, juridictions de taxe de vente, compatibilité automobile |
| [Taxonomy](src/tools/categories/taxonomy.ts) | Arbres de catégories, aspects d'articles, états d'articles |
| [Trading (XML hérité)](src/tools/categories/trading.ts) | Créer, réviser, remettre en vente et clôturer des annonces à prix fixe |
| [Developer](src/tools/categories/developer.ts) | Limites de débit, clés de signature, enregistrement de clients |
| [Token Management](src/tools/categories/token-management.ts) | Génération d'URL OAuth et gestion des jetons |

**Outils d'exemple :** `ebay_get_inventory_items`, `ebay_get_orders`, `ebay_create_offer`, `ebay_get_campaigns`, `ebay_get_oauth_url`.

Pour l'index complet lisible par machine, consultez [llms.txt](llms.txt).

## Interface interactive (MCP Apps)

> **Bêta** — cette fonctionnalité est récente et évolue en parallèle de la spécification MCP Apps, et la prise en charge par les hôtes se déploie encore. Elle est optionnelle et se replie sur du JSON brut, donc elle ne casse jamais les clients existants. Activez-la ou désactivez-la avec `EBAY_MCP_UI`.

Sur les hôtes qui prennent en charge [MCP Apps](https://modelcontextprotocol.io), les outils de lecture courants affichent leurs résultats sous forme de vues interactives plutôt qu'en JSON brut — un **tableau** triable, une **fiche** détaillée ou un **graphique** — en utilisant le thème de l'hôte lui-même. Partout ailleurs, ces mêmes outils renvoient du JSON brut, donc rien ne casse. Elle s'appuie sur le [SDK MCP Apps (`@modelcontextprotocol/ext-apps`)](https://github.com/modelcontextprotocol/ext-apps), l'extension qui permet aux serveurs MCP de fournir une interface interactive aux clients conversationnels.

- **Optionnel et conditionné par l'hôte.** Les vues ne sont proposées qu'aux clients qui annoncent la capacité MCP Apps (par ex. Claude). Les hôtes qui ne la prennent pas en charge (par ex. Cursor) reçoivent silencieusement du JSON.
- **Interrupteur d'arrêt.** Mettez `EBAY_MCP_UI=off` pour forcer le JSON brut partout, même sur les hôtes compatibles.
- **Économe en jetons.** Le HTML de chaque vue est récupéré une seule fois par l'hôte, hors bande (jamais dans le contexte du modèle) ; le modèle ne voit qu'un résumé d'une ligne, en plus des données structurées qu'il aurait reçues de toute façon.
- **En lecture seule.** Les vues ne déclenchent jamais que des outils de lecture (explorer une ligne, paginer, actualiser) — elles ne modifient jamais vos données eBay.

13 outils de flux de travail essentiels y adhèrent aujourd'hui, répartis en trois archétypes :

| Archétype | Outils |
| --- | --- |
| **Tableau** | `ebay_get_orders`, `ebay_get_shipping_fulfillments`, `ebay_get_offers`, `ebay_get_inventory_items`, `ebay_get_inventory_locations`, `ebay_get_payment_dispute_summaries` |
| **Fiche** | `ebay_get_order`, `ebay_get_offer`, `ebay_get_inventory_item`, `ebay_get_payment_dispute`, `ebay_get_seller_standards_profile` |
| **Graphique** | `ebay_get_traffic_report`, `ebay_get_customer_service_metric` |

Les vues se compilent en HTML autonome avec `npm run build` (ou `npm run build:ui`) ; elles sont incluses dans le paquet publié et se chargent sans aucun accès réseau propre.

## Exemples d'utilisation

Tâches courantes, formulées comme vous les demanderiez à votre assistant IA :

- **Configurer OAuth** — *« Aide-moi à configurer OAuth pour mon compte eBay. »* → génère une URL d'autorisation via `ebay_get_oauth_url`, puis configure le jeton de renouvellement. Débloque 10k–50k req/jour.
- **Gérer l'inventaire** — *« Montre-moi toutes mes annonces actives. »* → `ebay_get_inventory_items` renvoie les SKU, quantités et statuts.
- **Traiter les commandes** — *« Récupère toutes les commandes non honorées des 7 derniers jours. »* → `ebay_get_orders` avec filtres de date et de statut d'expédition.
- **Créer des campagnes** — *« Crée une campagne d'annonces sponsorisées pour l'électronique. »* → `ebay_create_campaign` et outils marketing associés.
- **Opérations en masse** — *« Applique 10% de remise à tous les articles 'Montres Vintage'. »* → `ebay_get_inventory_items` + `ebay_update_offer` sur les correspondances.

## Journalisation et dépannage

- **Journalisation** — basée sur Winston, écrite sur stderr (compatible MCP) avec sortie fichier optionnelle. Voir [docs/logging.md](docs/logging.md).
- **Dépannage** — serveur absent, erreurs d'authentification, limites de débit, résultats vides. Commencez par `npm run diagnose`, puis consultez [docs/troubleshooting.md](docs/troubleshooting.md).

## FAQ

### Qu'est-ce que le serveur MCP eBay ?

Un serveur local du [Model Context Protocol](https://modelcontextprotocol.io) qui expose **322 outils** couvrant **100% des Sell APIs d'eBay** (270 endpoints) aux assistants IA — inventaire, traitement des commandes, marketing, analytique et outils développeur.

### Est-ce un produit officiel eBay ?

Non. C'est un projet open source tiers non officiel. Il n'est **ni affilié, ni autorisé, ni approuvé par eBay Inc.**

### Quels assistants IA et clients MCP sont pris en charge ?

`npm run setup` configure automatiquement neuf clients : Claude Desktop, Cursor, Zed, Cline, Continue.dev, Windsurf, Roo Code, Claude Code CLI et Amazon Q Developer. Tout client compatible MCP peut se connecter.

### Puis-je l'utiliser avec Claude, ChatGPT ou Cursor ?

Oui. Il fonctionne nativement avec Claude Desktop et Claude Code, avec Cursor et d'autres IDE compatibles MCP, et avec tout assistant prenant en charge le Model Context Protocol. L'invite de configuration en un clic ci-dessus fonctionne aussi avec ChatGPT et d'autres assistants.

### Pourquoi ne vois-je pas les tableaux et graphiques interactifs ?

Les vues interactives [MCP Apps](#interface-interactive-mcp-apps) n'apparaissent que sur les hôtes qui annoncent la capacité (par ex. Claude) ; les autres clients reçoivent les mêmes données en JSON brut. Vérifiez aussi que vous n'avez pas défini `EBAY_MCP_UI=off` et que les vues sont compilées (`npm run build` exécute `build:ui`).

### Combien d'API et d'outils eBay couvre-t-il ?

322 outils sur 270 endpoints uniques — 100% des Sell APIs d'eBay.

### Est-il gratuit et open source ?

Oui. Il est publié sous [licence MIT](LICENSE).

### S'exécute-t-il en local ou dans le cloud ?

Il s'exécute entièrement sur votre machine via STDIO (ou HTTP local). Il n'y a pas de relais cloud — vos identifiants eBay ne quittent jamais votre ordinateur.

### De quoi ai-je besoin pour commencer ?

Node.js ≥ 18, un [compte développeur eBay](https://developer.ebay.com/) gratuit (Client ID + Client Secret), puis lancez `npm run setup`.

### Quelles sont les limites de débit de l'API eBay ?

Les identifiants client (par défaut) autorisent environ 1000 requêtes/jour. S'authentifier avec un jeton utilisateur via OAuth porte ce chiffre à 10 000–50 000 requêtes/jour selon le niveau de votre compte.

### Prend-il en charge sandbox et production ?

Oui. Basculez avec la variable `EBAY_ENVIRONMENT` (`sandbox` ou `production`).

### Mes identifiants et données sont-ils en sécurité ?

Les identifiants sont stockés localement dans votre fichier `.env` et utilisés uniquement pour appeler eBay directement. Voir [SECURITY.md](SECURITY.md) et [EBAY_COMPLIANCE.md](EBAY_COMPLIANCE.md).

### En quoi est-ce différent d'appeler directement l'API eBay ?

Vous interagissez en langage naturel via votre assistant IA. La gestion des jetons OAuth, les nouvelles tentatives automatiques avec recul et la validation typée via Zod sont intégrées. Voir le [tableau comparatif](#ebay-mcp-face-à-lapi-brute-debay) ci-dessus.

### Prend-il en charge l'ancienne Trading API d'eBay (XML) ?

Oui. Les opérations de création, révision, remise en vente et clôture d'annonces à prix fixe sont prises en charge via les outils de la Trading API.

### Comment obtenir des limites de débit plus élevées ?

Terminez le flux OAuth avec `npm run setup` pour vous authentifier avec un jeton utilisateur (10k–50k requêtes/jour au lieu des 1k par défaut).

### Avec quoi est-il construit ?

TypeScript et Node.js (ESM), avec le SDK officiel MCP, Zod pour la validation et des types générés à partir d'OpenAPI.

### Comment mettre à jour vers la dernière version ?

Lancez `npm install -g ebay-mcp@latest` (ou `npm update -g ebay-mcp`).

### Fonctionne-t-il hors ligne ?

Non. « S'exécute en local » signifie que le processus serveur tourne sur votre machine — il a tout de même besoin d'une connexion internet et d'identifiants valides pour atteindre les API en direct d'eBay.

## Contribuer

Les contributions sont les bienvenues. Forkez → créez une branche → ajoutez des tests → `npm run check && npm test` → committez avec [Conventional Commits](https://www.conventionalcommits.org/) → ouvrez une PR.

- Vous travaillez sur le code ou avec un agent de programmation ? Commencez par **[AGENTS.md](AGENTS.md)** — commandes de build/test, carte des modules et flux d'ajout d'un endpoint.
- Guide complet : **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Ressources

- [Portail développeur eBay](https://developer.ebay.com/) — documentation de l'API et identifiants
- [Accord de licence de l'API eBay](https://developer.ebay.com/join/api-license-agreement) — conditions et conformité
- [Exigences de traitement des données eBay](https://developer.ebay.com/api-docs/static/data-handling-update.html) — protection des données et confidentialité
- [Documentation MCP](https://modelcontextprotocol.io/) — spécification du Model Context Protocol
- [Référence rapide OAuth](docs/auth/OAUTH_QUICK_REFERENCE.md) — scopes, dépannage, exemples
- [Statut de l'API eBay](https://developer.ebay.com/support/api-status) — page de statut officielle (aussi via l'outil `ebay_get_api_status` et l'[instantané dans le dépôt](docs/API_STATUS.md))
- [CHANGELOG.md](CHANGELOG.md) · [SECURITY.md](SECURITY.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [Suivi des problèmes](https://github.com/YosefHayim/ebay-mcp/issues) — rapports de bugs et demandes de fonctionnalités

## Licence

MIT — voir [LICENSE](LICENSE).

## Contributeurs

Merci à toutes les personnes qui ont aidé à améliorer ce projet ! 🎉

<a href="https://github.com/YosefHayim/ebay-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YosefHayim/ebay-mcp" alt="Contributeurs eBay MCP" />
</a>

---

<div align="center">

<a href="https://www.buymeacoffee.com/yosefhayim" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48" /></a>

<br /><br />

**[Soutenir ce projet](https://www.buymeacoffee.com/yosefhayim)** · Créé par [Yosef Hayim Sabag](https://github.com/YosefHayim)

<sub>Serveur MCP eBay · Model Context Protocol pour les Sell APIs d'eBay · connectez Claude, Cursor et tout assistant IA à l'inventaire, aux commandes, au marketing et à l'analytique eBay.</sub>

</div>
