import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import {
	MEDIA_DIRS_ENV,
	MEDIA_ROOT_ENV,
	type MediaAccessConfig,
} from "@/shared/mediaAccess.js";
import {
	FEED_FILE_MIME_BY_EXTENSION,
	feedFileProblem,
	MAX_FEED_FILE_BYTES,
} from "./localFeedFiles.js";

/** Local file families the upload tools accept. */
export type LocalMediaKind =
	| "image"
	| "video"
	| "document"
	| "postOrderDocument"
	| "feedFile";

/** A validated local media file, read into memory. */
export interface LocalMediaFile {
	/** Reference exactly as the caller supplied it (absolute path or `media://` URI). */
	readonly source: string;
	/** Real filesystem path after symlink resolution. */
	readonly path: string;
	/** Base name sent to eBay as the upload file name. */
	readonly fileName: string;
	/** MIME type derived from the extension, confirmed by file signature (binary media and archives) or by UTF-8 text checks (XML/CSV feed files). */
	readonly mimeType: string;
	/** File size in bytes. */
	readonly size: number;
	/** Upload policy the file was validated against. */
	readonly kind: LocalMediaKind;
	/** File contents. */
	readonly bytes: Buffer;
}

/** Largest image eBay Picture Services accepts. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/** Largest video the Media API accepts (from `CreateVideoRequest.size`). */
export const MAX_VIDEO_BYTES = 157_286_400;

/** Maximum size of a listing document. */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
/** Maximum size of a post-order document. */
export const MAX_POST_ORDER_DOCUMENT_BYTES = 5 * 1024 * 1024;

/** URI scheme resolved under `EBAY_MCP_MEDIA_ROOT`. */
export const MEDIA_URI_PREFIX = "media://";

const IMAGE_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	bmp: "image/bmp",
	tif: "image/tiff",
	tiff: "image/tiff",
	webp: "image/webp",
	avif: "image/avif",
	heic: "image/heic",
	heif: "image/heic",
};

const VIDEO_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
	mp4: "video/mp4",
	m4v: "video/mp4",
	mov: "video/quicktime",
};

const DOCUMENT_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
	pdf: "application/pdf",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
};
const MEDIA_POLICIES = {
	image: { types: IMAGE_MIME_BY_EXTENSION, limit: MAX_IMAGE_BYTES },
	video: { types: VIDEO_MIME_BY_EXTENSION, limit: MAX_VIDEO_BYTES },
	document: { types: DOCUMENT_MIME_BY_EXTENSION, limit: MAX_DOCUMENT_BYTES },
	postOrderDocument: {
		types: {
			...DOCUMENT_MIME_BY_EXTENSION,
			bmp: "image/bmp",
			gif: "image/gif",
		},
		limit: MAX_POST_ORDER_DOCUMENT_BYTES,
	},
	feedFile: { types: FEED_FILE_MIME_BY_EXTENSION, limit: MAX_FEED_FILE_BYTES },
};

const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"]);
const AVIF_BRANDS = new Set(["avif", "avis"]);

const startsWith = (
	bytes: Buffer,
	signature: readonly number[],
	offset = 0,
): boolean => signature.every((byte, index) => bytes[offset + index] === byte);

const asciiAt = (bytes: Buffer, offset: number, length: number): string =>
	bytes.subarray(offset, offset + length).toString("latin1");

/** Detects the media type from the file signature; `undefined` when unrecognised. */
export const sniffMediaType = (bytes: Buffer): string | undefined => {
	if (asciiAt(bytes, 0, 5) === "%PDF-") return "application/pdf";
	if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
		return "image/jpeg";
	}
	if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return "image/png";
	}
	if (asciiAt(bytes, 0, 4) === "GIF8") {
		return "image/gif";
	}
	if (asciiAt(bytes, 0, 2) === "BM") {
		return "image/bmp";
	}
	if (
		startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) ||
		startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])
	) {
		return "image/tiff";
	}
	if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 4) === "WEBP") {
		return "image/webp";
	}
	if (asciiAt(bytes, 4, 4) === "ftyp") {
		const brand = asciiAt(bytes, 8, 4).trim().toLowerCase();
		if (AVIF_BRANDS.has(brand)) {
			return "image/avif";
		}
		if (HEIC_BRANDS.has(brand)) {
			return "image/heic";
		}
		return brand === "qt" ? "video/quicktime" : "video/mp4";
	}

	return undefined;
};

const kindOf = (mimeType: string): LocalMediaKind =>
	mimeType.startsWith("video/") ? "video" : "image";

const fail = (message: string): Error => new Error(message);

const isWithin = (target: string, dir: string): boolean =>
	target === dir ||
	target.startsWith(dir.endsWith(path.sep) ? dir : `${dir}${path.sep}`);

const resolveReference = (
	source: string,
	access: MediaAccessConfig,
): string => {
	if (source.startsWith(MEDIA_URI_PREFIX)) {
		if (!access.mediaRoot) {
			throw fail(
				`media:// references need ${MEDIA_ROOT_ENV} to point at the media directory`,
			);
		}
		let relative: string;
		try {
			relative = decodeURIComponent(source.slice(MEDIA_URI_PREFIX.length));
		} catch {
			throw fail("media:// reference contains invalid URI encoding");
		}
		if (relative.length === 0) {
			throw fail("media:// reference has no path");
		}
		return path.resolve(access.mediaRoot, relative);
	}
	if (path.isAbsolute(source)) {
		return path.resolve(source);
	}
	throw fail(
		"media references must be absolute paths or media://<relative-path> URIs",
	);
};

const realPathOf = async (target: string): Promise<string | undefined> => {
	try {
		return await realpath(target);
	} catch {
		return undefined;
	}
};

const expectedMimeType = (filePath: string, kind: LocalMediaKind): string => {
	const extension = path.extname(filePath).slice(1).toLowerCase();
	const table: Readonly<Record<string, string>> = MEDIA_POLICIES[kind].types;
	const mimeType = table[extension];
	if (!mimeType) {
		throw fail(
			`unsupported ${kind} extension ".${extension}"; allowed: ${Object.keys(table).join(", ")}`,
		);
	}
	return mimeType;
};

/** HEIC and AVIF share the ISO-BMFF container; the major brand does not always match the extension. */
const HEIF_FAMILY: ReadonlySet<string> = new Set(["image/heic", "image/avif"]);

const sameFamily = (expected: string, sniffed: string): boolean =>
	expected === sniffed ||
	(kindOf(expected) === "video" && kindOf(sniffed) === "video") ||
	(HEIF_FAMILY.has(expected) && HEIF_FAMILY.has(sniffed));

/** Explains why media bytes do not carry the extension's signature; `undefined` when they do. */
const mediaSignatureProblem = (
	bytes: Buffer,
	mimeType: string,
): string | undefined => {
	const sniffed = sniffMediaType(bytes);
	if (sniffed && sameFamily(mimeType, sniffed)) {
		return;
	}
	return `content does not look like ${mimeType}${sniffed ? ` (detected ${sniffed})` : ""}`;
};

/**
 * Resolves, authorises, validates, and reads one local media reference.
 *
 * The reference is resolved (`media://` under `EBAY_MCP_MEDIA_ROOT`, otherwise an
 * absolute path), symlinks are followed with `realpath`, and the real path must sit
 * inside one of the allowed directories. The extension must be one eBay accepts for
 * the requested kind, the size must be within eBay's limit, and the content must agree
 * with the extension (file signature for binary types; UTF-8 text checks for XML/CSV feeds).
 *
 * @param source - Absolute path or `media://` reference.
 * @param kind - Upload policy: image, video, listing document, post-order document or feed file.
 * @param access - Parsed allowlist from {@link getMediaAccessConfig}.
 * @returns The validated file, including its contents.
 *
 * @example
 * ```ts
 * const image = await loadLocalMedia('/srv/media/front.jpg', 'image', access);
 * ```
 */
export const loadLocalMedia = async (
	source: string,
	kind: LocalMediaKind,
	access: MediaAccessConfig,
): Promise<LocalMediaFile> => {
	if (access.allowedDirs.length === 0) {
		throw fail(
			`local media access is disabled; set ${MEDIA_DIRS_ENV} (path-delimited directories) or ${MEDIA_ROOT_ENV} to the directories this server may read`,
		);
	}
	const candidate = resolveReference(source, access);
	const realFilePath = await realPathOf(candidate);
	if (!realFilePath) {
		throw fail(`file not found: ${candidate}`);
	}
	const allowedRealDirs: string[] = [];
	for (const dir of access.allowedDirs) {
		const realDir = await realPathOf(dir);
		allowedRealDirs.push(realDir ?? dir);
	}
	if (!allowedRealDirs.some((dir) => isWithin(realFilePath, dir))) {
		throw fail(
			`resolves to ${realFilePath}, outside the allowed media directories`,
		);
	}
	let stats: Awaited<ReturnType<typeof stat>>;
	try {
		stats = await stat(realFilePath);
	} catch {
		throw fail(`cannot read ${realFilePath}`);
	}
	if (!stats.isFile()) {
		throw fail(`${realFilePath} is not a regular file`);
	}
	const mimeType = expectedMimeType(realFilePath, kind);
	const limit = MEDIA_POLICIES[kind].limit;
	if (stats.size > limit) {
		throw fail(
			`${stats.size} bytes exceeds eBay's ${kind} limit of ${limit} bytes`,
		);
	}
	if (stats.size === 0) {
		throw fail("file is empty");
	}
	let bytes: Buffer;
	try {
		bytes = await readFile(realFilePath);
	} catch {
		throw fail(`cannot read ${realFilePath}`);
	}
	if (bytes.length === 0 || bytes.length > limit) {
		throw fail(`file must contain 1 to ${limit} bytes`);
	}
	const contentProblem =
		kind === "feedFile"
			? feedFileProblem(bytes, mimeType)
			: mediaSignatureProblem(bytes, mimeType);
	if (contentProblem) {
		throw fail(contentProblem);
	}
	return {
		source,
		path: realFilePath,
		fileName: path.basename(realFilePath),
		mimeType,
		size: bytes.length,
		kind,
		bytes,
	};
};

/**
 * Loads several media references in order, failing on the first invalid one so
 * nothing is uploaded when any reference is rejected.
 *
 * @param sources - Absolute paths or `media://` references.
 * @param kind - Whether images or videos are expected.
 * @param access - Parsed allowlist from {@link getMediaAccessConfig}.
 * @returns The validated files in input order.
 *
 * @example
 * ```ts
 * const images = await loadLocalMediaList(paths, 'image', access);
 * ```
 */
export const loadLocalMediaList = async (
	sources: readonly string[],
	kind: LocalMediaKind,
	access: MediaAccessConfig,
): Promise<LocalMediaFile[]> => {
	const files: LocalMediaFile[] = [];
	for (const source of sources) {
		const file = await loadLocalMedia(source, kind, access);
		files.push(file);
	}
	return files;
};
