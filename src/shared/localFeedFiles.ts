import { isUtf8 } from "node:buffer";

const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const GZIP_SIGNATURE = Buffer.from([0x1f, 0x8b, 0x08]);
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const XML_WHITESPACE = new Set([0x20, 0x09, 0x0a, 0x0d]);
const LESS_THAN = 0x3c;

function opensWithMarkup(bytes: Buffer): boolean {
	const withoutBom = bytes.subarray(0, UTF8_BOM.length).equals(UTF8_BOM)
		? bytes.subarray(UTF8_BOM.length)
		: bytes;
	const first = withoutBom.findIndex((byte) => !XML_WHITESPACE.has(byte));
	return first != -1 && withoutBom[first] == LESS_THAN;
}

export const MAX_FEED_FILE_BYTES = 15 * 1024 * 1024;

export const FEED_FILE_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
	xml: "application/xml",
	csv: "text/csv",
	zip: "application/zip",
	gz: "application/gzip",
};

export function feedFileProblem(
	bytes: Buffer,
	mimeType: string,
): string | undefined {
	if (mimeType == "application/zip") {
		return bytes.subarray(0, ZIP_SIGNATURE.length).equals(ZIP_SIGNATURE)
			? undefined
			: "content is not a ZIP archive";
	}
	if (mimeType == "application/gzip") {
		return bytes.subarray(0, GZIP_SIGNATURE.length).equals(GZIP_SIGNATURE)
			? undefined
			: "content is not a gzip file";
	}
	if (bytes.includes(0) || !isUtf8(bytes)) {
		return `content is not UTF-8 text without NUL bytes, as ${mimeType} requires`;
	}
	if (mimeType == "application/xml" && !opensWithMarkup(bytes)) {
		return "content does not start with XML markup";
	}

	return undefined;
}
