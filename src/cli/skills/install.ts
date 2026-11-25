import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { blockEnd, blockStart, isOwnedByUs } from "@/cli/skills/markers.js";
import type { SkillLayer, SkillTarget, WritePlan } from "@/cli/skills/types.js";

function wrapBlock(layer: SkillLayer, inner: string): string {
	return `${blockStart(layer)}\n${inner}\n${blockEnd(layer)}`;
}

function mergeManagedBlock(
	existing: string,
	layer: SkillLayer,
	inner: string,
): string {
	const start = blockStart(layer);
	const end = blockEnd(layer);
	const block = wrapBlock(layer, inner);

	const startIdx = existing.indexOf(start);
	const endIdx = existing.indexOf(end);

	function appendBlock(): string {
		const prefix =
			existing.trim().length > 0 ? `${existing.replace(/\s+$/, "")}\n\n` : "";
		return `${prefix}${block}\n`;
	}

	const isStartMissing = startIdx == -1;

	if (isStartMissing) return appendBlock();

	const isEndMissing = endIdx == -1;

	if (isEndMissing) return appendBlock();

	const endIsBeforeStart = endIdx <= startIdx;

	if (endIsBeforeStart) return appendBlock();

	return (
		existing.slice(0, startIdx) + block + existing.slice(endIdx + end.length)
	);
}

function attachPreviousContents(
	plan: WritePlan,
	previousContents: string | undefined,
): WritePlan {
	const isFileMissing = previousContents == null;

	if (isFileMissing) {
		return plan;
	}

	return { ...plan, previousContents };
}

export function planWrite(
	target: SkillTarget,
	renderedContent: string,
): WritePlan {
	const exists = existsSync(target.path);
	const previousContents = exists
		? readFileSync(target.path, "utf-8")
		: undefined;

	if (target.kind == "managed-block") {
		const nextContents = mergeManagedBlock(
			previousContents ?? "",
			target.layer,
			renderedContent,
		);
		let action: WritePlan["action"] = "create";
		if (exists) {
			action = nextContents == previousContents ? "unchanged" : "update";
		}
		return attachPreviousContents(
			{ target, action, nextContents },
			previousContents,
		);
	}

	// owned-file
	if (!exists) {
		return { target, action: "create", nextContents: renderedContent };
	}
	if (!isOwnedByUs(previousContents ?? "", target.layer)) {
		return attachPreviousContents(
			{
				target,
				action: "skip-foreign",
				nextContents: renderedContent,
			},
			previousContents,
		);
	}
	const action = previousContents == renderedContent ? "unchanged" : "update";
	return attachPreviousContents(
		{ target, action, nextContents: renderedContent },
		previousContents,
	);
}

export interface ApplyResult {
	target: SkillTarget;
	action: WritePlan["action"];
	written: boolean;
}

function isBlockedForeignWrite(
	action: WritePlan["action"],
	force: boolean | undefined,
): boolean {
	const isOwnFile = action != "skip-foreign";

	if (isOwnFile) return false;

	const isForced = force == true;

	if (isForced) return false;

	return true;
}

function shouldSkipWrite(
	plan: WritePlan,
	writeOptions: { dryRun?: boolean; force?: boolean },
): boolean {
	const isDryRun = writeOptions.dryRun == true;

	if (isDryRun) return true;

	const isUnchanged = plan.action == "unchanged";

	if (isUnchanged) return true;

	return isBlockedForeignWrite(plan.action, writeOptions.force);
}

export function applyWrite(
	plan: WritePlan,
	options: { dryRun?: boolean; force?: boolean } = {},
): ApplyResult {
	const skipWrite = shouldSkipWrite(plan, options);

	if (skipWrite) {
		return { target: plan.target, action: plan.action, written: false };
	}

	mkdirSync(dirname(plan.target.path), { recursive: true });
	writeFileSync(plan.target.path, plan.nextContents, "utf-8");
	return { target: plan.target, action: plan.action, written: true };
}
