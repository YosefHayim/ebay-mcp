import type { MediaUpload } from '@/api/listing-management/media.js';
import { Effect } from 'effect';
import { LocalMediaError, MAX_IMAGE_BYTES, sniffMediaType } from './localMedia.js';

/** One image passed inline as base64 instead of as a local file path. */
export interface InlineImageInput {
  /** Base64 bytes, optionally prefixed with a `data:<mime>;base64,` header. */
  readonly data: string;
  /** Optional file name sent to eBay. */
  readonly fileName?: string;
}

const EXTENSION_BY_MIME: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/heic': 'heic',
};

const DATA_URL_PREFIX = /^data:[^;,]*;base64,/i;
const BASE64_BODY = /^[A-Za-z0-9+/]*={0,2}$/;

/**
 * Decodes and validates one inline image. The bytes must decode cleanly from
 * base64, stay within the eBay Picture Services size limit and carry the file
 * signature of a supported image type; the declared data URL type is ignored in
 * favour of the signature.
 */
export const decodeInlineImage = (
  input: InlineImageInput,
  index: number,
): Effect.Effect<MediaUpload, LocalMediaError> =>
  Effect.gen(function* () {
    const source = input.fileName ?? `inline image ${index + 1}`;
    const body = input.data.replace(DATA_URL_PREFIX, '').replace(/\s+/g, '');
    if (body.length === 0 || !BASE64_BODY.test(body)) {
      return yield* Effect.fail(
        new LocalMediaError({ source, message: `${source} is not valid base64` }),
      );
    }

    const bytes = Buffer.from(body, 'base64');
    if (bytes.length === 0) {
      return yield* Effect.fail(new LocalMediaError({ source, message: `${source} is empty` }));
    }
    if (bytes.length > MAX_IMAGE_BYTES) {
      return yield* Effect.fail(
        new LocalMediaError({
          source,
          message: `${source} is ${bytes.length} bytes; eBay accepts images up to ${MAX_IMAGE_BYTES} bytes`,
        }),
      );
    }

    const mimeType = sniffMediaType(bytes);
    const extension = mimeType ? EXTENSION_BY_MIME[mimeType] : undefined;
    if (!mimeType || !extension) {
      return yield* Effect.fail(
        new LocalMediaError({
          source,
          message: `${source} is not a supported image (JPG, PNG, GIF, BMP, TIFF, WEBP, AVIF or HEIC)`,
        }),
      );
    }

    return {
      source,
      fileName: input.fileName ?? `image-${index + 1}.${extension}`,
      mimeType,
      bytes,
    };
  });

/** Decodes a list of inline images, failing on the first invalid one. */
export const decodeInlineImages = (
  inputs: readonly InlineImageInput[],
): Effect.Effect<MediaUpload[], LocalMediaError> =>
  Effect.forEach(inputs, (input, index) => decodeInlineImage(input, index));
