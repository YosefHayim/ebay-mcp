import { parseEnv } from "node:util";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

function isStoredEnvValue(envValue: string | undefined): envValue is string {
	const isMissing = !envValue;

	if (isMissing) return false;

	const isPlaceholder = envValue.includes("_here");

	if (isPlaceholder) return false;

	return true;
}

export function loadExistingConfig(
	projectRoot: string,
): Record<string, string> {
	const envPath = join(projectRoot, ".env");
	if (!existsSync(envPath)) {
		return {};
	}

	const parsed = parseEnv(readFileSync(envPath, "utf-8"));
	const envConfig: Record<string, string> = {};
	for (const [key, envValue] of Object.entries(parsed)) {
		const keepValue = isStoredEnvValue(envValue);

		if (keepValue) {
			envConfig[key] = envValue;
		}
	}

	return envConfig;
}

export function readEnvironment(
	environmentName?: string,
): "sandbox" | "production" {
	return environmentName == "production" ? "production" : "sandbox";
}
