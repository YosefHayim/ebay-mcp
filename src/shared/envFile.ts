export function quoteEnvValue(envValue: string): string {
	if (envValue == "" || !/[#\s"'`]/.test(envValue)) {
		return envValue;
	}
	const quoteMark = ['"', "'", "`"].find((candidate) =>
		candidate == '"' ? !/["\\]/.test(envValue) : !envValue.includes(candidate),
	);
	if (quoteMark === undefined) {
		throw new Error(
			"Cannot write a .env value that contains \", ' and ` quote marks",
		);
	}
	return `${quoteMark}${envValue}${quoteMark}`;
}

export function stringifyEnv(env: Record<string, string>): string {
	return Object.entries(env)
		.map(([name, envValue]) => `${name}=${quoteEnvValue(envValue)}`)
		.join("\n");
}
