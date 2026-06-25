/**
 * Tool-family contract for the `EBAY_MCP_TOOLS` env var.
 *
 * This module is deliberately free of any import from the tool tree
 * (`@/tools/*`). `config/environment.ts` validates `EBAY_MCP_TOOLS` and is itself
 * imported by tool handlers (e.g. `tools/categories/token-management.ts`), so
 * pulling the registry in here would create an import cycle. The heavier pieces
 * that genuinely need the registry — the discovery catalogue and the meta-tools —
 * live in `@/mcp/tool-gating.ts`, which imports these primitives.
 *
 * The family keys below must stay in lock-step with `toolCategories`; a unit test
 * asserts the two agree so adding a category without updating this list fails CI.
 */

/**
 * Canonical tool-family keys, mirroring `toolCategories[].key`. These are the
 * accepted tokens in a static `EBAY_MCP_TOOLS` list (e.g. `inventory,fulfillment`).
 */
export const TOOL_FAMILY_KEYS = [
  'connector',
  'token-management',
  'account',
  'inventory',
  'fulfillment',
  'marketing',
  'analytics',
  'metadata',
  'taxonomy',
  'communication',
  'other',
  'developer',
  'trading',
] as const;

/** A valid tool-family key. */
export type ToolFamilyKey = (typeof TOOL_FAMILY_KEYS)[number];

const FAMILY_KEY_SET: ReadonlySet<string> = new Set(TOOL_FAMILY_KEYS);

/**
 * How the server gates which tools it advertises, resolved from `EBAY_MCP_TOOLS`:
 *
 * - `all` — every tool advertised at boot (the default; unset behaves as `all`).
 * - `dynamic` — only the discovery meta-tools are advertised; the agent enables
 *   eBay tools on demand (requires a host that honours `tools/listChanged`).
 * - `static` — only the named families are registered, frozen for the session;
 *   works on every host, including those that ignore `listChanged`.
 *
 * The `static` variant's `families` is intentionally `string[]`, not
 * `ToolFamilyKey[]`: parsing is lenient and may carry unknown tokens until
 * {@link getToolGatingConfigError} validates them. Typing it as the narrowed key
 * would advertise a guarantee the value does not yet hold.
 */
export type ToolGatingMode =
  | { kind: 'all' }
  | { kind: 'dynamic' }
  | { kind: 'static'; families: string[] };

/** Splits a raw `EBAY_MCP_TOOLS` list into trimmed, lowercased, non-empty tokens. */
function parseFamilyTokens(raw: string): string[] {
  return raw
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolves `EBAY_MCP_TOOLS` into a {@link ToolGatingMode}.
 *
 * Parsing is lenient by design — unknown family tokens are kept in the returned
 * `static` mode so the dedicated validator ({@link getToolGatingConfigError}) can
 * report them precisely. Callers that act on the mode should treat only
 * {@link TOOL_FAMILY_KEYS} members as registerable.
 */
export function resolveToolGatingMode(env: NodeJS.ProcessEnv = process.env): ToolGatingMode {
  const raw = env.EBAY_MCP_TOOLS?.trim();
  if (!raw || raw.toLowerCase() === 'all') {
    return { kind: 'all' };
  }
  if (raw.toLowerCase() === 'dynamic') {
    return { kind: 'dynamic' };
  }
  return { kind: 'static', families: parseFamilyTokens(raw) };
}

/**
 * Validates `EBAY_MCP_TOOLS` and returns a human-readable error string, or
 * `undefined` when the value is valid. Surfaced through
 * `validateEnvironmentConfig` so a typo fails loudly at startup (server exits)
 * rather than silently leaving the agent with fewer tools than intended.
 */
export function getToolGatingConfigError(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const mode = resolveToolGatingMode(env);
  if (mode.kind !== 'static') {
    return undefined;
  }

  if (mode.families.length === 0) {
    return `EBAY_MCP_TOOLS is set but lists no tool families. Use "all", "dynamic", or a comma-separated list of: ${TOOL_FAMILY_KEYS.join(', ')}.`;
  }

  const unknown = mode.families.filter((family) => !FAMILY_KEY_SET.has(family));
  if (unknown.length === 0) {
    return undefined;
  }

  const noun = unknown.length === 1 ? 'family' : 'families';
  return `EBAY_MCP_TOOLS contains unknown tool ${noun}: ${unknown.join(', ')}. Valid families: ${TOOL_FAMILY_KEYS.join(', ')}.`;
}
