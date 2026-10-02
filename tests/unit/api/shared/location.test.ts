import { locatedResourceId } from '@/api/shared/location.js';
import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';

describe('locatedResourceId', () => {
  it('reads the decoded ID from a Location under the expected collection', async () => {
    const location = 'https://api.ebay.com/sell/feed/v1/order_task/task-1%2B2';

    const resource = await Effect.runPromise(
      locatedResourceId(location, '/sell/feed/v1/order_task'),
    );

    expect(resource).toEqual({ location, id: 'task-1+2' });
  });

  it.each([
    [undefined],
    ['not a url'],
    ['https://api.ebay.com/sell/feed/v1/order_task/task-%'],
    ['http://api.ebay.com/sell/feed/v1/order_task/1'],
    ['https://api.ebay.com/sell/feed/v1/schedule/1'],
    ['https://api.ebay.com/sell/feed/v1/order_task/'],
    ['https://api.ebay.com/sell/feed/v1/order_task/1/extra'],
  ])('fails with a tagged EbayApiError for %s', async (location) => {
    const error = await Effect.runPromise(
      Effect.flip(locatedResourceId(location, '/sell/feed/v1/order_task')),
    );

    expect(error).toMatchObject({ _tag: 'EbayApiError', path: '/sell/feed/v1/order_task' });
  });
});
