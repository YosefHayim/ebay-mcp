import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { Data, Effect } from 'effect';
import { getErrorMessage } from '@/utils/errors.js';
import { type HttpError, httpRequestEffect } from '@/utils/http.js';

const hasSpecVersion = (spec: unknown): boolean =>
  spec !== null &&
  typeof spec === 'object' &&
  (('openapi' in spec && typeof spec.openapi === 'string') ||
    ('swagger' in spec && typeof spec.swagger === 'string'));

export class UnusableSpecError extends Data.TaggedError('UnusableSpecError')<{
  readonly message: string;
}> {}

export class SpecCacheWriteError extends Data.TaggedError('SpecCacheWriteError')<{
  readonly specPath: string;
  readonly message: string;
}> {}

export const checkSpecDownload = (specBytes: Buffer): Effect.Effect<Buffer, UnusableSpecError> => {
  const specText = specBytes.toString('utf-8');
  if (specText.trim() === '') {
    return Effect.fail(new UnusableSpecError({ message: 'empty response' }));
  }
  return Effect.try({
    try: (): unknown => JSON.parse(specText),
    catch: () => new UnusableSpecError({ message: 'response is not JSON' }),
  }).pipe(
    Effect.filterOrFail(
      hasSpecVersion,
      () => new UnusableSpecError({ message: 'JSON has no openapi or swagger version' }),
    ),
    Effect.as(specBytes),
  );
};

export const refreshCachedSpec = (
  url: string,
  specPath: string,
): Effect.Effect<void, HttpError | UnusableSpecError | SpecCacheWriteError> =>
  httpRequestEffect<Buffer>({ url, responseType: 'arraybuffer', timeoutMs: 20_000 }).pipe(
    Effect.flatMap((specResponse) => checkSpecDownload(specResponse.data)),
    Effect.flatMap((specBytes) =>
      Effect.try({
        try: () => {
          mkdirSync(dirname(specPath), { recursive: true });
          writeFileSync(specPath, specBytes);
        },
        catch: (error) =>
          new SpecCacheWriteError({ specPath, message: getErrorMessage(error, 'write failed') }),
      }),
    ),
  );
