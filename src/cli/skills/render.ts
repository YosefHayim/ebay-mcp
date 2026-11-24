import { ownershipMarker } from "@/cli/skills/markers.js";
import type {
	SkillDoc,
	SkillLayer,
	SkillProvider,
} from "@/cli/skills/types.js";

function renderBody(doc: SkillDoc, baseLevel: number): string {
	const heading = (level: number) => "#".repeat(level);
	const parts: string[] = [`${heading(baseLevel)} ${doc.title}`, "", doc.intro];
	for (const section of doc.sections) {
		parts.push(
			"",
			`${heading(baseLevel + 1)} ${section.heading}`,
			"",
			section.body,
		);
	}
	return parts.join("\n");
}

function yamlString(text: string): string {
	return JSON.stringify(text);
}

export function renderClaudeSkill(doc: SkillDoc, layer: SkillLayer): string {
	const frontmatter = [
		"---",
		`name: ${doc.slug}`,
		`description: ${yamlString(doc.description)}`,
		"---",
	];
	return [
		...frontmatter,
		ownershipMarker(layer),
		"",
		renderBody(doc, 1),
		"",
	].join("\n");
}

export function renderCursorRule(doc: SkillDoc, layer: SkillLayer): string {
	const frontmatter = [
		"---",
		`description: ${yamlString(doc.description)}`,
		"alwaysApply: false",
		"---",
	];
	return [
		...frontmatter,
		ownershipMarker(layer),
		"",
		renderBody(doc, 1),
		"",
	].join("\n");
}

export function renderCodexSection(doc: SkillDoc): string {
	return renderBody(doc, 2);
}

export function renderSkill(
	provider: SkillProvider,
	doc: SkillDoc,
	layer: SkillLayer,
): string {
	switch (provider) {
		case "claude":
			return renderClaudeSkill(doc, layer);
		case "cursor":
			return renderCursorRule(doc, layer);
		case "codex":
			return renderCodexSection(doc);
	}
}
