import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationApi } from '@/api/communication/notification.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { Effect } from 'effect';

let client: EbayApiClient;
let api: NotificationApi;

beforeEach(() => {
  client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as EbayApiClient;
  api = new NotificationApi(client);
});

describe('createSubscriptionFilter', () => {
  it('create subscription filter', async () => {
    const mockResponse = { filterId: 'filter123' };
    const filter = { filterSchema: { type: 'object' } };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.createSubscriptionFilter({ subscriptionId: 'sub123', ...filter }));

    expect(client.post).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription/sub123/filter',
      filter,
    );
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.createSubscriptionFilter({ subscriptionId: '', ...invalidInput({}) })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });

  it('fail when filter input is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.createSubscriptionFilter(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('input is required');
  });
});

describe('getSubscriptionFilter', () => {
  it('get subscription filter', async () => {
    const mockResponse = { filterId: 'filter123' };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.getSubscriptionFilter({ subscriptionId: 'sub123', filterId: 'filter123' }),
    );

    expect(client.get).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription/sub123/filter/filter123',
    );
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getSubscriptionFilter({ subscriptionId: '', filterId: 'filter123' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });

  it('fail when filterId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getSubscriptionFilter({ subscriptionId: 'sub123', filterId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('filterId is required');
  });
});

describe('deleteSubscriptionFilter', () => {
  it('delete subscription filter', async () => {
    vi.mocked(client.delete).mockResolvedValue(undefined);

    await Effect.runPromise(
      api.deleteSubscriptionFilter({ subscriptionId: 'sub123', filterId: 'filter123' }),
    );

    expect(client.delete).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription/sub123/filter/filter123',
    );
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.deleteSubscriptionFilter({ subscriptionId: '', filterId: 'filter123' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });

  it('fail when filterId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.deleteSubscriptionFilter({ subscriptionId: 'sub123', filterId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('filterId is required');
  });
});
