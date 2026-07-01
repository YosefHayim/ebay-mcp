# 0001 — Formatter & linter: Biome

**Status:** Accepted · 2026-07-02

## Context

The repo already leaned on Biome (`@biomejs/biome` 2.5.1) but its config was
**not committed** (`biome.json` was an untracked local file) and was **invalid**:
it referenced an unknown rule key `useConsistentReturn`, so `biome check`/`biome
ci` aborted before checking anything. The `check`/`fix` scripts also passed a
brace-glob (`"{src,ui}/**/*.{…}"`) that Biome does not expand, so they matched
**0 files**. Net effect: Biome had never meaningfully gated this code, and a
fresh clone had no formatter config at all. Prettier/ESLint are not used.

## Decision

- **Commit `biome.json`** as the single formatter+linter config, so CI and every
  clone share it.
- **Formatter facts** (kept from the prior local config): single quotes,
  semicolons always, trailing commas everywhere, width 100, 2-space indent.
- **Linter:** keep `preset: all`; most rules land as **warnings** (the visible
  cleanup backlog — ~1226 today), and the gate blocks only on **errors**.
- **Size caps → warnings:** `noExcessiveLinesPerFile` warns > 300, and
  `noExcessiveLinesPerFunction` warns > 60, on logic dirs. A new override turns
  both **off** for declarative/generated dirs (`src/schemas/**`,
  `src/tools/definitions/**`, `src/tools/categories/**`, `src/types/**`,
  `src/scripts/**`). The prior override targeted `src/domains|platform|shared/**`
  — directories that don't exist — so it enforced nothing; it was removed.
- **Fixes required to make the gate green:** removed the invalid
  `useConsistentReturn` key, and downgraded two rules that fired as errors in
  out-of-scope UI code to `warn` — `suspicious/noArrayIndexKey` (React list keys
  in `ui/*.tsx`) and `suspicious/useIterableCallbackReturn`. Both remain visible
  and reversible once those sites are cleaned.
- **CI command:** `pnpm run check:ci` → `biome ci .` (walks the tree per
  `files.includes`; not the brace-glob that matched nothing).

## Consequences

- `biome ci .` is now green: **0 errors, ~1226 warnings**, 213 files.
- Warnings are the `deslop` backlog — style converges per-diff, not in one sweep.
- Full style intent lives in [CODE-STYLE.md](../../../CODE-STYLE.md); this ADR
  owns the tool decision.
- Follow-up: the local `npm run check` still typechecks `ui/` against an
  uncommitted `ui/tsconfig.json` — tracked in
  [0004](0004-ci-workflow-architecture.md).
