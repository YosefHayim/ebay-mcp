import {
  descriptionLimit,
  plainText,
  type HttpMethod,
  type OpenApiDocument,
  type OpenApiOperation,
  type OpenApiPath,
  type OpenApiSecurity,
  type TokenKind,
} from './openapi-document.js';

const applicationScope = 'https://api.ebay.com/oauth/api_scope';

function scopesOf(security: OpenApiSecurity[]): string[] {
  const scopes: string[] = [];

  for (const requirement of security) {
    for (const name of Object.keys(requirement)) {
      const listed = requirement[name] ?? [];

      for (const scope of listed) {
        scopes.push(scope);
      }
    }
  }

  return scopes;
}

function tokenKindFor(scopes: string[]): TokenKind {
  for (const scope of scopes) {
    const isApplication = scope == applicationScope;

    if (isApplication == false) {
      return 'user';
    }
  }

  return 'application';
}

function securityFor(
  document: OpenApiDocument,
  pathItem: OpenApiPath,
  operation: OpenApiOperation,
): OpenApiSecurity[] {
  const operationSecurity = operation.security;

  if (operationSecurity != null) {
    return operationSecurity;
  }

  const pathSecurity = pathItem.security;

  if (pathSecurity != null) {
    return pathSecurity;
  }

  return document.security ?? [];
}

function fallbackOperationId(method: HttpMethod, path: string): string {
  const pieces = path.split('/');
  const words: string[] = [];

  function addPiece(piece: string): void {
    const isBlank = piece == '';
    const isParameter = piece.startsWith('{');

    if (isBlank) {
      return;
    }

    if (isParameter) {
      return;
    }

    const parts = piece.split('_');

    function addPart(part: string): void {
      const isEmpty = part == '';

      if (isEmpty) {
        return;
      }

      const head = part.slice(0, 1).toUpperCase();
      const tail = part.slice(1);
      words.push(`${head}${tail}`);
    }

    for (const part of parts) {
      addPart(part);
    }
  }

  for (const piece of pieces) {
    addPiece(piece);
  }

  const methodName = method.toLowerCase();
  return `${methodName}${words.join('')}`;
}

function operationDescription(
  operation: OpenApiOperation,
  method: HttpMethod,
  path: string,
): string {
  const summary = plainText(operation.summary, descriptionLimit);
  const hasSummary = summary != '';

  if (hasSummary) {
    return summary;
  }

  const description = plainText(operation.description, descriptionLimit);
  const hasDescription = description != '';

  if (hasDescription) {
    return description;
  }

  return `${method.toUpperCase()} ${path}`;
}

export { fallbackOperationId, operationDescription, scopesOf, securityFor, tokenKindFor };
