import { describe, expect, it } from "vitest";
import { renderCodexSection } from "@/cli/skills/render.js";
import { buildSkillDoc } from "@/cli/skills/skill-doc.js";
import { getToolDefinitions } from "@/tool-registry/registry.js";

describe("required item aspects workflow", () => {
	it("connects the registered taxonomy metadata to the pre-listing workflow", () => {
		const tool = getToolDefinitions().find(
			(definition) => definition.name == "ebay_get_item_aspects_for_category",
		);
		const usingSkill = renderCodexSection(buildSkillDoc("using"));

		expect(tool).toBeDefined();
		expect(tool?.description).toContain(
			"required and recommended item specifics",
		);
		expect(usingSkill).toContain(tool?.name);
		expect(usingSkill).toContain("before `ebay_get_listing_fees`");
	});
});
