import { paint, type TerminalText } from "@/shared/paint.js";
import { writeCliLine } from "./cliOutput.js";

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

export function printSuccess(message: string): void {
	writeCliLine(`  ${ui.success("✓")} ${message}`);
}

export function printWarning(message: string): void {
	writeCliLine(`  ${ui.warning("⚠")} ${message}`);
}

export function printError(message: string): void {
	writeCliLine(`  ${ui.error("✗")} ${message}`);
}

export function printInfo(message: string): void {
	writeCliLine(`  ${ui.info("ℹ")} ${message}`);
}

export function printHeading(title: string): void {
	writeCliLine(`\n  ${ui.bold(title)}`);
}

export function printRule(width = 56): void {
	writeCliLine("  " + ui.dim("─".repeat(width)));
}
