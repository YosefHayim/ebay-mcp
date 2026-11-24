import { realpathSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

function toRealPath(filePath: string): string {
	try {
		return realpathSync(filePath);
	} catch {
		return path.resolve(filePath);
	}
}

export function isEntryModule(moduleUrl: string): boolean {
	return (
		process.argv[1] !== undefined &&
		toRealPath(process.argv[1]) == toRealPath(fileURLToPath(moduleUrl))
	);
}
