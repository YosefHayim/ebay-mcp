/**
 * Interactive Setup for eBay API MCP Server - Complete Optimized Version
 *
 * Features:
 * - Pre-flight security checks
 * - First-time developer guidance
 * - Interactive OAuth flow with local callback server
 * - Scope selection and verification
 * - Auto-generate access tokens
 * - Multi-environment support
 * - Enhanced LLM client detection and configuration
 * - Docker setup option
 * - Post-setup quick start guide
 *
 * Usage:
 *   npx ebay-mcp                         Interactive setup wizard
 *   npx ebay-mcp --help                  Show help
 *   npx ebay-mcp --diagnose              Run diagnostics
 *   npx ebay-mcp --first-time            First-time developer guide
 */

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable n/no-process-exit */

import prompts from 'prompts';
import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  runSecurityChecks,
  displaySecurityResults,
  hasCriticalFailures,
} from '../utils/security-checker.js';
import {
  displayFirstTimeDeveloperGuide,
  getRuNameHelp,
  interactiveOAuthFlow,
  displayManualOAuthInstructions,
} from '../utils/oauth-helper.js';
import {
  displayScopeCategories,
  getRecommendedScopes,
  displayScopeVerification,
  getAllScopesString,
} from '../utils/scope-helper.js';
import { detectLLMClients, configureLLMClient } from '../utils/llm-client-detector.js';
import { validateSetup, displayRecommendations } from '../utils/setup-validator.js';
import { EbaySellerApi } from '../api/index.js';
import { EbayOAuthClient } from '../auth/oauth.js';
import type { EbayConfig } from '../types/ebay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// ═══════════════════════════════════════════════════════════════════════════
// eBay Brand Colors
// ═══════════════════════════════════════════════════════════════════════════

const ebayColors = {
  red: chalk.hex('#E53238'),
  blue: chalk.hex('#0064D2'),
  yellow: chalk.hex('#F5AF02'),
  green: chalk.hex('#85B716'),
};

// ═══════════════════════════════════════════════════════════════════════════
// CLI Arguments
// ═══════════════════════════════════════════════════════════════════════════

interface CLIArgs {
  help: boolean;
  diagnose: boolean;
  firstTime: boolean;
  skipChecks: boolean;
  environment?: 'sandbox' | 'production';
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const envArg = args.find((arg) => arg.startsWith('--env='));

  return {
    help: args.includes('--help') || args.includes('-h'),
    diagnose: args.includes('--diagnose') || args.includes('-d'),
    firstTime: args.includes('--first-time') || args.includes('-f'),
    skipChecks: args.includes('--skip-checks'),
    environment: envArg
      ? (envArg.split('=')[1] as 'sandbox' | 'production')
      : undefined,
  };
}

function showHelp() {
  console.log(chalk.bold.cyan('\n📖 eBay API MCP Server Setup Help\n'));
  console.log(chalk.white('Usage:'));
  console.log(chalk.gray('  npx ebay-mcp [options]\n'));
  console.log(chalk.white('Options:'));
  console.log(chalk.yellow('  --help, -h           ') + chalk.gray('Show this help message'));
  console.log(
    chalk.yellow('  --diagnose, -d       ') + chalk.gray('Run system diagnostics')
  );
  console.log(
    chalk.yellow('  --first-time, -f     ') + chalk.gray('Show first-time developer guide')
  );
  console.log(
    chalk.yellow('  --skip-checks        ') + chalk.gray('Skip pre-flight security checks')
  );
  console.log(
    chalk.yellow('  --env=ENV            ') +
      chalk.gray('Set environment (sandbox|production)')
  );
  console.log(
    chalk.yellow('  (no options)         ') + chalk.gray('Run interactive setup wizard\n')
  );
  console.log(chalk.white('Examples:'));
  console.log(chalk.gray('  npx ebay-mcp                     # Interactive wizard'));
  console.log(chalk.gray('  npx ebay-mcp --first-time        # First-time guide'));
  console.log(chalk.gray('  npx ebay-mcp --diagnose          # Run diagnostics'));
  console.log(chalk.gray('  npx ebay-mcp --env=production    # Setup for production\n'));
  console.log(chalk.white('Learn more:'));
  console.log(chalk.blue('  https://github.com/YosefHayim/ebay-api-mcp-server#readme\n'));
}

// ═══════════════════════════════════════════════════════════════════════════
// eBay Logo and Branding
// ═══════════════════════════════════════════════════════════════════════════

function createClickableLink(text: string, url: string): string {
  return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
}

const EBAY_LOGO = `
   ${ebayColors.red('███████╗')}${ebayColors.blue('██████╗ ')} ${ebayColors.yellow('█████╗ ')}${ebayColors.green('██╗   ██╗')}
   ${ebayColors.red('██╔════╝')}${ebayColors.blue('██╔══██╗')}${ebayColors.yellow('██╔══██╗')}${ebayColors.green('╚██╗ ██╔╝')}
   ${ebayColors.red('█████╗  ')}${ebayColors.blue('██████╔╝')}${ebayColors.yellow('███████║')}${ebayColors.green(' ╚████╔╝ ')}
   ${ebayColors.red('██╔══╝  ')}${ebayColors.blue('██╔══██╗')}${ebayColors.yellow('██╔══██║')}${ebayColors.green('  ╚██╔╝  ')}
   ${ebayColors.red('███████╗')}${ebayColors.blue('██████╔╝')}${ebayColors.yellow('██║  ██║')}${ebayColors.green('   ██║   ')}
   ${ebayColors.red('╚══════╝')}${ebayColors.blue('╚═════╝ ')}${ebayColors.yellow('╚═╝  ╚═╝')}${ebayColors.green('   ╚═╝   ')}

            ${chalk.bold.white('API MCP Server Setup')}
`;

const CREATOR_CREDIT = `
   Creator: ${chalk.bold('YosefHayim')}
   ${createClickableLink(chalk.underline('linkedin.com/in/yosef-hayim-sabag'), 'https://www.linkedin.com/in/yosef-hayim-sabag/')}
`;

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

function displayLogo() {
  console.clear();
  console.log(EBAY_LOGO);
  console.log(CREATOR_CREDIT);
}

function validateRequired(value: string): boolean | string {
  return value.trim().length > 0 || 'This field is required';
}

function loadExistingConfig(): Record<string, string> {
  const envPath = join(PROJECT_ROOT, '.env');
  const config: Record<string, string> = {};

  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value && !value.includes('_here')) {
          config[key.trim()] = value;
        }
      }
    }
  }

  return config;
}

function generateEnvFile(config: Record<string, string>, environment: string): void {
  const envPath = join(PROJECT_ROOT, `.env${environment === 'sandbox' ? '' : `.${environment}`}`);

  const content = `# eBay API MCP Server Configuration
# Generated on ${new Date().toISOString()}
# Environment: ${environment}

# ═══════════════════════════════════════════════════════════════════
# eBay App Credentials (Required)
# ═══════════════════════════════════════════════════════════════════

EBAY_CLIENT_ID=${config.EBAY_CLIENT_ID || 'your_client_id_here'}
EBAY_CLIENT_SECRET=${config.EBAY_CLIENT_SECRET || 'your_client_secret_here'}
EBAY_REDIRECT_URI=${config.EBAY_REDIRECT_URI || 'http://localhost:3000/oauth/callback'}

# ═══════════════════════════════════════════════════════════════════
# Environment (sandbox or production)
# ═══════════════════════════════════════════════════════════════════

EBAY_ENVIRONMENT=${config.EBAY_ENVIRONMENT || 'sandbox'}

# ═══════════════════════════════════════════════════════════════════
# User Tokens (Auto-generated from refresh token)
# ═══════════════════════════════════════════════════════════════════
# The refresh token is the only token you need to provide manually.
# Access tokens are automatically generated and refreshed.

EBAY_USER_REFRESH_TOKEN=${config.EBAY_USER_REFRESH_TOKEN || ''}
EBAY_USER_ACCESS_TOKEN=${config.EBAY_USER_ACCESS_TOKEN || ''}
EBAY_APP_ACCESS_TOKEN=${config.EBAY_APP_ACCESS_TOKEN || ''}

# ═══════════════════════════════════════════════════════════════════
# Logging (Optional)
# ═══════════════════════════════════════════════════════════════════
LOG_LEVEL=${config.LOG_LEVEL || 'info'}
`;

  writeFileSync(envPath, content, 'utf-8');
  console.log(chalk.green(`✓ Configuration saved to ${envPath}`));
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Acquisition & Validation
// ═══════════════════════════════════════════════════════════════════════════

async function acquireRefreshToken(
  config: EbayConfig,
  useInteractiveFlow: boolean
): Promise<string | null> {
  if (useInteractiveFlow) {
    console.log(chalk.bold.cyan('\n🔐 Starting Interactive OAuth Flow\n'));

    const scopes = getRecommendedScopes(config.environment);
    const authCode = await interactiveOAuthFlow(config, scopes);

    if (!authCode) {
      return null;
    }

    // Exchange code for tokens
    console.log(chalk.cyan('\n🔄 Exchanging authorization code for tokens...\n'));

    try {
      const oauthClient = new EbayOAuthClient(config);
      const tokenData = await oauthClient.exchangeCodeForToken(authCode);

      console.log(chalk.green('✓ Successfully obtained tokens!\n'));
      return tokenData.refresh_token;
    } catch (error) {
      console.log(
        chalk.red(`✗ Failed to exchange code: ${error instanceof Error ? error.message : error}\n`)
      );
      return null;
    }
  } else {
    // Manual flow
    displayManualOAuthInstructions(
      config.clientId,
      config.redirectUri || 'http://localhost:3000/oauth/callback',
      config.environment,
      getRecommendedScopes(config.environment)
    );

    const response = await prompts({
      type: 'text',
      name: 'refreshToken',
      message: 'Paste your refresh token here:',
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Refresh token is required';
        }
        const cleanValue = value.trim().replace(/^["']|["']$/g, '');
        if (!cleanValue.startsWith('v^1.1#')) {
          return 'Token should start with "v^1.1#"';
        }
        return true;
      },
    });

    if (!response.refreshToken) {
      return null;
    }

    return response.refreshToken.trim().replace(/^["']|["']$/g, '');
  }
}

async function validateAndGenerateTokens(
  config: Record<string, string>
): Promise<boolean> {
  console.log(chalk.bold.cyan('\n🔄 Validating Credentials & Generating Tokens...\n'));

  try {
    const ebayConfig: EbayConfig = {
      clientId: config.EBAY_CLIENT_ID,
      clientSecret: config.EBAY_CLIENT_SECRET,
      redirectUri: config.EBAY_REDIRECT_URI,
      environment: (config.EBAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    };

    // Set up OAuth client with refresh token
    const oauthClient = new EbayOAuthClient(ebayConfig);

    // Set the refresh token
    if (config.EBAY_USER_REFRESH_TOKEN) {
      // Manually set tokens to trigger initialization
      process.env.EBAY_USER_REFRESH_TOKEN = config.EBAY_USER_REFRESH_TOKEN;
      process.env.EBAY_USER_ACCESS_TOKEN = '';

      console.log(chalk.cyan('  → Initializing OAuth client...'));
      await oauthClient.initialize();

      // Get tokens (this will auto-refresh if needed)
      console.log(chalk.cyan('  → Refreshing access token from refresh token...'));
      const accessToken = await oauthClient.getAccessToken();

      // Store the generated access token
      config.EBAY_USER_ACCESS_TOKEN = accessToken;
      console.log(chalk.green('  ✓ Access token generated successfully'));

      // Generate app access token
      console.log(chalk.cyan('  → Generating app access token...'));
      const appToken = await oauthClient.getOrRefreshAppAccessToken();
      config.EBAY_APP_ACCESS_TOKEN = appToken;
      console.log(chalk.green('  ✓ App access token generated successfully'));

      // Test with Identity API
      console.log(chalk.cyan('  → Verifying credentials with eBay Identity API...'));
      const api = new EbaySellerApi(ebayConfig);
      await api.initialize(); // Initialize uses the environment variables we set

      const userInfo = await api.identity.getUser();

      console.log(chalk.green('\n✓ Successfully validated credentials!\n'));
      console.log(chalk.bold.white('📋 Your eBay Account Information:\n'));
      console.log(userInfo);
      console.log('');

      // Display scope verification
      const authClient = api.getAuthClient();
      const tokenInfo = authClient.getTokenInfo();
      if (tokenInfo.scopeInfo) {
        displayScopeVerification(tokenInfo.scopeInfo.tokenScopes, ebayConfig.environment);
      }

      return true;
    } else {
      console.log(chalk.yellow('⚠️  No refresh token provided, skipping validation\n'));
      return false;
    }
  } catch (error) {
    console.log(chalk.red('\n✗ Validation failed\n'));

    if (error instanceof Error) {
      console.log(chalk.yellow(`  Error: ${error.message}\n`));

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log(chalk.gray('  Possible causes:'));
        console.log(chalk.gray('    • Invalid or expired refresh token'));
        console.log(chalk.gray('    • Token from different environment (sandbox vs production)'));
        console.log(chalk.gray('    • Incorrect client credentials\n'));
      }
    }

    const retry = await prompts({
      type: 'confirm',
      name: 'retry',
      message: 'Would you like to retry with different credentials?',
      initial: true,
    });

    return retry.retry === true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM Client Detection and Configuration
// ═══════════════════════════════════════════════════════════════════════════

async function detectAndConfigureLLMClients(): Promise<void> {
  console.log(chalk.bold.cyan('\n┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│  🤖 LLM Client Detection & Configuration                   │'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘\n'));

  const clients = detectLLMClients();
  const detectedClients = clients.filter((c) => c.detected);

  if (detectedClients.length === 0) {
    console.log(chalk.yellow('⚠️  No compatible LLM clients detected on your system.\n'));
    console.log(chalk.white('Supported clients:'));
    console.log(chalk.gray('  • Claude Desktop    (Anthropic\'s desktop app)'));
    console.log(chalk.gray('  • Cline             (VSCode extension)'));
    console.log(chalk.gray('  • Continue.dev      (VSCode/JetBrains extension)\n'));
    console.log(chalk.cyan('💡 You can manually configure your MCP client later.'));
    console.log(chalk.gray('   See: https://github.com/YosefHayim/ebay-api-mcp-server#setup\n'));
    return;
  }

  const clientCount = detectedClients.length;
  const plural = clientCount === 1 ? 'client' : 'clients';
  console.log(chalk.green.bold(`✓ Found ${clientCount} compatible ${plural} on your system:\n`));

  // Display each client in a nice box
  for (const client of detectedClients) {
    const boxWidth = 61;
    const topBorder = chalk.gray('┌─') + chalk.white(client.displayName) + chalk.gray('─'.repeat(boxWidth - client.displayName.length - 3) + '┐');

    console.log(topBorder);

    // Status line
    const statusIcon = chalk.green('✓');
    const statusText = 'Installed';
    console.log(chalk.gray('│ ') + chalk.gray('Status:    ') + statusIcon + ' ' + chalk.white(statusText) + ' '.repeat(boxWidth - 23) + chalk.gray('│'));

    // Config status line
    const configIcon = client.configExists ? chalk.yellow('⚠') : chalk.gray('○');
    const configText = client.configExists ? chalk.yellow('Already configured') : chalk.gray('Not configured');
    const configPadding = client.configExists ? 39 : 43;
    console.log(chalk.gray('│ ') + chalk.gray('Config:    ') + configIcon + ' ' + configText + ' '.repeat(boxWidth - configPadding) + chalk.gray('│'));

    // Path line (truncated if too long)
    const maxPathLength = boxWidth - 14;
    let displayPath = client.configPath;
    if (displayPath.length > maxPathLength) {
      displayPath = '...' + displayPath.substring(displayPath.length - maxPathLength + 3);
    }
    console.log(chalk.gray('│ ') + chalk.gray('Path:      ') + chalk.dim(displayPath) + ' '.repeat(boxWidth - displayPath.length - 13) + chalk.gray('│'));

    console.log(chalk.gray('└' + '─'.repeat(boxWidth - 1) + '┘\n'));
  }

  // Ask user which clients to configure
  console.log(chalk.white.bold('Configure eBay MCP for these clients?\n'));
  console.log(chalk.gray('  💡 Recommended: Select clients that are ') + chalk.yellow('not configured') + chalk.gray(' yet'));
  console.log(chalk.gray('  📝 Use ') + chalk.cyan('Space') + chalk.gray(' to select, ') + chalk.cyan('Enter') + chalk.gray(' to confirm\n'));

  const response = await prompts({
    type: 'multiselect',
    name: 'selectedClients',
    message: 'Select clients to configure:',
    choices: detectedClients.map((client) => {
      const statusBadge = client.configExists
        ? chalk.yellow(' [Already configured]')
        : chalk.green(' [Recommended]');
      return {
        title: client.displayName + statusBadge,
        value: client.name,
        selected: !client.configExists, // Auto-select unconfigured clients
      };
    }),
    hint: '← → or Space to toggle • Enter to confirm',
    instructions: false,
  });

  if (!response.selectedClients || response.selectedClients.length === 0) {
    console.log(chalk.gray('\n⏭️  Skipping LLM client configuration.\n'));
    return;
  }

  // Configure selected clients
  console.log(chalk.bold.cyan('\n┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│  ⚙️  Configuring Selected Clients                           │'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────────────────┘\n'));

  for (const clientName of response.selectedClients) {
    const client = detectedClients.find((c) => c.name === clientName);
    if (!client) continue;

    console.log(chalk.cyan(`Configuring ${client.displayName}...`));

    const success = configureLLMClient(clientName, PROJECT_ROOT);

    if (success) {
      console.log(chalk.green(`  ✓ Successfully configured ${client.displayName}`));
      console.log(chalk.gray(`  📁 Config file: ${client.configPath}`));
      console.log(chalk.dim(`  🔗 MCP server added to configuration\n`));
    } else {
      console.log(chalk.red(`  ✗ Failed to configure ${client.displayName}`));
      console.log(chalk.yellow(`  ⚠️  Manual setup required`));
      console.log(chalk.gray(`  📄 Config path: ${client.configPath}\n`));
    }
  }

  // Success message
  console.log(chalk.bold.green('✨ LLM client configuration complete!\n'));
  console.log(chalk.white.bold('📌 Next Steps:\n'));
  console.log(chalk.gray('  1. ') + chalk.white('Restart') + chalk.gray(' your LLM client(s) to load the new configuration'));
  console.log(chalk.gray('  2. The ') + chalk.cyan('eBay MCP server') + chalk.gray(' should appear in the MCP tools list'));
  console.log(chalk.gray('  3. Try asking: ') + chalk.cyan('"Show me my eBay user information"') + chalk.gray('\n'));
}

// ═══════════════════════════════════════════════════════════════════════════
// Docker Setup
// ═══════════════════════════════════════════════════════════════════════════

async function setupDocker(): Promise<void> {
  const wantDocker = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Would you like to generate Docker configuration?',
    initial: false,
  });

  if (!wantDocker.value) {
    return;
  }

  console.log(chalk.bold.cyan('\n🐳 Generating Docker Configuration...\n'));

  const dockerComposePath = join(PROJECT_ROOT, 'docker-compose.yml');
  const dockerComposeContent = `version: '3.8'

services:
  ebay-mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ebay-mcp-server
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs
    networks:
      - ebay-mcp-network

networks:
  ebay-mcp-network:
    driver: bridge
`;

  writeFileSync(dockerComposePath, dockerComposeContent, 'utf-8');
  console.log(chalk.green(`  ✓ Generated docker-compose.yml`));

  console.log(chalk.bold.white('\n📖 Docker Usage:\n'));
  console.log(chalk.gray('  Build and start:   ') + chalk.cyan('docker-compose up -d'));
  console.log(chalk.gray('  View logs:         ') + chalk.cyan('docker-compose logs -f'));
  console.log(chalk.gray('  Stop:              ') + chalk.cyan('docker-compose down'));
  console.log(chalk.gray('  Rebuild:           ') + chalk.cyan('docker-compose up -d --build\n'));
}

// ═══════════════════════════════════════════════════════════════════════════
// Post-Setup Quick Start
// ═══════════════════════════════════════════════════════════════════════════

function displayQuickStart(): void {
  console.log(chalk.bold.cyan('\n🚀 Quick Start Guide\n'));

  console.log(chalk.bold.white('Try these commands in your LLM client:\n'));
  console.log(chalk.cyan('  💬 "Get my eBay user info"'));
  console.log(chalk.cyan('  📦 "Show my active inventory listings"'));
  console.log(chalk.cyan('  📊 "Get my sales analytics for this month"'));
  console.log(chalk.cyan('  🎯 "Help me create a new listing"\n'));

  console.log(chalk.bold.white('Available Tools:\n'));
  console.log(chalk.gray('  • 230+ eBay API tools across 8 categories'));
  console.log(chalk.gray('  • Inventory Management'));
  console.log(chalk.gray('  • Order Fulfillment'));
  console.log(chalk.gray('  • Marketing & Promotions'));
  console.log(chalk.gray('  • Analytics & Reports'));
  console.log(chalk.gray('  • And more...\n'));

  console.log(chalk.bold.white('Resources:\n'));
  console.log(
    chalk.gray('  📖 Documentation: ') +
      chalk.blue.underline('https://github.com/YosefHayim/ebay-api-mcp-server#readme')
  );
  console.log(
    chalk.gray('  🐛 Report Issues:  ') +
      chalk.blue.underline('https://github.com/YosefHayim/ebay-api-mcp-server/issues')
  );
  console.log(
    chalk.gray('  💬 Get Support:    ') +
      chalk.blue.underline('https://github.com/YosefHayim/ebay-api-mcp-server/discussions\n')
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Setup Flow
// ═══════════════════════════════════════════════════════════════════════════

async function runInteractiveSetup(args: CLIArgs) {
  displayLogo();

  // Pre-flight security checks
  if (!args.skipChecks) {
    console.log(chalk.bold.cyan('\n🔒 Running Pre-Flight Security Checks...\n'));
    const securityResults = await runSecurityChecks(PROJECT_ROOT);
    displaySecurityResults(securityResults);

    if (hasCriticalFailures(securityResults)) {
      const continueAnyway = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Critical issues found. Continue anyway?',
        initial: false,
      });

      if (!continueAnyway.value) {
        console.log(chalk.yellow('\n⚠️  Setup cancelled. Please fix critical issues first.\n'));
        process.exit(1);
      }
    }
  }

  // Check if user needs first-time guide
  const existingConfig = loadExistingConfig();
  const hasExisting = Object.keys(existingConfig).length > 0;

  if (!hasExisting) {
    const needsGuide = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Is this your first time setting up eBay Developer credentials?',
      initial: false,
    });

    if (needsGuide.value) {
      displayFirstTimeDeveloperGuide();
      await prompts({
        type: 'text',
        name: 'continue',
        message: 'Press Enter when ready to continue...',
      });
      console.clear();
      displayLogo();
    }
  } else {
    console.log(chalk.cyan('\n📋 Found existing configuration.\n'));
  }

  // Environment selection
  let environment = args.environment || existingConfig.EBAY_ENVIRONMENT || 'sandbox';

  if (!args.environment) {
    const envResponse = await prompts({
      type: 'select',
      name: 'environment',
      message: 'Select eBay environment:',
      choices: [
        { title: '🧪 Sandbox (Development & Testing)', value: 'sandbox' },
        { title: '🚀 Production (Live Trading)', value: 'production' },
      ],
      initial: environment === 'production' ? 1 : 0,
    });

    if (!envResponse.environment) {
      console.log(chalk.yellow('\n⚠️  Setup cancelled.\n'));
      process.exit(0);
    }

    environment = envResponse.environment;
  }

  console.log(chalk.bold.cyan(`\n⚙️  Setting up for: ${environment.toUpperCase()}\n`));

  // Collect credentials
  const credentials = await prompts([
    {
      type: 'text',
      name: 'EBAY_CLIENT_ID',
      message: 'eBay Client ID (App ID):',
      initial: existingConfig.EBAY_CLIENT_ID || '',
      validate: validateRequired,
    },
    {
      type: 'text',
      name: 'EBAY_CLIENT_SECRET',
      message: 'eBay Client Secret (Cert ID):',
      initial: existingConfig.EBAY_CLIENT_SECRET || '',
      validate: validateRequired,
    },
    {
      type: 'text',
      name: 'EBAY_REDIRECT_URI',
      message: 'eBay Redirect URI (RuName):',
      initial: existingConfig.EBAY_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
      validate: validateRequired,
    },
  ]);

  if (!credentials.EBAY_CLIENT_ID) {
    console.log(chalk.yellow('\n⚠️  Setup cancelled.\n'));
    process.exit(0);
  }

  // Need help with RuName?
  const needsRuNameHelp = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Need help understanding RuName (Redirect URI)?',
    initial: false,
  });

  if (needsRuNameHelp.value) {
    console.log(getRuNameHelp());
    await prompts({
      type: 'text',
      name: 'continue',
      message: 'Press Enter to continue...',
    });
  }

  // Token acquisition
  console.log(chalk.bold.cyan('\n🔑 User Token Setup\n'));
  console.log(chalk.white('You need a refresh token to access user-specific APIs.\n'));

  // Show scope information
  const viewScopes = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Would you like to see available OAuth scopes?',
    initial: false,
  });

  if (viewScopes.value) {
    displayScopeCategories();
  }

  const tokenMethod = await prompts({
    type: 'select',
    name: 'method',
    message: 'How would you like to obtain your refresh token?',
    choices: [
      { title: '🔄 Interactive OAuth Flow (Recommended)', value: 'interactive' },
      { title: '📝 Manual OAuth Flow (I\'ll get it myself)', value: 'manual' },
      { title: '✏️  I already have a refresh token', value: 'existing' },
      { title: '⏭️  Skip (configure later)', value: 'skip' },
    ],
    initial: 0,
  });

  let refreshToken = existingConfig.EBAY_USER_REFRESH_TOKEN || '';

  const ebayConfig: EbayConfig = {
    clientId: credentials.EBAY_CLIENT_ID,
    clientSecret: credentials.EBAY_CLIENT_SECRET,
    redirectUri: credentials.EBAY_REDIRECT_URI,
    environment: environment as 'sandbox' | 'production',
  };

  if (tokenMethod.method === 'interactive' || tokenMethod.method === 'manual') {
    const token = await acquireRefreshToken(
      ebayConfig,
      tokenMethod.method === 'interactive'
    );

    if (token) {
      refreshToken = token;
    } else {
      console.log(chalk.yellow('\n⚠️  Could not acquire refresh token.\n'));
    }
  } else if (tokenMethod.method === 'existing') {
    const existingToken = await prompts({
      type: 'text',
      name: 'token',
      message: 'Paste your refresh token:',
      initial: refreshToken,
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Refresh token is required';
        }
        const cleanValue = value.trim().replace(/^["']|["']$/g, '');
        if (!cleanValue.startsWith('v^1.1#')) {
          return 'Token should start with "v^1.1#"';
        }
        return true;
      },
    });

    if (existingToken.token) {
      refreshToken = existingToken.token.trim().replace(/^["']|["']$/g, '');
    }
  }

  // Build configuration object
  const config: Record<string, string> = {
    EBAY_CLIENT_ID: credentials.EBAY_CLIENT_ID,
    EBAY_CLIENT_SECRET: credentials.EBAY_CLIENT_SECRET,
    EBAY_REDIRECT_URI: credentials.EBAY_REDIRECT_URI,
    EBAY_ENVIRONMENT: environment,
    EBAY_USER_REFRESH_TOKEN: refreshToken,
    EBAY_USER_ACCESS_TOKEN: '',
    EBAY_APP_ACCESS_TOKEN: '',
    LOG_LEVEL: existingConfig.LOG_LEVEL || 'info',
  };

  // Validate and generate tokens
  if (refreshToken) {
    const validated = await validateAndGenerateTokens(config);

    if (!validated) {
      console.log(chalk.yellow('\n⚠️  Setup will continue but tokens may not be valid.\n'));
    }
  } else {
    console.log(
      chalk.yellow('\n⚠️  No refresh token configured. Some APIs will not be available.\n')
    );
  }

  // Review configuration
  console.log(chalk.bold.cyan('\n📋 Configuration Review:\n'));
  console.log(`  ${chalk.gray('Client ID:')} ${config.EBAY_CLIENT_ID}`);
  console.log(
    `  ${chalk.gray('Client Secret:')} ${'*'.repeat(Math.min(config.EBAY_CLIENT_SECRET.length, 20))}`
  );
  console.log(`  ${chalk.gray('Redirect URI:')} ${config.EBAY_REDIRECT_URI}`);
  console.log(`  ${chalk.gray('Environment:')} ${chalk.bold(config.EBAY_ENVIRONMENT)}`);
  console.log(
    `  ${chalk.gray('User Refresh Token:')} ${config.EBAY_USER_REFRESH_TOKEN ? chalk.green('✓ Configured') : chalk.yellow('✗ Not set')}`
  );
  console.log(
    `  ${chalk.gray('User Access Token:')} ${config.EBAY_USER_ACCESS_TOKEN ? chalk.green('✓ Generated') : chalk.yellow('✗ Not generated')}`
  );
  console.log(
    `  ${chalk.gray('App Access Token:')} ${config.EBAY_APP_ACCESS_TOKEN ? chalk.green('✓ Generated') : chalk.yellow('✗ Not generated')}\n`
  );

  const confirmation = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'Save this configuration?',
    initial: true,
  });

  if (!confirmation.confirm) {
    console.log(chalk.yellow('\n⚠️  Configuration not saved.\n'));
    process.exit(0);
  }

  // Save .env file
  generateEnvFile(config, environment);

  // Configure LLM clients
  await detectAndConfigureLLMClients();

  // Docker setup
  await setupDocker();

  // Run final validation
  console.log(chalk.bold.cyan('\n🧪 Running Final Validation...\n'));
  const summary = await validateSetup(PROJECT_ROOT);
  displayRecommendations(summary);

  // Display quick start guide
  displayQuickStart();

  console.log(chalk.bold.green('✅ Setup complete!\n'));
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray('  1. Restart your LLM client (Claude Desktop, Cline, etc.)'));
  console.log(chalk.gray('  2. The eBay MCP server should now be available'));
  console.log(chalk.gray('  3. Try the commands in the Quick Start guide above\n'));
  console.log(chalk.bold.white('🎉 Happy selling on eBay!\n'));
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.firstTime) {
    displayFirstTimeDeveloperGuide();
    process.exit(0);
  }

  if (args.diagnose) {
    // Diagnostics is handled by a separate script
    console.log(chalk.cyan('Run diagnostics with: npm run diagnose\n'));
    process.exit(0);
  }

  await runInteractiveSetup(args);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠️  Setup interrupted by user.\n'));
  process.exit(0);
});

// Run main
main().catch((error) => {
  console.error(chalk.red('\n❌ Setup failed:'), error);
  process.exit(1);
});
