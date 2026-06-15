#!/usr/bin/env node

import { dirname, join, resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir, platform } from 'os';
import { randomUUID } from 'crypto';
import type { Server } from 'http';

import chalk from 'chalk';
import { checkForUpdates } from '../utils/version.js';
import { describeHttpError, httpRequest } from '../utils/http.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { getOAuthAuthorizationUrl } from '../config/environment.js';
import { startCallbackServer } from '../utils/oauth-helper.js';
import { defineWizard, runWizard, ClackRenderer } from '../utils/setup-wizard.js';
import { loadExistingConfig, quoteEnvValue } from './setup-shared.js';
import { runSkillsWizard } from './skills.js';
import prompts from 'prompts';
import { configureLLMClient, detectLLMClients } from '../utils/llm-client-detector.js';
import { runSecurityChecks, displaySecurityResults } from '../utils/security-checker.js';
import { validateSetup, displayRecommendations } from '../utils/setup-validator.js';
import { getErrorMessage } from '@/utils/errors.js';
import type { EbayTokenCore } from '../types/ebay.js';

config({ quiet: true });

checkForUpdates();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

const MARKETPLACE_OPTIONS: { value: string; label: string }[] = [
  { value: 'EBAY_US', label: 'EBAY_US — United States' },
  { value: 'EBAY_GB', label: 'EBAY_GB — United Kingdom' },
  { value: 'EBAY_DE', label: 'EBAY_DE — Germany' },
  { value: 'EBAY_FR', label: 'EBAY_FR — France' },
  { value: 'EBAY_IT', label: 'EBAY_IT — Italy' },
  { value: 'EBAY_ES', label: 'EBAY_ES — Spain' },
  { value: 'EBAY_CA', label: 'EBAY_CA — Canada' },
  { value: 'EBAY_AU', label: 'EBAY_AU — Australia' },
];

const CONTENT_LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'en-US', label: 'en-US — English (United States)' },
  { value: 'en-GB', label: 'en-GB — English (United Kingdom)' },
  { value: 'de-DE', label: 'de-DE — German (Germany)' },
  { value: 'fr-FR', label: 'fr-FR — French (France)' },
  { value: 'it-IT', label: 'it-IT — Italian (Italy)' },
  { value: 'es-ES', label: 'es-ES — Spanish (Spain)' },
  { value: 'fr-CA', label: 'fr-CA — French (Canada)' },
  { value: 'nl-BE', label: 'nl-BE — Dutch (Belgium)' },
];

const ebay = {
  red: chalk.hex('#E53238'),
  blue: chalk.hex('#0064D2'),
  yellow: chalk.hex('#F5AF02'),
  green: chalk.hex('#86B817'),
};

const LOGO = `
   ${ebay.red('███████╗')}${ebay.blue('██████╗ ')}${ebay.yellow('█████╗ ')}${ebay.green('██╗   ██╗')}
   ${ebay.red('██╔════╝')}${ebay.blue('██╔══██╗')}${ebay.yellow('██╔══██╗')}${ebay.green('╚██╗ ██╔╝')}
   ${ebay.red('█████╗  ')}${ebay.blue('██████╔╝')}${ebay.yellow('███████║')}${ebay.green(' ╚████╔╝ ')}
   ${ebay.red('██╔══╝  ')}${ebay.blue('██╔══██╗')}${ebay.yellow('██╔══██║')}${ebay.green('  ╚██╔╝  ')}
   ${ebay.red('███████╗')}${ebay.blue('██████╔╝')}${ebay.yellow('██║  ██║')}${ebay.green('   ██║   ')}
   ${ebay.red('╚══════╝')}${ebay.blue('╚═════╝ ')}${ebay.yellow('╚═╝  ╚═╝')}${ebay.green('   ╚═╝   ')}
`;

const ui = {
  dim: chalk.dim,
  bold: chalk.bold,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
};

const DEVELOPER_NAME = 'Yosef Hayim Sabag';
const DEVELOPER_LINKEDIN = 'https://www.linkedin.com/in/yosef-hayim-sabag/';

/** Render the wizard's branding header: logo, title, and developer credit. */
function printWizardBanner(): void {
  console.log(LOGO);
  console.log(
    ui.bold.white('            MCP Server Setup Wizard by ') + ebay.blue.bold(DEVELOPER_NAME)
  );
  console.log(
    ui.dim('              Contact the developer: ') + ebay.blue.underline(DEVELOPER_LINKEDIN) + '\n'
  );
}

// ─── Business-logic helpers (preserved from original) ─────────────────────────

function parseAuthorizationCode(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.includes('code=') || trimmed.includes('?') || trimmed.includes('&')) {
    try {
      let searchParams: URLSearchParams;
      if (trimmed.startsWith('http')) {
        searchParams = new URL(trimmed).searchParams;
      } else {
        searchParams = new URLSearchParams(trimmed.startsWith('?') ? trimmed.slice(1) : trimmed);
      }
      const code = searchParams.get('code');
      if (code) return decodeURIComponent(code);
    } catch {
      // fall through
    }
  }
  if (trimmed.startsWith('v^1.1#') || trimmed.startsWith('v%5E1.1')) {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  }
  return null;
}

interface TokenExchangeResult extends EbayTokenCore {
  refreshTokenExpiresIn: number;
}

/** eBay OAuth token endpoint response (snake_case as returned by the API). */
interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
}

interface EbayUserInfo {
  userId: string;
  username: string;
  accountType?: string;
  registrationMarketplaceId?: string;
  individualAccount?: { firstName?: string; lastName?: string; email?: string };
  businessAccount?: { name?: string; email?: string };
}

async function exchangeAuthorizationCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  environment: 'sandbox' | 'production'
): Promise<TokenExchangeResult> {
  const baseUrl =
    environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await httpRequest<OAuthTokenResponse>({
    method: 'POST',
    url: `${baseUrl}/identity/v1/oauth2/token`,
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token ?? '',
    expiresIn: response.data.expires_in ?? 0,
    refreshTokenExpiresIn: response.data.refresh_token_expires_in ?? 0,
  };
}

async function getAppAccessToken(
  clientId: string,
  clientSecret: string,
  environment: 'sandbox' | 'production'
): Promise<string> {
  const baseUrl =
    environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await httpRequest<OAuthTokenResponse>({
    method: 'POST',
    url: `${baseUrl}/identity/v1/oauth2/token`,
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope',
    }),
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data.access_token;
}

async function verifyRefreshToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  environment: 'sandbox' | 'production'
): Promise<{ accessToken: string; userInfo: EbayUserInfo }> {
  const baseUrl =
    environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenResponse = await httpRequest<OAuthTokenResponse>({
    method: 'POST',
    url: `${baseUrl}/identity/v1/oauth2/token`,
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope:
        'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory',
    }),
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const accessToken = tokenResponse.data.access_token;
  const identityBase =
    environment === 'production' ? 'https://apiz.ebay.com' : 'https://apiz.sandbox.ebay.com';
  const userResponse = await httpRequest<EbayUserInfo>({
    url: `${identityBase}/commerce/identity/v1/user/`,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  return { accessToken, userInfo: userResponse.data };
}

async function fetchEbayUserInfo(
  accessToken: string,
  environment: 'sandbox' | 'production'
): Promise<EbayUserInfo> {
  const identityBase =
    environment === 'production' ? 'https://apiz.ebay.com' : 'https://apiz.sandbox.ebay.com';
  const response = await httpRequest<EbayUserInfo>({
    url: `${identityBase}/commerce/identity/v1/user/`,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  return response.data;
}

/**
 * Resolve Claude Desktop config path for the current operating system.
 *
 * @returns Absolute path to Claude Desktop config JSON.
 */
function getClaudeDesktopConfigPath(): string {
  const home = homedir();
  const os = platform();
  if (os === 'darwin')
    return join(home, 'Library/Application Support/Claude/claude_desktop_config.json');
  if (os === 'win32') return join(home, 'AppData/Roaming/Claude/claude_desktop_config.json');
  return join(home, '.config/Claude/claude_desktop_config.json');
}

/**
 * Check whether Claude Desktop appears to be installed locally.
 *
 * @returns `true` when the Claude Desktop config directory exists.
 */
function isClaudeDesktopInstalled(): boolean {
  return existsSync(dirname(getClaudeDesktopConfigPath()));
}

/**
 * Merge eBay MCP settings into Claude Desktop config.
 *
 * @param envConfig Current setup environment values to persist.
 * @param environment Target eBay environment name.
 * @returns Update result with success state, config path, and optional error details.
 */
function updateClaudeDesktopConfig(
  envConfig: Record<string, string>,
  environment: string
): { success: boolean; configPath: string; error?: string; details?: string } {
  const configPath = getClaudeDesktopConfigPath();
  if (!existsSync(dirname(configPath)))
    return { success: false, configPath, error: 'Claude Desktop not installed' };
  try {
    let existing: Record<string, unknown> = {};
    if (existsSync(configPath)) {
      try {
        existing = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
      } catch (e) {
        return {
          success: false,
          configPath,
          error: `Invalid JSON in config: ${getErrorMessage(e, 'parse error')}`,
          details: 'Please fix the JSON syntax in your Claude config file',
        };
      }
    }
    if (!existing.mcpServers || typeof existing.mcpServers !== 'object') existing.mcpServers = {};
    const mcpServers = existing.mcpServers as Record<string, unknown>;
    const envVars: Record<string, string> = { EBAY_ENVIRONMENT: environment };
    if (envConfig.EBAY_CLIENT_ID) envVars.EBAY_CLIENT_ID = envConfig.EBAY_CLIENT_ID;
    if (envConfig.EBAY_CLIENT_SECRET) envVars.EBAY_CLIENT_SECRET = envConfig.EBAY_CLIENT_SECRET;
    if (envConfig.EBAY_REDIRECT_URI) envVars.EBAY_REDIRECT_URI = envConfig.EBAY_REDIRECT_URI;
    if (envConfig.EBAY_MARKETPLACE_ID) envVars.EBAY_MARKETPLACE_ID = envConfig.EBAY_MARKETPLACE_ID;
    if (envConfig.EBAY_CONTENT_LANGUAGE)
      envVars.EBAY_CONTENT_LANGUAGE = envConfig.EBAY_CONTENT_LANGUAGE;
    if (envConfig.EBAY_USER_REFRESH_TOKEN)
      envVars.EBAY_USER_REFRESH_TOKEN = envConfig.EBAY_USER_REFRESH_TOKEN;
    if (envConfig.EBAY_USER_ACCESS_TOKEN?.startsWith('v^'))
      envVars.EBAY_USER_ACCESS_TOKEN = envConfig.EBAY_USER_ACCESS_TOKEN;
    if (envConfig.EBAY_APP_ACCESS_TOKEN?.startsWith('v^'))
      envVars.EBAY_APP_ACCESS_TOKEN = envConfig.EBAY_APP_ACCESS_TOKEN;
    mcpServers.ebay = {
      command: 'npx',
      args: ['--yes', '--quiet', 'ebay-mcp'],
      env: { ...envVars, NODE_NO_WARNINGS: '1', NPM_CONFIG_UPDATE_NOTIFIER: 'false' },
    };
    writeFileSync(configPath, JSON.stringify(existing, null, 2));
    const otherServers = Object.keys(mcpServers).filter((k) => k !== 'ebay');
    return {
      success: true,
      configPath,
      details:
        otherServers.length > 0
          ? `Preserved ${otherServers.length} existing server(s): ${otherServers.join(', ')}`
          : `Added ebay server (${Object.keys(mcpServers).length} total)`,
    };
  } catch (error) {
    return {
      success: false,
      configPath,
      error: getErrorMessage(error, 'Unknown'),
    };
  }
}

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

function saveConfig(envConfig: Record<string, string>, environment: string): void {
  const envPath = join(PROJECT_ROOT, '.env');
  const marketplaceLine = envConfig.EBAY_MARKETPLACE_ID
    ? `EBAY_MARKETPLACE_ID=${quoteEnvValue(envConfig.EBAY_MARKETPLACE_ID)}`
    : '# EBAY_MARKETPLACE_ID=EBAY_US';
  const contentLanguageLine = envConfig.EBAY_CONTENT_LANGUAGE
    ? `EBAY_CONTENT_LANGUAGE=${quoteEnvValue(envConfig.EBAY_CONTENT_LANGUAGE)}`
    : '# EBAY_CONTENT_LANGUAGE=en-US';
  writeFileSync(
    envPath,
    `# eBay MCP Server Configuration
# Last Updated: ${formatDate(new Date())}
# Environment: ${environment}

EBAY_CLIENT_ID=${quoteEnvValue(envConfig.EBAY_CLIENT_ID || '')}
EBAY_CLIENT_SECRET=${quoteEnvValue(envConfig.EBAY_CLIENT_SECRET || '')}
EBAY_REDIRECT_URI=${quoteEnvValue(envConfig.EBAY_REDIRECT_URI || '')}
EBAY_ENVIRONMENT=${environment}
${marketplaceLine}
${contentLanguageLine}

EBAY_USER_REFRESH_TOKEN=${quoteEnvValue(envConfig.EBAY_USER_REFRESH_TOKEN || '')}
EBAY_USER_ACCESS_TOKEN=${quoteEnvValue(envConfig.EBAY_USER_ACCESS_TOKEN || '')}
EBAY_APP_ACCESS_TOKEN=${quoteEnvValue(envConfig.EBAY_APP_ACCESS_TOKEN || '')}
`,
    'utf-8'
  );
}

function showInfo(message: string): void {
  console.log(`  ${ui.info('ℹ')} ${message}`);
}

function showWarning(message: string): void {
  console.log(`  ${ui.warning('⚠')} ${message}`);
}

function showSuccess(message: string): void {
  console.log(`  ${ui.success('✓')} ${message}`);
}

function showError(message: string): void {
  console.log(`  ${ui.error('✗')} ${message}`);
}

function showBox(title: string, content: string[]): void {
  const width = 54;
  const line = '─'.repeat(width);
  console.log(
    `  ${ui.dim('┌─')} ${ui.bold(title)} ${ui.dim('─'.repeat(width - title.length - 2))}┐`
  );
  for (const item of content) {
    const displayItem = item.length > width - 2 ? item.slice(0, width - 5) + '...' : item;
    console.log(`  ${ui.dim('│')} ${displayItem.padEnd(width)}${ui.dim('│')}`);
  }
  console.log(`  ${ui.dim('└' + line + '┘')}\n`);
}

function showSetupProgress(message: string): () => void {
  console.log(`  ⠋  ${message}...`);
  return () => undefined;
}

function displayUserInfo(userInfo: EbayUserInfo): void {
  const name =
    userInfo.individualAccount?.firstName && userInfo.individualAccount?.lastName
      ? `${userInfo.individualAccount.firstName} ${userInfo.individualAccount.lastName}`
      : userInfo.businessAccount?.name || 'N/A';
  const email = userInfo.individualAccount?.email || userInfo.businessAccount?.email || 'N/A';
  const marketplaceMap: Record<string, string> = {
    EBAY_US: 'eBay United States',
    EBAY_GB: 'eBay United Kingdom',
    EBAY_DE: 'eBay Germany',
    EBAY_AU: 'eBay Australia',
    EBAY_CA: 'eBay Canada',
    EBAY_FR: 'eBay France',
    EBAY_IT: 'eBay Italy',
    EBAY_ES: 'eBay Spain',
  };
  const marketplace =
    marketplaceMap[userInfo.registrationMarketplaceId || ''] ||
    userInfo.registrationMarketplaceId ||
    'N/A';
  console.log(`  ${ui.dim('┌─ eBay Account Verified ─────────────────────────')}`);
  console.log(`  ${ui.dim('│')} Username:     ${userInfo.username}`);
  console.log(`  ${ui.dim('│')} Name:         ${name}`);
  console.log(`  ${ui.dim('│')} Email:        ${email}`);
  console.log(`  ${ui.dim('│')} Type:         ${userInfo.accountType || 'N/A'}`);
  console.log(`  ${ui.dim('│')} Marketplace:  ${marketplace}`);
  console.log(`  ${ui.dim('└─────────────────────────────────────────────────')}`);
  console.log('');
}

/** Default loopback port for the OAuth auto-capture callback server. */
const DEFAULT_CALLBACK_PORT = 3000;

/**
 * Resolve the loopback port for the auto-capture callback server. Reads the
 * `EBAY_OAUTH_CALLBACK_PORT` override and falls back to
 * {@link DEFAULT_CALLBACK_PORT} for anything non-numeric or out of range.
 *
 * Note: eBay rejects `http://` and `localhost` for a RuName's auth-accepted URL
 * (HTTPS is mandatory), so the loopback server must be fronted by an HTTPS
 * tunnel that forwards to this port — the registered URL is the tunnel's, not
 * `http://localhost:<port>`.
 */
function getCallbackPort(): number {
  const raw = process.env.EBAY_OAUTH_CALLBACK_PORT;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : DEFAULT_CALLBACK_PORT;
}

/**
 * Exchange an authorization code for tokens, verify the eBay account, mint an app
 * token, report expiry, and sync Claude Desktop config. Shared by the paste-code
 * and auto-capture OAuth paths so both behave identically; mutates `tokens` in place.
 */
async function completeOAuthWithCode(
  authCode: string,
  params: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    environment: 'sandbox' | 'production';
    answers: Record<string, string>;
  },
  tokens: { refreshToken?: string; accessToken?: string; appAccessToken?: string }
): Promise<void> {
  const { clientId, clientSecret, redirectUri, environment, answers } = params;
  const stopSpinner = showSetupProgress('Exchanging authorization code for tokens');
  try {
    const result = await exchangeAuthorizationCode(
      authCode,
      clientId,
      clientSecret,
      redirectUri,
      environment
    );
    stopSpinner();
    showSuccess('Authorization code exchanged successfully!');
    tokens.refreshToken = result.refreshToken;
    tokens.accessToken = result.accessToken;
    try {
      const userInfo = await fetchEbayUserInfo(result.accessToken, environment);
      showSuccess('Account verified!');
      displayUserInfo(userInfo);
    } catch (userError) {
      const userMsg = describeHttpError(userError, 'Unknown');
      showWarning(`Could not fetch account info: ${userMsg}`);
      if (userMsg.toLowerCase().includes('access denied'))
        showInfo('Normal if RuName lacks commerce.identity.readonly scope — tokens are valid.');
    }
    try {
      tokens.appAccessToken = await getAppAccessToken(clientId, clientSecret, environment);
      showSuccess('App access token obtained.');
    } catch {
      showWarning('Could not obtain app access token (user tokens still work).');
    }
    showInfo(`Access token expires in: ${Math.floor(result.expiresIn / 60)} minutes`);
    showInfo(
      `Refresh token expires in: ${Math.floor(result.refreshTokenExpiresIn / 60 / 60 / 24)} days`
    );
    if (isClaudeDesktopInstalled()) {
      const r = updateClaudeDesktopConfig(
        {
          ...answers,
          EBAY_USER_REFRESH_TOKEN: tokens.refreshToken ?? '',
          EBAY_USER_ACCESS_TOKEN: tokens.accessToken ?? '',
        },
        environment
      );
      if (r.success) {
        showSuccess('Claude Desktop config updated.');
        if (r.details) showInfo(r.details);
      } else showWarning(`Could not update Claude Desktop: ${r.error}`);
    }
  } catch (error) {
    stopSpinner();
    const msg = describeHttpError(error, 'Unknown error');
    showError(`Failed to exchange code: ${msg}`);
    console.log('  Common issues:');
    console.log('  • Authorization code expired (codes are valid for ~5 minutes)');
    console.log('  • Code was already used (each code can only be used once)');
    console.log('  • Redirect URI mismatch\n');
  }
}

// ─── Setup wizard ─────────────────────────────────────────────────────────────

/**
 * Runs the interactive eBay MCP setup wizard from the script entry point.
 */
export async function runSetup(): Promise<void> {
  const existingConfig = loadExistingConfig(PROJECT_ROOT);
  const detectedClients = detectLLMClients();
  const availableClients = detectedClients.filter((c) => c.detected);

  const tokens: {
    refreshToken?: string;
    accessToken?: string;
    appAccessToken?: string;
  } = {};

  const finalStepId = availableClients.length > 0 ? 'mcp-clients' : 'no-mcp-clients';

  const args = parseArgs();

  printWizardBanner();

  console.log(ui.dim('  Welcome to the eBay MCP Server setup wizard!\n'));
  console.log('  This wizard will help you:\n');
  console.log(`    ${ui.success('1.')} Choose environment (sandbox/production)`);
  console.log(`    ${ui.success('2.')} Set default marketplace and language (optional)`);
  console.log(`    ${ui.success('3.')} Configure your eBay Developer credentials`);
  console.log(`    ${ui.success('4.')} Set up OAuth authentication`);
  console.log(`    ${ui.success('5.')} Configure your MCP client (Claude, Cline, etc.)`);
  console.log(`    ${ui.success('6.')} Validate your setup\n`);

  if (Object.keys(existingConfig).length > 0) {
    showInfo('Existing configuration detected. You can update or keep current values.');
    console.log('');
  }

  const wizardConfig = defineWizard({
    meta: {
      name: 'eBay MCP',
      description: 'Server Setup Wizard',
    },
    theme: {
      tokens: {
        primary: '#0064D2',
        success: '#86B817',
        warning: '#F5AF02',
        error: '#E53238',
      },
    },
    steps: [
      {
        id: 'environment',
        type: 'select',
        message: 'Select eBay environment:',
        description: '🧪 Sandbox for testing  •  🚀 Production for live trading',
        options: [
          { value: 'sandbox', label: '🧪 Sandbox  — development & testing (recommended)' },
          { value: 'production', label: '🚀 Production — live trading' },
        ],
        default: (existingConfig.EBAY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      },
      {
        id: 'marketplace',
        type: 'select',
        message: 'Default eBay marketplace:',
        description: 'Used as a default header for API requests — optional',
        options: [
          { value: '', label: 'Skip — leave unset' },
          ...MARKETPLACE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          { value: '__custom__', label: 'Other — enter manually' },
        ],
        default: existingConfig.EBAY_MARKETPLACE_ID || 'EBAY_US',
      },
      {
        id: 'marketplace-custom',
        type: 'text',
        message: 'Enter marketplace ID:',
        description: 'e.g. EBAY_US, EBAY_DE',
        when: { field: 'marketplace', equals: '__custom__' },
        default: existingConfig.EBAY_MARKETPLACE_ID || 'EBAY_US',
        validate: [{ rule: 'required' }],
      },
      {
        id: 'content-language',
        type: 'select',
        message: 'Default Content-Language:',
        description: 'Used as a default header for API requests — optional',
        options: [
          { value: '', label: 'Skip — leave unset' },
          ...CONTENT_LANGUAGE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          { value: '__custom__', label: 'Other — enter manually' },
        ],
        default: existingConfig.EBAY_CONTENT_LANGUAGE || 'en-US',
      },
      {
        id: 'content-language-custom',
        type: 'text',
        message: 'Enter Content-Language:',
        description: 'e.g. en-US, de-DE',
        when: { field: 'content-language', equals: '__custom__' },
        default: existingConfig.EBAY_CONTENT_LANGUAGE || 'en-US',
        validate: [{ rule: 'required' }],
      },
      {
        id: 'client-id',
        type: 'text',
        message: 'Client ID (App ID):',
        description: 'From https://developer.ebay.com/my/keys',
        default: existingConfig.EBAY_CLIENT_ID || '',
        validate: [{ rule: 'required' }],
      },
      {
        id: 'client-secret',
        type: 'password',
        message: 'Client Secret (Cert ID):',
        description: existingConfig.EBAY_CLIENT_SECRET
          ? 'Press Enter to keep existing secret'
          : 'From https://developer.ebay.com/my/keys',
        required: existingConfig.EBAY_CLIENT_SECRET ? false : true,
      },
      {
        id: 'redirect-uri',
        type: 'text',
        message: 'Redirect URI (RuName):',
        description: 'The RuName configured in your eBay developer account',
        default: existingConfig.EBAY_REDIRECT_URI || '',
        validate: [{ rule: 'required' }],
      },
      {
        id: 'oauth-method',
        type: 'select',
        message: 'Set up OAuth for higher API rate limits:',
        description: 'App credentials: 1,000 req/day  •  User OAuth: 10,000–50,000 req/day',
        options: [
          {
            value: 'manual',
            label: '🔗 Generate OAuth URL (opens browser, paste code) — recommended',
          },
          { value: 'code', label: '🔑 Paste authorization code (already have code)' },
          { value: 'existing', label: '📝 I have a refresh token' },
          { value: 'auto', label: '🤖 Auto-capture (advanced — needs a public HTTPS tunnel)' },
          { value: 'skip', label: '⏭️  Skip for now (1,000 req/day limit)' },
        ],
      },
      {
        id: 'oauth-token',
        type: 'text',
        message: 'Paste your refresh token:',
        description: 'Should start with v^1.1#',
        default: '',
      },
      {
        id: 'oauth-code',
        type: 'text',
        message: 'Paste the callback URL or authorization code:',
        description: 'Copy the full redirect URL or just the code= parameter',
        default: '',
      },
      ...(availableClients.length > 0
        ? ([
            {
              id: 'mcp-clients',
              type: 'multiselect' as const,
              message: 'Configure MCP clients:',
              description: 'Select AI assistants to connect to the eBay MCP server',
              required: false,
              options: availableClients.map((c) => ({
                value: c.name,
                label: `${c.displayName}${c.configExists ? '  (update)' : '  (new)'}`,
              })),
            },
          ] as const)
        : ([
            {
              id: 'no-mcp-clients',
              type: 'note' as const,
              message: 'No MCP clients detected',
              description:
                'Install Claude Desktop, Cline (VSCode), or Continue.dev, then run setup again.',
            },
          ] as const)),
    ],
  });

  const answers = await runWizard(wizardConfig, {
    renderer: new ClackRenderer(),
    quiet: true,

    optionsProvider: (stepId) => {
      if (stepId === 'oauth-method') {
        const hasToken = existingConfig.EBAY_USER_REFRESH_TOKEN?.startsWith('v^1.1#');
        if (hasToken) {
          return [
            { value: 'keep', label: '✓  Keep and verify existing token' },
            {
              value: 'manual',
              label: '🔗 Generate OAuth URL (opens browser, paste code) — recommended',
            },
            { value: 'code', label: '🔑 Paste authorization code' },
            { value: 'existing', label: '📝 Replace with a different refresh token' },
            { value: 'auto', label: '🤖 Auto-capture (advanced — needs a public HTTPS tunnel)' },
            { value: 'skip', label: '⏭️  Skip for now' },
          ];
        }
      }
      return undefined;
    },

    asyncValidate: (stepId, value) => {
      if (stepId === 'oauth-token') {
        const clean = String(value)
          .trim()
          .replace(/^["']|["']$/g, '');
        if (!clean) return 'Token is required';
        if (!clean.startsWith('v^1.1#')) return 'Token should start with v^1.1#';
      }
      if (stepId === 'oauth-code') {
        const code = parseAuthorizationCode(String(value));
        if (!code)
          return 'Could not find authorization code. Paste the full redirect URL or the code parameter.';
      }
      return null;
    },

    onAfterStep: async (stepId, value, context) => {
      const a = context.answers;
      const environment = (a.environment as 'sandbox' | 'production') || 'sandbox';
      const clientId = (a['client-id'] as string) || existingConfig.EBAY_CLIENT_ID || '';
      const clientSecret =
        (a['client-secret'] as string) || existingConfig.EBAY_CLIENT_SECRET || '';
      const redirectUri = (a['redirect-uri'] as string) || existingConfig.EBAY_REDIRECT_URI || '';

      if (stepId === 'environment' && args.quick) {
        showInfo('Quick setup enabled — skipping optional marketplace configuration.');
        context.setNextStep('client-id');
      }

      // ── oauth-method: dispatch to correct sub-flow ─────────────────────────
      if (stepId === 'oauth-method') {
        const method = value as string;

        switch (method) {
          case 'keep': {
            const stopSpinner = showSetupProgress('Verifying existing refresh token...');
            try {
              const { accessToken, userInfo } = await verifyRefreshToken(
                existingConfig.EBAY_USER_REFRESH_TOKEN,
                clientId,
                clientSecret,
                environment
              );
              stopSpinner();
              showSuccess('Refresh token verified!');
              tokens.refreshToken = existingConfig.EBAY_USER_REFRESH_TOKEN;
              tokens.accessToken = accessToken;
              displayUserInfo(userInfo);
              try {
                tokens.appAccessToken = await getAppAccessToken(
                  clientId,
                  clientSecret,
                  environment
                );
                showSuccess('App access token obtained.');
              } catch {
                showWarning('Could not obtain app access token (user tokens still work).');
              }
              if (isClaudeDesktopInstalled()) {
                const r = updateClaudeDesktopConfig(
                  {
                    ...(a as Record<string, string>),
                    EBAY_USER_REFRESH_TOKEN: tokens.refreshToken ?? '',
                  },
                  environment
                );
                if (r.success) {
                  showSuccess('Claude Desktop config updated.');
                  if (r.details) showInfo(r.details);
                } else showWarning(`Could not update Claude Desktop: ${r.error}`);
              }
            } catch (error) {
              stopSpinner();
              const msg = describeHttpError(error, 'Unknown error');
              showError(`Token verification failed: ${msg}`);
              if (msg.toLowerCase().includes('access denied'))
                showWarning('Token may be missing required OAuth scopes.');
              else showWarning('Existing token may be expired or invalid.');
              showInfo('Continuing with existing token — re-run setup to refresh it.');
              tokens.refreshToken = existingConfig.EBAY_USER_REFRESH_TOKEN;
            }
            context.setNextStep(finalStepId);
            break;
          }
          case 'existing':
            context.setNextStep('oauth-token');
            break;
          case 'auto': {
            const callbackPort = getCallbackPort();
            const callbackUrl = `http://localhost:${callbackPort}/oauth/callback`;
            const state = randomUUID();
            context.showNote(
              'Auto-capture (local callback server)',
              [
                `A loopback server listens at ${callbackUrl} to catch eBay's redirect.`,
                'eBay does NOT accept http:// or localhost as a RuName auth-accepted URL —',
                'it requires a public HTTPS URL — so expose this port through an HTTPS tunnel',
                'and register the tunnel URL (one-time, in the eBay Developer Portal):',
                '',
                `  1. Start an HTTPS tunnel to the port:   ngrok http ${callbackPort}`,
                '  2. https://developer.ebay.com/my/keys → your RuName → "Your auth accepted URL":',
                '     set it to   https://<your-tunnel-host>/oauth/callback',
                '',
                "The tunnel forwards eBay's redirect here, where the code is captured.",
                'Override the local port with EBAY_OAUTH_CALLBACK_PORT.',
              ].join('\n')
            );
            const authUrl = getOAuthAuthorizationUrl(
              clientId,
              redirectUri,
              environment,
              undefined,
              undefined,
              state
            );
            let server: Server | undefined;
            const stopSpinner = showSetupProgress(
              'Waiting for eBay to redirect back (up to 5 min)'
            );
            try {
              const started = await startCallbackServer(callbackPort, 300000, {
                expectedState: state,
              });
              server = started.server;
              await context.openBrowser(authUrl);
              showInfo('1. Sign in to your eBay account in the browser');
              showInfo('2. Grant permissions to your app');
              showInfo('3. eBay redirects back automatically — no copy-paste needed');
              const result = await started.codePromise;
              stopSpinner();
              if (!result.code)
                throw new Error(
                  result.errorDescription ?? result.error ?? 'No authorization code received'
                );
              showSuccess('Authorization code captured automatically!');
              await completeOAuthWithCode(
                result.code,
                {
                  clientId,
                  clientSecret,
                  redirectUri,
                  environment,
                  answers: a as Record<string, string>,
                },
                tokens
              );
              context.setNextStep(finalStepId);
            } catch (error) {
              stopSpinner();
              showError(`Auto-capture failed: ${getErrorMessage(error, 'Unknown error')}`);
              showInfo('Falling back to manual paste — copy the redirect URL from your browser.');
              context.showNote('OAuth Authorization URL', authUrl);
              context.setNextStep('oauth-code');
            } finally {
              server?.close();
            }
            break;
          }
          case 'manual': {
            const authUrl = getOAuthAuthorizationUrl(clientId, redirectUri, environment);
            context.showNote('OAuth Authorization URL', authUrl);
            await context.openBrowser(authUrl);
            showInfo('1. Sign in to your eBay account in the browser');
            showInfo('2. Grant permissions to your app');
            showInfo('3. Copy the redirect URL or the code parameter, then paste it below');
            console.log('');
            context.setNextStep('oauth-code');
            break;
          }
          case 'code':
            context.setNextStep('oauth-code');
            break;
          case 'skip':
            showWarning("Skipping OAuth — you'll be limited to 1,000 requests/day.");
            context.setNextStep(finalStepId);
            break;
        }
      }

      // ── oauth-token: verify pasted refresh token ───────────────────────────
      if (stepId === 'oauth-token') {
        const rawToken = String(value)
          .trim()
          .replace(/^["']|["']$/g, '');
        tokens.refreshToken = rawToken;
        const stopSpinner = showSetupProgress('Verifying refresh token...');
        try {
          const { accessToken, userInfo } = await verifyRefreshToken(
            rawToken,
            clientId,
            clientSecret,
            environment
          );
          stopSpinner();
          showSuccess('Refresh token verified!');
          tokens.accessToken = accessToken;
          displayUserInfo(userInfo);
          try {
            tokens.appAccessToken = await getAppAccessToken(clientId, clientSecret, environment);
            showSuccess('App access token obtained.');
          } catch {
            showWarning('Could not obtain app access token (user tokens still work).');
          }
          if (isClaudeDesktopInstalled()) {
            const r = updateClaudeDesktopConfig(
              { ...(a as Record<string, string>), EBAY_USER_REFRESH_TOKEN: rawToken },
              environment
            );
            if (r.success) {
              showSuccess('Claude Desktop config updated.');
              if (r.details) showInfo(r.details);
            } else showWarning(`Could not update Claude Desktop: ${r.error}`);
          }
        } catch (error) {
          stopSpinner();
          const msg = describeHttpError(error, 'Unknown error');
          showError(`Token verification failed: ${msg}`);
          showWarning("Token saved anyway — you may need to re-authenticate if it doesn't work.");
        }
        context.setNextStep(finalStepId);
      }

      // ── oauth-code: exchange authorization code for tokens ─────────────────
      if (stepId === 'oauth-code') {
        const authCode = parseAuthorizationCode(String(value));
        if (!authCode) return;
        await completeOAuthWithCode(
          authCode,
          {
            clientId,
            clientSecret,
            redirectUri,
            environment,
            answers: a as Record<string, string>,
          },
          tokens
        );
        context.setNextStep(finalStepId);
      }

      // ── mcp-clients: configure selected clients ────────────────────────────
      if (stepId === 'mcp-clients') {
        const selectedNames = value as string[];
        for (const name of selectedNames) {
          const client = detectedClients.find((c) => c.name === name);
          if (!client) continue;
          const stopSpinner = showSetupProgress(`Configuring ${client.displayName}...`);
          await new Promise((r) => {
            setTimeout(r, 400);
          });
          const success = configureLLMClient(client.name, PROJECT_ROOT);
          stopSpinner();
          if (success) showSuccess(`Configured ${client.displayName}`);
          else showError(`Failed to configure ${client.displayName}`);
        }
      }
    },

    onCancel: () => {
      console.log(ui.warning('\n  Setup cancelled.\n'));
      process.exit(0);
    },
  });

  // ── Persist final .env ─────────────────────────────────────────────────────

  const marketplaceId =
    answers.marketplace === '__custom__'
      ? (answers['marketplace-custom'] as string)
      : (answers.marketplace as string);

  const contentLanguage =
    answers['content-language'] === '__custom__'
      ? (answers['content-language-custom'] as string)
      : (answers['content-language'] as string);

  const environment = answers.environment as string;

  const finalConfig: Record<string, string> = {
    EBAY_CLIENT_ID: answers['client-id'] as string,
    EBAY_CLIENT_SECRET:
      (answers['client-secret'] as string) || existingConfig.EBAY_CLIENT_SECRET || '',
    EBAY_REDIRECT_URI: answers['redirect-uri'] as string,
    EBAY_ENVIRONMENT: environment,
    ...(marketplaceId ? { EBAY_MARKETPLACE_ID: marketplaceId } : {}),
    ...(contentLanguage ? { EBAY_CONTENT_LANGUAGE: contentLanguage } : {}),
    ...(tokens.refreshToken
      ? { EBAY_USER_REFRESH_TOKEN: tokens.refreshToken }
      : existingConfig.EBAY_USER_REFRESH_TOKEN
        ? { EBAY_USER_REFRESH_TOKEN: existingConfig.EBAY_USER_REFRESH_TOKEN }
        : {}),
    ...(tokens.accessToken ? { EBAY_USER_ACCESS_TOKEN: tokens.accessToken } : {}),
    ...(tokens.appAccessToken ? { EBAY_APP_ACCESS_TOKEN: tokens.appAccessToken } : {}),
  };

  const stopSave = showSetupProgress('Saving configuration...');
  await new Promise((r) => {
    setTimeout(r, 300);
  });
  saveConfig(finalConfig, environment);
  stopSave();
  showSuccess('Configuration saved to .env\n');

  printWizardBanner();

  console.log(ui.bold.green('\n  🎉 Setup Complete!\n'));
  showBox('Configuration Summary', [
    `Environment:     ${environment}`,
    `Marketplace ID:  ${finalConfig.EBAY_MARKETPLACE_ID || 'Not set'}`,
    `Content-Lang:    ${finalConfig.EBAY_CONTENT_LANGUAGE || 'Not set'}`,
    `Client ID:       ${(finalConfig.EBAY_CLIENT_ID || '').slice(0, 20)}...`,
    `Redirect URI:    ${(finalConfig.EBAY_REDIRECT_URI || '').slice(0, 30)}...`,
    `OAuth Token:     ${finalConfig.EBAY_USER_REFRESH_TOKEN ? '✓ Configured' : '✗ Not set'}`,
    `Rate Limit:      ${finalConfig.EBAY_USER_REFRESH_TOKEN ? '10k-50k/day' : '1k/day'}`,
  ]);

  console.log(ui.bold.cyan('\n  📋 Quick Reference\n'));
  console.log('  ' + ui.dim('─'.repeat(56)));
  console.log(`  ${ui.bold('Start MCP Server:')}     ${ui.info('npm start')}`);
  console.log(`  ${ui.bold('Run Diagnostics:')}      ${ui.info('npm run diagnose')}`);
  console.log(`  ${ui.bold('View Logs:')}            ${ui.info('npm run dev')}`);
  console.log(`  ${ui.bold('Run Tests:')}            ${ui.info('npm test')}`);
  console.log('  ' + ui.dim('─'.repeat(56)));

  console.log(ui.bold.cyan('\n  🚀 Next Steps\n'));
  console.log('  1. Restart your MCP client (Claude Desktop, etc.)');
  console.log('  2. The eBay server should appear in available tools');
  console.log('  3. Try: "Show my eBay seller information"\n');

  console.log(ui.dim('  Documentation: ') + ui.info('https://github.com/YosefHayim/ebay-mcp'));
  console.log(
    ui.dim('  Get Help:      ') + ui.info('https://github.com/YosefHayim/ebay-mcp/issues\n')
  );

  // Optional: offer to install agent skills (Codex / Claude Code / Cursor) so the
  // user's assistant knows how to drive the tools. Skipped in non-interactive runs.
  if (process.stdin.isTTY) {
    const { wantSkills } = (await prompts({
      type: 'confirm',
      name: 'wantSkills',
      message:
        'Install eBay AI skills (Codex / Claude Code / Cursor) so your assistant drives the tools faster?',
      initial: true,
    })) as { wantSkills?: boolean };
    if (wantSkills) {
      await runSkillsWizard({ fromSetup: true });
    } else {
      showInfo('You can install them later with: npm run skills');
    }
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

function parseArgs(): { help: boolean; quick: boolean; diagnose: boolean } {
  const args = process.argv.slice(2);
  return {
    help: args.includes('--help') || args.includes('-h'),
    quick: args.includes('--quick') || args.includes('-q'),
    diagnose: args.includes('--diagnose') || args.includes('-d'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('eBay MCP Server Setup')}  ${chalk.dim('interactive setup')}

${chalk.bold('Usage:')}
  npm run setup [options]

${chalk.bold('Options:')}
  --help, -h       Show this help message
  --quick, -q      Quick setup (skip optional configuration)
  --diagnose, -d   Run diagnostics only

${chalk.bold('Examples:')}
  npm run setup              Full interactive wizard
  npm run setup --quick      Skip optional configuration
  npm run setup --diagnose   Check system health
`);
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.diagnose) {
    console.clear();
    console.log(ui.bold.cyan('  Running Diagnostics...\n'));
    const securityResults = await runSecurityChecks(PROJECT_ROOT);
    displaySecurityResults(securityResults);
    const summary = await validateSetup(PROJECT_ROOT);
    displayRecommendations(summary);
    process.exit(0);
  }

  await runSetup();
}

process.on('SIGINT', () => {
  console.log(ui.warning('\n\n  Setup interrupted.\n'));
  process.exit(0);
});

const entryPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
const modulePath = resolve(fileURLToPath(import.meta.url));
if (entryPath && modulePath === entryPath) {
  main().catch((error) => {
    console.error(ui.error('\n  Setup failed:'), error);
    process.exit(1);
  });
}
