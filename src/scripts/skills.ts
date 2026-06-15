#!/usr/bin/env node

import { resolve } from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import {
  ALL_PROVIDERS,
  applyWrite,
  buildRegistrySnapshot,
  detectProvider,
  planWrite,
  providerLabel,
  renderSkillTargets,
  type SkillLayer,
  type SkillProvider,
  type SkillScope,
  type WritePlan,
} from '@/skills/index.js';
import {
  ebayPalette,
  printHeading,
  printInfo,
  printRule,
  printSuccess,
  printWarning,
  ui,
} from '@/utils/cli-ui.js';

/** Parsed command-line options for the skills installer. */
interface SkillsFlags {
  help: boolean;
  yes: boolean;
  dryRun: boolean;
  force: boolean;
  global: boolean;
  providers?: SkillProvider[];
  layers?: SkillLayer[];
}

const ALL_LAYERS: readonly SkillLayer[] = ['using', 'contributing'];

/** Splits a comma list flag value into trimmed, non-empty tokens. */
function parseList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

/** Reads the value after a `--flag value` or `--flag=value` argument. */
function readFlagValue(argv: string[], flag: string): string | undefined {
  const inline = argv.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = argv.indexOf(flag);
  if (index !== -1 && index + 1 < argv.length) return argv[index + 1];
  return undefined;
}

/** Parses skills CLI flags, ignoring the leading `skills` subcommand token. */
function parseFlags(argv: string[]): SkillsFlags {
  const args = argv.filter((arg) => arg !== 'skills');
  const providers = parseList(readFlagValue(args, '--providers')).filter(
    (value): value is SkillProvider => (ALL_PROVIDERS as readonly string[]).includes(value)
  );
  const layers = parseList(
    readFlagValue(args, '--layer') ?? readFlagValue(args, '--layers')
  ).filter((value): value is SkillLayer => (ALL_LAYERS as readonly string[]).includes(value));
  return {
    help: args.includes('--help') || args.includes('-h'),
    yes: args.includes('--yes') || args.includes('-y'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    global: args.includes('--global'),
    providers: providers.length > 0 ? providers : undefined,
    layers: layers.length > 0 ? layers : undefined,
  };
}

/** One-line summary of what an action means, for the preview. */
function actionLabel(action: WritePlan['action']): string {
  switch (action) {
    case 'create':
      return ui.success('create');
    case 'update':
      return ui.info('update');
    case 'unchanged':
      return ui.dim('unchanged');
    case 'skip-foreign':
      return ui.warning('skip (foreign file)');
  }
}

/** Prints the planned writes so the user can review before anything is written. */
function printPreview(plans: WritePlan[]): void {
  printHeading('Planned changes');
  printRule();
  for (const plan of plans) {
    const { provider, layer, scope } = plan.target;
    console.log(
      `  ${actionLabel(plan.action).padEnd(28)} ${ui.bold(`${provider}/${layer}`)} ${ui.dim(`(${scope})`)}`
    );
    console.log(`  ${ui.dim('→ ' + plan.target.path)}`);
  }
  printRule();
}

/** Prints CLI usage. */
function printHelp(): void {
  console.log(`
${ui.bold('ebay-mcp skills')}  ${ui.dim('install AI skills for Codex, Claude Code, and Cursor')}

${ui.bold('Usage:')}
  ebay-mcp skills [options]
  npm run skills -- [options]

${ui.bold('Options:')}
  -h, --help              Show this help
  -y, --yes               Non-interactive; accept detected defaults and flags
      --providers <list>  Comma list: claude,cursor,codex
      --layer <list>      Comma list: using,contributing  (default: using)
      --global            Install to your home dir instead of this project
      --dry-run           Show planned changes without writing
      --force             Overwrite a same-named file we did not generate

${ui.bold('Examples:')}
  ebay-mcp skills
  ebay-mcp skills --providers cursor,codex --layer using --dry-run
  ebay-mcp skills --yes
`);
}

/** Resolves the providers to use, preferring flags, else detection at the scope. */
function resolveDefaultProviders(scope: SkillScope, cwd: string, home: string): SkillProvider[] {
  return ALL_PROVIDERS.filter((provider) => detectProvider(provider, scope, cwd, home));
}

/**
 * Runs the skills installer end to end: detect → choose providers/layers/scope →
 * preview → confirm → write. Interactive by default; non-interactive when `--yes`
 * is passed or stdin is not a TTY (so `npx ebay-mcp skills` in CI won't hang).
 *
 * Shared by the `ebay-mcp skills` subcommand, `npm run skills`, and the optional
 * step at the end of `npm run setup`.
 *
 * @param options `argv` overrides process args; `fromSetup` trims the banner.
 */
export async function runSkillsWizard(
  options: { argv?: string[]; fromSetup?: boolean } = {}
): Promise<void> {
  const flags = parseFlags(options.argv ?? process.argv.slice(2));
  if (flags.help) {
    printHelp();
    return;
  }

  const cwd = process.cwd();
  const home = process.env.HOME ?? process.env.USERPROFILE ?? cwd;
  const snapshot = buildRegistrySnapshot();
  const nonInteractive = flags.yes || !process.stdin.isTTY;

  if (!options.fromSetup) {
    console.log(`\n  ${ebayPalette.blue.bold('eBay MCP')} ${ui.bold('· AI skills installer')}`);
    console.log(
      `  ${ui.dim(`Generate skills for Codex, Claude Code, and Cursor from ${snapshot.toolCount} live tools.`)}\n`
    );
  }

  let providers: SkillProvider[];
  let layers: SkillLayer[];
  let scope: SkillScope;

  if (nonInteractive) {
    scope = flags.global ? 'global' : 'project';
    providers = flags.providers ?? resolveDefaultProviders(scope, cwd, home);
    layers = flags.layers ?? ['using'];
    if (providers.length === 0) {
      printWarning('No AI tools detected and none specified (--providers). Nothing to do.');
      return;
    }
    printInfo(`Non-interactive: ${providers.join(', ')} · ${layers.join(', ')} · ${scope}`);
  } else {
    const detectedProject = resolveDefaultProviders('project', cwd, home);
    let cancelled = false;
    const onCancel = (): boolean => {
      cancelled = true;
      return false;
    };
    const answers = (await prompts(
      [
        {
          type: 'multiselect',
          name: 'providers',
          message: 'Install skills for which AI tools?',
          instructions: false,
          choices: ALL_PROVIDERS.map((provider) => ({
            title: providerLabel(provider),
            value: provider,
            selected: flags.providers
              ? flags.providers.includes(provider)
              : detectedProject.includes(provider),
          })),
        },
        {
          type: 'multiselect',
          name: 'layers',
          message: 'Which skills?',
          instructions: false,
          choices: [
            { title: 'Using — drive the eBay tools', value: 'using', selected: true },
            {
              title: 'Contributing — work on the ebay-mcp repo',
              value: 'contributing',
              selected: flags.layers?.includes('contributing') ?? false,
            },
          ],
        },
        {
          type: 'select',
          name: 'scope',
          message: 'Where should they be installed?',
          choices: [
            { title: 'This project (recommended)', value: 'project' },
            { title: 'Global — my home dir (Cursor stays project-local)', value: 'global' },
          ],
          initial: flags.global ? 1 : 0,
        },
      ],
      { onCancel }
    )) as { providers?: SkillProvider[]; layers?: SkillLayer[]; scope?: SkillScope };

    if (cancelled) {
      printWarning('Cancelled — nothing written.');
      return;
    }
    providers = answers.providers ?? [];
    layers = answers.layers ?? [];
    scope = answers.scope ?? 'project';

    if (providers.length === 0 || layers.length === 0) {
      printWarning('Nothing selected — nothing written.');
      return;
    }
  }

  const rendered = renderSkillTargets({ providers, layers, scope, cwd, home, snapshot });
  const plans = rendered.map((item) => planWrite(item.target, item.payload));
  printPreview(plans);

  if (flags.dryRun) {
    printInfo('Dry run — no files written.');
    return;
  }

  const foreign = plans.filter((plan) => plan.action === 'skip-foreign');
  if (foreign.length > 0 && !flags.force) {
    printWarning(
      `${foreign.length} file(s) exist that this tool did not generate and will be skipped. Re-run with --force to overwrite.`
    );
  }

  if (!nonInteractive) {
    const writable = plans.filter(
      (plan) => plan.action !== 'unchanged' && !(plan.action === 'skip-foreign' && !flags.force)
    ).length;
    if (writable === 0) {
      printInfo('Everything is already up to date.');
      return;
    }
    let cancelled = false;
    const { go } = (await prompts(
      { type: 'confirm', name: 'go', message: `Write ${writable} file(s)?`, initial: true },
      {
        onCancel: () => {
          cancelled = true;
          return false;
        },
      }
    )) as { go?: boolean };
    if (cancelled || !go) {
      printWarning('Cancelled — nothing written.');
      return;
    }
  }

  // Re-plan each write against current disk state so that two managed-block
  // targets sharing one file (both Codex layers → one AGENTS.md) compose instead
  // of the second clobbering the first.
  let written = 0;
  for (const item of rendered) {
    const plan = planWrite(item.target, item.payload);
    const result = applyWrite(plan, { dryRun: false, force: flags.force });
    if (result.written) {
      written += 1;
      printSuccess(`${result.action} ${plan.target.path}`);
    }
  }

  printHeading('Done');
  printInfo(`${written} file(s) written. Restart your AI tool so it picks up the new skills.`);
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
const modulePath = resolve(fileURLToPath(import.meta.url));
if (entryPath && modulePath === entryPath) {
  runSkillsWizard().catch((error) => {
    console.error(ui.error('\n  Skills install failed:'), error);
    process.exit(1);
  });
}
