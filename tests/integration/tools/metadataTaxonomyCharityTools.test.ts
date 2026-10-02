import { gunzipSync, gzipSync } from 'node:zlib';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/index.js';
import { MAX_INLINE_DOWNLOAD_BYTES } from '@/api/shared/download.js';
import { createEbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  getOrRefreshAppAccessToken: vi.fn(),
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

const config: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
  redirectUri: 'https://localhost/callback',
};

const HOST = 'https://api.sandbox.ebay.com';
const SHIPPING = '/sell/metadata/v1/shipping/marketplace';
const TREE = '/commerce/taxonomy/v1/category_tree';
const CHARITY = '/commerce/charity/v1/charity_org';

/** Every tool this lane adds, with the inputs MCP clients must supply. */
const LANE_TOOLS: Record<string, string[]> = {
  ebay_get_exclude_shipping_locations: ['marketplaceId'],
  ebay_get_handling_times: ['marketplaceId'],
  ebay_get_shipping_carriers: ['marketplaceId'],
  ebay_get_shipping_locations: ['marketplaceId'],
  ebay_get_shipping_services: ['marketplaceId'],
  ebay_fetch_item_aspects: ['categoryTreeId'],
  ebay_get_expired_categories: ['categoryTreeId'],
  ebay_get_charity_org: ['charityOrgId', 'marketplaceId'],
  ebay_get_charity_orgs: ['marketplaceId'],
};

let client: Client;
let runtime: ReturnType<typeof createEbayMcpRuntime>;

const callTool = async (name: string, args: Record<string, unknown>) => {
  const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  const [first] = result.content;
  const text = first?.type === 'text' ? first.text : '';
  return { isError: result.isError === true, payload: JSON.parse(text) as unknown };
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'metadata,taxonomy');
  nock.cleanAll();
  nock.disableNetConnect();

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.getOrRefreshAppAccessToken.mockReturnValue(Effect.succeed('mock_app_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const api = new EbaySellerApi(config);
  await Effect.runPromise(api.initialize());
  runtime = createEbayMcpRuntime({
    api,
    serverConfig: { name: 'metadata-taxonomy-charity-test', version: '0.0.0' },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'integration-client', version: '0.0.0' });
  await runtime.server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
  await runtime.server.close();
  nock.cleanAll();
  nock.enableNetConnect();
  vi.unstubAllEnvs();
});

it('advertises every lane tool as read-only with its required inputs', async () => {
  const tools = new Map((await client.listTools()).tools.map((tool) => [tool.name, tool]));

  for (const [name, required] of Object.entries(LANE_TOOLS)) {
    expect(tools.get(name)?.inputSchema.required, name).toEqual(required);
    expect(tools.get(name)?.annotations, name).toEqual({ readOnlyHint: true });
  }
  expect(tools.get('ebay_get_charity_orgs')?.inputSchema.properties?.marketplaceId).toMatchObject({
    enum: ['EBAY_US', 'EBAY_GB'],
  });
});

describe('Metadata shipping tools', () => {
  it.each([
    ['get_exclude_shipping_locations', 'excludeShippingLocations'],
    ['get_handling_times', 'handlingTimes'],
    ['get_shipping_carriers', 'shippingCarriers'],
    ['get_shipping_locations', 'shippingLocations'],
    ['get_shipping_services', 'shippingServices'],
  ])('ebay_%s returns eBay metadata for the marketplace', async (resource, field) => {
    const body = { [field]: [{ description: 'eBay value' }] };
    const endpoint = nock(HOST).get(`${SHIPPING}/EBAY_US/${resource}`).reply(200, body);

    const { isError, payload } = await callTool(`ebay_${resource}`, { marketplaceId: 'EBAY_US' });

    expect(endpoint.isDone()).toBe(true);
    expect(isError).toBe(false);
    expect(payload).toEqual(body);
  });

  it('sends Accept-Language for French Canada metadata', async () => {
    const body = { shippingServices: [{ shippingService: 'CA_PostLettermail' }] };
    const endpoint = nock(HOST)
      .matchHeader('accept-language', 'fr-CA')
      .get(`${SHIPPING}/EBAY_CA/get_shipping_services`)
      .reply(200, body);

    const { payload } = await callTool('ebay_get_shipping_services', {
      marketplaceId: 'EBAY_CA',
      acceptLanguage: 'fr-CA',
    });

    expect(endpoint.isDone()).toBe(true);
    expect(payload).toEqual(body);
  });
});

describe('Taxonomy tools', () => {
  it('returns the gzipped item aspects file as an embedded resource', async () => {
    const aspects = {
      categoryTreeId: '3',
      categoryAspects: [{ category: { categoryId: '9355' } }],
    };
    const gzip = gzipSync(JSON.stringify(aspects));
    const endpoint = nock(HOST).get(`${TREE}/3/fetch_item_aspects`).reply(200, gzip, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="FetchItemAspectsResponse.gz"',
    });

    const result = CallToolResultSchema.parse(
      await client.callTool({
        name: 'ebay_fetch_item_aspects',
        arguments: { categoryTreeId: '3' },
      }),
    );

    expect(endpoint.isDone()).toBe(true);
    expect(result.isError).not.toBe(true);
    expect(result.content[0]).toEqual({
      type: 'text',
      text: `Taxonomy item aspects for category tree 3 FetchItemAspectsResponse.gz (application/octet-stream, ${gzip.length} bytes)`,
    });
    const resource = result.content.find((item) => item.type === 'resource');
    expect(resource?.resource).toMatchObject({
      uri: 'ebay-taxonomy://category_tree/3/item_aspects',
      mimeType: 'application/octet-stream',
      blob: expect.any(String),
    });
    if (resource && 'blob' in resource.resource) {
      expect(
        JSON.parse(gunzipSync(Buffer.from(resource.resource.blob, 'base64')).toString()),
      ).toEqual(aspects);
    }
  });

  it('fails a too-large aspects file instead of returning it inline', async () => {
    nock(HOST)
      .get(`${TREE}/0/fetch_item_aspects`)
      .reply(200, Buffer.alloc(MAX_INLINE_DOWNLOAD_BYTES + 1), {
        'Content-Type': 'application/octet-stream',
      });

    const { isError, payload } = await callTool('ebay_fetch_item_aspects', { categoryTreeId: '0' });

    expect(isError).toBe(true);
    expect(payload).toMatchObject({
      error: expect.stringContaining(`above the ${MAX_INLINE_DOWNLOAD_BYTES}-byte limit`),
    });
  });

  it('returns expired-category mappings', async () => {
    const body = { expiredCategories: [{ fromCategoryId: '111', toCategoryId: '222' }] };
    const endpoint = nock(HOST).get(`${TREE}/0/get_expired_categories`).reply(200, body);

    const { payload } = await callTool('ebay_get_expired_categories', { categoryTreeId: '0' });

    expect(endpoint.isDone()).toBe(true);
    expect(payload).toEqual(body);
  });

  it('reports success when eBay has no expired categories (HTTP 204)', async () => {
    const endpoint = nock(HOST).get(`${TREE}/0/get_expired_categories`).reply(204);

    const { isError, payload } = await callTool('ebay_get_expired_categories', {
      categoryTreeId: '0',
    });

    expect(endpoint.isDone()).toBe(true);
    expect(isError).toBe(false);
    expect(payload).toEqual({ status: 'success' });
  });
});

describe('Charity getCharityOrg tool', () => {
  it('gets one charity with the application token and marketplace header', async () => {
    const charity = { charityOrgId: 'C-1', name: 'Example Rescue', registrationId: '12-3456789' };
    const endpoint = nock(HOST)
      .matchHeader('authorization', 'Bearer mock_app_token')
      .matchHeader('x-ebay-c-marketplace-id', 'EBAY_GB')
      .get(`${CHARITY}/C-1`)
      .reply(200, charity);

    const { payload } = await callTool('ebay_get_charity_org', {
      charityOrgId: 'C-1',
      marketplaceId: 'EBAY_GB',
    });

    expect(endpoint.isDone()).toBe(true);
    expect(payload).toEqual(charity);
    expect(mockOAuthClient.getAccessToken).not.toHaveBeenCalled();
  });

  it('surfaces eBay error details', async () => {
    const errors = [
      { errorId: 165_001, domain: 'API_CHARITY', message: 'Unsupported marketplace' },
    ];
    nock(HOST).get(`${CHARITY}/C-1`).reply(400, { errors });

    const { isError, payload } = await callTool('ebay_get_charity_org', {
      charityOrgId: 'C-1',
      marketplaceId: 'EBAY_US',
    });

    expect(isError).toBe(true);
    expect(payload).toMatchObject({ status: 400, details: errors });
  });
});

describe('Charity getCharityOrgs tool', () => {
  it('searches charities by keywords with paging', async () => {
    const page = { charityOrgs: [{ charityOrgId: 'C-1' }], total: 1, limit: 10, offset: 0 };
    const endpoint = nock(HOST)
      .matchHeader('authorization', 'Bearer mock_app_token')
      .matchHeader('x-ebay-c-marketplace-id', 'EBAY_US')
      .get(CHARITY)
      .query({ q: 'animal rescue', limit: '10', offset: '0' })
      .reply(200, page);

    const { payload } = await callTool('ebay_get_charity_orgs', {
      marketplaceId: 'EBAY_US',
      q: 'animal rescue',
      limit: 10,
      offset: 0,
    });

    expect(endpoint.isDone()).toBe(true);
    expect(payload).toEqual(page);
  });

  it('searches charities by registration IDs', async () => {
    const endpoint = nock(HOST)
      .get(CHARITY)
      .query({ registration_ids: '11-1111111,22-2222222' })
      .reply(200, { charityOrgs: [], total: 0 });

    const { payload } = await callTool('ebay_get_charity_orgs', {
      marketplaceId: 'EBAY_US',
      registrationIds: '11-1111111,22-2222222',
    });

    expect(endpoint.isDone()).toBe(true);
    expect(payload).toEqual({ charityOrgs: [], total: 0 });
  });

  it('rejects a search without q or registrationIds before calling eBay', async () => {
    const { isError, payload } = await callTool('ebay_get_charity_orgs', {
      marketplaceId: 'EBAY_US',
    });

    expect(isError).toBe(true);
    expect(payload).toMatchObject({ error: expect.stringContaining('q or registrationIds') });
    expect(mockOAuthClient.getOrRefreshAppAccessToken).not.toHaveBeenCalled();
  });
});
