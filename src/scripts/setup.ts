#!/usr/bin/env node

import prompts from 'prompts';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir, platform } from 'os';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

const TOTAL_STEPS = 5;

interface SetupState {
  currentStep: number;
  config: Record<string, string>;
  detectedClients: LLMClient[];
  environment: 'sandbox' | 'production';
  hasExistingConfig: boolean;
  isQuickMode: boolean;
}

interface LLMClient {
  name: string;
  displayName: string;
  configPath: string;
  detected: boolean;
  configExists: boolean;
}

const ebay = {
  red: chalk.hex('#E53238'),
  blue: chalk.hex('#0064D2'),
  yellow: chalk.hex('#F5AF02'),
  green: chalk.hex('#86B817'),
};

const ui = {
  dim: chalk.dim,
  bold: chalk.bold,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
  hint: chalk.gray,
};

const LOGO = `
   ${ebay.red('███████╗')}${ebay.blue('██████╗ ')}${ebay.yellow('█████╗ ')}${ebay.green('██╗   ██╗')}
   ${ebay.red('██╔════╝')}${ebay.blue('██╔══██╗')}${ebay.yellow('██╔══██╗')}${ebay.green('╚██╗ ██╔╝')}
   ${ebay.red('█████╗  ')}${ebay.blue('██████╔╝')}${ebay.yellow('███████║')}${ebay.green(' ╚████╔╝ ')}
   ${ebay.red('██╔══╝  ')}${ebay.blue('██╔══██╗')}${ebay.yellow('██╔══██║')}${ebay.green('  ╚██╔╝  ')}
   ${ebay.red('███████╗')}${ebay.blue('██████╔╝')}${ebay.yellow('██║  ██║')}${ebay.green('   ██║   ')}
   ${ebay.red('╚══════╝')}${ebay.blue('╚═════╝ ')}${ebay.yellow('╚═╝  ╚═╝')}${ebay.green('   ╚═╝   ')}
`;

function clearScreen(): void {
  console.clear();
}

function showLogo(): void {
  console.log(LOGO);
  console.log(ui.bold.white('            MCP Server Setup Wizard\n'));
}

function showProgress(step: number, title: string): void {
  const filled = '●'.repeat(step);
  const empty = '○'.repeat(TOTAL_STEPS - step);
  const progress = `${ui.info(filled)}${ui.dim(empty)}`;

  console.log(ui.dim('─'.repeat(60)));
  console.log(`  ${progress}  ${ui.bold(`Step ${step}/${TOTAL_STEPS}`)}: ${title}`);
  console.log(ui.dim('─'.repeat(60)) + '\n');
}

function showKeyboardHints(hints: string[]): void {
  const hintText = hints.map((h) => ui.dim(h)).join('  │  ');
  console.log(`\n  ${hintText}\n`);
}

function showTip(message: string): void {
  console.log(`  ${ebay.yellow('💡 Tip:')} ${ui.dim(message)}\n`);
}

function showSuccess(message: string): void {
  console.log(`  ${ui.success('✓')} ${message}`);
}

function showError(message: string): void {
  console.log(`  ${ui.error('✗')} ${message}`);
}

function showWarning(message: string): void {
  console.log(`  ${ui.warning('⚠')} ${message}`);
}

function showInfo(message: string): void {
  console.log(`  ${ui.info('ℹ')} ${message}`);
}

function showSpinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;

  process.stdout.write(`  ${ui.info(frames[0])} ${message}`);

  const interval = setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.write(`\r  ${ui.info(frames[i])} ${message}`);
  }, 80);

  return () => {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(message.length + 10) + '\r');
  };
}

function showBox(title: string, content: string[]): void {
  const width = 60;
  const line = '─'.repeat(width - 2);

  console.log(`\n  ${ui.dim('┌' + line + '┐')}`);
  console.log(`  ${ui.dim('│')} ${ui.bold(title.padEnd(width - 3))}${ui.dim('│')}`);
  console.log(`  ${ui.dim('├' + line + '┤')}`);

  for (const item of content) {
    const displayItem = item.length > width - 4 ? item.slice(0, width - 7) + '...' : item;
    console.log(`  ${ui.dim('│')} ${displayItem.padEnd(width - 3)}${ui.dim('│')}`);
  }

  console.log(`  ${ui.dim('└' + line + '┘')}\n`);
}

function getConfigPaths(): Record<string, { display: string; path: string }> {
  const home = homedir();
  const os = platform();
  const paths: Record<string, { display: string; path: string }> = {};

  if (os === 'darwin') {
    paths.claude = {
      display: 'Claude Desktop',
      path: join(home, 'Library/Application Support/Claude/claude_desktop_config.json'),
    };
    paths.cline = {
      display: 'Cline (VSCode)',
      path: join(
        home,
        'Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
      ),
    };
  } else if (os === 'win32') {
    paths.claude = {
      display: 'Claude Desktop',
      path: join(home, 'AppData/Roaming/Claude/claude_desktop_config.json'),
    };
    paths.cline = {
      display: 'Cline (VSCode)',
      path: join(
        home,
        'AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
      ),
    };
  } else {
    paths.claude = {
      display: 'Claude Desktop',
      path: join(home, '.config/Claude/claude_desktop_config.json'),
    };
    paths.cline = {
      display: 'Cline (VSCode)',
      path: join(
        home,
        '.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
      ),
    };
  }

  paths.continue = {
    display: 'Continue.dev',
    path: join(home, '.continue/config.json'),
  };

  return paths;
}

function detectLLMClients(): LLMClient[] {
  const paths = getConfigPaths();
  const clients: LLMClient[] = [];

  for (const [name, info] of Object.entries(paths)) {
    const configExists = existsSync(info.path);
    const parentExists = existsSync(dirname(info.path));

    clients.push({
      name,
      displayName: info.display,
      configPath: info.path,
      detected: parentExists,
      configExists,
    });
  }

  return clients;
}

function configureLLMClient(client: LLMClient, projectRoot: string): boolean {
  try {
    const configDir = dirname(client.configPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    interface McpConfig {
      mcpServers?: Record<string, unknown>;
      experimental?: {
        modelContextProtocolServers?: unknown[];
      };
      [key: string]: unknown;
    }

    let existingConfig: McpConfig = {};

    if (existsSync(client.configPath)) {
      try {
        existingConfig = JSON.parse(readFileSync(client.configPath, 'utf-8')) as McpConfig;
      } catch {
        existingConfig = {};
      }
    }

    const serverConfig = {
      command: 'node',
      args: [join(projectRoot, 'build/index.js')],
    };

    if (client.name === 'continue') {
      if (!existingConfig.experimental) existingConfig.experimental = {};
      if (!existingConfig.experimental.modelContextProtocolServers) {
        existingConfig.experimental.modelContextProtocolServers = [];
      }
      const servers = existingConfig.experimental.modelContextProtocolServers as unknown[];
      const existingIndex = servers.findIndex((s: unknown) =>
        (s as { command?: string; args?: string[] })?.args?.[0]?.includes('ebay-mcp')
      );
      if (existingIndex >= 0) {
        servers[existingIndex] = serverConfig;
      } else {
        servers.push(serverConfig);
      }
    } else {
      if (!existingConfig.mcpServers) existingConfig.mcpServers = {};
      existingConfig.mcpServers['ebay'] = serverConfig;
    }

    writeFileSync(client.configPath, JSON.stringify(existingConfig, null, 2));
    return true;
  } catch {
    return false;
  }
}

function loadExistingConfig(): Record<string, string> {
  const envPath = join(PROJECT_ROOT, '.env');
  const envConfig: Record<string, string> = {};

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value && !value.includes('_here')) {
          envConfig[key.trim()] = value;
        }
      }
    }
  }

  return envConfig;
}

function saveConfig(envConfig: Record<string, string>, environment: string): void {
  const envPath = join(PROJECT_ROOT, '.env');

  const content = `# eBay MCP Server Configuration
# Generated: ${new Date().toISOString()}
# Environment: ${environment}

EBAY_CLIENT_ID=${envConfig.EBAY_CLIENT_ID || ''}
EBAY_CLIENT_SECRET=${envConfig.EBAY_CLIENT_SECRET || ''}
EBAY_REDIRECT_URI=${envConfig.EBAY_REDIRECT_URI || ''}
EBAY_ENVIRONMENT=${environment}

EBAY_USER_REFRESH_TOKEN=${envConfig.EBAY_USER_REFRESH_TOKEN || ''}
EBAY_USER_ACCESS_TOKEN=${envConfig.EBAY_USER_ACCESS_TOKEN || ''}
EBAY_APP_ACCESS_TOKEN=${envConfig.EBAY_APP_ACCESS_TOKEN || ''}
`;

  writeFileSync(envPath, content, 'utf-8');
}

async function stepWelcome(state: SetupState): Promise<boolean> {
  clearScreen();
  showLogo();

  console.log(ui.dim('  Welcome to the eBay MCP Server setup wizard!\n'));
  console.log('  This wizard will help you:\n');
  console.log(`    ${ui.success('1.')} Configure your eBay Developer credentials`);
  console.log(`    ${ui.success('2.')} Set up OAuth authentication`);
  console.log(`    ${ui.success('3.')} Configure your MCP client (Claude, Cline, etc.)`);
  console.log(`    ${ui.success('4.')} Validate your setup\n`);

  if (state.hasExistingConfig) {
    showInfo('Existing configuration detected. You can update or keep current values.');
  }

  showKeyboardHints(['Enter: Continue', 'Ctrl+C: Exit']);

  const response = await prompts({
    type: 'confirm',
    name: 'continue',
    message: 'Ready to begin?',
    initial: true,
  });

  return response.continue !== false;
}

async function stepEnvironment(state: SetupState): Promise<boolean> {
  clearScreen();
  showLogo();
  showProgress(1, 'Select Environment');

  console.log('  Choose which eBay environment to configure:\n');

  showBox('Environment Options', [
    '🧪 Sandbox  - For development & testing',
    '   • Free test transactions',
    '   • No real money involved',
    '   • Separate test accounts',
    '',
    '🚀 Production - For live trading',
    '   • Real transactions',
    '   • Actual eBay marketplace',
    '   • Requires approved app',
  ]);

  showTip('Start with Sandbox to test your integration safely.');

  const response = await prompts({
    type: 'select',
    name: 'environment',
    message: 'Select environment:',
    choices: [
      { title: '🧪 Sandbox (Recommended for testing)', value: 'sandbox' },
      { title: '🚀 Production (Live trading)', value: 'production' },
    ],
    initial: state.config.EBAY_ENVIRONMENT === 'production' ? 1 : 0,
  });

  if (!response.environment) return false;

  state.environment = response.environment;
  state.config.EBAY_ENVIRONMENT = response.environment;
  return true;
}

async function stepCredentials(state: SetupState): Promise<boolean> {
  clearScreen();
  showLogo();
  showProgress(2, 'eBay Credentials');

  console.log('  Enter your eBay Developer credentials:\n');

  showTip('Get credentials at: https://developer.ebay.com/my/keys');
  showKeyboardHints(['Tab: Next field', 'Enter: Submit', 'Ctrl+C: Cancel']);

  const responses = await prompts([
    {
      type: 'text',
      name: 'clientId',
      message: 'Client ID (App ID):',
      initial: state.config.EBAY_CLIENT_ID || '',
      validate: (v: string) => v.trim().length > 0 || 'Required',
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: 'Client Secret (Cert ID):',
      initial: state.config.EBAY_CLIENT_SECRET || '',
      validate: (v: string) => v.trim().length > 0 || 'Required',
    },
    {
      type: 'text',
      name: 'redirectUri',
      message: 'Redirect URI (RuName):',
      initial: state.config.EBAY_REDIRECT_URI || '',
      validate: (v: string) => v.trim().length > 0 || 'Required',
    },
  ]);

  if (!responses.clientId) return false;

  state.config.EBAY_CLIENT_ID = responses.clientId;
  state.config.EBAY_CLIENT_SECRET = responses.clientSecret;
  state.config.EBAY_REDIRECT_URI = responses.redirectUri;

  return true;
}

async function stepOAuth(state: SetupState): Promise<boolean> {
  clearScreen();
  showLogo();
  showProgress(3, 'OAuth Setup');

  console.log('  Configure user authentication for higher API rate limits:\n');

  showBox('Rate Limits by Auth Type', [
    'App Credentials Only:     1,000 req/day',
    'User Token (OAuth):    10,000-50,000 req/day',
    '',
    'User tokens require completing an OAuth flow.',
  ]);

  const hasToken = state.config.EBAY_USER_REFRESH_TOKEN?.startsWith('v^1.1#');

  if (hasToken) {
    showSuccess('Existing refresh token detected.');

    const keepToken = await prompts({
      type: 'confirm',
      name: 'keep',
      message: 'Keep existing refresh token?',
      initial: true,
    });

    if (keepToken.keep) {
      return true;
    }
  }

  const tokenChoice = await prompts({
    type: 'select',
    name: 'method',
    message: 'How would you like to set up OAuth?',
    choices: [
      { title: '📝 I have a refresh token', value: 'existing' },
      { title: '🔗 Generate OAuth URL (manual flow)', value: 'manual' },
      { title: '⏭️  Skip for now (1k req/day limit)', value: 'skip' },
    ],
    initial: 0,
  });

  if (!tokenChoice.method) return false;

  if (tokenChoice.method === 'existing') {
    const tokenInput = await prompts({
      type: 'text',
      name: 'token',
      message: 'Paste your refresh token:',
      validate: (v: string) => {
        const clean = v.trim().replace(/^["']|["']$/g, '');
        if (!clean) return 'Token is required';
        if (!clean.startsWith('v^1.1#')) return 'Token should start with v^1.1#';
        return true;
      },
    });

    if (tokenInput.token) {
      state.config.EBAY_USER_REFRESH_TOKEN = tokenInput.token.trim().replace(/^["']|["']$/g, '');
      showSuccess('Refresh token saved!');
    }
  } else if (tokenChoice.method === 'manual') {
    const scopes = [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
      'https://api.ebay.com/oauth/api_scope/sell.marketing',
      'https://api.ebay.com/oauth/api_scope/sell.account',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    ];

    const baseUrl =
      state.environment === 'production'
        ? 'https://auth.ebay.com/oauth2/authorize'
        : 'https://auth.sandbox.ebay.com/oauth2/authorize';

    const authUrl = `${baseUrl}?client_id=${encodeURIComponent(state.config.EBAY_CLIENT_ID)}&redirect_uri=${encodeURIComponent(state.config.EBAY_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}`;

    console.log('\n  ' + ui.bold('OAuth Authorization URL:'));
    console.log(ui.dim('  ' + '─'.repeat(56)));
    console.log(`  ${ui.info(authUrl)}`);
    console.log(ui.dim('  ' + '─'.repeat(56)));

    console.log('\n  ' + ui.bold('Steps:'));
    console.log('  1. Copy the URL above and open in browser');
    console.log('  2. Sign in to your eBay account');
    console.log('  3. Grant permissions to your app');
    console.log('  4. Copy the refresh token from the callback');
    console.log('  5. Run this setup again and paste the token\n');

    showKeyboardHints(['Enter: Continue']);
    await prompts({ type: 'text', name: 'continue', message: 'Press Enter to continue...' });
  } else {
    showWarning("Skipping OAuth. You'll be limited to 1,000 requests/day.");
  }

  return true;
}

async function stepMCPClients(state: SetupState): Promise<boolean> {
  clearScreen();
  showLogo();
  showProgress(4, 'MCP Client Setup');

  console.log('  Configure your AI assistant to use the eBay MCP server:\n');

  state.detectedClients = detectLLMClients();
  const detected = state.detectedClients.filter((c) => c.detected);

  if (detected.length === 0) {
    showWarning('No supported MCP clients detected.\n');
    console.log('  Supported clients:');
    console.log('    • Claude Desktop (Anthropic)');
    console.log('    • Cline (VSCode extension)');
    console.log('    • Continue.dev (VSCode/JetBrains)\n');

    showInfo('Install one of these clients and run setup again.');

    await prompts({ type: 'text', name: 'continue', message: 'Press Enter to continue...' });
    return true;
  }

  showBox(
    'Detected MCP Clients',
    detected.map((c) => {
      const status = c.configExists
        ? `${c.displayName} [Already configured]`
        : `${c.displayName} [Not configured]`;
      return status;
    })
  );

  const clientChoice = await prompts({
    type: 'multiselect',
    name: 'clients',
    message: 'Select clients to configure:',
    choices: detected.map((c) => ({
      title: c.displayName + (c.configExists ? chalk.yellow(' [Update]') : chalk.green(' [New]')),
      value: c.name,
      selected: !c.configExists,
    })),
    hint: 'Space: Toggle  Enter: Confirm',
    instructions: false,
  });

  if (!clientChoice.clients || clientChoice.clients.length === 0) {
    showInfo('Skipping client configuration.');
    return true;
  }

  console.log('');
  for (const clientName of clientChoice.clients) {
    const client = detected.find((c) => c.name === clientName);
    if (!client) continue;

    const stopSpinner = showSpinner(`Configuring ${client.displayName}...`);
    await new Promise((r) => setTimeout(r, 500));
    const success = configureLLMClient(client, PROJECT_ROOT);
    stopSpinner();

    if (success) {
      showSuccess(`Configured ${client.displayName}`);
    } else {
      showError(`Failed to configure ${client.displayName}`);
    }
  }

  return true;
}

async function stepComplete(state: SetupState): Promise<void> {
  clearScreen();
  showLogo();
  showProgress(5, 'Setup Complete');

  const stopSpinner = showSpinner('Saving configuration...');
  await new Promise((r) => setTimeout(r, 300));
  saveConfig(state.config, state.environment);
  stopSpinner();
  showSuccess('Configuration saved to .env\n');

  console.log(ui.bold.green('\n  🎉 Setup Complete!\n'));

  showBox('Configuration Summary', [
    `Environment:     ${state.environment}`,
    `Client ID:       ${state.config.EBAY_CLIENT_ID?.slice(0, 20)}...`,
    `Redirect URI:    ${state.config.EBAY_REDIRECT_URI?.slice(0, 30)}...`,
    `OAuth Token:     ${state.config.EBAY_USER_REFRESH_TOKEN ? '✓ Configured' : '✗ Not set'}`,
    `Rate Limit:      ${state.config.EBAY_USER_REFRESH_TOKEN ? '10k-50k/day' : '1k/day'}`,
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
}

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
${chalk.bold('eBay MCP Server Setup')}

${chalk.bold('Usage:')}
  npm run setup [options]

${chalk.bold('Options:')}
  --help, -h       Show this help message
  --quick, -q      Quick setup (skip optional steps)
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
    const { runSecurityChecks, displaySecurityResults } =
      await import('../utils/security-checker.js');
    const { validateSetup, displayRecommendations } = await import('../utils/setup-validator.js');

    clearScreen();
    showLogo();
    console.log(ui.bold.cyan('  Running Diagnostics...\n'));

    const securityResults = await runSecurityChecks(PROJECT_ROOT);
    displaySecurityResults(securityResults);

    const summary = await validateSetup(PROJECT_ROOT);
    displayRecommendations(summary);

    process.exit(0);
  }

  const existingConfig = loadExistingConfig();
  const state: SetupState = {
    currentStep: 0,
    config: existingConfig,
    detectedClients: [],
    environment: (existingConfig.EBAY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    hasExistingConfig: Object.keys(existingConfig).length > 0,
    isQuickMode: args.quick,
  };

  const steps = [stepWelcome, stepEnvironment, stepCredentials, stepOAuth, stepMCPClients];

  for (const step of steps) {
    const shouldContinue = await step(state);
    if (!shouldContinue) {
      console.log(ui.warning('\n  Setup cancelled.\n'));
      process.exit(0);
    }
  }

  await stepComplete(state);
}

process.on('SIGINT', () => {
  console.log(ui.warning('\n\n  Setup interrupted.\n'));
  process.exit(0);
});

main().catch((error) => {
  console.error(ui.error('\n  Setup failed:'), error);
  process.exit(1);
});
