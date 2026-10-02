import type { EbayApiClient, EbayRequestConfig } from '@/api/client.js';
import { EbayApiError } from '@/api/shared/request.js';
import { Effect } from 'effect';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const ENCODED_FILE_NAME = /filename\*\s*=\s*(?:UTF-8|utf-8)?''([^;]+)/;
const QUOTED_FILE_NAME = /filename\s*=\s*"([^"]+)"/;
const BARE_FILE_NAME = /filename\s*=\s*([^;\s]+)/;

const decodeFileName = (encoded: string): string | undefined => {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return;
  }
};

/**
 * Reads the file name eBay advertises in a `content-disposition` header.
 *
 * @param header - Raw `content-disposition` value, if the response carried one.
 * @returns The RFC 5987 `filename*` value when present, else the plain `filename`, else undefined.
 *
 * @example
 * ```ts
 * fileNameFromDisposition('attachment; filename="report.csv.gz"'); // 'report.csv.gz'
 * ```
 */
export const fileNameFromDisposition = (header: string | undefined): string | undefined => {
  if (!header) {
    return;
  }
  const encoded = ENCODED_FILE_NAME.exec(header)?.[1];
  if (encoded) {
    return decodeFileName(encoded.trim());
  }
  return (QUOTED_FILE_NAME.exec(header)?.[1] ?? BARE_FILE_NAME.exec(header)?.[1])?.trim();
};

/** Binary file returned by an eBay download endpoint, with its transport metadata. */
export interface DownloadedFile {
  /** Raw response body. */
  readonly bytes: Buffer;
  /** Media type from the response `content-type`, defaulting to application/octet-stream. */
  readonly contentType: string;
  /** File name from `content-disposition`, when eBay supplied one. */
  readonly fileName: string | undefined;
}

/**
 * Downloads a binary eBay resource as an Effect, keeping its content type and file name.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path, or a full URL when `config.absolute` is set.
 * @param config - Optional query params, headers, host, or timeout overrides for the request.
 * @returns An Effect that succeeds with the file bytes and metadata, or fails with EbayApiError.
 *
 * @example
 * ```ts
 * const file = await Effect.runPromise(
 *   requestDownloadEffect(client, '/sell/feed/v1/task/TASK-1/download_result_file'),
 * );
 * ```
 */
export const requestDownloadEffect = (
  client: EbayApiClient,
  path: string,
  config: EbayRequestConfig = {},
): Effect.Effect<DownloadedFile, EbayApiError> =>
  Effect.tryPromise({
    try: () =>
      client.getForResponse<Buffer>(path, undefined, { ...config, responseType: 'arraybuffer' }),
    catch: (cause) => new EbayApiError({ method: 'GET', path, cause }), // allow-duplicate
  }).pipe(
    Effect.map((response) => ({
      bytes: response.data,
      contentType: response.headers['content-type']?.split(';')[0]?.trim() || DEFAULT_CONTENT_TYPE,
      fileName: fileNameFromDisposition(response.headers['content-disposition']),
    })),
  );
