import { EbayOAuthClient } from '@/auth/oauth.js';
import { getBaseUrl } from '@/config/environment.js';
import type { EbayApiError, EbayConfig } from '@/types/ebay.js';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

// Extended Axios config with retry tracking
interface AxiosConfigWithRetry extends AxiosRequestConfig {
  __authRetryCount?: number;
  __retryCount?: number;
}

/**
 * Rate limit tracking
 */
class RateLimitTracker {
  private requestTimestamps: number[] = [];
  private readonly windowMs = 60000; // 1 minute window
  private readonly maxRequests = 5000; // Conservative limit

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove timestamps older than window
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    return this.requestTimestamps.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  getStats(): { current: number; max: number; windowMs: number } {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    return {
      current: this.requestTimestamps.length,
      max: this.maxRequests,
      windowMs: this.windowMs,
    };
  }
}

/**
 * Base client for making eBay API requests
 */
export class EbayApiClient {
  private httpClient: AxiosInstance;
  private authClient: EbayOAuthClient;
  private baseUrl: string;
  private rateLimitTracker: RateLimitTracker;
  private config: EbayConfig;

  constructor(config: EbayConfig) {
    this.config = config;
    this.authClient = new EbayOAuthClient(config);
    this.baseUrl = getBaseUrl(config.environment);
    this.rateLimitTracker = new RateLimitTracker();

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor to inject auth token and check rate limits
    this.httpClient.interceptors.request.use(
      async (config) => {
        // Check rate limit before making request
        if (!this.rateLimitTracker.canMakeRequest()) {
          const stats = this.rateLimitTracker.getStats();
          throw new Error(
            `Rate limit exceeded: ${stats.current}/${stats.max} requests in ${stats.windowMs}ms window. Please wait before making more requests.`
          );
        }

        const token = await this.authClient.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;

        // Record the request
        this.rateLimitTracker.recordRequest();

        // Debug logging: Log outgoing request details
        console.error('\n🔍 [REQUEST DEBUG]');
        console.error(`  Method: ${config.method?.toUpperCase()}`);
        console.error(`  URL: ${config.baseURL}${config.url}`);
        if (config.params && Object.keys(config.params).length > 0) {
          console.error(`  Query Params: ${JSON.stringify(config.params, null, 2)}`);
        }
        if (config.data) {
          console.error(`  Request Body: ${JSON.stringify(config.data, null, 2)}`);
        }

        return config;
      },
      (error) => console.error(error)
    );

    // Add response interceptor for error handling and retry logic
    this.httpClient.interceptors.response.use(
      (response) => {
        // Extract rate limit info from headers if available
        const remaining = response.headers['x-ebay-c-ratelimit-remaining'];
        const limit = response.headers['x-ebay-c-ratelimit-limit'];

        // Debug logging: Log response details
        console.error('\n✅ [RESPONSE DEBUG]');
        console.error(`  Status: ${response.status} ${response.statusText}`);
        if (remaining && limit) {
          console.error(`  Rate Limit: ${remaining}/${limit} remaining`);
        }
        if (response.data) {
          const dataStr = JSON.stringify(response.data, null, 2);
          const preview = dataStr.length > 500 ? dataStr.substring(0, 500) + '...' : dataStr;
          console.error(`  Response Data: ${preview}`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const axiosError = error;
        const config = axiosError.config as AxiosConfigWithRetry | undefined;

        // Debug logging: Log error response details
        if (axiosError.response) {
          console.error('\n❌ [ERROR RESPONSE DEBUG]');
          console.error(`  Status: ${axiosError.response.status} ${axiosError.response.statusText}`);
          console.error(`  URL: ${config?.baseURL}${config?.url}`);
          if (axiosError.response.data) {
            console.error(`  Error Data: ${JSON.stringify(axiosError.response.data, null, 2)}`);
          }
        } else if (axiosError.request) {
          console.error('\n❌ [NO RESPONSE DEBUG]');
          console.error(`  Request was made but no response received`);
          console.error(`  URL: ${config?.baseURL}${config?.url}`);
        } else {
          console.error('\n❌ [REQUEST ERROR DEBUG]');
          console.error(`  Error: ${axiosError.message}`);
        }

        // Handle authentication errors (401 Unauthorized)
        if (axiosError.response?.status === 401) {
          const retryCount = config?.__authRetryCount || 0;

          // Only retry once to avoid infinite loops
          if (retryCount === 0 && config) {
            config.__authRetryCount = 1;

            console.error(
              'eBay API authentication error (401). Attempting to refresh user token...'
            );

            try {
              // Force token refresh by getting a new access token
              // The getAccessToken() method will automatically refresh if needed
              const newToken = await this.authClient.getAccessToken();

              // Update the request with the new token
              if (config?.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
              }

              console.error('Token refreshed successfully. Retrying request...');

              // Retry the request with the new token
              return await this.httpClient.request(config);
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);

              // If refresh fails, provide clear guidance
              const ebayError = axiosError.response?.data as EbayApiError;
              const originalError =
                ebayError.errors?.[0]?.longMessage ||
                ebayError.errors?.[0]?.message ||
                'Invalid access token';

              throw new Error(
                `${originalError}. ` +
                `Token refresh failed: ${refreshError instanceof Error ? refreshError.message : 'Unknown error'}. ` +
                `Please use the ebay_set_user_tokens_with_expiry tool to provide valid tokens.`
              );
            }
          }

          // If retry already attempted, provide helpful error message
          const ebayError = axiosError.response?.data as EbayApiError;
          const errorMessage =
            ebayError.errors?.[0]?.longMessage ||
            ebayError.errors?.[0]?.message ||
            'Invalid access token';

          throw new Error(
            `${errorMessage}. ` +
            `Automatic token refresh failed. Please use the ebay_set_user_tokens_with_expiry tool to provide valid tokens.`
          );
        }

        // Handle rate limit errors (429)
        if (axiosError.response?.status === 429) {
          const retryAfter = axiosError.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

          throw new Error(
            `eBay API rate limit exceeded. Retry after ${waitTime / 1000} seconds. ` +
            `Consider reducing request frequency or upgrading to user tokens for higher limits.`
          );
        }

        // Handle server errors with retry suggestion (500, 502, 503, 504)
        if (axiosError.response?.status && axiosError.response.status >= 500 && config) {
          const retryCount = config.__retryCount || 0;

          if (retryCount < 3) {
            config.__retryCount = retryCount + 1;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff

            console.error(
              `eBay API server error (${axiosError.response.status}). ` +
              `Retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`
            );

            await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 5000)));
            return await this.httpClient.request(config);
          }
        }

        // Handle eBay-specific errors
        if (axios.isAxiosError(axiosError) && axiosError.response?.data) {
          const ebayError = axiosError.response.data as EbayApiError;
          const errorMessage =
            ebayError.errors?.[0]?.longMessage ||
            ebayError.errors?.[0]?.message ||
            axiosError.message;
          throw new Error(`eBay API Error: ${errorMessage}`);
        }

        throw error;
      }
    );
  }

  /**
   * Validate that access token is available before making API request
   */
  private validateAccessToken(): void {
    if (!this.authClient.hasUserTokens()) {
      throw new Error(
        'Access token is missing. Please provide your access token and refresh token by calling ebay_set_user_tokens tool in order to perform API requests.'
      );
    }
  }

  /**
   * Make a GET request to eBay API
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    this.validateAccessToken();
    const response = await this.httpClient.get<T>(endpoint, { params, ...config });
    return response.data;
  }

  /**
   * Make a POST request to eBay API
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    this.validateAccessToken();
    const response = await this.httpClient.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a PUT request to eBay API
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    this.validateAccessToken();
    const response = await this.httpClient.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request to eBay API
   */
  async delete<T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    this.validateAccessToken();
    const response = await this.httpClient.delete<T>(endpoint, config);
    return response.data;
  }

  /**
   * Initialize the client (load user tokens from storage)
   */
  async initialize(): Promise<void> {
    await this.authClient.initialize();
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.authClient.isAuthenticated();
  }

  /**
   * Check if user tokens are available
   */
  hasUserTokens(): boolean {
    return this.authClient.hasUserTokens();
  }

  /**
   * Set user access and refresh tokens
   */
  async setUserTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.authClient.setUserTokens(
      accessToken,
      refreshToken,
    );
  }

  /**
   * Get token information for debugging
   */
  getTokenInfo() {
    return this.authClient.getTokenInfo();
  }

  /**
   * Get the OAuth client instance for advanced operations
   */
  getOAuthClient(): EbayOAuthClient {
    return this.authClient;
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats() {
    return this.rateLimitTracker.getStats();
  }

  /**
   * Get the config object (for accessing environment, etc.)
   */
  getConfig(): EbayConfig {
    return this.config;
  }

  /**
   * Manually refresh user access token using the refresh token
   * This is useful when you encounter "Invalid access token" errors
   * The token will be automatically saved to storage after refresh
   */
  async refreshUserToken(): Promise<void> {
    await this.authClient.refreshUserToken();
  }

  /**
   * Make a GET request with a full URL (for APIs that use different base URLs)
   * Used by Identity API which uses apiz subdomain
   */
  async getWithFullUrl<T = unknown>(fullUrl: string, params?: Record<string, unknown>): Promise<T> {
    this.validateAccessToken();

    // Check rate limit
    if (!this.rateLimitTracker.canMakeRequest()) {
      const stats = this.rateLimitTracker.getStats();
      throw new Error(
        `Rate limit exceeded: ${stats.current}/${stats.max} requests in ${stats.windowMs}ms window. Please wait before making more requests.`
      );
    }

    // Get auth token
    let token = await this.authClient.getAccessToken();

    // Record the request
    this.rateLimitTracker.recordRequest();

    try {
      // Make request with full URL
      const response = await axios.get<T>(fullUrl, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      // Handle 401 authentication errors with automatic token refresh
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('eBay API authentication error (401). Attempting to refresh user token...');

        try {
          // Refresh the token
          await this.authClient.refreshUserToken();

          // Get the new token
          token = await this.authClient.getAccessToken();

          console.error('Token refreshed successfully. Retrying request...');

          // Retry the request with the new token
          const response = await axios.get<T>(fullUrl, {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 30000,
          });

          return response.data;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);

          const ebayError = error.response?.data as EbayApiError;
          const originalError =
            ebayError.errors?.[0]?.longMessage ||
            ebayError.errors?.[0]?.message ||
            'Invalid access token';

          throw new Error(
            `${originalError}. ` +
            `Token refresh failed: ${refreshError instanceof Error ? refreshError.message : 'Unknown error'}. ` +
            `Please use the ebay_set_user_tokens_with_expiry tool to provide valid tokens.`
          );
        }
      }

      // Re-throw other errors
      throw error;
    }
  }
}
