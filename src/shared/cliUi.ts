import { paint, type TerminalText } from "@/shared/paint.js";
import { writeCliLine } from "./cliOutput.js";

/**
 * Shared terminal styling for the project's interactive CLIs.
 *
 * These helpers print to stdout, which is correct for the setup/skills wizards
 * (the stdout-is-reserved rule applies to the MCP *server* runtime, not CLI
 * tooling). The eBay brand palette matches the setup wizard.
 */
export const ebayPalette: {
	red: TerminalText;
	blue: TerminalText;
	yellow: TerminalText;
	green: TerminalText;
} = {
	red: paint.hex("#E53238"),
	blue: paint.hex("#0064D2"),
	yellow: paint.hex("#F5AF02"),
	green: paint.hex("#86B817"),
};

/** Semantic text styles used across CLI output. */
export const ui: {
	dim: TerminalText;
	bold: TerminalText;
	success: TerminalText;
	warning: TerminalText;
	error: TerminalText;
	info: TerminalText;
} = {
	dim: paint.dim,
	bold: paint.bold,
	success: paint.green,
	warning: paint.yellow,
	error: paint.red,
	info: paint.cyan,
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
	writeCliLine(`  ${ui.success("✓")} ${message}`);
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
	writeCliLine(`  ${ui.warning("⚠")} ${message}`);
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
	writeCliLine(`  ${ui.error("✗")} ${message}`);
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
	writeCliLine(`  ${ui.info("ℹ")} ${message}`);
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
	writeCliLine("  " + ui.dim("─".repeat(width)));
};
