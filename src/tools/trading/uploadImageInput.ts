import { readFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { EndpointInputError } from '@/api/shared/request.js';
import type { UploadSiteHostedPicturesApiInput } from '@/api/trading/trading.js';
import { getErrorMessage } from '@/utils/errors.js';
import { Effect } from 'effect';

/**
 * Maximum decoded image size accepted for an EPS upload. eBay Picture Services
 * caps a single hosted image at ~12 MB, so anything larger is rejected locally
 * instead of buffering an unbounded payload or failing remotely.
 */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/**
 * Upper bound on the raw base64 string length, checked before any allocation or
 * decode. Base64 encodes 3 bytes as 4 chars, so a `MAX_IMAGE_BYTES` payload is at
 * most `MAX_IMAGE_BYTES * 4 / 3` chars; the extra 1 MB absorbs line-wrap
 * whitespace. This stops an oversized payload from exhausting memory before the
 * exact decoded-size cap runs.
 */
const MAX_BASE64_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 1_000_000;

/** Standard base64 alphabet with optional padding, after whitespace is stripped. */
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

/** Raw tool arguments for the image-upload tool, before filesystem resolution. */
interface UploadImageArgs {
  readonly filePath?: string;
  readonly imageBase64?: string;
  readonly externalPictureUrl?: string;
  readonly pictureName?: string;
  readonly pictureSet?: 'Standard' | 'Supersize';
}

const tooLarge = (parameter: string, bytes: number): EndpointInputError =>
  new EndpointInputError({
    parameter,
    message: `Image is ${bytes} bytes, over the ${MAX_IMAGE_BYTES}-byte eBay Picture Services limit`,
  });

const fileReadError =
  (filePath: string) =>
  (error: unknown): EndpointInputError =>
    new EndpointInputError({
      parameter: 'filePath',
      message: `Failed to read image file "${filePath}": ${getErrorMessage(error)}`,
    });

/**
 * Resolve the image-upload tool's arguments into the byte-level input the API
 * layer expects. Filesystem reads and base64 decoding happen here — at the MCP
 * tool boundary — so the API layer stays free of I/O and only receives bytes or
 * an external URL. Enforces a size cap and validates base64 before decoding.
 *
 * @param args - Decoded tool arguments (one of filePath/imageBase64/externalPictureUrl).
 * @returns An Effect that succeeds with the resolved API input or fails with an input error.
 *
 * @example
 * ```ts
 * const input = await Effect.runPromise(resolveUploadImageInput({ filePath: '/tmp/front.jpg' }));
 * ```
 */
export const resolveUploadImageInput = (
  args: UploadImageArgs,
): Effect.Effect<UploadSiteHostedPicturesApiInput, EndpointInputError> => {
  const base: Pick<UploadSiteHostedPicturesApiInput, 'pictureName' | 'pictureSet'> = {
    ...(args.pictureName === undefined ? {} : { pictureName: args.pictureName }),
    ...(args.pictureSet === undefined ? {} : { pictureSet: args.pictureSet }),
  };

  // Reject conflicting payloads rather than silently choosing one source, so a
  // caller can never upload a different image than the one it thinks it sent.
  const providedSources = [args.filePath, args.imageBase64, args.externalPictureUrl].filter(
    (source) => source !== undefined,
  );
  if (providedSources.length > 1) {
    return Effect.fail(
      new EndpointInputError({
        parameter: 'filePath',
        message: 'Provide only one of filePath, imageBase64, or externalPictureUrl, not several',
      }),
    );
  }

  if (args.externalPictureUrl !== undefined) {
    return Effect.succeed({ ...base, externalPictureUrl: args.externalPictureUrl });
  }

  if (args.filePath !== undefined) {
    const filePath = args.filePath;
    // Stat first so an oversized file is rejected before it is read into memory.
    return Effect.tryPromise({ try: () => stat(filePath), catch: fileReadError(filePath) }).pipe(
      Effect.flatMap((info) =>
        info.size > MAX_IMAGE_BYTES
          ? Effect.fail(tooLarge('filePath', info.size))
          : Effect.tryPromise({
              try: () => readFile(filePath),
              catch: fileReadError(filePath),
            }).pipe(
              Effect.map((data) => ({ ...base, imageBytes: data, fileName: basename(filePath) })),
            ),
      ),
    );
  }

  if (args.imageBase64 !== undefined) {
    // Bound the raw encoded length before allocating/decoding so an oversized
    // payload cannot exhaust memory ahead of the exact decoded-size cap below.
    if (args.imageBase64.length > MAX_BASE64_CHARS) {
      return Effect.fail(
        new EndpointInputError({
          parameter: 'imageBase64',
          message: `imageBase64 is too large; the decoded image must be under ${MAX_IMAGE_BYTES} bytes`,
        }),
      );
    }
    // `Buffer.from(..., 'base64')` silently drops invalid characters and never
    // throws, so validate the shape before decoding to give an actionable local
    // error instead of a confusing remote failure.
    const normalized = args.imageBase64.replace(/\s+/g, '');
    if (normalized.length === 0 || !BASE64_PATTERN.test(normalized)) {
      return Effect.fail(
        new EndpointInputError({
          parameter: 'imageBase64',
          message: 'imageBase64 is not valid base64-encoded image data',
        }),
      );
    }
    const data = Buffer.from(normalized, 'base64');
    if (data.length === 0) {
      return Effect.fail(
        new EndpointInputError({
          parameter: 'imageBase64',
          message: 'imageBase64 did not decode to any image bytes',
        }),
      );
    }
    if (data.length > MAX_IMAGE_BYTES) {
      return Effect.fail(tooLarge('imageBase64', data.length));
    }
    return Effect.succeed({ ...base, imageBytes: data });
  }

  return Effect.fail(
    new EndpointInputError({
      parameter: 'filePath',
      message: 'Provide one of filePath, imageBase64, or externalPictureUrl to upload a picture',
    }),
  );
};
