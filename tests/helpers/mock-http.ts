import nock from 'nock';

/**
 * Mock eBay OAuth token endpoint
 *
 * @param environment - eBay environment whose OAuth base URL is mocked.
 * @param responseData - Optional token response payload.
 * @param statusCode - HTTP status code returned by the mock.
 * @returns Nock scope for the mocked token endpoint.
 *
 * @example
 * ```ts
 * mockOAuthTokenEndpoint('sandbox', { access_token: 'token' });
 * ```
 */
export const mockOAuthTokenEndpoint = (
  environment: 'production' | 'sandbox' = 'sandbox',
  responseData?: object,
  statusCode = 200,
) => {
  const baseUrl =
    environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';

  const defaultResponse = {
    access_token: 'test_access_token',
    token_type: 'Bearer',
    expires_in: 7200,
    refresh_token: 'test_refresh_token',
    refresh_token_expires_in: 47_304_000,
  };

  return nock(baseUrl)
    .post('/identity/v1/oauth2/token')
    .reply(statusCode, responseData || defaultResponse);
};

/**
 * Mock eBay API endpoint
 *
 * @param path - API path to intercept.
 * @param method - HTTP method to intercept.
 * @param environment - eBay environment whose API base URL is mocked.
 * @param responseData - Optional response payload.
 * @param statusCode - HTTP status code returned by the mock.
 * @returns Nock scope for the mocked API endpoint.
 *
 * @example
 * ```ts
 * mockEbayApiEndpoint('/sell/inventory/v1/offer', 'post', 'sandbox', { offerId: '1' }, 201);
 * ```
 */
export const mockEbayApiEndpoint = (
  path: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  environment: 'production' | 'sandbox' = 'sandbox',
  responseData?: object,
  statusCode = 200,
) => {
  const baseUrl =
    environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';

  const nockInstance = nock(baseUrl);

  switch (method) {
    case 'get':
      return nockInstance.get(path).reply(statusCode, responseData || {});
    case 'post':
      return nockInstance.post(path).reply(statusCode, responseData || {});
    case 'put':
      return nockInstance.put(path).reply(statusCode, responseData || {});
    case 'delete':
      return nockInstance.delete(path).reply(statusCode, responseData || {});
  }
};

/**
 * Mock eBay API error response
 *
 * @param path - API path to intercept.
 * @param method - HTTP method to intercept.
 * @param environment - eBay environment whose API base URL is mocked.
 * @param errorMessage - eBay error message to place in the response body.
 * @param statusCode - HTTP status code returned by the mock.
 * @returns Nock scope for the mocked API error endpoint.
 *
 * @example
 * ```ts
 * mockEbayApiError('/sell/inventory/v1/offer', 'post', 'sandbox', 'Invalid request', 400);
 * ```
 */
export const mockEbayApiError = (
  path: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  environment: 'production' | 'sandbox' = 'sandbox',
  errorMessage = 'API Error',
  statusCode = 400,
) => {
  const errorResponse = {
    errors: [
      {
        errorId: 1001,
        domain: 'API_INVENTORY',
        category: 'REQUEST',
        message: errorMessage,
        longMessage: `Detailed error: ${errorMessage}`,
      },
    ],
  };

  return mockEbayApiEndpoint(path, method, environment, errorResponse, statusCode);
};

/**
 * Clean up all HTTP mocks
 *
 * @returns Nothing; clears all registered Nock interceptors.
 *
 * @example
 * ```ts
 * cleanupMocks();
 * ```
 */
export const cleanupMocks = (): void => {
  nock.cleanAll();
};

/**
 * Enable/disable HTTP mocks
 *
 * @returns Nothing; activates Nock and blocks real network requests.
 *
 * @example
 * ```ts
 * enableMocks();
 * ```
 */
export const enableMocks = (): void => {
  if (!nock.isActive()) {
    nock.activate();
  }
  // Disable real HTTP requests
  nock.disableNetConnect();
};

/**
 * Disable HTTP mocking and re-enable real network connections.
 *
 * @returns Nothing; restores real network behavior.
 *
 * @example
 * ```ts
 * disableMocks();
 * ```
 */
export const disableMocks = (): void => {
  nock.restore();
  nock.enableNetConnect();
};
