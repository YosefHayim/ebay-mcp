import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeveloperApi } from '../../../src/api/developer/developer.js';
import type { EbayApiClient } from '../../../src/api/client.js';

describe('DeveloperApi', () => {
  let client: EbayApiClient;
  let api: DeveloperApi;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;
    api = new DeveloperApi(client);
  });

  describe('getRateLimits', () => {
    it('should get rate limits without parameters', async () => {
      const mockResponse = {
        rateLimits: [
          {
            apiContext: 'sell',
            apiName: 'inventory',
            resources: [
              {
                name: 'inventory_item',
                rates: [{ limit: 5000, remaining: 4500, timeWindow: 86400 }],
              },
            ],
          },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getRateLimits();

      expect(client.get).toHaveBeenCalledWith(
        '/developer/analytics/v1_beta/rate_limit/',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get rate limits with apiContext parameter', async () => {
      const mockResponse = { rateLimits: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getRateLimits('sell');

      expect(client.get).toHaveBeenCalledWith('/developer/analytics/v1_beta/rate_limit/', {
        api_context: 'sell',
      });
    });

    it('should get rate limits with apiName parameter', async () => {
      const mockResponse = { rateLimits: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getRateLimits(undefined, 'inventory');

      expect(client.get).toHaveBeenCalledWith('/developer/analytics/v1_beta/rate_limit/', {
        api_name: 'inventory',
      });
    });

    it('should get rate limits with both parameters', async () => {
      const mockResponse = { rateLimits: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getRateLimits('sell', 'inventory');

      expect(client.get).toHaveBeenCalledWith('/developer/analytics/v1_beta/rate_limit/', {
        api_context: 'sell',
        api_name: 'inventory',
      });
    });
  });

  describe('getUserRateLimits', () => {
    it('should get user rate limits without parameters', async () => {
      const mockResponse = {
        rateLimits: [
          {
            apiContext: 'sell',
            apiName: 'fulfillment',
            resources: [
              {
                name: 'order',
                rates: [{ limit: 10000, remaining: 9500, timeWindow: 86400 }],
              },
            ],
          },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getUserRateLimits();

      expect(client.get).toHaveBeenCalledWith(
        '/developer/analytics/v1_beta/user_rate_limit/',
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get user rate limits with apiContext parameter', async () => {
      const mockResponse = { rateLimits: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getUserRateLimits('commerce');

      expect(client.get).toHaveBeenCalledWith('/developer/analytics/v1_beta/user_rate_limit/', {
        api_context: 'commerce',
      });
    });

    it('should get user rate limits with apiName parameter', async () => {
      const mockResponse = { rateLimits: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getUserRateLimits(undefined, 'fulfillment');

      expect(client.get).toHaveBeenCalledWith('/developer/analytics/v1_beta/user_rate_limit/', {
        api_name: 'fulfillment',
      });
    });

    it('should get user rate limits with both parameters', async () => {
      const mockResponse = { rateLimits: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getUserRateLimits('sell', 'marketing');

      expect(client.get).toHaveBeenCalledWith('/developer/analytics/v1_beta/user_rate_limit/', {
        api_context: 'sell',
        api_name: 'marketing',
      });
    });
  });

  describe('registerClient', () => {
    it('should register a new client', async () => {
      const clientSettings = {
        application_type: 'web',
        client_name: 'Test Application',
        redirect_uris: ['https://example.com/callback'],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
        scope: 'openid profile',
        software_statement: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      const mockResponse = {
        client_id: 'new_client_123',
        client_secret: 'secret_xyz',
        client_id_issued_at: 1704067200,
        client_secret_expires_at: 0,
        registration_client_uri:
          'https://api.ebay.com/developer/client_registration/v1/client/new_client_123',
        registration_access_token: 'access_token_abc',
      };

      vi.mocked(client.post).mockResolvedValue(mockResponse);

      const result = await api.registerClient(clientSettings);

      expect(client.post).toHaveBeenCalledWith(
        '/developer/client_registration/v1/client/register',
        clientSettings
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration with minimal settings', async () => {
      const clientSettings = {
        application_type: 'native',
        client_name: 'Minimal App',
        redirect_uris: ['com.example.app://oauth/callback'],
      };

      const mockResponse = {
        client_id: 'minimal_client_456',
      };

      vi.mocked(client.post).mockResolvedValue(mockResponse);

      const result = await api.registerClient(clientSettings);

      expect(client.post).toHaveBeenCalledWith(
        '/developer/client_registration/v1/client/register',
        clientSettings
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSigningKeys', () => {
    it('should get all signing keys', async () => {
      const mockResponse = {
        signingKeys: [
          {
            signingKeyId: 'key_001',
            creationTime: '2024-01-01T00:00:00.000Z',
            expirationTime: '2025-01-01T00:00:00.000Z',
            jwe: 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...',
            publicKey: '-----BEGIN PUBLIC KEY-----\nMIIB...',
          },
          {
            signingKeyId: 'key_002',
            creationTime: '2024-06-01T00:00:00.000Z',
            expirationTime: '2025-06-01T00:00:00.000Z',
            jwe: 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...',
            publicKey: '-----BEGIN PUBLIC KEY-----\nMIIC...',
          },
        ],
      };

      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getSigningKeys();

      expect(client.get).toHaveBeenCalledWith('/developer/key_management/v1/signing_key');
      expect(result).toEqual(mockResponse);
      expect(result.signingKeys).toHaveLength(2);
    });

    it('should return empty array when no signing keys exist', async () => {
      const mockResponse = { signingKeys: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getSigningKeys();

      expect(client.get).toHaveBeenCalledWith('/developer/key_management/v1/signing_key');
      expect(result.signingKeys).toHaveLength(0);
    });
  });

  describe('createSigningKey', () => {
    it('should create a signing key without request body', async () => {
      const mockResponse = {
        signingKeyId: 'new_key_123',
        creationTime: '2024-01-15T12:00:00.000Z',
        expirationTime: '2025-01-15T12:00:00.000Z',
        jwe: 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAAOCAQ8A...',
      };

      vi.mocked(client.post).mockResolvedValue(mockResponse);

      const result = await api.createSigningKey();

      expect(client.post).toHaveBeenCalledWith('/developer/key_management/v1/signing_key', {});
      expect(result).toEqual(mockResponse);
      expect(result.signingKeyId).toBe('new_key_123');
    });

    it('should create a signing key with request body', async () => {
      const request = {
        signingKeyCipher: 'RSA',
      };

      const mockResponse = {
        signingKeyId: 'rsa_key_456',
        creationTime: '2024-01-15T12:00:00.000Z',
        expirationTime: '2025-01-15T12:00:00.000Z',
        jwe: 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjAN...',
      };

      vi.mocked(client.post).mockResolvedValue(mockResponse);

      const result = await api.createSigningKey(request);

      expect(client.post).toHaveBeenCalledWith('/developer/key_management/v1/signing_key', request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSigningKey', () => {
    it('should get a specific signing key by ID', async () => {
      const mockResponse = {
        signingKeyId: 'key_001',
        creationTime: '2024-01-01T00:00:00.000Z',
        expirationTime: '2025-01-01T00:00:00.000Z',
        jwe: 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ...',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjAN...',
      };

      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getSigningKey('key_001');

      expect(client.get).toHaveBeenCalledWith('/developer/key_management/v1/signing_key/key_001');
      expect(result).toEqual(mockResponse);
      expect(result.signingKeyId).toBe('key_001');
    });

    it('should throw error when signingKeyId is empty', async () => {
      await expect(api.getSigningKey('')).rejects.toThrow(
        'signingKeyId is required and must be a string'
      );
    });

    it('should throw error when signingKeyId is null', async () => {
      await expect(api.getSigningKey(null as any)).rejects.toThrow(
        'signingKeyId is required and must be a string'
      );
    });

    it('should throw error when signingKeyId is undefined', async () => {
      await expect(api.getSigningKey(undefined as any)).rejects.toThrow(
        'signingKeyId is required and must be a string'
      );
    });

    it('should throw error when signingKeyId is not a string', async () => {
      await expect(api.getSigningKey(123 as any)).rejects.toThrow(
        'signingKeyId is required and must be a string'
      );
    });

    it('should handle API errors when getting signing key', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Key not found'));

      await expect(api.getSigningKey('nonexistent_key')).rejects.toThrow('Key not found');
    });
  });

  describe('error handling', () => {
    it('should propagate errors from getRateLimits', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Rate limit API unavailable'));

      await expect(api.getRateLimits()).rejects.toThrow('Rate limit API unavailable');
    });

    it('should propagate errors from getUserRateLimits', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('User rate limit API unavailable'));

      await expect(api.getUserRateLimits()).rejects.toThrow('User rate limit API unavailable');
    });

    it('should propagate errors from registerClient', async () => {
      vi.mocked(client.post).mockRejectedValue(new Error('Registration failed'));

      await expect(api.registerClient({} as any)).rejects.toThrow('Registration failed');
    });

    it('should propagate errors from getSigningKeys', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Key management API unavailable'));

      await expect(api.getSigningKeys()).rejects.toThrow('Key management API unavailable');
    });

    it('should propagate errors from createSigningKey', async () => {
      vi.mocked(client.post).mockRejectedValue(new Error('Key creation failed'));

      await expect(api.createSigningKey()).rejects.toThrow('Key creation failed');
    });
  });
});
