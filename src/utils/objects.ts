/** Small object helpers shared across API modules. */

/**
 * Drop keys whose value is `undefined`.
 *
 * Result types treat unmapped fields as optional, so a missing value must be
 * absent from the object rather than present-and-undefined. Written inline
 * that needs one conditional spread per field, which reads poorly and pushes
 * wide mappers over the cognitive-complexity budget.
 *
 * @param fields - Candidate keys and values.
 * @returns The same object without its undefined-valued keys.
 *
 * @example
 * ```ts
 * defined({ a: 1, b: undefined }); // { a: 1 }
 * ```
 */
export const defined = <T extends Record<string, unknown>>(
  fields: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as { [K in keyof T]?: Exclude<T[K], undefined> };
};
