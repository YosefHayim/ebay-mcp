import type { SkillLayer } from "@/cli/skills/types.js";

export function ownershipMarker(layer: SkillLayer): string {
	return `<!-- ebay-mcp:skill:${layer} (generated — re-run \`ebay-mcp skills\` to update) -->`;
}

export function blockStart(layer: SkillLayer): string {
	return `<!-- ebay-mcp:skill:${layer}:start -->`;
}

export function blockEnd(layer: SkillLayer): string {
	return `<!-- ebay-mcp:skill:${layer}:end -->`;
}

export function isOwnedByUs(contents: string, layer: SkillLayer): boolean {
	return contents.includes(`ebay-mcp:skill:${layer}`); // matches ownership marker or block delimiters
}
