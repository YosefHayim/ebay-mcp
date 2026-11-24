#!/usr/bin/env node

import process from "node:process";
import {
	type AskChoice,
	askConfirm,
	askMultiselect,
	askSelect,
} from "@/cli/setupWizard.js";
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
} from "@/cli/skills/index.js";
import {
	ebayPalette,
	printHeading,
	printInfo,
	printRule,
	printSuccess,
	printWarning,
	ui,
} from "@/shared/cliUi.js";
import { isEntryModule } from "@/shared/entryModule.js";
import { getErrorMessage } from "@/shared/errors.js";

interface SkillsFlags {
	help: boolean;
	yes: boolean;
	dryRun: boolean;
	force: boolean;
	global: boolean;
	providers?: SkillProvider[] | undefined;
	layers?: SkillLayer[] | undefined;
}

interface RunSkillsWizardOptions {
	argv?: string[];
	fromSetup?: boolean;
}

const ALL_LAYERS: readonly SkillLayer[] = ["using", "contributing"];

function parseList(rawList: string | undefined): string[] {
	return (rawList ?? "")
		.split(",")
		.map((token) => token.trim())
		.filter(Boolean);
}

function readFlagValue(argv: string[], flag: string): string | undefined {
	const inline = argv.find((arg) => arg.startsWith(`${flag}=`));
	if (inline) return inline.slice(flag.length + 1);
	const index = argv.indexOf(flag);
	if (index != -1 && index + 1 < argv.length) return argv[index + 1];
	return undefined;
}

function parseFlags(argv: string[]): SkillsFlags {
	const args = argv.filter((arg) => arg != "skills");
	const providers = parseList(readFlagValue(args, "--providers")).filter(
		(token): token is SkillProvider =>
			(ALL_PROVIDERS as readonly string[]).includes(token),
	);
	const layers = parseList(
		readFlagValue(args, "--layer") ?? readFlagValue(args, "--layers"),
	).filter((token): token is SkillLayer =>
		(ALL_LAYERS as readonly string[]).includes(token),
	);
	return {
		help: args.includes("--help") || args.includes("-h"),
		yes: args.includes("--yes") || args.includes("-y"),
		dryRun: args.includes("--dry-run"),
		force: args.includes("--force"),
		global: args.includes("--global"),
		providers: providers.length > 0 ? providers : undefined,
		layers: layers.length > 0 ? layers : undefined,
	};
}

function actionLabel(action: WritePlan["action"]): string {
	switch (action) {
		case "create":
			return ui.success("create");
		case "update":
			return ui.info("update");
		case "unchanged":
			return ui.dim("unchanged");
		case "skip-foreign":
			return ui.warning("skip (foreign file)");
	}
}

function printPreview(plans: WritePlan[]): void {
	printHeading("Planned changes");
	printRule();
	for (const plan of plans) {
		const { provider, layer, scope } = plan.target;
		console.log(
			`  ${actionLabel(plan.action).padEnd(28)} ${ui.bold(`${provider}/${layer}`)} ${ui.dim(`(${scope})`)}`,
		);
		console.log(`  ${ui.dim("→ " + plan.target.path)}`);
	}
	printRule();
}

function printHelp(): void {
	console.log(`
${ui.bold("ebay-mcp skills")}  ${ui.dim("install AI skills for Codex, Claude Code, and Cursor")}

${ui.bold("Usage:")}
  ebay-mcp skills [options]
  npm run skills -- [options]

${ui.bold("Options:")}
  -h, --help              Show this help
  -y, --yes               Non-interactive; accept detected defaults and flags
      --providers <list>  Comma list: claude,cursor,codex
      --layer <list>      Comma list: using,contributing  (default: using)
      --global            Install to your home dir instead of this project
      --dry-run           Show planned changes without writing
      --force             Overwrite a same-named file we did not generate

${ui.bold("Examples:")}
  ebay-mcp skills
  ebay-mcp skills --providers cursor,codex --layer using --dry-run
  ebay-mcp skills --yes
`);
}

function resolveDefaultProviders(
	scope: SkillScope,
	cwd: string,
	home: string,
): SkillProvider[] {
	return ALL_PROVIDERS.filter((provider) =>
		detectProvider(provider, scope, cwd, home),
	);
}

export async function runSkillsWizard(
	options: RunSkillsWizardOptions = {},
): Promise<void> {
	const flags = parseFlags(options.argv ?? process.argv.slice(2));
	if (flags.help) {
		printHelp();
		return;
	}

	const cwd = process.cwd();
	const home = process.env["HOME"] ?? process.env["USERPROFILE"] ?? cwd;
	const snapshot = buildRegistrySnapshot();
	const nonInteractive = flags.yes || !process.stdin.isTTY;

	if (!options.fromSetup) {
		console.log(
			`\n  ${ebayPalette.blue.bold("eBay MCP")} ${ui.bold("· AI skills installer")}`,
		);
		console.log(
			`  ${ui.dim(`Generate skills for Codex, Claude Code, and Cursor from ${snapshot.toolCount} live tools.`)}\n`,
		);
	}

	let providers: SkillProvider[];
	let layers: SkillLayer[];
	let scope: SkillScope;

	if (nonInteractive) {
		scope = flags.global ? "global" : "project";
		providers = flags.providers ?? resolveDefaultProviders(scope, cwd, home);
		layers = flags.layers ?? ["using"];
		if (providers.length == 0) {
			printWarning(
				"No AI tools detected and none specified (--providers). Nothing to do.",
			);
			return;
		}
		printInfo(
			`Non-interactive: ${providers.join(", ")} · ${layers.join(", ")} · ${scope}`,
		);
	} else {
		const detectedProject = resolveDefaultProviders("project", cwd, home);

		function describeProvider(
			provider: SkillProvider,
		): AskChoice<SkillProvider> {
			const flagged = flags.providers;
			const isFlagged = flagged !== undefined;

			if (isFlagged) {
				return {
					label: providerLabel(provider),
					value: provider,
					selected: flagged.includes(provider),
				};
			}

			return {
				label: providerLabel(provider),
				value: provider,
				selected: detectedProject.includes(provider),
			};
		}

		const providerChoices = ALL_PROVIDERS.map(describeProvider);
		const providerAnswer = await askMultiselect({
			message: "Install skills for which AI tools?",
			choices: providerChoices,
		});
		const isProviderCancelled = providerAnswer.cancelled;

		if (isProviderCancelled) {
			printWarning("Cancelled — nothing written.");
			return;
		}

		const layerChoices: AskChoice<SkillLayer>[] = [
			{
				label: "Using — drive the eBay tools",
				value: "using",
				selected: true,
			},
			{
				label: "Contributing — work on the ebay-mcp repo",
				value: "contributing",
				selected: flags.layers?.includes("contributing") ?? false,
			},
		];
		const layerAnswer = await askMultiselect({
			message: "Which skills?",
			choices: layerChoices,
		});
		const isLayerCancelled = layerAnswer.cancelled;

		if (isLayerCancelled) {
			printWarning("Cancelled — nothing written.");
			return;
		}

		const scopeChoices: AskChoice<SkillScope>[] = [
			{ label: "This project (recommended)", value: "project" },
			{
				label: "Global — my home dir (Cursor stays project-local)",
				value: "global",
			},
		];
		const scopeInitial = flags.global ? 1 : 0;
		const scopeAnswer = await askSelect({
			message: "Where should they be installed?",
			choices: scopeChoices,
			initial: scopeInitial,
		});
		const isScopeCancelled = scopeAnswer.cancelled;

		if (isScopeCancelled) {
			printWarning("Cancelled — nothing written.");
			return;
		}

		providers = providerAnswer.value ?? [];
		layers = layerAnswer.value ?? [];
		scope = scopeAnswer.value ?? "project";

		if (providers.length == 0 || layers.length == 0) {
			printWarning("Nothing selected — nothing written.");
			return;
		}
	}

	const rendered = renderSkillTargets({
		providers,
		layers,
		scope,
		cwd,
		home,
		snapshot,
	});
	const plans = rendered.map((renderedTarget) =>
		planWrite(renderedTarget.target, renderedTarget.payload),
	);
	printPreview(plans);

	if (flags.dryRun) {
		printInfo("Dry run — no files written.");
		return;
	}

	const foreign = plans.filter((plan) => plan.action == "skip-foreign");
	if (foreign.length > 0 && !flags.force) {
		printWarning(
			`${foreign.length} file(s) exist that this tool did not generate and will be skipped. Re-run with --force to overwrite.`,
		);
	}

	if (!nonInteractive) {
		const writable = plans.filter(
			(plan) =>
				plan.action != "unchanged" &&
				!(plan.action == "skip-foreign" && !flags.force),
		).length;
		if (writable == 0) {
			printInfo("Everything is already up to date.");
			return;
		}
		const goAnswer = await askConfirm({
			message: `Write ${writable} file(s)?`,
			initial: true,
		});
		const isDeclined = goAnswer.value != true;

		if (isDeclined) {
			printWarning("Cancelled — nothing written.");
			return;
		}
	}

	// Re-plan each write against current disk state so that two managed-block
	// targets sharing one file (both Codex layers → one AGENTS.md) compose instead
	// of the second clobbering the first.
	let written = 0;
	for (const renderedTarget of rendered) {
		const plan = planWrite(renderedTarget.target, renderedTarget.payload);
		const applied = applyWrite(plan, { dryRun: false, force: flags.force });
		if (applied.written) {
			written += 1;
			printSuccess(`${applied.action} ${plan.target.path}`);
		}
	}

	printHeading("Done");
	printInfo(
		`${written} file(s) written. Restart your AI tool so it picks up the new skills.`,
	);
}

if (isEntryModule(import.meta.url)) {
	try {
		await runSkillsWizard();
	} catch (error) {
		console.error(
			ui.error("\n  Skills install failed:"),
			getErrorMessage(error),
		);
		process.exitCode = 1;
	}
}
