import { describe, expect, it } from "vitest";
import { TOOL_FAMILY_KEYS } from "@/shared/toolFamilies.js";
import { createToolCatalog } from "./buildToolCatalog.js";

describe("createToolCatalog", () => {
	const catalog = createToolCatalog();

	it("lists 379 tools in 18 families", () => {
		expect(catalog.toolCount).toBe(379);
		expect(catalog.familyCount).toBe(18);
		expect(catalog.families).toHaveLength(18);
	});

	it("uses the tool family keys", () => {
		expect(catalog.families.map((family) => family.key).sort()).toEqual(
			[...TOOL_FAMILY_KEYS].sort(),
		);
	});

	it("gives every tool a description", () => {
		for (const family of catalog.families) {
			for (const tool of family.tools) {
				expect(tool.description.trim(), tool.name).not.toBe("");
			}
		}
	});

	it("adds family counts up to the total", () => {
		const sum = catalog.families.reduce(
			(total, family) => total + family.toolCount,
			0,
		);
		expect(sum).toBe(catalog.toolCount);
		for (const family of catalog.families)
			expect(family.tools).toHaveLength(family.toolCount);
	});
});
