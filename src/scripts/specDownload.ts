import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { Data, Effect } from 'effect';
import { getErrorMessage } from '@/utils/errors.js';
import { type HttpError, httpRequestEffect } from '@/utils/http.js';

const isVersionText = (version: unknown): boolean =>
  typeof version === 'string' && version.trim() !== '';

const hasSpecVersion = (spec: unknown): boolean =>
  spec !== null &&
  typeof spec === 'object' &&
  (('openapi' in spec && isVersionText(spec.openapi)) ||
    ('swagger' in spec && isVersionText(spec.swagger)));

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
    Effect.flatMap((specBytes) => {
      // Write beside the cache, then rename, so a failed write never truncates the cached spec.
      const downloadPath = `${specPath}.download`;
      return Effect.try({
        try: () => {
          mkdirSync(dirname(specPath), { recursive: true });
          writeFileSync(downloadPath, specBytes);
          renameSync(downloadPath, specPath);
        },
        catch: (error) => {
          rmSync(downloadPath, { force: true });
          return new SpecCacheWriteError({
            specPath,
            message: getErrorMessage(error, 'write failed'),
          });
        },
      });
    }),
  );
