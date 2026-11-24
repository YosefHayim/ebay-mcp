import type {
	EbayApiClient,
	EbayRequestConfig,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
export const MAX_INLINE_DOWNLOAD_BYTES = 25 * 1024 * 1024;

const DEFAULT_CONTENT_TYPE = "application/octet-stream";
const ENCODED_FILE_NAME = /filename\*\s*=\s*(?:UTF-8|utf-8)?'[^']*'([^;]+)/;
const QUOTED_FILE_NAME = /filename\s*=\s*"([^"]+)"/;
const BARE_FILE_NAME = /filename\s*=\s*([^;\s]+)/;

function decodeFileName(encoded: string): string | undefined {
	try {
		return decodeURIComponent(encoded);
	} catch {
		return undefined;
	}
}

export function fileNameFromDisposition(
	header: string | undefined,
): string | undefined {
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
}

export interface DownloadedFile {
	readonly bytes: Buffer;
	readonly contentType: string;
	readonly fileName: string | undefined;
}

function downloadSize(fileResponse: EbayResponse<Buffer>): number {
	return Math.max(
		fileResponse.data.length,
		Number(fileResponse.headers["content-length"]) || 0,
	);
}

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
