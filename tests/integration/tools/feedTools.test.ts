import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { EbaySellerApi } from '@/api/ebaySellerApi.js';
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

const HOST = 'https://api.sandbox.ebay.com';
const FEED = '/sell/feed/v1';
const READ = { readOnlyHint: true };
const WRITE = { readOnlyHint: false };
const orderTask = { feedType: 'LMS_ORDER_REPORT', schemaVersion: '1235' };
const metricTask = {
  feedType: 'CUSTOMER_SERVICE_METRICS_REPORT',
  schemaVersion: '1.0',
  filterCriteria: {
    customerServiceMetricType: 'ITEM_NOT_AS_DESCRIBED',
    evaluationMarketplaceId: 'EBAY_US',
  },
};
const schedule = { feedType: 'LMS_ORDER_REPORT', scheduleTemplateId: 'TPL-1' };
const MULTIPART_CONTENT_TYPE = /multipart\/form-data; boundary=/;

let fixture: MediaFixture;
let client: Client;
let runtime: EbayMcpRuntime;

const callTool = async (name: string, args: Record<string, unknown>) => {
  const toolResult = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));
  const text = toolResult.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('');
  return { isError: toolResult.isError === true, text, content: toolResult.content };
};
const payloadOf = async (name: string, args: Record<string, unknown>) => {
  const toolResult = await callTool(name, args);
  return { isError: toolResult.isError, payload: JSON.parse(toolResult.text) as unknown };
};

beforeAll(async () => {
  fixture = await createMediaFixture();
});

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'feed');
  vi.stubEnv('EBAY_MCP_MEDIA_ROOT', fixture.root);
  vi.stubEnv('EBAY_MCP_MEDIA_DIRS', '');
  nock.cleanAll();
  nock.disableNetConnect();
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
  client = new Client({ name: 'feed-tools-test', version: '1.0.0' });
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

describe('feed family registration', () => {
  it('advertises all 23 Feed API tools with their required inputs and annotations', async () => {
    const expected: Record<string, [string[], Record<string, boolean>]> = {
      ebay_get_order_tasks: [[], READ],
      ebay_create_order_task: [['task'], WRITE],
      ebay_get_order_task: [['taskId'], READ],
      ebay_get_inventory_tasks: [[], READ],
      ebay_create_inventory_task: [['task'], WRITE],
      ebay_get_inventory_task: [['taskId'], READ],
      ebay_get_feed_schedules: [['feedType'], READ],
      ebay_create_feed_schedule: [['schedule'], WRITE],
      ebay_get_feed_schedule: [['scheduleId'], READ],
      ebay_update_feed_schedule: [['scheduleId', 'schedule'], WRITE],
      ebay_delete_feed_schedule: [['scheduleId'], { readOnlyHint: false, destructiveHint: true }],
      ebay_get_feed_schedule_result_file: [['scheduleId'], READ],
      ebay_get_feed_schedule_template: [['scheduleTemplateId'], READ],
      ebay_get_feed_schedule_templates: [['feedType'], READ],
      ebay_get_feed_tasks: [[], READ],
      ebay_create_feed_task: [['task'], WRITE],
      ebay_get_feed_task_input_file: [['taskId'], READ],
      ebay_get_feed_task_result_file: [['taskId'], READ],
      ebay_get_feed_task: [['taskId'], READ],
      ebay_upload_feed_task_file: [['taskId', 'path'], WRITE],
      ebay_get_customer_service_metric_tasks: [[], READ],
      ebay_create_customer_service_metric_task: [['task'], WRITE],
      ebay_get_customer_service_metric_task: [['taskId'], READ],
    };

    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual(Object.keys(expected).sort());
    const advertised = Object.fromEntries(
      tools.map((tool) => [tool.name, [tool.inputSchema.required ?? [], tool.annotations]]),
    );
    expect(advertised).toEqual(expected);
    const createOrder = tools.find((tool) => tool.name === 'ebay_create_order_task');
    expect(createOrder?.inputSchema.properties?.task).toMatchObject({
      required: ['feedType', 'schemaVersion'],
    });
    const upload = tools.find((tool) => tool.name === 'ebay_upload_feed_task_file');
    expect(upload?.description).toContain('EBAY_MCP_MEDIA_DIRS');
  });
});

const jsonReads = [
  {
    tool: 'ebay_get_order_tasks',
    args: { feedType: 'LMS_ORDER_REPORT', lookBackDays: 10 },
    resource: '/order_task',
    query: { feed_type: 'LMS_ORDER_REPORT', look_back_days: '10' },
    response: { tasks: [{ taskId: 'T-1', status: 'COMPLETED' }], total: 1 },
  },
  {
    tool: 'ebay_get_order_task',
    args: { taskId: 'T-1' },
    resource: '/order_task/T-1',
    response: { taskId: 'T-1', feedType: 'LMS_ORDER_REPORT' },
  },
  {
    tool: 'ebay_get_inventory_tasks',
    args: { feedType: 'LMS_ACTIVE_INVENTORY_REPORT', limit: 5 },
    resource: '/inventory_task',
    query: { feed_type: 'LMS_ACTIVE_INVENTORY_REPORT', limit: '5' },
    response: { tasks: [], total: 0 },
  },
  {
    tool: 'ebay_get_inventory_task',
    args: { taskId: 'T-2' },
    resource: '/inventory_task/T-2',
    response: { taskId: 'T-2', status: 'QUEUED' },
  },
  {
    tool: 'ebay_get_customer_service_metric_tasks',
    args: { dateRange: '2026-09-01T00:00:00.000Z..2026-09-02T00:00:00.000Z' },
    resource: '/customer_service_metric_task',
    query: { date_range: '2026-09-01T00:00:00.000Z..2026-09-02T00:00:00.000Z' },
    response: { tasks: [{ taskId: 'T-3' }] },
  },
  {
    tool: 'ebay_get_customer_service_metric_task',
    args: { taskId: 'T-3' },
    resource: '/customer_service_metric_task/T-3',
    response: { taskId: 'T-3', status: 'IN_PROCESS' },
  },
  {
    tool: 'ebay_get_feed_schedules',
    args: { feedType: 'LMS_ORDER_REPORT', offset: 10 },
    resource: '/schedule',
    query: { feed_type: 'LMS_ORDER_REPORT', offset: '10' },
    response: { schedules: [{ scheduleId: 'S-1' }] },
  },
  {
    tool: 'ebay_get_feed_schedule',
    args: { scheduleId: 'S-1' },
    resource: '/schedule/S-1',
    response: { scheduleId: 'S-1', status: 'ACTIVE' },
  },
  {
    tool: 'ebay_get_feed_schedule_templates',
    args: { feedType: 'LMS_ORDER_REPORT' },
    resource: '/schedule_template',
    query: { feed_type: 'LMS_ORDER_REPORT' },
    response: { scheduleTemplates: [{ scheduleTemplateId: 'TPL-1' }] },
  },
  {
    tool: 'ebay_get_feed_schedule_template',
    args: { scheduleTemplateId: 'TPL-1' },
    resource: '/schedule_template/TPL-1',
    response: { scheduleTemplateId: 'TPL-1', frequency: 'DAILY' },
  },
  {
    tool: 'ebay_get_feed_tasks',
    args: { scheduleId: 'S-1' },
    resource: '/task',
    query: { schedule_id: 'S-1' },
    response: { tasks: [{ taskId: 'T-4' }] },
  },
  {
    tool: 'ebay_get_feed_task',
    args: { taskId: 'T/4' },
    resource: '/task/T%2F4',
    response: { taskId: 'T/4', uploadSummary: { successCount: 2, failureCount: 1 } },
  },
];

const downloads = [
  {
    tool: 'ebay_get_feed_task_input_file',
    args: { taskId: 'T-1' },
    resource: '/task/T-1/download_input_file',
    uri: 'ebay-feed://task/T-1/input',
    mimeType: 'application/xml',
    bytes: Buffer.from('<BulkDataExchangeRequests/>'),
  },
  {
    tool: 'ebay_get_feed_task_result_file',
    args: { taskId: 'T/1' },
    resource: '/task/T%2F1/download_result_file',
    uri: 'ebay-feed://task/T%2F1/result',
    mimeType: 'application/gzip',
    bytes: Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0xff]),
  },
  {
    tool: 'ebay_get_feed_schedule_result_file',
    args: { scheduleId: 'S-1' },
    resource: '/schedule/S-1/download_result_file',
    uri: 'ebay-feed://schedule/S-1/result',
    mimeType: 'text/csv',
    bytes: Buffer.from('orderId,total\n1,10\n'),
  },
];

const inventoryTask = { feedType: 'LMS_ACTIVE_INVENTORY_REPORT', schemaVersion: '1.0' };
const uploadTask = { feedType: 'LMS_ADD_FIXED_PRICE_ITEM', schemaVersion: '1423' };
const taskCreates = [
  { tool: 'ebay_create_order_task', args: { task: orderTask }, collection: '/order_task' },
  {
    tool: 'ebay_create_inventory_task',
    args: { task: inventoryTask },
    collection: '/inventory_task',
  },
  {
    tool: 'ebay_create_customer_service_metric_task',
    args: { task: metricTask, acceptLanguage: 'en-GB' },
    collection: '/customer_service_metric_task',
    headers: { 'accept-language': 'en-GB' },
  },
  {
    tool: 'ebay_create_feed_task',
    args: { task: uploadTask, marketplaceId: 'EBAY_DE' },
    collection: '/task',
    headers: { 'x-ebay-c-marketplace-id': 'EBAY_DE' },
  },
];

describe('feed read tools', () => {
  it.each(jsonReads)('$tool returns eBay data', async ({
    tool,
    args,
    resource,
    query,
    response: feedDocument,
  }) => {
    const readScope = nock(HOST)
      .get(`${FEED}${resource}`)
      .query(query ?? {})
      .reply(200, feedDocument);

    expect(await payloadOf(tool, args)).toEqual({ isError: false, payload: feedDocument });
    expect(readScope.isDone()).toBe(true);
  });

  it.each(downloads)('$tool embeds the downloaded file', async ({
    tool,
    args,
    resource,
    uri,
    mimeType,
    bytes,
  }) => {
    const downloadScope = nock(HOST)
      .get(`${FEED}${resource}`)
      .matchHeader('accept', 'application/octet-stream')
      .reply(200, bytes, {
        'Content-Type': mimeType,
        'Content-Disposition': 'attachment; filename="feed.bin"',
      });

    const downloadResult = await callTool(tool, args);

    expect(downloadResult.isError).toBe(false);
    expect(downloadResult.text).toContain(`feed.bin (${mimeType}, ${bytes.length} bytes)`);
    expect(downloadResult.content.find((block) => block.type === 'resource')).toEqual({
      type: 'resource',
      resource: { uri, mimeType, blob: bytes.toString('base64') },
    });
    expect(downloadScope.isDone()).toBe(true);
  });
});

describe('feed create tools', () => {
  it.each(taskCreates)('$tool returns the task ID eBay put in Location', async ({
    tool,
    args,
    collection,
    headers,
  }) => {
    const location = `https://api.ebay.com${FEED}${collection}/TASK-9`;
    const createScope = nock(HOST, { reqheaders: headers ?? {} })
      .post(`${FEED}${collection}`, args.task)
      .reply(202, '', { Location: location });

    expect(await payloadOf(tool, args)).toEqual({
      isError: false,
      payload: { taskId: 'TASK-9', location },
    });
    expect(createScope.isDone()).toBe(true);
  });

  it('creates, updates and deletes a schedule', async () => {
    const location = `https://api.ebay.com${FEED}/schedule/S-9`;
    const update = { scheduleName: 'Nightly orders', preferredTriggerHour: '02Z' };
    const create = nock(HOST)
      .post(`${FEED}/schedule`, schedule)
      .reply(201, {}, { Location: location });
    const put = nock(HOST).put(`${FEED}/schedule/S-9`, update).reply(204);
    const remove = nock(HOST).delete(`${FEED}/schedule/S-9`).reply(204);

    expect(await payloadOf('ebay_create_feed_schedule', { schedule })).toEqual({
      isError: false,
      payload: { scheduleId: 'S-9', location },
    });
    expect(
      await payloadOf('ebay_update_feed_schedule', { scheduleId: 'S-9', schedule: update }),
    ).toEqual({ isError: false, payload: { status: 'success' } });
    expect(await payloadOf('ebay_delete_feed_schedule', { scheduleId: 'S-9' })).toEqual({
      isError: false,
      payload: { status: 'success' },
    });
    expect([create, put, remove].every((scope) => scope.isDone())).toBe(true);
  });
});

describe('feed file uploads', () => {
  it('uploads an allowlisted feed file as multipart form-data', async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><BulkDataExchangeRequests/>';
    await writeFile(path.join(fixture.root, 'add-items.xml'), xml);
    let multipart = '';
    const upload = nock(HOST, { reqheaders: { 'content-type': MULTIPART_CONTENT_TYPE } })
      .post(`${FEED}/task/T-1/upload_file`, (multipartBody) => {
        multipart = Buffer.isBuffer(multipartBody)
          ? multipartBody.toString()
          : String(multipartBody);
        return true;
      })
      .reply(200, {});

    const uploadResult = await payloadOf('ebay_upload_feed_task_file', {
      taskId: 'T-1',
      path: 'media://add-items.xml',
    });

    expect(uploadResult).toEqual({ isError: false, payload: {} });
    expect(upload.isDone()).toBe(true);
    for (const field of [
      'name="fileName"',
      'name="name"',
      'name="type"',
      'name="file"; filename="add-items.xml"',
    ]) {
      expect(multipart).toContain(field);
    }
    expect(multipart).toContain('Content-Type: application/xml');
    expect(multipart).toContain(xml);
  });

  it('refuses a feed file outside the allowlist without contacting eBay', async () => {
    const outsideFile = path.join(fixture.outside, 'secret.xml');
    await writeFile(outsideFile, '<BulkDataExchangeRequests/>');
    const upload = nock(HOST).post(`${FEED}/task/T-1/upload_file`).reply(200, {});

    const rejectedUpload = await callTool('ebay_upload_feed_task_file', {
      taskId: 'T-1',
      path: outsideFile,
    });

    expect(rejectedUpload.isError).toBe(true);
    expect(rejectedUpload.text).toContain('outside the allowed media directories');
    expect(upload.isDone()).toBe(false);
  });
});

describe('feed errors', () => {
  it('surfaces eBay error details as a tool error', async () => {
    const errors = [{ errorId: 160_022, domain: 'API_FEED', message: 'The task ID is invalid.' }];
    nock(HOST).get(`${FEED}/order_task/BAD`).reply(400, { errors });

    const invalidTask = await payloadOf('ebay_get_order_task', { taskId: 'BAD' });

    expect(invalidTask.isError).toBe(true);
    expect(invalidTask.payload).toMatchObject({ status: 400, details: errors });
  });
});
