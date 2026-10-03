/**
 * Builds the interactive MCP Apps views in `mcp-apps/` into self-contained HTML
 * files under `build/ui/`.
 *
 * Why a script rather than a single `vite.config.ts`: `vite-plugin-singlefile`
 * inlines all dynamic imports, which Rollup only permits with a single input.
 * The archetypes are therefore built one at a time (each its own
 * single-page build) into a shared output directory — the first pass clears it,
 * the rest append. The result is exactly what `src/mcp/uiBridge.ts` expects:
 * `build/ui/{table,card,chart,stat}.html`, each with its JS and CSS inlined so the
 * server can serve it verbatim as a `ui://` resource with no sibling requests.
 *
 * Run via `pnpm build:mcp-apps` (also chained into `pnpm build`).
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, type InlineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { uiArchetypes } from '@/tools/ui/archetypes.js';
import type { ViewArchetype } from '@/tools/ui/viewModels.js';
import { serverLogger } from '@/utils/logger.js';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDir, '../..');
const mcpAppsDir = resolve(repoRoot, 'mcp-apps');
const outDir = resolve(repoRoot, 'build', 'ui');

/** Vite config for a single archetype's single-page, fully-inlined build. */
function configFor(archetype: ViewArchetype, clean: boolean): InlineConfig {
  return {
    root: mcpAppsDir,
    configFile: false,
    logLevel: 'warn',
    plugins: [viteSingleFile()],
    esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
    resolve: {
      alias: {
        '@': resolve(repoRoot, 'src'),
      },
    },
    build: {
      outDir,
      emptyOutDir: clean,
      rollupOptions: { input: resolve(mcpAppsDir, uiArchetypes[archetype].htmlFile) },
    },
  };
}

const archetypes = Object.keys(uiArchetypes) as ViewArchetype[];
for (const [index, archetype] of archetypes.entries()) {
  await build(configFor(archetype, index === 0));
  serverLogger.info(`Built UI view "${uiArchetypes[archetype].htmlFile}"`);
}
