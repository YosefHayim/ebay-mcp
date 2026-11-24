import type {
	EbayApiClient,
	EbayRequestConfig,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
import { EbayApiError } from "@/ebay-client/request.js";

/**
 * Largest download returned inline as an embedded MCP resource. Base64 grows the payload by
 * a third, and some eBay exports (Taxonomy fetchItemAspects) exceed 100 MB compressed.
 */
export const MAX_INLINE_DOWNLOAD_BYTES = 25 * 1024 * 1024;

const DEFAULT_CONTENT_TYPE = "application/octet-stream";
const ENCODED_FILE_NAME = /filename\*\s*=\s*(?:UTF-8|utf-8)?'[^']*'([^;]+)/;
const QUOTED_FILE_NAME = /filename\s*=\s*"([^"]+)"/;
const BARE_FILE_NAME = /filename\s*=\s*([^;\s]+)/;

const decodeFileName = (encoded: string): string | undefined => {
	try {
		return decodeURIComponent(encoded);
	} catch {
		return undefined;
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
export const fileNameFromDisposition = (
	header: string | undefined,
): string | undefined => {
	if (!header) {
		return;
	}
	const encoded = ENCODED_FILE_NAME.exec(header)?.[1];
	if (encoded) {
		return decodeFileName(encoded.trim());
	}
	return (
		QUOTED_FILE_NAME.exec(header)?.[1] ?? BARE_FILE_NAME.exec(header)?.[1]
	)?.trim();
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

/** Tagged failure for a download too large to return inline through MCP. */
export class DownloadTooLargeError extends Error {
	readonly _tag = "DownloadTooLargeError";
	/** eBay REST path that produced the file. */
	readonly path: string;
	/** Size eBay declared or that was read before stopping; at least `limit + 1`. */
	readonly bytes: number;
	/** Inline limit the file exceeded. */
	readonly limit: number;

	constructor(failure: {
		/** eBay REST path that produced the file. */
		readonly path: string;
		/** Size eBay declared or that was read before stopping; at least `limit + 1`. */
		readonly bytes: number;
		/** Inline limit the file exceeded. */
		readonly limit: number;
	}) {
		super(
			`eBay file from ${failure.path} is at least ${failure.bytes} bytes, above the ${failure.limit}-byte limit for returning files inline over MCP`,
		);
		this.name = "DownloadTooLargeError";
		this.path = failure.path;
		this.bytes = failure.bytes;
		this.limit = failure.limit;
	}
}

/** Size of a download: what was read, or the larger declared length when reading stopped early. */
const downloadSize = (fileResponse: EbayResponse<Buffer>): number =>
	Math.max(
		fileResponse.data.length,
		Number(fileResponse.headers["content-length"]) || 0,
	);

function contentTypeFrom(fileResponse: EbayResponse<Buffer>): string {
	const headerType = fileResponse.headers["content-type"]
		?.split(";")[0]
		?.trim();

	if (headerType) {
		return headerType;
	}

	return DEFAULT_CONTENT_TYPE;
}

async function readDownload(
	client: EbayApiClient,
	path: string,
	config: EbayRequestConfig,
): Promise<DownloadedFile> {
	let fileResponse: EbayResponse<Buffer>;

	try {
		fileResponse = await client.getForResponse<Buffer>(path, undefined, {
			...config,
			responseType: "arraybuffer",
			maxBytes: MAX_INLINE_DOWNLOAD_BYTES,
		});
	} catch (cause) {
		throw new EbayApiError({ method: "GET", path, cause }); // allow-duplicate
	}

	const bytes = downloadSize(fileResponse);
	const isTooLarge = bytes > MAX_INLINE_DOWNLOAD_BYTES;

	if (isTooLarge) {
		throw new DownloadTooLargeError({
			path,
			bytes,
			limit: MAX_INLINE_DOWNLOAD_BYTES,
		});
	}

	return {
		bytes: fileResponse.data,
		contentType: contentTypeFrom(fileResponse),
		fileName: fileNameFromDisposition(
			fileResponse.headers["content-disposition"],
		),
	};
}

function downloadFailure(
	path: string,
	cause: unknown,
): EbayApiError | DownloadTooLargeError {
	if (cause instanceof DownloadTooLargeError) {
		return cause;
	}

	if (cause instanceof EbayApiError) {
		return cause;
	}

	return new EbayApiError({ method: "GET", path, cause }); // allow-duplicate
}

/**
 * Downloads a binary eBay resource, keeping its content type and file name.
 * Reading stops as soon as the file is known to exceed {@link MAX_INLINE_DOWNLOAD_BYTES}.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path, or a full URL when `config.absolute` is set.
 * @param config - Optional query params, headers, host, or timeout overrides for the request.
 * @returns The file bytes and metadata. Throws EbayApiError, or DownloadTooLargeError
 * above {@link MAX_INLINE_DOWNLOAD_BYTES}.
 *
 * @example
 * ```ts
 * const file = await requestDownloadEffect(
 *   client,
 *   '/sell/feed/v1/task/TASK-1/download_result_file',
 * );
 * ```
 */
export async function requestDownloadEffect(
	client: EbayApiClient,
	path: string,
	config: EbayRequestConfig = {},
): Promise<DownloadedFile> {
	try {
		return await readDownload(client, path, config);
	} catch (cause) {
		throw downloadFailure(path, cause);
	}
}
