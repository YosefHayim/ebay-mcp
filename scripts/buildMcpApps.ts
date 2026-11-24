import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, type InlineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { serverLogger } from "@/shared/logger.js";
import { uiArchetypes } from "@/tool-registry/ui/archetypes.js";
import type { ViewArchetype } from "@/tool-registry/ui/viewModels.js";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, "..");
const mcpAppsDir = path.resolve(repoRoot, "src", "mcp-apps");
const outDir = path.resolve(repoRoot, "build", "ui");

function configFor(archetype: ViewArchetype, clean: boolean): InlineConfig {
	return {
		root: mcpAppsDir,
		configFile: false,
		logLevel: "warn",
		plugins: [viteSingleFile()],
		esbuild: { jsx: "automatic", jsxImportSource: "react" },
		resolve: {
			alias: {
				"@": path.resolve(repoRoot, "src"),
			},
		},
		build: {
			outDir,
			emptyOutDir: clean,
			rollupOptions: {
				input: path.resolve(mcpAppsDir, uiArchetypes[archetype].htmlFile),
			},
		},
	};
}

const archetypes = Object.keys(uiArchetypes) as ViewArchetype[];
for (const [index, archetype] of archetypes.entries()) {
	await build(configFor(archetype, index == 0));
	serverLogger.info(`Built UI view "${uiArchetypes[archetype].htmlFile}"`);
}
