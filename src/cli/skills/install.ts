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
	if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
		return (
			existing.slice(0, startIdx) + block + existing.slice(endIdx + end.length)
		);
	}

	const prefix =
		existing.trim().length > 0 ? `${existing.replace(/\s+$/, "")}\n\n` : "";
	return `${prefix}${block}\n`;
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

export function applyWrite(
	plan: WritePlan,
	options: { dryRun?: boolean; force?: boolean } = {},
): ApplyResult {
	const isNoop = plan.action == "unchanged";
	const isBlockedForeign = plan.action == "skip-foreign" && !options.force;

	if (options.dryRun || isNoop || isBlockedForeign) {
		return { target: plan.target, action: plan.action, written: false };
	}

	mkdirSync(dirname(plan.target.path), { recursive: true });
	writeFileSync(plan.target.path, plan.nextContents, "utf-8");
	return { target: plan.target, action: plan.action, written: true };
}
