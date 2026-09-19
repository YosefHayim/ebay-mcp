import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { MediaAccessConfig } from '@/config/mediaAccess.js';
import {
  MAX_IMAGE_BYTES,
  loadLocalMedia,
  loadLocalMediaList,
  sniffMediaType,
} from '@/utils/localMedia.js';
import {
  createMediaFixture,
  isoHeader,
  JPEG_BYTES,
  type MediaFixture,
  MOV_BYTES,
  MP4_BYTES,
  PNG_BYTES,
} from '@tests/helpers/mediaFixtures.js';
import { Effect } from 'effect';
import { beforeAll, describe, expect, it } from 'vitest';

let fixture: MediaFixture;
let access: MediaAccessConfig;

beforeAll(async () => {
  fixture = await createMediaFixture();
  access = { allowedDirs: [fixture.root], mediaRoot: fixture.root, errors: [] };
});

const failureOf = (program: Effect.Effect<unknown, { message: string }>): Promise<string> =>
  Effect.runPromise(Effect.flip(program)).then((error) => error.message);

describe('sniffMediaType', () => {
  it('recognises the supported signatures', () => {
    expect(sniffMediaType(JPEG_BYTES)).toBe('image/jpeg');
    expect(sniffMediaType(PNG_BYTES)).toBe('image/png');
    expect(sniffMediaType(MP4_BYTES)).toBe('video/mp4');
    expect(sniffMediaType(MOV_BYTES)).toBe('video/quicktime');
    expect(sniffMediaType(Buffer.from('GIF89a', 'latin1'))).toBe('image/gif');
    expect(sniffMediaType(Buffer.from('RIFF0000WEBPVP8 ', 'latin1'))).toBe('image/webp');
    expect(sniffMediaType(isoHeader('heic'))).toBe('image/heic');
    expect(sniffMediaType(isoHeader('avif'))).toBe('image/avif');
  });

  it('returns undefined for unknown content', () => {
    expect(sniffMediaType(Buffer.from('hello world'))).toBeUndefined();
  });
});

describe('loadLocalMedia', () => {
  it('loads an absolute path inside the allowed directory', async () => {
    const file = await Effect.runPromise(loadLocalMedia(fixture.jpeg, 'image', access));

    expect(file).toMatchObject({
      source: fixture.jpeg,
      fileName: 'front.jpg',
      mimeType: 'image/jpeg',
      kind: 'image',
      size: JPEG_BYTES.length,
    });
    expect(file.bytes.equals(JPEG_BYTES)).toBe(true);
  });

  it('resolves media:// references under the media root', async () => {
    const file = await Effect.runPromise(
      loadLocalMedia('media://nested/back.png', 'image', access),
    );

    expect(file.path).toBe(fixture.png);
    expect(file.mimeType).toBe('image/png');
  });

  it('refuses everything when no directories are allowed', async () => {
    const message = await failureOf(
      loadLocalMedia(fixture.jpeg, 'image', { allowedDirs: [], errors: [] }),
    );

    expect(message).toContain('EBAY_MCP_MEDIA_DIRS');
  });

  it('refuses media:// references when no root is configured', async () => {
    const message = await failureOf(
      loadLocalMedia('media://front.jpg', 'image', { allowedDirs: [fixture.root], errors: [] }),
    );

    expect(message).toContain('EBAY_MCP_MEDIA_ROOT');
  });

  it('refuses relative paths', async () => {
    const message = await failureOf(loadLocalMedia('front.jpg', 'image', access));

    expect(message).toContain('absolute');
  });

  it('refuses paths outside the allowed directories', async () => {
    const message = await failureOf(loadLocalMedia(fixture.outsideJpeg, 'image', access));

    expect(message).toContain('outside the allowed media directories');
  });

  it('refuses media:// references that traverse out of the root', async () => {
    const message = await failureOf(
      loadLocalMedia('media://../outside/secret.jpg', 'image', access),
    );

    expect(message).toContain('outside the allowed media directories');
  });

  it('resolves symlinks before the containment check', async () => {
    const message = await failureOf(loadLocalMedia(fixture.escapingLink, 'image', access));

    expect(message).toContain('outside the allowed media directories');
  });

  it('reports missing files', async () => {
    const message = await failureOf(
      loadLocalMedia(path.join(fixture.root, 'missing.jpg'), 'image', access),
    );

    expect(message).toContain('file not found');
  });

  it('rejects unsupported extensions for the requested kind', async () => {
    expect(await failureOf(loadLocalMedia(fixture.text, 'image', access))).toContain(
      'unsupported image extension',
    );
    expect(await failureOf(loadLocalMedia(fixture.jpeg, 'video', access))).toContain(
      'unsupported video extension',
    );
  });

  it('accepts an AVIF whose major brand is the generic HEIF brand', async () => {
    const generic = path.join(fixture.root, 'generic.avif');
    await writeFile(generic, isoHeader('mif1'));

    const file = await Effect.runPromise(loadLocalMedia(generic, 'image', access));

    expect(file.mimeType).toBe('image/avif');
  });

  it('rejects files whose content does not match the extension', async () => {
    const message = await failureOf(loadLocalMedia(fixture.mismatched, 'image', access));

    expect(message).toContain('does not look like image/jpeg');
    expect(message).toContain('image/png');
  });

  it('rejects oversized files', async () => {
    const big = path.join(fixture.root, 'big.jpg');
    await writeFile(big, Buffer.concat([JPEG_BYTES, Buffer.alloc(MAX_IMAGE_BYTES)]));

    const message = await failureOf(loadLocalMedia(big, 'image', access));

    expect(message).toContain('exceeds');
  });

  it('loads videos with their MIME type', async () => {
    const file = await Effect.runPromise(loadLocalMedia(fixture.mp4, 'video', access));

    expect(file).toMatchObject({ mimeType: 'video/mp4', kind: 'video' });
  });
});

describe('loadLocalMediaList', () => {
  it('keeps input order', async () => {
    const files = await Effect.runPromise(
      loadLocalMediaList(['media://nested/back.png', fixture.jpeg], 'image', access),
    );

    expect(files.map((file) => file.fileName)).toEqual(['back.png', 'front.jpg']);
  });

  it('fails on the first invalid reference', async () => {
    const message = await failureOf(
      loadLocalMediaList([fixture.jpeg, fixture.text, fixture.png], 'image', access),
    );

    expect(message).toContain('unsupported image extension');
  });
});
