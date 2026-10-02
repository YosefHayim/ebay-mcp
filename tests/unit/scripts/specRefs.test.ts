import { describe, expect, it } from 'vitest';
import { replaceDanglingSchemaRefs } from '@/scripts/specRefs.js';

const spec = {
  openapi: '3.0.0',
  paths: {
    '/user_preferences': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GetUserPreferencesResponse' },
              },
            },
          },
        },
      },
      patch: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SetUserPreferencesRequest' },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      GetUserPreferencesResponse: {
        type: 'object',
        properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Missing' } } },
      },
    },
  },
};

describe('replaceDanglingSchemaRefs', () => {
  it('keeps references into a defined schema, such as one of its properties', () => {
    const nested = {
      components: {
        schemas: {
          Item: { type: 'object', properties: { id: { type: 'string' } } },
          Wrapper: { properties: { id: { $ref: '#/components/schemas/Item/properties/id' } } },
        },
      },
    };

    const { spec: rewritten, danglingRefs } = replaceDanglingSchemaRefs(nested);

    expect(danglingRefs).toEqual([]);
    expect(rewritten).toBe(nested);
  });

  it('replaces only undefined schema references with a described open schema', () => {
    const { spec: rewritten, danglingRefs } = replaceDanglingSchemaRefs(spec);

    expect(danglingRefs).toEqual(['SetUserPreferencesRequest', 'Missing']);
    expect(rewritten).toMatchObject({
      paths: {
        '/user_preferences': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/GetUserPreferencesResponse' },
                  },
                },
              },
            },
          },
          patch: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { description: 'Undefined upstream schema SetUserPreferencesRequest' },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          GetUserPreferencesResponse: {
            properties: {
              items: { items: { description: 'Undefined upstream schema Missing' } },
            },
          },
        },
      },
    });
  });

  it('returns the original document untouched when every reference resolves', () => {
    const resolvable = {
      components: { schemas: { Amount: { type: 'object' } } },
      paths: { '/x': { get: { schema: { $ref: '#/components/schemas/Amount' } } } },
    };

    const result = replaceDanglingSchemaRefs(resolvable);

    expect(result.danglingRefs).toEqual([]);
    expect(result.spec).toBe(resolvable);
  });

  it('does not mutate the input document', () => {
    const before = JSON.stringify(spec);

    replaceDanglingSchemaRefs(spec);

    expect(JSON.stringify(spec)).toBe(before);
  });
});
