import chalk from 'chalk';
import { writeCliLine } from './cliOutput.js';

/**
 * Shared terminal styling for the project's interactive CLIs.
 *
 * These helpers print to stdout, which is correct for the setup/skills wizards
 * (the stdout-is-reserved rule applies to the MCP *server* runtime, not CLI
 * tooling). The eBay brand palette matches the setup wizard.
 */
export const ebayPalette = {
  red: chalk.hex('#E53238'),
  blue: chalk.hex('#0064D2'),
  yellow: chalk.hex('#F5AF02'),
  green: chalk.hex('#86B817'),
};

/** Semantic text styles used across CLI output. */
export const ui = {
  dim: chalk.dim,
  bold: chalk.bold,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
};

/**
 * Prints a green success line.
 *
 * @param message - Message to print after the status icon.
 * @returns Nothing; writes to stdout for interactive CLI flows.
 *
 * @example
 * ```ts
 * printSuccess('Configuration saved');
 * ```
 */
export const printSuccess = (message: string): void => {
  writeCliLine(`  ${ui.success('✓')} ${message}`);
};

/**
 * Prints a yellow warning line.
 *
 * @param message - Message to print after the status icon.
 * @returns Nothing; writes to stdout for interactive CLI flows.
 *
 * @example
 * ```ts
 * printWarning('No clients detected');
 * ```
 */
export const printWarning = (message: string): void => {
  writeCliLine(`  ${ui.warning('⚠')} ${message}`);
};

/**
 * Prints a red error line.
 *
 * @param message - Message to print after the status icon.
 * @returns Nothing; writes to stdout for interactive CLI flows.
 *
 * @example
 * ```ts
 * printError('Setup failed');
 * ```
 */
export const printError = (message: string): void => {
  writeCliLine(`  ${ui.error('✗')} ${message}`);
};

/**
 * Prints a cyan info line.
 *
 * @param message - Message to print after the status icon.
 * @returns Nothing; writes to stdout for interactive CLI flows.
 *
 * @example
 * ```ts
 * printInfo('Dry run - no files written');
 * ```
 */
export const printInfo = (message: string): void => {
  writeCliLine(`  ${ui.info('ℹ')} ${message}`);
};

/**
 * Prints a bold section heading preceded by a blank line.
 *
 * @param title - Heading text.
 * @returns Nothing; writes to stdout for interactive CLI flows.
 *
 * @example
 * ```ts
 * printHeading('Planned changes');
 * ```
 */
export const printHeading = (title: string): void => {
  writeCliLine(`\n  ${ui.bold(title)}`);
};

/**
 * Prints a dim horizontal rule.
 *
 * @param width - Number of rule characters to print.
 * @returns Nothing; writes to stdout for interactive CLI flows.
 *
 * @example
 * ```ts
 * printRule(72);
 * ```
 */
export const printRule = (width = 56): void => {
  writeCliLine('  ' + ui.dim('─'.repeat(width)));
};
