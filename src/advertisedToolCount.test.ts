import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getToolDefinitions } from "@/tool-registry/registry.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

const advertisedToolCount = getToolDefinitions().length;

const ENDPOINT_COUNT_PATTERN = /\d+ (?:unique )?endpoints/g;

const COUNT_BAND = { min: 250, max: 400 };

const BADGE_COUNT_PATTERN = /img\.shields\.io\/badge\/tools-(\d+)-/;

const DIGITS_PATTERN = /\d+/g;

const proseDocs = ["README.md"];

function readDoc(name: string): string {
	return readFileSync(`${repoRoot}${name}`, "utf8");
}

function staleCountsIn(text: string): number[] {
	const toolCountText = text.replace(ENDPOINT_COUNT_PATTERN, "");
	const found = [...toolCountText.matchAll(DIGITS_PATTERN)]
		.map((match) => Number(match[0]))
		.filter((count) => count >= COUNT_BAND.min && count <= COUNT_BAND.max)
		.filter((count) => count != advertisedToolCount);

	return [...new Set(found)];
}

describe("advertised tool count", () => {
	it("skips endpoint counts but still flags the same number quoted as tools", () => {
		expect(
			staleCountsIn("across 356 unique endpoints (356 endpoints)"),
		).toEqual([]);
		expect(staleCountsIn("356 tools across 356 endpoints")).toEqual([356]);
	});

	it.each(
		proseDocs,
	)("%s quotes no tool count other than the live registry", (name) => {
		expect(staleCountsIn(readDoc(name))).toEqual([]);
	});

	it("README shields badge shows the live tool count", () => {
		const badge = readDoc("README.md").match(BADGE_COUNT_PATTERN);

		expect(badge?.[1]).toBe(String(advertisedToolCount));
	});

	it("package.json description quotes the live tool count", () => {
		const { description } = JSON.parse(readDoc("package.json")) as {
			description: string;
		};

		expect(description).toContain(`${advertisedToolCount} tools`);
		expect(staleCountsIn(description)).toEqual([]);
	});
});
