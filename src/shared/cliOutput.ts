import process from "node:process";

export function writeCliLine(message = ""): void {
	process.stdout.write(`${message}\n`);
}
