/**
 * Shared types for the agent-skills generator.
 *
 * The skills feature renders one canonical, provider-neutral document per layer
 * ({@link SkillLayer}) into each AI tool's native instruction format
 * ({@link SkillProvider}) and installs it into a project or the user's home
 * ({@link SkillScope}). These types model that pipeline: authored content
 * ({@link SkillDoc}) + a live registry snapshot ({@link RegistrySnapshot}) →
 * resolved write locations ({@link SkillTarget}) → idempotent write plans
 * ({@link WritePlan}).
 */

/**
 * Which audience a generated skill serves.
 *
 * - `using` — teaches a developer's AI how to drive the eBay MCP tools.
 * - `contributing` — teaches an AI working on this repo.
 */
export type SkillLayer = 'using' | 'contributing';

/** An AI coding tool whose native instruction format we can render into. */
export type SkillProvider = 'claude' | 'cursor' | 'codex';

/**
 * Where a skill is written: scoped to the current project, or to the user's
 * home so every project sees it. Cursor only supports project-scoped rule files.
 */
export type SkillScope = 'project' | 'global';

/** One eBay API family in the live tool catalogue, with its current tool count. */
export interface ToolFamily {
  /** Stable registry key for the tool family. */
  key: string;
  /** Human title for the tool family. */
  title: string;
  /** Number of registered tools in this family. */
  count: number;
  /** Short human description of what the family covers, for the index. */
  blurb: string;
}

/**
 * A point-in-time view of the running tool registry, injected into the rendered
 * skill so the catalogue never drifts from the code.
 */
export interface RegistrySnapshot {
  /** Total number of registered tools across all families. */
  toolCount: number;
  /** Per-family catalogue data in registry order. */
  families: ToolFamily[];
}

/** A titled block of Markdown within a {@link SkillDoc}. */
export interface SkillSection {
  /** Section heading without Markdown heading markers. */
  heading: string;
  /** Markdown body (already formatted; no leading heading). */
  body: string;
}

/**
 * The canonical, provider-neutral skill document. Renderers wrap this with each
 * provider's required frontmatter/markers; the `intro` and `sections` Markdown
 * is shared verbatim across all three providers.
 */
export interface SkillDoc {
  /** Stable slug, e.g. `ebay-mcp-using`; used for filenames and frontmatter name. */
  slug: string;
  /** Human title shown in headings. */
  title: string;
  /** One-line trigger description placed in Claude/Cursor frontmatter. */
  description: string;
  /** Opening Markdown paragraph(s). */
  intro: string;
  /** Ordered body sections for the skill document. */
  sections: SkillSection[];
}

/**
 * How a target file is updated:
 *
 * - `owned-file` — a namespaced file we fully own (Claude `SKILL.md`, Cursor
 *   `.mdc`); regenerated in place.
 * - `managed-block` — a shared file (Codex `AGENTS.md`) where we only own a
 *   delimited block and must preserve the rest.
 */
export type SkillTargetKind = 'owned-file' | 'managed-block';

/** A resolved place to write one rendered skill, plus whether the provider is in use here. */
export interface SkillTarget {
  /** Provider whose instruction format this target uses. */
  provider: SkillProvider;
  /** Effective write scope after provider coercion. */
  scope: SkillScope;
  /** Skill layer rendered into this target. */
  layer: SkillLayer;
  /** Absolute path of the file to write or merge into. */
  path: string;
  /** Whether this target owns a whole file or a managed block. */
  kind: SkillTargetKind;
  /** True when this provider already has a footprint at this scope (pre-selected in the UI). */
  detected: boolean;
}

/**
 * What a write would do, computed without touching disk:
 *
 * - `create` — target file does not exist yet.
 * - `update` — target exists and is ours (or the block exists); content replaced.
 * - `unchanged` — target already holds exactly this content.
 * - `skip-foreign` — an owned-file path exists but lacks our marker; left alone
 *   unless forced.
 */
export type WriteAction = 'create' | 'update' | 'unchanged' | 'skip-foreign';

/** A planned write for one target: the action, the bytes we would write, and the prior file. */
export interface WritePlan {
  /** Destination whose contents would be created, updated, or skipped. */
  target: SkillTarget;
  /** Planned write action. */
  action: WriteAction;
  /** Full file contents that would be written (whole file, including any preserved text). */
  nextContents: string;
  /** Existing file contents, or undefined when the file is absent. */
  previousContents?: string;
}
