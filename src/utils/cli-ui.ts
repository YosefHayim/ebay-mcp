import chalk from 'chalk';

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

/** Prints a green success line. */
export function printSuccess(message: string): void {
  console.log(`  ${ui.success('✓')} ${message}`);
}

/** Prints a yellow warning line. */
export function printWarning(message: string): void {
  console.log(`  ${ui.warning('⚠')} ${message}`);
}

/** Prints a red error line. */
export function printError(message: string): void {
  console.log(`  ${ui.error('✗')} ${message}`);
}

/** Prints a cyan info line. */
export function printInfo(message: string): void {
  console.log(`  ${ui.info('ℹ')} ${message}`);
}

/** Prints a bold section heading preceded by a blank line. */
export function printHeading(title: string): void {
  console.log(`\n  ${ui.bold(title)}`);
}

/** Prints a dim horizontal rule. */
export function printRule(width = 56): void {
  console.log('  ' + ui.dim('─'.repeat(width)));
}
