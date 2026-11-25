import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

interface SpecSource {
  name: string;
  url: string;
  output: string;
}

const openApiSpecs: SpecSource[] = [
  {
    name: 'developer-analytics',
    url: 'https://developer.ebay.com/api-docs/master/developer/analytics/openapi/3/developer_analytics_v1_beta_oas3.json',
    output: 'src/ebay-openapi-types/developer-analytics.ts',
  },
  {
    name: 'sell-inventory',
    url: 'https://developer.ebay.com/api-docs/master/sell/inventory/openapi/3/sell_inventory_v1_oas3.json',
    output: 'src/ebay-openapi-types/sell-inventory.ts',
  },
];

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

async function downloadSpec(spec: SpecSource, cacheDir: URL): Promise<URL> {
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

  return cacheUrl;
}

async function generateTypes(spec: SpecSource, cacheUrl: URL, rootUrl: URL): Promise<void> {
  const cliUrl = new URL('node_modules/openapi-typescript/bin/cli.js', rootUrl);
  const outputUrl = new URL(spec.output, rootUrl);
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

async function main(): Promise<void> {
  const rootUrl = new URL('../', import.meta.url);
  const cacheDir = new URL('.cache/ebay-specs/', rootUrl);
  const outputDir = new URL('src/ebay-openapi-types/', rootUrl);
  await mkdir(cacheDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  async function syncSpec(spec: SpecSource): Promise<void> {
    const cacheUrl = await downloadSpec(spec, cacheDir);
    await generateTypes(spec, cacheUrl, rootUrl);
  }

  await Promise.all(openApiSpecs.map(syncSpec));
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
