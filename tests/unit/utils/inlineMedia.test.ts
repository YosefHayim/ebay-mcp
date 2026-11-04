import { decodeInlineImage, decodeInlineImages } from '@/utils/inlineMedia.js';
import { MAX_IMAGE_BYTES } from '@/utils/localMedia.js';
import { isoHeader, JPEG_BYTES, MP4_BYTES, PNG_BYTES } from '@tests/helpers/mediaFixtures.js';
import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';

const failureOf = (program: Effect.Effect<unknown, { message: string }>): Promise<string> =>
  Effect.runPromise(Effect.flip(program).pipe(Effect.map((error) => error.message)));

describe('decodeInlineImage', () => {
  it('decodes plain base64 and detects the type from the signature', async () => {
    const upload = await Effect.runPromise(
      decodeInlineImage({ data: JPEG_BYTES.toString('base64') }, 0),
    );

    expect(upload).toEqual({
      source: 'inline image 1',
      fileName: 'image-1.jpg',
      mimeType: 'image/jpeg',
      bytes: JPEG_BYTES,
    });
  });

  it('strips a data URL header and keeps a caller file name', async () => {
    const upload = await Effect.runPromise(
      decodeInlineImage(
        { data: `data:image/png;base64,${PNG_BYTES.toString('base64')}`, fileName: 'back.png' },
        3,
      ),
    );

    expect(upload.source).toBe('back.png');
    expect(upload.fileName).toBe('back.png');
    expect(upload.mimeType).toBe('image/png');
    expect(Buffer.from(upload.bytes)).toEqual(PNG_BYTES);
  });

  it('trusts the signature over a mismatching data URL type', async () => {
    const upload = await Effect.runPromise(
      decodeInlineImage({ data: `data:image/png;base64,${JPEG_BYTES.toString('base64')}` }, 0),
    );

    expect(upload.mimeType).toBe('image/jpeg');
  });

  it('accepts HEIC photos as taken on an iPhone', async () => {
    const upload = await Effect.runPromise(
      decodeInlineImage({ data: isoHeader('heic').toString('base64') }, 1),
    );

    expect(upload.mimeType).toBe('image/heic');
    expect(upload.fileName).toBe('image-2.heic');
  });

  it('rejects text that is not base64', async () => {
    await expect(failureOf(decodeInlineImage({ data: 'not base64!' }, 0))).resolves.toContain(
      'not valid base64',
    );
  });

  it('rejects data that is not a supported image', async () => {
    await expect(
      failureOf(decodeInlineImage({ data: MP4_BYTES.toString('base64') }, 0)),
    ).resolves.toContain('not a supported image');
  });

  it('rejects images above the eBay Picture Services limit', async () => {
    const tooLarge = Buffer.concat([JPEG_BYTES, Buffer.alloc(MAX_IMAGE_BYTES, 0)]);

    await expect(
      failureOf(decodeInlineImage({ data: tooLarge.toString('base64') }, 0)),
    ).resolves.toContain(`up to ${MAX_IMAGE_BYTES} bytes`);
  });
});

describe('decodeInlineImages', () => {
  it('keeps input order and numbers default file names', async () => {
    const uploads = await Effect.runPromise(
      decodeInlineImages([
        { data: JPEG_BYTES.toString('base64') },
        { data: PNG_BYTES.toString('base64') },
      ]),
    );

    expect(uploads.map((upload) => upload.fileName)).toEqual(['image-1.jpg', 'image-2.png']);
  });
});
