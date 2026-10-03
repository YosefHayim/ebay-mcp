#!/usr/bin/env node

import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { Effect, Either } from 'effect';
import { getErrorMessage } from '@/utils/errors.js';
import { httpRequest } from '@/utils/http.js';
import process from 'node:process';
import { replaceDanglingSchemaRefs } from './specRefs.js';
import { specSources } from './specSources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');
/** Local, git-ignored cache of downloaded eBay OpenAPI specs. */
const SPECS_DIR = join(PROJECT_ROOT, '.cache/ebay-specs');
const TYPES_DIR = join(PROJECT_ROOT, 'src/types');
const TOOLS_DIRS = [join(PROJECT_ROOT, 'src/tools/categories')];

/** Repo-specific OpenAPI namespace aliases preserved after type regeneration. */
const GENERATED_TYPE_ALIASES: Record<
  string,
  { readonly components: string; readonly operations: string }
> = {
  developerAnalyticsV1BetaOas3: {
    components: 'DeveloperAnalyticsComponents',
    operations: 'DeveloperAnalyticsOperations',
  },
  developerClientRegistrationV1Oas3: {
    components: 'DeveloperClientRegistrationComponents',
    operations: 'DeveloperClientRegistrationOperations',
  },
  developerKeyManagementV1Oas3: {
    components: 'DeveloperKeyManagementComponents',
    operations: 'DeveloperKeyManagementOperations',
  },
  sellComplianceV1Oas3: {
    components: 'SellComplianceComponents',
    operations: 'SellComplianceOperations',
  },
};

const ui = {
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
  dim: chalk.dim,
  bold: chalk.bold,
};

/**
 * Checks whether an openapi-typescript output exposes a generated namespace.
 *
 * @param content - Generated TypeScript declaration content to inspect.
 * @param exportName - Namespace export that must exist before adding an alias.
 * @returns True when the generated output exposes the requested namespace.
 *
 * @example
 * ```ts
 * hasGeneratedExport(content, 'components');
 * ```
 */
const hasGeneratedExport = (content: string, exportName: 'components' | 'operations'): boolean =>
  content.includes(`export interface ${exportName}`) ||
  content.includes(`export type ${exportName}`);

/**
 * Appends repo-specific generated type aliases after openapi-typescript rewrites a file.
 *
 * @param outputPath - Generated TypeScript declaration file path.
 * @param camelCaseName - OpenAPI spec basename used as the generated type file name.
 * @returns Nothing; the generated file is updated in place when aliases are needed.
 *
 * @example
 * ```ts
 * preserveGeneratedTypeAliases(outputPath, 'sellComplianceV1Oas3');
 * ```
 */
const preserveGeneratedTypeAliases = (outputPath: string, camelCaseName: string): void => {
  const aliases = GENERATED_TYPE_ALIASES[camelCaseName];
  if (!aliases) {
    return;
  }

  const content = readFileSync(outputPath, 'utf-8');
  const aliasLines: string[] = [];

  if (
    hasGeneratedExport(content, 'components') &&
    !content.includes(`export type ${aliases.components}`)
  ) {
    aliasLines.push(
      '/** Repo-specific alias for generated OpenAPI components. */',
      `export type ${aliases.components} = components;`,
    );
  }

  if (
    hasGeneratedExport(content, 'operations') &&
    !content.includes(`export type ${aliases.operations}`)
  ) {
    aliasLines.push(
      '/** Repo-specific alias for generated OpenAPI operations. */',
      `export type ${aliases.operations} = operations;`,
    );
  }

  if (aliasLines.length === 0) {
    return;
  }

  writeFileSync(outputPath, `${content.trimEnd()}\n\n${aliasLines.join('\n')}\n`);
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

interface SyncReport {
  specsDownloaded: number;
  typesGenerated: number;
  endpointsInSpecs: number;
  toolsImplemented: number;
  missingEndpoints: EndpointInfo[];
}

async function downloadSpecs(): Promise<number> {
  console.log(ui.bold('\n📥 Downloading OpenAPI Specifications\n'));

  console.log(ui.dim(`  Found ${specSources.length} spec URLs\n`));

  let downloaded = 0;
  let failed = 0;
  for (const { api, folder, url } of specSources) {
    const fileName = basename(url);
    const folderPath = join(SPECS_DIR, folder);
    const filePath = join(folderPath, fileName);

    const stopSpinner = showSpinner(`Downloading ${api} (${fileName})...`);

    const downloadedSpec = await Effect.runPromise(
      Effect.either(
        Effect.tryPromise({
          try: async () => {
            mkdirSync(folderPath, { recursive: true });
            const specResponse = await httpRequest<Buffer>({
              url,
              responseType: 'arraybuffer',
              timeoutMs: 20_000,
            });
            writeFileSync(filePath, specResponse.data);
          },
          catch: (error) => error,
        }).pipe(Effect.ensuring(Effect.sync(stopSpinner))),
      ),
    );

    if (Either.isLeft(downloadedSpec)) {
      console.log(
        `  ${ui.error('✗')} ${api} (${fileName}): ${getErrorMessage(downloadedSpec.left)}`,
      );
      failed++;
    } else {
      console.log(`  ${ui.success('✓')} ${api} (${fileName})`);
      downloaded++;
    }
  }

  if (failed > 0 && downloaded === 0) {
    console.log(
      ui.error(
        `\n  ✗ All ${failed} spec downloads failed — eBay is likely blocking automated requests (HTTP 403).`,
      ),
    );
  }

  return downloaded;
}

function generateTypes(): number {
  console.log(ui.bold('\n🔧 Generating TypeScript Types\n'));

  let generated = 0;
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
          preserveGeneratedTypeAliases(outputPath, camelCaseName);
          console.log(`  ${ui.success('✓')} ${camelCaseName}.ts`);
          generated++;
        } else {
          console.log(
            `  ${ui.error('✗')} ${camelCaseName}.ts (generation failed): ${getErrorMessage(generatedFile.left)}`,
          );
        }
      }
    }
  }

  processDirectory(SPECS_DIR);

  console.log(ui.dim(`\n  Generated: ${generated}, Skipped: ${skipped}`));
  return generated;
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

function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function normalizeForMatching(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Known mappings from OpenAPI operationId to our tool names
 * This handles cases where naming conventions differ significantly
 */
const KNOWN_OPERATION_MAPPINGS: Record<string, string[]> = {
  // Feedback API
  getitemsawaitingfeedback: ['ebay_get_awaiting_feedback'],
  leavefeedback: ['ebay_leave_feedback_for_buyer'],

  // Notification API — tools use the ebay_*_notification_* naming convention
  getconfig: ['ebay_get_notification_config'],
  updateconfig: ['ebay_update_notification_config'],
  getdestinations: ['ebay_get_notification_destinations'],
  createdestination: ['ebay_create_notification_destination'],
  getdestination: ['ebay_get_notification_destination'],
  updatedestination: ['ebay_update_notification_destination'],
  deletedestination: ['ebay_delete_notification_destination'],
  getsubscriptions: ['ebay_get_notification_subscriptions'],
  createsubscription: ['ebay_create_notification_subscription'],
  getsubscription: ['ebay_get_notification_subscription'],
  updatesubscription: ['ebay_update_notification_subscription'],
  deletesubscription: ['ebay_delete_notification_subscription'],
  disablesubscription: ['ebay_disable_notification_subscription'],
  enablesubscription: ['ebay_enable_notification_subscription'],
  testsubscription: ['ebay_test_notification_subscription'],
  createsubscriptionfilter: ['ebay_create_notification_subscription_filter'],
  getsubscriptionfilter: ['ebay_get_notification_subscription_filter'],
  deletesubscriptionfilter: ['ebay_delete_notification_subscription_filter'],
  gettopic: ['ebay_get_notification_topic'],
  gettopics: ['ebay_get_notification_topics'],
  getpublickey: ['ebay_get_notification_public_key'],

  // Negotiation API
  findeligibleitems: ['ebay_find_eligible_items'],

  // Marketing API
  createadbylistingid: ['ebay_create_ad_by_listing_id'],
  updatebid: ['ebay_update_bid'],
  bulkcreatekeyword: ['ebay_bulk_create_keyword'],
  bulkupdatekeyword: ['ebay_bulk_update_keyword'],
  bulkcreatenegativekeyword: ['ebay_bulk_create_negative_keyword'],
  bulkupdatenegativekeyword: ['ebay_bulk_update_negative_keyword'],
  getnegativekeywords: ['ebay_get_negative_keywords'],
  createnegativekeyword: ['ebay_create_negative_keyword'],
  getnegativekeyword: ['ebay_get_negative_keyword'],
  updatenegativekeyword: ['ebay_update_negative_keyword'],
  getreportmetadata: ['ebay_get_report_metadata'],
  getreportmetadataforreporttype: ['ebay_get_report_metadata_for_report_type'],
  getpromotionreports: ['ebay_get_promotion_reports'],
  getaudiences: ['ebay_get_audiences'],

  // Dispute/Fulfillment API
  fetchevidencecontent: ['ebay_fetch_evidence_content'],
  getactivities: ['ebay_get_payment_dispute_activities', 'ebay_get_activities'],
  uploadevidencefile: ['ebay_upload_evidence_file'],
  addevidence: ['ebay_add_evidence'],
  updateevidence: ['ebay_update_evidence'],
};

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
            const name = match[1] ?? match[2];
            // Skip common non-method bindings that the broader regex can catch.
            if (!name || name === 'const' || name === 'let' || name === 'var') continue;
            methods.add(normalizeForMatching(name));
          }
        }
      }
    }
  }

  processDirectory(apiDir);
  return methods;
}

/**
 * Generate all possible name variations for an operationId
 */
function generateNameVariations(opId: string): string[] {
  const variations: string[] = [];
  const normalized = normalizeForMatching(opId);

  // Direct variations
  variations.push(normalized);
  variations.push(`ebay${normalized}`);
  variations.push(normalizeForMatching(`ebay_${camelToSnake(opId)}`));
  variations.push(normalizeForMatching(camelToSnake(opId)));

  // Remove common suffixes/prefixes that might differ
  const withoutItems = normalized.replace(/items?$/, '');
  if (withoutItems !== normalized) {
    variations.push(withoutItems);
    variations.push(`ebay${withoutItems}`);
  }

  // Handle "ByX" patterns -> remove them
  const withoutBy = normalized.replace(/by\w+$/, '');
  if (withoutBy !== normalized) {
    variations.push(withoutBy);
    variations.push(`ebay${withoutBy}`);
  }

  // Handle "ForX" patterns -> remove them
  const withoutFor = normalized.replace(/for\w+$/, '');
  if (withoutFor !== normalized) {
    variations.push(withoutFor);
    variations.push(`ebay${withoutFor}`);
  }

  // Handle plural/singular
  if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    const singular = normalized.slice(0, -1);
    variations.push(singular);
    variations.push(`ebay${singular}`);
  } else {
    const plural = normalized + 's';
    variations.push(plural);
    variations.push(`ebay${plural}`);
  }

  // Check known mappings
  if (KNOWN_OPERATION_MAPPINGS[normalized]) {
    for (const mapped of KNOWN_OPERATION_MAPPINGS[normalized]) {
      variations.push(normalizeForMatching(mapped));
    }
  }

  return [...new Set(variations)];
}

function analyzeEndpoints(): { total: number; implemented: number; missing: EndpointInfo[] } {
  console.log(ui.bold('\n📊 Analyzing API Coverage\n'));

  const specEndpoints = extractEndpointsFromSpecs();
  const implementedTools = getImplementedTools();
  const implementedApiMethods = getImplementedApiMethods();

  // Normalize all tool names
  const normalizedTools = new Set(
    Array.from(implementedTools).map((toolName) => normalizeForMatching(toolName)),
  );

  // Combine tools and API methods for matching
  const allImplemented = new Set([...normalizedTools, ...implementedApiMethods]);

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

  const missing: EndpointInfo[] = [];
  let matchedCount = 0;

  for (const endpoint of uniqueEndpoints) {
    const opId = endpoint.operationId;
    const variations = generateNameVariations(opId);

    const isImplemented = variations.some((name) => allImplemented.has(name));

    if (isImplemented) {
      matchedCount++;
    } else {
      missing.push(endpoint);
    }
  }

  const coveragePercent =
    uniqueEndpoints.length > 0 ? ((matchedCount / uniqueEndpoints.length) * 100).toFixed(1) : '0';

  console.log(`  ${ui.info('Total unique endpoints in specs:')} ${uniqueEndpoints.length}`);
  console.log(`  ${ui.info('(Raw count with duplicates:')} ${specEndpoints.length}${ui.info(')')}`);
  console.log(`  ${ui.success('Tools implemented:')} ${implementedTools.size}`);
  console.log(`  ${ui.success('API methods found:')} ${implementedApiMethods.size}`);
  console.log(`  ${ui.success('Endpoints covered:')} ${matchedCount} (${coveragePercent}%)`);
  console.log(`  ${ui.warning('Potentially missing:')} ${missing.length}`);

  return {
    total: uniqueEndpoints.length,
    implemented: matchedCount,
    missing,
  };
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
    typesGenerated: 0,
    endpointsInSpecs: 0,
    toolsImplemented: 0,
    missingEndpoints: [],
  };

  if (!(reportOnly || skipDownload)) {
    report.specsDownloaded = await downloadSpecs();
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
  report.toolsImplemented = analysis.implemented;
  report.missingEndpoints = analysis.missing;

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
