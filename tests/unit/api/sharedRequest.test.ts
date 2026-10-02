import { describe, expect, it, vi } from 'vitest';
import { Effect } from 'effect';
import {
  buildEndpointParams,
  EbayApiError,
  marketplaceHeader,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestGetEffect,
  requestPatchEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type { EbayApiClient } from '@/api/client.js';

describe('shared API request helpers', () => {
  it('builds endpoint-owned query params and omits empty values', () => {
    expect(
      buildEndpointParams({
        policyTypes: { wireName: 'policy_types', value: 'TAKE_BACK' },
        missing: { wireName: 'missing', value: undefined },
        empty: { wireName: 'empty', value: '' },
      }),
    ).toEqual({ policy_types: 'TAKE_BACK' });

    expect(
      buildEndpointParams({
        missing: { wireName: 'missing', value: undefined },
        empty: { wireName: 'empty', value: '' },
      }),
    ).toBeUndefined();
  });

  it('validates required endpoint values as typed Effects', async () => {
    const stringError = await Effect.runPromise(Effect.flip(requireStringEffect('', 'sku')));
    const objectError = await Effect.runPromise(Effect.flip(requireObjectEffect(null, 'body')));

    expect(stringError).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'sku',
    });
    expect(objectError).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'body',
    });
  });

  it('validates optional query values as typed Effects', async () => {
    await expect(Effect.runPromise(optionalStringEffect(undefined, 'filter'))).resolves.toBe(
      undefined,
    );
    await expect(Effect.runPromise(optionalPositiveNumberEffect(50, 'limit'))).resolves.toBe(50);
    await expect(Effect.runPromise(optionalNonNegativeNumberEffect(0, 'offset'))).resolves.toBe(0);

    const stringError = await Effect.runPromise(Effect.flip(optionalStringEffect(1, 'filter')));
    const limitError = await Effect.runPromise(
      Effect.flip(optionalPositiveNumberEffect(0, 'limit')),
    );
    const offsetError = await Effect.runPromise(
      Effect.flip(optionalNonNegativeNumberEffect(-1, 'offset')),
    );

    expect(stringError).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'filter',
    });
    expect(limitError).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'limit',
    });
    expect(offsetError).toMatchObject({
      _tag: 'EndpointInputError',
      parameter: 'offset',
    });
  });

  it('builds a per-call marketplace header config', () => {
    expect(marketplaceHeader('EBAY_GB')).toEqual({
      headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB' },
    });
  });

  it('runs GET requests through Effect with typed eBay API failures', async () => {
    const client = {
      get: vi.fn().mockRejectedValue(new Error('network down')),
    } as unknown as EbayApiClient;

    const failure = await Effect.runPromiseExit(
      requestGetEffect(client, '/sell/account/v1/custom_policy', { policy_types: 'TAKE_BACK' }),
    );

    expect(client.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy', {
      policy_types: 'TAKE_BACK',
    });
    expect(failure._tag).toBe('Failure');
    if (failure._tag === 'Failure') {
      const error = failure.cause._tag === 'Fail' ? failure.cause.error : undefined;
      expect(error).toBeInstanceOf(EbayApiError);
      expect(error).toMatchObject({
        _tag: 'EbayApiError',
        method: 'GET',
        path: '/sell/account/v1/custom_policy',
      });
      expect(error?.message).toBe('eBay GET /sell/account/v1/custom_policy failed: network down');
    }
  });

  it('runs PATCH requests through Effect with the body, config, and typed failures', async () => {
    const client = {
      patch: vi.fn().mockRejectedValue(new Error('conflict')),
    } as unknown as EbayApiClient;
    const config = { headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } };

    const error = await Effect.runPromise(
      Effect.flip(requestPatchEffect(client, '/sell/account/v2/user_preferences', {}, config)),
    );

    expect(client.patch).toHaveBeenCalledWith('/sell/account/v2/user_preferences', {}, config);
    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'PATCH',
      path: '/sell/account/v2/user_preferences',
    });
  });

  it('builds EbayApiError.message from method, path, and cause', () => {
    const fromError = new EbayApiError({
      method: 'POST',
      path: '/sell/inventory/v1/offer',
      cause: new Error('rate limited'),
    });
    expect(fromError.message).toBe('eBay POST /sell/inventory/v1/offer failed: rate limited');

    const fromString = new EbayApiError({
      method: 'DELETE',
      path: '/sell/inventory/v1/offer/1',
      cause: 'gone',
    });
    expect(fromString.message).toBe('eBay DELETE /sell/inventory/v1/offer/1 failed: gone');
  });
});
