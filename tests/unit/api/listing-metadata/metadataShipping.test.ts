import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { MetadataApi } from '@/api/listing-metadata/metadata.js';
import { MarketplaceId } from '@/types/ebayEnums.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const SHIPPING = '/sell/metadata/v1/shipping/marketplace';
const client = { get: vi.fn() };
// MetadataApi only reaches client.get for the shipping:marketplace methods.
const api = new MetadataApi(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('MetadataApi shipping:marketplace methods', () => {
  it.each([
    ['getExcludeShippingLocations', 'get_exclude_shipping_locations'],
    ['getHandlingTimes', 'get_handling_times'],
    ['getShippingCarriers', 'get_shipping_carriers'],
    ['getShippingLocations', 'get_shipping_locations'],
    ['getShippingServices', 'get_shipping_services'],
  ] as const)('%s GETs the marketplace path and returns eBay data unchanged', async (method, resource) => {
    const response = { [resource]: [{ description: 'eBay value' }] };
    client.get.mockResolvedValue(response);

    const result = await Effect.runPromise(api[method]({ marketplaceId: MarketplaceId.EBAY_US }));

    expect(result).toBe(response);
    expect(client.get).toHaveBeenCalledWith(`${SHIPPING}/EBAY_US/${resource}`);
  });

  it('sends Accept-Language only when the caller selects a localized marketplace', async () => {
    client.get.mockResolvedValue({ shippingServices: [] });

    await Effect.runPromise(
      api.getShippingServices({ marketplaceId: MarketplaceId.EBAY_CA, acceptLanguage: 'fr-CA' }),
    );

    expect(client.get).toHaveBeenCalledWith(
      `${SHIPPING}/EBAY_CA/get_shipping_services`,
      undefined,
      { headers: { 'Accept-Language': 'fr-CA' } },
    );
  });

  it('rejects an unknown marketplace before any request', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getShippingCarriers(invalidInput({ marketplaceId: 'EBAY_XX' }))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(client.get).not.toHaveBeenCalled();
  });

  it('wraps transport failures in a tagged EbayApiError with the request path', async () => {
    client.get.mockRejectedValue(new Error('eBay 500'));

    const error = await Effect.runPromise(
      Effect.flip(api.getHandlingTimes({ marketplaceId: MarketplaceId.EBAY_GB })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'GET',
      path: `${SHIPPING}/EBAY_GB/get_handling_times`,
    });
  });
});
