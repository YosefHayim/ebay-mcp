import type {
	EbayApiClient,
	EbayRequestConfig,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
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
	const fileResponse = await client.getForResponse<Buffer>(path, undefined, {
		...config,
		responseType: "arraybuffer",
		maxBytes: MAX_INLINE_DOWNLOAD_BYTES,
	});

	const bytes = downloadSize(fileResponse);
	const isTooLarge = bytes > MAX_INLINE_DOWNLOAD_BYTES;

	if (isTooLarge) {
		throw new Error(
			`eBay file from ${path} is at least ${bytes} bytes, above the ${MAX_INLINE_DOWNLOAD_BYTES}-byte limit for returning files inline over MCP`,
		);
	}

	return {
		bytes: fileResponse.data,
		contentType: contentTypeFrom(fileResponse),
		fileName: fileNameFromDisposition(
			fileResponse.headers["content-disposition"],
		),
	};
}

function downloadFailure(path: string, cause: unknown): Error {
	if (cause instanceof Error) {
		const isTooLarge = cause.message.startsWith("eBay file from ");

		if (isTooLarge) {
			return cause;
		}

		const isAlreadyWrapped = cause.message.startsWith(
			`eBay GET ${path} failed:`,
		);

		if (isAlreadyWrapped) {
			return cause;
		}
	}

	const detail = cause instanceof Error ? cause.message : String(cause);

	return new Error(`eBay GET ${path} failed: ${detail}`, { cause });
}

/**
 * Downloads a binary eBay resource, keeping its content type and file name.
 * Reading stops as soon as the file is known to exceed {@link MAX_INLINE_DOWNLOAD_BYTES}.
 *
 * @param client - eBay REST client that owns auth and transport details.
 * @param path - eBay REST path, or a full URL when `config.absolute` is set.
 * @param config - Optional query params, headers, host, or timeout overrides for the request.
 * @returns The file bytes and metadata. Throws when the download fails or the file
 * is above {@link MAX_INLINE_DOWNLOAD_BYTES}.
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
