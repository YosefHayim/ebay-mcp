import { describe, expect, it } from 'vitest';
import {
  buildSkillDoc,
  renderClaudeSkill,
  renderCodexSection,
  renderCursorRule,
  renderSkill,
} from '@/skills/index.js';

const usingDoc = buildSkillDoc('using');

describe('skill rendering', () => {
  it('renders a Claude skill with name/description frontmatter and is deterministic', () => {
    const first = renderClaudeSkill(usingDoc, 'using');
    const second = renderClaudeSkill(usingDoc, 'using');

    expect(first).toBe(second);
    expect(first.startsWith('---\n')).toBe(true);
    expect(first).toContain('name: ebay-mcp-using');
    expect(first).toMatch(/description: ".+"/);
    expect(first).toContain('ebay-mcp:skill:using');
    expect(first).toContain('# Using the eBay MCP tools');
  });

  it('renders a Cursor rule that is agent-requested (alwaysApply false)', () => {
    const rule = renderCursorRule(usingDoc, 'using');

    expect(rule).toContain('alwaysApply: false');
    expect(rule).toMatch(/description: ".+"/);
    expect(rule).toContain('ebay-mcp:skill:using');
  });

  it('renders a Codex section with no frontmatter and a nestable heading', () => {
    const section = renderCodexSection(usingDoc);

    expect(section.startsWith('---')).toBe(false);
    expect(section).toContain('## Using the eBay MCP tools');
  });

  it('injects the live tool count into the body', () => {
    expect(renderCodexSection(usingDoc)).toMatch(/\d+ tools/);
  });

  it('dispatches renderSkill by provider', () => {
    expect(renderSkill('claude', usingDoc, 'using')).toBe(renderClaudeSkill(usingDoc, 'using'));
    expect(renderSkill('cursor', usingDoc, 'using')).toBe(renderCursorRule(usingDoc, 'using'));
    expect(renderSkill('codex', usingDoc, 'using')).toBe(renderCodexSection(usingDoc));
  });
});
