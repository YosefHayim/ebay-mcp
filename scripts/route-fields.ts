import {
  fieldDescriptionLimit,
  plainText,
  resolveNode,
  type FieldKind,
  type FieldPlace,
  type OpenApiBody,
  type OpenApiOperation,
  type OpenApiParameter,
  type OpenApiPath,
  type OpenApiSchema,
  type RouteField,
} from './openapi-document.js';

function readBound(schema: OpenApiSchema, key: 'minimum' | 'maximum'): number | undefined {
  const bound = schema[key];
  const isNumber = typeof bound == 'number';

  if (isNumber == false) {
    return;
  }

  return bound;
}

function fieldKind(schema: OpenApiSchema | undefined): FieldKind {
  const typeName = schema?.type;
  const isInteger = typeName == 'integer';

  if (isInteger) {
    return 'integer';
  }

  const isNumber = typeName == 'number';

  if (isNumber) {
    return 'number';
  }

  const isBoolean = typeName == 'boolean';

  if (isBoolean) {
    return 'boolean';
  }

  return 'string';
}

function fieldPlace(place: string | undefined): FieldPlace | null {
  const isPath = place == 'path';

  if (isPath) {
    return 'path';
  }

  const isQuery = place == 'query';

  if (isQuery) {
    return 'query';
  }

  const isHeader = place == 'header';

  if (isHeader) {
    return 'header';
  }

  return null;
}

function isFieldRequired(isPath: boolean, required: boolean | undefined): boolean {
  if (isPath) {
    return true;
  }

  return required == true;
}

function isStandardHeader(name: string): boolean {
  const lower = name.toLowerCase();
  const isAuthorization = lower == 'authorization';

  if (isAuthorization) {
    return true;
  }

  const isContentLanguage = lower == 'content-language';

  if (isContentLanguage) {
    return true;
  }

  const isContentType = lower == 'content-type';

  if (isContentType) {
    return true;
  }

  const isMarketplace = lower == 'x-ebay-c-marketplace-id';

  if (isMarketplace) {
    return true;
  }

  return false;
}

function skipStandardHeader(placeName: FieldPlace, headerName: string): boolean {
  const isHeader = placeName == 'header';

  if (isHeader == false) {
    return false;
  }

  return isStandardHeader(headerName);
}

function readField(
  document: Record<string, unknown>,
  declaredParameter: OpenApiParameter,
  specName: string,
): RouteField | null {
  const resolved = resolveNode(document, declaredParameter);
  const { name, in: place } = resolved;
  const isNamed = typeof name == 'string';

  if (isNamed == false) {
    throw new Error(`${specName} has a parameter with no name`);
  }

  const placeName = fieldPlace(place);

  if (placeName == null) {
    return null;
  }

  const isStandard = skipStandardHeader(placeName, name);

  if (isStandard) {
    return null;
  }

  const schema = resolveNode(document, resolved.schema ?? {});
  const kind = fieldKind(schema);
  const minimum = readBound(schema, 'minimum');
  const maximum = readBound(schema, 'maximum');
  const isPath = placeName == 'path';
  const field: RouteField = {
    name,
    kind,
    place: placeName,
    required: isFieldRequired(isPath, resolved.required),
    description: plainText(resolved.description, fieldDescriptionLimit),
  };
  const hasMinimum = minimum != null;

  if (hasMinimum) {
    field.minimum = minimum;
  }

  const hasMaximum = maximum != null;

  if (hasMaximum) {
    field.maximum = maximum;
  }

  return field;
}

function readFields(
  document: Record<string, unknown>,
  pathItem: OpenApiPath,
  operation: OpenApiOperation,
  specName: string,
): RouteField[] {
  const parameters = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])];
  const fields: RouteField[] = [];

  function addParameter(declaredParameter: OpenApiParameter): void {
    const field = readField(document, declaredParameter, specName);
    const isSkipped = field == null;

    if (isSkipped) {
      return;
    }

    fields.push(field);
  }

  for (const declaredParameter of parameters) {
    addParameter(declaredParameter);
  }

  return fields;
}

function readContentType(body: OpenApiBody | undefined): string | null {
  const isMissing = body == null;

  if (isMissing) {
    return null;
  }

  const content = body.content ?? {};
  const hasJson = Object.hasOwn(content, 'application/json');

  if (hasJson) {
    return 'application/json';
  }

  const contentTypes = Object.keys(content);
  const [first] = contentTypes;
  const isEmpty = first == null;

  if (isEmpty) {
    return null;
  }

  return first;
}

export { readContentType, readFields };
