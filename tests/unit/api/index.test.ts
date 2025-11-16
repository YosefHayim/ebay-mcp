import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EbaySellerApi } from '@/api/index.js';
import type { EbayConfig } from '@/types/ebay.js';

// Mock EbayOAuthClient
const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
  getUserTokens: vi.fn(), // Add mock for getUserTokens
};

vi.mock('@/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

describe('EbaySellerApi', () => {
  let api: EbaySellerApi;
  let config: EbayConfig;

  beforeEach(async () => {
    vi.clearAllMocks();

    config = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };

    mockOAuthClient.hasUserTokens.mockReturnValue(true);
    mockOAuthClient.getAccessToken.mockResolvedValue('test_access_token');
    mockOAuthClient.initialize.mockResolvedValue(undefined);
    mockOAuthClient.isAuthenticated.mockReturnValue(true);
    mockOAuthClient.getTokenInfo.mockReturnValue({
      hasUserTokens: true,
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
    });

    api = new EbaySellerApi(config);
    await api.initialize();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const newApi = new EbaySellerApi(config);
      await expect(newApi.initialize()).resolves.not.toThrow();
    });

    it('should have all API modules', () => {
      expect(api.account).toBeDefined();
      expect(api.inventory).toBeDefined();
      expect(api.fulfillment).toBeDefined();
      expect(api.dispute).toBeDefined();
      expect(api.marketing).toBeDefined();
      expect(api.recommendation).toBeDefined();
      expect(api.analytics).toBeDefined();
      expect(api.metadata).toBeDefined();
      expect(api.taxonomy).toBeDefined();
      expect(api.negotiation).toBeDefined();
      expect(api.message).toBeDefined();
      expect(api.notification).toBeDefined();
      expect(api.feedback).toBeDefined();
      expect(api.identity).toBeDefined();
      expect(api.compliance).toBeDefined();
      expect(api.vero).toBeDefined();
      expect(api.translation).toBeDefined();
      expect(api.edelivery).toBeDefined();
    });
  });

  describe('authentication methods', () => {
    it('should check if authenticated', () => {
      const isAuth = api.isAuthenticated();
      expect(typeof isAuth).toBe('boolean');
    });

    it('should check if user tokens are available', () => {
      mockOAuthClient.hasUserTokens.mockReturnValue(true);
      const hasTokens = api.hasUserTokens();
      expect(typeof hasTokens).toBe('boolean');
    });

    it('should set user tokens', async () => {
      const accessToken = 'new_access_token';
      const refreshToken = 'new_refresh_token';
      const accessTokenExpiry = Date.now() + 7200000;
      const refreshTokenExpiry = Date.now() + 47304000000;

      await api.setUserTokens(accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry);

      expect(mockOAuthClient.setUserTokens).toHaveBeenCalled();
    });

    it('should set user tokens without expiry times', async () => {
      await api.setUserTokens('access_token', 'refresh_token');
      expect(mockOAuthClient.setUserTokens).toHaveBeenCalled();
    });

    it('should get auth client', () => {
      const client = api.getAuthClient();
      expect(client).toBeDefined();
    });

    it('should get token info', () => {
      const tokenInfo = api.getTokenInfo();
      expect(tokenInfo).toBeDefined();
    });
  });
});
