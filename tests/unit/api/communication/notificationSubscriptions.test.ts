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

describe('getSubscriptions', () => {
  it('get subscriptions with parameters', async () => {
    const mockResponse = { subscriptions: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getSubscriptions({ limit: 10, continuationToken: 'cursor123' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/subscription', {
      limit: 10,
      continuation_token: 'cursor123',
    });
  });

  it('handle missing optional parameters', async () => {
    const mockResponse = { subscriptions: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getSubscriptions());

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/subscription');
  });
});

describe('createSubscription', () => {
  it('create subscription', async () => {
    const mockResponse = { subscriptionId: 'sub123' };
    const subscription = { topicId: 'topic123', destinationId: 'dest123' };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.createSubscription(subscription));

    expect(client.post).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription',
      subscription,
    );
  });

  it('fail when subscription is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.createSubscription(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('input is required');
  });
});

describe('getSubscription', () => {
  it('get subscription by ID', async () => {
    const mockResponse = { subscriptionId: 'sub123' };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getSubscription({ subscriptionId: 'sub123' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/subscription/sub123');
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(Effect.flip(api.getSubscription({ subscriptionId: '' })));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });
});

describe('updateSubscription', () => {
  it('update subscription', async () => {
    const mockResponse = { success: true };
    const subscription = { status: 'DISABLED' };
    vi.mocked(client.put).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.updateSubscription({ subscriptionId: 'sub123', ...subscription }));

    expect(client.put).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription/sub123',
      subscription,
    );
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateSubscription({ subscriptionId: '', ...invalidInput({}) })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });

  it('fail when subscription input is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateSubscription(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('input is required');
  });
});

describe('deleteSubscription', () => {
  it('delete subscription', async () => {
    vi.mocked(client.delete).mockResolvedValue(undefined);

    await Effect.runPromise(api.deleteSubscription({ subscriptionId: 'sub123' }));

    expect(client.delete).toHaveBeenCalledWith('/commerce/notification/v1/subscription/sub123');
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.deleteSubscription({ subscriptionId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });
});

describe('disableSubscription', () => {
  it('disable subscription', async () => {
    const mockResponse = { success: true };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.disableSubscription({ subscriptionId: 'sub123' }));

    expect(client.post).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription/sub123/disable',
    );
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.disableSubscription({ subscriptionId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });
});

describe('enableSubscription', () => {
  it('enable subscription', async () => {
    const mockResponse = { success: true };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.enableSubscription({ subscriptionId: 'sub123' }));

    expect(client.post).toHaveBeenCalledWith(
      '/commerce/notification/v1/subscription/sub123/enable',
    );
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.enableSubscription({ subscriptionId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });
});

describe('testSubscription', () => {
  it('test subscription', async () => {
    const mockResponse = { success: true };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.testSubscription({ subscriptionId: 'sub123' }));

    expect(client.post).toHaveBeenCalledWith('/commerce/notification/v1/subscription/sub123/test');
  });

  it('fail when subscriptionId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.testSubscription({ subscriptionId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('subscriptionId is required');
  });
});
