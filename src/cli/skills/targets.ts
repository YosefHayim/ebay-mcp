import process from "node:process";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type {
	SkillLayer,
	SkillProvider,
	SkillScope,
	SkillTarget,
	SkillTargetKind,
} from "@/cli/skills/types.js";

export const ALL_PROVIDERS: readonly SkillProvider[] = [
	"claude",
	"cursor",
	"codex",
];

export function providerLabel(provider: SkillProvider): string {
	switch (provider) {
		case "claude":
			return "Claude Code (.claude/skills)";
		case "cursor":
			return "Cursor (.cursor/rules)";
		case "codex":
			return "Codex (AGENTS.md)";
	}
}

export function supportsScope(
	provider: SkillProvider,
	scope: SkillScope,
): boolean {
	if (provider == "cursor") return scope == "project";
	return true;
}

function slug(layer: SkillLayer): string {
	return `ebay-mcp-${layer}`;
}

function resolvePath(
	provider: SkillProvider,
	layer: SkillLayer,
	scope: SkillScope,
	cwd: string,
	home: string,
): string {
	const base = scope == "project" ? cwd : home;
	switch (provider) {
		case "claude":
			return join(base, ".claude", "skills", slug(layer), "SKILL.md");
		case "cursor":
			return join(cwd, ".cursor", "rules", `${slug(layer)}.mdc`);
		case "codex":
			return scope == "project"
				? join(cwd, "AGENTS.md")
				: join(home, ".codex", "AGENTS.md");
	}
}

function targetKind(provider: SkillProvider): SkillTargetKind {
	return provider == "codex" ? "managed-block" : "owned-file";
}

export function detectProvider(
	provider: SkillProvider,
	scope: SkillScope,
	cwd: string,
	home: string,
): boolean {
	switch (provider) {
		case "claude":
			return existsSync(join(scope == "project" ? cwd : home, ".claude"));
		case "cursor":
			return existsSync(join(cwd, ".cursor"));
		case "codex":
			return scope == "project"
				? existsSync(join(cwd, "AGENTS.md"))
				: existsSync(join(home, ".codex"));
	}
}

export function resolveTargets(
	providers: readonly SkillProvider[],
	layers: readonly SkillLayer[],
	scope: SkillScope,
	cwd: string = process.cwd(),
	home: string = homedir(),
): SkillTarget[] {
	const targets: SkillTarget[] = [];
	for (const provider of providers) {
		const effectiveScope: SkillScope = supportsScope(provider, scope)
			? scope
			: "project";
		for (const layer of layers) {
			targets.push({
				provider,
				scope: effectiveScope,
				layer,
				path: resolvePath(provider, layer, effectiveScope, cwd, home),
				kind: targetKind(provider),
				detected: detectProvider(provider, effectiveScope, cwd, home),
			});
		}
	}
	return targets;
}
