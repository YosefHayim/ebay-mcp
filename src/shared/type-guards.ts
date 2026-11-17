/**
 * Runtime-safe object guard for unknown JSON-like values.
 *
 * @param value - Unknown value to narrow.
 * @returns True when the value is a non-array object.
 *
 * @example
 * ```ts
 * if (isRecord(value)) return value.id;
 * ```
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
