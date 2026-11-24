const REDACTED = "[REDACTED]";
const URL_CREDENTIALS = /\/\/[^\s/@]+@/g;
const SECRET_KEY = /secret|password|token|authorization|cookie|api.?key/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return (
		typeof value == "object" &&
		value !== null &&
		Object.getPrototypeOf(value) === Object.prototype
	);
}

export function redactSecrets(text: string): string {
	return text.replace(URL_CREDENTIALS, `//${REDACTED}@`);
}

export function redactSecretFields(value: unknown): unknown {
	if (typeof value == "string") {
		return redactSecrets(value);
	}
	if (Array.isArray(value)) {
		return value.map((item) => redactSecretFields(item));
	}
	if (!isPlainObject(value)) {
		return value;
	}
	const fields = Object.entries(value).map(([key, field]) => [
		key,
		SECRET_KEY.test(key) ? REDACTED : redactSecretFields(field),
	]);
	return Object.fromEntries(fields);
}
