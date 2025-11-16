/**
 * Auto-Setup Script for eBay API MCP Server
 *
 * This script automatically:
 * 1. Detects installed MCP clients (Claude Desktop, Gemini, ChatGPT)
 * 2. Generates MCP client configurations from .env
 * 3. Validates environment tokens configuration
 * 4. Validates the setup
 *
 * Usage: npm run auto-setup (or runs automatically after npm install)
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir, platform } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// ═══════════════════════════════════════════════════════════════════════════
// Color Utilities
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function print(message: string, color?: keyof typeof colors): void {
  const colorCode = color ? colors[color] : '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

function printSuccess(message: string): void {
  print(`✅ ${message}`, 'green');
}

function printWarning(message: string): void {
  print(`⚠️  ${message}`, 'yellow');
}

function printError(message: string): void {
  print(`❌ ${message}`, 'red');
}

function printInfo(message: string): void {
  print(`ℹ️  ${message}`, 'cyan');
}

function printHeader(message: string): void {
  print('\n═══════════════════════════════════════════════════════════════════════════', 'blue');
  print(`  ${message}`, 'cyan');
  print('═══════════════════════════════════════════════════════════════════════════\n', 'blue');
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP Client Detection
// ═══════════════════════════════════════════════════════════════════════════

interface MCPClient {
  name: string;
  configPath: string;
  detected: boolean;
  configGenerated?: boolean;
}

function getConfigPaths(): Record<string, string> {
  const home = homedir();
  const os = platform();

  const paths: Record<string, string> = {};

  // Claude Desktop config paths
  if (os === 'darwin') {
    paths.claude = join(home, 'Library/Application Support/Claude/claude_desktop_config.json');
  } else if (os === 'win32') {
    paths.claude = join(home, 'AppData/Roaming/Claude/claude_desktop_config.json');
  } else {
    paths.claude = join(home, '.config/Claude/claude_desktop_config.json');
  }

  // Gemini config path
  paths.gemini = join(home, '.config/gemini/config.json');

  // ChatGPT config path
  paths.chatgpt = join(home, '.config/chatgpt/config.json');

  return paths;
}

function detectMCPClients(): MCPClient[] {
  const configPaths = getConfigPaths();
  const clients: MCPClient[] = [];

  for (const [name, configPath] of Object.entries(configPaths)) {
    const detected = existsSync(configPath) || existsSync(dirname(configPath));
    clients.push({
      name,
      configPath,
      detected,
    });
  }

  return clients;
}

// ═══════════════════════════════════════════════════════════════════════════
// Configuration Generation
// ═══════════════════════════════════════════════════════════════════════════

interface MCPServerConfig {
  command: string;
  args: string[];
  env: {
    EBAY_CLIENT_ID: string;
    EBAY_CLIENT_SECRET: string;
    EBAY_ENVIRONMENT: string;
    EBAY_REDIRECT_URI?: string;
    EBAY_USER_ACCESS_TOKEN?: string;
    EBAY_USER_REFRESH_TOKEN?: string;
    EBAY_APP_ACCESS_TOKEN?: string;
  };
}

function generateMCPServerConfig(): MCPServerConfig {
  const buildPath = join(PROJECT_ROOT, 'build/index.js');

  const config: MCPServerConfig = {
    command: 'node',
    args: [buildPath],
    env: {
      EBAY_CLIENT_ID: process.env.EBAY_CLIENT_ID || '',
      EBAY_CLIENT_SECRET: process.env.EBAY_CLIENT_SECRET || '',
      EBAY_ENVIRONMENT: process.env.EBAY_ENVIRONMENT || 'sandbox',
    },
  };

  // Add optional environment variables if they exist
  if (process.env.EBAY_REDIRECT_URI) {
    config.env.EBAY_REDIRECT_URI = process.env.EBAY_REDIRECT_URI;
  }

  if (process.env.EBAY_USER_ACCESS_TOKEN) {
    config.env.EBAY_USER_ACCESS_TOKEN = process.env.EBAY_USER_ACCESS_TOKEN;
  }

  if (process.env.EBAY_USER_REFRESH_TOKEN) {
    config.env.EBAY_USER_REFRESH_TOKEN = process.env.EBAY_USER_REFRESH_TOKEN;
  }

  if (process.env.EBAY_APP_ACCESS_TOKEN) {
    config.env.EBAY_APP_ACCESS_TOKEN = process.env.EBAY_APP_ACCESS_TOKEN;
  }

  return config;
}

function updateClientConfig(client: MCPClient, serverConfig: MCPServerConfig): boolean {
  try {
    // Ensure directory exists
    const configDir = dirname(client.configPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Read existing config or create new one
    interface McpConfig {
      mcpServers: Record<string, unknown>;
      [key: string]: unknown;
    }
    let config: McpConfig = { mcpServers: {} };
    if (existsSync(client.configPath)) {
      try {
        const existing = readFileSync(client.configPath, 'utf-8');
        const parsed = JSON.parse(existing) as Partial<McpConfig>;
        config = {
          ...parsed,
          mcpServers: parsed.mcpServers || {},
        };
      } catch (error) {
        printWarning(`Invalid JSON in ${client.configPath}, creating backup and new config`);
        const backup = `${client.configPath}.backup.${Date.now()}`;
        writeFileSync(backup, readFileSync(client.configPath));
        printInfo(`Backup saved to: ${backup}`);
        config = { mcpServers: {} };
      }
    }

    // Update eBay server config
    config.mcpServers.ebay = serverConfig;

    // Write config
    writeFileSync(client.configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    printError(`Failed to update ${client.name} config: ${error}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Validation (Environment-based only)
// ═══════════════════════════════════════════════════════════════════════════

function validateTokens(): boolean {
  // Check if user refresh token is provided in .env
  const hasUserRefreshToken = process.env.EBAY_USER_REFRESH_TOKEN;

  if (!hasUserRefreshToken) {
    printInfo('No EBAY_USER_REFRESH_TOKEN in .env - will use app tokens (1k req/day)');
    printInfo('For higher rate limits (10k-50k req/day), add EBAY_USER_REFRESH_TOKEN to .env');
    return true; // Not an error, just informational
  }

  printSuccess('User refresh token found in .env - high rate limits enabled');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════════════════════

function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check .env file exists
  const envPath = join(PROJECT_ROOT, '.env');
  if (!existsSync(envPath)) {
    errors.push('.env file not found. Copy .env.example to .env and fill in your credentials.');
    return { valid: false, errors, warnings };
  }

  // Check required variables
  if (!process.env.EBAY_CLIENT_ID) {
    errors.push('EBAY_CLIENT_ID is not set in .env');
  }

  if (!process.env.EBAY_CLIENT_SECRET) {
    errors.push('EBAY_CLIENT_SECRET is not set in .env');
  }

  const environment = process.env.EBAY_ENVIRONMENT;
  if (environment && environment !== 'production' && environment !== 'sandbox') {
    errors.push(`EBAY_ENVIRONMENT must be "production" or "sandbox", got: "${environment}"`);
  }

  if (!process.env.EBAY_REDIRECT_URI) {
    warnings.push(
      'EBAY_REDIRECT_URI is not set - user OAuth flow will not work. This is required for 10k-50k req/day rate limits.'
    );
  }

  // Check build directory exists
  const buildPath = join(PROJECT_ROOT, 'build/index.js');
  if (!existsSync(buildPath)) {
    warnings.push('Build directory not found. Run "npm run build" first.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  printHeader('eBay API MCP Server - Auto Setup');

  // Step 1: Validate environment
  printInfo('Step 1/4: Validating environment configuration...');
  const validation = validateEnvironment();

  if (validation.errors.length > 0) {
    printError('Environment validation failed:');
    validation.errors.forEach((error) => print(`  • ${error}`, 'red'));
    print('\nPlease fix these errors and run again.', 'yellow');
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach((warning) => printWarning(warning));
  }

  printSuccess('Environment validation passed');

  // Step 2: Detect MCP clients
  print('\nStep 2/4: Detecting installed MCP clients...');
  const clients = detectMCPClients();
  const detectedClients = clients.filter((c) => c.detected);

  if (detectedClients.length === 0) {
    printWarning('No MCP clients detected on this system');
    printInfo('Supported clients: Claude Desktop, Gemini, ChatGPT');
    printInfo('Install a client and run this script again');
  } else {
    printSuccess(`Detected ${detectedClients.length} MCP client(s):`);
    detectedClients.forEach((client) => {
      print(`  • ${client.name.charAt(0).toUpperCase() + client.name.slice(1)}`, 'green');
    });
  }

  // Step 3: Generate configurations
  if (detectedClients.length > 0) {
    print('\nStep 3/4: Generating MCP client configurations...');
    const serverConfig = generateMCPServerConfig();

    for (const client of detectedClients) {
      const success = updateClientConfig(client, serverConfig);
      if (success) {
        printSuccess(`Generated config for ${client.name} at: ${client.configPath}`);
        client.configGenerated = true;
      }
    }
  } else {
    print('\nStep 3/4: Skipping config generation (no clients detected)');
  }

  // Step 4: Validate tokens
  print('\nStep 4/4: Validating token configuration...');
  validateTokens();

  // Final summary
  printHeader('Setup Complete! 🎉');

  const generatedCount = detectedClients.filter((c) => c.configGenerated).length;

  if (generatedCount > 0) {
    printSuccess(`Successfully configured ${generatedCount} MCP client(s)`);
    print('\n📝 Next Steps:', 'cyan');
    print('  1. Restart your MCP clients (Claude Desktop, Gemini, etc.)');
    print('  2. Verify connection in MCP client settings/logs');
    print('  3. Test with: "List my eBay inventory items"');

    if (validation.warnings.some((w) => w.includes('EBAY_REDIRECT_URI'))) {
      print('\n💡 Pro Tip:', 'yellow');
      print('  Add EBAY_REDIRECT_URI to .env for user OAuth (10k-50k req/day rate limits)');
    }
  } else {
    printInfo('No configurations generated (no MCP clients detected)');
    print('\n📝 To complete setup:', 'cyan');
    print('  1. Install an MCP client (Claude Desktop, Gemini, or ChatGPT)');
    print('  2. Run: npm run auto-setup');
  }

  print('\n📚 Documentation: https://github.com/YosefHayim/ebay-api-mcp-server#readme\n');
}

// Run the script
main().catch((error) => {
  printError(`Auto-setup failed: ${error}`);
  process.exit(1);
});
