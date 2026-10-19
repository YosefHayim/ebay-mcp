#!/usr/bin/env node

import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync, execSync } from 'child_process';
import { Effect, Either } from 'effect';
import { getErrorMessage } from '@/utils/errors.js';
import process from 'node:process';
import {
  classifyOperation,
  collectImplementedNames,
  normalizeForMatching,
} from './specCoverage.js';
import { refreshCachedSpec } from './specDownload.js';
import { replaceDanglingSchemaRefs } from './specRefs.js';
import { specFileName, specSources } from './specSources.js';
import { generatedNamespaceNames, renameGeneratedNamespaces } from './specTypeNames.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');
/** Local, git-ignored cache of downloaded eBay OpenAPI specs. */
const SPECS_DIR = join(PROJECT_ROOT, '.cache/ebay-specs');
const TYPES_DIR = join(PROJECT_ROOT, 'src/types');
const TOOLS_DIRS = [join(PROJECT_ROOT, 'src/tools/categories')];

const ui = {
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
  dim: chalk.dim,
  bold: chalk.bold,
};

const applyNamespaceNames = (outputPath: string, camelCaseName: string): void => {
  const names = generatedNamespaceNames[camelCaseName];
  if (!names) {
    return;
  }

  const generatedTypes = readFileSync(outputPath, 'utf-8');
  const renamedTypes = renameGeneratedNamespaces(generatedTypes, names);
  writeFileSync(outputPath, renamedTypes);
};

function showSpinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`  ${ui.info(frames[0])} ${message}`);
  const interval = setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.write(`\r  ${ui.info(frames[i])} ${message}`);
  }, 80);
  return () => {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(message.length + 10) + '\r');
  };
}

interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info?: { title?: string; version?: string };
  paths?: Record<string, Record<string, { operationId?: string; summary?: string }>>;
}

interface EndpointInfo {
  path: string;
  method: string;
  operationId: string;
  summary: string;
}

interface UnavailableSpec {
  api: string;
  fileName: string;
  url: string;
  reason: string;
}

interface SyncReport {
  specsDownloaded: number;
  unavailableSpecs: UnavailableSpec[];
  typesGenerated: number;
  endpointsInSpecs: number;
  toolsImplemented: number;
  exactMatches: number;
  fuzzyMatchedEndpoints: EndpointInfo[];
  missingEndpoints: EndpointInfo[];
}

async function downloadSpecs(): Promise<{ downloaded: number; unavailable: UnavailableSpec[] }> {
  console.log(ui.bold('\n📥 Downloading OpenAPI Specifications\n'));

  console.log(ui.dim(`  Found ${specSources.length} spec URLs\n`));

  let downloaded = 0;
  const unavailable: UnavailableSpec[] = [];
  for (const source of specSources) {
    const { api, folder, url } = source;
    const fileName = specFileName(source);
    const specPath = join(SPECS_DIR, folder, fileName);

    const stopSpinner = showSpinner(`Downloading ${api} (${fileName})...`);
    const refresh = refreshCachedSpec(url, specPath).pipe(Effect.either);
    const refreshOutcome = await Effect.runPromise(refresh);
    stopSpinner();

    if (Either.isRight(refreshOutcome)) {
      console.log(`  ${ui.success('✓')} ${api} (${fileName})`);
      downloaded++;
      continue;
    }

    const reason = refreshOutcome.left.message;
    const cacheNote = existsSync(specPath) ? 'kept the cached copy' : 'no cached copy';
    console.log(`  ${ui.error('✗')} ${api} (${fileName}): unavailable, ${reason}; ${cacheNote}`);
    unavailable.push({ api, fileName, url, reason });
  }

  if (unavailable.length > 0 && downloaded === 0) {
    console.log(
      ui.error(
        `\n  ✗ All ${unavailable.length} spec downloads failed — eBay is likely blocking automated requests (HTTP 403).`,
      ),
    );
  }

  return { downloaded, unavailable };
}

function generateTypes(): number {
  console.log(ui.bold('\n🔧 Generating TypeScript Types\n'));

  const generatedPaths: string[] = [];
  let skipped = 0;

  function processDirectory(dir: string): void {
    if (!existsSync(dir)) return;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.name.endsWith('.json')) {
        const fileContent = Effect.runSync(
          Effect.either(
            Effect.try({
              try: () => readFileSync(fullPath, 'utf-8'),
              catch: (error) => error,
            }),
          ),
        );

        if (Either.isLeft(fileContent)) {
          skipped++;
          continue;
        }

        const content = fileContent.right;
        if (!(content.includes('"openapi"') || content.includes('"swagger"'))) {
          skipped++;
          continue;
        }

        const relativePath = fullPath.replace(SPECS_DIR + '/', '');
        const outputDir = join(TYPES_DIR, dirname(relativePath));

        mkdirSync(outputDir, { recursive: true });

        const baseFileName = basename(entry.name, '.json');
        const camelCaseName = baseFileName
          .split(/[_.-]/)
          .map((part, i) =>
            i === 0
              ? part.toLowerCase()
              : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
          )
          .join('');

        const outputPath = join(outputDir, `${camelCaseName}.ts`);

        const generatedFile = Effect.runSync(
          Effect.either(
            Effect.try({
              try: () => {
                const { spec, danglingRefs } = replaceDanglingSchemaRefs(JSON.parse(content));
                if (danglingRefs.length === 0) {
                  execSync(`npx openapi-typescript "${fullPath}" -o "${outputPath}" --silent`, {
                    stdio: 'pipe',
                    cwd: PROJECT_ROOT,
                  });
                  return;
                }

                // openapi-typescript aborts on the first unresolved $ref, so feed it the
                // rewritten spec on stdin instead of the upstream file.
                console.log(
                  `  ${ui.warning('⚠')} ${camelCaseName}: undefined upstream schemas typed as unknown: ${danglingRefs.join(', ')}`,
                );
                execSync(`npx openapi-typescript -o "${outputPath}" --silent`, {
                  input: JSON.stringify(spec),
                  stdio: 'pipe',
                  cwd: PROJECT_ROOT,
                });
              },
              catch: (error) => error,
            }),
          ),
        );

        if (Either.isRight(generatedFile)) {
          applyNamespaceNames(outputPath, camelCaseName);
          console.log(`  ${ui.success('✓')} ${camelCaseName}.ts`);
          generatedPaths.push(outputPath);
        } else {
          console.log(
            `  ${ui.error('✗')} ${camelCaseName}.ts (generation failed): ${getErrorMessage(generatedFile.left)}`,
          );
        }
      }
    }
  }

  processDirectory(SPECS_DIR);

  // Format with the repo's Biome settings so regenerating unchanged specs leaves no diff.
  if (generatedPaths.length > 0) {
    execFileSync('npx', ['biome', 'format', '--write', ...generatedPaths], {
      stdio: 'pipe',
      cwd: PROJECT_ROOT,
    });
  }

  console.log(ui.dim(`\n  Generated: ${generatedPaths.length}, Skipped: ${skipped}`));
  return generatedPaths.length;
}

function extractEndpointsFromSpecs(): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];

  function processDirectory(dir: string): void {
    if (!existsSync(dir)) return;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.name.endsWith('.json')) {
        const parsedSpec = Effect.runSync(
          Effect.either(
            Effect.try({
              try: () => JSON.parse(readFileSync(fullPath, 'utf-8')) as OpenAPISpec,
              catch: (error) => error,
            }),
          ),
        );

        if (Either.isLeft(parsedSpec)) {
          continue;
        }

        const spec = parsedSpec.right;
        if (!spec.paths) continue;

        for (const [path, methods] of Object.entries(spec.paths)) {
          for (const [method, details] of Object.entries(methods)) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
              endpoints.push({
                path,
                method: method.toUpperCase(),
                operationId: details.operationId || `${method}_${path}`,
                summary: details.summary || '',
              });
            }
          }
        }
      }
    }
  }

  processDirectory(SPECS_DIR);
  return endpoints;
}

function collectToolNames(dir: string, tools: Set<string>): void {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      collectToolNames(fullPath, tools);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = readFileSync(fullPath, 'utf-8');
      const nameMatches = content.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g);
      for (const match of nameMatches) {
        tools.add(match[1]);
      }
    }
  }
}

function getImplementedTools(): Set<string> {
  const tools = new Set<string>();
  for (const dir of TOOLS_DIRS) {
    collectToolNames(dir, tools);
  }
  return tools;
}

/**
 * Get all implemented API methods from source files
 */
function getImplementedApiMethods(): Set<string> {
  const methods = new Set<string>();
  const apiDir = join(PROJECT_ROOT, 'src/api');

  function processDirectory(dir: string): void {
    if (!existsSync(dir)) return;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.name.endsWith('.ts')) {
        const source = Effect.runSync(
          Effect.either(
            Effect.try({
              try: () => readFileSync(fullPath, 'utf-8'),
              catch: (error) => error,
            }),
          ),
        );

        if (Either.isRight(source)) {
          // Match async methods and class-field arrow endpoints (`name = (` / `public name = (`).
          // Many area classes omit the `public` keyword (notification, trading, feedback, …).
          const methodMatches = source.right.matchAll(
            /(?:async\s+(\w+)\s*\(|(?:public\s+)?(\w+)\s*=\s*(?:async\s*)?\()/g,
          );
          for (const match of methodMatches) {
            const name = match[1] || match[2];
            // Skip common non-method bindings that the broader regex can catch.
            if (!name || name === 'const' || name === 'let' || name === 'var') continue;
            methods.add(name);
          }
        }
      }
    }
  }

  processDirectory(apiDir);
  return methods;
}

interface CoverageAnalysis {
  total: number;
  exact: number;
  fuzzy: EndpointInfo[];
  missing: EndpointInfo[];
}

function analyzeEndpoints(): CoverageAnalysis {
  console.log(ui.bold('\n📊 Analyzing API Coverage\n'));

  const specEndpoints = extractEndpointsFromSpecs();
  const implementedTools = getImplementedTools();
  const implementedApiMethods = getImplementedApiMethods();
  const implemented = collectImplementedNames([...implementedApiMethods], [...implementedTools]);

  // Track unique endpoints (dedupe by operationId)
  const seenOperationIds = new Set<string>();
  const uniqueEndpoints: EndpointInfo[] = [];

  for (const endpoint of specEndpoints) {
    const normalizedOpId = normalizeForMatching(endpoint.operationId);
    if (!seenOperationIds.has(normalizedOpId)) {
      seenOperationIds.add(normalizedOpId);
      uniqueEndpoints.push(endpoint);
    }
  }

  const fuzzy: EndpointInfo[] = [];
  const missing: EndpointInfo[] = [];
  let exact = 0;

  for (const endpoint of uniqueEndpoints) {
    const coverage = classifyOperation(endpoint.operationId, implemented);
    if (coverage === 'exact') {
      exact++;
    } else if (coverage === 'fuzzy') {
      fuzzy.push(endpoint);
    } else {
      missing.push(endpoint);
    }
  }

  const matchedCount = exact + fuzzy.length;
  const coveragePercent =
    uniqueEndpoints.length > 0 ? ((matchedCount / uniqueEndpoints.length) * 100).toFixed(1) : '0';

  console.log(`  ${ui.info('Total unique endpoints in specs:')} ${uniqueEndpoints.length}`);
  console.log(`  ${ui.info('(Raw count with duplicates:')} ${specEndpoints.length}${ui.info(')')}`);
  console.log(`  ${ui.success('Tools implemented:')} ${implementedTools.size}`);
  console.log(`  ${ui.success('API methods found:')} ${implementedApiMethods.size}`);
  console.log(`  ${ui.success('Endpoints covered:')} ${matchedCount} (${coveragePercent}%)`);
  console.log(`    ${ui.success('Exact operationId matches:')} ${exact}`);
  console.log(`    ${ui.warning('Fuzzy-only matches:')} ${fuzzy.length}`);
  console.log(`  ${ui.warning('Potentially missing:')} ${missing.length}`);

  return { total: uniqueEndpoints.length, exact, fuzzy, missing };
}

function showFuzzyMatches(fuzzy: EndpointInfo[]): void {
  if (fuzzy.length === 0) {
    return;
  }

  console.log(ui.bold('\nFuzzy-only Matches\n'));
  console.log(
    ui.dim('  No API method carries these operationIds exactly; a looser name matched:\n'),
  );
  for (const ep of fuzzy) {
    console.log(`    ${ui.dim(ep.method.padEnd(6))} ${ep.path} ${ui.dim(`(${ep.operationId})`)}`);
  }
}

function showMissingEndpoints(missing: EndpointInfo[]): void {
  if (missing.length === 0) {
    console.log(ui.success('\n  ✓ All endpoints appear to be implemented!\n'));
    return;
  }

  console.log(ui.bold('\n📋 Potentially Missing Endpoints\n'));
  console.log(
    ui.dim('  These endpoints were found in specs but may not have corresponding tools:\n'),
  );

  const grouped = missing.reduce(
    (acc, ep) => {
      const key = ep.path.split('/')[1] || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(ep);
      return acc;
    },
    {} as Record<string, EndpointInfo[]>,
  );

  for (const [group, endpoints] of Object.entries(grouped).slice(0, 10)) {
    console.log(`  ${ui.bold(group)}`);
    for (const ep of endpoints.slice(0, 5)) {
      console.log(`    ${ui.dim(ep.method.padEnd(6))} ${ep.path}`);
      if (ep.summary) {
        console.log(`           ${ui.dim(ep.summary.slice(0, 50))}`);
      }
    }
    if (endpoints.length > 5) {
      console.log(`    ${ui.dim(`... and ${endpoints.length - 5} more`)}`);
    }
    console.log('');
  }

  if (Object.keys(grouped).length > 10) {
    console.log(ui.dim(`  ... and ${Object.keys(grouped).length - 10} more API groups\n`));
  }
}

function generateReport(report: SyncReport): void {
  const reportPath = join(PROJECT_ROOT, 'devSyncReport.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(ui.dim(`\n  Report saved to: ${reportPath}\n`));
}

async function main(): Promise<void> {
  console.clear();
  console.log(
    ui.bold.cyan(`
╔════════════════════════════════════════════════════════════╗
║           eBay MCP Server - Developer Sync Tool            ║
╚════════════════════════════════════════════════════════════╝
`),
  );

  const args = process.argv.slice(2);
  const skipDownload = args.includes('--skip-download');
  const skipTypes = args.includes('--skip-types');
  const reportOnly = args.includes('--report');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${ui.bold('Usage:')}
  npm run sync [options]

${ui.bold('Options:')}
  --skip-download    Skip downloading OpenAPI specs
  --skip-types       Skip generating TypeScript types
  --report           Only generate coverage report
  --help, -h         Show this help

${ui.bold('What this does:')}
  1. Downloads latest OpenAPI specs from eBay
  2. Generates TypeScript types from specs
  3. Analyzes which endpoints are implemented
  4. Reports missing endpoints to implement
`);
    process.exit(0);
  }

  const report: SyncReport = {
    specsDownloaded: 0,
    unavailableSpecs: [],
    typesGenerated: 0,
    endpointsInSpecs: 0,
    toolsImplemented: 0,
    exactMatches: 0,
    fuzzyMatchedEndpoints: [],
    missingEndpoints: [],
  };

  if (!(reportOnly || skipDownload)) {
    const downloads = await downloadSpecs();
    report.specsDownloaded = downloads.downloaded;
    report.unavailableSpecs = downloads.unavailable;
  }

  // If the download step ran but fetched nothing (for example, blocked
  // requests), the coverage numbers below describe the cached specs on disk —
  // not eBay's current API. Flag it loudly so a stale run is never mistaken for
  // a clean "100% coverage, 0 missing" result.
  const usingStaleSpecs = !(reportOnly || skipDownload) && report.specsDownloaded === 0;

  // Don't regenerate types when nothing was downloaded: the inputs on disk are
  // unchanged, so a regen only risks churn (and can break the build if the
  // generator's interface naming drifts from what the code imports). Use
  // --skip-download to deliberately regenerate from on-disk specs.
  if (!(reportOnly || skipTypes || usingStaleSpecs)) {
    report.typesGenerated = generateTypes();
  }

  const analysis = analyzeEndpoints();
  report.endpointsInSpecs = analysis.total;
  report.toolsImplemented = analysis.exact + analysis.fuzzy.length;
  report.exactMatches = analysis.exact;
  report.fuzzyMatchedEndpoints = analysis.fuzzy;
  report.missingEndpoints = analysis.missing;

  showFuzzyMatches(analysis.fuzzy);
  showMissingEndpoints(analysis.missing);
  generateReport(report);

  if (usingStaleSpecs) {
    console.log(
      ui.warning(
        '\n  ⚠ No specs were downloaded — coverage above reflects the cached specs on disk, not eBay live.',
      ),
    );
    console.log(
      ui.dim(
        '    Refresh the specs (the eBay docs URLs return 403 to scripts) before trusting these numbers.',
      ),
    );
  }

  console.log(ui.bold.green('\n✓ Sync complete!\n'));
}

void Effect.runPromise(
  Effect.either(
    Effect.tryPromise({
      try: () => main(),
      catch: (error) => error,
    }),
  ),
).then((syncOutcome) => {
  if (Either.isLeft(syncOutcome)) {
    console.error(ui.error('\n  Sync failed:'), getErrorMessage(syncOutcome.left));
    process.exitCode = 1;
  }
});
