import process from 'node:process';
import { EbayApiClient } from '@/api/client.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
};

vi.mock('@/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

describe('EbayApiClient media transport', () => {
  let client: EbayApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    nock.cleanAll();
    nock.disableNetConnect();
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('token'));
    const config: EbayConfig = {
      clientId: 'id',
      clientSecret: 'secret',
      environment: 'sandbox',
    };
    client = new EbayApiClient(config);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('sends FormData as multipart with a fetch-generated boundary and keeps the Location header', async () => {
    let contentType = '';
    let rawBody = '';
    const scope = nock('https://apim.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/image/create_image_from_file', (body) => {
        rawBody = typeof body === 'string' ? body : JSON.stringify(body);
        return true;
      })
      .reply(function reply() {
        contentType = String(this.req.headers['content-type']);
        return [
          201,
          { imageUrl: 'https://i.ebayimg.com/x.jpg' },
          { Location: 'https://apim.sandbox.ebay.com/commerce/media/v1_beta/image/IMG-1' },
        ];
      });

    const form = new FormData();
    form.append('image', new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' }), 'x.jpg');
    const response = await client.postForResponse<{ imageUrl: string }>(
      'https://apim.sandbox.ebay.com/commerce/media/v1_beta/image/create_image_from_file',
      form,
      { absolute: true },
    );

    expect(scope.isDone()).toBe(true);
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(rawBody).toContain('filename="x.jpg"');
    expect(rawBody).toContain('Content-Type: image/jpeg');
    expect(response.status).toBe(201);
    expect(response.headers.location).toBe(
      'https://apim.sandbox.ebay.com/commerce/media/v1_beta/image/IMG-1',
    );
    expect(response.data).toEqual({ imageUrl: 'https://i.ebayimg.com/x.jpg' });
  });

  it('drops the JSON content type for FormData whatever its spelling', async () => {
    let contentType = '';
    const scope = nock('https://apim.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/image/create_image_from_file')
      .reply(function reply() {
        contentType = String(this.req.headers['content-type']);
        return [201, { imageUrl: 'https://i.ebayimg.com/y.jpg' }];
      });

    const form = new FormData();
    form.append('image', new Blob([new Uint8Array([1])], { type: 'image/jpeg' }), 'y.jpg');
    await client.postForResponse(
      'https://apim.sandbox.ebay.com/commerce/media/v1_beta/image/create_image_from_file',
      form,
      { absolute: true, headers: { 'content-type': 'application/json' } },
    );

    expect(scope.isDone()).toBe(true);
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
  });

  it('lets a Blob body carry its own MIME type unless the caller sets one', async () => {
    const seen: string[] = [];
    const scope = nock('https://apim.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/video/VID-2/upload')
      .twice()
      .reply(function reply() {
        seen.push(String(this.req.headers['content-type']));
        return [200, ''];
      });
    const url = 'https://apim.sandbox.ebay.com/commerce/media/v1_beta/video/VID-2/upload';
    const blob = new Blob([new Uint8Array([1, 2])], { type: 'video/mp4' });

    await client.post(url, blob, { absolute: true });
    await client.post(url, blob, {
      absolute: true,
      headers: { 'Content-Type': 'application/octet-stream' },
    });

    expect(scope.isDone()).toBe(true);
    expect(seen).toEqual(['video/mp4', 'application/octet-stream']);
  });

  it('sends raw bytes with caller headers and treats an empty 200 body as success', async () => {
    let contentType = '';
    const scope = nock('https://apim.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/video/VID-1/upload')
      .reply(function reply() {
        contentType = String(this.req.headers['content-type']);
        return [200, ''];
      });

    const result = await client.post(
      'https://apim.sandbox.ebay.com/commerce/media/v1_beta/video/VID-1/upload',
      new Uint8Array([1, 2]),
      { absolute: true, headers: { 'Content-Type': 'application/octet-stream' } },
    );

    expect(scope.isDone()).toBe(true);
    expect(contentType).toBe('application/octet-stream');
    expect(result).toBeUndefined();
  });

  it('keeps plain post() returning only the body', async () => {
    nock('https://api.sandbox.ebay.com')
      .post('/sell/inventory/v1/offer')
      .reply(201, { offerId: '1' });

    await expect(client.post('/sell/inventory/v1/offer', { sku: 'S' })).resolves.toEqual({
      offerId: '1',
    });
  });
});
