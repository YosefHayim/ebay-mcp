import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createToolCatalog, type ToolCatalog } from "./buildToolCatalog.js";

export const TOOL_FAMILIES_START_MARKER = "<!-- tool-families:start -->";
export const TOOL_FAMILIES_END_MARKER = "<!-- tool-families:end -->";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

export const TOOL_FAMILY_DOCUMENTS = ["README.md"] as const;

export function createReadmeToolTable(catalog: ToolCatalog): string {
	const rows = catalog.families.map((family) => {
		const exampleTool =
			family.tools.find((tool) => tool.readOnly) ?? family.tools[0];
		return `| \`${family.key}\` | ${family.title} | ${family.toolCount} | \`${exampleTool?.name ?? ""}\` |`;
	});
	return [
		"| Family (`EBAY_MCP_TOOLS` key) | Title | Tools | Example tool |",
		"| --- | --- | --- | --- |",
		...rows,
	].join("\n");
}

function hasBrokenToolFamilyMarkers(start: number, end: number): boolean {
	const missingIndex = -1;
	const isStartMissing = start == missingIndex;

	if (isStartMissing) {
		return true;
	}

	const isEndMissing = end == missingIndex;

	if (isEndMissing) {
		return true;
	}

	const isEndBeforeStart = end < start;

	if (isEndBeforeStart) {
		return true;
	}

	return false;
}

export function replaceToolFamilyBlock(
	document: string,
	block: string,
): string {
	const start = document.indexOf(TOOL_FAMILIES_START_MARKER);
	const end = document.indexOf(TOOL_FAMILIES_END_MARKER);
	const hasBrokenMarkers = hasBrokenToolFamilyMarkers(start, end);

	if (hasBrokenMarkers) {
		throw new Error(
			`Missing ${TOOL_FAMILIES_START_MARKER} / ${TOOL_FAMILIES_END_MARKER} markers`,
		);
	}

	const before = document.slice(0, start + TOOL_FAMILIES_START_MARKER.length);
	const after = document.slice(end);
	return `${before}\n${block}\n${after}`;
}

export function createToolFamilyBlock(
	documentName: string,
	catalog: ToolCatalog,
): string {
	const isReadme = documentName == "README.md";
	if (!isReadme) throw new Error(`${documentName} has no tool family block`);

	return createReadmeToolTable(catalog);
}

function isStaleReportNeeded(
	isDocumentStale: boolean,
	checkOnly: boolean,
): boolean {
	const isFresh = !isDocumentStale;

	if (isFresh) {
		return false;
	}

	const isCheckOnly = checkOnly;

	if (isCheckOnly) {
		return true;
	}

	return false;
}

function isStaleWriteNeeded(
	isDocumentStale: boolean,
	checkOnly: boolean,
): boolean {
	const isFresh = !isDocumentStale;

	if (isFresh) {
		return false;
	}

	const writesDocument = !checkOnly;

	if (writesDocument) {
		return true;
	}

	return false;
}

if (process.argv[1] == fileURLToPath(import.meta.url)) {
	const checkOnly = process.argv.includes("--check");
	const catalog = createToolCatalog();
	let stale = false;
	for (const documentName of TOOL_FAMILY_DOCUMENTS) {
		const documentPath = `${repositoryRoot}${documentName}`;
		const current = readFileSync(documentPath, "utf8");
		const updated = replaceToolFamilyBlock(
			current,
			createToolFamilyBlock(documentName, catalog),
		);
		const isDocumentStale = updated != current;
		const shouldReportStale = isStaleReportNeeded(isDocumentStale, checkOnly);

		if (shouldReportStale) {
			console.error(
				`${documentName} tool family block is stale. Run: pnpm readme:tools`,
			);
			stale = true;
		}

		const shouldWriteDocument = isStaleWriteNeeded(isDocumentStale, checkOnly);

		if (shouldWriteDocument) {
			writeFileSync(documentPath, updated);
			console.log(`Updated ${documentName}`);
		}
	}

	if (stale) {
		process.exit(1);
	}
}
