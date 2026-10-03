import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationApi } from '@/api/communication/notification.js';
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

describe('getTopic', () => {
  it('get topic by ID', async () => {
    const mockResponse = { topicId: 'topic123' };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getTopic({ topicId: 'topic123' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/topic/topic123');
  });

  it('fail when topicId is missing', async () => {
    const error = await Effect.runPromise(Effect.flip(api.getTopic({ topicId: '' })));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('topicId is required');
  });
});

describe('getTopics', () => {
  it('get topics with parameters', async () => {
    const mockResponse = { topics: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getTopics({ limit: 10, continuationToken: 'cursor123' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/topic', {
      limit: 10,
      continuation_token: 'cursor123',
    });
  });

  it('handle missing optional parameters', async () => {
    const mockResponse = { topics: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getTopics());

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/topic');
  });
});
