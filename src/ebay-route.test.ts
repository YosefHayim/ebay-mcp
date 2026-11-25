import { describe, expect, test } from 'vitest';

import { ebayRoutes } from './ebay-routes.js';
import { fillRoutePath, type EbayRoute } from './ebay-route.js';

const listItems: EbayRoute = {
  toolName: 'ebay_get_inventory_items',
  description: 'List inventory items.',
  method: 'GET',
  host: 'api',
  path: '/sell/inventory/v1/inventory_item',
  tokenKind: 'user',
  fields: [
    {
      name: 'limit',
      kind: 'string',
      place: 'query',
      required: false,
      description: '',
    },
    {
      name: 'offset',
      kind: 'string',
      place: 'query',
      required: false,
      description: '',
    },
  ],
  sendsDocument: false,
  documentRequired: false,
  contentType: null,
};

const getItem: EbayRoute = {
  toolName: 'ebay_get_inventory_item',
  description: 'Get one inventory item.',
  method: 'GET',
  host: 'api',
  path: '/sell/inventory/v1/inventory_item/{sku}',
  tokenKind: 'user',
  fields: [
    {
      name: 'sku',
      kind: 'string',
      place: 'path',
      required: true,
      description: '',
    },
  ],
  sendsDocument: false,
  documentRequired: false,
  contentType: null,
};

function findRoute(toolName: string): EbayRoute {
  function matches(candidate: EbayRoute): boolean {
    return candidate.toolName == toolName;
  }

  const found = ebayRoutes.find(matches);
  const isMissing = found == null;

  if (isMissing) {
    throw new Error(`${toolName} is missing`);
  }

  return found;
}

describe('fillRoutePath', () => {
  test('adds the query fields that were provided', () => {
    const path = fillRoutePath(listItems, { limit: '50', offset: '100' });

    expect(path).toBe('/sell/inventory/v1/inventory_item?limit=50&offset=100');
  });

  test('omits a query when every field is missing', () => {
    const path = fillRoutePath(listItems, {});

    expect(path).toBe('/sell/inventory/v1/inventory_item');
  });

  test('encodes a path field', () => {
    const sku = 'ABC 123/4';
    const path = fillRoutePath(getItem, { sku });
    const encodedSku = encodeURIComponent(sku);

    expect(path).toBe(`/sell/inventory/v1/inventory_item/${encodedSku}`);
  });

  test('rejects a missing path field', () => {
    function readPath(): string {
      return fillRoutePath(getItem, { sku: '' });
    }

    expect(readPath).toThrow('sku is missing');
  });
});

describe('ebayRoutes', () => {
  test('names each call once, in snake case', () => {
    function toolName(route: EbayRoute): string {
      return route.toolName;
    }

    const names = ebayRoutes.map(toolName);
    const unique = new Set(names);

    expect(unique.size).toBe(names.length);

    const toolAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789_';

    function isToolName(name: string): boolean {
      const isPrefixed = name.startsWith('ebay_');

      if (isPrefixed == false) {
        return false;
      }

      const isShort = name.length <= 64;

      if (isShort == false) {
        return false;
      }

      const rest = name.slice('ebay_'.length);

      function isAllowed(character: string): boolean {
        return toolAlphabet.includes(character);
      }

      for (const character of rest) {
        const isPlain = isAllowed(character);

        if (isPlain == false) {
          return false;
        }
      }

      return rest != '';
    }

    expect(names.every(isToolName)).toBe(true);
  });

  test('keeps the application rate limit on the api host', () => {
    const route = findRoute('ebay_get_rate_limits');

    expect(route.method).toBe('GET');
    expect(route.host).toBe('api');
    expect(route.tokenKind).toBe('application');
    expect(route.path).toBe('/developer/analytics/v1_beta/rate_limit/');
  });

  test('asks for a user token on the user rate limit', () => {
    const route = findRoute('ebay_get_user_rate_limits');

    expect(route.tokenKind).toBe('user');
    expect(route.path).toBe('/developer/analytics/v1_beta/user_rate_limit/');
  });

  test('keeps the inventory item path', () => {
    const route = findRoute('ebay_get_inventory_item');

    expect(route.tokenKind).toBe('user');
    expect(route.path).toBe('/sell/inventory/v1/inventory_item/{sku}');
  });

  test('calls key management on apiz', () => {
    const route = findRoute('ebay_get_signing_keys');

    expect(route.host).toBe('apiz');
    expect(route.tokenKind).toBe('application');
  });
});
