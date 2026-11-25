import type { McpServer } from '@modelcontextprotocol/server';

import type { EbayCall, EbayClient, EbayHost, HttpMethod, TokenKind } from './ebay-client.js';
import { ebayRoutes } from './ebay-routes.js';
import { routeSchema } from './ebay-route-schema.js';

type FieldKind = 'string' | 'number' | 'integer' | 'boolean';
type FieldPlace = 'path' | 'query' | 'header';

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

function fieldValue(fields: Record<string, unknown>, name: string): unknown {
  return fields[name];
}

function isMissingValue(storedField: unknown): boolean {
  const isNull = storedField == null;

  if (isNull) {
    return true;
  }

  return storedField == '';
}

function fillPathParameters(route: EbayRoute, fields: Record<string, unknown>): string {
  function replaceField(path: string, field: RouteField): string {
    const isPath = field.place == 'path';

    if (isPath == false) {
      return path;
    }

    const storedField = fieldValue(fields, field.name);
    const isMissing = isMissingValue(storedField);

    if (isMissing) {
      throw new Error(`${field.name} is missing`);
    }

    const encoded = encodeURIComponent(String(storedField));
    return path.replaceAll(`{${field.name}}`, encoded);
  }

  return route.fields.reduce(replaceField, route.path);
}

function queryString(route: EbayRoute, fields: Record<string, unknown>): string {
  const search = new URLSearchParams();

  function addField(field: RouteField): void {
    const isQuery = field.place == 'query';

    if (isQuery == false) {
      return;
    }

    const storedField = fieldValue(fields, field.name);
    const isMissing = isMissingValue(storedField);

    if (isMissing == false) {
      search.set(field.name, String(storedField));
      return;
    }

    const isRequired = field.required;

    if (isRequired) {
      throw new Error(`${field.name} is missing`);
    }
  }

  for (const field of route.fields) {
    addField(field);
  }

  return search.toString();
}

function fillRoutePath(route: EbayRoute, fields: Record<string, unknown>): string {
  const path = fillPathParameters(route, fields);
  const query = queryString(route, fields);
  const isEmpty = query == '';

  if (isEmpty) {
    return path;
  }

  return `${path}?${query}`;
}

function readHeaderFields(
  route: EbayRoute,
  fields: Record<string, unknown>,
): Record<string, string> | null {
  const headers: Record<string, string> = {};

  function addField(field: RouteField): void {
    const isHeader = field.place == 'header';

    if (isHeader == false) {
      return;
    }

    const storedField = fieldValue(fields, field.name);
    const isMissing = isMissingValue(storedField);

    if (isMissing == false) {
      headers[field.name] = String(storedField);
      return;
    }

    const isRequired = field.required;

    if (isRequired) {
      throw new Error(`${field.name} is missing`);
    }
  }

  for (const field of route.fields) {
    addField(field);
  }

  const [firstName] = Object.keys(headers);
  const isEmpty = firstName == null;

  if (isEmpty) {
    return null;
  }

  return headers;
}

function readDocumentField(route: EbayRoute, fields: Record<string, unknown>): unknown | null {
  const { sendsDocument } = route;

  if (sendsDocument == false) {
    return null;
  }

  const document = fieldValue(fields, 'document');
  const isMissing = document == null;

  if (isMissing == false) {
    return document;
  }

  const isRequired = route.documentRequired;

  if (isRequired) {
    throw new Error('document is missing');
  }

  return null;
}

function contentTypeFor(route: EbayRoute): string | null {
  const { sendsDocument } = route;

  if (sendsDocument == false) {
    return null;
  }

  return route.contentType;
}

async function runRoute(
  client: EbayClient,
  route: EbayRoute,
  fields: Record<string, unknown>,
): Promise<unknown> {
  const path = fillRoutePath(route, fields);
  const headerFields = readHeaderFields(route, fields);
  const document = readDocumentField(route, fields);
  const contentType = contentTypeFor(route);
  const call: EbayCall = {
    method: route.method,
    path,
    tokenKind: route.tokenKind,
    host: route.host,
    document,
    contentType,
    headerFields,
  };
  const sent = await client.sendJson(call);
  return sent;
}

function registerRoute(server: McpServer, client: EbayClient, route: EbayRoute): void {
  const toolSchema = routeSchema(route);

  async function callRoute(fields: Record<string, unknown>) {
    const document = await runRoute(client, route, fields);
    const text = JSON.stringify(document, null, 2);

    return {
      content: [{ type: 'text' as const, text }],
    };
  }

  server.registerTool(
    route.toolName,
    {
      description: route.description,
      inputSchema: toolSchema,
    },
    callRoute,
  );
}

function registerEbayRoutes(server: McpServer, client: EbayClient): void {
  function registerOne(route: EbayRoute): void {
    registerRoute(server, client, route);
  }

  for (const route of ebayRoutes) {
    registerOne(route);
  }
}

export { fillRoutePath, registerEbayRoutes };
export type { EbayRoute, RouteField };
