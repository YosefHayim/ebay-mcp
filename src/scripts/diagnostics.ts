/**
 * Diagnostics Script - Troubleshooting and system health checks
 *
 * Usage:
 *   npm run diagnose
 *   npx ebay-mcp --diagnose
 */

import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runSecurityChecks, displaySecurityResults } from '../utils/security-checker.js';
import { validateSetup, displayRecommendations } from '../utils/setup-validator.js';
import { detectLLMClients } from '../utils/llm-client-detector.js';
import { displayScopeVerification, parseScopeString } from '../utils/scope-helper.js';
import { EbaySellerApi } from '../api/index.js';
import type { EbayConfig } from '../types/ebay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

interface DiagnosticReport {
  timestamp: string;
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  security: unknown[];
  configuration: unknown;
  llmClients: unknown[];
  apiConnection: {
    canReachEbay: boolean;
    error?: string;
  };
  tokenInfo?: {
    hasUserToken: boolean;
    hasAppToken: boolean;
    scopes?: string[];
  };
}

/**
 * Parse .env file
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};

  if (!existsSync(filePath)) {
    return env;
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = /^([^=]+)=(.*)$/.exec(trimmed);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  }

  return env;
}

/**
 * Check API connectivity
 */
async function checkApiConnectivity(): Promise<{ canReachEbay: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.ebay.com/health', {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return { canReachEbay: response.ok || response.status === 404 };
  } catch (error) {
    return {
      canReachEbay: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test eBay API authentication
 */
async function testEbayAuthentication(
  config: EbayConfig
): Promise<{ success: boolean; error?: string; userInfo?: unknown }> {
  try {
    const api = new EbaySellerApi(config);
    await api.initialize();

    // Try to get user info
    const userInfo = await api.identity.getUser();

    return { success: true, userInfo };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Display diagnostic header
 */
function displayHeader(): void {
  console.clear();
  console.log(
    chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              eBay MCP Server Diagnostics                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `)
  );
  console.log(chalk.gray(`Run date: ${new Date().toISOString()}\n`));
}

/**
 * Display system information
 */
function displaySystemInfo(): void {
  console.log(chalk.bold.cyan('💻 System Information\n'));
  console.log(`  ${chalk.gray('Node.js:')} ${process.version}`);
  console.log(`  ${chalk.gray('Platform:')} ${process.platform}`);
  console.log(`  ${chalk.gray('Architecture:')} ${process.arch}`);
  console.log(`  ${chalk.gray('CWD:')} ${process.cwd()}`);
  console.log('');
}

/**
 * Display configuration status
 */
function displayConfigurationStatus(envVars: Record<string, string>): void {
  console.log(chalk.bold.cyan('⚙️  Configuration Status\n'));

  const checks = [
    { key: 'EBAY_CLIENT_ID', label: 'Client ID', redact: true },
    { key: 'EBAY_CLIENT_SECRET', label: 'Client Secret', redact: true },
    { key: 'EBAY_REDIRECT_URI', label: 'Redirect URI', redact: false },
    { key: 'EBAY_ENVIRONMENT', label: 'Environment', redact: false },
    { key: 'EBAY_USER_REFRESH_TOKEN', label: 'User Refresh Token', redact: true },
    { key: 'EBAY_USER_ACCESS_TOKEN', label: 'User Access Token', redact: true },
    { key: 'EBAY_APP_ACCESS_TOKEN', label: 'App Access Token', redact: true },
  ];

  for (const check of checks) {
    const value = envVars[check.key];
    let status: string;
    let displayValue: string;

    if (value && value.trim() && !value.includes('_here')) {
      status = chalk.green('✓ Set');
      displayValue = check.redact ? `${value.substring(0, 10)}...` : value;
    } else {
      status = chalk.red('✗ Not set');
      displayValue = chalk.gray('(not configured)');
    }

    console.log(`  ${status} ${chalk.bold(check.label)}: ${displayValue}`);
  }

  console.log('');
}

/**
 * Display LLM client status
 */
function displayLLMClientStatus(): void {
  console.log(chalk.bold.cyan('🤖 LLM Client Detection\n'));

  const clients = detectLLMClients();

  for (const client of clients) {
    const detected = client.detected ? chalk.green('✓ Detected') : chalk.gray('✗ Not found');
    const configured = client.configExists
      ? chalk.green('[Configured]')
      : chalk.gray('[Not configured]');

    console.log(`  ${detected} ${chalk.bold(client.displayName)} ${configured}`);
    if (client.detected) {
      console.log(chalk.gray(`    Config: ${client.configPath}`));
    }
  }

  console.log('');
}

/**
 * Test API authentication and display results
 */
async function displayAuthenticationTest(config: EbayConfig): Promise<void> {
  console.log(chalk.bold.cyan('🔐 API Authentication Test\n'));

  const result = await testEbayAuthentication(config);

  if (result.success) {
    console.log(chalk.green('  ✓ Successfully authenticated with eBay API\n'));

    if (result.userInfo) {
      console.log(chalk.bold.white('  User Information:'));
      console.log(chalk.gray(JSON.stringify(result.userInfo, null, 2)));
      console.log('');
    }
  } else {
    console.log(chalk.red('  ✗ Authentication failed\n'));
    console.log(chalk.yellow(`  Error: ${result.error}\n`));
  }
}

/**
 * Generate diagnostic report
 */
async function generateDiagnosticReport(exportPath?: string): Promise<DiagnosticReport> {
  const envPath = join(PROJECT_ROOT, '.env');
  const envVars = parseEnvFile(envPath);

  // Run security checks
  const securityResults = await runSecurityChecks(PROJECT_ROOT);

  // Run configuration validation
  const validationSummary = await validateSetup(PROJECT_ROOT);

  // Detect LLM clients
  const llmClients = detectLLMClients();

  // Check API connectivity
  const apiConnection = await checkApiConnectivity();

  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    security: securityResults,
    configuration: validationSummary,
    llmClients,
    apiConnection,
  };

  // If we have credentials, test authentication
  if (envVars.EBAY_CLIENT_ID && envVars.EBAY_CLIENT_SECRET) {
    const config: EbayConfig = {
      clientId: envVars.EBAY_CLIENT_ID,
      clientSecret: envVars.EBAY_CLIENT_SECRET,
      redirectUri: envVars.EBAY_REDIRECT_URI,
      environment: (envVars.EBAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    };

    const authResult = await testEbayAuthentication(config);

    report.tokenInfo = {
      hasUserToken: !!envVars.EBAY_USER_REFRESH_TOKEN,
      hasAppToken: !!envVars.EBAY_APP_ACCESS_TOKEN,
    };

    if (authResult.success) {
      report.tokenInfo.scopes = envVars.EBAY_USER_REFRESH_TOKEN
        ? parseScopeString(envVars.EBAY_USER_REFRESH_TOKEN)
        : [];
    }
  }

  // Export report if path provided
  if (exportPath) {
    writeFileSync(exportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(chalk.green(`\n✓ Diagnostic report exported to: ${exportPath}\n`));
  }

  return report;
}

/**
 * Main diagnostics function
 */
async function runDiagnostics(exportReport = false): Promise<void> {
  displayHeader();
  displaySystemInfo();

  // Security checks
  const securityResults = await runSecurityChecks(PROJECT_ROOT);
  displaySecurityResults(securityResults);

  // Configuration status
  const envPath = join(PROJECT_ROOT, '.env');
  const envVars = parseEnvFile(envPath);
  displayConfigurationStatus(envVars);

  // LLM client detection
  displayLLMClientStatus();

  // API connectivity
  console.log(chalk.bold.cyan('🌐 API Connectivity\n'));
  const apiConnection = await checkApiConnectivity();

  if (apiConnection.canReachEbay) {
    console.log(chalk.green('  ✓ Can reach eBay API servers\n'));
  } else {
    console.log(chalk.red('  ✗ Cannot reach eBay API servers'));
    console.log(chalk.yellow(`  Error: ${apiConnection.error}\n`));
  }

  // Configuration validation
  console.log(chalk.bold.cyan('📋 Configuration Validation\n'));
  const validationSummary = await validateSetup(PROJECT_ROOT);
  displayRecommendations(validationSummary);

  // If we have credentials, test authentication
  if (envVars.EBAY_CLIENT_ID && envVars.EBAY_CLIENT_SECRET) {
    const config: EbayConfig = {
      clientId: envVars.EBAY_CLIENT_ID,
      clientSecret: envVars.EBAY_CLIENT_SECRET,
      redirectUri: envVars.EBAY_REDIRECT_URI,
      environment: (envVars.EBAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    };

    await displayAuthenticationTest(config);

    // Scope verification if user has refresh token
    if (envVars.EBAY_USER_REFRESH_TOKEN) {
      try {
        const api = new EbaySellerApi(config);
        await api.initialize();
        const authClient = api.getAuthClient();
        const tokenInfo = authClient.getTokenInfo();

        if (tokenInfo.scopeInfo) {
          displayScopeVerification(tokenInfo.scopeInfo.tokenScopes, config.environment);
        }
      } catch {
        console.log(chalk.yellow('⚠️  Could not verify token scopes\n'));
      }
    }
  }

  // Export report if requested
  if (exportReport) {
    const reportPath = join(PROJECT_ROOT, `ebay-mcp-diagnostic-${Date.now()}.json`);
    await generateDiagnosticReport(reportPath);
  }

  console.log(chalk.bold.green('✅ Diagnostics complete!\n'));
  console.log(chalk.gray('For more help, visit:'));
  console.log(chalk.blue.underline('  https://github.com/YosefHayim/ebay-mcp#troubleshooting\n'));
}

// CLI handler
const args = process.argv.slice(2);
const exportReport = args.includes('--export') || args.includes('-e');

runDiagnostics(exportReport).catch((error) => {
  console.error(chalk.red('\n❌ Diagnostics failed:'), error);
  process.exit(1);
});
