import { createHash, createPrivateKey, type KeyObject, sign } from 'node:crypto';

/**
 * eBay Digital Signatures for APIs (RFC 9421 HTTP Message Signatures).
 *
 * eBay requires EU- and UK-domiciled sellers to sign calls to the Finances API,
 * Fulfillment `issueRefund`, Trading `GetAccount`, and several Post-Order refund
 * and cancellation calls. A signed request carries four extra headers:
 *
 * - `x-ebay-signature-key` — the JWE returned by Key Management `createSigningKey`
 * - `Content-Digest` — `sha-256=:<base64>:` of the body, only when a body is sent
 * - `Signature-Input` — the covered components and the `created` timestamp
 * - `Signature` — the Ed25519 or RSA (PKCS#1 v1.5, SHA-256) signature over the signature base
 *
 * @see https://developer.ebay.com/develop/guides/digital-signatures-for-apis
 * @see https://www.rfc-editor.org/rfc/rfc9421
 */

/** Label used for the single signature eBay expects. */
const SIGNATURE_LABEL = 'sig1';

const PEM_PATTERN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;

/**
 * Sign the signature base with Ed25519, or RSASSA-PKCS1-v1_5 with SHA-256.
 */
const signBase = (signatureBase: string, key: KeyObject): string => {
  const data = Buffer.from(signatureBase, 'utf8');
  const digest = key.asymmetricKeyType === 'ed25519' ? null : 'sha256';
  return sign(digest, data, key).toString('base64');
};

/** Lower-cased `@authority`: host plus any non-default port (`URL.host` already omits defaults). */
const authorityOf = (url: URL): string => url.host.toLowerCase();

/** Signing material for eBay digital signatures, as returned by `createSigningKey`. */
export interface EbaySigningCredentials {
  /** The `jwe` value from the signing key; sent verbatim in `x-ebay-signature-key`. */
  readonly jwe: string;
  /**
   * The `privateKey` value from the signing key: base64 PKCS#8 DER (as eBay returns it)
   * or a PEM block. Ed25519 and RSA keys are supported.
   */
  readonly privateKey: string;
}

/** A request about to be sent, reduced to what the signature covers. */
export interface SignableRequest {
  /** HTTP method, e.g. `GET`. */
  readonly method: string;
  /** Fully qualified request URL (query string is ignored by `@path`). */
  readonly url: string;
  /** Exact body bytes sent on the wire; `undefined` for requests without a body. */
  readonly body?: string | Uint8Array;
}

/** Header name eBay reads the signing key JWE from. */
export const SIGNATURE_KEY_HEADER = 'x-ebay-signature-key';

/** Raised when the configured signing private key cannot be used. */
export class EbaySigningKeyError extends Error {
  override readonly name = 'EbaySigningKeyError';
}

/**
 * Parse the configured private key into a Node `KeyObject`.
 *
 * eBay's `createSigningKey` returns the private key as base64-encoded PKCS#8 DER
 * without PEM armour; a PEM block (PKCS#8 or PKCS#1 RSA) is accepted as well so
 * keys converted with openssl keep working. Escaped `\n` sequences — common when a
 * PEM key is pasted into a single-line env var or JSON config — are unescaped first.
 *
 * @param privateKey - Base64 PKCS#8 DER or PEM private key.
 * @returns The parsed key object.
 * @throws {EbaySigningKeyError} When the key cannot be parsed or is not Ed25519/RSA.
 */
export const parseSigningPrivateKey = (privateKey: string): KeyObject => {
  const trimmed = privateKey.trim().replaceAll('\\n', '\n');
  let key: KeyObject;
  try {
    key = PEM_PATTERN.test(trimmed)
      ? createPrivateKey(trimmed)
      : createPrivateKey({
          key: Buffer.from(trimmed.replaceAll(/\s/g, ''), 'base64'),
          format: 'der',
          type: 'pkcs8',
        });
  } catch (cause) {
    throw new EbaySigningKeyError(
      'EBAY_SIGNING_PRIVATE_KEY could not be parsed. Use the privateKey value returned by ebay_create_signing_key (base64 PKCS#8) or a PEM private key.',
      { cause },
    );
  }

  if (key.asymmetricKeyType !== 'ed25519' && key.asymmetricKeyType !== 'rsa') {
    throw new EbaySigningKeyError(
      `EBAY_SIGNING_PRIVATE_KEY is a ${key.asymmetricKeyType ?? 'unknown'} key; eBay digital signatures accept only ED25519 or RSA keys.`,
    );
  }
  return key;
};

/**
 * Compute the RFC 9530 `Content-Digest` header value for a body.
 *
 * @param body - Exact body bytes (strings are encoded as UTF-8).
 * @returns The header value, e.g. `sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:`.
 */
export const computeContentDigest = (body: string | Uint8Array): string =>
  `sha-256=:${createHash('sha256').update(body).digest('base64')}:`;

/**
 * Build the RFC 9421 signature base for the components eBay covers.
 *
 * @param components - Ordered `[name, value]` pairs of covered components.
 * @param signatureParams - The serialized inner list and parameters, e.g.
 *   `("x-ebay-signature-key" "@method" "@path" "@authority");created=1658440308`.
 * @returns The newline-joined signature base.
 */
export const buildSignatureBase = (
  components: ReadonlyArray<readonly [string, string]>,
  signatureParams: string,
): string =>
  [
    ...components.map(([name, value]) => `"${name}": ${value}`),
    `"@signature-params": ${signatureParams}`,
  ].join('\n');

/**
 * Produce the eBay digital-signature headers for one request attempt.
 *
 * The signature covers `content-digest` (only when a body is present),
 * `x-ebay-signature-key`, `@method`, `@path`, and `@authority`, matching eBay's
 * documented `Signature-Input`. Call this once per attempt so retries carry a
 * fresh `created` timestamp.
 *
 * @param request - Method, full URL, and the exact body bytes.
 * @param credentials - JWE and private key from `createSigningKey`.
 * @param key - Parsed private key (see {@link parseSigningPrivateKey}).
 * @param now - Clock override in milliseconds, for tests.
 * @returns Headers to merge into the outgoing request.
 *
 * @example
 * ```ts
 * const key = parseSigningPrivateKey(credentials.privateKey);
 * const headers = signEbayRequest({ method: 'GET', url }, credentials, key);
 * ```
 */
export const signEbayRequest = (
  request: SignableRequest,
  credentials: Pick<EbaySigningCredentials, 'jwe'>,
  key: KeyObject,
  now: number = Date.now(),
): Record<string, string> => {
  const url = new URL(request.url);
  const created = Math.floor(now / 1000);
  const headers: Record<string, string> = { [SIGNATURE_KEY_HEADER]: credentials.jwe };
  const components: Array<readonly [string, string]> = [];

  if (request.body !== undefined) {
    const contentDigest = computeContentDigest(request.body);
    headers['Content-Digest'] = contentDigest;
    components.push(['content-digest', contentDigest]);
  }
  components.push(
    [SIGNATURE_KEY_HEADER, credentials.jwe],
    ['@method', request.method.toUpperCase()],
    ['@path', url.pathname],
    ['@authority', authorityOf(url)],
  );

  const signatureParams = `(${components.map(([name]) => `"${name}"`).join(' ')});created=${created}`;
  const signature = signBase(buildSignatureBase(components, signatureParams), key);

  headers['Signature-Input'] = `${SIGNATURE_LABEL}=${signatureParams}`;
  headers.Signature = `${SIGNATURE_LABEL}=:${signature}:`;
  return headers;
};
