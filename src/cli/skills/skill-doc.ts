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

export function buildSkillDoc(
	layer: SkillLayer,
	snapshot: RegistrySnapshot = buildRegistrySnapshot(),
): SkillDoc {
	const isUsingLayer = layer == "using";

	if (isUsingLayer) {
		return buildUsingDoc(snapshot);
	}

	return buildContributingDoc(snapshot);
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

	function renderOneTarget(target: SkillTarget): RenderedTarget {
		const document = docByLayer[target.layer];

		return {
			target,
			payload: renderSkill(target.provider, document, target.layer),
		};
	}

	return targets.map(renderOneTarget);
}

export function buildSkillPlans(options: BuildPlansOptions): WritePlan[] {
	const renderedTargets = renderSkillTargets(options);

	function planRendered(rendered: RenderedTarget): WritePlan {
		return planWrite(rendered.target, rendered.payload);
	}

	return renderedTargets.map(planRendered);
}
