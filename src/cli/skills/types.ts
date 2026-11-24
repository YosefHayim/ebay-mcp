export type SkillLayer = "using" | "contributing";

export type SkillProvider = "claude" | "cursor" | "codex";

export type SkillScope = "project" | "global";

export interface ToolFamily {
	key: string;
	title: string;
	count: number;
	blurb: string;
}

export interface RegistrySnapshot {
	toolCount: number;
	families: ToolFamily[];
}

export interface SkillSection {
	heading: string;
	body: string;
}

export interface SkillDoc {
	slug: string;
	title: string;
	description: string;
	intro: string;
	sections: SkillSection[];
}

export type SkillTargetKind = "owned-file" | "managed-block";

export interface SkillTarget {
	provider: SkillProvider;
	scope: SkillScope;
	layer: SkillLayer;
	path: string;
	kind: SkillTargetKind;
	detected: boolean;
}

export type WriteAction = "create" | "update" | "unchanged" | "skip-foreign";

export interface WritePlan {
	target: SkillTarget;
	action: WriteAction;
	nextContents: string;
	previousContents?: string;
}
