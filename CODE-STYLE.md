# CODE-STYLE.md

The single source of truth for **how code is written** in this repo. Rules record
the _desired_ end-state — where the code already matches, it's evidence; where it
doesn't yet, the gap is the backlog (Biome surfaces it as warnings; `deslop`
closes it per-diff). Formatting is delegated to Biome (`biome.json`); this file
owns the judgment calls a formatter can't make.

> Digest lives in [AGENTS.md](AGENTS.md#conventions); the full guide is here.
> Library decisions are in [docs/adr/current/](docs/adr/current/).

## Rules

### 1. Imports — `@/` alias except same-dir siblings

Use the `@/` path alias (→ `src/`) for anything outside the current folder. Only a
**same-directory** sibling uses a relative path. Keep the NodeNext `.js`
extension on every relative/alias import (the build is ESM `Node16`). Do **not**
use `.ts` extensions — they're incompatible with the `@/` alias under `tsc`
(error TS2877); this was tried and reverted.

```ts
// ✗ don't — mixing aliased and parent-relative in one file
import { defineTool } from '@/tools/define-tool.js'; // aliased
import { fulfillmentPolicySchema } from '../schemas.js'; // relative-to-parent ✗
```

```ts
// after — one rule: @/ unless the file is in this same folder
import { defineTool } from '@/tools/define-tool.js';
import { fulfillmentPolicySchema } from '@/tools/schemas.js'; // aliased
```

`./sibling.js` stays relative; `../anything.js` becomes `@/…`.

### 2. Casts — boundary-only; never `as any`

Two documented boundary casts are sanctioned because they sit at a type-erasure
seam the compiler can't see across; everything else narrows. `as any` is banned,
and **no hand-written source file may be excluded from typecheck**.

```ts
// sanctioned — the zod→JSON-schema wire boundary (src/tools/categories/*.ts)
outputSchema: zodToJsonSchema(kycOutputSchema, { name: 'KYCResponse' }) as OutputArgs,

// sanctioned — result type-erasure in defineTool (src/tools/define-tool.ts)
map: (result: unknown): ViewModel => ui.map(result as Result),
```

```ts
const x = payload as any; // ✗ narrow the type instead
```

### 3. Function form & exports — declarations, named-only

Exported functions are `export function` **declarations** (≈190 in `src/`; the
arrow-const-export form is essentially absent). Exports are **named** — there is a
single default export in the whole tree, and no new ones should appear.

```ts
// src/tools/define-tool.ts
export function defineTool<Shape extends z.ZodRawShape, Result>(
  spec: ToolSpec<Shape, Result>,
): ToolEntry { … }
```

### 4. Thin handlers + throw-based errors

A tool handler delegates in one line to `api.<area>.<method>`. The area method
wraps its I/O in `withApiError` (prefixing failures with context); nothing throws
custom `Error` subclasses. The `error instanceof Error ? … : …` idiom is
centralised in `getErrorMessage`.

```ts
// handler — src/tools/categories/account.ts
handler: (api, args) => api.account.getKyc(),

// area method — wraps I/O with a contextual message (src/api/**)
return await withApiError('Failed to get KYC', () => this.client.get<KycResponse>(path));

// the one true instanceof idiom — src/utils/errors.ts
export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  return error instanceof Error ? error.message : fallback;
}
```

`withApiError` has 19 call sites; `getErrorMessage` 13. Reach for them instead of
re-implementing the pattern.

### 5. Zod raw shape is the single source of truth

`defineTool({ inputSchema })` takes a Zod **raw shape**. That one shape backs both
the schema advertised to MCP clients _and_ the compile-time type of the handler's
`args`. Renaming a field or changing its type is a `tsc` error at the call site,
not a runtime surprise — so handlers read `args.sku` as `string`, never cast.
Derive related schemas (`.pick`/`.extend`) rather than duplicating fields.

### 6. Size caps — realistic, and off for declarative files

Biome warns past **~300 lines/file** and **~60 lines/function** on logic
directories. Declarative, generated, or table-like files are exempt
(`src/schemas/**`, `src/tools/definitions/**`, `src/tools/categories/**`,
`src/types/**`, `src/scripts/**`) — a 900-line generated types file or a flat
tool-definition table is not a smell. Caps are **warnings**, not errors: they
guide extraction, they don't block.

### 7. JSDoc — explain the _why_, not the obvious

Document non-obvious intent, invariants, and the reason a seam exists (see the
`defineTool` doc comment on why re-validation is intentional). Do **not** add
boilerplate JSDoc that restates a trivial signature.

### 8. Naming, async, formatting

- **Files** are kebab-case (`define-tool.ts`, `token-verifier.ts`).
- **Async** is `async`/`await`, not raw `.then()` chains.
- **Formatting** is Biome's job: single quotes, semicolons, trailing commas
  everywhere, width 100, 2-space indent. Never hand-format against it; run
  `pnpm run fix`.

### 9. Tests

Tests mirror `src/` under `tests/unit/**` and `tests/integration/**`, named
`*.test.ts`, run by Vitest, with shared fixtures in `tests/helpers/`. Integration
specs are **hermetic** — `nock` with net-connect disabled, no live eBay calls.
Unit is the fast default (`pnpm test`); integration runs via
`pnpm run test:integration`.

## Recipes

### Add an API endpoint + tool

1. `pnpm run sync` — refresh specs, regenerate `src/types/`, list missing endpoints.
2. Add the method on the matching area class in `src/api/<area>/`, wrapping I/O in
   `withApiError`.
3. Add a `defineTool({ … handler })` entry in the matching
   `src/tools/categories/<family>.ts` — definition and handler live together.
4. Add unit tests under `tests/unit/`; add an integration spec if it crosses HTTP.
5. `pnpm run check && pnpm test`.

### Add a CLI command

The bin (`src/index.ts`) routes subcommands (`setup`, `skills`), then runs the
MCP stdio server by default. A command must be **dual-mode**: a bare invocation
in a TTY opens the menu; flags or a non-TTY defer and **never hang**; both routes
call the same `run*` function, reusing the existing `prompts`/`isTTY`/`cli-ui`
wizards. A CLI framework (commander) was evaluated and **dropped as unused** (ADR
0002 → 0006); extend the hand-router until a real need justifies a dependency.

## Exemplar files

| File                            | Shows                                            |
| ------------------------------- | ------------------------------------------------ |
| `src/tools/define-tool.ts`      | The contract; Zod-shape SSOT; sanctioned casts; why-JSDoc |
| `src/utils/errors.ts`           | The one `instanceof Error` idiom                 |
| `src/api/shared/request.ts`     | `withApiError` I/O wrapper                        |
| `src/tools/categories/account.ts` | A representative tool family (defineTool usage) |
| `src/index.ts`                  | Bin entry / subcommand routing                   |

## Never

- **Never** `as any` — narrow, or use a documented boundary cast.
- **Never** exclude a hand-written source file from typecheck.
- **Never** import a parent path (`../x.js`) when `@/x.js` says it plainer.
- **Never** write to **stdout** — it's the MCP protocol channel; logs go to
  **stderr** (see [docs/logging.md](docs/logging.md)).
- **Never** hand-edit `src/types/**` — it's generated by `pnpm run sync`.
- **Never** add a **new** custom `Error` subclass — throw with `withApiError`
  context. (The one sanctioned exception is `HttpError` in `src/utils/http.ts` —
  the low-level HTTP carrier recording `status`/`statusText`/`url`, which
  `withApiError` wraps.)
- **Never** add a default export — named exports only.
- **Never** let a bare CLI invocation hang in a non-TTY — defer, don't block.

## Framework practices

This is a pure `@modelcontextprotocol/sdk` + Express/Node/Zod/Biome/Vitest
project — no Cloudflare/Expo/Anthropic-SDK best-practices skill applies. For MCP
semantics (tools, schemas, transports), defer to the SDK and
[modelcontextprotocol.io](https://modelcontextprotocol.io); this guide does not
restate them.
