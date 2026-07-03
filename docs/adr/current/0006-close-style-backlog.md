# 0006 — Close the style backlog

**Status:** Accepted · 2026-07-04

## Context

PR #132 landed `CODE-STYLE.md`, the structure docs, a valid `biome.json`, and a
reusable CI gate — but deliberately **deferred** a backlog, recorded across ADRs
[0002](0002-cli-command-surface.md), [0004](0004-ci-workflow-architecture.md),
and [0005](0005-codify-real-layout.md): ~66 parent-relative imports, one excluded
stale dev script, an unused CLI dependency, `ui/` outside the typecheck gate, and
a Biome warning count inflated by rules that fight the repo's own conventions.

A follow-up audit measured each gap against the real code (hard counts, typecheck
probes). This ADR records **closing** them in one change set.

## Decision

- **Imports (Rule 1).** Codemod all **66** `../` parent imports to the `@/` alias
  — each path resolved against its file's directory and re-rooted at `src/`,
  `.js` extensions kept, verified by `tsc`. Zero parent imports remain.
- **`test-endpoints.ts`.** **Delete** it — a 2,196-line orphaned dev script, run
  by no npm script and imported nowhere, carrying 29 stale-signature errors and
  all 10 `as any` in `src/`. This satisfies Rule 2 (no hand-written source
  excluded from typecheck) and reverses the 0005 "tracked follow-up".
- **`commander`.** **Remove** the direct dependency — 0 imports, never wired.
  Reverses the "add commander" of [0002](0002-cli-command-surface.md) /
  [0003](0003-dependency-decisions.md). The dual-mode CLI contract stands; a
  framework returns only when a real need justifies the dependency.
- **`ui/`.** Fix the 29 `class`→`className` type errors (React 19 tolerates
  `class` at runtime but the JSX types require `className`); commit
  `ui/tsconfig.json` (was untracked); add `typecheck:ui` to the CI **Typecheck**
  gate. Resolves the 0004 follow-up — `npm run check` / `npm run verify` are now
  green end-to-end (they chained `typecheck:ui`, which was red on 29 errors).
- **Biome noise.** Turn off two rules that generate false positives against this
  repo's conventions:
  - `correctness/useImportExtensions` (436) — cannot resolve the `@/` alias, so
    it flags imports that **already** carry `.js`, directly contradicting Rule 1.
  - `security/noSecrets` (118) — fires on config key names/defaults; real secret
    scanning is covered by GitGuardian in CI.

  Warnings drop **1,976 → ~1,200**, leaving a genuinely actionable backlog.
- **Docs.** Acknowledge `HttpError` (`src/utils/http.ts`) as the one sanctioned
  `Error` subclass in the `CODE-STYLE.md` Never list; drop the stale
  `eslint.config.js` and duplicate `test-endpoints.ts` entries from
  `tsconfig.json`.

## Consequences

- Rules 1 and 2 move from **desired** to **achieved**: 0 parent imports, 0
  hand-written source excluded from typecheck, 0 `as any` in shipped `src/`.
- The typecheck gate now covers `ui/` on every push — a `class`-style regression
  fails CI, not a reviewer's eye.
- No unused runtime dependency ships to npm consumers.
- The remaining ~1,200 Biome warnings are real guidance (long functions, `node:`
  import protocol, block statements) — `deslop` closes them per-diff; they are
  **warnings**, not gate failures.
- Supersedes the deferred portions of [0002](0002-cli-command-surface.md) (the
  commander adoption), [0004](0004-ci-workflow-architecture.md) (the `ui/`
  follow-up), and [0005](0005-codify-real-layout.md) (the `test-endpoints.ts`
  follow-up).
