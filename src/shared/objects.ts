export function defined<T extends Record<string, unknown>>(
	fields: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(fields)) {
		if (value !== undefined) {
			out[key] = value;
		}
	}
	return out as { [K in keyof T]?: Exclude<T[K], undefined> };
}
