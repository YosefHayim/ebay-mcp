import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  BATCH_GET_OFFERS_CONCURRENCY,
  MAX_BATCH_GET_OFFERS_SKUS,
  createInventoryOffersMethods,
} from '@/api/listing-management/offers.js';
import type { EbayApiError, EndpointInputError } from '@/api/shared/request.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type GetOffersFailure = EbayApiError | EndpointInputError;

const expectSkuInputError = async (
  program: Effect.Effect<unknown, GetOffersFailure>,
): Promise<void> => {
  const error = await Effect.runPromise(Effect.flip(program));

  expect(error).toMatchObject({ _tag: 'EndpointInputError', parameter: 'sku' });
};

const clientWithGet = (get: ReturnType<typeof vi.fn>): EbayApiClient =>
  ({ get }) as unknown as EbayApiClient;

describe('createInventoryOffersMethods getOffers', () => {
  let client: EbayApiClient;
  let getOffers: ReturnType<typeof createInventoryOffersMethods>['getOffers'];

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;
    ({ getOffers } = createInventoryOffersMethods(client));
  });

  it('sends the required SKU with compatible optional query parameters', async () => {
    const response = { offers: [] };
    vi.mocked(client.get).mockResolvedValue(response);

    const result = await Effect.runPromise(
      getOffers({
        sku: 'SKU-1',
        format: 'FIXED_PRICE',
        marketplaceId: 'EBAY_US',
        limit: 10,
        offset: 5,
      }),
    );

    expect(client.get).toHaveBeenCalledWith('/sell/inventory/v1/offer', {
      format: 'FIXED_PRICE',
      limit: '10',
      marketplace_id: 'EBAY_US',
      offset: '5',
      sku: 'SKU-1',
    });
    expect(result).toBe(response);
  });

  it('rejects omitted and empty SKUs before calling eBay', async () => {
    await expectSkuInputError(getOffers(invalidInput({})));
    await expectSkuInputError(getOffers({ sku: '' }));

    expect(client.get).not.toHaveBeenCalled();
  });
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one focused API-method test suite
describe('getOffersBySkus', () => {
  it('deduplicates exact SKUs and preserves first-occurrence result order', async () => {
    const get = vi.fn(async (_path: string, params: { sku: string }) => ({
      offers: [{ sku: params.sku }],
    }));
    const api = createInventoryOffersMethods(clientWithGet(get));

    const result = await Effect.runPromise(
      api.getOffersBySkus({ skus: ['SKU-2', 'SKU-1', 'SKU-2'] }),
    );

    expect(result).toMatchObject({
      requestedSkuCount: 3,
      uniqueSkuCount: 2,
      successCount: 2,
      failureCount: 0,
    });
    expect(result.results.map(({ sku }) => sku)).toEqual(['SKU-2', 'SKU-1']);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('keeps a failed request beside its SKU without discarding successes', async () => {
    const get = vi.fn((_path: string, params: { sku: string }) => {
      if (params.sku === 'BAD') {
        return Promise.reject(new Error('not found'));
      }
      return Promise.resolve({ offers: [{ sku: params.sku }] });
    });
    const api = createInventoryOffersMethods(clientWithGet(get));

    const result = await Effect.runPromise(api.getOffersBySkus({ skus: ['GOOD', 'BAD'] }));

    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(1);
    expect(result.results[1]).toMatchObject({
      sku: 'BAD',
      status: 'failure',
      error: { type: 'EbayApiError' },
    });
  });

  it('rejects invalid lists before making a request', async () => {
    const get = vi.fn();
    const api = createInventoryOffersMethods(clientWithGet(get));
    const inputs = [
      { skus: [] },
      { skus: Array.from({ length: MAX_BATCH_GET_OFFERS_SKUS + 1 }, (_, index) => `S-${index}`) },
      { skus: [''] },
      { skus: ['   '] },
      { skus: ['x'.repeat(51)] },
    ];

    const errors = await Promise.all(
      inputs.map((input) => Effect.runPromise(Effect.flip(api.getOffersBySkus(input)))),
    );
    for (const error of errors) {
      expect(error).toMatchObject({ _tag: 'EndpointInputError', parameter: 'skus' });
    }
    expect(get).not.toHaveBeenCalled();
  });

  it('never exceeds the fixed request concurrency cap', async () => {
    let active = 0;
    let maximumActive = 0;
    const get = vi.fn(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return { offers: [] };
    });
    const api = createInventoryOffersMethods(clientWithGet(get));

    const result = await Effect.runPromise(
      api.getOffersBySkus({ skus: Array.from({ length: 8 }, (_, index) => `SKU-${index}`) }),
    );

    expect(result.successCount).toBe(8);
    expect(maximumActive).toBe(BATCH_GET_OFFERS_CONCURRENCY);
  });
});
