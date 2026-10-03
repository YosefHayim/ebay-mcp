import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import type { SkillLayer, SkillTarget, WritePlan } from '@/skills/types.js';
import { blockEnd, blockStart, isOwnedByUs } from '@/skills/markers.js';

/** Wraps managed-block inner content between this layer's delimiters. */
const wrapBlock = (layer: SkillLayer, inner: string): string =>
  `${blockStart(layer)}\n${inner}\n${blockEnd(layer)}`;

/**
 * Replaces our managed block in `existing`, or appends it if absent — preserving
 * all surrounding user content. Idempotent: feeding the result back in produces
 * identical output.
 */
const mergeManagedBlock = (existing: string, layer: SkillLayer, inner: string): string => {
  const start = blockStart(layer);
  const end = blockEnd(layer);
  const block = wrapBlock(layer, inner);

  const startIdx = existing.indexOf(start);
  const endIdx = existing.indexOf(end);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return existing.slice(0, startIdx) + block + existing.slice(endIdx + end.length);
  }

  const prefix = existing.trim().length > 0 ? `${existing.replace(/\s+$/, '')}\n\n` : '';
  return `${prefix}${block}\n`;
};

/**
 * Computes what a write would do without touching disk.
 *
 * - Owned files (Claude/Cursor): `create` when absent, `update`/`unchanged` when
 *   ours, `skip-foreign` when a same-named file exists that we did not write.
 * - Managed blocks (Codex `AGENTS.md`): the block is merged into existing
 *   content, so the result is `create`/`update`/`unchanged` and user text is
 *   always preserved (never `skip-foreign`).
 *
 * @param target Resolved destination.
 * @param renderedContent Rendered content — a full file for owned targets, inner block
 *   content for managed targets.
 * @returns The planned action and the exact bytes that would be written.
 *
 * @example
 * ```ts
 * const plan = planWrite(target, renderedContent);
 * ```
 */
export const planWrite = (target: SkillTarget, renderedContent: string): WritePlan => {
  const exists = existsSync(target.path);
  const previousContents = exists ? readFileSync(target.path, 'utf-8') : undefined;

  if (target.kind === 'managed-block') {
    const nextContents = mergeManagedBlock(previousContents ?? '', target.layer, renderedContent);
    let action: WritePlan['action'] = 'create';
    if (exists) {
      action = nextContents === previousContents ? 'unchanged' : 'update';
    }
    return { target, action, nextContents, previousContents };
  }

  // owned-file
  if (!exists) {
    return { target, action: 'create', nextContents: renderedContent };
  }
  if (!isOwnedByUs(previousContents ?? '', target.layer)) {
    return { target, action: 'skip-foreign', nextContents: renderedContent, previousContents };
  }
  const action = previousContents === renderedContent ? 'unchanged' : 'update';
  return { target, action, nextContents: renderedContent, previousContents };
};

/** Outcome of applying a {@link WritePlan}. */
export interface ApplyResult {
  /** File or block target that was applied. */
  target: SkillTarget;
  /** The planned action (see {@link WritePlan}). */
  action: WritePlan['action'];
  /** Whether bytes were actually written to disk. */
  written: boolean;
}

/**
 * Applies a write plan. Skips no-op writes (`unchanged`) and refuses to clobber
 * a foreign owned file unless `force` is set. `dryRun` computes the result
 * without writing.
 *
 * @param plan The plan from {@link planWrite}.
 * @param options `dryRun` to preview only; `force` to overwrite a foreign file.
 * @returns Whether the file was written.
 *
 * @example
 * ```ts
 * const writeOutcome = applyWrite(plan, { dryRun: true });
 * ```
 */
export const applyWrite = (
  plan: WritePlan,
  options: { dryRun?: boolean; force?: boolean } = {},
): ApplyResult => {
  const isNoop = plan.action === 'unchanged';
  const isBlockedForeign = plan.action === 'skip-foreign' && !options.force;

  if (options.dryRun || isNoop || isBlockedForeign) {
    return { target: plan.target, action: plan.action, written: false };
  }

  mkdirSync(dirname(plan.target.path), { recursive: true });
  writeFileSync(plan.target.path, plan.nextContents, 'utf-8');
  return { target: plan.target, action: plan.action, written: true };
};
