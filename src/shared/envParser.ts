import { existsSync, readFileSync } from "fs";

function isWrappedInQuotes(envValue: string, quote: string): boolean {
	const isMissingOpenQuote = envValue.startsWith(quote) == false;

	if (isMissingOpenQuote) {
		return false;
	}

	const hasCloseQuote = envValue.endsWith(quote);

	return hasCloseQuote;
}

function stripMatchingQuotes(envValue: string): string {
	const isDoubleQuoted = isWrappedInQuotes(envValue, '"');

	if (isDoubleQuoted) {
		return envValue.slice(1, -1);
	}

	const isSingleQuoted = isWrappedInQuotes(envValue, "'");

	if (isSingleQuoted) {
		return envValue.slice(1, -1);
	}

	return envValue;
}

export function parseEnvFile(filePath: string): Record<string, string> {
	const env: Record<string, string> = {};

	if (!existsSync(filePath)) {
		return env;
	}

	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	for (const line of lines) {
		const trimmed = line.trim();
		const isBlank = trimmed == "";

		if (isBlank) {
			continue;
		}

		const isComment = trimmed.startsWith("#");

		if (isComment) {
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
		const envValue = valueText.trim();
		const unquoted = stripMatchingQuotes(envValue);

		env[key] = unquoted;
	}

	return env;
}
