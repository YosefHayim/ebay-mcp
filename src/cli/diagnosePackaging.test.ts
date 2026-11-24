import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guards the published packaging of `diagnose` / `setup` / `skills`.
 *
 * Global installs ship only `build/**` (see package.json `files`). Scripts that
 * invoke `tsx src/cli/...` fail for end users because neither `tsx` nor
 * `src/` is present. The bin must also route `ebay-mcp diagnose`.
 */
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

type PackageManifest = {
	readonly bin?: Readonly<Record<string, string>>;
	readonly files?: readonly string[];
	readonly scripts?: Readonly<Record<string, string>>;
};

const packageManifest = JSON.parse(
	readFileSync(join(repoRoot, "package.json"), "utf8"),
) as PackageManifest;

const indexSource = readFileSync(join(repoRoot, "src/index.ts"), "utf8");

describe("diagnose packaging for published installs", () => {
	it("ships build/cli JS in the package files allowlist", () => {
		expect(packageManifest.files).toContain("build/cli/**/*.js");
	});

	it("runs diagnose/setup/skills from built JS without tsx or src", () => {
		const scripts = packageManifest.scripts;
		if (scripts === undefined) {
			throw new Error("package.json must declare scripts");
		}

		expect(scripts.diagnose).toBe("node build/cli/diagnostics.js");
		expect(scripts.setup).toBe("node build/cli/setup.js");
		expect(scripts.skills).toBe("node build/cli/skills.js");

		for (const scriptName of ["diagnose", "setup", "skills"] as const) {
			const scriptBody = scripts[scriptName];
			expect(scriptBody).not.toMatch(/\btsx\b/);
			expect(scriptBody).not.toMatch(/\bsrc\//);
		}
	});

	it("wires diagnose on the bin surface next to setup and skills", () => {
		expect(packageManifest.bin?.["ebay-mcp"]).toBe("build/index.js");
		expect(indexSource).toContain('args.includes("diagnose")');
		expect(indexSource).toContain('from "@/cli/diagnostics.js"');
		expect(indexSource).toContain("runDiagnostics");
	});

	it("has a built diagnostics entry after compile", () => {
		expect(existsSync(join(repoRoot, "build/cli/diagnostics.js"))).toBe(true);
	});
});
