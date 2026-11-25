const REDACTED = "[REDACTED]";
const URL_CREDENTIALS = /\/\/[^\s/@]+@/g;
const SECRET_KEY = /secret|password|token|authorization|cookie|api.?key/i;

function isPlainObject(
	candidate: unknown,
): candidate is Record<string, unknown> {
	const isNotObject = typeof candidate != "object";

	if (isNotObject) {
		return false;
	}

	const isNull = candidate == null;

	if (isNull) {
		return false;
	}

	const prototype = Object.getPrototypeOf(candidate);
	const isObjectPrototype = prototype == Object.prototype;

	if (isObjectPrototype) {
		return true;
	}

	return false;
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
