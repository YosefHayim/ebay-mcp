import type { SpecSource } from './spec-sources.js';

type EbayHost = 'api' | 'apiz' | 'apim' | 'tppz';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type FieldKind = 'string' | 'number' | 'integer' | 'boolean';
type FieldPlace = 'path' | 'query' | 'header';
type TokenKind = 'application' | 'user';

interface RouteField {
  name: string;
  kind: FieldKind;
  place: FieldPlace;
  required: boolean;
  description: string;
  minimum?: number;
  maximum?: number;
}

interface EbayRoute {
  toolName: string;
  description: string;
  method: HttpMethod;
  host: EbayHost;
  path: string;
  tokenKind: TokenKind;
  fields: RouteField[];
  sendsDocument: boolean;
  documentRequired: boolean;
  contentType: string | null;
}

interface OpenApiSchema {
  type?: string;
  description?: string;
  minimum?: number;
  maximum?: number;
  $ref?: string;
}

interface OpenApiParameter {
  name?: string;
  in?: string;
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
  $ref?: string;
}

interface OpenApiBody {
  required?: boolean;
  content?: Record<string, { schema?: OpenApiSchema }>;
}

type OpenApiSecurity = Record<string, string[]>;

interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiBody;
  security?: OpenApiSecurity[];
}

interface OpenApiPath {
  parameters?: OpenApiParameter[];
  security?: OpenApiSecurity[];
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  delete?: OpenApiOperation;
  patch?: OpenApiOperation;
}

interface OpenApiServerVariable {
  default?: string;
}

interface OpenApiServer {
  url?: string;
  variables?: Record<string, OpenApiServerVariable>;
}

interface OpenApiDocument {
  servers?: OpenApiServer[];
  security?: OpenApiSecurity[];
  paths?: Record<string, OpenApiPath>;
}

interface LoadedSpec {
  source: SpecSource;
  document: OpenApiDocument;
}

interface RouteDraft {
  specName: string;
  operationId: string;
  description: string;
  method: HttpMethod;
  host: EbayHost;
  path: string;
  tokenKind: TokenKind;
  fields: RouteField[];
  sendsDocument: boolean;
  documentRequired: boolean;
  contentType: string | null;
}

const openApiMethods = ['get', 'post', 'put', 'delete', 'patch'] as const;

type OpenApiMethod = (typeof openApiMethods)[number];

const descriptionLimit = 400;
const fieldDescriptionLimit = 160;
const toolNameLimit = 64;

function httpMethodFor(openApiMethod: OpenApiMethod): HttpMethod {
  const isGet = openApiMethod == 'get';

  if (isGet) {
    return 'GET';
  }

  const isPost = openApiMethod == 'post';

  if (isPost) {
    return 'POST';
  }

  const isPut = openApiMethod == 'put';

  if (isPut) {
    return 'PUT';
  }

  const isDelete = openApiMethod == 'delete';

  if (isDelete) {
    return 'DELETE';
  }

  return 'PATCH';
}

function asRecord(node: unknown, label: string): Record<string, unknown> {
  const isMissing = node == null;

  if (isMissing) {
    throw new Error(`${label} is not an object`);
  }

  const isArray = Array.isArray(node);

  if (isArray) {
    throw new Error(`${label} is not an object`);
  }

  const isObject = typeof node == 'object';

  if (isObject == false) {
    throw new Error(`${label} is not an object`);
  }

  return node as Record<string, unknown>;
}

function readPointer(document: Record<string, unknown>, pointer: string): unknown {
  const isLocal = pointer.startsWith('#/');

  if (isLocal == false) {
    throw new Error(`Unsupported $ref ${pointer}`);
  }

  const parts = pointer.slice(2).split('/');

  function readPart(current: unknown, part: string): unknown {
    const decoded = part.replaceAll('~1', '/').replaceAll('~0', '~');
    const record = asRecord(current, pointer);
    return record[decoded];
  }

  return parts.reduce(readPart, document);
}

function resolveNode<SchemaNode>(document: Record<string, unknown>, node: SchemaNode): SchemaNode {
  const isMissing = node == null;

  if (isMissing) {
    return node;
  }

  const isObject = typeof node == 'object';

  if (isObject == false) {
    return node;
  }

  const record = node as { $ref?: unknown };
  const ref = record.$ref;
  const isRef = typeof ref == 'string';

  if (isRef == false) {
    return node;
  }

  return readPointer(document, ref) as SchemaNode;
}

function removeHtml(html: string): string {
  // Descriptions use flat tags, so one pass is enough to drop them.
  const withoutTags = html.replaceAll(/<[^>]*>/g, ' ');
  const decoded = withoutTags
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');
  // Collapse the spaces the tag removal leaves behind.
  return decoded.replaceAll(/\s+/g, ' ').trim();
}

function shorten(text: string, limit: number): string {
  const isShort = text.length <= limit;

  if (isShort) {
    return text;
  }

  const sliced = text.slice(0, limit - 3).trimEnd();
  return `${sliced}...`;
}

function plainText(text: string | undefined, limit: number): string {
  const isMissing = text == null;

  if (isMissing) {
    return '';
  }

  return shorten(removeHtml(text), limit);
}

function spellSnake(operationId: string): string {
  // A lowercase letter or digit before an uppercase letter is a word break.
  const withBreaks = operationId.replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2');
  return withBreaks.replaceAll('-', '_').toLowerCase();
}

function spellToolName(specName: string, operationId: string, isShared: boolean): string {
  const operationName = spellSnake(operationId);
  const specSlug = specName.replaceAll('-', '_');

  if (isShared) {
    return `ebay_${specSlug}_${operationName}`;
  }

  return `ebay_${operationName}`;
}

export {
  asRecord,
  descriptionLimit,
  fieldDescriptionLimit,
  httpMethodFor,
  openApiMethods,
  plainText,
  resolveNode,
  spellToolName,
  toolNameLimit,
};

export type {
  EbayHost,
  EbayRoute,
  FieldKind,
  FieldPlace,
  HttpMethod,
  LoadedSpec,
  OpenApiBody,
  OpenApiDocument,
  OpenApiMethod,
  OpenApiOperation,
  OpenApiParameter,
  OpenApiPath,
  OpenApiSchema,
  OpenApiSecurity,
  OpenApiServer,
  OpenApiServerVariable,
  RouteDraft,
  RouteField,
  TokenKind,
};
