import { vi } from 'vitest';
import { AnalyticsApi } from '@/api/analytics-and-report/analytics.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';

/** Analytics API test harness with the API instance and mocked eBay client. */
export interface AnalyticsApiHarness {
  /** Analytics API under test. */
  readonly api: AnalyticsApi;
  /** Mocked eBay client used to assert request path and params. */
  readonly client: EbayApiClient;
}

/**
 * Creates an Analytics API instance with a mocked eBay client.
 *
 * @returns A fresh Analytics API test harness.
 *
 * @example
 * ```ts
 * const { api, client } = createAnalyticsApiHarness();
 * ```
 */
export const createAnalyticsApiHarness = (): AnalyticsApiHarness => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as EbayApiClient;

  return {
    api: new AnalyticsApi(client),
    client,
  };
};

/** Minimal validation error snapshot used by Analytics API tests. */
export interface EndpointInputErrorSnapshot {
  /** Tagged error identifier returned by migrated endpoint validation. */
  readonly _tag: string;
  /** Endpoint input parameter that failed validation. */
  readonly parameter?: string;
}

/**
 * Reads the validation details needed by Analytics endpoint tests.
 *
 * @param error - Effect failure returned by `Effect.flip`.
 * @returns Minimal tagged-error details for test assertions.
 *
 * @example
 * ```ts
 * expect(readEndpointInputError(error)).toEqual({
 *   _tag: 'EndpointInputError',
 *   parameter: 'dimension',
 * });
 * ```
 */
export const readEndpointInputError = (
  error: EndpointInputErrorSnapshot,
): EndpointInputErrorSnapshot => ({
  _tag: error._tag,
  parameter: error.parameter,
});
