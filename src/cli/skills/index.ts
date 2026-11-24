import { buildContributingDoc, buildUsingDoc } from "@/cli/skills/content.js";
import { planWrite } from "@/cli/skills/install.js";
import { buildRegistrySnapshot } from "@/cli/skills/registrySnapshot.js";
import { renderSkill } from "@/cli/skills/render.js";
import { resolveTargets } from "@/cli/skills/targets.js";
import type {
	RegistrySnapshot,
	SkillDoc,
	SkillLayer,
	SkillProvider,
	SkillScope,
	SkillTarget,
	WritePlan,
} from "@/cli/skills/types.js";

export { buildContributingDoc, buildUsingDoc } from "@/cli/skills/content.js";
export {
	type ApplyResult,
	applyWrite,
	planWrite,
} from "@/cli/skills/install.js";
export { buildRegistrySnapshot } from "@/cli/skills/registrySnapshot.js";
export {
	renderClaudeSkill,
	renderCodexSection,
	renderCursorRule,
	renderSkill,
} from "@/cli/skills/render.js";
export {
	ALL_PROVIDERS,
	detectProvider,
	providerLabel,
	resolveTargets,
	supportsScope,
} from "@/cli/skills/targets.js";
export * from "@/cli/skills/types.js";

export function buildSkillDoc(
	layer: SkillLayer,
	snapshot: RegistrySnapshot = buildRegistrySnapshot(),
): SkillDoc {
	return layer == "using"
		? buildUsingDoc(snapshot)
		: buildContributingDoc(snapshot);
}

export interface BuildPlansOptions {
	providers: readonly SkillProvider[];
	layers: readonly SkillLayer[];
	scope: SkillScope;
	cwd?: string;
	home?: string;
	snapshot?: RegistrySnapshot;
}

export interface RenderedTarget {
	target: SkillTarget;
	payload: string;
}

export function renderSkillTargets(
	options: BuildPlansOptions,
): RenderedTarget[] {
	const snapshot = options.snapshot ?? buildRegistrySnapshot();
	const docByLayer: Record<SkillLayer, SkillDoc> = {
		using: buildUsingDoc(snapshot),
		contributing: buildContributingDoc(snapshot),
	};
	const targets = resolveTargets(
		options.providers,
		options.layers,
		options.scope,
		options.cwd,
		options.home,
	);
	return targets.map((target) => ({
		target,
		payload: renderSkill(
			target.provider,
			docByLayer[target.layer],
			target.layer,
		),
	}));
}

export function buildSkillPlans(options: BuildPlansOptions): WritePlan[] {
	return renderSkillTargets(options).map((rendered) =>
		planWrite(rendered.target, rendered.payload),
	);
}
