import type { SkillLayer } from '@/skills/types.js';

/**
 * HTML-comment markers that tag generated content as ours. Both owned files
 * (Claude `SKILL.md`, Cursor `.mdc`) and managed blocks (Codex `AGENTS.md`) use
 * the same layer-scoped namespace so re-runs find and replace exactly what a
 * prior run wrote — and never touch a user's own content.
 *
 * Markers are HTML comments, which render invisibly in Markdown across all three
 * tools.
 */

/** Single-line marker embedded near the top of an owned file to prove ownership. */
export function ownershipMarker(layer: SkillLayer): string {
  return `<!-- ebay-mcp:skill:${layer} (generated — re-run \`ebay-mcp skills\` to update) -->`;
}

/** Opening delimiter of a managed block inside a shared file. */
export function blockStart(layer: SkillLayer): string {
  return `<!-- ebay-mcp:skill:${layer}:start -->`;
}

/** Closing delimiter of a managed block inside a shared file. */
export function blockEnd(layer: SkillLayer): string {
  return `<!-- ebay-mcp:skill:${layer}:end -->`;
}

/** True when file contents already contain content we generated for this layer. */
export function isOwnedByUs(contents: string, layer: SkillLayer): boolean {
  return contents.includes(`ebay-mcp:skill:${layer}`); // matches ownership marker or block delimiters
}
