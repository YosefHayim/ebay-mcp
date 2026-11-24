import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const BANNED_NAMES = new Set(["resolve"]);

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const SCANNED_DIRS = ["src", "tests"];
const GENERATED_DIR = path.join("src", "ebay-openapi-types");
const SOURCE_FILE_PATTERN = /\.(ts|tsx|cts|mts)$/;

const sourceFiles = SCANNED_DIRS.flatMap((dir) =>
	readdirSync(path.join(repoRoot, dir), { recursive: true, encoding: "utf8" })
		.map((relativePath) => path.join(dir, relativePath))
		.filter((filePath) => SOURCE_FILE_PATTERN.test(filePath))
		.filter((filePath) => !filePath.startsWith(GENERATED_DIR)),
);

function isDeclaredName(identifier: ts.Identifier): boolean {
	const { parent } = identifier;
	if (ts.isImportSpecifier(parent)) {
		return parent.name == identifier;
	}
	return (
		(ts.isVariableDeclaration(parent) ||
			ts.isParameter(parent) ||
			ts.isBindingElement(parent) ||
			ts.isFunctionDeclaration(parent) ||
			ts.isFunctionExpression(parent) ||
			ts.isClassDeclaration(parent) ||
			ts.isImportClause(parent) ||
			ts.isNamespaceImport(parent) ||
			ts.isImportEqualsDeclaration(parent)) &&
		parent.name == identifier
	);
}

function bannedDeclarationsIn(filePath: string): string[] {
	const sourceFile = ts.createSourceFile(
		filePath,
		readFileSync(path.join(repoRoot, filePath), "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const violations: string[] = [];

	const visit = (node: ts.Node): void => {
		if (
			ts.isIdentifier(node) &&
			BANNED_NAMES.has(node.text) &&
			isDeclaredName(node)
		) {
			const { line } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push(`${filePath}:${line + 1} ${node.text}`);
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);

	return violations;
}

describe("banned identifiers", () => {
	it("scans the source tree so the guard cannot pass vacuously", () => {
		expect(sourceFiles.length).toBeGreaterThan(100);
		expect(sourceFiles).toContain(path.join("src", "index.ts"));
	});

	it("declares no variable, parameter, function, or import named resolve", () => {
		expect(sourceFiles.flatMap(bannedDeclarationsIn)).toEqual([]);
	});
});
