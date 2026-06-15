import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { applyWrite, planWrite, renderSkillTargets } from '@/skills/index.js';
import type { SkillLayer, SkillTarget } from '@/skills/index.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ebay-skills-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function ownedTarget(layer: SkillLayer = 'using'): SkillTarget {
  return {
    provider: 'claude',
    scope: 'project',
    layer,
    path: join(dir, '.claude', 'skills', `ebay-mcp-${layer}`, 'SKILL.md'),
    kind: 'owned-file',
    detected: false,
  };
}

function codexTarget(layer: SkillLayer = 'using'): SkillTarget {
  return {
    provider: 'codex',
    scope: 'project',
    layer,
    path: join(dir, 'AGENTS.md'),
    kind: 'managed-block',
    detected: false,
  };
}

/** Owned-file payloads carry the ownership marker the renderer embeds. */
const OWNED = '<!-- ebay-mcp:skill:using (generated) -->\n# Using\nbody';

describe('owned-file writes', () => {
  it('creates, then reports unchanged on a re-run', () => {
    const target = ownedTarget();

    const created = planWrite(target, OWNED);
    expect(created.action).toBe('create');
    expect(applyWrite(created).written).toBe(true);
    expect(readFileSync(target.path, 'utf-8')).toBe(OWNED);

    const rerun = planWrite(target, OWNED);
    expect(rerun.action).toBe('unchanged');
    expect(applyWrite(rerun).written).toBe(false);
  });

  it('updates a file it previously generated', () => {
    const target = ownedTarget();
    applyWrite(planWrite(target, OWNED));

    const next = `${OWNED}\nmore`;
    const plan = planWrite(target, next);
    expect(plan.action).toBe('update');
    applyWrite(plan);
    expect(readFileSync(target.path, 'utf-8')).toBe(next);
  });

  it('skips a foreign file unless forced', () => {
    const target = ownedTarget();
    mkdirSync(dirname(target.path), { recursive: true });
    writeFileSync(target.path, '# someone else wrote this\n');

    const plan = planWrite(target, OWNED);
    expect(plan.action).toBe('skip-foreign');
    expect(applyWrite(plan).written).toBe(false);
    expect(readFileSync(target.path, 'utf-8')).toBe('# someone else wrote this\n');

    const forced = applyWrite(planWrite(target, OWNED), { force: true });
    expect(forced.written).toBe(true);
    expect(readFileSync(target.path, 'utf-8')).toBe(OWNED);
  });

  it('writes nothing on a dry run', () => {
    const target = ownedTarget();
    const result = applyWrite(planWrite(target, OWNED), { dryRun: true });
    expect(result.written).toBe(false);
    expect(existsSync(target.path)).toBe(false);
  });
});

describe('managed-block writes', () => {
  it('creates AGENTS.md when absent', () => {
    const target = codexTarget();
    const plan = planWrite(target, '## eBay MCP\nx');
    expect(plan.action).toBe('create');
    applyWrite(plan);
    expect(existsSync(target.path)).toBe(true);
  });

  it('preserves user content and is idempotent', () => {
    const userText = '# AGENTS.md\n\nMy own notes.\n';
    writeFileSync(join(dir, 'AGENTS.md'), userText);
    const target = codexTarget();
    const inner = '## eBay MCP\nstuff';

    const first = planWrite(target, inner);
    expect(first.action).toBe('update');
    expect(applyWrite(first).written).toBe(true);

    const after = readFileSync(target.path, 'utf-8');
    expect(after).toContain('My own notes.');
    expect(after).toContain('ebay-mcp:skill:using:start');
    expect(after).toContain(inner);

    const rerun = planWrite(target, inner);
    expect(rerun.action).toBe('unchanged');
    expect(applyWrite(rerun).written).toBe(false);
  });

  it('keeps two layers as independent blocks in one file', () => {
    const usingTarget = codexTarget('using');
    const contributingTarget = codexTarget('contributing');
    applyWrite(planWrite(usingTarget, '## Using\nu'));
    applyWrite(planWrite(contributingTarget, '## Contributing\nc'));

    const content = readFileSync(join(dir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('ebay-mcp:skill:using:start');
    expect(content).toContain('ebay-mcp:skill:contributing:start');
    expect(content).toContain('## Using');
    expect(content).toContain('## Contributing');

    applyWrite(planWrite(usingTarget, '## Using v2\nu2'));
    const updated = readFileSync(join(dir, 'AGENTS.md'), 'utf-8');
    expect(updated).toContain('## Using v2');
    expect(updated).toContain('## Contributing');
  });

  it('keeps both layers when the wizard writes them to one AGENTS.md in a single run', () => {
    // Regression: both Codex layers resolve to one AGENTS.md. Re-planning per
    // write (the wizard's apply path) must compose them; a single up-front plan
    // pass would let the second write clobber the first.
    const rendered = renderSkillTargets({
      providers: ['codex'],
      layers: ['using', 'contributing'],
      scope: 'project',
      cwd: dir,
      home: dir,
    });

    for (const item of rendered) {
      applyWrite(planWrite(item.target, item.payload));
    }

    const content = readFileSync(join(dir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('ebay-mcp:skill:using:start');
    expect(content).toContain('ebay-mcp:skill:contributing:start');
    expect(content).toContain('## Using the eBay MCP tools');
    expect(content).toContain('## Contributing to ebay-mcp');
  });
});
