import { writeFile } from 'node:fs/promises';

import { joinPath, type EbayServer, readServer } from './ebay-server.js';
import {
  asRecord,
  httpMethodFor,
  openApiMethods,
  spellToolName,
  toolNameLimit,
  type EbayRoute,
  type HttpMethod,
  type LoadedSpec,
  type OpenApiMethod,
  type OpenApiOperation,
  type OpenApiPath,
  type RouteDraft,
  type RouteField,
} from './openapi-document.js';
import {
  fallbackOperationId,
  operationDescription,
  scopesOf,
  securityFor,
  tokenKindFor,
} from './operation-text.js';
import { readContentType, readFields } from './route-fields.js';

interface OperationRequest {
  loaded: LoadedSpec;
  specRecord: Record<string, unknown>;
  server: EbayServer;
  operationPath: string;
  method: HttpMethod;
  pathItem: OpenApiPath;
  operation: OpenApiOperation;
}

function isDocumentField(field: RouteField): boolean {
  return field.name == 'document';
}

function readOperation(request: OperationRequest): RouteDraft {
  const { loaded, specRecord, server, operationPath, method, pathItem, operation } = request;
  const operationId = operation.operationId ?? fallbackOperationId(method, operationPath);
  const fields = readFields(specRecord, pathItem, operation, loaded.source.name);
  const contentType = readContentType(operation.requestBody);
  const sendsDocument = contentType != null;
  const documentRequired = operation.requestBody?.required == true;
  const namedDocument = fields.some(isDocumentField);

  if (namedDocument) {
    throw new Error(`${loaded.source.name} ${operationId} already has a document field`);
  }

  const security = securityFor(loaded.document, pathItem, operation);
  const path = joinPath(server.basePath, operationPath);

  return {
    specName: loaded.source.name,
    operationId,
    description: operationDescription(operation, method, path),
    method,
    host: server.host,
    path,
    tokenKind: tokenKindFor(scopesOf(security)),
    fields,
    sendsDocument,
    documentRequired,
    contentType,
  };
}

function draftsFromSpec(loaded: LoadedSpec, specRecord: Record<string, unknown>): RouteDraft[] {
  const server = readServer(loaded.document, loaded.source.name);
  const paths = loaded.document.paths ?? {};
  const drafts: RouteDraft[] = [];

  function addPath(operationPath: string): void {
    const pathItem = paths[operationPath];
    const isMissingPath = pathItem == null;

    if (isMissingPath) {
      return;
    }

    const foundPath = pathItem;

    function addMethod(openApiMethod: OpenApiMethod): void {
      const operation = foundPath[openApiMethod];
      const isMissing = operation == null;

      if (isMissing) {
        return;
      }

      const draft = readOperation({
        loaded,
        specRecord,
        server,
        operationPath,
        method: httpMethodFor(openApiMethod),
        pathItem: foundPath,
        operation,
      });
      drafts.push(draft);
    }

    for (const openApiMethod of openApiMethods) {
      addMethod(openApiMethod);
    }
  }

  for (const operationPath of Object.keys(paths)) {
    addPath(operationPath);
  }

  return drafts;
}

function assignToolNames(drafts: RouteDraft[]): EbayRoute[] {
  const counts = new Map<string, number>();

  function countDraft(draft: RouteDraft): void {
    const shortName = spellToolName(draft.specName, draft.operationId, false);
    const count = counts.get(shortName) ?? 0;
    counts.set(shortName, count + 1);
  }

  for (const draft of drafts) {
    countDraft(draft);
  }

  function finish(draft: RouteDraft): EbayRoute {
    const shortName = spellToolName(draft.specName, draft.operationId, false);
    const count = counts.get(shortName) ?? 0;
    const isShared = count > 1;
    const toolName = spellToolName(draft.specName, draft.operationId, isShared);
    const isTooLong = toolName.length > toolNameLimit;

    if (isTooLong) {
      throw new Error(`Tool name is longer than ${toolNameLimit} characters: ${toolName}`);
    }

    return {
      toolName,
      description: draft.description,
      method: draft.method,
      host: draft.host,
      path: draft.path,
      tokenKind: draft.tokenKind,
      fields: draft.fields,
      sendsDocument: draft.sendsDocument,
      documentRequired: draft.documentRequired,
      contentType: draft.contentType,
    };
  }

  const routes = drafts.map(finish);
  const seen = new Set<string>();

  function requireUnique(route: EbayRoute): void {
    const isDuplicate = seen.has(route.toolName);

    if (isDuplicate) {
      throw new Error(`Duplicate tool name ${route.toolName}`);
    }

    seen.add(route.toolName);
  }

  for (const route of routes) {
    requireUnique(route);
  }

  return routes;
}

async function writeRouteCatalog(loadedSpecs: LoadedSpec[], outputUrl: URL): Promise<void> {
  const drafts: RouteDraft[] = [];

  function addSpec(loaded: LoadedSpec, specRecord: Record<string, unknown>): void {
    const specDrafts = draftsFromSpec(loaded, specRecord);

    for (const draft of specDrafts) {
      drafts.push(draft);
    }
  }

  for (const loaded of loadedSpecs) {
    const specRecord = asRecord(loaded.document, loaded.source.name);
    addSpec(loaded, specRecord);
  }

  const routes = assignToolNames(drafts);
  const catalog = JSON.stringify(routes, null, 2);
  const fileText = `import type { EbayRoute } from './ebay-route.js';\n\nexport const ebayRoutes = ${catalog} satisfies EbayRoute[];\n`;

  try {
    await writeFile(outputUrl, fileText);
  } catch (error) {
    throw new Error('Could not write the eBay route catalog', { cause: error });
  }
}

export { writeRouteCatalog };
