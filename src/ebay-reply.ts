import type { EbayCall } from './ebay-client.js';
import type { EbayCredentials } from './environment.js';

function isTextDocument(sentDocument: unknown): sentDocument is string {
  return typeof sentDocument == 'string';
}

function applyHeaderFields(headers: Headers, headerFields: Record<string, string> | null): void {
  const isMissing = headerFields == null;

  if (isMissing) {
    return;
  }

  for (const name of Object.keys(headerFields)) {
    const headerValue = headerFields[name];
    const isEmpty = headerValue == null;

    if (isEmpty == false) {
      headers.set(name, headerValue);
    }
  }
}

function callHeaders(
  credentials: EbayCredentials,
  token: string,
  headerFields: Record<string, string> | null,
): Headers {
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Language', credentials.contentLanguage);
  headers.set('X-EBAY-C-MARKETPLACE-ID', credentials.marketplaceId);
  applyHeaderFields(headers, headerFields);
  return headers;
}

function documentText(call: EbayCall): string | null {
  const sentDocument = call.document;
  const isMissing = sentDocument == null;

  if (isMissing) {
    return null;
  }

  const isMissingType = call.contentType == null;

  if (isMissingType) {
    return JSON.stringify(sentDocument);
  }

  const isJson = call.contentType == 'application/json';

  if (isJson) {
    return JSON.stringify(sentDocument);
  }

  const isText = isTextDocument(sentDocument);

  if (isText) {
    return sentDocument;
  }

  return JSON.stringify(sentDocument);
}

async function readReplyText(ebayReply: Response): Promise<string> {
  try {
    return await ebayReply.text();
  } catch (error) {
    throw new Error(`eBay returned ${ebayReply.status} and no error text`, { cause: error });
  }
}

async function readDocument(ebayReply: Response, path: string): Promise<unknown> {
  const isOk = ebayReply.ok;

  if (isOk == false) {
    const failureText = await readReplyText(ebayReply);
    throw new Error(`eBay returned ${ebayReply.status} for ${path}: ${failureText}`);
  }

  const isNoContent = ebayReply.status == 204;

  if (isNoContent) {
    return null;
  }

  try {
    const document: unknown = await ebayReply.json();
    return document;
  } catch (error) {
    throw new Error(`eBay returned unreadable JSON for ${path}`, { cause: error });
  }
}

export { callHeaders, documentText, readDocument, readReplyText };
