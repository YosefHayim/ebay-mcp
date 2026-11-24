export function invalidInput<T = never>(value: unknown): T {
	return value as T;
}
