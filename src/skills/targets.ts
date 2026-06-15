import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type {
  SkillLayer,
  SkillProvider,
  SkillScope,
  SkillTarget,
  SkillTargetKind,
} from '@/skills/types.js';

/** All providers we can render for, in display order. */
export const ALL_PROVIDERS: readonly SkillProvider[] = ['claude', 'cursor', 'codex'];

/** Human label for a provider, used in the wizard and reports. */
export function providerLabel(provider: SkillProvider): string {
  switch (provider) {
    case 'claude':
      return 'Claude Code (.claude/skills)';
    case 'cursor':
      return 'Cursor (.cursor/rules)';
    case 'codex':
      return 'Codex (AGENTS.md)';
  }
}

/**
 * Whether a provider supports a given scope. Cursor only reads project-local
 * rule files, so it has no global scope.
 */
export function supportsScope(provider: SkillProvider, scope: SkillScope): boolean {
  if (provider === 'cursor') return scope === 'project';
  return true;
}

/** The filename slug for a layer, shared by Claude skill dirs and Cursor rule files. */
function slug(layer: SkillLayer): string {
  return `ebay-mcp-${layer}`;
}

/** Absolute path of the rendered file for a provider/layer/scope. */
function resolvePath(
  provider: SkillProvider,
  layer: SkillLayer,
  scope: SkillScope,
  cwd: string,
  home: string
): string {
  const base = scope === 'project' ? cwd : home;
  switch (provider) {
    case 'claude':
      return join(base, '.claude', 'skills', slug(layer), 'SKILL.md');
    case 'cursor':
      return join(cwd, '.cursor', 'rules', `${slug(layer)}.mdc`);
    case 'codex':
      return scope === 'project' ? join(cwd, 'AGENTS.md') : join(home, '.codex', 'AGENTS.md');
  }
}

/** Codex shares one `AGENTS.md` (managed block); the others own their own file. */
function targetKind(provider: SkillProvider): SkillTargetKind {
  return provider === 'codex' ? 'managed-block' : 'owned-file';
}

/**
 * Detects whether a provider already has a footprint at this scope, so the
 * wizard can pre-select the tools a developer actually uses. Looks for the
 * provider's instruction directory/file rather than the MCP client config —
 * this is about where agent instructions live, which the MCP detector does not
 * model.
 */
export function detectProvider(
  provider: SkillProvider,
  scope: SkillScope,
  cwd: string,
  home: string
): boolean {
  switch (provider) {
    case 'claude':
      return existsSync(join(scope === 'project' ? cwd : home, '.claude'));
    case 'cursor':
      return existsSync(join(cwd, '.cursor'));
    case 'codex':
      return scope === 'project'
        ? existsSync(join(cwd, 'AGENTS.md'))
        : existsSync(join(home, '.codex'));
  }
}

/**
 * Resolves the concrete write targets for the chosen providers × layers at a
 * scope. Cursor is coerced to project scope (it has no global rules), so it is
 * never silently dropped when a user picks "global".
 *
 * @param providers Selected providers.
 * @param layers Selected skill layers.
 * @param scope Requested scope.
 * @param cwd Project root (defaults to `process.cwd()`).
 * @param home User home (defaults to `os.homedir()`).
 * @returns One {@link SkillTarget} per provider/layer.
 */
export function resolveTargets(
  providers: readonly SkillProvider[],
  layers: readonly SkillLayer[],
  scope: SkillScope,
  cwd: string = process.cwd(),
  home: string = homedir()
): SkillTarget[] {
  const targets: SkillTarget[] = [];
  for (const provider of providers) {
    const effectiveScope: SkillScope = supportsScope(provider, scope) ? scope : 'project';
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
