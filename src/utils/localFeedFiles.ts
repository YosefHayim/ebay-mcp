import { isUtf8 } from 'node:buffer';

const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const GZIP_SIGNATURE = Buffer.from([0x1f, 0x8b, 0x08]);
/** Markup must open an XML document, after an optional byte-order mark and whitespace. */
const XML_START = /^\uFEFF?\s*</;
/** Leading bytes inspected for the XML start; whitespace before markup is never this long. */
const XML_START_WINDOW = 1024;

/**
 * Maximum size of a Feed API upload file: eBay limits feed data files to 15 MB, regular or
 * compressed.
 *
 * @see https://developer.ebay.com/api-docs/sell/static/feed/data-file-limits.html
 */
export const MAX_FEED_FILE_BYTES = 15 * 1024 * 1024;

/** Feed file extensions and MIME types: LMS feeds are XML or zipped XML; Seller Hub feeds use CSV. */
export const FEED_FILE_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  xml: 'application/xml',
  csv: 'text/csv',
  zip: 'application/zip',
  gz: 'application/gzip',
};

/**
 * Explains why feed file bytes do not match their extension's MIME type. Archives must carry
 * their signature; text feeds have none, so XML and CSV must instead be UTF-8 without NUL
 * bytes, and XML must open with markup.
 *
 * @param bytes - File contents.
 * @param mimeType - MIME type derived from the extension via {@link FEED_FILE_MIME_BY_EXTENSION}.
 * @returns The reason the content is rejected, or undefined when it is acceptable.
 *
 * @example
 * ```ts
 * feedFileProblem(Buffer.from('<?xml version="1.0"?><BulkDataExchangeRequests/>'), 'application/xml'); // undefined
 * ```
 */
export const feedFileProblem = (bytes: Buffer, mimeType: string): string | undefined => {
  if (mimeType === 'application/zip') {
    return bytes.subarray(0, ZIP_SIGNATURE.length).equals(ZIP_SIGNATURE)
      ? undefined
      : 'content is not a ZIP archive';
  }
  if (mimeType === 'application/gzip') {
    return bytes.subarray(0, GZIP_SIGNATURE.length).equals(GZIP_SIGNATURE)
      ? undefined
      : 'content is not a gzip file';
  }
  if (bytes.includes(0) || !isUtf8(bytes)) {
    return `content is not UTF-8 text without NUL bytes, as ${mimeType} requires`;
  }
  if (
    mimeType === 'application/xml' &&
    !XML_START.test(bytes.toString('utf8', 0, XML_START_WINDOW))
  ) {
    return 'content does not start with XML markup';
  }
};
