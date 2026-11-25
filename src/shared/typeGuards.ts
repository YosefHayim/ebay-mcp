export function isRecord(value: unknown): value is Record<string, unknown> {
	const isNotObject = typeof value != "object";

	if (isNotObject) {
		return false;
	}

	const isNull = value == null;

	if (isNull) {
		return false;
	}

	const isArray = Array.isArray(value);

	if (isArray) {
		return false;
	}

	return true;
}
