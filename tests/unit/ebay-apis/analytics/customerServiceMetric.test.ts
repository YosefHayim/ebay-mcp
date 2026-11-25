import { beforeEach, expect, it, vi } from 'vitest';
import { Effect } from 'effect';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import type { AnalyticsApiHarness } from './testHarness.js';
import { createAnalyticsApiHarness, readEndpointInputError } from './testHarness.js';

let harness: AnalyticsApiHarness;

beforeEach(() => {
  harness = createAnalyticsApiHarness();
});

it('getCustomerServiceMetric gets customer service metrics with marketplace params', async () => {
  const mockResponse = {
    dimensionMetrics: [
      {
        name: 'TRANSACTION',
        value: '95.5',
      },
    ],
  };
  vi.mocked(harness.client.get).mockResolvedValue(mockResponse);

  const serviceMetric = await Effect.runPromise(
    harness.api.getCustomerServiceMetric({
      customerServiceMetricType: 'TRANSACTION',
      evaluationType: 'CURRENT',
      evaluationMarketplaceId: 'EBAY_US',
    }),
  );

  expect(serviceMetric).toEqual(mockResponse);
  expect(harness.client.get).toHaveBeenCalledWith(
    '/sell/analytics/v1/customer_service_metric/TRANSACTION/CURRENT',
    {
      evaluation_marketplace_id: 'EBAY_US',
    },
  );
});

it('getCustomerServiceMetric fails when customerServiceMetricType is missing', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getCustomerServiceMetric({
        customerServiceMetricType: invalidInput(''),
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: 'EBAY_US',
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'customerServiceMetricType',
  });
});

it('getCustomerServiceMetric fails when evaluationType is missing', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getCustomerServiceMetric({
        customerServiceMetricType: 'TRANSACTION',
        evaluationType: invalidInput(''),
        evaluationMarketplaceId: 'EBAY_US',
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'evaluationType',
  });
});

it('getCustomerServiceMetric fails when evaluationMarketplaceId is missing', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getCustomerServiceMetric({
        customerServiceMetricType: 'TRANSACTION',
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: invalidInput(''),
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'evaluationMarketplaceId',
  });
});

it('getCustomerServiceMetric wraps transport failures in EbayApiError', async () => {
  vi.mocked(harness.client.get).mockRejectedValue(new Error('Unauthorized'));

  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getCustomerServiceMetric({
        customerServiceMetricType: 'TRANSACTION',
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: 'EBAY_US',
      }),
    ),
  );

  expect(error._tag).toBe('EbayApiError');
});
