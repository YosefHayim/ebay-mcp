/**
 * Security Checker - Pre-flight security and environment checks
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { Effect, Either } from 'effect';
import process from 'node:process';
import { writeCliLine } from '@/utils/cliOutput.js';

/**
 * Outcome of a pre-flight security or environment check.
 */
export interface SecurityCheckResult {
  /** Human-readable check name printed in diagnostics output. */
  check: string;
  /** Whether the check passed. */
  passed: boolean;
  /** User-facing result message. */
  message: string;
  /** Severity used to decide whether setup should continue. */
  severity: 'critical' | 'warning' | 'info';
  /** Optional remediation text shown when the check fails. */
  fix?: string;
}

/**
 * Checks that the current Node.js major version meets the minimum runtime.
 *
 * @returns A security check result for the active Node.js process.
 * @example
 * ```ts
 * const nodeVersionCheck = checkNodeVersion();
 * ```
 */
export const checkNodeVersion = (): SecurityCheckResult => {
  const requiredVersion = 18;
  const currentVersion = Number.parseInt(process.version.slice(1).split('.')[0], 10);

  if (currentVersion >= requiredVersion) {
    return {
      check: 'Node.js Version',
      passed: true,
      message: `Node.js ${process.version} meets requirements (>= ${requiredVersion})`,
      severity: 'info',
    };
  }

  return {
    check: 'Node.js Version',
    passed: false,
    message: `Node.js ${process.version} is below required version ${requiredVersion}`,
    severity: 'critical',
    fix: `Install Node.js ${requiredVersion} or higher from https://nodejs.org/`,
  };
};

/**
 * Checks whether `.env` files are ignored by git.
 *
 * @param projectRoot Absolute project root containing `.gitignore`.
 * @returns A security check result for credential file ignore coverage.
 * @example
 * ```ts
 * const gitignoreCheck = checkGitignore(process.cwd());
 * ```
 */
export const checkGitignore = (projectRoot: string): SecurityCheckResult => {
  const gitignorePath = join(projectRoot, '.gitignore');

  if (!existsSync(gitignorePath)) {
    return {
      check: '.gitignore Security',
      passed: false,
      message: 'No .gitignore file found',
      severity: 'warning',
      fix: 'Create a .gitignore file and add .env to it',
    };
  }

  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  const hasEnv = gitignoreContent.split('\n').some((line) => {
    const trimmed = line.trim();
    return trimmed === '.env' || trimmed === '*.env' || trimmed.startsWith('.env');
  });

  if (hasEnv) {
    return {
      check: '.gitignore Security',
      passed: true,
      message: '.env files are properly ignored by git',
      severity: 'info',
    };
  }

  return {
    check: '.gitignore Security',
    passed: false,
    message: '.env is not in .gitignore - credentials could be committed!',
    severity: 'critical',
    fix: 'Add ".env" to your .gitignore file immediately',
  };
};

/**
 * Checks network connectivity to eBay API hosts.
 *
 * @returns A security check result for the eBay API reachability probe.
 * @example
 * ```ts
 * const connectivityCheck = await checkNetworkConnectivity();
 * ```
 */
export const checkNetworkConnectivity = async (): Promise<SecurityCheckResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const reached = await Effect.runPromise(
    Effect.either(
      Effect.tryPromise({
        try: () =>
          fetch('https://api.ebay.com/health', {
            signal: controller.signal,
          }),
        catch: (error) => error,
      }).pipe(
        Effect.ensuring(
          Effect.sync(() => {
            clearTimeout(timeout);
          }),
        ),
      ),
    ),
  );

  if (Either.isLeft(reached)) {
    return {
      check: 'Network Connectivity',
      passed: false,
      message: 'Cannot reach eBay API servers',
      severity: 'critical',
      fix: 'Check your internet connection, proxy settings, and firewall',
    };
  }

  const healthResponse = reached.right;

  if (healthResponse.ok || healthResponse.status === 404) {
    // 404 is fine, means we can reach eBay servers
    return {
      check: 'Network Connectivity',
      passed: true,
      message: 'Successfully connected to eBay API servers',
      severity: 'info',
    };
  }

  return {
    check: 'Network Connectivity',
    passed: false,
    message: `Unexpected response from eBay API: ${healthResponse.status}`,
    severity: 'warning',
    fix: 'Check your internet connection and firewall settings',
  };
};

/**
 * Checks whether the compiled server entrypoint exists.
 *
 * @param projectRoot Absolute project root containing the `build` directory.
 * @returns A security check result for build output presence.
 * @example
 * ```ts
 * const buildCheck = checkProjectBuild(process.cwd());
 * ```
 */
export const checkProjectBuild = (projectRoot: string): SecurityCheckResult => {
  const buildPath = join(projectRoot, 'build', 'index.js');

  if (existsSync(buildPath)) {
    return {
      check: 'Project Build',
      passed: true,
      message: 'Project is built and ready',
      severity: 'info',
    };
  }

  return {
    check: 'Project Build',
    passed: false,
    message: 'Project has not been built yet',
    severity: 'warning',
    fix: 'Run "npm run build" to build the project',
  };
};

/**
 * Checks whether project dependencies are installed.
 *
 * @param projectRoot Absolute project root containing `node_modules`.
 * @returns A security check result for dependency installation state.
 * @example
 * ```ts
 * const dependencyCheck = checkDependencies(process.cwd());
 * ```
 */
export const checkDependencies = (projectRoot: string): SecurityCheckResult => {
  const nodeModulesPath = join(projectRoot, 'node_modules');

  if (existsSync(nodeModulesPath)) {
    return {
      check: 'Dependencies',
      passed: true,
      message: 'Dependencies are installed',
      severity: 'info',
    };
  }

  return {
    check: 'Project Dependencies',
    passed: false,
    message: 'Dependencies not installed',
    severity: 'critical',
    fix: 'Run "npm install" to install dependencies',
  };
};

/**
 * Checks whether `.env` is tracked by git.
 *
 * @param projectRoot Absolute project root containing `.git`.
 * @returns A security check result for credential tracking risk.
 * @example
 * ```ts
 * const gitTrackingCheck = checkGitTracking(process.cwd());
 * ```
 */
export const checkGitTracking = (projectRoot: string): SecurityCheckResult => {
  const gitPath = join(projectRoot, '.git');
  const envPath = join(projectRoot, '.env');

  if (!existsSync(gitPath)) {
    return {
      check: 'Git Repository',
      passed: true,
      message: 'Not a git repository (no tracking risk)',
      severity: 'info',
    };
  }

  if (!existsSync(envPath)) {
    return {
      check: 'Git Tracking',
      passed: true,
      message: '.env file does not exist yet',
      severity: 'info',
    };
  }

  const tracked = Effect.runSync(
    Effect.either(
      Effect.try({
        try: () =>
          execSync('git ls-files .env', {
            cwd: projectRoot,
            encoding: 'utf-8',
          }).trim(),
        catch: (error) => error,
      }),
    ),
  );

  if (Either.isLeft(tracked)) {
    return {
      check: 'Git Tracking',
      passed: true,
      message: 'Unable to check git tracking (likely not tracked)',
      severity: 'info',
    };
  }

  if (tracked.right === '') {
    return {
      check: 'Git Tracking',
      passed: true,
      message: '.env is not tracked by git',
      severity: 'info',
    };
  }

  return {
    check: 'Git Tracking',
    passed: false,
    message: '.env is tracked by git - SECURITY RISK!',
    severity: 'critical',
    fix: 'Run: git rm --cached .env && git commit -m "Remove .env from tracking"',
  };
};

/**
 * Runs all security checks used by setup and diagnostics commands.
 *
 * @param projectRoot Absolute project root to inspect.
 * @returns Ordered security check results for CLI display and gating.
 * @example
 * ```ts
 * const results = await runSecurityChecks(process.cwd());
 * ```
 */
export const runSecurityChecks = async (projectRoot: string): Promise<SecurityCheckResult[]> => {
  const results: SecurityCheckResult[] = [];

  // Synchronous checks
  results.push(checkNodeVersion());
  results.push(checkGitignore(projectRoot));
  results.push(checkProjectBuild(projectRoot));
  results.push(checkDependencies(projectRoot));
  results.push(checkGitTracking(projectRoot));

  // Asynchronous checks
  results.push(await checkNetworkConnectivity());

  return results;
};

/**
 * Displays security check results in the setup/diagnostics CLI.
 *
 * @param results Security check results returned by `runSecurityChecks`.
 * @returns Nothing; results are written to stdout.
 * @example
 * ```ts
 * displaySecurityResults(results);
 * ```
 */
export const displaySecurityResults = (results: SecurityCheckResult[]): void => {
  writeCliLine(chalk.bold.cyan('\n🔒 Security & Environment Checks\n'));

  for (const checkResult of results) {
    const icon = checkResult.passed ? chalk.green('✓') : chalk.red('✗');
    let severity = chalk.gray('[INFO]');
    if (checkResult.severity === 'critical') {
      severity = chalk.red('[CRITICAL]');
    } else if (checkResult.severity === 'warning') {
      severity = chalk.yellow('[WARNING]');
    }

    writeCliLine(`${icon} ${chalk.bold(checkResult.check)}: ${severity}`);
    writeCliLine(`  ${chalk.gray(checkResult.message)}`);

    if (checkResult.fix) {
      writeCliLine(`  ${chalk.yellow('→ Fix:')} ${checkResult.fix}`);
    }
    writeCliLine('');
  }

  const critical = results.filter(
    (checkResult) => !checkResult.passed && checkResult.severity === 'critical',
  );
  const warnings = results.filter(
    (checkResult) => !checkResult.passed && checkResult.severity === 'warning',
  );

  if (critical.length > 0) {
    writeCliLine(
      chalk.red.bold(
        `⚠️  ${critical.length} critical issue(s) found. Please fix before continuing.\n`,
      ),
    );
  } else if (warnings.length > 0) {
    writeCliLine(
      chalk.yellow.bold(`⚠️  ${warnings.length} warning(s) found. Recommended to fix.\n`),
    );
  } else {
    writeCliLine(chalk.green.bold('✅ All security checks passed!\n'));
  }
};

/**
 * Checks whether any security result should block setup.
 *
 * @param results Security check results to inspect.
 * @returns `true` when at least one critical check failed.
 * @example
 * ```ts
 * if (hasCriticalFailures(results)) process.exit(1);
 * ```
 */
export const hasCriticalFailures = (results: SecurityCheckResult[]): boolean =>
  results.some((check) => !check.passed && check.severity === 'critical');
