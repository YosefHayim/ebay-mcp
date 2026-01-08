/**
 * Security Checker - Pre-flight security and environment checks
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export interface SecurityCheckResult {
  check: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  fix?: string;
}

/**
 * Check Node.js version meets requirements
 */
export function checkNodeVersion(): SecurityCheckResult {
  const requiredVersion = 18;
  const currentVersion = parseInt(process.version.slice(1).split('.')[0], 10);

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
}

/**
 * Check if .env is in .gitignore
 */
export function checkGitignore(projectRoot: string): SecurityCheckResult {
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
}

/**
 * Check network connectivity to eBay APIs
 */
export async function checkNetworkConnectivity(): Promise<SecurityCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.ebay.com/health', {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok || response.status === 404) {
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
      message: `Unexpected response from eBay API: ${response.status}`,
      severity: 'warning',
      fix: 'Check your internet connection and firewall settings',
    };
  } catch (error) {
    return {
      check: 'Network Connectivity',
      passed: false,
      message: 'Cannot reach eBay API servers',
      severity: 'critical',
      fix: 'Check your internet connection, proxy settings, and firewall',
    };
  }
}

/**
 * Check if project is built
 */
export function checkProjectBuild(projectRoot: string): SecurityCheckResult {
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
}

/**
 * Check if dependencies are installed
 */
export function checkDependencies(projectRoot: string): SecurityCheckResult {
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
}

/**
 * Check if git repo is initialized and .env is not tracked
 */
export function checkGitTracking(projectRoot: string): SecurityCheckResult {
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

  try {
    const result = execSync('git ls-files .env', {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();

    if (result === '') {
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
  } catch {
    return {
      check: 'Git Tracking',
      passed: true,
      message: 'Unable to check git tracking (likely not tracked)',
      severity: 'info',
    };
  }
}

/**
 * Run all security checks
 */
export async function runSecurityChecks(projectRoot: string): Promise<SecurityCheckResult[]> {
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
}

/**
 * Display security check results
 */
export function displaySecurityResults(results: SecurityCheckResult[]): void {
  console.log(chalk.bold.cyan('\n🔒 Security & Environment Checks\n'));

  for (const result of results) {
    const icon = result.passed ? chalk.green('✓') : chalk.red('✗');
    const severity =
      result.severity === 'critical'
        ? chalk.red('[CRITICAL]')
        : result.severity === 'warning'
          ? chalk.yellow('[WARNING]')
          : chalk.gray('[INFO]');

    console.log(`${icon} ${chalk.bold(result.check)}: ${severity}`);
    console.log(`  ${chalk.gray(result.message)}`);

    if (result.fix) {
      console.log(`  ${chalk.yellow('→ Fix:')} ${result.fix}`);
    }
    console.log('');
  }

  const critical = results.filter((r) => !r.passed && r.severity === 'critical');
  const warnings = results.filter((r) => !r.passed && r.severity === 'warning');

  if (critical.length > 0) {
    console.log(
      chalk.red.bold(
        `⚠️  ${critical.length} critical issue(s) found. Please fix before continuing.\n`
      )
    );
  } else if (warnings.length > 0) {
    console.log(
      chalk.yellow.bold(`⚠️  ${warnings.length} warning(s) found. Recommended to fix.\n`)
    );
  } else {
    console.log(chalk.green.bold('✅ All security checks passed!\n'));
  }
}

/**
 * Check if there are critical failures
 */
export function hasCriticalFailures(results: SecurityCheckResult[]): boolean {
  return results.some((r) => !r.passed && r.severity === 'critical');
}
