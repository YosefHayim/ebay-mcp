import type { EbayApiClient } from '@/api/client.js';
import { createMediaResourceMethods } from '@/api/listing-management/mediaResources.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = '/commerce/media/v1_beta';
const APIM = 'https://apim.sandbox.ebay.com';
const APIZ = 'https://apiz.sandbox.ebay.com';
const metadata = { documentType: 'USER_GUIDE_OR_MANUAL', languages: ['ENGLISH'] };
const postOrder = {
  documentUsageType: 'RETURN_SHIPPING_LABEL',
  entityType: 'RETURNS',
  entityId: 'R-1',
};
const file = {
  source: 'manual.pdf',
  fileName: 'manual.pdf',
  mimeType: 'application/pdf',
  bytes: Buffer.from('%PDF-1.7\nexample'),
};
const client = {
  get: vi.fn(),
  post: vi.fn(),
  postForResponse: vi.fn(),
  delete: vi.fn(),
  getConfig: vi.fn(),
};
// The endpoint factory only uses these mocked client methods.
const media = createMediaResourceMethods(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
  client.get.mockResolvedValue(undefined);
  client.getConfig.mockReturnValue({ environment: 'sandbox' });
});

describe('Media resource contracts', () => {
  it('preserves image DTO fields and decodes the Location ID once', async () => {
    const image = {
      imageUrl: 'https://i.ebayimg.com/a',
      maxDimensionImageUrl: 'https://i.ebayimg.com/b',
    };
    const location = `${APIM}${BASE}/image/A%2FB?x=1`;
    client.postForResponse.mockResolvedValue({ data: image, headers: { location } });
    expect(
      await Effect.runPromise(media.createImageFromUrl({ imageUrl: 'https://example.com/a' })),
    ).toEqual({ imageId: 'A/B', location, image });
    expect(client.postForResponse).toHaveBeenCalledWith(
      `${APIM}${BASE}/image/create_image_from_url`,
      { imageUrl: 'https://example.com/a' },
      { absolute: true },
    );
    expect(client.get).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    '',
    'not-a-url',
    `${APIM}${BASE}/image/`,
    `${APIM}${BASE}/video/V`,
    `${APIM}${BASE}/image/%ZZ`,
  ])('rejects invalid Location %s', async (location) => {
    client.postForResponse.mockResolvedValue({ data: {}, headers: { location } });
    const error = await Effect.runPromise(
      Effect.flip(media.createImageFromUrl({ imageUrl: 'https://example.com/a' })),
    );
    expect(error._tag).toBe('EbayApiError');
  });

  it('creates listing documents with exact metadata and returns eBay data', async () => {
    const response = { documentId: 'D', documentStatus: 'PENDING_UPLOAD', ...metadata };
    client.post.mockResolvedValue(response);
    expect(await Effect.runPromise(media.createDocument(metadata))).toBe(response);
    expect(client.post).toHaveBeenCalledWith(`${APIM}${BASE}/document`, metadata, {
      absolute: true,
    });
    const body = { ...metadata, documentUrl: 'https://example.com/manual.pdf' };
    expect(await Effect.runPromise(media.createDocumentFromUrl(body))).toBe(response);
    expect(client.post).toHaveBeenLastCalledWith(
      `${APIM}${BASE}/document/create_document_from_url`,
      body,
      { absolute: true },
    );
  });

  it('encodes listing document IDs and preserves metadata', async () => {
    const response = {
      documentId: 'A/B %',
      documentStatus: 'ACCEPTED',
      documentMetadata: { fileSize: '123' },
    };
    client.get.mockResolvedValue(response);
    expect(await Effect.runPromise(media.getDocument({ documentId: 'A/B %' }))).toBe(response);
    expect(client.get).toHaveBeenCalledWith(`${APIM}${BASE}/document/A%2FB%20%25`, undefined, {
      absolute: true,
    });
  });

  it('uploads listing documents using the file multipart field', async () => {
    const response = { documentId: 'A/B', documentStatus: 'SUBMITTED' };
    client.post.mockResolvedValue(response);
    expect(await Effect.runPromise(media.uploadDocument({ documentId: 'A/B', file }))).toBe(
      response,
    );
    const [url, form, config] = client.post.mock.calls[0];
    expect(url).toBe(`${APIM}${BASE}/document/A%2FB/upload`);
    expect([...form.keys()]).toEqual(['file']);
    const part = form.get('file') as File;
    expect(part.name).toBe('manual.pdf');
    expect(part.type).toBe('application/pdf');
    expect(Buffer.from(await part.arrayBuffer())).toEqual(file.bytes);
    expect(config).toEqual({ absolute: true, timeoutMs: 600_000 });
  });

  it('uploads post-order metadata as multipart fields and accepts a header-only response', async () => {
    const location = `${APIZ}${BASE}/post_order/document/A%252FB`;
    client.postForResponse.mockResolvedValue({ data: undefined, headers: { location } });
    expect(await Effect.runPromise(media.uploadPostOrderDocument({ ...postOrder, file }))).toEqual({
      documentId: 'A%2FB',
      location,
    });
    const [url, form, config] = client.postForResponse.mock.calls[0];
    expect(url).toBe(`${APIZ}${BASE}/post_order/document`);
    expect([...form.keys()]).toEqual(['file', 'documentUsageType', 'entityType', 'entityId']);
    for (const [key, value] of Object.entries(postOrder)) expect(form.get(key)).toBe(value);
    expect(config.headers).toBeUndefined();
    expect(config.timeoutMs).toBe(600_000);
  });

  it('fails a header-only upload without its Location', async () => {
    client.postForResponse.mockResolvedValue({ headers: {} });
    const error = await Effect.runPromise(
      Effect.flip(media.uploadPostOrderDocument({ ...postOrder, file })),
    );
    expect(error._tag).toBe('EbayApiError');
  });

  it('downloads binary PDF and deletes through apiz with encoded IDs', async () => {
    client.get.mockResolvedValue(file.bytes);
    expect(await Effect.runPromise(media.downloadPostOrderDocument({ documentId: 'A/B' }))).toBe(
      file.bytes,
    );
    expect(client.get).toHaveBeenCalledWith(`${APIZ}${BASE}/post_order/document/A%2FB`, undefined, {
      absolute: true,
      responseType: 'arraybuffer',
      headers: { Accept: 'application/pdf' },
    });
    client.delete.mockResolvedValue(undefined);
    expect(
      await Effect.runPromise(media.removePostOrderDocument({ documentId: 'A/B' })),
    ).toBeUndefined();
    expect(client.delete).toHaveBeenCalledWith(`${APIZ}${BASE}/post_order/document/A%2FB`, {
      absolute: true,
    });
  });

  it.each([
    'production',
    'sandbox',
  ])('honors proxy overrides for both hosts in %s', async (environment) => {
    client.getConfig.mockReturnValue({ environment, apiBaseUrl: 'http://localhost:1234' });
    await Effect.runPromise(media.getDocument({ documentId: 'D' }));
    await Effect.runPromise(media.downloadPostOrderDocument({ documentId: 'D' }));
    expect(client.get.mock.calls.map(([url]) => url)).toEqual([
      `http://localhost:1234${BASE}/document/D`,
      `http://localhost:1234${BASE}/post_order/document/D`,
    ]);
  });

  it('uses production hosts without an override', async () => {
    client.getConfig.mockReturnValue({ environment: 'production' });
    await Effect.runPromise(media.getDocument({ documentId: 'D' }));
    await Effect.runPromise(media.downloadPostOrderDocument({ documentId: 'D' }));
    expect(client.get.mock.calls.map(([url]) => url)).toEqual([
      `https://apim.ebay.com${BASE}/document/D`,
      `https://apiz.ebay.com${BASE}/post_order/document/D`,
    ]);
  });

  it('rejects invalid inputs before any HTTP request', async () => {
    const programs = [
      media.createImageFromUrl({ imageUrl: 'http://example.com/a' }),
      media.createDocument({ ...metadata, languages: [] }),
      media.createDocument({ ...metadata, documentType: '  ' }),
      media.createDocumentFromUrl({ ...metadata, documentUrl: 'file:///manual.pdf' }),
      media.getDocument({ documentId: '' }),
      media.uploadDocument({ documentId: '', file }),
      media.uploadPostOrderDocument({ ...postOrder, entityId: '', file }),
      media.downloadPostOrderDocument({ documentId: ' ' }),
      media.removePostOrderDocument({ documentId: '' }),
    ];
    for (const program of programs) {
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error._tag).toBe('EndpointInputError');
    }
    expect(client.post).not.toHaveBeenCalled();
    expect(client.postForResponse).not.toHaveBeenCalled();
    expect(client.get).not.toHaveBeenCalled();
    expect(client.delete).not.toHaveBeenCalled();
  });

  it('wraps transport failures on all eight endpoints with their request context', async () => {
    const cause = new Error('remote failure');
    for (const mock of [client.get, client.post, client.postForResponse, client.delete])
      mock.mockRejectedValue(cause);
    const cases = [
      [
        media.createImageFromUrl({ imageUrl: 'https://example.com/a' }),
        'POST',
        '/image/create_image_from_url',
      ],
      [media.createDocument(metadata), 'POST', '/document'],
      [
        media.createDocumentFromUrl({ ...metadata, documentUrl: 'https://example.com/a.pdf' }),
        'POST',
        '/document/create_document_from_url',
      ],
      [media.getDocument({ documentId: 'D' }), 'GET', '/document/D'],
      [media.uploadDocument({ documentId: 'D', file }), 'POST', '/document/D/upload'],
      [media.uploadPostOrderDocument({ ...postOrder, file }), 'POST', '/post_order/document'],
      [media.downloadPostOrderDocument({ documentId: 'D' }), 'GET', '/post_order/document/D'],
      [media.removePostOrderDocument({ documentId: 'D' }), 'DELETE', '/post_order/document/D'],
    ] as const;
    for (const [program, method, path] of cases) {
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toMatchObject({ _tag: 'EbayApiError', method, path: `${BASE}${path}`, cause });
    }
  });
});
