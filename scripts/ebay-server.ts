import type {
  EbayHost,
  OpenApiDocument,
  OpenApiServer,
  OpenApiServerVariable,
} from './openapi-document.js';

interface EbayServer {
  host: EbayHost;
  basePath: string;
}

function fillTemplate(template: string, variables: Record<string, OpenApiServerVariable>): string {
  const names = Object.keys(variables);

  function replaceName(url: string, name: string): string {
    const variable = variables[name];
    const replacement = variable?.default ?? '';
    return url.replaceAll(`{${name}}`, replacement);
  }

  return names.reduce(replaceName, template);
}

function readServerUrl(server: OpenApiServer | undefined): string | null {
  const isMissing = server == null;

  if (isMissing) {
    return null;
  }

  const urlText = server.url;
  const isBlank = urlText == null;

  if (isBlank) {
    return null;
  }

  return urlText;
}

function knownHost(hostName: string): EbayHost | null {
  const isApi = hostName == 'api';

  if (isApi) {
    return 'api';
  }

  const isApiz = hostName == 'apiz';

  if (isApiz) {
    return 'apiz';
  }

  const isApim = hostName == 'apim';

  if (isApim) {
    return 'apim';
  }

  const isTppz = hostName == 'tppz';

  if (isTppz) {
    return 'tppz';
  }

  return null;
}

function readServer(document: OpenApiDocument, specName: string): EbayServer {
  const server = document.servers?.[0];
  const urlText = readServerUrl(server);
  const isMissing = urlText == null;

  if (isMissing) {
    throw new Error(`${specName} has no server url`);
  }

  const filledUrl = fillTemplate(urlText, server?.variables ?? {});
  const parsed = new URL(filledUrl);
  const { hostname } = parsed;
  const suffix = '.ebay.com';
  const isEbay = hostname.endsWith(suffix);

  if (isEbay == false) {
    throw new Error(`${specName} uses an unknown host ${hostname}`);
  }

  const hostName = hostname.slice(0, -suffix.length);
  const host = knownHost(hostName);

  if (host == null) {
    throw new Error(`${specName} uses an unknown host ${hostname}`);
  }

  return { host, basePath: parsed.pathname };
}

function joinPath(basePath: string, operationPath: string): string {
  const endsWithSlash = basePath.endsWith('/');
  const base = endsWithSlash ? basePath.slice(0, -1) : basePath;
  const startsWithSlash = operationPath.startsWith('/');
  const suffix = startsWithSlash ? operationPath : `/${operationPath}`;
  const isEmpty = base == '';

  if (isEmpty) {
    return suffix;
  }

  const isSlash = base == '/';

  if (isSlash) {
    return suffix;
  }

  return `${base}${suffix}`;
}

export { joinPath, readServer };
export type { EbayServer };
