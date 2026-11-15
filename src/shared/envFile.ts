/**
 * Quote a value for safe inclusion in a `.env` line.
 *
 * eBay OAuth tokens look like `v^1.1#i^1#...`; dotenv treats an unquoted `#` as
 * the start of an inline comment, so an unquoted token is truncated to `v^1.1`
 * on the next read — silently breaking authentication. Wrap any value
 * containing `#`, whitespace, or quote characters in quotes so dotenv restores
 * it verbatim.
 *
 * dotenv strips the surrounding quotes but never unescapes inside them, and in
 * double quotes it turns `\n` into a newline. So instead of escaping, pick a
 * quote mark the value does not contain: double quotes unless the value has a
 * `"` or `\`, then single quotes, then backticks.
 *
 * @param envValue - Raw environment value to serialize.
 * @returns A dotenv-safe value string.
 * @throws Error when the value contains all three quote marks and cannot be quoted.
 *
 * @example
 * ```ts
 * const line = `EBAY_USER_REFRESH_TOKEN=${quoteEnvValue(token)}`;
 * ```
 */
export const quoteEnvValue = (envValue: string): string => {
  if (envValue === '' || !/[#\s"'`]/.test(envValue)) {
    return envValue;
  }
  const quoteMark = ['"', "'", '`'].find((candidate) =>
    candidate === '"' ? !/["\\]/.test(envValue) : !envValue.includes(candidate),
  );
  if (quoteMark === undefined) {
    throw new Error('Cannot write a .env value that contains ", \' and ` quote marks');
  }
  return `${quoteMark}${envValue}${quoteMark}`;
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
    .map(([name, envValue]) => `${name}=${quoteEnvValue(envValue)}`)
    .join('\n');
