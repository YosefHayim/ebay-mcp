import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * Banned-identifier guard.
 *
 * Generic names like `resolve` say nothing about what a value is for, so the repo
 * bans declaring them: name the callback after what it settles (`onServerReady`),
 * or use an API that needs no callback (`once(server, 'listening')`,
 * `setTimeout` from `node:timers/promises`, `Effect.sleep`).
 *
 * Only declarations are banned. Reading a library member such as `path.resolve`
 * or writing an object key such as Vite's `resolve:` option is allowed, because
 * those names belong to the library, not to this repo.
 */
const BANNED_NAMES = new Set(['resolve']);

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const SCANNED_DIRS = ['src', 'mcp-apps', 'tests'];
/** Generated OpenAPI types keep upstream names. */
const GENERATED_DIR = path.join('src', 'types');
const SOURCE_FILE_PATTERN = /\.(ts|tsx|cts|mts)$/;

const sourceFiles = SCANNED_DIRS.flatMap((dir) =>
  readdirSync(path.join(repoRoot, dir), { recursive: true, encoding: 'utf8' })
    .map((relativePath) => path.join(dir, relativePath))
    .filter((filePath) => SOURCE_FILE_PATTERN.test(filePath))
    .filter((filePath) => !filePath.startsWith(GENERATED_DIR)),
);

/** True when the identifier is the name a declaration binds, not a reference or key. */
const isDeclaredName = (identifier: ts.Identifier): boolean => {
  const { parent } = identifier;
  if (ts.isImportSpecifier(parent)) {
    return parent.name === identifier;
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
    parent.name === identifier
  );
};

/** Lists `file:line name` for every banned declaration in one source file. */
const bannedDeclarationsIn = (filePath: string): string[] => {
  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(path.join(repoRoot, filePath), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const violations: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && BANNED_NAMES.has(node.text) && isDeclaredName(node)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      violations.push(`${filePath}:${line + 1} ${node.text}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return violations;
};

describe('banned identifiers', () => {
  it('scans the source tree so the guard cannot pass vacuously', () => {
    expect(sourceFiles.length).toBeGreaterThan(100);
    expect(sourceFiles).toContain(path.join('src', 'index.ts'));
  });

  it('declares no variable, parameter, function, or import named resolve', () => {
    expect(sourceFiles.flatMap(bannedDeclarationsIn)).toEqual([]);
  });
});
