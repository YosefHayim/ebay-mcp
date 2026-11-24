import { existsSync, readFileSync } from "fs";

export function parseEnvFile(filePath: string): Record<string, string> {
	const env: Record<string, string> = {};

	if (!existsSync(filePath)) {
		return env;
	}

	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		const match = /^([^=]+)=(.*)$/.exec(trimmed);
		if (!match) {
			continue;
		}

		const keyText = match[1];
		const valueText = match[2];
		const isKeyMissing = keyText == null;

		if (isKeyMissing) {
			continue;
		}

		const isValueMissing = valueText == null;

		if (isValueMissing) {
			continue;
		}

		const key = keyText.trim();
		let envValue = valueText.trim();

		if (
			(envValue.startsWith('"') && envValue.endsWith('"')) ||
			(envValue.startsWith("'") && envValue.endsWith("'"))
		) {
			envValue = envValue.slice(1, -1);
		}

		env[key] = envValue;
	}

	return env;
}
