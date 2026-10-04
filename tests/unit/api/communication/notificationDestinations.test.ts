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

describe('getDestination', () => {
  it('get destination by ID', async () => {
    const mockResponse = { destinationId: 'dest123' };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getDestination({ destinationId: 'dest123' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/destination/dest123');
  });

  it('fail when destinationId is missing', async () => {
    const error = await Effect.runPromise(Effect.flip(api.getDestination({ destinationId: '' })));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('destinationId is required');
  });
});

describe('createDestination', () => {
  it('create notification destination', async () => {
    const mockResponse = { destinationId: '123' };
    const destination = {
      name: 'webhook',
      deliveryConfig: {
        endpoint: 'https://example.com/webhook',
        verificationToken: 'token123456789012345678901234567',
      },
    };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.createDestination(destination));

    expect(client.post).toHaveBeenCalledWith('/commerce/notification/v1/destination', destination);
  });

  it('fail when destination is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.createDestination(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('input is required');
  });
});

describe('updateDestination', () => {
  it('update notification destination', async () => {
    const mockResponse = { success: true };
    const destination = {
      deliveryConfig: { endpoint: 'https://new-endpoint.com/webhook' },
    };
    vi.mocked(client.put).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.updateDestination({ destinationId: 'dest123', ...destination }));

    expect(client.put).toHaveBeenCalledWith(
      '/commerce/notification/v1/destination/dest123',
      destination,
    );
  });

  it('fail when destinationId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateDestination({ destinationId: '', ...invalidInput({}) })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('destinationId is required');
  });

  it('fail when destination input is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateDestination(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('input is required');
  });
});

describe('deleteDestination', () => {
  it('delete notification destination', async () => {
    vi.mocked(client.delete).mockResolvedValue(undefined);

    await Effect.runPromise(api.deleteDestination({ destinationId: 'dest123' }));

    expect(client.delete).toHaveBeenCalledWith('/commerce/notification/v1/destination/dest123');
  });

  it('fail when destinationId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.deleteDestination({ destinationId: '' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('destinationId is required');
  });
});
