import { parseEnv } from "node:util";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

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
		if (envValue && !envValue.includes("_here")) {
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
