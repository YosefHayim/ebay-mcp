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
	const launchedPath = process.argv[1];
	const isMissingLaunch = launchedPath == null;

	if (isMissingLaunch) {
		return false;
	}

	const launchedRealPath = toRealPath(launchedPath);
	const moduleRealPath = toRealPath(fileURLToPath(moduleUrl));

	return launchedRealPath == moduleRealPath;
}
