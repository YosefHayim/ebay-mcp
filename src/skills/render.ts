import type { SkillDoc, SkillLayer, SkillProvider } from '@/skills/types.js';
import { ownershipMarker } from '@/skills/markers.js';

/**
 * Composes the shared Markdown body (title + intro + sections) at a given
 * heading level. `baseLevel` 1 yields a standalone document (`#` title, `##`
 * sections) for owned files; level 2 yields an embeddable section (`##` title,
 * `###` sections) for a managed block inside a user's file.
 */
function renderBody(doc: SkillDoc, baseLevel: number): string {
  const heading = (level: number) => '#'.repeat(level);
  const parts: string[] = [`${heading(baseLevel)} ${doc.title}`, '', doc.intro];
  for (const section of doc.sections) {
    parts.push('', `${heading(baseLevel + 1)} ${section.heading}`, '', section.body);
  }
  return parts.join('\n');
}

/** YAML frontmatter scalar that is safe for arbitrary text (JSON strings are valid YAML). */
function yamlString(value: string): string {
  return JSON.stringify(value);
}

/**
 * Renders a Claude Code skill file (`SKILL.md`): YAML frontmatter (`name`,
 * `description`) so the model can invoke it on demand, an ownership marker, then
 * the shared body.
 */
export function renderClaudeSkill(doc: SkillDoc, layer: SkillLayer): string {
  const frontmatter = [
    '---',
    `name: ${doc.slug}`,
    `description: ${yamlString(doc.description)}`,
    '---',
  ];
  return [...frontmatter, ownershipMarker(layer), '', renderBody(doc, 1), ''].join('\n');
}

/**
 * Renders a Cursor rule file (`.mdc`): frontmatter with a `description` trigger
 * and `alwaysApply: false` (agent-requested, not file-glob scoped, since eBay
 * tools aren't tied to particular source files), an ownership marker, then body.
 */
export function renderCursorRule(doc: SkillDoc, layer: SkillLayer): string {
  const frontmatter = [
    '---',
    `description: ${yamlString(doc.description)}`,
    'alwaysApply: false',
    '---',
  ];
  return [...frontmatter, ownershipMarker(layer), '', renderBody(doc, 1), ''].join('\n');
}

/**
 * Renders the inner content for a Codex `AGENTS.md` managed block: a level-2
 * section with no frontmatter, so it nests cleanly under a user's existing
 * top-level heading. The install step wraps this with block delimiters.
 */
export function renderCodexSection(doc: SkillDoc): string {
  return renderBody(doc, 2);
}

/**
 * Renders the payload for one provider. Owned-file providers (Claude, Cursor)
 * return a complete file; the managed-block provider (Codex) returns inner
 * content that {@link import('./install.js')} wraps with markers.
 *
 * @param provider Target tool.
 * @param doc Canonical skill document.
 * @param layer Skill layer (for the ownership marker).
 * @returns The string payload for this provider.
 */
export function renderSkill(provider: SkillProvider, doc: SkillDoc, layer: SkillLayer): string {
  switch (provider) {
    case 'claude':
      return renderClaudeSkill(doc, layer);
    case 'cursor':
      return renderCursorRule(doc, layer);
    case 'codex':
      return renderCodexSection(doc);
  }
}
