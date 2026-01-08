#!/usr/bin/env node

import axios from 'axios';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');
const DOCS_DIR = join(PROJECT_ROOT, 'docs');
const TYPES_DIR = join(PROJECT_ROOT, 'src/types');
const TOOLS_DIR = join(PROJECT_ROOT, 'src/tools/definitions');

const ui = {
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
  dim: chalk.dim,
  bold: chalk.bold,
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

const SPEC_FOLDER_MAP: Record<string, string> = {
  'developer_analytics_v1_beta_oas3.json': 'application-settings',
  'developer_key_management_v1_oas3.json': 'application-settings',
  'developer_client_registration_v1_oas3.json': 'application-settings',
  'sell_inventory_v1_oas3.json': 'sell-apps/listing-management',
  'sell_feed_v1_oas3.json': 'sell-apps/listing-management',
  'commerce_media_v1_beta_oas3.json': 'sell-apps/listing-management',
  'sell_stores_v1_oas3.json': 'sell-apps/listing-management',
  'sell_metadata_v1_oas3.json': 'sell-apps/listing-metadata',
  'commerce_taxonomy_v1_oas3.json': 'sell-apps/listing-metadata',
  'commerce_charity_v1_oas3.json': 'sell-apps/listing-metadata',
  'sell_account_v1_oas3.json': 'sell-apps/account-management',
  'sell_account_v2_oas3.json': 'sell-apps/account-management',
  'sell_finances_v1_oas3.json': 'sell-apps/account-management',
  'commerce_message_v1_oas3.json': 'sell-apps/communication',
  'commerce_notification_v1_oas3.json': 'sell-apps/communication',
  'sell_negotiation_v1_oas3.json': 'sell-apps/communication',
  'commerce_feedback_v1_beta_oas3.json': 'sell-apps/communication',
  'sell_fulfillment_v1_oas3.json': 'sell-apps/order-management',
  'sell_logistics_v1_oas3.json': 'sell-apps/order-management',
  'sell_marketing_v1_oas3.json': 'sell-apps/marketing-and-promotions',
  'sell_recommendation_v1_oas3.json': 'sell-apps/marketing-and-promotions',
  'sell_analytics_v1_oas3.json': 'sell-apps/analytics-and-report',
  'commerce_translation_v1_beta_oas3.json': 'sell-apps/other-apis',
  'sell_compliance_v1_oas3.json': 'sell-apps/other-apis',
  'commerce_identity_v1_oas3.json': 'sell-apps/other-apis',
  'sell_edelivery_international_shipping_oas3.json': 'sell-apps/other-apis',
  'commerce_vero_v1_oas3.json': 'sell-apps/other-apis',
  'buy_browse_v1_oas3.json': 'buy-apps/inventory-discovery',
  'buy_feed_v1_beta_oas3.json': 'buy-apps/inventory-discovery',
  'buy_feed_v1_oas3.json': 'buy-apps/inventory-discovery',
  'buy_deal_v1_oas3.json': 'buy-apps/marketing-and-discounts',
  'buy_marketing_v1_beta_oas3.json': 'buy-apps/marketing-and-discounts',
  'commerce_catalog_v1_beta_oas3.json': 'buy-apps/marketplace-metadata',
  'buy_order_v2_oas3.json': 'buy-apps/checkout-and-bidding',
  'buy_offer_v1_beta_oas3.json': 'buy-apps/checkout-and-bidding',
};

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

  const readmePath = join(DOCS_DIR, 'sell-apps/README.md');
  if (!existsSync(readmePath)) {
    console.log(ui.warning(`  ⚠ README not found at ${readmePath}`));
    console.log(ui.dim('    Create docs/sell-apps/README.md with spec URLs'));
    return 0;
  }

  const readmeContent = readFileSync(readmePath, 'utf-8');
  const urlRegex = /(https:\/\/[^\s)]+\.json)/g;
  const urls = Array.from(readmeContent.matchAll(urlRegex)).map((m) => m[1]);

  if (urls.length === 0) {
    console.log(ui.warning('  ⚠ No spec URLs found in README'));
    return 0;
  }

  console.log(ui.dim(`  Found ${urls.length} spec URLs\n`));

  let downloaded = 0;
  for (const url of urls) {
    const fileName = basename(url);
    const folderName = SPEC_FOLDER_MAP[fileName] || 'other-apis';
    const folderPath = join(DOCS_DIR, folderName);
    const filePath = join(folderPath, fileName);

    try {
      mkdirSync(folderPath, { recursive: true });
      const stopSpinner = showSpinner(`Downloading ${fileName}...`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      stopSpinner();
      writeFileSync(filePath, response.data);
      console.log(`  ${ui.success('✓')} ${fileName}`);
      downloaded++;
    } catch (error) {
      console.log(`  ${ui.error('✗')} ${fileName}: ${(error as Error).message}`);
    }
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
        try {
          const content = readFileSync(fullPath, 'utf-8');
          if (!content.includes('"openapi"') && !content.includes('"swagger"')) {
            skipped++;
            continue;
          }

          const relativePath = fullPath.replace(DOCS_DIR + '/', '');
          const outputDir = join(TYPES_DIR, dirname(relativePath));

          mkdirSync(outputDir, { recursive: true });

          const baseFileName = basename(entry.name, '.json');
          const camelCaseName = baseFileName
            .split(/[_.-]/)
            .map((part, i) =>
              i === 0
                ? part.toLowerCase()
                : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join('');

          const outputPath = join(outputDir, `${camelCaseName}.ts`);

          try {
            execSync(`npx openapi-typescript "${fullPath}" -o "${outputPath}" --silent`, {
              stdio: 'pipe',
              cwd: PROJECT_ROOT,
            });
            console.log(`  ${ui.success('✓')} ${camelCaseName}.ts`);
            generated++;
          } catch {
            console.log(`  ${ui.error('✗')} ${camelCaseName}.ts (generation failed)`);
          }
        } catch {
          skipped++;
        }
      }
    }
  }

  processDirectory(DOCS_DIR);

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
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const spec = JSON.parse(content) as OpenAPISpec;

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
        } catch {
          continue;
        }
      }
    }
  }

  processDirectory(DOCS_DIR);
  return endpoints;
}

function getImplementedTools(): Set<string> {
  const tools = new Set<string>();

  if (!existsSync(TOOLS_DIR)) return tools;

  const files = readdirSync(TOOLS_DIR, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.ts')) {
      const content = readFileSync(join(TOOLS_DIR, file.name), 'utf-8');

      const nameMatches = content.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g);
      for (const match of nameMatches) {
        tools.add(match[1]);
      }
    }
  }

  return tools;
}

function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function normalizeToolName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function analyzeEndpoints(): { total: number; implemented: number; missing: EndpointInfo[] } {
  console.log(ui.bold('\n📊 Analyzing API Coverage\n'));

  const specEndpoints = extractEndpointsFromSpecs();
  const implementedTools = getImplementedTools();

  const normalizedTools = new Set(Array.from(implementedTools).map((t) => normalizeToolName(t)));

  const missing: EndpointInfo[] = [];
  let matchedCount = 0;

  for (const endpoint of specEndpoints) {
    const opId = endpoint.operationId;

    const possibleNames = [
      `ebay_${camelToSnake(opId)}`,
      `ebay${opId.toLowerCase()}`,
      camelToSnake(opId),
      opId.toLowerCase(),
    ];

    const normalizedPossible = possibleNames.map((n) => normalizeToolName(n));

    const isImplemented = normalizedPossible.some((name) => normalizedTools.has(name));

    if (isImplemented) {
      matchedCount++;
    } else {
      missing.push(endpoint);
    }
  }

  const coveragePercent =
    specEndpoints.length > 0 ? ((matchedCount / specEndpoints.length) * 100).toFixed(1) : '0';

  console.log(`  ${ui.info('Total endpoints in specs:')} ${specEndpoints.length}`);
  console.log(`  ${ui.success('Tools implemented:')} ${implementedTools.size}`);
  console.log(`  ${ui.success('Endpoints covered:')} ${matchedCount} (${coveragePercent}%)`);
  console.log(`  ${ui.warning('Potentially missing:')} ${missing.length}`);

  return {
    total: specEndpoints.length,
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
    ui.dim('  These endpoints were found in specs but may not have corresponding tools:\n')
  );

  const grouped = missing.reduce(
    (acc, ep) => {
      const key = ep.path.split('/')[1] || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(ep);
      return acc;
    },
    {} as Record<string, EndpointInfo[]>
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
  const reportPath = join(PROJECT_ROOT, 'dev-sync-report.json');
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
`)
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

  if (!reportOnly && !skipDownload) {
    report.specsDownloaded = await downloadSpecs();
  }

  if (!reportOnly && !skipTypes) {
    report.typesGenerated = generateTypes();
  }

  const analysis = analyzeEndpoints();
  report.endpointsInSpecs = analysis.total;
  report.toolsImplemented = analysis.implemented;
  report.missingEndpoints = analysis.missing;

  showMissingEndpoints(analysis.missing);
  generateReport(report);

  console.log(ui.bold.green('✓ Sync complete!\n'));
}

main().catch((error) => {
  console.error(ui.error('\n  Sync failed:'), error);
  process.exit(1);
});
