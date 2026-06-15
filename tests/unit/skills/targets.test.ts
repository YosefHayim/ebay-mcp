import { describe, expect, it } from 'vitest';
import { join } from 'path';
import { resolveTargets, supportsScope } from '@/skills/index.js';
import type { SkillProvider, SkillTarget } from '@/skills/index.js';

const cwd = join('/tmp', 'proj');
const home = join('/tmp', 'home');

function byProvider(targets: SkillTarget[]): Record<SkillProvider, SkillTarget> {
  return Object.fromEntries(targets.map((target) => [target.provider, target])) as Record<
    SkillProvider,
    SkillTarget
  >;
}

describe('skill targets', () => {
  it('resolves project-local paths and kinds for every provider', () => {
    const targets = byProvider(
      resolveTargets(['claude', 'cursor', 'codex'], ['using'], 'project', cwd, home)
    );

    expect(targets.claude.path).toBe(join(cwd, '.claude', 'skills', 'ebay-mcp-using', 'SKILL.md'));
    expect(targets.cursor.path).toBe(join(cwd, '.cursor', 'rules', 'ebay-mcp-using.mdc'));
    expect(targets.codex.path).toBe(join(cwd, 'AGENTS.md'));

    expect(targets.claude.kind).toBe('owned-file');
    expect(targets.cursor.kind).toBe('owned-file');
    expect(targets.codex.kind).toBe('managed-block');
  });

  it('uses the home dir for global claude/codex but keeps cursor project-local', () => {
    const targets = byProvider(
      resolveTargets(['claude', 'cursor', 'codex'], ['using'], 'global', cwd, home)
    );

    expect(targets.claude.path).toBe(join(home, '.claude', 'skills', 'ebay-mcp-using', 'SKILL.md'));
    expect(targets.codex.path).toBe(join(home, '.codex', 'AGENTS.md'));
    expect(targets.cursor.scope).toBe('project');
    expect(targets.cursor.path).toBe(join(cwd, '.cursor', 'rules', 'ebay-mcp-using.mdc'));
  });

  it('reports that cursor has no global scope', () => {
    expect(supportsScope('cursor', 'global')).toBe(false);
    expect(supportsScope('cursor', 'project')).toBe(true);
    expect(supportsScope('claude', 'global')).toBe(true);
  });

  it('produces one target per provider × layer', () => {
    const targets = resolveTargets(['claude'], ['using', 'contributing'], 'project', cwd, home);
    expect(targets).toHaveLength(2);
    expect(targets.map((target) => target.layer).sort()).toEqual(['contributing', 'using']);
  });
});
