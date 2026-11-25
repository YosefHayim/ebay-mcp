/**
 * Casts a deliberately invalid test value into the type expected by a runtime boundary.
 *
 * Use this only in tests that intentionally bypass TypeScript to exercise runtime
 * validation branches.
 *
 * @param value Invalid value passed to the boundary under test.
 * @returns The same value typed as the boundary's expected input.
 * @example
 * ```ts
 * await expect(api.createOffer(invalidInput(undefined))).rejects.toThrow();
 * ```
 */
export const invalidInput = <T = never>(value: unknown): T => value as T;
