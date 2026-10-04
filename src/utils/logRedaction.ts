const REDACTED = '[REDACTED]';
const URL_CREDENTIALS = /([a-z][\w+.-]*:\/\/)[^\s/@]+@/gi;
const SECRET_KEY = /secret|password|token|authorization|cookie|api.?key/i;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

export const redactSecrets = (text: string): string =>
  text.replace(URL_CREDENTIALS, `$1${REDACTED}@`);

export const redactSecretFields = (value: unknown): unknown => {
  if (typeof value === 'string') {
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
};
