import type { EbayApiClient } from '@/api/client.js';
import { createFeedReportTaskMethods } from '@/api/listing-management/feedReportTasks.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = '/sell/feed/v1';
const LOCATION_HOST = 'https://api.ebay.com';
const orderTask = {
  feedType: 'LMS_ORDER_REPORT',
  schemaVersion: '1235',
  filterCriteria: {
    creationDateRange: { from: '2026-09-01T00:00:00.000Z', to: '2026-09-08T00:00:00.000Z' },
    orderStatus: 'ACTIVE',
  },
};
const inventoryTask = {
  feedType: 'LMS_ACTIVE_INVENTORY_REPORT',
  schemaVersion: '1.0',
  filterCriteria: { listingFormat: 'FIXED_PRICE' },
};
const metricTask = {
  feedType: 'CUSTOMER_SERVICE_METRICS_REPORT',
  schemaVersion: '1.0',
  filterCriteria: {
    customerServiceMetricType: 'ITEM_NOT_RECEIVED',
    evaluationMarketplaceId: 'EBAY_US',
    shippingRegions: ['DOMESTIC'],
  },
};
const client = { get: vi.fn(), postForResponse: vi.fn() };
// The endpoint factory only uses these mocked client methods.
const feed = createFeedReportTaskMethods(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Feed report task lists', () => {
  it('maps every list filter to its eBay wire name', async () => {
    const page = { tasks: [], total: 0 };
    client.get.mockResolvedValue(page);

    expect(
      await Effect.runPromise(
        feed.getOrderTasks({ feedType: 'LMS_ORDER_REPORT', lookBackDays: 10, limit: 25 }),
      ),
    ).toBe(page);
    await Effect.runPromise(feed.getOrderTasks({ scheduleId: 'S-1', offset: 25 }));
    await Effect.runPromise(
      feed.getInventoryTasks({ feedType: 'LMS_ACTIVE_INVENTORY_REPORT', dateRange: 'A..B' }),
    );
    await Effect.runPromise(feed.getCustomerServiceMetricTasks({ lookBackDays: 30, limit: 10 }));
    await Effect.runPromise(feed.getCustomerServiceMetricTasks());

    expect(client.get.mock.calls).toEqual([
      [`${BASE}/order_task`, { feed_type: 'LMS_ORDER_REPORT', look_back_days: 10, limit: 25 }],
      [`${BASE}/order_task`, { schedule_id: 'S-1', offset: 25 }],
      [`${BASE}/inventory_task`, { feed_type: 'LMS_ACTIVE_INVENTORY_REPORT', date_range: 'A..B' }],
      [`${BASE}/customer_service_metric_task`, { look_back_days: 30, limit: 10 }],
      [`${BASE}/customer_service_metric_task`],
    ]);
  });

  it('gets one task from each collection with an encoded ID', async () => {
    client.get.mockResolvedValue({ taskId: 'T/1', status: 'COMPLETED' });

    await Effect.runPromise(feed.getOrderTask({ taskId: 'T/1' }));
    await Effect.runPromise(feed.getInventoryTask({ taskId: 'T/1' }));
    await Effect.runPromise(feed.getCustomerServiceMetricTask({ taskId: 'T/1' }));

    expect(client.get.mock.calls).toEqual([
      [`${BASE}/order_task/T%2F1`],
      [`${BASE}/inventory_task/T%2F1`],
      [`${BASE}/customer_service_metric_task/T%2F1`],
    ]);
  });
});

describe('Feed report task creation', () => {
  it('creates an order task and reads the task ID from Location', async () => {
    const location = `${LOCATION_HOST}${BASE}/order_task/T-ORDER`;
    client.postForResponse.mockResolvedValue({
      data: undefined,
      status: 202,
      headers: { location },
    });

    expect(await Effect.runPromise(feed.createOrderTask({ task: orderTask }))).toEqual({
      taskId: 'T-ORDER',
      location,
    });
    expect(client.postForResponse).toHaveBeenCalledWith(`${BASE}/order_task`, orderTask, undefined);
  });

  it('creates an inventory task and reads the task ID from Location', async () => {
    const location = `${LOCATION_HOST}${BASE}/inventory_task/T-INV`;
    client.postForResponse.mockResolvedValue({ status: 202, headers: { location } });

    expect(await Effect.runPromise(feed.createInventoryTask({ task: inventoryTask }))).toEqual({
      taskId: 'T-INV',
      location,
    });
    expect(client.postForResponse).toHaveBeenCalledWith(
      `${BASE}/inventory_task`,
      inventoryTask,
      undefined,
    );
  });

  it('creates a customer service metric task with an explicit Accept-Language', async () => {
    const location = `${LOCATION_HOST}${BASE}/customer_service_metric_task/T-CSM`;
    client.postForResponse.mockResolvedValue({ status: 202, headers: { location } });

    expect(
      await Effect.runPromise(
        feed.createCustomerServiceMetricTask({ task: metricTask, acceptLanguage: 'de-DE' }),
      ),
    ).toEqual({ taskId: 'T-CSM', location });
    await Effect.runPromise(feed.createCustomerServiceMetricTask({ task: metricTask }));

    expect(client.postForResponse.mock.calls).toEqual([
      [
        `${BASE}/customer_service_metric_task`,
        metricTask,
        { headers: { 'Accept-Language': 'de-DE' } },
      ],
      [`${BASE}/customer_service_metric_task`, metricTask, undefined],
    ]);
  });

  it('drops the unsupported modifiedDateRange filter from order task bodies', async () => {
    client.postForResponse.mockResolvedValue({
      headers: { location: `${LOCATION_HOST}${BASE}/order_task/T-1` },
    });
    const filterCriteria = { ...orderTask.filterCriteria, modifiedDateRange: { from: 'A' } };

    await Effect.runPromise(feed.createOrderTask({ task: { ...orderTask, filterCriteria } }));

    expect(client.postForResponse).toHaveBeenCalledWith(`${BASE}/order_task`, orderTask, undefined);
  });

  it('fails when the Location points at another task collection', async () => {
    client.postForResponse.mockResolvedValue({
      headers: { location: `${LOCATION_HOST}${BASE}/task/T-1` },
    });

    const error = await Effect.runPromise(Effect.flip(feed.createOrderTask({ task: orderTask })));

    expect(error).toMatchObject({ _tag: 'EbayApiError', path: `${BASE}/order_task` });
  });
});

describe('Feed report task failures', () => {
  it('rejects invalid input before any request', async () => {
    const programs: Effect.Effect<unknown, { readonly _tag: string }>[] = [
      feed.getOrderTasks({ limit: 501 }),
      feed.getInventoryTasks({ offset: -1 }),
      feed.getCustomerServiceMetricTasks({ lookBackDays: 0 }),
      feed.createOrderTask({ task: { ...orderTask, schemaVersion: '' } }),
      feed.createInventoryTask({ task: { ...inventoryTask, feedType: '' } }),
      feed.createCustomerServiceMetricTask({
        task: {
          ...metricTask,
          filterCriteria: { ...metricTask.filterCriteria, evaluationMarketplaceId: ' ' },
        },
      }),
      feed.getOrderTask({ taskId: '' }),
      feed.getInventoryTask({ taskId: ' ' }),
      feed.getCustomerServiceMetricTask({ taskId: '' }),
    ];

    const errors = await Promise.all(
      programs.map((program) => Effect.runPromise(Effect.flip(program))),
    );

    expect(errors.map((error) => error._tag)).toEqual(
      new Array(programs.length).fill('EndpointInputError'),
    );
    expect(client.get).not.toHaveBeenCalled();
    expect(client.postForResponse).not.toHaveBeenCalled();
  });

  it('wraps transport failures on every report task endpoint with the request context', async () => {
    const cause = new Error('remote failure');
    client.get.mockRejectedValue(cause);
    client.postForResponse.mockRejectedValue(cause);
    const cases = [
      [feed.getOrderTasks(), 'GET', '/order_task'],
      [feed.createOrderTask({ task: orderTask }), 'POST', '/order_task'],
      [feed.getOrderTask({ taskId: 'T-1' }), 'GET', '/order_task/T-1'],
      [feed.getInventoryTasks(), 'GET', '/inventory_task'],
      [feed.createInventoryTask({ task: inventoryTask }), 'POST', '/inventory_task'],
      [feed.getInventoryTask({ taskId: 'T-1' }), 'GET', '/inventory_task/T-1'],
      [feed.getCustomerServiceMetricTasks(), 'GET', '/customer_service_metric_task'],
      [
        feed.createCustomerServiceMetricTask({ task: metricTask }),
        'POST',
        '/customer_service_metric_task',
      ],
      [
        feed.getCustomerServiceMetricTask({ taskId: 'T-1' }),
        'GET',
        '/customer_service_metric_task/T-1',
      ],
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
