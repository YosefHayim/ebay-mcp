import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/ebaySellerApi.js';
import { createEbayMcpRuntime } from '@/mcp/runtime.js';
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
const STORE = '/sell/stores/v1/store';
const CATEGORY_CHANGE_TOOL = /^ebay_(add|rename|move|delete)_store_category$/;
const taskLocation = (taskId: string) => `${HOST}${STORE}/tasks/${taskId}`;

let client: Client;
let runtime: ReturnType<typeof createEbayMcpRuntime>;

/** Calls a stores tool and decodes the single JSON text block every stores tool returns. */
const callStoresTool = async (name: string, args: Record<string, unknown> = {}) => {
  const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  const [block] = result.content;
  return {
    isError: result.isError === true,
    payload: block?.type === 'text' ? (JSON.parse(block.text) as unknown) : undefined,
  };
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'stores');
  nock.cleanAll();
  nock.disableNetConnect();

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const api = new EbaySellerApi(config);
  await Effect.runPromise(api.initialize());
  runtime = createEbayMcpRuntime({
    api,
    serverConfig: { name: 'stores-tools-test', version: '0.0.0' },
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

describe('stores tool registration', () => {
  it.each([
    ['ebay_get_store', [], { readOnlyHint: true }],
    ['ebay_get_store_categories', [], { readOnlyHint: true }],
    ['ebay_get_store_task', ['taskId'], { readOnlyHint: true }],
    ['ebay_get_store_tasks', [], { readOnlyHint: true }],
    ['ebay_add_store_category', ['categoryName'], { readOnlyHint: false }],
    ['ebay_rename_store_category', ['categoryId', 'categoryName'], { readOnlyHint: false }],
    [
      'ebay_move_store_category',
      ['categoryId', 'destinationParentCategoryId'],
      { readOnlyHint: false },
    ],
    ['ebay_delete_store_category', ['categoryId'], { readOnlyHint: false, destructiveHint: true }],
  ])('advertises %s with its required inputs and annotations', async (name, required, hints) => {
    const tool = (await client.listTools()).tools.find((candidate) => candidate.name === name);

    expect(tool).toBeDefined();
    expect(tool?.inputSchema.required ?? []).toEqual(required);
    expect(tool?.annotations).toMatchObject(hints);
  });

  it('tells callers how to poll category changes and that only one may run at a time', async () => {
    const { tools } = await client.listTools();
    const changeTools = tools.filter((tool) => CATEGORY_CHANGE_TOOL.test(tool.name));

    expect(changeTools).toHaveLength(4);
    for (const tool of changeTools) {
      expect(tool.description).toContain('ebay_get_store_task');
      expect(tool.description).toContain('Only one store category change');
    }
  });
});

describe('stores read tools', () => {
  it('returns the store details from getStore', async () => {
    const store = { name: 'Camera Corner', url: 'https://www.ebay.com/str/cameracorner' };
    const request = nock(HOST).get(STORE).reply(200, store);

    const result = await callStoresTool('ebay_get_store');

    expect(result).toEqual({ isError: false, payload: store });
    expect(request.isDone()).toBe(true);
  });

  it('returns the category hierarchy from getStoreCategories', async () => {
    const categories = {
      storeCategories: [
        {
          categoryId: '100',
          categoryName: 'Cameras',
          level: 1,
          order: 1,
          childrenCategories: [{ categoryId: '101', categoryName: 'Film', level: 2, order: 1 }],
        },
      ],
    };
    const request = nock(HOST).get(`${STORE}/categories`).reply(200, categories);

    const result = await callStoresTool('ebay_get_store_categories');

    expect(result).toEqual({ isError: false, payload: categories });
    expect(request.isDone()).toBe(true);
  });

  it('returns one task status from getStoreTask', async () => {
    const task = { task: { id: 'TASK-1', type: 'ADD_CATEGORY', status: 'COMPLETED' } };
    const request = nock(HOST).get(`${STORE}/tasks/TASK-1`).reply(200, task);

    const result = await callStoresTool('ebay_get_store_task', { taskId: 'TASK-1' });

    expect(result).toEqual({ isError: false, payload: task });
    expect(request.isDone()).toBe(true);
  });

  it('returns every task status from getStoreTasks', async () => {
    const tasks = { task: [{ id: 'TASK-1', type: 'MOVE_CATEGORY', status: 'IN_PROGRESS' }] };
    const request = nock(HOST).get(`${STORE}/tasks`).reply(200, tasks);

    const result = await callStoresTool('ebay_get_store_tasks');

    expect(result).toEqual({ isError: false, payload: tasks });
    expect(request.isDone()).toBe(true);
  });
});

describe('stores category change tools', () => {
  it('adds a category and returns the task from the Location header', async () => {
    const body = { categoryName: 'Vintage Cameras', destinationParentCategoryId: '100' };
    const location = taskLocation('TASK-ADD');
    const request = nock(HOST)
      .post(`${STORE}/categories`, body)
      .reply(202, '', { Location: location });

    const result = await callStoresTool('ebay_add_store_category', body);

    expect(result).toEqual({ isError: false, payload: { taskId: 'TASK-ADD', location } });
    expect(request.isDone()).toBe(true);
  });

  it('renames a category with the ID in the path and the new name in the body', async () => {
    const location = taskLocation('TASK-RENAME');
    const request = nock(HOST)
      .put(`${STORE}/categories/101`, { categoryName: 'Film Cameras' })
      .reply(204, '', { Location: location });

    const result = await callStoresTool('ebay_rename_store_category', {
      categoryId: '101',
      categoryName: 'Film Cameras',
    });

    expect(result).toEqual({ isError: false, payload: { taskId: 'TASK-RENAME', location } });
    expect(request.isDone()).toBe(true);
  });

  it('moves a category through move_category', async () => {
    const body = {
      categoryId: '101',
      destinationParentCategoryId: '-999',
      listingDestinationCategoryId: '100',
    };
    const location = taskLocation('TASK-MOVE');
    const request = nock(HOST)
      .post(`${STORE}/categories/move_category`, body)
      .reply(202, '', { Location: location });

    const result = await callStoresTool('ebay_move_store_category', body);

    expect(result).toEqual({ isError: false, payload: { taskId: 'TASK-MOVE', location } });
    expect(request.isDone()).toBe(true);
  });

  it('deletes a category and returns the task from the Location header', async () => {
    const location = taskLocation('TASK-DELETE');
    const request = nock(HOST)
      .delete(`${STORE}/categories/101`, { listingDestinationCategoryId: '102' })
      .reply(202, '', { Location: location });

    const result = await callStoresTool('ebay_delete_store_category', {
      categoryId: '101',
      listingDestinationCategoryId: '102',
    });

    expect(result).toEqual({ isError: false, payload: { taskId: 'TASK-DELETE', location } });
    expect(request.isDone()).toBe(true);
  });
});

describe('stores category change failures', () => {
  it('surfaces eBay rejecting a change while another is in flight', async () => {
    const errors = [
      {
        errorId: 225_003,
        domain: 'API_STORES',
        category: 'REQUEST',
        message:
          'You cannot make additional category changes until your previous change request has completed.',
      },
    ];
    const request = nock(HOST).post(`${STORE}/categories`).reply(400, { errors });

    const result = await callStoresTool('ebay_add_store_category', { categoryName: 'Lenses' });

    expect(result.isError).toBe(true);
    expect(result.payload).toMatchObject({ status: 400, details: errors });
    expect(request.isDone()).toBe(true);
  });

  it('rejects a move without a destination parent before contacting eBay', async () => {
    const request = nock(HOST).post(`${STORE}/categories/move_category`).reply(202);

    const result = await client.callTool({
      name: 'ebay_move_store_category',
      arguments: { categoryId: '101' },
    });

    expect(result.isError).toBe(true);
    expect(request.isDone()).toBe(false);
  });

  it('rejects a category name longer than 35 characters before contacting eBay', async () => {
    const request = nock(HOST).post(`${STORE}/categories`).reply(202);

    const result = await client.callTool({
      name: 'ebay_add_store_category',
      arguments: { categoryName: 'x'.repeat(36) },
    });

    expect(result.isError).toBe(true);
    expect(request.isDone()).toBe(false);
  });
});
