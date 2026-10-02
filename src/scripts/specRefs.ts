/** Prefix shared by every local component-schema reference in an OpenAPI document. */
const SCHEMA_REF_PREFIX = '#/components/schemas/';

const definedSchemaNames = (spec: unknown): ReadonlySet<string> => {
  if (spec === null || typeof spec !== 'object' || !('components' in spec)) {
    return new Set();
  }
  const { components } = spec;
  if (components === null || typeof components !== 'object' || !('schemas' in components)) {
    return new Set();
  }
  const { schemas } = components;
  return new Set(schemas !== null && typeof schemas === 'object' ? Object.keys(schemas) : []);
};

/** OpenAPI document rewritten so every local schema reference resolves. */
export interface ResolvableSpec {
  /** Spec content with dangling schema references replaced by open schemas. */
  readonly spec: unknown;
  /** Schema names that were referenced but never defined, in first-seen order. */
  readonly danglingRefs: readonly string[];
}

/**
 * Replaces references to component schemas the spec never defines with an open schema.
 *
 * eBay occasionally publishes a spec with a dangling `$ref` (Account v2 references
 * `SetUserPreferencesRequest` without defining it), and openapi-typescript aborts the
 * whole file on the first unresolved reference. Rewriting only the dangling references
 * keeps every defined type exact, while the undefined payload generates as `unknown`
 * with a description naming the missing schema.
 *
 * @param spec - Parsed OpenAPI document; it is not mutated.
 * @returns The rewritten document and the schema names that could not be resolved.
 *
 * @example
 * ```ts
 * const { spec, danglingRefs } = replaceDanglingSchemaRefs(JSON.parse(content));
 * ```
 */
export const replaceDanglingSchemaRefs = (spec: unknown): ResolvableSpec => {
  const defined = definedSchemaNames(spec);
  const dangling = new Set<string>();

  const rewrite = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map(rewrite);
    }
    if (node === null || typeof node !== 'object') {
      return node;
    }
    if (
      '$ref' in node &&
      typeof node.$ref === 'string' &&
      node.$ref.startsWith(SCHEMA_REF_PREFIX)
    ) {
      // `#/components/schemas/Foo/properties/id` lives under Foo: check only the first token.
      const [name = ''] = node.$ref.slice(SCHEMA_REF_PREFIX.length).split('/');
      if (!defined.has(name)) {
        dangling.add(name);
        return { description: `Undefined upstream schema ${name}` };
      }
    }
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, rewrite(value)]));
  };

  const rewritten = rewrite(spec);
  return { spec: dangling.size > 0 ? rewritten : spec, danglingRefs: [...dangling] };
};
