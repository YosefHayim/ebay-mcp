import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

interface PackageManifest {
	packageManager?: string;
	pnpm?: { overrides?: Record<string, string> };
}

const manifest = JSON.parse(
	readFileSync(`${repoRoot}package.json`, "utf8"),
) as PackageManifest;

describe("supply-chain hygiene", () => {
	it("declares pnpm as the single package manager", () => {
		expect(manifest.packageManager).toMatch(/^pnpm@/);
	});

	it("commits exactly one lockfile — pnpm-lock.yaml, never package-lock.json or yarn.lock", () => {
		expect(existsSync(`${repoRoot}pnpm-lock.yaml`)).toBe(true);
		expect(existsSync(`${repoRoot}package-lock.json`)).toBe(false);
		expect(existsSync(`${repoRoot}yarn.lock`)).toBe(false);
	});

	it("pins the security overrides that force patched transitives", () => {
		// esbuild >=0.28.1 and yaml >=2.8.3 sit below vite's declared ranges, and js-yaml
		// ^4.3.2 patches the quadratic-complexity DoS advisories pulled in by
		// @redocly/openapi-core via openapi-typescript. Without these overrides the
		// dev-tooling chain resolves back to vulnerable versions.
		expect(manifest.pnpm?.overrides).toMatchObject({
			esbuild: expect.stringContaining("0.28.1"),
			yaml: expect.stringContaining("2.8.3"),
			"js-yaml": expect.stringContaining("4.3.2"),
		});
	});
});
