# 0003 — Dependency decisions

**Status:** Accepted · 2026-07-02

## Context

Audit of `package.json` while codifying code style. Findings:

- **`jsonwebtoken`** (+ `@types/jsonwebtoken`) is a dependency with **zero
  imports** in `src/`. JWT verification is done with **`jose`**
  (`src/auth/token-verifier.ts`).
- No CLI framework is present; ADR [0002](0002-cli-command-surface.md) adopts
  **commander**.
- Several majors are available (Zod 4, TypeScript 6, Vite 8) but touch generated
  types / build semantics broadly.

## Decision

- **Remove** `jsonwebtoken` and `@types/jsonwebtoken` (dead).
- **Add** `commander` (thin CLI router — ADR 0002).
- **Keep** `jose` as the sole JWT library.
- **Defer** the Zod 4 / TypeScript 6 / Vite 8 majors — out of scope for this
  change set; each warrants its own change with the generated-types regen and
  test pass.

`CODE-STYLE.md` documents how to _use_ libraries (e.g. `withApiError`,
`getErrorMessage`, Zod-shape SSOT); this ADR records the keep/add/remove.

## Consequences

- Removing `jsonwebtoken` shrinks the dependency surface with no code change.
- Adding `commander` lands the dependency ahead of the wiring (ADR 0002); it is
  unused until that follow-up.
- `pnpm-lock.yaml` is regenerated so `pnpm install --frozen-lockfile` (CI) stays
  green.
