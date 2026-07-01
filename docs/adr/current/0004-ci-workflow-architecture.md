# 0004 — CI workflow architecture

**Status:** Accepted · 2026-07-02

## Context

`.github/workflows/` had grown ad-hoc: `ci.yml` ran **tests only** (no
lint/typecheck/build); `weekly-unit-tests.yml` duplicated that test job under a
misleading name; two near-identical cron workflows (`api-status-sync.yml` @ 08:00,
`weekly-api-sync.yml` @ 09:00) drifted apart. Because CI never ran lint/typecheck,
two latent breakages hid for a long time (an invalid Biome config, a broken `ui/`
typecheck — see [0001](0001-formatter-biome.md)).

## Decision

Adopt a **reusable single-purpose gate** (each leg is `on: workflow_call`):

- `ci.yml` — orchestrator on push/PR to `main`/`dev`; composes the legs and
  exposes one aggregated **`CI Gate`** status check (require it in branch
  protection instead of five separate checks). On a **main** failure it calls
  `report-failure.yml`, which opens/updates a `ci-failure` issue with the failing
  job's captured log tail.
- `biome.yml` — `pnpm run check:ci` (`biome ci .`), single-leg (ubuntu, Node 24) —
  deterministic, no matrix.
- `typecheck.yml` — `pnpm run typecheck` (`tsc --noEmit`, **src only**),
  single-leg.
- `test.yml` — unit + hermetic integration across the matrix; coverage runs once,
  informational and non-blocking.
- `build.yml` — `pnpm run build` across the matrix.

**Matrix:** `test` + `build` run on `[ubuntu, windows, macos] × [20, 22, 24]`
(cross-environment bugs surface here); `biome` + `typecheck` are single-leg.
`package.json` `engines.node` is bumped to `>=20`.

**Crons:** merged into one `api-sync.yml` (single schedule, two independent jobs:
`update-status-doc`, `sync-check`). `publish.yml` (npm OIDC trusted publishing),
`release.yml`, and `weekly-cleanup.yml` are unchanged.

Deleted: `weekly-unit-tests.yml`, `api-status-sync.yml`, `weekly-api-sync.yml`.

## Consequences

- One required check; a red leg blocks merge; main failures are legible from an
  issue, not just the Actions log.
- **`ui/` typecheck is deliberately out of the gate.** It needs a
  `ui/tsconfig.json` that isn't committed, and the `ui/*.tsx` sources currently
  don't typecheck (`class` vs `className`). Wiring `ui/` typechecking (commit a
  config + fix the sources) is a tracked follow-up; until then `typecheck.yml`
  covers `src` only.
- Integration is hermetic (`nock`, net-connect disabled), so it's safe on every
  matrix leg.
