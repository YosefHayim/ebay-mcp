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

export type LocalMediaKind =
	| "image"
	| "video"
	| "document"
	| "postOrderDocument"
	| "feedFile";

export interface LocalMediaFile {
	readonly source: string;
	readonly path: string;
	readonly fileName: string;
	readonly mimeType: string;
	readonly size: number;
	readonly kind: LocalMediaKind;
	readonly bytes: Buffer;
}

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export const MAX_VIDEO_BYTES = 157_286_400;

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_POST_ORDER_DOCUMENT_BYTES = 5 * 1024 * 1024;

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

function startsWith(
	bytes: Buffer,
	signature: readonly number[],
	offset = 0,
): boolean {
	return signature.every((byte, index) => bytes[offset + index] == byte);
}

function asciiAt(bytes: Buffer, offset: number, length: number): string {
	return bytes.subarray(offset, offset + length).toString("latin1");
}

function isTiff(bytes: Buffer): boolean {
	const isLittleEndianTiff = startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]);

	if (isLittleEndianTiff) {
		return true;
	}

	const isBigEndianTiff = startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a]);

	if (isBigEndianTiff) {
		return true;
	}

	return false;
}

function isWebp(bytes: Buffer): boolean {
	const isNotRiffContainer = asciiAt(bytes, 0, 4) != "RIFF";

	if (isNotRiffContainer) {
		return false;
	}

	const isNotWebpBrand = asciiAt(bytes, 8, 4) != "WEBP";

	if (isNotWebpBrand) {
		return false;
	}

	return true;
}

export function sniffMediaType(bytes: Buffer): string | undefined {
	if (asciiAt(bytes, 0, 5) == "%PDF-") return "application/pdf";
	if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
		return "image/jpeg";
	}
	if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return "image/png";
	}
	if (asciiAt(bytes, 0, 4) == "GIF8") {
		return "image/gif";
	}
	if (asciiAt(bytes, 0, 2) == "BM") {
		return "image/bmp";
	}
	if (isTiff(bytes)) {
		return "image/tiff";
	}
	if (isWebp(bytes)) {
		return "image/webp";
	}
	if (asciiAt(bytes, 4, 4) == "ftyp") {
		const brand = asciiAt(bytes, 8, 4).trim().toLowerCase();
		if (AVIF_BRANDS.has(brand)) {
			return "image/avif";
		}
		if (HEIC_BRANDS.has(brand)) {
			return "image/heic";
		}
		return brand == "qt" ? "video/quicktime" : "video/mp4";
	}

	return undefined;
}

function kindOf(mimeType: string): LocalMediaKind {
	return mimeType.startsWith("video/") ? "video" : "image";
}

function fail(message: string): Error {
	return new Error(message);
}

function isWithin(target: string, dir: string): boolean {
	const isSamePath = target == dir;

	if (isSamePath) {
		return true;
	}

	const directoryPrefix = dir.endsWith(path.sep) ? dir : `${dir}${path.sep}`;

	const isNestedPath = target.startsWith(directoryPrefix);

	if (isNestedPath) {
		return true;
	}

	return false;
}

function resolveReference(source: string, access: MediaAccessConfig): string {
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
		if (relative.length == 0) {
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
}

async function realPathOf(target: string): Promise<string | undefined> {
	try {
		return await realpath(target);
	} catch {
		return undefined;
	}
}

function expectedMimeType(filePath: string, kind: LocalMediaKind): string {
	const extension = path.extname(filePath).slice(1).toLowerCase();
	const table: Readonly<Record<string, string>> = MEDIA_POLICIES[kind].types;
	const mimeType = table[extension];
	if (!mimeType) {
		throw fail(
			`unsupported ${kind} extension ".${extension}"; allowed: ${Object.keys(table).join(", ")}`,
		);
	}
	return mimeType;
}

const HEIF_FAMILY: ReadonlySet<string> = new Set(["image/heic", "image/avif"]);

function isSameVideoKind(expected: string, sniffed: string): boolean {
	const isExpectedNotVideo = kindOf(expected) != "video";

	if (isExpectedNotVideo) {
		return false;
	}

	const isSniffedNotVideo = kindOf(sniffed) != "video";

	if (isSniffedNotVideo) {
		return false;
	}

	return true;
}

function isSameHeifFamily(expected: string, sniffed: string): boolean {
	const isExpectedOutsideHeif = !HEIF_FAMILY.has(expected);

	if (isExpectedOutsideHeif) {
		return false;
	}

	const isSniffedOutsideHeif = !HEIF_FAMILY.has(sniffed);

	if (isSniffedOutsideHeif) {
		return false;
	}

	return true;
}

function sameFamily(expected: string, sniffed: string): boolean {
	const isSameMimeType = expected == sniffed;

	if (isSameMimeType) {
		return true;
	}

	const isVideoFamily = isSameVideoKind(expected, sniffed);

	if (isVideoFamily) {
		return true;
	}

	const isHeifFamily = isSameHeifFamily(expected, sniffed);

	if (isHeifFamily) {
		return true;
	}

	return false;
}

function mediaSignatureProblem(
	bytes: Buffer,
	mimeType: string,
): string | undefined {
	const detectedType = sniffMediaType(bytes);

	const isMissingDetection = detectedType == null;

	if (isMissingDetection) {
		return `content does not look like ${mimeType}`;
	}

	const isEmptyDetection = detectedType == "";

	if (isEmptyDetection) {
		return `content does not look like ${mimeType}`;
	}

	const isRecognizedFamily = sameFamily(mimeType, detectedType);

	if (isRecognizedFamily) {
		return;
	}

	return `content does not look like ${mimeType} (detected ${detectedType})`;
}

export async function loadLocalMedia(
	source: string,
	kind: LocalMediaKind,
	access: MediaAccessConfig,
): Promise<LocalMediaFile> {
	if (access.allowedDirs.length == 0) {
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
	if (stats.size == 0) {
		throw fail("file is empty");
	}
	let bytes: Buffer;
	try {
		bytes = await readFile(realFilePath);
	} catch {
		throw fail(`cannot read ${realFilePath}`);
	}

	const hasNoBytes = bytes.length == 0;

	if (hasNoBytes) {
		throw fail(`file must contain 1 to ${limit} bytes`);
	}

	const isOverByteLimit = bytes.length > limit;

	if (isOverByteLimit) {
		throw fail(`file must contain 1 to ${limit} bytes`);
	}

	const contentProblem =
		kind == "feedFile"
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
}

export async function loadLocalMediaList(
	sources: readonly string[],
	kind: LocalMediaKind,
	access: MediaAccessConfig,
): Promise<LocalMediaFile[]> {
	const files: LocalMediaFile[] = [];
	for (const source of sources) {
		const file = await loadLocalMedia(source, kind, access);
		files.push(file);
	}
	return files;
}
