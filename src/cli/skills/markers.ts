import type { SkillLayer } from "@/cli/skills/types.js";

/**
 * HTML-comment markers that tag generated content as ours. Both owned files
 * (Claude `SKILL.md`, Cursor `.mdc`) and managed blocks (Codex `AGENTS.md`) use
 * the same layer-scoped namespace so re-runs find and replace exactly what a
 * prior run wrote — and never touch a user's own content.
 *
 * Markers are HTML comments, which render invisibly in Markdown across all three
 * tools.
 */

/**
 * Builds the single-line marker embedded near the top of an owned file.
 *
 * @param layer - Skill layer the generated file belongs to.
 * @returns HTML comment proving ownership for this layer.
 *
 * @example
 * ```ts
 * const marker = ownershipMarker('using');
 * ```
 */
export const ownershipMarker = (layer: SkillLayer): string =>
	`<!-- ebay-mcp:skill:${layer} (generated — re-run \`ebay-mcp skills\` to update) -->`;

/**
 * Builds the opening delimiter of a managed block inside a shared file.
 *
 * @param layer - Skill layer the managed block belongs to.
 * @returns HTML comment that opens the managed block.
 *
 * @example
 * ```ts
 * const start = blockStart('contributing');
 * ```
 */
export const blockStart = (layer: SkillLayer): string =>
	`<!-- ebay-mcp:skill:${layer}:start -->`;

/**
 * Builds the closing delimiter of a managed block inside a shared file.
 *
 * @param layer - Skill layer the managed block belongs to.
 * @returns HTML comment that closes the managed block.
 *
 * @example
 * ```ts
 * const end = blockEnd('contributing');
 * ```
 */
export const blockEnd = (layer: SkillLayer): string =>
	`<!-- ebay-mcp:skill:${layer}:end -->`;

/**
 * Checks whether file contents already contain generated content for this layer.
 *
 * @param contents - File contents to inspect.
 * @param layer - Skill layer to look for.
 * @returns True when an ownership marker or managed-block delimiter is present.
 *
 * @example
 * ```ts
 * const ours = isOwnedByUs(contents, 'using');
 * ```
 */
export const isOwnedByUs = (contents: string, layer: SkillLayer): boolean => {
	return contents.includes(`ebay-mcp:skill:${layer}`); // matches ownership marker or block delimiters
};
