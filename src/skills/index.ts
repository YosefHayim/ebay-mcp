import type {
  SkillDoc,
  SkillLayer,
  SkillProvider,
  SkillScope,
  SkillTarget,
  WritePlan,
} from '@/skills/types.js';
import { buildRegistrySnapshot } from '@/skills/registry-snapshot.js';
import { buildContributingDoc, buildUsingDoc } from '@/skills/content.js';
import { renderSkill } from '@/skills/render.js';
import { resolveTargets } from '@/skills/targets.js';
import { planWrite } from '@/skills/install.js';
import type { RegistrySnapshot } from '@/skills/types.js';

export * from '@/skills/types.js';
export { buildRegistrySnapshot } from '@/skills/registry-snapshot.js';
export { buildUsingDoc, buildContributingDoc } from '@/skills/content.js';
export {
  renderSkill,
  renderClaudeSkill,
  renderCursorRule,
  renderCodexSection,
} from '@/skills/render.js';
export {
  ALL_PROVIDERS,
  providerLabel,
  supportsScope,
  detectProvider,
  resolveTargets,
} from '@/skills/targets.js';
export { planWrite, applyWrite, type ApplyResult } from '@/skills/install.js';

/**
 * Returns the canonical document for a layer with the live registry injected.
 *
 * @param layer Which audience the skill serves.
 * @param snapshot Live registry snapshot (defaults to a fresh one).
 */
export function buildSkillDoc(
  layer: SkillLayer,
  snapshot: RegistrySnapshot = buildRegistrySnapshot()
): SkillDoc {
  return layer === 'using' ? buildUsingDoc(snapshot) : buildContributingDoc(snapshot);
}

/** Inputs for {@link buildSkillPlans}. */
export interface BuildPlansOptions {
  providers: readonly SkillProvider[];
  layers: readonly SkillLayer[];
  scope: SkillScope;
  cwd?: string;
  home?: string;
  snapshot?: RegistrySnapshot;
}

/** A resolved target paired with its rendered payload, ready to plan/apply. */
export interface RenderedTarget {
  target: SkillTarget;
  /** Full file for owned targets; inner block content for managed targets. */
  payload: string;
}

/**
 * The end-to-end core: resolves targets for the chosen providers × layers,
 * renders each into its provider's native format, and returns idempotent write
 * plans — without touching disk. Both the wizard and tests build on this.
 *
 * @param options Providers, layers, scope, and optional cwd/home/snapshot overrides.
 * @returns One {@link RenderedTarget} per provider/layer target.
 */
export function renderSkillTargets(options: BuildPlansOptions): RenderedTarget[] {
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
    options.home
  );
  return targets.map((target) => ({
    target,
    payload: renderSkill(target.provider, docByLayer[target.layer], target.layer),
  }));
}

/**
 * Builds preview write plans for the chosen providers × layers. Note: when two
 * managed-block targets share a file (both Codex layers → one `AGENTS.md`), each
 * plan here is computed against the same on-disk content, so apply each write
 * by re-planning from {@link RenderedTarget} (see the wizard) rather than
 * applying these plans directly — otherwise the second same-file write would not
 * see the first.
 *
 * @param options Providers, layers, scope, and optional cwd/home/snapshot overrides.
 * @returns One {@link WritePlan} per provider/layer target.
 */
export function buildSkillPlans(options: BuildPlansOptions): WritePlan[] {
  return renderSkillTargets(options).map((rendered) =>
    planWrite(rendered.target, rendered.payload)
  );
}
