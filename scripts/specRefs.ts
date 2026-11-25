const SCHEMA_REF_PREFIX = "#/components/schemas/";

function isNonNullObject(candidate: unknown): candidate is object {
	const isNull = candidate == null;

	if (isNull) {
		return false;
	}

	const isObject = typeof candidate == "object";
	const isNotObject = !isObject;

	if (isNotObject) {
		return false;
	}

	return true;
}

function definedSchemaNames(spec: unknown): ReadonlySet<string> {
	const isSpecObject = isNonNullObject(spec);
	const isSpecNotObject = !isSpecObject;

	if (isSpecNotObject) {
		return new Set();
	}

	const hasComponents = hasComponentsField(spec);
	const hasNoComponents = !hasComponents;

	if (hasNoComponents) {
		return new Set();
	}

	return schemaNamesFromComponents(spec.components);
}

function schemaNamesFromComponents(components: unknown): ReadonlySet<string> {
	const isComponentsObject = isNonNullObject(components);
	const isComponentsNotObject = !isComponentsObject;

	if (isComponentsNotObject) {
		return new Set();
	}

	const hasSchemas = hasSchemasField(components);
	const hasNoSchemas = !hasSchemas;

	if (hasNoSchemas) {
		return new Set();
	}

	return schemaNameSet(components.schemas);
}

function schemaNameSet(schemas: unknown): ReadonlySet<string> {
	const isSchemasObject = isNonNullObject(schemas);
	const isSchemasNotObject = !isSchemasObject;

	if (isSchemasNotObject) {
		return new Set();
	}

	return new Set(Object.keys(schemas));
}

export interface ResolvableSpec {
	readonly spec: unknown;
	readonly danglingRefs: readonly string[];
}

function hasComponentsField(spec: object): spec is { components: unknown } {
	return "components" in spec;
}

function hasSchemasField(
	components: object,
): components is { schemas: unknown } {
	return "schemas" in components;
}

function hasRefField(schemaNode: object): schemaNode is { $ref: unknown } {
	return "$ref" in schemaNode;
}

function readSchemaRefName(schemaNode: object): string | null {
	const hasSchemaRefField = hasRefField(schemaNode);
	const hasNoRefField = !hasSchemaRefField;

	if (hasNoRefField) {
		return null;
	}

	const refField = schemaNode.$ref;
	const isStringRef = typeof refField == "string";
	const isNotStringRef = !isStringRef;

	if (isNotStringRef) {
		return null;
	}

	const isSchemaRef = refField.startsWith(SCHEMA_REF_PREFIX);
	const isNotSchemaRef = !isSchemaRef;

	if (isNotSchemaRef) {
		return null;
	}

	// `#/components/schemas/Foo/properties/id` lives under Foo: check only the first token.
	const [schemaName = ""] = refField.slice(SCHEMA_REF_PREFIX.length).split("/");
	return schemaName;
}

function replaceUndefinedSchemaRef(
	schemaNode: object,
	defined: ReadonlySet<string>,
	dangling: Set<string>,
): { description: string } | null {
	const schemaName = readSchemaRefName(schemaNode);
	const hasNoSchemaRef = schemaName == null;

	if (hasNoSchemaRef) {
		return null;
	}

	const isDefined = defined.has(schemaName);

	if (isDefined) {
		return null;
	}

	dangling.add(schemaName);
	return { description: `Undefined upstream schema ${schemaName}` };
}

export function replaceDanglingSchemaRefs(spec: unknown): ResolvableSpec {
	const defined = definedSchemaNames(spec);
	const dangling = new Set<string>();

	function rewrite(node: unknown): unknown {
		const isArray = Array.isArray(node);

		if (isArray) {
			return node.map(rewrite);
		}

		const isObjectNode = isNonNullObject(node);
		const isNotObjectNode = !isObjectNode;

		if (isNotObjectNode) {
			return node;
		}

		const undefinedSchema = replaceUndefinedSchemaRef(node, defined, dangling);
		const hasUndefinedSchema = undefinedSchema != null;

		if (hasUndefinedSchema) {
			return undefinedSchema;
		}

		return Object.fromEntries(
			Object.entries(node).map(([fieldName, child]) => [
				fieldName,
				rewrite(child),
			]),
		);
	}

	const rewritten = rewrite(spec);
	const hasDanglingRefs = dangling.size > 0;

	return {
		spec: hasDanglingRefs ? rewritten : spec,
		danglingRefs: [...dangling],
	};
}
