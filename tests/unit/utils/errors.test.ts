import { describe, expect, it } from 'vitest';
import { EbayClientRequestError } from '@/api/clientRequestError.js';
import { TradingApiFailure } from '@/api/clientTradingError.js';
import { EbayApiError } from '@/api/shared/request.js';
import { getEbayErrorDetails, getErrorMessage } from '@/utils/errors.js';
import { Effect } from 'effect';

describe('getErrorMessage', () => {
  it('returns the message of a real Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the fallback for non-Error values', () => {
    expect(getErrorMessage('boom')).toBe('Unknown error');
    expect(getErrorMessage({ message: 'ignored' })).toBe('Unknown error');
    expect(getErrorMessage(undefined, 'Request failed')).toBe('Request failed');
  });
});

describe('getEbayErrorDetails', () => {
  it('returns the fallback message for a bare non-object value', () => {
    expect(getEbayErrorDetails('kaboom')).toEqual({ message: 'Unknown error' });
  });

  it('returns a plain Error message with no status or errors', () => {
    expect(getEbayErrorDetails(new Error('network down'))).toEqual({ message: 'network down' });
  });

  it('surfaces the eBay REST errors array, status, and longMessage from a nested cause', () => {
    const restCause = {
      status: 429,
      data: {
        errors: [
          {
            errorId: 12_345,
            message: 'Too many requests',
            longMessage: 'You have exceeded the request rate limit for this resource.',
            parameters: [{ name: 'resource', value: 'browse' }],
          },
        ],
      },
    };
    const apiError = new EbayApiError({
      method: 'GET',
      path: '/buy/browse/v1/x',
      cause: restCause,
    });

    const details = getEbayErrorDetails(apiError);

    expect(details.status).toBe(429);
    expect(details.message).toBe('You have exceeded the request rate limit for this resource.');
    expect(details.errors).toBe(restCause.data.errors);
  });

  it('unwraps an Effect FiberFailure to recover the underlying tagged error detail', async () => {
    const restCause = {
      status: 400,
      data: {
        errors: [{ errorId: 25_709, longMessage: 'Invalid value for header Accept-Language' }],
      },
    };
    const apiError = new EbayApiError({
      method: 'GET',
      path: '/sell/inventory/v1/x',
      cause: restCause,
    });

    // Reproduce the real boundary: every tool handler ends in Effect.runPromise,
    // which rejects with an opaque FiberFailure wrapping the tagged error.
    let caught: unknown;
    try {
      await Effect.runPromise(Effect.fail(apiError));
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeDefined();
    const details = getEbayErrorDetails(caught);

    expect(details.status).toBe(400);
    expect(details.message).toBe('Invalid value for header Accept-Language');
    expect(details.errors).toEqual(restCause.data.errors);
  });

  it('preserves a guidance-kind remediation message instead of a deeper raw eBay message', () => {
    const restCause = {
      status: 429,
      data: { errors: [{ errorId: 1, longMessage: 'raw eBay rate limit text' }] },
    };
    const guidance = new EbayClientRequestError({
      kind: 'remoteRateLimit',
      method: 'GET',
      url: 'https://api.ebay.com/x',
      message: 'eBay rate limit reached; retry after 12 seconds',
      status: 429,
      cause: restCause,
    });

    const details = getEbayErrorDetails(guidance);

    // The composed retry hint is kept; the raw eBay detail must not clobber it,
    // but the structured errors array is still surfaced.
    expect(details.message).toBe('eBay rate limit reached; retry after 12 seconds');
    expect(details.status).toBe(429);
    expect(details.errors).toBe(restCause.data.errors);
  });

  it('lets a deeper eBay message refine a generic (non-guidance) kind message', () => {
    const restCause = {
      status: 400,
      data: { errors: [{ errorId: 2004, longMessage: 'Invalid request payload' }] },
    };
    const generic = new EbayClientRequestError({
      kind: 'httpStatus',
      method: 'POST',
      url: 'https://api.ebay.com/x',
      message: 'Request failed with status 400',
      status: 400,
      cause: restCause,
    });

    const details = getEbayErrorDetails(generic);

    expect(details.message).toBe('Invalid request payload');
    expect(details.status).toBe(400);
  });

  it('surfaces a Trading (XML) error array carried on the tagged-error cause', () => {
    const errorsArray = [
      {
        ShortMessage: 'Invalid item ID',
        LongMessage: 'The item ID 99999 is invalid.',
        ErrorCode: '291',
        ErrorParameters: { ParamID: '0', Value: '99999' },
      },
    ];
    const tradingFailure = new TradingApiFailure({
      callName: 'GetItem',
      path: 'https://api.ebay.com/ws/api.dll',
      message: 'Trading API GetItem Invalid item ID',
      cause: errorsArray,
    });
    const apiError = new EbayApiError({
      method: 'POST',
      path: 'https://api.ebay.com/ws/api.dll',
      cause: tradingFailure,
    });

    const details = getEbayErrorDetails(apiError);

    expect(details.message).toBe('Trading API GetItem Invalid item ID');
    expect(details.errors).toBe(errorsArray);
    // Trading XML failures carry no HTTP status on the tagged error.
    expect(details.status).toBeUndefined();
  });

  it('terminates on a self-referential cause chain without infinite looping', () => {
    const cyclic: Record<string, unknown> = { message: 'loops forever' };
    cyclic.cause = cyclic;

    const details = getEbayErrorDetails(cyclic);

    expect(details.message).toBe('loops forever');
    expect(details.errors).toBeUndefined();
  });
});
