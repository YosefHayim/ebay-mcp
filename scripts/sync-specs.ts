import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import type { LoadedSpec, OpenApiDocument } from './openapi-document.js';
import { specSources, type SpecSource } from './spec-sources.js';
import { writeRouteCatalog } from './write-routes.js';

function runFile(file: string, args: string[]): Promise<void> {
  function start(resolve: () => void, reject: (reason: Error) => void): void {
    function finished(error: Error | null): void {
      const isFailed = error != null;

      if (isFailed) {
        reject(error);
        return;
      }

      resolve();
    }

    execFile(file, args, finished);
  }

  return new Promise(start);
}

async function downloadSpec(spec: SpecSource, cacheDir: URL): Promise<OpenApiDocument> {
  var specReply: Response;

  try {
    specReply = await fetch(spec.url);
  } catch (error) {
    throw new Error(`Could not download ${spec.name}`, { cause: error });
  }

  const isOk = specReply.ok;

  if (isOk == false) {
    throw new Error(`Could not download ${spec.name}: ${specReply.status}`);
  }

  var specText: string;

  try {
    specText = await specReply.text();
  } catch (error) {
    throw new Error(`Could not read ${spec.name}`, { cause: error });
  }

  const cacheUrl = new URL(`${spec.name}.json`, cacheDir);

  try {
    await writeFile(cacheUrl, specText);
  } catch (error) {
    throw new Error(`Could not save ${spec.name}`, { cause: error });
  }

  try {
    const document: unknown = JSON.parse(specText);
    return document as OpenApiDocument;
  } catch (error) {
    throw new Error(`Could not parse ${spec.name}`, { cause: error });
  }
}

async function generateTypes(spec: SpecSource, cacheDir: URL, rootUrl: URL): Promise<void> {
  const cliUrl = new URL('node_modules/openapi-typescript/bin/cli.js', rootUrl);
  const cacheUrl = new URL(`${spec.name}.json`, cacheDir);
  const outputUrl = new URL(`src/types/${spec.name}.ts`, rootUrl);
  const cliPath = fileURLToPath(cliUrl);
  const cachePath = fileURLToPath(cacheUrl);
  const outputPath = fileURLToPath(outputUrl);

  try {
    await runFile(process.execPath, [
      cliPath,
      cachePath,
      '--output',
      outputPath,
      '--root-types',
      '--root-types-no-schema-prefix',
    ]);
  } catch (error) {
    throw new Error(`Could not generate types for ${spec.name}`, { cause: error });
  }
}

async function syncSpec(spec: SpecSource, cacheDir: URL, rootUrl: URL): Promise<LoadedSpec> {
  const document = await downloadSpec(spec, cacheDir);
  await generateTypes(spec, cacheDir, rootUrl);
  return { source: spec, document };
}

async function main(): Promise<void> {
  const rootUrl = new URL('../', import.meta.url);
  const cacheDir = new URL('.cache/ebay-specs/', rootUrl);
  const outputDir = new URL('src/types/', rootUrl);
  const catalogUrl = new URL('src/ebay-routes.ts', rootUrl);
  await mkdir(cacheDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  function loadSpec(spec: SpecSource): Promise<LoadedSpec> {
    return syncSpec(spec, cacheDir, rootUrl);
  }

  const loaded = await Promise.all(specSources.map(loadSpec));
  await writeRouteCatalog(loaded, catalogUrl);
}

try {
  await main();
} catch (error) {
  const isError = error instanceof Error;

  if (isError) {
    console.error(error.message);
    process.exit(1);
  }

  console.error('Could not sync eBay OpenAPI types');
  process.exit(1);
}
