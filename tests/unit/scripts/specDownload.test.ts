import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Effect, Either } from 'effect';
import { afterEach, describe, expect, it } from 'vitest';
import { checkSpecDownload, refreshCachedSpec } from '@/scripts/specDownload.js';

const CACHED_SPEC = '{"openapi":"3.0.0","info":{"title":"cached"}}';
const FRESH_SPEC = '{"openapi":"3.0.0","info":{"title":"fresh"}}';

const failureMessage = (specBody: string): string | undefined => {
  const specBytes = Buffer.from(specBody);
  const check = checkSpecDownload(specBytes).pipe(Effect.either);
  const checkOutcome = Effect.runSync(check);
  return Either.isLeft(checkOutcome) ? checkOutcome.left.message : undefined;
};

describe('checkSpecDownload', () => {
  it('rejects an empty or whitespace-only body', () => {
    expect(failureMessage('')).toBe('empty response');
    expect(failureMessage(' \n\t')).toBe('empty response');
  });

  it('rejects a body that is not JSON', () => {
    expect(failureMessage('<html>Access Denied</html>')).toBe('response is not JSON');
  });

  it('rejects JSON without an openapi or swagger version', () => {
    expect(failureMessage('{"error":"not found"}')).toBe('JSON has no openapi or swagger version');
    expect(failureMessage('[]')).toBe('JSON has no openapi or swagger version');
    expect(failureMessage('null')).toBe('JSON has no openapi or swagger version');
  });

  it('accepts OpenAPI 3 and Swagger 2 documents', () => {
    expect(failureMessage(FRESH_SPEC)).toBeUndefined();
    expect(failureMessage('{"swagger":"2.0","paths":{}}')).toBeUndefined();
  });
});

describe('refreshCachedSpec', () => {
  let cacheDir = '';
  let specServer: Server | undefined;

  afterEach(() => {
    specServer?.close();
    if (cacheDir) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
  });

  const serveSpecBody = async (specBody: string): Promise<string> => {
    specServer = createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(specBody);
    });
    const server = specServer;
    await new Promise<void>((listening) => server.listen(0, '127.0.0.1', listening));
    const { port } = server.address() as AddressInfo;
    return `http://127.0.0.1:${port}/spec.json`;
  };

  const cachedSpecPath = (): string => {
    cacheDir = mkdtempSync(join(tmpdir(), 'ebay-spec-cache-'));
    const specPath = join(cacheDir, 'sell_feed_v1_oas3.json');
    writeFileSync(specPath, CACHED_SPEC);
    return specPath;
  };

  it('keeps the cached spec when the download is empty', async () => {
    const url = await serveSpecBody('');
    const specPath = cachedSpecPath();

    const refresh = refreshCachedSpec(url, specPath).pipe(Effect.either);
    const refreshOutcome = await Effect.runPromise(refresh);

    expect(Either.isLeft(refreshOutcome)).toBe(true);
    expect(readFileSync(specPath, 'utf-8')).toBe(CACHED_SPEC);
  });

  it('replaces the cached spec with a valid download', async () => {
    const url = await serveSpecBody(FRESH_SPEC);
    const specPath = cachedSpecPath();

    const refresh = refreshCachedSpec(url, specPath).pipe(Effect.either);
    const refreshOutcome = await Effect.runPromise(refresh);

    expect(Either.isRight(refreshOutcome)).toBe(true);
    expect(readFileSync(specPath, 'utf-8')).toBe(FRESH_SPEC);
  });
});
