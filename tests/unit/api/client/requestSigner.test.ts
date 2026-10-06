import {
  buildSignatureBase,
  computeContentDigest,
  EbaySigningKeyError,
  parseSigningPrivateKey,
  signEbayRequest,
} from '@/api/client/requestSigner.js';
import { createPrivateKey, generateKeyPairSync, type KeyObject, sign, verify } from 'node:crypto';
import { describe, expect, it } from 'vitest';

/**
 * Ed25519 test key from RFC 9421 Appendix B.1.4, assembled from its public seed
 * at runtime so secret scanners do not flag a literal private-key block.
 */
const RFC_ED25519_KEY = createPrivateKey({
  key: Buffer.from(
    '302e020100300506032b657004220420' +
      '9f8362f87a484a954e6e740c5b4c0e84229139a20aa8ab56ff66586f6a7d29c5',
    'hex',
  ),
  format: 'der',
  type: 'pkcs8',
});
const RFC_ED25519_PEM = RFC_ED25519_KEY.export({ format: 'pem', type: 'pkcs8' }).toString();

const JWE = 'test-signing-key-jwe';
const NOW = 1_658_440_308_000;

/** Base64 PKCS#8 DER — the shape eBay's createSigningKey returns. */
const toBase64Der = (key: KeyObject): string =>
  key.export({ format: 'der', type: 'pkcs8' }).toString('base64');

/** Rebuild the signature base from the emitted headers and verify the signature. */
const verifyHeaders = (
  headers: Record<string, string>,
  request: { method: string; url: string },
  publicKey: KeyObject,
): boolean => {
  const url = new URL(request.url);
  const signatureParams = headers['Signature-Input'].replace(/^sig1=/, '');
  const values: Record<string, string> = {
    'content-digest': headers['Content-Digest'] ?? '',
    'x-ebay-signature-key': headers['x-ebay-signature-key'],
    '@method': request.method,
    '@path': url.pathname,
    '@authority': url.host,
  };
  const names = [...signatureParams.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const base = buildSignatureBase(
    names.map((name) => [name, values[name]] as const),
    signatureParams,
  );
  const signature = Buffer.from(headers.Signature.replace(/^sig1=:|:$/g, ''), 'base64');
  const digest = publicKey.asymmetricKeyType === 'ed25519' ? null : 'sha256';
  return verify(digest, Buffer.from(base), publicKey, signature);
};

describe('computeContentDigest', () => {
  it('matches the example in eBay digital signature guide', () => {
    expect(computeContentDigest('{"hello": "world"}')).toBe(
      'sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:',
    );
  });

  it('digests bytes and strings identically', () => {
    expect(computeContentDigest(Buffer.from('{"a":1}'))).toBe(computeContentDigest('{"a":1}'));
  });
});

describe('buildSignatureBase', () => {
  it('reproduces the RFC 9421 B.2.6 Ed25519 signature', () => {
    const base = buildSignatureBase(
      [
        ['date', 'Tue, 20 Apr 2021 02:07:55 GMT'],
        ['@method', 'POST'],
        ['@path', '/foo'],
        ['@authority', 'example.com'],
        ['content-type', 'application/json'],
        ['content-length', '18'],
      ],
      '("date" "@method" "@path" "@authority" "content-type" "content-length");created=1618884473;keyid="test-key-ed25519"',
    );

    const signature = sign(null, Buffer.from(base), parseSigningPrivateKey(RFC_ED25519_PEM));

    expect(signature.toString('base64')).toBe(
      'wqcAqbmYJ2ji2glfAMaRy4gruYYnx2nEFN2HN6jrnDnQCK1u02Gb04v9EDgwUPiu4A0w6vuQv5lIp5WPpBKRCw==',
    );
  });
});

describe('parseSigningPrivateKey', () => {
  it('accepts the base64 PKCS#8 DER eBay returns', () => {
    const { privateKey } = generateKeyPairSync('ed25519');
    expect(parseSigningPrivateKey(toBase64Der(privateKey)).asymmetricKeyType).toBe('ed25519');
  });

  it('accepts a PEM key with escaped newlines from a single-line env var', () => {
    expect(parseSigningPrivateKey(RFC_ED25519_PEM.replaceAll('\n', '\\n')).asymmetricKeyType).toBe(
      'ed25519',
    );
  });

  it('accepts RSA keys', () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    expect(parseSigningPrivateKey(toBase64Der(privateKey)).asymmetricKeyType).toBe('rsa');
  });

  it('rejects malformed keys with a configuration hint', () => {
    expect(() => parseSigningPrivateKey('not-a-key')).toThrow(EbaySigningKeyError);
    expect(() => parseSigningPrivateKey('not-a-key')).toThrow(/EBAY_SIGNING_PRIVATE_KEY/);
  });

  it('rejects key types eBay does not support', () => {
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    expect(() => parseSigningPrivateKey(toBase64Der(privateKey))).toThrow(/ED25519 or RSA/);
  });
});

describe('signEbayRequest', () => {
  const url = 'https://apiz.ebay.com/sell/finances/v1/transaction?limit=5&filter=x';

  it('signs a bodiless request with the components eBay documents', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');

    const headers = signEbayRequest({ method: 'GET', url }, { jwe: JWE }, privateKey, NOW);

    expect(headers['x-ebay-signature-key']).toBe(JWE);
    expect(headers['Content-Digest']).toBeUndefined();
    expect(headers['Signature-Input']).toBe(
      'sig1=("x-ebay-signature-key" "@method" "@path" "@authority");created=1658440308',
    );
    expect(headers.Signature).toMatch(/^sig1=:[A-Za-z0-9+/]+=*:$/);
    expect(verifyHeaders(headers, { method: 'GET', url }, publicKey)).toBe(true);
  });

  it('covers content-digest first when a body is sent', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    const body = '{"reasonForRefund":"BUYER_CANCEL"}';
    const refundUrl = 'https://api.ebay.com/sell/fulfillment/v1/order/1-2/issue_refund';

    const headers = signEbayRequest(
      { method: 'POST', url: refundUrl, body },
      { jwe: JWE },
      privateKey,
      NOW,
    );

    expect(headers['Content-Digest']).toBe(computeContentDigest(body));
    expect(headers['Signature-Input']).toBe(
      'sig1=("content-digest" "x-ebay-signature-key" "@method" "@path" "@authority");created=1658440308',
    );
    expect(verifyHeaders(headers, { method: 'POST', url: refundUrl }, publicKey)).toBe(true);
  });

  it('signs with RSASSA-PKCS1-v1_5 SHA-256 for RSA keys', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

    const headers = signEbayRequest({ method: 'get', url }, { jwe: JWE }, privateKey, NOW);

    expect(verifyHeaders(headers, { method: 'GET', url }, publicKey)).toBe(true);
  });

  it('keeps a non-default port in @authority', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    const proxyUrl = 'http://localhost:8080/sell/finances/v1/payout';

    const headers = signEbayRequest({ method: 'GET', url: proxyUrl }, { jwe: JWE }, privateKey);

    expect(verifyHeaders(headers, { method: 'GET', url: proxyUrl }, publicKey)).toBe(true);
  });
});
