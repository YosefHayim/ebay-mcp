/**
 * Setup Validation Module
 *
 * Tests the configuration after setup to ensure everything is working properly.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { EbayOAuthClient } from '@/auth/oauth.js';
import { getOAuthAuthorizationUrl } from '@/config/environment.js';
import { parseEnvFile } from '@/utils/envParser.js';
import { getErrorMessage } from '@/utils/errors.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect, Either } from 'effect';
import { writeCliLine } from '@/utils/cliOutput.js';

/**
 * Result for one setup validation test.
 */
export interface ValidationResult {
  /** Human-readable validation name printed in diagnostics output. */
  test: string;
  /** Whether the validation completed successfully. */
  passed: boolean;
  /** User-facing summary of the validation outcome. */
  message: string;
  /** Optional remediation or failure detail. */
  error?: string;
}

/**
 * Aggregate result returned after all setup validation tests run.
 */
export interface ValidationSummary {
  /** Number of validation checks that were executed. */
  totalTests: number;
  /** Number of checks that passed. */
  passed: number;
  /** Number of checks that failed. */
  failed: number;
  /** Ordered list of individual validation outcomes. */
  results: ValidationResult[];
}

/**
 * Validates that the .env file exists and is readable.
 */
const validateEnvFile = (projectRoot: string): ValidationResult => {
  const envPath = join(projectRoot, '.env');

  if (!existsSync(envPath)) {
    return {
      test: '.env File Existence',
      passed: false,
      message: 'Configuration file not found',
      error: `.env file does not exist at ${envPath}`,
    };
  }

  const readable = Effect.runSync(
    Effect.either(
      Effect.try({
        try: () => readFileSync(envPath, 'utf-8'),
        catch: (error) => error,
      }),
    ),
  );

  if (Either.isRight(readable)) {
    return {
      test: '.env File Existence',
      passed: true,
      message: 'Configuration file exists and is readable',
    };
  }

  return {
    test: '.env File Existence',
    passed: false,
    message: 'Configuration file cannot be read',
    error: getErrorMessage(readable.left),
  };
};

/**
 * Validates that required app credentials are present.
 */
const validateAppCredentials = (envVars: Record<string, string>): ValidationResult => {
  const required = ['EBAY_CLIENT_ID', 'EBAY_CLIENT_SECRET', 'EBAY_REDIRECT_URI'];
  const missing: string[] = [];

  for (const key of required) {
    if (!envVars[key] || envVars[key].trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    return {
      test: 'App Credentials',
      passed: false,
      message: 'Missing required app credentials',
      error: `Missing: ${missing.join(', ')}`,
    };
  }

  return {
    test: 'App Credentials',
    passed: true,
    message: 'All required app credentials are present',
  };
};

/**
 * Validates the configured eBay environment value.
 */
const validateEnvironment = (envVars: Record<string, string>): ValidationResult => {
  const env = envVars.EBAY_ENVIRONMENT || 'sandbox';

  if (env !== 'sandbox' && env !== 'production') {
    return {
      test: 'Environment Setting',
      passed: false,
      message: 'Invalid environment value',
      error: `EBAY_ENVIRONMENT must be "sandbox" or "production", got "${env}"`,
    };
  }

  return {
    test: 'Environment Setting',
    passed: true,
    message: `Environment set to "${env}"`,
  };
};

/**
 * Checks whether optional user tokens are configured.
 */
const validateUserTokens = (envVars: Record<string, string>): ValidationResult => {
  const hasRefreshToken =
    envVars.EBAY_USER_REFRESH_TOKEN && envVars.EBAY_USER_REFRESH_TOKEN.trim() !== '';

  if (!hasRefreshToken) {
    return {
      test: 'User Tokens (Optional)',
      passed: true,
      message: 'No user tokens configured (app token only mode)',
      error: 'To enable user-specific API calls, set EBAY_USER_REFRESH_TOKEN',
    };
  }

  return {
    test: 'User Tokens',
    passed: true,
    message: 'User refresh token is configured',
  };
};

/**
 * Tests OAuth client initialization.
 */
const validateOAuthInitialization = async (config: EbayConfig): Promise<ValidationResult> => {
  const initialized = await Effect.runPromise(
    Effect.either(
      Effect.gen(function* () {
        const oauthClient = new EbayOAuthClient(config);
        yield* oauthClient.initialize();
      }),
    ),
  );

  if (Either.isRight(initialized)) {
    return {
      test: 'OAuth Client Initialization',
      passed: true,
      message: 'OAuth client initialized successfully',
    };
  }

  return {
    test: 'OAuth Client Initialization',
    passed: false,
    message: 'Failed to initialize OAuth client',
    error: getErrorMessage(initialized.left),
  };
};

/**
 * Tests OAuth URL generation.
 */
const validateOAuthURL = (config: EbayConfig): ValidationResult => {
  const redirectUri = config.redirectUri;
  if (!redirectUri) {
    return {
      test: 'OAuth URL Generation',
      passed: false,
      message: 'Redirect URI is required for OAuth URL generation',
      error: 'EBAY_REDIRECT_URI is not configured',
    };
  }

  const generated = Effect.runSync(
    Effect.either(
      Effect.try({
        try: () => getOAuthAuthorizationUrl(config.clientId, redirectUri, config.environment),
        catch: (error) => error,
      }),
    ),
  );

  if (Either.isLeft(generated)) {
    return {
      test: 'OAuth URL Generation',
      passed: false,
      message: 'Failed to generate OAuth URL',
      error: getErrorMessage(generated.left),
    };
  }

  if (!generated.right.startsWith('http')) {
    return {
      test: 'OAuth URL Generation',
      passed: false,
      message: 'Invalid OAuth URL generated',
      error: 'Generated URL is not valid',
    };
  }

  return {
    test: 'OAuth URL Generation',
    passed: true,
    message: 'OAuth URL can be generated',
  };
};

/**
 * Runs all setup validation tests and prints their CLI summary.
 *
 * @param projectRoot Absolute project root containing the `.env` file to validate.
 * @returns A summary containing individual validation results and pass/fail counts.
 * @example
 * ```ts
 * const summary = await validateSetup(process.cwd());
 * ```
 */
export const validateSetup = async (projectRoot: string): Promise<ValidationSummary> => {
  const results: ValidationResult[] = [];

  writeCliLine(chalk.bold.cyan('\n🧪 Running Configuration Tests...\n'));

  // Test 1: .env file exists
  const envFileResult = validateEnvFile(projectRoot);
  results.push(envFileResult);
  printResult(envFileResult);

  if (!envFileResult.passed) {
    return {
      totalTests: 1,
      passed: 0,
      failed: 1,
      results,
    };
  }

  // Parse .env file
  const envPath = join(projectRoot, '.env');
  const envVars = parseEnvFile(envPath);

  // Test 2: App credentials
  const appCredsResult = validateAppCredentials(envVars);
  results.push(appCredsResult);
  printResult(appCredsResult);

  // Test 3: Environment setting
  const envResult = validateEnvironment(envVars);
  results.push(envResult);
  printResult(envResult);

  // Test 4: User tokens (optional)
  const userTokensResult = validateUserTokens(envVars);
  results.push(userTokensResult);
  printResult(userTokensResult);

  // If app credentials are valid, test OAuth functionality
  if (appCredsResult.passed) {
    const config: EbayConfig = {
      clientId: envVars.EBAY_CLIENT_ID,
      clientSecret: envVars.EBAY_CLIENT_SECRET,
      redirectUri: envVars.EBAY_REDIRECT_URI,
      environment: (envVars.EBAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
    };

    // Test 5: OAuth initialization
    const oauthInitResult = await validateOAuthInitialization(config);
    results.push(oauthInitResult);
    printResult(oauthInitResult);

    // Test 6: OAuth URL generation
    if (oauthInitResult.passed) {
      const oauthURLResult = validateOAuthURL(config);
      results.push(oauthURLResult);
      printResult(oauthURLResult);
    }
  }

  // Calculate summary
  const passed = results.filter((check) => check.passed).length;
  const failed = results.length - passed;

  // Print summary
  writeCliLine(chalk.gray('\n' + '─'.repeat(60)));
  writeCliLine(chalk.bold.white('\n📊 Validation Summary\n'));
  writeCliLine(`  Total Tests: ${results.length}`);
  writeCliLine(`  ${chalk.green('✓ Passed:')} ${passed}`);
  writeCliLine(`  ${chalk.red('✗ Failed:')} ${failed}`);

  if (failed === 0) {
    writeCliLine(chalk.green.bold('\n✨ All tests passed! Configuration is valid.\n'));
  } else {
    writeCliLine(chalk.yellow.bold('\n⚠️  Some tests failed. Please review the errors above.\n'));
  }

  return {
    totalTests: results.length,
    passed,
    failed,
    results,
  };
};

/**
 * Prints a single validation result.
 */
const printResult = (validation: ValidationResult): void => {
  const icon = validation.passed ? chalk.green('✓') : chalk.red('✗');
  const status = validation.passed ? chalk.green('PASS') : chalk.red('FAIL');

  writeCliLine(`${icon} ${chalk.bold(validation.test)}: ${status}`);
  writeCliLine(`  ${chalk.gray(validation.message)}`);

  if (validation.error) {
    writeCliLine(`  ${chalk.yellow('→')} ${chalk.yellow(validation.error)}`);
  }

  writeCliLine('');
};

/**
 * Displays setup recommendations based on validation results.
 *
 * @param summary Setup validation summary returned by `validateSetup`.
 * @returns Nothing; recommendations are written to stdout.
 * @example
 * ```ts
 * displayRecommendations(summary);
 * ```
 */
export const displayRecommendations = (summary: ValidationSummary): void => {
  const hasUserTokens = summary.results.some(
    (validation) => validation.test === 'User Tokens' && validation.passed && !validation.error,
  );

  writeCliLine(chalk.bold.cyan('💡 Recommendations:\n'));

  if (!hasUserTokens) {
    writeCliLine(chalk.yellow('  ⚠️  User tokens not configured'));
    writeCliLine(chalk.gray('     • You can only use app token for limited API access'));
    writeCliLine(chalk.gray('     • To enable full API access, use the ebay_get_oauth_url tool'));
    writeCliLine(
      chalk.gray('     • Then save your refresh token to EBAY_USER_REFRESH_TOKEN in .env\n'),
    );
  }

  if (summary.failed > 0) {
    writeCliLine(chalk.red('  ❌ Configuration has errors'));
    writeCliLine(chalk.gray('     • Review the failed tests above'));
    writeCliLine(chalk.gray('     • Update your .env file with correct values'));
    writeCliLine(chalk.gray('     • Run the setup wizard again: npm run setup\n'));
  } else {
    writeCliLine(chalk.green('  ✅ Configuration is complete and valid'));
    writeCliLine(chalk.gray('     • Restart your MCP client (Claude Desktop, Cline, etc.)'));
    writeCliLine(chalk.gray('     • The eBay MCP server should now be available'));
    writeCliLine(chalk.gray('     • Try using tools like: ebay_get_user, ebay_get_oauth_url\n'));
  }
};
