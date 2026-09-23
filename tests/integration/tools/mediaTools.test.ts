import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import process from 'node:process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { EbaySellerApi } from '@/api/index.js';
import { createEbayMcpRuntime, type EbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { createMediaFixture, type MediaFixture } from '@tests/helpers/mediaFixtures.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
};

vi.mock('../../../src/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

const MEDIA_HOST = 'https://apim.sandbox.ebay.com';
const API_HOST = 'https://api.sandbox.ebay.com';
const MEDIA_PATH = '/commerce/media/v1_beta';

let fixture: MediaFixture;
let client: Client;
let runtime: EbayMcpRuntime;
let originalEnv: NodeJS.ProcessEnv;

const callTool = async (name: string, args: Record<string, unknown>) => {
  const result = await client.callTool({ name, arguments: args });
  const text = Array.isArray(result.content)
    ? result.content.map((block) => (block.type === 'text' ? block.text : '')).join('')
    : '';
  return { isError: result.isError === true, text, payload: JSON.parse(text) as unknown };
};

const mockImageUpload = (imageUrl: string) =>
  nock(MEDIA_HOST)
    .post(`${MEDIA_PATH}/image/create_image_from_file`)
    .reply(
      201,
      { imageUrl, expirationDate: '2026-09-30T00:00:00.000Z' },
      {
        Location: `${MEDIA_HOST}${MEDIA_PATH}/image/IMG-${imageUrl.length}`,
      },
    );

beforeAll(async () => {
  fixture = await createMediaFixture();
});

beforeEach(async () => {
  vi.clearAllMocks();
  nock.cleanAll();
  nock.disableNetConnect();
  originalEnv = process.env;
  process.env = {
    ...originalEnv,
    EBAY_MCP_TOOLS: 'inventory',
    EBAY_MCP_MEDIA_ROOT: fixture.root,
  };
  delete process.env.EBAY_MCP_MEDIA_DIRS;

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const config: EbayConfig = {
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    environment: 'sandbox',
    redirectUri: 'https://localhost/callback',
  };
  runtime = createEbayMcpRuntime({ api: new EbaySellerApi(config) });
  await runtime.initializeApi();

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'media-tools-test', version: '1.0.0' });
  await runtime.server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
  await runtime.server.close();
  nock.cleanAll();
  nock.enableNetConnect();
  process.env = originalEnv;
});

describe('media tools registration', () => {
  it('registers the media tools inside the inventory family with full schemas', async () => {
    const tools = (await client.listTools()).tools;
    const names = tools.map((tool) => tool.name);

    expect(names).toEqual(
      expect.arrayContaining([
        'ebay_upload_images',
        'ebay_upload_video',
        'ebay_get_video',
        'ebay_attach_media_to_inventory_item',
      ]),
    );
    const attach = tools.find((tool) => tool.name === 'ebay_attach_media_to_inventory_item');
    expect(attach?.inputSchema).toMatchObject({
      properties: {
        sku: { type: 'string' },
        imagePaths: { type: 'array' },
        allowPartial: { type: 'boolean' },
      },
      required: ['sku'],
    });
    expect(attach?.description).toContain('EBAY_MCP_MEDIA_DIRS');
  });
});

describe('ebay_upload_images', () => {
  it('uploads pictures in order and returns their EPS URLs', async () => {
    const first = mockImageUpload('https://i.ebayimg.com/front.jpg');
    const second = mockImageUpload('https://i.ebayimg.com/back.png');

    const result = await callTool('ebay_upload_images', {
      paths: [fixture.jpeg, 'media://nested/back.png'],
    });

    expect(result.isError).toBe(false);
    expect(result.payload).toEqual({
      images: [
        {
          source: fixture.jpeg,
          imageId: expect.stringMatching(/^IMG-/),
          imageUrl: 'https://i.ebayimg.com/front.jpg',
          expirationDate: '2026-09-30T00:00:00.000Z',
        },
        {
          source: 'media://nested/back.png',
          imageId: expect.stringMatching(/^IMG-/),
          imageUrl: 'https://i.ebayimg.com/back.png',
          expirationDate: '2026-09-30T00:00:00.000Z',
        },
      ],
    });
    expect(first.isDone()).toBe(true);
    expect(second.isDone()).toBe(true);
  });

  it('refuses files outside the allowed directories without contacting eBay', async () => {
    const upload = mockImageUpload('https://i.ebayimg.com/never.jpg');

    const result = await callTool('ebay_upload_images', { paths: [fixture.escapingLink] });

    expect(result.isError).toBe(true);
    expect(result.text).toContain('outside the allowed media directories');
    expect(upload.isDone()).toBe(false);
  });

  it('is disabled until a media directory is configured', async () => {
    delete process.env.EBAY_MCP_MEDIA_ROOT;

    const result = await callTool('ebay_upload_images', { paths: [fixture.jpeg] });

    expect(result.isError).toBe(true);
    expect(result.text).toContain('EBAY_MCP_MEDIA_DIRS');
  });
});

describe('ebay_upload_video and ebay_get_video', () => {
  it('runs the create → upload → poll lifecycle and returns the video ID', async () => {
    const create = nock(MEDIA_HOST)
      .post(`${MEDIA_PATH}/video`, { title: 'Console demo', size: 44, classification: ['ITEM'] })
      .reply(201, '', { Location: `${MEDIA_HOST}${MEDIA_PATH}/video/VID-1` });
    const upload = nock(MEDIA_HOST)
      .post(`${MEDIA_PATH}/video/VID-1/upload`)
      .matchHeader('content-type', 'application/octet-stream')
      .matchHeader('content-length', '44')
      .reply(200, '');
    const status = nock(MEDIA_HOST)
      .get(`${MEDIA_PATH}/video/VID-1`)
      .reply(200, { videoId: 'VID-1', status: 'PROCESSING' });

    const result = await callTool('ebay_upload_video', {
      path: 'media://clip.mp4',
      title: 'Console demo',
      waitForProcessingSeconds: 0,
    });

    expect(result.isError).toBe(false);
    expect(result.payload).toEqual({ videoId: 'VID-1', status: 'PROCESSING' });
    expect(create.isDone()).toBe(true);
    expect(upload.isDone()).toBe(true);
    expect(status.isDone()).toBe(true);
  });

  it('reads a video status by ID', async () => {
    nock(MEDIA_HOST).get(`${MEDIA_PATH}/video/VID-1`).reply(200, {
      videoId: 'VID-1',
      status: 'PROCESSING_FAILED',
      statusMessage: 'Unsupported codec',
    });

    const result = await callTool('ebay_get_video', { videoId: 'VID-1' });

    expect(result.isError).toBe(false);
    expect(result.payload).toMatchObject({
      status: 'PROCESSING_FAILED',
      statusMessage: 'Unsupported codec',
    });
  });
});

describe('ebay_attach_media_to_inventory_item', () => {
  const sku = 'AUCTION-20260830-MEGADRIVE-MDPP';
  const item = {
    sku,
    locale: 'de_DE',
    condition: 'USED_GOOD',
    availability: { shipToLocationAvailability: { quantity: 1 } },
    product: {
      title: 'Sega Mega Drive',
      aspects: { Marke: ['Sega'] },
      imageUrls: ['https://i.ebayimg.com/old.jpg'],
    },
  };

  it('uploads, re-reads the item, then rewrites only its media fields in its own locale', async () => {
    const read = nock(API_HOST).get(`/sell/inventory/v1/inventory_item/${sku}`).reply(200, item);
    const upload = mockImageUpload('https://i.ebayimg.com/front.jpg');
    // Edited while the upload ran: the write must start from this copy, not the first read.
    const editedMeanwhile = {
      ...item,
      availability: { shipToLocationAvailability: { quantity: 3 } },
    };
    const reread = nock(API_HOST)
      .get(`/sell/inventory/v1/inventory_item/${sku}`)
      .reply(200, editedMeanwhile);
    let putBody: unknown;
    const write = nock(API_HOST)
      .put(`/sell/inventory/v1/inventory_item/${sku}`, (body) => {
        putBody = body;
        return true;
      })
      .matchHeader('Content-Language', 'de-DE')
      .reply(204);

    const result = await callTool('ebay_attach_media_to_inventory_item', {
      sku,
      imagePaths: [fixture.jpeg],
    });

    expect(result.isError).toBe(false);
    expect(result.payload).toMatchObject({
      sku,
      updated: true,
      imageUrls: ['https://i.ebayimg.com/old.jpg', 'https://i.ebayimg.com/front.jpg'],
      videoIds: [],
      images: [{ source: fixture.jpeg, status: 'uploaded' }],
    });
    expect(putBody).toEqual({
      condition: 'USED_GOOD',
      availability: { shipToLocationAvailability: { quantity: 3 } },
      product: {
        title: 'Sega Mega Drive',
        aspects: { Marke: ['Sega'] },
        imageUrls: ['https://i.ebayimg.com/old.jpg', 'https://i.ebayimg.com/front.jpg'],
        videoIds: [],
      },
    });
    expect(read.isDone()).toBe(true);
    expect(upload.isDone()).toBe(true);
    expect(reread.isDone()).toBe(true);
    expect(write.isDone()).toBe(true);
  });

  it('leaves the item untouched and reports per-file results when an upload fails', async () => {
    nock(API_HOST).get(`/sell/inventory/v1/inventory_item/${sku}`).reply(200, item);
    mockImageUpload('https://i.ebayimg.com/front.jpg');
    nock(MEDIA_HOST)
      .post(`${MEDIA_PATH}/image/create_image_from_file`)
      .reply(400, { errors: [{ errorId: 190_001, message: 'Image too small' }] });
    const write = nock(API_HOST).put(`/sell/inventory/v1/inventory_item/${sku}`).reply(204);

    const result = await callTool('ebay_attach_media_to_inventory_item', {
      sku,
      imagePaths: [fixture.jpeg, 'media://nested/back.png'],
    });

    expect(result.isError).toBe(true);
    const { error } = result.payload as { error: string };
    expect(error).toContain('1 of 2 uploads failed');
    expect(error).toContain('"status":"uploaded"');
    expect(error).toContain('"status":"failed"');
    expect(error).toContain('Image too small');
    expect(write.isDone()).toBe(false);
  });

  it('never touches eBay when a path is rejected locally', async () => {
    const read = nock(API_HOST).get(`/sell/inventory/v1/inventory_item/${sku}`).reply(200, item);

    const result = await callTool('ebay_attach_media_to_inventory_item', {
      sku,
      imagePaths: [fixture.jpeg, fixture.text],
    });

    expect(result.isError).toBe(true);
    expect(result.text).toContain('unsupported image extension');
    expect(read.isDone()).toBe(false);
  });
});

describe('document and image URL tools', () => {
  const POST_ORDER_HOST = 'https://apiz.sandbox.ebay.com';
  const metadata = { documentType: 'USER_GUIDE_OR_MANUAL', languages: ['ENGLISH'] };

  it('advertises every new tool and read/write annotations', async () => {
    const tools = (await client.listTools()).tools;
    for (const suffix of [
      'create_image_from_url',
      'create_document',
      'create_document_from_url',
      'get_document',
      'upload_document',
      'upload_post_order_document',
      'download_post_order_document',
      'remove_post_order_document',
    ]) {
      expect(tools.find((tool) => tool.name === `ebay_${suffix}`)).toBeDefined();
    }
    expect(
      tools.find((tool) => tool.name === 'ebay_download_post_order_document')?.annotations
        ?.readOnlyHint,
    ).toBe(true);
    expect(
      tools.find((tool) => tool.name === 'ebay_remove_post_order_document')?.annotations
        ?.destructiveHint,
    ).toBe(true);
  });

  it('creates an image from its HTTPS URL without fetching the source locally', async () => {
    const location = `${MEDIA_HOST}${MEDIA_PATH}/image/I-1`;
    const request = nock(MEDIA_HOST)
      .post(`${MEDIA_PATH}/image/create_image_from_url`, {
        imageUrl: 'https://example.com/front.jpg',
      })
      .reply(201, { imageUrl: 'https://i.ebayimg.com/front.jpg' }, { Location: location });
    const result = await callTool('ebay_create_image_from_url', {
      imageUrl: 'https://example.com/front.jpg',
    });
    expect(result.payload).toEqual({
      imageId: 'I-1',
      location,
      image: { imageUrl: 'https://i.ebayimg.com/front.jpg' },
    });
    expect(request.isDone()).toBe(true);
  });

  it('stages, uploads and checks a listing document with separate calls', async () => {
    const pdf = path.join(fixture.root, 'manual.pdf');
    await writeFile(pdf, '%PDF-1.7\nmanual');
    const create = nock(MEDIA_HOST)
      .post(`${MEDIA_PATH}/document`, metadata)
      .reply(201, { documentId: 'D-1', documentStatus: 'PENDING_UPLOAD' });
    const upload = nock(MEDIA_HOST, {
      reqheaders: { 'content-type': /multipart\/form-data; boundary=/ },
    })
      .post(`${MEDIA_PATH}/document/D-1/upload`, (body) => {
        const text = Buffer.isBuffer(body) ? body.toString() : String(body);
        return (
          text.includes('name="file"') &&
          text.includes('%PDF-1.7') &&
          text.includes('filename="manual.pdf"')
        );
      })
      .reply(200, { documentId: 'D-1', documentStatus: 'SUBMITTED' });
    const get = nock(MEDIA_HOST)
      .get(`${MEDIA_PATH}/document/D-1`)
      .reply(200, { documentId: 'D-1', documentStatus: 'ACCEPTED' });
    expect((await callTool('ebay_create_document', metadata)).payload).toMatchObject({
      documentId: 'D-1',
    });
    expect(
      (await callTool('ebay_upload_document', { documentId: 'D-1', path: pdf })).payload,
    ).toMatchObject({ documentStatus: 'SUBMITTED' });
    expect((await callTool('ebay_get_document', { documentId: 'D-1' })).payload).toMatchObject({
      documentStatus: 'ACCEPTED',
    });
    expect([create, upload, get].every((request) => request.isDone())).toBe(true);
  });

  it('creates a listing document from a URL', async () => {
    const body = { ...metadata, documentUrl: 'https://example.com/manual.pdf' };
    const request = nock(MEDIA_HOST)
      .post(`${MEDIA_PATH}/document/create_document_from_url`, body)
      .reply(201, { documentId: 'D-2', documentStatus: 'SUBMITTED' });
    expect((await callTool('ebay_create_document_from_url', body)).payload).toMatchObject({
      documentId: 'D-2',
    });
    expect(request.isDone()).toBe(true);
  });

  it('uploads post-order form fields, downloads an embedded PDF and removes the document', async () => {
    const pdf = Buffer.from('%PDF-1.7\nlabel\n%%EOF');
    await writeFile(path.join(fixture.root, 'label.pdf'), pdf);
    const location = `${POST_ORDER_HOST}${MEDIA_PATH}/post_order/document/P-1`;
    const upload = nock(POST_ORDER_HOST, {
      reqheaders: { 'content-type': /multipart\/form-data; boundary=/ },
    })
      .post(`${MEDIA_PATH}/post_order/document`, (body) => {
        const text = Buffer.isBuffer(body) ? body.toString() : String(body);
        return (
          ['file', 'documentUsageType', 'entityType', 'entityId'].every((key) =>
            text.includes(`name="${key}"`),
          ) &&
          text.includes('RETURN_SHIPPING_LABEL') &&
          text.includes('RETURNS') &&
          text.includes('R-1')
        );
      })
      .reply(201, '', { Location: location });
    const download = nock(POST_ORDER_HOST)
      .get(`${MEDIA_PATH}/post_order/document/P-1`)
      .matchHeader('accept', 'application/pdf')
      .reply(200, pdf, { 'Content-Type': 'application/pdf' });
    const remove = nock(POST_ORDER_HOST).delete(`${MEDIA_PATH}/post_order/document/P-1`).reply(204);
    expect(
      (
        await callTool('ebay_upload_post_order_document', {
          path: 'media://label.pdf',
          documentUsageType: 'RETURN_SHIPPING_LABEL',
          entityType: 'RETURNS',
          entityId: 'R-1',
        })
      ).payload,
    ).toEqual({ documentId: 'P-1', location });
    const result = CallToolResultSchema.parse(
      await client.callTool({
        name: 'ebay_download_post_order_document',
        arguments: { documentId: 'P-1' },
      }),
    );
    expect(result.isError).not.toBe(true);
    const resource = result.content.find((item) => item.type === 'resource');
    expect(resource?.resource).toEqual({
      uri: 'ebay-media://post-order/document/P-1',
      mimeType: 'application/pdf',
      blob: pdf.toString('base64'),
    });
    if (resource && 'blob' in resource.resource)
      expect(Buffer.from(resource.resource.blob, 'base64')).toEqual(pdf);
    expect(
      (await callTool('ebay_remove_post_order_document', { documentId: 'P-1' })).payload,
    ).toEqual({ status: 'success' });
    expect([upload, download, remove].every((request) => request.isDone())).toBe(true);
  });

  it.each([
    401, 404, 429,
  ])('preserves eBay error details for a %i download failure', async (status) => {
    const errors = [{ errorId: 190_302, domain: 'API_MEDIA', message: 'Document unavailable' }];
    const request = nock(POST_ORDER_HOST)
      .get(`${MEDIA_PATH}/post_order/document/P-1`)
      .times(status === 401 ? 2 : 1)
      .reply(status, { errors }, { 'Retry-After': '5' });
    const result = await callTool('ebay_download_post_order_document', { documentId: 'P-1' });
    expect(result.isError).toBe(true);
    expect(result.payload).toMatchObject({ status, details: errors });
    expect(request.isDone()).toBe(true);
  });

  it('surfaces a rejected published-document deletion', async () => {
    const errors = [{ errorId: 190_311, message: 'Published document cannot be removed' }];
    nock(POST_ORDER_HOST).delete(`${MEDIA_PATH}/post_order/document/P-1`).reply(400, { errors });
    const result = await callTool('ebay_remove_post_order_document', { documentId: 'P-1' });
    expect(result.isError).toBe(true);
    expect(result.payload).toMatchObject({ status: 400, details: errors });
  });
});
