import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { StoresApi } from '@/api/listing-management/stores.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORE = '/sell/stores/v1/store';
const taskLocation = (taskId: string) => `https://api.ebay.com${STORE}/tasks/${taskId}`;
/** Header-only eBay answer to a category change, pointing at its store task. */
const taskAccepted = (status: number, taskId: string) => ({
  status,
  data: undefined,
  headers: { location: taskLocation(taskId) },
});
const client = {
  get: vi.fn(),
  postForResponse: vi.fn(),
  putForResponse: vi.fn(),
  deleteForResponse: vi.fn(),
};
// The Stores API only uses these mocked client methods.
const stores = new StoresApi(client as unknown as EbayApiClient);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('StoresApi reads', () => {
  it('gets the store details from the store root', async () => {
    const store = { name: 'Camera Corner', urlPath: 'cameracorner' };
    client.get.mockResolvedValue(store);

    expect(await Effect.runPromise(stores.getStore({}))).toBe(store);
    expect(client.get).toHaveBeenCalledWith(STORE);
  });

  it('gets the store category hierarchy', async () => {
    const categories = {
      storeCategories: [
        { categoryId: '1', categoryName: 'Other', level: 1, order: 1, childrenCategories: [] },
      ],
    };
    client.get.mockResolvedValue(categories);

    expect(await Effect.runPromise(stores.getStoreCategories())).toBe(categories);
    expect(client.get).toHaveBeenCalledWith(`${STORE}/categories`);
  });

  it('gets one store task with an encoded task ID', async () => {
    const task = { task: { id: 'A/B 1', status: 'COMPLETED', type: 'ADD_CATEGORY' } };
    client.get.mockResolvedValue(task);

    expect(await Effect.runPromise(stores.getStoreTask({ taskId: 'A/B 1' }))).toBe(task);
    expect(client.get).toHaveBeenCalledWith(`${STORE}/tasks/A%2FB%201`);
  });

  it('gets all store tasks', async () => {
    const tasks = { task: [{ id: 'T-1', status: 'IN_PROGRESS' }] };
    client.get.mockResolvedValue(tasks);

    expect(await Effect.runPromise(stores.getStoreTasks({}))).toBe(tasks);
    expect(client.get).toHaveBeenCalledWith(`${STORE}/tasks`);
  });

  it('rejects a blank task ID before calling eBay', async () => {
    const error = await Effect.runPromise(Effect.flip(stores.getStoreTask({ taskId: '' })));

    expect(error._tag).toBe('EndpointInputError');
    expect(error).toMatchObject({ parameter: 'taskId' });
    expect(client.get).not.toHaveBeenCalled();
  });

  it('wraps a failed read in a typed EbayApiError', async () => {
    client.get.mockRejectedValue(new Error('User must have an active store subscription.'));

    const error = await Effect.runPromise(Effect.flip(stores.getStore({})));

    expect(error).toMatchObject({ _tag: 'EbayApiError', method: 'GET', path: STORE });
  });
});

describe('StoresApi asynchronous category changes', () => {
  it('adds a category with the request body and returns the task from Location', async () => {
    const location = taskLocation('TASK-ADD');
    client.postForResponse.mockResolvedValue(taskAccepted(202, 'TASK-ADD'));
    const newCategory = {
      categoryName: 'Vintage Cameras',
      destinationParentCategoryId: '-999',
      listingDestinationCategoryId: '42',
    };

    expect(await Effect.runPromise(stores.addStoreCategory(newCategory))).toEqual({
      taskId: 'TASK-ADD',
      location,
    });
    expect(client.postForResponse).toHaveBeenCalledWith(`${STORE}/categories`, newCategory);
  });

  it('adds a category with only its name', async () => {
    client.postForResponse.mockResolvedValue(taskAccepted(202, 'TASK-NAME'));

    await Effect.runPromise(stores.addStoreCategory({ categoryName: 'Lenses' }));

    const [, sentCategory] = client.postForResponse.mock.calls[0];
    expect(JSON.parse(JSON.stringify(sentCategory))).toEqual({ categoryName: 'Lenses' });
  });

  it('renames a category with the ID in the path and the name in the body', async () => {
    const location = taskLocation('TASK-RENAME');
    client.putForResponse.mockResolvedValue(taskAccepted(204, 'TASK-RENAME'));

    expect(
      await Effect.runPromise(
        stores.renameStoreCategory({ categoryId: '12/3', categoryName: 'Film Cameras' }),
      ),
    ).toEqual({ taskId: 'TASK-RENAME', location });
    expect(client.putForResponse).toHaveBeenCalledWith(`${STORE}/categories/12%2F3`, {
      categoryName: 'Film Cameras',
    });
  });

  it('deletes a category through DELETE without a body when no destination is given', async () => {
    const location = taskLocation('TASK-DELETE');
    client.deleteForResponse.mockResolvedValue(taskAccepted(202, 'TASK-DELETE'));

    expect(await Effect.runPromise(stores.deleteStoreCategory({ categoryId: '123' }))).toEqual({
      taskId: 'TASK-DELETE',
      location,
    });
    expect(client.deleteForResponse).toHaveBeenCalledWith(
      `${STORE}/categories/123`,
      undefined,
      undefined,
    );
  });

  it('sends the listing destination as the DELETE body when one is given', async () => {
    client.deleteForResponse.mockResolvedValue(taskAccepted(202, 'TASK-DELETE'));

    await Effect.runPromise(
      stores.deleteStoreCategory({ categoryId: '123', listingDestinationCategoryId: '456' }),
    );

    expect(client.deleteForResponse).toHaveBeenCalledWith(`${STORE}/categories/123`, undefined, {
      listingDestinationCategoryId: '456',
    });
  });

  it('moves a category through the move_category action', async () => {
    const location = taskLocation('TASK-MOVE');
    client.postForResponse.mockResolvedValue(taskAccepted(202, 'TASK-MOVE'));
    const categoryMove = {
      categoryId: '123',
      destinationParentCategoryId: '456',
      listingDestinationCategoryId: '789',
    };

    expect(await Effect.runPromise(stores.moveStoreCategory(categoryMove))).toEqual({
      taskId: 'TASK-MOVE',
      location,
    });
    expect(client.postForResponse).toHaveBeenCalledWith(
      `${STORE}/categories/move_category`,
      categoryMove,
    );
  });
});

describe('StoresApi category change failures', () => {
  it.each([
    ['categoryName', () => stores.addStoreCategory({ categoryName: '' })],
    ['categoryId', () => stores.renameStoreCategory({ categoryId: '', categoryName: 'Lenses' })],
    ['categoryName', () => stores.renameStoreCategory({ categoryId: '1', categoryName: '' })],
    ['categoryId', () => stores.deleteStoreCategory({ categoryId: '' })],
    [
      'destinationParentCategoryId',
      () => stores.moveStoreCategory({ categoryId: '1', destinationParentCategoryId: '' }),
    ],
  ])('rejects a missing %s before sending the change', async (parameter, change) => {
    const error = await Effect.runPromise(Effect.flip(change()));

    expect(error).toMatchObject({ _tag: 'EndpointInputError', parameter });
    expect(client.postForResponse).not.toHaveBeenCalled();
    expect(client.putForResponse).not.toHaveBeenCalled();
    expect(client.deleteForResponse).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    'not-a-url',
    `http://api.ebay.com${STORE}/tasks/T-1`,
    `https://api.ebay.com${STORE}/tasks/`,
    `https://api.ebay.com${STORE}/categories/T-1`,
  ])('fails with the request method and path when Location is %s', async (location) => {
    client.putForResponse.mockResolvedValue({
      status: 204,
      data: undefined,
      headers: { location },
    });

    const error = await Effect.runPromise(
      Effect.flip(stores.renameStoreCategory({ categoryId: '123', categoryName: 'Lenses' })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'PUT',
      path: `${STORE}/categories/123`,
    });
  });

  it('wraps a rejected category change in a typed EbayApiError', async () => {
    client.deleteForResponse.mockRejectedValue(new Error('Category id 123 does not exist'));

    const error = await Effect.runPromise(
      Effect.flip(stores.deleteStoreCategory({ categoryId: '123' })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      method: 'DELETE',
      path: `${STORE}/categories/123`,
    });
  });
});
