import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { MEDIA_DIRS_ENV, MEDIA_ROOT_ENV, type MediaAccessConfig } from '@/config/mediaAccess.js';
import { Data, Effect } from 'effect';

/** Media families the upload tools accept. */
export type LocalMediaKind = 'image' | 'video';

/** A validated local media file, read into memory. */
export interface LocalMediaFile {
  /** Reference exactly as the caller supplied it (absolute path or `media://` URI). */
  readonly source: string;
  /** Real filesystem path after symlink resolution. */
  readonly path: string;
  /** Base name sent to eBay as the upload file name. */
  readonly fileName: string;
  /** MIME type derived from the extension and confirmed against the file signature. */
  readonly mimeType: string;
  /** File size in bytes. */
  readonly size: number;
  /** Whether the file is an image or a video. */
  readonly kind: LocalMediaKind;
  /** File contents. */
  readonly bytes: Buffer;
}

/** Tagged failure for a media reference the server refuses to read. */
export class LocalMediaError extends Data.TaggedError('LocalMediaError')<{
  /** Reference exactly as the caller supplied it. */
  readonly source: string;
  /** Human-readable reason. */
  readonly message: string;
}> {}

/** Largest image eBay Picture Services accepts. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/** Largest video the Media API accepts (from `CreateVideoRequest.size`). */
export const MAX_VIDEO_BYTES = 157_286_400;

/** URI scheme resolved under `EBAY_MCP_MEDIA_ROOT`. */
export const MEDIA_URI_PREFIX = 'media://';

const IMAGE_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heic',
};

const VIDEO_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
};

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

const startsWith = (bytes: Buffer, signature: readonly number[], offset = 0): boolean =>
  signature.every((byte, index) => bytes[offset + index] === byte);

const asciiAt = (bytes: Buffer, offset: number, length: number): string =>
  bytes.subarray(offset, offset + length).toString('latin1');

/** Detects the media type from the file signature; `undefined` when unrecognised. */
export const sniffMediaType = (bytes: Buffer): string | undefined => {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  if (asciiAt(bytes, 0, 4) === 'GIF8') {
    return 'image/gif';
  }
  if (asciiAt(bytes, 0, 2) === 'BM') {
    return 'image/bmp';
  }
  if (startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) || startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])) {
    return 'image/tiff';
  }
  if (asciiAt(bytes, 0, 4) === 'RIFF' && asciiAt(bytes, 8, 4) === 'WEBP') {
    return 'image/webp';
  }
  if (asciiAt(bytes, 4, 4) === 'ftyp') {
    const brand = asciiAt(bytes, 8, 4).trim().toLowerCase();
    if (AVIF_BRANDS.has(brand)) {
      return 'image/avif';
    }
    if (HEIC_BRANDS.has(brand)) {
      return 'image/heic';
    }
    return brand === 'qt' ? 'video/quicktime' : 'video/mp4';
  }
};

const kindOf = (mimeType: string): LocalMediaKind =>
  mimeType.startsWith('video/') ? 'video' : 'image';

const fail = (source: string, message: string): LocalMediaError =>
  new LocalMediaError({ source, message });

const isWithin = (target: string, dir: string): boolean =>
  target === dir || target.startsWith(dir.endsWith(path.sep) ? dir : `${dir}${path.sep}`);

const resolveReference = (
  source: string,
  access: MediaAccessConfig,
): Effect.Effect<string, LocalMediaError> => {
  if (source.startsWith(MEDIA_URI_PREFIX)) {
    if (!access.mediaRoot) {
      return Effect.fail(
        fail(source, `media:// references need ${MEDIA_ROOT_ENV} to point at the media directory`),
      );
    }
    const relative = decodeURIComponent(source.slice(MEDIA_URI_PREFIX.length));
    if (relative.length === 0) {
      return Effect.fail(fail(source, 'media:// reference has no path'));
    }
    return Effect.succeed(path.resolve(access.mediaRoot, relative));
  }
  if (path.isAbsolute(source)) {
    return Effect.succeed(path.resolve(source));
  }
  return Effect.fail(
    fail(source, 'media references must be absolute paths or media://<relative-path> URIs'),
  );
};

const realPathOf = (target: string): Effect.Effect<string | undefined> =>
  Effect.tryPromise(() => realpath(target)).pipe(Effect.orElseSucceed(() => undefined));

const expectedMimeType = (
  source: string,
  filePath: string,
  kind: LocalMediaKind,
): Effect.Effect<string, LocalMediaError> => {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  const table = kind === 'image' ? IMAGE_MIME_BY_EXTENSION : VIDEO_MIME_BY_EXTENSION;
  const mimeType = table[extension];
  if (!mimeType) {
    return Effect.fail(
      fail(
        source,
        `unsupported ${kind} extension ".${extension}"; allowed: ${Object.keys(table).join(', ')}`,
      ),
    );
  }
  return Effect.succeed(mimeType);
};

/** HEIC and AVIF share the ISO-BMFF container; the major brand does not always match the extension. */
const HEIF_FAMILY: ReadonlySet<string> = new Set(['image/heic', 'image/avif']);

const sameFamily = (expected: string, sniffed: string): boolean =>
  expected === sniffed ||
  (kindOf(expected) === 'video' && kindOf(sniffed) === 'video') ||
  (HEIF_FAMILY.has(expected) && HEIF_FAMILY.has(sniffed));

/**
 * Resolves, authorises, validates, and reads one local media reference.
 *
 * The reference is resolved (`media://` under `EBAY_MCP_MEDIA_ROOT`, otherwise an
 * absolute path), symlinks are followed with `realpath`, and the real path must sit
 * inside one of the allowed directories. The extension must be one eBay accepts for
 * the requested kind, the size must be within eBay's limit, and the file signature
 * must agree with the extension.
 *
 * @param source - Absolute path or `media://` reference.
 * @param kind - Whether an image or a video is expected.
 * @param access - Parsed allowlist from {@link getMediaAccessConfig}.
 * @returns An Effect that succeeds with the validated file (contents included) or fails with `LocalMediaError`.
 *
 * @example
 * ```ts
 * const image = await Effect.runPromise(loadLocalMedia('/srv/media/front.jpg', 'image', access));
 * ```
 */
export const loadLocalMedia = (
  source: string,
  kind: LocalMediaKind,
  access: MediaAccessConfig,
): Effect.Effect<LocalMediaFile, LocalMediaError> =>
  Effect.gen(function* () {
    if (access.allowedDirs.length === 0) {
      return yield* Effect.fail(
        fail(
          source,
          `local media access is disabled; set ${MEDIA_DIRS_ENV} (path-delimited directories) or ${MEDIA_ROOT_ENV} to the directories this server may read`,
        ),
      );
    }
    const candidate = yield* resolveReference(source, access);
    const realFilePath = yield* realPathOf(candidate);
    if (!realFilePath) {
      return yield* Effect.fail(fail(source, `file not found: ${candidate}`));
    }
    const allowedRealDirs = yield* Effect.forEach(access.allowedDirs, (dir) =>
      realPathOf(dir).pipe(Effect.map((real) => real ?? dir)),
    );
    if (!allowedRealDirs.some((dir) => isWithin(realFilePath, dir))) {
      return yield* Effect.fail(
        fail(source, `resolves to ${realFilePath}, outside the allowed media directories`),
      );
    }
    const stats = yield* Effect.tryPromise({
      try: () => stat(realFilePath),
      catch: () => fail(source, `cannot read ${realFilePath}`),
    });
    if (!stats.isFile()) {
      return yield* Effect.fail(fail(source, `${realFilePath} is not a regular file`));
    }
    const mimeType = yield* expectedMimeType(source, realFilePath, kind);
    const limit = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (stats.size > limit) {
      return yield* Effect.fail(
        fail(source, `${stats.size} bytes exceeds eBay's ${kind} limit of ${limit} bytes`),
      );
    }
    if (stats.size === 0) {
      return yield* Effect.fail(fail(source, 'file is empty'));
    }
    const bytes = yield* Effect.tryPromise({
      try: () => readFile(realFilePath),
      catch: () => fail(source, `cannot read ${realFilePath}`),
    });
    const sniffed = sniffMediaType(bytes);
    if (!(sniffed && sameFamily(mimeType, sniffed))) {
      return yield* Effect.fail(
        fail(
          source,
          `content does not look like ${mimeType}${sniffed ? ` (detected ${sniffed})` : ''}`,
        ),
      );
    }
    return {
      source,
      path: realFilePath,
      fileName: path.basename(realFilePath),
      mimeType,
      size: stats.size,
      kind,
      bytes,
    };
  });

/**
 * Loads several media references in order, failing on the first invalid one so
 * nothing is uploaded when any reference is rejected.
 *
 * @param sources - Absolute paths or `media://` references.
 * @param kind - Whether images or videos are expected.
 * @param access - Parsed allowlist from {@link getMediaAccessConfig}.
 * @returns An Effect with the validated files in input order.
 *
 * @example
 * ```ts
 * const images = await Effect.runPromise(loadLocalMediaList(paths, 'image', access));
 * ```
 */
export const loadLocalMediaList = (
  sources: readonly string[],
  kind: LocalMediaKind,
  access: MediaAccessConfig,
): Effect.Effect<LocalMediaFile[], LocalMediaError> =>
  Effect.forEach(sources, (source) => loadLocalMedia(source, kind, access));
