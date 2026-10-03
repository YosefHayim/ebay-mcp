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

describe('getPublicKey', () => {
  it('get public key by ID', async () => {
    const mockResponse = { publicKey: 'key123' };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getPublicKey({ publicKeyId: 'key123' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/public_key/key123');
  });

  it('fail when publicKeyId is missing', async () => {
    const error = await Effect.runPromise(Effect.flip(api.getPublicKey({ publicKeyId: '' })));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('publicKeyId is required');
  });
});

describe('getConfig', () => {
  it('get notification configuration', async () => {
    const mockResponse = { config: {} };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getConfig({}));

    expect(client.get).toHaveBeenCalledWith('/commerce/notification/v1/config');
  });
});

describe('updateConfig', () => {
  it('update notification configuration', async () => {
    const mockResponse = { success: true };
    const config = { alertEmail: 'alerts@example.com' };
    vi.mocked(client.put).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.updateConfig(config));

    expect(client.put).toHaveBeenCalledWith('/commerce/notification/v1/config', config);
  });

  it('fail when config is missing', async () => {
    const error = await Effect.runPromise(Effect.flip(api.updateConfig(invalidInput(undefined))));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('input is required');
  });
});
