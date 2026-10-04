import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { CharityApi } from '@/api/listing-metadata/charity.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = '/commerce/charity/v1';
const client = { get: vi.fn() };
// CharityApi only reaches client.get.
const api = new CharityApi(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('CharityApi getCharityOrg', () => {
  it('GETs the encoded charity with the marketplace header and an application token', async () => {
    const charity = { charityOrgId: 'C/1', name: 'Example Rescue', registrationId: '12-3456789' };
    client.get.mockResolvedValue(charity);

    const fetchedCharity = await Effect.runPromise(
      api.getCharityOrg({ charityOrgId: 'C/1', marketplaceId: 'EBAY_GB' }),
    );

    expect(fetchedCharity).toBe(charity);
    expect(client.get).toHaveBeenCalledWith(`${BASE}/charity_org/C%2F1`, undefined, {
      headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB' },
      tokenType: 'application',
    });
  });

  it('rejects a marketplace the Charity API does not serve', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getCharityOrg(invalidInput({ charityOrgId: '1', marketplaceId: 'EBAY_DE' }))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(client.get).not.toHaveBeenCalled();
  });
});

describe('CharityApi getCharityOrgs', () => {
  it('searches by keywords with paging under the spec wire names', async () => {
    const page = { charityOrgs: [{ charityOrgId: '1' }], total: 1, limit: 10, offset: 20 };
    client.get.mockResolvedValue(page);

    const charityPage = await Effect.runPromise(
      api.getCharityOrgs({ marketplaceId: 'EBAY_US', q: 'animal rescue', limit: 10, offset: 20 }),
    );

    expect(charityPage).toBe(page);
    expect(client.get).toHaveBeenCalledWith(
      `${BASE}/charity_org`,
      { q: 'animal rescue', limit: 10, offset: 20 },
      { headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' }, tokenType: 'application' },
    );
  });

  it('searches by registration IDs as registration_ids', async () => {
    client.get.mockResolvedValue({ charityOrgs: [] });

    await Effect.runPromise(
      api.getCharityOrgs({ marketplaceId: 'EBAY_US', registrationIds: '11-1111111,22-2222222' }),
    );

    expect(client.get.mock.calls[0]?.[1]).toEqual({ registration_ids: '11-1111111,22-2222222' });
  });

  it.each([
    ['neither', {}],
    ['both', { q: 'rescue', registrationIds: '11-1111111' }],
  ])('rejects %s of q and registrationIds before any request', async (_label, criteria) => {
    const error = await Effect.runPromise(
      Effect.flip(api.getCharityOrgs({ marketplaceId: 'EBAY_US', ...criteria })),
    );

    expect(error).toMatchObject({ _tag: 'EndpointInputError', parameter: 'q' });
    expect(client.get).not.toHaveBeenCalled();
  });

  it('rejects a limit above the documented maximum of 100', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getCharityOrgs({ marketplaceId: 'EBAY_US', q: 'rescue', limit: 101 })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(client.get).not.toHaveBeenCalled();
  });

  it('wraps eBay failures in a tagged EbayApiError', async () => {
    client.get.mockRejectedValue(new Error('165001 unsupported marketplace'));

    const error = await Effect.runPromise(
      Effect.flip(api.getCharityOrgs({ marketplaceId: 'EBAY_US', q: 'rescue' })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'GET',
      path: `${BASE}/charity_org`,
    });
  });
});
