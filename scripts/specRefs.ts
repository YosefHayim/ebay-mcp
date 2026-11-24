const SCHEMA_REF_PREFIX = "#/components/schemas/";

function definedSchemaNames(spec: unknown): ReadonlySet<string> {
	if (spec === null || typeof spec != "object" || !("components" in spec)) {
		return new Set();
	}
	const { components } = spec;
	if (
		components === null ||
		typeof components != "object" ||
		!("schemas" in components)
	) {
		return new Set();
	}
	const { schemas } = components;
	return new Set(
		schemas !== null && typeof schemas == "object" ? Object.keys(schemas) : [],
	);
}

export interface ResolvableSpec {
	readonly spec: unknown;
	readonly danglingRefs: readonly string[];
}

export function replaceDanglingSchemaRefs(spec: unknown): ResolvableSpec {
	const defined = definedSchemaNames(spec);
	const dangling = new Set<string>();

	const rewrite = (node: unknown): unknown => {
		if (Array.isArray(node)) {
			return node.map(rewrite);
		}
		if (node === null || typeof node != "object") {
			return node;
		}
		if (
			"$ref" in node &&
			typeof node.$ref == "string" &&
			node.$ref.startsWith(SCHEMA_REF_PREFIX)
		) {
			// `#/components/schemas/Foo/properties/id` lives under Foo: check only the first token.
			const [name = ""] = node.$ref.slice(SCHEMA_REF_PREFIX.length).split("/");
			if (!defined.has(name)) {
				dangling.add(name);
				return { description: `Undefined upstream schema ${name}` };
			}
		}
		return Object.fromEntries(
			Object.entries(node).map(([key, child]) => [key, rewrite(child)]),
		);
	};

	const rewritten = rewrite(spec);
	return {
		spec: dangling.size > 0 ? rewritten : spec,
		danglingRefs: [...dangling],
	};
}
