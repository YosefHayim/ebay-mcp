import type { EbayApiClient } from '@/api/client.js';
import { createFeedTaskMethods } from '@/api/listing-management/feedTasks.js';
import { MAX_INLINE_DOWNLOAD_BYTES } from '@/api/shared/download.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = '/sell/feed/v1';
const LOCATION_HOST = 'https://api.ebay.com';
const xml = Buffer.from('<?xml version="1.0" encoding="UTF-8"?><BulkDataExchangeRequests/>');
const file = {
  source: 'media://add.xml',
  fileName: 'add.xml',
  mimeType: 'application/xml',
  bytes: xml,
};
const client = {
  get: vi.fn(),
  post: vi.fn(),
  postForResponse: vi.fn(),
  getForResponse: vi.fn(),
};
// The endpoint factory only uses these mocked client methods.
const feed = createFeedTaskMethods(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Feed task resource', () => {
  it('lists tasks with eBay wire names and omits unset filters', async () => {
    const page = { tasks: [{ taskId: 'T-1', status: 'QUEUED' }], total: 1 };
    client.get.mockResolvedValue(page);

    const result = await Effect.runPromise(
      feed.getTasks({ feedType: 'LMS_ORDER_ACK', lookBackDays: 7, limit: 50, offset: 0 }),
    );
    await Effect.runPromise(feed.getTasks({ scheduleId: 'S-1', dateRange: 'A..B' }));
    await Effect.runPromise(feed.getTasks());

    expect(result).toBe(page);
    expect(client.get.mock.calls).toEqual([
      [`${BASE}/task`, { feed_type: 'LMS_ORDER_ACK', look_back_days: 7, limit: 50, offset: 0 }],
      [`${BASE}/task`, { schedule_id: 'S-1', date_range: 'A..B' }],
      [`${BASE}/task`],
    ]);
  });

  it('creates a task with marketplace and language headers and returns the Location ID', async () => {
    const location = `${LOCATION_HOST}${BASE}/task/T%2F1`;
    client.postForResponse.mockResolvedValue({
      data: undefined,
      status: 202,
      headers: { location },
    });
    const task = { feedType: 'LMS_ADD_FIXED_PRICE_ITEM', schemaVersion: '1423' };

    const created = await Effect.runPromise(
      feed.createTask({ task, marketplaceId: 'EBAY_CA', acceptLanguage: 'fr-CA' }),
    );

    expect(created).toEqual({ taskId: 'T/1', location });
    expect(client.postForResponse).toHaveBeenCalledWith(`${BASE}/task`, task, {
      headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_CA', 'Accept-Language': 'fr-CA' },
    });
  });

  it('keeps the client default headers when no marketplace or language is given', async () => {
    client.postForResponse.mockResolvedValue({
      headers: { location: `${LOCATION_HOST}${BASE}/task/T-2` },
    });
    const task = { feedType: 'LMS_ORDER_ACK', schemaVersion: '1235' };

    expect(await Effect.runPromise(feed.createTask({ task }))).toMatchObject({ taskId: 'T-2' });
    expect(client.postForResponse).toHaveBeenCalledWith(`${BASE}/task`, task, { headers: {} });
  });

  it.each([
    undefined,
    `${LOCATION_HOST}${BASE}/order_task/T-1`,
    `${LOCATION_HOST}${BASE}/task/`,
    `${LOCATION_HOST}${BASE}/task/T-1/upload_file`,
  ])('fails a created task whose Location is %s', async (location) => {
    client.postForResponse.mockResolvedValue({ headers: { location } });

    const error = await Effect.runPromise(
      Effect.flip(feed.createTask({ task: { feedType: 'LMS_ORDER_ACK', schemaVersion: '1235' } })),
    );

    expect(error).toMatchObject({ _tag: 'EbayApiError', method: 'POST', path: `${BASE}/task` });
  });
});

describe('Feed task reads and files', () => {
  it('gets one task with its ID encoded as one path segment', async () => {
    const task = { taskId: 'T/1', status: 'COMPLETED', uploadSummary: { successCount: 3 } };
    client.get.mockResolvedValue(task);

    expect(await Effect.runPromise(feed.getTask({ taskId: 'T/1' }))).toBe(task);
    expect(client.get).toHaveBeenCalledWith(`${BASE}/task/T%2F1`);
  });

  it.each([
    ['getInputFile', 'download_input_file'],
    ['getResultFile', 'download_result_file'],
  ] as const)('%s downloads the bytes with the type and name eBay sent', async (method, suffix) => {
    const bytes = Buffer.from([0x1f, 0x8b, 0x08, 0x00]);
    client.getForResponse.mockResolvedValue({
      data: bytes,
      status: 200,
      headers: {
        'content-type': 'application/octet-stream',
        'content-disposition': 'attachment; filename="result.csv.gz"',
      },
    });

    expect(await Effect.runPromise(feed[method]({ taskId: 'T/1' }))).toEqual({
      bytes,
      contentType: 'application/octet-stream',
      fileName: 'result.csv.gz',
    });
    expect(client.getForResponse).toHaveBeenCalledWith(`${BASE}/task/T%2F1/${suffix}`, undefined, {
      headers: { Accept: 'application/octet-stream' },
      responseType: 'arraybuffer',
      maxBytes: MAX_INLINE_DOWNLOAD_BYTES,
    });
  });

  it('uploads the feed file as multipart form-data with the documented fields', async () => {
    client.post.mockResolvedValue({});

    expect(await Effect.runPromise(feed.uploadFile({ taskId: 'T/1', file }))).toEqual({});

    const [path, form, config] = client.post.mock.calls[0] ?? [];
    expect(path).toBe(`${BASE}/task/T%2F1/upload_file`);
    expect([...form.keys()]).toEqual(['fileName', 'name', 'type', 'file']);
    expect(form.get('fileName')).toBe('add.xml');
    expect(form.get('name')).toBe('file');
    expect(form.get('type')).toBe('form-data');
    const part = form.get('file') as File;
    expect(part.name).toBe('add.xml');
    expect(part.type).toBe('application/xml');
    expect(Buffer.from(await part.arrayBuffer())).toEqual(xml);
    expect(config).toEqual({ timeoutMs: 600_000 });
  });
});

describe('Feed task failures', () => {
  it('rejects invalid input before any request', async () => {
    const programs: Effect.Effect<unknown, { readonly _tag: string }>[] = [
      feed.getTasks({ limit: 0 }),
      feed.getTasks({ lookBackDays: 91 }),
      feed.createTask({ task: { feedType: ' ', schemaVersion: '1235' } }),
      feed.getTask({ taskId: '' }),
      feed.getInputFile({ taskId: ' ' }),
      feed.getResultFile({ taskId: '' }),
      feed.uploadFile({ taskId: '', file }),
      feed.uploadFile({ taskId: 'T-1', file: undefined as unknown as typeof file }),
    ];

    const errors = await Promise.all(
      programs.map((program) => Effect.runPromise(Effect.flip(program))),
    );

    expect(errors.map((error) => error._tag)).toEqual(
      new Array(programs.length).fill('EndpointInputError'),
    );
    for (const mock of Object.values(client)) {
      expect(mock).not.toHaveBeenCalled();
    }
  });

  it('wraps transport failures on every task endpoint with the request context', async () => {
    const cause = new Error('remote failure');
    for (const mock of Object.values(client)) {
      mock.mockRejectedValue(cause);
    }
    const task = { feedType: 'LMS_ORDER_ACK', schemaVersion: '1235' };
    const cases = [
      [feed.getTasks(), 'GET', '/task'],
      [feed.createTask({ task }), 'POST', '/task'],
      [feed.getTask({ taskId: 'T-1' }), 'GET', '/task/T-1'],
      [feed.getInputFile({ taskId: 'T-1' }), 'GET', '/task/T-1/download_input_file'],
      [feed.getResultFile({ taskId: 'T-1' }), 'GET', '/task/T-1/download_result_file'],
      [feed.uploadFile({ taskId: 'T-1', file }), 'POST', '/task/T-1/upload_file'],
    ] as const;

    const errors = await Promise.all(
      cases.map(([program]) => Effect.runPromise(Effect.flip<unknown, unknown, never>(program))),
    );

    cases.forEach(([, method, path], index) => {
      expect(errors[index]).toMatchObject({
        _tag: 'EbayApiError',
        method,
        path: `${BASE}${path}`,
        cause,
      });
    });
  });
});
