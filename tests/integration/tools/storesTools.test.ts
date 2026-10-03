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
  const toolResult = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  const [block] = toolResult.content;
  return {
    isError: toolResult.isError === true,
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
    const storeScope = nock(HOST).get(STORE).reply(200, store);

    const storeResult = await callStoresTool('ebay_get_store');

    expect(storeResult).toEqual({ isError: false, payload: store });
    expect(storeScope.isDone()).toBe(true);
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
    const categoriesScope = nock(HOST).get(`${STORE}/categories`).reply(200, categories);

    const categoriesResult = await callStoresTool('ebay_get_store_categories');

    expect(categoriesResult).toEqual({ isError: false, payload: categories });
    expect(categoriesScope.isDone()).toBe(true);
  });

  it('returns one task status from getStoreTask', async () => {
    const task = { task: { id: 'TASK-1', type: 'ADD_CATEGORY', status: 'COMPLETED' } };
    const taskScope = nock(HOST).get(`${STORE}/tasks/TASK-1`).reply(200, task);

    const taskResult = await callStoresTool('ebay_get_store_task', { taskId: 'TASK-1' });

    expect(taskResult).toEqual({ isError: false, payload: task });
    expect(taskScope.isDone()).toBe(true);
  });

  it('returns every task status from getStoreTasks', async () => {
    const tasks = { task: [{ id: 'TASK-1', type: 'MOVE_CATEGORY', status: 'IN_PROGRESS' }] };
    const tasksScope = nock(HOST).get(`${STORE}/tasks`).reply(200, tasks);

    const tasksResult = await callStoresTool('ebay_get_store_tasks');

    expect(tasksResult).toEqual({ isError: false, payload: tasks });
    expect(tasksScope.isDone()).toBe(true);
  });
});

describe('stores category change tools', () => {
  it('adds a category and returns the task from the Location header', async () => {
    const newCategory = { categoryName: 'Vintage Cameras', destinationParentCategoryId: '100' };
    const location = taskLocation('TASK-ADD');
    const addScope = nock(HOST)
      .post(`${STORE}/categories`, newCategory)
      .reply(202, '', { Location: location });

    const addResult = await callStoresTool('ebay_add_store_category', newCategory);

    expect(addResult).toEqual({ isError: false, payload: { taskId: 'TASK-ADD', location } });
    expect(addScope.isDone()).toBe(true);
  });

  it('renames a category with the ID in the path and the new name in the body', async () => {
    const location = taskLocation('TASK-RENAME');
    const renameScope = nock(HOST)
      .put(`${STORE}/categories/101`, { categoryName: 'Film Cameras' })
      .reply(204, '', { Location: location });

    const renameResult = await callStoresTool('ebay_rename_store_category', {
      categoryId: '101',
      categoryName: 'Film Cameras',
    });

    expect(renameResult).toEqual({ isError: false, payload: { taskId: 'TASK-RENAME', location } });
    expect(renameScope.isDone()).toBe(true);
  });

  it('moves a category through move_category', async () => {
    const categoryMove = {
      categoryId: '101',
      destinationParentCategoryId: '-999',
      listingDestinationCategoryId: '100',
    };
    const location = taskLocation('TASK-MOVE');
    const moveScope = nock(HOST)
      .post(`${STORE}/categories/move_category`, categoryMove)
      .reply(202, '', { Location: location });

    const moveResult = await callStoresTool('ebay_move_store_category', categoryMove);

    expect(moveResult).toEqual({ isError: false, payload: { taskId: 'TASK-MOVE', location } });
    expect(moveScope.isDone()).toBe(true);
  });

  it('deletes a category and returns the task from the Location header', async () => {
    const location = taskLocation('TASK-DELETE');
    const deleteScope = nock(HOST)
      .delete(`${STORE}/categories/101`, { listingDestinationCategoryId: '102' })
      .reply(202, '', { Location: location });

    const deleteResult = await callStoresTool('ebay_delete_store_category', {
      categoryId: '101',
      listingDestinationCategoryId: '102',
    });

    expect(deleteResult).toEqual({ isError: false, payload: { taskId: 'TASK-DELETE', location } });
    expect(deleteScope.isDone()).toBe(true);
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
    const addScope = nock(HOST).post(`${STORE}/categories`).reply(400, { errors });

    const rejectedAdd = await callStoresTool('ebay_add_store_category', { categoryName: 'Lenses' });

    expect(rejectedAdd.isError).toBe(true);
    expect(rejectedAdd.payload).toMatchObject({ status: 400, details: errors });
    expect(addScope.isDone()).toBe(true);
  });

  it('rejects a move without a destination parent before contacting eBay', async () => {
    const moveScope = nock(HOST).post(`${STORE}/categories/move_category`).reply(202);

    const invalidMove = await client.callTool({
      name: 'ebay_move_store_category',
      arguments: { categoryId: '101' },
    });

    expect(invalidMove.isError).toBe(true);
    expect(moveScope.isDone()).toBe(false);
  });

  it('rejects a category name longer than 35 characters before contacting eBay', async () => {
    const addScope = nock(HOST).post(`${STORE}/categories`).reply(202);

    const oversizedAdd = await client.callTool({
      name: 'ebay_add_store_category',
      arguments: { categoryName: 'x'.repeat(36) },
    });

    expect(oversizedAdd.isError).toBe(true);
    expect(addScope.isDone()).toBe(false);
  });
});
