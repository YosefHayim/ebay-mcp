import { beforeEach, expect, it, vi } from 'vitest';
import { Effect } from 'effect';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import type { AnalyticsApiHarness } from './testHarness.js';
import { createAnalyticsApiHarness, readEndpointInputError } from './testHarness.js';

let harness: AnalyticsApiHarness;

beforeEach(() => {
  harness = createAnalyticsApiHarness();
});

it('getTrafficReport gets traffic report with required params', async () => {
  const mockResponse = {
    reports: [
      {
        listingId: '123',
        dimension: 'LISTING',
        metrics: { CLICK_THROUGH_RATE: '5.2', IMPRESSION: '1000' },
      },
    ],
  };
  vi.mocked(harness.client.get).mockResolvedValue(mockResponse);

  const trafficReport = await Effect.runPromise(
    harness.api.getTrafficReport({
      dimension: 'LISTING',
      filter: 'listingId:123',
      metric: 'CLICK_THROUGH_RATE,IMPRESSION',
    }),
  );

  expect(trafficReport).toEqual(mockResponse);
  expect(harness.client.get).toHaveBeenCalledWith('/sell/analytics/v1/traffic_report', {
    dimension: 'LISTING',
    filter: 'listingId:123',
    metric: 'CLICK_THROUGH_RATE,IMPRESSION',
  });
});

it('getTrafficReport fails with a tagged error when dimension is missing', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getTrafficReport({
        dimension: invalidInput(''),
        filter: 'filter',
        metric: 'metric',
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'dimension',
  });
});

it('getTrafficReport fails with a tagged error when filter is missing', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getTrafficReport({
        dimension: 'LISTING',
        filter: invalidInput(''),
        metric: 'metric',
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'filter',
  });
});

it('getTrafficReport fails with a tagged error when metric is missing', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getTrafficReport({
        dimension: 'LISTING',
        filter: 'filter',
        metric: invalidInput(''),
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'metric',
  });
});

it('getTrafficReport includes optional sort parameter', async () => {
  const mockResponse = { reports: [] };
  vi.mocked(harness.client.get).mockResolvedValue(mockResponse);

  await Effect.runPromise(
    harness.api.getTrafficReport({
      dimension: 'DAY',
      filter: 'listingId:123',
      metric: 'IMPRESSION',
      sort: 'IMPRESSION',
    }),
  );

  expect(harness.client.get).toHaveBeenCalledWith('/sell/analytics/v1/traffic_report', {
    dimension: 'DAY',
    filter: 'listingId:123',
    metric: 'IMPRESSION',
    sort: 'IMPRESSION',
  });
});

it('getTrafficReport fails with a tagged error when sort is not a string', async () => {
  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getTrafficReport({
        dimension: 'LISTING',
        filter: 'filter',
        metric: 'metric',
        sort: invalidInput(123),
      }),
    ),
  );

  expect(readEndpointInputError(error)).toEqual({
    _tag: 'EndpointInputError',
    parameter: 'sort',
  });
});

it('getTrafficReport wraps transport failures in EbayApiError', async () => {
  vi.mocked(harness.client.get).mockRejectedValue(new Error('Service Unavailable'));

  const error = await Effect.runPromise(
    Effect.flip(
      harness.api.getTrafficReport({
        dimension: 'LISTING',
        filter: 'filter',
        metric: 'metric',
      }),
    ),
  );

  expect(error._tag).toBe('EbayApiError');
});
