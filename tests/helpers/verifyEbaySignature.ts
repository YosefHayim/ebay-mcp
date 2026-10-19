import { buildSignatureBase } from '@/api/client/signEbayRequest.js';
import { type KeyObject, verify } from 'node:crypto';

const SIGNATURE_LABEL_PATTERN = /^sig1=/;
const SIGNATURE_VALUE_PATTERN = /^sig1=:|:$/g;
const COVERED_COMPONENT_PATTERN = /"([^"]+)"/g;

export const verifyEbaySignature = (
  signatureHeaders: Record<string, string>,
  signedRequest: { readonly method: string; readonly url: string },
  publicKey: KeyObject,
): boolean => {
  const headerEntries = Object.entries(signatureHeaders).map(
    ([name, value]) => [name.toLowerCase(), value] as const,
  );
  const headers = Object.fromEntries(headerEntries);
  const signedUrl = new URL(signedRequest.url);
  const signatureParams = headers['signature-input'].replace(SIGNATURE_LABEL_PATTERN, '');
  const componentValues: Record<string, string> = {
    'content-digest': headers['content-digest'],
    'x-ebay-signature-key': headers['x-ebay-signature-key'],
    '@method': signedRequest.method,
    '@path': signedUrl.pathname,
    '@authority': signedUrl.host,
  };
  const coveredComponents = [...signatureParams.matchAll(COVERED_COMPONENT_PATTERN)].map(
    ([, name]) => [name, componentValues[name]] as const,
  );
  const signatureBase = buildSignatureBase(coveredComponents, signatureParams);
  const signatureBase64 = headers.signature.replace(SIGNATURE_VALUE_PATTERN, '');
  const signature = Buffer.from(signatureBase64, 'base64');
  const signatureBaseBytes = Buffer.from(signatureBase);
  const digest = publicKey.asymmetricKeyType === 'ed25519' ? null : 'sha256';
  return verify(digest, signatureBaseBytes, publicKey, signature);
};
