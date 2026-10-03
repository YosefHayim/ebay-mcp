/**
 * Quote a value for safe inclusion in a `.env` line.
 *
 * eBay OAuth tokens look like `v^1.1#i^1#...`; dotenv treats an unquoted `#` as
 * the start of an inline comment, so an unquoted token is truncated to `v^1.1`
 * on the next read — silently breaking authentication. Wrap any value
 * containing `#`, whitespace, or quote characters in double quotes (escaping
 * embedded backslashes and double quotes) so dotenv restores it verbatim.
 *
 * @param value - Raw environment value to serialize.
 * @returns A dotenv-safe value string.
 *
 * @example
 * ```ts
 * const line = `EBAY_USER_REFRESH_TOKEN=${quoteEnvValue(token)}`;
 * ```
 */
export const quoteEnvValue = (value: string): string => {
  if (value === '' || !/[#\s"'`]/.test(value)) {
    return value;
  }
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

/**
 * Serialize environment variables into `.env` file content, one `KEY=value` line each.
 *
 * @param env - Environment variables to write, in output order.
 * @returns `.env` file content with every value quoted by {@link quoteEnvValue}.
 *
 * @example
 * ```ts
 * writeFileSync(envPath, stringifyEnv({ EBAY_ENVIRONMENT: 'sandbox' }));
 * ```
 */
export const stringifyEnv = (env: Record<string, string>): string =>
  Object.entries(env)
    .map(([key, value]) => `${key}=${quoteEnvValue(value)}`)
    .join('\n');
