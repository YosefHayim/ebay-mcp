import nock from 'nock';

/**
 * Mock eBay OAuth token endpoint
 */
export function mockOAuthTokenEndpoint(
  environment: 'production' | 'sandbox' = 'sandbox',
  responseData?: object,
  statusCode = 200
) {
  const baseUrl =
    environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';

  const defaultResponse = {
    access_token: 'test_access_token',
    token_type: 'Bearer',
    expires_in: 7200,
    refresh_token: 'test_refresh_token',
    refresh_token_expires_in: 47304000,
  };

  return nock(baseUrl)
    .post('/identity/v1/oauth2/token')
    .reply(statusCode, responseData || defaultResponse);
}

/**
 * Mock eBay API endpoint
 */
export function mockEbayApiEndpoint(
  path: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  environment: 'production' | 'sandbox' = 'sandbox',
  responseData?: object,
  statusCode = 200
) {
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
}

/**
 * Mock eBay API error response
 */
export function mockEbayApiError(
  path: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  environment: 'production' | 'sandbox' = 'sandbox',
  errorMessage = 'API Error',
  statusCode = 400
) {
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
}

/**
 * Clean up all HTTP mocks
 */
export function cleanupMocks() {
  nock.cleanAll();
}

/**
 * Enable/disable HTTP mocks
 */
export function enableMocks() {
  if (!nock.isActive()) {
    nock.activate();
  }
  // Disable real HTTP requests
  nock.disableNetConnect();
}

export function disableMocks() {
  nock.restore();
  nock.enableNetConnect();
}
